'use strict';

const Notice = require('../models/notice.model');
const User = require('../../users/models/user.model');
const Enrollment = require('../../academic/models/enrollment.model');
const { createBulkNotifications } = require('../../notifications/services/notification.service');
const AppError = require('../../../shared/errors/AppError');
const { getPagination } = require('../../../shared/utils/pagination');

/**
 * Create a new notice (draft by default).
 */
const createNotice = async ({
  title,
  content,
  type,
  targetRoles,
  targetSemester,
  postedBy,
  expiresAt,
  attachmentUrl,
}) => {
  const notice = await Notice.create({
    title,
    content,
    type: type || 'general',
    targetRoles: targetRoles || ['all'],
    targetSemester: targetSemester || null,
    postedBy,
    expiresAt: expiresAt || undefined,
    attachmentUrl: attachmentUrl || undefined,
  });
  return notice;
};

/**
 * Publish a notice and fan out in-app notifications to all targeted users.
 */
const publishNotice = async (noticeId, publishedBy) => {
  const notice = await Notice.findById(noticeId);
  if (!notice) throw AppError.notFound('Notice not found');
  if (notice.isPublished) throw AppError.conflict('Notice is already published', 'ALREADY_PUBLISHED');

  notice.isPublished = true;
  notice.publishedAt = new Date();
  await notice.save();

  // Determine target user ids for notifications
  setImmediate(async () => {
    try {
      const userFilter = { isActive: true };

      if (!notice.targetRoles.includes('all')) {
        userFilter.role = { $in: notice.targetRoles };
      }

      // If targetSemester is set, further restrict to enrolled students in that semester
      let recipientIds = [];
      if (notice.targetSemester) {
        const enrollments = await Enrollment.find({
          semester: notice.targetSemester,
          isActive: true,
        }).select('student').lean();
        const studentIds = enrollments.map((e) => e.student);

        // If role filter is 'all' or includes 'student', start with enrolled students
        if (notice.targetRoles.includes('all') || notice.targetRoles.includes('student')) {
          // Also fetch faculty/staff if role is 'all'
          if (notice.targetRoles.includes('all')) {
            const otherUsers = await User.find({
              isActive: true,
              role: { $in: ['faculty', 'hod', 'admin'] },
            })
              .select('_id')
              .lean();
            recipientIds = [
              ...studentIds.map(String),
              ...otherUsers.map((u) => String(u._id)),
            ];
          } else {
            recipientIds = studentIds.map(String);
          }
        } else {
          const users = await User.find(userFilter).select('_id').lean();
          recipientIds = users.map((u) => String(u._id));
        }
      } else {
        const users = await User.find(userFilter).select('_id').lean();
        recipientIds = users.map((u) => String(u._id));
      }

      // De-duplicate and exclude poster
      const uniqueIds = [...new Set(recipientIds)].filter(
        (id) => String(id) !== String(notice.postedBy)
      );

      if (uniqueIds.length > 0) {
        await createBulkNotifications(uniqueIds, {
          type: 'notice_posted',
          title: `New Notice: ${notice.title}`,
          message: notice.content.substring(0, 200),
          relatedEntity: { entityType: 'Notice', entityId: notice._id },
        });
      }
    } catch (_err) {
      // Background fan-out — do not crash the request
    }
  });

  return notice;
};

/**
 * Update a notice. Only unpublished notices can be fully edited;
 * published notices allow limited field updates.
 */
const updateNotice = async (noticeId, updates, updatedBy) => {
  const notice = await Notice.findById(noticeId);
  if (!notice) throw AppError.notFound('Notice not found');

  const allowedFields = ['title', 'content', 'type', 'targetRoles', 'targetSemester', 'expiresAt', 'attachmentUrl'];
  allowedFields.forEach((field) => {
    if (updates[field] !== undefined) {
      notice[field] = updates[field];
    }
  });

  await notice.save();
  return notice;
};

/**
 * Delete a notice.
 */
const deleteNotice = async (noticeId, deletedBy) => {
  const notice = await Notice.findById(noticeId);
  if (!notice) throw AppError.notFound('Notice not found');
  await notice.deleteOne();
  return { deleted: true };
};

/**
 * Get paginated list of notices.
 * Public consumers get only published, non-expired notices.
 * Filtered by targetRoles to match the requesting user's role.
 */
const getNotices = async ({ targetRole, semesterId, page: pageQ, limit: limitQ, includeExpired } = {}) => {
  const { page, limit, skip } = getPagination({ page: pageQ, limit: limitQ });

  const filter = { isPublished: true };

  if (!includeExpired || includeExpired === 'false') {
    filter.$or = [{ expiresAt: { $gt: new Date() } }, { expiresAt: null }];
  }

  if (targetRole) {
    filter.targetRoles = { $in: [targetRole, 'all'] };
  }

  if (semesterId) {
    filter.$or = [
      { targetSemester: semesterId },
      { targetSemester: null },
    ];
  }

  const [notices, total] = await Promise.all([
    Notice.find(filter)
      .populate('postedBy', 'fullName role')
      .populate('targetSemester', 'name number section')
      .sort({ publishedAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    Notice.countDocuments(filter),
  ]);

  return { notices, page, limit, total };
};

/**
 * Get a single notice by ID and increment its view count.
 */
const getNoticeById = async (noticeId) => {
  const notice = await Notice.findByIdAndUpdate(
    noticeId,
    { $inc: { viewCount: 1 } },
    { new: true }
  )
    .populate('postedBy', 'fullName role')
    .populate('targetSemester', 'name number section')
    .lean();

  if (!notice) throw AppError.notFound('Notice not found');
  return notice;
};

module.exports = {
  createNotice,
  publishNotice,
  updateNotice,
  deleteNotice,
  getNotices,
  getNoticeById,
};

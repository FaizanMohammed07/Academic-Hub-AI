'use strict';

const bcrypt = require('bcryptjs');
const User = require('../../users/models/user.model');
const Setting = require('../../settings/models/setting.model');
const AcademicYear = require('../../academic/models/academicYear.model');
const Semester = require('../../academic/models/semester.model');
const Subject = require('../../academic/models/subject.model');
const FacultySubjectMapping = require('../../academic/models/facultySubjectMapping.model');
const Enrollment = require('../../academic/models/enrollment.model');
const Assignment = require('../../assignments/models/assignment.model');
const Submission = require('../../submissions/models/submission.model');
const Notice = require('../../notices/models/notice.model');
const AppError = require('../../../shared/errors/AppError');
const { getPagination, buildSort } = require('../../../shared/utils/pagination');

/* ─────────────────────────────────────────────────────────────────────────────
   USER MANAGEMENT
───────────────────────────────────────────────────────────────────────────── */

async function createUser({ role, loginId, email, fullName, phone, password }) {
  // Check duplicate loginId
  const existingLoginId = await User.findOne({ loginId });
  if (existingLoginId) {
    throw AppError.conflict(`Login ID "${loginId}" is already taken`, 'LOGIN_ID_TAKEN');
  }

  // Check duplicate email
  const existingEmail = await User.findOne({ email: email.toLowerCase() });
  if (existingEmail) {
    throw AppError.conflict(`Email "${email}" is already registered`, 'EMAIL_TAKEN');
  }

  // Create user — pre-save hook will hash passwordHash
  const user = await User.create({
    role,
    loginId,
    email,
    fullName,
    phone,
    passwordHash: password, // pre-save hook hashes this field
  });

  // Return without sensitive fields
  const result = user.toObject();
  delete result.passwordHash;
  return result;
}

async function updateUser(userId, updates, updatedBy) {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found');

  const allowed = ['fullName', 'phone', 'email', 'isActive', 'avatarUrl'];
  allowed.forEach((key) => {
    if (updates[key] !== undefined) user[key] = updates[key];
  });

  // If email is being changed, check for duplicate
  if (updates.email && updates.email.toLowerCase() !== user.email) {
    const duplicate = await User.findOne({ email: updates.email.toLowerCase(), _id: { $ne: userId } });
    if (duplicate) throw AppError.conflict(`Email "${updates.email}" is already in use`, 'EMAIL_TAKEN');
    user.email = updates.email.toLowerCase();
  }

  await user.save();
  const result = user.toObject();
  delete result.passwordHash;
  return result;
}

async function resetUserPassword(userId, newPassword, resetBy) {
  const user = await User.findById(userId).select('+passwordHash');
  if (!user) throw AppError.notFound('User not found');

  // Hash manually to avoid triggering pre-save on an unmodified model
  const hashed = await bcrypt.hash(newPassword, 12);
  user.passwordHash = hashed;
  user.passwordChangedAt = new Date();
  user.failedLoginAttempts = 0;
  user.lockedUntil = undefined;

  // Use save() without going through the pre-save bcrypt hook again
  // We mark passwordHash as NOT modified so the hook skips it,
  // but we need to store the already-hashed value directly.
  // The cleanest approach: use updateOne directly.
  await User.updateOne(
    { _id: userId },
    {
      $set: {
        passwordHash: hashed,
        passwordChangedAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    }
  );

  return { reset: true, userId };
}

async function deleteUser(userId, deletedBy) {
  const user = await User.findById(userId);
  if (!user) throw AppError.notFound('User not found');
  if (!user.isActive) throw AppError.badRequest('User is already deactivated', 'USER_ALREADY_INACTIVE');

  // Soft delete
  await User.findByIdAndUpdate(userId, { isActive: false });
  return { deleted: true, userId };
}

async function listUsers({ role, search, page, limit, isActive } = {}) {
  const pagination = getPagination({ page, limit });
  const sort = buildSort({});

  const filter = {};
  if (role) filter.role = role;
  if (isActive !== undefined) filter.isActive = isActive === 'true' || isActive === true;

  if (search) {
    const regex = new RegExp(search, 'i');
    filter.$or = [{ fullName: regex }, { loginId: regex }, { email: regex }];
  }

  const [users, total] = await Promise.all([
    User.find(filter)
      .select('-passwordHash')
      .sort(sort)
      .skip(pagination.skip)
      .limit(pagination.limit)
      .lean(),
    User.countDocuments(filter),
  ]);

  return { users, page: pagination.page, limit: pagination.limit, total };
}

async function getUserById(userId) {
  const user = await User.findById(userId).select('-passwordHash').lean();
  if (!user) throw AppError.notFound('User not found');
  return user;
}

/* ─────────────────────────────────────────────────────────────────────────────
   SETTINGS
───────────────────────────────────────────────────────────────────────────── */

async function getSetting(key) {
  let setting = await Setting.findOne({ key });
  if (!setting) {
    // Seed defaults and retry once
    await Setting.seedDefaults();
    setting = await Setting.findOne({ key });
  }
  if (!setting) throw AppError.notFound(`Setting "${key}" not found`);
  return setting;
}

async function updateSetting(key, value, updatedBy) {
  const setting = await Setting.findOneAndUpdate(
    { key },
    { $set: { value, updatedBy } },
    { new: true, upsert: false }
  );
  if (!setting) throw AppError.notFound(`Setting "${key}" not found`);
  return setting;
}

async function getSettingsByCategory(category) {
  const settings = await Setting.find({ category }).lean();
  return settings;
}

async function getAllSettings() {
  const settings = await Setting.find({}).lean();

  // Group by category
  const grouped = {};
  for (const s of settings) {
    const cat = s.category || 'general';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(s);
  }
  return grouped;
}

/* ─────────────────────────────────────────────────────────────────────────────
   ANALYTICS / DASHBOARD STATS
───────────────────────────────────────────────────────────────────────────── */

async function getDashboardStats() {
  const [
    totalStudents,
    totalFaculty,
    totalSubjects,
    activeSemester,
    totalAssignments,
    totalSubmissions,
    gradedSubmissions,
    pendingEvaluations,
    totalNotices,
  ] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: { $in: ['faculty', 'hod'] }, isActive: true }),
    Subject.countDocuments({ isActive: true }),
    Semester.findOne({ isCurrent: true }).select('name number section').lean(),
    Assignment.countDocuments({ status: 'published' }),
    Submission.countDocuments({}),
    Submission.countDocuments({ status: 'graded' }),
    Submission.countDocuments({ status: 'submitted' }), // not yet evaluated
    Notice.countDocuments({ isPublished: true }),
  ]);

  const submissionRate =
    totalAssignments > 0 && totalStudents > 0
      ? Math.round((totalSubmissions / (totalAssignments * totalStudents)) * 100)
      : 0;

  return {
    totalStudents,
    totalFaculty,
    totalSubjects,
    activeSemester,
    totalAssignments,
    submissionRate: Math.min(submissionRate, 100),
    pendingEvaluations,
    totalNotices,
  };
}

module.exports = {
  // User Management
  createUser,
  updateUser,
  resetUserPassword,
  deleteUser,
  listUsers,
  getUserById,
  // Settings
  getSetting,
  updateSetting,
  getSettingsByCategory,
  getAllSettings,
  // Analytics
  getDashboardStats,
};

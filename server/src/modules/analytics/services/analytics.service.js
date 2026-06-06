'use strict';

const mongoose = require('mongoose');
const User = require('../../users/models/user.model');
const Assignment = require('../../assignments/models/assignment.model');
const Submission = require('../../submissions/models/submission.model');
const Notification = require('../../notifications/models/notification.model');
const Enrollment = require('../../academic/models/enrollment.model');
const FacultySubjectMapping = require('../../academic/models/facultySubjectMapping.model');

// Lazy-load AI Analysis model to avoid circular deps
const getAiAnalysis = () => {
  try { return require('../../ai/models/aiAnalysis.model'); } catch (_) { return null; }
};

/**
 * getPlatformAnalytics
 * Admin-level platform-wide statistics.
 */
const getPlatformAnalytics = async () => {
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

  const [
    usersByRole,
    assignmentsCreated,
    submissionsReceived,
    evaluatedSubmissions,
    totalSubmissions,
    notificationsCount,
  ] = await Promise.all([
    User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]),
    Assignment.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Submission.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Submission.countDocuments({ status: 'graded', createdAt: { $gte: thirtyDaysAgo } }),
    Submission.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
    Notification.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
  ]);

  // AI analysis count (optional model)
  let aiAnalysisCount = 0;
  const AiAnalysis = getAiAnalysis();
  if (AiAnalysis) {
    aiAnalysisCount = await AiAnalysis.countDocuments({ createdAt: { $gte: thirtyDaysAgo } });
  }

  const totalUsers = {};
  usersByRole.forEach((u) => { totalUsers[u._id] = u.count; });

  const evaluationRate = totalSubmissions > 0
    ? Math.round((evaluatedSubmissions / totalSubmissions) * 100 * 100) / 100
    : 0;

  return {
    totalUsers,
    last30Days: {
      assignmentsCreated,
      submissionsReceived,
      evaluatedSubmissions,
      evaluationRate,
      aiAnalysisCount,
      notificationsCount,
    },
  };
};

/**
 * getSemesterAnalytics
 * HOD/Admin view of a specific semester.
 */
const getSemesterAnalytics = async (semesterId) => {
  const semObjId = new mongoose.Types.ObjectId(semesterId);

  // Subject-wise stats
  const subjectStats = await Assignment.aggregate([
    { $match: { semesterId: semObjId } },
    {
      $lookup: {
        from: 'submissions',
        localField: '_id',
        foreignField: 'assignmentId',
        as: 'submissions',
      },
    },
    {
      $group: {
        _id: '$subjectId',
        assignmentCount: { $sum: 1 },
        submissionCount: { $sum: { $size: '$submissions' } },
        avgMarks: {
          $avg: {
            $avg: {
              $map: {
                input: '$submissions',
                as: 's',
                in: '$$s.evaluation.marksAwarded',
              },
            },
          },
        },
      },
    },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subject',
      },
    },
    { $unwind: { path: '$subject', preserveNullAndEmpty: true } },
    {
      $project: {
        subjectId: '$_id',
        subjectName: '$subject.name',
        subjectCode: '$subject.code',
        assignmentCount: 1,
        submissionCount: 1,
        avgMarks: { $round: ['$avgMarks', 2] },
      },
    },
  ]);

  // Student engagement: submissions per student
  const studentEngagement = await Submission.aggregate([
    {
      $lookup: {
        from: 'assignments',
        localField: 'assignmentId',
        foreignField: '_id',
        as: 'assignment',
      },
    },
    { $unwind: '$assignment' },
    { $match: { 'assignment.semesterId': semObjId } },
    {
      $group: {
        _id: '$submittedBy',
        submissionCount: { $sum: 1 },
        avgMarks: { $avg: '$evaluation.marksAwarded' },
      },
    },
    {
      $lookup: {
        from: 'users',
        localField: '_id',
        foreignField: '_id',
        as: 'student',
      },
    },
    { $unwind: { path: '$student', preserveNullAndEmpty: true } },
    {
      $project: {
        studentId: '$_id',
        studentName: '$student.fullName',
        loginId: '$student.loginId',
        submissionCount: 1,
        avgMarks: { $round: ['$avgMarks', 2] },
      },
    },
    { $sort: { submissionCount: -1 } },
  ]);

  // Grade distribution across all subjects in semester
  const gradeDistribution = await Submission.aggregate([
    {
      $lookup: {
        from: 'assignments',
        localField: 'assignmentId',
        foreignField: '_id',
        as: 'assignment',
      },
    },
    { $unwind: '$assignment' },
    { $match: { 'assignment.semesterId': semObjId, status: 'graded' } },
    {
      $addFields: {
        gradePercent: {
          $cond: [
            { $gt: ['$assignment.maxMarks', 0] },
            { $multiply: [{ $divide: ['$evaluation.marksAwarded', '$assignment.maxMarks'] }, 100] },
            0,
          ],
        },
      },
    },
    {
      $bucket: {
        groupBy: '$gradePercent',
        boundaries: [0, 40, 50, 60, 75, 90, 101],
        default: 'unknown',
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  const gradeLabels = { 0: 'F (<40)', 40: 'D (40-49)', 50: 'C (50-59)', 60: 'B (60-74)', 75: 'A (75-89)', 90: 'O (90+)' };
  const gradeDist = gradeDistribution.map((g) => ({
    range: gradeLabels[g._id] || g._id,
    count: g.count,
  }));

  return { subjectStats, studentEngagement, gradeDistribution: gradeDist };
};

/**
 * getSubjectAnalytics
 * Faculty/HOD/Admin view of a specific subject.
 */
const getSubjectAnalytics = async (subjectId, facultyId) => {
  const subObjId = new mongoose.Types.ObjectId(subjectId);

  const assignments = await Assignment.find({ subjectId: subObjId })
    .sort({ createdAt: 1 })
    .lean();

  const assignmentIds = assignments.map((a) => a._id);

  // Submission stats per assignment
  const submissionStats = await Submission.aggregate([
    { $match: { assignmentId: { $in: assignmentIds } } },
    {
      $group: {
        _id: '$assignmentId',
        submissionCount: { $sum: 1 },
        avgMarks: { $avg: '$evaluation.marksAwarded' },
        gradedCount: { $sum: { $cond: [{ $eq: ['$status', 'graded'] }, 1, 0] } },
      },
    },
  ]);

  const statsMap = {};
  submissionStats.forEach((s) => {
    statsMap[s._id.toString()] = {
      submissionCount: s.submissionCount,
      avgMarks: s.avgMarks !== null ? Math.round(s.avgMarks * 100) / 100 : null,
      gradedCount: s.gradedCount,
    };
  });

  // Get enrolled student count from most recent relevant semester
  const firstAssignment = assignments[0];
  let enrolledCount = 0;
  if (firstAssignment) {
    enrolledCount = await Enrollment.countDocuments({ semester: firstAssignment.semesterId, isActive: true });
  }

  // Enrich assignments with stats
  const assignmentList = assignments.map((a) => {
    const stats = statsMap[a._id.toString()] || { submissionCount: 0, avgMarks: null, gradedCount: 0 };
    return {
      _id: a._id,
      title: a.title,
      type: a.type,
      deadline: a.deadline,
      maxMarks: a.maxMarks,
      status: a.status,
      submissionCount: stats.submissionCount,
      submissionRate: enrolledCount > 0 ? Math.round((stats.submissionCount / enrolledCount) * 100) : 0,
      avgMarks: stats.avgMarks,
      gradedCount: stats.gradedCount,
    };
  });

  // Grade distribution for this subject
  const gradeDistribution = await Submission.aggregate([
    { $match: { assignmentId: { $in: assignmentIds }, status: 'graded' } },
    {
      $lookup: {
        from: 'assignments',
        localField: 'assignmentId',
        foreignField: '_id',
        as: 'assignment',
      },
    },
    { $unwind: '$assignment' },
    {
      $addFields: {
        gradePercent: {
          $cond: [
            { $gt: ['$assignment.maxMarks', 0] },
            { $multiply: [{ $divide: ['$evaluation.marksAwarded', '$assignment.maxMarks'] }, 100] },
            0,
          ],
        },
      },
    },
    {
      $bucket: {
        groupBy: '$gradePercent',
        boundaries: [0, 40, 50, 60, 75, 90, 101],
        default: 'unknown',
        output: { count: { $sum: 1 } },
      },
    },
  ]);

  const gradeLabels = { 0: 'F (<40)', 40: 'D (40-49)', 50: 'C (50-59)', 60: 'B (60-74)', 75: 'A (75-89)', 90: 'O (90+)' };
  const gradeDist = gradeDistribution.map((g) => ({
    range: gradeLabels[g._id] || g._id,
    count: g.count,
  }));

  return { assignments: assignmentList, gradeDistribution: gradeDist, enrolledCount };
};

module.exports = { getPlatformAnalytics, getSemesterAnalytics, getSubjectAnalytics };

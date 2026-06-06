'use strict';

const FacultySubjectMapping = require('../../academic/models/facultySubjectMapping.model');
const Enrollment = require('../../academic/models/enrollment.model');
const Assignment = require('../../assignments/models/assignment.model');
const Submission = require('../../submissions/models/submission.model');
const Semester = require('../../academic/models/semester.model');
const AppError = require('../../../shared/errors/AppError');
const { getPagination } = require('../../../shared/utils/pagination');

const USER_SELECT = 'fullName email loginId role avatarUrl';

/**
 * Compute grade letter from percentage
 */
const gradeFromPercent = (pct) => {
  if (pct >= 90) return 'A';
  if (pct >= 75) return 'B';
  if (pct >= 60) return 'C';
  if (pct >= 50) return 'D';
  return 'F';
};

/**
 * getFacultyDashboard
 */
const getFacultyDashboard = async (facultyId) => {
  // Current semester
  const currentSemester = await Semester.findOne({ isCurrent: true }).lean();

  // Active subject mappings
  const mappingFilter = { faculty: facultyId, isActive: true };
  if (currentSemester) mappingFilter.semester = currentSemester._id;

  const mappings = await FacultySubjectMapping.find(mappingFilter)
    .populate('subject', 'name code type credits')
    .populate('semester', 'name number section')
    .lean();

  const subjectIds = mappings.map((m) => m.subject._id);
  const semesterIds = [...new Set(mappings.map((m) => m.semester._id.toString()))];

  // Total distinct students across subjects
  let totalStudentsCount = 0;
  if (semesterIds.length > 0) {
    totalStudentsCount = await Enrollment.countDocuments({
      semester: { $in: semesterIds },
      isActive: true,
    });
  }

  // Assignments created by faculty
  const totalAssignments = await Assignment.countDocuments({ createdBy: facultyId });
  const assignmentIds = await Assignment.find({ createdBy: facultyId }).select('_id').lean();
  const aIds = assignmentIds.map((a) => a._id);

  // Pending evaluations (submitted but not graded)
  const pendingEvaluations = await Submission.countDocuments({
    assignmentId: { $in: aIds },
    status: { $in: ['submitted', 'under_review'] },
  });

  // Recent submissions needing evaluation (last 10)
  const recentSubmissions = await Submission.find({
    assignmentId: { $in: aIds },
    status: { $in: ['submitted', 'under_review'] },
  })
    .sort({ submittedAt: -1 })
    .limit(10)
    .populate('submittedBy', USER_SELECT)
    .populate({ path: 'assignmentId', select: 'title subjectId', populate: { path: 'subjectId', select: 'name code' } })
    .lean();

  // Assignment stats per subject
  const assignmentStatsBySubject = await Assignment.aggregate([
    { $match: { createdBy: facultyId, subjectId: { $in: subjectIds } } },
    { $group: { _id: '$subjectId', total: { $sum: 1 }, published: { $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] } }, draft: { $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] } }, closed: { $sum: { $cond: [{ $eq: ['$status', 'closed'] }, 1, 0] } } } },
  ]);

  return {
    currentSemester,
    subjects: mappings.map((m) => m.subject),
    totalStudents: totalStudentsCount,
    pendingEvaluations,
    totalAssignments,
    recentSubmissions,
    assignmentStatsBySubject,
  };
};

/**
 * getFacultySubjects
 */
const getFacultySubjects = async (facultyId, semesterId) => {
  const filter = { faculty: facultyId, isActive: true };
  if (semesterId) filter.semester = semesterId;

  const mappings = await FacultySubjectMapping.find(filter)
    .populate('subject', 'name code type credits syllabus isActive')
    .populate('semester', 'name number section isCurrent')
    .lean();

  // Enrich each subject with counts
  const enriched = await Promise.all(
    mappings.map(async (m) => {
      const subjectId = m.subject._id;
      const semId = m.semester._id;

      const [studentCount, assignmentCount, pendingSubmissions] = await Promise.all([
        Enrollment.countDocuments({ semester: semId, isActive: true }),
        Assignment.countDocuments({ subjectId, createdBy: facultyId }),
        (async () => {
          const aIds = await Assignment.find({ subjectId, createdBy: facultyId }).select('_id').lean();
          return Submission.countDocuments({
            assignmentId: { $in: aIds.map((a) => a._id) },
            status: { $in: ['submitted', 'under_review'] },
          });
        })(),
      ]);

      return {
        mapping: m._id,
        subject: m.subject,
        semester: m.semester,
        studentCount,
        assignmentCount,
        pendingSubmissions,
      };
    }),
  );

  return enriched;
};

/**
 * getFacultyStats
 */
const getFacultyStats = async (facultyId, subjectId) => {
  // Verify faculty owns this subject mapping
  const mapping = await FacultySubjectMapping.findOne({ faculty: facultyId, subject: subjectId, isActive: true });
  if (!mapping) throw AppError.forbidden('You are not assigned to this subject');

  const assignments = await Assignment.find({ subjectId, createdBy: facultyId }).select('_id maxMarks title').lean();
  const aIds = assignments.map((a) => a._id);

  const submissions = await Submission.find({ assignmentId: { $in: aIds } })
    .select('status evaluation assignmentId')
    .lean();

  const total = submissions.length;
  const evaluated = submissions.filter((s) => s.evaluation && s.evaluation.evaluatedAt).length;
  const pending = submissions.filter((s) => ['submitted', 'under_review'].includes(s.status)).length;

  const gradedWithMarks = submissions.filter((s) => s.evaluation && s.evaluation.marksAwarded !== undefined);
  const avgMarks =
    gradedWithMarks.length > 0
      ? gradedWithMarks.reduce((sum, s) => sum + s.evaluation.marksAwarded, 0) / gradedWithMarks.length
      : 0;

  // Grade distribution
  const assignmentMaxMap = {};
  assignments.forEach((a) => { assignmentMaxMap[a._id.toString()] = a.maxMarks; });

  const gradeDist = { A: 0, B: 0, C: 0, D: 0, F: 0 };
  gradedWithMarks.forEach((s) => {
    const maxM = assignmentMaxMap[s.assignmentId.toString()] || 100;
    const pct = (s.evaluation.marksAwarded / maxM) * 100;
    gradeDist[gradeFromPercent(pct)] += 1;
  });

  return {
    subjectId,
    total,
    evaluated,
    pending,
    averageMarks: Math.round(avgMarks * 100) / 100,
    gradeDistribution: gradeDist,
  };
};

/**
 * getSubjectStudents
 */
const getSubjectStudents = async (facultyId, subjectId) => {
  const mapping = await FacultySubjectMapping.findOne({ faculty: facultyId, subject: subjectId, isActive: true })
    .populate('semester', 'name number section')
    .lean();

  if (!mapping) throw AppError.forbidden('You are not assigned to this subject');

  const semesterId = mapping.semester._id;

  // All enrolled students this semester
  const enrollments = await Enrollment.find({ semester: semesterId, isActive: true })
    .populate('student', USER_SELECT)
    .lean();

  // All assignments for this subject by this faculty
  const assignments = await Assignment.find({ subjectId, createdBy: facultyId }).select('_id title type deadline status maxMarks').lean();
  const aIds = assignments.map((a) => a._id);

  // All submissions for these assignments
  const submissions = await Submission.find({ assignmentId: { $in: aIds } })
    .select('assignmentId submittedBy status evaluation.marksAwarded submittedAt isLate')
    .lean();

  // Build submission map: studentId → assignmentId → submission
  const subMap = {};
  submissions.forEach((s) => {
    const sId = s.submittedBy.toString();
    const aId = s.assignmentId.toString();
    if (!subMap[sId]) subMap[sId] = {};
    subMap[sId][aId] = s;
  });

  const students = enrollments.map((e) => {
    const studentId = e.student._id.toString();
    const studentSubs = subMap[studentId] || {};
    const submissionSummary = assignments.map((a) => ({
      assignment: { _id: a._id, title: a.title, type: a.type, deadline: a.deadline, maxMarks: a.maxMarks, status: a.status },
      submission: studentSubs[a._id.toString()] || null,
    }));

    return {
      student: e.student,
      rollNumber: e.rollNumber,
      submissionSummary,
    };
  });

  return {
    semester: mapping.semester,
    subject: subjectId,
    students,
    assignments,
  };
};

module.exports = {
  getFacultyDashboard,
  getFacultySubjects,
  getFacultyStats,
  getSubjectStudents,
};

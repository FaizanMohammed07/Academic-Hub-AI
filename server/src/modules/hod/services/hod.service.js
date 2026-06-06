'use strict';

const mongoose = require('mongoose');
const User = require('../../users/models/user.model');
const Semester = require('../../academic/models/semester.model');
const FacultySubjectMapping = require('../../academic/models/facultySubjectMapping.model');
const Enrollment = require('../../academic/models/enrollment.model');
const Assignment = require('../../assignments/models/assignment.model');
const Submission = require('../../submissions/models/submission.model');
const Notice = require('../../notices/models/notice.model');
const AppError = require('../../../shared/errors/AppError');
const { getPagination } = require('../../../shared/utils/pagination');

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */

const getCurrentSemester = async () => {
  return Semester.findOne({ isCurrent: true }).lean();
};

/* ─────────────────────────────────────────────
   1. DEPARTMENT DASHBOARD
───────────────────────────────────────────── */
const getDepartmentDashboard = async (hodId) => {
  const currentSemester = await getCurrentSemester();

  // Parallel base counts
  const [totalStudents, totalFaculty] = await Promise.all([
    User.countDocuments({ role: 'student', isActive: true }),
    User.countDocuments({ role: 'faculty', isActive: true }),
  ]);

  let totalSubjects = 0;
  let submissionRate = 0;
  let pendingEvaluations = 0;
  let topPerformingStudents = [];
  let facultyActivity = [];

  if (currentSemester) {
    const semId = currentSemester._id;

    // Subjects mapped in current semester
    const subjectMappings = await FacultySubjectMapping.distinct('subject', {
      semester: semId,
      isActive: true,
    });
    totalSubjects = subjectMappings.length;

    // Published assignments in current semester
    const publishedAssignmentIds = await Assignment.distinct('_id', {
      semesterId: semId,
      status: 'published',
    });

    // Total enrolled active students
    const enrolledCount = await Enrollment.countDocuments({ semester: semId, isActive: true });

    const totalPossibleSubmissions = publishedAssignmentIds.length * enrolledCount;
    const actualSubmissions =
      totalPossibleSubmissions > 0
        ? await Submission.countDocuments({ assignmentId: { $in: publishedAssignmentIds } })
        : 0;

    submissionRate =
      totalPossibleSubmissions > 0
        ? Math.round((actualSubmissions / totalPossibleSubmissions) * 100 * 10) / 10
        : 0;

    // Pending evaluations
    pendingEvaluations = await Submission.countDocuments({
      assignmentId: { $in: publishedAssignmentIds },
      status: 'submitted',
    });

    // Top 5 performing students by avg marks awarded
    const topStudentsAgg = await Submission.aggregate([
      {
        $match: {
          assignmentId: { $in: publishedAssignmentIds },
          status: 'graded',
          'evaluation.marksAwarded': { $exists: true },
        },
      },
      {
        $group: {
          _id: '$studentId',
          avgMarks: { $avg: '$evaluation.marksAwarded' },
          submissionCount: { $sum: 1 },
        },
      },
      { $sort: { avgMarks: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'student',
        },
      },
      { $unwind: { path: '$student', preserveNullAndEmpty: false } },
      {
        $project: {
          _id: 0,
          studentId: '$_id',
          fullName: '$student.fullName',
          avgMarks: { $round: ['$avgMarks', 2] },
          submissionCount: 1,
        },
      },
    ]);
    topPerformingStudents = topStudentsAgg;

    // Faculty activity
    const facultyMappings = await FacultySubjectMapping.find({
      semester: semId,
      isActive: true,
    })
      .populate('faculty', 'fullName email')
      .lean();

    const facultyIds = [...new Set(facultyMappings.map((m) => String(m.faculty._id)))];

    const facultyActivityData = await Promise.all(
      facultyIds.map(async (fId) => {
        const fOid = new mongoose.Types.ObjectId(fId);
        const assignmentIds = await Assignment.distinct('_id', {
          createdBy: fOid,
          semesterId: semId,
        });
        const assignmentCount = assignmentIds.length;
        const submissionsReceived =
          assignmentCount > 0
            ? await Submission.countDocuments({ assignmentId: { $in: assignmentIds } })
            : 0;
        const evaluationsCompleted =
          assignmentCount > 0
            ? await Submission.countDocuments({
                assignmentId: { $in: assignmentIds },
                status: 'graded',
              })
            : 0;
        const evaluationRate =
          submissionsReceived > 0
            ? Math.round((evaluationsCompleted / submissionsReceived) * 100 * 10) / 10
            : 0;

        const facultyInfo = facultyMappings.find((m) => String(m.faculty._id) === fId);
        return {
          facultyId: fId,
          fullName: facultyInfo ? facultyInfo.faculty.fullName : 'Unknown',
          assignmentCount,
          submissionsReceived,
          evaluationsCompleted,
          evaluationRate,
        };
      })
    );
    facultyActivity = facultyActivityData;
  }

  // Recent 3 notices (published)
  const recentNotices = await Notice.find({ isPublished: true })
    .sort({ publishedAt: -1 })
    .limit(3)
    .select('title type publishedAt viewCount')
    .lean();

  return {
    currentSemester: currentSemester || null,
    totalStudents,
    totalFaculty,
    totalSubjects,
    submissionRate,
    pendingEvaluations,
    recentNotices,
    topPerformingStudents,
    facultyActivity,
  };
};

/* ─────────────────────────────────────────────
   2. FACULTY PERFORMANCE
───────────────────────────────────────────── */
const getFacultyPerformance = async (semesterId) => {
  if (!semesterId) {
    const current = await getCurrentSemester();
    if (!current) throw AppError.notFound('No current semester found');
    semesterId = current._id;
  }

  const semOid = new mongoose.Types.ObjectId(semesterId);

  const mappings = await FacultySubjectMapping.find({ semester: semOid, isActive: true })
    .populate('faculty', 'fullName email loginId')
    .populate('subject', 'name code')
    .lean();

  if (!mappings.length) return [];

  // Group by faculty
  const facultyMap = {};
  mappings.forEach((m) => {
    const fId = String(m.faculty._id);
    if (!facultyMap[fId]) {
      facultyMap[fId] = {
        facultyId: fId,
        fullName: m.faculty.fullName,
        email: m.faculty.email,
        loginId: m.faculty.loginId,
        subjects: [],
      };
    }
    facultyMap[fId].subjects.push(m.subject);
  });

  const results = await Promise.all(
    Object.values(facultyMap).map(async (f) => {
      const fOid = new mongoose.Types.ObjectId(f.facultyId);
      const assignmentIds = await Assignment.distinct('_id', {
        createdBy: fOid,
        semesterId: semOid,
      });
      const assignmentsCreated = assignmentIds.length;

      const [submissionsReceived, evaluationsCompleted] = await Promise.all([
        assignmentsCreated > 0
          ? Submission.countDocuments({ assignmentId: { $in: assignmentIds } })
          : Promise.resolve(0),
        assignmentsCreated > 0
          ? Submission.countDocuments({ assignmentId: { $in: assignmentIds }, status: 'graded' })
          : Promise.resolve(0),
      ]);

      // Average turnaround time (days between submittedAt and evaluatedAt)
      let avgTurnaroundDays = null;
      if (evaluationsCompleted > 0) {
        const turnaroundAgg = await Submission.aggregate([
          {
            $match: {
              assignmentId: { $in: assignmentIds },
              status: 'graded',
              'evaluation.evaluatedAt': { $exists: true },
            },
          },
          {
            $project: {
              diffMs: {
                $subtract: ['$evaluation.evaluatedAt', '$submittedAt'],
              },
            },
          },
          { $group: { _id: null, avgMs: { $avg: '$diffMs' } } },
        ]);
        if (turnaroundAgg.length > 0) {
          avgTurnaroundDays =
            Math.round((turnaroundAgg[0].avgMs / (1000 * 60 * 60 * 24)) * 10) / 10;
        }
      }

      const evaluationRate =
        submissionsReceived > 0
          ? Math.round((evaluationsCompleted / submissionsReceived) * 100 * 10) / 10
          : 0;

      return {
        facultyId: f.facultyId,
        fullName: f.fullName,
        email: f.email,
        loginId: f.loginId,
        subjectsAssignedCount: f.subjects.length,
        subjects: f.subjects,
        assignmentsCreated,
        submissionsReceived,
        evaluationsCompleted,
        evaluationRate,
        avgTurnaroundDays,
      };
    })
  );

  return results;
};

/* ─────────────────────────────────────────────
   3. STUDENT PERFORMANCE
───────────────────────────────────────────── */
const getStudentPerformance = async (semesterId, query = {}) => {
  if (!semesterId) {
    const current = await getCurrentSemester();
    if (!current) throw AppError.notFound('No current semester found');
    semesterId = current._id;
  }

  const { subjectId } = query;
  const { page, limit, skip } = getPagination(query);
  const semOid = new mongoose.Types.ObjectId(semesterId);

  const [enrollments, total] = await Promise.all([
    Enrollment.find({ semester: semOid, isActive: true })
      .populate('student', 'fullName loginId')
      .skip(skip)
      .limit(limit)
      .lean(),
    Enrollment.countDocuments({ semester: semOid, isActive: true }),
  ]);

  if (!enrollments.length) return { students: [], page, limit, total };

  // Build assignment filter for this semester
  const assignmentFilter = { semesterId: semOid, status: 'published' };
  if (subjectId) assignmentFilter.subjectId = new mongoose.Types.ObjectId(subjectId);

  const publishedAssignmentIds = await Assignment.distinct('_id', assignmentFilter);

  const students = await Promise.all(
    enrollments.map(async (enr) => {
      const studentOid = enr.student._id;

      if (!publishedAssignmentIds.length) {
        return {
          studentId: String(studentOid),
          fullName: enr.student.fullName,
          loginId: enr.student.loginId,
          rollNumber: enr.rollNumber,
          submissionsCount: 0,
          avgMarks: null,
          passStatus: 'N/A',
        };
      }

      const submissionAgg = await Submission.aggregate([
        {
          $match: {
            studentId: studentOid,
            assignmentId: { $in: publishedAssignmentIds },
          },
        },
        {
          $group: {
            _id: null,
            count: { $sum: 1 },
            avgMarks: { $avg: '$evaluation.marksAwarded' },
          },
        },
      ]);

      const submissionsCount = submissionAgg.length ? submissionAgg[0].count : 0;
      const avgMarks =
        submissionAgg.length && submissionAgg[0].avgMarks != null
          ? Math.round(submissionAgg[0].avgMarks * 100) / 100
          : null;

      // Simple pass/fail: pass if avgMarks >= 40% of overall (relative heuristic)
      let passStatus = 'N/A';
      if (avgMarks !== null) {
        passStatus = avgMarks >= 40 ? 'Pass' : 'Fail';
      }

      return {
        studentId: String(studentOid),
        fullName: enr.student.fullName,
        loginId: enr.student.loginId,
        rollNumber: enr.rollNumber,
        submissionsCount,
        avgMarks,
        passStatus,
      };
    })
  );

  return { students, page, limit, total };
};

/* ─────────────────────────────────────────────
   4. DEPARTMENT ANALYTICS
───────────────────────────────────────────── */
const getDepartmentAnalytics = async (academicYearId) => {
  const matchFilter = {};
  if (academicYearId) {
    // Get semester IDs belonging to this academic year
    const semesters = await Semester.find({ academicYear: academicYearId }).select('_id').lean();
    const semIds = semesters.map((s) => s._id);
    matchFilter.semesterId = { $in: semIds };
  }

  const assignmentIds = await Assignment.distinct('_id', {
    ...matchFilter,
    status: 'published',
  });

  // Month-by-month submission volume (last 12 months)
  const twelveMonthsAgo = new Date();
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 11);
  twelveMonthsAgo.setDate(1);
  twelveMonthsAgo.setHours(0, 0, 0, 0);

  const submissionByMonth = await Submission.aggregate([
    {
      $match: {
        assignmentId: { $in: assignmentIds },
        submittedAt: { $gte: twelveMonthsAgo },
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$submittedAt' },
          month: { $month: '$submittedAt' },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
    {
      $project: {
        _id: 0,
        year: '$_id.year',
        month: '$_id.month',
        count: 1,
      },
    },
  ]);

  // Subject-wise submission rates
  const subjectWiseAgg = await Assignment.aggregate([
    { $match: { ...matchFilter, status: 'published' } },
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
        totalAssignments: { $sum: 1 },
        totalSubmissions: { $sum: { $size: '$submissions' } },
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
    { $unwind: { path: '$subject', preserveNullAndEmpty: false } },
    {
      $project: {
        _id: 0,
        subjectId: '$_id',
        subjectName: '$subject.name',
        subjectCode: '$subject.code',
        totalAssignments: 1,
        totalSubmissions: 1,
      },
    },
    { $sort: { totalSubmissions: -1 } },
  ]);

  // Assignment type distribution
  const typeDistribution = await Assignment.aggregate([
    { $match: { ...matchFilter, status: 'published' } },
    { $group: { _id: '$type', count: { $sum: 1 } } },
    { $project: { _id: 0, type: '$_id', count: 1 } },
    { $sort: { count: -1 } },
  ]);

  // Top performing subjects by avg student marks
  const topSubjects = await Submission.aggregate([
    {
      $match: {
        assignmentId: { $in: assignmentIds },
        status: 'graded',
        'evaluation.marksAwarded': { $exists: true },
      },
    },
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
      $group: {
        _id: '$assignment.subjectId',
        avgMarks: { $avg: '$evaluation.marksAwarded' },
        submissionCount: { $sum: 1 },
      },
    },
    { $sort: { avgMarks: -1 } },
    { $limit: 10 },
    {
      $lookup: {
        from: 'subjects',
        localField: '_id',
        foreignField: '_id',
        as: 'subject',
      },
    },
    { $unwind: { path: '$subject', preserveNullAndEmpty: false } },
    {
      $project: {
        _id: 0,
        subjectId: '$_id',
        subjectName: '$subject.name',
        subjectCode: '$subject.code',
        avgMarks: { $round: ['$avgMarks', 2] },
        submissionCount: 1,
      },
    },
  ]);

  return {
    submissionByMonth,
    subjectWiseSubmissionRates: subjectWiseAgg,
    assignmentTypeDistribution: typeDistribution,
    topPerformingSubjects: topSubjects,
  };
};

/* ─────────────────────────────────────────────
   5. ASSIGNMENT STATS
───────────────────────────────────────────── */
const getAssignmentStats = async (semesterId) => {
  if (!semesterId) {
    const current = await getCurrentSemester();
    if (!current) throw AppError.notFound('No current semester found');
    semesterId = current._id;
  }

  const semOid = new mongoose.Types.ObjectId(semesterId);

  const [totalAssignments, publishedAssignments, draftAssignments] = await Promise.all([
    Assignment.countDocuments({ semesterId: semOid }),
    Assignment.countDocuments({ semesterId: semOid, status: 'published' }),
    Assignment.countDocuments({ semesterId: semOid, status: 'draft' }),
  ]);

  const publishedIds = await Assignment.distinct('_id', {
    semesterId: semOid,
    status: 'published',
  });

  const [totalSubmissions, pendingEvaluation, evaluated] = await Promise.all([
    publishedIds.length
      ? Submission.countDocuments({ assignmentId: { $in: publishedIds } })
      : Promise.resolve(0),
    publishedIds.length
      ? Submission.countDocuments({ assignmentId: { $in: publishedIds }, status: 'submitted' })
      : Promise.resolve(0),
    publishedIds.length
      ? Submission.countDocuments({ assignmentId: { $in: publishedIds }, status: 'graded' })
      : Promise.resolve(0),
  ]);

  // Theory vs Lab breakdown
  const theoryTypes = ['assignment1', 'assignment2', 'tutorial', 'mini_project'];
  const labTypes = ['lab_observation', 'record'];

  const [theoryCount, labCount] = await Promise.all([
    Assignment.countDocuments({ semesterId: semOid, type: { $in: theoryTypes } }),
    Assignment.countDocuments({ semesterId: semOid, type: { $in: labTypes } }),
  ]);

  // Overdue submissions (submitted after deadline)
  const overdueSubmissions = publishedIds.length
    ? await Submission.countDocuments({ assignmentId: { $in: publishedIds }, isLate: true })
    : 0;

  return {
    totalAssignments,
    publishedAssignments,
    draftAssignments,
    totalSubmissions,
    pendingEvaluation,
    evaluated,
    byType: {
      theory: theoryCount,
      lab: labCount,
    },
    overdueSubmissions,
  };
};

module.exports = {
  getDepartmentDashboard,
  getFacultyPerformance,
  getStudentPerformance,
  getDepartmentAnalytics,
  getAssignmentStats,
};

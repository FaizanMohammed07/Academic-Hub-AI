'use strict';

const Quiz = require('../models/quiz.model');
const QuizAttempt = require('../models/quizAttempt.model');
const FacultySubjectMapping = require('../../academic/models/facultySubjectMapping.model');
const Enrollment = require('../../academic/models/enrollment.model');
const Notification = require('../../notifications/models/notification.model');
const AppError = require('../../../shared/errors/AppError');
const { getPagination, buildSort } = require('../../../shared/utils/pagination');

const USER_SELECT = 'fullName email loginId role avatarUrl';

/**
 * createQuiz
 */
const createQuiz = async ({ title, description, subject, faculty, semester, questions, duration, startTime, endTime, createdBy }) => {
  // Validate faculty has mapping for this subject in this semester
  const mapping = await FacultySubjectMapping.findOne({
    faculty,
    subject,
    semester,
    isActive: true,
  });
  if (!mapping) {
    throw AppError.forbidden('You are not assigned to this subject for the selected semester');
  }

  const quiz = await Quiz.create({
    title,
    description,
    subject,
    faculty,
    semester,
    questions: questions || [],
    duration: duration || 30,
    startTime,
    endTime,
    status: 'draft',
    createdBy,
  });

  return quiz;
};

/**
 * publishQuiz
 */
const publishQuiz = async (quizId, facultyId) => {
  const quiz = await Quiz.findById(quizId);
  if (!quiz) throw AppError.notFound('Quiz not found');
  if (quiz.faculty.toString() !== facultyId.toString()) {
    throw AppError.forbidden('You do not own this quiz');
  }
  if (quiz.status === 'published') {
    throw AppError.conflict('Quiz is already published', 'ALREADY_PUBLISHED');
  }
  if (quiz.status === 'closed') {
    throw AppError.badRequest('Cannot publish a closed quiz');
  }
  if (!quiz.questions || quiz.questions.length === 0) {
    throw AppError.badRequest('Quiz must have at least one question before publishing');
  }

  quiz.status = 'published';
  await quiz.save();

  // Notify enrolled students
  const enrollments = await Enrollment.find({ semester: quiz.semester, isActive: true }).select('student');
  if (enrollments.length > 0) {
    const notifications = enrollments.map((e) => ({
      recipient: e.student,
      type: 'system',
      title: `New Quiz Available: ${quiz.title}`,
      message: `A new quiz "${quiz.title}" is now available. ${quiz.startTime ? `Starts: ${new Date(quiz.startTime).toLocaleString()}.` : ''}`,
      data: { quizId: quiz._id },
      relatedEntity: { entityType: 'Quiz', entityId: quiz._id },
    }));
    await Notification.insertMany(notifications, { ordered: false });
  }

  return quiz;
};

/**
 * getQuizzesByFaculty
 */
const getQuizzesByFaculty = async (facultyId, { semesterId, status, page, limit } = {}) => {
  const { page: pg, limit: lmt, skip } = getPagination({ page, limit });
  const filter = { faculty: facultyId };
  if (semesterId) filter.semester = semesterId;
  if (status) filter.status = status;

  const sort = buildSort({});

  const [quizzes, total] = await Promise.all([
    Quiz.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(lmt)
      .populate('subject', 'name code type')
      .populate('semester', 'name number section')
      .lean(),
    Quiz.countDocuments(filter),
  ]);

  // Attach attempt counts
  const quizIds = quizzes.map((q) => q._id);
  const attemptCounts = await QuizAttempt.aggregate([
    { $match: { quiz: { $in: quizIds } } },
    { $group: { _id: '$quiz', count: { $sum: 1 } } },
  ]);
  const countMap = {};
  attemptCounts.forEach((ac) => { countMap[ac._id.toString()] = ac.count; });
  quizzes.forEach((q) => { q.attemptCount = countMap[q._id.toString()] || 0; });

  return { quizzes, total, page: pg, limit: lmt };
};

/**
 * getQuizzesByStudent
 */
const getQuizzesByStudent = async (studentId) => {
  // Find student's active enrollment → semester
  const enrollment = await Enrollment.findOne({ student: studentId, isActive: true });
  if (!enrollment) {
    return { quizzes: [], total: 0 };
  }

  const now = new Date();
  const quizzes = await Quiz.find({
    semester: enrollment.semester,
    status: 'published',
    $or: [
      { endTime: { $exists: false } },
      { endTime: null },
      { endTime: { $gte: now } },
    ],
  })
    .sort({ createdAt: -1 })
    .populate('subject', 'name code type')
    .populate('faculty', USER_SELECT)
    .lean();

  // Strip correctAnswer for student view
  quizzes.forEach((q) => {
    if (q.questions) {
      q.questions = q.questions.map((qu) => {
        const { correctAnswer, explanation, ...safe } = qu;
        return safe;
      });
    }
  });

  // Attach attempt status for each quiz
  const quizIds = quizzes.map((q) => q._id);
  const attempts = await QuizAttempt.find({ student: studentId, quiz: { $in: quizIds } })
    .select('quiz score percentage submittedAt')
    .lean();
  const attemptMap = {};
  attempts.forEach((a) => { attemptMap[a.quiz.toString()] = a; });
  quizzes.forEach((q) => {
    q.attemptStatus = attemptMap[q._id.toString()] ? 'attempted' : 'not_attempted';
    q.attempt = attemptMap[q._id.toString()] || null;
  });

  return { quizzes, total: quizzes.length };
};

/**
 * getQuizById
 */
const getQuizById = async (quizId, requesterId, role) => {
  const quiz = await Quiz.findById(quizId)
    .populate('subject', 'name code type')
    .populate('faculty', USER_SELECT)
    .populate('semester', 'name number section')
    .lean();

  if (!quiz) throw AppError.notFound('Quiz not found');

  if (role === 'faculty' || role === 'hod' || role === 'admin') {
    // Full quiz including correctAnswer
    return quiz;
  }

  // Student: strip correctAnswer unless they have already submitted
  const attempt = await QuizAttempt.findOne({ quiz: quizId, student: requesterId }).lean();
  if (attempt) {
    // After submission, reveal answers
    return { quiz, attempt };
  }

  // Before submission: strip correctAnswer and explanation
  const safeQuestions = (quiz.questions || []).map((q) => {
    const { correctAnswer, explanation, ...safe } = q;
    return safe;
  });

  return { ...quiz, questions: safeQuestions };
};

/**
 * submitQuizAttempt
 */
const submitQuizAttempt = async (quizId, studentId, answers, timeTaken) => {
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) throw AppError.notFound('Quiz not found');
  if (quiz.status !== 'published') {
    throw AppError.badRequest('This quiz is not currently available');
  }

  const now = new Date();
  if (quiz.startTime && now < new Date(quiz.startTime)) {
    throw AppError.badRequest('This quiz has not started yet');
  }
  if (quiz.endTime && now > new Date(quiz.endTime)) {
    throw AppError.badRequest('This quiz has already ended');
  }

  // Check if student already attempted
  const existingAttempt = await QuizAttempt.findOne({ quiz: quizId, student: studentId });
  if (existingAttempt) {
    throw AppError.conflict('You have already submitted this quiz', 'ALREADY_ATTEMPTED');
  }

  // Calculate score
  let score = 0;
  const totalMarks = quiz.questions.reduce((sum, q) => sum + (q.marks || 1), 0);

  (answers || []).forEach((ans) => {
    const question = quiz.questions[ans.questionIndex];
    if (question && ans.selectedOption === question.correctAnswer) {
      score += question.marks || 1;
    }
  });

  const percentage = totalMarks > 0 ? Math.round((score / totalMarks) * 100 * 100) / 100 : 0;

  const attempt = await QuizAttempt.create({
    quiz: quizId,
    student: studentId,
    answers: answers || [],
    score,
    totalMarks,
    percentage,
    timeTaken: timeTaken || null,
    submittedAt: now,
  });

  // Notify student with result
  await Notification.create({
    recipient: studentId,
    type: 'system',
    title: `Quiz Result: ${quiz.title}`,
    message: `You scored ${score}/${totalMarks} (${percentage}%) in "${quiz.title}".`,
    data: { quizId, attemptId: attempt._id, score, totalMarks, percentage },
    relatedEntity: { entityType: 'Quiz', entityId: quiz._id },
  });

  return { attempt, score, totalMarks, percentage };
};

/**
 * getQuizResults
 */
const getQuizResults = async (quizId, facultyId) => {
  const quiz = await Quiz.findById(quizId).populate('subject', 'name code').lean();
  if (!quiz) throw AppError.notFound('Quiz not found');
  if (quiz.faculty.toString() !== facultyId.toString()) {
    throw AppError.forbidden('You do not own this quiz');
  }

  const attempts = await QuizAttempt.find({ quiz: quizId })
    .populate('student', USER_SELECT)
    .sort({ score: -1, submittedAt: 1 })
    .lean();

  // Add rank
  attempts.forEach((a, idx) => { a.rank = idx + 1; });

  const totalAttempts = attempts.length;
  const avgScore = totalAttempts > 0
    ? Math.round((attempts.reduce((s, a) => s + a.score, 0) / totalAttempts) * 100) / 100
    : 0;
  const avgPercentage = totalAttempts > 0
    ? Math.round((attempts.reduce((s, a) => s + a.percentage, 0) / totalAttempts) * 100) / 100
    : 0;

  return { quiz, attempts, stats: { totalAttempts, avgScore, avgPercentage } };
};

/**
 * getStudentAttempt
 */
const getStudentAttempt = async (quizId, studentId) => {
  const attempt = await QuizAttempt.findOne({ quiz: quizId, student: studentId })
    .populate('student', USER_SELECT)
    .lean();
  if (!attempt) throw AppError.notFound('Attempt not found');

  // Reveal correct answers after submission
  const quiz = await Quiz.findById(quizId).lean();
  if (!quiz) throw AppError.notFound('Quiz not found');

  // Build question-by-question breakdown
  const breakdown = (quiz.questions || []).map((q, idx) => {
    const studentAns = (attempt.answers || []).find((a) => a.questionIndex === idx);
    const selectedOption = studentAns ? studentAns.selectedOption : null;
    const isCorrect = selectedOption === q.correctAnswer;
    return {
      questionIndex: idx,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      selectedOption,
      isCorrect,
      marks: q.marks || 1,
      marksEarned: isCorrect ? (q.marks || 1) : 0,
      explanation: q.explanation || null,
    };
  });

  return { attempt, quiz: { _id: quiz._id, title: quiz.title, totalMarks: attempt.totalMarks }, breakdown };
};

module.exports = {
  createQuiz,
  publishQuiz,
  getQuizzesByFaculty,
  getQuizzesByStudent,
  getQuizById,
  submitQuizAttempt,
  getQuizResults,
  getStudentAttempt,
};

'use strict';

const quizService = require('../services/quiz.service');
const { success, created, paginated } = require('../../../shared/utils/apiResponse');

const createQuiz = async (req, res, next) => {
  try {
    const { title, description, subject, semester, questions, duration, startTime, endTime } = req.body;
    const quiz = await quizService.createQuiz({
      title,
      description,
      subject,
      faculty: req.user._id,
      semester,
      questions,
      duration,
      startTime,
      endTime,
      createdBy: req.user._id,
    });
    created(res, quiz, 'Quiz created successfully');
  } catch (err) {
    next(err);
  }
};

const publishQuiz = async (req, res, next) => {
  try {
    const quiz = await quizService.publishQuiz(req.params.id, req.user._id);
    success(res, quiz, 'Quiz published successfully');
  } catch (err) {
    next(err);
  }
};

const getMyQuizzes = async (req, res, next) => {
  try {
    const { semesterId, status, page, limit } = req.query;
    const result = await quizService.getQuizzesByFaculty(req.user._id, { semesterId, status, page, limit });
    paginated(res, result.quizzes, { page: result.page, limit: result.limit, total: result.total });
  } catch (err) {
    next(err);
  }
};

const getStudentQuizzes = async (req, res, next) => {
  try {
    const result = await quizService.getQuizzesByStudent(req.user._id);
    success(res, result, 'Quizzes fetched');
  } catch (err) {
    next(err);
  }
};

const getQuizById = async (req, res, next) => {
  try {
    const result = await quizService.getQuizById(req.params.id, req.user._id, req.user.role);
    success(res, result, 'Quiz fetched');
  } catch (err) {
    next(err);
  }
};

const submitAttempt = async (req, res, next) => {
  try {
    const { answers, timeTaken } = req.body;
    const result = await quizService.submitQuizAttempt(req.params.id, req.user._id, answers, timeTaken);
    created(res, result, 'Quiz submitted successfully');
  } catch (err) {
    next(err);
  }
};

const getResults = async (req, res, next) => {
  try {
    const result = await quizService.getQuizResults(req.params.id, req.user._id);
    success(res, result, 'Quiz results fetched');
  } catch (err) {
    next(err);
  }
};

const getMyAttempt = async (req, res, next) => {
  try {
    const result = await quizService.getStudentAttempt(req.params.id, req.user._id);
    success(res, result, 'Attempt fetched');
  } catch (err) {
    next(err);
  }
};

module.exports = { createQuiz, publishQuiz, getMyQuizzes, getStudentQuizzes, getQuizById, submitAttempt, getResults, getMyAttempt };

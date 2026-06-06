'use strict';

const axios = require('axios');
const config = require('../../../config');
const logger = require('../../../shared/utils/logger');
const apiResponse = require('../../../shared/utils/apiResponse');
const AppError = require('../../../shared/errors/AppError');
const conversationService = require('../services/aiConversation.service');
const { buildQuestionPrompt } = require('../prompts');

// ---------------------------------------------------------------------------
// Learning Assistant — Student endpoints
// ---------------------------------------------------------------------------

const startConversation = async (req, res, next) => {
  try {
    const { subjectId, initialMessage } = req.body;
    const conversation = await conversationService.startConversation(req.user._id, {
      subjectId,
      initialMessage,
    });
    return apiResponse.created(res, conversation, 'Conversation started');
  } catch (err) {
    next(err);
  }
};

const sendMessage = async (req, res, next) => {
  try {
    const { message } = req.body;
    const result = await conversationService.sendMessage(
      req.params.id,
      req.user._id,
      message
    );
    return apiResponse.success(res, result, 'Message sent');
  } catch (err) {
    next(err);
  }
};

const getConversations = async (req, res, next) => {
  try {
    const { subjectId, page = 1, limit = 20 } = req.query;
    const result = await conversationService.getConversations(req.user._id, {
      subjectId,
      page,
      limit,
    });
    return apiResponse.paginated(res, result.conversations, {
      page: result.page,
      limit: result.limit,
      total: result.total,
    });
  } catch (err) {
    next(err);
  }
};

const getConversation = async (req, res, next) => {
  try {
    const conversation = await conversationService.getConversation(
      req.params.id,
      req.user._id
    );
    return apiResponse.success(res, conversation, 'Conversation');
  } catch (err) {
    next(err);
  }
};

const deleteConversation = async (req, res, next) => {
  try {
    await conversationService.deleteConversation(req.params.id, req.user._id);
    return apiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
};

const generateStudyMaterial = async (req, res, next) => {
  try {
    const { subjectId, type, topic } = req.body;
    const content = await conversationService.generateStudyMaterial(req.user._id, {
      subjectId,
      type,
      topic,
    });
    return apiResponse.success(res, { content }, 'Study material generated');
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Faculty — generate exam questions
// ---------------------------------------------------------------------------

const generateQuestionsForFaculty = async (req, res, next) => {
  try {
    const {
      topic,
      subject,
      difficulty = 'medium',
      questionTypes = ['mcq', 'short_answer'],
      count = 10,
    } = req.body;

    if (!topic || !subject) {
      throw AppError.badRequest('topic and subject are required');
    }

    const prompt = buildQuestionPrompt({
      topic,
      subject,
      difficulty,
      questionTypes,
      count: Number(count),
    });

    let questions = { questions: [], raw: '' };
    try {
      const { data } = await axios.post(
        `${config.openRouter.baseUrl}/chat/completions`,
        {
          model: config.openRouter.questionModel,
          messages: [{ role: 'user', content: prompt }],
          stream: false,
        },
        {
          headers: {
            Authorization: `Bearer ${config.openRouter.apiKey}`,
            'HTTP-Referer': 'https://vjit-it.ac.in',
            'X-Title': 'VJIT IT Hub',
            'Content-Type': 'application/json',
          },
          timeout: 60_000,
        }
      );

      const raw = data.choices[0].message.content;

      try {
        const json = raw.match(/```json([\s\S]*?)```/)?.[1] || raw;
        questions = JSON.parse(json);
      } catch {
        questions = { questions: [], raw };
      }
    } catch (err) {
      logger.error(`OpenRouter error in generateQuestionsForFaculty: ${err.message}`);
      throw AppError.internal('Failed to generate questions. Please try again.');
    }

    return apiResponse.success(res, questions, 'Questions generated');
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// Shared — get AI analysis for a submission
// ---------------------------------------------------------------------------

const getAnalysis = async (req, res, next) => {
  try {
    const AIAnalysis = require('../models/aiAnalysis.model');
    const Submission = require('../../submissions/models/submission.model');

    const submission = await Submission.findById(req.params.submissionId).select(
      'studentId assignment aiAnalysisId'
    );
    if (!submission) throw AppError.notFound('Submission not found');

    // Access control: student can only view their own
    const role = req.user.role;
    if (
      role === 'student' &&
      submission.studentId.toString() !== req.user._id.toString()
    ) {
      throw AppError.forbidden();
    }

    if (!submission.aiAnalysisId) {
      throw AppError.notFound('Analysis not available yet');
    }

    const analysis = await AIAnalysis.findById(submission.aiAnalysisId);
    if (!analysis) throw AppError.notFound('Analysis record not found');

    return apiResponse.success(res, analysis, 'Analysis');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  startConversation,
  sendMessage,
  getConversations,
  getConversation,
  deleteConversation,
  generateStudyMaterial,
  generateQuestionsForFaculty,
  getAnalysis,
};

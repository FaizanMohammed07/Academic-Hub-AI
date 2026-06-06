'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const {
  startConversation,
  sendMessage,
  getConversations,
  getConversation,
  deleteConversation,
  generateStudyMaterial,
  generateQuestionsForFaculty,
  getAnalysis,
} = require('../controllers/ai.controller');

// ---------------------------------------------------------------------------
// Student — Learning Assistant
// ---------------------------------------------------------------------------

router.post(
  '/conversations',
  authenticate,
  authorize('student'),
  startConversation
);

router.get(
  '/conversations',
  authenticate,
  authorize('student'),
  getConversations
);

router.get(
  '/conversations/:id',
  authenticate,
  authorize('student'),
  getConversation
);

router.post(
  '/conversations/:id/message',
  authenticate,
  authorize('student'),
  sendMessage
);

router.delete(
  '/conversations/:id',
  authenticate,
  authorize('student'),
  deleteConversation
);

router.post(
  '/study-material',
  authenticate,
  authorize('student'),
  generateStudyMaterial
);

// ---------------------------------------------------------------------------
// Faculty — AI Tools
// ---------------------------------------------------------------------------

router.post(
  '/generate-questions',
  authenticate,
  authorize('faculty'),
  generateQuestionsForFaculty
);

// ---------------------------------------------------------------------------
// Shared — Analysis (student, faculty, hod, admin)
// ---------------------------------------------------------------------------

router.get(
  '/analysis/:submissionId',
  authenticate,
  authorize('student', 'faculty', 'hod', 'admin'),
  getAnalysis
);

module.exports = router;

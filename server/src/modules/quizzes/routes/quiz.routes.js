'use strict';

const router = require('express').Router();
const { authenticate, authorize } = require('../../../shared/middleware/auth.middleware');
const ctrl = require('../controllers/quiz.controller');

router.post('/',               authenticate, authorize('faculty'), ctrl.createQuiz);
router.get('/',                authenticate, authorize('faculty', 'hod'), ctrl.getMyQuizzes);
router.get('/student',         authenticate, authorize('student'), ctrl.getStudentQuizzes);
router.get('/:id',             authenticate, ctrl.getQuizById);
router.patch('/:id/publish',   authenticate, authorize('faculty'), ctrl.publishQuiz);
router.post('/:id/attempt',    authenticate, authorize('student'), ctrl.submitAttempt);
router.get('/:id/results',     authenticate, authorize('faculty', 'hod'), ctrl.getResults);
router.get('/:id/my-attempt',  authenticate, authorize('student'), ctrl.getMyAttempt);

module.exports = router;

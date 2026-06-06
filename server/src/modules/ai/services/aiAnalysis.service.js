const axios = require('axios');
const config = require('../../../config');
const logger = require('../../../shared/utils/logger');
const AiAnalysis = require('../models/aiAnalysis.model');
const Submission = require('../../submissions/models/submission.model');
const { buildAnalysisPrompt, buildQuestionPrompt } = require('../prompts');

const openRouterClient = axios.create({
  baseURL: config.openRouter.baseUrl,
  headers: {
    Authorization: `Bearer ${config.openRouter.apiKey}`,
    'Content-Type': 'application/json',
    'HTTP-Referer': 'https://vjit-it.ac.in',
    'X-Title': 'VJIT IT Academic Hub',
  },
});

const callAI = async (model, messages, maxTokens = 1500) => {
  const start = Date.now();
  const res = await openRouterClient.post('/chat/completions', {
    model,
    messages,
    max_tokens: maxTokens,
    temperature: 0.2,
  });
  const ms = Date.now() - start;
  return { content: res.data.choices[0].message.content, ms, model };
};

/**
 * Full AI analysis pipeline for a student submission.
 * Called automatically via EventBus after submission is saved.
 */
const analyzeSubmission = async (submissionId) => {
  const analysis = await AiAnalysis.findOneAndUpdate(
    { submissionId },
    { status: 'processing' },
    { upsert: true, new: true }
  );

  try {
    const submission = await Submission.findById(submissionId)
      .populate('assignmentId')
      .populate('studentId');

    if (!submission) throw new Error('Submission not found');

    // Fetch all other submissions for this assignment for plagiarism cross-check
    const peers = await Submission.find({
      assignmentId: submission.assignmentId._id,
      _id: { $ne: submissionId },
    }).select('fileUrls studentId');

    const prompt = buildAnalysisPrompt({
      assignmentTitle:  submission.assignmentId.title,
      assignmentType:   submission.assignmentId.type,
      studentTopic:     submission.studentTopic || 'General',
      submissionText:   submission.extractedText || '[Binary file — no text extracted]',
      peerTexts:        peers.map((p) => p.extractedText || '').filter(Boolean).slice(0, 5),
    });

    const { content, ms, model } = await callAI(
      config.openRouter.analysisModel,
      [{ role: 'user', content: prompt }],
      2000
    );

    const parsed = parseAnalysisResponse(content);

    analysis.scores            = parsed.scores;
    analysis.details           = parsed.details;
    analysis.rawPrompt         = prompt;
    analysis.rawResponse       = content;
    analysis.modelUsed         = model;
    analysis.processingTimeMs  = ms;
    analysis.processedAt       = new Date();
    analysis.status            = 'completed';
    await analysis.save();

    await Submission.findByIdAndUpdate(submissionId, { aiAnalysisId: analysis._id });

    logger.info(`AI analysis done for submission ${submissionId} in ${ms}ms`);
    return analysis;
  } catch (err) {
    logger.error(`AI analysis failed: ${err.message}`);
    analysis.status = 'failed';
    await analysis.save();
    throw err;
  }
};

const parseAnalysisResponse = (raw) => {
  try {
    const json = raw.match(/```json([\s\S]*?)```/)?.[1] || raw;
    return JSON.parse(json);
  } catch {
    return {
      scores: {
        originalityScore: 0,
        understandingScore: 0,
        aiProbabilityScore: 0,
        qualityScore: 0,
        overallScore: 0,
      },
      details: { technicalAnalysis: raw },
    };
  }
};

const generateQuestions = async ({ topic, subject, difficulty, questionTypes, count, model }) => {
  const prompt = buildQuestionPrompt({ topic, subject, difficulty, questionTypes, count });
  const { content } = await callAI(
    model || config.openRouter.questionModel,
    [{ role: 'user', content: prompt }]
  );
  return parseQuestions(content);
};

const parseQuestions = (raw) => {
  try {
    const json = raw.match(/```json([\s\S]*?)```/)?.[1] || raw;
    return JSON.parse(json);
  } catch {
    return { questions: [], raw };
  }
};

module.exports = { analyzeSubmission, generateQuestions };

// ---------------------------------------------------------------------------
// EventBus subscription — auto-analyse whenever a submission is created
// ---------------------------------------------------------------------------

const eventBus = require('../../../shared/utils/eventBus');

eventBus.on('submission.created', async (submissionId) => {
  try {
    await analyzeSubmission(submissionId);
    eventBus.emit('analysis.complete', submissionId);
  } catch (err) {
    logger.error(`EventBus: analysis failed for submission ${submissionId}: ${err.message}`);
  }
});

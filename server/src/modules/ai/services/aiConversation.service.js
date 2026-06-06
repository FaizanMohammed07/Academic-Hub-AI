'use strict';

const axios = require('axios');
const config = require('../../../config');
const logger = require('../../../shared/utils/logger');
const AppError = require('../../../shared/errors/AppError');
const AiConversation = require('../models/aiConversation.model');
const Subject = require('../../academic/models/subject.model');

// ---------------------------------------------------------------------------
// OpenRouter helper
// ---------------------------------------------------------------------------

const callOpenRouter = async (messages, model) => {
  const { data } = await axios.post(
    `${config.openRouter.baseUrl}/chat/completions`,
    { model: model || config.openRouter.defaultModel, messages, stream: false },
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
  return data.choices[0].message.content;
};

// ---------------------------------------------------------------------------
// Build system prompt with subject context
// ---------------------------------------------------------------------------

const buildSystemPrompt = (subject) => {
  if (subject) {
    return (
      `You are an AI learning assistant for the IT Department at VJIT (Vignana Jyothi Institute of Technology).\n` +
      `Subject context: ${subject.name} (${subject.code}) - ${subject.type}\n` +
      `Help the student understand concepts clearly. Be accurate, concise, and educational.\n` +
      `Generate content appropriate for B.Tech IT students.`
    );
  }
  return (
    `You are an AI learning assistant for the IT Department at VJIT (Vignana Jyothi Institute of Technology).\n` +
    `Help the student understand concepts clearly. Be accurate, concise, and educational.\n` +
    `Generate content appropriate for B.Tech IT students.`
  );
};

// ---------------------------------------------------------------------------
// startConversation
// ---------------------------------------------------------------------------

const startConversation = async (studentId, { subjectId, initialMessage }) => {
  if (!initialMessage || !initialMessage.trim()) {
    throw AppError.badRequest('Initial message is required');
  }

  let subject = null;
  if (subjectId) {
    subject = await Subject.findById(subjectId).select('name code type');
    if (!subject) throw AppError.notFound('Subject not found');
  }

  const systemPrompt = buildSystemPrompt(subject);

  // Create conversation with the initial user message
  const conversation = await AiConversation.create({
    student: studentId,
    subject: subjectId || undefined,
    title: initialMessage.slice(0, 80),
    messages: [{ role: 'user', content: initialMessage }],
    totalTokens: 0,
  });

  // Call AI
  let aiContent = '[AI response unavailable]';
  try {
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: initialMessage },
    ];
    aiContent = await callOpenRouter(messages, config.openRouter.defaultModel);
  } catch (err) {
    logger.error(`OpenRouter error in startConversation: ${err.message}`);
  }

  conversation.messages.push({ role: 'assistant', content: aiContent });
  await conversation.save();

  return conversation;
};

// ---------------------------------------------------------------------------
// sendMessage
// ---------------------------------------------------------------------------

const sendMessage = async (conversationId, studentId, message) => {
  if (!message || !message.trim()) throw AppError.badRequest('Message is required');

  const conversation = await AiConversation.findById(conversationId);
  if (!conversation) throw AppError.notFound('Conversation not found');
  if (conversation.student.toString() !== studentId.toString()) throw AppError.forbidden();
  if (!conversation.isActive) throw AppError.badRequest('Conversation is closed');

  let subject = null;
  if (conversation.subject) {
    subject = await Subject.findById(conversation.subject).select('name code type');
  }

  const systemPrompt = buildSystemPrompt(subject);

  // Build messages array: system + history + new message
  const historyMessages = conversation.messages.map((m) => ({
    role: m.role,
    content: m.content,
  }));

  const messagesPayload = [
    { role: 'system', content: systemPrompt },
    ...historyMessages,
    { role: 'user', content: message },
  ];

  // Append user message immediately
  conversation.messages.push({ role: 'user', content: message });

  let aiContent = '[AI response unavailable]';
  try {
    aiContent = await callOpenRouter(messagesPayload, config.openRouter.defaultModel);
  } catch (err) {
    logger.error(`OpenRouter error in sendMessage: ${err.message}`);
  }

  conversation.messages.push({ role: 'assistant', content: aiContent });

  // Rough token estimate: 1 token ≈ 4 characters
  const totalChars = messagesPayload.reduce((sum, m) => sum + m.content.length, 0) + aiContent.length;
  conversation.totalTokens += Math.ceil(totalChars / 4);

  await conversation.save();

  return { role: 'assistant', content: aiContent };
};

// ---------------------------------------------------------------------------
// getConversations
// ---------------------------------------------------------------------------

const getConversations = async (studentId, { subjectId, page = 1, limit = 20 } = {}) => {
  const filter = { student: studentId };
  if (subjectId) filter.subject = subjectId;

  const skip = (Number(page) - 1) * Number(limit);
  const [conversations, total] = await Promise.all([
    AiConversation.find(filter)
      .select('-messages')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .populate('subject', 'name code'),
    AiConversation.countDocuments(filter),
  ]);

  return { conversations, total, page: Number(page), limit: Number(limit) };
};

// ---------------------------------------------------------------------------
// getConversation
// ---------------------------------------------------------------------------

const getConversation = async (conversationId, studentId) => {
  const conversation = await AiConversation.findById(conversationId).populate('subject', 'name code');
  if (!conversation) throw AppError.notFound('Conversation not found');
  if (conversation.student.toString() !== studentId.toString()) throw AppError.forbidden();
  return conversation;
};

// ---------------------------------------------------------------------------
// deleteConversation
// ---------------------------------------------------------------------------

const deleteConversation = async (conversationId, studentId) => {
  const conversation = await AiConversation.findById(conversationId);
  if (!conversation) throw AppError.notFound('Conversation not found');
  if (conversation.student.toString() !== studentId.toString()) throw AppError.forbidden();
  await AiConversation.findByIdAndDelete(conversationId);
};

// ---------------------------------------------------------------------------
// generateStudyMaterial (one-shot, no conversation stored)
// ---------------------------------------------------------------------------

const STUDY_MATERIAL_TYPES = ['notes', 'mcqs', 'important_questions', 'revision', 'summary'];

const buildStudyMaterialPrompt = (type, subject, topic) => {
  const subjectCtx = subject
    ? `Subject: ${subject.name} (${subject.code}) — ${subject.type}`
    : 'Subject: General IT';

  const typeInstructions = {
    notes: `Generate comprehensive, well-structured study notes on the topic. Use headings, bullet points, and examples. Cover key definitions, concepts, and applications.`,
    mcqs: `Generate 10 multiple-choice questions (MCQs) with 4 options each. Mark the correct answer. Include a brief explanation for each answer. Format clearly.`,
    important_questions: `Generate a list of 15 important questions likely to appear in B.Tech exams on this topic. Include a mix of short-answer and long-answer questions. Label marks (2M / 5M / 10M).`,
    revision: `Create a concise revision guide for last-minute preparation. Include key formulas, definitions, mnemonics, and the most frequently tested points. Keep it brief but comprehensive.`,
    summary: `Write a crisp academic summary of the topic. Cover the core concepts, significance, and real-world applications in no more than 500 words.`,
  };

  return (
    `You are an AI academic content generator for B.Tech IT students at VJIT.\n` +
    `${subjectCtx}\n` +
    `Topic: ${topic}\n\n` +
    `Task: ${typeInstructions[type]}\n\n` +
    `Provide accurate, exam-focused content appropriate for engineering students.`
  );
};

const generateStudyMaterial = async (studentId, { subjectId, type, topic }) => {
  if (!STUDY_MATERIAL_TYPES.includes(type)) {
    throw AppError.badRequest(`Invalid type. Must be one of: ${STUDY_MATERIAL_TYPES.join(', ')}`);
  }
  if (!topic || !topic.trim()) throw AppError.badRequest('Topic is required');

  let subject = null;
  if (subjectId) {
    subject = await Subject.findById(subjectId).select('name code type');
    if (!subject) throw AppError.notFound('Subject not found');
  }

  const prompt = buildStudyMaterialPrompt(type, subject, topic);

  try {
    const content = await callOpenRouter(
      [{ role: 'user', content: prompt }],
      config.openRouter.defaultModel
    );
    return content;
  } catch (err) {
    logger.error(`OpenRouter error in generateStudyMaterial: ${err.message}`);
    throw AppError.internal('Failed to generate study material. Please try again.');
  }
};

module.exports = {
  startConversation,
  sendMessage,
  getConversations,
  getConversation,
  deleteConversation,
  generateStudyMaterial,
};

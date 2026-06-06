'use strict';

const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    options: {
      type: [String],
      validate: { validator: (v) => v.length === 4, message: 'Each question must have exactly 4 options' },
      required: true,
    },
    correctAnswer: { type: Number, required: true, min: 0, max: 3 },
    marks: { type: Number, default: 1, min: 0 },
    explanation: { type: String },
  },
  { _id: false }
);

const quizSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    questions: [questionSchema],
    duration: { type: Number, default: 30 }, // minutes
    startTime: { type: Date },
    endTime: { type: Date },
    status: { type: String, enum: ['draft', 'published', 'closed'], default: 'draft', index: true },
    allowedAttempts: { type: Number, default: 1 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

quizSchema.index({ subject: 1, status: 1 });
quizSchema.index({ faculty: 1 });

quizSchema.virtual('totalMarks').get(function () {
  return this.questions.reduce((sum, q) => sum + (q.marks || 1), 0);
});

quizSchema.set('toJSON', { virtuals: true });
quizSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Quiz', quizSchema);

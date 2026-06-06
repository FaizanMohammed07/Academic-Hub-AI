const mongoose = require('mongoose');

const submissionSchema = new mongoose.Schema({
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  submittedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

  fileUrls: [String],
  fileMetadata: [{
    originalName: String,
    mimeType:     String,
    sizeBytes:    Number,
    s3Key:        String,
  }],
  extractedText: { type: String, select: false }, // text extracted from PDF for AI analysis

  studentTopic:   String, // the topic set label assigned to this student
  studentQuestions: [String],

  status: {
    type: String,
    enum: ['submitted', 'under_review', 'graded', 'rejected', 'resubmit_requested'],
    default: 'submitted',
    index: true,
  },
  submittedAt:     { type: Date, default: Date.now },
  isLate:          { type: Boolean, default: false },
  resubmissionCount: { type: Number, default: 0 },

  evaluation: {
    evaluatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    evaluatedAt:   Date,
    marksAwarded:  Number,
    rubricScores:  [{ criterion: String, score: Number }],
    feedback:      String,
    internalRemarks: { type: String, select: false },
  },

  aiAnalysisId: { type: mongoose.Schema.Types.ObjectId, ref: 'AiAnalysis' },
}, { timestamps: true });

submissionSchema.index({ assignmentId: 1, studentId: 1 });
submissionSchema.index({ assignmentId: 1, status: 1 });
submissionSchema.index({ studentId: 1, createdAt: -1 });

module.exports = mongoose.model('Submission', submissionSchema);

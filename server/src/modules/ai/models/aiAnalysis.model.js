const mongoose = require('mongoose');

const aiAnalysisSchema = new mongoose.Schema({
  submissionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Submission', required: true, unique: true },
  studentId:    { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment' },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued',
    index: true,
  },
  scores: {
    originalityScore:   Number,
    understandingScore: Number,
    aiProbabilityScore: Number,
    qualityScore:       Number,
    overallScore:       Number,
  },
  details: {
    plagiarismMatches: [{
      peerIndex: Number,
      similarityPercent: Number,
      matchedSegments: [String],
    }],
    aiGeneratedProbability: Number,
    technicalAnalysis:      String,
    writingQualityAnalysis: String,
    relevanceAnalysis:      String,
    strengths:              [String],
    improvements:           [String],
  },
  rawPrompt:        { type: String, select: false },
  rawResponse:      { type: String, select: false },
  modelUsed:        String,
  processingTimeMs: Number,
  processedAt:      Date,
}, { timestamps: true });

aiAnalysisSchema.index({ submissionId: 1 });
aiAnalysisSchema.index({ studentId: 1 });

module.exports = mongoose.model('AiAnalysis', aiAnalysisSchema);

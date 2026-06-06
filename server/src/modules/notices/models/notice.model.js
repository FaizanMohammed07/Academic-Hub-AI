const mongoose = require('mongoose');

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    type: { type: String, enum: ['general', 'urgent', 'academic', 'event'], default: 'general' },
    targetRoles: {
      type: [String],
      enum: ['student', 'faculty', 'hod', 'all'],
      default: ['all'],
    },
    targetSemester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', default: null },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isPublished: { type: Boolean, default: false },
    publishedAt: { type: Date },
    expiresAt: { type: Date },
    attachmentUrl: { type: String },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

noticeSchema.index({ isPublished: 1, expiresAt: 1 });
noticeSchema.index({ postedBy: 1 });

module.exports = mongoose.model('Notice', noticeSchema);

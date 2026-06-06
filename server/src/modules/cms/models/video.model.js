const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    videoUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    type: { type: String, enum: ['s3', 'youtube'], required: true },
    duration: { type: String },
    category: {
      type: String,
      enum: ['achievements', 'events', 'labs', 'testimonials', 'other'],
      required: true,
    },
    isPublished: { type: Boolean, default: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Number, default: 0 },
    viewCount: { type: Number, default: 0 },
  },
  { timestamps: true }
);

videoSchema.index({ isPublished: 1, category: 1, order: 1 });

module.exports = mongoose.model('Video', videoSchema);

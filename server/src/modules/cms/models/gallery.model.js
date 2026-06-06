const mongoose = require('mongoose');

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    imageUrl: { type: String, required: true },
    thumbnailUrl: { type: String },
    category: {
      type: String,
      enum: ['events', 'labs', 'achievements', 'graduation', 'sports', 'hackathons', 'other'],
      required: true,
    },
    capturedAt: { type: Date },
    isPublished: { type: Boolean, default: true },
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

gallerySchema.index({ isPublished: 1, category: 1, order: 1 });

module.exports = mongoose.model('Gallery', gallerySchema);

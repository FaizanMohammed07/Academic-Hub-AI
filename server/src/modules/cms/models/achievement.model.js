const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['sih', 'hackathon', 'sports', 'academic', 'research', 'internship', 'placement', 'other'],
      required: true,
    },
    studentName: { type: String, required: true, trim: true },
    studentRoll: { type: String, trim: true },
    year: { type: Number, required: true },
    award: { type: String, trim: true },
    organizer: { type: String, trim: true },
    imageUrl: { type: String },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

achievementSchema.index({ isPublished: 1, type: 1, year: -1 });

module.exports = mongoose.model('Achievement', achievementSchema);

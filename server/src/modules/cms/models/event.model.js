const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String },
    type: {
      type: String,
      enum: ['seminar', 'workshop', 'hackathon', 'sports', 'cultural', 'other'],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    venue: { type: String, trim: true },
    registrationLink: { type: String },
    bannerUrl: { type: String },
    isPublished: { type: Boolean, default: true },
    targetRoles: { type: [String], enum: ['all', 'student', 'faculty'], default: ['all'] },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

eventSchema.index({ isPublished: 1, startDate: -1 });

module.exports = mongoose.model('Event', eventSchema);

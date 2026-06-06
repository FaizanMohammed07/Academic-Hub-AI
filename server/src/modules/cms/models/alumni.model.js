const mongoose = require('mongoose');

const alumniSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    batch: { type: String, required: true, trim: true },
    company: { type: String, trim: true },
    role: { type: String, trim: true },
    location: { type: String, trim: true },
    linkedinUrl: { type: String },
    photo: { type: String },
    testimonial: { type: String },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

alumniSchema.index({ isPublished: 1, batch: -1 });

module.exports = mongoose.model('Alumni', alumniSchema);

const mongoose = require('mongoose');

const placementSchema = new mongoose.Schema(
  {
    studentName: { type: String, required: true, trim: true },
    rollNumber: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    role: { type: String, required: true, trim: true },
    package: { type: Number, required: true },
    year: { type: Number, required: true },
    batch: { type: String, trim: true },
    type: { type: String, enum: ['placement', 'internship', 'both'], required: true },
    studentPhoto: { type: String },
    companyLogo: { type: String },
    isPublished: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

placementSchema.index({ isPublished: 1, year: -1 });

module.exports = mongoose.model('Placement', placementSchema);

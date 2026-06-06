const mongoose = require('mongoose');

const certificateSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    type: {
      type: String,
      enum: ['course_completion', 'achievement', 'participation', 'merit', 'internship', 'placement'],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    issueDate: { type: Date, required: true },
    issuedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    certificateUrl: { type: String, required: true },
    verificationCode: { type: String, required: true, unique: true },
    metadata: { type: mongoose.Schema.Types.Mixed },
    isRevoked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

certificateSchema.index({ student: 1 });

module.exports = mongoose.model('Certificate', certificateSchema);

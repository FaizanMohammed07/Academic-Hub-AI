const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    rollNumber: { type: String, required: true, trim: true },
    enrolledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    enrolledAt: { type: Date, default: Date.now },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

enrollmentSchema.index({ student: 1, semester: 1 }, { unique: true });
enrollmentSchema.index({ semester: 1 });
enrollmentSchema.index({ student: 1 });

module.exports = mongoose.model('Enrollment', enrollmentSchema);

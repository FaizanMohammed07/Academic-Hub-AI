const mongoose = require('mongoose');

const semesterSchema = new mongoose.Schema(
  {
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    number: { type: Number, required: true, min: 1, max: 8 },
    name: { type: String, required: true, trim: true },
    section: { type: String, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false },
    studentCount: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

semesterSchema.index({ academicYear: 1, number: 1, section: 1 }, { unique: true });
semesterSchema.index({ isCurrent: 1 });

module.exports = mongoose.model('Semester', semesterSchema);

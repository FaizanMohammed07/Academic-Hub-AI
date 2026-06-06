const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    name: { type: String, required: true, trim: true },
    credits: { type: Number, required: true },
    type: { type: String, enum: ['theory', 'lab', 'elective'], required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    syllabus: { type: String },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  },
  { timestamps: true }
);

subjectSchema.index({ semester: 1 });

module.exports = mongoose.model('Subject', subjectSchema);

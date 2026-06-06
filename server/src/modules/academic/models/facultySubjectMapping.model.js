const mongoose = require('mongoose');

const facultySubjectMappingSchema = new mongoose.Schema(
  {
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    assignedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

facultySubjectMappingSchema.index({ faculty: 1, subject: 1, semester: 1 }, { unique: true });

module.exports = mongoose.model('FacultySubjectMapping', facultySubjectMappingSchema);

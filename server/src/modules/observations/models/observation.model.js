const mongoose = require('mongoose');

const observationSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    experimentNumber: { type: Number, required: true },
    experimentTitle: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    aim: { type: String },
    procedure: { type: String },
    result: { type: String },
    inference: { type: String },
    marks: { type: Number },
    maxMarks: { type: Number, default: 10 },
    remarks: { type: String },
    status: { type: String, enum: ['pending', 'submitted', 'evaluated'], default: 'pending' },
    submittedAt: { type: Date },
    evaluatedAt: { type: Date },
  },
  { timestamps: true }
);

observationSchema.index({ student: 1, subject: 1 });
observationSchema.index({ faculty: 1 });
observationSchema.index({ semester: 1 });

module.exports = mongoose.model('Observation', observationSchema);

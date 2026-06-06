const mongoose = require('mongoose');

const slotSchema = new mongoose.Schema(
  {
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'], required: true },
    periodNumber: { type: Number, required: true, min: 1, max: 8 },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    faculty: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    room: { type: String, trim: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    type: { type: String, enum: ['lecture', 'lab', 'tutorial'], required: true },
  },
  { _id: false }
);

const timetableSchema = new mongoose.Schema(
  {
    semester: { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
    academicYear: { type: mongoose.Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    section: { type: String, trim: true },
    effectiveFrom: { type: Date, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    isActive: { type: Boolean, default: true },
    slots: [slotSchema],
  },
  { timestamps: true }
);

timetableSchema.index({ semester: 1, isActive: 1 });

module.exports = mongoose.model('Timetable', timetableSchema);

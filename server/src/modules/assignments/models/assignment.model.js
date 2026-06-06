const mongoose = require('mongoose');

const rubricItemSchema = new mongoose.Schema({
  criterion:   { type: String, required: true },
  maxScore:    { type: Number, required: true },
  description: String,
}, { _id: false });

const assignmentSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  type: {
    type: String,
    enum: ['assignment1', 'assignment2', 'lab_observation', 'record', 'tutorial', 'mini_project'],
    required: true,
  },
  description:    String,
  subjectId:      { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  semesterId:     { type: mongoose.Schema.Types.ObjectId, ref: 'Semester', required: true },
  createdBy:      { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sections:       [String],
  deadline:       { type: Date, required: true },
  gracePeriodMinutes: { type: Number, default: 0 },
  maxMarks:       { type: Number, required: true },
  instructions:   String,
  attachmentUrls: [String],
  rubric:         [rubricItemSchema],
  antiCopyEnabled:   { type: Boolean, default: true },
  allowResubmission: { type: Boolean, default: false },
  status: {
    type: String,
    enum: ['draft', 'published', 'closed'],
    default: 'draft',
    index: true,
  },
  publishedAt: Date,
  closedAt:    Date,
}, { timestamps: true });

assignmentSchema.index({ subjectId: 1, semesterId: 1 });
assignmentSchema.index({ createdBy: 1 });
assignmentSchema.index({ deadline: 1 });

assignmentSchema.virtual('isExpired').get(function () {
  const cutoff = new Date(this.deadline.getTime() + this.gracePeriodMinutes * 60 * 1000);
  return new Date() > cutoff;
});

module.exports = mongoose.model('Assignment', assignmentSchema);

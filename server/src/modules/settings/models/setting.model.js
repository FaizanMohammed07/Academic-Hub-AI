const mongoose = require('mongoose');

const settingSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, trim: true },
    value: { type: mongoose.Schema.Types.Mixed, required: true },
    description: { type: String },
    category: {
      type: String,
      enum: ['general', 'ai', 'notifications', 'security', 'academic'],
      default: 'general',
    },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

settingSchema.index({ category: 1 });

const Setting = mongoose.model('Setting', settingSchema);

async function seedDefaults() {
  const defaults = [
    {
      key: 'app.name',
      value: 'VJIT IT Academic Hub',
      description: 'Application display name',
      category: 'general',
    },
    {
      key: 'app.contactEmail',
      value: 'admin@vjit.ac.in',
      description: 'Primary contact email for the department',
      category: 'general',
    },
    {
      key: 'app.maxFileUploadMB',
      value: 10,
      description: 'Maximum file upload size in megabytes',
      category: 'general',
    },
    {
      key: 'ai.enabled',
      value: true,
      description: 'Enable or disable AI learning assistant',
      category: 'ai',
    },
    {
      key: 'ai.maxTokensPerSession',
      value: 4000,
      description: 'Maximum tokens allowed per AI conversation session',
      category: 'ai',
    },
    {
      key: 'ai.model',
      value: 'claude-sonnet-4-5',
      description: 'AI model to use for the learning assistant',
      category: 'ai',
    },
    {
      key: 'notifications.emailEnabled',
      value: false,
      description: 'Enable email notifications',
      category: 'notifications',
    },
    {
      key: 'notifications.inAppEnabled',
      value: true,
      description: 'Enable in-app notifications',
      category: 'notifications',
    },
    {
      key: 'security.sessionTimeoutMinutes',
      value: 60,
      description: 'Session timeout in minutes',
      category: 'security',
    },
    {
      key: 'security.maxLoginAttempts',
      value: 5,
      description: 'Maximum failed login attempts before lockout',
      category: 'security',
    },
    {
      key: 'academic.gradingScale',
      value: { A: 90, B: 75, C: 60, D: 45, F: 0 },
      description: 'Grading scale thresholds (percentage)',
      category: 'academic',
    },
    {
      key: 'academic.attendanceThreshold',
      value: 75,
      description: 'Minimum attendance percentage required',
      category: 'academic',
    },
    {
      key: 'academic.antiCopyEnabled',
      value: true,
      description: 'Enable anti-copy detection for submissions',
      category: 'academic',
    },
  ];

  for (const doc of defaults) {
    await Setting.updateOne({ key: doc.key }, { $setOnInsert: doc }, { upsert: true });
  }
}

module.exports = Setting;
module.exports.seedDefaults = seedDefaults;

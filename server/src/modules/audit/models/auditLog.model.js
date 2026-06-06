const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  userId:       { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  role:         String,
  action:       { type: String, required: true },
  resource:     String,
  resourceId:   mongoose.Schema.Types.ObjectId,
  details:      mongoose.Schema.Types.Mixed,
  ipAddress:    String,
  userAgent:    String,
  success:      { type: Boolean, default: true },
  errorMessage: String,
  timestamp:    { type: Date, default: Date.now },
});

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1 });
auditLogSchema.index({ timestamp: -1 }, { expireAfterSeconds: 60 * 60 * 24 * 365 }); // 1 year TTL

module.exports = mongoose.model('AuditLog', auditLogSchema);

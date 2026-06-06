const AuditLog = require('../../modules/audit/models/auditLog.model');

const auditAction = (action, resource) => async (req, _res, next) => {
  req.auditMeta = { action, resource };
  next();
};

const logAudit = async (req, payload = {}) => {
  if (!req.user) return;
  await AuditLog.create({
    userId: req.user._id,
    role: req.user.role,
    action: req.auditMeta?.action || 'unknown',
    resource: req.auditMeta?.resource,
    resourceId: payload.resourceId,
    details: payload.details,
    ipAddress: req.ip,
    userAgent: req.get('user-agent'),
    success: payload.success ?? true,
    errorMessage: payload.errorMessage,
  });
};

module.exports = { auditAction, logAudit };

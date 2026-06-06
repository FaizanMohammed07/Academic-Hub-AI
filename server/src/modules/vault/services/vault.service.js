'use strict';

const { v4: uuidv4 } = require('uuid');
const AppError = require('../../../shared/errors/AppError');
const Certificate = require('../models/certificate.model');
const Submission = require('../../submissions/models/submission.model');
const Enrollment = require('../../academic/models/enrollment.model');
const Notification = require('../../notifications/models/notification.model');

// ---------------------------------------------------------------------------
// getCertificates — all certs for a student, newest first
// ---------------------------------------------------------------------------

const getCertificates = async (studentId) => {
  return Certificate.find({ student: studentId })
    .sort({ issueDate: -1 })
    .populate('issuedBy', 'name email');
};

// ---------------------------------------------------------------------------
// getCertificateById
// ---------------------------------------------------------------------------

const getCertificateById = async (certificateId, studentId) => {
  const cert = await Certificate.findById(certificateId).populate('issuedBy', 'name email');
  if (!cert) throw AppError.notFound('Certificate not found');
  // students can only access their own; admin access is unrestricted (caller handles role check)
  if (studentId && cert.student.toString() !== studentId.toString()) {
    throw AppError.forbidden();
  }
  return cert;
};

// ---------------------------------------------------------------------------
// verifyCertificate — public, no auth
// ---------------------------------------------------------------------------

const verifyCertificate = async (verificationCode) => {
  const cert = await Certificate.findOne({ verificationCode })
    .populate('student', 'name email')
    .populate('issuedBy', 'name');
  if (!cert) throw AppError.notFound('Certificate not found or invalid verification code');
  if (cert.isRevoked) throw AppError.badRequest('This certificate has been revoked');
  return cert;
};

// ---------------------------------------------------------------------------
// generateCertificate — admin creates a certificate record
// ---------------------------------------------------------------------------

const generateCertificate = async ({ studentId, type, title, issuedBy, metadata }) => {
  const verificationCode = uuidv4().replace(/-/g, '').toUpperCase().slice(0, 16);

  // Placeholder URL — real implementation would generate PDF via PDFKit and upload to S3
  const certificateUrl = `https://vjit-it.ac.in/certificates/${verificationCode}.pdf`;

  const cert = await Certificate.create({
    student: studentId,
    type,
    title,
    issueDate: new Date(),
    issuedBy,
    certificateUrl,
    verificationCode,
    metadata: metadata || {},
  });

  // Notify the student
  try {
    await Notification.create({
      recipient: studentId,
      type: 'system',
      title: 'Certificate Issued',
      message: `Your certificate "${title}" has been issued. Verification code: ${verificationCode}`,
      data: { certificateId: cert._id, verificationCode },
      relatedEntity: { entityType: 'Certificate', entityId: cert._id },
    });
  } catch (_) {
    // notification failure must not break the response
  }

  return cert;
};

// ---------------------------------------------------------------------------
// getVaultSummary — student dashboard aggregate
// ---------------------------------------------------------------------------

const getVaultSummary = async (studentId) => {
  const [certificates, submissions, enrollments] = await Promise.all([
    Certificate.find({ student: studentId }).select('type issueDate title verificationCode'),
    Submission.find({ studentId }).select('evaluation.marksAwarded assignmentId status createdAt'),
    Enrollment.find({ student: studentId })
      .sort({ enrolledAt: -1 })
      .populate('semester', 'name year')
      .populate('academicYear', 'label'),
  ]);

  // Certificates by type
  const certsByType = certificates.reduce((acc, c) => {
    acc[c.type] = (acc[c.type] || 0) + 1;
    return acc;
  }, {});

  // Submission stats
  const gradedSubmissions = submissions.filter(
    (s) => s.evaluation && s.evaluation.marksAwarded != null
  );
  const totalMarks = gradedSubmissions.reduce(
    (sum, s) => sum + (s.evaluation.marksAwarded || 0),
    0
  );
  const avgMarks =
    gradedSubmissions.length > 0
      ? Math.round((totalMarks / gradedSubmissions.length) * 100) / 100
      : 0;

  // Simple achievement badges derived from data
  const achievements = [];
  if (gradedSubmissions.length >= 10) {
    achievements.push({ label: 'Consistent Submitter', description: 'Submitted 10+ assignments' });
  }
  if (certificates.length >= 1) {
    achievements.push({ label: 'Certified', description: 'Earned first certificate' });
  }
  if (avgMarks >= 85) {
    achievements.push({ label: 'High Achiever', description: 'Average marks above 85' });
  }

  return {
    certificates: {
      total: certificates.length,
      byType: certsByType,
      recent: certificates.slice(0, 3),
    },
    submissions: {
      total: submissions.length,
      graded: gradedSubmissions.length,
      avgMarks,
    },
    achievements,
    enrollmentHistory: enrollments,
  };
};

module.exports = {
  getCertificates,
  getCertificateById,
  verifyCertificate,
  generateCertificate,
  getVaultSummary,
};

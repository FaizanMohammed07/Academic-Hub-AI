'use strict';

const apiResponse = require('../../../shared/utils/apiResponse');
const AppError = require('../../../shared/errors/AppError');
const vaultService = require('../services/vault.service');

// ---------------------------------------------------------------------------
// getVaultSummary — student only
// ---------------------------------------------------------------------------

const getVaultSummary = async (req, res, next) => {
  try {
    const summary = await vaultService.getVaultSummary(req.user._id);
    return apiResponse.success(res, summary, 'Vault summary');
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// getCertificates — student only
// ---------------------------------------------------------------------------

const getCertificates = async (req, res, next) => {
  try {
    const certs = await vaultService.getCertificates(req.user._id);
    return apiResponse.success(res, certs, 'Certificates');
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// getCertificateById — student (own) or admin
// ---------------------------------------------------------------------------

const getCertificateById = async (req, res, next) => {
  try {
    // Admin may view any certificate; pass null studentId to skip ownership check
    const studentId = req.user.role === 'admin' ? null : req.user._id;
    const cert = await vaultService.getCertificateById(req.params.id, studentId);
    return apiResponse.success(res, cert, 'Certificate');
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// generateCertificate — admin only
// ---------------------------------------------------------------------------

const generateCertificate = async (req, res, next) => {
  try {
    const { studentId, type, title, metadata } = req.body;
    if (!studentId || !type || !title) {
      throw AppError.badRequest('studentId, type, and title are required');
    }
    const cert = await vaultService.generateCertificate({
      studentId,
      type,
      title,
      issuedBy: req.user._id,
      metadata,
    });
    return apiResponse.created(res, cert, 'Certificate generated');
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// verifyCertificate — public, no auth
// ---------------------------------------------------------------------------

const verifyCertificate = async (req, res, next) => {
  try {
    const cert = await vaultService.verifyCertificate(req.params.code);
    return apiResponse.success(res, cert, 'Certificate verified');
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getVaultSummary,
  getCertificates,
  getCertificateById,
  generateCertificate,
  verifyCertificate,
};

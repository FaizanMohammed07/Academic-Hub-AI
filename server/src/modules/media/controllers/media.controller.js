'use strict';

const config = require('../../../config');
const apiResponse = require('../../../shared/utils/apiResponse');
const AppError = require('../../../shared/errors/AppError');
const s3Service = require('../services/s3.service');

const ALLOWED_FOLDERS = [
  'assignments',
  'submissions',
  'certificates',
  'faculty',
  'hod',
  'gallery',
  'videos',
];

// Map folder to S3 bucket
const FOLDER_BUCKET_MAP = {
  assignments: 'assets',
  submissions: 'submissions',
  certificates: 'assets',
  faculty: 'assets',
  hod: 'assets',
  gallery: 'assets',
  videos: 'assets',
};

// ---------------------------------------------------------------------------
// getUploadUrl — authenticated (any role)
// ---------------------------------------------------------------------------

const getUploadUrl = async (req, res, next) => {
  try {
    const { fileName, fileType, folder, entityType, entityId } = req.body;

    if (!fileName || !fileType || !folder) {
      throw AppError.badRequest('fileName, fileType, and folder are required');
    }

    if (!ALLOWED_FOLDERS.includes(folder)) {
      throw AppError.badRequest(
        `Invalid folder. Allowed values: ${ALLOWED_FOLDERS.join(', ')}`
      );
    }

    // Build the S3 category path (e.g. "submissions/entityId" or just "gallery")
    const category = entityId ? `${folder}/${entityId}` : folder;
    const bucket = FOLDER_BUCKET_MAP[folder] || 'assets';

    const result = await s3Service.getPresignedUploadUrl({
      category,
      mimeType: fileType,
      fileName,
      bucket,
    });

    return apiResponse.success(
      res,
      {
        uploadUrl: result.uploadUrl,
        fields: result.fields,
        fileUrl: result.cdnUrl,
        key: result.s3Key,
      },
      'Upload URL generated'
    );
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// getDownloadUrl — faculty, hod, admin only
// ---------------------------------------------------------------------------

const getDownloadUrl = async (req, res, next) => {
  try {
    const { key } = req.body;
    if (!key) throw AppError.badRequest('key is required');

    const signedUrl = await s3Service.getPresignedDownloadUrl(key);

    return apiResponse.success(res, { downloadUrl: signedUrl }, 'Download URL generated');
  } catch (err) {
    next(err);
  }
};

// ---------------------------------------------------------------------------
// deleteFile — admin only
// ---------------------------------------------------------------------------

const deleteFile = async (req, res, next) => {
  try {
    const { key, bucket } = req.body;
    if (!key) throw AppError.badRequest('key is required');

    await s3Service.deleteObject(key, bucket || 'assets');

    return apiResponse.noContent(res);
  } catch (err) {
    next(err);
  }
};

module.exports = { getUploadUrl, getDownloadUrl, deleteFile };

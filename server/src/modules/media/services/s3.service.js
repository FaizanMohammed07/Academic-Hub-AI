const { S3Client, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const { createPresignedPost } = require('@aws-sdk/s3-presigned-post');
const { v4: uuidv4 } = require('uuid');
const config = require('../../../config');

const s3 = new S3Client({
  region: config.aws.region,
  credentials: {
    accessKeyId: config.aws.accessKeyId,
    secretAccessKey: config.aws.secretAccessKey,
  },
});

const BUCKET_MAP = {
  assets:      config.aws.buckets.assets,
  submissions: config.aws.buckets.submissions,
};

/**
 * Generate a presigned POST URL for direct browser → S3 upload.
 */
const getPresignedUploadUrl = async ({ category, mimeType, fileName, bucket = 'assets' }) => {
  const ext      = fileName.split('.').pop();
  const s3Key    = `${category}/${new Date().getFullYear()}/${uuidv4()}.${ext}`;
  const Bucket   = BUCKET_MAP[bucket];

  const { url, fields } = await createPresignedPost(s3, {
    Bucket,
    Key:    s3Key,
    Conditions: [
      { 'Content-Type': mimeType },
      ['content-length-range', 0, config.upload.maxFileSizeMB * 1024 * 1024],
    ],
    Fields: { 'Content-Type': mimeType },
    Expires: 300, // 5 min
  });

  const cdnUrl = `${config.aws.cloudFrontDomain}/${s3Key}`;
  return { uploadUrl: url, fields, s3Key, cdnUrl, bucket: Bucket };
};

/**
 * Generate a presigned GET URL for private submission files.
 */
const getPresignedDownloadUrl = async (s3Key, expiresIn = 3600) => {
  const cmd = new GetObjectCommand({ Bucket: BUCKET_MAP.submissions, Key: s3Key });
  return getSignedUrl(s3, cmd, { expiresIn });
};

const deleteObject = async (s3Key, bucket = 'assets') => {
  await s3.send(new DeleteObjectCommand({ Bucket: BUCKET_MAP[bucket], Key: s3Key }));
};

module.exports = { getPresignedUploadUrl, getPresignedDownloadUrl, deleteObject };

module.exports = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',

  mongo: {
    uri: process.env.MONGO_URI,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  },

  aws: {
    region: process.env.AWS_REGION || 'ap-south-1',
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    buckets: {
      assets: process.env.AWS_S3_ASSETS_BUCKET,
      submissions: process.env.AWS_S3_SUBMISSIONS_BUCKET,
    },
    cloudFrontDomain: process.env.AWS_CLOUDFRONT_DOMAIN,
  },

  email: {
    from: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME,
    smtp: {
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT, 10) || 587,
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  },

  openRouter: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseUrl: process.env.OPENROUTER_BASE_URL || 'https://openrouter.ai/api/v1',
    defaultModel: process.env.OPENROUTER_DEFAULT_MODEL || 'openai/gpt-4o-mini',
    analysisModel: process.env.OPENROUTER_ANALYSIS_MODEL || 'openai/gpt-4o',
    questionModel: process.env.OPENROUTER_QUESTION_MODEL || 'openai/gpt-4o',
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 60_000,
    max: parseInt(process.env.RATE_LIMIT_MAX, 10) || 300,
    authMax: parseInt(process.env.RATE_LIMIT_AUTH_MAX, 10) || 10,
    aiMax: parseInt(process.env.RATE_LIMIT_AI_MAX, 10) || 20,
  },

  upload: {
    maxFileSizeMB: parseInt(process.env.MAX_FILE_SIZE_MB, 10) || 50,
    allowedTypes: (process.env.ALLOWED_FILE_TYPES || '').split(','),
  },
};

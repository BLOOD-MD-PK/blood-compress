const path = require('path');

module.exports = {
  APP_NAME: 'BloodCompress',
  VERSION: '1.0.0',

  PORT: process.env.PORT || 3000,

  MAX_FILE_SIZE: 20 * 1024 * 1024, // 20 MB

  ALLOWED_EXTENSIONS: [
    '.png',
    '.jpg',
    '.jpeg',
    '.webp'
  ],

  ALLOWED_MIME_TYPES: [
    'image/png',
    'image/jpeg',
    'image/webp'
  ],

  QUALITY_MAP: {
    high: 85,
    medium: 65,
    low: 40
  },

  DEFAULT_OUTPUT_FORMAT: 'webp',

  PATHS: {
    PUBLIC: path.join(__dirname, '../../public'),
    UPLOADS: path.join(__dirname, '../../uploads'),
    OUTPUTS: path.join(__dirname, '../../outputs'),
    TEMP: path.join(__dirname, '../../temp')
  },

  TEMP_FILE_MAX_AGE_MS: 30 * 60 * 1000,

  API: {
    PREFIX: '/api/v1'
  }
};
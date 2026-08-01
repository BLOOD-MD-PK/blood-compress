module.exports = {
  PORT: process.env.PORT || 3000,

  MAX_FILE_SIZE: 20 * 1024 * 1024,

  ALLOWED_EXTENSIONS: [
    ".png",
    ".jpg",
    ".jpeg",
    ".webp",
  ],

  ALLOWED_MIME_TYPES: [
    "image/png",
    "image/jpeg",
    "image/webp",
  ],

  QUALITY_MAP: {
    high: 85,
    medium: 65,
    low: 40,
  },
};

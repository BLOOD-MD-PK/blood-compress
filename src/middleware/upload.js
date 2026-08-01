const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const config = require('../config/config');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, config.PATHS.UPLOADS);
  },

  filename(req, file, cb) {
    const uniqueId = crypto.randomBytes(16).toString('hex');
    const extension = path.extname(file.originalname).toLowerCase();

    cb(null, `upload_${Date.now()}_${uniqueId}${extension}`);
  },
});

function fileFilter(req, file, cb) {
  if (!file || !file.originalname) {
    return cb(new Error('No file received.'), false);
  }

  const extension = path.extname(file.originalname).toLowerCase();

  const extensionAllowed =
    config.ALLOWED_EXTENSIONS.includes(extension);

  const mimeAllowed =
    config.ALLOWED_MIME_TYPES.includes(file.mimetype);

  if (!extensionAllowed || !mimeAllowed) {
    const error = new Error(
      'Only PNG, JPG, JPEG and WEBP images are allowed.'
    );

    error.status = 400;

    return cb(error, false);
  }

  cb(null, true);
}

const upload = multer({
  storage,

  limits: {
    fileSize: config.MAX_FILE_SIZE,
    files: 1,
  },

  fileFilter,
});

module.exports = upload;
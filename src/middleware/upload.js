const multer = require("multer");
const path = require("path");
const config = require("../config/config");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();

  if (
    config.ALLOWED_EXTENSIONS.includes(ext) &&
    config.ALLOWED_MIME_TYPES.includes(file.mimetype)
  ) {
    return cb(null, true);
  }

  cb(new Error("Only PNG, JPG, JPEG and WEBP files are allowed."));
};

module.exports = multer({
  storage,
  limits: {
    fileSize: config.MAX_FILE_SIZE,
  },
  fileFilter,
});

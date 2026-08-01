const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const imageController = require('../controllers/imageController');

// POST /api/v1/images/compress
router.post('/compress', upload.single('image'), (req, res, next) => {
  imageController.compressImage(req, res, next);
});

// GET /api/v1/images/download/:filename
router.get('/download/:filename', (req, res, next) => {
  imageController.downloadImage(req, res, next);
});

module.exports = router;

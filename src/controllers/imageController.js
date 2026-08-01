const path = require('path');
const fs = require('fs');

const imageService = require('../services/imageService');
const fileHelper = require('../utils/fileHelper');
const config = require('../config/config');

class ImageController {
  /**
   * Compress / Convert Image
   */
  async compressImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: 'No image uploaded.',
        });
      }

      const {
        format,
        quality,
      } = req.body;

      const result = await imageService.processImage(
        req.file,
        {
          format,
          quality,
        }
      );

      // Delete uploaded temporary file
      fileHelper.removeFile(req.file.path);

      return res.status(200).json({
        success: true,
        message: 'Image processed successfully.',
        data: result,
      });

    } catch (error) {

      if (req.file?.path) {
        fileHelper.removeFile(req.file.path);
      }

      next(error);
    }
  }

  /**
   * Download Processed Image
   */
  async downloadImage(req, res, next) {
    try {

      const filename = path.basename(req.params.filename);

      const filePath = path.join(
        config.PATHS.OUTPUTS,
        filename
      );

      if (!fs.existsSync(filePath)) {
        return res.status(404).json({
          success: false,
          error: 'File not found or expired.',
        });
      }

      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${filename}"`
      );

      return res.download(filePath, filename, (err) => {
        if (err) {
          console.error(err);
        }
      });

    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ImageController();
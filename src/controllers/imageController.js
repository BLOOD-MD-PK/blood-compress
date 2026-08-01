const imageService = require("../services/imageService");

class ImageController {
  /**
   * Compress & Convert Image
   */
  async compressImage(req, res, next) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: "No image uploaded.",
        });
      }

      const { format, quality } = req.body;

      const result = await imageService.processImage(req.file, {
        format,
        quality,
      });

      // Browser ko direct file download karwa do
      res.set({
        "Content-Type": result.mimetype,
        "Content-Disposition": `attachment; filename="${result.filename}"`,
        "Content-Length": result.buffer.length,
        "Cache-Control": "no-store",
      });

      return res.send(result.buffer);
    } catch (err) {
      next(err);
    }
  }

  /**
   * Download Route (Memory Version)
   */
  async downloadImage(req, res) {
    return res.status(410).json({
      success: false,
      error:
        "Direct download route is no longer available. Download starts immediately after compression.",
    });
  }
}

module.exports = new ImageController();

const sharp = require("sharp");

class ImageService {
  async processImage(file, options = {}) {
    const format = (options.format || "jpg").toLowerCase();
    const quality = (options.quality || "high").toLowerCase();

    let image = sharp(file.buffer);

    let qualityValue = 85;

    switch (quality) {
      case "low":
        qualityValue = 40;
        break;
      case "medium":
        qualityValue = 65;
        break;
      case "high":
      default:
        qualityValue = 85;
        break;
    }

    let outputBuffer;

    switch (format) {
      case "png":
        outputBuffer = await image
          .png({
            quality: qualityValue,
            compressionLevel: 9,
          })
          .toBuffer();
        break;

      case "webp":
        outputBuffer = await image
          .webp({
            quality: qualityValue,
          })
          .toBuffer();
        break;

      case "jpeg":
      case "jpg":
      default:
        outputBuffer = await image
          .jpeg({
            quality: qualityValue,
            mozjpeg: true,
          })
          .toBuffer();
        break;
    }

    const metadata = await sharp(outputBuffer).metadata();

    return {
      buffer: outputBuffer,
      filename:
        file.originalname.replace(/\.[^/.]+$/, "") + "." + format,
      mimetype:
        format === "png"
          ? "image/png"
          : format === "webp"
          ? "image/webp"
          : "image/jpeg",

      stats: {
        originalSize: file.size,
        compressedSize: outputBuffer.length,
        savedBytes: file.size - outputBuffer.length,
        compressionRatio: Number(
          (
            ((file.size - outputBuffer.length) / file.size) *
            100
          ).toFixed(1)
        ),
      },

      dimensions: {
        width: metadata.width,
        height: metadata.height,
      },
    };
  }
}

module.exports = new ImageService();

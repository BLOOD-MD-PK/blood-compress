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
            compressionLevel: 9,
            palette: true,
          })
          .toBuffer();
        break;

      case "webp":
        outputBuffer = await image
          .webp({
            quality: qualityValue,
            effort: 6,
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
            progressive: true,
          })
          .toBuffer();
        break;
    }

    // Agar compressed image original se badi ho to original hi return karo
    if (outputBuffer.length >= file.size) {
      outputBuffer = file.buffer;
    }

    const metadata = await sharp(outputBuffer).metadata();

    const savedBytes = Math.max(0, file.size - outputBuffer.length);

    const compressionRatio =
      file.size > outputBuffer.length
        ? Number(
            (
              ((file.size - outputBuffer.length) / file.size) *
              100
            ).toFixed(1)
          )
        : 0;

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
        savedBytes,
        compressionRatio,
      },

      dimensions: {
        width: metadata.width,
        height: metadata.height,
      },
    };
  }
}

module.exports = new ImageService();

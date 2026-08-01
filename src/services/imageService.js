const sharp = require('sharp');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');

const config = require('../config/config');

class ImageService {
  async processImage(file, options = {}) {
    if (!file) {
      throw new Error('Image file is required.');
    }

    const targetFormat = (
      options.format ||
      config.DEFAULT_OUTPUT_FORMAT
    ).toLowerCase();

    const qualityLevel = (
      options.quality ||
      'medium'
    ).toLowerCase();

    if (
      !['jpg', 'jpeg', 'png', 'webp'].includes(targetFormat)
    ) {
      throw new Error('Unsupported output format.');
    }

    const quality =
      config.QUALITY_MAP[qualityLevel] ||
      config.QUALITY_MAP.medium;

    const uniqueId = crypto.randomBytes(12).toString('hex');

    const extension =
      targetFormat === 'jpeg'
        ? 'jpg'
        : targetFormat;

    const outputFilename = `compressed_${uniqueId}.${extension}`;

    const outputPath = path.join(
      config.PATHS.OUTPUTS,
      outputFilename
    );

    let pipeline = sharp(file.path).rotate();

    switch (targetFormat) {
      case 'png':
        pipeline = pipeline.png({
          quality,
          compressionLevel:
            qualityLevel === 'high'
              ? 6
              : qualityLevel === 'medium'
              ? 8
              : 9,
          palette: true,
        });
        break;

      case 'webp':
        pipeline = pipeline.webp({
          quality,
          effort: 6,
        });
        break;

      default:
        pipeline = pipeline.jpeg({
          quality,
          mozjpeg: true,
          progressive: true,
        });
    }

    await pipeline.toFile(outputPath);

    const originalStats = fs.statSync(file.path);
    const outputStats = fs.statSync(outputPath);

    const metadata = await sharp(outputPath).metadata();

    const originalSize = originalStats.size;
    const compressedSize = outputStats.size;

    const savedBytes = Math.max(
      0,
      originalSize - compressedSize
    );

    const compressionRatio =
      originalSize === 0
        ? 0
        : Number(
            (
              (savedBytes / originalSize) *
              100
            ).toFixed(1)
          );

    return {
      filename: outputFilename,

      downloadPath: `/api/v1/images/download/${outputFilename}`,

      format: extension,

      quality: qualityLevel,

      dimensions: {
        width: metadata.width,
        height: metadata.height,
      },

      stats: {
        originalSize,
        compressedSize,
        savedBytes,
        compressionRatio,
      },
    };
  }
}

module.exports = new ImageService();
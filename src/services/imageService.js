const originalSize = originalStats.size;
const compressedSize = compressedStats.size;

// Agar compressed file badi ho to original hi use karo
if (compressedSize >= originalSize) {
  fs.copyFileSync(file.path, outputPath);

  return {
    filename: outputFilename,
    downloadPath: `/api/v1/images/download/${outputFilename}`,
    format: targetFormat,
    quality: qualityLevel,
    dimensions: {
      width: metadata.width,
      height: metadata.height,
    },
    stats: {
      originalSize,
      compressedSize: originalSize,
      savedBytes: 0,
      compressionRatio: 0,
    },
  };
}

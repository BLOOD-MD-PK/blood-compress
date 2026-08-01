const fs = require('fs');
const path = require('path');

const config = require('../config/config');

/**
 * Create required directories if they do not exist.
 */
function ensureDirectories() {
  Object.values(config.PATHS).forEach((dir) => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
}

/**
 * Safely remove a file.
 */
function removeFile(filePath) {
  if (!filePath) return;

  fs.unlink(filePath, (err) => {
    if (err && err.code !== 'ENOENT') {
      console.error(`Failed to remove file: ${filePath}`);
    }
  });
}

/**
 * Delete expired files.
 */
function cleanTempDirectories() {
  const now = Date.now();

  const folders = [
    config.PATHS.UPLOADS,
    config.PATHS.OUTPUTS,
    config.PATHS.TEMP,
  ];

  folders.forEach((folder) => {
    fs.readdir(folder, (err, files) => {
      if (err) return;

      files.forEach((file) => {
        if (file === '.gitkeep') return;

        const filePath = path.join(folder, file);

        fs.stat(filePath, (err, stats) => {
          if (err) return;

          const age = now - stats.mtimeMs;

          if (age > config.TEMP_FILE_MAX_AGE_MS) {
            fs.unlink(filePath, () => {});
          }
        });
      });
    });
  });
}

/**
 * Run cleanup immediately.
 */
function cleanTempDirectoriesOnStart() {
  cleanTempDirectories();
}

/**
 * Run cleanup every 30 minutes.
 */
function scheduleCleanup() {
  setInterval(() => {
    cleanTempDirectories();
  }, config.TEMP_FILE_MAX_AGE_MS);
}

/**
 * Convert bytes into readable format.
 */
function formatBytes(bytes) {
  if (!bytes) return '0 Bytes';

  const units = ['Bytes', 'KB', 'MB', 'GB'];

  let size = bytes;
  let index = 0;

  while (size >= 1024 && index < units.length - 1) {
    size /= 1024;
    index++;
  }

  return `${size.toFixed(2)} ${units[index]}`;
}

module.exports = {
  ensureDirectories,
  removeFile,
  cleanTempDirectoriesOnStart,
  scheduleCleanup,
  formatBytes,
};
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const config = require('./src/config/config');
const imageRoutes = require('./src/routes/imageRoutes');

const {
  ensureDirectories,
  cleanTempDirectoriesOnStart,
  scheduleCleanup,
} = require('./src/utils/fileHelper');

const app = express();

// Hide Express information
app.disable('x-powered-by');

// Create required directories
ensureDirectories();

// Clean old temporary files on startup
cleanTempDirectoriesOnStart();

// Automatically clean old files
scheduleCleanup();

// Security
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: [
          "'self'",
          "'unsafe-inline'",
          "https://fonts.googleapis.com",
        ],
        fontSrc: [
          "'self'",
          "https://fonts.gstatic.com",
        ],
        imgSrc: [
          "'self'",
          "data:",
          "blob:",
        ],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
      },
    },
  })
);

// Middleware
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/outputs', express.static(path.join(__dirname, 'outputs')));

// API Routes
app.use('/api/v1/images', imageRoutes);

// Health Check
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'ok',
    service: config.APP_NAME,
    version: config.VERSION,
    timestamp: new Date().toISOString(),
  });
});

// Frontend Route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack || err);

  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      error: `Maximum file size is ${
        config.MAX_FILE_SIZE / (1024 * 1024)
      }MB`,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || 'Internal Server Error',
  });
});

const PORT = config.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log('=========================================');
  console.log(`🚀 ${config.APP_NAME} Started`);
  console.log(`📦 Version : ${config.VERSION}`);
  console.log(`🌐 URL : http://localhost:${PORT}`);
  console.log('=========================================');
});

// Graceful Shutdown
function shutdown(signal) {
  console.log(`\n${signal} received. Shutting down server...`);

  server.close(() => {
    console.log('✅ Server stopped successfully.');
    process.exit(0);
  });
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
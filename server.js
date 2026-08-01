const express = require("express");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const config = require("./src/config/config");
const imageRoutes = require("./src/routes/imageRoutes");

const app = express();

app.disable("x-powered-by");

app.use(
  helmet({
    contentSecurityPolicy: false,
  })
);

app.use(cors());
app.use(morgan("dev"));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static Frontend
app.use(express.static(path.join(__dirname, "public")));

// API
app.use("/api/v1/images", imageRoutes);

// Health Check
app.get("/api/v1/health", (req, res) => {
  res.json({
    success: true,
    service: "BloodCompress",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
  });
});

// Frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// Error Handler
app.use((err, req, res, next) => {

  console.error(err);

  if (err.code === "LIMIT_FILE_SIZE") {
    return res.status(400).json({
      success: false,
      error: `Maximum file size is ${
        config.MAX_FILE_SIZE / 1024 / 1024
      }MB`,
    });
  }

  res.status(err.status || 500).json({
    success: false,
    error: err.message || "Internal Server Error",
  });

});

const PORT = config.PORT || 3000;

if (process.env.VERCEL !== "1") {

  app.listen(PORT, () => {

    console.log("================================");
    console.log("BloodCompress Started");
    console.log(`http://localhost:${PORT}`);
    console.log("================================");

  });

}

module.exports = app;

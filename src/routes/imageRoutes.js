const express = require("express");

const router = express.Router();

const upload = require("../middleware/upload");

const imageController = require("../controllers/imageController");

router.post(
  "/compress",
  upload.single("image"),
  imageController.compressImage
);

module.exports = router;

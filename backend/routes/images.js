const express = require("express");
const multer = require("multer");
const protect = require("../middlewares/auth");
const rateLimit = require("../middlewares/rateLimit");
const idempotency = require("../middlewares/idempotency");
const {
  uploadImage,
  getImages,
  getImageById,
  deleteImage,
  getLabels,
} = require("../controllers/imageController");

const router = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post(
  "/",
  protect,
  rateLimit,
  idempotency,
  upload.single("file"),
  uploadImage
);
router.get("/", protect, rateLimit, getImages);
router.get("/:id", protect, rateLimit, getImageById);
router.delete("/:id", protect, rateLimit, deleteImage);

module.exports = router;

const fs = require("fs");
const Image = require("../models/Image");
const { generateHash } = require("../utils/hash");
const { detectPPE } = require("../utils/ppeDetection");
const cloudinary = require("../utils/cloudinary");

// Convert buffer → upload stream
const streamUpload = (buffer) => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "ppe_detection_uploads", resource_type: "image" },
      (error, result) => {
        if (result) resolve(result);
        else reject(error);
      }
    );
    stream.end(buffer);
  });
};

// POST /api/images
exports.uploadImage = async (req, res) => {
  console.log(
    `[Image Upload] ${req.method} ${req.originalUrl} - User: ${req.user?._id} - File: ${req.file?.originalname}`
  );

  try {
    const { file } = req;
    const idempotencyKey = req.headers["idempotency-key"];

    if (!file)
      return res.status(400).json({
        error: {
          code: "FIELD_REQUIRED",
          field: "file",
          message: "Image is required",
        },
      });

    // Check for idempotency
    if (idempotencyKey) {
      const existing = await Image.findOne({
        idempotencyKey,
        userId: req.user._id,
      });
      if (existing) return res.json(existing);
    }

    // Generate hash from buffer
    const originalFileHash = generateHash(file.buffer);

    // Check duplicate
    const duplicate = await Image.findOne({
      originalFileHash,
      userId: req.user._id,
    });
    if (duplicate) return res.json(duplicate);

    // Stream upload to Cloudinary
    const uploadResult = await streamUpload(file.buffer);

    // Detect PPE
    const detections = await detectPPE(uploadResult.secure_url);
    const detections_hash = generateHash(JSON.stringify(detections));

    // Save to DB
    const newImage = await Image.create({
      userId: req.user._id,
      fileUrl: uploadResult.secure_url,
      detections,
      detections_hash,
      originalFileHash,
      idempotencyKey,
    });

    res.status(201).json(newImage);
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: { code: "SERVER_ERROR", message: err.message } });
  }
};

// GET /api/images
exports.getImages = async (req, res) => {
  console.log(
    `[Get Images] ${req.method} ${req.originalUrl} - User: ${req.user?._id} - Query:`,
    req.query
  );

  const { limit = 10, offset = 0, label, from, to } = req.query;
  const filter = { userId: req.user._id };

  if (label) filter["detections.label"] = label;
  if (from || to) filter.uploadedAt = {};
  if (from) filter.uploadedAt.$gte = new Date(from);
  if (to) filter.uploadedAt.$lte = new Date(to);

  const items = await Image.find(filter)
    .sort({ uploadedAt: -1 }) // sort by newest first
    .skip(Number(offset))
    .limit(Number(limit));

  const next_offset =
    items.length < limit ? null : Number(offset) + Number(limit);

  res.json({ items, next_offset });
};

// GET /api/images/:id
exports.getImageById = async (req, res) => {
  console.log(
    `[Get Image By ID] ${req.method} ${req.originalUrl} - User: ${req.user?._id} - ID: ${req.params.id}`
  );
  const image = await Image.findOne({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!image)
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Image not found" } });
  res.json(image);
};

// DELETE /api/images/:id
exports.deleteImage = async (req, res) => {
  console.log(
    `[Delete Image] ${req.method} ${req.originalUrl} - User: ${req.user?._id} - ID: ${req.params.id}`
  );
  const image = await Image.findOneAndDelete({
    _id: req.params.id,
    userId: req.user._id,
  });
  if (!image)
    return res
      .status(404)
      .json({ error: { code: "NOT_FOUND", message: "Image not found" } });
  res.json({ message: "Deleted successfully" });
};

const mongoose = require('mongoose');

const DetectionSchema = new mongoose.Schema({
  label: String,
  bbox: [Number],
  confidence: Number
});

const ImageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  fileUrl: String,
  detections: [DetectionSchema],
  detections_hash: String,
  originalFileHash: String,
  idempotencyKey: String,
  uploadedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Image', ImageSchema);

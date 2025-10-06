const Image = require("../models/Image");
const mongoose = require("mongoose");

exports.getAnalytics = async (req, res) => {
  console.log(
    `[Analytics] ${req.method} ${req.originalUrl} - User: ${req.user?._id} - Query:`,
    req.query
  );

  try {
    // Destructure and set default values
    const { from, to, limit = 10, offset = 0 } = req.query;

    // Convert limit and offset to numbers
    const limitNum = Number(limit) || 10;
    const offsetNum = Number(offset) || 0;

    // Match by user and optional date range
    const match = { userId: new mongoose.Types.ObjectId(req.user._id) };
    if (from || to) {
      match.uploadedAt = {};
      if (from) match.uploadedAt.$gte = new Date(from);
      if (to) match.uploadedAt.$lte = new Date(to);
    }

    // Total images
    const totalImagesPromise = Image.countDocuments(match);

    // Label counts
    const labelCountsPromise = Image.aggregate([
      { $match: match },
      { $unwind: { path: "$detections", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$detections.label", count: { $sum: 1 } } },
      { $project: { label: "$_id", count: 1, _id: 0 } },
    ]);

    // Daily uploads with pagination
    const dailyUploadsPromise = Image.aggregate([
      { $match: match },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$uploadedAt" } },
          count: { $sum: 1 },
        },
      },
      { $project: { date: "$_id", count: 1, _id: 0 } },
      { $sort: { date: 1 } },
      { $skip: offsetNum },
      { $limit: limitNum },
    ]);

    // Execute all promises in parallel
    const [totalImages, labelCountsArr, dailyUploads] = await Promise.all([
      totalImagesPromise,
      labelCountsPromise,
      dailyUploadsPromise,
    ]);

    // Convert label counts to object
    const labelCounts = {};
    labelCountsArr.forEach((l) => {
      if (l.label) labelCounts[l.label] = l.count;
    });

    // Compute next_offset for pagination
    const next_offset =
      dailyUploads.length < limitNum ? null : offsetNum + limitNum;

    // Send response
    res.json({ totalImages, labelCounts, dailyUploads, next_offset });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ error: { code: "SERVER_ERROR", message: err.message } });
  }
};

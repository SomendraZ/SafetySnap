// middlewares/rateLimit.js
const rateLimit = require("express-rate-limit");
const { ipKeyGenerator } = require("express-rate-limit"); // Import the helper

const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => {
    // Prefer user ID if authenticated
    if (req.user && req.user._id) return String(req.user._id);

    // Fallback to IP address
    return ipKeyGenerator(req);
  },
  handler: (_req, res) => {
    res.status(429).json({ error: { code: "RATE_LIMIT" } });
  },
});

module.exports = limiter;

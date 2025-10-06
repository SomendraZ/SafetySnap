const NodeCache = require('node-cache');

// Store keys temporarily (in-memory)
const idempotencyCache = new NodeCache({ stdTTL: 60 * 10 }); // 10 minutes TTL

module.exports = async function idempotency(req, res, next) {
  try {
    const key = req.headers['idempotency-key'];

    if (!key) {
      // If header is missing → throw proper error
      return res.status(400).json({
        error: {
          code: 'FIELD_REQUIRED',
          field: 'Idempotency-Key',
          message: 'Idempotency-Key header is required',
        },
      });
    }

    // If the same key already used → return stored response
    const cached = idempotencyCache.get(key);
    if (cached) {
      return res.status(200).json(cached);
    }

    // Intercept the response
    const originalJson = res.json.bind(res);
    res.json = (body) => {
      idempotencyCache.set(key, body); // save the body for reuse
      return originalJson(body);
    };

    next();
  } catch (err) {
    console.error('Idempotency middleware error:', err);
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Internal server error' } });
  }
};

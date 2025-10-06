const crypto = require('crypto');

// Generate SHA256 hash of data
exports.generateHash = (data) => {
  return crypto.createHash('sha256').update(data).digest('hex');
};

const express = require('express');
const protect = require('../middlewares/auth');
const rateLimit = require('../middlewares/rateLimit');
const { getAnalytics } = require('../controllers/analyticsController');

const router = express.Router();

router.get('/', protect, rateLimit, getAnalytics);

module.exports = router;

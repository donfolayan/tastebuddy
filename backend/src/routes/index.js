const express = require('express');
const router = express.Router();

// TODO: Add route handlers
router.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

module.exports = router; 
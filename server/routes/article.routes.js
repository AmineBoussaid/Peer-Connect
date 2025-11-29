const express = require('express');
const router = express.Router();

// Routes articles
router.get('/', (req, res) => {
  res.json({ message: 'Routes articles' });
});

module.exports = router;
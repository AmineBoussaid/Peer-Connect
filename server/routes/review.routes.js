const express = require('express');
const router = express.Router();

// Routes reviews
router.get('/', (req, res) => {
  res.json({ message: 'Routes reviews' });
});

module.exports = router;
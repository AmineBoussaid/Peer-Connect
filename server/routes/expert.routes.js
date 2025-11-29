const express = require('express');
const router = express.Router();

// Routes experts
router.get('/', (req, res) => {
  res.json({ message: 'Routes experts' });
});

module.exports = router;
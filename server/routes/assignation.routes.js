const express = require('express');
const router = express.Router();

// Routes assignations
router.get('/', (req, res) => {
  res.json({ message: 'Routes assignations' });
});

module.exports = router;
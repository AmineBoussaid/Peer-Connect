const express = require('express');
const router = express.Router();

// Routes auteurs
router.get('/', (req, res) => {
  res.json({ message: 'Routes auteurs' });
});

module.exports = router;
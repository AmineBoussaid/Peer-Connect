const express = require('express');
const router = express.Router();

// Routes admin
router.get('/', (req, res) => {
  res.json({ message: 'Routes admin' });
});

module.exports = router;
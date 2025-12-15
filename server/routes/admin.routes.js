const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');

// Routes admin
router.get('/', (req, res) => {
  res.json({ message: 'Routes admin' });
});

// List all users
router.get('/users', adminController.listUsers);

// Get user details
router.get('/user/:id', adminController.getUserDetail);

module.exports = router;
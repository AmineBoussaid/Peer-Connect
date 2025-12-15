const express = require('express');
const router = express.Router();
const controller = require('../controllers/article.controller');

// List articles for an auteur
router.get('/mine', controller.listByAuteur);

// List all articles with author info (admin)
router.get('/all', controller.listAllWithAuthor);

// Update article status
router.put('/:id/statut', controller.updateStatut);

// Create new article with file upload
router.post('/', controller.uploadMiddleware, controller.create);

// Update article (supports optional file upload)
router.put('/:id', controller.uploadMiddleware, controller.update);

// Delete article
router.delete('/:id', controller.remove);

module.exports = router;
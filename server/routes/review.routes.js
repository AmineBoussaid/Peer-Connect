const express = require('express');
const router = express.Router();
const controller = require('../controllers/review.controller');

// Créer une review
router.post('/', controller.create);

// Liste des reviews par article
router.get('/by-article', controller.listByArticle);

// Récupérer une review par assignation
router.get('/by-assignation', controller.getByAssignation);

// Mettre à jour une review
router.put('/:id', controller.update);

module.exports = router;
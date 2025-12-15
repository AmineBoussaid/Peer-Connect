const express = require('express');
const router = express.Router();
const controller = require('../controllers/assignation.controller');

// Créer une assignation
router.post('/', controller.create);

// Liste des assignations par article
router.get('/by-article', controller.listByArticle);

// Liste des assignations par expert
router.get('/by-expert', controller.listByExpert);

// Liste des assignations par auteur
router.get('/by-auteur', controller.listByAuteur);

// Liste de toutes les assignations (admin)
router.get('/all', controller.listAll);

// Détail complet d'une assignation (admin)
router.get('/:id/detail', controller.getDetail);

// Mettre à jour le statut d'une assignation
router.put('/:id/statut', controller.updateStatut);

module.exports = router;
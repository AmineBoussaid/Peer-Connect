const express = require('express');
const router = express.Router();
const controller = require('../controllers/expert.controller');
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
	destination: (req, file, cb) => cb(null, path.join('uploads')),
	filename: (req, file, cb) => {
		const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
		const ext = path.extname(file.originalname) || '.pdf';
		cb(null, `cv-${req.params.id}-${unique}${ext}`);
	}
});
const upload = multer({ storage });

// Liste des experts disponibles
router.get('/available', controller.listAvailable);

// Liste de tous les experts (admin)
router.get('/all', controller.listAll);

// Mettre à jour la disponibilité
router.put('/:id/disponibilite', controller.updateDisponibilite);

// Mettre à jour le score
router.put('/:id/score', controller.updateScore);

// Get reviews by expert ID (for admin detail page)
router.get('/:id/reviews', controller.getReviews);

// Upload CV
router.post('/:id/cv', upload.single('cv'), controller.uploadCv);

// Update domains
router.put('/:id/domains', controller.updateDomains);

// Get expert by id (details including CV)
router.get('/:id', controller.getById);

module.exports = router;
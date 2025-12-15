const express = require('express');
const router = express.Router();
const db = require('../config/db');

// Routes auteurs
router.get('/', (req, res) => {
  res.json({ message: 'Routes auteurs' });
});

// Get articles by author ID (for admin detail page)
router.get('/:id/articles', async (req, res) => {
  try {
    const { id } = req.params;
    const [articles] = await db.query(
      'SELECT id_article, titre, date_soumission FROM article WHERE id_auteur = ? ORDER BY date_soumission DESC',
      [id]
    );
    return res.json(articles || []);
  } catch (err) {
    console.error('Get articles error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
});

module.exports = router;
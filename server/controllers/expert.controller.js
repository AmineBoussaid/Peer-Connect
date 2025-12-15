const db = require('../config/db');

exports.listAvailable = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        e.id_utilisateur, 
        u.nom, 
        u.email, 
        e.domaines_expertise, 
        e.score_credibilite, 
        e.disponibilite
      FROM expert e
      JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
      WHERE e.disponibilite = 1
      ORDER BY e.score_credibilite DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('listAvailable experts error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.listAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        e.id_utilisateur, 
        u.nom, 
        u.email, 
        e.domaines_expertise, 
        e.score_credibilite, 
        e.disponibilite,
        e.cv,
        (SELECT COUNT(*) FROM assignation WHERE id_expert = e.id_utilisateur) as nb_assignations,
        (SELECT COUNT(*) FROM review WHERE id_expert = e.id_utilisateur) as nb_reviews
      FROM expert e
      JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
      ORDER BY e.score_credibilite DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('listAll experts error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateDisponibilite = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { disponibilite } = req.body;
    if (!id) return res.status(400).json({ message: 'id_utilisateur requis' });
    
    await db.query(
      'UPDATE expert SET disponibilite = ? WHERE id_utilisateur = ?',
      [disponibilite ? 1 : 0, id]
    );
    res.json({ message: 'Disponibilité mise à jour' });
  } catch (err) {
    console.error('updateDisponibilite error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.updateScore = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { score_credibilite } = req.body;
    if (!id) return res.status(400).json({ message: 'id_utilisateur requis' });
    
    await db.query(
      'UPDATE expert SET score_credibilite = ? WHERE id_utilisateur = ?',
      [score_credibilite, id]
    );
    res.json({ message: 'Score mis à jour' });
  } catch (err) {
    console.error('updateScore error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getReviews = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ message: 'id_utilisateur requis' });
    
    const [reviews] = await db.query(
      `SELECT 
         r.id_review, 
         a.titre AS article_titre, 
         r.recommandation,
         r.commentaires,
         r.date_soumission_review
       FROM review r 
       JOIN assignation ass ON r.id_assignation = ass.id_assignation 
       JOIN article a ON r.id_article = a.id_article 
       WHERE ass.id_expert = ? 
       ORDER BY r.date_soumission_review DESC`,
      [id]
    );
    res.json(reviews || []);
  } catch (err) {
    console.error('getReviews error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Upload CV for expert
exports.uploadCv = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ message: 'id_utilisateur requis' });
    if (!req.file) return res.status(400).json({ message: 'Fichier CV manquant' });

    const filePath = `/uploads/${req.file.filename}`;
    await db.query('UPDATE expert SET cv = ? WHERE id_utilisateur = ?', [filePath, id]);
    res.status(200).json({ message: 'CV importé', cv: filePath });
  } catch (err) {
    console.error('uploadCv error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Get expert by id (including CV path)
exports.getById = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ message: 'id_utilisateur requis' });

    const [rows] = await db.query(
      `SELECT 
         e.id_utilisateur,
         e.domaines_expertise,
         e.score_credibilite,
         e.disponibilite,
         e.cv,
         u.nom,
         u.email
       FROM expert e
       JOIN utilisateur u ON e.id_utilisateur = u.id_utilisateur
       WHERE e.id_utilisateur = ?
       LIMIT 1`,
      [id]
    );
    if (!rows || rows.length === 0) return res.status(404).json({ message: 'Expert non trouvé' });
    res.json(rows[0]);
  } catch (err) {
    console.error('getById expert error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Update expert domains
exports.updateDomains = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { domaines_expertise } = req.body;
    if (!id) return res.status(400).json({ message: 'id_utilisateur requis' });
    
    await db.query(
      'UPDATE expert SET domaines_expertise = ? WHERE id_utilisateur = ?',
      [domaines_expertise || '', id]
    );
    res.json({ message: 'Domaines d\'expertise mis à jour' });
  } catch (err) {
    console.error('updateDomains error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

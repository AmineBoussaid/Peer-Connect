const db = require('../config/db');

exports.create = async (req, res) => {
  try {
    const { id_assignation, id_article, id_expert, commentaires, recommandation, score_qualite, score_originalite, score_clarte, note_globale } = req.body;
    
    console.log('Review create request:', {
      id_assignation, id_article, id_expert, recommandation, commentaires: commentaires?.substring(0, 20)
    });
    
    if (!id_assignation || !id_article || !id_expert) {
      return res.status(400).json({ message: 'id_assignation, id_article et id_expert requis' });
    }

    const validRecommendations = ['accepter', 'reviser', 'rejeter'];
    if (!validRecommendations.includes(recommandation)) {
      console.error('Invalid recommandation:', recommandation, 'Valid values:', validRecommendations);
      return res.status(400).json({ message: `Recommandation invalide: ${recommandation}. Doit être l'une de: ${validRecommendations.join(', ')}` });
    }

    const scores = [
      note_globale,
      score_qualite,
      score_originalite,
      score_clarte
    ]
      .map(s => (typeof s === 'number' ? s : (s !== undefined ? parseFloat(s) : undefined)))
      .filter(s => s !== undefined && !Number.isNaN(s));
    const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    
    const date_review = new Date();
    
    // Créer la review avec id_expert
    const [result] = await db.query(
      `INSERT INTO review (id_assignation, id_expert, id_article, commentaires, note_globale, recommandation, date_soumission_review) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [id_assignation, id_expert, id_article, commentaires || null, avgScore, recommandation, date_review]
    );
    
    // Mettre à jour l'assignation: statut termine, score_pertinence (moyenne)
    await db.query(
      `UPDATE assignation SET statut_assignation = 'termine', score_pertinence = ? WHERE id_assignation = ?`,
      [avgScore, id_assignation]
    );
    
    res.status(201).json({ 
      id_review: result.insertId,
      message: 'Review soumise avec succès'
    });
  } catch (err) {
    console.error('create review error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.listByArticle = async (req, res) => {
  try {
    const idArticle = parseInt(req.query.id_article, 10);
    if (!idArticle) return res.status(400).json({ message: 'id_article requis' });
    
    const [rows] = await db.query(
      `SELECT 
        r.id_review,
        r.id_assignation,
        r.id_article,
        r.date_soumission_review,
        r.commentaires,
        r.recommandation,
        r.note_globale,
        u.nom as expert_nom,
        u.email as expert_email
      FROM review r
      JOIN assignation a ON r.id_assignation = a.id_assignation
      JOIN utilisateur u ON a.id_expert = u.id_utilisateur
      WHERE r.id_article = ?
      ORDER BY r.date_soumission_review DESC`,
      [idArticle]
    );
    res.json(rows);
  } catch (err) {
    console.error('listByArticle error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.getByAssignation = async (req, res) => {
  try {
    const idAssignation = parseInt(req.query.id_assignation, 10);
    if (!idAssignation) return res.status(400).json({ message: 'id_assignation requis' });
    
    const [rows] = await db.query(
      `SELECT * FROM review WHERE id_assignation = ? LIMIT 1`,
      [idAssignation]
    );
    
    if (rows.length === 0) {
      return res.status(404).json({ message: 'Review non trouvée' });
    }
    
    res.json(rows[0]);
  } catch (err) {
    console.error('getByAssignation error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.update = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { commentaires, recommandation, note_globale, score_qualite, score_originalite, score_clarte } = req.body;
    if (!id) return res.status(400).json({ message: 'id_review requis' });

    const validRecommendations = ['accepter', 'reviser', 'rejeter'];
    if (!validRecommendations.includes(recommandation)) {
      return res.status(400).json({ message: `Recommandation invalide: ${recommandation}` });
    }

    const scores = [note_globale, score_qualite, score_originalite, score_clarte]
      .map(s => (typeof s === 'number' ? s : (s !== undefined ? parseFloat(s) : undefined)))
      .filter(s => s !== undefined && !Number.isNaN(s));
    const avgScore = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : null;
    
    await db.query(
      `UPDATE review SET commentaires = ?, recommandation = ?, note_globale = ? WHERE id_review = ?`,
      [commentaires, recommandation, avgScore, id]
    );

    // Sync assignation recommendation/score and mark termine
    const [[rev]] = await db.query('SELECT id_assignation, id_article FROM review WHERE id_review = ? LIMIT 1', [id]);
    if (rev && rev.id_assignation) {
      await db.query(
        `UPDATE assignation SET statut_assignation = 'termine', score_pertinence = ? WHERE id_assignation = ?`,
        [avgScore, rev.id_assignation]
      );
    }
    
    res.json({ message: 'Review mise à jour' });
  } catch (err) {
    console.error('update review error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
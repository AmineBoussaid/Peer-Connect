const db = require('../config/db');

exports.create = async (req, res) => {
  try {
    let { id_expert, id_article, date_limite } = req.body;
    // Normalize and validate IDs
    id_expert = parseInt(id_expert, 10);
    id_article = parseInt(id_article, 10);
    if (!id_expert || !id_article) {
      return res.status(400).json({ message: 'id_expert et id_article requis' });
    }

    // Ensure expert exists
    const [[expertRow]] = await db.query('SELECT id_utilisateur FROM expert WHERE id_utilisateur = ? LIMIT 1', [id_expert]);
    if (!expertRow) {
      return res.status(400).json({ message: 'Expert invalide' });
    }

    // Ensure article exists
    const [[articleRow]] = await db.query('SELECT id_article FROM article WHERE id_article = ? LIMIT 1', [id_article]);
    if (!articleRow) {
      return res.status(400).json({ message: 'Article invalide' });
    }
    
    // Créer l'assignation
    const [result] = await db.query(
      `INSERT INTO assignation (id_expert, id_article, date_limite, statut_assignation, score_pertinence) 
       VALUES (?, ?, ?, 'en_attente', 0)`,
      [id_expert, id_article, date_limite || null]
    );
    
    res.status(201).json({ 
      id_assignation: result.insertId,
      id_expert,
      id_article,
      message: 'Article soumis avec succès à l\'expert'
    });
  } catch (err) {
    console.error('create assignation error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.listByArticle = async (req, res) => {
  try {
    const idArticle = parseInt(req.query.id_article, 10);
    if (!idArticle) return res.status(400).json({ message: 'id_article requis' });
    
    const [rows] = await db.query(
      `SELECT 
        a.id_assignation,
        a.id_expert,
        a.id_article,
        a.date_limite,
        a.statut_assignation,
        ar.date_soumission as article_date_soumission,
        
        u.nom as expert_nom,
        u.email as expert_email
      FROM assignation a
      JOIN utilisateur u ON a.id_expert = u.id_utilisateur
      JOIN article ar ON a.id_article = ar.id_article
      WHERE a.id_article = ?
      ORDER BY a.id_assignation DESC`,
      [idArticle]
    );
    res.json(rows);
  } catch (err) {
    console.error('listByArticle error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.listByExpert = async (req, res) => {
  try {
    const idExpert = parseInt(req.query.id_expert, 10);
    if (!idExpert) return res.status(400).json({ message: 'id_expert requis' });
    
    const [rows] = await db.query(
      `SELECT 
        a.id_assignation,
        a.id_expert,
        a.id_article,
        a.date_limite,
        a.statut_assignation,
        a.score_pertinence,
        ar.titre as article_titre,
        ar.resume as article_resume,
        ar.mots_cles as article_mots_cles,
        ar.fichier_pdf as article_fichier_pdf,
        ar.date_soumission as article_date_soumission,
        u.nom as auteur_nom,
        u.email as auteur_email,
        ex.nom as expert_nom,
        ex.email as expert_email,
        (SELECT COUNT(*) FROM review WHERE id_assignation = a.id_assignation) as has_review
      FROM assignation a
      JOIN article ar ON a.id_article = ar.id_article
      JOIN utilisateur u ON ar.id_auteur = u.id_utilisateur
      JOIN utilisateur ex ON a.id_expert = ex.id_utilisateur
      WHERE a.id_expert = ?
      ORDER BY ar.date_soumission DESC`,
      [idExpert]
    );
    res.json(rows);
  } catch (err) {
    console.error('listByExpert error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.listByAuteur = async (req, res) => {
  try {
    const idAuteur = parseInt(req.query.id_auteur, 10);
    if (!idAuteur) return res.status(400).json({ message: 'id_auteur requis' });
    
    const [rows] = await db.query(
      `SELECT 
        a.id_assignation,
        a.id_expert,
        a.id_article,
        a.date_limite,
        a.statut_assignation,
        a.score_pertinence,
        ar.titre as article_titre,
        ar.resume as article_resume,
        ar.mots_cles as article_mots_cles,
        ar.fichier_pdf as article_fichier_pdf,
        ar.date_soumission as article_date_soumission,
        au.nom as auteur_nom,
        au.email as auteur_email,
        ex.nom as expert_nom,
        ex.email as expert_email,
        (SELECT COUNT(*) FROM review WHERE id_assignation = a.id_assignation) as has_review
      FROM assignation a
      JOIN article ar ON a.id_article = ar.id_article
      JOIN utilisateur au ON ar.id_auteur = au.id_utilisateur
      JOIN utilisateur ex ON a.id_expert = ex.id_utilisateur
      WHERE ar.id_auteur = ?
      ORDER BY ar.date_soumission DESC`,
      [idAuteur]
    );
    res.json(rows);
  } catch (err) {
    console.error('listByAuteur error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// List all assignations (admin)
exports.listAll = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT 
        a.id_assignation,
        a.id_expert,
        a.id_article,
        a.date_limite,
        a.statut_assignation,
        a.score_pertinence,
        ar.titre as article_titre,
        ar.resume as article_resume,
        ar.mots_cles as article_mots_cles,
        ar.fichier_pdf as article_fichier_pdf,
        ar.date_soumission as article_date_soumission,
        au.id_utilisateur as auteur_id,
        au.nom as auteur_nom,
        au.email as auteur_email,
        ex.nom as expert_nom,
        ex.email as expert_email,
        (SELECT COUNT(*) FROM review r WHERE r.id_assignation = a.id_assignation) as has_review
      FROM assignation a
      JOIN article ar ON a.id_article = ar.id_article
      JOIN utilisateur au ON ar.id_auteur = au.id_utilisateur
      JOIN utilisateur ex ON a.id_expert = ex.id_utilisateur
      ORDER BY ar.date_soumission DESC, a.id_assignation DESC`
    );
    res.json(rows);
  } catch (err) {
    console.error('listAll assignations error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

// Get full detail for an assignation (article, auteur, expert, reviews)
exports.getDetail = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ message: 'id_assignation requis' });

    const [[assignment]] = await db.query(
      `SELECT 
        a.id_assignation,
        a.id_expert,
        a.id_article,
        a.date_limite,
        a.statut_assignation,
        a.score_pertinence,
        ar.titre as article_titre,
        ar.resume as article_resume,
        ar.mots_cles as article_mots_cles,
        ar.fichier_pdf as article_fichier_pdf,
        ar.date_soumission as article_date_soumission,
        au.id_utilisateur as auteur_id,
        au.nom as auteur_nom,
        au.email as auteur_email,
        ex.nom as expert_nom,
        ex.email as expert_email
      FROM assignation a
      JOIN article ar ON a.id_article = ar.id_article
      JOIN utilisateur au ON ar.id_auteur = au.id_utilisateur
      JOIN utilisateur ex ON a.id_expert = ex.id_utilisateur
      WHERE a.id_assignation = ?
      LIMIT 1`,
      [id]
    );
    if (!assignment) return res.status(404).json({ message: 'Assignation non trouvée' });

    const [reviews] = await db.query(
      `SELECT r.id_review, r.commentaires, r.note_globale, r.recommandation, r.date_soumission_review
       FROM review r
       WHERE r.id_assignation = ?
       ORDER BY r.date_soumission_review DESC`,
      [id]
    );

    res.json({ assignment, reviews: reviews || [] });
  } catch (err) {
    console.error('getDetail assignation error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};
exports.updateStatut = async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const { statut_assignation } = req.body;
    if (!id || !statut_assignation) {
      return res.status(400).json({ message: 'id et statut_assignation requis' });
    }

    // Update assignation
    await db.query(
      'UPDATE assignation SET statut_assignation = ? WHERE id_assignation = ?',
      [statut_assignation, id]
    );

    res.json({ message: 'Statut mis à jour' });
  } catch (err) {
    console.error('updateStatut error:', err);
    res.status(500).json({ message: 'Erreur serveur' });
  }
};

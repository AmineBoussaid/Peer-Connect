const db = require('../config/db');
const multer = require('multer');
const path = require('path');

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'article-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Seulement les fichiers PDF sont acceptés'));
    }
  },
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB max
});

// Export upload middleware
exports.uploadMiddleware = upload.single('fichier_pdf');

exports.listByAuteur = async (req, res) => {
	try {
		const idAuteur = parseInt(req.query.id_auteur, 10);
		if (!idAuteur) return res.status(400).json({ message: 'id_auteur requis' });
		const [rows] = await db.query(
			' SELECT id_article, id_auteur, titre, resume, mots_cles, date_soumission, fichier_pdf FROM article WHERE id_auteur = ? ORDER BY id_article DESC',
			[idAuteur]
		);
		res.json(rows);
	} catch (err) {
		console.error('listByAuteur error:', err);
		res.status(500).json({ message: 'Erreur serveur' });
	}
};

exports.listAllWithAuthor = async (req, res) => {
	try {
		const [rows] = await db.query(
			`SELECT 
				a.id_article, 
				a.id_auteur, 
				a.titre, 
				a.resume, 
				a.mots_cles, 
				a.date_soumission, 
				a.fichier_pdf,
				u.nom as auteur_nom,
				u.email as auteur_email,
				(SELECT COUNT(*) FROM assignation WHERE id_article = a.id_article) as nb_assignations,
				(SELECT COUNT(*) FROM review WHERE id_article = a.id_article) as nb_reviews
			FROM article a
			JOIN utilisateur u ON a.id_auteur = u.id_utilisateur
			ORDER BY a.date_soumission DESC`
		);
		res.json(rows);
	} catch (err) {
		console.error('listAllWithAuthor error:', err);
		res.status(500).json({ message: 'Erreur serveur' });
	}
};

// Placeholder to keep routes stable: statut column removed
exports.updateStatut = async (req, res) => {
	return res.status(410).json({ message: 'Champ statut supprimé du modèle article' });
};

exports.create = async (req, res) => {
	try {
		console.log('req.body:', req.body);
		console.log('req.file:', req.file);
		const { id_auteur, titre, resume, mots_cles } = req.body;
		if (!id_auteur || !titre) {
			console.log('Validation failed - id_auteur:', id_auteur, 'titre:', titre);
			return res.status(400).json({ message: 'id_auteur et titre requis' });
		}
		const date = new Date();
		const fichier_pdf = req.file ? req.file.filename : null;
		const [result] = await db.query(
			'INSERT INTO article (id_auteur, titre, resume, mots_cles, date_soumission, fichier_pdf) VALUES (?, ?, ?, ?, ?, ?)',
			[id_auteur, titre, resume || null, mots_cles || null, date, fichier_pdf]
		);
		res.status(201).json({ id_article: result.insertId, fichier_pdf });
	} catch (err) {
		console.error('create article error:', err);
		res.status(500).json({ message: 'Erreur serveur' });
	}
};

exports.update = async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		const { titre, resume, mots_cles, fichier_pdf } = req.body;
		if (!id) return res.status(400).json({ message: 'id_article requis' });

		// Récupérer l'article actuel pour préserver le statut/fichier si non fournis
		const [existingRows] = await db.query('SELECT titre, resume, mots_cles, fichier_pdf FROM article WHERE id_article = ? LIMIT 1', [id]);
		if (!existingRows || existingRows.length === 0) return res.status(404).json({ message: 'Article non trouvé' });
		const current = existingRows[0];

		// Normaliser mots_cles (array ou string) et fichier (multipart)
		const normalizedKeywords = Array.isArray(mots_cles)
			? mots_cles.join(', ')
			: (typeof mots_cles === 'string' && mots_cles.trim() !== '' ? mots_cles : current.mots_cles);
		const newTitre = titre ?? current.titre;
		const newResume = resume ?? current.resume;
		// Si un nouveau fichier est uploadé (multipart), utiliser son filename, sinon fallback au corps ou existant
		const uploadedFile = req.file ? req.file.filename : undefined;
		const newFichier = uploadedFile
			? uploadedFile
			: (typeof fichier_pdf === 'undefined' || fichier_pdf === null || fichier_pdf === '' ? current.fichier_pdf : fichier_pdf);

		const [result] = await db.query(
			'UPDATE article SET titre = ?, resume = ?, mots_cles = ?, fichier_pdf = ? WHERE id_article = ?',
			[newTitre, newResume, normalizedKeywords, newFichier, id]
		);
		res.json({ affectedRows: result.affectedRows, fichier_pdf: newFichier });
	} catch (err) {
		console.error('update article error:', err);
		res.status(500).json({ message: 'Erreur serveur' });
	}
};

exports.remove = async (req, res) => {
	try {
		const id = parseInt(req.params.id, 10);
		if (!id) return res.status(400).json({ message: 'id_article requis' });
		const [result] = await db.query('DELETE FROM article WHERE id_article = ?', [id]);
		res.json({ affectedRows: result.affectedRows });
	} catch (err) {
		console.error('delete article error:', err);
		res.status(500).json({ message: 'Erreur serveur' });
	}
};


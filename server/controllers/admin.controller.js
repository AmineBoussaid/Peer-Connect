const Utilisateur = require('../models/utilisateur.model');

exports.listUsers = async (req, res) => {
	try {
		const users = await Utilisateur.findAll();
		// Return all users; mask password
		const sanitized = users.map(u => ({
			id_utilisateur: u.id_utilisateur,
			nom: u.nom,
			email: u.email,
			role: u.role,
			mot_de_passe: u.mot_de_passe ? '••••••' : null
		}));
		return res.json(sanitized);
	} catch (err) {
		console.error('List users error:', err);
		return res.status(500).json({ message: 'Erreur serveur' });
	}
};

exports.getUserDetail = async (req, res) => {
	try {
		const { id } = req.params;
		const user = await Utilisateur.findByEmail(null);
		// Use a simple query to get the user by ID
		const db = require('../config/db');
		const [rows] = await db.query(
			`SELECT 
				u.id_utilisateur, 
				u.nom, 
				u.email, 
				u.role,
				e.domaines_expertise,
				e.cv,
				e.score_credibilite,
				e.disponibilite
			FROM utilisateur u
			LEFT JOIN expert e ON u.id_utilisateur = e.id_utilisateur
			WHERE u.id_utilisateur = ? LIMIT 1`,
			[id]
		);
		if (!rows || rows.length === 0) {
			return res.status(404).json({ message: 'Utilisateur non trouvé' });
		}
		return res.json(rows[0]);
	} catch (err) {
		console.error('Get user detail error:', err);
		return res.status(500).json({ message: 'Erreur serveur' });
	}
};

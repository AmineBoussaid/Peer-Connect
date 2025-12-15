const bcrypt = require('bcryptjs');
const Utilisateur = require('../models/utilisateur.model');
const Auteur = require('../models/auteur.model');
const Expert = require('../models/expert.model');

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    const user = await Utilisateur.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    // Compare hashed password if stored hashed; fallback to plain compare
    const isMatch = user.mot_de_passe && user.mot_de_passe.startsWith('$2')
      ? await bcrypt.compare(password, user.mot_de_passe)
      : user.mot_de_passe === password;

    if (!isMatch) {
      return res.status(401).json({ message: 'Identifiants invalides' });
    }

    return res.json({
      id_utilisateur: user.id_utilisateur,
      nom: user.nom,
      email: user.email,
      role: user.role
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

exports.register = async (req, res) => {
  try {
    const { nom, email, password, role } = req.body;
    if (!nom || !email || !password || !role) {
      return res.status(400).json({ message: 'Nom, email, mot de passe et rôle sont requis' });
    }

    const existing = await Utilisateur.findByEmail(email);
    if (existing) {
      return res.status(409).json({ message: 'Un compte existe déjà avec cet email' });
    }

    const hashed = await bcrypt.hash(password, 10);
    const created = await Utilisateur.createUser({ nom, email, mot_de_passe: hashed, role });

    // Create role-specific record
    if (role === 'auteur') {
      await Auteur.createAuteur(created.id_utilisateur);
    } else if (role === 'expert') {
      await Expert.createExpert(created.id_utilisateur);
    }

    return res.status(201).json(created);
  } catch (err) {
    console.error('Register error:', err);
    return res.status(500).json({ message: 'Erreur serveur' });
  }
};

const db = require('../config/db');

// Utilisateur model: basic queries
module.exports = {
  async findByEmail(email) {
    const [rows] = await db.query(
      'SELECT id_utilisateur, nom, email, mot_de_passe, role FROM utilisateur WHERE email = ? LIMIT 1',
      [email]
    );
    return rows[0] || null;
  },

  async createUser({ nom, email, mot_de_passe, role }) {
    const [result] = await db.query(
      'INSERT INTO utilisateur (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)',
      [nom, email, mot_de_passe, role]
    );
    return { id_utilisateur: result.insertId, nom, email, role };
  },

  async findAll() {
    const [rows] = await db.query(
      'SELECT id_utilisateur, nom, email, mot_de_passe, role FROM utilisateur ORDER BY id_utilisateur DESC'
    );
    return rows;
  }
};

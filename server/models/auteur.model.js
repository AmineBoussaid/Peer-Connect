const db = require('../config/db');

module.exports = {
  async createAuteur(id_utilisateur) {
    const [result] = await db.query(
      'INSERT INTO auteur (id_utilisateur) VALUES (?)',
      [id_utilisateur]
    );
    return result;
  },

  async findByUserId(id_utilisateur) {
    const [rows] = await db.query(
      'SELECT * FROM auteur WHERE id_utilisateur = ? LIMIT 1',
      [id_utilisateur]
    );
    return rows[0] || null;
  },

  async findAll() {
    const [rows] = await db.query('SELECT * FROM auteur');
    return rows;
  }
};

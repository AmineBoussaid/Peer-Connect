const db = require('../config/db');

module.exports = {
  async createExpert(id_utilisateur) {
    const [result] = await db.query(
      'INSERT INTO expert (id_utilisateur, domaines_expertise, cv, score_credibilite, disponibilite) VALUES (?, ?, ?, ?, ?)',
      [id_utilisateur, '', '', 0, 1]
    );
    return result;
  },

  async findByUserId(id_utilisateur) {
    const [rows] = await db.query(
      'SELECT * FROM expert WHERE id_utilisateur = ? LIMIT 1',
      [id_utilisateur]
    );
    return rows[0] || null;
  },

  async findAll() {
    const [rows] = await db.query('SELECT * FROM expert');
    return rows;
  }
};

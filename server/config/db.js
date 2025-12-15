const mysql = require('mysql2');

// Configuration de la connexion à la base de données
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'peerconnect_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Utiliser les promesses
const promisePool = pool.promise();

// Tester la connexion (optionnel)
pool.getConnection((err, connection) => {
  if (err) {
    console.warn('⚠️  Avertissement: Connexion à la base de données échouée:', err.message);
    console.warn('Le serveur continuera sans connexion DB');
  } else {
    console.log('✅ Connexion à la base de données réussie');
    connection.release();
  }
});

module.exports = promisePool;
const app = require('./server');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(`✅ Serveur démarré sur le port ${PORT}`);
  console.log(`📍 URL: http://localhost:${PORT}`);
});

server.on('error', (error) => {
  console.error('❌ Erreur serveur:', error);
});
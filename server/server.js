const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
const adminRoutes = require('./routes/admin.routes');
const articleRoutes = require('./routes/article.routes');
const assignationRoutes = require('./routes/assignation.routes');
const auteurRoutes = require('./routes/auteur.routes');
const expertRoutes = require('./routes/expert.routes');
const reviewRoutes = require('./routes/review.routes');
const authRoutes = require('./routes/auth.routes');

app.use('/api/admin', adminRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/assignations', assignationRoutes);
app.use('/api/auteurs', auteurRoutes);
app.use('/api/experts', expertRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/auth', authRoutes);

// Route de base
app.get('/', (req, res) => {
  res.json({ message: 'Bienvenue sur l\'API PeerConnect' });
});

module.exports = app;
const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function seedDatabase() {
  try {
    console.log('🌱 Début du seed de la base de données...\n');

    // Hash passwords
    const adminPass = await bcrypt.hash('admin123', 10);
    const authorPass = await bcrypt.hash('author123', 10);
    const expertPass = await bcrypt.hash('expert123', 10);
    const authorCustomPass = await bcrypt.hash('password', 10);
    const expertCustomPass = await bcrypt.hash('securepass', 10);

    // 1. Insert Admins (check if exists first)
    console.log('📝 Insertion des administrateurs...');
    const [existingAdmin] = await db.query(
      'SELECT id_utilisateur FROM utilisateur WHERE email = ? LIMIT 1',
      ['admin@peerconnect.com']
    );
    let adminId;
    if (existingAdmin.length > 0) {
      adminId = existingAdmin[0].id_utilisateur;
      console.log(`✓ Admin existant trouvé: ID ${adminId}`);
    } else {
      const [adminRes] = await db.query(
        'INSERT INTO utilisateur (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)',
        ['Admin Principal', 'admin@peerconnect.com', adminPass, 'admin']
      );
      adminId = adminRes.insertId;
      console.log(`✓ Admin inséré: ID ${adminId}`);
    }

    // 2. Insert Authors
    console.log('\n📝 Insertion des auteurs...');
    const authorEmails = [
      ['Dupont Jean', 'jean.dupont@email.com', authorPass],
      ['Martin Sophie', 'sophie.martin@email.com', authorPass],
      ['Bernard Alice', 'alice.bernard@email.com', authorPass],
      ['Lefevre Marc', 'marc.lefevre@email.com', authorPass],
      ['Moreau Claire', 'claire.moreau@email.com', authorPass],
      ['Auteur Test', 'auteur@test.com', authorCustomPass]
    ];

    const authorIds = [];
    let authorTestId = null;
    for (const [nom, email, pass] of authorEmails) {
      const [existing] = await db.query(
        'SELECT id_utilisateur FROM utilisateur WHERE email = ? LIMIT 1',
        [email]
      );
      if (existing.length > 0) {
        authorIds.push(existing[0].id_utilisateur);
        if (email === 'auteur@test.com') authorTestId = existing[0].id_utilisateur;
        console.log(`✓ Auteur existant trouvé: ${nom} (ID ${existing[0].id_utilisateur})`);
      } else {
        const [res] = await db.query(
          'INSERT INTO utilisateur (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)',
          [nom, email, pass, 'auteur']
        );
        authorIds.push(res.insertId);
        if (email === 'auteur@test.com') authorTestId = res.insertId;
        console.log(`✓ Auteur inséré: ${nom} (ID ${res.insertId})`);
      }
    }
    if (!authorTestId && authorIds.length > 0) {
      authorTestId = authorIds[authorIds.length - 1];
    }

    // 3. Insert Experts
    console.log('\n📝 Insertion des experts...');
    const expertEmails = [
      ['Expert Bravo', 'expert.bravo@email.com', expertPass, 'Machine Learning, NLP', 85],
      ['Dr. Chardin', 'dr.chardin@email.com', expertPass, 'Data Science, Statistics', 90],
      ['Prof. Dumont', 'prof.dumont@email.com', expertPass, 'AI, Robotics', 88],
      ['Emma Fontaine', 'emma.fontaine@email.com', expertPass, 'Deep Learning, CV', 82],
      ['Georges Henri', 'georges.henri@email.com', expertPass, 'Cloud Computing, DevOps', 80],
      ['Isabelle Jouve', 'isabelle.jouve@email.com', expertPass, 'Cybersecurity', 87],
      ['Karl Lamy', 'karl.lamy@email.com', expertPass, 'Web Development', 79],
      ['Lena Moreau', 'lena.moreau@email.com', expertPass, 'Database Design', 86],
      ['Expert Test', 'expert@test.com', expertCustomPass, 'Full Stack, AI', 83]
    ];

    const expertIds = [];
    for (const [nom, email, pass, domaines, score] of expertEmails) {
      const [existing] = await db.query(
        'SELECT id_utilisateur FROM utilisateur WHERE email = ? LIMIT 1',
        [email]
      );
      let userId;
      if (existing.length > 0) {
        userId = existing[0].id_utilisateur;
        const [expertExists] = await db.query(
          'SELECT id_utilisateur FROM expert WHERE id_utilisateur = ? LIMIT 1',
          [userId]
        );
        if (expertExists.length === 0) {
          await db.query(
            'INSERT INTO expert (id_utilisateur, domaines_expertise, score_credibilite, disponibilite) VALUES (?, ?, ?, ?)',
            [userId, domaines, score, 1]
          );
        }
        console.log(`✓ Expert existant trouvé: ${nom} (ID ${userId})`);
      } else {
        const [userRes] = await db.query(
          'INSERT INTO utilisateur (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)',
          [nom, email, pass, 'expert']
        );
        userId = userRes.insertId;

        await db.query(
          'INSERT INTO expert (id_utilisateur, domaines_expertise, score_credibilite, disponibilite) VALUES (?, ?, ?, ?)',
          [userId, domaines, score, 1]
        );
        console.log(`✓ Expert inséré: ${nom} (ID ${userId})`);
      }
      expertIds.push(userId);
    }

    // 4. Insert Articles
    console.log('\n📝 Insertion des articles...');
    const articles = [
      ['Deep Learning for Image Classification', 'This paper explores advanced CNN architectures for image classification tasks', 'CNN, Deep Learning, Computer Vision', authorTestId],
      ['Natural Language Processing with Transformers', 'A comprehensive study on transformer models for NLP applications', 'NLP, Transformers, BERT', authorTestId],
      ['Federated Learning: Privacy-Preserving ML', 'Exploring federated learning techniques for distributed machine learning', 'Federated Learning, Privacy, Security', authorTestId],
      ['Reinforcement Learning for Autonomous Vehicles', 'Applying RL algorithms to autonomous driving scenarios', 'RL, Autonomous Driving, AI', authorTestId],
      ['Graph Neural Networks and Applications', 'Survey on GNN architectures and real-world applications', 'GNN, Graph Theory, ML', authorIds[0]],
      ['Time Series Forecasting with LSTM', 'Advanced LSTM techniques for financial time series prediction', 'LSTM, Time Series, Finance', authorTestId],
      ['Explainable AI for Healthcare', 'Making deep learning models interpretable in medical diagnosis', 'XAI, Healthcare, Interpretability', authorIds[1]],
      ['Anomaly Detection in IoT Systems', 'Real-time anomaly detection using machine learning for IoT networks', 'Anomaly Detection, IoT, ML', authorTestId]
    ];

    const articleIds = [];
    for (const [titre, resume, mots_cles, id_auteur] of articles) {
      const [res] = await db.query(
        'INSERT INTO article (id_auteur, titre, resume, mots_cles, date_soumission) VALUES (?, ?, ?, ?, NOW())',
        [id_auteur, titre, resume, mots_cles]
      );
      articleIds.push(res.insertId);
      console.log(`✓ Article inséré: ${titre} (ID ${res.insertId})`);
    }

    // 5. Insert Assignations (assign articles to experts for review)
    console.log('\n📝 Insertion des assignations...');
    const assignmentData = [
      [articleIds[1], expertIds[0], null, 'en_attente'], // NLP article -> ML expert
      [articleIds[1], expertIds[1], null, 'en_attente'], // NLP article -> Data Science expert
      [articleIds[2], expertIds[0], null, 'en_attente'], // FL article -> ML expert
      [articleIds[3], expertIds[2], null, 'en_attente'], // RL article -> AI expert
      [articleIds[4], expertIds[1], null, 'en_attente'], // GNN article -> Data Science expert
      [articleIds[5], expertIds[1], null, 'en_attente'], // LSTM article -> Data Science expert
      [articleIds[6], expertIds[4], null, 'en_attente'], // XAI article -> Dev expert
      [articleIds[0], expertIds[3], null, 'en_attente'], // Image classification -> DL expert
    ];

    const assignationIds = [];
    for (const [id_article, id_expert, date_limite, statut] of assignmentData) {
      const [res] = await db.query(
        'INSERT INTO assignation (id_article, id_expert, date_limite, statut_assignation, score_pertinence) VALUES (?, ?, ?, ?, 0)',
        [id_article, id_expert, date_limite, statut]
      );
      assignationIds.push(res.insertId);
      console.log(`✓ Assignation créée: Article ${id_article} -> Expert ${id_expert} (ID ${res.insertId})`);
    }

    // 6. Insert Reviews (some experts have already reviewed)
    console.log('\n📝 Insertion des reviews...');
    const reviews = [
      [assignationIds[0], articleIds[1], 'Excellent paper with novel insights', 'accepter', 8, 9, 8],
      [assignationIds[2], articleIds[2], 'Good methodology, needs minor revisions', 'reviser', 7, 7, 8],
      [assignationIds[4], articleIds[4], 'Interesting approach but limited evaluation', 'reviser', 6, 7, 6],
      [assignationIds[5], articleIds[5], 'Well-written, strong experimental results', 'accepter', 9, 8, 9]
    ];

    for (const [id_assignation, id_article, commentaires, recommandation, score_qualite, score_originalite, score_clarte] of reviews) {
      const [res] = await db.query(
        'INSERT INTO review (id_assignation, id_article, commentaires, recommandation, note_globale, date_soumission_review) VALUES (?, ?, ?, ?, ?, NOW())',
        [id_assignation, id_article, commentaires, recommandation, Math.round((score_qualite + score_originalite + score_clarte) / 3)]
      );
      console.log(`✓ Review créée: ID ${res.insertId} pour assignation ${id_assignation}`);

    }

    console.log('\n✅ Seed complété avec succès!\n');
    console.log('📊 Résumé:');
    console.log(`  - 1 Admin`);
    console.log(`  - ${authorIds.length} Auteurs`);
    console.log(`  - ${expertIds.length} Experts`);
    console.log(`  - ${articleIds.length} Articles`);
    console.log(`  - ${assignationIds.length} Assignations`);
    console.log(`  - ${reviews.length} Reviews\n`);

  } catch (error) {
    console.error('❌ Erreur lors du seed:', error);
  } finally {
    process.exit(0);
  }
}

seedDatabase();

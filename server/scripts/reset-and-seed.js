const db = require('../config/db');
const bcrypt = require('bcryptjs');

async function resetAndSeedDatabase() {
  try {
    console.log('🔄 Début du reset et seed de la base de données...\n');

    // 1. Vider toutes les tables sauf utilisateur
    console.log('🗑️  Suppression des données existantes...');
    await db.query('DELETE FROM review');
    console.log('✓ Table review vidée');
    
    await db.query('DELETE FROM assignation');
    console.log('✓ Table assignation vidée');
    
    await db.query('DELETE FROM article');
    console.log('✓ Table article vidée');
    
    await db.query('DELETE FROM expert');
    console.log('✓ Table expert vidée');
    
    await db.query('DELETE FROM auteur');
    console.log('✓ Table auteur vidée');
    
    await db.query('DELETE FROM utilisateur');
    console.log('✓ Table utilisateur vidée');

    // Reset auto-increment
    await db.query('ALTER TABLE utilisateur AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE article AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE assignation AUTO_INCREMENT = 1');
    await db.query('ALTER TABLE review AUTO_INCREMENT = 1');
    console.log('✓ Auto-increment réinitialisé\n');

    // 2. Hash passwords
    const adminPass = await bcrypt.hash('admin123', 10);
    const auteurPass = await bcrypt.hash('auteur123', 10);
    const expertPass = await bcrypt.hash('expert123', 10);

    // 3. Insert Users (Utilisateurs de base)
    console.log('👥 Création des utilisateurs...\n');

    // Admin
    const [adminRes] = await db.query(
      'INSERT INTO utilisateur (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)',
      ['Administrateur Principal', 'admin@peerconnect.com', adminPass, 'admin']
    );
    const adminId = adminRes.insertId;
    console.log(`✓ Admin créé: admin@peerconnect.com (ID: ${adminId})`);

    // Auteurs
    const auteurs = [
      ['Dr. Jean Dupont', 'jean.dupont@university.fr'],
      ['Dr. Sophie Martin', 'sophie.martin@research.fr'],
      ['Prof. Marc Lefevre', 'marc.lefevre@institute.fr'],
      ['Dr. Claire Moreau', 'claire.moreau@lab.fr'],
      ['Alice Bernard', 'alice.bernard@edu.fr']
    ];

    const auteurIds = [];
    for (const [nom, email] of auteurs) {
      const [userRes] = await db.query(
        'INSERT INTO utilisateur (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)',
        [nom, email, auteurPass, 'auteur']
      );
      const userId = userRes.insertId;
      await db.query('INSERT INTO auteur (id_utilisateur) VALUES (?)', [userId]);
      auteurIds.push(userId);
      console.log(`✓ Auteur créé: ${email} (ID: ${userId})`);
    }

    // Experts
    const experts = [
      ['Dr. Emma Fontaine', 'emma.fontaine@expert.fr', 'Intelligence Artificielle, Machine Learning, Deep Learning', 92, 'emma-fontaine-cv.pdf'],
      ['Prof. Thomas Rousseau', 'thomas.rousseau@expert.fr', 'Natural Language Processing, Transformers, NLP', 88, 'thomas-rousseau-cv.pdf'],
      ['Dr. Laura Chen', 'laura.chen@expert.fr', 'Computer Vision, Image Processing, CNN', 90, 'laura-chen-cv.pdf'],
      ['Dr. Paul Dubois', 'paul.dubois@expert.fr', 'Data Science, Statistics, Analytics', 85, 'paul-dubois-cv.pdf'],
      ['Prof. Marie Lambert', 'marie.lambert@expert.fr', 'Cybersecurity, Privacy, Blockchain', 87, 'marie-lambert-cv.pdf'],
      ['Dr. Nicolas Girard', 'nicolas.girard@expert.fr', 'Cloud Computing, DevOps, Distributed Systems', 83, 'nicolas-girard-cv.pdf'],
      ['Dr. Sarah Cohen', 'sarah.cohen@expert.fr', 'IoT, Edge Computing, Sensors', 86, 'sarah-cohen-cv.pdf'],
      ['Prof. Antoine Moreau', 'antoine.moreau@expert.fr', 'Reinforcement Learning, Robotics, AI', 91, 'antoine-moreau-cv.pdf']
    ];

    const expertIds = [];
    for (const [nom, email, domaines, score, cv] of experts) {
      const [userRes] = await db.query(
        'INSERT INTO utilisateur (nom, email, mot_de_passe, role) VALUES (?, ?, ?, ?)',
        [nom, email, expertPass, 'expert']
      );
      const userId = userRes.insertId;
      await db.query(
        'INSERT INTO expert (id_utilisateur, domaines_expertise, score_credibilite, cv, disponibilite) VALUES (?, ?, ?, ?, ?)',
        [userId, domaines, score, cv, 1]
      );
      expertIds.push(userId);
      console.log(`✓ Expert créé: ${email} (Score: ${score}, ID: ${userId})`);
    }

    // 4. Insert Articles (8 articles variés)
    console.log('\n📄 Création des articles...\n');
    const articles = [
      {
        titre: 'Deep Learning for Medical Image Diagnosis',
        resume: 'This paper presents a novel approach using convolutional neural networks for automated diagnosis of medical images, achieving 95% accuracy on chest X-rays.',
        mots_cles: 'Deep Learning, Medical Imaging, CNN, Healthcare',
        auteur: auteurIds[0],
        pdf: 'article-medical-imaging.pdf'
      },
      {
        titre: 'Transformer-based Language Models for Code Generation',
        resume: 'We introduce a new transformer architecture specifically designed for automatic code generation from natural language descriptions with improved semantic understanding.',
        mots_cles: 'Transformers, NLP, Code Generation, AI',
        auteur: auteurIds[1],
        pdf: 'article-code-generation.pdf'
      },
      {
        titre: 'Federated Learning for Privacy-Preserving Analytics',
        resume: 'A comprehensive study on federated learning techniques that enable collaborative machine learning while preserving data privacy across distributed networks.',
        mots_cles: 'Federated Learning, Privacy, Distributed ML, Security',
        auteur: auteurIds[0],
        pdf: 'article-federated-learning.pdf'
      },
      {
        titre: 'Real-time Object Detection using YOLO v8',
        resume: 'An improved YOLO architecture for real-time object detection with enhanced performance on edge devices and reduced computational requirements.',
        mots_cles: 'Object Detection, YOLO, Computer Vision, Real-time',
        auteur: auteurIds[2],
        pdf: 'article-yolo-detection.pdf'
      },
      {
        titre: 'Graph Neural Networks for Social Network Analysis',
        resume: 'This work explores graph neural network architectures for analyzing social network structures and predicting user behavior patterns.',
        mots_cles: 'GNN, Social Networks, Graph Theory, ML',
        auteur: auteurIds[3],
        pdf: 'article-gnn-social.pdf'
      },
      {
        titre: 'Blockchain-based Secure Data Sharing in Healthcare',
        resume: 'A novel blockchain framework for secure and transparent medical data sharing between healthcare providers while maintaining patient privacy.',
        mots_cles: 'Blockchain, Healthcare, Security, Privacy',
        auteur: auteurIds[1],
        pdf: 'article-blockchain-health.pdf'
      },
      {
        titre: 'Reinforcement Learning for Autonomous Drone Navigation',
        resume: 'Deep reinforcement learning algorithms for autonomous drone navigation in complex environments with obstacle avoidance and path optimization.',
        mots_cles: 'Reinforcement Learning, Drones, Robotics, AI',
        auteur: auteurIds[4],
        pdf: 'article-drone-navigation.pdf'
      },
      {
        titre: 'IoT Anomaly Detection using Machine Learning',
        resume: 'Machine learning approaches for detecting anomalies in IoT sensor data with low latency and high accuracy for smart city applications.',
        mots_cles: 'IoT, Anomaly Detection, ML, Smart Cities',
        auteur: auteurIds[2],
        pdf: 'article-iot-anomaly.pdf'
      }
    ];

    const articleIds = [];
    for (const article of articles) {
      const [res] = await db.query(
        'INSERT INTO article (id_auteur, titre, resume, mots_cles, fichier_pdf, date_soumission) VALUES (?, ?, ?, ?, ?, NOW())',
        [article.auteur, article.titre, article.resume, article.mots_cles, article.pdf]
      );
      articleIds.push(res.insertId);
      console.log(`✓ Article créé: "${article.titre}" (ID: ${res.insertId})`);
    }

    // 5. Insert Assignations (assignations pertinentes)
    console.log('\n📋 Création des assignations...\n');
    
    // Calcul de dates limites (dans 14, 21, 30 jours)
    const today = new Date();
    const dateLimite14j = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
    const dateLimite21j = new Date(today.getTime() + 21 * 24 * 60 * 60 * 1000);
    const dateLimite30j = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

    const assignations = [
      // Article 1: Medical Imaging -> Experts AI/ML
      { article: articleIds[0], expert: expertIds[0], dateLimite: dateLimite14j, statut: 'en_cours', score: 95 },
      { article: articleIds[0], expert: expertIds[2], dateLimite: dateLimite14j, statut: 'en_attente', score: 90 },
      
      // Article 2: Code Generation -> Experts NLP
      { article: articleIds[1], expert: expertIds[1], dateLimite: dateLimite21j, statut: 'en_cours', score: 98 },
      { article: articleIds[1], expert: expertIds[0], dateLimite: dateLimite21j, statut: 'en_attente', score: 85 },
      
      // Article 3: Federated Learning -> Experts Security/ML
      { article: articleIds[2], expert: expertIds[0], dateLimite: dateLimite30j, statut: 'termine', score: 92 },
      { article: articleIds[2], expert: expertIds[4], dateLimite: dateLimite30j, statut: 'termine', score: 88 },
      
      // Article 4: YOLO Detection -> Experts CV
      { article: articleIds[3], expert: expertIds[2], dateLimite: dateLimite14j, statut: 'en_attente', score: 96 },
      { article: articleIds[3], expert: expertIds[0], dateLimite: dateLimite14j, statut: 'en_attente', score: 87 },
      
      // Article 5: GNN -> Experts Data Science/ML
      { article: articleIds[4], expert: expertIds[3], dateLimite: dateLimite21j, statut: 'en_cours', score: 91 },
      
      // Article 6: Blockchain Healthcare -> Experts Security
      { article: articleIds[5], expert: expertIds[4], dateLimite: dateLimite30j, statut: 'en_attente', score: 94 },
      
      // Article 7: Drone RL -> Experts RL/Robotics
      { article: articleIds[6], expert: expertIds[7], dateLimite: dateLimite14j, statut: 'en_cours', score: 97 },
      { article: articleIds[6], expert: expertIds[0], dateLimite: dateLimite14j, statut: 'en_attente', score: 89 },
      
      // Article 8: IoT Anomaly -> Experts IoT/Data
      { article: articleIds[7], expert: expertIds[6], dateLimite: dateLimite21j, statut: 'termine', score: 93 },
      { article: articleIds[7], expert: expertIds[3], dateLimite: dateLimite21j, statut: 'en_attente', score: 86 }
    ];

    const assignationIds = [];
    for (const assign of assignations) {
      const [res] = await db.query(
        'INSERT INTO assignation (id_article, id_expert, date_limite, statut_assignation, score_pertinence) VALUES (?, ?, ?, ?, ?)',
        [assign.article, assign.expert, assign.dateLimite, assign.statut, assign.score]
      );
      assignationIds.push(res.insertId);
      console.log(`✓ Assignation: Article ${assign.article} → Expert ${assign.expert} (Statut: ${assign.statut}, Score: ${assign.score})`);
    }

    // 6. Insert Reviews (pour les assignations terminées et certaines en_cours)
    console.log('\n⭐ Création des reviews...\n');
    const reviews = [
      {
        assignation: assignationIds[4], // Federated Learning - Expert AI
        article: articleIds[2],
        commentaires: 'Excellent travail sur la préservation de la confidentialité. Méthodologie solide et résultats convaincants. Quelques suggestions mineures pour améliorer la section expérimentale.',
        recommandation: 'accepter',
        noteGlobale: 9
      },
      {
        assignation: assignationIds[5], // Federated Learning - Expert Security
        article: articleIds[2],
        commentaires: 'Approche innovante avec une forte contribution à la sécurité des données. Les aspects cryptographiques sont bien traités. Je recommande une publication avec révisions mineures.',
        recommandation: 'reviser',
        noteGlobale: 8
      },
      {
        assignation: assignationIds[12], // IoT Anomaly - Expert IoT
        article: articleIds[7],
        commentaires: 'Très bonne application pratique pour les smart cities. Les algorithmes sont bien adaptés aux contraintes IoT. Dataset complet et résultats reproductibles.',
        recommandation: 'accepter',
        noteGlobale: 9
      },
      {
        assignation: assignationIds[0], // Medical Imaging - Expert AI (en_cours avec review)
        article: articleIds[0],
        commentaires: 'Article prometteur sur le diagnostic médical. L\'architecture CNN est bien conçue. Cependant, il manque une validation sur d\'autres types d\'images médicales pour renforcer la généralisation.',
        recommandation: 'reviser',
        noteGlobale: 7
      }
    ];

    for (const review of reviews) {
      const [res] = await db.query(
        'INSERT INTO review (id_assignation, id_article, commentaires, recommandation, note_globale, date_soumission_review) VALUES (?, ?, ?, ?, ?, NOW())',
        [review.assignation, review.article, review.commentaires, review.recommandation, review.noteGlobale]
      );
      console.log(`✓ Review créée pour assignation ${review.assignation} (Note: ${review.noteGlobale}/10, Recommandation: ${review.recommandation})`);
    }

    // 7. Résumé final
    console.log('\n═══════════════════════════════════════════════════════');
    console.log('✅ Base de données réinitialisée et peuplée avec succès!');
    console.log('═══════════════════════════════════════════════════════\n');
    
    console.log('📊 RÉSUMÉ DES DONNÉES:');
    console.log('─────────────────────────────────────────────────────');
    console.log(`👤 Utilisateurs:`);
    console.log(`   • 1 Administrateur`);
    console.log(`   • ${auteurs.length} Auteurs`);
    console.log(`   • ${experts.length} Experts`);
    console.log(`   • TOTAL: ${1 + auteurs.length + experts.length} utilisateurs\n`);
    
    console.log(`📄 Articles: ${articles.length} articles scientifiques`);
    console.log(`📋 Assignations: ${assignations.length} assignations`);
    console.log(`   • En attente: ${assignations.filter(a => a.statut === 'en_attente').length}`);
    console.log(`   • En cours: ${assignations.filter(a => a.statut === 'en_cours').length}`);
    console.log(`   • Terminées: ${assignations.filter(a => a.statut === 'termine').length}\n`);
    
    console.log(`⭐ Reviews: ${reviews.length} reviews soumises`);
    console.log(`   • Accepter: ${reviews.filter(r => r.recommandation === 'accepter').length}`);
    console.log(`   • Réviser: ${reviews.filter(r => r.recommandation === 'reviser').length}\n`);
    
    console.log('─────────────────────────────────────────────────────');
    console.log('🔐 COMPTES DE TEST:');
    console.log('─────────────────────────────────────────────────────');
    console.log('Admin:');
    console.log('  📧 Email: admin@peerconnect.com');
    console.log('  🔑 Mot de passe: admin123\n');
    console.log('Auteur:');
    console.log('  📧 Email: jean.dupont@university.fr');
    console.log('  🔑 Mot de passe: auteur123\n');
    console.log('Expert:');
    console.log('  📧 Email: emma.fontaine@expert.fr');
    console.log('  🔑 Mot de passe: expert123\n');
    console.log('═══════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Erreur lors du reset/seed:', error);
    throw error;
  } finally {
    process.exit(0);
  }
}

resetAndSeedDatabase();

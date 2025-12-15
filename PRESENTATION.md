# 🔗 PeerConnect - Plateforme de Peer Review Scientifique

## 📋 Présentation de l'Application

**PeerConnect** est une plateforme moderne de gestion de revues par pairs (peer review) pour articles scientifiques. Elle facilite la collaboration entre auteurs, experts et administrateurs dans le processus de révision scientifique.

---

## 🎯 Objectifs

- **Soumettre** des articles scientifiques pour révision
- **Assigner** automatiquement des experts qualifiés basés sur leurs domaines d'expertise
- **Gérer** le processus de révision avec suivi en temps réel
- **Évaluer** la qualité des articles via un système de notation
- **Administrer** la plateforme et superviser les workflows

---

## 👥 Rôles et Fonctionnalités

### 🟢 **Auteur**
Les auteurs peuvent :
- ✍️ Créer et soumettre des articles scientifiques
- 📤 Soumettre des articles pour révision par des experts
- 📊 Suivre l'état de leurs articles (en attente, en cours, terminé)
- 📋 Consulter l'historique des assignations et reviews
- 📈 Visualiser les statistiques de leurs soumissions
- 👤 Gérer leur profil

**Workflow Auteur:**
1. Créer un article avec titre, résumé, mots-clés et fichier PDF
2. Sélectionner l'article à soumettre pour review
3. Choisir jusqu'à 5 experts (système de pagination)
4. Définir une date limite optionnelle
5. Soumettre et suivre l'avancement

### 🔵 **Expert**
Les experts peuvent :
- 📥 Consulter les articles qui leur sont assignés
- ✅ Accepter ou refuser des assignations
- ⭐ Soumettre des reviews avec notation et commentaires
- 📊 Visualiser leurs statistiques (nombre de reviews, score de crédibilité)
- 📄 Gérer leur CV et domaines d'expertise
- 👤 Mettre à jour leur profil et disponibilité

**Workflow Expert:**
1. Recevoir une assignation d'article
2. Consulter l'article et les détails
3. Évaluer l'article (qualité, originalité, clarté)
4. Soumettre une recommandation (accepter/réviser/rejeter)
5. Obtenir une mise à jour du score de crédibilité

### 🟣 **Administrateur**
Les administrateurs peuvent :
- 👥 Gérer les utilisateurs (auteurs, experts)
- ✅ Valider ou rejeter les inscriptions d'experts
- 📊 Superviser tous les articles et leur workflow
- 📈 Consulter les statistiques globales de la plateforme
- 🔄 Gérer les assignations et leur statut
- 👤 Modifier les profils utilisateurs

**Workflow Admin:**
1. Valider les nouveaux experts
2. Superviser le workflow des articles
3. Gérer les assignations problématiques
4. Consulter les métriques de performance

---

## 🏗️ Architecture Technique

### **Frontend (Angular 18+)**
- **Framework:** Angular standalone components
- **Styling:** Tailwind CSS avec design system personnalisé
- **Routing:** Module-based routing (lazy loading)
- **State Management:** Services + LocalStorage
- **HTTP:** HttpClient pour les appels API

**Structure:**
```
client/src/app/
├── admin/          # Module admin (dashboard, users, workflow)
├── auteur/         # Module auteur (articles, submissions)
├── expert/         # Module expert (assignments, reviews)
├── auth/           # Authentification (login, register)
├── shared/         # Composants partagés (header)
└── services/       # Services (storage, HTTP)
```

### **Backend (Node.js + Express)**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MySQL avec mysql2
- **Security:** bcryptjs pour le hashing des mots de passe
- **API:** RESTful architecture

**Structure:**
```
server/
├── config/         # Configuration DB
├── controllers/    # Logique métier
├── models/         # Modèles de données
├── routes/         # Routes API
└── scripts/        # Scripts utilitaires (seed, reset)
```

### **Base de Données (MySQL)**
Tables principales:
- `utilisateur` - Utilisateurs (admin, auteur, expert)
- `article` - Articles scientifiques
- `assignation` - Assignations article ↔ expert
- `review` - Évaluations d'articles
- `expert` - Profils experts (domaines, score)
- `auteur` - Profils auteurs
- `admin` - Profils administrateurs

---

## 🎨 Design System

### **Palette de Couleurs**
- **Primary (Sky):** Boutons principaux, liens, accents
- **Success (Emerald):** Actions positives, validations
- **Warning (Amber):** Alertes, en attente
- **Danger (Red):** Suppressions, erreurs
- **Neutral (Slate):** Textes, backgrounds, bordures

### **Composants Réutilisables**
- `.card` / `.card-body` - Cartes de contenu
- `.btn` (primary/secondary/ghost/danger) - Boutons
- `.badge` (success/warning/danger/info/neutral) - Labels
- `.input` / `.select` / `.textarea` - Formulaires
- `.table-wrap` / `.table` - Tableaux responsive

### **Features UI**
- ✅ Design responsive (mobile-first)
- ✅ Pagination (5 éléments par page)
- ✅ Modals pour historique et détails
- ✅ Filtres et recherche avancée
- ✅ Stats en temps réel avec badges colorés
- ✅ Navigation par rôle (pill-style)

---

## 📊 Données de Test

Après l'exécution du script `reset-and-seed.js`, la base de données contient:

### **Utilisateurs (14 total)**
- **1 Admin:** admin@peerconnect.com
- **5 Auteurs:** chercheurs de différentes institutions
- **8 Experts:** spécialistes dans divers domaines AI/ML

### **Articles (8 total)**
Domaines variés:
- Medical Imaging & Deep Learning
- NLP & Code Generation
- Federated Learning & Privacy
- Computer Vision & Object Detection
- Graph Neural Networks
- Blockchain & Healthcare
- Reinforcement Learning & Robotics
- IoT & Anomaly Detection

### **Assignations (14 total)**
- **En attente:** 8 assignations
- **En cours:** 3 assignations (dont 1 avec review)
- **Terminées:** 3 assignations (avec reviews)

### **Reviews (4 total)**
- **Accepter:** 2 reviews
- **Réviser:** 2 reviews
- Notes globales entre 7/10 et 9/10

---

## 🚀 Installation et Démarrage

### **Prérequis**
- Node.js (v18+)
- MySQL (v8+)
- npm ou yarn

### **1. Configuration de la Base de Données**

```bash
# Créer la base de données MySQL
mysql -u root -p
CREATE DATABASE peerconnect_db;
USE peerconnect_db;

# Importer le schéma (si vous avez un fichier schema.sql)
# source schema.sql;
```

### **2. Installation Backend**

```bash
cd server
npm install

# Variables d'environnement (.env)
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=peerconnect_db

# Réinitialiser et peupler la base de données
node scripts/reset-and-seed.js

# Démarrer le serveur
npm start
# Serveur sur http://localhost:3000
```

### **3. Installation Frontend**

```bash
cd client
npm install

# Démarrer l'application Angular
npm run start
# Application sur http://localhost:4200
```

---

## 🔐 Comptes de Test

### **Administrateur**
```
📧 Email: admin@peerconnect.com
🔑 Mot de passe: admin123
```

### **Auteur**
```
📧 Email: jean.dupont@university.fr
🔑 Mot de passe: auteur123
```

### **Expert**
```
📧 Email: emma.fontaine@expert.fr
🔑 Mot de passe: expert123
```

---

## 📖 Guide d'Utilisation

### **Pour les Auteurs:**

1. **Connexion:** Utilisez un compte auteur
2. **Créer un Article:**
   - Aller dans "Mes articles"
   - Cliquer sur "Créer" (formulaire collapsible)
   - Remplir titre, résumé, mots-clés
   - Uploader le PDF
   - Enregistrer

3. **Soumettre pour Review:**
   - Aller dans "Soumettre un article"
   - Sélectionner votre article (pagination 5/page)
   - Choisir jusqu'à 5 experts (filtres par domaine/recherche)
   - Optionnel: définir une date limite
   - Soumettre

4. **Suivre l'avancement:**
   - Voir les stats (en attente, en cours, terminé)
   - Consulter l'historique via bouton "📋 Historique"
   - Visualiser les reviews et recommandations

### **Pour les Experts:**

1. **Connexion:** Utilisez un compte expert
2. **Consulter Assignations:**
   - Aller dans "Mes Assignations"
   - Voir la liste des articles assignés
   - Filtrer par statut

3. **Soumettre une Review:**
   - Aller dans "Soumettre un review"
   - Sélectionner l'assignation
   - Lire l'article (lien PDF)
   - Évaluer: note globale + commentaires
   - Choisir recommandation (accepter/réviser/rejeter)
   - Soumettre

4. **Gérer Profil:**
   - Mettre à jour domaines d'expertise
   - Uploader CV
   - Gérer disponibilité

### **Pour les Admins:**

1. **Connexion:** Utilisez le compte admin
2. **Dashboard:**
   - Voir statistiques globales
   - Nombre d'experts/articles/assignations

3. **Gérer Experts:**
   - Valider nouvelles inscriptions
   - Modifier scores de crédibilité
   - Activer/désactiver disponibilité

4. **Workflow Articles:**
   - Superviser tous les articles
   - Voir détails des assignations
   - Gérer les problèmes

---

## 🔄 Workflow Complet (Exemple)

```
1. 👨‍🔬 Auteur crée un article
   └─> "Deep Learning for Medical Imaging"

2. 📤 Auteur soumet pour review
   └─> Sélectionne 3 experts (AI, ML, CV)
   └─> Date limite: 14 jours

3. 📋 Assignations créées
   └─> Expert 1: en_attente
   └─> Expert 2: en_attente
   └─> Expert 3: en_attente

4. 👨‍💼 Expert 1 accepte et soumet review
   └─> Note: 8/10
   └─> Recommandation: "reviser"
   └─> Statut: termine

5. 👨‍💼 Expert 2 soumet review
   └─> Note: 9/10
   └─> Recommandation: "accepter"
   └─> Statut: termine

6. 👨‍🔬 Auteur consulte les reviews
   └─> Voit les recommandations
   └─> Apporte modifications si nécessaire

7. 👨‍💻 Admin supervise le workflow
   └─> Valide le processus
   └─> Gère les métriques
```

---

## 📈 Statistiques et Métriques

### **Auteur:**
- Nombre total d'articles
- Articles en révision
- Assignations en attente/en cours/terminées
- Taux de recommandations (accepter/réviser/rejeter)

### **Expert:**
- Nombre de reviews soumises
- Score de crédibilité (0-100)
- Nombre d'assignations actives
- Taux d'acceptation

### **Admin:**
- Utilisateurs totaux (auteurs/experts)
- Articles totaux
- Assignations par statut
- Reviews par recommandation

---

## 🛠️ Scripts Utilitaires

### **Réinitialiser la base de données:**
```bash
cd server
node scripts/reset-and-seed.js
```

Ce script:
1. ✅ Vide toutes les tables (sauf structure)
2. ✅ Réinitialise les auto-increment
3. ✅ Crée 1 admin, 5 auteurs, 8 experts
4. ✅ Génère 8 articles scientifiques
5. ✅ Crée 14 assignations pertinentes
6. ✅ Ajoute 4 reviews réalistes

### **Ancien script seed (conservé):**
```bash
node scripts/seed.js  # Ajoute des données sans vider
```

---

## 🔧 Technologies Utilisées

### **Frontend:**
- Angular 18+
- TypeScript
- Tailwind CSS
- RxJS
- Angular Router
- FormsModule

### **Backend:**
- Node.js
- Express.js
- MySQL (mysql2)
- bcryptjs
- CORS
- Body-parser

### **DevOps:**
- npm scripts
- Angular CLI
- Nodemon (dev)

---

## 📁 Structure des Fichiers

```
PeerConnect-Project/
│
├── client/                 # Application Angular
│   ├── src/
│   │   ├── app/
│   │   │   ├── admin/     # Module admin
│   │   │   ├── auteur/    # Module auteur
│   │   │   ├── expert/    # Module expert
│   │   │   ├── auth/      # Authentification
│   │   │   ├── shared/    # Composants partagés
│   │   │   └── services/  # Services
│   │   ├── styles.css     # Design system global
│   │   └── index.html
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                 # API Node.js
│   ├── config/            # Configuration DB
│   ├── controllers/       # Logique métier
│   ├── models/            # Modèles
│   ├── routes/            # Routes API
│   ├── scripts/           # Scripts utilitaires
│   │   ├── seed.js
│   │   └── reset-and-seed.js
│   ├── uploads/           # Fichiers uploadés
│   ├── server.js          # Point d'entrée
│   └── package.json
│
└── PRESENTATION.md         # Ce fichier
```

---

## 🚨 Résolution de Problèmes

### **Erreur de connexion DB:**
```
⚠️ Connexion à la base de données échouée
```
**Solution:**
- Vérifier que MySQL est démarré
- Vérifier les credentials dans `.env`
- Vérifier que `peerconnect_db` existe

### **Erreur de compilation Angular:**
```
NG5002: Unexpected closing tag
```
**Solution:**
- Vérifier les balises HTML ouvrantes/fermantes
- Relancer `npm run start`

### **Erreur CORS:**
```
Access-Control-Allow-Origin
```
**Solution:**
- Le backend autorise `http://localhost:4200`
- Vérifier que le frontend tourne sur le bon port

---

## 📞 Support

Pour toute question ou problème:
1. Vérifier cette documentation
2. Consulter les logs serveur/client
3. Vérifier la structure de la BD
4. Relancer le script `reset-and-seed.js`

---

## 📝 Notes Importantes

- ⚠️ Les données de test sont **réinitialisées** à chaque exécution de `reset-and-seed.js`
- ⚠️ Les mots de passe sont **hashés** avec bcrypt (10 rounds)
- ⚠️ Les fichiers PDF référencés n'existent pas physiquement (nom symbolique)
- ⚠️ Les domaines d'expertise sont **textuels** (pas de table séparée)
- ⚠️ Le score de pertinence d'assignation est **manuel** (pas d'algorithme ML)

---

## 🎓 Cas d'Usage Pédagogiques

Cette application peut servir de base pour:
- ✅ Apprendre Angular + Node.js
- ✅ Comprendre les architectures RESTful
- ✅ Pratiquer le design responsive
- ✅ Implémenter un système de rôles
- ✅ Gérer des workflows complexes
- ✅ Utiliser Tailwind CSS avancé

---

## 📜 Licence

Ce projet est à but éducatif.

---

**Développé avec ❤️ pour la recherche scientifique**

🔗 **PeerConnect** - Connecter chercheurs et experts pour une science de qualité

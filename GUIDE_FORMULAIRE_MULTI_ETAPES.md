# 📋 Guide: Formulaire Multi-Étapes - Soumettre un Article

## 🎯 Vue d'ensemble

Le formulaire "Soumettre un Article pour Review" a été transformé en un **formulaire pas à pas (stepper)** qui guide l'utilisateur à travers 4 étapes clairement défini ". Chaque étape doit être complétée avant de passer à la suivante.

---

## 🔄 Les 4 Étapes

### **Étape 1️⃣ : Sélectionnez votre article**

**Objectif:** Choisir l'article scientifique à soumettre pour révision

**Affichage:**
- Liste des articles en pagination (5 articles par page)
- Chaque article affiche:
  - Titre
  - Date de soumission (jj/MM/yyyy)
  - Résumé partiel
  - Lien PDF
  - Nombre d'assignations existantes

**Validation:**
- ✅ Un article DOIT être sélectionné pour continuer
- ✅ Article sélectionné : bordure bleue + checkmark ✓
- ✅ Bouton "Continuer" activé uniquement si article sélectionné

**Navigation:**
```
Pagination interne (5/page):
← Précédent | Page X sur Y | Suivant pagination →

Navigation étapes:
[← Annuler] [Continuer vers experts →]
```

---

### **Étape 2️⃣ : Choisissez jusqu'à 5 experts**

**Objectif:** Sélectionner les experts qui évalueront l'article

**Affichage:**
- Rappel de l'article sélectionné en haut (card verte)
- Filtres:
  - 🔍 Recherche par nom/email
  - Filtre par domaine d'expertise
- Grid des experts (2 colonnes en responsive)
  - Nom de l'expert
  - Email
  - Score de crédibilité (⭐ /100)
  - Domaines d'expertise
- Compteur d'experts sélectionnés (ex: **3 expert(s) sélectionné(s) (max 5)**)
- Pagination (5 experts par page)

**Validation:**
- ✅ Minimum 1 expert DOIT être sélectionné
- ✅ Maximum 5 experts
- ✅ Expert sélectionné : bordure bleue + "✓ Sélectionné"

**Navigation:**
```
Pagination interne (5/page):
← Précédent | Page X sur Y (N expert(s) au total) | Suivant pagination →

Navigation étapes:
[← Retour aux articles] [Continuer à la date →]
```

---

### **Étape 3️⃣ : Fixez une date limite (optionnelle)**

**Objectif:** Définir la date limite pour les experts (optionnel)

**Affichage:**
- Résumé des sélections (carton gris):
  - Article sélectionné
  - Nombre d'experts: N/5
  - Liste des experts (badges bleus)
- Input date (format: jj/mm/aaaa)
- Info: "Laisser vide pour aucune limite"
- Affichage de la date sélectionnée si remplie (card bleue)

**Validation:**
- ✅ Date limite OPTIONNELLE
- ✅ Validation côté client automatique (HTML5)

**Navigation:**
```
Navigation étapes:
[← Retour aux experts] [Continuer au résumé →]
```

---

### **Étape 4️⃣ : Vérifiez et soumettez**

**Objectif:** Vérifier tous les paramètres avant soumission finale

**Affichage:**
- Résumé complet en 3 sections:

  1️⃣ **Article sélectionné:**
  - Titre (grand, gras)
  - Date de soumission
  - Résumé complet
  
  2️⃣ **Experts assignés (N/5):**
  - Grid 2 colonnes avec chaque expert:
    - Nom (gras)
    - Email (📧)
    - Score de crédibilité (⭐ /100)
    - Domaines (📚)
  
  3️⃣ **Date limite:**
  - Date affichée si remplie
  - "Aucune date limite définie" sinon

**Navigation:**
```
Navigation étapes:
[← Retour à la date limite] [✓ Confirmer la soumission]
```

---

## 📊 Barre de Progression

En haut du formulaire:

```
Étape 1 sur 4 - Sélectionnez votre article
━━ ━━ ━━ ━━  (4 barres: 1 remplie, 3 vides)

Étape 2 sur 4 - Choisissez les experts
━━ ━━ ━━ ━━  (4 barres: 2 remplies, 2 vides)

Étape 3 sur 4 - Définissez la date limite
━━ ━━ ━━ ━━  (4 barres: 3 remplies, 1 vide)

Étape 4 sur 4 - Confirmez la soumission
━━ ━━ ━━ ━━  (4 barres: toutes remplies)
```

---

## 🎮 Interaction Utilisateur

### **Mouvements Forward (Suivant)**

```
Étape 1 → Étape 2
  ✅ Condition: Un article sélectionné
  ❌ Sinon: Alerte "Veuillez sélectionner un article"

Étape 2 → Étape 3
  ✅ Condition: Au moins 1 expert sélectionné
  ❌ Sinon: Alerte "Veuillez sélectionner au moins un expert"

Étape 3 → Étape 4
  ✅ Pas de validation (date optionnelle)

Étape 4 → Soumission
  ✅ Bouton "Confirmer" lance submitToExpert()
```

### **Mouvements Backward (Retour)**

```
Étape 2 ← Étape 1
  ✅ Garder la sélection de l'article

Étape 3 ← Étape 2
  ✅ Garder les experts sélectionnés

Étape 4 ← Étape 3
  ✅ Garder la date limite

Annuler (Étape 1):
  ✅ Remet à 0: Aucun article sélectionné
  ✅ Réinitialise le formulaire
```

---

## 💾 État du Formulaire

Tout l'état est **conservé pendant la navigation**:

```typescript
currentStep: number         // Étape actuelle (1-4)
selectedArticleId: number   // Article choisi (persiste)
selectedExpertIds: number[] // Experts choisis (persiste)
dateLimite: string         // Date limite (persiste)

// Aussi conservés:
articlePage: number         // Page de pagination articles
expertPage: number          // Page de pagination experts
searchExpert: string        // Recherche d'experts
filterDomain: string        // Filtre domaine
```

**Comportement:** L'utilisateur peut revenir à l'étape 1, naviguer en pagination, puis retourner à l'étape 4 - ses sélections restent inchangées.

---

## 📱 Responsive Design

### **Mobile (< 768px)**
- Grid experts: 1 colonne
- Boutons: stack vertical (100% width)
- Résumé final: 1 colonne

### **Tablette (768px - 1024px)**
- Grid experts: 2 colonnes
- Boutons: 2 colonnes si espace
- Résumé final: 1-2 colonnes

### **Desktop (> 1024px)**
- Grid experts: 2 colonnes
- Boutons: 2 colonnes
- Résumé final: 2 colonnes

---

## 🎨 Design & Couleurs

### **Étape Active:**
- Titre: Gris foncé (slate-900) - 2xl
- Fond: Blanc (white)
- Bordure: Slate-200
- Boutons primaires: Sky/Primary blue

### **Barres de Progression:**
- Complétées: `bg-primary-500` (bleu vif)
- Non-complétées: `bg-slate-200` (gris clair)

### **Sélections:**
- Sélectionné: Bordure `border-primary-500`, fond `bg-primary-50`
- Non-sélectionné: Bordure `border-slate-200`, fond blanc

### **Étape 4 (Résumé):**
- Gradient: `from-emerald-50 to-sky-50`
- Contenu: Fond blanc, bordure slate

---

## ✨ Fonctionnalités Clés

### **Historique Modal**
- Bouton 📋 "Historique" en haut-droit (indépendant du formulaire)
- Affiche toutes les assignations précédentes
- Modal avec recherche possible

### **Validations**
- Côté template (buttons disabled)
- Côté composant (conditions nextStep())

### **Messages Utilisateur**
- Barre de progression visuelle
- Labels clairs pour chaque étape
- Résumés des choix à chaque étape

---

## 🔧 Technologie

### **Fichiers impactés:**

**submit-article.ts:**
```typescript
currentStep = 1;  // État de l'étape
nextStep()        // Navigation forward
prevStep()        // Navigation backward
goToStep(step)    // Jump à une étape (si besoin futur)
```

**submit-article.html:**
```html
<!-- Barre de progression -->
<div *ngIf="currentStep === 1">Étape 1</div>
<div *ngIf="currentStep === 2">Étape 2</div>
<div *ngIf="currentStep === 3">Étape 3</div>
<div *ngIf="currentStep === 4">Étape 4</div>
```

### **Directives Angular utilisées:**
- `*ngIf` pour l'affichage conditionnel des étapes
- `(click)` pour les événements
- `[(ngModel)]` pour les liaisons bidirectionnelles
- `[disabled]` pour les validations

---

## 📋 Cas d'Usage - Exemple Complet

```
1. Utilisateur ouvre "Soumettre un Article"
   ↓ Affiche Étape 1 avec liste des articles

2. Sélectionne "Deep Learning for Medical Imaging"
   ↓ Checkmark ✓ apparaît
   ↓ Bouton "Continuer" devient actif (bleu)

3. Clique "Continuer vers experts →"
   ↓ Affiche Étape 2 avec rappel de l'article
   ↓ Liste des 8 experts disponibles

4. Cherche "Dr. Emma" via recherche
   ↓ Filtre les experts
   ↓ Sélectionne Dr. Emma Fontaine
   ↓ Badge "3 expert(s) sélectionné(s) (max 5)" apparaît

5. Clique "Continuer à la date →"
   ↓ Affiche Étape 3
   ↓ Résumé avec Dr. Emma sélectionnée

6. Entre date: 31/12/2025
   ↓ Card bleue: "📅 Date limite: 31/12/2025"

7. Clique "Continuer au résumé →"
   ↓ Affiche Étape 4 avec résumé complet

8. Revoit les choix, clique "✓ Confirmer"
   ↓ Appel submitToExpert()
   ↓ Assignations créées en base de données
   ↓ Page reset (currentStep = 1)
```

---

## 🚀 Avantages du Formulaire Multi-Étapes

✅ **Clarté:** Chaque étape a une seule mission  
✅ **Progressif:** L'utilisateur n'est pas surcharge  
✅ **Validation:** Validation étape-par-étape  
✅ **Retour:** Possibilité de revenir modifier  
✅ **Résumé:** Vérification avant soumission finale  
✅ **Visuelle:** Barre de progression montre l'avancée  
✅ **Mobile:** Responsive et lisible sur petit écran  

---

## 📌 Notes Importantes

- ⚠️ Les données du formulaire persisten lors de la navigation entre étapes
- ⚠️ Le reset du formulaire se fait APRÈS la soumission réussie
- ⚠️ La pagination des articles/experts est indépendante (ne reset pas en changeant d'étape)
- ⚠️ Le bouton "Historique" est accessible depuis TOUTES les étapes
- ⚠️ Les experts sont filtrés/paginés dynamiquement, mais les sélections persisten

---

## 🔍 Débogage

Pour vérifier l'état du formulaire en console:

```typescript
// Dans la console Angular:
document.querySelector('app-submit-article').currentStep  // Étape actuelle
document.querySelector('app-submit-article').selectedArticleId  // Article
document.querySelector('app-submit-article').selectedExpertIds  // Experts
document.querySelector('app-submit-article').dateLimite  // Date
```

---

**✨ Formulaire multi-étapes optimisé pour une meilleure UX!**

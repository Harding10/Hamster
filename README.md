<div align="center">
  <img src="public/icon.png" alt="QbLog Logo" width="120" />
  <h1>🧠 QbLog — Second Brain Ecosystem</h1>
  <p><strong>Une interface neurale pour architectes logiciels.</strong><br/>Documentez le futur, maîtrisez le présent.</p>

  <br/>

  ![Next.js](https://img.shields.io/badge/Next.js-15.5-black?style=for-the-badge&logo=next.js)
  ![Firebase](https://img.shields.io/badge/Firebase-11.10-orange?style=for-the-badge&logo=firebase)
  ![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=for-the-badge&logo=tailwindcss)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)
  ![Cloudinary](https://img.shields.io/badge/Cloudinary-Media-3448c5?style=for-the-badge&logo=cloudinary)

</div>

---

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Stack Technique](#-stack-technique)
- [Installation](#-installation)
- [Variables d'environnement](#-variables-denvironnement)
- [Structure du projet](#-structure-du-projet)
- [Scripts disponibles](#-scripts-disponibles)
- [Licence](#-licence)

---

## 🌟 Aperçu

**QbLog** est une plateforme SaaS premium de productivité conçue pour les développeurs et architectes logiciels. Elle centralise vos notes techniques, le suivi de bugs, la gestion de liens, le stockage de fichiers et la planification dans une interface sombre, moderne et performante.

L'application utilise **Firebase** pour l'authentification et la base de données en temps réel, **Cloudinary** pour le stockage des médias, et intègre l'**IA Gemini** via Genkit pour l'assistance intelligente.

---

## ✨ Fonctionnalités

### 📊 Tableau de Bord
- Vue d'ensemble de toutes vos données avec statistiques en temps réel
- Graphique d'activité hebdomadaire interactif (Recharts)
- Cartes de statistiques animées avec Framer Motion
- Suggestions IA contextuelles

### 📝 Journal Tech
- Éditeur Markdown avancé (MDXEditor) avec support complet : titres, listes, tableaux, liens, images, blocs de code
- Upload d'images directement dans l'éditeur via **Cloudinary**
- Système de **favoris** (⭐) avec tri automatique des notes favorites en tête
- Formatage IA automatique des notes via Gemini
- Thème de l'éditeur synchronisé avec le mode sombre/clair
- Affichage responsive : 2 cartes côte à côte sur mobile

### 🐛 Suivi des Bugs
- Interface Kanban pour le suivi de l'état des anomalies
- Catégorisation par priorité et statut

### 🔑 Coffre de Code (Snippets)
- Sauvegarde et organisation de vos extraits de code
- Coloration syntaxique intégrée

### 🔗 Nexus de Liens
- Gestionnaire de favoris/bookmarks par catégorie
- Affichage horizontal avec favicon automatique
- Recherche instantanée par label, URL ou catégorie

### 📁 Fichiers
- Upload de fichiers (images & documents) sur **Cloudinary**
- Presets séparés pour images et documents PDF

### 📅 Agenda
- Calendrier mensuel interactif avec vue grille et vue liste
- Création d'événements en cliquant sur une date
- Numéros de semaine et navigation fluide
- Analyse IA de votre planification

### 💪 Suivi des Habitudes
- Tracker de discipline personnelle

### 👤 Profil & Paramètres
- Gestion du profil utilisateur
- Configuration de l'application

---

## 🛠 Stack Technique

| Technologie | Usage |
|---|---|
| **Next.js 15.5** | Framework React (App Router) |
| **TypeScript 5** | Typage statique |
| **Tailwind CSS 3.4** | Styling utilitaire |
| **Firebase 11** | Auth + Firestore (base de données temps réel) |
| **Cloudinary** | Stockage et CDN pour images & documents |
| **Genkit + Gemini** | IA générative (structuration de notes) |
| **MDXEditor** | Éditeur Markdown WYSIWYG |
| **Framer Motion** | Animations et transitions |
| **Recharts** | Graphiques et visualisations |
| **Radix UI** | Composants UI accessibles (Dialog, Dropdown, etc.) |
| **Lucide React** | Icônes |
| **date-fns** | Manipulation de dates |

---

## 🚀 Installation

### Prérequis

- **Node.js** ≥ 18
- **npm** ou **yarn**
- Un projet [Firebase](https://console.firebase.google.com/) configuré (Auth + Firestore)
- Un compte [Cloudinary](https://cloudinary.com/) avec des presets non signés

### Étapes

```bash
# 1. Cloner le dépôt
git clone https://github.com/Harding10/Hamster.git
cd Hamster

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp .env.example .env
# Puis remplir les valeurs (voir section suivante)

# 4. Lancer le serveur de développement
npm run dev
```

L'application sera disponible sur [http://localhost:3000](http://localhost:3000).

---

## 🔐 Variables d'environnement

Créez un fichier `.env` à la racine du projet avec les variables suivantes :

```env
# ── Gemini AI ──
GEMINI_API_KEY=your_gemini_api_key

# ── Firebase ──
NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# ── Cloudinary ──
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your_cloud_name
NEXT_PUBLIC_CLOUDINARY_PRESET_IMAGES="your_images_preset"
NEXT_PUBLIC_CLOUDINARY_PRESET_DOCUMENTS="your_documents_preset"
```

> ⚠️ **Important** : Ne commitez jamais votre fichier `.env` contenant vos clés réelles. Ajoutez-le à votre `.gitignore`.

---

## 📁 Structure du projet

```
src/
├── app/                    # Pages (App Router)
│   ├── page.tsx            # Tableau de bord
│   ├── login/              # Authentification
│   ├── notes/              # Journal Tech (éditeur + bibliothèque)
│   ├── bugs/               # Suivi des Bugs
│   ├── snippets/           # Coffre de Code
│   ├── links/              # Nexus de Liens
│   ├── files/              # Gestionnaire de Fichiers
│   ├── agenda/             # Agenda / Planning
│   ├── addictions/         # Suivi des Habitudes
│   ├── profile/            # Profil utilisateur
│   ├── settings/           # Paramètres
│   ├── ai/                 # Routes IA
│   └── globals.css         # Design system global
├── ai/                     # Flows Genkit (IA)
├── components/
│   ├── AppSidebar.tsx      # Navigation principale
│   ├── NoteCard.tsx        # Carte de note (design Uiverse)
│   ├── LoadingHamster.tsx  # Animation de chargement
│   ├── Editor/             # MDXEditor (wrapper + config)
│   └── ui/                 # Composants Shadcn/Radix
├── firebase/               # Configuration Firebase
├── hooks/                  # Hooks personnalisés
└── lib/                    # Utilitaires
```

---

## 📜 Scripts disponibles

| Commande | Description |
|---|---|
| `npm run dev` | Lance le serveur de développement (port 3000) |
| `npm run build` | Build de production |
| `npm run start` | Lance le serveur de production |
| `npm run lint` | Vérifie le code avec ESLint |
| `npm run typecheck` | Vérifie les types TypeScript |
| `npm run genkit:dev` | Lance le serveur Genkit IA en développement |

---

## 🎨 Design System

QbLog utilise un design system premium inspiré des interfaces modernes de type **Vercel / Linear** :

- **Mode sombre par défaut** avec support du mode clair
- **Glassmorphism** : surfaces semi-transparentes avec flou (`backdrop-blur`)
- **Typographie** : Police Inter avec variantes headline
- **Palette** : Violet/Orange (primary) sur fond noir profond (`#000000`)
- **Animations** : Transitions fluides via Framer Motion
- **Cartes Uiverse** : Design de cartes avec dégradés colorés et découpe diagonale

---

## 📄 Licence

Ce projet est privé. Tous droits réservés © 2026 QbLog.

---

<div align="center">
  <br/>
  <strong>Built with 🧡 by <a href="https://github.com/Harding10">Harding10</a></strong>
  <br/><br/>
</div>

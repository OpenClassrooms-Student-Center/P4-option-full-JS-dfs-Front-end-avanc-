# Abricot.co — API back-end (Node.js / Express)

API REST de l'application **Abricot.co**, SaaS de gestion de projets et de tâches.
Ce dépôt est le **starter back-end de l'option Full JS** : une partie de l'API est déjà opérationnelle,
une pull request d'un collègue est en attente de revue, et certaines fonctionnalités restent à développer.

> Stack : Node.js 20+, Express 5, Prisma 6 (SQLite), JWT, Swagger (OpenAPI 3).

---

## 🚀 Installation et démarrage

```bash
# 1. Variables d'environnement : copiez le fichier d'exemple puis changez JWT_SECRET
cp .env.example .env

# 2. Dépendances
npm install

# 3. Base de données : génération du client Prisma, migrations et jeu de données de test
npm run setup

# 4. Serveur de développement (rechargement automatique)
npm run dev
```

- API : http://localhost:8000
- Documentation interactive (Swagger) : http://localhost:8000/api-docs
- Santé de l'API : http://localhost:8000/health

| Script | Rôle |
|---|---|
| `npm run dev` | Démarre l'API avec rechargement automatique |
| `npm start` | Démarre l'API |
| `npm run setup` | Génère le client Prisma, applique les migrations et peuple la base |
| `npm run seed` | Réinitialise les données de test (⚠️ vide la base) |
| `npm run db:studio` | Ouvre Prisma Studio pour explorer la base |
| `npm run lint` | Analyse statique du code (ESLint) |

### Comptes de test

Tous les comptes ont le mot de passe **`P@ssword123`**.

| Utilisateur | Email | Rôle notable |
|---|---|---|
| Alice Martin | alice@example.com | Propriétaire du projet « Application E-commerce » |
| Bob Dupont | bob@example.com | Administrateur du projet « Application E-commerce » |
| Caroline Leroy | caroline@example.com | Contributrice du projet « Application E-commerce » |
| Emma Rousseau | emma@example.com | Propriétaire du projet « Système de Gestion RH » |

Les autres comptes (david, francois, gabrielle, henri, isabelle, jacques @example.com) sont membres d'autres projets.

### CORS

Seules les origines listées dans `CORS_ORIGINS` (fichier `.env`) peuvent appeler l'API depuis un navigateur.
Par défaut : `http://localhost:3000` (Next.js) et `http://localhost:5173` (Vite).

---

## 🗂️ Structure du projet

```
prisma/              Schéma de données et migrations
scripts/seed.js      Jeu de données de test
src/
  app.js             Configuration Express (sécurité, CORS, routes, erreurs)
  index.js           Démarrage du serveur
  config/swagger.js  Configuration OpenAPI (schémas communs)
  routes/            Déclaration des routes + documentation @openapi
  controllers/       Logique des endpoints
  middleware/        Authentification JWT, contrôle d'accès aux projets
  utils/             Validation, permissions, réponses, tri...
```

---

## 🔐 Droits d'accès

Tous les utilisateurs ont le même compte ; leurs droits dépendent de leur rôle **dans chaque projet**.

| Action | Propriétaire | Administrateur | Contributeur | Non-membre |
|---|:-:|:-:|:-:|:-:|
| Créer un projet (on en devient propriétaire) | ✅ | ✅ | ✅ | ✅ |
| Consulter le projet et ses tâches | ✅ | ✅ | ✅ | ❌ 403 |
| Modifier le projet | ✅ | ✅ | ❌ 403 | ❌ 403 |
| Ajouter / retirer des contributeurs | ✅ | ✅ | ❌ 403 | ❌ 403 |
| Supprimer le projet | ✅ | ❌ 403 | ❌ 403 | ❌ 403 |
| Créer / modifier / supprimer une tâche | ✅ | ✅ | ✅ | ❌ 403 |
| Commenter une tâche | ✅ | ✅ | ✅ | ❌ 403 |
| Modifier un commentaire | auteur uniquement | auteur uniquement | auteur uniquement | ❌ |
| Supprimer un commentaire | ✅ | ✅ | auteur uniquement | ❌ |

Le propriétaire est exposé avec le rôle `ADMIN` dans le champ `userRole` des projets.

---

## 📡 Endpoints

Toutes les routes, sauf `/auth/register`, `/auth/login` et `/health`, nécessitent le header
`Authorization: Bearer <token>`.

| | Méthode | Route | Description |
|---|---|---|---|
| ✅ | POST | `/auth/register` | Inscription |
| ✅ | POST | `/auth/login` | Connexion |
| ✅ | GET / PUT | `/auth/profile` | Lire / modifier son profil |
| ✅ | PUT | `/auth/password` | Modifier son mot de passe |
| ✅ | GET | `/users/search?query=` | Rechercher des utilisateurs (autocomplete) |
| ✅ | GET / POST | `/projects` | Lister ses projets / créer un projet |
| ✅ | GET / PUT / DELETE | `/projects/:id` | Détail / modification / suppression d'un projet |
| ✅ | POST | `/projects/:id/contributors` | Ajouter un contributeur |
| ✅ | DELETE | `/projects/:id/contributors/:userId` | Retirer un contributeur |
| ✅ | GET | `/dashboard/assigned-tasks` | Tâches assignées (les plus urgentes d'abord) |
| ✅ | GET | `/dashboard/projects-with-tasks` | Projets où l'on a des tâches assignées |
| ✅ | GET | `/dashboard/stats` | Statistiques personnelles |
| 🔍 | GET | `/projects/:id/tasks` | Tâches d'un projet — **PR `feature/tasks-read`** |
| 🔍 | GET | `/projects/:id/tasks/:taskId` | Détail d'une tâche — **PR `feature/tasks-read`** |
| 🛠️ | POST | `/projects/:id/tasks` | Créer une tâche — **à implémenter** |
| 🛠️ | PUT / DELETE | `/projects/:id/tasks/:taskId` | Modifier / supprimer une tâche — **à implémenter** |
| 🛠️ | GET / POST | `/projects/:id/tasks/:taskId/comments` | Lister / ajouter des commentaires — **à implémenter** |
| 🛠️ | GET / PUT / DELETE | `/projects/:id/tasks/:taskId/comments/:commentId` | Détail / modification / suppression d'un commentaire — **à implémenter** |

Les routes 🛠️ existent déjà mais répondent `501 NOT_IMPLEMENTED`.

### Format des réponses

```jsonc
// Succès
{ "success": true, "message": "Projet créé avec succès", "data": { "project": { ... } } }

// Erreur
{ "success": false, "message": "Accès refusé au projet", "error": "FORBIDDEN" }

// Erreur de validation (400)
{ "success": false, "message": "Données invalides", "error": "VALIDATION_ERROR",
  "data": { "errors": [{ "field": "title", "message": "Le titre de la tâche est requis" }] } }
```

| Code HTTP | Codes `error` utilisés |
|---|---|
| 400 | `VALIDATION_ERROR`, `INVALID_JSON`, `INVALID_QUERY`, `INVALID_ASSIGNEES` |
| 401 | `UNAUTHORIZED`, `INVALID_CREDENTIALS`, `INVALID_CURRENT_PASSWORD` |
| 403 | `FORBIDDEN` |
| 404 | `NOT_FOUND`, `PROJECT_NOT_FOUND`, `TASK_NOT_FOUND`, `COMMENT_NOT_FOUND`, `USER_NOT_FOUND`, `MEMBER_NOT_FOUND` |
| 409 | `EMAIL_ALREADY_EXISTS`, `USER_ALREADY_MEMBER` |
| 500 | `INTERNAL_SERVER_ERROR` |

---

## 🧭 Travail en cours sur ce dépôt

### 1. Pull request à reviewer : `feature/tasks-read`

Sami, développeur de l'équipe, a commencé la gestion des tâches sur la branche `feature/tasks-read`.
Ouvrez une pull request `feature/tasks-read` → `main` sur votre dépôt GitHub en reprenant sa description ci-dessous,
puis **reviewez-la avant toute fusion**.

> **feat(tasks) : lecture des tâches d'un projet**
>
> Ajoute les deux routes de lecture des tâches dont le front-end a besoin pour la page projet :
> - `GET /projects/:id/tasks` : liste des tâches du projet, les plus urgentes en premier ;
> - `GET /projects/:id/tasks/:taskId` : détail d'une tâche.
>
> Chaque tâche est renvoyée avec son créateur, ses assignations et ses commentaires.
> Les deux routes sont protégées par l'authentification et le contrôle d'accès au projet.
>
> Testé avec Postman sur le jeu de données du seed.

Votre revue doit laisser une trace exploitable (commentaires de PR ou note de revue) et distinguer
ce qui est bloquant, ce qui est à améliorer et les simples questions.

### 2. Fonctionnalités à développer

Les endpoints 🛠️ du tableau ci-dessus : création, modification et suppression des tâches (avec leurs
assignations), et gestion complète des commentaires. Les règles à respecter sont décrites dans la section
« Droits d'accès » et dans les commentaires `TODO` des contrôleurs.

### 3. Documentation

Chaque route ajoutée ou modifiée doit être documentée dans Swagger (annotations `@openapi` dans `src/routes/`).

---

## 🤝 Contribution

- Une branche par fonctionnalité ou correction (`feature/...`, `fix/...`), fusionnée dans `main` via une pull request relue.
- Messages de commit explicites, au format [Conventional Commits](https://www.conventionalcommits.org/fr/) (`feat:`, `fix:`, `docs:`...).
- Ne versionnez jamais le fichier `.env` ni la base de données locale.

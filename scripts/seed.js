/**
 * Peuple la base avec un jeu de données de test reproductible.
 * Usage : npm run seed  (⚠️ vide la base avant de la remplir)
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import prisma from "../src/lib/prisma.js";

const PASSWORD = "P@ssword123";

// Les échéances sont calculées par rapport à aujourd'hui pour que le tableau de bord reste pertinent
const daysFromNow = (days) => {
  const date = new Date();
  date.setUTCHours(0, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + days);
  return date;
};

const users = [
  { email: "alice@example.com", name: "Alice Martin" },
  { email: "bob@example.com", name: "Bob Dupont" },
  { email: "caroline@example.com", name: "Caroline Leroy" },
  { email: "david@example.com", name: "David Moreau" },
  { email: "emma@example.com", name: "Emma Rousseau" },
  { email: "francois@example.com", name: "François Dubois" },
  { email: "gabrielle@example.com", name: "Gabrielle Simon" },
  { email: "henri@example.com", name: "Henri Laurent" },
  { email: "isabelle@example.com", name: "Isabelle Petit" },
  { email: "jacques@example.com", name: "Jacques Durand" },
];

const projects = [
  {
    name: "Application E-commerce",
    description: "Plateforme de vente en ligne avec paiement sécurisé et gestion des stocks.",
    owner: "alice@example.com",
    members: [
      { email: "bob@example.com", role: "ADMIN" },
      { email: "caroline@example.com", role: "CONTRIBUTOR" },
      { email: "david@example.com", role: "CONTRIBUTOR" },
    ],
  },
  {
    name: "Système de Gestion RH",
    description: "Gestion des ressources humaines : congés, évaluations, planning.",
    owner: "emma@example.com",
    members: [
      { email: "francois@example.com", role: "CONTRIBUTOR" },
      { email: "gabrielle@example.com", role: "CONTRIBUTOR" },
    ],
  },
  {
    name: "Application Mobile Fitness",
    description: "Suivi d'entraînement, nutrition et objectifs personnalisés.",
    owner: "henri@example.com",
    members: [{ email: "isabelle@example.com", role: "CONTRIBUTOR" }],
  },
  {
    name: "Plateforme de Formation",
    description: "Cours en ligne avec vidéos, quiz et suivi des progrès.",
    owner: "jacques@example.com",
    members: [{ email: "alice@example.com", role: "CONTRIBUTOR" }],
  },
  {
    name: "Dashboard Analytics",
    description: "Visualisation de données avec graphiques interactifs et rapports automatisés.",
    owner: "bob@example.com",
    members: [
      { email: "emma@example.com", role: "ADMIN" },
      { email: "henri@example.com", role: "CONTRIBUTOR" },
    ],
  },
];

const tasks = [
  // Application E-commerce
  { project: "Application E-commerce", title: "Conception de la base de données", description: "Schéma des produits, utilisateurs, commandes et paiements.", status: "DONE", priority: "HIGH", due: -20, assignees: ["bob@example.com", "caroline@example.com"] },
  { project: "Application E-commerce", title: "Développement de l'API REST", description: "Endpoints produits, panier et commandes.", status: "IN_PROGRESS", priority: "URGENT", due: 3, assignees: ["david@example.com"] },
  { project: "Application E-commerce", title: "Interface utilisateur responsive", description: "Composants React : liste des produits, panier et paiement.", status: "TODO", priority: "MEDIUM", due: 12, assignees: ["alice@example.com", "caroline@example.com"] },
  { project: "Application E-commerce", title: "Intégration du paiement", description: "Intégrer un prestataire de paiement sécurisé.", status: "TODO", priority: "HIGH", due: 20, assignees: ["bob@example.com"] },
  { project: "Application E-commerce", title: "Tests automatisés", description: "Tests unitaires et d'intégration de l'API et de l'interface.", status: "TODO", priority: "LOW", due: 30, assignees: ["david@example.com", "caroline@example.com"] },
  // Système de Gestion RH
  { project: "Système de Gestion RH", title: "Module de gestion des congés", description: "Demande et validation des congés avec circuit d'approbation.", status: "IN_PROGRESS", priority: "HIGH", due: -2, assignees: ["emma@example.com", "francois@example.com"] },
  { project: "Système de Gestion RH", title: "Formulaires d'évaluation", description: "Formulaires d'évaluation et système de notation.", status: "TODO", priority: "MEDIUM", due: 10, assignees: ["gabrielle@example.com"] },
  { project: "Système de Gestion RH", title: "Tableau de bord RH", description: "Statistiques sur les effectifs, congés et performances.", status: "TODO", priority: "LOW", due: 25, assignees: ["emma@example.com"] },
  // Application Mobile Fitness
  { project: "Application Mobile Fitness", title: "Maquettes de l'application", description: "Maquettes et prototype de l'application mobile.", status: "DONE", priority: "HIGH", due: -15, assignees: ["henri@example.com"] },
  { project: "Application Mobile Fitness", title: "Écrans principaux", description: "Accueil, profil et suivi d'entraînement.", status: "IN_PROGRESS", priority: "URGENT", due: 1, assignees: ["isabelle@example.com", "henri@example.com"] },
  { project: "Application Mobile Fitness", title: "Intégration API nutrition", description: "Connexion à une API de données nutritionnelles.", status: "TODO", priority: "MEDIUM", due: 14, assignees: ["henri@example.com"] },
  // Plateforme de Formation
  { project: "Plateforme de Formation", title: "Gestion des cours", description: "Interface d'administration pour organiser les cours.", status: "DONE", priority: "HIGH", due: -10, assignees: ["jacques@example.com"] },
  { project: "Plateforme de Formation", title: "Lecteur vidéo", description: "Lecteur avec suivi de progression et prise de notes.", status: "IN_PROGRESS", priority: "HIGH", due: 5, assignees: ["alice@example.com", "jacques@example.com"] },
  { project: "Plateforme de Formation", title: "Quiz interactifs", description: "Questions à choix multiples avec correction automatique.", status: "TODO", priority: "MEDIUM", due: 18, assignees: ["alice@example.com"] },
  // Dashboard Analytics
  { project: "Dashboard Analytics", title: "Architecture des données", description: "Collecte et stockage des données analytiques.", status: "DONE", priority: "HIGH", due: -12, assignees: ["bob@example.com"] },
  { project: "Dashboard Analytics", title: "Développement des graphiques", description: "Composants de visualisation interactifs.", status: "IN_PROGRESS", priority: "HIGH", due: 7, assignees: ["emma@example.com", "henri@example.com"] },
  { project: "Dashboard Analytics", title: "Système d'alertes", description: "Notifications sur seuils et anomalies.", status: "TODO", priority: "MEDIUM", due: 21, assignees: ["bob@example.com"] },
];

const commentTemplates = [
  "C'est en bonne voie, je fais un point demain.",
  "Attention aux droits d'accès sur cette partie.",
  "J'ai poussé une première version, vos retours sont les bienvenus.",
  "Bloqué en attente d'une précision fonctionnelle.",
  "Testé en local, tout fonctionne de mon côté.",
];

async function seed() {
  console.log("🧹 Nettoyage de la base de données...");
  await prisma.comment.deleteMany();
  await prisma.taskAssignee.deleteMany();
  await prisma.task.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.user.deleteMany();

  console.log("👥 Création des utilisateurs...");
  const hashedPassword = await bcrypt.hash(PASSWORD, 10);
  const userIds = {};
  for (const user of users) {
    const created = await prisma.user.create({ data: { ...user, password: hashedPassword } });
    userIds[user.email] = created.id;
  }

  console.log("📁 Création des projets et des membres...");
  const projectIds = {};
  const projectOwners = {};
  for (const project of projects) {
    const created = await prisma.project.create({
      data: {
        name: project.name,
        description: project.description,
        ownerId: userIds[project.owner],
        members: {
          create: project.members.map((member) => ({ userId: userIds[member.email], role: member.role })),
        },
      },
    });
    projectIds[project.name] = created.id;
    projectOwners[project.name] = project.owner;
  }

  console.log("📋 Création des tâches, assignations et commentaires...");
  let commentIndex = 0;
  for (const task of tasks) {
    const owner = projectOwners[task.project];
    const authors = [owner, ...task.assignees];

    await prisma.task.create({
      data: {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: daysFromNow(task.due),
        projectId: projectIds[task.project],
        creatorId: userIds[owner],
        assignees: { create: task.assignees.map((email) => ({ userId: userIds[email] })) },
        comments: {
          create: authors.slice(0, 2).map((email) => ({
            authorId: userIds[email],
            content: commentTemplates[commentIndex++ % commentTemplates.length],
          })),
        },
      },
    });
  }

  console.log("🎉 Seed terminé :");
  console.log(`   ${users.length} utilisateurs (mot de passe : ${PASSWORD})`);
  console.log(`   ${projects.length} projets, ${tasks.length} tâches, ${commentIndex} commentaires`);
}

seed()
  .catch((error) => {
    console.error("❌ Erreur lors du seed :", error);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

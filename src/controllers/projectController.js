import prisma from "../lib/prisma.js";
import { canModifyProject, canDeleteProject } from "../utils/permissions.js";
import { projectInclude, publicUserSelect } from "../utils/selects.js";
import {
  validateCreateProjectData,
  validateUpdateProjectData,
  validateContributorData,
} from "../utils/validation.js";
import { sendSuccess, sendError, sendValidationError } from "../utils/response.js";

/** Calcule le rôle de l'utilisateur à partir d'un projet déjà chargé (sans requête supplémentaire) */
const resolveUserRole = (project, userId) => {
  if (project.ownerId === userId) return "ADMIN";
  return project.members.find((member) => member.userId === userId)?.role ?? null;
};

/** POST /projects */
export const createProject = async (req, res) => {
  const { name, description, contributors = [] } = req.body;

  const errors = validateCreateProjectData({ name, description, contributors });
  if (errors.length > 0) {
    sendValidationError(res, "Données de création de projet invalides", errors);
    return;
  }

  // Les contributeurs sont identifiés par email ; le créateur est exclu (il est propriétaire)
  const contributorUsers = await prisma.user.findMany({
    where: {
      email: { in: contributors.map((email) => email.toLowerCase()) },
      id: { not: req.user.id },
    },
    select: { id: true },
  });

  // Création du projet et de ses membres en une seule opération atomique
  const project = await prisma.project.create({
    data: {
      name: name.trim(),
      description: description?.trim() || null,
      ownerId: req.user.id,
      members: {
        create: contributorUsers.map((user) => ({ userId: user.id, role: "CONTRIBUTOR" })),
      },
    },
    include: projectInclude,
  });

  sendSuccess(res, "Projet créé avec succès", { project: { ...project, userRole: "ADMIN" } }, 201);
};

/** GET /projects */
export const getProjects = async (req, res) => {
  const projects = await prisma.project.findMany({
    where: {
      OR: [{ ownerId: req.user.id }, { members: { some: { userId: req.user.id } } }],
    },
    include: projectInclude,
    orderBy: { updatedAt: "desc" },
  });

  sendSuccess(res, "Projets récupérés avec succès", {
    projects: projects.map((project) => ({
      ...project,
      userRole: resolveUserRole(project, req.user.id),
    })),
  });
};

/** GET /projects/:id (accès vérifié par le middleware requireProjectAccess) */
export const getProject = async (req, res) => {
  const project = await prisma.project.findUnique({
    where: { id: req.params.id },
    include: {
      ...projectInclude,
      tasks: {
        include: { creator: { select: publicUserSelect } },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  sendSuccess(res, "Projet récupéré avec succès", {
    project: { ...project, userRole: req.projectAccess.role },
  });
};

/** PUT /projects/:id */
export const updateProject = async (req, res) => {
  if (!canModifyProject(req.projectAccess)) {
    sendError(res, "Vous n'avez pas les permissions pour modifier ce projet", "FORBIDDEN", 403);
    return;
  }

  const { name, description } = req.body;
  const errors = validateUpdateProjectData({ name, description });
  if (errors.length > 0) {
    sendValidationError(res, "Données de mise à jour invalides", errors);
    return;
  }

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (description !== undefined) data.description = description?.trim() || null;

  const project = await prisma.project.update({
    where: { id: req.params.id },
    data,
    include: projectInclude,
  });

  sendSuccess(res, "Projet mis à jour avec succès", {
    project: { ...project, userRole: req.projectAccess.role },
  });
};

/** DELETE /projects/:id */
export const deleteProject = async (req, res) => {
  if (!canDeleteProject(req.projectAccess)) {
    sendError(res, "Seul le propriétaire peut supprimer ce projet", "FORBIDDEN", 403);
    return;
  }

  // Les membres, tâches, assignations et commentaires sont supprimés en cascade
  await prisma.project.delete({ where: { id: req.params.id } });
  sendSuccess(res, "Projet supprimé avec succès");
};

/** POST /projects/:id/contributors */
export const addContributor = async (req, res) => {
  if (!canModifyProject(req.projectAccess)) {
    sendError(res, "Vous n'avez pas les permissions pour modifier ce projet", "FORBIDDEN", 403);
    return;
  }

  const { email, role = "CONTRIBUTOR" } = req.body;
  const errors = validateContributorData({ email, role });
  if (errors.length > 0) {
    sendValidationError(res, "Données de contributeur invalides", errors);
    return;
  }

  const projectId = req.params.id;
  const user = await prisma.user.findUnique({
    where: { email: email.toLowerCase() },
    select: {
      ...publicUserSelect,
      ownedProjects: { where: { id: projectId }, select: { id: true } },
      projectMemberships: { where: { projectId }, select: { id: true } },
    },
  });

  if (!user) {
    sendError(res, "Utilisateur non trouvé", "USER_NOT_FOUND", 404);
    return;
  }
  if (user.ownedProjects.length > 0 || user.projectMemberships.length > 0) {
    sendError(res, "L'utilisateur est déjà membre de ce projet", "USER_ALREADY_MEMBER", 409);
    return;
  }

  const member = await prisma.projectMember.create({
    data: { userId: user.id, projectId, role },
    include: { user: { select: publicUserSelect } },
  });

  sendSuccess(res, "Contributeur ajouté avec succès", { member }, 201);
};

/** DELETE /projects/:id/contributors/:userId */
export const removeContributor = async (req, res) => {
  if (!canModifyProject(req.projectAccess)) {
    sendError(res, "Vous n'avez pas les permissions pour modifier ce projet", "FORBIDDEN", 403);
    return;
  }

  const { id: projectId, userId } = req.params;
  const { count } = await prisma.projectMember.deleteMany({ where: { projectId, userId } });

  if (count === 0) {
    sendError(res, "Cet utilisateur n'est pas contributeur du projet", "MEMBER_NOT_FOUND", 404);
    return;
  }

  sendSuccess(res, "Contributeur retiré avec succès");
};

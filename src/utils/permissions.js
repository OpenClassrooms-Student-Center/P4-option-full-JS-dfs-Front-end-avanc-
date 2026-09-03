import prisma from "../lib/prisma.js";

/**
 * Règles d'accès d'un projet :
 * - propriétaire (owner) : tous les droits, rôle exposé "ADMIN" ;
 * - membre ADMIN : modifier le projet, gérer les contributeurs, gérer les tâches ;
 * - membre CONTRIBUTOR : consulter le projet, créer / modifier / supprimer des tâches ;
 * - autre utilisateur : aucun accès.
 */

/**
 * Récupère en une seule requête l'existence du projet et le rôle de l'utilisateur.
 * @param {string} userId
 * @param {string} projectId
 * @returns {Promise<{ exists: boolean, isOwner: boolean, role: "ADMIN" | "CONTRIBUTOR" | null }>}
 */
export const getProjectAccess = async (userId, projectId) => {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
    select: {
      ownerId: true,
      members: { where: { userId }, select: { role: true } },
    },
  });

  if (!project) {
    return { exists: false, isOwner: false, role: null };
  }

  const isOwner = project.ownerId === userId;
  const role = isOwner ? "ADMIN" : (project.members[0]?.role ?? null);
  return { exists: true, isOwner, role };
};

export const hasProjectAccess = (access) => access.role !== null;

export const isProjectAdmin = (access) => access.role === "ADMIN";

export const canModifyProject = (access) => isProjectAdmin(access);

export const canDeleteProject = (access) => access.isOwner;

export const canManageTasks = (access) => hasProjectAccess(access);

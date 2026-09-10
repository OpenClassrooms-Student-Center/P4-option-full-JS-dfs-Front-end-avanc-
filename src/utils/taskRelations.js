import prisma from "../lib/prisma.js";
import { publicUserSelect } from "./selects.js";

/**
 * Récupère les assignations d'une tâche avec les utilisateurs
 * @param {string} taskId
 */
export const getTaskAssignees = (taskId) =>
  prisma.taskAssignee.findMany({
    where: { taskId },
    include: { user: { select: publicUserSelect } },
    orderBy: { assignedAt: "asc" },
  });

/**
 * Récupère les commentaires d'une tâche avec leurs auteurs
 * @param {string} taskId
 */
export const getTaskComments = (taskId) =>
  prisma.comment.findMany({
    where: { taskId },
    include: { author: { select: publicUserSelect } },
    orderBy: { createdAt: "asc" },
  });

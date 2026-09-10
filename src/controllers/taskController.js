import prisma from "../lib/prisma.js";
import { publicUserSelect } from "../utils/selects.js";
import { getTaskAssignees, getTaskComments } from "../utils/taskRelations.js";
import { sendSuccess, sendError } from "../utils/response.js";

/*
 * Toutes les routes de ce contrôleur passent par authenticateToken puis
 * requireProjectAccess : req.user et req.projectAccess sont donc toujours définis
 * et l'utilisateur est membre du projet :id.
 *
 * Règles métier à respecter : voir le README (section "Droits d'accès").
 */

const notImplemented = (res) => {
  sendError(res, "Fonctionnalité à implémenter", "NOT_IMPLEMENTED", 501);
};

/** GET /projects/:id/tasks */
export const getTasks = async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: { projectId: req.params.id },
    include: {
      creator: { select: publicUserSelect },
      project: { select: { id: true, name: true } },
    },
    // Les plus urgentes en premier
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
  });

  // On complète chaque tâche avec ses assignations et ses commentaires
  const tasksWithRelations = [];
  for (const task of tasks) {
    const assignees = await getTaskAssignees(task.id);
    const comments = await getTaskComments(task.id);
    tasksWithRelations.push({ ...task, assignees, comments });
  }

  sendSuccess(res, "Tâches récupérées avec succès", { tasks: tasksWithRelations });
};

/** GET /projects/:id/tasks/:taskId */
export const getTask = async (req, res) => {
  const task = await prisma.task.findUnique({
    where: { id: req.params.taskId },
    include: {
      creator: { select: publicUserSelect },
      project: { select: { id: true, name: true } },
    },
  });

  if (!task) {
    sendSuccess(res, "Aucune tâche trouvée", { task: null });
    return;
  }

  const assignees = await getTaskAssignees(task.id);
  const comments = await getTaskComments(task.id);

  sendSuccess(res, "Tâche récupérée avec succès", { task: { ...task, assignees, comments } });
};

/**
 * POST /projects/:id/tasks
 *
 * TODO (étudiant) :
 * - valider le corps de la requête (voir validateCreateTaskData dans utils/validation.js) ;
 * - vérifier que les utilisateurs de assigneeIds sont membres du projet (propriétaire inclus),
 *   sinon répondre 400 INVALID_ASSIGNEES ;
 * - créer la tâche ET ses assignations de manière atomique ;
 * - répondre 201 avec { task } (créateur, projet, assignations et commentaires inclus).
 */
export const createTask = async (req, res) => {
  notImplemented(res);
};

/**
 * PUT /projects/:id/tasks/:taskId  (mise à jour partielle)
 *
 * TODO (étudiant) :
 * - valider le corps de la requête (voir validateUpdateTaskData) ;
 * - répondre 404 TASK_NOT_FOUND si la tâche n'appartient pas au projet :id ;
 * - si assigneeIds est fourni, il remplace la liste des assignations existantes ;
 * - répondre 200 avec { task }.
 */
export const updateTask = async (req, res) => {
  notImplemented(res);
};

/**
 * DELETE /projects/:id/tasks/:taskId
 *
 * TODO (étudiant) :
 * - répondre 404 TASK_NOT_FOUND si la tâche n'appartient pas au projet :id ;
 * - supprimer la tâche (assignations et commentaires sont supprimés en cascade).
 */
export const deleteTask = async (req, res) => {
  notImplemented(res);
};

import { sendError } from "../utils/response.js";

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

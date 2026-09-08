import { sendError } from "../utils/response.js";

/*
 * Routes protégées par authenticateToken + requireProjectAccess :
 * l'utilisateur est membre du projet :id.
 *
 * Règles métier à respecter :
 * - la tâche :taskId doit appartenir au projet :id (sinon 404 TASK_NOT_FOUND) ;
 * - le commentaire :commentId doit appartenir à la tâche :taskId (sinon 404 COMMENT_NOT_FOUND) ;
 * - tout membre du projet peut lire et ajouter des commentaires ;
 * - seul l'auteur peut modifier son commentaire ;
 * - l'auteur ou un administrateur du projet peut supprimer un commentaire.
 *
 * Validation du contenu : voir validateCommentData dans utils/validation.js.
 */

const notImplemented = (res) => {
  sendError(res, "Fonctionnalité à implémenter", "NOT_IMPLEMENTED", 501);
};

/** GET /projects/:id/tasks/:taskId/comments — TODO (étudiant) : 200 { comments } (ordre chronologique) */
export const getComments = async (req, res) => {
  notImplemented(res);
};

/** GET /projects/:id/tasks/:taskId/comments/:commentId — TODO (étudiant) : 200 { comment } */
export const getComment = async (req, res) => {
  notImplemented(res);
};

/** POST /projects/:id/tasks/:taskId/comments — TODO (étudiant) : 201 { comment } */
export const createComment = async (req, res) => {
  notImplemented(res);
};

/** PUT /projects/:id/tasks/:taskId/comments/:commentId — TODO (étudiant) : 200 { comment } */
export const updateComment = async (req, res) => {
  notImplemented(res);
};

/** DELETE /projects/:id/tasks/:taskId/comments/:commentId — TODO (étudiant) : 200 */
export const deleteComment = async (req, res) => {
  notImplemented(res);
};

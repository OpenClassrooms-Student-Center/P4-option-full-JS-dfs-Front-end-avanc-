/**
 * Helpers pour garantir un format de réponse homogène :
 * { success: boolean, message: string, data?: any, error?: string }
 */

/**
 * Envoie une réponse de succès
 * @param {import("express").Response} res
 * @param {string} message
 * @param {any} [data]
 * @param {number} [statusCode=200]
 */
export const sendSuccess = (res, message, data, statusCode = 200) => {
  res.status(statusCode).json({ success: true, message, data });
};

/**
 * Envoie une réponse d'erreur
 * @param {import("express").Response} res
 * @param {string} message - Message lisible par l'utilisateur
 * @param {string} [error] - Code d'erreur exploitable par le front-end
 * @param {number} [statusCode=400]
 */
export const sendError = (res, message, error, statusCode = 400) => {
  res.status(statusCode).json({ success: false, message, error });
};

/**
 * Envoie une erreur de validation (400) avec le détail des champs invalides
 * @param {import("express").Response} res
 * @param {string} message
 * @param {{ field: string, message: string }[]} errors
 */
export const sendValidationError = (res, message, errors) => {
  res.status(400).json({
    success: false,
    message,
    error: "VALIDATION_ERROR",
    data: { errors },
  });
};

/**
 * Envoie une erreur serveur (500)
 * @param {import("express").Response} res
 * @param {string} [message]
 */
export const sendServerError = (res, message = "Erreur interne du serveur") => {
  sendError(res, message, "INTERNAL_SERVER_ERROR", 500);
};

/**
 * Envoie une erreur d'authentification (401)
 * @param {import("express").Response} res
 * @param {string} [message]
 */
export const sendAuthError = (res, message = "Non autorisé") => {
  sendError(res, message, "UNAUTHORIZED", 401);
};

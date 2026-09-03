import { getProjectAccess, hasProjectAccess } from "../utils/permissions.js";
import { sendError } from "../utils/response.js";

/**
 * Vérifie que le projet :id existe et que l'utilisateur connecté en est membre.
 * Le résultat est disponible dans req.projectAccess pour les contrôles plus fins.
 */
export const requireProjectAccess = async (req, res, next) => {
  const access = await getProjectAccess(req.user.id, req.params.id);

  if (!access.exists) {
    sendError(res, "Projet non trouvé", "PROJECT_NOT_FOUND", 404);
    return;
  }
  if (!hasProjectAccess(access)) {
    sendError(res, "Accès refusé au projet", "FORBIDDEN", 403);
    return;
  }

  req.projectAccess = access;
  next();
};

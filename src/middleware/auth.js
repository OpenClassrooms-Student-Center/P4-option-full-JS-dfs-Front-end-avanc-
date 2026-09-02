import prisma from "../lib/prisma.js";
import { verifyToken, extractTokenFromHeader } from "../utils/jwt.js";
import { sendAuthError } from "../utils/response.js";
import { publicUserSelect } from "../utils/selects.js";

/**
 * Vérifie le token JWT envoyé dans le header Authorization.
 * Si le token est valide, l'utilisateur connecté est disponible dans req.user.
 */
export const authenticateToken = async (req, res, next) => {
  const token = extractTokenFromHeader(req.headers.authorization);

  if (!token) {
    sendAuthError(res, "Token d'authentification manquant");
    return;
  }

  try {
    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: publicUserSelect,
    });

    if (!user) {
      sendAuthError(res, "Utilisateur non trouvé");
      return;
    }

    req.user = user;
    next();
  } catch (error) {
    sendAuthError(res, error.message);
  }
};

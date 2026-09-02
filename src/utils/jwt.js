import jwt from "jsonwebtoken";

const getSecret = () => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET n'est pas défini dans les variables d'environnement");
  }
  return secret;
};

/**
 * Génère un token JWT pour un utilisateur
 * @param {string} userId
 * @param {string} email
 * @returns {string}
 */
export const generateToken = (userId, email) => {
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ userId, email }, getSecret(), { expiresIn });
};

/**
 * Vérifie et décode un token JWT
 * @param {string} token
 * @returns {{ userId: string, email: string, iat: number, exp: number }}
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, getSecret());
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      throw new Error("Token expiré", { cause: error });
    }
    throw new Error("Token invalide", { cause: error });
  }
};

/**
 * Extrait le token du header "Authorization: Bearer <token>"
 * @param {string | undefined} authHeader
 * @returns {string | null}
 */
export const extractTokenFromHeader = (authHeader) => {
  if (!authHeader) {
    return null;
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || !token) {
    return null;
  }

  return token;
};

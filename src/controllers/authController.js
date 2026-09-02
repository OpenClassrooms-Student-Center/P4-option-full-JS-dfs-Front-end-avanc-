import bcrypt from "bcryptjs";
import prisma from "../lib/prisma.js";
import { generateToken } from "../utils/jwt.js";
import { publicUserSelect } from "../utils/selects.js";
import {
  validateRegisterData,
  validateLoginData,
  validateUpdateProfileData,
  validateUpdatePasswordData,
} from "../utils/validation.js";
import { sendSuccess, sendError, sendValidationError } from "../utils/response.js";

const SALT_ROUNDS = 12;

const profileSelect = { ...publicUserSelect, createdAt: true, updatedAt: true };

/** POST /auth/register */
export const register = async (req, res) => {
  const { email, password, name } = req.body;

  const errors = validateRegisterData({ email, password, name });
  if (errors.length > 0) {
    sendValidationError(res, "Données d'inscription invalides", errors);
    return;
  }

  const normalizedEmail = email.toLowerCase();
  const existingUser = await prisma.user.findUnique({ where: { email: normalizedEmail } });
  if (existingUser) {
    sendError(res, "Un utilisateur avec cet email existe déjà", "EMAIL_ALREADY_EXISTS", 409);
    return;
  }

  const user = await prisma.user.create({
    data: {
      email: normalizedEmail,
      password: await bcrypt.hash(password, SALT_ROUNDS),
      name: name?.trim() || null,
    },
    select: profileSelect,
  });

  const token = generateToken(user.id, user.email);
  sendSuccess(res, "Utilisateur créé avec succès", { user, token }, 201);
};

/** POST /auth/login */
export const login = async (req, res) => {
  const { email, password } = req.body;

  const errors = validateLoginData({ email, password });
  if (errors.length > 0) {
    sendValidationError(res, "Données de connexion invalides", errors);
    return;
  }

  const user = await prisma.user.findUnique({ where: { email: String(email).toLowerCase() } });

  // Même message dans les deux cas pour ne pas révéler si l'email existe
  if (!user || !(await bcrypt.compare(String(password), user.password))) {
    sendError(res, "Email ou mot de passe incorrect", "INVALID_CREDENTIALS", 401);
    return;
  }

  const token = generateToken(user.id, user.email);
  sendSuccess(res, "Connexion réussie", {
    user: { id: user.id, email: user.email, name: user.name, createdAt: user.createdAt },
    token,
  });
};

/** GET /auth/profile */
export const getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user.id },
    select: profileSelect,
  });
  sendSuccess(res, "Profil récupéré avec succès", { user });
};

/** PUT /auth/profile */
export const updateProfile = async (req, res) => {
  const { name, email } = req.body;

  const errors = validateUpdateProfileData({ name, email });
  if (errors.length > 0) {
    sendValidationError(res, "Données de mise à jour invalides", errors);
    return;
  }

  const data = {};
  if (name !== undefined) data.name = name.trim();
  if (email !== undefined) {
    data.email = email.toLowerCase();
    if (data.email !== req.user.email) {
      const emailTaken = await prisma.user.findUnique({ where: { email: data.email } });
      if (emailTaken) {
        sendError(res, "Un utilisateur avec cet email existe déjà", "EMAIL_ALREADY_EXISTS", 409);
        return;
      }
    }
  }

  const user = await prisma.user.update({
    where: { id: req.user.id },
    data,
    select: profileSelect,
  });
  sendSuccess(res, "Profil mis à jour avec succès", { user });
};

/** PUT /auth/password */
export const updatePassword = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const errors = validateUpdatePasswordData({ currentPassword, newPassword });
  if (errors.length > 0) {
    sendValidationError(res, "Données de mise à jour du mot de passe invalides", errors);
    return;
  }

  const user = await prisma.user.findUnique({ where: { id: req.user.id } });
  if (!(await bcrypt.compare(String(currentPassword), user.password))) {
    sendError(res, "Mot de passe actuel incorrect", "INVALID_CURRENT_PASSWORD", 401);
    return;
  }

  await prisma.user.update({
    where: { id: req.user.id },
    data: { password: await bcrypt.hash(newPassword, SALT_ROUNDS) },
  });
  sendSuccess(res, "Mot de passe mis à jour avec succès");
};

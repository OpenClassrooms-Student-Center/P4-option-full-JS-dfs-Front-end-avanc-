import { Router } from "express";
import { register, login, getProfile, updateProfile, updatePassword } from "../controllers/authController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * /auth/register:
 *   post:
 *     summary: Inscription d'un nouvel utilisateur
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "john@example.com" }
 *               password: { type: string, example: "P@ssword123", description: "8 caractères min., majuscule, minuscule, chiffre et caractère spécial (@$!%*?&)" }
 *               name: { type: string, example: "John Doe" }
 *     responses:
 *       201:
 *         description: Utilisateur créé, token renvoyé
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/Profile' }
 *                         token: { type: string }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       409:
 *         description: Email déjà utilisé (EMAIL_ALREADY_EXISTS)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/register", register);

/**
 * @openapi
 * /auth/login:
 *   post:
 *     summary: Connexion d'un utilisateur
 *     tags: [Authentification]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, format: email, example: "alice@example.com" }
 *               password: { type: string, example: "P@ssword123" }
 *     responses:
 *       200:
 *         description: Connexion réussie, token renvoyé
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/Profile' }
 *                         token: { type: string }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401:
 *         description: Identifiants incorrects (INVALID_CREDENTIALS)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/login", login);

/**
 * @openapi
 * /auth/profile:
 *   get:
 *     summary: Profil de l'utilisateur connecté
 *     tags: [Authentification]
 *     responses:
 *       200:
 *         description: Profil récupéré
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/Profile' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *   put:
 *     summary: Modifier le nom et/ou l'email de l'utilisateur connecté
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, example: "Alice M." }
 *               email: { type: string, format: email }
 *     responses:
 *       200:
 *         description: Profil mis à jour
 *         content:
 *           application/json:
 *             schema:
 *               allOf:
 *                 - $ref: '#/components/schemas/Success'
 *                 - type: object
 *                   properties:
 *                     data:
 *                       type: object
 *                       properties:
 *                         user: { $ref: '#/components/schemas/Profile' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       409:
 *         description: Email déjà utilisé (EMAIL_ALREADY_EXISTS)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.get("/profile", authenticateToken, getProfile);
router.put("/profile", authenticateToken, updateProfile);

/**
 * @openapi
 * /auth/password:
 *   put:
 *     summary: Modifier le mot de passe de l'utilisateur connecté
 *     tags: [Authentification]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword: { type: string }
 *     responses:
 *       200:
 *         description: Mot de passe modifié
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Success' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401:
 *         description: Non authentifié ou mot de passe actuel incorrect (INVALID_CURRENT_PASSWORD)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.put("/password", authenticateToken, updatePassword);

export default router;

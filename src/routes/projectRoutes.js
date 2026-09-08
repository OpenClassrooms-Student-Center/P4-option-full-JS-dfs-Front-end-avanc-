import { Router } from "express";
import {
  createProject,
  getProjects,
  getProject,
  updateProject,
  deleteProject,
  addContributor,
  removeContributor,
} from "../controllers/projectController.js";
import { authenticateToken } from "../middleware/auth.js";
import { requireProjectAccess } from "../middleware/projectAccess.js";
import taskRoutes from "./taskRoutes.js";

const router = Router();

router.use(authenticateToken);

/**
 * @openapi
 * /projects:
 *   get:
 *     summary: Projets dont l'utilisateur est propriétaire ou membre
 *     tags: [Projets]
 *     responses:
 *       200:
 *         description: Liste des projets (avec le rôle de l'utilisateur dans userRole)
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
 *                         projects:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Project' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *   post:
 *     summary: Créer un projet (le créateur en devient propriétaire / administrateur)
 *     tags: [Projets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100, example: "Refonte du site" }
 *               description: { type: string, maxLength: 500 }
 *               contributors:
 *                 type: array
 *                 description: Emails des contributeurs (les emails inconnus sont ignorés)
 *                 items: { type: string, format: email }
 *                 example: ["bob@example.com"]
 *     responses:
 *       201:
 *         description: Projet créé
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
 *                         project: { $ref: '#/components/schemas/Project' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/", getProjects);
router.post("/", createProject);

/**
 * @openapi
 * /projects/{id}:
 *   parameters:
 *     - $ref: '#/components/parameters/ProjectId'
 *   get:
 *     summary: Détail d'un projet (membres uniquement)
 *     tags: [Projets]
 *     responses:
 *       200:
 *         description: Projet avec ses membres et ses tâches
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
 *                         project: { $ref: '#/components/schemas/Project' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/ProjectNotFound' }
 *   put:
 *     summary: Modifier un projet (administrateurs uniquement)
 *     tags: [Projets]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name: { type: string, minLength: 2, maxLength: 100 }
 *               description: { type: string, maxLength: 500 }
 *     responses:
 *       200:
 *         description: Projet mis à jour
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
 *                         project: { $ref: '#/components/schemas/Project' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/ProjectNotFound' }
 *   delete:
 *     summary: Supprimer un projet (propriétaire uniquement, suppression en cascade)
 *     tags: [Projets]
 *     responses:
 *       200:
 *         description: Projet supprimé
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Success' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404: { $ref: '#/components/responses/ProjectNotFound' }
 */
router.get("/:id", requireProjectAccess, getProject);
router.put("/:id", requireProjectAccess, updateProject);
router.delete("/:id", requireProjectAccess, deleteProject);

/**
 * @openapi
 * /projects/{id}/contributors:
 *   post:
 *     summary: Ajouter un contributeur (administrateurs uniquement)
 *     tags: [Contributeurs]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email: { type: string, format: email, example: "emma@example.com" }
 *               role: { type: string, enum: [ADMIN, CONTRIBUTOR], default: CONTRIBUTOR }
 *     responses:
 *       201:
 *         description: Contributeur ajouté
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
 *                         member: { $ref: '#/components/schemas/ProjectMember' }
 *       400: { $ref: '#/components/responses/ValidationFailed' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404:
 *         description: Projet ou utilisateur introuvable (PROJECT_NOT_FOUND, USER_NOT_FOUND)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       409:
 *         description: Utilisateur déjà membre (USER_ALREADY_MEMBER)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *
 * /projects/{id}/contributors/{userId}:
 *   delete:
 *     summary: Retirer un contributeur (administrateurs uniquement)
 *     tags: [Contributeurs]
 *     parameters:
 *       - $ref: '#/components/parameters/ProjectId'
 *       - in: path
 *         name: userId
 *         required: true
 *         schema: { type: string }
 *     responses:
 *       200:
 *         description: Contributeur retiré
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Success' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 *       403: { $ref: '#/components/responses/Forbidden' }
 *       404:
 *         description: Projet introuvable ou utilisateur non membre (PROJECT_NOT_FOUND, MEMBER_NOT_FOUND)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 */
router.post("/:id/contributors", requireProjectAccess, addContributor);
router.delete("/:id/contributors/:userId", requireProjectAccess, removeContributor);

// Tâches (et commentaires) d'un projet
router.use("/:id/tasks", requireProjectAccess, taskRoutes);

export default router;

import { Router } from "express";
import { getAssignedTasks, getProjectsWithTasks, getDashboardStats } from "../controllers/dashboardController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

router.use(authenticateToken);

/**
 * @openapi
 * /dashboard/assigned-tasks:
 *   get:
 *     summary: Tâches assignées à l'utilisateur connecté (les plus urgentes d'abord)
 *     tags: [Tableau de bord]
 *     responses:
 *       200:
 *         description: Tâches triées par priorité puis par échéance
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
 *                         tasks:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/Task' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/assigned-tasks", getAssignedTasks);

/**
 * @openapi
 * /dashboard/projects-with-tasks:
 *   get:
 *     summary: Projets dans lesquels l'utilisateur a des tâches assignées
 *     tags: [Tableau de bord]
 *     responses:
 *       200:
 *         description: Projets avec uniquement les tâches assignées à l'utilisateur
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
 *                           items:
 *                             allOf:
 *                               - $ref: '#/components/schemas/Project'
 *                               - type: object
 *                                 properties:
 *                                   tasks:
 *                                     type: array
 *                                     items: { $ref: '#/components/schemas/Task' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/projects-with-tasks", getProjectsWithTasks);

/**
 * @openapi
 * /dashboard/stats:
 *   get:
 *     summary: Statistiques des tâches assignées à l'utilisateur connecté
 *     tags: [Tableau de bord]
 *     responses:
 *       200:
 *         description: Statistiques
 *         content:
 *           application/json:
 *             example:
 *               success: true
 *               message: "Statistiques du tableau de bord récupérées"
 *               data:
 *                 stats:
 *                   tasks: { total: 4, urgent: 2, overdue: 1, byStatus: { TODO: 2, IN_PROGRESS: 1, DONE: 1 } }
 *                   projects: { total: 2 }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/stats", getDashboardStats);

export default router;

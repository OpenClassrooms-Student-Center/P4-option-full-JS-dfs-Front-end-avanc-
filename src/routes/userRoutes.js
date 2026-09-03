import { Router } from "express";
import { searchUsers } from "../controllers/userController.js";
import { authenticateToken } from "../middleware/auth.js";

const router = Router();

/**
 * @openapi
 * /users/search:
 *   get:
 *     summary: Rechercher des utilisateurs par nom ou email (autocomplete, 10 résultats max.)
 *     tags: [Utilisateurs]
 *     parameters:
 *       - in: query
 *         name: query
 *         required: true
 *         schema: { type: string, minLength: 2 }
 *         example: "ali"
 *     responses:
 *       200:
 *         description: Utilisateurs trouvés
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
 *                         users:
 *                           type: array
 *                           items: { $ref: '#/components/schemas/User' }
 *       400:
 *         description: Recherche trop courte (INVALID_QUERY)
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/Error' }
 *       401: { $ref: '#/components/responses/Unauthorized' }
 */
router.get("/search", authenticateToken, searchUsers);

export default router;

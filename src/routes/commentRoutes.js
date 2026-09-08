import { Router } from "express";
import {
  getComments,
  getComment,
  createComment,
  updateComment,
  deleteComment,
} from "../controllers/commentController.js";

// mergeParams : donne accès aux paramètres :id et :taskId des routeurs parents
const router = Router({ mergeParams: true });

// TODO (étudiant) : documenter ces routes (annotations @openapi, voir les autres fichiers de routes)
router.get("/", getComments);
router.post("/", createComment);
router.get("/:commentId", getComment);
router.put("/:commentId", updateComment);
router.delete("/:commentId", deleteComment);

export default router;

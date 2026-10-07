import { Router } from "express";
import { getTasks, getTask, createTask, updateTask, deleteTask } from "../controllers/taskController.js";
import commentRoutes from "./commentRoutes.js";

// mergeParams : donne accès au paramètre :id défini dans projectRoutes
const router = Router({ mergeParams: true });

router.get("/", getTasks);
router.get("/:taskId", getTask);

// TODO (étudiant) : documenter ces routes (annotations @openapi, voir les autres fichiers de routes)
router.post("/", createTask);
router.put("/:taskId", updateTask);
router.delete("/:taskId", deleteTask);

router.use("/:taskId/comments", commentRoutes);

export default router;

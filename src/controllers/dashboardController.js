import prisma from "../lib/prisma.js";
import { publicUserSelect, taskInclude } from "../utils/selects.js";
import { sortTasksByUrgency } from "../utils/sorting.js";
import { sendSuccess } from "../utils/response.js";

const assignedTo = (userId) => ({ assignees: { some: { userId } } });

/** GET /dashboard/assigned-tasks : tâches assignées, les plus urgentes d'abord */
export const getAssignedTasks = async (req, res) => {
  const tasks = await prisma.task.findMany({
    where: assignedTo(req.user.id),
    include: taskInclude,
  });

  sendSuccess(res, "Tâches assignées récupérées", { tasks: sortTasksByUrgency(tasks) });
};

/** GET /dashboard/projects-with-tasks : projets où l'utilisateur a des tâches assignées */
export const getProjectsWithTasks = async (req, res) => {
  const projects = await prisma.project.findMany({
    where: { tasks: { some: assignedTo(req.user.id) } },
    include: {
      owner: { select: publicUserSelect },
      tasks: { where: assignedTo(req.user.id), include: taskInclude },
    },
    orderBy: { name: "asc" },
  });

  sendSuccess(res, "Projets avec tâches récupérés", {
    projects: projects.map((project) => ({ ...project, tasks: sortTasksByUrgency(project.tasks) })),
  });
};

/** GET /dashboard/stats */
export const getDashboardStats = async (req, res) => {
  const where = assignedTo(req.user.id);

  const [total, urgent, overdue, byStatus, projects] = await Promise.all([
    prisma.task.count({ where }),
    prisma.task.count({ where: { ...where, priority: { in: ["URGENT", "HIGH"] } } }),
    prisma.task.count({
      where: { ...where, dueDate: { lt: new Date() }, status: { notIn: ["DONE", "CANCELLED"] } },
    }),
    prisma.task.groupBy({ by: ["status"], where, _count: { status: true } }),
    prisma.project.count({ where: { tasks: { some: where } } }),
  ]);

  sendSuccess(res, "Statistiques du tableau de bord récupérées", {
    stats: {
      tasks: {
        total,
        urgent,
        overdue,
        byStatus: Object.fromEntries(byStatus.map((item) => [item.status, item._count.status])),
      },
      projects: { total: projects },
    },
  });
};

/**
 * Sélections Prisma réutilisables : on ne renvoie jamais le mot de passe
 * et on limite les champs transmis au front-end au strict nécessaire.
 */
export const publicUserSelect = {
  id: true,
  email: true,
  name: true,
};

export const projectInclude = {
  owner: { select: publicUserSelect },
  members: {
    include: { user: { select: publicUserSelect } },
    orderBy: { joinedAt: "asc" },
  },
  _count: { select: { tasks: true } },
};

/** Relations d'une tâche, récupérées en une seule requête (pas de N+1) */
export const taskInclude = {
  creator: { select: publicUserSelect },
  project: { select: { id: true, name: true } },
  assignees: {
    include: { user: { select: publicUserSelect } },
    orderBy: { assignedAt: "asc" },
  },
  comments: {
    include: { author: { select: publicUserSelect } },
    orderBy: { createdAt: "asc" },
  },
};

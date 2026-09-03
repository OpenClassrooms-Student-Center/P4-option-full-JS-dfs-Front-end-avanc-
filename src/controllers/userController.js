import prisma from "../lib/prisma.js";
import { publicUserSelect } from "../utils/selects.js";
import { sendSuccess, sendError } from "../utils/response.js";

/** GET /users/search?query=... (autocomplete des contributeurs) */
export const searchUsers = async (req, res) => {
  const query = typeof req.query.query === "string" ? req.query.query.trim() : "";

  if (query.length < 2) {
    sendError(res, "La recherche doit contenir au moins 2 caractères", "INVALID_QUERY", 400);
    return;
  }

  const users = await prisma.user.findMany({
    where: { OR: [{ email: { contains: query } }, { name: { contains: query } }] },
    select: publicUserSelect,
    take: 10,
    orderBy: [{ name: "asc" }, { email: "asc" }],
  });

  sendSuccess(res, "Utilisateurs trouvés", { users });
};

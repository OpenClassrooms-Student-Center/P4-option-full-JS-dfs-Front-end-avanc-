import { PrismaClient } from "@prisma/client";

// Instance unique de Prisma partagée par toute l'application
const prisma = new PrismaClient();

export default prisma;

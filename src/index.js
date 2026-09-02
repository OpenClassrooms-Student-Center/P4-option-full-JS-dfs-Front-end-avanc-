import "dotenv/config";
import app from "./app.js";
import prisma from "./lib/prisma.js";

const PORT = process.env.PORT || 8000;

const startServer = async () => {
  if (!process.env.JWT_SECRET) {
    console.error("❌ JWT_SECRET manquant : copiez .env.example en .env et renseignez-le.");
    process.exit(1);
  }

  try {
    await prisma.$connect();
    console.log("✅ Connexion à la base de données établie");
  } catch (error) {
    console.error("❌ Impossible de se connecter à la base de données :", error.message);
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`🚀 API démarrée sur http://localhost:${PORT}`);
    console.log(`📖 Documentation : http://localhost:${PORT}/api-docs`);
  });
};

const shutdown = async () => {
  await prisma.$disconnect();
  process.exit(0);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

startServer();

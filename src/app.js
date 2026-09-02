import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import swaggerUi from "swagger-ui-express";

import authRoutes from "./routes/authRoutes.js";
import { specs } from "./config/swagger.js";
import { sendError } from "./utils/response.js";

const app = express();

const allowedOrigins = (process.env.CORS_ORIGINS || "http://localhost:3000,http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(express.json({ limit: "1mb" }));

// Documentation interactive de l'API
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs, { customSiteTitle: "API Abricot.co" }));
app.get("/api-docs.json", (req, res) => res.json(specs));

app.get("/health", (req, res) => {
  res.json({ success: true, message: "API en ligne", timestamp: new Date().toISOString() });
});

app.use("/auth", authRoutes);

// Route inconnue
app.use((req, res) => {
  sendError(res, "Route non trouvée", "NOT_FOUND", 404);
});

// Gestion centralisée des erreurs : aucun détail technique n'est renvoyé au client
app.use((error, req, res, _next) => {
  if (error.type === "entity.parse.failed") {
    sendError(res, "Le corps de la requête n'est pas un JSON valide", "INVALID_JSON", 400);
    return;
  }

  console.error("Erreur serveur :", error);
  sendError(res, "Erreur interne du serveur", "INTERNAL_SERVER_ERROR", 500);
});

export default app;

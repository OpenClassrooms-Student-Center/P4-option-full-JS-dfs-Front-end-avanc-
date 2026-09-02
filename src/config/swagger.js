import path from "node:path";
import { fileURLToPath } from "node:url";
import swaggerJsdoc from "swagger-jsdoc";

const routesDir = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "routes");

const errorResponse = (description, example) => ({
  description,
  content: {
    "application/json": {
      schema: { $ref: "#/components/schemas/Error" },
      example: { success: false, ...example },
    },
  },
});

const options = {
  definition: {
    openapi: "3.0.3",
    info: {
      title: "API Abricot.co",
      version: "1.0.0",
      description:
        "API REST de gestion de projets et de tâches (authentification JWT, projets, contributeurs, tâches, commentaires, tableau de bord).\n\n" +
        "Toutes les réponses suivent le format `{ success, message, data?, error? }`.",
    },
    servers: [{ url: "http://localhost:8000", description: "Serveur de développement" }],
    tags: [
      { name: "Authentification" },
      { name: "Utilisateurs" },
      { name: "Projets" },
      { name: "Contributeurs" },
      { name: "Tâches" },
      { name: "Commentaires" },
      { name: "Tableau de bord" },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "Token obtenu via /auth/login ou /auth/register",
        },
      },
      parameters: {
        ProjectId: { in: "path", name: "id", required: true, schema: { type: "string" }, description: "ID du projet" },
        TaskId: { in: "path", name: "taskId", required: true, schema: { type: "string" }, description: "ID de la tâche" },
        CommentId: { in: "path", name: "commentId", required: true, schema: { type: "string" }, description: "ID du commentaire" },
      },
      responses: {
        ValidationFailed: {
          description: "Données invalides",
          content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationError" } } },
        },
        Unauthorized: errorResponse("Token manquant, invalide ou expiré", {
          message: "Token d'authentification manquant",
          error: "UNAUTHORIZED",
        }),
        Forbidden: errorResponse("L'utilisateur n'a pas les droits nécessaires", {
          message: "Accès refusé au projet",
          error: "FORBIDDEN",
        }),
        ProjectNotFound: errorResponse("Projet introuvable", {
          message: "Projet non trouvé",
          error: "PROJECT_NOT_FOUND",
        }),
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: { type: "string", example: "cmabc123" },
            email: { type: "string", format: "email", example: "alice@example.com" },
            name: { type: "string", nullable: true, example: "Alice Martin" },
          },
        },
        Profile: {
          allOf: [
            { $ref: "#/components/schemas/User" },
            {
              type: "object",
              properties: {
                createdAt: { type: "string", format: "date-time" },
                updatedAt: { type: "string", format: "date-time" },
              },
            },
          ],
        },
        ProjectMember: {
          type: "object",
          properties: {
            id: { type: "string" },
            role: { type: "string", enum: ["ADMIN", "CONTRIBUTOR"] },
            joinedAt: { type: "string", format: "date-time" },
            userId: { type: "string" },
            projectId: { type: "string" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        Project: {
          type: "object",
          properties: {
            id: { type: "string" },
            name: { type: "string", example: "Application E-commerce" },
            description: { type: "string", nullable: true },
            ownerId: { type: "string" },
            owner: { $ref: "#/components/schemas/User" },
            members: { type: "array", items: { $ref: "#/components/schemas/ProjectMember" } },
            _count: { type: "object", properties: { tasks: { type: "integer" } } },
            userRole: {
              type: "string",
              enum: ["ADMIN", "CONTRIBUTOR"],
              description: "Rôle de l'utilisateur connecté (le propriétaire est ADMIN)",
            },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        TaskAssignee: {
          type: "object",
          properties: {
            id: { type: "string" },
            taskId: { type: "string" },
            userId: { type: "string" },
            assignedAt: { type: "string", format: "date-time" },
            user: { $ref: "#/components/schemas/User" },
          },
        },
        Comment: {
          type: "object",
          properties: {
            id: { type: "string" },
            content: { type: "string", example: "Pensez à vérifier les droits d'accès." },
            taskId: { type: "string" },
            authorId: { type: "string" },
            author: { $ref: "#/components/schemas/User" },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Task: {
          type: "object",
          properties: {
            id: { type: "string" },
            title: { type: "string", example: "Développer l'API REST" },
            description: { type: "string", nullable: true },
            status: { type: "string", enum: ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"] },
            priority: { type: "string", enum: ["LOW", "MEDIUM", "HIGH", "URGENT"] },
            dueDate: { type: "string", format: "date-time", nullable: true },
            projectId: { type: "string" },
            creatorId: { type: "string" },
            creator: { $ref: "#/components/schemas/User" },
            project: { type: "object", properties: { id: { type: "string" }, name: { type: "string" } } },
            assignees: { type: "array", items: { $ref: "#/components/schemas/TaskAssignee" } },
            comments: { type: "array", items: { $ref: "#/components/schemas/Comment" } },
            createdAt: { type: "string", format: "date-time" },
            updatedAt: { type: "string", format: "date-time" },
          },
        },
        Success: {
          type: "object",
          properties: {
            success: { type: "boolean", example: true },
            message: { type: "string" },
            data: { type: "object" },
          },
        },
        Error: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", description: "Message lisible" },
            error: { type: "string", description: "Code d'erreur stable, exploitable par le front-end" },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            success: { type: "boolean", example: false },
            message: { type: "string", example: "Données invalides" },
            error: { type: "string", example: "VALIDATION_ERROR" },
            data: {
              type: "object",
              properties: {
                errors: {
                  type: "array",
                  items: {
                    type: "object",
                    properties: { field: { type: "string" }, message: { type: "string" } },
                  },
                },
              },
            },
          },
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [path.join(routesDir, "*.js")],
};

export const specs = swaggerJsdoc(options);

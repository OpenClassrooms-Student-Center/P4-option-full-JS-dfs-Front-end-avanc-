/**
 * Fonctions de validation des données reçues par l'API.
 * Chaque fonction renvoie un tableau d'erreurs { field, message } (vide si tout est valide).
 */

export const ROLES = ["ADMIN", "CONTRIBUTOR"];
export const TASK_STATUSES = ["TODO", "IN_PROGRESS", "DONE", "CANCELLED"];
export const TASK_PRIORITIES = ["LOW", "MEDIUM", "HIGH", "URGENT"];

const isString = (value) => typeof value === "string";

export const isValidEmail = (email) =>
  isString(email) && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

/**
 * Au moins 8 caractères, une majuscule, une minuscule, un chiffre
 * et un caractère spécial parmi @$!%*?&
 */
export const isValidPassword = (password) =>
  isString(password) &&
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(
    password
  );

export const isValidDate = (value) =>
  isString(value) && !Number.isNaN(new Date(value).getTime());

const PASSWORD_RULE_MESSAGE =
  "Le mot de passe doit contenir au moins 8 caractères, une majuscule, une minuscule, un chiffre et un caractère spécial (@$!%*?&)";

/** Valide une chaîne obligatoire ou optionnelle avec bornes de longueur */
const checkText = (errors, field, value, { label, required, min, max }) => {
  if (value === undefined || value === null || value === "") {
    if (required) errors.push({ field, message: `${label} est requis` });
    return;
  }
  if (!isString(value)) {
    errors.push({ field, message: `${label} doit être une chaîne de caractères` });
    return;
  }
  const length = value.trim().length;
  if (min && length < min) {
    errors.push({ field, message: `${label} doit contenir au moins ${min} caractères` });
  } else if (max && length > max) {
    errors.push({ field, message: `${label} ne peut pas dépasser ${max} caractères` });
  }
};

const checkAssigneeIds = (errors, assigneeIds) => {
  if (assigneeIds === undefined) return;
  if (!Array.isArray(assigneeIds)) {
    errors.push({ field: "assigneeIds", message: "Les assignations doivent être un tableau d'IDs" });
    return;
  }
  assigneeIds.forEach((userId, index) => {
    if (!isString(userId) || !userId.trim()) {
      errors.push({
        field: `assigneeIds[${index}]`,
        message: "L'ID de l'utilisateur assigné est invalide",
      });
    }
  });
};

const checkEnum = (errors, field, value, allowed, label) => {
  if (value !== undefined && !allowed.includes(value)) {
    errors.push({ field, message: `${label} doit être ${allowed.join(", ")}` });
  }
};

// ---------- Authentification ----------

export const validateRegisterData = ({ email, password, name }) => {
  const errors = [];
  if (!email) errors.push({ field: "email", message: "L'email est requis" });
  else if (!isValidEmail(email)) errors.push({ field: "email", message: "Format d'email invalide" });

  if (!password) errors.push({ field: "password", message: "Le mot de passe est requis" });
  else if (!isValidPassword(password)) errors.push({ field: "password", message: PASSWORD_RULE_MESSAGE });

  checkText(errors, "name", name, { label: "Le nom", min: 2, max: 100 });
  return errors;
};

export const validateLoginData = ({ email, password }) => {
  const errors = [];
  if (!email) errors.push({ field: "email", message: "L'email est requis" });
  if (!password) errors.push({ field: "password", message: "Le mot de passe est requis" });
  return errors;
};

export const validateUpdateProfileData = ({ name, email }) => {
  const errors = [];
  if (email !== undefined && !isValidEmail(email)) {
    errors.push({ field: "email", message: "Format d'email invalide" });
  }
  if (name !== undefined) {
    checkText(errors, "name", name, { label: "Le nom", required: true, min: 2, max: 100 });
  }
  return errors;
};

export const validateUpdatePasswordData = ({ currentPassword, newPassword }) => {
  const errors = [];
  if (!currentPassword) {
    errors.push({ field: "currentPassword", message: "Le mot de passe actuel est requis" });
  }
  if (!newPassword) {
    errors.push({ field: "newPassword", message: "Le nouveau mot de passe est requis" });
  } else if (!isValidPassword(newPassword)) {
    errors.push({ field: "newPassword", message: PASSWORD_RULE_MESSAGE });
  } else if (currentPassword === newPassword) {
    errors.push({
      field: "newPassword",
      message: "Le nouveau mot de passe doit être différent de l'actuel",
    });
  }
  return errors;
};

// ---------- Projets ----------

export const validateCreateProjectData = ({ name, description, contributors }) => {
  const errors = [];
  checkText(errors, "name", name, { label: "Le nom du projet", required: true, min: 2, max: 100 });
  checkText(errors, "description", description, { label: "La description", max: 500 });

  if (contributors !== undefined) {
    if (!Array.isArray(contributors)) {
      errors.push({ field: "contributors", message: "Les contributeurs doivent être un tableau d'emails" });
    } else {
      contributors.forEach((email, index) => {
        if (!isValidEmail(email)) {
          errors.push({ field: `contributors[${index}]`, message: "Format d'email invalide" });
        }
      });
    }
  }
  return errors;
};

export const validateUpdateProjectData = ({ name, description }) => {
  const errors = [];
  if (name !== undefined) {
    checkText(errors, "name", name, { label: "Le nom du projet", required: true, min: 2, max: 100 });
  }
  checkText(errors, "description", description, { label: "La description", max: 500 });
  return errors;
};

export const validateContributorData = ({ email, role }) => {
  const errors = [];
  if (!isValidEmail(email)) errors.push({ field: "email", message: "Un email valide est requis" });
  checkEnum(errors, "role", role, ROLES, "Le rôle");
  return errors;
};

// ---------- Tâches ----------

export const validateCreateTaskData = ({ title, description, status, priority, dueDate, assigneeIds }) => {
  const errors = [];
  checkText(errors, "title", title, { label: "Le titre de la tâche", required: true, min: 2, max: 200 });
  checkText(errors, "description", description, { label: "La description", max: 1000 });
  checkEnum(errors, "status", status, TASK_STATUSES, "Le statut");
  checkEnum(errors, "priority", priority, TASK_PRIORITIES, "La priorité");
  if (dueDate !== undefined && dueDate !== null && !isValidDate(dueDate)) {
    errors.push({ field: "dueDate", message: "Format de date invalide (utilisez le format ISO 8601)" });
  }
  checkAssigneeIds(errors, assigneeIds);
  return errors;
};

export const validateUpdateTaskData = ({ title, description, status, priority, dueDate, assigneeIds }) => {
  const errors = [];
  if (title !== undefined) {
    checkText(errors, "title", title, { label: "Le titre de la tâche", required: true, min: 2, max: 200 });
  }
  checkText(errors, "description", description, { label: "La description", max: 1000 });
  checkEnum(errors, "status", status, TASK_STATUSES, "Le statut");
  checkEnum(errors, "priority", priority, TASK_PRIORITIES, "La priorité");
  if (dueDate !== undefined && dueDate !== null && !isValidDate(dueDate)) {
    errors.push({ field: "dueDate", message: "Format de date invalide (utilisez le format ISO 8601)" });
  }
  checkAssigneeIds(errors, assigneeIds);
  return errors;
};

// ---------- Commentaires ----------

export const validateCommentData = ({ content }) => {
  const errors = [];
  checkText(errors, "content", content, { label: "Le contenu du commentaire", required: true, min: 1, max: 2000 });
  return errors;
};

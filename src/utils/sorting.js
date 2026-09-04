// La priorité est stockée sous forme de texte : un tri SQL serait alphabétique
// (HIGH, LOW, MEDIUM, URGENT). On définit donc l'ordre métier explicitement.
const PRIORITY_RANK = { URGENT: 0, HIGH: 1, MEDIUM: 2, LOW: 3 };

const dueDateValue = (task) =>
  task.dueDate ? new Date(task.dueDate).getTime() : Number.POSITIVE_INFINITY;

/**
 * Trie des tâches "les plus urgentes d'abord" :
 * priorité décroissante, puis date d'échéance la plus proche.
 * @template {{ priority: string, dueDate: Date | null }} T
 * @param {T[]} tasks
 * @returns {T[]}
 */
export const sortTasksByUrgency = (tasks) =>
  [...tasks].sort(
    (a, b) =>
      (PRIORITY_RANK[a.priority] ?? 99) - (PRIORITY_RANK[b.priority] ?? 99) ||
      dueDateValue(a) - dueDateValue(b)
  );

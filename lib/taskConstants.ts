export const TASK_PRIORITIES = ["low", "medium", "high"] as const;
export type TaskPriority = (typeof TASK_PRIORITIES)[number];

export const TASK_STATUSES = ["todo", "done"] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export const PRIORITY_COLORS: Record<TaskPriority, string> = {
  low: "text-blue-600 bg-blue-50 border-blue-200",
  medium: "text-yellow-700 bg-yellow-50 border-yellow-200",
  high: "text-red-600 bg-red-50 border-red-200",
};

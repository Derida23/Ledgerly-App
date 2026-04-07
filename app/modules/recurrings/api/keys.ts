export const recurringKeys = {
  all: ["recurrings"] as const,
  lists: () => [...recurringKeys.all, "list"] as const,
  list: () => [...recurringKeys.lists()] as const,
  dueToday: () => [...recurringKeys.all, "due-today"] as const,
} as const;

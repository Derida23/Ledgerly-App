export const budgetKeys = {
  all: ["budgets"] as const,
  lists: () => [...budgetKeys.all, "list"] as const,
  list: () => [...budgetKeys.lists()] as const,
  details: () => [...budgetKeys.all, "detail"] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
} as const;

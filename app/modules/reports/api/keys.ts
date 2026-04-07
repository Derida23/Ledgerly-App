export const reportKeys = {
  all: ["reports"] as const,
  dashboard: () => [...reportKeys.all, "dashboard"] as const,
  weekly: (date?: string) => [...reportKeys.all, "weekly", { date }] as const,
  monthly: (date?: string) =>
    [...reportKeys.all, "monthly", { date }] as const,
  yearly: (date?: string) => [...reportKeys.all, "yearly", { date }] as const,
} as const;

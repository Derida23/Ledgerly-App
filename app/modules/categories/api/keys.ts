import type { CategoryType } from "~/modules/categories/types";

export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: { type?: CategoryType }) =>
    [...categoryKeys.lists(), filters] as const,
} as const;

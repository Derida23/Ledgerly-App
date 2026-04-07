export const walletKeys = {
  all: ["wallets"] as const,
  lists: () => [...walletKeys.all, "list"] as const,
  list: () => [...walletKeys.lists()] as const,
  details: () => [...walletKeys.all, "detail"] as const,
  detail: (id: string) => [...walletKeys.details(), id] as const,
} as const;

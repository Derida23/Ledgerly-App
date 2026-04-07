# TanStack Query v5 — Deep Patterns

## Setup

### Query Client Configuration

```tsx
// src/lib/query-client.ts
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,        // 5 minutes default
      gcTime: 10 * 60 * 1000,           // 10 minutes garbage collection
      retry: 3,                          // Retry failed requests 3 times
      retryDelay: (attempt) =>           // Exponential backoff
        Math.min(1000 * 2 ** attempt, 30000),
      refetchOnWindowFocus: false,       // Minimize server hits
      refetchOnReconnect: true,          // Refetch when back online
      networkMode: "offlineFirst",       // Use cache when offline
    },
    mutations: {
      retry: false,                      // Don't retry mutations
      networkMode: "offlineFirst",
    },
  },
});
```

### Provider Setup

```tsx
// src/root.tsx
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { queryClient } from "@/lib/query-client";

export default function Root() {
  return (
    <QueryClientProvider client={queryClient}>
      <App />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}
```

---

## Query Key Factory

Centralize and type-safe all query keys per module:

```ts
// modules/transactions/api/keys.ts
export const transactionKeys = {
  all: ["transactions"] as const,
  lists: () => [...transactionKeys.all, "list"] as const,
  list: (filters: TransactionFilters) =>
    [...transactionKeys.lists(), filters] as const,
  details: () => [...transactionKeys.all, "detail"] as const,
  detail: (id: string) => [...transactionKeys.details(), id] as const,
} as const;

// modules/wallets/api/keys.ts
export const walletKeys = {
  all: ["wallets"] as const,
  lists: () => [...walletKeys.all, "list"] as const,
  list: () => [...walletKeys.lists()] as const,
  details: () => [...walletKeys.all, "detail"] as const,
  detail: (id: string) => [...walletKeys.details(), id] as const,
} as const;

// modules/categories/api/keys.ts
export const categoryKeys = {
  all: ["categories"] as const,
  lists: () => [...categoryKeys.all, "list"] as const,
  list: (filters?: { type?: "INCOME" | "EXPENSE" }) =>
    [...categoryKeys.lists(), filters] as const,
} as const;

// modules/budgets/api/keys.ts
export const budgetKeys = {
  all: ["budgets"] as const,
  lists: () => [...budgetKeys.all, "list"] as const,
  list: () => [...budgetKeys.lists()] as const,
  details: () => [...budgetKeys.all, "detail"] as const,
  detail: (id: string) => [...budgetKeys.details(), id] as const,
} as const;

// modules/recurrings/api/keys.ts
export const recurringKeys = {
  all: ["recurrings"] as const,
  lists: () => [...recurringKeys.all, "list"] as const,
  list: () => [...recurringKeys.lists()] as const,
  dueToday: () => [...recurringKeys.all, "due-today"] as const,
} as const;

// modules/reports/api/keys.ts
export const reportKeys = {
  all: ["reports"] as const,
  dashboard: () => [...reportKeys.all, "dashboard"] as const,
  weekly: (date?: string) => [...reportKeys.all, "weekly", { date }] as const,
  monthly: (date?: string) => [...reportKeys.all, "monthly", { date }] as const,
  yearly: (date?: string) => [...reportKeys.all, "yearly", { date }] as const,
} as const;
```

**Why factory pattern?**
- `queryClient.invalidateQueries({ queryKey: transactionKeys.all })` → invalidates all transaction queries (lists + details)
- `queryClient.invalidateQueries({ queryKey: transactionKeys.lists() })` → invalidates only lists, not details
- Type-safe: autocomplete filters, params

---

## Query Patterns

### Basic Query

```tsx
import { useQuery } from "@tanstack/react-query";
import { walletKeys } from "@/modules/wallets/api/keys";
import { getWallets } from "@/modules/wallets/api";

export function useWallets() {
  return useQuery({
    queryKey: walletKeys.list(),
    queryFn: getWallets,
    staleTime: 5 * 60 * 1000,
  });
}
```

### Query with Params

```tsx
import { useQuery } from "@tanstack/react-query";
import { walletKeys } from "@/modules/wallets/api/keys";
import { getWallet } from "@/modules/wallets/api";

export function useWallet(id: string) {
  return useQuery({
    queryKey: walletKeys.detail(id),
    queryFn: () => getWallet(id),
    enabled: !!id, // Don't fetch if id is empty
  });
}
```

### Query with Filters

```tsx
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { transactionKeys } from "@/modules/transactions/api/keys";
import { getTransactions } from "@/modules/transactions/api";
import type { TransactionFilters } from "@/modules/transactions/types";

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => getTransactions(filters),
    placeholderData: keepPreviousData, // Keep old data while fetching new page
    staleTime: 5 * 60 * 1000,
  });
}
```

### Dependent Queries

```tsx
// Fetch categories only after session is loaded (to know user)
export function useCategories(type?: "INCOME" | "EXPENSE") {
  const { data: session } = useSession();

  return useQuery({
    queryKey: categoryKeys.list({ type }),
    queryFn: () => getCategories(type),
    enabled: !!session, // Wait for auth
    staleTime: 30 * 60 * 1000,
  });
}
```

### Parallel Queries (Dashboard)

```tsx
import { useQueries } from "@tanstack/react-query";

export function useDashboardData() {
  const results = useQueries({
    queries: [
      {
        queryKey: reportKeys.dashboard(),
        queryFn: getDashboard,
        staleTime: 10 * 60 * 1000,
      },
      {
        queryKey: budgetKeys.list(),
        queryFn: getBudgets,
        staleTime: 5 * 60 * 1000,
      },
      {
        queryKey: recurringKeys.dueToday(),
        queryFn: getDueToday,
        staleTime: 60 * 60 * 1000,
      },
    ],
  });

  const [dashboard, budgets, dueToday] = results;

  return {
    dashboard: dashboard.data,
    budgets: budgets.data,
    dueToday: dueToday.data,
    isLoading: results.some((r) => r.isLoading),
    isError: results.some((r) => r.isError),
  };
}
```

---

## Pagination

### Numbered Pagination

```tsx
import { useQuery, keepPreviousData } from "@tanstack/react-query";

interface PaginationParams {
  page: number;
  limit: number;
  type?: string;
  walletId?: string;
  startDate?: string;
  endDate?: string;
}

export function useTransactionsPaginated(params: PaginationParams) {
  return useQuery({
    queryKey: transactionKeys.list(params),
    queryFn: () => getTransactions(params),
    placeholderData: keepPreviousData, // No loading flash between pages
  });
}

// Usage in component
function TransactionList() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState<Partial<PaginationParams>>({});

  const { data, isLoading, isPlaceholderData } = useTransactionsPaginated({
    page,
    limit: 20,
    ...filters,
  });

  return (
    <div>
      <TransactionFilter onChange={setFilters} />

      {isLoading ? (
        <Skeleton />
      ) : (
        <TransactionItems
          transactions={data?.data ?? []}
          isStale={isPlaceholderData}
        />
      )}

      <Pagination
        currentPage={page}
        totalPages={data?.totalPages ?? 1}
        onPageChange={setPage}
        disabled={isPlaceholderData}
      />
    </div>
  );
}
```

### Prefetch Next Page

```tsx
import { useQueryClient } from "@tanstack/react-query";

function TransactionList() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);

  const { data } = useTransactionsPaginated({ page, limit: 20 });

  // Prefetch next page when current page loads
  useEffect(() => {
    if (data && page < data.totalPages) {
      queryClient.prefetchQuery({
        queryKey: transactionKeys.list({ page: page + 1, limit: 20 }),
        queryFn: () => getTransactions({ page: page + 1, limit: 20 }),
      });
    }
  }, [data, page, queryClient]);
}
```

---

## Mutations

### Basic Mutation

```tsx
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createWallet,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    },
  });
}

// Usage
function WalletForm() {
  const { mutate, isPending } = useCreateWallet();

  function onSubmit(data: CreateWalletInput) {
    mutate(data, {
      onSuccess: () => {
        toast.success("Wallet berhasil ditambahkan");
        closeDialog();
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }
}
```

### Mutation with Complex Invalidation

```tsx
// Transaction mutation — invalidates multiple related queries
export function useCreateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => {
      // Invalidate all related data
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

// Transfer mutation — even more invalidation
export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all }); // 2 wallets change
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}
```

### Delete with Confirmation Pattern

```tsx
export function useDeleteTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transactionKeys.all });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}

// Usage with confirm dialog
function TransactionItem({ transaction }: { transaction: TransactionResponse }) {
  const { mutate: deleteTransaction, isPending } = useDeleteTransaction();
  const [showConfirm, setShowConfirm] = useState(false);

  function handleDelete() {
    deleteTransaction(transaction.id, {
      onSuccess: () => {
        toast.success("Transaksi berhasil dihapus");
        setShowConfirm(false);
      },
      onError: (error) => {
        toast.error(error.message);
      },
    });
  }

  return (
    <>
      {/* ... transaction display ... */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={handleDelete}
        isPending={isPending}
        title="Hapus Transaksi?"
        description="Transaksi yang dihapus tidak bisa dikembalikan."
      />
    </>
  );
}
```

### Update Mutation

```tsx
export function useUpdateTransaction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionInput }) =>
      updateTransaction(id, data),
    onSuccess: (_data, variables) => {
      // Invalidate the specific detail + all lists
      queryClient.invalidateQueries({
        queryKey: transactionKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: transactionKeys.lists() });
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      queryClient.invalidateQueries({ queryKey: reportKeys.all });
    },
  });
}
```

---

## Invalidation Strategy Map

Central reference for what invalidates what:

```ts
// lib/invalidation.ts
import { queryClient } from "@/lib/query-client";
import { transactionKeys } from "@/modules/transactions/api/keys";
import { walletKeys } from "@/modules/wallets/api/keys";
import { budgetKeys } from "@/modules/budgets/api/keys";
import { reportKeys } from "@/modules/reports/api/keys";
import { categoryKeys } from "@/modules/categories/api/keys";
import { recurringKeys } from "@/modules/recurrings/api/keys";

export const invalidation = {
  afterTransactionChange: () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    queryClient.invalidateQueries({ queryKey: walletKeys.all });
    queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    queryClient.invalidateQueries({ queryKey: reportKeys.all });
  },

  afterTransferChange: () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    queryClient.invalidateQueries({ queryKey: walletKeys.all });
    queryClient.invalidateQueries({ queryKey: reportKeys.all });
  },

  afterWalletChange: () => {
    queryClient.invalidateQueries({ queryKey: walletKeys.all });
  },

  afterCategoryChange: () => {
    queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    queryClient.invalidateQueries({ queryKey: budgetKeys.all });
  },

  afterBudgetChange: () => {
    queryClient.invalidateQueries({ queryKey: budgetKeys.all });
  },

  afterRecurringChange: () => {
    queryClient.invalidateQueries({ queryKey: recurringKeys.all });
  },

  afterSeed: (type: "wallets" | "categories") => {
    if (type === "wallets") {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
    } else {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
    }
  },

  onLogout: () => {
    queryClient.clear();
  },
} as const;
```

Usage in mutations:

```tsx
export function useCreateTransaction() {
  return useMutation({
    mutationFn: createTransaction,
    onSuccess: () => invalidation.afterTransactionChange(),
  });
}
```

---

## Stale Time Configuration per Module

```ts
// lib/query-config.ts
export const staleTime = {
  wallets: 5 * 60 * 1000,         // 5 min — changes via invalidation
  categories: 30 * 60 * 1000,     // 30 min — rarely changes
  transactions: 5 * 60 * 1000,    // 5 min — changes via invalidation
  budgets: 5 * 60 * 1000,         // 5 min — changes via invalidation
  recurrings: 30 * 60 * 1000,     // 30 min — rarely changes
  recurringsDueToday: 60 * 60 * 1000, // 1 hour — changes once per day
  reports: 10 * 60 * 1000,        // 10 min — heavy aggregation
  dashboard: 10 * 60 * 1000,      // 10 min — heavy aggregation
} as const;
```

---

## Error Handling

### Global Error Handler

```tsx
// lib/query-client.ts
import { QueryCache, MutationCache, QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  queryCache: new QueryCache({
    onError: (error, query) => {
      // Only show toast for queries that have data in cache (background refetch failed)
      if (query.state.data !== undefined) {
        toast.error(`Gagal memperbarui data: ${error.message}`);
      }
    },
  }),
  mutationCache: new MutationCache({
    onError: (error) => {
      // Global mutation error — individual mutations can override
      if (error instanceof AuthError) {
        // Handled by session expired modal
        return;
      }
      toast.error(error.message);
    },
  }),
  defaultOptions: {
    // ...
  },
});
```

### Per-Query Error Handling

```tsx
export function useWallet(id: string) {
  return useQuery({
    queryKey: walletKeys.detail(id),
    queryFn: () => getWallet(id),
    retry: (failureCount, error) => {
      // Don't retry 404
      if (error instanceof ApiError && error.status === 404) return false;
      return failureCount < 3;
    },
  });
}
```

---

## Loading States

### Skeleton Pattern

```tsx
function WalletList() {
  const { data: wallets, isLoading, isError, error, refetch } = useWallets();

  if (isLoading) {
    return <WalletListSkeleton />;
  }

  if (isError) {
    return (
      <InlineError
        message={error.message}
        onRetry={refetch}
      />
    );
  }

  if (!wallets?.length) {
    return <EmptyState message="Belum ada wallet" />;
  }

  return (
    <ul>
      {wallets.map((wallet) => (
        <WalletCard key={wallet.id} wallet={wallet} />
      ))}
    </ul>
  );
}
```

### Mutation Loading in Form

```tsx
function WalletForm({ onClose }: { onClose: () => void }) {
  const { mutate, isPending } = useCreateWallet();

  return (
    <form onSubmit={handleSubmit}>
      {/* ... fields ... */}
      <button type="submit" disabled={isPending}>
        {isPending ? "Menyimpan..." : "Simpan"}
      </button>
    </form>
  );
}
```

---

## Pull to Refresh

```tsx
import { useQueryClient } from "@tanstack/react-query";

export function usePullToRefresh(queryKeys: readonly unknown[][]) {
  const queryClient = useQueryClient();
  const [isRefreshing, setIsRefreshing] = useState(false);

  async function refresh() {
    setIsRefreshing(true);
    await Promise.all(
      queryKeys.map((key) =>
        queryClient.invalidateQueries({ queryKey: key })
      )
    );
    setIsRefreshing(false);
  }

  return { isRefreshing, refresh };
}

// Usage
function TransactionList() {
  const { isRefreshing, refresh } = usePullToRefresh([
    transactionKeys.all,
    walletKeys.all,
  ]);

  return (
    <PullToRefresh onRefresh={refresh} isRefreshing={isRefreshing}>
      {/* ... list content ... */}
    </PullToRefresh>
  );
}
```

---

## TypeScript Types

### Typed Query Options Helper

```ts
import type { UseQueryOptions } from "@tanstack/react-query";

// Helper for type-safe query options
type QueryOptions<TData, TError = Error> = Omit<
  UseQueryOptions<TData, TError>,
  "queryKey" | "queryFn"
>;

export function useWallets(options?: QueryOptions<WalletResponse[]>) {
  return useQuery({
    queryKey: walletKeys.list(),
    queryFn: getWallets,
    staleTime: staleTime.wallets,
    ...options,
  });
}

// Consumers can override options
const { data } = useWallets({ enabled: false }); // Don't auto-fetch
```

---

## Quick Reference

| Pattern                   | When to Use                                    |
| ------------------------- | ---------------------------------------------- |
| `useQuery`                | GET requests, single resource                  |
| `useQueries`              | Multiple parallel GET requests (dashboard)     |
| `useMutation`             | POST/PUT/PATCH/DELETE                          |
| `keepPreviousData`        | Pagination — no loading flash between pages    |
| `enabled: false`          | Conditional fetching (wait for dependency)     |
| `prefetchQuery`           | Preload next page or likely navigation         |
| `invalidateQueries`       | Refetch after mutation                         |
| `queryClient.clear()`     | On logout — remove all cached data             |

| Hook Return        | Meaning                                         |
| ------------------ | ----------------------------------------------- |
| `isLoading`        | First fetch, no cached data                     |
| `isFetching`       | Any fetch in progress (including background)    |
| `isPlaceholderData` | Showing previous page data during pagination   |
| `isError`          | Query failed                                    |
| `isSuccess`        | Query succeeded, data available                 |
| `isPending`        | Mutation in progress                            |

| Key Pattern              | Invalidates                                    |
| ------------------------ | ---------------------------------------------- |
| `transactionKeys.all`    | All transaction queries (lists + details)      |
| `transactionKeys.lists()` | Only transaction list queries                 |
| `transactionKeys.detail(id)` | One specific transaction                  |
| `walletKeys.all`         | All wallet queries                             |
| `reportKeys.all`         | All report queries                             |

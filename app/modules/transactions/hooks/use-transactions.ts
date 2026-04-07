import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getTransactions,
  getTransaction,
  createTransaction,
  createTransfer,
  updateTransaction,
  deleteTransaction,
  transactionKeys,
} from "~/modules/transactions/api";
import { walletKeys } from "~/modules/wallets/api/keys";
import { budgetKeys } from "~/modules/budgets/api/keys";
import { reportKeys } from "~/modules/reports/api/keys";
import type {
  TransactionFilters,
  CreateTransactionInput,
  CreateTransferInput,
  UpdateTransactionInput,
} from "~/modules/transactions/types";

const STALE_TIME = 5 * 60 * 1000;

export function useTransactions(filters: TransactionFilters) {
  return useQuery({
    queryKey: transactionKeys.list(filters),
    queryFn: () => getTransactions(filters),
    placeholderData: keepPreviousData,
    staleTime: STALE_TIME,
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: transactionKeys.detail(id),
    queryFn: () => getTransaction(id),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

function useInvalidateAfterTransaction() {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: transactionKeys.all });
    queryClient.invalidateQueries({ queryKey: walletKeys.all });
    queryClient.invalidateQueries({ queryKey: budgetKeys.all });
    queryClient.invalidateQueries({ queryKey: reportKeys.all });
  };
}

export function useCreateTransaction() {
  const invalidate = useInvalidateAfterTransaction();

  return useMutation({
    mutationFn: (data: CreateTransactionInput) => createTransaction(data),
    onSuccess: () => {
      invalidate();
      toast.success("Transaksi berhasil ditambahkan");
    },
  });
}

export function useCreateTransfer() {
  const invalidate = useInvalidateAfterTransaction();

  return useMutation({
    mutationFn: (data: CreateTransferInput) => createTransfer(data),
    onSuccess: () => {
      invalidate();
      toast.success("Transfer berhasil");
    },
  });
}

export function useUpdateTransaction() {
  const invalidate = useInvalidateAfterTransaction();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateTransactionInput }) =>
      updateTransaction(id, data),
    onSuccess: () => {
      invalidate();
      toast.success("Transaksi berhasil diubah");
    },
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateAfterTransaction();

  return useMutation({
    mutationFn: (id: string) => deleteTransaction(id),
    onSuccess: () => {
      invalidate();
      toast.success("Transaksi berhasil dihapus");
    },
  });
}

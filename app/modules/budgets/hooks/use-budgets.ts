import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getBudgets,
  getBudget,
  createBudget,
  updateBudget,
  deleteBudget,
  budgetKeys,
} from "~/modules/budgets/api";
import type {
  CreateBudgetInput,
  UpdateBudgetInput,
} from "~/modules/budgets/types";

const STALE_TIME = 5 * 60 * 1000;

export function useBudgets() {
  return useQuery({
    queryKey: budgetKeys.list(),
    queryFn: getBudgets,
    staleTime: STALE_TIME,
  });
}

export function useBudget(id: string) {
  return useQuery({
    queryKey: budgetKeys.detail(id),
    queryFn: () => getBudget(id),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export function useCreateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateBudgetInput) => createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      toast.success("Budget berhasil ditambahkan");
    },
  });
}

export function useUpdateBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateBudgetInput }) =>
      updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      toast.success("Budget berhasil diubah");
    },
  });
}

export function useDeleteBudget() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: budgetKeys.all });
      toast.success("Budget berhasil dihapus");
    },
  });
}

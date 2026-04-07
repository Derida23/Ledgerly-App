import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getRecurrings,
  getRecurring,
  getDueToday,
  createRecurring,
  updateRecurring,
  deleteRecurring,
  recurringKeys,
} from "~/modules/recurrings/api";
import type {
  CreateRecurringInput,
  UpdateRecurringInput,
} from "~/modules/recurrings/types";

const STALE_TIME = 30 * 60 * 1000;
const DUE_TODAY_STALE = 60 * 60 * 1000;

export function useRecurrings() {
  return useQuery({
    queryKey: recurringKeys.list(),
    queryFn: getRecurrings,
    staleTime: STALE_TIME,
  });
}

export function useRecurring(id: string) {
  return useQuery({
    queryKey: [...recurringKeys.all, "detail", id] as const,
    queryFn: () => getRecurring(id),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export function useDueToday() {
  return useQuery({
    queryKey: recurringKeys.dueToday(),
    queryFn: getDueToday,
    staleTime: DUE_TODAY_STALE,
  });
}

export function useCreateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateRecurringInput) => createRecurring(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
      toast.success("Recurring berhasil ditambahkan");
    },
  });
}

export function useUpdateRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateRecurringInput }) =>
      updateRecurring(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
      toast.success("Recurring berhasil diubah");
    },
  });
}

export function useDeleteRecurring() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteRecurring(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurringKeys.all });
      toast.success("Recurring berhasil dihapus");
    },
  });
}

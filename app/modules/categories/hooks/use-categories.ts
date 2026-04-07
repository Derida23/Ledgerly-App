import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getCategories,
  getCategory,
  createCategory,
  updateCategory,
  deleteCategory,
  seedCategories,
  categoryKeys,
} from "~/modules/categories/api";
import type {
  CategoryType,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "~/modules/categories/types";

const STALE_TIME = 30 * 60 * 1000;

export function useCategories(type?: CategoryType) {
  return useQuery({
    queryKey: categoryKeys.list(type ? { type } : undefined),
    queryFn: () => getCategories(type),
    staleTime: STALE_TIME,
  });
}

export function useCategory(id: string) {
  return useQuery({
    queryKey: [...categoryKeys.all, "detail", id] as const,
    queryFn: () => getCategory(id),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryInput) => createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Kategori berhasil ditambahkan");
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateCategoryInput }) =>
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Kategori berhasil diubah");
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Kategori berhasil dihapus");
    },
  });
}

export function useSeedCategories() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seedCategories,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoryKeys.all });
      toast.success("Default kategori berhasil di-seed");
    },
  });
}

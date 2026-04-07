import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  getWallets,
  getWallet,
  createWallet,
  updateWallet,
  deleteWallet,
  seedWallets,
  walletKeys,
} from "~/modules/wallets/api";
import type {
  CreateWalletInput,
  UpdateWalletInput,
} from "~/modules/wallets/types";

const STALE_TIME = 5 * 60 * 1000;

export function useWallets() {
  return useQuery({
    queryKey: walletKeys.list(),
    queryFn: getWallets,
    staleTime: STALE_TIME,
  });
}

export function useWallet(id: string) {
  return useQuery({
    queryKey: walletKeys.detail(id),
    queryFn: () => getWallet(id),
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

export function useCreateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWalletInput) => createWallet(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success("Wallet berhasil ditambahkan");
    },
  });
}

export function useUpdateWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateWalletInput }) =>
      updateWallet(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: walletKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({ queryKey: walletKeys.lists() });
      toast.success("Wallet berhasil diubah");
    },
  });
}

export function useDeleteWallet() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteWallet(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success("Wallet berhasil dihapus");
    },
  });
}

export function useSeedWallets() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: seedWallets,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.all });
      toast.success("Default wallets berhasil di-seed");
    },
  });
}

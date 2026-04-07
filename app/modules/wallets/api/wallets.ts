import { apiClient } from "~/lib/api-client";
import type {
  WalletResponse,
  CreateWalletInput,
  UpdateWalletInput,
} from "~/modules/wallets/types";

export async function getWallets(): Promise<WalletResponse[]> {
  return apiClient<WalletResponse[]>("/api/wallets");
}

export async function getWallet(id: string): Promise<WalletResponse> {
  return apiClient<WalletResponse>(`/api/wallets/${id}`);
}

export async function createWallet(
  data: CreateWalletInput,
): Promise<WalletResponse> {
  return apiClient<WalletResponse>("/api/wallets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateWallet(
  id: string,
  data: UpdateWalletInput,
): Promise<WalletResponse> {
  return apiClient<WalletResponse>(`/api/wallets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteWallet(id: string): Promise<void> {
  return apiClient<void>(`/api/wallets/${id}`, {
    method: "DELETE",
  });
}

export async function seedWallets(): Promise<void> {
  return apiClient<void>("/api/wallets/seed", {
    method: "POST",
  });
}

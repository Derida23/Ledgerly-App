import { apiClient } from "~/lib/api-client";
import type {
  TransactionResponse,
  PaginatedTransactionResponse,
  TransactionFilters,
  CreateTransactionInput,
  CreateTransferInput,
  UpdateTransactionInput,
} from "~/modules/transactions/types";

export async function getTransactions(
  filters: TransactionFilters,
): Promise<PaginatedTransactionResponse> {
  const params = new URLSearchParams();
  if (filters.page) params.set("page", String(filters.page));
  if (filters.limit) params.set("limit", String(filters.limit));
  if (filters.type) params.set("type", filters.type);
  if (filters.walletId) params.set("walletId", filters.walletId);
  if (filters.categoryId) params.set("categoryId", filters.categoryId);
  if (filters.startDate) params.set("startDate", filters.startDate);
  if (filters.endDate) params.set("endDate", filters.endDate);

  const qs = params.toString();
  return apiClient<PaginatedTransactionResponse>(
    `/api/transactions${qs ? `?${qs}` : ""}`,
  );
}

export async function getTransaction(
  id: string,
): Promise<TransactionResponse> {
  return apiClient<TransactionResponse>(`/api/transactions/${id}`);
}

export async function createTransaction(
  data: CreateTransactionInput,
): Promise<TransactionResponse> {
  return apiClient<TransactionResponse>("/api/transactions", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function createTransfer(
  data: CreateTransferInput,
): Promise<TransactionResponse[]> {
  return apiClient<TransactionResponse[]>("/api/transactions/transfer", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateTransaction(
  id: string,
  data: UpdateTransactionInput,
): Promise<TransactionResponse> {
  return apiClient<TransactionResponse>(`/api/transactions/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteTransaction(id: string): Promise<void> {
  return apiClient<void>(`/api/transactions/${id}`, {
    method: "DELETE",
  });
}

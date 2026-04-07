import { apiClient } from "~/lib/api-client";
import type {
  BudgetResponse,
  CreateBudgetInput,
  UpdateBudgetInput,
} from "~/modules/budgets/types";

export async function getBudgets(): Promise<BudgetResponse[]> {
  return apiClient<BudgetResponse[]>("/api/budgets");
}

export async function getBudget(id: string): Promise<BudgetResponse> {
  return apiClient<BudgetResponse>(`/api/budgets/${id}`);
}

export async function createBudget(
  data: CreateBudgetInput,
): Promise<BudgetResponse> {
  return apiClient<BudgetResponse>("/api/budgets", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateBudget(
  id: string,
  data: UpdateBudgetInput,
): Promise<BudgetResponse> {
  return apiClient<BudgetResponse>(`/api/budgets/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteBudget(id: string): Promise<void> {
  return apiClient<void>(`/api/budgets/${id}`, {
    method: "DELETE",
  });
}

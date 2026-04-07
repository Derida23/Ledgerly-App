import { apiClient } from "~/lib/api-client";
import type {
  RecurringResponse,
  CreateRecurringInput,
  UpdateRecurringInput,
} from "~/modules/recurrings/types";

export async function getRecurrings(): Promise<RecurringResponse[]> {
  return apiClient<RecurringResponse[]>("/api/recurrings");
}

export async function getRecurring(id: string): Promise<RecurringResponse> {
  return apiClient<RecurringResponse>(`/api/recurrings/${id}`);
}

export async function getDueToday(): Promise<RecurringResponse[]> {
  return apiClient<RecurringResponse[]>("/api/recurrings/due-today");
}

export async function createRecurring(
  data: CreateRecurringInput,
): Promise<RecurringResponse> {
  return apiClient<RecurringResponse>("/api/recurrings", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateRecurring(
  id: string,
  data: UpdateRecurringInput,
): Promise<RecurringResponse> {
  return apiClient<RecurringResponse>(`/api/recurrings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteRecurring(id: string): Promise<void> {
  return apiClient<void>(`/api/recurrings/${id}`, {
    method: "DELETE",
  });
}

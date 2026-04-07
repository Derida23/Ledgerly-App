import { apiClient } from "~/lib/api-client";
import type {
  CategoryResponse,
  CategoryType,
  CreateCategoryInput,
  UpdateCategoryInput,
} from "~/modules/categories/types";

export async function getCategories(
  type?: CategoryType,
): Promise<CategoryResponse[]> {
  const params = type ? `?type=${type}` : "";
  return apiClient<CategoryResponse[]>(`/api/categories${params}`);
}

export async function getCategory(id: string): Promise<CategoryResponse> {
  return apiClient<CategoryResponse>(`/api/categories/${id}`);
}

export async function createCategory(
  data: CreateCategoryInput,
): Promise<CategoryResponse> {
  return apiClient<CategoryResponse>("/api/categories", {
    method: "POST",
    body: JSON.stringify(data),
  });
}

export async function updateCategory(
  id: string,
  data: UpdateCategoryInput,
): Promise<CategoryResponse> {
  return apiClient<CategoryResponse>(`/api/categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}

export async function deleteCategory(id: string): Promise<void> {
  return apiClient<void>(`/api/categories/${id}`, {
    method: "DELETE",
  });
}

export async function seedCategories(): Promise<void> {
  return apiClient<void>("/api/categories/seed", {
    method: "POST",
  });
}

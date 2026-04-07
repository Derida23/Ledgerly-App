import { z } from "zod";

export const CategoryType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

export type CategoryType = (typeof CategoryType)[keyof typeof CategoryType];

export interface CategoryResponse {
  id: string;
  name: string;
  icon: string;
  type: CategoryType;
  createdAt: string;
  updatedAt: string;
}

export const createCategorySchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  icon: z.string().min(1, "Icon wajib diisi"),
  type: z.enum(["INCOME", "EXPENSE"], {
    required_error: "Tipe wajib dipilih",
  }),
});

export type CreateCategoryInput = z.infer<typeof createCategorySchema>;

export const updateCategorySchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").optional(),
  icon: z.string().min(1, "Icon wajib diisi").optional(),
});

export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;

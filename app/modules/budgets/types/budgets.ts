import { z } from "zod";

export const BudgetStatus = {
  NORMAL: "NORMAL",
  WARNING: "WARNING",
  OVER_BUDGET: "OVER_BUDGET",
} as const;

export type BudgetStatus = (typeof BudgetStatus)[keyof typeof BudgetStatus];

export interface BudgetCategoryDto {
  id: string;
  name: string;
  icon: string;
}

export interface BudgetResponse {
  id: string;
  name: string;
  limit: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: BudgetStatus;
  categories: BudgetCategoryDto[];
  createdAt: string;
  updatedAt: string;
}

export const createBudgetSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  limit: z.coerce.number().positive("Limit harus lebih dari 0"),
  categoryIds: z.array(z.string()).min(1, "Pilih minimal 1 kategori"),
});

export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;

export const updateBudgetSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").optional(),
  limit: z.coerce.number().positive("Limit harus lebih dari 0").optional(),
  categoryIds: z.array(z.string()).min(1, "Pilih minimal 1 kategori").optional(),
});

export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

import { z } from "zod";

export const RecurringType = {
  EXPENSE: "EXPENSE",
  TRANSFER: "TRANSFER",
} as const;

export type RecurringType = (typeof RecurringType)[keyof typeof RecurringType];

export interface RecurringResponse {
  id: string;
  name: string;
  type: RecurringType;
  amount: number;
  dayOfMonth: number;
  wallet: { id: string; name: string };
  targetWallet: { id: string; name: string } | null;
  category: { id: string; name: string; icon: string } | null;
  createdAt: string;
  updatedAt: string;
}

export const createRecurringSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),
    type: z.enum(["EXPENSE", "TRANSFER"], {
      required_error: "Tipe wajib dipilih",
    }),
    amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
    dayOfMonth: z.coerce
      .number()
      .min(1, "Minimal tanggal 1")
      .max(31, "Maksimal tanggal 31"),
    walletId: z.string().min(1, "Wallet wajib dipilih"),
    targetWalletId: z.string().optional(),
    categoryId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "TRANSFER") return !!data.targetWalletId;
      return true;
    },
    {
      message: "Wallet tujuan wajib untuk transfer",
      path: ["targetWalletId"],
    },
  )
  .refine(
    (data) => {
      if (data.type === "EXPENSE") return !!data.categoryId;
      return true;
    },
    {
      message: "Kategori wajib untuk pengeluaran",
      path: ["categoryId"],
    },
  );

export type CreateRecurringInput = z.infer<typeof createRecurringSchema>;

export const updateRecurringSchema = z.object({
  name: z.string().min(1).optional(),
  amount: z.coerce.number().positive().optional(),
  dayOfMonth: z.coerce.number().min(1).max(31).optional(),
  walletId: z.string().min(1).optional(),
  targetWalletId: z.string().optional(),
  categoryId: z.string().optional(),
});

export type UpdateRecurringInput = z.infer<typeof updateRecurringSchema>;

import { z } from "zod";

export const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
  TRANSFER_IN: "TRANSFER_IN",
  TRANSFER_OUT: "TRANSFER_OUT",
} as const;

export type TransactionType =
  (typeof TransactionType)[keyof typeof TransactionType];

export const PaymentMethod = {
  CASH: "CASH",
  QRIS: "QRIS",
  TRANSFER: "TRANSFER",
  DEBIT: "DEBIT",
} as const;

export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export interface TransactionResponse {
  id: string;
  amount: number;
  type: TransactionType;
  method: PaymentMethod | null;
  date: string;
  note: string | null;
  transferPairId: string | null;
  wallet: { id: string; name: string };
  category: { id: string; name: string; icon: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedTransactionResponse {
  data: TransactionResponse[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TransactionFilters {
  page?: number;
  limit?: number;
  type?: TransactionType;
  walletId?: string;
  categoryId?: string;
  startDate?: string;
  endDate?: string;
}

// Income / Expense form
export const createTransactionSchema = z
  .object({
    amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
    type: z.enum(["INCOME", "EXPENSE"]),
    walletId: z.string().min(1, "Wallet wajib dipilih"),
    categoryId: z.string().min(1, "Kategori wajib dipilih"),
    method: z.enum(["CASH", "QRIS", "TRANSFER", "DEBIT"]).optional(),
    date: z.string().optional(),
    note: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "EXPENSE") return !!data.method;
      return true;
    },
    {
      message: "Metode pembayaran wajib untuk pengeluaran",
      path: ["method"],
    },
  );

export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;

// Transfer form
export const createTransferSchema = z
  .object({
    amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
    sourceWalletId: z.string().min(1, "Wallet sumber wajib dipilih"),
    targetWalletId: z.string().min(1, "Wallet tujuan wajib dipilih"),
    adminFee: z.coerce.number().min(0),
    date: z.string().optional(),
    note: z.string().optional(),
  })
  .refine((data) => data.sourceWalletId !== data.targetWalletId, {
    message: "Wallet sumber dan tujuan tidak boleh sama",
    path: ["targetWalletId"],
  });

export type CreateTransferInput = z.infer<typeof createTransferSchema>;

// Update (partial, no type change)
export const updateTransactionSchema = z.object({
  amount: z.coerce.number().positive("Jumlah harus lebih dari 0").optional(),
  categoryId: z.string().min(1).optional(),
  method: z.enum(["CASH", "QRIS", "TRANSFER", "DEBIT"]).optional(),
  date: z.string().optional(),
  note: z.string().optional(),
});

export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;

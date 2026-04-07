import { z } from "zod";

export interface WalletResponse {
  id: string;
  name: string;
  initialBalance: number;
  balance: number;
  createdAt: string;
  updatedAt: string;
}

export const createWalletSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  initialBalance: z.coerce
    .number({ invalid_type_error: "Harus berupa angka" })
    .min(0, "Saldo tidak boleh negatif"),
});

export type CreateWalletInput = z.infer<typeof createWalletSchema>;

export const updateWalletSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi").optional(),
  initialBalance: z.coerce
    .number({ invalid_type_error: "Harus berupa angka" })
    .min(0, "Saldo tidak boleh negatif")
    .optional(),
});

export type UpdateWalletInput = z.infer<typeof updateWalletSchema>;

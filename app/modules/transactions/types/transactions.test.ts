import { describe, it, expect } from "vitest";
import { createTransactionSchema, createTransferSchema, updateTransactionSchema } from "./transactions";

describe("createTransactionSchema", () => {
  it("validates valid expense", () => {
    const result = createTransactionSchema.safeParse({
      amount: 50000,
      type: "EXPENSE",
      walletId: "w1",
      categoryId: "c1",
      method: "QRIS",
    });
    expect(result.success).toBe(true);
  });

  it("validates valid income (no method required)", () => {
    const result = createTransactionSchema.safeParse({
      amount: 8500000,
      type: "INCOME",
      walletId: "w1",
      categoryId: "c1",
    });
    expect(result.success).toBe(true);
  });

  it("rejects expense without method", () => {
    const result = createTransactionSchema.safeParse({
      amount: 50000,
      type: "EXPENSE",
      walletId: "w1",
      categoryId: "c1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero amount", () => {
    const result = createTransactionSchema.safeParse({
      amount: 0,
      type: "INCOME",
      walletId: "w1",
      categoryId: "c1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative amount", () => {
    const result = createTransactionSchema.safeParse({
      amount: -100,
      type: "INCOME",
      walletId: "w1",
      categoryId: "c1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects missing walletId", () => {
    const result = createTransactionSchema.safeParse({
      amount: 100,
      type: "INCOME",
      walletId: "",
      categoryId: "c1",
    });
    expect(result.success).toBe(false);
  });

  it("accepts optional date and note", () => {
    const result = createTransactionSchema.safeParse({
      amount: 100,
      type: "INCOME",
      walletId: "w1",
      categoryId: "c1",
      date: "2026-04-08",
      note: "Test note",
    });
    expect(result.success).toBe(true);
  });
});

describe("createTransferSchema", () => {
  it("validates valid transfer", () => {
    const result = createTransferSchema.safeParse({
      amount: 1000000,
      sourceWalletId: "w1",
      targetWalletId: "w2",
      adminFee: 6500,
    });
    expect(result.success).toBe(true);
  });

  it("rejects same source and target wallet", () => {
    const result = createTransferSchema.safeParse({
      amount: 1000000,
      sourceWalletId: "w1",
      targetWalletId: "w1",
      adminFee: 0,
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("targetWalletId");
    }
  });

  it("rejects zero amount", () => {
    const result = createTransferSchema.safeParse({
      amount: 0,
      sourceWalletId: "w1",
      targetWalletId: "w2",
      adminFee: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects negative admin fee", () => {
    const result = createTransferSchema.safeParse({
      amount: 100,
      sourceWalletId: "w1",
      targetWalletId: "w2",
      adminFee: -100,
    });
    expect(result.success).toBe(false);
  });
});

describe("updateTransactionSchema", () => {
  it("allows partial update", () => {
    expect(updateTransactionSchema.safeParse({ amount: 100 }).success).toBe(true);
    expect(updateTransactionSchema.safeParse({ note: "updated" }).success).toBe(true);
    expect(updateTransactionSchema.safeParse({}).success).toBe(true);
  });
});

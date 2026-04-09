import { describe, it, expect } from "vitest";
import { createRecurringSchema, updateRecurringSchema } from "./recurrings";

describe("createRecurringSchema", () => {
  it("validates valid expense recurring", () => {
    const result = createRecurringSchema.safeParse({
      name: "Listrik",
      type: "EXPENSE",
      amount: 500000,
      dayOfMonth: 5,
      walletId: "w1",
      categoryId: "c1",
    });
    expect(result.success).toBe(true);
  });

  it("validates valid transfer recurring", () => {
    const result = createRecurringSchema.safeParse({
      name: "Transfer",
      type: "TRANSFER",
      amount: 1000000,
      dayOfMonth: 1,
      walletId: "w1",
      targetWalletId: "w2",
    });
    expect(result.success).toBe(true);
  });

  it("rejects expense without categoryId", () => {
    const result = createRecurringSchema.safeParse({
      name: "Listrik",
      type: "EXPENSE",
      amount: 500000,
      dayOfMonth: 5,
      walletId: "w1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects transfer without targetWalletId", () => {
    const result = createRecurringSchema.safeParse({
      name: "Transfer",
      type: "TRANSFER",
      amount: 1000000,
      dayOfMonth: 1,
      walletId: "w1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects dayOfMonth < 1", () => {
    const result = createRecurringSchema.safeParse({
      name: "Test",
      type: "EXPENSE",
      amount: 100,
      dayOfMonth: 0,
      walletId: "w1",
      categoryId: "c1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects dayOfMonth > 31", () => {
    const result = createRecurringSchema.safeParse({
      name: "Test",
      type: "EXPENSE",
      amount: 100,
      dayOfMonth: 32,
      walletId: "w1",
      categoryId: "c1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero amount", () => {
    const result = createRecurringSchema.safeParse({
      name: "Test",
      type: "EXPENSE",
      amount: 0,
      dayOfMonth: 1,
      walletId: "w1",
      categoryId: "c1",
    });
    expect(result.success).toBe(false);
  });
});

describe("updateRecurringSchema", () => {
  it("allows partial update", () => {
    expect(updateRecurringSchema.safeParse({}).success).toBe(true);
    expect(updateRecurringSchema.safeParse({ amount: 100 }).success).toBe(true);
    expect(updateRecurringSchema.safeParse({ dayOfMonth: 15 }).success).toBe(true);
  });
});

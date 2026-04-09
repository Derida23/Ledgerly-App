import { describe, it, expect } from "vitest";
import { createBudgetSchema, updateBudgetSchema } from "./budgets";

describe("createBudgetSchema", () => {
  it("validates valid input", () => {
    const result = createBudgetSchema.safeParse({
      name: "Budget Bulanan",
      limit: 1000000,
      categoryIds: ["cat-1"],
    });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createBudgetSchema.safeParse({
      name: "",
      limit: 1000000,
      categoryIds: ["cat-1"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects zero limit", () => {
    const result = createBudgetSchema.safeParse({
      name: "Budget",
      limit: 0,
      categoryIds: ["cat-1"],
    });
    expect(result.success).toBe(false);
  });

  it("rejects empty categoryIds", () => {
    const result = createBudgetSchema.safeParse({
      name: "Budget",
      limit: 1000000,
      categoryIds: [],
    });
    expect(result.success).toBe(false);
  });

  it("coerces string limit to number", () => {
    const result = createBudgetSchema.safeParse({
      name: "Budget",
      limit: "500000",
      categoryIds: ["cat-1"],
    });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.limit).toBe(500000);
  });
});

describe("updateBudgetSchema", () => {
  it("allows partial update", () => {
    expect(updateBudgetSchema.safeParse({}).success).toBe(true);
    expect(updateBudgetSchema.safeParse({ name: "New" }).success).toBe(true);
    expect(updateBudgetSchema.safeParse({ limit: 2000000 }).success).toBe(true);
  });
});

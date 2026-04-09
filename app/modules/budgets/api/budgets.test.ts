import { describe, it, expect } from "vitest";
import { getBudgets, getBudget, createBudget, updateBudget, deleteBudget } from "./budgets";
import { mockBudgets } from "../../../../tests/mocks/handlers";

describe("budgets API", () => {
  it("getBudgets returns budget list", async () => {
    const budgets = await getBudgets();
    expect(budgets).toEqual(mockBudgets);
  });

  it("getBudget returns single budget", async () => {
    const budget = await getBudget("budget-1");
    expect(budget.id).toBe("budget-1");
    expect(budget.name).toBe("Budget Bulanan");
  });

  it("createBudget sends POST", async () => {
    const budget = await createBudget({ name: "New Budget", limit: 500000, categoryIds: ["cat-1"] });
    expect(budget.id).toBe("budget-new");
    expect(budget.status).toBe("NORMAL");
  });

  it("updateBudget sends PATCH", async () => {
    const budget = await updateBudget("budget-1", { limit: 2000000 });
    expect(budget.limit).toBe(2000000);
  });

  it("deleteBudget sends DELETE", async () => {
    const result = await deleteBudget("budget-1");
    expect(result).toBeUndefined();
  });
});

import { describe, it, expect } from "vitest";
import { getCategories, getCategory, createCategory, updateCategory, deleteCategory, seedCategories } from "./categories";

describe("categories API", () => {
  it("getCategories returns all categories", async () => {
    const categories = await getCategories();
    expect(categories).toHaveLength(2);
  });

  it("getCategories filters by type", async () => {
    const expense = await getCategories("EXPENSE");
    expect(expense).toHaveLength(1);
    expect(expense[0]?.type).toBe("EXPENSE");

    const income = await getCategories("INCOME");
    expect(income).toHaveLength(1);
    expect(income[0]?.type).toBe("INCOME");
  });

  it("getCategory returns single category", async () => {
    const cat = await getCategory("cat-1");
    expect(cat.id).toBe("cat-1");
    expect(cat.name).toBe("Makan");
  });

  it("createCategory sends POST", async () => {
    const cat = await createCategory({ name: "Transport", icon: "\ud83d\ude97", type: "EXPENSE" });
    expect(cat.id).toBe("cat-new");
    expect(cat.name).toBe("Transport");
  });

  it("updateCategory sends PATCH", async () => {
    const cat = await updateCategory("cat-1", { name: "Makanan" });
    expect(cat.name).toBe("Makanan");
  });

  it("deleteCategory sends DELETE", async () => {
    const result = await deleteCategory("cat-1");
    expect(result).toBeUndefined();
  });

  it("seedCategories sends POST", async () => {
    const result = await seedCategories();
    expect(result).toBeUndefined();
  });
});

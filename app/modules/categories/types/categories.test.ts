import { describe, it, expect } from "vitest";
import { createCategorySchema, updateCategorySchema } from "./categories";

describe("createCategorySchema", () => {
  it("validates valid expense category", () => {
    const result = createCategorySchema.safeParse({ name: "Makan", icon: "\ud83c\udf5c", type: "EXPENSE" });
    expect(result.success).toBe(true);
  });

  it("validates valid income category", () => {
    const result = createCategorySchema.safeParse({ name: "Gaji", icon: "\ud83d\udcb0", type: "INCOME" });
    expect(result.success).toBe(true);
  });

  it("rejects missing name", () => {
    const result = createCategorySchema.safeParse({ name: "", icon: "\ud83c\udf5c", type: "EXPENSE" });
    expect(result.success).toBe(false);
  });

  it("rejects missing icon", () => {
    const result = createCategorySchema.safeParse({ name: "Makan", icon: "", type: "EXPENSE" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid type", () => {
    const result = createCategorySchema.safeParse({ name: "Makan", icon: "\ud83c\udf5c", type: "INVALID" });
    expect(result.success).toBe(false);
  });
});

describe("updateCategorySchema", () => {
  it("allows partial update", () => {
    expect(updateCategorySchema.safeParse({ name: "Updated" }).success).toBe(true);
    expect(updateCategorySchema.safeParse({}).success).toBe(true);
  });
});

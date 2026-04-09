import { describe, it, expect } from "vitest";
import { createWalletSchema, updateWalletSchema } from "./wallets";

describe("createWalletSchema", () => {
  it("validates valid input", () => {
    const result = createWalletSchema.safeParse({ name: "Cash", initialBalance: 100000 });
    expect(result.success).toBe(true);
  });

  it("rejects empty name", () => {
    const result = createWalletSchema.safeParse({ name: "", initialBalance: 0 });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0]?.path).toContain("name");
    }
  });

  it("rejects negative balance", () => {
    const result = createWalletSchema.safeParse({ name: "Cash", initialBalance: -1 });
    expect(result.success).toBe(false);
  });

  it("coerces string numbers", () => {
    const result = createWalletSchema.safeParse({ name: "Cash", initialBalance: "500000" });
    expect(result.success).toBe(true);
    if (result.success) expect(result.data.initialBalance).toBe(500000);
  });

  it("allows zero balance", () => {
    const result = createWalletSchema.safeParse({ name: "Cash", initialBalance: 0 });
    expect(result.success).toBe(true);
  });
});

describe("updateWalletSchema", () => {
  it("allows partial update", () => {
    expect(updateWalletSchema.safeParse({ name: "Updated" }).success).toBe(true);
    expect(updateWalletSchema.safeParse({ initialBalance: 200 }).success).toBe(true);
    expect(updateWalletSchema.safeParse({}).success).toBe(true);
  });

  it("rejects empty name when provided", () => {
    const result = updateWalletSchema.safeParse({ name: "" });
    expect(result.success).toBe(false);
  });
});

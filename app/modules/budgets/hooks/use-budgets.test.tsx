import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useBudgets, useBudget, useCreateBudget, useDeleteBudget } from "./use-budgets";
import { createWrapper } from "../../../../tests/helpers";

describe("useBudgets", () => {
  it("fetches budgets list", async () => {
    const { result } = renderHook(() => useBudgets(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.name).toBe("Budget Bulanan");
  });
});

describe("useBudget", () => {
  it("fetches single budget", async () => {
    const { result } = renderHook(() => useBudget("budget-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("budget-1");
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => useBudget(""), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateBudget", () => {
  it("creates budget", async () => {
    const { result } = renderHook(() => useCreateBudget(), { wrapper: createWrapper() });
    result.current.mutate({ name: "New", limit: 500000, categoryIds: ["cat-1"] });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteBudget", () => {
  it("deletes budget", async () => {
    const { result } = renderHook(() => useDeleteBudget(), { wrapper: createWrapper() });
    result.current.mutate("budget-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

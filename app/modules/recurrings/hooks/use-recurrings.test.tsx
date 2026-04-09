import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRecurrings, useRecurring, useDueToday, useCreateRecurring, useDeleteRecurring } from "./use-recurrings";
import { createWrapper } from "../../../../tests/helpers";

describe("useRecurrings", () => {
  it("fetches recurrings list", async () => {
    const { result } = renderHook(() => useRecurrings(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.name).toBe("Listrik");
  });
});

describe("useRecurring", () => {
  it("fetches single recurring", async () => {
    const { result } = renderHook(() => useRecurring("rec-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("rec-1");
  });
});

describe("useDueToday", () => {
  it("fetches due-today recurrings", async () => {
    const { result } = renderHook(() => useDueToday(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
  });
});

describe("useCreateRecurring", () => {
  it("creates recurring", async () => {
    const { result } = renderHook(() => useCreateRecurring(), { wrapper: createWrapper() });
    result.current.mutate({
      name: "Internet",
      type: "EXPENSE",
      amount: 300000,
      dayOfMonth: 10,
      walletId: "w1",
      categoryId: "c1",
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteRecurring", () => {
  it("deletes recurring", async () => {
    const { result } = renderHook(() => useDeleteRecurring(), { wrapper: createWrapper() });
    result.current.mutate("rec-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

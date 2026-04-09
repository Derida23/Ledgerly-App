import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useCategories, useCategory, useCreateCategory, useDeleteCategory } from "./use-categories";
import { createWrapper } from "../../../../tests/helpers";

describe("useCategories", () => {
  it("fetches all categories", async () => {
    const { result } = renderHook(() => useCategories(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
  });

  it("fetches categories filtered by type", async () => {
    const { result } = renderHook(() => useCategories("EXPENSE"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(1);
    expect(result.current.data?.[0]?.type).toBe("EXPENSE");
  });
});

describe("useCategory", () => {
  it("fetches single category", async () => {
    const { result } = renderHook(() => useCategory("cat-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Makan");
  });
});

describe("useCreateCategory", () => {
  it("creates category via mutation", async () => {
    const { result } = renderHook(() => useCreateCategory(), { wrapper: createWrapper() });
    result.current.mutate({ name: "Transport", icon: "\ud83d\ude97", type: "EXPENSE" });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteCategory", () => {
  it("deletes category via mutation", async () => {
    const { result } = renderHook(() => useDeleteCategory(), { wrapper: createWrapper() });
    result.current.mutate("cat-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

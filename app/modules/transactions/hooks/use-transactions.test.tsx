import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useTransactions, useTransaction, useCreateTransaction, useCreateTransfer, useDeleteTransaction } from "./use-transactions";
import { createWrapper } from "../../../../tests/helpers";

describe("useTransactions", () => {
  it("fetches paginated transactions", async () => {
    const { result } = renderHook(
      () => useTransactions({ page: 1, limit: 20 }),
      { wrapper: createWrapper() },
    );
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.data).toHaveLength(2);
    expect(result.current.data?.totalPages).toBe(1);
  });
});

describe("useTransaction", () => {
  it("fetches single transaction", async () => {
    const { result } = renderHook(() => useTransaction("txn-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("txn-1");
    expect(result.current.data?.amount).toBe(50000);
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => useTransaction(""), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateTransaction", () => {
  it("creates transaction", async () => {
    const { result } = renderHook(() => useCreateTransaction(), { wrapper: createWrapper() });
    result.current.mutate({
      amount: 50000,
      type: "EXPENSE",
      walletId: "w1",
      categoryId: "c1",
      method: "QRIS",
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useCreateTransfer", () => {
  it("creates transfer", async () => {
    const { result } = renderHook(() => useCreateTransfer(), { wrapper: createWrapper() });
    result.current.mutate({
      amount: 1000000,
      sourceWalletId: "w1",
      targetWalletId: "w2",
      adminFee: 0,
    });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe("useDeleteTransaction", () => {
  it("deletes transaction", async () => {
    const { result } = renderHook(() => useDeleteTransaction(), { wrapper: createWrapper() });
    result.current.mutate("txn-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

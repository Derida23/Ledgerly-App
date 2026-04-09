import { describe, it, expect } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useWallets, useWallet, useCreateWallet, useDeleteWallet } from "./use-wallets";
import { createWrapper } from "../../../../tests/helpers";

describe("useWallets", () => {
  it("fetches wallets list", async () => {
    const { result } = renderHook(() => useWallets(), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toHaveLength(2);
    expect(result.current.data?.[0]?.name).toBe("Cash");
  });
});

describe("useWallet", () => {
  it("fetches single wallet by id", async () => {
    const { result } = renderHook(() => useWallet("wallet-1"), { wrapper: createWrapper() });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.id).toBe("wallet-1");
    expect(result.current.data?.name).toBe("Cash");
  });

  it("does not fetch when id is empty", () => {
    const { result } = renderHook(() => useWallet(""), { wrapper: createWrapper() });
    expect(result.current.fetchStatus).toBe("idle");
  });
});

describe("useCreateWallet", () => {
  it("creates wallet via mutation", async () => {
    const { result } = renderHook(() => useCreateWallet(), { wrapper: createWrapper() });

    result.current.mutate({ name: "Test Wallet", initialBalance: 100000 });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.name).toBe("Test Wallet");
  });
});

describe("useDeleteWallet", () => {
  it("deletes wallet via mutation", async () => {
    const { result } = renderHook(() => useDeleteWallet(), { wrapper: createWrapper() });

    result.current.mutate("wallet-1");
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

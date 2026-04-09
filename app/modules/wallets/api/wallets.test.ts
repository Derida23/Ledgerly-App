import { describe, it, expect } from "vitest";
import { getWallets, getWallet, createWallet, updateWallet, deleteWallet, seedWallets } from "./wallets";
import { mockWallets } from "../../../../tests/mocks/handlers";

describe("wallets API", () => {
  it("getWallets returns wallet list", async () => {
    const wallets = await getWallets();
    expect(wallets).toEqual(mockWallets);
    expect(wallets).toHaveLength(2);
  });

  it("getWallet returns single wallet", async () => {
    const wallet = await getWallet("wallet-1");
    expect(wallet.id).toBe("wallet-1");
    expect(wallet.name).toBe("Cash");
  });

  it("createWallet sends POST and returns new wallet", async () => {
    const wallet = await createWallet({ name: "Dana", initialBalance: 200000 });
    expect(wallet.id).toBe("wallet-new");
    expect(wallet.name).toBe("Dana");
  });

  it("updateWallet sends PATCH", async () => {
    const wallet = await updateWallet("wallet-1", { name: "Cash Updated" });
    expect(wallet.name).toBe("Cash Updated");
  });

  it("deleteWallet sends DELETE", async () => {
    const result = await deleteWallet("wallet-1");
    expect(result).toBeUndefined();
  });

  it("seedWallets sends POST to seed endpoint", async () => {
    const result = await seedWallets();
    expect(result).toBeUndefined();
  });
});

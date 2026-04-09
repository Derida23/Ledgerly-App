import { describe, it, expect } from "vitest";
import { getTransactions, getTransaction, createTransaction, createTransfer, updateTransaction, deleteTransaction } from "./transactions";

describe("transactions API", () => {
  it("getTransactions returns paginated result", async () => {
    const result = await getTransactions({ page: 1, limit: 20 });
    expect(result.data).toHaveLength(2);
    expect(result.total).toBe(2);
    expect(result.page).toBe(1);
    expect(result.totalPages).toBe(1);
  });

  it("getTransactions sends filter params", async () => {
    const result = await getTransactions({ type: "EXPENSE", walletId: "w1" });
    expect(result.data).toBeDefined();
  });

  it("getTransaction returns single transaction", async () => {
    const txn = await getTransaction("txn-1");
    expect(txn.id).toBe("txn-1");
    expect(txn.amount).toBe(50000);
  });

  it("createTransaction sends POST", async () => {
    const txn = await createTransaction({
      amount: 100000,
      type: "EXPENSE",
      walletId: "w1",
      categoryId: "c1",
      method: "CASH",
    });
    expect(txn.id).toBe("txn-new");
  });

  it("createTransfer returns array of transactions", async () => {
    const txns = await createTransfer({
      amount: 1000000,
      sourceWalletId: "w1",
      targetWalletId: "w2",
      adminFee: 0,
    });
    expect(txns).toHaveLength(2);
    expect(txns[0]?.type).toBe("TRANSFER_OUT");
    expect(txns[1]?.type).toBe("TRANSFER_IN");
  });

  it("updateTransaction sends PATCH", async () => {
    const txn = await updateTransaction("txn-1", { amount: 75000 });
    expect(txn.amount).toBe(75000);
  });

  it("deleteTransaction sends DELETE", async () => {
    const result = await deleteTransaction("txn-1");
    expect(result).toBeUndefined();
  });
});

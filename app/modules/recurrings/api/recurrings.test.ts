import { describe, it, expect } from "vitest";
import { getRecurrings, getRecurring, getDueToday, createRecurring, updateRecurring, deleteRecurring } from "./recurrings";
import { mockRecurrings } from "../../../../tests/mocks/handlers";

describe("recurrings API", () => {
  it("getRecurrings returns recurring list", async () => {
    const recurrings = await getRecurrings();
    expect(recurrings).toEqual(mockRecurrings);
  });

  it("getRecurring returns single recurring", async () => {
    const rec = await getRecurring("rec-1");
    expect(rec.id).toBe("rec-1");
    expect(rec.name).toBe("Listrik");
  });

  it("getDueToday returns due recurrings", async () => {
    const due = await getDueToday();
    expect(due).toHaveLength(1);
  });

  it("createRecurring sends POST", async () => {
    const rec = await createRecurring({
      name: "Internet",
      type: "EXPENSE",
      amount: 300000,
      dayOfMonth: 10,
      walletId: "w1",
      categoryId: "c1",
    });
    expect(rec.id).toBe("rec-new");
  });

  it("updateRecurring sends PATCH", async () => {
    const rec = await updateRecurring("rec-1", { amount: 600000 });
    expect(rec.amount).toBe(600000);
  });

  it("deleteRecurring sends DELETE", async () => {
    const result = await deleteRecurring("rec-1");
    expect(result).toBeUndefined();
  });
});

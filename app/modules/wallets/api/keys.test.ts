import { describe, it, expect } from "vitest";
import { walletKeys } from "./keys";

describe("walletKeys", () => {
  it("all returns base key", () => {
    expect(walletKeys.all).toEqual(["wallets"]);
  });

  it("lists extends all", () => {
    expect(walletKeys.lists()).toEqual(["wallets", "list"]);
  });

  it("list equals lists", () => {
    expect(walletKeys.list()).toEqual(["wallets", "list"]);
  });

  it("detail includes id", () => {
    expect(walletKeys.detail("w1")).toEqual(["wallets", "detail", "w1"]);
  });
});

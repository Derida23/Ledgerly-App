import { describe, it, expect, vi, afterEach } from "vitest";
import { cn, formatRupiah, formatDate, formatDateShort, todayISO } from "./utils";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("px-2", "py-1")).toBe("px-2 py-1");
  });

  it("resolves tailwind conflicts", () => {
    expect(cn("px-2", "px-4")).toBe("px-4");
  });

  it("handles conditional classes", () => {
    expect(cn("base", false && "hidden", "extra")).toBe("base extra");
  });

  it("handles undefined/null", () => {
    expect(cn("base", undefined, null)).toBe("base");
  });
});

describe("formatRupiah", () => {
  it("formats zero", () => {
    expect(formatRupiah(0)).toMatch(/Rp\s*0/);
  });

  it("formats positive number with thousand separator", () => {
    const result = formatRupiah(1000000);
    expect(result).toMatch(/Rp/);
    expect(result).toMatch(/1[.\u00a0]000[.\u00a0]000/);
  });

  it("formats negative number", () => {
    const result = formatRupiah(-500000);
    expect(result).toMatch(/500[.\u00a0]000/);
  });

  it("has no decimal places", () => {
    const result = formatRupiah(1500);
    expect(result).not.toMatch(/[,.]00/);
  });
});

describe("formatDate", () => {
  it("formats string date with Indonesian locale", () => {
    const result = formatDate("2026-04-08");
    expect(result).toMatch(/2026/);
    expect(result).toMatch(/April/i);
  });

  it("formats Date object", () => {
    const result = formatDate(new Date("2026-04-08"));
    expect(result).toMatch(/2026/);
  });

  it("respects custom options", () => {
    const result = formatDate("2026-04-08", { weekday: undefined, month: "short" });
    expect(result).toMatch(/Apr/i);
  });
});

describe("formatDateShort", () => {
  it("formats date in short format", () => {
    const result = formatDateShort("2026-04-08");
    expect(result).toMatch(/8/);
    expect(result).toMatch(/Apr/i);
    expect(result).toMatch(/2026/);
  });

  it("accepts Date object", () => {
    const result = formatDateShort(new Date("2026-12-25"));
    expect(result).toMatch(/25/);
    expect(result).toMatch(/Des/i);
  });
});

describe("todayISO", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns YYYY-MM-DD format", () => {
    const result = todayISO();
    expect(result).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it("returns correct date", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-08T12:00:00Z"));
    const result = todayISO();
    expect(result).toBe("2026-04-08");
  });
});

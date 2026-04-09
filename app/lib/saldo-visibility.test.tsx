import { describe, it, expect, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { SaldoVisibilityProvider, useSaldoVisibility } from "./saldo-visibility";

function wrapper({ children }: { children: React.ReactNode }) {
  return <SaldoVisibilityProvider>{children}</SaldoVisibilityProvider>;
}

describe("useSaldoVisibility", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("defaults to visible", () => {
    const { result } = renderHook(() => useSaldoVisibility(), { wrapper });
    expect(result.current.isVisible).toBe(true);
  });

  it("toggles visibility", () => {
    const { result } = renderHook(() => useSaldoVisibility(), { wrapper });
    act(() => result.current.toggle());
    expect(result.current.isVisible).toBe(false);
    act(() => result.current.toggle());
    expect(result.current.isVisible).toBe(true);
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useSaldoVisibility(), { wrapper });
    act(() => result.current.toggle());
    expect(localStorage.getItem("saldo-visible")).toBe("false");
  });

  it("reads from localStorage on init", () => {
    localStorage.setItem("saldo-visible", "false");
    const { result } = renderHook(() => useSaldoVisibility(), { wrapper });
    expect(result.current.isVisible).toBe(false);
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useSaldoVisibility());
    }).toThrow("useSaldoVisibility must be used inside SaldoVisibilityProvider");
  });
});

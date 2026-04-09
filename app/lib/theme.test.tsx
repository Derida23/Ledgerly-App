import { describe, it, expect, beforeEach, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { ThemeProvider, useTheme, Theme } from "./theme";

// Mock matchMedia for jsdom
beforeEach(() => {
  localStorage.clear();
  document.documentElement.classList.remove("dark");

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
});

function wrapper({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>;
}

describe("useTheme", () => {
  it("defaults to system theme", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe(Theme.SYSTEM);
  });

  it("can set theme to dark", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme(Theme.DARK));
    expect(result.current.theme).toBe(Theme.DARK);
    expect(document.documentElement.classList.contains("dark")).toBe(true);
  });

  it("can set theme to light", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme(Theme.LIGHT));
    expect(result.current.theme).toBe(Theme.LIGHT);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists to localStorage", () => {
    const { result } = renderHook(() => useTheme(), { wrapper });
    act(() => result.current.setTheme(Theme.DARK));
    expect(localStorage.getItem("theme")).toBe("dark");
  });

  it("reads from localStorage on init", () => {
    localStorage.setItem("theme", "dark");
    const { result } = renderHook(() => useTheme(), { wrapper });
    expect(result.current.theme).toBe(Theme.DARK);
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useTheme());
    }).toThrow("useTheme must be used inside ThemeProvider");
  });
});

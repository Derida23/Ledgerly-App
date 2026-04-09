import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { AuthContext, useCurrentUser, useIsAdmin } from "./use-auth";
import { mockAdminUser, mockViewerUser } from "../../../../tests/helpers";

function wrapper(user: typeof mockAdminUser) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
    );
  };
}

describe("useCurrentUser", () => {
  it("returns current user from context", () => {
    const { result } = renderHook(() => useCurrentUser(), {
      wrapper: wrapper(mockAdminUser),
    });
    expect(result.current).toEqual(mockAdminUser);
  });

  it("throws when used outside provider", () => {
    expect(() => {
      renderHook(() => useCurrentUser());
    }).toThrow("useCurrentUser must be used inside AuthContext.Provider");
  });
});

describe("useIsAdmin", () => {
  it("returns true for admin user", () => {
    const { result } = renderHook(() => useIsAdmin(), {
      wrapper: wrapper(mockAdminUser),
    });
    expect(result.current).toBe(true);
  });

  it("returns false for viewer user", () => {
    const { result } = renderHook(() => useIsAdmin(), {
      wrapper: wrapper(mockViewerUser),
    });
    expect(result.current).toBe(false);
  });
});

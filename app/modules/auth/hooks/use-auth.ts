import { createContext, useContext } from "react";
import { Role } from "~/modules/auth/types";
import type { User } from "~/modules/auth/types";

interface AuthContextValue {
  user: User;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useCurrentUser(): User {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useCurrentUser must be used inside AuthContext.Provider");
  }
  return ctx.user;
}

export function useIsAdmin(): boolean {
  const user = useCurrentUser();
  return user.role === Role.ADMIN;
}

import { useSession } from "~/modules/auth/api";
import { Role } from "~/modules/auth/types";
import type { User } from "~/modules/auth/types";

export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  const user = session?.user as User | undefined;
  return user?.role === Role.ADMIN;
}

export function useCurrentUser() {
  const { data: session, isPending, error } = useSession();
  const user = session?.user as User | undefined;
  return {
    user: user ?? null,
    isPending,
    isAuthenticated: !!user,
    error,
  };
}

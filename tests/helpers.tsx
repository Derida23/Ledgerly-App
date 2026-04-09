import type { ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, type RenderOptions } from "@testing-library/react";
import { AuthContext } from "~/modules/auth/hooks/use-auth";
import type { User } from "~/modules/auth/types";

export const mockAdminUser: User = {
  id: "test-user-id",
  name: "Test User",
  email: "test@example.com",
  role: "ADMIN",
  image: null,
  emailVerified: true,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

export const mockViewerUser: User = {
  ...mockAdminUser,
  id: "viewer-user-id",
  name: "Viewer User",
  role: "VIEWER",
};

export function createTestQueryClient() {
  return new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
      mutations: { retry: false },
    },
  });
}

interface WrapperOptions {
  user?: User;
  queryClient?: QueryClient;
}

export function createWrapper({ user = mockAdminUser, queryClient }: WrapperOptions = {}) {
  const qc = queryClient ?? createTestQueryClient();
  return function Wrapper({ children }: { children: ReactNode }) {
    return (
      <QueryClientProvider client={qc}>
        <AuthContext.Provider value={{ user }}>{children}</AuthContext.Provider>
      </QueryClientProvider>
    );
  };
}

export function renderWithProviders(
  ui: ReactNode,
  options?: WrapperOptions & Omit<RenderOptions, "wrapper">,
) {
  const { user, queryClient, ...renderOptions } = options ?? {};
  const wrapper = createWrapper({ user, queryClient });
  return render(<>{ui}</>, { wrapper, ...renderOptions });
}

import { Outlet, redirect, isRouteErrorResponse, useNavigation } from "react-router";
import { authClient } from "~/modules/auth/api";
import { AuthContext } from "~/modules/auth/hooks";
import type { User } from "~/modules/auth/types";
import { apiClient } from "~/lib/api-client";
import { Sidebar } from "~/components/layout/sidebar";
import { BottomNav } from "~/components/layout/bottom-nav";
import { SessionExpiredModal } from "~/components/shared/session-expired-modal";
import { ModuleErrorBoundary } from "~/components/shared/error-boundary";
import { SaldoVisibilityProvider } from "~/lib/saldo-visibility";
import { ThemeProvider } from "~/lib/theme";

import type { Route } from "./+types/_auth";

export async function clientLoader({}: Route.ClientLoaderArgs) {
  try {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect("/");
    }
    const profile = await apiClient<{ user: User }>("/api/me");
    return { user: profile.user };
  } catch (error) {
    if (error instanceof Response) throw error;
    throw redirect("/");
  }
}

export default function AuthLayout({ loaderData }: Route.ComponentProps) {
  const navigation = useNavigation();
  const isNavigating = navigation.state === "loading";

  return (
    <AuthContext.Provider value={{ user: loaderData.user }}>
      <ThemeProvider>
        <SaldoVisibilityProvider>
          <div className="min-h-screen bg-muted/40">
            <Sidebar />

            <div className="md:pl-22 lg:pl-66">
              <div className="min-h-screen bg-card md:my-3 md:mr-3 md:min-h-[calc(100vh-1.5rem)] md:rounded-2xl md:border md:border-border/60 md:shadow-sm">
                <ModuleErrorBoundary level="page">
                  <div className={isNavigating ? "opacity-50 transition-opacity duration-150 will-change-[opacity]" : "opacity-100 transition-opacity duration-200 will-change-[opacity]"}>
                    <Outlet />
                  </div>
                </ModuleErrorBoundary>
              </div>
            </div>

            <BottomNav />
            <SessionExpiredModal />
          </div>
        </SaldoVisibilityProvider>
      </ThemeProvider>
    </AuthContext.Provider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Terjadi Kesalahan";
  let details = "Terjadi kesalahan yang tidak terduga.";

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "Halaman tidak ditemukan."
        : error.statusText || details;
  } else if (error instanceof Error) {
    details = error.message;
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold text-foreground">{message}</h1>
      <p className="mt-2 text-muted-foreground">{details}</p>
      <a
        href="/dashboard"
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
      >
        Kembali ke Dashboard
      </a>
    </div>
  );
}

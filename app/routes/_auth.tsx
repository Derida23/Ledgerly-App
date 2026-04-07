import { useEffect } from "react";
import { Outlet, redirect, isRouteErrorResponse, useNavigate } from "react-router";
import { authClient, useSession } from "~/modules/auth/api";
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
    return { session: session.data };
  } catch (error) {
    if (error instanceof Response) throw error;
    throw redirect("/");
  }
}

export default function AuthLayout() {
  const { data: session, isPending } = useSession();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isPending && !session) {
      navigate("/");
    }
  }, [session, isPending, navigate]);

  return (
    <ThemeProvider>
      <SaldoVisibilityProvider>
        <div className="min-h-screen bg-background">
          <Sidebar />

          <div className="md:pl-16 lg:pl-60">
            <ModuleErrorBoundary level="page">
              <Outlet />
            </ModuleErrorBoundary>
          </div>

          <BottomNav />
          <SessionExpiredModal />
        </div>
      </SaldoVisibilityProvider>
    </ThemeProvider>
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

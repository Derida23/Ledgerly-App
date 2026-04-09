import { useEffect } from "react";
import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "react-router";
import { QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { Toaster } from "sonner";

import type { Route } from "./+types/root";
import { queryClient } from "~/lib/query-client";
import { registerServiceWorker } from "~/lib/pwa";
import { OfflineBanner } from "~/components/shared/offline-banner";
import { InstallPrompt } from "~/components/shared/install-prompt";
import { UpdateBanner } from "~/components/shared/update-banner";
import "./app.css";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  { rel: "manifest", href: "/manifest.json" },
  { rel: "icon", href: "/icons/icon.svg", type: "image/svg+xml" },
  { rel: "apple-touch-icon", href: "/icons/icon.svg" },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="id">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Ledgerly — Personal Expense Tracker</title>
        <meta name="description" content="Kelola keuangan pribadimu dengan mudah. Catat pemasukan, pengeluaran, budget, dan laporan keuangan." />
        <meta name="theme-color" content="#4a7c59" />
        <meta name="mobile-web-app-capable" content="yes" />
        <Meta />
        <Links />
        {/* Non-render-blocking font: media swap trick */}
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap"
          media="print"
          data-font-swap=""
        />
        <script dangerouslySetInnerHTML={{ __html: `document.querySelectorAll('[data-font-swap]').forEach(function(l){l.media='all'})` }} />
      </head>
      <body className="font-sans antialiased bg-background text-foreground">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export function HydrateFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-3">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-muted border-t-primary" />
        <p className="text-sm text-muted-foreground">Memuat...</p>
      </div>
    </div>
  );
}

export default function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <OfflineBanner />
      <UpdateBanner />
      <Outlet />
      <InstallPrompt />
      <Toaster
        position="top-center"
        toastOptions={{
          className: "!bg-card !text-foreground !border-border !shadow-lg",
        }}
        richColors
        closeButton
        duration={3000}
        offset={16}
      />
      {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Terjadi Kesalahan";
  let details = "Terjadi kesalahan yang tidak terduga.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "Halaman yang diminta tidak ditemukan."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4">
      <h1 className="text-4xl font-bold">{message}</h1>
      <p className="mt-2 text-muted-foreground">{details}</p>
      <button
        onClick={() => window.location.reload()}
        className="mt-4 rounded-lg bg-primary px-4 py-2 text-primary-foreground"
      >
        Muat Ulang
      </button>
      {stack && (
        <pre className="mt-4 w-full max-w-2xl overflow-x-auto rounded-lg bg-muted p-4 text-sm">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}

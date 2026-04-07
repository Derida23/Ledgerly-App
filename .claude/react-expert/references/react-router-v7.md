# React Router v7 — SPA Mode Patterns

## Setup — SPA Mode (No SSR)

```ts
// react-router.config.ts
import type { Config } from "@react-router/dev/config";

export default {
  ssr: false, // SPA mode — client-side only
  appDirectory: "src",
} satisfies Config;
```

```ts
// vite.config.ts
import { reactRouter } from "@react-router/dev/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [reactRouter(), tsconfigPaths()],
});
```

---

## File-Based Routing

### Convention

| File                          | Route                  | Notes                          |
| ----------------------------- | ---------------------- | ------------------------------ |
| `routes/_auth.tsx`            | Layout (no URL)        | Wraps all `_auth.*` children   |
| `routes/_auth.dashboard.tsx`  | `/dashboard`           | Nested under `_auth` layout    |
| `routes/_auth.wallets.tsx`    | `/wallets`             | Nested under `_auth` layout    |
| `routes/_auth.wallets.$id.tsx`| `/wallets/:id`         | Dynamic param                  |
| `routes/login.tsx`            | `/login`               | Outside `_auth` layout         |

### Naming Rules

- **Dot notation** (`_auth.dashboard.tsx`) = nested route (layout nesting)
- **`$param`** = dynamic segment (`$id` becomes `params.id`)
- **`_prefix`** = pathless layout (no URL segment added)
- **`_index.tsx`** = index route for a layout

### Route Module API

```tsx
// routes/_auth.dashboard.tsx
import type { Route } from "./+types/_auth.dashboard";

// Client loader — runs in browser (SPA mode only has client loaders)
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const data = await fetchDashboard();
  return { data };
}

// Component — receives loader data via useLoaderData
export default function Dashboard({ loaderData }: Route.ComponentProps) {
  const { data } = loaderData;
  return <DashboardView data={data} />;
}

// Error boundary — catches errors in this route
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  return <RouteError error={error} />;
}

// Meta — set page title and meta tags
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Dashboard — Ledgerly" },
    { name: "description", content: "Financial dashboard" },
  ];
}
```

---

## Layouts

### Pathless Layout (Auth Wrapper)

```tsx
// routes/_auth.tsx
import { Outlet, redirect } from "react-router";
import type { Route } from "./+types/_auth";

export async function clientLoader({}: Route.ClientLoaderArgs) {
  const session = await getSession();
  if (!session) throw redirect("/login");
  return { session };
}

export default function AuthLayout({ loaderData }: Route.ComponentProps) {
  const { session } = loaderData;

  return (
    <SessionProvider session={session}>
      <Header />
      <main>
        <Outlet />
      </main>
      <BottomNav />
    </SessionProvider>
  );
}
```

### Nested Layout with Outlet

```tsx
// routes/_auth.wallets.tsx — parent layout for /wallets/*
import { Outlet } from "react-router";

export default function WalletsLayout() {
  return (
    <section>
      <PageHeader title="Wallet" />
      <Outlet /> {/* Renders child route */}
    </section>
  );
}
```

---

## Navigation

### Link & NavLink

```tsx
import { Link, NavLink } from "react-router";

// Basic link
<Link to="/transactions">Transaksi</Link>

// NavLink — auto active class
<NavLink
  to="/dashboard"
  className={({ isActive }) =>
    isActive ? "text-primary font-bold" : "text-muted"
  }
>
  Dashboard
</NavLink>

// Link with search params
<Link to="/transactions?type=EXPENSE&page=1">Pengeluaran</Link>

// Dynamic params
<Link to={`/wallets/${wallet.id}`}>Detail</Link>
```

### Programmatic Navigation

```tsx
import { useNavigate } from "react-router";

function TransactionForm() {
  const navigate = useNavigate();

  async function onSubmit(data: CreateTransactionInput) {
    await createTransaction(data);
    navigate("/transactions"); // redirect after success
  }

  // Go back
  function handleCancel() {
    navigate(-1);
  }
}
```

---

## Params & Search Params

### Route Params

```tsx
import { useParams } from "react-router";

function WalletDetail() {
  const { id } = useParams<"id">();
  // id is string | undefined
}
```

### Search Params

```tsx
import { useSearchParams } from "react-router";

function TransactionList() {
  const [searchParams, setSearchParams] = useSearchParams();

  const page = Number(searchParams.get("page")) || 1;
  const type = searchParams.get("type") ?? undefined;

  // Update search params (preserves other params)
  function setPage(newPage: number) {
    setSearchParams((prev) => {
      prev.set("page", String(newPage));
      return prev;
    });
  }

  // Set multiple params
  function applyFilter(type: string) {
    setSearchParams((prev) => {
      prev.set("type", type);
      prev.set("page", "1"); // reset to page 1
      return prev;
    });
  }
}
```

---

## Lazy Loading (Code Splitting)

### Per-Route Lazy Loading

```tsx
// routes.ts (if using config-based)
import { route, index, layout } from "@react-router/dev/routes";

export default [
  index("routes/login.tsx"),
  layout("routes/_auth.tsx", [
    route("dashboard", "routes/_auth.dashboard.tsx"),
    route("transactions", "routes/_auth.transactions.tsx"),
  ]),
];
```

In file-based routing, React Router v7 **automatically code-splits** each route file. No manual `lazy()` needed — each route is its own chunk.

### Manual Lazy for Heavy Components

```tsx
import { lazy, Suspense } from "react";

// Lazy load chart library only when needed
const LineChart = lazy(() => import("@/modules/reports/components/line-chart"));

function Dashboard() {
  return (
    <Suspense fallback={<Skeleton className="h-64" />}>
      <LineChart data={trendData} />
    </Suspense>
  );
}
```

---

## Error Handling

### Route-Level Error Boundary

```tsx
// Each route can export ErrorBoundary
export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  if (isRouteErrorResponse(error)) {
    // HTTP error (4xx, 5xx thrown from loader)
    return (
      <div>
        <h1>{error.status}</h1>
        <p>{error.statusText}</p>
      </div>
    );
  }

  // Unexpected JS error
  return (
    <div>
      <h1>Terjadi Kesalahan</h1>
      <p>{error instanceof Error ? error.message : "Unknown error"}</p>
      <button onClick={() => window.location.reload()}>Muat Ulang</button>
    </div>
  );
}
```

### Throwing Responses in Loaders

```tsx
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  const wallet = await getWallet(params.id!);

  if (!wallet) {
    throw new Response("Wallet tidak ditemukan", { status: 404 });
  }

  return { wallet };
}
```

---

## Redirects

```tsx
import { redirect } from "react-router";

// In loader
export async function clientLoader() {
  const session = await getSession();
  if (!session) throw redirect("/login");
  return { session };
}

// Redirect with search params
throw redirect("/transactions?type=EXPENSE");

// Redirect after mutation
export async function clientAction({ request }: Route.ClientActionArgs) {
  const formData = await request.formData();
  await createTransaction(Object.fromEntries(formData));
  throw redirect("/transactions");
}
```

---

## Pending UI & Navigation State

```tsx
import { useNavigation } from "react-router";

function GlobalLoadingBar() {
  const navigation = useNavigation();
  const isNavigating = navigation.state !== "idle";

  if (!isNavigating) return null;

  return <div className="fixed top-0 left-0 right-0 h-1 bg-primary animate-pulse" />;
}
```

---

## Type-Safe Routes

React Router v7 generates route types automatically in `./+types/` directory.

```tsx
// Auto-generated types for each route
import type { Route } from "./+types/_auth.wallets.$id";

// params.id is typed as string
export async function clientLoader({ params }: Route.ClientLoaderArgs) {
  return { wallet: await getWallet(params.id) };
}

// loaderData is typed based on clientLoader return
export default function WalletDetail({ loaderData }: Route.ComponentProps) {
  const { wallet } = loaderData; // fully typed
}
```

---

## SPA Deployment (Vercel)

```json
// vercel.json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

All routes are client-side — the server always serves `index.html`, React Router handles routing in the browser.

---

## Quick Reference

| API                   | Purpose                                      |
| --------------------- | -------------------------------------------- |
| `<Link>`              | Declarative navigation                       |
| `<NavLink>`           | Navigation with active state                 |
| `useNavigate()`       | Programmatic navigation                      |
| `useParams()`         | Read route params (`:id`)                    |
| `useSearchParams()`   | Read/write query string                      |
| `useNavigation()`     | Navigation state (idle/loading/submitting)   |
| `useLoaderData()`     | Access loader data (or use ComponentProps)   |
| `<Outlet />`          | Render child route in layout                 |
| `redirect()`          | Redirect from loader/action                  |
| `isRouteErrorResponse()` | Check if error is HTTP response           |
| `clientLoader`        | Data loading (SPA mode)                      |
| `clientAction`        | Form mutations (SPA mode)                    |
| `ErrorBoundary`       | Per-route error UI                           |
| `meta`                | Page title and meta tags                     |

| Convention            | Meaning                                      |
| --------------------- | -------------------------------------------- |
| `_prefix`             | Pathless layout route                        |
| `$param`              | Dynamic segment                              |
| `.` (dot)             | Nested route separator                       |
| `_index`              | Index route for parent layout                |

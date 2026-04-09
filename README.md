# Ledgerly

Personal expense tracker PWA built with React Router v7.

## Stack

| Layer | Tech |
|-------|------|
| Framework | React Router v7 (SPA mode) |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4 + shadcn/ui |
| Data Fetching | TanStack Query v5 |
| Forms | React Hook Form + Zod |
| Charts | Recharts (lazy loaded) |
| Auth | Better Auth (Google OAuth) |
| Testing | Vitest + RTL + MSW + Playwright |
| Deploy | Vercel |

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 9+

### Install

```bash
pnpm install
```

### Environment

```bash
cp .env.development .env.local
```

| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API base URL |

### Development

```bash
pnpm dev
```

App runs at `http://localhost:5173`. API requests are proxied to the backend via Vite.

### Testing

```bash
pnpm test            # Run all unit/integration tests
pnpm test:watch      # Watch mode
pnpm test:coverage   # With coverage report
pnpm test:e2e        # Playwright E2E tests
```

### Build

```bash
pnpm build
```

Output: `build/client/` (static SPA)

### Preview production build

```bash
pnpm build && pnpm start
```

Runs at `http://localhost:3001`.

## Deploy to Vercel

1. Push repo to GitHub
2. Import in Vercel dashboard
3. Set environment variable: `VITE_API_URL` = `https://ledgerly-service.vercel.app`
4. Deploy (config auto-detected from `vercel.json`)

| Setting | Value |
|---------|-------|
| Build Command | `pnpm run build` |
| Output Directory | `build/client` |
| Framework | Other |

## Project Structure

```
app/
  routes/          # React Router file-based routes
  modules/         # Feature modules (auth, wallets, categories, transactions, budgets, recurrings, reports)
    <module>/
      api/         # API functions + query keys
      types/       # TypeScript types + Zod schemas
      hooks/       # React Query hooks
      components/  # Module-specific components
  components/
    ui/            # shadcn/ui primitives
    layout/        # Sidebar, bottom nav, header
    shared/        # Cross-module components
  lib/             # Utilities (api-client, formatters, hooks)
tests/
  mocks/           # MSW handlers + server
  e2e/             # Playwright tests
  helpers.tsx      # Test utilities
```

## Features

- Google OAuth login with role-based access (ADMIN / VIEWER)
- Wallet management with balance tracking
- Income/expense transactions with payment methods
- Transfer between wallets
- Budget tracking with category breakdown
- Recurring transaction reminders
- Reports: weekly, monthly, yearly with charts
- Dark/light mode with system preference
- Balance visibility toggle
- PWA: installable, offline capable
- Responsive: mobile bottom nav, tablet/desktop sidebar

## API

Backend: [ledgerly-service.vercel.app](https://ledgerly-service.vercel.app)

API docs: [ledgerly-service.vercel.app/docs](https://ledgerly-service.vercel.app/docs)

## License

Private

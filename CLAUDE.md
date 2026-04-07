# Ledgerly Frontend — Project Context

## Stack

| Layer              | Tech                                  |
| ------------------ | ------------------------------------- |
| Framework          | React Router v7 (SPA mode)            |
| Language           | TypeScript                            |
| Styling            | Tailwind CSS v4 + shadcn/ui           |
| Data Fetching      | TanStack Query v5                     |
| Forms              | React Hook Form + Zod                 |
| Charts             | Recharts (lazy loaded)                |
| HTTP Client        | Fetch API (native, credentials: include) |
| Auth Client        | better-auth/react                     |
| Date               | date-fns                              |
| Number Format      | Intl.NumberFormat (id-ID, IDR)        |
| Icons (UI)         | Lucide React                          |
| Icons (Kategori)   | Emoji (dari database)                 |
| Font               | Plus Jakarta Sans                     |
| Testing            | Vitest + React Testing Library + MSW + Playwright |
| Deploy             | Vercel (free)                         |

---

## Code Conventions & Constraints

### TypeScript

- `strict: true` wajib di tsconfig
- Module: `ESNext` + `moduleResolution: bundler` (Vite) — **BUKAN** NodeNext
- **Dilarang pakai `enum`** — gunakan `as const` objects:
  ```ts
  export const TransactionType = {
    INCOME: "INCOME",
    EXPENSE: "EXPENSE",
    TRANSFER_IN: "TRANSFER_IN",
    TRANSFER_OUT: "TRANSFER_OUT",
  } as const;
  export type TransactionType = (typeof TransactionType)[keyof typeof TransactionType];
  ```
- Dilarang pakai explicit `any` tanpa justifikasi
- Gunakan `satisfies` operator untuk type validation
- Gunakan discriminated unions untuk state (loading/success/error)
- Gunakan type predicates (`value is Type`) untuk type guards
- Pisahkan type-only imports: `import type { X } from "..."`

### React

- **Pure SPA mode** — tidak ada Server Components, tidak ada RSC, tidak ada `use client` directive
- Tidak pakai `useActionState` / React 19 server features — ini bukan SSR/Next.js
- State management: **TanStack Query** (server state) + **React Context/useState** (client state: theme, saldo visibility)
- **Tidak pakai Zustand, Redux, atau state management library lain**
- Testing pakai `vi.fn()` dan `vi.Mocked` (Vitest) — **bukan** `jest.fn()`
- Prefer `const` arrow function components
- Semua komponen harus TypeScript (`.tsx`), tidak ada `.jsx`

### Linting & Formatting

- ESLint + Prettier
- Import sorting otomatis
- No unused variables/imports

---

## Backend API

- Base URL: env `VITE_API_URL`
- Auth URL: `${VITE_API_URL}/api/auth` (derived, bukan env terpisah)
- Swagger: https://ledgerly-service.vercel.app/docs
- Auth: cookie-based (`better-auth.session_token`, httpOnly, cross-domain)
- Semua request pakai `credentials: "include"`

---

## Environment Variables

```env
# .env.development
VITE_API_URL=http://localhost:3000

# .env.production
VITE_API_URL=https://ledgerly-service.vercel.app
```

Hanya 1 env variable. Semua URL di-derive dari sini.

---

## Auth

### Setup

- Auth client: `better-auth/react` `createAuthClient({ baseURL: VITE_API_URL })`
- `useSession()` — auto-fetch session, return user + role
- `signIn.social({ provider: "google" })` — redirect ke Google
- `signOut()` — clear session + redirect /login

### RBAC

| Aksi                          | ADMIN | VIEWER |
| ----------------------------- | ----- | ------ |
| Lihat semua halaman           | Ya    | Ya     |
| Create/Edit/Delete (semua)    | Ya    | Tidak  |
| Seed data                     | Ya    | Tidak  |

- VIEWER = read-only di semua modul
- Tidak ada route-level blocking — semua halaman bisa diakses kedua role
- VIEWER: tombol Create/Edit/Delete di-hide (bukan disabled)
- Backend enforce permission (403 untuk VIEWER di POST/PUT/DELETE)
- Helper: `useIsAdmin()` hook return boolean

### Session

- Expiry: 7 hari (backend setting)
- Auto-refresh: updateAge 1 hari (backend setting)
- Frontend tidak handle refresh — Better Auth cookie auto-refresh

### 401 Handling

- 401 dari API → tampilkan modal "Session habis, silakan login ulang"
- User klik tombol → redirect /login
- Tidak langsung redirect — supaya user tidak kehilangan input form

---

## File Directory

```
src/
├── routes/                          # React Router v7 file-based routes
│   ├── _auth.tsx                    # layout: session check, header, nav
│   ├── _auth.dashboard.tsx
│   ├── _auth.transactions.tsx
│   ├── _auth.transactions.new.tsx
│   ├── _auth.transactions.$id.edit.tsx
│   ├── _auth.transactions.new.transfer.tsx
│   ├── _auth.wallets.tsx
│   ├── _auth.wallets.$id.tsx        # detail wallet
│   ├── _auth.wallets.new.tsx        # mobile only (desktop = dialog)
│   ├── _auth.wallets.$id.edit.tsx   # mobile only (desktop = dialog)
│   ├── _auth.categories.tsx
│   ├── _auth.categories.new.tsx     # mobile only
│   ├── _auth.categories.$id.edit.tsx # mobile only
│   ├── _auth.budgets.tsx
│   ├── _auth.budgets.new.tsx        # mobile only
│   ├── _auth.budgets.$id.edit.tsx   # mobile only
│   ├── _auth.recurrings.tsx
│   ├── _auth.recurrings.new.tsx     # mobile only
│   ├── _auth.recurrings.$id.edit.tsx # mobile only
│   ├── _auth.reports.tsx
│   ├── _auth.more.tsx               # mobile only: menu kategori, budget, recurring, logout
│   └── login.tsx
│
├── modules/
│   ├── index.ts                     # re-export semua modul
│   │
│   ├── auth/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── hooks/
│   │       └── index.ts
│   │
│   ├── transactions/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── index.ts
│   │   └── components/
│   │       ├── index.ts
│   │       ├── transaction-form.tsx
│   │       ├── transaction-list.tsx
│   │       └── transaction-filter.tsx
│   │
│   ├── wallets/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── index.ts
│   │   └── components/
│   │       ├── index.ts
│   │       ├── wallet-card.tsx
│   │       └── wallet-form.tsx
│   │
│   ├── categories/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── index.ts
│   │   └── components/
│   │       ├── index.ts
│   │       ├── category-form.tsx
│   │       └── category-list.tsx
│   │
│   ├── budgets/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── index.ts
│   │   └── components/
│   │       ├── index.ts
│   │       ├── budget-form.tsx
│   │       ├── budget-card.tsx
│   │       └── budget-progress.tsx
│   │
│   ├── recurrings/
│   │   ├── index.ts
│   │   ├── api/
│   │   │   └── index.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   ├── hooks/
│   │   │   └── index.ts
│   │   └── components/
│   │       ├── index.ts
│   │       ├── recurring-form.tsx
│   │       └── recurring-list.tsx
│   │
│   └── reports/
│       ├── index.ts
│       ├── api/
│       │   └── index.ts
│       ├── types/
│       │   └── index.ts
│       ├── hooks/
│       │   └── index.ts
│       └── components/
│           ├── index.ts
│           ├── line-chart.tsx
│           ├── pie-chart.tsx
│           ├── category-breakdown.tsx
│           └── wallet-breakdown.tsx
│
├── components/
│   ├── index.ts
│   ├── ui/                          # shadcn/ui primitives
│   │   └── index.ts
│   ├── layout/                      # sidebar, header, bottom-nav, mobile-nav
│   │   └── index.ts
│   └── shared/                      # komponen bisnis lintas modul
│       ├── index.ts
│       ├── wallet-select.tsx
│       ├── category-select.tsx
│       ├── date-picker.tsx
│       ├── currency-input.tsx
│       ├── confirm-dialog.tsx
│       ├── empty-state.tsx
│       └── page-header.tsx
│
├── lib/
│   ├── index.ts
│   ├── api-client.ts               # base fetch wrapper
│   └── utils.ts                    # formatRupiah, formatDate, cn()
│
└── root.tsx                         # entry point, providers
```

### Aturan File Directory

- Semua modul punya 4 subfolder konsisten: `api/`, `types/`, `hooks/`, `components/` (kecuali auth tanpa components)
- Setiap folder punya `index.ts` untuk re-export
- Komponen yang hanya dipakai 1 modul → taruh di `modules/<modul>/components/`
- Komponen yang dipakai >1 modul → pindah ke `components/shared/`
- `components/ui/` hanya untuk shadcn/ui primitives
- `components/layout/` hanya untuk app shell
- `lib/` hanya untuk utility generic (tidak terikat modul)

---

## Routing & Layout

### Routes

| Route                         | Halaman                    |
| ----------------------------- | -------------------------- |
| `/login`                      | Public — tombol Google OAuth |
| `/dashboard`                  | Ringkasan semua data       |
| `/transactions`               | List + filter + pagination |
| `/transactions/new?type=income` | Form pemasukan            |
| `/transactions/new?type=expense` | Form pengeluaran         |
| `/transactions/new/transfer`  | Form transfer              |
| `/transactions/:id/edit`      | Edit transaksi             |
| `/wallets`                    | List wallet                |
| `/wallets/:id`                | Detail wallet + ringkasan  |
| `/wallets/new`                | Form wallet (mobile only)  |
| `/wallets/:id/edit`           | Edit wallet (mobile only)  |
| `/categories`                 | List kategori (tab)        |
| `/categories/new`             | Form kategori (mobile only) |
| `/categories/:id/edit`        | Edit kategori (mobile only) |
| `/budgets`                    | List budget + progress     |
| `/budgets/new`                | Form budget (mobile only)  |
| `/budgets/:id/edit`           | Edit budget (mobile only)  |
| `/recurrings`                 | List recurring             |
| `/recurrings/new`             | Form recurring (mobile only) |
| `/recurrings/:id/edit`        | Edit recurring (mobile only) |
| `/reports`                    | Laporan (tab: mingguan/bulanan/tahunan) |
| `/more`                       | Menu tambahan (mobile only) |

### CRUD Flow per Breakpoint

| Action                        | Mobile (< 768px)       | Tablet/Desktop (>= 768px) |
| ----------------------------- | ---------------------- | -------------------------- |
| Tambah/edit transaksi         | Halaman terpisah       | Halaman terpisah           |
| Tambah/edit wallet            | Halaman terpisah       | Dialog                     |
| Tambah/edit kategori          | Halaman terpisah       | Dialog                     |
| Tambah/edit budget            | Halaman terpisah       | Dialog                     |
| Tambah/edit recurring         | Halaman terpisah       | Dialog                     |
| Delete (semua modul)          | Confirm dialog         | Confirm dialog             |

Form component 1x — di mobile render di route page, di desktop render di dalam dialog. Deteksi via `useIsMobile()`.

### Layout per Breakpoint

| Device  | Breakpoint    | Nav                            |
| ------- | ------------- | ------------------------------ |
| Mobile  | < 768px       | Bottom nav (5 tab)             |
| Tablet  | 768px - 1024px | Sidebar (collapsed/icon only) |
| Desktop | > 1024px      | Sidebar (expanded/icon + label) |

### Bottom Nav (Mobile)

```
Dashboard | Transaksi | Wallet | Reports | Lainnya
```

### Sidebar (Tablet/Desktop)

```
Dashboard
Transaksi
Wallet
Kategori
Budget
Recurring
Reports
---------
Logout
```

### Header — Contextual

| Route                    | Title              | Action   |
| ------------------------ | ------------------ | -------- |
| `/dashboard`             | Dashboard          | -        |
| `/transactions`          | Transaksi          | [+]      |
| `/transactions/new`      | <- Tambah Transaksi | -       |
| `/transactions/:id/edit` | <- Edit Transaksi  | -        |
| `/wallets`               | Wallet             | [+]      |
| `/wallets/:id`           | <- Detail Wallet   | -        |
| `/categories`            | Kategori           | [+]      |
| `/budgets`               | Budget             | [+]      |
| `/recurrings`            | Recurring          | [+]      |
| `/reports`               | Laporan            | -        |
| `/more`                  | Lainnya            | -        |

- `<-` = back button
- `[+]` = mobile: bottom sheet 3 pilihan (transaksi) atau navigasi ke /new. Desktop: dropdown (transaksi) atau buka dialog
- Action button di-hide untuk VIEWER

### Transaksi — Entry Point "Tambah"

- Mobile: `[+]` di header -> bottom sheet (Pemasukan / Pengeluaran / Transfer)
- Desktop: `[+]` di header -> dropdown menu (Pemasukan / Pengeluaran / Transfer)
- Masing-masing navigasi ke form yang sesuai

### Halaman "Lainnya" (Mobile Only)

Bottom sheet atau halaman simple berisi:

```
Kategori
Budget
Recurring
---------
Logout
```

---

## Data Fetching

### Query Keys

```
["wallets"]                              # list
["wallets", id]                          # detail
["categories"]                           # list all
["categories", { type }]                 # list filtered
["transactions"]                         # list (base)
["transactions", { page, type, ... }]    # list filtered + paginated
["transactions", id]                     # detail
["budgets"]                              # list
["budgets", id]                          # detail
["recurrings"]                           # list
["recurrings", "due-today"]              # due today
["reports", "dashboard"]                 # dashboard
["reports", "weekly", { date }]          # weekly
["reports", "monthly", { date }]         # monthly
["reports", "yearly", { date }]          # yearly
```

### Stale Time — Aggressive Caching (Minimize Server Hit)

| Data              | staleTime | gcTime  |
| ----------------- | --------- | ------- |
| Wallets           | 5 menit   | 10 menit |
| Categories        | 30 menit  | 60 menit |
| Transactions      | 5 menit   | 10 menit |
| Budgets           | 5 menit   | 10 menit |
| Recurrings        | 30 menit  | 60 menit |
| Reports           | 10 menit  | 30 menit |
| Dashboard         | 10 menit  | 30 menit |
| Recurring due-today | 1 jam   | 2 jam    |

- `refetchOnWindowFocus: false` secara global
- Data di-invalidate manual saat mutasi

### Invalidation

| Mutation                          | Invalidate                              |
| --------------------------------- | --------------------------------------- |
| Create/edit/delete transaksi      | transactions, wallets, budgets, reports |
| Create/edit/delete transfer       | transactions, wallets, reports          |
| Create/edit/delete wallet         | wallets                                 |
| Create/edit/delete kategori       | categories, budgets                     |
| Create/edit/delete budget         | budgets                                 |
| Create/edit/delete recurring      | recurrings                              |
| Seed wallets                      | wallets                                 |
| Seed categories                   | categories                              |

### Pagination

- Numbered page di semua breakpoint (mobile & desktop)
- `useQuery` biasa dengan param `page` dan `limit`
- Tidak pakai infinite scroll

### Optimistic Update

- Tidak pakai — tunggu server response (what you action, what you get)

---

## Forms

### Library

- React Hook Form untuk state management
- Zod untuk validasi schema
- Validasi trigger: `onChange`

### Form per Modul

| Form        | Fields                                                        | Complexity |
| ----------- | ------------------------------------------------------------- | ---------- |
| Wallet      | name, initialBalance                                          | Simple     |
| Category    | name, icon (emoji), type (tab)                                | Simple     |
| Budget      | name, limit, categoryIds (multi-select)                       | Medium     |
| Recurring   | name, type, amount, dayOfMonth, walletId, targetWalletId?, categoryId? | Medium     |
| Transaction | amount, type (dari URL), walletId, categoryId, method?, date, note? | Complex    |
| Transfer    | amount, sourceWalletId, targetWalletId, adminFee?, date, note? | Medium     |

### Conditional Logic

**Transaction form:**

| Kondisi          | Efek                                            |
| ---------------- | ----------------------------------------------- |
| type = EXPENSE   | method wajib (CASH/QRIS/TRANSFER/DEBIT)        |
| type = INCOME    | method hidden                                   |
| type = EXPENSE   | kategori filter EXPENSE only                    |
| type = INCOME    | kategori filter INCOME only                     |

**Recurring form:**

| Kondisi          | Efek                                            |
| ---------------- | ----------------------------------------------- |
| type = EXPENSE   | categoryId wajib, targetWalletId hidden         |
| type = TRANSFER  | targetWalletId wajib, categoryId hidden         |

### Entry Point Transaksi

- 2 entry point terpisah: Pemasukan dan Pengeluaran (bukan 1 form toggle type)
- Transfer = form terpisah (field beda total)
- Type di-set via URL query: `/transactions/new?type=income` atau `?type=expense`

### Amount Input

- Display: format IDR (`Rp 1.000.000`) — pakai `components/shared/currency-input.tsx`
- Submit: number biasa (`1000000`)

### Recurring "Bayar"

- Tap "Bayar" -> buka form yang sesuai tipe recurring (expense atau transfer)
- Form pre-filled dari data recurring (amount, wallet, kategori, target wallet)
- Semua field tetap editable (tidak disabled)

---

## UI/UX

### Theme

- Dark mode: system default + manual toggle (Opsi C)
- Color palette: warm — earth tone, soft green, friendly/personal
- Warna akun semantik: hijau (pemasukan/surplus), merah (pengeluaran/defisit), kuning (warning), abu (transfer)

### Typography

- Font: Plus Jakarta Sans
- Fallback: system-ui, sans-serif

### Toggle Visibility Saldo

- Icon mata di header/dashboard
- State global — 1x tap hide/show semua nominal di seluruh app
- Hidden: tampil `Rp ••••••••`
- Screen reader: `aria-hidden` saat nominal hidden

### Mobile Patterns

| Pattern             | Implementasi                                           |
| ------------------- | ------------------------------------------------------ |
| Pull-to-refresh     | Ya                                                     |
| Swipe to edit/delete | Ya — selalu ada confirm dialog sebelum action          |
| Skeleton loading    | Ya                                                     |
| Toast notification  | Ya — setelah setiap CRUD success/error                 |
| Bottom sheet        | Ya — ganti dialog di mobile                            |

### Toast Position

- Mobile: bottom center (di atas bottom nav)
- Desktop: top right

---

## Animasi & Transisi

- Prinsip: subtle, modern, minimalis
- Page transition: **View Transitions API** (slide) — native browser, 0kb
- Komponen animasi: **Tailwind CSS transition** (bukan Framer Motion)

| Elemen                  | Animasi                              |
| ----------------------- | ------------------------------------ |
| Page transition         | Slide (View Transitions API)         |
| Bottom sheet / dialog   | Slide up + backdrop fade             |
| Toast                   | Slide in, auto dismiss 3-5 detik    |
| Skeleton -> content     | Fade transition                      |
| Swipe action            | Follow finger, reveal buttons        |
| Progress bar (budget)   | Animate width saat pertama load      |

---

## Error Handling

### HTTP Error

| Status | Handle                                                       |
| ------ | ------------------------------------------------------------ |
| 400    | Toast error dengan pesan dari server                         |
| 401    | Modal "Session habis, silakan login ulang" -> redirect /login |
| 403    | Toast "Tidak punya akses" (jarang — tombol sudah di-hide)   |
| 404    | Toast error / redirect ke list                               |
| 409    | Toast error dengan pesan dari server (duplikat nama)         |
| 500    | Toast "Terjadi kesalahan, coba lagi"                         |

### Network Error

| Kondisi                      | Handle                                              |
| ---------------------------- | --------------------------------------------------- |
| Tidak ada internet           | Toast "Tidak ada koneksi internet"                  |
| Server timeout               | Toast "Server tidak merespons, coba lagi"           |
| Fetch gagal saat load data   | Inline error + tombol "Coba Lagi"                   |
| Fetch gagal saat mutasi      | Toast error, form tetap terbuka (data tidak hilang) |
| 500 berulang (3x retry gagal) | "Server sedang bermasalah, coba beberapa saat lagi" |

### Error Boundary (3 Level)

| Level      | Scope                    | Behavior                                          |
| ---------- | ------------------------ | ------------------------------------------------- |
| Global     | root.tsx                 | Safety net terakhir — "Terjadi kesalahan" + muat ulang |
| Per-route  | _auth.tsx layout         | Nav tetap intact, content area fallback           |
| Per-module | Dashboard components dll | Komponen crash tampil inline error, sisanya normal |

**UI tidak boleh blank putih** — worst case user lihat pesan error yang bisa di-recover.

### TanStack Query Retry

- `retry: 3` dengan exponential backoff (built-in)

---

## Locale & Timezone

- Format angka: `Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR" })` -> `Rp 1.000.000`
- Format tanggal: `Senin, 7 April 2026` — format panjang, bahasa Indonesia
- Timezone: ikut device (`Intl.DateTimeFormat` resolve otomatis)
- Bahasa UI: mixed — label Indonesia, istilah umum tetap English (Dashboard, Budget, Report, Wallet)

---

## Code Splitting

- React Router v7 `lazy()` per route
- Chart library (Recharts) lazy load — hanya di-load saat buka dashboard/reports
- Eager load: layout, auth module, shared components, lib/

---

## Accessibility & Semantic HTML

### Semantic HTML

| Elemen              | Tag                                            |
| ------------------- | ---------------------------------------------- |
| Content area        | `<main>`                                       |
| Navigation          | `<nav>` (bottom nav & sidebar)                 |
| App header          | `<header>`                                     |
| Section dashboard   | `<section>`                                    |
| Heading hierarchy   | `h1` per halaman, `h2` per section, tidak skip |
| List data           | `<ul>/<li>` (transaksi, wallet, kategori)      |
| Form label          | `<label>` terhubung ke input                   |
| Form group          | `<fieldset>` untuk radio/checkbox group        |
| Action              | `<button>` untuk action, `<a>` untuk navigasi  |
| Data breakdown      | `<table>` dengan `<thead>/<tbody>/<th>`        |
| Tanggal             | `<time datetime="2026-04-07">`                 |
| Lucide icon (decorative) | `aria-hidden="true"`                      |
| Emoji kategori      | `role="img" aria-label="..."`                  |

### Accessibility (dari shadcn/Radix)

- Keyboard navigation (Tab, Enter, Escape)
- Focus trap di dialog & bottom sheet
- Color contrast WCAG AA (pastikan warm theme + dark mode pass)
- `aria-label` pada currency reader
- `aria-hidden` pada hidden saldo
- `role="alert"` pada toast
- `aria-busy="true"` pada skeleton
- Swipe action: fallback keyboard/long press

---

## Testing

### Stack

| Layer       | Tool                          |
| ----------- | ----------------------------- |
| Unit        | Vitest                        |
| Component   | Vitest + React Testing Library |
| Integration | Vitest + MSW                  |
| E2E         | Playwright + MSW              |

### Coverage Target

| Layer            | Target |
| ---------------- | ------ |
| Utils/hooks/logic | 100%  |
| Components       | 90%+   |
| E2E              | Critical path (login -> CRUD transaksi -> report) |

### MSW

- Mock semua API call di semua layer test (unit, integration, E2E)
- Tidak hit real backend di test

---

## Deployment

- Platform: Vercel (free)
- Domain: Vercel default (`xxx.vercel.app`)
- Branch: main only — auto deploy dari main
- Config: `vercel.json` dengan rewrite fallback ke `index.html` (SPA mode)

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## PWA

### Level 1 — Installable

- Web manifest
- Service worker minimal
- "Add to Home Screen"

### Level 2 — Offline Capable

- Cache halaman & assets
- TanStack Query cache tetap tampil saat offline
- Mutasi di-queue, sync saat online

### Level 3 — Push Notification (TODO)

- Recurring reminder via push notification
- Butuh backend: endpoint register subscription + cron job cek recurring due
- Implementasi setelah backend support tersedia

---

## Probis Per Modul

### Dashboard

Data source: 3 API call paralel

- `GET /api/reports/dashboard` — total saldo, saldo per wallet, tren 12 bulan
- `GET /api/budgets` — budget status
- `GET /api/recurrings/due-today` — reminder hari ini

Layout (scroll vertikal):

1. Total saldo (+ toggle mata)
2. Wallet cards (horizontal scroll)
3. Recurring due hari ini (+ tombol "Bayar")
4. Budget progress bar
5. Ringkasan bulan ini (pemasukan vs pengeluaran vs surplus/defisit)
6. Tren 12 bulan (line chart)

### Transaksi

- List grouped by tanggal
- Warna: hijau pemasukan, merah pengeluaran, abu transfer
- Icon dari kategori (emoji)
- Swipe kiri -> Edit / Delete (dengan confirm)
- Filter selalu tampil di atas: Type, Wallet, Periode (preset + custom range)
- Pagination: numbered page

### Wallet

- List: nama wallet + saldo
- Total saldo di atas
- Tap wallet -> detail page (`/wallets/:id`): info wallet + ringkasan + tombol "Lihat Transaksi"
- "Lihat Transaksi" -> `/transactions?walletId=xxx`
- Swipe kiri -> Edit / Delete (confirm, 409 kalau masih ada transaksi)
- Auto seed default wallets saat pertama register

### Kategori

- Tab: Pengeluaran / Pemasukan
- List: icon emoji + nama
- Swipe kiri -> Edit / Delete (confirm, 409 kalau masih dipakai)
- Auto seed default categories saat pertama register

### Budget

- List: nama + progress bar + status warna
- Progress bar: hijau (<80%), kuning (>=80%), merah (>100%)
- Tap -> detail expand inline (breakdown per kategori)
- Reset otomatis tiap tanggal 1 (dari backend)

### Recurring

- Section atas: due today (highlight + tombol "Bayar")
- Section bawah: semua recurring
- "Bayar" -> buka form transaksi/transfer pre-filled, semua field editable
- Swipe kiri -> Edit / Delete (confirm)

### Reports

- 1 halaman, 3 tab: Mingguan / Bulanan / Tahunan
- Navigasi periode: `<- Maret 2026 ->`
- Isi per tab:
  - Total pemasukan vs pengeluaran vs surplus/defisit
  - Perbandingan bulan lalu (hanya tab Bulanan)
  - Pie chart: proporsi pengeluaran per kategori
  - Breakdown kategori (tabel)
  - Breakdown wallet (tabel)
- Line chart tren 12 bulan di tab Tahunan

---

## Fase Implementasi

### Fase 0 — Project Setup

- React Router v7 SPA + TypeScript
- Tailwind CSS v4 + shadcn/ui + Plus Jakarta Sans
- TanStack Query provider
- Vitest + MSW + Playwright setup
- Vercel config + env variables
- `lib/` (api-client, utils)

### Fase 1 — Auth + Layout

- Better Auth client + login page
- Layout: contextual header, bottom nav (mobile), sidebar (tablet/desktop)
- Protected route wrapper
- useSession, useIsAdmin
- 401 modal handling
- Global toggle visibility saldo
- Error boundary (3 level)

### Fase 2 — Wallet

- Module lengkap: api, types, hooks, components
- List, detail page, form (page mobile / dialog desktop)
- Seed default wallets
- Swipe to edit/delete + confirm

### Fase 3 — Kategori

- Module lengkap
- List dengan tab (pengeluaran/pemasukan)
- Form CRUD
- Seed default categories

### Fase 4 — Transaksi

- Module lengkap
- Form income, expense (conditional method), transfer (3 record)
- List grouped by tanggal + filter + pagination
- Action menu: bottom sheet (mobile) / dropdown (desktop)
- Swipe to edit/delete + confirm
- Invalidation: wallets, budgets, reports

### Fase 5 — Budget

- Module lengkap
- Form (multi-select kategori)
- List + progress bar + status warna
- Detail expand inline

### Fase 6 — Recurring

- Module lengkap
- List (due today + semua)
- Form CRUD
- Tombol "Bayar" -> pre-filled form (editable)

### Fase 7 — Reports + Dashboard

- Dashboard: semua section (saldo, wallet, recurring, budget, ringkasan, chart)
- Reports: 3 tab + navigasi periode
- Charts (Recharts, lazy load)
- Breakdown tabel

### Fase 8 — PWA

- Manifest + service worker (installable)
- Offline cache
- Push notification (TODO — tunggu backend)

### Fase 9 — Polish

- View Transitions API (page slide)
- Tailwind CSS animation
- Accessibility audit
- Performance audit (Lighthouse)
- Testing: coverage target

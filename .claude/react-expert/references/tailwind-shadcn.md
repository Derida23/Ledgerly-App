# Tailwind CSS v4 + shadcn/ui — Patterns

## Tailwind CSS v4 Setup

### Installation with Vite

```bash
npm install tailwindcss @tailwindcss/vite
```

```ts
// vite.config.ts
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [tailwindcss(), reactRouter()],
});
```

```css
/* src/app.css */
@import "tailwindcss";
```

### Key Changes from v3 to v4

| v3                          | v4                              |
| --------------------------- | ------------------------------- |
| `tailwind.config.js`        | CSS-based config (`@theme`)     |
| `@tailwind base/components` | `@import "tailwindcss"`         |
| `theme.extend.colors`       | `@theme { --color-*: ... }`    |
| `darkMode: "class"`         | `@variant dark (&:where(.dark *))` |
| `content: [...]`            | Auto content detection          |

---

## Theme Configuration

### CSS Variables with @theme

```css
/* src/app.css */
@import "tailwindcss";

@theme {
  /* Typography */
  --font-sans: "Plus Jakarta Sans", system-ui, sans-serif;

  /* Colors — Warm Earth Tone */
  --color-background: oklch(0.98 0.005 90);
  --color-foreground: oklch(0.15 0.02 60);

  --color-primary: oklch(0.45 0.1 145);        /* Soft green */
  --color-primary-foreground: oklch(0.98 0.005 90);

  --color-secondary: oklch(0.92 0.02 80);       /* Warm beige */
  --color-secondary-foreground: oklch(0.25 0.02 60);

  --color-muted: oklch(0.93 0.01 80);
  --color-muted-foreground: oklch(0.55 0.02 60);

  --color-accent: oklch(0.88 0.03 75);          /* Warm accent */
  --color-accent-foreground: oklch(0.25 0.02 60);

  --color-destructive: oklch(0.55 0.2 25);      /* Red for expenses/errors */
  --color-destructive-foreground: oklch(0.98 0.005 90);

  --color-success: oklch(0.55 0.15 145);        /* Green for income */
  --color-success-foreground: oklch(0.98 0.005 90);

  --color-warning: oklch(0.7 0.15 80);          /* Yellow for budget warning */
  --color-warning-foreground: oklch(0.2 0.02 60);

  --color-card: oklch(0.99 0.003 90);
  --color-card-foreground: oklch(0.15 0.02 60);

  --color-border: oklch(0.88 0.01 80);
  --color-input: oklch(0.88 0.01 80);
  --color-ring: oklch(0.45 0.1 145);

  /* Radius */
  --radius-sm: 0.375rem;
  --radius-md: 0.5rem;
  --radius-lg: 0.75rem;
  --radius-xl: 1rem;

  /* Shadows */
  --shadow-sm: 0 1px 2px oklch(0 0 0 / 0.05);
  --shadow-md: 0 4px 6px oklch(0 0 0 / 0.07);
}
```

### Dark Mode

```css
/* src/app.css — after @theme */
@variant dark (&:where(.dark *));

/* Dark mode overrides using CSS custom properties */
.dark {
  --color-background: oklch(0.13 0.01 60);
  --color-foreground: oklch(0.93 0.005 90);

  --color-primary: oklch(0.6 0.12 145);
  --color-primary-foreground: oklch(0.13 0.01 60);

  --color-secondary: oklch(0.2 0.015 60);
  --color-secondary-foreground: oklch(0.9 0.005 90);

  --color-muted: oklch(0.2 0.01 60);
  --color-muted-foreground: oklch(0.6 0.01 80);

  --color-accent: oklch(0.22 0.02 60);
  --color-accent-foreground: oklch(0.9 0.005 90);

  --color-card: oklch(0.16 0.01 60);
  --color-card-foreground: oklch(0.93 0.005 90);

  --color-border: oklch(0.25 0.01 60);
  --color-input: oklch(0.25 0.01 60);
  --color-ring: oklch(0.6 0.12 145);
}
```

### Theme Toggle Hook

```tsx
import { useEffect, useState } from "react";

type Theme = "light" | "dark" | "system";

export function useTheme() {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") return "system";
    return (localStorage.getItem("theme") as Theme) ?? "system";
  });

  useEffect(() => {
    const root = document.documentElement;

    function applyTheme(t: Theme) {
      if (t === "system") {
        const prefersDark = window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches;
        root.classList.toggle("dark", prefersDark);
      } else {
        root.classList.toggle("dark", t === "dark");
      }
    }

    applyTheme(theme);
    localStorage.setItem("theme", theme);

    // Listen for system preference changes
    if (theme === "system") {
      const media = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = () => applyTheme("system");
      media.addEventListener("change", handler);
      return () => media.removeEventListener("change", handler);
    }
  }, [theme]);

  return { theme, setTheme };
}
```

---

## shadcn/ui Setup

### Installation

```bash
npx shadcn@latest init
```

Configuration choices:
- Style: **New York** (more modern, fits minimalist)
- CSS variables: **Yes**
- Tailwind CSS: **v4**
- Components directory: `src/components/ui`

### Adding Components

```bash
# Add individual components as needed
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add input
npx shadcn@latest add select
npx shadcn@latest add table
npx shadcn@latest add badge
npx shadcn@latest add toast
npx shadcn@latest add form        # React Hook Form integration
npx shadcn@latest add sheet       # Bottom sheet / side panel
npx shadcn@latest add tabs
npx shadcn@latest add skeleton
npx shadcn@latest add switch
npx shadcn@latest add progress
npx shadcn@latest add dropdown-menu
```

### Component Structure

```
src/components/ui/
├── button.tsx        # <Button variant="default|destructive|outline|ghost" size="default|sm|lg|icon" />
├── dialog.tsx        # <Dialog> <DialogTrigger> <DialogContent> ... (desktop)
├── sheet.tsx         # <Sheet> <SheetTrigger> <SheetContent> ... (mobile bottom sheet)
├── input.tsx         # <Input type="text|email|number" />
├── select.tsx        # <Select> <SelectTrigger> <SelectContent> <SelectItem> ...
├── table.tsx         # <Table> <TableHeader> <TableBody> <TableRow> <TableCell>
├── badge.tsx         # <Badge variant="default|secondary|destructive|outline" />
├── tabs.tsx          # <Tabs> <TabsList> <TabsTrigger> <TabsContent>
├── skeleton.tsx      # <Skeleton className="h-4 w-[200px]" />
├── toast.tsx         # useToast() + <Toaster />
├── form.tsx          # <Form> <FormField> <FormItem> <FormLabel> <FormMessage>
├── progress.tsx      # <Progress value={80} />
├── switch.tsx        # <Switch checked onCheckedChange />
├── dropdown-menu.tsx # <DropdownMenu> <DropdownMenuTrigger> <DropdownMenuContent>
└── index.ts          # Re-exports
```

---

## cn() Utility

```ts
// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Usage:

```tsx
<div
  className={cn(
    "rounded-lg border p-4",
    isActive && "border-primary bg-primary/10",
    isDisabled && "opacity-50 pointer-events-none"
  )}
/>
```

---

## Responsive Patterns

### Breakpoints

```css
/* Tailwind v4 default breakpoints */
/* sm: 640px, md: 768px, lg: 1024px, xl: 1280px, 2xl: 1536px */
```

### Mobile-First Classes

```tsx
// Mobile first — styles apply mobile up, override at larger breakpoints
<div className="
  p-4              /* mobile */
  md:p-6           /* tablet */
  lg:p-8           /* desktop */
">

<div className="
  grid grid-cols-1     /* mobile: 1 column */
  md:grid-cols-2       /* tablet: 2 columns */
  lg:grid-cols-3       /* desktop: 3 columns */
  gap-4
">
```

### Responsive Show/Hide

```tsx
// Bottom nav: show on mobile only
<nav className="fixed bottom-0 inset-x-0 md:hidden">
  <BottomNav />
</nav>

// Sidebar: hide on mobile, show on tablet+
<aside className="hidden md:flex md:w-16 lg:w-64">
  <Sidebar />
</aside>
```

### Responsive Dialog vs Page

```tsx
import { useMediaQuery } from "@/hooks/useMediaQuery";

function WalletAction({ wallet }: { wallet: Wallet }) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button>Edit</Button>
        </DialogTrigger>
        <DialogContent>
          <WalletForm wallet={wallet} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Link to={`/wallets/${wallet.id}/edit`}>
      <Button>Edit</Button>
    </Link>
  );
}
```

### Responsive Bottom Sheet vs Dialog

```tsx
function ResponsiveModal({
  open,
  onOpenChange,
  children,
  title,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
  title: string;
}) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>
        {children}
      </SheetContent>
    </Sheet>
  );
}
```

---

## Common Component Patterns

### Page Header

```tsx
interface PageHeaderProps {
  title: string;
  backHref?: string;
  action?: React.ReactNode;
}

function PageHeader({ title, backHref, action }: PageHeaderProps) {
  return (
    <header className="flex items-center justify-between h-14 px-4 border-b bg-background sticky top-0 z-10">
      <div className="flex items-center gap-2">
        {backHref && (
          <Link to={backHref}>
            <ChevronLeft className="h-5 w-5" />
          </Link>
        )}
        <h1 className="text-lg font-semibold">{title}</h1>
      </div>
      {action}
    </header>
  );
}
```

### Card with Semantic Colors

```tsx
// Wallet card
<div className="rounded-xl border bg-card p-4 shadow-sm">
  <p className="text-sm text-muted-foreground">{wallet.name}</p>
  <p className="text-xl font-bold">{formatIDR(wallet.balance)}</p>
</div>

// Transaction item — color by type
<div className="flex items-center justify-between py-3">
  <div className="flex items-center gap-3">
    <span className="text-xl">{transaction.category?.icon}</span>
    <div>
      <p className="font-medium">{transaction.category?.name}</p>
      <p className="text-sm text-muted-foreground">{transaction.wallet.name}</p>
    </div>
  </div>
  <span
    className={cn(
      "font-semibold",
      transaction.type === "INCOME" && "text-success",
      transaction.type === "EXPENSE" && "text-destructive",
      (transaction.type === "TRANSFER_IN" || transaction.type === "TRANSFER_OUT") &&
        "text-muted-foreground"
    )}
  >
    {transaction.type === "INCOME" || transaction.type === "TRANSFER_IN" ? "+" : "-"}
    {formatIDR(transaction.amount)}
  </span>
</div>
```

### Budget Progress Bar

```tsx
function BudgetProgress({
  spent,
  limit,
  status,
}: {
  spent: number;
  limit: number;
  status: "NORMAL" | "WARNING" | "OVER_BUDGET";
}) {
  const percentage = Math.min((spent / limit) * 100, 100);

  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span>{formatIDR(spent)}</span>
        <span className="text-muted-foreground">{formatIDR(limit)}</span>
      </div>
      <div className="h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            status === "NORMAL" && "bg-success",
            status === "WARNING" && "bg-warning",
            status === "OVER_BUDGET" && "bg-destructive"
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
```

### Empty State

```tsx
function EmptyState({
  icon: Icon,
  message,
  action,
}: {
  icon?: LucideIcon;
  message: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {Icon && <Icon className="h-12 w-12 text-muted-foreground/50 mb-4" />}
      <p className="text-muted-foreground">{message}</p>
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// Usage
<EmptyState
  icon={WalletIcon}
  message="Belum ada wallet"
  action={
    <Button onClick={openCreateForm}>
      <Plus className="h-4 w-4 mr-2" /> Tambah Wallet
    </Button>
  }
/>
```

### Skeleton Loading

```tsx
function WalletListSkeleton() {
  return (
    <div className="space-y-3 p-4">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="rounded-xl border p-4 space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-6 w-32" />
        </div>
      ))}
    </div>
  );
}

function TransactionListSkeleton() {
  return (
    <div className="space-y-4 p-4">
      <Skeleton className="h-4 w-20" /> {/* Date header */}
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-1">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
          <Skeleton className="h-4 w-24" />
        </div>
      ))}
    </div>
  );
}
```

---

## Animation with Tailwind

### Transition Classes

```tsx
// Fade in
<div className="animate-in fade-in duration-200" />

// Slide up (bottom sheet)
<div className="animate-in slide-in-from-bottom duration-300" />

// Slide from right (page transition fallback)
<div className="animate-in slide-in-from-right duration-250" />

// Scale up (dialog)
<div className="animate-in zoom-in-95 duration-200" />

// Exit
<div className="animate-out fade-out slide-out-to-bottom duration-200" />
```

### Custom Animation

```css
/* src/app.css */
@keyframes count-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}

@keyframes shimmer {
  from { background-position: -200% 0; }
  to { background-position: 200% 0; }
}

@theme {
  --animate-count-up: count-up 0.4s ease-out;
  --animate-shimmer: shimmer 2s linear infinite;
}
```

```tsx
<p className="animate-count-up font-bold text-2xl">
  {formatIDR(totalBalance)}
</p>
```

### Progress Bar Animation

```css
/* Animate width change on budget progress */
.budget-progress {
  transition: width 500ms ease-in-out;
}
```

---

## Toast Configuration

```tsx
// src/root.tsx
import { Toaster } from "@/components/ui/sonner"; // or shadcn toast

export default function Root() {
  return (
    <>
      <App />
      <Toaster
        position="bottom-center"  // Mobile
        className="md:!top-4 md:!right-4 md:!bottom-auto md:!left-auto" // Desktop override
        richColors
        closeButton
        duration={3000}
      />
    </>
  );
}
```

Usage:

```tsx
import { toast } from "sonner";

// Success
toast.success("Transaksi berhasil ditambahkan");

// Error
toast.error("Gagal menyimpan data");

// Error with server message
toast.error(error.message);

// With description
toast.success("Wallet berhasil dihapus", {
  description: "Bank Mandiri telah dihapus dari daftar wallet",
});
```

---

## Dark Mode Toggle Component

```tsx
import { Moon, Sun, Monitor } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => setTheme("light")}>
          <Sun className="mr-2 h-4 w-4" /> Light
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("dark")}>
          <Moon className="mr-2 h-4 w-4" /> Dark
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme("system")}>
          <Monitor className="mr-2 h-4 w-4" /> System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
```

---

## Quick Reference

| Tailwind v4                  | Purpose                                 |
| ---------------------------- | --------------------------------------- |
| `@import "tailwindcss"`      | Import Tailwind (replaces @tailwind)    |
| `@theme { }`                 | Define design tokens (replaces config)  |
| `@variant dark`              | Configure dark mode variant             |
| `oklch()`                    | Perceptually uniform color space        |
| `bg-primary`                 | Uses `--color-primary` from @theme      |
| `text-destructive`           | Uses `--color-destructive` from @theme  |

| shadcn/ui Component  | Use For                                    |
| -------------------- | ------------------------------------------ |
| `Button`             | Actions, submit, navigation                |
| `Dialog`             | Desktop CRUD forms                         |
| `Sheet`              | Mobile bottom sheet, action menu           |
| `Input`              | Text inputs                                |
| `Select`             | Dropdown (wallet, category, method)        |
| `Table`              | Report breakdown                           |
| `Badge`              | Status labels (budget, transaction type)   |
| `Tabs`               | Category type toggle, report period        |
| `Skeleton`           | Loading placeholder                        |
| `Progress`           | Budget progress bar                        |
| `Switch`             | Notification toggle                        |
| `DropdownMenu`       | Action menu (desktop), theme toggle        |
| `Form`               | React Hook Form integration                |
| `Toaster`            | Toast notifications                        |

| Pattern                 | Mobile              | Desktop              |
| ----------------------- | ------------------- | -------------------- |
| Navigation              | Bottom nav          | Sidebar              |
| CRUD form               | Full page           | Dialog               |
| Action menu             | Bottom sheet        | Dropdown             |
| Confirm delete          | Dialog              | Dialog               |
| Toast                   | Bottom center       | Top right            |

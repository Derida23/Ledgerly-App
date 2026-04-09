import { NavLink } from "react-router";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  Tag,
  PiggyBank,
  RefreshCw,
  BarChart3,
  LogOut,
} from "lucide-react";
import { signOut } from "~/modules/auth/api";
import { cn } from "~/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { to: "/wallets", label: "Wallet", icon: Wallet },
  { to: "/categories", label: "Kategori", icon: Tag },
  { to: "/budgets", label: "Budget", icon: PiggyBank },
  { to: "/recurrings", label: "Recurring", icon: RefreshCw },
  { to: "/reports", label: "Laporan", icon: BarChart3 },
] as const;

export function Sidebar() {
  async function handleLogout() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <aside className="hidden md:flex md:flex-col md:fixed md:inset-y-3 md:left-3 md:z-30 md:w-16 lg:w-60 md:rounded-2xl md:border md:border-border/60 md:bg-card md:shadow-sm">
      <div className="flex h-14 items-center gap-2.5 px-4">
        <img src="/ledgerly.png" alt="Ledgerly" className="h-7 w-7 shrink-0" />
        <span className="hidden lg:block text-lg font-bold text-foreground">
          Ledgerly
        </span>
      </div>

      <nav className="flex-1 overflow-y-auto py-4" role="navigation">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-accent hover:text-foreground",
                  )
                }
              >
                <item.icon className="h-5 w-5 shrink-0" aria-hidden="true" />
                <span className="hidden lg:inline">{item.label}</span>
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <div className="border-t border-border/60 p-2">
        <button
          onClick={handleLogout}
          className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <LogOut className="h-5 w-5 shrink-0" aria-hidden="true" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </div>
    </aside>
  );
}

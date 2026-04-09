import { NavLink } from "react-router";
import {
  LayoutDashboard,
  ArrowLeftRight,
  Wallet,
  BarChart3,
  MoreHorizontal,
} from "lucide-react";
import { cn } from "~/lib/utils";

const navItems = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { to: "/transactions", label: "Transaksi", icon: ArrowLeftRight },
  { to: "/wallets", label: "Wallet", icon: Wallet },
  { to: "/reports", label: "Reports", icon: BarChart3 },
  { to: "/more", label: "Lainnya", icon: MoreHorizontal },
] as const;

export function BottomNav() {
  return (
    <nav
      className="fixed bottom-3 inset-x-3 z-30 rounded-2xl bg-card/95 shadow-lg ring-1 ring-border/40 backdrop-blur-sm md:hidden"
      role="navigation"
    >
      <ul className="flex items-center justify-around">
        {navItems.map((item) => (
          <li key={item.to} className="flex-1">
            <NavLink
              to={item.to}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground",
                )
              }
            >
              <item.icon className="h-5 w-5" aria-hidden="true" />
              <span>{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}

import { Link } from "react-router";
import { Tag, PiggyBank, RefreshCw, LogOut } from "lucide-react";
import { signOut } from "~/modules/auth/api";
import { Header } from "~/components/layout/header";

const menuItems = [
  { to: "/categories", label: "Kategori", icon: Tag },
  { to: "/budgets", label: "Budget", icon: PiggyBank },
  { to: "/recurrings", label: "Recurring", icon: RefreshCw },
] as const;

export default function MorePage() {
  async function handleLogout() {
    await signOut();
    window.location.href = "/";
  }

  return (
    <section>
      <Header title="Lainnya" />
      <main className="p-4 pb-20">
        <nav>
          <ul className="space-y-1">
            {menuItems.map((item) => (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-foreground transition-colors hover:bg-accent"
                >
                  <item.icon
                    className="h-5 w-5 text-muted-foreground"
                    aria-hidden="true"
                  />
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="mt-4 border-t border-border pt-4">
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
          >
            <LogOut className="h-5 w-5" aria-hidden="true" />
            Logout
          </button>
        </div>
      </main>
    </section>
  );
}

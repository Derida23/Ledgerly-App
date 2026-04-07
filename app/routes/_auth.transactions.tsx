import { useState } from "react";
import { Link, useSearchParams } from "react-router";
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight } from "lucide-react";
import { Header } from "~/components/layout/header";
import { useIsAdmin } from "~/modules/auth/hooks";
import { TransactionList } from "~/modules/transactions/components";

export default function TransactionsPage() {
  const isAdmin = useIsAdmin();
  const [searchParams] = useSearchParams();
  const walletId = searchParams.get("walletId") ?? undefined;
  const [showMenu, setShowMenu] = useState(false);

  return (
    <section>
      <Header
        title="Transaksi"
        action={
          isAdmin ? (
            <div className="relative">
              <button
                onClick={() => setShowMenu(!showMenu)}
                className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
                aria-label="Tambah transaksi"
              >
                <Plus className="h-5 w-5" />
              </button>

              {showMenu && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setShowMenu(false)}
                  />
                  <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-xl border border-border bg-card p-1 shadow-md">
                    <Link
                      to="/transactions/new?type=income"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      <TrendingUp className="h-4 w-4 text-success" />
                      Pemasukan
                    </Link>
                    <Link
                      to="/transactions/new?type=expense"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      <TrendingDown className="h-4 w-4 text-destructive" />
                      Pengeluaran
                    </Link>
                    <Link
                      to="/transactions/new/transfer"
                      onClick={() => setShowMenu(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-foreground hover:bg-accent"
                    >
                      <ArrowLeftRight className="h-4 w-4 text-muted-foreground" />
                      Transfer
                    </Link>
                  </div>
                </>
              )}
            </div>
          ) : undefined
        }
      />
      <main className="p-4 pb-20 md:pb-4">
        <TransactionList initialFilters={{ walletId }} />
      </main>
    </section>
  );
}

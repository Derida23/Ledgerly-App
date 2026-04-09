import { Link } from "react-router";
import { Plus } from "lucide-react";
import { Header } from "~/components/layout/header";
import { useIsAdmin } from "~/modules/auth/hooks";
import { WalletList } from "~/modules/wallets/components";

export default function WalletsPage() {
  const isAdmin = useIsAdmin();

  return (
    <section>
      <Header
        title="Wallet"
        action={
          isAdmin ? (
            <Link
              to="/wallets/new"
              className="cursor-pointer rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent active:text-foreground"
              aria-label="Tambah wallet"
            >
              <Plus className="h-5 w-5" />
            </Link>
          ) : undefined
        }
      />
      <main className="p-4 pb-24 md:pb-4">
        <WalletList />
      </main>
    </section>
  );
}

import { Link } from "react-router";
import { Plus } from "lucide-react";
import { Header } from "~/components/layout/header";
import { useIsAdmin } from "~/modules/auth/hooks";
import { RecurringList } from "~/modules/recurrings/components";

export default function RecurringsPage() {
  const isAdmin = useIsAdmin();

  return (
    <section>
      <Header
        title="Recurring"
        action={
          isAdmin ? (
            <Link
              to="/recurrings/new"
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Tambah recurring"
            >
              <Plus className="h-5 w-5" />
            </Link>
          ) : undefined
        }
      />
      <main className="p-4 pb-20 md:pb-4">
        <RecurringList />
      </main>
    </section>
  );
}

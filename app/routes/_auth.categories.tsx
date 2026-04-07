import { Link } from "react-router";
import { Plus } from "lucide-react";
import { Header } from "~/components/layout/header";
import { useIsAdmin } from "~/modules/auth/hooks";
import { CategoryList } from "~/modules/categories/components";

export default function CategoriesPage() {
  const isAdmin = useIsAdmin();

  return (
    <section>
      <Header
        title="Kategori"
        action={
          isAdmin ? (
            <Link
              to="/categories/new"
              className="rounded-lg p-2 text-muted-foreground hover:bg-accent hover:text-foreground"
              aria-label="Tambah kategori"
            >
              <Plus className="h-5 w-5" />
            </Link>
          ) : undefined
        }
      />
      <main className="p-4 pb-20 md:pb-4">
        <CategoryList />
      </main>
    </section>
  );
}

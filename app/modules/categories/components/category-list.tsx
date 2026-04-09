import { useState } from "react";
import { Link } from "react-router";
import { Pencil, Trash2, Tag } from "lucide-react";
import { cn } from "~/lib/utils";
import { useIsAdmin } from "~/modules/auth/hooks";
import {
  useCategories,
  useDeleteCategory,
} from "~/modules/categories/hooks";
import { CategoryType } from "~/modules/categories/types";
import type { CategoryResponse } from "~/modules/categories/types";
import { ConfirmDialog } from "~/components/shared/confirm-dialog";
import { EmptyState } from "~/components/shared/empty-state";

export function CategoryList() {
  const [activeTab, setActiveTab] = useState<"EXPENSE" | "INCOME">("EXPENSE");
  const { data: categories, isLoading, isError, error, refetch } =
    useCategories(activeTab);
  const deleteMutation = useDeleteCategory();
  const isAdmin = useIsAdmin();

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {(
          [
            { value: CategoryType.EXPENSE, label: "Pengeluaran" },
            { value: CategoryType.INCOME, label: "Pemasukan" },
          ] as const
        ).map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={cn(
              "flex-1 cursor-pointer rounded-xl px-4 py-2.5 text-sm font-medium shadow-sm transition-colors",
              activeTab === tab.value
                ? "bg-primary/10 text-primary shadow-primary/10"
                : "bg-card text-muted-foreground hover:bg-accent",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <CategoryListSkeleton />
      ) : isError ? (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 p-4 text-center">
          <p className="font-medium">Gagal memuat data</p>
          <p className="mt-1 text-sm text-muted-foreground">{error.message}</p>
          <button
            onClick={() => refetch()}
            className="mt-3 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
          >
            Coba Lagi
          </button>
        </div>
      ) : !categories?.length ? (
        <EmptyState icon={Tag} message="Belum ada kategori" />
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {categories.map((category) => (
            <CategoryItem
              key={category.id}
              category={category}
              isAdmin={isAdmin}
              onDelete={(id) => deleteMutation.mutate(id)}
              isDeleting={deleteMutation.isPending}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

function CategoryItem({
  category,
  isAdmin,
  onDelete,
  isDeleting,
}: {
  category: CategoryResponse;
  isAdmin: boolean;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [showConfirm, setShowConfirm] = useState(false);

  return (
    <>
      <li className="group flex items-center justify-between rounded-xl bg-card px-4 py-3 shadow-sm transition-colors">
        <div className="flex items-center gap-3">
          <span className="text-xl" role="img" aria-label={category.name}>
            {category.icon}
          </span>
          <span className="text-sm font-medium text-foreground">
            {category.name}
          </span>
        </div>

        {isAdmin && (
          <div className="flex gap-1">
            <Link
              to={`/categories/${category.id}/edit`}
              className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-accent hover:text-foreground active:bg-accent active:text-foreground"
              aria-label={`Edit ${category.name}`}
            >
              <Pencil className="h-4 w-4" />
            </Link>
            <button
              onClick={() => setShowConfirm(true)}
              className="cursor-pointer rounded-lg p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive active:bg-destructive/10 active:text-destructive"
              aria-label={`Hapus ${category.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        )}
      </li>

      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        onConfirm={() => onDelete(category.id)}
        title={`Hapus ${category.name}?`}
        description="Kategori yang masih dipakai transaksi tidak bisa dihapus."
        isPending={isDeleting}
      />
    </>
  );
}

function CategoryListSkeleton() {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 rounded-lg px-3 py-3">
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
        </div>
      ))}
    </div>
  );
}

import { useNavigate, useParams } from "react-router";
import { Header } from "~/components/layout/header";
import { CategoryForm } from "~/modules/categories/components";
import { useCategory, useUpdateCategory } from "~/modules/categories/hooks";
import type { CreateCategoryInput } from "~/modules/categories/types";

export default function CategoryEditPage() {
  const { id } = useParams<"id">();
  const navigate = useNavigate();
  const { data: category, isLoading } = useCategory(id!);
  const { mutate, isPending } = useUpdateCategory();

  function handleSubmit(data: CreateCategoryInput) {
    mutate(
      { id: id!, data: { name: data.name, icon: data.icon } },
      { onSuccess: () => navigate("/categories") },
    );
  }

  return (
    <section>
      <Header title="Edit Kategori" backHref="/categories" />
      <main className="p-4 pb-24 md:pb-4">
        {isLoading ? (
          <div className="grid w-full gap-4 md:grid-cols-2">
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 animate-pulse rounded-lg bg-muted" />
            <div className="h-24 animate-pulse rounded-lg bg-muted md:col-span-2" />
          </div>
        ) : category ? (
          <CategoryForm
            category={category}
            onSubmit={handleSubmit}
            onCancel={() => navigate("/categories")}
            isPending={isPending}
          />
        ) : (
          <p className="text-muted-foreground">Kategori tidak ditemukan</p>
        )}
      </main>
    </section>
  );
}

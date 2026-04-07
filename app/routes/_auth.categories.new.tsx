import { useNavigate, useSearchParams } from "react-router";
import { Header } from "~/components/layout/header";
import { CategoryForm } from "~/modules/categories/components";
import { useCreateCategory } from "~/modules/categories/hooks";
import type { CreateCategoryInput, CategoryType } from "~/modules/categories/types";

export default function CategoryNewPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const defaultType = (searchParams.get("type") as CategoryType) ?? undefined;
  const { mutate, isPending } = useCreateCategory();

  function handleSubmit(data: CreateCategoryInput) {
    mutate(data, {
      onSuccess: () => navigate("/categories"),
    });
  }

  return (
    <section>
      <Header title="Tambah Kategori" backHref="/categories" />
      <main className="mx-auto max-w-lg p-4 pb-20 md:pb-4">
        <CategoryForm
          defaultType={defaultType}
          onSubmit={handleSubmit}
          isPending={isPending}
        />
      </main>
    </section>
  );
}

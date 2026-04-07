import { useCategories } from "~/modules/categories/hooks";
import type { CategoryType } from "~/modules/categories/types";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  type?: CategoryType;
  id?: string;
  placeholder?: string;
}

export function CategorySelect({
  value,
  onChange,
  type,
  id,
  placeholder = "Pilih kategori",
}: CategorySelectProps) {
  const { data: categories, isLoading } = useCategories(type);

  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
      disabled={isLoading}
    >
      <option value="">{isLoading ? "Memuat..." : placeholder}</option>
      {categories?.map((cat) => (
        <option key={cat.id} value={cat.id}>
          {cat.icon} {cat.name}
        </option>
      ))}
    </select>
  );
}

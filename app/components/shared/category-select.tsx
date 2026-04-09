import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import { useCategories } from "~/modules/categories/hooks";
import type { CategoryType } from "~/modules/categories/types";

interface CategorySelectProps {
  value: string;
  onChange: (value: string) => void;
  type?: CategoryType;
  placeholder?: string;
  triggerClassName?: string;
}

export function CategorySelect({
  value,
  onChange,
  type,
  placeholder = "Pilih kategori",
  triggerClassName,
}: CategorySelectProps) {
  const { data: categories, isLoading } = useCategories(type);

  const isEmpty = !isLoading && (!categories || categories.length === 0);
  const selectedCategory = categories?.find((c) => c.id === value);

  return (
    <Select value={value} onValueChange={(v) => onChange(v ?? "")} disabled={isLoading || isEmpty}>
      <SelectTrigger className={cn("w-full", triggerClassName)}>
        <SelectValue
          placeholder={
            isLoading
              ? "Memuat..."
              : isEmpty
                ? "Belum ada kategori"
                : placeholder
          }
        >
          {selectedCategory ? (
            <span className="flex items-center gap-2">
              <span role="img" aria-label={selectedCategory.name}>
                {selectedCategory.icon}
              </span>
              {selectedCategory.name}
            </span>
          ) : undefined}
        </SelectValue>
      </SelectTrigger>
      <SelectContent>
        {isEmpty ? (
          <div className="px-3 py-6 text-center text-sm text-muted-foreground">
            Belum ada kategori
          </div>
        ) : (
          categories?.map((cat) => (
            <SelectItem key={cat.id} value={cat.id}>
              <span className="flex items-center gap-2">
                <span role="img" aria-label={cat.name}>
                  {cat.icon}
                </span>
                {cat.name}
              </span>
            </SelectItem>
          ))
        )}
      </SelectContent>
    </Select>
  );
}

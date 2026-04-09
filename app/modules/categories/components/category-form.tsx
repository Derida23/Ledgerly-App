import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "~/components/ui/input";
import { Button } from "~/components/ui/button";
import { cn } from "~/lib/utils";
import {
  createCategorySchema,
  type CreateCategoryInput,
  type CategoryResponse,
  type CategoryType,
} from "~/modules/categories/types";

interface CategoryFormProps {
  category?: CategoryResponse;
  defaultType?: CategoryType;
  onSubmit: (data: CreateCategoryInput) => void;
  onCancel?: () => void;
  isPending: boolean;
}

const EMOJI_SUGGESTIONS = [
  "🍔", "🚗", "🛍", "💡", "🎮", "💊", "📚", "👨‍👩‍👧", "🏦", "📦",
  "💰", "🎁", "💸", "🏠", "✈️", "🎬", "⚽", "🐾", "💻", "☕",
];

export function CategoryForm({
  category,
  defaultType,
  onSubmit,
  onCancel,
  isPending,
}: CategoryFormProps) {
  const form = useForm<CreateCategoryInput>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: {
      name: category?.name ?? "",
      icon: category?.icon ?? "",
      type: category?.type ?? defaultType ?? "EXPENSE",
    },
    mode: "onChange",
  });

  const selectedIcon = form.watch("icon");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="grid w-full gap-4 md:grid-cols-2">
      <fieldset className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          Nama Kategori
        </label>
        <Input
          {...form.register("name")}
          placeholder="Makanan & Minuman"
        />
        {form.formState.errors.name && (
          <p className="text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </fieldset>

      {!category && (
        <fieldset className="space-y-2">
          <label className="text-sm font-medium text-foreground">Tipe</label>
          <div className="grid grid-cols-2 gap-2">
            {(["EXPENSE", "INCOME"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  form.setValue("type", type, { shouldValidate: true })
                }
                className={cn(
                  "h-10 cursor-pointer rounded-lg border text-sm font-medium transition-colors",
                  form.watch("type") === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-input text-muted-foreground hover:bg-accent",
                )}
              >
                {type === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
              </button>
            ))}
          </div>
          {form.formState.errors.type && (
            <p className="text-sm text-destructive">
              {form.formState.errors.type.message}
            </p>
          )}
        </fieldset>
      )}

      <fieldset className="space-y-2 md:col-span-2">
        <label className="text-sm font-medium text-foreground">
          Icon (Emoji)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">
            {selectedIcon || "?"}
          </span>
          <Input
            {...form.register("icon")}
            placeholder="Pilih atau ketik emoji..."
            className="pl-10"
          />
        </div>
        <div className="flex flex-wrap gap-1.5">
          {EMOJI_SUGGESTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() =>
                form.setValue("icon", emoji, { shouldValidate: true })
              }
              className={cn(
                "flex h-9 w-9 cursor-pointer items-center justify-center rounded-lg border text-lg transition-colors active:bg-accent",
                selectedIcon === emoji
                  ? "border-primary bg-primary/10"
                  : "border-input",
              )}
            >
              {emoji}
            </button>
          ))}
        </div>
        {form.formState.errors.icon && (
          <p className="text-sm text-destructive">
            {form.formState.errors.icon.message}
          </p>
        )}
      </fieldset>

      <div className="md:col-span-2 flex flex-col-reverse gap-3 md:flex-row md:justify-end">
        {onCancel && (
          <Button type="button" variant="outline" className="w-full md:w-auto md:min-w-32" onClick={onCancel}>
            Batal
          </Button>
        )}
        <Button
          type="submit"
          className="w-full md:w-auto md:min-w-48"
          disabled={isPending || !form.formState.isValid}
        >
          {isPending
            ? "Menyimpan..."
            : category
              ? "Simpan Perubahan"
              : "Tambah Kategori"}
        </Button>
      </div>
    </form>
  );
}

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <label
          htmlFor="name"
          className="mb-1.5 block text-sm font-medium text-foreground"
        >
          Nama Kategori
        </label>
        <input
          id="name"
          {...form.register("name")}
          placeholder="Makanan & Minuman"
          className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        />
        {form.formState.errors.name && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-foreground">
          Icon (Emoji)
        </label>
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg border border-input bg-background text-2xl">
            {selectedIcon || "?"}
          </div>
          <input
            {...form.register("icon")}
            placeholder="Ketik emoji..."
            className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {EMOJI_SUGGESTIONS.map((emoji) => (
            <button
              key={emoji}
              type="button"
              onClick={() =>
                form.setValue("icon", emoji, { shouldValidate: true })
              }
              className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-lg transition-colors hover:bg-accent"
            >
              {emoji}
            </button>
          ))}
        </div>
        {form.formState.errors.icon && (
          <p className="mt-1 text-sm text-destructive">
            {form.formState.errors.icon.message}
          </p>
        )}
      </div>

      {!category && (
        <div>
          <label className="mb-1.5 block text-sm font-medium text-foreground">
            Tipe
          </label>
          <div className="flex gap-2">
            {(["EXPENSE", "INCOME"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() =>
                  form.setValue("type", type, { shouldValidate: true })
                }
                className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition-colors ${
                  form.watch("type") === type
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:bg-accent"
                }`}
              >
                {type === "EXPENSE" ? "Pengeluaran" : "Pemasukan"}
              </button>
            ))}
          </div>
          {form.formState.errors.type && (
            <p className="mt-1 text-sm text-destructive">
              {form.formState.errors.type.message}
            </p>
          )}
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !form.formState.isValid}
        className="w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-50"
      >
        {isPending
          ? "Menyimpan..."
          : category
            ? "Simpan Perubahan"
            : "Tambah Kategori"}
      </button>
    </form>
  );
}

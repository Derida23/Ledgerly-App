# React Hook Form + Zod — Patterns

## Setup

```bash
npm install react-hook-form zod @hookform/resolvers
```

---

## Basic Pattern

### Schema + Form

```tsx
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

// 1. Define schema
const walletSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  initialBalance: z.number().min(0, "Saldo tidak boleh negatif").default(0),
});

// 2. Infer type from schema
type WalletFormValues = z.infer<typeof walletSchema>;

// 3. Use in component
function WalletForm({ onSubmit }: { onSubmit: (data: WalletFormValues) => void }) {
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: {
      name: "",
      initialBalance: 0,
    },
    mode: "onChange", // Validate on change
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <div>
        <label htmlFor="name">Nama Wallet</label>
        <input id="name" {...form.register("name")} />
        {form.formState.errors.name && (
          <p className="text-destructive text-sm">
            {form.formState.errors.name.message}
          </p>
        )}
      </div>

      <div>
        <label htmlFor="initialBalance">Saldo Awal</label>
        <input
          id="initialBalance"
          type="number"
          {...form.register("initialBalance", { valueAsNumber: true })}
        />
        {form.formState.errors.initialBalance && (
          <p className="text-destructive text-sm">
            {form.formState.errors.initialBalance.message}
          </p>
        )}
      </div>

      <button type="submit" disabled={form.formState.isSubmitting}>
        Simpan
      </button>
    </form>
  );
}
```

---

## Zod Schema Patterns

### Enums with `as const`

```ts
const TransactionType = {
  INCOME: "INCOME",
  EXPENSE: "EXPENSE",
} as const;

const transactionTypeSchema = z.enum(["INCOME", "EXPENSE"]);

// Or from const object values
const transactionTypeSchema = z.nativeEnum(TransactionType);
```

### Optional Fields

```ts
const schema = z.object({
  note: z.string().optional(),                    // string | undefined
  note: z.string().nullable(),                    // string | null
  note: z.string().nullish(),                     // string | null | undefined
  note: z.string().optional().default(""),        // string (defaults to "")
  adminFee: z.number().optional().default(0),     // number (defaults to 0)
});
```

### Date Handling

```ts
const schema = z.object({
  // Accept string, transform to Date
  date: z.string().transform((val) => new Date(val)),

  // Accept string, validate as ISO date
  date: z.string().date("Format tanggal tidak valid"), // YYYY-MM-DD

  // Coerce string to Date
  date: z.coerce.date(),

  // Optional date with default today
  date: z.string().date().optional().default(() =>
    new Date().toISOString().split("T")[0]
  ),
});
```

### Number from String Input

```ts
const schema = z.object({
  // HTML inputs return strings — coerce to number
  amount: z.coerce
    .number({ invalid_type_error: "Harus berupa angka" })
    .positive("Jumlah harus lebih dari 0"),

  // Or transform manually
  amount: z
    .string()
    .transform((val) => Number(val.replace(/\./g, ""))) // Remove thousand separator
    .pipe(z.number().positive("Jumlah harus lebih dari 0")),
});
```

---

## Conditional Validation

### Transaction Form — Method Required for EXPENSE

```ts
const PaymentMethod = z.enum(["CASH", "QRIS", "TRANSFER", "DEBIT"]);

const transactionSchema = z
  .object({
    amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
    type: z.enum(["INCOME", "EXPENSE"]),
    walletId: z.string().min(1, "Wallet wajib dipilih"),
    categoryId: z.string().min(1, "Kategori wajib dipilih"),
    method: PaymentMethod.optional(),
    date: z.string().date().optional(),
    note: z.string().optional(),
  })
  .refine(
    (data) => {
      // Method wajib kalau type = EXPENSE
      if (data.type === "EXPENSE") return !!data.method;
      return true;
    },
    {
      message: "Metode pembayaran wajib untuk pengeluaran",
      path: ["method"], // Error appears on method field
    }
  );

type TransactionFormValues = z.infer<typeof transactionSchema>;
```

### Recurring Form — Conditional Fields by Type

```ts
const recurringSchema = z
  .object({
    name: z.string().min(1, "Nama wajib diisi"),
    type: z.enum(["EXPENSE", "TRANSFER"]),
    amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
    dayOfMonth: z.coerce.number().min(1).max(31, "Tanggal 1-31"),
    walletId: z.string().min(1, "Wallet wajib dipilih"),
    targetWalletId: z.string().optional(),
    categoryId: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.type === "TRANSFER") return !!data.targetWalletId;
      return true;
    },
    {
      message: "Wallet tujuan wajib untuk transfer",
      path: ["targetWalletId"],
    }
  )
  .refine(
    (data) => {
      if (data.type === "EXPENSE") return !!data.categoryId;
      return true;
    },
    {
      message: "Kategori wajib untuk pengeluaran",
      path: ["categoryId"],
    }
  );
```

### Transfer Form — Source ≠ Target

```ts
const transferSchema = z
  .object({
    amount: z.coerce.number().positive("Jumlah harus lebih dari 0"),
    sourceWalletId: z.string().min(1, "Wallet sumber wajib dipilih"),
    targetWalletId: z.string().min(1, "Wallet tujuan wajib dipilih"),
    adminFee: z.coerce.number().min(0).default(0),
    date: z.string().date().optional(),
    note: z.string().optional(),
  })
  .refine((data) => data.sourceWalletId !== data.targetWalletId, {
    message: "Wallet sumber dan tujuan tidak boleh sama",
    path: ["targetWalletId"],
  });
```

### Budget Form — Multi-Select Categories

```ts
const budgetSchema = z.object({
  name: z.string().min(1, "Nama wajib diisi"),
  limit: z.coerce.number().positive("Limit harus lebih dari 0"),
  categoryIds: z
    .array(z.string())
    .min(1, "Pilih minimal 1 kategori"),
});
```

---

## Conditional UI Based on Form State

### Show/Hide Fields with `watch`

```tsx
function TransactionForm({ type }: { type: "INCOME" | "EXPENSE" }) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: { type },
    mode: "onChange",
  });

  // Method field only for EXPENSE
  const showMethod = type === "EXPENSE";

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Always shown */}
      <AmountField control={form.control} />
      <WalletSelect control={form.control} />
      <CategorySelect control={form.control} type={type} />

      {/* Conditional */}
      {showMethod && <MethodSelect control={form.control} />}

      <DateField control={form.control} />
      <NoteField control={form.control} />
    </form>
  );
}
```

### Dynamic Fields with `watch` in Recurring

```tsx
function RecurringForm() {
  const form = useForm<RecurringFormValues>({
    resolver: zodResolver(recurringSchema),
    mode: "onChange",
  });

  const recurringType = form.watch("type");

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <NameField control={form.control} />
      <TypeToggle control={form.control} /> {/* EXPENSE | TRANSFER */}
      <AmountField control={form.control} />
      <DayOfMonthField control={form.control} />
      <WalletSelect control={form.control} label="Wallet Sumber" />

      {recurringType === "TRANSFER" && (
        <WalletSelect
          control={form.control}
          name="targetWalletId"
          label="Wallet Tujuan"
        />
      )}

      {recurringType === "EXPENSE" && (
        <CategorySelect control={form.control} type="EXPENSE" />
      )}
    </form>
  );
}
```

---

## shadcn/ui Form Integration

### Using `<Form>` Component

```tsx
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

function WalletForm({ onSubmit }: { onSubmit: (data: WalletFormValues) => void }) {
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: { name: "", initialBalance: 0 },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nama Wallet</FormLabel>
              <FormControl>
                <Input placeholder="Bank Mandiri" {...field} />
              </FormControl>
              <FormMessage /> {/* Auto shows error */}
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="initialBalance"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Saldo Awal</FormLabel>
              <FormControl>
                <CurrencyInput
                  value={field.value}
                  onValueChange={field.onChange}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <button type="submit" disabled={form.formState.isSubmitting}>
          {form.formState.isSubmitting ? "Menyimpan..." : "Simpan"}
        </button>
      </form>
    </Form>
  );
}
```

### Select Field with shadcn

```tsx
<FormField
  control={form.control}
  name="walletId"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Wallet</FormLabel>
      <Select onValueChange={field.onChange} defaultValue={field.value}>
        <FormControl>
          <SelectTrigger>
            <SelectValue placeholder="Pilih wallet" />
          </SelectTrigger>
        </FormControl>
        <SelectContent>
          {wallets?.map((wallet) => (
            <SelectItem key={wallet.id} value={wallet.id}>
              {wallet.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <FormMessage />
    </FormItem>
  )}
/>
```

### Multi-Select for Budget Categories

```tsx
<FormField
  control={form.control}
  name="categoryIds"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Kategori</FormLabel>
      <div className="flex flex-wrap gap-2">
        {categories?.map((category) => {
          const isSelected = field.value.includes(category.id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => {
                const updated = isSelected
                  ? field.value.filter((id: string) => id !== category.id)
                  : [...field.value, category.id];
                field.onChange(updated);
              }}
              className={cn(
                "rounded-full px-3 py-1 text-sm border",
                isSelected
                  ? "bg-primary text-primary-foreground"
                  : "bg-background"
              )}
            >
              {category.icon} {category.name}
            </button>
          );
        })}
      </div>
      <FormMessage />
    </FormItem>
  )}
/>
```

---

## Edit Form — Pre-fill with Existing Data

```tsx
function EditTransactionForm({
  transaction,
  onSubmit,
}: {
  transaction: TransactionResponse;
  onSubmit: (data: UpdateTransactionInput) => void;
}) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(updateTransactionSchema),
    defaultValues: {
      amount: transaction.amount,
      categoryId: transaction.category?.id ?? "",
      method: transaction.method ?? undefined,
      date: transaction.date.split("T")[0], // ISO to YYYY-MM-DD
      note: transaction.note ?? "",
    },
    mode: "onChange",
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* ... fields ... */}
      </form>
    </Form>
  );
}
```

### Pre-fill from Recurring (Bayar)

```tsx
function NewTransactionFromRecurring({
  recurring,
}: {
  recurring: RecurringResponse;
}) {
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      amount: recurring.amount,
      type: recurring.type === "EXPENSE" ? "EXPENSE" : undefined,
      walletId: recurring.wallet.id,
      categoryId: recurring.category?.id ?? "",
      date: new Date().toISOString().split("T")[0], // Today
      note: recurring.name,
    },
    mode: "onChange",
  });

  // All fields remain editable
  return <TransactionFormFields form={form} />;
}
```

---

## Custom Currency Input Integration

```tsx
// components/shared/currency-input.tsx
import { forwardRef, useState } from "react";

interface CurrencyInputProps {
  value: number;
  onValueChange: (value: number) => void;
  placeholder?: string;
}

export const CurrencyInput = forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ value, onValueChange, placeholder = "Rp 0" }, ref) => {
    const [display, setDisplay] = useState(
      value ? formatIDR(value) : ""
    );

    function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
      const raw = e.target.value.replace(/\D/g, ""); // Strip non-digits
      const num = Number(raw);

      setDisplay(raw ? formatIDR(num) : "");
      onValueChange(num); // Send raw number to form
    }

    return (
      <input
        ref={ref}
        type="text"
        inputMode="numeric"
        value={display}
        onChange={handleChange}
        placeholder={placeholder}
        className="..."
      />
    );
  }
);

function formatIDR(value: number): string {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}
```

---

## Form Validation Mode

```ts
const form = useForm({
  resolver: zodResolver(schema),
  mode: "onChange",     // Validate on every change (real-time)
  // mode: "onBlur",   // Validate when field loses focus
  // mode: "onSubmit", // Validate only on submit
  // mode: "onTouched",// Validate on blur, then on change after first blur
  // mode: "all",      // Validate on blur + change
});
```

**Recommendation:** `onChange` for this project (per CLAUDE.md decision).

---

## Reset Form After Submit

```tsx
function WalletForm() {
  const form = useForm<WalletFormValues>({
    resolver: zodResolver(walletSchema),
    defaultValues: { name: "", initialBalance: 0 },
  });

  const { mutate, isPending } = useCreateWallet();

  function onSubmit(data: WalletFormValues) {
    mutate(data, {
      onSuccess: () => {
        form.reset(); // Reset to defaultValues
        toast.success("Wallet berhasil ditambahkan");
      },
    });
  }
}
```

---

## Quick Reference

| RHF API              | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `useForm()`          | Initialize form                            |
| `register(name)`     | Connect input to form (uncontrolled)       |
| `control`            | For controlled components (Select, etc.)   |
| `handleSubmit(fn)`   | Validate + call fn with typed data         |
| `watch(name)`        | Subscribe to field value changes           |
| `setValue(name, val)` | Programmatically set field                |
| `reset()`            | Reset form to defaults                     |
| `formState.errors`   | Current validation errors                  |
| `formState.isSubmitting` | Submit in progress                     |
| `formState.isDirty`  | Any field changed from default             |
| `formState.isValid`  | All fields pass validation                 |

| Zod API              | Purpose                                    |
| -------------------- | ------------------------------------------ |
| `z.string()`         | String schema                              |
| `z.number()`         | Number schema                              |
| `z.coerce.number()`  | String input → number                      |
| `z.enum([])`         | Enum from array                            |
| `z.array()`          | Array schema                               |
| `.min() / .max()`    | Min/max length or value                    |
| `.optional()`        | Make optional                              |
| `.default(val)`      | Default value                              |
| `.refine(fn, msg)`   | Custom validation (cross-field)            |
| `.transform(fn)`     | Transform value after validation           |
| `.pipe(schema)`      | Chain schemas (transform → validate)       |
| `z.infer<typeof s>`  | Infer TypeScript type from schema          |

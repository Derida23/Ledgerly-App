interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  title: string;
  description?: string;
  confirmLabel?: string;
  isPending?: boolean;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmLabel = "Hapus",
  isPending = false,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-title"
    >
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-md">
        <h2 id="confirm-title" className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        {description && (
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        )}
        <div className="mt-4 flex gap-3">
          <button
            onClick={() => onOpenChange(false)}
            disabled={isPending}
            className="flex-1 rounded-lg border border-border px-4 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-accent disabled:opacity-50"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            disabled={isPending}
            className="flex-1 rounded-lg bg-destructive px-4 py-2.5 text-sm font-medium text-destructive-foreground transition-colors hover:bg-destructive/90 disabled:opacity-50"
          >
            {isPending ? "Menghapus..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

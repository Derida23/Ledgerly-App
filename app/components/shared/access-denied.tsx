import { ShieldX } from "lucide-react";
import { Button } from "~/components/ui/button";

interface AccessDeniedProps {
  onBack?: () => void;
}

export function AccessDenied({ onBack }: AccessDeniedProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-6 text-center">
      <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-destructive/10">
        <ShieldX className="h-7 w-7 text-destructive" aria-hidden="true" />
      </div>
      <h2 className="text-lg font-semibold text-foreground">
        Akses Ditolak
      </h2>
      <p className="mt-1.5 max-w-xs text-sm text-muted-foreground">
        Kamu tidak memiliki izin untuk mengakses halaman ini. Hubungi admin jika ini adalah kesalahan.
      </p>
      {onBack ? (
        <Button variant="outline" className="mt-5" onClick={onBack}>
          Kembali
        </Button>
      ) : (
        <a
          href="/dashboard"
          className="mt-5 inline-flex h-10 cursor-pointer items-center justify-center rounded-lg border border-input bg-background px-4 text-sm font-medium transition-colors hover:bg-muted"
        >
          Ke Dashboard
        </a>
      )}
    </div>
  );
}

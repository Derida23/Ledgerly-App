import { useOnlineStatus } from "~/lib/use-online-status";

export function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div
      className="fixed top-0 inset-x-0 z-50 bg-destructive py-1.5 text-center text-xs font-medium text-destructive-foreground"
      role="alert"
    >
      Tidak ada koneksi internet
    </div>
  );
}

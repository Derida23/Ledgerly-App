import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function handleInstall() {
    if (!deferredPrompt) return;
    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") {
      setDeferredPrompt(null);
    }
    setDismissed(true);
  }

  if (!deferredPrompt || dismissed) return null;

  return (
    <div className="fixed bottom-16 inset-x-4 z-40 flex items-center justify-between rounded-xl bg-primary p-4 text-primary-foreground shadow-md md:bottom-4 md:left-auto md:right-4 md:max-w-sm">
      <div>
        <p className="text-sm font-medium">Install Ledgerly</p>
        <p className="text-xs opacity-80">Akses lebih cepat dari home screen</p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={handleInstall}
          className="rounded-lg bg-primary-foreground px-3 py-1.5 text-xs font-medium text-primary"
        >
          Install
        </button>
        <button
          onClick={() => setDismissed(true)}
          className="rounded-lg p-1 opacity-70 hover:opacity-100"
          aria-label="Tutup"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

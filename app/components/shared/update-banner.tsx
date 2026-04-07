import { useEffect, useState } from "react";

export function UpdateBanner() {
  const [needsUpdate, setNeedsUpdate] = useState(false);

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.ready.then((registration) => {
      registration.addEventListener("updatefound", () => {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", () => {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            setNeedsUpdate(true);
          }
        });
      });
    });
  }, []);

  if (!needsUpdate) return null;

  return (
    <div className="fixed top-0 inset-x-0 z-50 flex items-center justify-center gap-3 bg-primary py-2 text-sm text-primary-foreground">
      <span>Versi baru tersedia</span>
      <button
        onClick={() => window.location.reload()}
        className="rounded-lg bg-primary-foreground px-3 py-1 text-xs font-medium text-primary"
      >
        Update
      </button>
    </div>
  );
}

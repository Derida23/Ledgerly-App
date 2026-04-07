import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { setAuthErrorHandler } from "~/lib/api-client";

export function SessionExpiredModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthErrorHandler(() => setIsOpen(true));
    return () => setAuthErrorHandler(() => {});
  }, []);

  function handleRedirect() {
    setIsOpen(false);
    navigate("/");
  }

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/50 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-expired-title"
    >
      <div className="w-full max-w-sm rounded-xl bg-card p-6 shadow-md">
        <h2
          id="session-expired-title"
          className="text-lg font-semibold text-foreground"
        >
          Session Habis
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Silakan login ulang untuk melanjutkan.
        </p>
        <button
          onClick={handleRedirect}
          className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          Login Ulang
        </button>
      </div>
    </div>
  );
}

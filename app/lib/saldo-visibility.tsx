import { createContext, useCallback, useContext, useState } from "react";

interface SaldoVisibilityContextValue {
  isVisible: boolean;
  toggle: () => void;
}

const SaldoVisibilityContext =
  createContext<SaldoVisibilityContextValue | null>(null);

export function SaldoVisibilityProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isVisible, setIsVisible] = useState(() => {
    if (typeof window === "undefined") return true;
    return localStorage.getItem("saldo-visible") !== "false";
  });

  const toggle = useCallback(() => {
    setIsVisible((prev) => {
      const next = !prev;
      localStorage.setItem("saldo-visible", String(next));
      return next;
    });
  }, []);

  return (
    <SaldoVisibilityContext.Provider value={{ isVisible, toggle }}>
      {children}
    </SaldoVisibilityContext.Provider>
  );
}

export function useSaldoVisibility() {
  const context = useContext(SaldoVisibilityContext);
  if (!context) {
    throw new Error(
      "useSaldoVisibility must be used inside SaldoVisibilityProvider",
    );
  }
  return context;
}

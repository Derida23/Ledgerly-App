import { useSyncExternalStore } from "react";

export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (callback) => {
      const media = window.matchMedia(query);
      media.addEventListener("change", callback);
      return () => media.removeEventListener("change", callback);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}

export function useIsMobile(): boolean {
  return !useMediaQuery("(min-width: 768px)");
}

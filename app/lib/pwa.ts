export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;
  if (import.meta.env.DEV) return;

  try {
    await navigator.serviceWorker.register("/sw.js", { scope: "/" });
  } catch (error) {
    console.error("SW registration failed:", error);
  }
}

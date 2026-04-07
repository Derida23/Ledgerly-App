# Progressive Web App (PWA) — Complete Reference

## Overview

A PWA makes a web app installable, offline-capable, and able to send push notifications. It consists of three core pieces:

1. **Web App Manifest** — metadata for installation (icon, name, theme)
2. **Service Worker** — background script for caching, offline, push
3. **HTTPS** — required for service workers and push notifications

---

## Level 1: Installable

### Web App Manifest

```json
// public/manifest.json
{
  "name": "Ledgerly — Expense Tracker",
  "short_name": "Ledgerly",
  "description": "Personal expense tracker",
  "start_url": "/dashboard",
  "display": "standalone",
  "orientation": "portrait",
  "background_color": "#1a1a1a",
  "theme_color": "#4a7c59",
  "scope": "/",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icons/icon-maskable-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "maskable"
    },
    {
      "src": "/icons/icon-maskable-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "maskable"
    }
  ],
  "screenshots": [
    {
      "src": "/screenshots/mobile.png",
      "sizes": "390x844",
      "type": "image/png",
      "form_factor": "narrow"
    }
  ],
  "categories": ["finance", "utilities"]
}
```

### Manifest Properties

| Property           | Purpose                                          |
| ------------------ | ------------------------------------------------ |
| `name`             | Full app name (install prompt, splash screen)    |
| `short_name`       | Shown on home screen (max ~12 chars)             |
| `start_url`        | URL when app launches                            |
| `display`          | `standalone` = no browser chrome                 |
| `orientation`      | `portrait` / `landscape` / `any`                 |
| `background_color` | Splash screen background                         |
| `theme_color`      | Status bar and title bar color                   |
| `scope`            | URL scope of the PWA                             |
| `icons`            | App icons (192px + 512px minimum)                |
| `purpose: maskable`| Adaptive icon for Android (safe zone cropping)   |

### Link Manifest in HTML

```html
<!-- index.html -->
<head>
  <link rel="manifest" href="/manifest.json" />
  <meta name="theme-color" content="#4a7c59" />
  <meta name="apple-mobile-web-app-capable" content="yes" />
  <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
  <link rel="apple-touch-icon" href="/icons/icon-192.png" />
</head>
```

### Minimal Service Worker (Just for Installability)

```ts
// public/sw.js
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});
```

### Register Service Worker

```ts
// src/lib/register-sw.ts
export async function registerServiceWorker() {
  if (!("serviceWorker" in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.register("/sw.js", {
      scope: "/",
    });
    console.log("SW registered:", registration.scope);
  } catch (error) {
    console.error("SW registration failed:", error);
  }
}
```

```tsx
// src/root.tsx
import { useEffect } from "react";
import { registerServiceWorker } from "@/lib/register-sw";

function App() {
  useEffect(() => {
    registerServiceWorker();
  }, []);

  return <RouterProvider />;
}
```

### Install Prompt (Custom)

```tsx
import { useEffect, useState } from "react";

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function useInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] =
    useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    function handler(e: Event) {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    }

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  async function install() {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === "accepted") {
      setIsInstallable(false);
    }
    setDeferredPrompt(null);
  }

  return { isInstallable, install };
}

// Usage
function InstallBanner() {
  const { isInstallable, install } = useInstallPrompt();

  if (!isInstallable) return null;

  return (
    <div className="fixed bottom-16 inset-x-4 bg-primary text-white p-4 rounded-lg">
      <p>Install Ledgerly untuk akses lebih cepat</p>
      <button onClick={install}>Install</button>
    </div>
  );
}
```

---

## Level 2: Offline Capable

### Caching Strategies

| Strategy              | Use For                          | How It Works                              |
| --------------------- | -------------------------------- | ----------------------------------------- |
| **Cache First**       | Static assets (JS, CSS, fonts)   | Check cache → return if found → else fetch |
| **Network First**     | API data (transactions, wallets) | Try network → fallback to cache            |
| **Stale While Revalidate** | Semi-static (categories)    | Return cache immediately → update in background |
| **Network Only**      | Mutations (POST, PUT, DELETE)    | Always hit network                         |
| **Cache Only**        | App shell after install          | Only serve from cache                      |

### Service Worker with Caching

```ts
// public/sw.js
const CACHE_NAME = "ledgerly-v1";
const STATIC_ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
];

// Install — pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((names) => {
      return Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch — routing strategies
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests (mutations)
  if (request.method !== "GET") return;

  // API requests — Network First
  if (url.pathname.startsWith("/api/")) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets — Cache First
  if (isStaticAsset(url.pathname)) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // HTML navigation — Network First (SPA fallback to /index.html)
  if (request.mode === "navigate") {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Default — Network First
  event.respondWith(networkFirst(request));
});

// Strategy: Cache First
async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;

  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(CACHE_NAME);
    cache.put(request, response.clone());
  }
  return response;
}

// Strategy: Network First
async function networkFirst(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response("Offline", { status: 503 });
  }
}

// Strategy: Network First with SPA fallback
async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    // SPA: fallback to cached index.html for any navigation
    const cached = await caches.match("/index.html");
    return cached ?? new Response("Offline", { status: 503 });
  }
}

function isStaticAsset(pathname) {
  return /\.(js|css|png|jpg|jpeg|svg|woff2?|ttf|ico)$/.test(pathname);
}
```

### Offline Detection in React

```tsx
import { useSyncExternalStore } from "react";

function subscribe(callback: () => void) {
  window.addEventListener("online", callback);
  window.addEventListener("offline", callback);
  return () => {
    window.removeEventListener("online", callback);
    window.removeEventListener("offline", callback);
  };
}

function getSnapshot() {
  return navigator.onLine;
}

export function useOnlineStatus(): boolean {
  return useSyncExternalStore(subscribe, getSnapshot);
}

// Usage
function OfflineBanner() {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="bg-destructive text-white text-center py-2 text-sm">
      Tidak ada koneksi internet
    </div>
  );
}
```

### TanStack Query Offline Support

```tsx
import { QueryClient } from "@tanstack/react-query";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Use cached data when offline
      networkMode: "offlineFirst",
      // Don't refetch when offline
      retry: (failureCount, error) => {
        if (!navigator.onLine) return false;
        return failureCount < 3;
      },
    },
    mutations: {
      // Queue mutations when offline
      networkMode: "offlineFirst",
    },
  },
});
```

### Offline Mutation Queue (Background Sync)

```ts
// public/sw.js — Background Sync
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-mutations") {
    event.waitUntil(processMutationQueue());
  }
});

async function processMutationQueue() {
  const cache = await caches.open("mutation-queue");
  const requests = await cache.keys();

  for (const request of requests) {
    try {
      const cachedResponse = await cache.match(request);
      const body = await cachedResponse.text();

      await fetch(request, {
        method: request.method ?? "POST",
        headers: request.headers,
        body,
        credentials: "include",
      });

      await cache.delete(request);
    } catch {
      // Will retry on next sync
      break;
    }
  }
}
```

```ts
// src/lib/api-client.ts — Queue mutation when offline
export async function apiMutate<T>(
  endpoint: string,
  options: RequestInit
): Promise<T> {
  if (!navigator.onLine) {
    await queueMutation(endpoint, options);
    throw new OfflineError("Mutation queued for sync");
  }

  return apiClient<T>(endpoint, options);
}

async function queueMutation(endpoint: string, options: RequestInit) {
  const cache = await caches.open("mutation-queue");
  const request = new Request(`${import.meta.env.VITE_API_URL}${endpoint}`, {
    ...options,
    credentials: "include",
  });

  await cache.put(request, new Response(options.body));

  // Register for background sync
  const registration = await navigator.serviceWorker.ready;
  await registration.sync.register("sync-mutations");
}
```

---

## Level 3: Push Notifications

### Request Permission

```tsx
export async function requestNotificationPermission(): Promise<boolean> {
  if (!("Notification" in window)) return false;
  if (!("serviceWorker" in navigator)) return false;

  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;

  const permission = await Notification.requestPermission();
  return permission === "granted";
}
```

### Subscribe to Push

```tsx
// src/lib/push.ts
const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

export async function subscribeToPush(): Promise<PushSubscription | null> {
  const hasPermission = await requestNotificationPermission();
  if (!hasPermission) return null;

  const registration = await navigator.serviceWorker.ready;

  // Check existing subscription
  let subscription = await registration.pushManager.getSubscription();
  if (subscription) return subscription;

  // Create new subscription
  subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true, // Required — must show notification
    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
  });

  // Send subscription to backend
  await fetch(`${import.meta.env.VITE_API_URL}/api/push/subscribe`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(subscription.toJSON()),
  });

  return subscription;
}

export async function unsubscribeFromPush(): Promise<void> {
  const registration = await navigator.serviceWorker.ready;
  const subscription = await registration.pushManager.getSubscription();

  if (subscription) {
    await subscription.unsubscribe();

    // Notify backend
    await fetch(`${import.meta.env.VITE_API_URL}/api/push/unsubscribe`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint: subscription.endpoint }),
    });
  }
}

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  return Uint8Array.from(rawData, (char) => char.charCodeAt(0));
}
```

### Handle Push in Service Worker

```ts
// public/sw.js
self.addEventListener("push", (event) => {
  if (!event.data) return;

  const payload = event.data.json();

  // payload example:
  // { title: "Listrik", body: "Jatuh tempo hari ini — Rp 500.000", data: { url: "/recurrings" } }

  event.waitUntil(
    self.registration.showNotification(payload.title, {
      body: payload.body,
      icon: "/icons/icon-192.png",
      badge: "/icons/badge-72.png",
      data: payload.data,
      tag: payload.tag ?? "default", // Prevent duplicate notifications
      renotify: true,
      actions: [
        { action: "open", title: "Buka" },
        { action: "dismiss", title: "Nanti" },
      ],
    })
  );
});

// Handle notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();

  if (event.action === "dismiss") return;

  const url = event.notification.data?.url ?? "/dashboard";

  event.waitUntil(
    self.clients.matchAll({ type: "window" }).then((clients) => {
      // Focus existing window if open
      for (const client of clients) {
        if (client.url.includes(url) && "focus" in client) {
          return client.focus();
        }
      }
      // Open new window
      return self.clients.openWindow(url);
    })
  );
});
```

### Push Notification UI Component

```tsx
import { useState, useEffect } from "react";
import { subscribeToPush, unsubscribeFromPush } from "@/lib/push";

function NotificationSettings() {
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    async function check() {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        setIsSupported(false);
        return;
      }

      setIsSupported(true);

      const registration = await navigator.serviceWorker.ready;
      const subscription = await registration.pushManager.getSubscription();
      setIsSubscribed(!!subscription);
    }
    check();
  }, []);

  async function togglePush() {
    if (isSubscribed) {
      await unsubscribeFromPush();
      setIsSubscribed(false);
    } else {
      const subscription = await subscribeToPush();
      setIsSubscribed(!!subscription);
    }
  }

  if (!isSupported) return null;

  return (
    <div>
      <label>
        <span>Notifikasi Recurring</span>
        <Switch checked={isSubscribed} onCheckedChange={togglePush} />
      </label>
    </div>
  );
}
```

---

## Service Worker Updates

### Prompt User to Update

```tsx
import { useEffect, useState } from "react";

export function useServiceWorkerUpdate() {
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
            // New version available
            setNeedsUpdate(true);
          }
        });
      });
    });
  }, []);

  function update() {
    window.location.reload();
  }

  return { needsUpdate, update };
}

// Usage
function UpdateBanner() {
  const { needsUpdate, update } = useServiceWorkerUpdate();

  if (!needsUpdate) return null;

  return (
    <div className="bg-primary text-white p-3 text-center">
      <span>Versi baru tersedia</span>
      <button onClick={update} className="ml-2 underline">
        Update
      </button>
    </div>
  );
}
```

### Service Worker Lifecycle

```
Install → Activate → Fetch/Push/Sync

1. Install: Pre-cache static assets
2. Activate: Clean old caches, claim clients
3. Idle: Waiting for events
4. Fetch: Intercept network requests
5. Push: Receive push notifications
6. Sync: Process queued mutations
7. Update: New SW detected → install alongside old → activate after old is released
```

---

## Vite PWA Plugin (Alternative)

Instead of manual service worker, you can use `vite-plugin-pwa`:

```bash
npm install -D vite-plugin-pwa
```

```ts
// vite.config.ts
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  plugins: [
    reactRouter(),
    VitePWA({
      registerType: "prompt", // Show update prompt
      includeAssets: ["favicon.ico", "icons/*.png"],
      manifest: {
        name: "Ledgerly — Expense Tracker",
        short_name: "Ledgerly",
        // ... same as manifest.json
      },
      workbox: {
        // Auto-generate caching strategies
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/ledgerly-service\.vercel\.app\/api\/.*/,
            handler: "NetworkFirst",
            options: {
              cacheName: "api-cache",
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 1 day
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
          {
            urlPattern: /\.(js|css|png|jpg|svg|woff2?)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "static-cache",
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
        ],
      },
    }),
  ],
});
```

**Trade-off:**
- `vite-plugin-pwa` = less code, auto-generates SW with Workbox, easier to maintain
- Manual SW = full control, custom logic for mutation queue and push handling

**Recommendation:** Start with `vite-plugin-pwa` for Level 1 & 2, add custom push handler for Level 3.

---

## Testing PWA

### Lighthouse Audit

```bash
# Run Lighthouse PWA audit
npx lighthouse https://your-app.vercel.app --only-categories=pwa --output=json
```

### Checklist

| Requirement                         | How to Test                          |
| ----------------------------------- | ------------------------------------ |
| Manifest linked correctly           | DevTools → Application → Manifest    |
| Service Worker registered           | DevTools → Application → SW          |
| Works offline                       | DevTools → Network → Offline checkbox |
| Install prompt shows                | DevTools → Application → Manifest    |
| Push notifications work             | DevTools → Application → Push        |
| HTTPS enabled                       | Vercel handles this                  |
| Icons correct size (192 + 512)      | Manifest validator                   |
| Maskable icon provided              | maskable.app/editor                  |
| Theme color matches                 | Meta tag + manifest                  |
| Splash screen renders               | Install app → open                   |

---

## Quick Reference

| API                                    | Purpose                           |
| -------------------------------------- | --------------------------------- |
| `navigator.serviceWorker.register()`   | Register service worker           |
| `navigator.serviceWorker.ready`        | Promise: SW is active             |
| `self.skipWaiting()`                   | Activate new SW immediately       |
| `self.clients.claim()`                 | Take control of all tabs          |
| `caches.open(name)`                    | Open a cache store                |
| `cache.put(request, response)`         | Store in cache                    |
| `cache.match(request)`                 | Read from cache                   |
| `Notification.requestPermission()`     | Ask for notification permission   |
| `registration.pushManager.subscribe()` | Create push subscription          |
| `self.registration.showNotification()` | Show notification from SW         |
| `registration.sync.register(tag)`      | Register background sync          |

| Event (Service Worker)  | When                                       |
| ----------------------- | ------------------------------------------ |
| `install`               | SW first installed / new version            |
| `activate`              | SW takes control                            |
| `fetch`                 | Any network request from controlled page    |
| `push`                  | Push message received from server           |
| `sync`                  | Browser back online (background sync)       |
| `notificationclick`     | User clicks notification                    |

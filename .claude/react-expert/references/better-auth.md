# Better Auth — React Client Reference

## Overview

Better Auth is a framework-agnostic authentication library. The React client provides hooks and methods for session management, social OAuth, and role-based access control via httpOnly cookies.

---

## Installation

```bash
npm install better-auth
# React client is included in the main package
```

---

## Client Setup

### Create Auth Client

```ts
// lib/auth.ts (or modules/auth/api/index.ts)
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_API_URL, // Backend URL
  // Cookies are httpOnly — managed by the server
  // No token storage needed on the client
});

// Export individual methods for convenience
export const {
  signIn,
  signOut,
  useSession,
} = authClient;
```

### Fetch Configuration

Better Auth client automatically sends cookies. For cross-domain (frontend ≠ backend), ensure:

```ts
// All API calls must include credentials
fetch(`${API_URL}/api/endpoint`, {
  credentials: "include", // Send cookies cross-domain
  headers: {
    "Content-Type": "application/json",
  },
});
```

The `createAuthClient` handles this internally for auth endpoints.

---

## Authentication — Social OAuth

### Google Sign-In

```tsx
import { signIn } from "@/lib/auth";

function LoginPage() {
  async function handleGoogleLogin() {
    await signIn.social({
      provider: "google",
      callbackURL: "/dashboard", // Redirect after successful login
    });
    // Browser redirects to Google → callback → backend sets cookie → redirect
  }

  return (
    <button onClick={handleGoogleLogin}>
      Login dengan Google
    </button>
  );
}
```

### Sign-In Flow (Google OAuth)

```
1. User clicks "Login dengan Google"
2. signIn.social({ provider: "google" })
3. Client → POST /api/auth/sign-in/social
4. Server generates OAuth URL + PKCE (state, code_verifier)
5. Browser redirects to Google
6. User authenticates with Google
7. Google redirects back to server callback
8. Server verifies code + state
9. Server checks email whitelist
10. Server creates/updates session in database
11. Server sets httpOnly cookie (better-auth.session_token)
12. Server redirects to callbackURL (/dashboard)
```

### Sign-Out

```tsx
import { signOut } from "@/lib/auth";
import { useNavigate } from "react-router";

function LogoutButton() {
  const navigate = useNavigate();

  async function handleLogout() {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          navigate("/login");
        },
      },
    });
  }

  return <button onClick={handleLogout}>Logout</button>;
}
```

---

## Session Management

### useSession Hook

```tsx
import { useSession } from "@/lib/auth";

function DashboardPage() {
  const { data: session, isPending, error } = useSession();

  if (isPending) return <LoadingSkeleton />;
  if (error || !session) return <RedirectToLogin />;

  // session.user contains user data
  const { user } = session;

  return (
    <div>
      <p>Welcome, {user.name}</p>
      <p>Email: {user.email}</p>
      <p>Role: {user.role}</p>
      <img src={user.image} alt={user.name} />
    </div>
  );
}
```

### Session Type

```ts
// The session object from useSession
interface Session {
  user: {
    id: string;
    name: string;
    email: string;
    image?: string;
    role: "ADMIN" | "VIEWER";
    emailVerified: boolean;
    createdAt: string;
    updatedAt: string;
  };
  session: {
    id: string;
    userId: string;
    token: string;
    expiresAt: string;
    ipAddress?: string;
    userAgent?: string;
  };
}
```

### Session States

```tsx
const { data, isPending, error, refetch } = useSession();

// isPending = true  → initial loading (checking cookie)
// data = null       → not authenticated
// data = Session    → authenticated
// error             → network error or server error
```

---

## Role-Based Access Control

### useIsAdmin Hook

```tsx
import { useSession } from "@/lib/auth";

export function useIsAdmin(): boolean {
  const { data: session } = useSession();
  return session?.user.role === "ADMIN";
}
```

### Conditional UI Rendering

```tsx
function TransactionList() {
  const isAdmin = useIsAdmin();

  return (
    <div>
      <PageHeader title="Transaksi">
        {isAdmin && (
          <button onClick={openAddMenu}>
            <PlusIcon />
          </button>
        )}
      </PageHeader>

      <TransactionListItems
        onSwipeAction={isAdmin ? handleSwipeAction : undefined}
      />
    </div>
  );
}
```

### Protected Component Wrapper

```tsx
interface AdminOnlyProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

function AdminOnly({ children, fallback = null }: AdminOnlyProps) {
  const isAdmin = useIsAdmin();
  return isAdmin ? <>{children}</> : <>{fallback}</>;
}

// Usage
<AdminOnly>
  <button onClick={handleDelete}>Hapus</button>
</AdminOnly>
```

---

## Protected Route Pattern

### Route Guard in Layout Loader

```tsx
// routes/_auth.tsx
import { redirect } from "react-router";
import { authClient } from "@/lib/auth";

export async function clientLoader() {
  try {
    const session = await authClient.getSession();
    if (!session.data) {
      throw redirect("/login");
    }
    return { session: session.data };
  } catch (error) {
    throw redirect("/login");
  }
}
```

### Login Page — Redirect if Already Authenticated

```tsx
// routes/login.tsx
import { redirect } from "react-router";
import { authClient } from "@/lib/auth";

export async function clientLoader() {
  const session = await authClient.getSession();
  if (session.data) {
    throw redirect("/dashboard");
  }
  return null;
}
```

---

## 401 Handling — Global Interceptor

### API Client with Auth Error Handling

```ts
// lib/api-client.ts
type AuthErrorCallback = () => void;
let onAuthError: AuthErrorCallback | null = null;

export function setAuthErrorHandler(handler: AuthErrorCallback) {
  onAuthError = handler;
}

export async function apiClient<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options?.headers,
    },
    ...options,
  });

  if (response.status === 401) {
    onAuthError?.(); // Trigger session expired modal
    throw new AuthError("Session expired");
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new ApiError(response.status, error.message ?? "Unknown error");
  }

  return response.json();
}

class AuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "AuthError";
  }
}

class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";
  }
}
```

### Session Expired Modal

```tsx
// components/shared/session-expired-modal.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { setAuthErrorHandler } from "@/lib/api-client";

export function SessionExpiredModal() {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setAuthErrorHandler(() => setIsOpen(true));
    return () => setAuthErrorHandler(null);
  }, []);

  function handleRedirect() {
    setIsOpen(false);
    navigate("/login");
  }

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogTitle>Session Habis</DialogTitle>
        <DialogDescription>
          Silakan login ulang untuk melanjutkan.
        </DialogDescription>
        <button onClick={handleRedirect}>Login Ulang</button>
      </DialogContent>
    </Dialog>
  );
}
```

---

## Cookie Configuration (Server-Side Reference)

The server configures these — the client doesn't manage cookies directly:

```ts
// Server-side Better Auth config (for reference)
{
  session: {
    expiresIn: 60 * 60 * 24 * 7,    // 7 days
    updateAge: 60 * 60 * 24,          // Refresh every 1 day
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5,                 // Cache for 5 minutes
    },
  },
  trustedOrigins: [
    "https://ledgerly.vercel.app",    // Frontend domain
  ],
}
```

**Cookie properties:**
- `httpOnly: true` — not accessible via JS (XSS safe)
- `secure: true` — HTTPS only
- `sameSite: "none"` — required for cross-domain
- `path: "/"` — available on all routes

---

## Integration with TanStack Query

### Session Query

```tsx
// TanStack Query wrapper around useSession (optional)
import { useQuery } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";

export function useSessionQuery() {
  return useQuery({
    queryKey: ["session"],
    queryFn: async () => {
      const result = await authClient.getSession();
      if (!result.data) throw new Error("Not authenticated");
      return result.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: false, // Don't retry auth failures
  });
}
```

### Invalidate Session on Sign-Out

```tsx
import { useQueryClient } from "@tanstack/react-query";

function LogoutButton() {
  const queryClient = useQueryClient();

  async function handleLogout() {
    await signOut();
    queryClient.clear(); // Clear all cached data on logout
  }
}
```

---

## Quick Reference

| API                          | Purpose                              |
| ---------------------------- | ------------------------------------ |
| `createAuthClient()`        | Initialize client                    |
| `signIn.social()`           | Start OAuth flow                     |
| `signOut()`                  | End session, clear cookie            |
| `useSession()`              | React hook — session state           |
| `authClient.getSession()`   | Imperative session check (for loaders) |

| Session Field               | Type                                 |
| --------------------------- | ------------------------------------ |
| `session.user.id`           | `string`                             |
| `session.user.name`         | `string`                             |
| `session.user.email`        | `string`                             |
| `session.user.role`         | `"ADMIN" \| "VIEWER"`               |
| `session.user.image`        | `string \| undefined`               |
| `session.session.expiresAt` | `string` (ISO date)                  |

| Hook Return                  | Meaning                             |
| ---------------------------- | ----------------------------------- |
| `isPending: true`            | Checking session...                 |
| `data: null`                 | Not authenticated                   |
| `data: Session`              | Authenticated                       |
| `error`                      | Network/server error                |

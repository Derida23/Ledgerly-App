# View Transitions API — Web Standard

## Overview

The View Transitions API provides a native browser mechanism for animating DOM changes between states. It works with any framework and produces GPU-accelerated CSS animations with zero JavaScript animation libraries.

**Browser Support:** Chrome 111+, Edge 111+, Safari 18+, Firefox 126+ (behind flag, stable in 129+).

---

## Basic Concept

```ts
// Wrap any DOM update in startViewTransition
document.startViewTransition(() => {
  // Update the DOM here
  root.innerHTML = newContent;
});
```

The browser:
1. Captures a screenshot of the old state (`::view-transition-old`)
2. Runs your callback (DOM update)
3. Captures the new state (`::view-transition-new`)
4. Animates between old → new using CSS animations

---

## Same-Document Transitions (SPA)

### Triggering Transitions

```ts
// Basic transition
document.startViewTransition(async () => {
  // Your state update — React re-render, navigation, etc.
  await updateDOM();
});

// With ready promise — wait for animation to start
const transition = document.startViewTransition(() => updateDOM());
await transition.ready; // animation is about to play

// With finished promise — wait for animation to complete
const transition = document.startViewTransition(() => updateDOM());
await transition.finished; // animation is done

// Skip transition (e.g., user prefers reduced motion)
const transition = document.startViewTransition(() => updateDOM());
transition.skipTransition();
```

### Feature Detection

```ts
function navigateWithTransition(updateFn: () => void) {
  if (!document.startViewTransition) {
    // Fallback: just update without animation
    updateFn();
    return;
  }

  document.startViewTransition(updateFn);
}
```

---

## CSS Customization

### Default Animation (Crossfade)

```css
/* The browser creates these pseudo-elements automatically */
::view-transition {
  /* Root container for all transitions */
}

::view-transition-group(*) {
  /* Animates size and position between old and new */
  animation-duration: 300ms;
}

::view-transition-old(*) {
  /* Screenshot of the old state — fades out */
  animation: fade-out 300ms ease;
}

::view-transition-new(*) {
  /* Screenshot of the new state — fades in */
  animation: fade-in 300ms ease;
}
```

### Custom Slide Transition

```css
/* Slide in from right (forward navigation) */
@keyframes slide-in-from-right {
  from { transform: translateX(100%); }
  to { transform: translateX(0); }
}

@keyframes slide-out-to-left {
  from { transform: translateX(0); }
  to { transform: translateX(-100%); }
}

/* Slide in from left (back navigation) */
@keyframes slide-in-from-left {
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
}

@keyframes slide-out-to-right {
  from { transform: translateX(0); }
  to { transform: translateX(100%); }
}

/* Apply to page transitions */
::view-transition-old(page) {
  animation: slide-out-to-left 250ms ease-in-out;
}

::view-transition-new(page) {
  animation: slide-in-from-right 250ms ease-in-out;
}

/* Reverse direction for back navigation */
.back-navigation::view-transition-old(page) {
  animation: slide-out-to-right 250ms ease-in-out;
}

.back-navigation::view-transition-new(page) {
  animation: slide-in-from-left 250ms ease-in-out;
}
```

### Named Transitions with `view-transition-name`

```css
/* Assign a name to a specific element */
.page-content {
  view-transition-name: page;
}

/* Header stays fixed — exclude from transition */
.header {
  view-transition-name: header;
}

/* No animation for header */
::view-transition-group(header) {
  animation: none;
}

/* Only animate page content */
::view-transition-old(page) {
  animation: slide-out-to-left 250ms ease-in-out;
}

::view-transition-new(page) {
  animation: slide-in-from-right 250ms ease-in-out;
}
```

**Rule:** `view-transition-name` must be **unique** across the entire document at the time of transition. Two elements cannot share the same name simultaneously.

---

## Integration with React

### Custom Hook

```tsx
import { useCallback, useRef } from "react";

function useViewTransition() {
  const isBackNavigation = useRef(false);

  const startTransition = useCallback((updateFn: () => void | Promise<void>) => {
    if (!document.startViewTransition) {
      updateFn();
      return;
    }

    // Set direction class for CSS
    if (isBackNavigation.current) {
      document.documentElement.classList.add("back-navigation");
    }

    const transition = document.startViewTransition(async () => {
      await updateFn();
    });

    transition.finished.then(() => {
      document.documentElement.classList.remove("back-navigation");
      isBackNavigation.current = false;
    });

    return transition;
  }, []);

  const setBackNavigation = useCallback(() => {
    isBackNavigation.current = true;
  }, []);

  return { startTransition, setBackNavigation };
}
```

### Integration with React Router v7

```tsx
import { useNavigate, useLocation } from "react-router";
import { useCallback } from "react";

function useAnimatedNavigate() {
  const navigate = useNavigate();
  const location = useLocation();

  return useCallback(
    (to: string, options?: { replace?: boolean }) => {
      if (!document.startViewTransition) {
        navigate(to, options);
        return;
      }

      // Detect back navigation (simplified)
      const isBack = to === ".." || to === "-1";
      if (isBack) {
        document.documentElement.classList.add("back-navigation");
      }

      const transition = document.startViewTransition(() => {
        navigate(to, options);
      });

      transition.finished.then(() => {
        document.documentElement.classList.remove("back-navigation");
      });
    },
    [navigate]
  );
}
```

### Assigning Transition Names in JSX

```tsx
function PageContent({ children }: { children: React.ReactNode }) {
  return (
    <main style={{ viewTransitionName: "page" }}>
      {children}
    </main>
  );
}

function Header() {
  return (
    <header style={{ viewTransitionName: "header" }}>
      {/* Header stays in place during page transition */}
    </header>
  );
}
```

---

## Shared Element Transitions

Animate an element from one position/size to another across pages:

```css
/* On list page — card thumbnail */
.wallet-card-1 {
  view-transition-name: wallet-hero;
}

/* On detail page — hero image */
.wallet-hero {
  view-transition-name: wallet-hero;
}

/* The browser automatically morphs between the two positions */
::view-transition-group(wallet-hero) {
  animation-duration: 300ms;
  animation-timing-function: ease-in-out;
}
```

**Dynamic names** (for lists with multiple items):

```tsx
function WalletCard({ wallet }: { wallet: Wallet }) {
  return (
    <div style={{ viewTransitionName: `wallet-${wallet.id}` }}>
      {wallet.name}
    </div>
  );
}
```

---

## Respecting User Preferences

```css
/* Disable animations for users who prefer reduced motion */
@media (prefers-reduced-motion: reduce) {
  ::view-transition-group(*),
  ::view-transition-old(*),
  ::view-transition-new(*) {
    animation: none !important;
    animation-duration: 0s !important;
  }
}
```

```ts
// Check in JS
const prefersReducedMotion = window.matchMedia(
  "(prefers-reduced-motion: reduce)"
).matches;

if (!prefersReducedMotion && document.startViewTransition) {
  document.startViewTransition(() => navigate(to));
} else {
  navigate(to);
}
```

---

## Performance Best Practices

1. **Keep transitions short** — 150ms–300ms. Longer feels sluggish.
2. **Use `will-change: view-transition-name`** sparingly — only on elements that will participate in transitions.
3. **Avoid transitioning large DOM trees** — name specific elements, not the entire page.
4. **GPU-accelerated properties only** — `transform` and `opacity`. Avoid transitioning `width`, `height`, `top`, `left`.
5. **Don't block the transition callback** — keep the DOM update fast. Heavy async work should happen before or after.
6. **Test on low-end devices** — transitions that look smooth on desktop may stutter on mobile.

---

## Common Patterns

### Page Slide (Forward/Back)

```css
/* Direction-aware page transition */
.page-content {
  view-transition-name: page;
}

::view-transition-old(page) {
  animation: 250ms ease-in-out both slide-out-to-left;
}

::view-transition-new(page) {
  animation: 250ms ease-in-out both slide-in-from-right;
}

/* Back navigation — reverse direction */
.back-navigation::view-transition-old(page) {
  animation: 250ms ease-in-out both slide-out-to-right;
}

.back-navigation::view-transition-new(page) {
  animation: 250ms ease-in-out both slide-in-from-left;
}
```

### Fade Only (Subtle)

```css
::view-transition-old(page) {
  animation: 200ms ease-out fade-out;
}

::view-transition-new(page) {
  animation: 200ms ease-in fade-in;
}

@keyframes fade-out {
  to { opacity: 0; }
}

@keyframes fade-in {
  from { opacity: 0; }
}
```

### Modal / Bottom Sheet Open

```css
.bottom-sheet {
  view-transition-name: sheet;
}

::view-transition-new(sheet) {
  animation: 300ms ease-out slide-up;
}

::view-transition-old(sheet) {
  animation: 200ms ease-in slide-down;
}

@keyframes slide-up {
  from { transform: translateY(100%); }
}

@keyframes slide-down {
  to { transform: translateY(100%); }
}
```

---

## Quick Reference

| CSS Property / Pseudo          | Purpose                                    |
| ------------------------------ | ------------------------------------------ |
| `view-transition-name`         | Name an element for transition              |
| `::view-transition`            | Root transition container                   |
| `::view-transition-group(name)` | Animates position/size between states      |
| `::view-transition-old(name)`  | Old state snapshot (fading out)             |
| `::view-transition-new(name)`  | New state snapshot (fading in)              |
| `*` selector                   | Target all named transitions                |

| JS API                         | Purpose                                    |
| ------------------------------ | ------------------------------------------ |
| `document.startViewTransition(cb)` | Start a transition                     |
| `transition.ready`             | Promise: animation is about to play         |
| `transition.finished`          | Promise: animation completed                |
| `transition.updateCallbackDone` | Promise: DOM update callback completed     |
| `transition.skipTransition()`  | Cancel the animation                        |

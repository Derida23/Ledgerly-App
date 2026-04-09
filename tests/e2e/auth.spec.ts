import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("shows login page for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/login|\/$/);
  });

  test("login page has Google sign-in button", async ({ page }) => {
    await page.goto("/login");
    const loginButton = page.getByRole("button", { name: /google|masuk|login/i });
    await expect(loginButton).toBeVisible();
  });

  test("redirects to login when accessing protected route", async ({ page }) => {
    await page.goto("/dashboard");
    // Should redirect to login since not authenticated
    await page.waitForURL(/login|\//);
    await expect(page).not.toHaveURL(/dashboard/);
  });

  test("login page renders correctly", async ({ page }) => {
    await page.goto("/login");
    await expect(page).toHaveTitle(/Ledgerly/i);
  });
});

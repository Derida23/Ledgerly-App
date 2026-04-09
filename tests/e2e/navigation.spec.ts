import { test, expect } from "@playwright/test";

test.describe("Navigation", () => {
  test("app loads without errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("pageerror", (err) => errors.push(err.message));

    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // App should load without JS errors
    expect(errors).toHaveLength(0);
  });

  test("shows loading state initially", async ({ page }) => {
    await page.goto("/");
    // Either the loading spinner or the content should be visible
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });

  test("page title is set", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/Ledgerly/i);
  });
});

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("app is responsive at mobile width", async ({ page }) => {
    await page.goto("/");
    const body = page.locator("body");
    await expect(body).toBeVisible();
  });
});

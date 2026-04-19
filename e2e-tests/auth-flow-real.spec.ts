import { test, expect } from '@playwright/test';

test.describe('Real Connection - UI Elements check', () => {
  test('NavBar shows Login button and no UserButton when unauthenticated', async ({ page }) => {
    // Logout first to ensure a clean state
    await page.goto('/login');
    await page.evaluate(() => window.localStorage.clear());

    await page.goto('/');

    // Ensure page is loaded
    await page.waitForLoadState('networkidle');

    // NavBar shows "LOGIN" button (or "INICIAR SESIÓN" in Spanish)
    const loginButton = page.locator('a[href="/login"]').filter({ hasText: /LOGIN|INICIAR SESIÓN/i });
    await expect(loginButton).toBeVisible();

    // Custom menu icon button shouldn't exist initially
    const userMenuButton = page.locator('button[aria-haspopup="true"]');
    await expect(userMenuButton).not.toBeVisible();
  });
});

import { test, expect } from '@playwright/test';

test.describe('Auth Flow Mocked and Redirection', () => {
  test('Redirects unauthenticated users from /dashboard to /', async ({ page }) => {
    // Attempt to visit protected route
    await page.goto('/dashboard');
    
    // AuthContext starts loading. When done, no user is found, directs back to '/'
    await expect(page).toHaveURL('/');
  });

  test('Redirects unauthenticated users from /admin to /', async ({ page }) => {
    // Attempt to visit admin route
    await page.goto('/admin');
    
    // AuthContext resolves to no user -> '/'
    await expect(page).toHaveURL('/');
  });
});

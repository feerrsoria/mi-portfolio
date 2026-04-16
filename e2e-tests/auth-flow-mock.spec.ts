import { test, expect } from '@playwright/test';

test.describe('Auth Flow Mocked and Redirection', () => {
  test('Redirects unauthenticated users from /dashboard to /login', async ({ page }) => {
    // Attempt to visit protected route
    await page.goto('/dashboard');
    
    // AuthContext starts loading. When done, no user is found, directs back to '/login'
    await expect(page).toHaveURL('/login');
  });

  test('Redirects unauthenticated users from /admin to /login', async ({ page }) => {
    // Attempt to visit admin route
    await page.goto('/admin');
    
    // AuthContext resolves to no user -> '/login'
    await expect(page).toHaveURL('/login');
  });
});

import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to sign-in for protected routes', async ({ page }) => {
    await page.goto('/dashboard');
    expect(page.url()).toContain('/sign-in');
  });

  test('should show auth forms', async ({ page }) => {
    await page.goto('/sign-in');
    await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible();
    
    await page.goto('/sign-up');
    await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible();
  });
});

test.describe('Social Media Integration', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.route('**/api/auth/session', async (route) => {
      await route.fulfill({
        status: 200,
        body: JSON.stringify({
          user: {
            id: 'test-user',
            email: 'test@example.com',
          },
        }),
      });
    });
  });

  test('should show social media accounts page', async ({ page }) => {
    await page.goto('/accounts');
    await expect(page.getByText(/connect account/i)).toBeVisible();
  });

  test('should show provider connection buttons', async ({ page }) => {
    await page.goto('/accounts');
    await expect(page.getByRole('button', { name: /twitter/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /facebook/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /instagram/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /linkedin/i })).toBeVisible();
  });
});

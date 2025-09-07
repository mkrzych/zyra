import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
  test('should allow user to login with demo credentials', async ({ page }) => {
    // Go to login page
    await page.goto('/login');

    // Check page title
    await expect(page).toHaveTitle(/Zyra/);

    // Check login form is visible
    await expect(page.locator('h1')).toContainText('Sign in to Zyra');

    // Fill in demo credentials
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'password123');

    // Click sign in button
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/app/dashboard');

    // Check dashboard content
    await expect(page.locator('h1')).toContainText('Dashboard');
    await expect(page.locator('text=Welcome back')).toBeVisible();

    // Check user info in header
    await expect(page.locator('text=Admin User')).toBeVisible();

    // Check organization info
    await expect(page.locator('text=Demo Organization')).toBeVisible();
  });

  test('should show error for invalid credentials', async ({ page }) => {
    await page.goto('/login');

    // Fill in invalid credentials
    await page.fill('input[type="email"]', 'wrong@email.com');
    await page.fill('input[type="password"]', 'wrongpassword');

    // Click sign in button
    await page.click('button[type="submit"]');

    // Should show error message
    await expect(page.locator('text=Invalid credentials')).toBeVisible();

    // Should stay on login page
    await expect(page).toHaveURL('/login');
  });

  test('should allow user to register new organization', async ({ page }) => {
    await page.goto('/register');

    // Check registration form
    await expect(page.locator('h1')).toContainText('Create your organization');

    // Fill in registration form
    await page.fill('input[placeholder="Acme Corporation"]', 'Test Organization');
    await page.fill('input[placeholder="John Doe"]', 'Test Admin');
    await page.fill('input[type="email"]', `test${Date.now()}@example.com`);
    await page.fill('input[type="password"]', 'testpassword123');

    // Submit form
    await page.click('button[type="submit"]');

    // Should redirect to dashboard
    await expect(page).toHaveURL('/app/dashboard');

    // Check new organization is created
    await expect(page.locator('text=Test Organization')).toBeVisible();
    await expect(page.locator('text=Test Admin')).toBeVisible();
  });

  test('should protect app routes and redirect to login', async ({ page }) => {
    // Try to access protected route directly
    await page.goto('/app/dashboard');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });

  test('should allow user to logout', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@demo.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Should be on dashboard
    await expect(page).toHaveURL('/app/dashboard');

    // Click logout
    await page.click('text=Sign out');

    // Should redirect to login
    await expect(page).toHaveURL('/login');
  });
});
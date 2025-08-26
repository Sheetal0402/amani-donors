import { test, expect } from '@playwright/test';

test.describe('Donor Portal E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should load home page and show login prompt for unauthenticated users', async ({ page }) => {
    await expect(page.locator('h2')).toContainText('Welcome to');
    await expect(page.locator('text=Please log in')).toBeVisible();
  });

  test('should allow user to login', async ({ page }) => {
    // Navigate to login
    await page.click('text=Sign In');
    await expect(page).toHaveURL('/login');

    // Fill login form
    await page.fill('input[type="email"]', 'admin@amani.org');
    await page.fill('input[type="password"]', 'password123');
    
    // Submit login
    await page.click('button[type="submit"]');
    
    // Should redirect to home and show logged in state
    await expect(page).toHaveURL('/');
    await expect(page.locator('text=Welcome back')).toBeVisible();
  });

  test('should allow tenant switching', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@amani.org');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Wait for home page
    await expect(page).toHaveURL('/');
    
    // Switch tenant
    await page.click('mat-select[aria-label="Switch organization"]');
    await page.click('text=Generic NGO');
    
    // Should show new tenant name
    await expect(page.locator('text=Generic NGO')).toBeVisible();
  });

  test('should create a new trip', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'donor@amani.org');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to trips
    await page.goto('/donor-trip');
    
    // Create new trip
    await page.click('text=Create New Trip');
    
    // Fill trip form
    await page.fill('input[formControlName="title"]', 'Test Trip');
    await page.fill('input[formControlName="destination"]', 'Test Destination');
    await page.fill('textarea[formControlName="description"]', 'Test Description');
    
    // Set dates (using a simple date format)
    await page.fill('input[formControlName="startDate"]', '2024-06-01');
    await page.fill('input[formControlName="endDate"]', '2024-06-10');
    
    // Save trip
    await page.click('text=Create');
    
    // Should see success message and trip in list
    await expect(page.locator('text=Trip created successfully')).toBeVisible();
    await expect(page.locator('text=Test Trip')).toBeVisible();
  });

  test('should create and fulfill a promise', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'donor@amani.org');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to promises
    await page.goto('/donor-promises');
    
    // Create new promise
    await page.click('text=New Promise');
    
    // Fill promise form
    await page.fill('input[formControlName="title"]', 'Test Promise');
    await page.fill('textarea[formControlName="description"]', 'Test promise description');
    await page.selectOption('mat-select[formControlName="category"]', 'financial');
    await page.fill('input[formControlName="amount"]', '1000');
    
    // Save promise
    await page.click('text=Create');
    
    // Should see success message
    await expect(page.locator('text=Promise created successfully')).toBeVisible();
    
    // Mark as fulfilled
    await page.click('text=Mark Fulfilled');
    await expect(page.locator('text=Promise marked as fulfilled')).toBeVisible();
  });

  test('should access admin how-to guide', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[type="email"]', 'admin@amani.org');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Navigate to how-to guide
    await page.goto('/admin/how-to');
    
    // Should see onboarding guide
    await expect(page.locator('text=NGO Onboarding Guide')).toBeVisible();
    await expect(page.locator('text=Setup Organization Branding')).toBeVisible();
    
    // Mark a task as complete
    await page.click('mat-checkbox >> nth=0');
    
    // Should see task marked as complete
    await expect(page.locator('.task-panel.completed')).toBeVisible();
  });

  test('should handle navigation between sections', async ({ page }) => {
    // Login
    await page.goto('/login');
    await page.fill('input[type="email"]', 'donor@amani.org');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');
    
    // Test navigation
    await page.click('text=Trips');
    await expect(page).toHaveURL('/donor-trip');
    
    await page.click('text=Promises');
    await expect(page).toHaveURL('/donor-promises');
    
    // Go back to home
    await page.click('.logo-section');
    await expect(page).toHaveURL('/');
  });

  test('should be accessible with keyboard navigation', async ({ page }) => {
    await page.goto('/login');
    
    // Test keyboard navigation
    await page.keyboard.press('Tab'); // Focus email input
    await page.keyboard.type('admin@amani.org');
    
    await page.keyboard.press('Tab'); // Focus password input
    await page.keyboard.type('password123');
    
    await page.keyboard.press('Tab'); // Focus submit button
    await page.keyboard.press('Enter'); // Submit form
    
    // Should be logged in
    await expect(page).toHaveURL('/');
  });

  test('should show proper error messages', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('button[type="submit"]');
    
    // Should show validation errors
    await expect(page.locator('text=Email is required')).toBeVisible();
    await expect(page.locator('text=Password is required')).toBeVisible();
    
    // Try invalid credentials
    await page.fill('input[type="email"]', 'invalid@test.com');
    await page.fill('input[type="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');
    
    // Should show error message
    await expect(page.locator('text=Invalid email or password')).toBeVisible();
  });
});

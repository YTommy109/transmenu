import { test, expect } from '@playwright/test';

test('home page shows Hello World', async ({ page }) => {
  await page.goto('/');
  
  // Check that the Hello World heading is present and has the correct text
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Hello World');
  
  // Check that the description is present
  await expect(page.getByText(/Welcome to TransMenu/)).toBeVisible();
  
  // Check that the page has the correct title
  await expect(page).toHaveTitle(/TransMenu/);
});
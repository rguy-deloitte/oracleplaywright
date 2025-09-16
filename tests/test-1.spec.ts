import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.getByRole('link', { name: 'Navigator' }).click();
  await page.locator('div').filter({ hasText: 'Procurement' }).click();
  await page.getByRole('link', { name: 'Suppliers' }).click();
  await page.getByRole('link', { name: 'Tasks' }).click();
  await page.getByRole('link', { name: 'Create Supplier' }).click();
});
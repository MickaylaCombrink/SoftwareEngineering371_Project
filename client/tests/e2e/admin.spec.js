import { test, expect } from '@playwright/test';
import { mockApi, signIn, ADMIN } from './fixtures.js';

test.describe('Admin console', () => {
  test.beforeEach(async ({ context }) => {
    await signIn(context);
  });

  test('the dashboard reports figures from the API, not fixed numbers', async ({ page, context }) => {
    await mockApi(context, { user: ADMIN });

    await page.goto('/admin');

    await expect(page.getByRole('heading', { name: 'Overview' })).toBeVisible();
    // The mockup this replaced always printed R3 035 regardless of the data
    await expect(page.getByText('R3 035')).toHaveCount(0);
    await expect(page.getByText('Velvet Oud')).toBeVisible();
  });

  test('products can be searched and reached for editing', async ({ page, context }) => {
    await mockApi(context, { user: ADMIN });

    await page.goto('/admin/products');
    await expect(page.locator('table tbody tr')).toHaveCount(3);

    await page.fill('#admin-product-search', 'yara');
    await expect(page.locator('table tbody tr')).toHaveCount(1);

    await page.getByRole('link', { name: 'Edit' }).click();
    await expect(page).toHaveURL(/\/admin\/products\/p2/);
    await expect(page.locator('#p-name')).toHaveValue('Ard Al Zaafaran Yara');
  });

  test('deleting asks first and does nothing if cancelled', async ({ page, context }) => {
    const calls = await mockApi(context, { user: ADMIN });

    await page.goto('/admin/products');
    await page.getByRole('button', { name: 'Delete' }).first().click();

    await expect(page.getByText('Delete this product?')).toBeVisible();
    await page.getByRole('button', { name: 'Cancel' }).click();

    expect(calls.filter((c) => c.startsWith('DELETE'))).toHaveLength(0);
  });

  test('order and payment status can both be changed', async ({ page, context }) => {
    const calls = await mockApi(context, { user: ADMIN });

    await page.goto('/admin/orders');
    await expect(page.getByText('Hanré Koen')).toBeVisible();

    await page.selectOption('#status-65f0a1b2c3d4e5f607182930', 'Shipping');
    await expect
      .poll(() => calls.filter((c) => c.includes('/status')).length)
      .toBeGreaterThan(0);

    await page.selectOption('#pay-65f0a1b2c3d4e5f607182930', 'Paid');
    await expect
      .poll(() => calls.filter((c) => c.includes('/payment')).length)
      .toBeGreaterThan(0);
  });

  test('the console works on a phone', async ({ page, context }) => {
    await mockApi(context, { user: ADMIN });
    await page.setViewportSize({ width: 390, height: 844 });

    await page.goto('/admin');
    await page.getByRole('button', { name: 'Open admin menu' }).click();
    await expect(page.locator('.admin-sidebar--drawer').getByText('Back to store')).toBeVisible();

    const overflows = await page.evaluate(
      () => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1
    );
    expect(overflows).toBe(false);
  });
});

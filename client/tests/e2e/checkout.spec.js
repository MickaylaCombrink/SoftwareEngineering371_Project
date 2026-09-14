import { test, expect } from '@playwright/test';
import { mockApi, signIn, FULL_CART, CUSTOMER } from './fixtures.js';

// Function tests: complete user journeys through the real application in a
// real browser. These are the acceptance criteria a marker would click through.

test.describe('Browsing', () => {
  test('a visitor can reach a product from the home page', async ({ page, context }) => {
    await mockApi(context, { user: null });

    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText('fragrance');

    await page.getByText('Lattafa Queen of Arabia').first().click();
    await expect(page).toHaveURL(/\/products\/p1/);
    await expect(page.getByText('R829.00').first()).toBeVisible();
  });

  test('a sold-out product cannot be added to the cart', async ({ page, context }) => {
    await mockApi(context, { user: null });

    await page.goto('/products/p3');
    await expect(page.getByRole('button', { name: /out of stock/i })).toBeDisabled();
  });
});

test.describe('Checkout', () => {
  test.beforeEach(async ({ context }) => {
    await signIn(context);
  });

  test('the cart hands off to checkout without placing an order', async ({ page, context }) => {
    const calls = await mockApi(context, { cart: FULL_CART, subtotal: 1658 });

    await page.goto('/cart');
    await page.getByRole('link', { name: /proceed to checkout/i }).click();

    await expect(page).toHaveURL(/\/checkout/);
    // The regression this guards: the cart used to create the order directly
    expect(calls.filter((c) => c === 'POST /api/orders')).toHaveLength(0);
  });

  test('delivery details are required before payment', async ({ page, context }) => {
    await mockApi(context, { cart: FULL_CART, subtotal: 1658 });

    await page.goto('/checkout');
    await page.getByRole('button', { name: /continue to payment/i }).click();

    await expect(page.getByText(/complete the highlighted delivery details/i)).toBeVisible();
    await expect(page.locator('#pay-number')).toHaveCount(0);
  });

  test('a declined card leaves the order unplaced', async ({ page, context }) => {
    const calls = await mockApi(context, { cart: FULL_CART, subtotal: 1658 });

    await page.goto('/checkout');
    await fillDelivery(page);
    await page.getByRole('button', { name: /continue to payment/i }).click();

    await fillCard(page, '4000 0000 0000 0002');
    await page.getByRole('button', { name: /^pay /i }).click();

    await expect(page.getByText(/declined by the issuing bank/i)).toBeVisible({ timeout: 10000 });
    expect(calls.filter((c) => c === 'POST /api/orders')).toHaveLength(0);
  });

  test('an approved card places the order and reaches the confirmation', async ({ page, context }) => {
    const calls = await mockApi(context, { cart: FULL_CART, subtotal: 1658 });

    await page.goto('/checkout');
    await fillDelivery(page);
    await page.getByRole('button', { name: /continue to payment/i }).click();

    await fillCard(page, '4242 4242 4242 4242');
    await page.getByRole('button', { name: /^pay /i }).click();

    await expect(page).toHaveURL(/\/confirmation/, { timeout: 15000 });
    await expect(page.getByRole('heading', { name: /thank you/i })).toBeVisible();
    await expect(page.getByText(/Visa ending 4242/)).toBeVisible();
    expect(calls.filter((c) => c === 'POST /api/orders')).toHaveLength(1);
  });

  test('an invalid card number is caught before any request is made', async ({ page, context }) => {
    const calls = await mockApi(context, { cart: FULL_CART, subtotal: 1658 });

    await page.goto('/checkout');
    await fillDelivery(page);
    await page.getByRole('button', { name: /continue to payment/i }).click();

    // One digit off a valid number: the Luhn check should reject it
    await fillCard(page, '4242 4242 4242 4241');
    await page.getByRole('button', { name: /^pay /i }).click();

    await expect(page.getByText(/not valid/i)).toBeVisible();
    expect(calls.filter((c) => c === 'POST /api/orders')).toHaveLength(0);
  });
});

test.describe('Access control', () => {
  test('an anonymous visitor is sent to login for the cart', async ({ page, context }) => {
    await mockApi(context, { user: null });

    await page.goto('/cart');
    await expect(page).toHaveURL(/\/login/);
  });

  test('a customer cannot reach the admin console', async ({ page, context }) => {
    await signIn(context);
    await mockApi(context, { user: CUSTOMER });

    await page.goto('/admin');
    await expect(page).not.toHaveURL(/\/admin/);
  });
});

async function fillDelivery(page) {
  await page.fill('#co-street', '14 Kloof Street');
  await page.fill('#co-suburb', 'Gardens');
  await page.fill('#co-city', 'Cape Town');
  await page.fill('#co-postalCode', '8001');
  await page.fill('#co-mobile', '0821234567');
}

async function fillCard(page, number) {
  await page.fill('#pay-number', number);
  await page.fill('#pay-name', 'H Koen');
  await page.fill('#pay-expiry', '1230');
  await page.fill('#pay-cvv', '123');
}

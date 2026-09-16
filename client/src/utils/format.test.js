import { describe, test, expect } from 'vitest';
import {
  formatPrice,
  deliveryFee,
  orderReference,
  formatDate,
  formatDateTime,
  deliveryWindow,
  FREE_DELIVERY_THRESHOLD,
  DELIVERY_FEE,
} from './format';

// The thousands separator is a thin space (U+2009); spelled as an escape so
// it is not an invisible character in the expected value.
const THIN = '\u2009';

describe('formatPrice', () => {
  test('always shows two decimals in rand', () => {
    expect(formatPrice(829)).toBe('R829.00');
    expect(formatPrice(0)).toBe('R0.00');
  });

  test('separates thousands', () => {
    expect(formatPrice(1707)).toBe(`R1${THIN}707.00`);
    expect(formatPrice(1234567.5)).toBe(`R1${THIN}234${THIN}567.50`);
  });

  test('a missing or unparseable amount reads as zero, not NaN', () => {
    expect(formatPrice(undefined)).toBe('R0.00');
    expect(formatPrice(null)).toBe('R0.00');
    expect(formatPrice('nonsense')).toBe('R0.00');
  });
});

describe('deliveryFee', () => {
  test('free at and above the threshold', () => {
    expect(deliveryFee(FREE_DELIVERY_THRESHOLD)).toBe(0);
    expect(deliveryFee(FREE_DELIVERY_THRESHOLD + 1)).toBe(0);
  });

  test('charged below it', () => {
    expect(deliveryFee(FREE_DELIVERY_THRESHOLD - 0.01)).toBe(DELIVERY_FEE);
    expect(deliveryFee(0)).toBe(DELIVERY_FEE);
  });
});

describe('orderReference', () => {
  test('takes the last six characters, uppercased', () => {
    expect(orderReference('65f0a1b2c3d4e5f607182930')).toBe('SCT-182930');
  });

  test('an absent id produces an empty string rather than "SCT-undefined"', () => {
    expect(orderReference(undefined)).toBe('');
    expect(orderReference(null)).toBe('');
  });
});

describe('formatDate', () => {
  test('renders a readable date', () => {
    expect(formatDate('2026-09-14T09:00:00.000Z')).toMatch(/2026/);
  });

  test('an absent date is blank, not "Invalid Date"', () => {
    expect(formatDate(null)).toBe('');
    expect(formatDate(undefined)).toBe('');
  });
});

describe('formatDateTime', () => {
  test('renders a date with a time', () => {
    expect(formatDateTime('2026-09-14T09:00:00.000Z')).toMatch(/2026/);
    expect(formatDateTime('2026-09-14T09:00:00.000Z')).toMatch(/11:00/);
  });

  test('an absent date is blank, not "Invalid Date"', () => {
    expect(formatDateTime(null)).toBe('');
    expect(formatDateTime(undefined)).toBe('');
  });
});

describe('deliveryWindow', () => {
  test('quotes a two-to-four working day window from the order date', () => {
    // Only the day arithmetic is asserted: the month abbreviation varies
    // by ICU build ("Sep" vs "Sept").
    expect(deliveryWindow('2026-09-14T09:00:00.000Z')).toMatch(/^16 \w+ – 18 \w+$/);
  });

  test('rolls over a month boundary', () => {
    expect(deliveryWindow('2026-09-29T09:00:00.000Z')).toMatch(/Oct/);
  });

  test('falls back to today when no date is given', () => {
    expect(deliveryWindow(undefined)).toMatch(/\w{3}/);
  });
});

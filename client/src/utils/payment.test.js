import { describe, test, expect } from 'vitest';
import {
  luhnValid,
  expiryValid,
  cvvValid,
  detectBrand,
  formatCardNumber,
  formatExpiry,
  validateCard,
  simulateCardPayment,
  simulateEftPayment,
} from './payment';

// Unit tests: pure functions, no DOM and no network.

describe('luhnValid', () => {
  test.each([
    ['4242 4242 4242 4242', true],
    ['5555 5555 5555 4444', true],
    ['4000 0000 0000 0002', true],
  ])('accepts the valid test card %s', (number, expected) => {
    expect(luhnValid(number)).toBe(expected);
  });

  test('rejects a single-digit typo', () => {
    // One digit off a valid number is exactly what the check digit is for
    expect(luhnValid('4242 4242 4242 4241')).toBe(false);
  });

  test('rejects a number that is too short to be a card', () => {
    expect(luhnValid('4242')).toBe(false);
  });

  test('ignores spaces and punctuation', () => {
    expect(luhnValid('4242-4242-4242-4242')).toBe(true);
  });
});

describe('detectBrand', () => {
  test.each([
    ['4111111111111111', 'Visa'],
    ['5500000000000004', 'Mastercard'],
    ['2221000000000009', 'Mastercard'],
    ['371449635398431', 'Amex'],
    ['6011000000000004', null],
  ])('%s is %s', (number, brand) => {
    expect(detectBrand(number)).toBe(brand);
  });
});

describe('expiryValid', () => {
  const future = String(new Date().getFullYear() + 3).slice(-2);
  const past = String(new Date().getFullYear() - 1).slice(-2);

  test('accepts a date comfortably in the future', () => {
    expect(expiryValid(`12${future}`)).toBe(true);
  });

  test('rejects a date in the past', () => {
    expect(expiryValid(`12${past}`)).toBe(false);
  });

  test('rejects month 13', () => {
    expect(expiryValid(`13${future}`)).toBe(false);
  });

  test('rejects month 00', () => {
    expect(expiryValid(`00${future}`)).toBe(false);
  });

  test('a card is valid through the last day of its stated month', () => {
    const now = new Date();
    const mm = String(now.getMonth() + 1).padStart(2, '0');
    const yy = String(now.getFullYear()).slice(-2);

    expect(expiryValid(`${mm}${yy}`)).toBe(true);
  });

  test('rejects an incomplete date', () => {
    expect(expiryValid('12')).toBe(false);
  });
});

describe('cvvValid', () => {
  test('three digits for most brands', () => {
    expect(cvvValid('123', 'Visa')).toBe(true);
    expect(cvvValid('1234', 'Visa')).toBe(false);
  });

  test('four digits for Amex', () => {
    expect(cvvValid('1234', 'Amex')).toBe(true);
    expect(cvvValid('123', 'Amex')).toBe(false);
  });
});

describe('formatting', () => {
  test('groups a card number in fours as it is typed', () => {
    expect(formatCardNumber('4242424242424242')).toBe('4242 4242 4242 4242');
  });

  test('uses the 4-6-5 grouping for Amex', () => {
    expect(formatCardNumber('371449635398431')).toBe('3714 496353 98431');
  });

  test('never exceeds the card length', () => {
    expect(formatCardNumber('42424242424242429999').replace(/\D/g, '')).toHaveLength(16);
  });

  test('inserts the expiry separator after two digits', () => {
    expect(formatExpiry('1230')).toBe('12 / 30');
    expect(formatExpiry('1')).toBe('1');
  });
});

describe('validateCard', () => {
  const good = { number: '4242 4242 4242 4242', name: 'H Koen', expiry: '1230', cvv: '123' };

  test('a complete, valid card produces no errors', () => {
    expect(validateCard(good)).toEqual({});
  });

  test('each missing field is reported separately', () => {
    const errors = validateCard({ number: '', name: '', expiry: '', cvv: '' });

    expect(Object.keys(errors).sort()).toEqual(['cvv', 'expiry', 'name', 'number']);
  });

  test('an invalid number is distinguished from a missing one', () => {
    expect(validateCard({ ...good, number: '4242 4242 4242 4241' }).number).toMatch(/not valid/i);
    expect(validateCard({ ...good, number: '' }).number).toMatch(/Enter/i);
  });
});

describe('simulateCardPayment', () => {
  const good = { number: '4242 4242 4242 4242', name: 'H Koen', expiry: '1230', cvv: '123' };

  test('approves a valid card and returns only brand and last four', async () => {
    const result = await simulateCardPayment(good, 1000);

    expect(result.brand).toBe('Visa');
    expect(result.last4).toBe('4242');
    expect(result.amount).toBe(1000);
    expect(result.reference).toMatch(/^PAY-/);

    // The full number must never travel onward with the result
    expect(JSON.stringify(result)).not.toContain('4242 4242 4242 4242');
    expect(JSON.stringify(result)).not.toContain('123');
  });

  test.each([
    ['4000 0000 0000 0002', /declined/i],
    ['4000 0000 0000 9995', /insufficient funds/i],
    ['4000 0000 0000 0069', /expired/i],
    ['4000 0000 0000 0127', /security code/i],
  ])('%s is declined with its own reason', async (number, pattern) => {
    await expect(simulateCardPayment({ ...good, number }, 100)).rejects.toThrow(pattern);
  });

  test('a card failing validation is rejected rather than approved', async () => {
    await expect(simulateCardPayment({ ...good, cvv: '1' }, 100)).rejects.toThrow(/could not be verified/i);
  });
});

describe('simulateEftPayment', () => {
  test('approves and records the bank, with no card fields', async () => {
    const result = await simulateEftPayment('Capitec', 500);

    expect(result.method).toBe('eft');
    expect(result.brand).toBe('Capitec');
    expect(result.last4).toBeNull();
  });
});

// Simulated payment gateway.
//
// This is a university project: no real gateway is contacted and no card is
// ever charged. Card details live in component state for the length of the
// checkout and are NEVER sent to our API or stored anywhere — only the brand
// and last four digits travel onward, which is what a real integration would
// receive back from its provider.
//
// Behaviour is driven by the card number so every path can be demonstrated.

export const TEST_CARDS = [
  { number: '4242 4242 4242 4242', outcome: 'Approved', brand: 'Visa' },
  { number: '5555 5555 5555 4444', outcome: 'Approved', brand: 'Mastercard' },
  { number: '4000 0000 0000 0002', outcome: 'Declined by bank', brand: 'Visa' },
  { number: '4000 0000 0000 9995', outcome: 'Insufficient funds', brand: 'Visa' },
];

const DECLINE_RULES = {
  '4000000000000002': 'Your card was declined by the issuing bank.',
  '4000000000009995': 'Your card has insufficient funds for this purchase.',
  '4000000000000069': 'Your card has expired.',
  '4000000000000127': "Your card's security code is incorrect.",
};

export function digitsOnly(value) {
  return String(value).replace(/\D/g, '');
}

// Groups of four while typing; Amex uses 4-6-5
export function formatCardNumber(value) {
  const digits = digitsOnly(value).slice(0, 16);
  if (detectBrand(digits) === 'Amex') {
    return digits.slice(0, 15).replace(/^(\d{0,4})(\d{0,6})(\d{0,5}).*/, (_, a, b, c) =>
      [a, b, c].filter(Boolean).join(' ')
    );
  }
  return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
}

export function formatExpiry(value) {
  const digits = digitsOnly(value).slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
}

export function detectBrand(value) {
  const digits = digitsOnly(value);
  if (/^4/.test(digits)) return 'Visa';
  if (/^3[47]/.test(digits)) return 'Amex';
  if (/^(5[1-5]|2[2-7])/.test(digits)) return 'Mastercard';
  return null;
}

// Luhn check digit — the same validation a real form runs before submitting
export function luhnValid(value) {
  const digits = digitsOnly(value);
  if (digits.length < 13) return false;

  let sum = 0;
  let double = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (double) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    double = !double;
  }

  return sum % 10 === 0;
}

export function expiryValid(value) {
  const digits = digitsOnly(value);
  if (digits.length !== 4) return false;

  const month = Number(digits.slice(0, 2));
  const year = 2000 + Number(digits.slice(2));
  if (month < 1 || month > 12) return false;

  // Valid through the last day of the stated month
  const endOfMonth = new Date(year, month, 0, 23, 59, 59);
  return endOfMonth >= new Date();
}

export function cvvValid(value, brand) {
  const digits = digitsOnly(value);
  return brand === 'Amex' ? digits.length === 4 : digits.length === 3;
}

// Field-by-field errors, so the form can mark exactly what is wrong
export function validateCard({ number, name, expiry, cvv }) {
  const brand = detectBrand(number);
  const errors = {};

  if (!digitsOnly(number)) errors.number = 'Enter your card number.';
  else if (!luhnValid(number)) errors.number = 'That card number is not valid.';

  if (!name?.trim()) errors.name = 'Enter the name on the card.';

  if (!digitsOnly(expiry)) errors.expiry = 'Enter the expiry date.';
  else if (!expiryValid(expiry)) errors.expiry = 'That expiry date has passed.';

  if (!digitsOnly(cvv)) errors.cvv = 'Enter the security code.';
  else if (!cvvValid(cvv, brand)) {
    errors.cvv = brand === 'Amex' ? 'Amex codes are 4 digits.' : 'The code is 3 digits.';
  }

  return errors;
}

function reference() {
  return `PAY-${Date.now().toString(36).toUpperCase()}`;
}

// Resolves with an approval, or rejects with a message the UI shows verbatim.
// The delay stands in for the round trip a real gateway would take.
export function simulateCardPayment({ number, name, expiry, cvv }, amount) {
  const digits = digitsOnly(number);

  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const declineReason = DECLINE_RULES[digits];
      if (declineReason) {
        reject(new Error(declineReason));
        return;
      }

      const errors = validateCard({ number, name, expiry, cvv });
      if (Object.keys(errors).length > 0) {
        reject(new Error('Those card details could not be verified.'));
        return;
      }

      resolve({
        method: 'card',
        brand: detectBrand(digits) || 'Card',
        last4: digits.slice(-4),
        amount,
        reference: reference(),
        approvedAt: new Date().toISOString(),
      });
    }, 1600);
  });
}

// Instant EFT: no card details, just a simulated redirect to the bank
export function simulateEftPayment(bank, amount) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        method: 'eft',
        brand: bank,
        last4: null,
        amount,
        reference: reference(),
        approvedAt: new Date().toISOString(),
      });
    }, 1800);
  });
}

export const BANKS = ['Absa', 'Capitec', 'FNB', 'Nedbank', 'Standard Bank'];

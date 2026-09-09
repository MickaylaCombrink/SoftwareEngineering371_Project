import { describe, it, expect } from 'vitest';
import { formatZAR } from '../utils/formatCurrency';

describe('formatZAR', () => {
  it('formats a whole number in South African Rands', () => {
    expect(formatZAR(500)).toContain('R');
    expect(formatZAR(500)).toContain('500');
  });

  it('formats a value with cents', () => {
    const out = formatZAR(1234.5);
    expect(out).toContain('1');
    expect(out).toContain('234');
  });

  it('handles zero', () => {
    expect(formatZAR(0)).toContain('0');
  });

  it('uses the ZAR currency code', () => {
    const out = formatZAR(299);
    expect(out).toContain('R');
  });

  it('formats large sums without throwing', () => {
    expect(() => formatZAR(99999999)).not.toThrow();
  });
});

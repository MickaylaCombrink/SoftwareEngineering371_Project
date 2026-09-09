import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import PromoBar from './PromoBar';

describe('PromoBar', () => {
  it('announces free shipping and delivery', () => {
    render(<PromoBar />);
    expect(screen.getByText(/Fast & reliable delivery nationwide/i)).toBeInTheDocument();
    expect(screen.getByText(/Free shipping on orders over R 1 999/i)).toBeInTheDocument();
  });
});
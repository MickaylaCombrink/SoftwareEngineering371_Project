import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import Cart from './Cart';

vi.mock('../context/CartContext', () => ({ useCart: vi.fn() }));

function renderCart(overrides = {}) {
  useCart.mockReturnValue({
    items: [],
    subtotal: 0,
    itemCount: 0,
    loading: false,
    fetchCart: vi.fn(),
    ...overrides,
  });
  return render(
    <MemoryRouter>
      <Cart />
    </MemoryRouter>
  );
}

describe('Cart page', () => {
  it('shows an empty state with a browse link', () => {
    renderCart();
    expect(screen.getByText(/Your cart is empty/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Browse Products' })).toHaveAttribute('href', '/products');
  });

  it('shows order summary with item count and total', () => {
    const items = [{ productId: 'p1', name: 'Midnight Sun', unitPrice: 500, quantity: 2 }];
    renderCart({ items, subtotal: 1000, itemCount: 2 });
    expect(screen.getByText('Shopping Cart (2 items)')).toBeInTheDocument();
    expect(screen.getAllByText(/1 000,00/).length).toBeGreaterThan(0);
    expect(screen.getByText('Midnight Sun')).toBeInTheDocument();
  });

  it('renders a spinner while loading', () => {
    renderCart({ loading: true });
    expect(document.querySelector('.animate-pulse')).toBeInTheDocument();
  });
});
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useOrders } from '../hooks/useOrders';
import Orders from './Orders';

vi.mock('../hooks/useOrders', () => ({ useOrders: vi.fn() }));

function renderOrders(overrides = {}) {
  useOrders.mockReturnValue({
    orders: [],
    loading: false,
    error: null,
    ...overrides,
  });
  return render(
    <MemoryRouter>
      <Orders />
    </MemoryRouter>
  );
}

describe('Orders page', () => {
  it('shows an empty state when there are no orders', () => {
    renderOrders();
    expect(screen.getByText(/You haven't placed any orders yet/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Start Shopping' })).toHaveAttribute('href', '/products');
  });

  it('lists orders with total and status', () => {
    renderOrders({
      orders: [
        { _id: 'ord1234abcd', totalPrice: 1000, orderStatus: 'Shipping', items: [{ name: 'x' }] },
      ],
    });
    // Order #1234ABCD comes from the last 8 chars of the id, uppercased
    expect(screen.getByText(/1234ABCD/)).toBeInTheDocument();
    expect(screen.getByText('Shipping')).toBeInTheDocument();
    expect(screen.getByText(/1 000,00/)).toBeInTheDocument();
  });

  it('shows an error message when loading fails', () => {
    renderOrders({ error: 'Failed to load orders' });
    expect(screen.getByText('Failed to load orders')).toBeInTheDocument();
  });
});
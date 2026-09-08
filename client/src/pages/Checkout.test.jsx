import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import api from '../api/axios';
import Checkout from './Checkout';

vi.mock('../context/CartContext', () => ({ useCart: vi.fn() }));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));
vi.mock('../api/axios', () => ({
  default: { post: vi.fn() },
}));

const items = [{ productId: 'p1', name: 'Midnight Sun', unitPrice: 500, quantity: 2 }];

function renderCheckout(overrides = {}) {
  useCart.mockReturnValue({
    items,
    subtotal: 1000,
    clearCart: vi.fn(),
    ...overrides,
  });
  return render(
    <MemoryRouter initialEntries={['/checkout']}>
      <Checkout />
    </MemoryRouter>
  );
}

describe('Checkout page', () => {
  it('renders the items being ordered', () => {
    renderCheckout();
    expect(screen.getByText('Midnight Sun')).toBeInTheDocument();
    expect(screen.getByText('Total')).toBeInTheDocument();
  });

  it('places the order and navigates on success', async () => {
    const clearCart = vi.fn();
    api.post.mockResolvedValue({
      data: { data: { order: { _id: 'ord1234' } } },
    });
    renderCheckout({ clearCart });
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/orders/checkout');
      expect(clearCart).toHaveBeenCalled();
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('shows an error toast when checkout fails', async () => {
    api.post.mockRejectedValue({ response: { data: { message: 'No stock available.' } } });
    renderCheckout();
    fireEvent.click(screen.getByRole('button', { name: /place order/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('No stock available.');
    });
  });
});
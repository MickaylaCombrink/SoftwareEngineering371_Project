import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import CartItem from './CartItem';

vi.mock('../context/CartContext', () => ({ useCart: vi.fn() }));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const item = {
  productId: 'prod1',
  name: 'Midnight Sun',
  unitPrice: 500,
  quantity: 2,
};

function renderItem(overrides = {}) {
  const updateQuantity = vi.fn().mockResolvedValue({});
  const removeItem = vi.fn().mockResolvedValue({});
  useCart.mockReturnValue({ updateQuantity, removeItem, ...overrides });
  return { updateQuantity, removeItem, ...render(<CartItem item={item} />) };
}

describe('CartItem', () => {
  it('renders the item name, unit price and line total', () => {
    renderItem();
    expect(screen.getByText('Midnight Sun')).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('decrements quantity via updateQuantity', async () => {
    const { updateQuantity } = renderItem();
    fireEvent.click(screen.getByRole('button', { name: '-' }));
    await waitFor(() => {
      expect(updateQuantity).toHaveBeenCalledWith('prod1', 1);
    });
  });

  it('increments quantity via updateQuantity', async () => {
    const { updateQuantity } = renderItem();
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    await waitFor(() => {
      expect(updateQuantity).toHaveBeenCalledWith('prod1', 3);
    });
  });

  it('removes the item and shows a success toast', async () => {
    const { removeItem } = renderItem();
    fireEvent.click(screen.getByRole('button', { name: 'Remove' }));
    await waitFor(() => {
      expect(removeItem).toHaveBeenCalledWith('prod1');
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('shows an error toast when updateQuantity fails', async () => {
    const updateQuantity = vi.fn().mockRejectedValue({ response: { data: { message: 'Too many.' } } });
    renderItem({ updateQuantity });
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Too many.');
    });
  });
});
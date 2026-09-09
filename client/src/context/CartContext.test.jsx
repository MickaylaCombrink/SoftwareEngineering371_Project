import { useEffect } from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { useAuth } from './AuthContext';

const mockApi = vi.fn();

vi.mock('./AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../api/axios', () => ({
  default: {
    get: (url) => mockApi(url),
    post: (url, body) => mockApi(url),
    put: (url, body) => mockApi(url),
    delete: (url, config) => mockApi(url),
  },
}));

function TestCart() {
  const { items, subtotal, itemCount, loading, fetchCart, addItem, updateQuantity, removeItem } = useCart();
  useEffect(() => { fetchCart(); }, [fetchCart]);
  if (loading) return <div>loading...</div>;
  return (
    <div>
      <div data-testid="count">{String(itemCount)}</div>
      <div data-testid="subtotal">{String(subtotal)}</div>
      <button onClick={() => addItem('p1', 2)}>add</button>
      <button onClick={() => updateQuantity('p1', 5)}>update</button>
      <button onClick={() => removeItem('p1')}>remove</button>
      {items.map((i) => (
        <div key={i.productId} data-testid="item">{i.name}</div>
      ))}
    </div>
  );
}

const cartResponse = {
  data: {
    itemCount: 2,
    subtotal: 1000,
    data: {
      cart: { items: [{ productId: 'p1', name: 'Midnight Sun', unitPrice: 500, quantity: 2 }] },
    },
  },
};

function renderCart() {
  useAuth.mockReturnValue({ user: { id: 'u1' } });
  return render(
    <CartProvider>
      <TestCart />
    </CartProvider>
  );
}

describe('CartContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches the users cart when a user is present', async () => {
    mockApi.mockResolvedValue(cartResponse);
    renderCart();
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'));
    expect(screen.getByTestId('subtotal')).toHaveTextContent('1000');
    expect(screen.getByTestId('item')).toHaveTextContent('Midnight Sun');
  });

  it('adds an item and reflects the new state', async () => {
    mockApi.mockResolvedValue(cartResponse);
    renderCart();
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'));
    const updated = {
      data: { itemCount: 4, subtotal: 2000, data: { cart: { items: [] } } },
    };
    mockApi.mockResolvedValue(updated);
    fireEvent.click(screen.getByText('add'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('4'));
  });

  it('updates quantity via the API', async () => {
    mockApi.mockResolvedValue(cartResponse);
    renderCart();
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('2'));
    const updated = {
      data: { itemCount: 5, subtotal: 2500, data: { cart: { items: [] } } },
    };
    mockApi.mockResolvedValue(updated);
    fireEvent.click(screen.getByText('update'));
    await waitFor(() => expect(screen.getByTestId('count')).toHaveTextContent('5'));
  });
});
import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductCard from './ProductCard';

vi.mock('../context/CartContext', () => ({
  useCart: vi.fn(),
}));
vi.mock('../context/AuthContext', () => ({
  useAuth: vi.fn(),
}));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const product = {
  _id: 'p1',
  productName: 'Midnight Sun',
  description: 'A luminous white-floral bouquet',
  price: 500,
  stock: 10,
  image: [],
};

function renderCard(prod = product, opts = {}) {
  const addItem = vi.fn();
  useCart.mockReturnValue({ addItem });
  useAuth.mockReturnValue({ isAuthenticated: true, ...opts.auth });
  return { addItem, ...render(
    <MemoryRouter>
      <ProductCard product={prod} />
    </MemoryRouter>
  ) };
}

describe('ProductCard', () => {
  it('renders the product name and formatted price', () => {
    renderCard();
    expect(screen.getByText('Midnight Sun')).toBeInTheDocument();
    expect(screen.getByText(/500/)).toBeInTheDocument();
  });

  it('links to the product detail page', () => {
    renderCard();
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', '/products/p1');
  });

  it('shows Add to Cart for an in-stock product', () => {
    renderCard();
    expect(screen.getByRole('button', { name: /add to cart/i })).toBeInTheDocument();
  });

  it('shows Out of Stock and no add button when stock is 0', () => {
    const outOfStock = {
      _id: 'p2',
      productName: 'Empty',
      description: 'nothing',
      price: 10,
      stock: 0,
      image: [],
    };
    renderCard(outOfStock);
    expect(screen.getByText('Out of Stock')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /add to cart/i })).not.toBeInTheDocument();
  });

  it('adds to cart and shows a toast on click', async () => {
    const { addItem } = renderCard();
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(addItem).toHaveBeenCalledWith('p1', 1);
    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('prompts to log in when not authenticated', () => {
    const { addItem } = renderCard(product, { auth: { isAuthenticated: false } });
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    expect(addItem).not.toHaveBeenCalled();
    expect(toast.error).toHaveBeenCalled();
  });
});
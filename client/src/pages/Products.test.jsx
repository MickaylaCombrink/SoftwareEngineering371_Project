import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import api from '../api/axios';
import { useProducts } from '../hooks/useProducts';
import Products from './Products';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

vi.mock('../api/axios', () => ({
  default: {
    get: vi.fn(),
  },
}));
vi.mock('../hooks/useProducts', () => ({
  useProducts: vi.fn(),
}));
vi.mock('../context/CartContext', () => ({ useCart: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const products = [
  { _id: 'p1', productName: 'Midnight Sun', description: 'floral', price: 500, stock: 5, image: [] },
  { _id: 'p2', productName: 'Ocean Breeze', description: 'fresh', price: 400, stock: 0, image: [] },
];

function renderProducts() {
  useProducts.mockReturnValue({
    products,
    loading: false,
    error: null,
    query: {},
    setQuery: vi.fn(),
  });
  useCart.mockReturnValue({ addItem: vi.fn() });
  useAuth.mockReturnValue({ isAuthenticated: true });
  api.get.mockResolvedValue({
    data: { data: { categories: [{ _id: 'c1', category: 'Floral' }] } },
  });
  return render(
    <MemoryRouter initialEntries={['/products']}>
      <Products />
    </MemoryRouter>
  );
}

describe('Products page', () => {
  it('renders the heading and product cards', async () => {
    renderProducts();
    expect(await screen.findByText('Our Collection')).toBeInTheDocument();
    expect(screen.getByText('Midnight Sun')).toBeInTheDocument();
    expect(screen.getByText('Ocean Breeze')).toBeInTheDocument();
  });

  it('shows the in-stock filter toggle', async () => {
    renderProducts();
    expect(await screen.findByText('In Stock Only')).toBeInTheDocument();
  });

  it('shows categories from the API', async () => {
    renderProducts();
    expect(await screen.findByText('Floral')).toBeInTheDocument();
  });
});
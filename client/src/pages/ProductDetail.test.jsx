import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import ProductDetail from './ProductDetail';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn() },
}));
vi.mock('../context/CartContext', () => ({ useCart: vi.fn() }));
vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
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

function renderDetail(opts = {}) {
  const apiGet = opts.apiGet || (() => Promise.resolve({ data: { data: { product } } }));
  api.get.mockImplementation(apiGet);
  useCart.mockReturnValue({ addItem: opts.addItem || vi.fn() });
  useAuth.mockReturnValue({ isAuthenticated: true, ...opts.auth });
  return render(
    <MemoryRouter initialEntries={['/products/p1']}>
      <Routes>
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/products" element={<div>catalogue</div>} />
        <Route path="/login" element={<div>login page</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('ProductDetail', () => {
  it('renders product info once loaded', async () => {
    renderDetail();
    expect(await screen.findByText('Midnight Sun')).toBeInTheDocument();
    expect(screen.getByText(/A luminous white-floral/)).toBeInTheDocument();
    expect(screen.getByText(/10 in stock/)).toBeInTheDocument();
  });

  it('redirects to the catalogue when the product is not found', async () => {
    renderDetail({ apiGet: () => Promise.reject(new Error('not found')) });
    expect(await screen.findByText('catalogue')).toBeInTheDocument();
  });

  it('adds the selected quantity to the cart', async () => {
    const addItem = vi.fn().mockResolvedValue({});
    renderDetail({ addItem });
    await screen.findByText('Midnight Sun');
    fireEvent.click(screen.getByRole('button', { name: '+' }));
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    await waitFor(() => {
      expect(addItem).toHaveBeenCalledWith('p1', 2);
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('prompts unauthenticated users to log in', async () => {
    renderDetail({ auth: { isAuthenticated: false } });
    await screen.findByText('Midnight Sun');
    fireEvent.click(screen.getByRole('button', { name: /add to cart/i }));
    await waitFor(() => {
      expect(toast.error).toHaveBeenCalled();
    });
  });
});
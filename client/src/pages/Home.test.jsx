import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Home from './Home';

vi.mock('../components/ProductCard', () => ({
  default: ({ product }) => <div data-testid="card">{product.productName}</div>,
}));
vi.mock('../api/axios', () => ({
  default: { get: vi.fn() },
}));

function renderHome() {
  api.get.mockImplementation((url) => {
    if (url === '/products') {
      return Promise.resolve({
        data: { data: { products: [{ _id: 'p1', productName: 'Midnight Sun' }] } },
      });
    }
    if (url === '/categories') {
      return Promise.resolve({
        data: { data: { categories: [{ _id: 'c1', category: 'Floral', description: 'flowers' }] } },
      });
    }
    return Promise.reject(new Error('unexpected'));
  });
  return render(
    <MemoryRouter>
      <Home />
    </MemoryRouter>
  );
}

describe('Home page', () => {
  it('renders the hero section', async () => {
    renderHome();
    expect(await screen.findByText(/Discover Your/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Shop Now' })).toHaveAttribute('href', '/products');
  });

  it('renders category tiles', async () => {
    renderHome();
    expect(await screen.findByText('Floral')).toBeInTheDocument();
    expect(screen.getByText('flowers')).toBeInTheDocument();
  });

  it('renders featured product cards', async () => {
    renderHome();
    expect(await screen.findByText('Midnight Sun')).toBeInTheDocument();
  });
});
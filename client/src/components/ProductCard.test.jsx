import { describe, test, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ProductCard } from './ProductCard';

const addItem = vi.fn();
const mockAuth = vi.fn();

vi.mock('../context/CartContext', () => ({ useCart: () => ({ addItem }) }));
vi.mock('../context/AuthContext', () => ({ useAuth: () => mockAuth() }));

const product = {
  _id: 'p1',
  productName: 'Lattafa Queen of Arabia',
  price: 829,
  stock: 8,
  image: [],
  category: { _id: 'c1', category: 'Oud' },
};

function renderCard(overrides = {}, auth = { isAuthenticated: true }) {
  mockAuth.mockReturnValue(auth);

  return render(
    <MemoryRouter>
      <ProductCard product={{ ...product, ...overrides }} />
    </MemoryRouter>
  );
}

beforeEach(() => {
  addItem.mockReset().mockResolvedValue({});
});

describe('ProductCard', () => {
  test('shows the name, category and rand price', () => {
    renderCard();

    expect(screen.getByText('Lattafa Queen of Arabia')).toBeInTheDocument();
    expect(screen.getByText('Oud')).toBeInTheDocument();
    expect(screen.getByText('R829.00')).toBeInTheDocument();
  });

  test('a product with no category still renders', () => {
    renderCard({ category: null });

    expect(screen.getByText('Fragrance')).toBeInTheDocument();
  });

  test('links to the detail page', () => {
    renderCard();

    expect(screen.getAllByRole('link')[0]).toHaveAttribute('href', '/products/p1');
  });

  test('adding calls the cart with the product id', async () => {
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }));

    expect(addItem).toHaveBeenCalledWith('p1');
  });

  test('an out-of-stock product cannot be added', () => {
    renderCard({ stock: 0 });

    expect(screen.getByRole('button')).toBeDisabled();
    expect(screen.getByText('Out of stock')).toBeInTheDocument();
  });

  test('a signed-out visitor is prompted to sign in rather than told it worked', () => {
    renderCard({}, { isAuthenticated: false });

    expect(screen.getByRole('button', { name: 'Sign in to buy' })).toBeInTheDocument();
  });

  test('a failure is surfaced on the card instead of failing silently', async () => {
    addItem.mockRejectedValue(new Error('Only 2 units are available.'));
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Only 2 units are available.');
  });

  test('the button is disabled while the request is in flight', async () => {
    let release;
    addItem.mockReturnValue(new Promise((resolve) => {
      release = resolve;
    }));
    renderCard();

    await userEvent.click(screen.getByRole('button', { name: 'Add to cart' }));

    expect(screen.getByRole('button', { name: 'Adding…' })).toBeDisabled();
    release({});
  });
});

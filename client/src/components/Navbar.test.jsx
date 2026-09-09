import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import Navbar from './Navbar';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('../context/CartContext', () => ({ useCart: vi.fn() }));

const baseAuth = {
  user: null,
  isAuthenticated: false,
  isAdmin: false,
  logout: vi.fn(),
};

function renderNav(auth = {}, cart = {}) {
  useAuth.mockReturnValue({ ...baseAuth, ...auth });
  useCart.mockReturnValue({ itemCount: 0, ...cart });
  return render(
    <MemoryRouter>
      <Navbar />
    </MemoryRouter>
  );
}

describe('Navbar', () => {
  it('renders the brand and product link', () => {
    renderNav();
    expect(screen.getByText(/cent/i)).toBeInTheDocument();
    expect(screen.getByText('Products')).toBeInTheDocument();
  });

  it('shows Login and Register for guests', () => {
    renderNav();
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Register')).toBeInTheDocument();
  });

  it('shows the users first name and Logout when authenticated', () => {
    renderNav({ user: { firstName: 'Nathi' }, isAuthenticated: true });
    expect(screen.getByText('Nathi')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('shows Admin link only for admins', () => {
    renderNav({ user: { firstName: 'Boss' }, isAuthenticated: true, isAdmin: true });
    expect(screen.getByText('Admin')).toBeInTheDocument();
  });

  it('does not show Admin link for non-admins', () => {
    renderNav({ user: { firstName: 'Nathi' }, isAuthenticated: true, isAdmin: false });
    expect(screen.queryByText('Admin')).not.toBeInTheDocument();
  });

  it('shows the cart item count badge when there are items', () => {
    renderNav({ user: { firstName: 'Nathi' }, isAuthenticated: true }, { itemCount: 3 });
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('toggles the mobile menu', () => {
    renderNav();
    fireEvent.click(screen.getByRole('button', { name: /toggle menu/i }));
    // Mobile menu reveals Login for guests
    expect(screen.getAllByText('Login').length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole('button', { name: /toggle menu/i }));
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });
});

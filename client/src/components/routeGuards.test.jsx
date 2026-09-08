import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ProtectedRoute from './ProtectedRoute';
import AdminRoute from './AdminRoute';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));

function renderRoute(RouteComponent, auth) {
  useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: false, loading: false, ...auth });
  return render(
    <MemoryRouter>
      <RouteComponent>
        <div>protected content</div>
      </RouteComponent>
    </MemoryRouter>
  );
}

describe('ProtectedRoute', () => {
  it('renders children when authenticated', () => {
    renderRoute(ProtectedRoute, { isAuthenticated: true });
    expect(screen.getByText('protected content')).toBeInTheDocument();
  });

  it('shows a spinner while loading', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isAdmin: false, loading: true });
    render(
      <MemoryRouter>
        <ProtectedRoute><div>protected content</div></ProtectedRoute>
      </MemoryRouter>
    );
    expect(screen.queryByText('protected content')).not.toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});

describe('AdminRoute', () => {
  it('renders children when user is admin', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, isAdmin: true, loading: false });
    render(
      <MemoryRouter>
        <AdminRoute><div>admin content</div></AdminRoute>
      </MemoryRouter>
    );
    expect(screen.getByText('admin content')).toBeInTheDocument();
  });

  it('renders nothing and redirects when user is not admin', () => {
    renderRoute(AdminRoute, { isAuthenticated: true, isAdmin: false });
    expect(screen.queryByText('admin content')).not.toBeInTheDocument();
  });

  it('shows a spinner while loading', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, isAdmin: false, loading: true });
    render(
      <MemoryRouter>
        <AdminRoute><div>admin content</div></AdminRoute>
      </MemoryRouter>
    );
    expect(document.querySelector('.animate-spin')).toBeInTheDocument();
  });
});
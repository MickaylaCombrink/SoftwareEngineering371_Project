import { describe, test, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AdminRoute } from './AdminRoute';

// The guard's decision depends only on auth state, so the context is mocked
// and the real router decides where each outcome lands.
const mockAuth = vi.fn();
vi.mock('../context/AuthContext', () => ({
  useAuth: () => mockAuth(),
}));

function renderAt(auth) {
  mockAuth.mockReturnValue(auth);

  return render(
    <MemoryRouter initialEntries={['/admin']}>
      <Routes>
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<div>ADMIN CONSOLE</div>} />
        </Route>
        <Route path="/login" element={<div>LOGIN PAGE</div>} />
        <Route path="/" element={<div>STOREFRONT</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('AdminRoute', () => {
  test('an admin sees the console', () => {
    renderAt({ status: 'authenticated', isAdmin: true });

    expect(screen.getByText('ADMIN CONSOLE')).toBeInTheDocument();
  });

  test('a signed-out visitor is sent to login, not shown the console', () => {
    renderAt({ status: 'unauthenticated', isAdmin: false });

    expect(screen.queryByText('ADMIN CONSOLE')).not.toBeInTheDocument();
    expect(screen.getByText('LOGIN PAGE')).toBeInTheDocument();
  });

  test('a signed-in customer goes home — they are authenticated, just not permitted', () => {
    renderAt({ status: 'authenticated', isAdmin: false });

    expect(screen.queryByText('ADMIN CONSOLE')).not.toBeInTheDocument();
    expect(screen.getByText('STOREFRONT')).toBeInTheDocument();
  });

  test('nothing is decided while the session is still restoring', () => {
    // Redirecting during 'loading' would bounce a real admin out on refresh
    renderAt({ status: 'loading', isAdmin: false });

    expect(screen.queryByText('ADMIN CONSOLE')).not.toBeInTheDocument();
    expect(screen.queryByText('LOGIN PAGE')).not.toBeInTheDocument();
    expect(screen.queryByText('STOREFRONT')).not.toBeInTheDocument();
    expect(screen.getByRole('status')).toBeInTheDocument();
  });
});

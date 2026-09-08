import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { AuthProvider, useAuth } from './AuthContext';

const mockPost = vi.fn();
const mockGet = vi.fn();

vi.mock('../api/axios', () => ({
  default: {
    post: (...args) => mockPost(...args),
    get: (...args) => mockGet(...args),
  },
  setTokens: vi.fn(),
  clearTokens: vi.fn(),
  setOnUnauthorized: vi.fn(),
}));

function TestConsumer() {
  const { user, isAuthenticated, isAdmin, loading, login, logout, register } = useAuth();
  if (loading) return <div>loading...</div>;
  return (
    <div>
      <div data-testid="auth">{String(isAuthenticated)}</div>
      <div data-testid="admin">{String(isAdmin)}</div>
      <div data-testid="email">{user?.email || 'none'}</div>
      <button onClick={() => login('a@b.com', 'pass12345')}>login</button>
      <button onClick={() => register({ email: 'c@d.com' })}>register</button>
      <button onClick={() => logout()}>logout</button>
    </div>
  );
}

function renderAuth() {
  return render(
    <AuthProvider>
      <TestConsumer />
    </AuthProvider>
  );
}

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('starts unauthenticated with no stored session', async () => {
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false'));
  });

  it('loads a stored session from localStorage', async () => {
    const user = { email: 'stored@example.com', role: 'customer' };
    localStorage.setItem('auth', JSON.stringify({ user, token: 't', refreshToken: 'r' }));
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('email')).toHaveTextContent('stored@example.com'));
    expect(screen.getByTestId('auth')).toHaveTextContent('true');
  });

  it('flags the user as admin when role is admin', async () => {
    localStorage.setItem('auth', JSON.stringify({
      user: { email: 'boss@example.com', role: 'admin' },
      token: 't',
      refreshToken: 'r',
    }));
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('admin')).toHaveTextContent('true'));
  });

  it('logs in and persists the session', async () => {
    mockPost.mockResolvedValue({
      data: {
        token: 'access',
        refreshToken: 'refresh',
        data: { user: { email: 'a@b.com', role: 'customer' } },
      },
    });
    renderAuth();
    fireEvent.click(screen.getByText('login'));
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'));
    expect(screen.getByTestId('email')).toHaveTextContent('a@b.com');
    const stored = JSON.parse(localStorage.getItem('auth'));
    expect(stored.user.email).toBe('a@b.com');
    expect(stored.refreshToken).toBe('refresh');
  });

  it('logs out and clears the stored session', async () => {
    localStorage.setItem('auth', JSON.stringify({
      user: { email: 'a@b.com', role: 'customer' },
      token: 't',
      refreshToken: 'r',
    }));
    mockPost.mockResolvedValue({ data: { status: 'success' } });
    renderAuth();
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('true'));
    fireEvent.click(screen.getByText('logout'));
    await waitFor(() => expect(screen.getByTestId('auth')).toHaveTextContent('false'));
    expect(localStorage.getItem('auth')).toBeNull();
  });
});
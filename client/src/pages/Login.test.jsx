import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Login from './Login';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function renderLogin(auth = {}) {
  const login = vi.fn();
  useAuth.mockReturnValue({ login, ...auth });
  return { login, ...render(
    <MemoryRouter>
      <Login />
    </MemoryRouter>
  ) };
}

describe('Login', () => {
  it('renders the login form', () => {
    renderLogin();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('calls login with email and password on submit', async () => {
    const { login } = renderLogin();
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nathi@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(login).toHaveBeenCalledWith('nathi@example.com', 'password123');
    });
  });

  it('shows a success toast and navigates home on success', async () => {
    const { login } = renderLogin();
    login.mockResolvedValue({});
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nathi@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.success).toHaveBeenCalled();
    });
  });

  it('shows an error toast on failed login', async () => {
    const { login } = renderLogin();
    login.mockRejectedValue({ response: { data: { message: 'Invalid email or password.' } } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nathi@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'wrong!' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Invalid email or password.');
    });
  });
});
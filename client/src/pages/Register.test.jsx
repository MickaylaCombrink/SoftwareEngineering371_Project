import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import Register from './Register';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

function renderRegister() {
  const register = vi.fn();
  useAuth.mockReturnValue({ register });
  return { register, ...render(
    <MemoryRouter>
      <Register />
    </MemoryRouter>
  ) };
}

describe('Register', () => {
  it('renders the registration form fields', () => {
    renderRegister();
    expect(screen.getByLabelText('First Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Last Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
  });

  it('rejects a submit when passwords do not match', async () => {
    const { register } = renderRegister();
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Nathi' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Mathenjwa' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nathi@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'different123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith('Passwords do not match.');
      expect(register).not.toHaveBeenCalled();
    });
  });

  it('submits the form without the confirm field and shows success', async () => {
    const { register } = renderRegister();
    register.mockResolvedValue({});
    fireEvent.change(screen.getByLabelText('First Name'), { target: { value: 'Nathi' } });
    fireEvent.change(screen.getByLabelText('Last Name'), { target: { value: 'Mathenjwa' } });
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'nathi@example.com' } });
    fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });
    fireEvent.change(screen.getByLabelText('Confirm Password'), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(register).toHaveBeenCalledWith({
        firstName: 'Nathi',
        lastName: 'Mathenjwa',
        email: 'nathi@example.com',
        password: 'password123',
      });
      expect(toast.success).toHaveBeenCalled();
    });
  });
});
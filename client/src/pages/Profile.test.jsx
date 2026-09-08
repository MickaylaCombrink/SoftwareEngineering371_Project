import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { useAuth } from '../context/AuthContext';
import Profile from './Profile';

vi.mock('../context/AuthContext', () => ({ useAuth: vi.fn() }));

const user = {
  firstName: 'Nathi',
  lastName: 'Mathenjwa',
  email: 'nathi@example.com',
  phone: '0821234567',
  role: 'customer',
  createdAt: '2026-01-01T00:00:00.000Z',
};

describe('Profile', () => {
  it('pre-fills the form from the current user', () => {
    useAuth.mockReturnValue({ user, refreshUser: vi.fn() });
    render(<Profile />);
    expect(screen.getByLabelText('First Name')).toHaveValue('Nathi');
    expect(screen.getByLabelText('Last Name')).toHaveValue('Mathenjwa');
    expect(screen.getByLabelText('Email')).toHaveValue('nathi@example.com');
  });

  it('shows role and membership date', () => {
    useAuth.mockReturnValue({ user, refreshUser: vi.fn() });
    render(<Profile />);
    expect(screen.getByText(/customer/)).toBeInTheDocument();
    expect(screen.getByText(/Member since:/)).toBeInTheDocument();
  });

  it('refreshes the user on save', async () => {
    const refreshUser = vi.fn().mockResolvedValue({});
    useAuth.mockReturnValue({ user, refreshUser });
    render(<Profile />);
    fireEvent.click(screen.getByRole('button', { name: /save changes/i }));
    await waitFor(() => expect(refreshUser).toHaveBeenCalled());
  });
});
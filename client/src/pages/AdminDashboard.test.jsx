import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import toast from 'react-hot-toast';
import api from '../api/axios';
import AdminDashboard from './AdminDashboard';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn(), put: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const orders = [
  { _id: 'ord0000000001', userId: { firstName: 'Tanya', lastName: 'Richards' }, totalPrice: 1000, orderStatus: 'Pending', createdAt: '2026-01-01T00:00:00.000Z' },
  { _id: 'ord0000000002', userId: { firstName: 'Momelezi', lastName: 'Tyini' }, totalPrice: 2000, orderStatus: 'Delivered', createdAt: '2026-01-02T00:00:00.000Z' },
];

function renderAdmin() {
  api.get.mockResolvedValue({ data: { data: { orders } } });
  api.put.mockResolvedValue({ data: { data: { order: {} } } });
  return render(<AdminDashboard />);
}

describe('AdminDashboard', () => {
  it('loads all orders and renders stats', async () => {
    renderAdmin();
    expect(await screen.findByText('All Orders')).toBeInTheDocument();
    expect(screen.getByText('Tanya Richards')).toBeInTheDocument();
    expect(screen.getByText('Momelezi Tyini')).toBeInTheDocument();
    // Stats cards
    expect(screen.getByText('Total Orders')).toBeInTheDocument();
    expect(screen.getByText('Revenue')).toBeInTheDocument();
  });

  it('shows a loading state', () => {
    // Render directly: renderAdmin() would overwrite this pending mock
    api.get.mockReturnValue(new Promise(() => {}));
    render(<AdminDashboard />);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('updates an order status via the API', async () => {
    renderAdmin();
    await screen.findByText('All Orders');
    const firstSelect = screen.getAllByRole('combobox')[0];
    fireEvent.change(firstSelect, { target: { value: 'Shipping' } });
    await waitFor(() => {
      expect(api.put).toHaveBeenCalledWith('/orders/ord0000000001/status', { orderStatus: 'Shipping' });
      expect(toast.success).toHaveBeenCalled();
    });
  });
});
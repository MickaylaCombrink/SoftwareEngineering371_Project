import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import OrderDetail from './OrderDetail';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn() },
}));
vi.mock('react-hot-toast', () => ({
  default: { success: vi.fn(), error: vi.fn() },
}));

const order = {
  _id: 'ord1234abcd',
  orderStatus: 'Shipping',
  totalPrice: 1000,
  items: [{ name: 'Midnight Sun', quantity: 2, unitPrice: 500 }],
};

function renderOrderDetail(opts = {}) {
  const apiGet = opts.apiGet || (() => Promise.resolve({ data: { data: { order } } }));
  api.get.mockImplementation(apiGet);
  return render(
    <MemoryRouter initialEntries={['/orders/ord1234abcd']}>
      <Routes>
        <Route path="/orders/:id" element={<OrderDetail />} />
        <Route path="/orders" element={<div>orders list</div>} />
      </Routes>
    </MemoryRouter>
  );
}

describe('OrderDetail', () => {
  it('renders order items and total', async () => {
    renderOrderDetail();
    expect(await screen.findByText(/1234ABCD/)).toBeInTheDocument();
    expect(screen.getByText('Midnight Sun')).toBeInTheDocument();
    expect(screen.getByText('Shipping')).toBeInTheDocument();
  });

  it('redirects to the orders list when the order is missing', async () => {
    renderOrderDetail({ apiGet: () => Promise.reject(new Error('missing')) });
    expect(await screen.findByText('orders list')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalled();
  });
});
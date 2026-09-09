import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import api from '../api/axios';
import { useOrders } from './useOrders';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn() },
}));

describe('useOrders', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches orders from the API on mount', async () => {
    api.get.mockResolvedValue({
      data: { data: { orders: [{ _id: 'o1', totalPrice: 100 }] } },
    });
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).toHaveBeenCalledWith('/orders', expect.anything());
    expect(result.current.orders).toHaveLength(1);
    expect(result.current.orders[0].totalPrice).toBe(100);
  });

  it('reports an error when the request fails', async () => {
    api.get.mockRejectedValue({ response: { data: { message: 'Failed to load orders' } } });
    const { result } = renderHook(() => useOrders());
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to load orders');
  });
});
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import api from '../api/axios';
import { useProducts } from './useProducts';

vi.mock('../api/axios', () => ({
  default: { get: vi.fn() },
}));

describe('useProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches products from the API on mount', async () => {
    api.get.mockResolvedValue({
      data: { data: { products: [{ _id: 'p1', productName: 'Midnight Sun' }] } },
    });
    const { result } = renderHook(() => useProducts({}));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(api.get).toHaveBeenCalledWith('/products', expect.objectContaining({ params: {} }));
    expect(result.current.products).toHaveLength(1);
    expect(result.current.products[0].productName).toBe('Midnight Sun');
  });

  it('maps query values into API params', async () => {
    api.get.mockResolvedValue({ data: { data: { products: [] } } });
    const { result, rerender } = renderHook(
      ({ query }) => useProducts(query),
      { initialProps: { query: {} } }
    );
    // Change the query to trigger a refetch with params
    result.current.setQuery({ category: 'c1', minPrice: '100', maxPrice: '500', inStock: true, search: 'rose' });
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/products', expect.objectContaining({
        params: { category: 'c1', minPrice: '100', maxPrice: '500', inStock: 'true', q: 'rose' },
      }));
    });
  });

  it('surfaces an error message when the request fails', async () => {
    api.get.mockRejectedValue({ response: { data: { message: 'Failed to load products' } } });
    const { result } = renderHook(() => useProducts({}));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBe('Failed to load products');
  });

  it('clears params that are empty strings or missing', async () => {
    api.get.mockResolvedValue({ data: { data: { products: [] } } });
    const { result } = renderHook(() => useProducts({}));
    result.current.setQuery({ category: 'c1', minPrice: '', maxPrice: '', inStock: false, search: '' });
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith('/products', expect.objectContaining({
        params: { category: 'c1' },
      }));
    });
  });
});
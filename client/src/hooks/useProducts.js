import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useProducts(initialQuery = {}) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [query, setQuery] = useState(initialQuery);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = {};
        if (query.category) params.category = query.category;
        if (query.minPrice) params.minPrice = query.minPrice;
        if (query.maxPrice) params.maxPrice = query.maxPrice;
        if (query.inStock) params.inStock = 'true';
        if (query.search) params.q = query.search;
        if (query.sort) params.sort = query.sort;
        if (query.page) params.page = query.page;

        const { data } = await api.get('/products', {
          params,
          signal: controller.signal,
        });
        if (!cancelled) {
          setProducts(data.data.products);
          setPage(data.page ?? 1);
          setPages(data.pages ?? 1);
          setTotal(data.total ?? data.data.products.length);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled && err.name !== 'CanceledError') {
          setError(err.response?.data?.message || 'Failed to load products');
          setLoading(false);
        }
      }
    };

    fetchProducts();
    return () => { cancelled = true; controller.abort(); };
  }, [query.category, query.minPrice, query.maxPrice, query.inStock, query.search, query.sort, query.page]);

  return { products, loading, error, query, setQuery, page, pages, total };
}
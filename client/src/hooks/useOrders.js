import { useState, useEffect } from 'react';
import api from '../api/axios';

export function useOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchOrders = async () => {
      setLoading(true);
      try {
        const { data } = await api.get('/orders', { signal: controller.signal });
        if (!cancelled) {
          setOrders(data.data.orders);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled && err.name !== 'CanceledError') {
          setError(err.response?.data?.message || 'Failed to load orders');
          setLoading(false);
        }
      }
    };

    fetchOrders();
    return () => { cancelled = true; controller.abort(); };
  }, []);

  return { orders, loading, error };
}

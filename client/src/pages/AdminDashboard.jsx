import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';
import { formatZAR } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const statusTone = {
  Pending: 'bg-gold/15 text-gold-3 border-gold/30',
  Shipping: 'bg-blue-50 text-blue-700 border-blue-200',
  Delivered: 'bg-green-50 text-green-700 border-green-200',
};

const statusRing = {
  Pending: 'bg-gold/20 text-gold-3',
  Shipping: 'bg-blue-100 text-blue-700',
  Delivered: 'bg-green-100 text-green-700',
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/all');
      setOrders(data.data.orders);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const updateStatus = async (orderId, orderStatus) => {
    try {
      await api.put(`/orders/${orderId}/status`, { orderStatus });
      setOrders((prev) =>
        prev.map((o) => (o._id === orderId ? { ...o, orderStatus } : o))
      );
      toast.success('Status updated.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Update failed.');
    }
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.orderStatus === 'Pending').length,
    shipping: orders.filter((o) => o.orderStatus === 'Shipping').length,
    delivered: orders.filter((o) => o.orderStatus === 'Delivered').length,
    revenue: orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0),
  };

  const statCards = [
    { label: 'Total Orders', value: stats.total, tone: 'text-ink' },
    { label: 'Pending', value: stats.pending, tone: 'text-gold-3' },
    { label: 'Shipping', value: stats.shipping, tone: 'text-blue-600' },
    { label: 'Revenue', value: formatZAR(stats.revenue), tone: 'text-green-700' },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="eyebrow mb-2">Fulfilment suite</p>
        <h1 className="font-display text-4xl text-ink">Admin Dashboard</h1>
      </header>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="card-lux p-5">
            <p className="text-sm text-ink/55">{s.label}</p>
            <p className={`font-display text-3xl font-semibold mt-1 ${s.tone}`}>{s.value}</p>
          </div>
        ))}
      </div>

      <div className="card-lux overflow-hidden">
        <div className="p-5 border-b border-gold/15 flex items-center justify-between">
          <h2 className="font-display text-xl text-ink">All Orders</h2>
          <span className="chip bg-ink/5 text-ink/60">{orders.length} total</span>
        </div>
        {loading ? (
          <div className="p-10 text-center text-ink/55">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-10 text-center text-ink/55">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-ivory text-left">
                <tr>
                  <th className="px-5 py-3 font-medium text-ink/55 tracking-wide uppercase text-xs">Order ID</th>
                  <th className="px-5 py-3 font-medium text-ink/55 tracking-wide uppercase text-xs">Customer</th>
                  <th className="px-5 py-3 font-medium text-ink/55 tracking-wide uppercase text-xs">Total</th>
                  <th className="px-5 py-3 font-medium text-ink/55 tracking-wide uppercase text-xs">Status</th>
                  <th className="px-5 py-3 font-medium text-ink/55 tracking-wide uppercase text-xs">Placed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold/10">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-ivory/60 transition-colors">
                    <td className="px-5 py-3">
                      <span className="inline-flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${statusRing[order.orderStatus] || 'bg-ink/20'}`} />
                        <span className="font-mono text-xs">{order._id.slice(-8).toUpperCase()}</span>
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink">{order.userId?.firstName} {order.userId?.lastName}</td>
                    <td className="px-5 py-3 font-semibold text-gold-3">{formatZAR(order.totalPrice)}</td>
                    <td className="px-5 py-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className={`chip cursor-pointer border ${statusTone[order.orderStatus] || 'bg-ink/5 text-ink/60 border-ink/10'} outline-none px-3 py-1`}
                      >
                        {['Pending', 'Shipping', 'Delivered'].map((s) => (
                          <option key={s} value={s} className="text-ink">{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-5 py-3 text-xs text-ink/50">
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
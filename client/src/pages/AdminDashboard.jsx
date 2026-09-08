import { useState, useEffect } from 'react';
import api from '../api/axios';
import { formatZAR } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/orders/all');
      setOrders(data.data.orders);
    } catch {
      toast.error('Failed to load orders.');
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Admin Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Total Orders</p>
          <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Shipping</p>
          <p className="text-2xl font-bold text-blue-600">{stats.shipping}</p>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-sm text-gray-500">Revenue</p>
          <p className="text-2xl font-bold text-green-600">{formatZAR(stats.revenue)}</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="text-lg font-semibold text-gray-900">All Orders</h2>
        </div>
        {loading ? (
          <div className="p-8 text-center text-gray-500">Loading...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No orders yet.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 text-left">
                <tr>
                  <th className="px-4 py-3 font-medium text-gray-600">Order ID</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Customer</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Total</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Status</th>
                  <th className="px-4 py-3 font-medium text-gray-600">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-mono text-xs">{order._id.slice(-8).toUpperCase()}</td>
                    <td className="px-4 py-3">{order.userId?.firstName} {order.userId?.lastName}</td>
                    <td className="px-4 py-3 font-semibold text-indigo-700">{formatZAR(order.totalPrice)}</td>
                    <td className="px-4 py-3">
                      <select
                        value={order.orderStatus}
                        onChange={(e) => updateStatus(order._id, e.target.value)}
                        className="border rounded px-2 py-1 text-xs"
                      >
                        {['Pending', 'Shipping', 'Delivered'].map((s) => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-500">
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

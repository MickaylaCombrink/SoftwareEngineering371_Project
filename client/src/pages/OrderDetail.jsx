import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatZAR } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const statusColors = {
  Pending: 'bg-yellow-100 text-yellow-800',
  Shipping: 'bg-blue-100 text-blue-800',
  Delivered: 'bg-green-100 text-green-800',
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/orders/${id}`);
        setOrder(data.data.order);
      } catch {
        toast.error('Order not found.');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <button onClick={() => navigate('/orders')} className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-4">
        &larr; Back to orders
      </button>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">
          Order #{order._id.slice(-8).toUpperCase()}
        </h1>
        <span className={`inline-block px-3 py-1 rounded text-sm font-medium ${statusColors[order.orderStatus] || 'bg-gray-100 text-gray-800'}`}>
          {order.orderStatus}
        </span>
      </div>

      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Items</h2>
        <div className="divide-y">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity} x {formatZAR(item.unitPrice)}</p>
              </div>
              <p className="font-semibold text-indigo-700">{formatZAR(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-indigo-700">{formatZAR(order.totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}

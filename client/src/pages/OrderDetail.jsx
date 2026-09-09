import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { formatZAR } from '../utils/formatCurrency';
import toast from 'react-hot-toast';

const statusStyles = {
  Pending: 'bg-gold/15 text-gold-3 border border-gold/30',
  Shipping: 'bg-blue-50 text-blue-700 border border-blue-200',
  Delivered: 'bg-green-50 text-green-700 border border-green-200',
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
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-5">
          <div className="h-9 bg-ink/10 rounded w-1/3"></div>
          <div className="h-40 bg-blush rounded-2xl"></div>
        </div>
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
      <button onClick={() => navigate('/orders')} className="inline-flex items-center gap-2 text-sm text-gold-3 hover:text-ink mb-6 tracking-wide uppercase transition-colors">
        <span aria-hidden>&larr;</span> Back to orders
      </button>
      <div className="flex items-center justify-between flex-wrap gap-3 mb-6">
        <h1 className="font-display text-3xl text-ink">
          Order #{order._id.slice(-8).toUpperCase()}
        </h1>
        <span className={`inline-block chip ${statusStyles[order.orderStatus] || 'bg-ink/5 text-ink/60'}`}>
          {order.orderStatus}
        </span>
      </div>

      <div className="card-lux p-6">
        <p className="eyebrow mb-4">Items</p>
        <div className="divide-y divide-gold/15">
          {order.items?.map((item, i) => (
            <div key={i} className="flex justify-between py-4">
              <div>
                <p className="font-display text-lg text-ink">{item.name}</p>
                <p className="text-sm text-ink/55 mt-0.5">Qty: {item.quantity} x {formatZAR(item.unitPrice)}</p>
              </div>
              <p className="font-display font-semibold text-gold-3">{formatZAR(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="border-t border-gold/20 mt-4 pt-4 flex justify-between font-display text-xl">
          <span className="text-ink">Total</span>
          <span className="text-gold-3">{formatZAR(order.totalPrice)}</span>
        </div>
      </div>
    </div>
  );
}
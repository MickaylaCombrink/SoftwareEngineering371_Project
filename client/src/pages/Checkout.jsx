import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatZAR } from '../utils/formatCurrency';
import toast from 'react-hot-toast';
import api from '../api/axios';

export default function Checkout() {
  const { items, subtotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error('Your cart is empty.');
      return;
    }
    setSubmitting(true);
    try {
      const { data } = await api.post('/orders/checkout');
      clearCart();
      toast.success('Order placed successfully!');
      navigate(`/orders/${data.data.order._id}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Checkout failed.');
    } finally {
      setSubmitting(false);
    }
  };

  if (items.length === 0 && !submitting) {
    navigate('/cart');
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Checkout</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4 mb-2">Review your order</h2>
        <div className="divide-y">
          {items.map((item) => (
            <div key={item.productId} className="flex justify-between py-3">
              <div>
                <p className="font-medium text-gray-900">{item.name}</p>
                <p className="text-sm text-gray-500">Qty: {item.quantity} x {formatZAR(item.unitPrice)}</p>
              </div>
              <p className="font-semibold text-indigo-700">{formatZAR(item.unitPrice * item.quantity)}</p>
            </div>
          ))}
        </div>
        <div className="border-t mt-2 pt-4 flex justify-between font-bold text-lg">
          <span>Total</span>
          <span className="text-indigo-700">{formatZAR(subtotal)}</span>
        </div>
        <div className="flex items-center justify-between mt-6">
          <Link to="/cart" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium">
            &larr; Back to cart
          </Link>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-amber-500 hover:bg-amber-600 text-indigo-900 font-bold py-3 px-6 rounded-lg transition-colors disabled:opacity-50"
          >
            {submitting ? 'Placing Order...' : 'Place Order'}
          </button>
        </div>
      </div>
    </div>
  );
}

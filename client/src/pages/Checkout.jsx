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
      const { data } = await api.post('/orders');
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
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="eyebrow mb-2">Almost there</p>
        <h1 className="font-display text-4xl text-ink">Checkout</h1>
      </header>

      <form onSubmit={handleSubmit} className="grid lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3 card-lux p-6">
          <p className="eyebrow mb-4">Step 1 of 2</p>
          <h2 className="font-display text-2xl text-ink mb-2">Review your order</h2>
          <div className="divide-y divide-gold/15">
            {items.map((item) => (
              <div key={item.productId} className="flex justify-between py-4">
                <div>
                  <p className="font-display text-lg text-ink">{item.name}</p>
                  <p className="text-sm text-ink/55 mt-0.5">Qty: {item.quantity} x {formatZAR(item.unitPrice)}</p>
                </div>
                <p className="font-display font-semibold text-gold-3">{formatZAR(item.unitPrice * item.quantity)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="lg:col-span-2 space-y-5">
          <div className="card-lux p-6">
            <p className="eyebrow mb-4">Step 2 of 2</p>
            <h2 className="font-display text-2xl text-ink mb-4">Order Summary</h2>
            <div className="flex justify-between text-sm text-ink/60 mb-3">
              <span>Subtotal ({items.length} item{items.length !== 1 ? 's' : ''})</span>
              <span className="font-medium text-ink">{formatZAR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-ink/60 mb-3">
              <span>Shipping</span>
              <span className="text-green-700 font-medium">Free</span>
            </div>
            <div className="border-t border-gold/20 my-4"></div>
            <div className="flex justify-between font-display text-xl text-ink mb-6">
              <span>Total</span>
              <span className="text-gold-3">{formatZAR(subtotal)}</span>
            </div>
            <button type="submit" disabled={submitting} className="w-full btn-gold text-base disabled:opacity-60">
              {submitting ? 'Placing Order...' : 'Place Order'}
            </button>
            <Link to="/cart" className="block text-center text-sm text-gold-3 hover:text-ink mt-4 tracking-wide uppercase transition-colors">
              &larr; Back to cart
            </Link>
          </div>
          <p className="text-xs text-ink/45 leading-relaxed px-2">
            By placing this order you agree to our terms. All orders are shipped
            sealed and authenticated within 24 hours.
          </p>
        </div>
      </form>
    </div>
  );
}
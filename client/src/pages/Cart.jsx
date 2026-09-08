import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatZAR } from '../utils/formatCurrency';
import CartItem from '../components/CartItem';

export default function Cart() {
  const { items, subtotal, itemCount, fetchCart, loading } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="animate-pulse space-y-5">
          <div className="h-9 bg-ink/10 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-blush rounded-2xl"></div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gold/15 text-gold-3 flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
          </svg>
        </div>
        <h2 className="font-display text-3xl text-ink mb-2">Your cart is empty</h2>
        <p className="text-ink/55 mb-8">Start shopping to fill your cart with amazing fragrances.</p>
        <Link to="/products" className="btn-gold text-base">
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <header className="mb-8">
        <p className="eyebrow mb-2">Your selection</p>
        <h1 className="font-display text-4xl text-ink">Shopping Cart ({itemCount} items)</h1>
      </header>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 card-lux p-6">
          {items.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </div>

        <div className="w-full lg:w-96">
          <div className="card-lux p-6 sticky top-24">
            <h3 className="font-display text-xl text-ink mb-5">Order Summary</h3>
            <div className="flex justify-between text-sm text-ink/60 mb-3">
              <span>Subtotal ({itemCount} items)</span>
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
            <button onClick={() => navigate('/checkout')} className="w-full btn-gold text-base">
              Proceed to Checkout
            </button>
            <Link to="/products" className="block text-center text-sm text-gold-3 hover:text-ink mt-4 font-medium tracking-wide uppercase transition-colors">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
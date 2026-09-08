import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { formatZAR } from '../utils/formatCurrency';
import CartItem from '../components/CartItem';
import toast from 'react-hot-toast';

export default function Cart() {
  const { items, subtotal, itemCount, fetchCart, loading } = useCart();
  const navigate = useNavigate();

  useEffect(() => { fetchCart(); }, [fetchCart]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-200 rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 mx-auto text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your cart is empty</h2>
        <p className="text-gray-500 mb-6">Start shopping to fill your cart with amazing fragrances.</p>
        <Link
          to="/products"
          className="inline-block bg-indigo-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Browse Products
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart ({itemCount} items)</h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          {items.map((item) => (
            <CartItem key={item.productId} item={item} />
          ))}
        </div>

        <div className="w-full lg:w-80">
          <div className="bg-white rounded-lg shadow p-6 sticky top-24">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Order Summary</h3>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Subtotal ({itemCount} items)</span>
              <span>{formatZAR(subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Shipping</span>
              <span>Free</span>
            </div>
            <div className="border-t my-4"></div>
            <div className="flex justify-between font-bold text-lg text-gray-900 mb-6">
              <span>Total</span>
              <span className="text-indigo-700">{formatZAR(subtotal)}</span>
            </div>
            <button
              onClick={() => navigate('/checkout')}
              className="w-full bg-amber-500 hover:bg-amber-600 text-indigo-900 font-bold py-3 rounded-lg transition-colors"
            >
              Proceed to Checkout
            </button>
            <Link
              to="/products"
              className="block text-center text-indigo-600 hover:text-indigo-800 text-sm mt-3 font-medium"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useCart } from '../context/CartContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';
import { Spinner } from '../components/Spinner';
import { Link, useNavigate } from 'react-router-dom';
import { OrdersAPI } from '../api/endpoints';
import { useState } from 'react';

export function CartPage() {
  const { cart, subtotal, itemCount, loading, setQuantity, removeItem, clearCart } = useCart();
  const [error, setError] = useState(null);
  const [checkingOut, setCheckingOut] = useState(false);
  const navigate = useNavigate();

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;
    setError(null);
    try {
      await setQuantity(productId, newQty);
    } catch (err) {
      setError(err.message || 'Failed to update quantity.');
    }
  };

  const handleRemove = async (productId) => {
    setError(null);
    try {
      await removeItem(productId);
    } catch (err) {
      setError(err.message || 'Failed to remove item.');
    }
  };

  // No pre-checkout refetch: the server re-validates stock atomically and
  // returns a 422 we surface verbatim
  const handleCheckout = async () => {
    setCheckingOut(true);
    setError(null);
    try {
      await OrdersAPI.checkout();
      clearCart();
      navigate('/orders');
    } catch (err) {
      setError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setCheckingOut(false);
    }
  };

  if (loading) return <Spinner />;

  if (cart.length === 0) {
    return (
      <div className="cart-page">
        <h1 className="cart-page__title">Shopping Cart</h1>
        <EmptyState message="Your cart is empty." />
        <Link to="/" className="cart-page__continue">Continue shopping</Link>
      </div>
    );
  }

  return (
    <div className="cart-page">
      <h1 className="cart-page__title">Shopping Cart</h1>

      <ErrorBanner message={error} />

      <div className="cart-page__items">
        {cart.map((item) => (
          <div key={item.productId} className="cart-item">
            <div className="cart-item__info">
              <Link to={`/products/${item.productId}`} className="cart-item__name">
                {item.name}
              </Link>
              <p className="cart-item__price">${item.unitPrice.toFixed(2)} each</p>
            </div>
            <div className="cart-item__controls">
              <div className="cart-item__qty">
                <button
                  className="cart-item__qty-btn"
                  onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                  disabled={item.quantity <= 1}
                >
                  -
                </button>
                <span className="cart-item__qty-value">{item.quantity}</span>
                <button
                  className="cart-item__qty-btn"
                  onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                >
                  +
                </button>
              </div>
              <p className="cart-item__line-total">${(item.unitPrice * item.quantity).toFixed(2)}</p>
              <button
                className="cart-item__remove"
                onClick={() => handleRemove(item.productId)}
              >
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="cart-page__summary">
        <div className="cart-page__summary-row">
          <span>Items ({itemCount})</span>
          <span>${subtotal.toFixed(2)}</span>
        </div>
        <button
          className="cart-page__checkout-btn"
          onClick={handleCheckout}
          disabled={checkingOut}
        >
          {checkingOut ? 'Processing...' : 'Checkout'}
        </button>
      </div>
    </div>
  );
}

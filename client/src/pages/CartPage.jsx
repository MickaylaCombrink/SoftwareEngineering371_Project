import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { formatPrice, deliveryFee, FREE_DELIVERY_THRESHOLD } from '../utils/format';

export function CartPage() {
  const { cart, subtotal, itemCount, loading, setQuantity, removeItem } = useCart();
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const shipping = deliveryFee(subtotal);
  const total = subtotal + shipping;
  const qualifiesForFreeDelivery = subtotal >= FREE_DELIVERY_THRESHOLD;

  const progressPercent = Math.min((subtotal / FREE_DELIVERY_THRESHOLD) * 100, 100);

  const handleQuantityChange = async (productId, newQty) => {
    if (newQty < 1) return;
    setError(null);
    setBusyId(productId);
    try {
      await setQuantity(productId, newQty);
    } catch (err) {
      setError(err.message || 'Could not update that quantity.');
    } finally {
      setBusyId(null);
    }
  };

  const handleRemove = async (productId) => {
    setError(null);
    setBusyId(productId);
    try {
      await removeItem(productId);
    } catch (err) {
      setError(err.message || 'Could not remove that item.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="cart-dark">
        <div className="spinner" role="status" aria-label="Loading your cart…" />
      </div>
    );
  }

  return (
    <div className="cart-dark">
      <div className="cart-dark__left">
        <div className="cart-dark__header">
          <h1 className="cart-dark__title">Your cart</h1>
          <span className="cart-dark__count">
            {itemCount} {itemCount === 1 ? 'item' : 'items'}
          </span>
        </div>

        {itemCount > 0 &&
          (qualifiesForFreeDelivery ? (
            <p className="cart-dark__delivery-msg cart-dark__delivery-msg--success">
              Your order qualifies for free nationwide delivery
            </p>
          ) : (
            <p className="cart-dark__delivery-msg">
              Add {formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free nationwide delivery
            </p>
          ))}

        {itemCount > 0 && (
          <div className="cart-dark__progress-wrap">
            <div className="cart-dark__progress-track">
              <div
                className="cart-dark__progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <div className="cart-dark__progress-labels">
              <span>{formatPrice(subtotal)}</span>
              <span>{formatPrice(FREE_DELIVERY_THRESHOLD)}</span>
            </div>
          </div>
        )}

        <ErrorBanner message={error} />

        {cart.length === 0 ? (
          <div className="cart-dark__empty">
            <p>Your cart is empty</p>
            <Link to="/products" className="cart-dark__continue-link">
              Continue shopping
            </Link>
          </div>
        ) : (
          <div className="cart-dark__items">
            {cart.map((item) => (
              <div key={item.productId} className="cart-dark-item">
                <div className="cart-dark-item__image-placeholder" />

                <div className="cart-dark-item__details">
                  <Link to={`/products/${item.productId}`} className="cart-dark-item__name">
                    {item.name}
                  </Link>
                  <p className="cart-dark-item__variant">{formatPrice(item.unitPrice)} each</p>

                  <div className="cart-dark-item__controls">
                    <div className="cart-dark-item__qty">
                      <button
                        className="cart-dark-item__qty-btn"
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        disabled={item.quantity <= 1 || busyId === item.productId}
                        aria-label={`Decrease quantity of ${item.name}`}
                      >
                        −
                      </button>
                      <span className="cart-dark-item__qty-value">{item.quantity}</span>
                      <button
                        className="cart-dark-item__qty-btn"
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        disabled={busyId === item.productId}
                        aria-label={`Increase quantity of ${item.name}`}
                      >
                        +
                      </button>
                    </div>

                    <span className="cart-dark-item__price">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>

                <button
                  className="cart-dark-item__remove"
                  onClick={() => handleRemove(item.productId)}
                  disabled={busyId === item.productId}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}

        {cart.length > 0 && (
          <Link to="/products" className="cart-dark__continue-link">
            Continue shopping
          </Link>
        )}
      </div>

      <div className="cart-dark__right">
        <div className="cart-dark__summary">
          <h2 className="cart-dark__summary-title">Order summary</h2>

          <div className="cart-dark__summary-table">
            <div className="cart-dark__summary-header">
              <span>Product</span>
              <span>Quantity</span>
              <span>Total</span>
            </div>
            {cart.map((item) => (
              <div key={item.productId} className="cart-dark__summary-row">
                <span className="cart-dark__summary-product">{item.name}</span>
                <span>{item.quantity}</span>
                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="cart-dark__summary-totals">
            <div className="cart-dark__summary-line">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="cart-dark__summary-line">
              <span>Delivery</span>
              <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
            </div>
            <div className="cart-dark__summary-divider" />
            <div className="cart-dark__summary-line cart-dark__summary-line--total">
              <span>Total</span>
              <span>{formatPrice(total)}</span>
            </div>
            <p className="cart-dark__summary-vat">Includes VAT at 15%</p>
          </div>

          <Link to="/checkout" className="cart-dark__checkout-btn">
            Proceed to checkout
          </Link>
          <p className="cart-dark__secure">Secure checkout</p>
        </div>
      </div>
    </div>
  );
}
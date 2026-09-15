import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { ErrorBanner } from '../components/ErrorBanner';
import { ProductImage } from '../components/ProductImage';
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
      <div className="cart-page">
        <div className="spinner" role="status" aria-label="Loading your cart…" />
      </div>
    );
  }

  return (
    <div className="cart-page">
      <header className="cart-page__header">
        <div>
          <p className="cart-page__eyebrow">Scentigue · Your selection</p>
          <h1 className="cart-page__title">Your cart</h1>
        </div>
        <span className="cart-page__count">
          {itemCount} {itemCount === 1 ? 'item' : 'items'}
        </span>
      </header>

      {cart.length === 0 ? (
        <div className="cart-empty">
          <h2 className="cart-empty__title">Your cart is empty</h2>
          <p className="cart-empty__body">
            A fragrance to remember is one add away.
          </p>
          <Link to="/products" className="cart-empty__cta">
            Browse the collection
          </Link>
        </div>
      ) : (
        <div className="cart-page__body">
          <section className="cart-page__list" aria-label="Cart items">
            <div className="cart-free">
              <p
                className={`cart-free__msg${
                  qualifiesForFreeDelivery ? ' cart-free__msg--success' : ''
                }`}
              >
                {qualifiesForFreeDelivery
                  ? 'Your order qualifies for free nationwide delivery'
                  : `Add ${formatPrice(FREE_DELIVERY_THRESHOLD - subtotal)} more for free nationwide delivery`}
              </p>
              <div className="cart-free__track">
                <div
                  className="cart-free__fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <div className="cart-free__labels">
                <span>{formatPrice(subtotal)}</span>
                <span>{formatPrice(FREE_DELIVERY_THRESHOLD)}</span>
              </div>
            </div>

            <ErrorBanner message={error} />

            <div className="cart-list">
              {cart.map((item) => (
                <div key={item.productId} className="cart-item">
                  <Link
                    to={`/products/${item.productId}`}
                    className="cart-item__thumb"
                    aria-label={`View ${item.name}`}
                  >
                    <ProductImage product={item} size={96} />
                  </Link>

                  <div className="cart-item__details">
                    <Link
                      to={`/products/${item.productId}`}
                      className="cart-item__name"
                    >
                      {item.name}
                    </Link>
                    <p className="cart-item__meta">
                      {formatPrice(item.unitPrice)} each
                    </p>

                    <div className="cart-item__controls">
                      <div className="cart-item__qty">
                        <button
                          className="cart-item__qty-btn"
                          onClick={() =>
                            handleQuantityChange(item.productId, item.quantity - 1)
                          }
                          disabled={item.quantity <= 1 || busyId === item.productId}
                          aria-label={`Decrease quantity of ${item.name}`}
                        >
                          −
                        </button>
                        <span className="cart-item__qty-value">{item.quantity}</span>
                        <button
                          className="cart-item__qty-btn"
                          onClick={() =>
                            handleQuantityChange(item.productId, item.quantity + 1)
                          }
                          disabled={busyId === item.productId}
                          aria-label={`Increase quantity of ${item.name}`}
                        >
                          +
                        </button>
                      </div>

                      <button
                        className="cart-item__remove"
                        onClick={() => handleRemove(item.productId)}
                        disabled={busyId === item.productId}
                      >
                        Remove
                      </button>
                    </div>
                  </div>

                  <div className="cart-item__total">
                    <span className="cart-item__total-label">Line total</span>
                    <span className="cart-item__total-value">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <Link to="/products" className="cart-page__link">
              Continue shopping
            </Link>
          </section>

          <aside className="cart-page__summary" aria-label="Order summary">
            <div className="cart-summary">
              <p className="cart-summary__eyebrow">Order summary</p>

              <div className="cart-summary__lines">
                {cart.map((item) => (
                  <div key={item.productId} className="cart-summary__row">
                    <span className="cart-summary__thumb">
                      <ProductImage product={item} size={44} />
                    </span>
                    <span className="cart-summary__desc">
                      <span className="cart-summary__name">{item.name}</span>
                      <span className="cart-summary__qty">× {item.quantity}</span>
                    </span>
                    <span className="cart-summary__amount">
                      {formatPrice(item.unitPrice * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="cart-summary__totals">
                <div className="cart-summary__line">
                  <span>Subtotal</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="cart-summary__line">
                  <span>Delivery</span>
                  <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
                </div>
                <div className="cart-summary__rule" />
                <div className="cart-summary__line cart-summary__line--total">
                  <span>Total</span>
                  <span>{formatPrice(total)}</span>
                </div>
                <p className="cart-summary__vat">Includes VAT at 15%</p>
              </div>

              <Link to="/checkout" className="cart-summary__checkout">
                Proceed to checkout
              </Link>
              <p className="cart-summary__secure">Secure checkout · 14-day returns</p>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}
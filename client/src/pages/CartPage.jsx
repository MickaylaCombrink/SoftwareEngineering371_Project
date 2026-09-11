import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { Bottle } from '../components/Bottle';
import { formatPrice, deliveryFee, FREE_DELIVERY_THRESHOLD } from '../utils/format';

export function CartPage() {
  const { cart, subtotal, itemCount, loading, setQuantity, removeItem } = useCart();
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);

  const shipping = deliveryFee(subtotal);
  const total = subtotal + shipping;
  const awayFromFree = FREE_DELIVERY_THRESHOLD - subtotal;

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
      <div className="container-xxl py-5 d-flex justify-content-center">
        <div className="spinner-border spinner-gold" role="status">
          <span className="visually-hidden">Loading your cart…</span>
        </div>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container-xxl py-5 text-center">
        <h1 className="display-page mb-3">Your cart is empty</h1>
        <p className="text-muted-gold mb-4">Nothing here yet — go and find something you like.</p>
        <Link to="/products" className="btn btn-primary">
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container-xxl py-4 py-lg-5">
      <h1 className="display-page mb-4">Your cart</h1>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="row g-4 g-lg-5">
        {/* Line items */}
        <div className="col-12 col-lg-7">
          <ul className="list-unstyled mb-0">
            {cart.map((item) => (
              <li
                className="d-flex flex-wrap align-items-center gap-3 py-3 border-bottom"
                style={{ borderColor: 'var(--c-border)' }}
                key={item.productId}
              >
                <Link to={`/products/${item.productId}`} className="bottle bottle--sm">
                  <Bottle seed={item.name} size={38} />
                </Link>

                <div className="flex-grow-1" style={{ minWidth: '9rem' }}>
                  <Link
                    to={`/products/${item.productId}`}
                    className="d-block text-decoration-none"
                    style={{ color: 'var(--c-text)' }}
                  >
                    {item.name}
                  </Link>
                  <span className="d-block text-muted-gold small mt-1">
                    {formatPrice(item.unitPrice)} each
                  </span>
                </div>

                <div className="qty-group">
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                    disabled={item.quantity <= 1 || busyId === item.productId}
                    aria-label={`Decrease quantity of ${item.name}`}
                  >
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button
                    type="button"
                    onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                    disabled={busyId === item.productId}
                    aria-label={`Increase quantity of ${item.name}`}
                  >
                    +
                  </button>
                </div>

                <span className="serif fs-4" style={{ minWidth: '6rem', textAlign: 'right' }}>
                  {formatPrice(item.unitPrice * item.quantity)}
                </span>

                <button
                  type="button"
                  className="btn btn-link-gold btn-sm"
                  onClick={() => handleRemove(item.productId)}
                  disabled={busyId === item.productId}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>

          <Link to="/products" className="btn btn-link-gold btn-sm ps-0 mt-3">
            ← Continue shopping
          </Link>
        </div>

        {/* Summary */}
        <div className="col-12 col-lg-5">
          <div className="panel p-3 p-md-4" style={{ position: 'sticky', top: '1.5rem' }}>
            <h2 className="serif fs-3 mb-4">Summary</h2>

            <dl className="mb-4">
              <div className="d-flex justify-content-between py-2">
                <dt className="fw-normal text-muted-gold">Items ({itemCount})</dt>
                <dd className="mb-0">{formatPrice(subtotal)}</dd>
              </div>
              <div className="d-flex justify-content-between py-2">
                <dt className="fw-normal text-muted-gold">Delivery</dt>
                <dd className={`mb-0${shipping === 0 ? ' text-free' : ''}`}>
                  {shipping === 0 ? 'Free' : formatPrice(shipping)}
                </dd>
              </div>
              <div
                className="d-flex justify-content-between align-items-baseline border-top pt-3 mt-2"
                style={{ borderColor: 'var(--c-border)' }}
              >
                <dt className="serif fs-4 fw-normal">Total</dt>
                <dd className="serif fs-3 mb-0">{formatPrice(total)}</dd>
              </div>
            </dl>

            {awayFromFree > 0 && (
              <p className="form-text mb-3">
                Add {formatPrice(awayFromFree)} more for free delivery.
              </p>
            )}

            {/* Goes to the checkout page — delivery details and payment are
                collected there, so an order is never placed straight from here */}
            <Link to="/checkout" className="btn btn-primary w-100">
              Proceed to checkout
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import { OrdersAPI } from '../api/endpoints';
import { useAuth } from '../context/AuthContext';
import { Bottle } from '../components/Bottle';
import { CheckIcon } from '../components/Icons';
import {
  formatPrice,
  formatDate,
  deliveryFee,
  orderReference,
  deliveryWindow,
} from '../utils/format';

export function OrderConfirmation() {
  const { id } = useParams();
  const location = useLocation();
  const { user } = useAuth();

  // Delivery details and the payment result arrive via router state from
  // checkout. Neither is on the order itself, so a refresh omits those panels.
  const delivery = location.state?.delivery || null;
  const payment = location.state?.payment || null;

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetched rather than passed through state, so the page survives a refresh
  // and can be reopened from the order history.
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const found = await OrdersAPI.get(id);
        if (!cancelled) setOrder(found);
      } catch (err) {
        if (!cancelled) setError(err.message || 'That order could not be loaded.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [id]);

  if (loading) {
    return (
      <div className="container-xxl py-5 d-flex justify-content-center">
        <div className="spinner-border spinner-gold" role="status">
          <span className="visually-hidden">Loading your order…</span>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="container-xxl py-5 text-center">
        <h1 className="display-page mb-3">Order not found</h1>
        <p className="text-muted-gold mb-4">{error}</p>
        <Link to="/orders" className="btn btn-primary">
          View my orders
        </Link>
      </div>
    );
  }

  const shipping = deliveryFee(order.totalPrice);
  const reference = orderReference(order._id);

  return (
    <div className="container-xxl py-4 py-lg-5">
      <div className="row justify-content-center">
        <div className="col-12 col-lg-8">
          <div className="text-center mb-4 mb-lg-5">
            <span
              className="d-inline-flex align-items-center justify-content-center mb-3"
              style={{
                width: '4rem',
                height: '4rem',
                borderRadius: '50%',
                border: '1px solid var(--c-success-dot)',
                color: 'var(--c-success)',
              }}
            >
              <CheckIcon />
            </span>
            <h1 className="display-page mb-3">Thank you{user?.firstName ? `, ${user.firstName}` : ''}</h1>
            <p className="text-muted-gold fs-6 mb-0">
              Your order is confirmed. We’ve emailed the details to {user?.email}.
            </p>
          </div>

          <div className="panel">
            {/* Order meta */}
            <div
              className="row g-3 p-3 p-md-4 border-bottom surface-alt"
              style={{ borderColor: 'var(--c-border)' }}
            >
              <div className="col-12 col-sm-4">
                <div className="meta mb-1">Order number</div>
                <div>{reference}</div>
              </div>
              <div className="col-6 col-sm-4">
                <div className="meta mb-1">Placed</div>
                <div>{formatDate(order.createdAt)}</div>
              </div>
              <div className="col-6 col-sm-4">
                <div className="meta mb-1">Estimated delivery</div>
                <div>{deliveryWindow(order.createdAt)}</div>
              </div>
            </div>

            {/* Items */}
            <div className="p-3 p-md-4">
              <ul className="list-unstyled mb-0">
                {order.items.map((item) => (
                  <li
                    className="d-flex gap-3 pb-3 mb-3 border-bottom"
                    style={{ borderColor: 'var(--c-border)' }}
                    key={item.productId}
                  >
                    <span className="bottle bottle--sm">
                      <Bottle seed={item.name} size={38} />
                    </span>
                    <span className="flex-grow-1">
                      <span className="d-block">{item.name}</span>
                      <span className="d-block text-muted-gold small mt-1">Qty {item.quantity}</span>
                    </span>
                    <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                  </li>
                ))}
              </ul>

              <dl className="mb-0">
                <div className="d-flex justify-content-between py-2">
                  <dt className="fw-normal text-muted-gold">Subtotal</dt>
                  <dd className="mb-0">{formatPrice(order.totalPrice)}</dd>
                </div>
                <div className="d-flex justify-content-between py-2">
                  <dt className="fw-normal text-muted-gold">Delivery — courier to your door</dt>
                  <dd className={`mb-0${shipping === 0 ? ' text-free' : ''}`}>
                    {shipping === 0 ? 'Free' : formatPrice(shipping)}
                  </dd>
                </div>
                <div
                  className="d-flex justify-content-between align-items-baseline border-top pt-3 mt-2"
                  style={{ borderColor: 'var(--c-border)' }}
                >
                  <dt className="serif fs-4 fw-normal">Total</dt>
                  <dd className="serif fs-3 mb-0">{formatPrice(order.totalPrice + shipping)}</dd>
                </div>
              </dl>
            </div>

            {/* Delivery and payment */}
            <div
              className="row g-4 p-3 p-md-4 border-top"
              style={{ borderColor: 'var(--c-border)' }}
            >
              {delivery && (
                <div className="col-12 col-sm-6">
                  <div className="meta mb-2">Delivering to</div>
                  <address className="mb-0" style={{ lineHeight: 1.7 }}>
                    {delivery.firstName} {delivery.lastName}
                    <br />
                    {delivery.street}, {delivery.suburb}
                    <br />
                    {delivery.city}, {delivery.postalCode}
                    <br />
                    {delivery.province}
                  </address>
                </div>
              )}
              <div className="col-12 col-sm-6">
                <div className="meta mb-2">Payment</div>
                {payment ? (
                  <p className="mb-0" style={{ lineHeight: 1.7 }}>
                    {payment.method === 'card'
                      ? `${payment.brand} ending ${payment.last4}`
                      : `Instant EFT — ${payment.brand}`}
                    <br />
                    <span className="text-free">Approved</span>
                    <span className="text-muted-gold"> · {payment.reference}</span>
                    <br />
                    <span className="text-muted-gold small">
                      Simulated payment. Recorded server-side as {order.paymentStatus}.
                    </span>
                  </p>
                ) : (
                  <p className="mb-0 text-muted-gold" style={{ lineHeight: 1.7 }}>
                    Status: {order.paymentStatus}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="d-flex flex-column flex-sm-row gap-3 mt-4">
            <Link to="/orders" className="btn btn-primary flex-grow-1">
              Track this order
            </Link>
            <Link to="/products" className="btn btn-outline-gold flex-grow-1">
              Continue shopping
            </Link>
          </div>

          <p className="text-muted-gold small text-center mt-4 mb-0">
            Questions about this order? Quote {reference} when you contact us.
          </p>
        </div>
      </div>
    </div>
  );
}

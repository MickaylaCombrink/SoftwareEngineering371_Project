import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OrdersAPI } from '../api/endpoints';
import { Bottle } from '../components/Bottle';
import { formatPrice, formatDate, orderReference } from '../utils/format';

const STATUS_CLASS = {
  Pending: 'badge',
  Shipping: 'badge',
  Delivered: 'badge badge--ok',
};

export function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    OrdersAPI.list()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load your orders.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="container-xxl py-5 d-flex justify-content-center">
        <div className="spinner-border spinner-gold" role="status">
          <span className="visually-hidden">Loading your orders…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-xxl py-5">
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="container-xxl py-5 text-center">
        <h1 className="display-page mb-3">No orders yet</h1>
        <p className="text-muted-gold mb-4">Your completed orders will appear here.</p>
        <Link to="/products" className="btn btn-primary">
          Shop the collection
        </Link>
      </div>
    );
  }

  return (
    <div className="container-xxl py-4 py-lg-5">
      <h1 className="display-page mb-4">Your orders</h1>

      <div className="d-flex flex-column gap-4">
        {orders.map((order) => (
          <div className="panel" key={order._id}>
            <div
              className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 p-md-4 border-bottom surface-alt"
              style={{ borderColor: 'var(--c-border)' }}
            >
              <div>
                <div className="meta mb-1">Order</div>
                <div>{orderReference(order._id)}</div>
              </div>
              <div>
                <div className="meta mb-1">Placed</div>
                <div>{formatDate(order.createdAt)}</div>
              </div>
              <span className={STATUS_CLASS[order.orderStatus] || 'badge'}>
                {order.orderStatus}
              </span>
            </div>

            <ul className="list-unstyled mb-0 p-3 p-md-4">
              {order.items.map((item) => (
                <li className="d-flex align-items-center gap-3 py-2" key={item.productId}>
                  <span className="bottle bottle--sm">
                    <Bottle seed={item.name} size={30} />
                  </span>
                  {/* Route param is :id, so the link must not say :productId */}
                  <Link
                    to={`/products/${item.productId}`}
                    className="flex-grow-1 text-decoration-none"
                    style={{ color: 'var(--c-text)' }}
                  >
                    {item.name}
                  </Link>
                  <span className="text-muted-gold small">×{item.quantity}</span>
                  <span style={{ minWidth: '6rem', textAlign: 'right' }}>
                    {formatPrice(item.unitPrice * item.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div
              className="d-flex flex-wrap align-items-center justify-content-between gap-3 p-3 p-md-4 border-top"
              style={{ borderColor: 'var(--c-border)' }}
            >
              <span className="meta mb-0">Payment: {order.paymentStatus}</span>
              <span className="serif fs-4">{formatPrice(order.totalPrice)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

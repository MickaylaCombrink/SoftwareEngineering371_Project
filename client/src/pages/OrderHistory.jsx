import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { OrdersAPI } from '../api/endpoints';
import { Spinner } from '../components/Spinner';
import { ErrorBanner } from '../components/ErrorBanner';
import { EmptyState } from '../components/EmptyState';

export function OrderHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    OrdersAPI.list()
      .then(setOrders)
      .catch((err) => setError(err.message || 'Failed to load orders.'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Spinner />;
  if (error) return <ErrorBanner message={error} />;
  if (orders.length === 0) return <EmptyState message="You have no orders yet." />;

  return (
    <div className="orders-page">
      <h1 className="orders-page__title">Order History</h1>
      <div className="orders-page__list">
        {orders.map((order) => (
          <div key={order._id} className="order-card">
            <div className="order-card__header">
              <span className="order-card__id">Order #{order._id.slice(-6).toUpperCase()}</span>
              <span className={`order-card__status order-card__status--${order.orderStatus.toLowerCase()}`}>
                {order.orderStatus}
              </span>
            </div>
            <p className="order-card__date">
              {new Date(order.createdAt).toLocaleDateString('en-GB', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
            <div className="order-card__items">
              {order.items.map((item, idx) => (
                <div key={idx} className="order-card__item">
                  <Link to={`/products/${item.productId}`} className="order-card__item-name">
                    {item.name}
                  </Link>
                  <span className="order-card__item-qty">x{item.quantity}</span>
                  <span className="order-card__item-price">${(item.unitPrice * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="order-card__footer">
              <span className="order-card__payment">Payment: {order.paymentStatus}</span>
              <span className="order-card__total">${order.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

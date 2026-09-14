import { useEffect, useState, useMemo } from 'react';
import { OrdersAPI } from '../../api/endpoints';
import { formatPrice, formatDate, orderReference } from '../../utils/format';

const ORDER_STATUSES = ['Pending', 'Shipping', 'Delivered'];
const PAYMENT_STATUSES = ['Pending', 'Paid', 'Failed'];

const ORDER_BADGE = {
  Pending: 'badge badge--warn',
  Shipping: 'badge',
  Delivered: 'badge badge--ok',
};

const PAYMENT_BADGE = {
  Pending: 'badge badge--warn',
  Paid: 'badge badge--ok',
  Failed: 'badge badge--danger',
};

function customerName(order) {
  const u = order.userId;
  if (!u || typeof u === 'string') return 'Unknown customer';
  return [u.firstName, u.lastName].filter(Boolean).join(' ') || u.email;
}

export function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [busyId, setBusyId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    OrdersAPI.listAll()
      .then((data) => {
        if (!cancelled) setOrders(data);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load orders.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const visible = useMemo(
    () => (filter === 'All' ? orders : orders.filter((o) => o.orderStatus === filter)),
    [orders, filter]
  );

  const counts = useMemo(() => {
    const tally = { All: orders.length };
    ORDER_STATUSES.forEach((s) => {
      tally[s] = orders.filter((o) => o.orderStatus === s).length;
    });
    return tally;
  }, [orders]);

  // Replaces the single changed order in place, so the table keeps its
  // scroll position and no refetch is needed.
  const applyUpdate = (updated) =>
    setOrders((list) => list.map((o) => (o._id === updated._id ? { ...o, ...updated } : o)));

  const changeOrderStatus = async (order, orderStatus) => {
    setBusyId(order._id);
    setError(null);
    try {
      const updated = await OrdersAPI.setStatus(order._id, orderStatus);
      applyUpdate(updated);
    } catch (err) {
      setError(err.message || 'Could not update that order.');
    } finally {
      setBusyId(null);
    }
  };

  const changePaymentStatus = async (order, paymentStatus) => {
    setBusyId(order._id);
    setError(null);
    try {
      const updated = await OrdersAPI.setPaymentStatus(order._id, paymentStatus);
      applyUpdate(updated);
    } catch (err) {
      setError(err.message || 'Could not update that payment.');
    } finally {
      setBusyId(null);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border spinner-gold" role="status">
          <span className="visually-hidden">Loading orders…</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <div>
          <h1 className="display-page mb-1">Orders</h1>
          <p className="text-muted-gold small mb-0">
            {orders.length} order{orders.length === 1 ? '' : 's'} placed
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-error" role="alert">
          {error}
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 mb-4">
        {['All', ...ORDER_STATUSES].map((status) => (
          <button
            key={status}
            type="button"
            className={`btn btn-sm ${filter === status ? 'btn-primary' : 'btn-outline-gold'}`}
            onClick={() => setFilter(status)}
          >
            {status} ({counts[status] || 0})
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <div className="panel p-4 text-center text-muted-gold">
          {orders.length === 0 ? 'No orders have been placed yet.' : 'No orders with that status.'}
        </div>
      ) : (
        <div className="panel table-responsive">
          <table className="table admin-table mb-0 align-middle">
            <thead>
              <tr>
                <th>Order</th>
                <th className="d-none d-md-table-cell">Customer</th>
                <th className="d-none d-lg-table-cell">Placed</th>
                <th className="text-end">Total</th>
                <th>Payment</th>
                <th>Status</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {visible.map((order) => {
                const open = expanded === order._id;
                const busy = busyId === order._id;

                return [
                  <tr key={order._id}>
                    <td className="text-nowrap">{orderReference(order._id)}</td>
                    <td className="d-none d-md-table-cell">{customerName(order)}</td>
                    <td className="d-none d-lg-table-cell text-muted-gold">
                      {formatDate(order.createdAt)}
                    </td>
                    <td className="text-end text-nowrap">{formatPrice(order.totalPrice)}</td>

                    <td>
                      <label className="visually-hidden" htmlFor={`pay-${order._id}`}>
                        Payment status for {orderReference(order._id)}
                      </label>
                      <select
                        id={`pay-${order._id}`}
                        className="form-select form-select-sm admin-select"
                        value={order.paymentStatus}
                        disabled={busy}
                        onChange={(e) => changePaymentStatus(order, e.target.value)}
                      >
                        {PAYMENT_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                      <span className={`${PAYMENT_BADGE[order.paymentStatus]} d-none`}>
                        {order.paymentStatus}
                      </span>
                    </td>

                    <td>
                      <label className="visually-hidden" htmlFor={`status-${order._id}`}>
                        Order status for {orderReference(order._id)}
                      </label>
                      <select
                        id={`status-${order._id}`}
                        className="form-select form-select-sm admin-select"
                        value={order.orderStatus}
                        disabled={busy}
                        onChange={(e) => changeOrderStatus(order, e.target.value)}
                      >
                        {ORDER_STATUSES.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>

                    <td className="text-end">
                      <button
                        type="button"
                        className="btn btn-link-gold btn-sm p-0"
                        onClick={() => setExpanded(open ? null : order._id)}
                        aria-expanded={open}
                      >
                        {open ? 'Hide' : 'Items'}
                      </button>
                    </td>
                  </tr>,

                  open && (
                    <tr key={`${order._id}-items`}>
                      <td colSpan={7} className="surface-alt">
                        <div className="p-2">
                          <div className="meta mb-2">
                            {customerName(order)} · {formatDate(order.createdAt)}
                          </div>
                          <ul className="list-unstyled mb-0">
                            {order.items.map((item) => (
                              <li
                                className="d-flex justify-content-between gap-3 py-1"
                                key={item.productId}
                              >
                                <span>
                                  {item.name}
                                  <span className="text-muted-gold"> ×{item.quantity}</span>
                                </span>
                                <span>{formatPrice(item.unitPrice * item.quantity)}</span>
                              </li>
                            ))}
                          </ul>
                          <div
                            className="d-flex justify-content-between border-top mt-2 pt-2"
                            style={{ borderColor: 'var(--c-border)' }}
                          >
                            <span className="meta mb-0">Total</span>
                            <span>{formatPrice(order.totalPrice)}</span>
                          </div>
                        </div>
                      </td>
                    </tr>
                  ),
                ];
              })}
            </tbody>
          </table>
        </div>
      )}

      <p className="text-muted-gold small mt-3 mb-0">
        Changing a status saves immediately.
      </p>
    </>
  );
}

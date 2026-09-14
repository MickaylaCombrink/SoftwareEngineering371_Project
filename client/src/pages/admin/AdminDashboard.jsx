import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ProductsAPI, CategoriesAPI, OrdersAPI } from '../../api/endpoints';
import { formatPrice, formatDate, orderReference } from '../../utils/format';

const LOW_STOCK_AT = 10;

export function AdminDashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        // limit=200 so the figures cover the whole catalogue, not page one
        const [products, categories, orders] = await Promise.all([
          ProductsAPI.listAll(),
          CategoriesAPI.list(),
          OrdersAPI.listAll(),
        ]);
        if (!cancelled) setData({ products, categories, orders });
      } catch (err) {
        if (!cancelled) setError(err.message || 'Could not load the dashboard.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border spinner-gold" role="status">
          <span className="visually-hidden">Loading dashboard…</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="alert alert-error" role="alert">
        {error}
      </div>
    );
  }

  const { products, categories, orders } = data;

  const pending = orders.filter((o) => o.orderStatus === 'Pending').length;
  const shipping = orders.filter((o) => o.orderStatus === 'Shipping').length;
  const paid = orders.filter((o) => o.paymentStatus === 'Paid');
  const revenue = paid.reduce((sum, o) => sum + o.totalPrice, 0);

  const outOfStock = products.filter((p) => p.stock <= 0);
  const lowStock = products.filter((p) => p.stock > 0 && p.stock <= LOW_STOCK_AT);

  const recent = orders.slice(0, 5);

  const tiles = [
    {
      label: 'Orders awaiting action',
      value: pending + shipping,
      detail: `${pending} pending · ${shipping} shipping`,
      to: '/admin/orders',
    },
    {
      label: 'Revenue from paid orders',
      value: formatPrice(revenue),
      detail: `Across ${paid.length} paid order${paid.length === 1 ? '' : 's'}`,
      to: '/admin/orders',
    },
    {
      label: 'Needs restocking',
      value: outOfStock.length + lowStock.length,
      detail: `${outOfStock.length} out of stock · ${lowStock.length} low`,
      to: '/admin/products',
      highlight: outOfStock.length + lowStock.length > 0,
    },
  ];

  return (
    <>
      <div className="d-flex flex-wrap align-items-end justify-content-between gap-3 mb-4">
        <h1 className="display-page mb-0">Overview</h1>
        <Link to="/admin/products/new" className="btn btn-primary btn-sm">
          + New product
        </Link>
      </div>

      <div className="row g-3 g-lg-4 mb-4">
        {tiles.map((tile) => (
          <div className="col-12 col-md-4" key={tile.label}>
            <Link
              to={tile.to}
              className="panel p-4 h-100 d-block text-decoration-none card-hover"
              style={tile.highlight ? { borderColor: 'var(--c-accent)' } : undefined}
            >
              <div className="meta mb-3">{tile.label}</div>
              <div className="serif" style={{ fontSize: '2.625rem', lineHeight: 1, color: 'var(--c-text)' }}>
                {tile.value}
              </div>
              <div className="text-muted-gold small mt-2">{tile.detail}</div>
            </Link>
          </div>
        ))}
      </div>

      <div className="row g-3 g-lg-4">
        <div className="col-12 col-xl-7">
          <div className="panel">
            <div className="d-flex align-items-center justify-content-between p-3 p-lg-4 pb-2">
              <h2 className="serif fs-3 mb-0">Recent orders</h2>
              <Link to="/admin/orders" className="small">
                Manage all →
              </Link>
            </div>

            {recent.length === 0 ? (
              <p className="text-muted-gold px-3 px-lg-4 pb-4 mb-0">No orders yet.</p>
            ) : (
              <div className="table-responsive">
                <table className="table admin-table mb-0">
                  <thead>
                    <tr>
                      <th>Order</th>
                      <th>Placed</th>
                      <th>Status</th>
                      <th className="text-end">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recent.map((order) => (
                      <tr key={order._id}>
                        <td>{orderReference(order._id)}</td>
                        <td className="text-muted-gold">{formatDate(order.createdAt)}</td>
                        <td>
                          <span className="badge">{order.orderStatus}</span>
                        </td>
                        <td className="text-end">{formatPrice(order.totalPrice)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="col-12 col-xl-5">
          <div className="panel h-100">
            <div className="d-flex align-items-center justify-content-between p-3 p-lg-4 pb-2">
              <h2 className="serif fs-3 mb-0">Stock alerts</h2>
              <Link to="/admin/products" className="small">
                Products →
              </Link>
            </div>

            {outOfStock.length + lowStock.length === 0 ? (
              <p className="text-muted-gold px-3 px-lg-4 pb-4 mb-0">
                Every one of the {products.length} products is well stocked.
              </p>
            ) : (
              <ul className="list-unstyled mb-0 px-3 px-lg-4 pb-4">
                {[...outOfStock, ...lowStock].slice(0, 8).map((product) => (
                  <li
                    className="d-flex justify-content-between gap-3 py-2 border-bottom"
                    style={{ borderColor: 'var(--c-border)' }}
                    key={product._id}
                  >
                    <Link
                      to={`/admin/products/${product._id}`}
                      className="text-decoration-none"
                      style={{ color: 'var(--c-text)' }}
                    >
                      {product.productName}
                    </Link>
                    <span className={product.stock <= 0 ? 'text-danger-gold' : 'text-muted-gold'}>
                      {product.stock <= 0 ? 'Out of stock' : `${product.stock} left`}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      <p className="text-muted-gold small mt-4 mb-0">
        {products.length} products across {categories.length} categories.
      </p>
    </>
  );
}

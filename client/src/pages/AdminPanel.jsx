export default function AdminPanel() {
  return (
    <div data-bs-theme="dark" className="d-flex vh-100 overflow-hidden">
      {/* Sidebar */}
      <div className="d-flex flex-column justify-content-between border-end bg-black p-4" style={{ width: '240px' }}>
        <div>
          <div className="mb-4">
            <p className="font-serif text-brand-gold-light fs-4 fw-semibold mb-0">SCENTIQUE</p>
            <p className="text-brand-gold small text-uppercase mb-0" style={{ letterSpacing: '0.2em', fontSize: '0.7rem' }}>
              Admin
            </p>
          </div>
          <ul className="nav nav-pills flex-column gap-1">
            <li className="nav-item">
              <a href="#" className="nav-link active d-flex align-items-center gap-2 border-start border-3 border-brand-gold rounded-0">
                Dashboard
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-brand-muted d-flex align-items-center gap-2">
                Products
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-brand-muted d-flex align-items-center gap-2">
                Categories
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-brand-muted d-flex align-items-center gap-2">
                Orders
              </a>
            </li>
            <li className="nav-item">
              <a href="#" className="nav-link text-brand-muted d-flex align-items-center gap-2">
                Customers
              </a>
            </li>
          </ul>
        </div>

        <div className="card bg-dark border-secondary p-3">
          <p className="text-brand-muted text-uppercase small mb-2" style={{ fontSize: '0.7rem', letterSpacing: '0.12em' }}>
            System status
          </p>
          <div className="d-flex justify-content-between align-items-center">
            <span className="text-brand-gold-light small">Live</span>
            <span className="badge rounded-circle bg-success p-2">&nbsp;</span>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-grow-1 overflow-auto">
        {/* Topbar */}
        <div className="d-flex justify-content-between align-items-center border-bottom bg-dark px-4" style={{ height: '79px' }}>
          <div className="d-flex align-items-center gap-3">
            <span className="text-brand-gold-light">Dashboard</span>
            <div className="vr" />
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-sm rounded-circle bg-secondary text-brand-gold border-0" style={{ width: '34px', height: '34px' }}>
                SA
              </button>
              <span className="text-brand-muted small">Site Administrator</span>
            </div>
          </div>
          <input
            type="search"
            className="form-control form-control-sm bg-dark text-brand-muted border-secondary"
            style={{ width: '320px' }}
            placeholder="Search orders, products, customers"
          />
        </div>

        <div className="p-4">
          {/* Header row */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h1 className="font-serif text-brand-gold-light">Overview</h1>
              <p className="text-brand-muted small mb-0">
                Monitor fulfillment, revenue, and low-stock fragrances from one place.
              </p>
            </div>
            <div className="d-flex align-items-center gap-2">
              <button className="btn btn-outline-secondary rounded-3">🔔</button>
              <button className="btn fw-semibold rounded-3" style={{ backgroundColor: 'var(--brand-gold)', color: '#241F1A' }}>
                + New product
              </button>
            </div>
          </div>

          {/* Stat cards */}
          <div className="row g-3 mb-4">
            <div className="col-md-3">
              <div className="card bg-dark border-secondary h-100 p-3">
                <p className="text-brand-muted text-uppercase small mb-2" style={{ fontSize: '0.7rem' }}>
                  Orders awaiting action
                </p>
                <p className="font-serif text-brand-gold-light display-6 mb-1">2</p>
                <p className="text-brand-muted small mb-0">1 pending · 1 shipping</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-dark border-secondary h-100 p-3">
                <p className="text-brand-muted text-uppercase small mb-2" style={{ fontSize: '0.7rem' }}>
                  Revenue this month
                </p>
                <p className="font-serif text-brand-gold-light display-6 mb-1">R3 035</p>
                <p className="text-brand-muted small mb-0">Across 3 paid orders</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-dark border-secondary h-100 p-3">
                <p className="text-brand-muted text-uppercase small mb-2" style={{ fontSize: '0.7rem' }}>
                  Active customers
                </p>
                <p className="font-serif text-brand-gold-light display-6 mb-1">12</p>
                <p className="text-brand-muted small mb-0">3 placed orders today</p>
              </div>
            </div>
            <div className="col-md-3">
              <div className="card bg-dark border-brand-gold h-100 p-3">
                <p className="text-brand-gold text-uppercase small mb-2" style={{ fontSize: '0.7rem' }}>
                  Low stock
                </p>
                <p className="font-serif text-brand-gold-light display-6 mb-1">1</p>
                <p className="text-brand-muted small mb-0">Nabatieh - 8 left</p>
              </div>
            </div>
          </div>

          {/* Products table */}
          <div className="card bg-dark border-secondary p-4 mb-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="font-serif text-brand-gold-light h4 mb-0">Products</h2>
              <a href="#" className="text-brand-gold small text-decoration-none">Manage all →</a>
            </div>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr className="text-brand-muted text-uppercase small">
                    <th style={{ fontSize: '0.7rem' }}>Product</th>
                    <th style={{ fontSize: '0.7rem' }}>Category</th>
                    <th style={{ fontSize: '0.7rem' }}>Price</th>
                    <th style={{ fontSize: '0.7rem' }}>Stock</th>
                    <th style={{ fontSize: '0.7rem' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { name: 'French Avenue Nabatieh EDP 90ml', category: 'For Him', price: 'R829.00', stock: '8 low', low: true },
                    { name: 'Lattafa Masa gift set EDP 100ml', category: 'For Her', price: 'R779.00', stock: '9', low: false },
                    { name: 'Al Wataniah Keyaan Classic EDP 100ml', category: 'For Him', price: 'R549.00', stock: '17', low: false },
                    { name: 'Ard Al Zaafaran Yara EDP 50ml', category: 'For Her', price: 'R439.00', stock: '19', low: false },
                  ].map((product) => (
                    <tr key={product.name}>
                      <td className="text-brand-gold-light">{product.name}</td>
                      <td className="text-brand-gold-light">{product.category}</td>
                      <td className="text-brand-gold-light">{product.price}</td>
                      <td>
                        <span className={`badge ${product.low ? 'text-bg-warning' : 'text-bg-success'}`}>
                          {product.stock}
                        </span>
                      </td>
                      <td>
                        <a href="#" className="text-brand-gold small me-3 text-decoration-none">Edit</a>
                        <a href="#" className="text-danger small text-decoration-none">Delete</a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent orders */}
          <div className="card bg-dark border-secondary p-4">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2 className="font-serif text-brand-gold-light h4 mb-0">Recent orders</h2>
              <a href="#" className="text-brand-gold small text-decoration-none">All orders →</a>
            </div>
            <div className="table-responsive">
              <table className="table table-dark table-hover align-middle mb-0">
                <thead>
                  <tr className="text-brand-muted text-uppercase small">
                    <th style={{ fontSize: '0.7rem' }}>Order</th>
                    <th style={{ fontSize: '0.7rem' }}>Customer</th>
                    <th style={{ fontSize: '0.7rem' }}>Total</th>
                    <th style={{ fontSize: '0.7rem' }}>Payment</th>
                    <th style={{ fontSize: '0.7rem' }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    { id: 'SCT-2026-0148', customer: 'Hanré Koen', total: 'R1 707.00', status: 'Pending' },
                    { id: 'SCT-2026-0131', customer: 'M. Combrink', total: 'R779.00', status: 'Shipping' },
                    { id: 'SCT-2026-0094', customer: 'T. Tyini', total: 'R549.00', status: 'Delivered' },
                  ].map((order) => (
                    <tr key={order.id}>
                      <td className="text-brand-gold-light">{order.id}</td>
                      <td className="text-brand-gold-light">{order.customer}</td>
                      <td className="text-brand-gold-light">{order.total}</td>
                      <td><span className="badge text-bg-success">Paid</span></td>
                      <td>
                        <span className="badge border text-brand-gold-light">{order.status} →</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
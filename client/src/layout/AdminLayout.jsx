import { useState } from 'react';
import { NavLink, Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { MenuIcon, CloseIcon } from '../components/Icons';

const NAV = [
  { to: '/admin', label: 'Dashboard', end: true },
  { to: '/admin/products', label: 'Products' },
  { to: '/admin/categories', label: 'Categories' },
  { to: '/admin/orders', label: 'Orders' },
  { to: '/admin/queries', label: 'Enquiries' },
];

function initials(user) {
  const first = user?.firstName?.[0] || '';
  const last = user?.lastName?.[0] || '';
  return (first + last).toUpperCase() || 'AD';
}

// Admin shell: its own sidebar rather than the storefront header, so the two
// contexts never look alike.
export function AdminLayout() {
  const { user } = useAuth();
  const location = useLocation();
  const [navOpen, setNavOpen] = useState(false);

  const current = NAV.find((item) =>
    item.end ? location.pathname === item.to : location.pathname.startsWith(item.to)
  );

  const links = (
    <nav className="nav flex-column">
      {NAV.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => `admin-navitem${isActive ? ' admin-navitem--on' : ''}`}
          onClick={() => setNavOpen(false)}
        >
          {item.label}
        </NavLink>
      ))}
      <Link to="/" className="admin-navitem mt-3" onClick={() => setNavOpen(false)}>
        ← Back to store
      </Link>
    </nav>
  );

  return (
    <div className="d-flex min-vh-100">
      {/* Sidebar, permanent from lg up */}
      <aside className="admin-sidebar d-none d-lg-block flex-shrink-0">
        <div className="px-3 pt-4">
          <div className="serif fs-4 tracking-brand">SCENTIGUE</div>
          <div className="eyebrow mt-1 mb-4">Admin</div>
        </div>
        {links}
      </aside>

      {/* Drawer on smaller screens */}
      {navOpen && (
        <>
          <div
            className="offcanvas-backdrop fade show d-lg-none"
            onClick={() => setNavOpen(false)}
            aria-hidden="true"
          />
          <aside className="admin-sidebar admin-sidebar--drawer d-lg-none">
            <div className="d-flex align-items-center justify-content-between px-3 pt-4">
              <div>
                <div className="serif fs-4 tracking-brand">SCENTIGUE</div>
                <div className="eyebrow mt-1">Admin</div>
              </div>
              <button
                type="button"
                className="icon-btn"
                onClick={() => setNavOpen(false)}
                aria-label="Close menu"
              >
                <CloseIcon />
              </button>
            </div>
            <div className="mt-4">{links}</div>
          </aside>
        </>
      )}

      <div className="flex-grow-1 min-width-0">
        <header
          className="surface-raised border-bottom"
          style={{ borderColor: 'var(--c-border)' }}
        >
          <div className="d-flex align-items-center justify-content-between gap-3 px-3 px-lg-4 py-3">
            <div className="d-flex align-items-center gap-3">
              <button
                type="button"
                className="icon-btn d-lg-none"
                onClick={() => setNavOpen(true)}
                aria-label="Open admin menu"
              >
                <MenuIcon />
              </button>
              <span>{current?.label || 'Admin'}</span>
            </div>

            <div className="d-flex align-items-center gap-3">
              <span className="text-muted-gold small d-none d-sm-inline">
                {user?.firstName} {user?.lastName}
              </span>
              <span className="admin-avatar">{initials(user)}</span>
            </div>
          </div>
        </header>

        <main className="p-3 p-lg-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

import { useState, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { SearchIcon, UserIcon, BagIcon, MenuIcon, CloseIcon } from '../components/Icons';

const NAV_LINKS = [
  { to: '/products', label: 'Shop All' },
  { to: '/products?sort=-createdAt', label: 'New In' },
  { to: '/orders', label: 'My Orders' },
  { to: '/contact', label: 'Contact' },
];

export function Header() {
  const { itemCount } = useCart();
  const { status, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [menuOpen, setMenuOpen] = useState(false);

  // Close the mobile menu whenever the route changes, so a nav link never
  // leaves the drawer hanging open over the new page.
  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname, location.search]);

  const handleSignOut = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  const accountLink =
    status === 'authenticated' ? (
      <div className="d-flex align-items-center gap-3">
        <span className="text-muted-gold small d-none d-lg-inline">
          {user?.firstName || user?.email}
        </span>
        <button type="button" className="btn btn-link-gold btn-sm p-0" onClick={handleSignOut}>
          Sign out
        </button>
      </div>
    ) : (
      <Link to="/login" className="icon-btn" aria-label="Sign in">
        <UserIcon />
      </Link>
    );

  return (
    <header>
      <div className="promo-bar text-center py-2 px-3">
        Free delivery on orders over R550 — nationwide
      </div>

      <nav className="site-header">
        <div className="container-xxl d-flex align-items-center gap-3 gap-lg-4 py-3 py-lg-4">
          <Link to="/" className="brand-mark fs-3 fs-lg-2 me-lg-4">
            SCENTIGUE
          </Link>

          {/* Desktop navigation */}
          <ul className="nav d-none d-lg-flex gap-4 flex-grow-1 mb-0">
            {NAV_LINKS.map((link) => (
              <li className="nav-item" key={link.label}>
                <NavLink to={link.to} className="nav-link">
                  {link.label}
                </NavLink>
              </li>
            ))}
            {isAdmin && (
              <li className="nav-item">
                <NavLink to="/admin" className="nav-link">
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

          <div className="d-flex align-items-center gap-3 ms-auto">
            <Link to="/products" className="icon-btn d-none d-sm-inline-flex" aria-label="Search">
              <SearchIcon />
            </Link>

            <span className="d-none d-lg-inline-flex">{accountLink}</span>

            <Link to="/cart" className="icon-btn" aria-label={`Cart, ${itemCount} items`}>
              <BagIcon />
              {itemCount > 0 && <span className="cart-count">{itemCount}</span>}
            </Link>

            <button
              type="button"
              className="icon-btn d-lg-none"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
            >
              <MenuIcon />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile drawer. Bootstrap's offcanvas classes, driven by React state
          rather than its JS bundle, so a re-render cannot desync it. */}
      {menuOpen && (
        <div
          className="offcanvas-backdrop fade show d-lg-none"
          onClick={() => setMenuOpen(false)}
          aria-hidden="true"
        />
      )}
      {/* Only mounted while open: a closed offcanvas is parked off the right
          edge, which adds horizontal scroll to every page on a phone. */}
      {menuOpen && (
      <div className="offcanvas offcanvas-end d-lg-none show" tabIndex="-1">
        <div className="offcanvas-header d-flex justify-content-between align-items-center border-bottom" style={{ borderColor: 'var(--c-border)' }}>
          <span className="brand-mark fs-4">SCENTIGUE</span>
          <button
            type="button"
            className="icon-btn"
            onClick={() => setMenuOpen(false)}
            aria-label="Close menu"
          >
            <CloseIcon />
          </button>
        </div>
        <div className="offcanvas-body">
          <ul className="nav flex-column gap-3">
            {NAV_LINKS.map((link) => (
              <li className="nav-item" key={link.label}>
                <NavLink to={link.to} className="nav-link fs-5">
                  {link.label}
                </NavLink>
              </li>
            ))}
            {isAdmin && (
              <li className="nav-item">
                <NavLink to="/admin" className="nav-link fs-5">
                  Admin
                </NavLink>
              </li>
            )}
          </ul>

          <hr style={{ borderColor: 'var(--c-border)' }} />

          {status === 'authenticated' ? (
            <div className="d-grid gap-3">
              <span className="text-muted-gold small">
                Signed in as {user?.firstName || user?.email}
              </span>
              <button type="button" className="btn btn-outline-gold" onClick={handleSignOut}>
                Sign out
              </button>
            </div>
          ) : (
            <div className="d-grid gap-2">
              <Link to="/login" className="btn btn-primary">
                Sign in
              </Link>
              <Link to="/register" className="btn btn-outline-gold">
                Create account
              </Link>
            </div>
          )}
        </div>
      </div>
      )}
    </header>
  );
}

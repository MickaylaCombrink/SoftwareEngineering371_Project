import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

export function PageLayout({ children }) {
  const { itemCount } = useCart();
  const { status, user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await logout();
    navigate('/', { replace: true });
  };

  return (
    <div className="page-layout">
      <header className="page-layout__header">
        <nav className="page-layout__nav">
          <Link to="/">SEN371 Store</Link>
          <span className="page-layout__spacer" />

          {isAdmin && <Link to="/admin">Admin</Link>}

          <Link to="/cart" className="page-layout__cart-link">
            Cart
            {itemCount > 0 && <span className="page-layout__cart-badge">{itemCount}</span>}
          </Link>

          <Link to="/orders">Orders</Link>

          {status === 'authenticated' ? (
            <>
              <span className="page-layout__user">{user?.firstName || user?.email}</span>
              <button type="button" className="page-layout__signout" onClick={handleSignOut}>
                Sign out
              </button>
            </>
          ) : (
            <Link to="/login">Sign in</Link>
          )}
        </nav>
      </header>
      <main className="page-layout__main">{children}</main>
    </div>
  );
}
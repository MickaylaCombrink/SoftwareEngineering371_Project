import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export function PageLayout({ children }) {
  const { itemCount } = useCart();

  return (
    <div className="page-layout">
      <header className="page-layout__header">
        <nav className="page-layout__nav">
          <Link to="/">SEN371 Store</Link>
          <span className="page-layout__spacer" />
          <Link to="/cart" className="page-layout__cart-link">
            Cart
            {itemCount > 0 && <span className="page-layout__cart-badge">{itemCount}</span>}
          </Link>
          <Link to="/orders">Orders</Link>
          <Link to="/login">Sign in</Link>
        </nav>
      </header>
      <main className="page-layout__main">{children}</main>
    </div>
  );
}
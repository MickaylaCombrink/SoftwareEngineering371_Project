import { Link } from 'react-router-dom';

export function PageLayout({ children }) {
  return (
    <div className="page-layout">
      <header className="page-layout__header">
        <nav className="page-layout__nav">
          <Link to="/">SEN371 Store</Link>
          <span className="page-layout__spacer" />
          <Link to="/cart">Cart</Link>
          <Link to="/orders">Orders</Link>
          <Link to="/login">Sign in</Link>
        </nav>
      </header>
      <main className="page-layout__main">{children}</main>
    </div>
  );
}

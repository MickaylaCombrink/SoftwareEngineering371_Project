import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const desktopLink = 'text-[0.78rem] font-medium uppercase tracking-[0.22em] text-cream/85 hover:text-gold-2 transition-colors';
  const mobileLink = 'block py-2 text-sm uppercase tracking-[0.18em] text-cream/85 hover:text-gold-2 transition-colors';

  return (
    <nav className="bg-ink/95 backdrop-blur text-cream sticky top-0 z-50 border-b border-gold/20 shadow-lux">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 py-3">
          <Link to="/" className="group flex flex-col leading-none">
            <span className="eyebrow text-gold-2 group-hover:text-gold transition-colors">Maison</span>
            <span className="font-display text-2xl tracking-wide text-cream group-hover:text-gold-2 transition-colors">
              Scent
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            <Link to="/products" className={desktopLink}>Products</Link>
            {isAuthenticated && <Link to="/orders" className={desktopLink}>My Orders</Link>}
            {isAdmin && <Link to="/admin" className={desktopLink}>Admin</Link>}
          </div>

          <div className="flex items-center gap-5">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative text-cream/90 hover:text-gold-2 transition-colors" aria-label="Cart">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-gold text-ink text-[0.65rem] rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="hidden sm:block text-sm text-cream/85 hover:text-gold-2 transition-colors tracking-wide">
                  {user?.firstName}
                </Link>
                <button onClick={handleLogout} className="hidden sm:block text-sm text-cream/60 hover:text-gold-2 transition-colors tracking-wide">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hidden sm:block text-sm text-cream/85 hover:text-gold-2 transition-colors tracking-wide">Login</Link>
                <Link to="/register" className="btn-gold py-2 px-5 text-sm shadow-none">
                  Register
                </Link>
              </>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-1 text-cream/90 hover:text-gold-2 transition-colors"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-ink-soft border-t border-gold/15">
          <div className="px-4 py-2 space-y-1">
            <Link to="/products" onClick={() => setOpen(false)} className={mobileLink}>Products</Link>
            {isAuthenticated && <Link to="/orders" onClick={() => setOpen(false)} className={mobileLink}>My Orders</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className={mobileLink}>Admin</Link>}
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className={mobileLink}>Profile</Link>
                <button onClick={handleLogout} className={mobileLink}>Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className={mobileLink}>Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
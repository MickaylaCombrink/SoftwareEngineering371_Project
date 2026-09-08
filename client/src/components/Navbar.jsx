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

  return (
    <nav className="bg-indigo-900 text-white shadow-lg sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="text-xl font-bold tracking-tight">
            <span className="text-amber-400">S</span>cent
          </Link>

          <div className="hidden md:flex items-center space-x-6">
            <Link to="/products" className="hover:text-amber-300 transition-colors">Products</Link>
            {isAuthenticated && <Link to="/orders" className="hover:text-amber-300 transition-colors">My Orders</Link>}
            {isAdmin && <Link to="/admin" className="hover:text-amber-300 transition-colors">Admin</Link>}
          </div>

          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Link to="/cart" className="relative hover:text-amber-300 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
                  </svg>
                  {itemCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-amber-500 text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
                      {itemCount}
                    </span>
                  )}
                </Link>
                <Link to="/profile" className="text-sm hover:text-amber-300 transition-colors hidden sm:block">
                  {user?.firstName}
                </Link>
                <button onClick={handleLogout} className="text-sm hover:text-amber-300 transition-colors hidden sm:block">
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="hover:text-amber-300 transition-colors hidden sm:block">Login</Link>
                <Link to="/register" className="bg-amber-500 text-indigo-900 px-3 py-1 rounded font-semibold hover:bg-amber-400 transition-colors">
                  Register
                </Link>
              </>
            )}

            <button
              onClick={() => setOpen(!open)}
              className="md:hidden p-1 hover:text-amber-300 transition-colors"
              aria-label="Toggle menu"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {open ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {open && (
        <div className="md:hidden bg-indigo-900 border-t border-indigo-800">
          <div className="px-4 py-2 space-y-1">
            <Link to="/products" onClick={() => setOpen(false)} className="block py-2 hover:text-amber-300 transition-colors">Products</Link>
            {isAuthenticated && <Link to="/orders" onClick={() => setOpen(false)} className="block py-2 hover:text-amber-300 transition-colors">My Orders</Link>}
            {isAdmin && <Link to="/admin" onClick={() => setOpen(false)} className="block py-2 hover:text-amber-300 transition-colors">Admin</Link>}
            {isAuthenticated ? (
              <>
                <Link to="/profile" onClick={() => setOpen(false)} className="block py-2 hover:text-amber-300 transition-colors">Profile</Link>
                <button onClick={handleLogout} className="block py-2 hover:text-amber-300 transition-colors">Logout</button>
              </>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)} className="block py-2 hover:text-amber-300 transition-colors">Login</Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

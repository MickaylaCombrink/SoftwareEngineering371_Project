import { Link, Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { LockIcon } from '../components/Icons';

// Distraction-free shell for checkout and confirmation: brand and a security
// note only, so nothing competes with completing the purchase.
export function CheckoutLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <header
        className="surface-raised border-bottom"
        style={{ borderColor: 'var(--c-border)' }}
      >
        <div className="container-xxl d-flex align-items-center justify-content-between py-3">
          <Link to="/" className="brand-mark fs-4">
            SCENTIGUE
          </Link>
          <span className="d-flex align-items-center gap-2 text-muted-gold small">
            <LockIcon />
            Secure checkout
          </span>
        </div>
      </header>

      <main className="flex-grow-1">
        <Outlet />
      </main>

      <Footer slim />
    </div>
  );
}

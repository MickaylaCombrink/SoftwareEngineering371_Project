import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Footer } from './Footer';

// Standard shell: promo bar, full navigation, page content, full footer.
// Used as a layout route, so every child page renders through <Outlet />.
export function PageLayout() {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <main className="flex-grow-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

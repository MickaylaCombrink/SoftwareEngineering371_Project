import { Routes, Route } from 'react-router-dom';
import { PageLayout } from '../layout/PageLayout';
import { EmptyState } from '../components/EmptyState';
import { ProductCatalogue } from '../pages/ProductCatalogue';
import { ProductDetail } from '../pages/ProductDetail';
import { CartPage } from '../pages/CartPage';
import { OrderHistory } from '../pages/OrderHistory';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

export function AppRoutes() {
  return (
    <PageLayout>
      <Routes>
        {/* Public */}
        <Route path="/" element={<ProductCatalogue />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Signed in */}
        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrderHistory />} />
        </Route>

        {/* Admin only — screens still to be built by Person 4 */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<EmptyState message="Admin dashboard - to be built by Person 4." />} />
        </Route>

        <Route path="*" element={<EmptyState message="Page not found." />} />
      </Routes>
    </PageLayout>
  );
}
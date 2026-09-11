import { Routes, Route } from 'react-router-dom';
import { PageLayout } from '../layout/PageLayout';
import { CheckoutLayout } from '../layout/CheckoutLayout';
import { EmptyState } from '../components/EmptyState';
import { Home } from '../pages/Home';
import { ProductCatalogue } from '../pages/ProductCatalogue';
import { ProductDetail } from '../pages/ProductDetail';
import { CartPage } from '../pages/CartPage';
import { Checkout } from '../pages/Checkout';
import { OrderConfirmation } from '../pages/OrderConfirmation';
import { ContactPage } from '../pages/ContactPage';
import { OrderHistory } from '../pages/OrderHistory';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { NotFound } from '../pages/NotFound';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import  AdminPanel  from '../pages/AdminPanel';

export function AppRoutes() {
  return (
    <Routes>
      {/* Full shell: promo bar, navigation, footer */}
      <Route element={<PageLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/products" element={<ProductCatalogue />} />
        <Route path="/products/:id" element={<ProductDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/contact" element={<ContactPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrderHistory />} />
        </Route>

        <Route element={<AdminRoute />}>
          <Route
            path="/admin"
            element={<EmptyState message="Admin dashboard — to be built by Person 4." />}
          />
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Slim shell: nothing competes with completing the purchase */}
      <Route element={<CheckoutLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders/:id/confirmation" element={<OrderConfirmation />} />
        </Route>
      </Route>
    </Routes>
  );
}
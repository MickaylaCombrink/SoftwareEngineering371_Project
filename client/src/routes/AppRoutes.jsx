import { Routes, Route } from 'react-router-dom';
import { PageLayout } from '../layout/PageLayout';
import { CheckoutLayout } from '../layout/CheckoutLayout';
import { AdminLayout } from '../layout/AdminLayout';
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
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminProducts } from '../pages/admin/AdminProducts';
import { AdminProductForm } from '../pages/admin/AdminProductForm';
import { AdminCategories } from '../pages/admin/AdminCategories';
import { AdminOrders } from '../pages/admin/AdminOrders';
import { AdminQueries } from '../pages/admin/AdminQueries';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';

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

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* Slim shell: nothing competes with completing the purchase */}
      <Route element={<CheckoutLayout />}>
        <Route element={<ProtectedRoute />}>
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/orders/:id/confirmation" element={<OrderConfirmation />} />
        </Route>
      </Route>

      {/* Admin console. AdminRoute wraps the layout, so every screen beneath
          it is behind the same guard — there is no unguarded way in. */}
      <Route element={<AdminRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboard />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="products/new" element={<AdminProductForm />} />
          <Route path="products/:id" element={<AdminProductForm />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="queries" element={<AdminQueries />} />
        </Route>
      </Route>
    </Routes>
  );
}

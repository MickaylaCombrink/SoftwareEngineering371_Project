import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageLayout } from '../layout/PageLayout';
import { EmptyState } from '../components/EmptyState';
import { ProductCatalogue } from '../pages/ProductCatalogue';
import { ProductDetail } from '../pages/ProductDetail';
import { CartPage } from '../pages/CartPage';
import { OrderHistory } from '../pages/OrderHistory';

// Person 2 will replace these placeholders with real auth screens once built
function Placeholder({ owner, screen }) {
  return <EmptyState message={`${screen} - to be built by ${owner}.`} />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <PageLayout>
        <Routes>
          <Route path="/" element={<ProductCatalogue />} />
          <Route path="/products/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/orders" element={<OrderHistory />} />

          <Route path="/login" element={<Placeholder owner="Person 2" screen="Login" />} />
          <Route path="/register" element={<Placeholder owner="Person 2" screen="Register" />} />

          <Route path="/admin" element={<Placeholder owner="Person 4" screen="Admin dashboard" />} />

          <Route path="*" element={<EmptyState message="Page not found." />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  );
}
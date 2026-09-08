import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageLayout } from '../layout/PageLayout';
import { EmptyState } from '../components/EmptyState';

// Placeholder until the owning person replaces it. Keeping a route registered
// for every path the app can navigate to means a redirect never lands on a
// blank screen - the API client sends an unrecoverable session to /login
function Placeholder({ owner, screen }) {
  return <EmptyState message={`${screen} - to be built by ${owner}.`} />;
}

export function AppRoutes() {
  return (
    <BrowserRouter>
      <PageLayout>
        <Routes>
          <Route path="/" element={<Placeholder owner="Person 3" screen="Product catalogue" />} />
          <Route path="/products/:id" element={<Placeholder owner="Person 3" screen="Product detail" />} />
          <Route path="/cart" element={<Placeholder owner="Person 3" screen="Cart" />} />
          <Route path="/orders" element={<Placeholder owner="Person 3" screen="Order history" />} />

          <Route path="/login" element={<Placeholder owner="Person 2" screen="Login" />} />
          <Route path="/register" element={<Placeholder owner="Person 2" screen="Register" />} />

          <Route path="/admin" element={<Placeholder owner="Person 4" screen="Admin dashboard" />} />

          <Route path="*" element={<EmptyState message="Page not found." />} />
        </Routes>
      </PageLayout>
    </BrowserRouter>
  );
}

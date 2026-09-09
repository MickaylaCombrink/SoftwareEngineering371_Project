import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { PageLayout } from '../layout/PageLayout';

export function AppRoutes() {
  return (
    <BrowserRouter>
      <PageLayout>
        <Routes>
          <Route path="/" element={<div>Home placeholder</div>} />
          {/* teammates add their routes here */}
        </Routes>
      </PageLayout>
    </BrowserRouter>
  );
}
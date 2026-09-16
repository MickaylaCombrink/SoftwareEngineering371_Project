import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AppRoutes } from './routes/AppRoutes';

// Router outermost so providers can navigate; auth wraps cart.
// basename comes from Vite's base, so the same build works at the site
// root in development and under /<repo>/ on GitHub Pages.
export default function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <AuthProvider>
        <CartProvider>
          <AppRoutes />
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

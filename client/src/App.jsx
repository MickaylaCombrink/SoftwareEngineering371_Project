import { CartProvider } from './context/CartContext';
import { AppRoutes } from './routes/AppRoutes';

export default function App() {
  return (
    <CartProvider>
      <AppRoutes />
    </CartProvider>
  );
}
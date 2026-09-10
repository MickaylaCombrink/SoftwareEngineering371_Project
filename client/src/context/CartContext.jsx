import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { CartAPI } from '../api/endpoints';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const { status } = useAuth();
  const [cart, setCart] = useState([]);
  const [itemCount, setItemCount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const applyResult = useCallback((result) => {
    setCart(result.cart.items || []);
    setItemCount(result.itemCount);
    setSubtotal(result.subtotal);
  }, []);

  const fetchCart = useCallback(async () => {
    setLoading(true);
    try {
      const result = await CartAPI.get();
      applyResult(result);
    } catch {
      // Silently fail — cart is empty or user not logged in
    } finally {
      setLoading(false);
    }
  }, [applyResult]);

  const addItem = useCallback(async (productId, quantity = 1) => {
    const result = await CartAPI.addItem(productId, quantity);
    applyResult(result);
    return result;
  }, [applyResult]);

  const setQuantity = useCallback(async (productId, quantity) => {
    const result = await CartAPI.setQuantity(productId, quantity);
    applyResult(result);
    return result;
  }, [applyResult]);

  const removeItem = useCallback(async (productId) => {
    const result = await CartAPI.removeItem(productId);
    applyResult(result);
    return result;
  }, [applyResult]);

  const clearCart = useCallback(() => {
    setCart([]);
    setItemCount(0);
    setSubtotal(0);
  }, []);

  // Only fetch once signed in; an anonymous 401 would bounce the visitor
  useEffect(() => {
    if (status === 'authenticated') {
      fetchCart();
    } else if (status === 'unauthenticated') {
      clearCart();
    }
  }, [status, fetchCart, clearCart]);

  return (
    <CartContext.Provider
      value={{ cart, itemCount, subtotal, loading, fetchCart, addItem, setQuantity, removeItem, clearCart }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}

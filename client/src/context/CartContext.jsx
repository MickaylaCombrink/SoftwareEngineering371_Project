import { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../api/axios';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

const initialState = {
  items: [],
  subtotal: 0,
  itemCount: 0,
  loading: false,
};

function cartReducer(state, action) {
  switch (action.type) {
    case 'SET_CART':
      return {
        ...state,
        items: action.payload.data.cart.items,
        subtotal: action.payload.subtotal,
        itemCount: action.payload.itemCount,
        loading: false,
      };
    case 'CLEAR_CART':
      return { ...initialState };
    case 'SET_LOADING':
      return { ...state, loading: true };
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const { user } = useAuth();
  const [state, dispatch] = useReducer(cartReducer, initialState);

  const fetchCart = useCallback(async () => {
    if (!user) {
      dispatch({ type: 'CLEAR_CART' });
      return;
    }
    dispatch({ type: 'SET_LOADING' });
    try {
      const { data } = await api.get('/cart');
      dispatch({ type: 'SET_CART', payload: data });
    } catch {
      dispatch({ type: 'CLEAR_CART' });
    }
  }, [user]);

  const addItem = async (productId, quantity = 1) => {
    const { data } = await api.post('/cart/items', { productId, quantity });
    dispatch({ type: 'SET_CART', payload: data });
    return data;
  };

  const updateQuantity = async (productId, quantity) => {
    const { data } = await api.put(`/cart/items/${productId}`, { quantity });
    dispatch({ type: 'SET_CART', payload: data });
    return data;
  };

  const removeItem = async (productId) => {
    const { data } = await api.delete('/cart/items', { data: { productId } });
    dispatch({ type: 'SET_CART', payload: data });
    return data;
  };

  const clearCart = () => dispatch({ type: 'CLEAR_CART' });

  return (
    <CartContext.Provider value={{ ...state, fetchCart, addItem, updateQuantity, removeItem, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}

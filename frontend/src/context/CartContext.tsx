import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import apiClient from '../api/client';
import type { Cart } from '../types';

interface CartContextType {
  cart: Cart | null;
  loading: boolean;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQuantity: (itemId: number, quantity: number) => Promise<void>;
  removeItem: (itemId: number) => Promise<void>;
  clearCart: () => Promise<void>;
  refreshCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<Cart | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshCart = useCallback(async () => {
    try {
      const response = await apiClient.get('/cart/');
      setCart(response.data);
    } catch {
      setCart(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId: number, quantity: number = 1) => {
    await apiClient.post('/cart/items/', { product_id: productId, quantity });
    await refreshCart();
  };

  const updateQuantity = async (itemId: number, quantity: number) => {
    await apiClient.patch(`/cart/items/${itemId}/`, { quantity });
    await refreshCart();
  };

  const removeItem = async (itemId: number) => {
    await apiClient.delete(`/cart/items/${itemId}/`);
    await refreshCart();
  };

  const clearCart = async () => {
    await apiClient.delete('/cart/');
    await refreshCart();
  };

  return (
    <CartContext.Provider value={{ cart, loading, addItem, updateQuantity, removeItem, clearCart, refreshCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}

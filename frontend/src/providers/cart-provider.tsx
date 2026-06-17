'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './auth-provider';

interface CartItem {
  id: string;
  cartId: string;
  foodId: string;
  quantity: number;
  food: {
    id: string;
    name: string;
    price: string;
    imageUrl: string;
    preparationTime: number;
  };
}

interface Coupon {
  code: string;
  discount: string;
}

interface CartContextType {
  cartItems: CartItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  coupon: Coupon | null;
  couponError: string | null;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  addToCart: (foodId: string, quantity?: number) => Promise<void>;
  updateQuantity: (cartItemId: string, quantity: number) => Promise<void>;
  removeFromCart: (cartItemId: string) => Promise<void>;
  applyCoupon: (code: string) => Promise<void>;
  removeCoupon: () => void;
  clearCart: () => Promise<void>;
  fetchCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export default function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [coupon, setCoupon] = useState<Coupon | null>(null);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { isAuthenticated } = useAuth();

  const fetchCart = async () => {
    try {
      const response = await api.get('/cart');
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to fetch cart:', error);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchCart();
    } else {
      setCartItems([]);
      setCoupon(null);
    }
  }, [isAuthenticated]);

  const subtotal = cartItems.reduce((sum, item) => sum + parseFloat(item.food.price) * item.quantity, 0);
  const tax = subtotal * 0.08;
  
  let discount = 0;
  if (coupon) {
    const couponDiscount = parseFloat(coupon.discount);
    if (couponDiscount <= 1.0) {
      discount = subtotal * couponDiscount;
    } else {
      discount = couponDiscount;
    }
    if (discount > subtotal) discount = subtotal;
  }

  const total = Math.max(0, subtotal + tax - discount);

  const addToCart = async (foodId: string, quantity = 1) => {
    try {
      const response = await api.post('/cart/items', { foodId, quantity });
      setCartItems(response.data.items || []);
      setIsCartOpen(true);
    } catch (error) {
      console.error('Failed to add to cart:', error);
    }
  };

  const updateQuantity = async (cartItemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      const response = await api.patch(`/cart/items/${cartItemId}`, { quantity });
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to update quantity:', error);
    }
  };

  const removeFromCart = async (cartItemId: string) => {
    try {
      const response = await api.delete(`/cart/items/${cartItemId}`);
      setCartItems(response.data.items || []);
    } catch (error) {
      console.error('Failed to remove item:', error);
    }
  };

  const applyCoupon = async (code: string) => {
    setCouponError(null);
    try {
      const response = await api.get(`/coupons/validate/${code}`);
      setCoupon(response.data);
    } catch (error: any) {
      setCouponError(error.response?.data?.message || 'Invalid coupon code');
      setCoupon(null);
    }
  };

  const removeCoupon = () => {
    setCoupon(null);
    setCouponError(null);
  };

  const clearCart = async () => {
    try {
      const response = await api.delete('/cart');
      setCartItems(response.data.items || []);
      setCoupon(null);
    } catch (error) {
      console.error('Failed to clear cart:', error);
    }
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        subtotal,
        tax,
        discount,
        total,
        coupon,
        couponError,
        isCartOpen,
        setIsCartOpen,
        addToCart,
        updateQuantity,
        removeFromCart,
        applyCoupon,
        removeCoupon,
        clearCart,
        fetchCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

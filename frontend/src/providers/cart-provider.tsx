'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './auth-provider';
import { motion, AnimatePresence } from 'framer-motion';

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

  const [conflictItem, setConflictItem] = useState<{ foodId: string; quantity: number } | null>(null);

  const addToCart = async (foodId: string, quantity = 1) => {
    try {
      const response = await api.post('/cart/items', { foodId, quantity });
      setCartItems(response.data.items || []);
      setIsCartOpen(true);
    } catch (error: any) {
      if (error.response?.status === 409) {
        setConflictItem({ foodId, quantity });
      } else {
        console.error('Failed to add to cart:', error);
      }
    }
  };

  const handleResolveConflict = async () => {
    if (!conflictItem) return;
    const { foodId, quantity } = conflictItem;
    setConflictItem(null);
    await clearCart();
    await addToCart(foodId, quantity);
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

      <AnimatePresence>
        {conflictItem && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConflictItem(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />

            {/* Modal Box */}
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 10 }}
              className="relative w-full max-w-sm glass p-6 rounded-2xl border border-orange-500/20 text-center space-y-6 shadow-2xl"
            >
              <div className="w-12 h-12 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                <span className="text-xl">⚠️</span>
              </div>

              <div className="space-y-2">
                <h3 className="text-lg font-extrabold text-foreground font-outfit">
                  Replace Cart Items?
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Your cart contains dishes from another restaurant. Since FoodFlow checkout supports single-kitchen orders, adding this item will clear your current selection.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setConflictItem(null)}
                  className="w-full py-2.5 border border-border/40 hover:bg-secondary/40 text-muted-foreground hover:text-foreground font-semibold rounded-xl text-xs transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleResolveConflict}
                  className="w-full py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer"
                >
                  Clear & Add
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};

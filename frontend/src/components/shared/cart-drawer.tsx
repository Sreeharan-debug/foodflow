'use client';

import React, { useState } from 'react';
import { useCart } from '@/providers/cart-provider';
import { X, Trash2, Plus, Minus, Ticket, Check, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';

export default function CartDrawer() {
  const {
    cartItems,
    subtotal,
    tax,
    discount,
    total,
    coupon,
    couponError,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeFromCart,
    applyCoupon,
    removeCoupon,
  } = useCart();

  const [couponInput, setCouponInput] = useState('');
  const router = useRouter();

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    applyCoupon(couponInput.trim());
  };

  const handleCheckout = () => {
    setIsCartOpen(false);
    router.push('/customer/checkout');
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsCartOpen(false)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm cursor-pointer"
          />

          {/* Slide-over container */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-card border-l border-border/40 shadow-2xl flex flex-col h-full"
          >
            {/* Drawer Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/40">
              <div className="flex items-center space-x-2">
                <h2 className="text-xl font-bold text-foreground font-outfit">My Cart</h2>
                <span className="text-xs bg-orange-500/10 text-orange-400 border border-orange-500/20 px-2 py-0.5 rounded-full font-medium">
                  {cartItems.reduce((sum, item) => sum + item.quantity, 0)} items
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-md hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Body - Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center space-y-3">
                  <div className="p-4 rounded-full bg-muted/30 text-muted-foreground">
                    <X className="w-8 h-8" />
                  </div>
                  <h3 className="font-bold text-foreground text-lg">Your cart is empty</h3>
                  <p className="text-sm text-muted-foreground max-w-[200px]">
                    Browse our menu and add items to your cart to checkout!
                  </p>
                </div>
              ) : (
                cartItems.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="flex items-center space-x-4 p-4 rounded-xl border border-border/40 bg-secondary/10 hover:bg-secondary/20 transition-all"
                  >
                    {/* Item Image */}
                    {item.food.imageUrl && (
                      <img
                        src={item.food.imageUrl}
                        alt={item.food.name}
                        className="w-16 h-16 rounded-lg object-cover bg-muted border border-border/30"
                      />
                    )}
                    {/* Item Info */}
                    <div className="flex-1">
                      <h4 className="font-semibold text-foreground text-sm line-clamp-1">{item.food.name}</h4>
                      <p className="text-xs text-orange-400 font-bold mt-0.5">₹{parseFloat(item.food.price).toFixed(2)}</p>
                      
                      {/* Quantity Toggles */}
                      <div className="flex items-center space-x-2 mt-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 rounded bg-secondary hover:bg-secondary-foreground/10 text-foreground transition-all cursor-pointer disabled:opacity-30"
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-sm font-semibold w-6 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 rounded bg-secondary hover:bg-secondary-foreground/10 text-foreground transition-all cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {/* Delete Action */}
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="p-2 text-muted-foreground hover:text-destructive rounded-lg hover:bg-destructive/5 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </motion.div>
                ))
              )}
            </div>

            {/* Drawer Footer - Calculations & Summary */}
            {cartItems.length > 0 && (
              <div className="p-6 border-t border-border/40 bg-secondary/10 space-y-4">
                {/* Coupon Input */}
                {!coupon ? (
                  <form onSubmit={handleApplyCoupon} className="flex gap-2">
                    <div className="relative flex-1">
                      <Ticket className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Apply coupon code"
                        value={couponInput}
                        onChange={(e) => setCouponInput(e.target.value)}
                        className="w-full bg-background border border-border/40 rounded-lg pl-9 pr-3 py-2 text-sm text-foreground focus:outline-none focus:border-orange-500 transition-all uppercase"
                      />
                    </div>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-secondary hover:bg-secondary-foreground/10 border border-border/40 text-foreground text-sm font-medium rounded-lg transition-all cursor-pointer"
                    >
                      Apply
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/25">
                    <div className="flex items-center space-x-2">
                      <Check className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-bold text-green-400 uppercase tracking-wide">
                        {coupon.code} Applied
                      </span>
                    </div>
                    <button
                      onClick={removeCoupon}
                      className="text-xs font-semibold text-muted-foreground hover:text-foreground underline cursor-pointer"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {couponError && <p className="text-xs text-destructive font-semibold">{couponError}</p>}

                {/* Subtotals */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Subtotal</span>
                    <span>₹{subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground">
                    <span>Delivery Tax (8%)</span>
                    <span>₹{tax.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-sm text-green-400 font-semibold">
                      <span>Discount</span>
                      <span>-₹{discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="h-px bg-border/40 my-2" />
                  <div className="flex justify-between text-base font-bold text-foreground">
                    <span>Total</span>
                    <span>₹{total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Checkout Button */}
                <button
                  onClick={handleCheckout}
                  className="w-full flex items-center justify-center gap-1.5 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer text-sm"
                >
                  Proceed to Checkout
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

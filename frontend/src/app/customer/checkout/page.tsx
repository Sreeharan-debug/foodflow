'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { useCart } from '@/providers/cart-provider';
import { useAuth } from '@/providers/auth-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useRouter } from 'next/navigation';
import { MapPin, Plus, Check, Loader2, ArrowRight, Home, Briefcase, PlusCircle, Trash2, CreditCard, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Address {
  id: string;
  label: string;
  houseNumber: string;
  buildingName?: string;
  area: string;
  landmark?: string;
  city: string;
  district: string;
  state: string;
  pincode: string;
}

export default function CheckoutPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { cartItems, subtotal, tax, discount, total, coupon, clearCart } = useCart();
  const { user, showToast } = useAuth();

  const [selectedAddressId, setSelectedAddressId] = useState<string>('');
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  
  // Payments states
  const [pendingOrder, setPendingOrder] = useState<any>(null);
  const [verifyingPayment, setVerifyingPayment] = useState(false);

  // Address Form States
  const [addressLabel, setAddressLabel] = useState('Home');
  const [houseNumber, setHouseNumber] = useState('');
  const [buildingName, setBuildingName] = useState('');
  const [area, setArea] = useState('');
  const [landmark, setLandmark] = useState('');
  const [city, setCity] = useState('');
  const [district, setDistrict] = useState('');
  const [state, setState] = useState('');
  const [pincode, setPincode] = useState('');
  const [addressError, setAddressError] = useState<string | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'UPI' | 'GPay' | 'PhonePe' | 'Paytm' | 'COD'>('UPI');

  // 1. Fetch Addresses
  const { data: addresses = [], isLoading: addressesLoading } = useQuery<Address[]>({
    queryKey: ['addresses'],
    queryFn: async () => {
      const res = await api.get('/users/addresses');
      const data = res.data;
      if (data.length > 0 && !selectedAddressId) {
        setSelectedAddressId(data[0].id);
      }
      return data;
    },
  });

  // 2. Mutation for creating new address
  const addAddressMutation = useMutation({
    mutationFn: async (newAddress: Omit<Address, 'id'>) => {
      const res = await api.post('/users/addresses', newAddress);
      return res.data;
    },
    onSuccess: (newAddr) => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      setSelectedAddressId(newAddr.id);
      setShowNewAddressForm(false);
      // Reset form
      setHouseNumber('');
      setBuildingName('');
      setArea('');
      setLandmark('');
      setCity('');
      setDistrict('');
      setState('');
      setPincode('');
      setAddressLabel('Home');
    },
    onError: (err: any) => {
      setAddressError(err.response?.data?.message || 'Failed to add address');
    },
  });

  const handleAddAddressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAddressError(null);
    if (!houseNumber || !area || !city || !district || !state || !pincode) {
      setAddressError('Please fill out all required address fields');
      return;
    }
    addAddressMutation.mutate({
      label: addressLabel,
      houseNumber,
      buildingName: buildingName || undefined,
      area,
      landmark: landmark || undefined,
      city,
      district,
      state,
      pincode,
    });
  };

  // Helper to load Razorpay script dynamically
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // 3. Checkout placement logic
  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return;
    setCheckoutLoading(true);
    try {
      const response = await api.post('/orders', {
        addressId: selectedAddressId,
        couponCode: coupon?.code || undefined,
      });

      const { order, razorpayOrder } = response.data;
      setPendingOrder(order);

      // Load SDK
      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        alert('Failed to load Razorpay Payment Gateway. Check your internet connection.');
        setCheckoutLoading(false);
        return;
      }

      const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
      if (!keyId || keyId === 'mock_key_id') {
        alert('Razorpay key ID is not configured on the client.');
        setCheckoutLoading(false);
        return;
      }

      // Open options
      const options = {
        key: keyId,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        name: 'FOODFLOW',
        description: 'Order Payment',
        order_id: razorpayOrder.id,
        handler: async function (res: any) {
          setCheckoutLoading(true);
          setVerifyingPayment(true);
          try {
            await api.post('/payments/verify', {
              razorpay_order_id: res.razorpay_order_id,
              razorpay_payment_id: res.razorpay_payment_id,
              razorpay_signature: res.razorpay_signature,
            });
            await clearCart();
            showToast('🎉 Payment successful! Order confirmed.', 'success');
            router.push(`/customer/orders/${order.id}`);
          } catch (err: any) {
            alert(err.response?.data?.message || 'Payment signature verification failed.');
          } finally {
            setVerifyingPayment(false);
            setCheckoutLoading(false);
          }
        },
        prefill: {
          name: user?.name || '',
          email: user?.email || '',
        },
        theme: {
          color: '#ea580c',
        },
        modal: {
          ondismiss: function () {
            showToast('⚠️ Payment cancelled. Access orders page to complete payment.', 'info');
            router.push(`/customer/orders/${order.id}`);
          },
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (error: any) {
      console.error('Failed to checkout:', error);
      alert(error.response?.data?.message || 'Failed to place order. Please try again.');
      setCheckoutLoading(false);
    }
  };

  if (cartItems.length === 0 && !checkoutLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center py-20 px-4 text-center space-y-4">
          <div className="p-4 rounded-full bg-muted/30 text-muted-foreground">
            <MapPin className="w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold font-outfit text-foreground">Your cart is empty</h2>
          <p className="text-muted-foreground text-sm max-w-xs">
            Add items to your cart before proceeding to checkout.
          </p>
          <Link
            href="/customer/menu"
            className="px-6 py-3 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl shadow-lg text-sm"
          >
            Explore Menu
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-extrabold font-outfit text-foreground mb-8">Checkout</h1>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Address & Payment Columns */}
          <div className="lg:col-span-2 space-y-6">
            {/* Delivery Address Box */}
            <div className="glass p-6 rounded-2xl border border-border/40 space-y-6">
              <div className="flex justify-between items-center">
                <h2 className="text-lg font-bold font-outfit text-foreground flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-orange-400" />
                  Delivery Address
                </h2>
                {!showNewAddressForm && (
                  <button
                    onClick={() => setShowNewAddressForm(true)}
                    className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Add New</span>
                  </button>
                )}
              </div>

              {/* Show Add Address Form */}
              {showNewAddressForm && (
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  onSubmit={handleAddAddressSubmit}
                  className="p-5 rounded-xl bg-secondary/20 border border-border/40 space-y-4"
                >
                  <h3 className="text-sm font-bold text-foreground">Add New Delivery Address</h3>
                  
                  {addressError && <p className="text-xs text-destructive font-semibold">{addressError}</p>}

                  <div className="grid sm:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Address Label</label>
                      <select
                        value={addressLabel}
                        onChange={(e) => setAddressLabel(e.target.value)}
                        className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                      >
                        <option value="Home">Home</option>
                        <option value="Office">Office</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">House / Flat No. *</label>
                      <input
                        type="text"
                        placeholder="e.g. Flat 4B, 2nd Floor"
                        value={houseNumber}
                        onChange={(e) => setHouseNumber(e.target.value)}
                        className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Building Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Rose Apartments"
                        value={buildingName}
                        onChange={(e) => setBuildingName(e.target.value)}
                        className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Area / Locality / Street *</label>
                      <input
                        type="text"
                        placeholder="e.g. MG Road"
                        value={area}
                        onChange={(e) => setArea(e.target.value)}
                        className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Landmark (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. Near Central Library"
                        value={landmark}
                        onChange={(e) => setLandmark(e.target.value)}
                        className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-4 gap-3">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">City *</label>
                      <input
                        type="text"
                        placeholder="Kozhikode"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">District *</label>
                      <input
                        type="text"
                        placeholder="Kozhikode"
                        value={district}
                        onChange={(e) => setDistrict(e.target.value)}
                        className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">State *</label>
                      <input
                        type="text"
                        placeholder="Kerala"
                        value={state}
                        onChange={(e) => setState(e.target.value)}
                        className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase">Pincode *</label>
                      <input
                        type="text"
                        placeholder="673001"
                        value={pincode}
                        onChange={(e) => setPincode(e.target.value)}
                        className="w-full bg-background border border-border/40 rounded-lg p-2 text-xs text-foreground focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowNewAddressForm(false)}
                      className="px-3 py-1.5 border border-border/40 rounded-lg text-xs font-semibold hover:bg-secondary/40 text-muted-foreground cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={addAddressMutation.isPending}
                      className="px-4 py-1.5 bg-orange-600 hover:bg-orange-500 rounded-lg text-xs font-bold text-white shadow-md disabled:opacity-50 cursor-pointer"
                    >
                      {addAddressMutation.isPending ? 'Saving...' : 'Save Address'}
                    </button>
                  </div>
                </motion.form>
              )}

              {/* Addresses List */}
              {addressesLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-400" />
                </div>
              ) : addresses.length === 0 ? (
                <div className="p-4 rounded-xl border border-dashed border-border/40 text-center text-sm text-muted-foreground">
                  No addresses saved yet. Please add a delivery address to complete your order.
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-4">
                  {addresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    const Icon = addr.label === 'Home' ? Home : Briefcase;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-4 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          isSelected
                            ? 'bg-orange-500/10 border-orange-500/60 shadow-md'
                            : 'bg-secondary/10 border-border/40 hover:bg-secondary/20'
                        }`}
                      >
                        <div className={`p-2 rounded-lg ${isSelected ? 'bg-orange-500/20 text-orange-400' : 'bg-muted text-muted-foreground'}`}>
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center justify-between">
                            <h4 className="text-xs font-bold text-foreground uppercase">{addr.label}</h4>
                            {isSelected && <Check className="w-3.5 h-3.5 text-orange-400" />}
                          </div>
                          <p className="text-xs text-muted-foreground leading-normal">
                            {addr.houseNumber}
                            {addr.buildingName ? `, ${addr.buildingName}` : ''}
                            {`, ${addr.area}`}
                            {addr.landmark ? ` (Landmark: ${addr.landmark})` : ''}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {addr.city}, {addr.district}, {addr.state} - {addr.pincode}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

             {/* Payment Method Selection */}
            <div className="glass p-6 rounded-2xl border border-border/40 space-y-4">
              <div className="flex justify-between items-center border-b border-border/20 pb-3">
                <h2 className="text-sm font-bold font-outfit text-foreground">Select Payment Method</h2>
                <span className="text-[10px] font-semibold text-green-400 bg-green-500/10 px-2 py-0.5 rounded border border-green-500/15">
                  100% Secure Payments
                </span>
              </div>
              
              <div className="grid sm:grid-cols-2 gap-3">
                {[
                  { id: 'UPI', label: 'UPI / BHIM', desc: 'Pay using any UPI App' },
                  { id: 'GPay', label: 'Google Pay', desc: 'Instant pay with GPay' },
                  { id: 'PhonePe', label: 'PhonePe', desc: 'Secure pay with PhonePe' },
                  { id: 'Paytm', label: 'Paytm Wallet', desc: 'Link and pay from Wallet' },
                  { id: 'COD', label: 'Cash On Delivery', desc: 'Pay with cash at doorstep' },
                ].map((pm) => {
                  const isSelected = paymentMethod === pm.id;
                  return (
                    <div
                      key={pm.id}
                      onClick={() => setPaymentMethod(pm.id as any)}
                      className={`p-3 rounded-xl border transition-all flex items-start gap-2.5 cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500/10 border-orange-500/60 shadow-md'
                          : 'bg-secondary/10 border-border/40 hover:bg-secondary/20'
                      }`}
                    >
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="text-xs font-bold text-foreground">{pm.label}</h4>
                          {isSelected && <Check className="w-3.5 h-3.5 text-orange-400" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-1">{pm.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Summary Column */}
          <div className="glass p-6 rounded-2xl border border-border/40 space-y-6">
            <h2 className="text-lg font-bold font-outfit text-foreground">Order Review</h2>

            {/* Summary Items list */}
            <div className="divide-y divide-border/20 max-h-[220px] overflow-y-auto pr-2">
              {cartItems.map((item) => (
                <div key={item.id} className="py-3 flex justify-between gap-4 text-xs">
                  <div className="flex-1">
                    <h4 className="font-bold text-foreground line-clamp-1">{item.food.name}</h4>
                    <p className="text-muted-foreground mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-bold text-foreground">
                    ₹{(parseFloat(item.food.price) * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            {/* applied coupon */}
            {coupon && (
              <div className="flex items-center justify-between p-3 rounded-lg bg-green-500/10 border border-green-500/25">
                <span className="text-xs font-bold text-green-400 uppercase tracking-wide">
                  Coupon {coupon.code} Applied
                </span>
                <span className="text-xs font-bold text-green-400">
                  -₹{discount.toFixed(2)}
                </span>
              </div>
            )}

            {/* totals */}
            <div className="space-y-2 pt-4 border-t border-border/20 text-xs">
              <div className="flex justify-between text-muted-foreground">
                <span>Subtotal</span>
                <span>₹{subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Delivery Tax (8%)</span>
                <span>₹{tax.toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between text-green-400 font-semibold">
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

            {/* Submit Button */}
            <button
              onClick={handlePlaceOrder}
              disabled={checkoutLoading || !selectedAddressId}
              className="w-full flex items-center justify-center gap-1.5 py-3.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 text-sm cursor-pointer"
            >
              {checkoutLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Placing Order...</span>
                </>
              ) : (
                <>
                  <span>Place Order</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </main>



      {/* Verifying Payment Fullscreen Loader */}
      <AnimatePresence>
        {verifyingPayment && (
          <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-md space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
            <h3 className="text-lg font-bold text-foreground font-outfit">Confirming Secure Payment...</h3>
            <p className="text-xs text-muted-foreground">Please wait while we verify your transaction and update order details.</p>
          </div>
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

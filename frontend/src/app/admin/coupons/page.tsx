'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Trash2, Plus, Calendar, Loader2, AlertCircle, Ticket, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/auth-provider';
import StatusBlocker from '@/components/shared/status-blocker';

interface Coupon {
  id: string;
  code: string;
  discount: string;
  expiresAt: string;
  isActive: boolean;
}

export default function AdminCouponsPage() {
  const { user } = useAuth();
  const restaurantStatus = user?.restaurant?.status;

  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  if (user?.role === 'ADMIN' && restaurantStatus !== 'APPROVED') {
    return (
      <StatusBlocker
        status={restaurantStatus}
        restaurantName={user?.restaurant?.name}
        userName={user?.name}
      />
    );
  }

  // Form States
  const [code, setCode] = useState('');
  const [discount, setDiscount] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  // 1. Fetch Coupons
  const { data: coupons = [], isLoading, error } = useQuery<Coupon[]>({
    queryKey: ['admin-coupons'],
    queryFn: async () => {
      const res = await api.get('/coupons');
      return res.data;
    },
  });

  // 2. Add Coupon Mutation
  const addCouponMutation = useMutation({
    mutationFn: async (newCoupon: Omit<Coupon, 'id'>) => {
      const res = await api.post('/coupons', newCoupon);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
      setShowAddForm(false);
      setCode('');
      setDiscount('');
      setExpiresAt('');
      setIsActive(true);
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create coupon');
    },
  });

  // 3. Toggle Coupon Active Mutation
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, isActive }: { id: string; isActive: boolean }) => {
      const res = await api.put(`/coupons/${id}`, { isActive });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  // 4. Delete Coupon Mutation
  const deleteCouponMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/coupons/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-coupons'] });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!code.trim() || !discount || !expiresAt) {
      setFormError('Please fill out all coupon fields');
      return;
    }
    addCouponMutation.mutate({
      code: code.trim(),
      discount: discount,
      expiresAt: new Date(expiresAt).toISOString(),
      isActive,
    });
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold font-outfit text-foreground flex items-center gap-2">
              <Ticket className="w-6 h-6 text-violet-400" />
              Coupons Management
            </h1>
            <p className="text-sm text-muted-foreground">Release promo codes and control discount values (percentage or flat).</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Coupon</span>
            </button>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAddSubmit}
            className="glass p-6 rounded-2xl border border-border/40 space-y-4"
          >
            <h3 className="font-bold text-foreground text-sm">Create Promo Coupon</h3>
            {formError && <p className="text-xs text-destructive font-semibold">{formError}</p>}

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Code */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Coupon Code *</label>
                <input
                  type="text"
                  placeholder="e.g. FLOW20"
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full bg-background border border-border/40 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-violet-500 transition-all uppercase"
                />
              </div>

              {/* Discount value */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Discount Value *</label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="e.g. 0.15 for 15% or 20.00 for $20 off"
                  value={discount}
                  onChange={(e) => setDiscount(e.target.value)}
                  className="w-full bg-background border border-border/40 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>

              {/* Expires At */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Expiration Date *</label>
                <input
                  type="date"
                  value={expiresAt}
                  onChange={(e) => setExpiresAt(e.target.value)}
                  className="w-full bg-background border border-border/40 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            {/* Checkbox */}
            <div className="flex justify-between items-center pt-2">
              <label className="flex items-center space-x-2 text-xs font-semibold text-foreground select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="accent-violet-600 cursor-pointer"
                />
                <span>Enable Coupon Immediately</span>
              </label>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border border-border/40 rounded-xl text-xs font-semibold hover:bg-secondary/40 text-muted-foreground cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addCouponMutation.isPending}
                  className="px-5 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50 cursor-pointer"
                >
                  {addCouponMutation.isPending ? 'Releasing...' : 'Release Coupon'}
                </button>
              </div>
            </div>
          </motion.form>
        )}

        {/* Coupons List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl glass border border-destructive/20 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <h3 className="font-bold text-foreground">Failed to load coupons</h3>
            <p className="text-xs text-muted-foreground">Verify database state and credentials.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-border/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/15 text-muted-foreground uppercase font-bold tracking-wider border-b border-border/20">
                    <th className="p-4 pl-6">Code</th>
                    <th className="p-4">Discount</th>
                    <th className="p-4">Expiration Date</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {coupons.map((coupon) => {
                    const formattedExpiry = new Date(coupon.expiresAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    });

                    const isExpired = new Date() > new Date(coupon.expiresAt);
                    const discountVal = parseFloat(coupon.discount);

                    return (
                      <tr key={coupon.id} className="hover:bg-secondary/5 transition-colors">
                        {/* Code */}
                        <td className="p-4 pl-6">
                          <span className="font-bold text-foreground font-mono bg-secondary/35 border border-border/20 px-2 py-0.5 rounded uppercase">
                            {coupon.code}
                          </span>
                        </td>

                        {/* Discount */}
                        <td className="p-4 font-bold text-foreground">
                          {discountVal <= 1.0
                            ? `${(discountVal * 100).toFixed(0)}% OFF`
                            : `$${discountVal.toFixed(2)} OFF`}
                        </td>

                        {/* Expiry */}
                        <td className="p-4 text-muted-foreground">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Calendar className="w-3.5 h-3.5" />
                            {formattedExpiry}
                            {isExpired && (
                              <span className="text-[9px] font-bold bg-red-500/10 text-red-400 border border-red-500/10 px-1.5 py-0.5 rounded uppercase">
                                Expired
                              </span>
                            )}
                          </span>
                        </td>

                        {/* Status Toggle */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => toggleActiveMutation.mutate({ id: coupon.id, isActive: !coupon.isActive })}
                            className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                              coupon.isActive && !isExpired
                                ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                : 'bg-red-500/10 text-red-400 border-red-500/20'
                            }`}
                          >
                            {coupon.isActive && !isExpired ? 'ACTIVE' : 'DISABLED'}
                          </button>
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center">
                          <button
                            onClick={() => {
                              if (confirm('Are you sure you want to delete this coupon?')) {
                                deleteCouponMutation.mutate(coupon.id);
                              }
                            }}
                            disabled={deleteCouponMutation.isPending}
                            className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

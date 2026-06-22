'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';
import { Mail, Lock, User, FileText, MapPin, Phone, ChefHat, Loader2, ArrowRight, CheckCircle2 } from 'lucide-react';
import Navbar from '@/components/shared/navbar';

const registerVendorSchema = z.object({
  name: z.string().min(2, { message: 'Owner name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  restaurantName: z.string().min(2, { message: 'Restaurant name must be at least 2 characters' }),
  address: z.string().min(10, { message: 'Please provide a complete address' }),
  phone: z.string().optional(),
  gstNumber: z.string().optional(),
  logo: z.string().optional(),
});

type RegisterVendorFields = z.infer<typeof registerVendorSchema>;

export default function RegisterVendorPage() {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterVendorFields>({
    resolver: zodResolver(registerVendorSchema),
    defaultValues: {
      logo: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=200',
    }
  });

  const onSubmit = async (data: RegisterVendorFields) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await api.post('/auth/register-vendor', data);
      setSuccess(true);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'Vendor registration failed. This email might already be in use.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <div className="flex-1 flex bg-radial from-orange-500/5 via-background to-background justify-center items-center px-4 py-16">
        <div className="w-full max-w-lg">
          {/* Form Box */}
          <AnimatePresence mode="wait">
            {!success ? (
              <motion.div
                key="form"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5 }}
                className="glass p-8 rounded-2xl shadow-2xl space-y-6 border border-border/40"
              >
                <div className="text-center">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold uppercase tracking-wider mb-2">
                    <ChefHat className="w-3.5 h-3.5" />
                    FOODFLOW PARTNER NETWORK
                  </span>
                  <h2 className="text-2xl font-extrabold text-foreground font-outfit">
                    Register Your Restaurant
                  </h2>
                  <p className="text-sm text-muted-foreground mt-1">
                    Onboard your cloud kitchen, restaurant, or brand and serve thousands of customers live.
                  </p>
                </div>

                {errorMessage && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold leading-relaxed">
                    {errorMessage}
                  </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                  {/* Grid for Owner Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Owner Name */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Owner Full Name
                      </label>
                      <div className="relative">
                        <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="John Doe"
                          {...register('name')}
                          className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>
                      {errors.name && (
                        <p className="text-[10px] text-destructive font-semibold">{errors.name.message}</p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                          type="email"
                          placeholder="owner@restaurant.com"
                          {...register('email')}
                          className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>
                      {errors.email && (
                        <p className="text-[10px] text-destructive font-semibold">{errors.email.message}</p>
                      )}
                    </div>
                  </div>

                  {/* Grid for Password and Phone */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Password */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                          type="password"
                          placeholder="••••••••"
                          {...register('password')}
                          className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all"
                        />
                      </div>
                      {errors.password && (
                        <p className="text-[10px] text-destructive font-semibold">{errors.password.message}</p>
                      )}
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Phone Number (Optional)
                      </label>
                      <div className="relative">
                        <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="+91 98765 43210"
                          {...register('phone')}
                          className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="h-px bg-border/40 my-2" />

                  {/* Restaurant Name */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      Restaurant Name
                    </label>
                    <div className="relative">
                      <ChefHat className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Malabar Cafe"
                        {...register('restaurantName')}
                        className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all placeholder:text-muted-foreground/60"
                      />
                    </div>
                    {errors.restaurantName && (
                      <p className="text-[10px] text-destructive font-semibold">{errors.restaurantName.message}</p>
                    )}
                  </div>

                  {/* Complete Address */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                      Restaurant Street Address
                    </label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                      <input
                        type="text"
                        placeholder="Kozhikode Beach Road, Calicut, Kerala"
                        {...register('address')}
                        className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all placeholder:text-muted-foreground/60"
                      />
                    </div>
                    {errors.address && (
                      <p className="text-[10px] text-destructive font-semibold">{errors.address.message}</p>
                    )}
                  </div>

                  {/* Grid for Logo and GST */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Restaurant Logo URL */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        Logo Image URL (Optional)
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="https://..."
                          {...register('logo')}
                          className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>

                    {/* GST Number */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">
                        GSTIN Number (Optional)
                      </label>
                      <div className="relative">
                        <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                        <input
                          type="text"
                          placeholder="32AAAAA1111A1Z1"
                          {...register('gstNumber')}
                          className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all placeholder:text-muted-foreground/60"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 text-sm mt-6"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Registering Business...</span>
                      </>
                    ) : (
                      <>
                        <span>Submit Registration</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                <div className="h-px bg-border/40" />
                <p className="text-center text-xs text-muted-foreground">
                  Already have a merchant account?{' '}
                  <Link href="/admin-login" className="font-bold text-orange-400 hover:underline">
                    Log In
                  </Link>
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.5 }}
                className="glass p-8 rounded-2xl shadow-2xl text-center space-y-6 border border-border/40"
              >
                <div className="flex justify-center text-green-500">
                  <CheckCircle2 className="w-16 h-16 stroke-[1.5]" />
                </div>
                <h2 className="text-2xl font-extrabold font-outfit text-foreground">
                  Application Submitted!
                </h2>
                <div className="text-sm text-muted-foreground space-y-3 leading-relaxed">
                  <p>
                    Your vendor registration for <strong className="text-foreground">FOODFLOW Merchant</strong> has been successfully received.
                  </p>
                  <p className="bg-orange-500/10 text-orange-400 border border-orange-500/20 p-4 rounded-xl text-xs font-semibold">
                    ⏳ Current Status: PENDING ADMINISTRATIVE APPROVAL
                  </p>
                  <p>
                    New partner accounts undergo validation by our operations team. You will be granted dashboard access once your restaurant has been approved.
                  </p>
                </div>
                <div className="pt-4 flex flex-col gap-3">
                  <Link
                    href="/login"
                    className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold rounded-xl shadow-md text-sm transition-all text-center block"
                  >
                    Go to Login
                  </Link>
                  <Link
                    href="/"
                    className="text-xs text-muted-foreground hover:text-foreground font-semibold underline"
                  >
                    Return to Homepage
                  </Link>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

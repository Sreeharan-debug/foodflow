'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/services/api';
import {
  Mail, Lock, User, Loader2, ArrowRight, ShoppingBag, ChefHat,
  MapPin, Phone, FileText, CheckCircle2,
} from 'lucide-react';

// ---- Schemas ----
const customerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const vendorSchema = z.object({
  name: z.string().min(2, { message: 'Owner name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  restaurantName: z.string().min(2, { message: 'Restaurant name must be at least 2 characters' }),
  address: z.string().min(10, { message: 'Please provide a complete address (min 10 characters)' }),
  phone: z.string().optional(),
  logo: z.string().optional(),
  gstNumber: z.string().optional(),
});

type CustomerFields = z.infer<typeof customerSchema>;
type VendorFields = z.infer<typeof vendorSchema>;
type Role = 'customer' | 'admin';

// ---- Field Component ----
function FormField({
  label, icon, error, children,
}: { label: string; icon: React.ReactNode; error?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-wide">{label}</label>
      <div className="relative">
        <span className="absolute left-3 top-3 text-muted-foreground">{icon}</span>
        {children}
      </div>
      {error && <p className="text-[10px] text-destructive font-semibold">{error}</p>}
    </div>
  );
}

// ---- Customer Registration Form ----
function CustomerForm({ onError }: { onError: (msg: string) => void }) {
  const { register: authRegister } = useAuth();
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<CustomerFields>({
    resolver: zodResolver(customerSchema),
  });

  const onSubmit = async (data: CustomerFields) => {
    setLoading(true);
    onError('');
    try {
      await authRegister(data);
    } catch (error: any) {
      onError(error.response?.data?.message || 'Registration failed. A user with this email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField label="Full Name" icon={<User className="w-4 h-4" />} error={errors.name?.message}>
        <input
          type="text"
          placeholder="John Doe"
          {...register('name')}
          className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-all placeholder:text-muted-foreground/60"
        />
      </FormField>
      <FormField label="Email Address" icon={<Mail className="w-4 h-4" />} error={errors.email?.message}>
        <input
          type="email"
          placeholder="name@example.com"
          {...register('email')}
          className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-all placeholder:text-muted-foreground/60"
        />
      </FormField>
      <FormField label="Password" icon={<Lock className="w-4 h-4" />} error={errors.password?.message}>
        <input
          type="password"
          placeholder="••••••••"
          {...register('password')}
          className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-all"
        />
      </FormField>
      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 text-sm"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Creating account...</span></>
          : <><span>Create Customer Account</span><ArrowRight className="w-4 h-4" /></>
        }
      </button>
    </form>
  );
}

// ---- Vendor Registration Form ----
function VendorForm({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string) => void }) {
  const [loading, setLoading] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<VendorFields>({
    resolver: zodResolver(vendorSchema),
    defaultValues: {
      logo: 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=200',
    },
  });

  const fieldClass = "w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all placeholder:text-muted-foreground/60";

  const onSubmit = async (data: VendorFields) => {
    setLoading(true);
    onError('');
    try {
      await api.post('/auth/register-vendor', data);
      onSuccess();
    } catch (error: any) {
      onError(error.response?.data?.message || 'Vendor registration failed. This email might already be in use.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {/* Owner info grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Owner Full Name" icon={<User className="w-4 h-4" />} error={errors.name?.message}>
          <input type="text" placeholder="John Doe" {...register('name')} className={fieldClass} />
        </FormField>
        <FormField label="Email Address" icon={<Mail className="w-4 h-4" />} error={errors.email?.message}>
          <input type="email" placeholder="owner@restaurant.com" {...register('email')} className={fieldClass} />
        </FormField>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Password" icon={<Lock className="w-4 h-4" />} error={errors.password?.message}>
          <input type="password" placeholder="••••••••" {...register('password')} className={fieldClass} />
        </FormField>
        <FormField label="Phone (Optional)" icon={<Phone className="w-4 h-4" />}>
          <input type="text" placeholder="+91 98765 43210" {...register('phone')} className={fieldClass} />
        </FormField>
      </div>

      <div className="h-px bg-border/30" />

      {/* Restaurant info */}
      <FormField label="Restaurant Name" icon={<ChefHat className="w-4 h-4" />} error={errors.restaurantName?.message}>
        <input type="text" placeholder="Malabar Cafe" {...register('restaurantName')} className={fieldClass} />
      </FormField>

      <FormField label="Restaurant Address" icon={<MapPin className="w-4 h-4" />} error={errors.address?.message}>
        <input
          type="text"
          placeholder="Kozhikode Beach Road, Calicut, Kerala"
          {...register('address')}
          className={fieldClass}
        />
      </FormField>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <FormField label="Logo URL (Optional)" icon={<FileText className="w-4 h-4" />}>
          <input type="text" placeholder="https://..." {...register('logo')} className={fieldClass} />
        </FormField>
        <FormField label="GSTIN (Optional)" icon={<FileText className="w-4 h-4" />}>
          <input type="text" placeholder="32AAAAA1111A1Z1" {...register('gstNumber')} className={fieldClass} />
        </FormField>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 text-sm mt-2"
      >
        {loading
          ? <><Loader2 className="w-4 h-4 animate-spin" /><span>Submitting Application...</span></>
          : <><span>Submit Restaurant Registration</span><ArrowRight className="w-4 h-4" /></>
        }
      </button>
    </form>
  );
}

// ---- Success Screen ----
function SuccessScreen() {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="p-8 text-center space-y-5"
    >
      <div className="flex justify-center">
        <div className="w-16 h-16 rounded-full bg-green-500/15 border border-green-500/30 flex items-center justify-center">
          <CheckCircle2 className="w-9 h-9 text-green-500 stroke-[1.5]" />
        </div>
      </div>
      <div className="space-y-2">
        <h3 className="text-xl font-extrabold font-outfit text-foreground">Application Submitted!</h3>
        <p className="text-xs text-muted-foreground leading-relaxed max-w-xs mx-auto">
          Your vendor registration has been received. Our team will review and approve your kitchen within 24 hours.
        </p>
      </div>
      <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs font-bold text-orange-400 text-left space-y-1">
        <p>⏳ Status: <span className="text-foreground">PENDING ADMIN APPROVAL</span></p>
        <p className="text-muted-foreground font-normal">You&apos;ll receive an email once your restaurant is approved and your dashboard is ready.</p>
      </div>
      <div className="flex flex-col gap-3 pt-2">
        <Link
          href="/login"
          className="w-full py-3 bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold rounded-xl shadow-md text-sm transition-all text-center block"
        >
          Go to Login
        </Link>
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground font-semibold underline">
          Return to Homepage
        </Link>
      </div>
    </motion.div>
  );
}

// ---- Main Page ----
export default function RegisterPage() {
  const [role, setRole] = useState<Role>('customer');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [vendorSuccess, setVendorSuccess] = useState(false);

  const isCustomer = role === 'customer';

  const handleRoleSwitch = (newRole: Role) => {
    setRole(newRole);
    setErrorMessage('');
    setVendorSuccess(false);
  };

  const handleGoogleRegister = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'mock_client_id' || clientId === '') {
      setErrorMessage('Google OAuth client ID is not configured on this server.');
    } else {
      const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
      const scope = encodeURIComponent('openid profile email');
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    }
  };

  return (
    <div className={`flex min-h-screen justify-center items-center px-4 py-12 transition-colors duration-500 ${
      isCustomer
        ? 'bg-radial from-violet-500/5 via-background to-background'
        : 'bg-radial from-orange-500/5 via-background to-background'
    }`}>
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link
            href="/"
            className={`text-3xl font-extrabold tracking-tight bg-gradient-to-r bg-clip-text text-transparent font-outfit transition-all duration-500 ${
              isCustomer ? 'from-violet-500 to-indigo-500' : 'from-orange-500 to-amber-500'
            }`}
          >
            FOODFLOW
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            {isCustomer ? 'Join thousands of food lovers.' : 'Grow your restaurant business with us.'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-2xl shadow-2xl overflow-hidden border border-border/40"
        >
          {/* Role Switcher Tabs */}
          {!vendorSuccess && (
            <div className="flex border-b border-border/40 bg-black/20">
              <button
                onClick={() => handleRoleSwitch('customer')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all cursor-pointer relative ${
                  isCustomer ? 'text-violet-400' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Customer Account</span>
                {isCustomer && (
                  <motion.div
                    layoutId="register-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-500 to-indigo-500"
                  />
                )}
              </button>
              <button
                onClick={() => handleRoleSwitch('admin')}
                className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all cursor-pointer relative ${
                  !isCustomer ? 'text-orange-400' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                <ChefHat className="w-4 h-4" />
                <span>Register Restaurant</span>
                {!isCustomer && (
                  <motion.div
                    layoutId="register-tab-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"
                  />
                )}
              </button>
            </div>
          )}

          {/* Content */}
          <AnimatePresence mode="wait">
            {vendorSuccess ? (
              <SuccessScreen key="success" />
            ) : (
              <motion.div
                key={role}
                initial={{ opacity: 0, x: isCustomer ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isCustomer ? 20 : -20 }}
                transition={{ duration: 0.25 }}
                className="p-8 space-y-5"
              >
                {/* Role Banner */}
                <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${
                  isCustomer
                    ? 'bg-violet-500/10 border-violet-500/20'
                    : 'bg-orange-500/10 border-orange-500/20'
                }`}>
                  <div className={`p-2 rounded-lg ${isCustomer ? 'bg-violet-500/20' : 'bg-orange-500/20'}`}>
                    {isCustomer
                      ? <ShoppingBag className="w-4 h-4 text-violet-400" />
                      : <ChefHat className="w-4 h-4 text-orange-400" />
                    }
                  </div>
                  <div>
                    <p className={`text-xs font-extrabold uppercase tracking-widest ${isCustomer ? 'text-violet-400' : 'text-orange-400'}`}>
                      {isCustomer ? 'New Customer Account' : 'Restaurant Partner Registration'}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {isCustomer
                        ? 'Order food, track deliveries, leave reviews'
                        : 'Submit your kitchen for approval — receive dashboard access once approved'}
                    </p>
                  </div>
                </div>

                {/* Error */}
                {errorMessage && (
                  <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold leading-relaxed">
                    {errorMessage}
                  </div>
                )}

                {/* Dynamic Form */}
                {isCustomer ? (
                  <CustomerForm onError={setErrorMessage} />
                ) : (
                  <VendorForm
                    onSuccess={() => setVendorSuccess(true)}
                    onError={setErrorMessage}
                  />
                )}

                {/* Google Sign-up — Customer only */}
                {isCustomer && (
                  <>
                    <div className="flex items-center">
                      <div className="flex-1 h-px bg-border/40" />
                      <span className="px-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">or</span>
                      <div className="flex-1 h-px bg-border/40" />
                    </div>
                    <button
                      type="button"
                      onClick={handleGoogleRegister}
                      className="w-full flex items-center justify-center gap-2.5 py-3 glass hover:bg-white/5 border border-white/10 hover:border-white/20 text-foreground font-semibold rounded-xl transition-all cursor-pointer text-sm shadow-lg hover:scale-[1.01] active:scale-[0.99] duration-200"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span>Sign up with Google</span>
                    </button>
                  </>
                )}

                {/* Footer */}
                <div className="h-px bg-border/40" />
                <p className="text-center text-xs text-muted-foreground">
                  Already have an account?{' '}
                  <Link
                    href="/login"
                    className={`font-bold hover:underline ${isCustomer ? 'text-violet-400' : 'text-orange-400'}`}
                  >
                    Sign In
                  </Link>
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

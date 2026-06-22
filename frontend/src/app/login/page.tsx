'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, ShoppingBag, ChefHat } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type LoginFields = z.infer<typeof loginSchema>;
type Role = 'customer' | 'admin';

export default function LoginPage() {
  const { login, googleLoginCallback } = useAuth();
  const [role, setRole] = useState<Role>('customer');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [processingCallback, setProcessingCallback] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<LoginFields>({ resolver: zodResolver(loginSchema) });

  // Handle Google OAuth callback code in URL
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const code = searchParams.get('code');
    const errorParam = searchParams.get('error');

    if (errorParam === 'google_oauth_not_configured') {
      setErrorMessage('Google OAuth is not configured on the server. Please verify your environment settings.');
    } else if (code) {
      if (code === 'mock-auth-code') {
        setErrorMessage('Mock authentication code is not supported in production.');
        return;
      }
      setProcessingCallback(true);
      googleLoginCallback(code)
        .catch((err: any) => {
          setErrorMessage(err.response?.data?.message || 'Google Sign-In failed. Please try again.');
        })
        .finally(() => setProcessingCallback(false));
    }
  }, [googleLoginCallback]);

  const onSubmit = async (data: LoginFields) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await login(data);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'Login failed. Please verify your email and password.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleRoleSwitch = (newRole: Role) => {
    setRole(newRole);
    setErrorMessage(null);
    reset();
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'mock_client_id' || clientId === '') {
      setErrorMessage('Google OAuth client ID is not configured on this server.');
    } else {
      const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
      const scope = encodeURIComponent('openid profile email');
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    }
  };

  const isCustomer = role === 'customer';
  const accent = isCustomer ? 'violet' : 'orange';

  if (processingCallback) {
    return (
      <div className="flex min-h-screen bg-background justify-center items-center flex-col space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-violet-500" />
        <h2 className="text-xl font-bold text-foreground font-outfit">Verifying Google account...</h2>
        <p className="text-xs text-muted-foreground">Please wait while we establish your secure session.</p>
      </div>
    );
  }

  return (
    <div className={`flex min-h-screen justify-center items-center px-4 py-12 transition-colors duration-500 ${
      isCustomer
        ? 'bg-radial from-violet-500/5 via-background to-background'
        : 'bg-radial from-orange-500/5 via-background to-background'
    }`}>
      <div className="w-full max-w-md">
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
            {isCustomer ? 'Welcome back! Sign in to order amazing food.' : 'Partner portal — manage your kitchen.'}
          </p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="glass rounded-2xl shadow-2xl overflow-hidden border border-border/40"
        >
          {/* Role Switcher Tabs */}
          <div className="flex border-b border-border/40 bg-black/20">
            <button
              onClick={() => handleRoleSwitch('customer')}
              className={`flex-1 flex items-center justify-center gap-2 py-4 text-sm font-bold transition-all cursor-pointer relative ${
                isCustomer ? 'text-violet-400' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Customer Login</span>
              {isCustomer && (
                <motion.div
                  layoutId="tab-indicator"
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
              <span>Admin / Merchant</span>
              {!isCustomer && (
                <motion.div
                  layoutId="tab-indicator"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-orange-500 to-amber-500"
                />
              )}
            </button>
          </div>

          {/* Form Body */}
          <AnimatePresence mode="wait">
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
                    {isCustomer ? 'Customer Portal' : 'Merchant Portal'}
                  </p>
                  <p className="text-[10px] text-muted-foreground">
                    {isCustomer
                      ? 'Access your orders, cart and profile'
                      : 'Access your restaurant dashboard & analytics'}
                  </p>
                </div>
              </div>

              {/* Error */}
              {errorMessage && (
                <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold leading-relaxed">
                  {errorMessage}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder={isCustomer ? 'name@example.com' : 'owner@restaurant.com'}
                      {...register('email')}
                      className={`w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none transition-all placeholder:text-muted-foreground/60 ${
                        isCustomer ? 'focus:border-violet-500' : 'focus:border-orange-500'
                      }`}
                    />
                  </div>
                  {errors.email && <p className="text-xs text-destructive font-semibold">{errors.email.message}</p>}
                </div>

                {/* Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register('password')}
                      className={`w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none transition-all ${
                        isCustomer ? 'focus:border-violet-500' : 'focus:border-orange-500'
                      }`}
                    />
                  </div>
                  {errors.password && <p className="text-xs text-destructive font-semibold">{errors.password.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className={`w-full flex items-center justify-center gap-1.5 py-3 font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 text-sm text-white bg-gradient-to-r ${
                    isCustomer
                      ? 'from-violet-600 to-indigo-600 hover:brightness-110 shadow-violet-500/20'
                      : 'from-orange-600 to-amber-600 hover:brightness-110 shadow-orange-500/20'
                  }`}
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Signing in...</span></>
                  ) : (
                    <><span>Sign In</span><ArrowRight className="w-4 h-4" /></>
                  )}
                </button>
              </form>

              {/* Google OAuth — Customer only */}
              {isCustomer && (
                <>
                  <div className="flex items-center">
                    <div className="flex-1 h-px bg-border/40" />
                    <span className="px-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">or</span>
                    <div className="flex-1 h-px bg-border/40" />
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2.5 py-3 glass hover:bg-white/5 border border-white/10 hover:border-white/20 text-foreground font-semibold rounded-xl transition-all cursor-pointer text-sm shadow-lg hover:scale-[1.01] active:scale-[0.99] duration-200"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                </>
              )}

              {/* Footer links */}
              <div className="h-px bg-border/40" />
              <div className="text-center text-xs text-muted-foreground space-y-1">
                {isCustomer ? (
                  <p>
                    Don&apos;t have an account?{' '}
                    <Link href="/register" className="font-bold text-violet-400 hover:underline">
                      Create Account
                    </Link>
                  </p>
                ) : (
                  <p>
                    Don&apos;t have a merchant account?{' '}
                    <Link href="/register" className="font-bold text-orange-400 hover:underline">
                      Register Restaurant
                    </Link>
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}

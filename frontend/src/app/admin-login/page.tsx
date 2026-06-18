'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/services/api';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, Loader2, ArrowRight, ShieldCheck } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid admin email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

const resetPasswordSchema = z.object({
  newPassword: z.string().min(6, { message: 'New password must be at least 6 characters' }),
  confirmPassword: z.string().min(6, { message: 'Confirm password must be at least 6 characters' }),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type LoginFields = z.infer<typeof loginSchema>;
type ResetPasswordFields = z.infer<typeof resetPasswordSchema>;

export default function AdminLoginPage() {
  const { login, showToast } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Credentials reset enforcement states
  const [mustReset, setMustReset] = useState(false);
  const [tempCredentials, setTempCredentials] = useState<LoginFields | null>(null);
  const [resetLoading, setResetLoading] = useState(false);
  const [resetError, setResetError] = useState<string | null>(null);
  
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFields>({
    resolver: zodResolver(loginSchema),
  });

  const {
    register: registerReset,
    handleSubmit: handleSubmitReset,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFields>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (data: LoginFields) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      // Direct call to API first to inspect role and password change status before triggering generic auth provider redirect
      const response = await api.post('/auth/login', data);
      const { user: loggedInUser, tokens } = response.data;

      if (loggedInUser.role !== 'ADMIN') {
        throw new Error('Unauthorized. This portal is for administrators only.');
      }

      if (loggedInUser.mustChangePassword) {
        // Enforce password change first! Keep credentials in state to apply later
        setTempCredentials(data);
        setMustReset(true);
        // Save tokens to localStorage so the auth headers are available for change-password
        localStorage.setItem('accessToken', tokens.accessToken);
        localStorage.setItem('refreshToken', tokens.refreshToken);
        localStorage.setItem('user', JSON.stringify(loggedInUser));
        setLoading(false);
        return;
      }

      // Log in standard way
      await login(data);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || error.message || 'Login failed. Please verify credentials.'
      );
    } finally {
      setLoading(false);
    }
  };

  const onResetSubmit = async (data: ResetPasswordFields) => {
    setResetLoading(true);
    setResetError(null);
    try {
      if (!tempCredentials) {
        throw new Error('Session details missing. Please refresh.');
      }

      await api.post('/auth/change-password', {
        currentPassword: tempCredentials.password,
        newPassword: data.newPassword,
      });

      showToast('🔒 Admin password updated successfully! Redirecting...', 'success');
      
      // Update local storage user mustChangePassword status to false
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const u = JSON.parse(storedUser);
        u.mustChangePassword = false;
        localStorage.setItem('user', JSON.stringify(u));
      }

      setTimeout(() => {
        router.push('/admin/dashboard');
      }, 1500);
    } catch (error: any) {
      setResetError(
        error.response?.data?.message || error.message || 'Failed to update password.'
      );
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-radial from-red-500/5 via-background to-background justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-red-500 to-orange-500 bg-clip-text text-transparent font-outfit">
            FOODFLOW
          </Link>
          <div className="flex items-center justify-center gap-1.5 mt-2 text-sm text-red-500 font-bold tracking-wide uppercase">
            <ShieldCheck className="w-4 h-4" />
            <span>Admin Gateway</span>
          </div>
        </div>

        {/* Form Container */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass p-8 rounded-2xl shadow-2xl border border-red-500/10 space-y-6"
        >
          {!mustReset ? (
            <>
              <h2 className="text-xl font-bold text-foreground font-outfit">Admin Log In</h2>

              {errorMessage && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold leading-relaxed">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Admin Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      type="email"
                      placeholder="admin@foodflow.com"
                      {...register('email')}
                      className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-red-500 transition-all placeholder:text-muted-foreground/60"
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-400 font-semibold">{errors.email.message}</p>
                  )}
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
                      className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                  {errors.password && (
                    <p className="text-xs text-red-400 font-semibold">{errors.password.message}</p>
                  )}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-red-600 to-orange-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 text-sm"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Portal...</span>
                    </>
                  ) : (
                    <>
                      <span>Enter Dashboard</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </>
          ) : (
            // Password Reset Flow
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-xl font-bold text-foreground font-outfit">Reset Default Credentials</h2>
                <p className="text-xs text-muted-foreground mt-1.5">
                  You are logging in with the default admin credentials. For security, you are required to change your password immediately.
                </p>
              </div>

              {resetError && (
                <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-semibold">
                  {resetError}
                </div>
              )}

              <form onSubmit={handleSubmitReset(onResetSubmit)} className="space-y-4">
                {/* New Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    New Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="Enter strong password"
                      {...registerReset('newPassword')}
                      className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                  {resetErrors.newPassword && (
                    <p className="text-xs text-red-400 font-semibold">{resetErrors.newPassword.message}</p>
                  )}
                </div>

                {/* Confirm Password */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                    Confirm Admin Password
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                    <input
                      type="password"
                      placeholder="Repeat password"
                      {...registerReset('confirmPassword')}
                      className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-red-500 transition-all"
                    />
                  </div>
                  {resetErrors.confirmPassword && (
                    <p className="text-xs text-red-400 font-semibold">{resetErrors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Submit Reset */}
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 text-sm"
                >
                  {resetLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Updating Credentials...</span>
                    </>
                  ) : (
                    <span>Update Password & Login</span>
                  )}
                </button>
              </form>
            </motion.div>
          )}

          {/* Direct return to standard portals */}
          <div className="h-px bg-border/40" />
          <p className="text-center text-xs text-muted-foreground">
            Looking for customer login?{' '}
            <Link href="/login" className="font-bold text-red-400 hover:underline">
              Go to Customer Login
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

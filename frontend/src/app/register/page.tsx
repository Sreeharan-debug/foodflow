'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Loader2, ArrowRight } from 'lucide-react';

const registerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  email: z.string().email({ message: 'Please enter a valid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
});

type RegisterFields = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const { register: authRegister } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFields>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFields) => {
    setLoading(true);
    setErrorMessage(null);
    try {
      await authRegister(data);
    } catch (error: any) {
      setErrorMessage(
        error.response?.data?.message || 'Registration failed. A user with this email might already exist.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'mock_client_id' || clientId === '') {
      router.push('/login?code=mock-auth-code');
    } else {
      const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
      const scope = encodeURIComponent('openid profile email');
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    }
  };

  return (
    <div className="flex min-h-screen bg-radial from-violet-500/5 via-background to-background justify-center items-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Logo Link */}
        <div className="text-center mb-8">
          <Link href="/" className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent font-outfit">
            FOODFLOW
          </Link>
          <p className="text-sm text-muted-foreground mt-2">
            Create a premium account to start tracking flavor.
          </p>
        </div>

        {/* Form Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="glass p-8 rounded-2xl shadow-2xl space-y-6"
        >
          <h2 className="text-xl font-bold text-foreground font-outfit">Sign Up</h2>

          {errorMessage && (
            <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-semibold leading-relaxed">
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Name Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Full Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="John Doe"
                  {...register('name')}
                  className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-all placeholder:text-muted-foreground/60"
                />
              </div>
              {errors.name && (
                <p className="text-xs text-destructive font-semibold">{errors.name.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wide">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  placeholder="name@example.com"
                  {...register('email')}
                  className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-all placeholder:text-muted-foreground/60"
                />
              </div>
              {errors.email && (
                <p className="text-xs text-destructive font-semibold">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
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
                  className="w-full bg-background/50 border border-border/40 rounded-xl pl-9 pr-3 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
              {errors.password && (
                <p className="text-xs text-destructive font-semibold">{errors.password.message}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 py-3 bg-gradient-to-r from-violet-600 to-indigo-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all cursor-pointer disabled:opacity-50 text-sm"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Registering...</span>
                </>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-4">
            <div className="flex-1 h-px bg-border/40" />
            <span className="px-3 text-[10px] text-muted-foreground uppercase font-bold tracking-wider">or</span>
            <div className="flex-1 h-px bg-border/40" />
          </div>

          {/* Google Login Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            className="w-full flex items-center justify-center gap-2.5 py-3 glass hover:bg-white/5 border border-white/10 hover:border-white/20 text-foreground font-semibold rounded-xl transition-all cursor-pointer text-sm shadow-lg hover:shadow-xl hover:scale-[1.01] active:scale-[0.99] duration-200"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            <span>Continue with Google</span>
          </button>

          {/* Redirection */}
          <div className="h-px bg-border/40" />
          <p className="text-center text-xs text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-bold text-violet-400 hover:underline">
              Log In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

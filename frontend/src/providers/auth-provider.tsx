'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

interface User {
  id: string;
  email: string;
  name: string;
  role: 'CUSTOMER' | 'ADMIN' | 'SUPER_ADMIN';
  status: 'ACTIVE' | 'BLOCKED';
  provider?: string;
  profileImage?: string;
  restaurant?: {
    id: string;
    name: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  };
}

interface ToastInfo {
  message: string;
  type: 'success' | 'info' | 'error';
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: any) => Promise<void>;
  register: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
  showToast: (message: string, type?: 'success' | 'info' | 'error') => void;
  googleLoginCallback: (code: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [toast, setToast] = useState<ToastInfo | null>(null);
  const router = useRouter();

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const refreshUser = async () => {
    const userId = user?.id || JSON.parse(localStorage.getItem('user') || '{}').id;
    if (!userId) return;
    try {
      const response = await api.get(`/users/${userId}`);
      setUser(response.data);
      localStorage.setItem('user', JSON.stringify(response.data));
    } catch (error) {
      console.error('Failed to refresh user profile:', error);
    }
  };

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('accessToken');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);

    const handleLogoutEvent = () => {
      setUser(null);
      router.push('/login');
    };

    window.addEventListener('auth-logout', handleLogoutEvent);
    return () => {
      window.removeEventListener('auth-logout', handleLogoutEvent);
    };
  }, [router]);

  const login = async (credentials: any) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/login', credentials);
      const { user: loggedInUser, tokens } = response.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      setUser(loggedInUser);
      showToast(`👋 Welcome back ${loggedInUser.name.split(' ')[0]}!`);

      if (loggedInUser.role === 'SUPER_ADMIN') {
        router.push('/super-admin/dashboard');
      } else if (loggedInUser.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer/menu');
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: any) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/register', data);
      const { user: registeredUser, tokens } = response.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(registeredUser));

      setUser(registeredUser);
      showToast(`🎉 Welcome ${registeredUser.name.split(' ')[0]}!\nYour account was created successfully.`);
      router.push('/customer/menu');
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const googleLoginCallback = async (code: string) => {
    setIsLoading(true);
    try {
      const response = await api.post('/auth/google', {
        code,
        redirectUri: `${window.location.origin}/login`,
      });
      const { user: loggedInUser, tokens } = response.data;

      localStorage.setItem('accessToken', tokens.accessToken);
      localStorage.setItem('refreshToken', tokens.refreshToken);
      localStorage.setItem('user', JSON.stringify(loggedInUser));

      setUser(loggedInUser);

      const firstName = loggedInUser.name.split(' ')[0];
      if (loggedInUser.isNewUser) {
        showToast(`🎉 Welcome ${firstName}!\nYour FOODFLOW account has been created successfully.`);
      } else {
        showToast(`👋 Welcome back ${firstName}!`);
      }

      if (loggedInUser.role === 'SUPER_ADMIN') {
        router.push('/super-admin/dashboard');
      } else if (loggedInUser.role === 'ADMIN') {
        router.push('/admin/dashboard');
      } else {
        router.push('/customer/menu');
      }
    } catch (error) {
      setIsLoading(false);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    const refreshToken = localStorage.getItem('refreshToken');
    try {
      if (refreshToken) {
        await api.post('/auth/logout', { refreshToken });
      }
    } catch (error) {
      console.error('Logout failed on backend:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      router.push('/');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshUser,
        showToast,
        googleLoginCallback,
      }}
    >
      {children}

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 glass border border-orange-500/20 px-6 py-4 rounded-2xl shadow-2xl flex items-center space-x-3 text-sm font-semibold max-w-sm"
          >
            <span className="text-xl">
              {toast.type === 'success' ? '🎉' : toast.type === 'error' ? '❌' : 'ℹ️'}
            </span>
            <p className="text-foreground whitespace-pre-line leading-relaxed">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

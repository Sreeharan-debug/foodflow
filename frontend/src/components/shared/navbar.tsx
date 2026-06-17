'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { useCart } from '@/providers/cart-provider';
import { useTheme } from '@/providers/theme-provider';
import { ShoppingBag, Sun, Moon, User, LogOut, Menu, X, LayoutDashboard, Compass, ReceiptText, ShieldAlert } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getFirstName } from '@/utils/name';

export default function Navbar() {
  const pathname = usePathname();
  const { user, logout, isAuthenticated } = useAuth();
  const { cartItems, setIsCartOpen } = useCart();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleGoogleLogin = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (!clientId || clientId === 'mock_client_id' || clientId === '') {
      window.location.href = `/login?code=mock-auth-code`;
    } else {
      const redirectUri = encodeURIComponent(`${window.location.origin}/login`);
      const scope = encodeURIComponent('openid profile email');
      window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}`;
    }
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const isLinkActive = (path: string) => pathname === path;

  interface LinkItem {
    name: string;
    href: string;
    icon?: React.ComponentType<any>;
  }

  const guestLinks: LinkItem[] = [
    { name: 'Home', href: '/' },
    { name: 'Menu', href: '/customer/menu' },
    { name: 'About Project', href: '/about-project' },
  ];

  const customerLinks: LinkItem[] = [
    { name: 'Menu', href: '/customer/menu', icon: Compass },
    { name: 'My Orders', href: '/customer/orders', icon: ReceiptText },
    { name: 'About Project', href: '/about-project' },
  ];

  const adminLinks: LinkItem[] = [
    { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'Live Queue', href: '/admin/orders/live', icon: ShieldAlert },
    { name: 'Foods', href: '/admin/foods' },
    { name: 'Categories', href: '/admin/categories' },
    { name: 'Coupons', href: '/admin/coupons' },
    { name: 'Audit Logs', href: '/admin/audit-logs' },
    { name: 'About Project', href: '/about-project' },
  ];

  const links = !isAuthenticated
    ? guestLinks
    : user?.role === 'ADMIN'
    ? adminLinks
    : customerLinks;

  return (
    <>
      <header className="sticky top-0 z-40 w-full glass transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex-shrink-0">
              <Link href="/" className="flex items-center space-x-2">
                <span className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-orange-500 to-red-500 bg-clip-text text-transparent font-outfit">
                  FOODFLOW
                </span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20">
                  3.0
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1 items-center">
              {links.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`px-3 py-2 rounded-md text-sm font-medium transition-all ${
                    isLinkActive(link.href)
                      ? 'bg-orange-500/10 text-orange-400 border border-orange-500/10'
                      : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    {link.icon && <link.icon className="w-4 h-4" />}
                    {link.name}
                  </span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="hidden md:flex items-center space-x-4">
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-full hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                aria-label="Toggle Theme"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              {/* Cart Toggle */}
              {isAuthenticated && user?.role === 'CUSTOMER' && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 rounded-full hover:bg-secondary/60 text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-5 h-5" />
                  <AnimatePresence>
                    {cartCount > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-gradient-to-r from-orange-600 to-amber-600 text-[10px] font-bold text-white shadow-lg"
                      >
                        {cartCount}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </button>
              )}

              {/* User Account / Profile */}
              {isAuthenticated ? (
                <div className="flex items-center space-x-3">
                  <Link
                    href={user?.role === 'ADMIN' ? '/admin/dashboard' : '/customer/profile'}
                    className="flex items-center space-x-2 text-sm text-muted-foreground hover:text-foreground"
                  >
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-8 h-8 rounded-full object-cover mr-2" />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 mr-2 shrink-0">
                        <User className="w-4 h-4" />
                      </div>
                    )}
                    <span className="font-medium max-w-[120px] truncate">{getFirstName(user?.name)}</span>
                  </Link>
                  <button
                    onClick={logout}
                    className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-all cursor-pointer"
                    title="Log Out"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Link
                    href="/login"
                    className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-all"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg shadow-lg hover:brightness-110 transition-all"
                  >
                    Register
                  </Link>
                </div>
              )}
            </div>

            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden space-x-2">
              {isAuthenticated && user?.role === 'CUSTOMER' && (
                <button
                  onClick={() => setIsCartOpen(true)}
                  className="relative p-2 rounded-full hover:bg-secondary/60 text-muted-foreground transition-all"
                >
                  <ShoppingBag className="w-5 h-5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-orange-600 text-[9px] font-bold text-white">
                      {cartCount}
                    </span>
                  )}
                </button>
              )}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary/60"
              >
                {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
              className="md:hidden glass border-t border-border/40 py-4 px-6 space-y-3"
            >
              <nav className="flex flex-col space-y-1">
                {links.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`px-3 py-2.5 rounded-md text-base font-medium transition-all ${
                      isLinkActive(link.href)
                        ? 'bg-orange-500/10 text-orange-400'
                        : 'text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      {link.icon && <link.icon className="w-5 h-5" />}
                      {link.name}
                    </span>
                  </Link>
                ))}
              </nav>

              <div className="h-px bg-border/40 my-3" />

              <div className="flex items-center justify-between py-2">
                <span className="text-sm text-muted-foreground font-medium">Appearance</span>
                <button
                  onClick={toggleTheme}
                  className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-secondary/40 text-sm font-medium"
                >
                  {theme === 'dark' ? (
                    <>
                      <Sun className="w-4 h-4" />
                      <span>Light</span>
                    </>
                  ) : (
                    <>
                      <Moon className="w-4 h-4" />
                      <span>Dark</span>
                    </>
                  )}
                </button>
              </div>

              {isAuthenticated ? (
                <div className="pt-2 flex flex-col space-y-2">
                  <div className="flex items-center gap-2 px-3 py-1 text-sm text-muted-foreground font-medium">
                    {user?.profileImage ? (
                      <img src={user.profileImage} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 shrink-0">
                        <User className="w-3.5 h-3.5" />
                      </div>
                    )}
                    <span>{getFirstName(user?.name)}</span>
                  </div>
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-destructive/20 text-destructive hover:bg-destructive/10 transition-all font-medium"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </div>
              ) : (
                <div className="pt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-2.5 py-3 glass hover:bg-white/5 border border-white/10 hover:border-white/20 text-foreground font-semibold rounded-xl transition-all cursor-pointer text-sm shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99] duration-200 col-span-2"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    <span>Continue with Google</span>
                  </button>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 border border-border rounded-lg text-sm font-medium hover:bg-secondary/40"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center px-4 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white rounded-lg text-sm font-medium shadow-md col-span-2"
                  >
                    Register
                  </Link>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
}

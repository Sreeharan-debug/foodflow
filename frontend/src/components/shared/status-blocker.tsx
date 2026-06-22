'use client';

import React from 'react';
import Link from 'next/link';
import { Clock, X, AlertCircle } from 'lucide-react';
import Navbar from './navbar';
import Footer from './footer';

interface StatusBlockerProps {
  status?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  restaurantName?: string;
  userName?: string;
}

export default function StatusBlocker({ status, restaurantName, userName }: StatusBlockerProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <main className="flex-1 flex items-center justify-center bg-radial from-orange-500/5 via-background to-background px-4 py-16">
        <div className="max-w-md w-full glass p-8 rounded-2xl border border-border/40 text-center space-y-6 shadow-2xl">
          {status === 'PENDING' && (
            <>
              <div className="w-16 h-16 bg-amber-500/10 text-amber-500 border border-amber-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <Clock className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-bold uppercase tracking-wider">
                  PENDING APPROVAL
                </span>
                <h2 className="text-xl font-extrabold text-foreground font-outfit">
                  Onboarding Application Under Review
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Welcome to FoodFlow Partner Network, <strong className="text-foreground">{restaurantName || 'your restaurant'}</strong>. Our compliance and operations team is currently reviewing your registration.
                </p>
              </div>
              <div className="bg-orange-500/5 border border-orange-500/10 rounded-xl p-4 text-[11px] text-muted-foreground leading-relaxed">
                ⏳ Review processes typically complete within <span className="text-orange-400 font-bold">24 working hours</span>. You will receive an automated email confirmation once active.
              </div>
            </>
          )}

          {status === 'REJECTED' && (
            <>
              <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto">
                <X className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider">
                  APPLICATION REJECTED
                </span>
                <h2 className="text-xl font-extrabold text-foreground font-outfit">
                  Registration Declined
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Unfortunately, your vendor application for <strong className="text-foreground">{restaurantName || 'your restaurant'}</strong> has been rejected by our team.
                </p>
              </div>
              <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-4 text-[11px] text-muted-foreground leading-relaxed">
                For details or appeal requests, please write to us at <a href="mailto:merchants@foodflow.com" className="text-orange-400 font-bold underline">merchants@foodflow.com</a> referencing your account email.
              </div>
            </>
          )}

          {status === 'SUSPENDED' && (
            <>
              <div className="w-16 h-16 bg-red-500/10 text-red-500 border border-red-500/20 rounded-full flex items-center justify-center mx-auto animate-pulse">
                <AlertCircle className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 text-red-400 border border-red-500/20 text-xs font-bold uppercase tracking-wider">
                  ACCOUNT SUSPENDED
                </span>
                <h2 className="text-xl font-extrabold text-foreground font-outfit">
                  Vendor Access Terminated
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  The merchant portal access for <strong className="text-foreground">{restaurantName || 'your restaurant'}</strong> has been suspended due to policy compliance terms or billing issues.
                </p>
              </div>
              <div className="bg-destructive/5 border border-destructive/10 rounded-xl p-4 text-[11px] text-muted-foreground leading-relaxed">
                Please contact your platform representative or send an inquiry to <a href="mailto:compliance@foodflow.com" className="text-orange-400 font-bold underline">compliance@foodflow.com</a>.
              </div>
            </>
          )}

          {!status && (
            <>
              <div className="w-16 h-16 bg-orange-500/10 text-orange-500 border border-orange-500/20 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle className="w-8 h-8 stroke-[1.5]" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-extrabold text-foreground font-outfit">
                  Onboarding Incomplete
                </h2>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  No restaurant registry found for this vendor account. Please complete your registration.
                </p>
              </div>
              <div className="pt-2">
                <Link
                  href="/register-vendor"
                  className="inline-flex items-center justify-center py-2.5 px-6 bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white font-bold rounded-xl shadow-lg transition-all text-xs cursor-pointer"
                >
                  Register Restaurant
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

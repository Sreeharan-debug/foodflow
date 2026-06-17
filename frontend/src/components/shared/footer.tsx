'use client';

import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-border/40 bg-card/10 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <span className="text-lg font-extrabold tracking-tight bg-gradient-to-r from-violet-500 to-indigo-500 bg-clip-text text-transparent font-outfit">
              FOODFLOW
            </span>
            <p className="text-xs text-muted-foreground mt-1">
              &copy; {new Date().getFullYear()} FOODFLOW Technologies Inc. All rights reserved.
            </p>
          </div>
          <div className="flex space-x-6 text-sm">
            <Link href="/customer/menu" className="text-muted-foreground hover:text-foreground transition-all">
              Menu
            </Link>
            <Link href="/about-project" className="text-muted-foreground hover:text-foreground transition-all">
              About Project
            </Link>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-all">
              Privacy Policy
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground transition-all">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

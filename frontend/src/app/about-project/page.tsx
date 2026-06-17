'use client';

import React from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { motion } from 'framer-motion';
import { Network, Database, Layers, Milestone, Compass, Server, ShieldCheck, ShoppingCart, KeyRound } from 'lucide-react';

export default function AboutProjectPage() {
  const techStack = [
    { name: 'Next.js 15', desc: 'App Router, React 19, Server & Client Components architecture', category: 'Frontend' },
    { name: 'TypeScript', desc: 'Strict mode typed codebase for early bug catches', category: 'Language' },
    { name: 'Tailwind CSS 4', desc: 'Utility classes and advanced theme variable definitions', category: 'Styling' },
    { name: 'Framer Motion', desc: 'Smooth component entries, timeline slides, and micro-hover states', category: 'Animation' },
    { name: 'TanStack Query', desc: 'Asynchronous state synchronization, background refetching', category: 'Data Fetching' },
    { name: 'Recharts', desc: 'Render Area, Bar, and Pie charts dynamically with HSL tailwinds', category: 'Charts' },
    { name: 'NestJS 11', desc: 'Modular backend framework with dependency injection and modules', category: 'Backend' },
    { name: 'Prisma ORM', desc: 'Type-safe database queries, schema declarations, and seed pipelines', category: 'Database ORM' },
    { name: 'PostgreSQL', desc: 'Relational data model running on Neon Serverless (production) & local service', category: 'Database' },
    { name: 'Socket.IO', desc: 'WebSockets gateway for instant preparing/dispatch timeline tracking', category: 'Real-time' },
    { name: 'Cloudinary', desc: 'Remote storage for food image uploads with mock fallback logic', category: 'Storage' },
  ];

  const erdModels = [
    {
      name: 'User',
      fields: ['id (UUID, PK)', 'email (String, Unique)', 'password (String)', 'name (String)', 'role (Role Enum)', 'status (Status Enum)'],
      relations: '1-to-many RefreshToken, Address, Order. 1-to-1 Cart.',
    },
    {
      name: 'Food',
      fields: ['id (UUID, PK)', 'name (String)', 'description (String)', 'price (Decimal)', 'imageUrl (String)', 'rating (Float)', 'preparationTime (Int)', 'featured (Boolean)', 'isAvailable (Boolean)', 'categoryId (UUID, FK)'],
      relations: 'Belongs to Category. Used in CartItem, OrderItem.',
    },
    {
      name: 'Order',
      fields: ['id (UUID, PK)', 'userId (UUID, FK)', 'total (Decimal)', 'tax (Decimal)', 'discount (Decimal)', 'couponId (UUID, FK, Nullable)', 'addressId (UUID, FK)', 'status (Status Enum)', 'createdAt (DateTime)'],
      relations: 'Belongs to User, Address, Coupon. Has many OrderItem.',
    },
    {
      name: 'Coupon',
      fields: ['id (UUID, PK)', 'code (String, Unique)', 'discount (Decimal)', 'expiresAt (DateTime)', 'isActive (Boolean)'],
      relations: 'Used by many Orders.',
    },
    {
      name: 'AuditLog',
      fields: ['id (UUID, PK)', 'action (String)', 'performedBy (String)', 'entityType (String)', 'entityId (UUID, Nullable)', 'timestamp (DateTime)'],
      relations: 'System-wide activity logger.',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Title Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 text-xs font-bold uppercase tracking-wider">
            Capstone Showcase
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold font-outfit text-foreground leading-tight">
            FOODFLOW 2.1 Ecosystem
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
            A deep-dive overview of the architectural pipelines, entity relationships, tech stack selections, and roadmap execution behind FOODFLOW 2.1.
          </p>
        </div>

        {/* 1. Architecture Flow Diagram (HTML Visual Nodes) */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold font-outfit text-foreground flex items-center gap-2">
            <Network className="w-5 h-5 text-violet-400" />
            System Architecture
          </h2>
          <div className="glass p-8 rounded-3xl border border-border/40 overflow-x-auto flex flex-col items-center min-w-[600px] py-12">
            {/* Top Level: Next.js Client */}
            <div className="flex flex-col items-center">
              <div className="px-6 py-3.5 bg-gradient-to-r from-violet-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg flex items-center gap-2">
                <Compass className="w-4 h-4" />
                <span>Next.js 15 Client Portal</span>
              </div>
              <div className="h-8 w-px bg-border/80 border-dashed" />
            </div>

            {/* Middle Level: NestJS Core */}
            <div className="flex justify-between items-center w-full max-w-2xl border-t-2 border-dashed border-border/60 pt-0">
              {/* WS Flow */}
              <div className="flex flex-col items-center -mt-px flex-1">
                <div className="h-8 w-px bg-border/80 border-dashed" />
                <div className="px-4 py-2 bg-secondary/80 border border-border/40 rounded-lg text-xs font-bold text-violet-400">
                  Socket.IO Gateway
                </div>
              </div>

              {/* REST Flow */}
              <div className="flex flex-col items-center -mt-px flex-1">
                <div className="h-8 w-px bg-border/80 border-dashed" />
                <div className="px-4 py-2 bg-secondary/80 border border-border/40 rounded-lg text-xs font-bold text-indigo-400">
                  REST Controllers + JWT Guard
                </div>
              </div>
            </div>

            {/* Connecting lines */}
            <div className="flex justify-between items-center w-full max-w-2xl">
              <div className="h-8 w-px bg-border/80 border-dashed mx-auto" />
              <div className="h-8 w-px bg-border/80 border-dashed mx-auto" />
            </div>

            {/* NestJS Application Node */}
            <div className="flex flex-col items-center">
              <div className="px-8 py-4 bg-card border border-border/80 rounded-2xl shadow-md flex items-center gap-2">
                <Server className="w-4 h-4 text-violet-400" />
                <span className="font-bold text-foreground">NestJS Core Application Engine</span>
              </div>
              <div className="h-8 w-px bg-border/80 border-dashed" />
            </div>

            {/* Connect to Database and Storage */}
            <div className="flex justify-between items-center w-full max-w-md border-t-2 border-dashed border-border/60 pt-0">
              {/* DB Flow */}
              <div className="flex flex-col items-center -mt-px flex-1">
                <div className="h-8 w-px bg-border/80 border-dashed" />
                <div className="px-4 py-2.5 bg-gradient-to-r from-emerald-500/10 to-teal-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs font-bold">
                  Prisma Client + Neon Postgres
                </div>
              </div>

              {/* Cloudinary Flow */}
              <div className="flex flex-col items-center -mt-px flex-1">
                <div className="h-8 w-px bg-border/80 border-dashed" />
                <div className="px-4 py-2.5 bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-500/20 text-blue-400 rounded-lg text-xs font-bold">
                  Cloudinary Image API
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 2. ER Diagram (HTML Model Cards) */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold font-outfit text-foreground flex items-center gap-2">
            <Database className="w-5 h-5 text-violet-400" />
            Database Schema & Entity Relationships
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {erdModels.map((model) => (
              <div key={model.name} className="glass p-6 rounded-2xl border border-border/40 hover:border-violet-500/20 transition-all flex flex-col justify-between">
                <div className="space-y-4">
                  <h3 className="font-extrabold text-foreground font-outfit text-base border-b border-border/20 pb-2 uppercase tracking-wider">
                    {model.name}
                  </h3>
                  <ul className="space-y-1.5 text-xs text-muted-foreground font-mono">
                    {model.fields.map((f) => (
                      <li key={f} className="flex items-center gap-1.5">
                        <span className="h-1.5 h-1.5 rounded-full bg-violet-500/40 shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-border/20 text-[10px] font-bold text-violet-400 leading-normal uppercase">
                  <strong>Relations:</strong> {model.relations}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 3. Tech Stack Grid */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold font-outfit text-foreground flex items-center gap-2">
            <Layers className="w-5 h-5 text-violet-400" />
            Core Technology Stack
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {techStack.map((tech) => (
              <div key={tech.name} className="glass p-5 rounded-2xl border border-border/40 hover:border-violet-500/20 transition-all space-y-2">
                <span className="text-[9px] font-bold px-2 py-0.5 rounded bg-violet-500/10 text-violet-400 border border-violet-500/10 uppercase tracking-widest">
                  {tech.category}
                </span>
                <h4 className="font-bold text-foreground text-sm font-outfit pt-1">{tech.name}</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">{tech.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* 4. Timeline stages */}
        <section className="space-y-6">
          <h2 className="text-xl font-bold font-outfit text-foreground flex items-center gap-2">
            <Milestone className="w-5 h-5 text-violet-400" />
            Sprint Timeline & Development Journey
          </h2>
          <div className="glass p-8 rounded-3xl border border-border/40 relative space-y-8 pl-8 border-l border-border/40">
            {/* Stage 1 */}
            <div className="relative">
              <span className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 border border-violet-500 text-white shadow-md">
                01
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground font-outfit">Project Bootstrapping & DB Initialization</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Configured environment options, instantiated Git repo and branches, set up the Neon schema in Prisma using Decimal variables, and ran db seeds successfully.
                </p>
              </div>
            </div>

            {/* Stage 2 */}
            <div className="relative">
              <span className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 border border-violet-500 text-white shadow-md">
                02
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground font-outfit">Modular Backend Development</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Authored modular controller operations in NestJS, implemented Passport JWT strategies with RolesGuard protection, and generated write/delete audit log events.
                </p>
              </div>
            </div>

            {/* Stage 3 */}
            <div className="relative">
              <span className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 border border-violet-500 text-white shadow-md">
                03
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground font-outfit">Interactive UI Framework Creation</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Engineered the client-side authentication provider, Axios interceptor token rotators, cart slide-over drawers with coupon validation, and built responsive menus/checkouts.
                </p>
              </div>
            </div>

            {/* Stage 4 */}
            <div className="relative">
              <span className="absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-violet-600 border border-violet-500 text-white shadow-md">
                04
              </span>
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-foreground font-outfit">Real-Time WebSockets Integrations</h4>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Linked the customer status tracking timeline and the administrator live backlog queue using Socket.IO handshake rooms to emit updates without page refreshes.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

'use client';

import React from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/providers/auth-provider';
import { getFirstName } from '@/utils/name';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, PieChart, Pie, Cell, BarChart, Bar, Legend } from 'recharts';
import { DollarSign, ShoppingBag, Users, FolderOpen, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import StatusBlocker from '@/components/shared/status-blocker';

interface KPI {
  totalOrders: number;
  totalUsers: number;
  totalFoods: number;
  totalCategories: number;
  activeUsersCount: number;
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  averageOrderValue: number;
  topSellingFood: string;
}

interface DashboardData {
  kpis: KPI;
  revenueTrend: { date: string; revenue: number; orders: number }[];
  ordersByStatus: { status: string; count: number }[];
  topSellingFoods: { name: string; quantity: number; revenue: number }[];
  categorySales: { name: string; quantity: number; revenue: number }[];
  recentActivityFeed: {
    id: string;
    customerName: string;
    customerEmail: string;
    total: number;
    status: string;
    timestamp: string;
  }[];
}

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const restaurantStatus = user?.restaurant?.status;

  if (user?.role === 'ADMIN' && restaurantStatus !== 'APPROVED') {
    return (
      <StatusBlocker
        status={restaurantStatus}
        restaurantName={user?.restaurant?.name}
        userName={user?.name}
      />
    );
  }

  const { data, isLoading, error } = useQuery<DashboardData>({
    queryKey: ['admin-stats'],
    queryFn: async () => {
      const res = await api.get('/dashboard/stats');
      return res.data;
    },
  });

  // Warm Swiggy / Indian inspired palette
  const COLORS = ['#ea580c', '#f97316', '#fb923c', '#fdba74', '#fed7aa', '#ffedd5'];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      case 'CONFIRMED':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'PREPARING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'OUT_FOR_DELIVERY':
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case 'DELIVERED':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'CANCELLED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">Failed to load statistics</h2>
          <p className="text-xs text-muted-foreground">Please make sure the backend is active and database tables exist.</p>
        </main>
        <Footer />
      </div>
    );
  }

  const kpisList = [
    {
      title: 'Total Revenue',
      value: `₹${data.kpis.totalRevenue.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      desc: `Today: ₹${data.kpis.revenueToday.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`,
      icon: () => <span className="text-xl font-bold leading-none">₹</span>,
      color: 'text-green-400 bg-green-500/10 border-green-500/20',
    },
    {
      title: 'Total Orders',
      value: data.kpis.totalOrders,
      desc: `AOV: ₹${data.kpis.averageOrderValue.toFixed(2)}`,
      icon: ShoppingBag,
      color: 'text-orange-400 bg-orange-500/10 border-orange-500/20',
    },
    {
      title: 'Customer Base',
      value: data.kpis.totalUsers,
      desc: `Active: ${data.kpis.activeUsersCount}`,
      icon: Users,
      color: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    },
    {
      title: 'Food Items',
      value: data.kpis.totalFoods,
      desc: `Categories: ${data.kpis.totalCategories}`,
      icon: FolderOpen,
      color: 'text-amber-400 bg-amber-500/10 border-amber-500/20',
    },
  ];

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-extrabold font-outfit text-foreground animate-fade-in">
            {user ? `Welcome back, ${getFirstName(user.name)}!` : 'Admin Analytics'}
          </h1>
          <span className="text-xs font-bold px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 uppercase tracking-widest">
            Portal
          </span>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {kpisList.map((kpi) => (
            <div key={kpi.title} className="glass p-6 rounded-2xl border border-border/40 hover:border-orange-500/20 transition-all flex items-center justify-between">
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">{kpi.title}</span>
                <p className="text-2xl font-extrabold font-outfit text-foreground leading-none">{kpi.value}</p>
                <p className="text-xs text-muted-foreground">{kpi.desc}</p>
              </div>
              <div className={`p-3 rounded-xl border flex items-center justify-center w-11 h-11 ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
          ))}
        </div>

        {/* Charts Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Revenue Trend Area Chart */}
          <div className="glass p-6 rounded-2xl border border-border/40 space-y-4">
            <h3 className="text-sm font-bold text-foreground font-outfit uppercase">Revenue Trend (Last 7 Days)</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data.revenueTrend}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="date" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: 8, fontSize: 12 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#f97316" fillOpacity={1} fill="url(#colorRevenue)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Orders by Status Pie Chart */}
          <div className="glass p-6 rounded-2xl border border-border/40 space-y-4">
            <h3 className="text-sm font-bold text-foreground font-outfit uppercase">Orders by Status</h3>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.ordersByStatus}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="count"
                    nameKey="status"
                  >
                    {data.ordersByStatus.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: 8, fontSize: 12 }} />
                  <Legend verticalAlign="bottom" height={36} iconSize={8} iconType="circle" wrapperStyle={{ fontSize: 10 }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Selling Foods Bar Chart */}
          <div className="glass p-6 rounded-2xl border border-border/40 space-y-4">
            <h3 className="text-sm font-bold text-foreground font-outfit uppercase">Top 5 Selling Foods</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topSellingFoods} layout="vertical">
                  <XAxis type="number" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis dataKey="name" type="category" stroke="#888888" fontSize={9} tickLine={false} axisLine={false} width={100} />
                  <Tooltip contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="quantity" fill="#fb923c" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Category Performance Bar Chart */}
          <div className="glass p-6 rounded-2xl border border-border/40 space-y-4">
            <h3 className="text-sm font-bold text-foreground font-outfit uppercase">Cuisine/Category Performance</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.categorySales}>
                  <XAxis dataKey="name" stroke="#888888" fontSize={10} tickLine={false} axisLine={false} />
                  <YAxis stroke="#888888" fontSize={10} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} />
                  <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} contentStyle={{ background: '#09090b', borderColor: '#27272a', borderRadius: 8, fontSize: 12 }} />
                  <Bar dataKey="revenue" fill="#ea580c" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Recent Activity Feed list */}
        <div className="glass p-6 rounded-2xl border border-border/40 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-sm font-bold text-foreground font-outfit uppercase">Recent Incoming Orders</h3>
            <Link
              href="/admin/orders/live"
              className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 underline cursor-pointer"
            >
              <span>Live Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-border/20 text-xs">
            {data.recentActivityFeed.map((activity) => (
              <div key={activity.id} className="py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground">{activity.customerName}</span>
                    <span className="text-muted-foreground font-medium">{activity.customerEmail}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-mono">ID: {activity.id}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(activity.status)}`}>
                    {activity.status}
                  </span>
                  <span className="font-bold text-foreground text-sm">₹{activity.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

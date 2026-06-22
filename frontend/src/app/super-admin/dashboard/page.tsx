'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useAuth } from '@/providers/auth-provider';
import { 
  DollarSign, ShoppingBag, Users, Store, Loader2, AlertCircle, CheckCircle2, 
  XCircle, Ban, Unlock, Download, RefreshCw, Layers, ShieldAlert, FileText 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Types aligning with NestJS backend response shapes
interface PlatformMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalVendors: number;
  totalFoods: number;
  totalCategories: number;
}

interface Vendor {
  id: string;
  name: string;
  logo: string;
  address: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED';
  createdAt: string;
  owner: {
    id: string;
    name: string;
    email: string;
  };
}

interface Customer {
  id: string;
  name: string;
  email: string;
  status: 'ACTIVE' | 'BLOCKED';
  createdAt: string;
  _count?: {
    orders: number;
  };
}

interface Order {
  id: string;
  total: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
  restaurant: {
    name: string;
  };
  invoice?: {
    id: string;
    invoiceNumber: string;
    pdfUrl: string;
  };
}

interface Payment {
  id: string;
  amount: number;
  status: string;
  razorpayOrderId: string;
  razorpayPaymentId: string | null;
  createdAt: string;
  order: {
    id: string;
    user: {
      name: string;
    };
    restaurant: {
      name: string;
    };
  };
}

export default function SuperAdminDashboard() {
  const queryClient = useQueryClient();
  const { user: authUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'metrics' | 'vendors' | 'customers' | 'orders' | 'payments'>('metrics');

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';
  const getInvoiceUrl = (pdfUrl?: string) => {
    if (!pdfUrl) return '#';
    const baseUrl = API_URL.replace('/api', '');
    return pdfUrl.startsWith('http') ? pdfUrl : `${baseUrl}${pdfUrl}`;
  };

  // 1. Fetch Metrics
  const { data: metrics, isLoading: isMetricsLoading, refetch: refetchMetrics } = useQuery<PlatformMetrics>({
    queryKey: ['super-admin-metrics'],
    queryFn: async () => {
      const res = await api.get('/super-admin/metrics');
      return res.data;
    },
  });

  // 2. Fetch Vendors
  const { data: vendors = [], isLoading: isVendorsLoading } = useQuery<Vendor[]>({
    queryKey: ['super-admin-vendors'],
    queryFn: async () => {
      const res = await api.get('/super-admin/vendors');
      return res.data;
    },
  });

  // 3. Fetch Customers
  const { data: customers = [], isLoading: isCustomersLoading } = useQuery<Customer[]>({
    queryKey: ['super-admin-customers'],
    queryFn: async () => {
      const res = await api.get('/super-admin/customers');
      return res.data;
    },
  });

  // 4. Fetch Orders
  const { data: orders = [], isLoading: isOrdersLoading } = useQuery<Order[]>({
    queryKey: ['super-admin-orders'],
    queryFn: async () => {
      const res = await api.get('/super-admin/orders');
      return res.data;
    },
  });

  // 5. Fetch Payments
  const { data: payments = [], isLoading: isPaymentsLoading } = useQuery<Payment[]>({
    queryKey: ['super-admin-payments'],
    queryFn: async () => {
      const res = await api.get('/super-admin/payments');
      return res.data;
    },
  });

  // Mutations
  const updateVendorStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Vendor['status'] }) => {
      const res = await api.patch(`/super-admin/vendors/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-vendors'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-metrics'] });
    },
  });

  const updateCustomerStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: Customer['status'] }) => {
      const res = await api.patch(`/super-admin/customers/${id}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['super-admin-customers'] });
      queryClient.invalidateQueries({ queryKey: ['super-admin-metrics'] });
    },
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'ACTIVE':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'SUSPENDED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'REJECTED':
      case 'BLOCKED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  const tabs = [
    { id: 'metrics', label: 'Overview', icon: Layers },
    { id: 'vendors', label: 'Kitchen Vendors', icon: Store },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'orders', label: 'Platform Orders', icon: ShoppingBag },
    { id: 'payments', label: 'Transactions', icon: DollarSign },
  ] as const;

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-purple-400">
              <ShieldAlert className="w-5 h-5 stroke-[1.5]" />
              <span className="text-xs font-bold uppercase tracking-widest font-mono">Platform Admin Command Center</span>
            </div>
            <h1 className="text-3xl font-extrabold font-outfit tracking-tight">FoodFlow Executive Console</h1>
            <p className="text-xs text-muted-foreground">Manage multi-vendor onboarding, system configurations, customer billing, and live metrics.</p>
          </div>
          <button 
            onClick={() => {
              refetchMetrics();
              queryClient.invalidateQueries();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 border border-border/40 hover:bg-secondary/40 rounded-xl text-xs font-semibold cursor-pointer transition-all hover:scale-[1.02]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Force Sync Sync</span>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border/40 overflow-x-auto no-scrollbar gap-2 pb-px">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-5 py-3 border-b-2 font-semibold text-xs transition-all uppercase tracking-wider whitespace-nowrap cursor-pointer ${
                  isActive 
                    ? 'border-orange-500 text-orange-400 bg-orange-500/5' 
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:bg-secondary/20'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Contents */}
        <div className="min-h-[400px]">
          {activeTab === 'metrics' && (
            <div className="space-y-8 animate-fade-in">
              {/* KPIs Grid */}
              {isMetricsLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="glass p-6 rounded-2xl border border-border/40 h-28 animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="glass p-6 rounded-2xl border border-border/40 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Gross Platform Sales</span>
                      <p className="text-2xl font-extrabold font-outfit text-foreground leading-none">
                        ₹{(metrics?.totalRevenue || 0).toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </p>
                      <p className="text-[10px] text-green-400 font-bold">100% Secure Checkout</p>
                    </div>
                    <div className="p-3 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl">
                      <span className="text-lg font-bold">₹</span>
                    </div>
                  </div>

                  <div className="glass p-6 rounded-2xl border border-border/40 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Total Orders</span>
                      <p className="text-2xl font-extrabold font-outfit text-foreground leading-none">{metrics?.totalOrders || 0}</p>
                      <p className="text-[10px] text-orange-400 font-bold">Processed</p>
                    </div>
                    <div className="p-3 bg-orange-500/10 border border-orange-500/20 text-orange-400 rounded-xl">
                      <ShoppingBag className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="glass p-6 rounded-2xl border border-border/40 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Approved Merchants</span>
                      <p className="text-2xl font-extrabold font-outfit text-foreground leading-none">{metrics?.totalVendors || 0}</p>
                      <p className="text-[10px] text-purple-400 font-bold">Operational Kitchens</p>
                    </div>
                    <div className="p-3 bg-purple-500/10 border border-purple-500/20 text-purple-400 rounded-xl">
                      <Store className="w-5 h-5" />
                    </div>
                  </div>

                  <div className="glass p-6 rounded-2xl border border-border/40 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Active Customers</span>
                      <p className="text-2xl font-extrabold font-outfit text-foreground leading-none">{metrics?.totalCustomers || 0}</p>
                      <p className="text-[10px] text-blue-400 font-bold">Registered Users</p>
                    </div>
                    <div className="p-3 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-xl">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                </div>
              )}

              {/* Extra Platform Metrics */}
              <div className="grid md:grid-cols-2 gap-6">
                <div className="glass p-6 rounded-2xl border border-border/40 space-y-4">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Cuisine & Menu Volume</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-secondary/20 p-4 rounded-xl space-y-1 border border-border/20">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Categories Created</span>
                      <p className="text-xl font-extrabold font-outfit text-foreground">{metrics?.totalCategories || 0}</p>
                    </div>
                    <div className="bg-secondary/20 p-4 rounded-xl space-y-1 border border-border/20">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Total Food Items</span>
                      <p className="text-xl font-extrabold font-outfit text-foreground">{metrics?.totalFoods || 0}</p>
                    </div>
                  </div>
                </div>

                <div className="glass p-6 rounded-2xl border border-border/40 space-y-4 flex flex-col justify-between">
                  <h3 className="text-sm font-bold text-foreground uppercase tracking-wider">Quick Platform Policy Adjustments</h3>
                  <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Marketplace Commission</label>
                      <div className="p-2.5 bg-background border border-border/40 rounded-xl text-center text-foreground font-mono">
                        12% Per Checkout
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] text-muted-foreground uppercase font-bold">Platform GST / Taxes</label>
                      <div className="p-2.5 bg-background border border-border/40 rounded-xl text-center text-foreground font-mono">
                        8% (IGST Standard)
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'vendors' && (
            <div className="glass rounded-2xl border border-border/40 overflow-hidden animate-fade-in">
              <div className="p-5 border-b border-border/20 flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wider font-outfit">Kitchen Onboarding Registry</h3>
                <span className="text-[10px] px-2.5 py-1 bg-secondary text-muted-foreground rounded-full font-bold">
                  {vendors.length} Restaurants Total
                </span>
              </div>
              <div className="overflow-x-auto">
                {isVendorsLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                ) : vendors.length === 0 ? (
                  <div className="text-center py-16 text-xs text-muted-foreground">
                    No kitchen vendors found in the database.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-secondary/15 text-muted-foreground uppercase font-bold border-b border-border/20">
                        <th className="p-4 pl-6">Restaurant</th>
                        <th className="p-4">Owner / Contact</th>
                        <th className="p-4">Location</th>
                        <th className="p-4">Registered Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {vendors.map((vendor) => (
                        <tr key={vendor.id} className="hover:bg-secondary/5 transition-colors">
                          <td className="p-4 pl-6">
                            <div className="flex items-center space-x-3">
                              {vendor.logo ? (
                                <img src={vendor.logo} alt={vendor.name} className="w-10 h-10 rounded-lg object-cover border border-border/20" />
                              ) : (
                                <div className="w-10 h-10 rounded-lg bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold">
                                  {vendor.name.charAt(0)}
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-foreground">{vendor.name}</h4>
                                <span className="text-[10px] text-muted-foreground font-mono">ID: {vendor.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <h4 className="font-semibold text-foreground">{vendor.owner?.name || 'Unknown'}</h4>
                            <p className="text-muted-foreground text-[10px]">{vendor.owner?.email || 'N/A'}</p>
                          </td>
                          <td className="p-4 text-muted-foreground max-w-xs truncate" title={vendor.address}>
                            {vendor.address}
                          </td>
                          <td className="p-4 text-muted-foreground font-medium">
                            {new Date(vendor.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(vendor.status)}`}>
                              {vendor.status}
                            </span>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center justify-center gap-1.5">
                              {/* Approve Button */}
                              {vendor.status !== 'APPROVED' && (
                                <button
                                  onClick={() => updateVendorStatusMutation.mutate({ id: vendor.id, status: 'APPROVED' })}
                                  disabled={updateVendorStatusMutation.isPending}
                                  className="px-2.5 py-1 bg-green-600 hover:bg-green-500 text-white font-bold rounded text-[10px] transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <CheckCircle2 className="w-3 h-3" />
                                  <span>Approve</span>
                                </button>
                              )}

                              {/* Suspend Button */}
                              {vendor.status === 'APPROVED' && (
                                <button
                                  onClick={() => updateVendorStatusMutation.mutate({ id: vendor.id, status: 'SUSPENDED' })}
                                  disabled={updateVendorStatusMutation.isPending}
                                  className="px-2.5 py-1 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded text-[10px] transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <Ban className="w-3 h-3" />
                                  <span>Suspend</span>
                                </button>
                              )}

                              {/* Reject Button (Only for Pending) */}
                              {vendor.status === 'PENDING' && (
                                <button
                                  onClick={() => updateVendorStatusMutation.mutate({ id: vendor.id, status: 'REJECTED' })}
                                  disabled={updateVendorStatusMutation.isPending}
                                  className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded text-[10px] transition-all cursor-pointer flex items-center gap-1"
                                >
                                  <XCircle className="w-3 h-3" />
                                  <span>Reject</span>
                                </button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="glass rounded-2xl border border-border/40 overflow-hidden animate-fade-in">
              <div className="p-5 border-b border-border/20 flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wider font-outfit">Platform Customer Registry</h3>
                <span className="text-[10px] px-2.5 py-1 bg-secondary text-muted-foreground rounded-full font-bold">
                  {customers.length} Customers Total
                </span>
              </div>
              <div className="overflow-x-auto">
                {isCustomersLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                ) : customers.length === 0 ? (
                  <div className="text-center py-16 text-xs text-muted-foreground">
                    No customers found.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-secondary/15 text-muted-foreground uppercase font-bold border-b border-border/20">
                        <th className="p-4 pl-6">Name</th>
                        <th className="p-4">Email</th>
                        <th className="p-4">Register Date</th>
                        <th className="p-4">Customer Status</th>
                        <th className="p-4 text-center">Security Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {customers.map((cust) => (
                        <tr key={cust.id} className="hover:bg-secondary/5 transition-colors">
                          <td className="p-4 pl-6 font-bold text-foreground">{cust.name}</td>
                          <td className="p-4 text-muted-foreground font-medium">{cust.email}</td>
                          <td className="p-4 text-muted-foreground font-medium">
                            {new Date(cust.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase ${getStatusColor(cust.status)}`}>
                              {cust.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {cust.status === 'ACTIVE' ? (
                              <button
                                onClick={() => updateCustomerStatusMutation.mutate({ id: cust.id, status: 'BLOCKED' })}
                                disabled={updateCustomerStatusMutation.isPending}
                                className="px-2.5 py-1 border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500 hover:text-white text-rose-400 font-bold rounded text-[10px] transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <Ban className="w-3 h-3" />
                                <span>Suspend</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => updateCustomerStatusMutation.mutate({ id: cust.id, status: 'ACTIVE' })}
                                disabled={updateCustomerStatusMutation.isPending}
                                className="px-2.5 py-1 border border-green-500/20 bg-green-500/10 hover:bg-green-500 hover:text-white text-green-400 font-bold rounded text-[10px] transition-all cursor-pointer inline-flex items-center gap-1"
                              >
                                <Unlock className="w-3 h-3" />
                                <span>Activate</span>
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="glass rounded-2xl border border-border/40 overflow-hidden animate-fade-in">
              <div className="p-5 border-b border-border/20 flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wider font-outfit">Platform Order Feed</h3>
                <span className="text-[10px] px-2.5 py-1 bg-secondary text-muted-foreground rounded-full font-bold">
                  {orders.length} Orders Logged
                </span>
              </div>
              <div className="overflow-x-auto">
                {isOrdersLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-16 text-xs text-muted-foreground">
                    No orders registered on the platform.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-secondary/15 text-muted-foreground uppercase font-bold border-b border-border/20">
                        <th className="p-4 pl-6">Order ID</th>
                        <th className="p-4">Restaurant</th>
                        <th className="p-4">Customer</th>
                        <th className="p-4">Order Value</th>
                        <th className="p-4">Order Status</th>
                        <th className="p-4 text-center">PDF Invoice</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {orders.map((ord) => (
                        <tr key={ord.id} className="hover:bg-secondary/5 transition-colors">
                          <td className="p-4 pl-6 font-mono text-[10px] text-muted-foreground">{ord.id}</td>
                          <td className="p-4 font-bold text-foreground">{ord.restaurant?.name || 'N/A'}</td>
                          <td className="p-4 font-semibold text-foreground">{ord.user?.name || 'Guest'}</td>
                          <td className="p-4 font-extrabold text-foreground">₹{parseFloat(ord.total).toFixed(2)}</td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider bg-orange-500/10 text-orange-400 border-orange-500/20">
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {ord.invoice?.pdfUrl ? (
                              <a
                                href={getInvoiceUrl(ord.invoice.pdfUrl)}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-1 text-orange-400 hover:text-orange-300 font-bold hover:underline"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>{ord.invoice.invoiceNumber.substring(0, 12)}</span>
                              </a>
                            ) : (
                              <span className="text-muted-foreground/45 italic text-[10px]">No Invoice</span>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {activeTab === 'payments' && (
            <div className="glass rounded-2xl border border-border/40 overflow-hidden animate-fade-in">
              <div className="p-5 border-b border-border/20 flex justify-between items-center">
                <h3 className="font-bold text-sm uppercase tracking-wider font-outfit">Global Payment Gateway Logs</h3>
                <span className="text-[10px] px-2.5 py-1 bg-secondary text-muted-foreground rounded-full font-bold">
                  {payments.length} Transactions Logged
                </span>
              </div>
              <div className="overflow-x-auto">
                {isPaymentsLoading ? (
                  <div className="flex justify-center items-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                  </div>
                ) : payments.length === 0 ? (
                  <div className="text-center py-16 text-xs text-muted-foreground">
                    No payment logs found in database.
                  </div>
                ) : (
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-secondary/15 text-muted-foreground uppercase font-bold border-b border-border/20">
                        <th className="p-4 pl-6">Transaction ID</th>
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Source / Kitchen</th>
                        <th className="p-4">Paid By</th>
                        <th className="p-4">Paid Amount</th>
                        <th className="p-4">Date & Time</th>
                        <th className="p-4">Gateway Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/20">
                      {payments.map((pay) => (
                        <tr key={pay.id} className="hover:bg-secondary/5 transition-colors">
                          <td className="p-4 pl-6 font-mono text-[10px] text-foreground font-bold">
                            {pay.razorpayPaymentId || pay.id}
                          </td>
                          <td className="p-4 font-mono text-[10px] text-muted-foreground">{pay.order?.id}</td>
                          <td className="p-4 font-semibold text-foreground">{pay.order?.restaurant?.name || 'N/A'}</td>
                          <td className="p-4 font-medium text-foreground">{pay.order?.user?.name || 'Guest'}</td>
                          <td className="p-4 font-extrabold text-foreground">₹{parseFloat(String(pay.amount)).toFixed(2)}</td>
                          <td className="p-4 text-muted-foreground font-medium">
                            {new Date(pay.createdAt).toLocaleString()}
                          </td>
                          <td className="p-4">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider bg-green-500/10 text-green-400 border-green-500/20">
                              {pay.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}

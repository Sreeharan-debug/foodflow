'use client';

import React from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import Link from 'next/link';
import { Clock, Eye, AlertCircle, ShoppingBag, ChevronRight, Loader2 } from 'lucide-react';

enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

interface Order {
  id: string;
  total: string;
  status: OrderStatus;
  createdAt: string;
  items: {
    id: string;
    quantity: number;
    food: { name: string };
  }[];
}

export default function OrderHistoryPage() {
  // Fetch customer orders list
  const { data: orders = [], isLoading, error } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
  });

  const getStatusStyle = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case OrderStatus.PREPARING:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      case OrderStatus.DELIVERED:
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case OrderStatus.CANCELLED:
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-3xl font-extrabold font-outfit text-foreground">Order History</h1>

        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl glass border border-destructive/20 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <h3 className="font-bold text-foreground">Failed to load orders</h3>
            <p className="text-xs text-muted-foreground">An error occurred while fetching your order history. Please try again later.</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 space-y-4 glass rounded-3xl min-h-[300px]">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
            <h3 className="text-xl font-bold text-foreground font-outfit">No orders placed yet</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              You haven&apos;t placed any orders on FOODFLOW yet. Go to our menu to get started!
            </p>
            <Link
              href="/customer/menu"
              className="px-6 py-2.5 bg-gradient-to-r from-orange-600 to-amber-600 text-white font-bold rounded-xl shadow-lg text-sm"
            >
              Order Now
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => {
              const formattedDate = new Date(order.createdAt).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              const itemsSummary = order.items
                .map((item) => `${item.food.name} x${item.quantity}`)
                .join(', ');

              return (
                <div
                  key={order.id}
                  className="glass p-6 rounded-2xl border border-border/40 hover:border-orange-500/20 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {formattedDate}
                      </span>
                    </div>
                    
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-foreground line-clamp-1">
                        {itemsSummary}
                      </h4>
                      <p className="text-xs font-mono text-muted-foreground">ID: {order.id}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto border-t md:border-t-0 pt-4 md:pt-0 border-border/20">
                    <div className="text-left md:text-right">
                      <span className="text-[10px] font-bold text-muted-foreground uppercase">Paid Total</span>
                      <p className="text-lg font-extrabold text-foreground font-outfit">₹{parseFloat(order.total).toFixed(2)}</p>
                    </div>

                    <Link
                      href={`/customer/orders/${order.id}`}
                      className="flex items-center gap-1.5 px-4 py-2 bg-secondary hover:bg-secondary-foreground/10 text-foreground text-xs font-bold rounded-xl border border-border/40 transition-all cursor-pointer"
                    >
                      <Eye className="w-4 h-4" />
                      <span>Track Order</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

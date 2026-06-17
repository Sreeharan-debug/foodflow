'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { useSocket } from '@/providers/socket-provider';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useParams, useRouter } from 'next/navigation';
import { Clock, Check, Loader2, MapPin, Receipt, Phone, AlertCircle, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';

enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}

interface OrderItem {
  id: string;
  price: string;
  quantity: number;
  food: { name: string };
}

interface Order {
  id: string;
  total: string;
  tax: string;
  discount: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
  address: {
    label: string;
    houseNumber: string;
    buildingName?: string;
    area: string;
    landmark?: string;
    city: string;
    district: string;
    state: string;
    pincode: string;
  };
  items: OrderItem[];
}

export default function OrderTrackingPage() {
  const { id: orderId } = useParams() as { id: string };
  const queryClient = useQueryClient();
  const router = useRouter();
  const { socket, isConnected } = useSocket();
  const [localOrder, setLocalOrder] = useState<Order | null>(null);

  // 1. Fetch Order Details via REST
  const { data: order, isLoading, error } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: async () => {
      const res = await api.get(`/orders/${orderId}`);
      setLocalOrder(res.data);
      return res.data;
    },
  });

  // 2. Set up WebSockets room joining and listening
  useEffect(() => {
    if (!socket || !orderId) return;

    // Join order-specific room
    socket.emit('joinOrderRoom', orderId);

    // Listen to real-time status updates
    const handleOrderUpdate = (data: { orderId: string; status: OrderStatus; order: Order }) => {
      if (data.orderId === orderId) {
        setLocalOrder(data.order);
        // Invalidate query client cache so data stays synchronized
        queryClient.setQueryData(['order', orderId], data.order);
      }
    };

    socket.on('order.updated', handleOrderUpdate);

    return () => {
      socket.off('order.updated', handleOrderUpdate);
    };
  }, [socket, orderId, queryClient]);

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex justify-center items-center">
          <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !localOrder) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">Order Not Found</h2>
          <p className="text-sm text-muted-foreground">The order you are trying to track doesn&apos;t exist or is inaccessible.</p>
          <button
            onClick={() => router.push('/customer/menu')}
            className="px-6 py-2.5 bg-secondary hover:bg-secondary/80 rounded-xl text-sm font-semibold cursor-pointer"
          >
            Go to Menu
          </button>
        </main>
        <Footer />
      </div>
    );
  }

  // Lifecycle status array mapping
  const statuses = [
    { key: OrderStatus.PENDING, label: 'Order Placed', desc: 'We have received your order request' },
    { key: OrderStatus.CONFIRMED, label: 'Confirmed', desc: 'Kitchen hub has accepted your order' },
    { key: OrderStatus.PREPARING, label: 'Preparing Food', desc: 'Our chefs are cooking your Indian meal' },
    { key: OrderStatus.OUT_FOR_DELIVERY, label: 'Out for Delivery', desc: 'Rider is carrying your hot meal to you' },
    { key: OrderStatus.DELIVERED, label: 'Delivered', desc: 'Enjoy your warm Indian food!' },
  ];

  const currentStatusIndex = statuses.findIndex((s) => s.key === localOrder.status);
  const isCancelled = localOrder.status === OrderStatus.CANCELLED;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Back Link */}
        <button
          onClick={() => router.push('/customer/orders')}
          className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-foreground transition-all cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Order History</span>
        </button>

        {/* Order Header */}
        <div className="glass p-6 rounded-2xl border border-border/40 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">Order ID</span>
              <code className="text-xs font-mono font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                {localOrder.id}
              </code>
            </div>
            <h1 className="text-2xl font-bold font-outfit text-foreground">
              {isCancelled ? (
                <span className="text-destructive">Order Cancelled</span>
              ) : localOrder.status === OrderStatus.DELIVERED ? (
                <span className="text-green-400">Order Delivered!</span>
              ) : (
                <span>Tracking Your Flavor...</span>
              )}
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-destructive'}`} />
            <span className="text-xs text-muted-foreground font-medium">
              {isConnected ? 'Real-Time Sync Active' : 'Disconnected'}
            </span>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {/* Tracking Timeline (Framer Motion) */}
          <div className="md:col-span-2 glass p-6 rounded-2xl border border-border/40 space-y-8">
            <h2 className="text-lg font-bold font-outfit text-foreground">Delivery Journey</h2>

            {isCancelled ? (
              <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/25 text-destructive text-sm flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <div>
                  <h4 className="font-bold">This order was cancelled</h4>
                  <p className="text-xs text-muted-foreground/80 mt-1">
                    If this was a mistake, please contact customer support or place a new order.
                  </p>
                </div>
              </div>
            ) : (
              <div className="relative pl-8 space-y-8 border-l border-border/40">
                {statuses.map((step, idx) => {
                  const isDone = idx <= currentStatusIndex;
                  const isCurrent = idx === currentStatusIndex;

                  return (
                    <motion.div
                      key={step.key}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="relative"
                    >
                      {/* Status timeline node indicator */}
                      <span
                        className={`absolute -left-12 top-0.5 flex h-8 w-8 items-center justify-center rounded-full border transition-all ${
                          isDone
                            ? 'bg-orange-500 border-orange-400 text-white shadow-lg shadow-orange-500/20'
                            : 'bg-card border-border/40 text-muted-foreground'
                        }`}
                      >
                        {isDone ? (
                          <Check className="w-4.5 h-4.5" />
                        ) : (
                          <span className="text-xs font-bold">{idx + 1}</span>
                        )}
                      </span>

                      {/* Timeline content info */}
                      <div className="space-y-1">
                        <h4
                          className={`text-sm font-bold ${
                            isCurrent ? 'text-orange-400 font-outfit text-base' : isDone ? 'text-foreground' : 'text-muted-foreground'
                          }`}
                        >
                          {step.label}
                        </h4>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                        {isCurrent && (
                          <span className="inline-flex items-center gap-1 text-[10px] text-orange-400 font-bold bg-orange-500/10 px-2 py-0.5 rounded-md border border-orange-500/10 mt-1 animate-pulse">
                            Active Stage
                          </span>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Details Sidebar panel */}
          <div className="space-y-6">
            {/* Delivery address details */}
            <div className="glass p-6 rounded-2xl border border-border/40 space-y-4">
              <h3 className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
                <MapPin className="w-4 h-4 text-orange-400" />
                Delivery Details
              </h3>
              <div className="text-xs text-muted-foreground space-y-1">
                <h4 className="font-bold text-foreground uppercase">{localOrder.address.label}</h4>
                <p>
                  {localOrder.address.houseNumber}
                  {localOrder.address.buildingName ? `, ${localOrder.address.buildingName}` : ''}
                  {`, ${localOrder.address.area}`}
                  {localOrder.address.landmark ? ` (Landmark: ${localOrder.address.landmark})` : ''}
                </p>
                <p>{localOrder.address.city}, {localOrder.address.district}, {localOrder.address.state} - {localOrder.address.pincode}</p>
              </div>
            </div>

            {/* Receipt invoice item summary */}
            <div className="glass p-6 rounded-2xl border border-border/40 space-y-4">
              <h3 className="text-sm font-bold font-outfit text-foreground flex items-center gap-2">
                <Receipt className="w-4 h-4 text-orange-400" />
                Receipt Invoice
              </h3>
              <div className="divide-y divide-border/20 max-h-[160px] overflow-y-auto pr-1 text-xs">
                {localOrder.items.map((item) => (
                  <div key={item.id} className="py-2.5 flex justify-between gap-4">
                    <span className="text-muted-foreground">
                      {item.food.name} <strong className="text-foreground">x{item.quantity}</strong>
                    </span>
                    <span className="font-bold text-foreground">
                      ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              {/* invoice calculation subtotals */}
              <div className="space-y-1.5 pt-3 border-t border-border/20 text-xs">
                {parseFloat(localOrder.discount) > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span>
                    <span>-₹{parseFloat(localOrder.discount).toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-muted-foreground">
                  <span>Tax</span>
                  <span>₹{parseFloat(localOrder.tax).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-foreground text-sm pt-2 border-t border-border/20">
                  <span>Total</span>
                  <span>₹{localOrder.total ? parseFloat(localOrder.total).toFixed(2) : '0.00'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

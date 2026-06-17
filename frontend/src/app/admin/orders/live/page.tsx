'use client';

import React, { useEffect, useState } from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { useSocket } from '@/providers/socket-provider';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, MapPin, Receipt, CheckCircle2, ChevronRight, XCircle, Play, AlertCircle, Loader2 } from 'lucide-react';

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
  status: OrderStatus;
  createdAt: string;
  user: { name: string; email: string };
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

export default function LiveOrderQueuePage() {
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);

  // 1. Fetch initial orders backlog
  const { isLoading, error } = useQuery<Order[]>({
    queryKey: ['admin-orders-live'],
    queryFn: async () => {
      const res = await api.get('/orders');
      // Filter for active orders (exclude DELIVERED and CANCELLED)
      const live = res.data.filter(
        (o: Order) => o.status !== OrderStatus.DELIVERED && o.status !== OrderStatus.CANCELLED
      );
      setActiveOrders(live);
      return live;
    },
  });

  // 2. Set up WebSockets room joining and listening
  useEffect(() => {
    if (!socket) return;

    socket.emit('joinAdminRoom');

    // Handle new order added
    const handleOrderCreated = (order: Order) => {
      setActiveOrders((prev) => [order, ...prev]);
    };

    // Handle order status update
    const handleOrderUpdated = (data: { orderId: string; status: OrderStatus; order: Order }) => {
      if (data.status === OrderStatus.DELIVERED || data.status === OrderStatus.CANCELLED) {
        // Remove from active queue list
        setActiveOrders((prev) => prev.filter((o) => o.id !== data.orderId));
      } else {
        // Update in queue list
        setActiveOrders((prev) => {
          const index = prev.findIndex((o) => o.id === data.orderId);
          if (index === -1) {
            return [data.order, ...prev];
          }
          const updated = [...prev];
          updated[index] = data.order;
          return updated;
        });
      }
    };

    socket.on('order.created', handleOrderCreated);
    socket.on('order.updated', handleOrderUpdated);

    return () => {
      socket.off('order.created', handleOrderCreated);
      socket.off('order.updated', handleOrderUpdated);
    };
  }, [socket]);

  // 3. Status Action Mutator
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: string; status: OrderStatus }) => {
      const res = await api.patch(`/orders/${orderId}/status`, { status });
      return res.data;
    },
    onSuccess: (updatedOrder) => {
      // Invalidate dashboard/live cache
      queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
    },
  });

  const getNextAction = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return { label: 'Confirm Order', nextStatus: OrderStatus.CONFIRMED, color: 'bg-blue-600 hover:bg-blue-500' };
      case OrderStatus.CONFIRMED:
        return { label: 'Start Preparing', nextStatus: OrderStatus.PREPARING, color: 'bg-amber-600 hover:bg-amber-500' };
      case OrderStatus.PREPARING:
        return { label: 'Dispatch Order', nextStatus: OrderStatus.OUT_FOR_DELIVERY, color: 'bg-orange-600 hover:bg-orange-500' };
      case OrderStatus.OUT_FOR_DELIVERY:
        return { label: 'Deliver Order', nextStatus: OrderStatus.DELIVERED, color: 'bg-green-600 hover:bg-green-500' };
      default:
        return null;
    }
  };

  const getStatusBadgeColor = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.PENDING:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
      case OrderStatus.CONFIRMED:
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case OrderStatus.PREPARING:
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case OrderStatus.OUT_FOR_DELIVERY:
        return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
      default:
        return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold font-outfit text-foreground flex items-center gap-2">
              <Play className="w-6 h-6 text-orange-400 fill-current animate-pulse" />
              Live Order Queue
            </h1>
            <p className="text-sm text-muted-foreground">
              Incoming customer orders appear here instantly. Update lifecycle milestones in real-time.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-destructive'}`} />
            <span className="text-xs text-muted-foreground font-medium">
              {isConnected ? 'Real-Time Sync Active' : 'Disconnected'}
            </span>
          </div>
        </div>

        {/* Live Queue Cards Grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-400" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl glass border border-destructive/20 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <h3 className="font-bold text-foreground">Failed to connect live queue</h3>
            <p className="text-xs text-muted-foreground">Please check if the WebSocket server is active.</p>
          </div>
        ) : activeOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 space-y-4 glass rounded-3xl min-h-[300px]">
            <CheckCircle2 className="w-10 h-10 text-green-400" />
            <h3 className="text-xl font-bold text-foreground font-outfit">Order queue cleared</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              There are no incoming active orders at the moment. Good work!
            </p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence>
              {activeOrders.map((order) => {
                const action = getNextAction(order.status);
                const formattedTime = new Date(order.createdAt).toLocaleTimeString('en-US', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <motion.div
                    key={order.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass rounded-2xl overflow-hidden border border-border/40 hover:border-orange-500/20 transition-all flex flex-col justify-between"
                  >
                    {/* Card Header */}
                    <div className="p-5 border-b border-border/20 bg-secondary/15 flex justify-between items-start">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-foreground">{order.user.name}</h4>
                        <p className="text-[10px] text-muted-foreground font-mono truncate max-w-[150px]">
                          ID: {order.id}
                        </p>
                      </div>
                      <div className="flex flex-col items-end gap-1.5">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusBadgeColor(order.status)}`}>
                          {order.status}
                        </span>
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1 font-semibold">
                          <Clock className="w-3.5 h-3.5" />
                          {formattedTime}
                        </span>
                      </div>
                    </div>

                    {/* Card Body - Address and Items */}
                    <div className="p-5 flex-1 space-y-4 text-xs">
                      {/* Address */}
                      <div className="flex items-start gap-2 text-muted-foreground">
                        <MapPin className="w-4 h-4 shrink-0 text-orange-400" />
                        <div>
                          <h5 className="font-bold text-foreground text-[10px] uppercase">{order.address.label}</h5>
                          <p>
                            {order.address.houseNumber}
                            {order.address.buildingName ? `, ${order.address.buildingName}` : ''}
                            {`, ${order.address.area}`}
                            {order.address.landmark ? ` (Landmark: ${order.address.landmark})` : ''}
                          </p>
                          <p>{order.address.city}, {order.address.state} - {order.address.pincode}</p>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2 border-t border-border/20 pt-4">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-muted-foreground uppercase">
                          <Receipt className="w-3.5 h-3.5 text-orange-400" />
                          <span>Order Details</span>
                        </div>
                        <div className="space-y-1 pr-1 max-h-[100px] overflow-y-auto">
                          {order.items.map((item) => (
                            <div key={item.id} className="flex justify-between font-medium">
                              <span className="text-muted-foreground">
                                {item.food.name} <strong className="text-foreground">x{item.quantity}</strong>
                              </span>
                              <span className="font-bold text-foreground">
                                ₹{(parseFloat(item.price) * item.quantity).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Footer */}
                    <div className="p-5 border-t border-border/20 bg-secondary/10 flex justify-between items-center gap-3">
                      <div className="text-left">
                        <span className="text-[10px] font-bold text-muted-foreground uppercase">Order Total</span>
                        <p className="text-base font-extrabold text-foreground font-outfit">
                          ₹{parseFloat(order.total).toFixed(2)}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* Quick status progress button */}
                        {action && (
                          <button
                            onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: action.nextStatus })}
                            disabled={updateStatusMutation.isPending}
                            className={`px-3 py-2 text-white font-bold rounded-lg text-xs shadow-md transition-all flex items-center gap-1 cursor-pointer disabled:opacity-50 ${action.color}`}
                          >
                            <span>{action.label}</span>
                            <ChevronRight className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Cancel button */}
                        <button
                          onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: OrderStatus.CANCELLED })}
                          disabled={updateStatusMutation.isPending}
                          className="p-2 border border-destructive/20 text-destructive hover:bg-destructive/10 rounded-lg transition-all cursor-pointer disabled:opacity-50"
                          title="Cancel Order"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

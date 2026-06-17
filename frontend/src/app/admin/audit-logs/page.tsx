'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Search, Loader2, AlertCircle, Calendar, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AuditLog {
  id: string;
  action: string;
  performedBy: string;
  entityType: string;
  entityId: string;
  timestamp: string;
}

export default function AdminAuditLogsPage() {
  const [search, setSearch] = useState('');
  const [entityType, setEntityType] = useState('');
  const [page, setPage] = useState(1);
  const limit = 15;

  // Fetch Audit Logs
  const { data: auditData, isLoading, error } = useQuery<{
    logs: AuditLog[];
    total: number;
    page: number;
    totalPages: number;
  }>({
    queryKey: ['admin-audit-logs', search, entityType, page],
    queryFn: async () => {
      const res = await api.get('/audit-logs', {
        params: {
          search,
          entityType: entityType || undefined,
          page,
          limit,
        },
      });
      return res.data;
    },
  });

  const logs = auditData?.logs || [];
  const totalPages = auditData?.totalPages || 1;

  const handleEntityTypeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setEntityType(e.target.value);
    setPage(1);
  };

  const getActionBadgeColor = (action: string) => {
    if (action.startsWith('CREATE')) return 'bg-green-500/10 text-green-400 border-green-500/20';
    if (action.startsWith('UPDATE') || action.startsWith('BLOCK') || action.startsWith('UNBLOCK'))
      return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
    if (action.startsWith('DELETE')) return 'bg-red-500/10 text-red-400 border-red-500/20';
    return 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20';
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold font-outfit text-foreground flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-violet-400" />
              Security Audit Logs
            </h1>
            <p className="text-sm text-muted-foreground">Monitor administrative actions, product catalog edits, and coupon additions.</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-b border-border/40 pb-6">
          {/* Search box */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by action, email, ID..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full bg-card/65 border border-border/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-all placeholder:text-muted-foreground/60"
            />
          </div>

          {/* Entity Type selection */}
          <div className="flex items-center space-x-3">
            <select
              value={entityType}
              onChange={handleEntityTypeChange}
              className="bg-card border border-border/40 rounded-xl px-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-violet-500 transition-all font-medium"
            >
              <option value="">All Entity Types</option>
              <option value="USER">User (Customers)</option>
              <option value="FOOD">Food (Dish items)</option>
              <option value="CATEGORY">Category</option>
              <option value="COUPON">Coupon</option>
              <option value="ORDER">Order</option>
              <option value="SYSTEM">System Seeding</option>
            </select>
          </div>
        </div>

        {/* Audit Table */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl glass border border-destructive/20 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <h3 className="font-bold text-foreground">Failed to connect audit engine</h3>
            <p className="text-xs text-muted-foreground">Verify connection properties.</p>
          </div>
        ) : logs.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 space-y-4 glass rounded-3xl min-h-[300px]">
            <ShieldCheck className="w-10 h-10 text-muted-foreground" />
            <h3 className="text-xl font-bold text-foreground font-outfit">No audit logs found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              We couldn&apos;t find any activity logs matching your search criteria.
            </p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-border/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/15 text-muted-foreground uppercase font-bold tracking-wider border-b border-border/20">
                    <th className="p-4 pl-6">Timestamp</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Performed By</th>
                    <th className="p-4 text-center">Entity Type</th>
                    <th className="p-4 text-center">Entity ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {logs.map((log) => {
                    const formattedDate = new Date(log.timestamp).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    });

                    return (
                      <tr key={log.id} className="hover:bg-secondary/5 transition-colors">
                        {/* Timestamp */}
                        <td className="p-4 pl-6 text-muted-foreground font-medium">
                          <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {formattedDate}
                          </span>
                        </td>

                        {/* Action */}
                        <td className="p-4">
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getActionBadgeColor(log.action)}`}>
                            {log.action}
                          </span>
                        </td>

                        {/* Performed By */}
                        <td className="p-4 text-foreground font-bold">{log.performedBy}</td>

                        {/* Entity Type */}
                        <td className="p-4 text-center text-muted-foreground font-semibold uppercase">
                          {log.entityType}
                        </td>

                        {/* Entity ID */}
                        <td className="p-4 text-center">
                          {log.entityId ? (
                            <code className="text-[10px] font-mono font-bold bg-muted px-2 py-0.5 rounded text-foreground">
                              {log.entityId.slice(0, 8)}...
                            </code>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-4">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="p-2 border border-border/40 rounded-xl hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-sm font-semibold text-muted-foreground">
              Page <span className="text-foreground">{page}</span> of {totalPages}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="p-2 border border-border/40 rounded-xl hover:bg-secondary/40 text-muted-foreground hover:text-foreground transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

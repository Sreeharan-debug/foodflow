'use client';

import React from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { ChefHat, MapPin, Star, ArrowRight, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  address: string;
  createdAt: string;
}

export default function CustomerRestaurantsPage() {
  const { data: restaurants = [], isLoading, error } = useQuery<Restaurant[]>({
    queryKey: ['customer-restaurants-list'],
    queryFn: async () => {
      const res = await api.get('/foods/restaurants');
      return res.data;
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner header */}
        <div className="rounded-3xl relative overflow-hidden bg-gradient-to-r from-orange-600/10 via-amber-600/5 to-red-500/5 border border-orange-500/10 p-8 sm:p-12 flex flex-col justify-center min-h-[160px]">
          <div className="max-w-xl space-y-2 relative z-10">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              Kitchen Brands
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight font-outfit text-foreground">
              Browse Partner Kitchens
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Order from your favorite cloud kitchen or discover new regional culinary artists in Calicut.
            </p>
          </div>
        </div>

        {/* Restaurants grid */}
        {isLoading ? (
          <div className="flex justify-center items-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl glass border border-destructive/20 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <h3 className="font-bold text-foreground">Failed to load restaurants</h3>
            <p className="text-xs text-muted-foreground">Check connection parameters and try again.</p>
          </div>
        ) : restaurants.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 space-y-4 glass rounded-3xl min-h-[250px]">
            <ChefHat className="w-10 h-10 text-muted-foreground" />
            <h3 className="text-lg font-bold text-foreground font-outfit">No active restaurants</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              We are currently onboarding kitchen partners. Please check back later!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {restaurants.map((restaurant) => (
              <motion.div
                key={restaurant.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -4 }}
                transition={{ duration: 0.3 }}
                className="glass rounded-2xl overflow-hidden border border-border/40 hover:border-orange-500/20 hover:shadow-xl flex flex-col justify-between"
              >
                {/* Visual header background or logo */}
                <div className="p-6 bg-secondary/10 border-b border-border/20 flex gap-4 items-center">
                  {restaurant.logo ? (
                    <img 
                      src={restaurant.logo} 
                      alt={restaurant.name} 
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=200'; }}
                      className="w-16 h-16 rounded-xl object-cover border border-border/40 bg-muted" 
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold text-xl shrink-0 font-outfit">
                      {restaurant.name.charAt(0)}
                    </div>
                  )}
                  <div className="space-y-1">
                    <span className="inline-flex items-center gap-1 text-[9px] font-bold text-orange-400 bg-orange-500/10 px-2 py-0.5 rounded border border-orange-500/20 uppercase tracking-wide">
                      Approved Merchant
                    </span>
                    <h3 className="text-base font-extrabold text-foreground font-outfit leading-snug line-clamp-1">
                      {restaurant.name}
                    </h3>
                    <div className="flex items-center text-xs text-yellow-400 font-semibold gap-1">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>4.8 (Top Chef)</span>
                    </div>
                  </div>
                </div>

                {/* Info and Address */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="flex items-start gap-2 text-xs text-muted-foreground">
                    <MapPin className="w-4 h-4 text-orange-400 shrink-0 mt-0.5" />
                    <p className="line-clamp-2 leading-relaxed">{restaurant.address}</p>
                  </div>

                  <div className="pt-4 border-t border-border/20 flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground font-semibold">
                      Join Date: {new Date(restaurant.createdAt).toLocaleDateString()}
                    </span>
                    <Link
                      href={`/customer/restaurants/${restaurant.id}`}
                      className="flex items-center gap-1 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
                    >
                      <span>View Menu</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

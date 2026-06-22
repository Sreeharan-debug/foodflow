'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import CartDrawer from '@/components/shared/cart-drawer';
import FoodDetailModal from '@/components/shared/food-detail-modal';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useCart } from '@/providers/cart-provider';
import { MapPin, Star, Clock, Plus, Loader2, AlertCircle, Sparkles, Flame } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Food {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  rating: number;
  preparationTime: number;
  featured: boolean;
  isAvailable: boolean;
  category: { id: string; name: string };
  isVeg: boolean;
  isBestseller: boolean;
  isTrending: boolean;
  isNew: boolean;
  spiceLevel?: string;
  _count?: { reviews: number };
}

interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  address: string;
  createdAt: string;
}

export default function RestaurantDetailPage() {
  const params = useParams();
  const restaurantId = params.id as string;
  
  const { addToCart } = useCart();
  const queryClient = useQueryClient();
  
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [selectedFoodDetail, setSelectedFoodDetail] = useState<Food | null>(null);

  // 1. Fetch Restaurant Details
  const { data: restaurant, isLoading: isRestLoading, error: restError } = useQuery<Restaurant>({
    queryKey: ['restaurant-detail', restaurantId],
    queryFn: async () => {
      const res = await api.get(`/foods/restaurants/${restaurantId}`);
      return res.data;
    },
  });

  // 2. Fetch Restaurant Foods
  const { data: foodData, isLoading: isFoodsLoading } = useQuery<{ foods: Food[] }>({
    queryKey: ['restaurant-foods', restaurantId],
    queryFn: async () => {
      const res = await api.get('/foods', {
        params: {
          restaurantId,
          limit: 100, // Load all foods for filter mapping
        },
      });
      return res.data;
    },
  });

  const allFoods = foodData?.foods || [];

  // Derive unique categories from active foods
  const categoriesMap = new Map<string, string>();
  allFoods.forEach((f) => {
    if (f.category) {
      categoriesMap.set(f.category.id, f.category.name);
    }
  });
  const restaurantCategories = Array.from(categoriesMap.entries()).map(([id, name]) => ({ id, name }));

  // Filter foods locally
  const filteredFoods = allFoods.filter((food) => {
    if (selectedCategory && food.category?.id !== selectedCategory) return false;
    if (isVegOnly && !food.isVeg) return false;
    return true;
  });

  if (isRestLoading) {
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

  if (restError || !restaurant) {
    return (
      <div className="flex flex-col min-h-screen bg-background">
        <Navbar />
        <main className="flex-1 flex flex-col justify-center items-center space-y-4">
          <AlertCircle className="w-12 h-12 text-destructive" />
          <h2 className="text-xl font-bold text-foreground">Failed to load restaurant details</h2>
          <p className="text-xs text-muted-foreground">The restaurant you are looking for might be suspended or deleted.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
        {/* Banner Details */}
        <div className="glass rounded-3xl border border-border/40 p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-center shadow-xl bg-gradient-to-br from-orange-500/5 via-background to-background">
          {restaurant.logo ? (
            <img
              src={restaurant.logo}
              alt={restaurant.name}
              onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=200'; }}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border border-border/40 bg-muted shrink-0 shadow-lg"
            />
          ) : (
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-orange-500/10 text-orange-400 border border-orange-500/20 flex items-center justify-center font-bold text-3xl shrink-0 shadow-lg font-outfit">
              {restaurant.name.charAt(0)}
            </div>
          )}

          <div className="space-y-3 text-center sm:text-left flex-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 text-xs font-bold uppercase tracking-wider">
              🥘 Active Kitchen Partner
            </span>
            <h1 className="text-3xl font-extrabold text-foreground font-outfit leading-tight">
              {restaurant.name}
            </h1>
            <div className="flex items-center justify-center sm:justify-start gap-4 text-xs font-semibold text-muted-foreground flex-wrap">
              <span className="flex items-center text-yellow-400">
                <Star className="w-4 h-4 fill-current mr-1" />
                4.8 Rating
              </span>
              <span className="h-4 w-px bg-border/40 hidden sm:block" />
              <span className="flex items-center gap-1">
                <Clock className="w-4 h-4 text-orange-400" />
                25-35 min Delivery
              </span>
              <span className="h-4 w-px bg-border/40 hidden sm:block" />
              <span className="flex items-center gap-1">
                <MapPin className="w-4 h-4 text-orange-400" />
                Calicut Hub
              </span>
            </div>
            <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed flex items-start justify-center sm:justify-start gap-1">
              <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0 mt-0.5" />
              <span>{restaurant.address}</span>
            </p>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center border-t border-b border-border/40 py-6">
          {/* Categories Tab selector */}
          <div className="overflow-x-auto no-scrollbar pb-1 -mx-4 px-4 sm:mx-0 sm:px-0">
            <div className="flex space-x-2 w-max">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider border ${
                  selectedCategory === ''
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md'
                    : 'bg-card/65 border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                All Dishes
              </button>
              {restaurantCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer uppercase tracking-wider border ${
                    selectedCategory === cat.id
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white border-transparent shadow-md'
                      : 'bg-card/65 border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Veg Only Toggle */}
          <button
            onClick={() => setIsVegOnly(!isVegOnly)}
            className={`flex items-center justify-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer shrink-0 ${
              isVegOnly
                ? 'bg-green-500/10 border-green-500/50 text-green-500 shadow-sm'
                : 'bg-card border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/40'
            }`}
          >
            <div className="w-3.5 h-3.5 border border-green-600 flex items-center justify-center rounded-[3px] shrink-0">
              <div className="w-1.5 h-1.5 rounded-full bg-green-600" />
            </div>
            <span>Veg Only</span>
          </button>
        </div>

        {/* Menu Grid */}
        {isFoodsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden aspect-[3/4] p-4 space-y-4 animate-pulse h-80" />
            ))}
          </div>
        ) : filteredFoods.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 space-y-4 glass rounded-3xl min-h-[250px]">
            <span className="text-4xl">🍽️</span>
            <h3 className="text-lg font-bold text-foreground font-outfit">No items matching criteria</h3>
            <p className="text-xs text-muted-foreground max-w-sm">
              We couldn&apos;t locate any menu items under this category. Try changing your filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {filteredFoods.map((food) => (
                <motion.div
                  key={food.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="glass rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-orange-500/30 hover:shadow-xl transition-all h-full"
                >
                  {/* Card Image Header */}
                  <div
                    onClick={() => setSelectedFoodDetail(food)}
                    className="relative overflow-hidden aspect-[4/3] bg-muted border-b border-border/30 cursor-pointer"
                  >
                    {food.imageUrl && (
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&q=80&w=300'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase bg-black/75 text-white backdrop-blur-sm">
                      {food.category.name}
                    </span>

                    {/* Veg indicator & badges */}
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      <div className={`w-4 h-4 border-2 flex items-center justify-center rounded bg-black/60 backdrop-blur-sm shrink-0 ${food.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                      </div>
                      {food.isBestseller && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase bg-amber-500 text-black shadow-md">
                          Bestseller
                        </span>
                      )}
                      {food.isTrending && (
                        <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase bg-orange-500 text-white shadow-md">
                          Trending
                        </span>
                      )}
                    </div>

                    <div className="absolute bottom-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-md text-[9px] font-bold bg-black/75 text-white backdrop-blur-sm">
                      <Clock className="w-3 h-3 text-orange-400" />
                      <span>{food.preparationTime} mins</span>
                    </div>
                  </div>

                  {/* Card Content Body */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center text-xs font-semibold text-yellow-400">
                          <Star className="w-3.5 h-3.5 fill-current mr-1" />
                          {food.rating.toFixed(1)}
                        </span>
                        {food.spiceLevel && (
                          <span className="flex items-center text-[9px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-md border border-orange-500/10">
                            <Flame className="w-2.5 h-2.5 mr-0.5 fill-current text-orange-500" />
                            {food.spiceLevel}
                          </span>
                        )}
                      </div>
                      <h3
                        onClick={() => setSelectedFoodDetail(food)}
                        className="text-base font-bold text-foreground font-outfit leading-tight hover:text-orange-400 transition-colors cursor-pointer line-clamp-1"
                      >
                        {food.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                        {food.description}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/20">
                      <span className="text-lg font-extrabold text-foreground font-outfit">
                        ₹{parseFloat(food.price).toFixed(2)}
                      </span>
                      <button
                        onClick={() => addToCart(food.id)}
                        className="flex items-center gap-1 px-3 py-2 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md hover:shadow-orange-500/20 transition-all cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add</span>
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <FoodDetailModal
        food={selectedFoodDetail}
        onClose={() => setSelectedFoodDetail(null)}
        onReviewSubmitted={() => {
          queryClient.invalidateQueries({ queryKey: ['restaurant-foods'] });
        }}
      />

      <Footer />
    </div>
  );
}

'use client';

import React, { useState, useRef } from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import CartDrawer from '@/components/shared/cart-drawer';
import FoodDetailModal from '@/components/shared/food-detail-modal';
import { useAuth } from '@/providers/auth-provider';
import { getFirstName } from '@/utils/name';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { useCart } from '@/providers/cart-provider';
import {
  Search, SlidersHorizontal, Clock, Star, Plus, ChevronLeft, ChevronRight,
  Loader2, Sparkles, Flame, X, MapPin, ChefHat, Check, ShoppingBag,
} from 'lucide-react';
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
  category: { name: string };
  isVeg: boolean;
  isBestseller: boolean;
  isTrending: boolean;
  isNew: boolean;
  spiceLevel?: string;
  _count?: { reviews: number };
  restaurantId?: string;
  restaurant?: { id: string; name: string; logo?: string; address?: string };
}

interface Category {
  id: string;
  name: string;
}

interface Restaurant {
  id: string;
  name: string;
  logo?: string;
  address: string;
  createdAt: string;
}

// ---------- Restaurant Picker Modal ----------
function RestaurantPickerModal({
  food,
  restaurants,
  isLoading,
  onSelect,
  onClose,
}: {
  food: Food;
  restaurants: Restaurant[];
  isLoading: boolean;
  onSelect: (restaurantId: string) => void;
  onClose: () => void;
}) {
  const [addingId, setAddingId] = useState<string | null>(null);

  const handleSelect = async (restaurantId: string) => {
    setAddingId(restaurantId);
    await onSelect(restaurantId);
    setAddingId(null);
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-end sm:items-center justify-center px-0 sm:px-4"
        onClick={onClose}
      >
        {/* Backdrop */}
        <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

        {/* Sheet */}
        <motion.div
          initial={{ opacity: 0, y: 80, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 80, scale: 0.97 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full sm:max-w-lg bg-background border border-border/50 rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
        >
          {/* Header */}
          <div className="p-5 border-b border-border/30 flex items-start justify-between gap-4 shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              {food.imageUrl && (
                <img
                  src={food.imageUrl}
                  alt={food.name}
                  className="w-14 h-14 rounded-xl object-cover border border-border/40 shrink-0"
                  onError={(e) => { (e.target as HTMLImageElement).src = '/images/foods/placeholder-food.jpg'; }}
                />
              )}
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-orange-400 uppercase tracking-widest mb-0.5">
                  Adding to cart
                </p>
                <h3 className="text-base font-extrabold font-outfit text-foreground leading-tight line-clamp-1">
                  {food.name}
                </h3>
                <p className="text-xs text-muted-foreground font-semibold">
                  ₹{parseFloat(food.price).toFixed(2)}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-secondary/50 text-muted-foreground hover:text-foreground transition-all shrink-0 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Subtitle */}
          <div className="px-5 pt-4 pb-2 shrink-0">
            <h4 className="text-sm font-bold text-foreground font-outfit">
              Select a Restaurant
            </h4>
            <p className="text-xs text-muted-foreground mt-0.5">
              Choose which partner kitchen to order from
            </p>
          </div>

          {/* Restaurant List */}
          <div className="overflow-y-auto flex-1 px-5 pb-5 space-y-3 mt-2">
            {isLoading ? (
              <div className="flex justify-center py-10">
                <Loader2 className="w-7 h-7 animate-spin text-orange-500" />
              </div>
            ) : restaurants.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <ChefHat className="w-8 h-8 text-muted-foreground mx-auto" />
                <p className="text-sm font-semibold text-muted-foreground">No active restaurants available</p>
              </div>
            ) : (
              restaurants.map((r) => (
                <motion.button
                  key={r.id}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelect(r.id)}
                  disabled={addingId !== null}
                  className="w-full flex items-center gap-4 p-4 rounded-2xl border border-border/40 hover:border-orange-500/40 bg-card/60 hover:bg-secondary/30 transition-all text-left group cursor-pointer disabled:opacity-60"
                >
                  {/* Logo */}
                  {r.logo ? (
                    <img
                      src={r.logo}
                      alt={r.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&q=80&w=80'; }}
                      className="w-12 h-12 rounded-xl object-cover border border-border/30 shrink-0"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 font-extrabold text-lg font-outfit flex items-center justify-center shrink-0">
                      {r.name.charAt(0)}
                    </div>
                  )}

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground font-outfit leading-tight line-clamp-1 group-hover:text-orange-400 transition-colors">
                      {r.name}
                    </p>
                    {r.address && (
                      <div className="flex items-center gap-1 mt-1">
                        <MapPin className="w-3 h-3 text-orange-400 shrink-0" />
                        <p className="text-[10px] text-muted-foreground line-clamp-1">{r.address}</p>
                      </div>
                    )}
                    <span className="inline-flex items-center gap-1 mt-1.5 text-[9px] font-bold text-green-400 bg-green-500/10 border border-green-500/20 px-2 py-0.5 rounded-full uppercase tracking-wide">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" />
                      Open Now
                    </span>
                  </div>

                  {/* Action */}
                  <div className="shrink-0">
                    {addingId === r.id ? (
                      <Loader2 className="w-5 h-5 animate-spin text-orange-500" />
                    ) : (
                      <div className="w-9 h-9 rounded-xl bg-orange-600 group-hover:bg-orange-500 flex items-center justify-center text-white transition-colors shadow-md group-hover:shadow-orange-500/30">
                        <Plus className="w-4 h-4" />
                      </div>
                    )}
                  </div>
                </motion.button>
              ))
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ---------- Main Menu Page ----------
export default function MenuPage() {
  const { user, isAuthenticated } = useAuth();
  const { addToCart, cartItems } = useCart();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sort, setSort] = useState('name_asc');
  const [page, setPage] = useState(1);
  const [isVegOnly, setIsVegOnly] = useState(false);
  const [selectedFoodDetail, setSelectedFoodDetail] = useState<Food | null>(null);
  // Restaurant picker state
  const [pickerFood, setPickerFood] = useState<Food | null>(null);
  const [addingFoodId, setAddingFoodId] = useState<string | null>(null);
  const [successFoodId, setSuccessFoodId] = useState<string | null>(null);
  const limit = 8;

  // Fetch Categories
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
  });

  // Fetch Restaurants (approved partner kitchens)
  const { data: restaurants = [], isLoading: restaurantsLoading } = useQuery<Restaurant[]>({
    queryKey: ['customer-restaurants-list'],
    queryFn: async () => {
      const res = await api.get('/foods/restaurants');
      return res.data;
    },
  });

  // Fetch Foods with dynamic filters
  const { data: foodData, isLoading } = useQuery<{
    foods: Food[];
    total: number;
    page: number;
    totalPages: number;
  }>({
    queryKey: ['foods', search, selectedCategory, sort, page, isVegOnly],
    queryFn: async () => {
      const res = await api.get('/foods', {
        params: {
          search,
          categoryId: selectedCategory || undefined,
          sort,
          page,
          limit,
          isVeg: isVegOnly ? 'true' : undefined,
        },
      });
      return res.data;
    },
  });

  const { data: recommendedData } = useQuery<{ foods: Food[] }>({
    queryKey: ['foods-recommended'],
    queryFn: async () => {
      const res = await api.get('/foods', { params: { featured: 'true', limit: 6 } });
      return res.data || { foods: [] };
    },
  });

  const { data: popularData } = useQuery<{ foods: Food[] }>({
    queryKey: ['foods-popular'],
    queryFn: async () => {
      const res = await api.get('/foods', { params: { sort: 'rating_desc', limit: 6 } });
      return res.data || { foods: [] };
    },
  });

  const { data: biryanisData } = useQuery<{ foods: Food[] }>({
    queryKey: ['foods-biryanis'],
    queryFn: async () => {
      const res = await api.get('/foods', { params: { search: 'Biryani', limit: 6 } });
      return res.data || { foods: [] };
    },
  });

  const foods = foodData?.foods || [];
  const totalPages = foodData?.totalPages || 1;

  // ---- Add to Cart Handler ----
  // Always show restaurant picker so user consciously picks a kitchen
  const handleAddToCart = (food: Food) => {
    setPickerFood(food);
  };

  const doAdd = async (foodId: string, _restaurantId?: string) => {
    setAddingFoodId(foodId);
    try {
      await addToCart(foodId);
      setSuccessFoodId(foodId);
      setTimeout(() => setSuccessFoodId(null), 2000);
    } finally {
      setAddingFoodId(null);
    }
  };

  const handleRestaurantSelected = async (restaurantId: string) => {
    if (!pickerFood) return;
    // We just add the food; the backend associates it via the food's restaurantId.
    // Pass restaurantId as hint (cart-provider ignores unknown params — it calls POST /cart/items)
    setPickerFood(null);
    await doAdd(pickerFood.id, restaurantId);
  };

  const handleCategorySelect = (id: string) => {
    setSelectedCategory(id);
    setPage(1);
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value);
    setPage(1);
  };

  // Badge meta
  const renderFoodMeta = (food: Food) => {
    const cat = food.category.name;
    if (cat === 'Desserts') return (
      <span className="flex items-center text-[9px] font-bold text-pink-400 bg-pink-500/10 px-1.5 py-0.5 rounded-md border border-pink-500/10">🍯 Sweet</span>
    );
    if (cat === 'Beverages') return (
      <span className="flex items-center text-[9px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.5 rounded-md border border-sky-500/10">🥤 Beverage</span>
    );
    if (cat === 'Breakfast') return (
      <span className="flex items-center text-[9px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-500/10">🌅 Breakfast</span>
    );
    if (food.spiceLevel) return (
      <span className="flex items-center text-[9px] font-bold text-orange-400 bg-orange-500/10 px-1.5 py-0.5 rounded-md border border-orange-500/10">
        <Flame className="w-2.5 h-2.5 mr-0.5 fill-current text-orange-500" />{food.spiceLevel}
      </span>
    );
    return null;
  };

  // Add Button rendering
  const renderAddButton = (food: Food, size: 'sm' | 'md' = 'md') => {
    const isAdding = addingFoodId === food.id;
    const isSuccess = successFoodId === food.id;
    const baseClass = size === 'sm'
      ? 'flex items-center gap-1 px-3 py-1.5 text-[10px] font-bold rounded-lg shadow-sm transition-all cursor-pointer'
      : 'flex items-center gap-1 px-3 py-2 text-xs font-bold rounded-lg shadow-md transition-all cursor-pointer';

    return (
      <button
        onClick={() => handleAddToCart(food)}
        disabled={isAdding}
        className={`${baseClass} ${
          isSuccess
            ? 'bg-green-600 hover:bg-green-500 text-white hover:shadow-green-500/20'
            : 'bg-orange-600 hover:bg-orange-500 text-white hover:shadow-orange-500/20'
        }`}
      >
        {isAdding ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : isSuccess ? (
          <><Check className="w-3.5 h-3.5" /><span>Added!</span></>
        ) : (
          <><Plus className="w-3.5 h-3.5" /><span>Add</span></>
        )}
      </button>
    );
  };

  // Carousel Row
  const renderRecommendationRow = (title: string, subtitle: string, items: Food[], icon: React.ReactNode) => {
    if (!items || items.length === 0) return null;
    return (
      <div className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">{icon}</div>
          <div>
            <h2 className="text-xl font-bold font-outfit text-foreground">{title}</h2>
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          </div>
        </div>
        <div className="overflow-x-auto pb-4 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 scrollbar-thin scrollbar-thumb-border">
          <div className="flex space-x-5 w-max">
            {items.map((food) => (
              <div
                key={food.id}
                className="w-[260px] shrink-0 glass rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-orange-500/30 hover:shadow-lg transition-all border border-border/40"
              >
                <div
                  onClick={() => setSelectedFoodDetail(food)}
                  className="relative overflow-hidden aspect-[4/3] bg-muted border-b border-border/30 cursor-pointer"
                >
                  {food.imageUrl && (
                    <img
                      src={food.imageUrl}
                      alt={food.name}
                      onError={(e) => { (e.target as HTMLImageElement).src = '/images/foods/placeholder-food.jpg'; }}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  )}
                  <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase bg-black/75 text-white backdrop-blur-sm">
                    {food.category.name}
                  </span>
                  <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                    <div className={`w-4 h-4 border-2 flex items-center justify-center rounded bg-black/60 backdrop-blur-sm shrink-0 ${food.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                    </div>
                    {food.isBestseller && <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase bg-amber-500 text-black shadow-md">Bestseller</span>}
                    {food.isTrending && <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase bg-orange-500 text-white shadow-md">Trending</span>}
                    {food.isNew && <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase bg-blue-500 text-white shadow-md">New</span>}
                  </div>
                  <div className="absolute bottom-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-md text-[9px] font-bold bg-black/75 text-white backdrop-blur-sm">
                    <Clock className="w-3 h-3 text-orange-400" />
                    <span>{food.preparationTime} mins</span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5">
                        <span className="text-[10px] font-semibold text-yellow-400 flex items-center">
                          <Star className="w-3 h-3 fill-current mr-0.5" />{food.rating.toFixed(1)}
                        </span>
                        <span className="text-[9px] text-muted-foreground">({food._count?.reviews || 0} reviews)</span>
                      </div>
                      {renderFoodMeta(food)}
                    </div>
                    <h4
                      onClick={() => setSelectedFoodDetail(food)}
                      className="text-sm font-bold text-foreground font-outfit line-clamp-1 hover:text-orange-400 transition-colors cursor-pointer"
                    >
                      {food.name}
                    </h4>
                    {/* Restaurant badge */}
                    {food.restaurant && (
                      <p className="text-[9px] text-muted-foreground flex items-center gap-1">
                        <ChefHat className="w-3 h-3 text-orange-400" />
                        {food.restaurant.name}
                      </p>
                    )}
                    <p className="text-[10px] text-muted-foreground line-clamp-2 leading-relaxed">{food.description}</p>
                  </div>
                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-border/20">
                    <span className="text-sm font-extrabold text-foreground font-outfit">₹{parseFloat(food.price).toFixed(2)}</span>
                    {renderAddButton(food, 'sm')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />
      <CartDrawer />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Banner */}
        <div className="rounded-3xl relative overflow-hidden bg-gradient-to-r from-orange-600/20 via-amber-600/10 to-red-500/10 border border-orange-500/10 p-8 sm:p-12 flex flex-col justify-center min-h-[220px]">
          <div className="max-w-xl space-y-3 relative z-10">
            <span className="text-xs font-bold text-orange-400 uppercase tracking-widest bg-orange-500/10 px-2.5 py-1 rounded-full border border-orange-500/20">
              India&apos;s Premium Cuisines
            </span>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight font-outfit text-foreground">
              {isAuthenticated && user ? `Welcome back, ${getFirstName(user.name)}!` : 'Authentic Flavors, Delivered Fresh'}
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Savor premium biryanis, crispy dosas, and authentic local Indian delicacies crafted by master culinary artists.
            </p>
          </div>
          <div className="absolute right-0 bottom-0 top-0 w-1/3 hidden md:block bg-[url('https://images.unsplash.com/photo-1585938338392-50a599e0a4e5?auto=format&fit=crop&q=80&w=400')] bg-cover bg-center rounded-l-3xl opacity-20 border-l border-border/40" />
        </div>

        {/* Carousel Rows */}
        {renderRecommendationRow(
          'Recommended For You',
          'Handpicked local favorites and master chef recommendations',
          recommendedData?.foods || [],
          <Sparkles className="w-5 h-5" />,
        )}
        {renderRecommendationRow(
          'Popular Near You',
          'Hot and trending items ordered by foodies nearby',
          popularData?.foods || [],
          <Flame className="w-5 h-5" />,
        )}
        {renderRecommendationRow(
          'Most Ordered Biryanis',
          'Savor authentic, slow-cooked royal Indian Biryanis',
          biryanisData?.foods || [],
          <span className="text-lg leading-none">🥘</span>,
        )}

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-4 items-stretch md:items-center justify-between border-t border-b border-border/40 py-6 mt-8">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3.5 top-3 w-4.5 h-4.5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search favorite dishes..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full bg-card/65 border border-border/40 rounded-xl pl-10 pr-4 py-2.5 text-sm text-foreground focus:outline-none focus:border-orange-500 transition-all placeholder:text-muted-foreground/60"
            />
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <button
              onClick={() => { setIsVegOnly(!isVegOnly); setPage(1); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold border transition-all cursor-pointer ${
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
            <div className="flex items-center space-x-2">
              <div className="flex items-center text-xs text-muted-foreground font-bold uppercase tracking-wider space-x-1.5 shrink-0">
                <SlidersHorizontal className="w-4 h-4" /><span>Sort By</span>
              </div>
              <select
                value={sort}
                onChange={handleSortChange}
                className="bg-card border border-border/40 rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:border-orange-500 transition-all font-medium"
              >
                <option value="name_asc">Name (A - Z)</option>
                <option value="name_desc">Name (Z - A)</option>
                <option value="price_asc">Price (Low to High)</option>
                <option value="price_desc">Price (High to Low)</option>
                <option value="rating_desc">Top Rated</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="overflow-x-auto pb-2 -mx-4 px-4 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          <div className="flex space-x-2 w-max">
            <button
              onClick={() => handleCategorySelect('')}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                selectedCategory === ''
                  ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                  : 'bg-card/65 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/40'
              }`}
            >
              All Items
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategorySelect(cat.id)}
                className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                  selectedCategory === cat.id
                    ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-md'
                    : 'bg-card/65 border border-border/40 text-muted-foreground hover:text-foreground hover:bg-secondary/40'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

        {/* Food Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass rounded-2xl overflow-hidden aspect-[3/4] flex flex-col justify-between p-4 space-y-4">
                <div className="w-full h-1/2 shimmer rounded-xl" />
                <div className="space-y-2 flex-1">
                  <div className="h-4 w-1/3 shimmer rounded" />
                  <div className="h-6 w-3/4 shimmer rounded" />
                  <div className="h-10 w-full shimmer rounded" />
                </div>
                <div className="flex justify-between items-center pt-2">
                  <div className="h-6 w-1/4 shimmer rounded" />
                  <div className="h-8 w-1/3 shimmer rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : foods.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center p-12 space-y-4 glass rounded-3xl min-h-[300px]">
            <span className="text-4xl">🍽️</span>
            <h3 className="text-xl font-bold text-foreground font-outfit">No dishes found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              We couldn&apos;t find any dishes matching your parameters. Try adjusting your search query or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <AnimatePresence>
              {foods.map((food) => (
                <motion.div
                  key={food.id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                  className="glass rounded-2xl overflow-hidden flex flex-col justify-between group hover:border-orange-500/30 hover:shadow-xl transition-all h-full"
                >
                  <div
                    onClick={() => setSelectedFoodDetail(food)}
                    className="relative overflow-hidden aspect-[4/3] bg-muted border-b border-border/30 cursor-pointer"
                  >
                    {food.imageUrl && (
                      <img
                        src={food.imageUrl}
                        alt={food.name}
                        onError={(e) => { (e.target as HTMLImageElement).src = '/images/foods/placeholder-food.jpg'; }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    )}
                    <span className="absolute top-3 right-3 px-2 py-0.5 rounded-md text-[9px] font-bold tracking-wide uppercase bg-black/75 text-white backdrop-blur-sm">
                      {food.category.name}
                    </span>
                    <div className="absolute top-3 left-3 flex flex-col gap-1.5 items-start">
                      <div className={`w-4 h-4 border-2 flex items-center justify-center rounded bg-black/60 backdrop-blur-sm shrink-0 ${food.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                      </div>
                      {food.isBestseller && <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase bg-amber-500 text-black shadow-md">Bestseller</span>}
                      {food.isTrending && <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase bg-orange-500 text-white shadow-md">Trending</span>}
                      {food.isNew && <span className="px-1.5 py-0.5 rounded text-[8px] font-extrabold tracking-wide uppercase bg-blue-500 text-white shadow-md">New</span>}
                    </div>
                    <div className="absolute bottom-3 right-3 flex items-center space-x-1 px-2.5 py-1 rounded-md text-[9px] font-bold bg-black/75 text-white backdrop-blur-sm">
                      <Clock className="w-3 h-3 text-orange-400" />
                      <span>{food.preparationTime} mins</span>
                    </div>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-1.5">
                          <span className="flex items-center text-xs font-semibold text-yellow-400">
                            <Star className="w-3.5 h-3.5 fill-current mr-1" />{food.rating.toFixed(1)}
                          </span>
                          <span className="text-[10px] text-muted-foreground">({food._count?.reviews || 0} reviews)</span>
                        </div>
                        {renderFoodMeta(food)}
                      </div>
                      <h3
                        onClick={() => setSelectedFoodDetail(food)}
                        className="text-base font-bold text-foreground font-outfit leading-tight hover:text-orange-400 transition-colors cursor-pointer"
                      >
                        {food.name}
                      </h3>
                      {/* Restaurant badge on card */}
                      {food.restaurant ? (
                        <p className="text-[10px] text-orange-400 flex items-center gap-1 font-semibold">
                          <ChefHat className="w-3 h-3" />{food.restaurant.name}
                        </p>
                      ) : (
                        <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <ChefHat className="w-3 h-3 text-orange-400" />
                          <span className="italic">Select restaurant to order</span>
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">{food.description}</p>
                    </div>

                    <div className="flex items-center justify-between mt-5 pt-4 border-t border-border/20">
                      <span className="text-lg font-extrabold text-foreground font-outfit">₹{parseFloat(food.price).toFixed(2)}</span>
                      {renderAddButton(food, 'md')}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 pt-8 border-t border-border/40">
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

      {/* Restaurant Picker Modal */}
      <AnimatePresence>
        {pickerFood && (
          <RestaurantPickerModal
            food={pickerFood}
            restaurants={restaurants}
            isLoading={restaurantsLoading}
            onSelect={handleRestaurantSelected}
            onClose={() => setPickerFood(null)}
          />
        )}
      </AnimatePresence>

      <FoodDetailModal
        food={selectedFoodDetail}
        onClose={() => setSelectedFoodDetail(null)}
        onReviewSubmitted={() => {
          queryClient.invalidateQueries({ queryKey: ['foods'] });
        }}
      />

      <Footer />
    </div>
  );
}

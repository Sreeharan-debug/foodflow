'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Trash2, Plus, Pencil, Loader2, AlertCircle, Check, X, Star, Clock, Image, Upload } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/auth-provider';
import StatusBlocker from '@/components/shared/status-blocker';

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
  categoryId: string;
  category: { name: string };
  isVeg: boolean;
  isBestseller: boolean;
  isTrending: boolean;
  isNew: boolean;
  spiceLevel: string | null;
}

interface Category {
  id: string;
  name: string;
}

export default function AdminFoodsPage() {
  const { user } = useAuth();
  const restaurantStatus = user?.restaurant?.status;

  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);

  if (user?.role === 'ADMIN' && restaurantStatus !== 'APPROVED') {
    return (
      <StatusBlocker
        status={restaurantStatus}
        restaurantName={user?.restaurant?.name}
        userName={user?.name}
      />
    );
  }

  // Form States
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [prepTime, setPrepTime] = useState('15');
  const [featured, setFeatured] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [isVeg, setIsVeg] = useState(false);
  const [isBestseller, setIsBestseller] = useState(false);
  const [isTrending, setIsTrending] = useState(false);
  const [isNew, setIsNew] = useState(false);
  const [spiceLevel, setSpiceLevel] = useState('Medium');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [formError, setFormError] = useState<string | null>(null);
  const [formLoading, setFormLoading] = useState(false);

  // 1. Fetch Categories for select dropdown
  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ['admin-categories-list'],
    queryFn: async () => {
      const res = await api.get('/categories');
      if (res.data.length > 0 && !categoryId) {
        setCategoryId(res.data[0].id);
      }
      return res.data;
    },
  });

  // 2. Fetch Foods List (Admin view includes all)
  const { data: foods = [], isLoading, error } = useQuery<Food[]>({
    queryKey: ['admin-foods-all'],
    queryFn: async () => {
      const res = await api.get('/foods/admin');
      return res.data;
    },
  });

  // 3. Add Food Mutation (utilizes FormData)
  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name || !description || !price || !categoryId || !prepTime) {
      setFormError('Please fill out all required fields');
      return;
    }

    setFormLoading(true);

    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    formData.append('price', price);
    formData.append('categoryId', categoryId);
    formData.append('preparationTime', prepTime);
    formData.append('featured', String(featured));
    formData.append('isAvailable', String(isAvailable));
    formData.append('isVeg', String(isVeg));
    formData.append('isBestseller', String(isBestseller));
    formData.append('isTrending', String(isTrending));
    formData.append('isNew', String(isNew));
    formData.append('spiceLevel', spiceLevel);
    if (imageFile) {
      formData.append('image', imageFile);
    }

    try {
      await api.post('/foods', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      queryClient.invalidateQueries({ queryKey: ['admin-foods-all'] });
      setShowAddForm(false);
      // Reset form
      setName('');
      setDescription('');
      setPrice('');
      setPrepTime('15');
      setFeatured(false);
      setIsAvailable(true);
      setIsVeg(false);
      setIsBestseller(false);
      setIsTrending(false);
      setIsNew(false);
      setSpiceLevel('Medium');
      setImageFile(null);
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to add food item');
    } finally {
      setFormLoading(false);
    }
  };

  // 4. Toggle availability mutation
  const toggleAvailableMutation = useMutation({
    mutationFn: async ({ id, isAvailable }: { id: string; isAvailable: boolean }) => {
      const res = await api.put(`/foods/${id}`, { isAvailable });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-foods-all'] });
    },
  });

  // 5. Delete Food Mutation
  const deleteFoodMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/foods/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-foods-all'] });
    },
  });

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold font-outfit text-foreground animate-fade-in">Food Management</h1>
            <p className="text-sm text-muted-foreground">Manage the dishes list, prices in INR (₹), tags, and stock availability.</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span>Add Dish</span>
            </button>
          )}
        </div>

        {/* Add Form */}
        {showAddForm && (
          <motion.form
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAddSubmit}
            className="glass p-6 rounded-2xl border border-border/40 space-y-4"
          >
            <h3 className="font-bold text-foreground text-sm font-outfit">Create New Food Item</h3>
            {formError && <p className="text-xs text-destructive font-semibold">{formError}</p>}
            
            <div className="grid sm:grid-cols-3 gap-4">
              {/* Name */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Dish Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Malabar Chicken Biryani"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border/40 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>

              {/* Category */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Cuisine/Category *</label>
                <select
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full bg-background border border-border/40 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all"
                >
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Price (₹) *</label>
                <input
                  type="number"
                  step="1"
                  placeholder="299"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                  className="w-full bg-background border border-border/40 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Description */}
              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Description *</label>
                <input
                  type="text"
                  placeholder="Details of condiments, spice level, ingredients"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-border/40 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>

              {/* Preparation Time */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Prep Time (minutes) *</label>
                <input
                  type="number"
                  placeholder="20"
                  value={prepTime}
                  onChange={(e) => setPrepTime(e.target.value)}
                  className="w-full bg-background border border-border/40 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all"
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              {/* Spice Level */}
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Spice Level</label>
                <select
                  value={spiceLevel}
                  onChange={(e) => setSpiceLevel(e.target.value)}
                  className="w-full bg-background border border-border/40 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-orange-500 transition-all"
                >
                  <option value="Mild">🌶️ Mild</option>
                  <option value="Medium">🌶️🌶️ Medium</option>
                  <option value="Hot">🌶️🌶️🌶️ Hot</option>
                  <option value="Extra Hot">🌶️🌶️🌶️🌶️ Extra Hot</option>
                </select>
              </div>
            </div>

            {/* Checkboxes & Image Selection */}
            <div className="grid sm:grid-cols-3 gap-6 items-start border-t border-border/20 pt-4">
              {/* Badges and Attributes Checkboxes */}
              <div className="flex flex-col gap-2.5">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Attributes</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center space-x-2 text-xs font-semibold text-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isVeg}
                      onChange={(e) => setIsVeg(e.target.checked)}
                      className="accent-green-600 cursor-pointer"
                    />
                    <span>Veg Dot</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={featured}
                      onChange={(e) => setFeatured(e.target.checked)}
                      className="accent-orange-500 cursor-pointer"
                    />
                    <span>Featured</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isBestseller}
                      onChange={(e) => setIsBestseller(e.target.checked)}
                      className="accent-amber-500 cursor-pointer"
                    />
                    <span>Bestseller</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isTrending}
                      onChange={(e) => setIsTrending(e.target.checked)}
                      className="accent-orange-600 cursor-pointer"
                    />
                    <span>Trending</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isNew}
                      onChange={(e) => setIsNew(e.target.checked)}
                      className="accent-blue-500 cursor-pointer"
                    />
                    <span>New Item</span>
                  </label>
                  <label className="flex items-center space-x-2 text-xs font-semibold text-foreground select-none cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isAvailable}
                      onChange={(e) => setIsAvailable(e.target.checked)}
                      className="accent-green-500 cursor-pointer"
                    />
                    <span>Available</span>
                  </label>
                </div>
              </div>

              {/* Image upload selector */}
              <div className="sm:col-span-2 flex items-center space-x-4 pt-6">
                <label className="flex items-center gap-1.5 px-4 py-2.5 border border-dashed border-border/60 hover:bg-secondary/40 rounded-lg text-xs font-bold text-muted-foreground hover:text-foreground cursor-pointer transition-all select-none">
                  <Upload className="w-4 h-4 text-orange-500" />
                  <span>Choose Photo File</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />
                </label>
                {imageFile ? (
                  <span className="text-xs text-orange-400 font-bold max-w-[200px] truncate">
                    {imageFile.name}
                  </span>
                ) : (
                  <span className="text-xs text-muted-foreground italic">No image file selected</span>
                )}
              </div>
            </div>

            <div className="flex gap-2 justify-end border-t border-border/20 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-border/40 rounded-xl text-xs font-semibold hover:bg-secondary/40 text-muted-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={formLoading}
                className="px-5 py-2 bg-orange-600 hover:bg-orange-500 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-1"
              >
                {formLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                <span>{formLoading ? 'Uploading...' : 'Create Dish'}</span>
              </button>
            </div>
          </motion.form>
        )}

        {/* Foods Grid / Table */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl glass border border-destructive/20 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <h3 className="font-bold text-foreground">Failed to load foods</h3>
            <p className="text-xs text-muted-foreground">Check database configurations and try again.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-border/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/15 text-muted-foreground uppercase font-bold tracking-wider border-b border-border/20">
                    <th className="p-4 pl-6">Dish</th>
                    <th className="p-4">Category</th>
                    <th className="p-4">Price</th>
                    <th className="p-4">Spice</th>
                    <th className="p-4">Rating</th>
                    <th className="p-4">Prep Time</th>
                    <th className="p-4 text-center">Featured</th>
                    <th className="p-4 text-center">Status</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {foods.map((food) => (
                    <tr key={food.id} className="hover:bg-secondary/5 transition-colors">
                      {/* Name & Photo & Badges */}
                      <td className="p-4 pl-6">
                        <div className="flex items-center space-x-3">
                          {food.imageUrl ? (
                            <img src={food.imageUrl} alt={food.name} className="w-11 h-11 rounded-lg object-cover bg-muted border border-border/20" />
                          ) : (
                            <div className="w-11 h-11 rounded-lg bg-secondary/40 border border-border/20 flex items-center justify-center">
                              <Image className="w-4 h-4 text-muted-foreground" />
                            </div>
                          )}
                          <div className="space-y-1">
                            <div className="flex items-center gap-1.5">
                              {/* Veg dot badge */}
                              <div className={`w-3.5 h-3.5 border flex items-center justify-center rounded-[3px] shrink-0 bg-black/35 ${food.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                                <div className={`w-1.5 h-1.5 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                              </div>
                              <h4 className="font-bold text-foreground">{food.name}</h4>
                            </div>
                            <div className="flex gap-1 flex-wrap">
                              {food.isBestseller && (
                                <span className="px-1.5 py-0.2 text-[8px] font-bold bg-amber-500/10 text-amber-500 rounded border border-amber-500/10">
                                  Bestseller
                                </span>
                              )}
                              {food.isTrending && (
                                <span className="px-1.5 py-0.2 text-[8px] font-bold bg-orange-500/10 text-orange-400 rounded border border-orange-500/10">
                                  Trending
                                </span>
                              )}
                              {food.isNew && (
                                <span className="px-1.5 py-0.2 text-[8px] font-bold bg-blue-500/10 text-blue-400 rounded border border-blue-500/10">
                                  New
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Category */}
                      <td className="p-4 text-muted-foreground font-semibold">{food.category.name}</td>

                      {/* Price */}
                      <td className="p-4 font-bold text-foreground">₹{parseFloat(food.price).toFixed(2)}</td>

                      {/* Spice Level */}
                      <td className="p-4">
                        {food.spiceLevel ? (
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                            food.spiceLevel === 'Mild'
                              ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                              : food.spiceLevel === 'Medium'
                              ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                              : food.spiceLevel === 'Hot'
                              ? 'bg-red-500/10 text-red-400 border-red-500/20'
                              : 'bg-rose-600/10 text-rose-400 border-rose-600/20'
                          }`}>
                            {food.spiceLevel === 'Mild' ? '🌶️' : food.spiceLevel === 'Medium' ? '🌶️🌶️' : food.spiceLevel === 'Hot' ? '🌶️🌶️🌶️' : '🌶️🌶️🌶️🌶️'} {food.spiceLevel}
                          </span>
                        ) : (
                          <span className="text-muted-foreground/40 text-[10px]">—</span>
                        )}
                      </td>

                      {/* Rating */}
                      <td className="p-4 text-muted-foreground">
                        <span className="flex items-center text-yellow-400 font-semibold">
                          <Star className="w-3.5 h-3.5 fill-current mr-1" />
                          {food.rating.toFixed(1)}
                        </span>
                      </td>

                      {/* Prep Time */}
                      <td className="p-4 text-muted-foreground">{food.preparationTime} mins</td>

                      {/* Featured */}
                      <td className="p-4 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${
                          food.featured
                            ? 'bg-orange-500/10 text-orange-400 border-orange-500/20'
                            : 'bg-zinc-500/10 text-zinc-400 border-zinc-500/20'
                        }`}>
                          {food.featured ? 'YES' : 'NO'}
                        </span>
                      </td>

                      {/* Available status toggle */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => toggleAvailableMutation.mutate({ id: food.id, isAvailable: !food.isAvailable })}
                          className={`px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer ${
                            food.isAvailable
                              ? 'bg-green-500/10 text-green-400 border-green-500/20'
                              : 'bg-red-500/10 text-red-400 border-red-500/20'
                          }`}
                        >
                          {food.isAvailable ? 'AVAILABLE' : 'OUT OF STOCK'}
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this food item?')) {
                              deleteFoodMutation.mutate(food.id);
                            }
                          }}
                          disabled={deleteFoodMutation.isPending}
                          className="p-2 text-muted-foreground hover:text-destructive hover:bg-destructive/5 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}

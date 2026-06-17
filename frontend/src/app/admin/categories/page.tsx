'use client';

import React, { useState } from 'react';
import Navbar from '@/components/shared/navbar';
import Footer from '@/components/shared/footer';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { Trash2, Plus, Pencil, Loader2, AlertCircle, Check, X } from 'lucide-react';
import { motion } from 'framer-motion';

interface Category {
  id: string;
  name: string;
  description?: string;
  _count?: { foods: number };
}

export default function AdminCategoriesPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Edit State
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDescription, setEditDescription] = useState('');

  // 1. Fetch Categories
  const { data: categories = [], isLoading, error } = useQuery<Category[]>({
    queryKey: ['admin-categories'],
    queryFn: async () => {
      const res = await api.get('/categories');
      return res.data;
    },
  });

  // 2. Add Category Mutation
  const addCategoryMutation = useMutation({
    mutationFn: async (newCat: Omit<Category, 'id'>) => {
      const res = await api.post('/categories', newCat);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setShowAddForm(false);
      setName('');
      setDescription('');
    },
    onError: (err: any) => {
      setFormError(err.response?.data?.message || 'Failed to create category');
    },
  });

  // 3. Update Category Mutation
  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, desc }: { id: string; desc: string }) => {
      const res = await api.put(`/categories/${id}`, { description: desc });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
      setEditingId(null);
    },
  });

  // 4. Delete Category Mutation
  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-categories'] });
    },
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!name.trim()) {
      setFormError('Category name is required');
      return;
    }
    addCategoryMutation.mutate({ name, description });
  };

  const handleStartEdit = (cat: Category) => {
    setEditingId(cat.id);
    setEditDescription(cat.description || '');
  };

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center border-b border-border/40 pb-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-extrabold font-outfit text-foreground">Categories Management</h1>
            <p className="text-sm text-muted-foreground">Create, edit, and organize product categories for the food menu.</p>
          </div>
          {!showAddForm && (
            <button
              onClick={() => setShowAddForm(true)}
              className="flex items-center gap-1 px-4 py-2.5 bg-violet-600 hover:bg-violet-500 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Add Category</span>
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
            <h3 className="font-bold text-foreground text-sm">Create New Category</h3>
            {formError && <p className="text-xs text-destructive font-semibold">{formError}</p>}
            
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Burgers, Beverages"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-background border border-border/40 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>

              <div className="sm:col-span-2 space-y-1">
                <label className="text-[10px] font-bold text-muted-foreground uppercase">Description</label>
                <input
                  type="text"
                  placeholder="Describe the category ingredients or theme"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-background border border-border/40 rounded-xl p-2.5 text-xs text-foreground focus:outline-none focus:border-violet-500 transition-all"
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 border border-border/40 rounded-xl text-xs font-semibold hover:bg-secondary/40 text-muted-foreground cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={addCategoryMutation.isPending}
                className="px-5 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl text-xs font-bold text-white shadow-md disabled:opacity-50 cursor-pointer"
              >
                {addCategoryMutation.isPending ? 'Creating...' : 'Create Category'}
              </button>
            </div>
          </motion.form>
        )}

        {/* Categories Table/List */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-violet-400" />
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl glass border border-destructive/20 text-center space-y-3">
            <AlertCircle className="w-8 h-8 text-destructive mx-auto" />
            <h3 className="font-bold text-foreground">Failed to load categories</h3>
            <p className="text-xs text-muted-foreground">Ensure the database and API are running correctly.</p>
          </div>
        ) : (
          <div className="glass rounded-2xl border border-border/40 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-secondary/15 text-muted-foreground uppercase font-bold tracking-wider border-b border-border/20">
                    <th className="p-4 pl-6">Name</th>
                    <th className="p-4">Description</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/20">
                  {categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-secondary/5 transition-colors">
                      <td className="p-4 pl-6 font-bold text-foreground">{cat.name}</td>
                      <td className="p-4 text-muted-foreground max-w-md">
                        {editingId === cat.id ? (
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              value={editDescription}
                              onChange={(e) => setEditDescription(e.target.value)}
                              className="bg-background border border-border/40 rounded px-2.5 py-1 text-xs text-foreground focus:outline-none"
                            />
                            <button
                              onClick={() => updateCategoryMutation.mutate({ id: cat.id, desc: editDescription })}
                              className="p-1 rounded bg-green-500/10 hover:bg-green-500/20 text-green-400"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => setEditingId(null)}
                              className="p-1 rounded bg-destructive/10 hover:bg-destructive/20 text-destructive"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 group">
                            <span>{cat.description || 'No description provided.'}</span>
                            <button
                              onClick={() => handleStartEdit(cat)}
                              className="p-1 text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <Pencil className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => {
                            if (confirm('Are you sure you want to delete this category? All nested foods will be deleted!')) {
                              deleteCategoryMutation.mutate(cat.id);
                            }
                          }}
                          disabled={deleteCategoryMutation.isPending}
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

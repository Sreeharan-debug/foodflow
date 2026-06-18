'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/providers/auth-provider';
import { api } from '@/services/api';
import { Star, X, Loader2, Edit3, Trash2, ShieldAlert, BadgeCheck } from 'lucide-react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

interface Food {
  id: string;
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  rating: number;
  preparationTime: number;
  isVeg: boolean;
  category: { name: string };
  _count?: { reviews: number };
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  userId: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    firstName?: string | null;
    profileImage?: string | null;
  };
}

interface Stats {
  total: number;
  average: number;
  breakdown: {
    5: number;
    4: number;
    3: number;
    2: number;
    1: number;
  };
}

interface FoodDetailModalProps {
  food: Food | null;
  onClose: () => void;
  onReviewSubmitted?: () => void;
}

export default function FoodDetailModal({ food, onClose, onReviewSubmitted }: FoodDetailModalProps) {
  const { user, isAuthenticated, showToast } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(false);

  // Review Form state
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [editingReviewId, setEditingReviewId] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  useEffect(() => {
    if (food) {
      fetchReviewsAndStats();
    }
  }, [food]);

  const fetchReviewsAndStats = async () => {
    if (!food) return;
    setLoading(true);
    try {
      const [reviewsRes, statsRes] = await Promise.all([
        api.get(`/reviews/food/${food.id}`),
        api.get(`/reviews/food/${food.id}/stats`),
      ]);
      setReviews(reviewsRes.data);
      setStats(statsRes.data);

      // Check if user has an existing review and pre-populate
      if (isAuthenticated && user) {
        const myReview = reviewsRes.data.find((r: Review) => r.userId === user.id);
        if (myReview) {
          setEditingReviewId(myReview.id);
          setRating(myReview.rating);
          setComment(myReview.comment);
        } else {
          setEditingReviewId(null);
          setRating(5);
          setComment('');
        }
      }
    } catch (error) {
      console.error('Failed to load reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!food || !isAuthenticated) return;
    if (!comment.trim()) {
      showToast('Review comment cannot be empty', 'error');
      return;
    }

    setSubmitting(true);
    try {
      if (editingReviewId) {
        // Update
        await api.put(`/reviews/${editingReviewId}`, {
          rating,
          comment,
        });
        showToast('Review updated successfully!', 'success');
      } else {
        // Create
        await api.post('/reviews', {
          foodId: food.id,
          rating,
          comment,
        });
        showToast('Thank you! Review submitted successfully.', 'success');
      }
      fetchReviewsAndStats();
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to submit review', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReviewDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await api.delete(`/reviews/${reviewId}`);
      showToast('Review deleted successfully.', 'success');
      
      // Clear form if it was the user's review
      if (reviewId === editingReviewId) {
        setEditingReviewId(null);
        setComment('');
        setRating(5);
      }
      
      fetchReviewsAndStats();
      if (onReviewSubmitted) onReviewSubmitted();
    } catch (error: any) {
      showToast(error.response?.data?.message || 'Failed to delete review', 'error');
    }
  };

  if (!food) return null;

  const hasReviewed = reviews.some((r) => r.userId === user?.id);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-4xl bg-card border border-border/40 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left panel: Food Info */}
          <div className="w-full md:w-1/2 flex flex-col justify-between border-b md:border-b-0 md:border-r border-border/40">
            <div className="relative aspect-[4/3] w-full bg-muted overflow-hidden">
              <img
                src={food.imageUrl}
                alt={food.name}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).src = '/images/foods/placeholder-food.jpg'; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1.5">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase bg-orange-500 text-white border border-orange-500/10">
                  {food.category.name}
                </span>
                <h2 className="text-2xl font-extrabold font-outfit">{food.name}</h2>
                <div className="flex items-center space-x-2 text-sm text-yellow-400">
                  <Star className="w-4 h-4 fill-current" />
                  <span className="font-bold">{food.rating.toFixed(1)}</span>
                  <span className="text-white/60">({reviews.length} reviews)</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 flex-1 flex flex-col justify-between bg-card">
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Description</h3>
                <p className="text-sm text-foreground/80 leading-relaxed">{food.description}</p>
              </div>

              <div className="flex items-center justify-between border-t border-border/20 pt-4 mt-4">
                <div className="flex flex-col">
                  <span className="text-xs text-muted-foreground font-semibold">Price</span>
                  <span className="text-2xl font-black text-foreground font-outfit">₹{parseFloat(food.price).toFixed(2)}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className={`w-5.5 h-5.5 border-2 flex items-center justify-center rounded bg-black/10 shrink-0 ${food.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                    <div className={`w-2 h-2 rounded-full ${food.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                  </div>
                  <span className="text-xs font-bold text-muted-foreground">{food.isVeg ? 'VEGETARIAN' : 'NON-VEG'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right panel: Ratings breakdown & Reviews list */}
          <div className="w-full md:w-1/2 flex flex-col justify-between bg-card/50 max-h-[600px] md:max-h-none overflow-y-auto">
            {/* Header / Stats breakdown */}
            <div className="p-6 border-b border-border/40 space-y-4 bg-card">
              <h3 className="text-base font-bold font-outfit text-foreground">Customer Reviews</h3>
              
              {stats && stats.total > 0 ? (
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <h4 className="text-4xl font-extrabold text-foreground font-outfit">{stats.average}</h4>
                    <div className="flex justify-center my-1 text-yellow-400">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star key={s} className={`w-3.5 h-3.5 ${s <= Math.round(stats.average) ? 'fill-current' : ''}`} />
                      ))}
                    </div>
                    <span className="text-[10px] text-muted-foreground font-semibold uppercase">{stats.total} reviews</span>
                  </div>

                  {/* Progress Bars */}
                  <div className="flex-1 space-y-1">
                    {[5, 4, 3, 2, 1].map((starsNum) => {
                      const count = stats.breakdown[starsNum as 5 | 4 | 3 | 2 | 1] || 0;
                      const percentage = stats.total > 0 ? (count / stats.total) * 100 : 0;
                      return (
                        <div key={starsNum} className="flex items-center text-xs text-muted-foreground">
                          <span className="w-3 text-right mr-1">{starsNum}</span>
                          <Star className="w-3 h-3 text-yellow-500 fill-current mr-2" />
                          <div className="flex-1 h-1.5 bg-secondary/50 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full" style={{ width: `${percentage}%` }} />
                          </div>
                          <span className="w-6 text-right ml-2">{count}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-muted-foreground">No reviews yet. Be the first to share your thoughts!</p>
              )}
            </div>

            {/* Reviews List */}
            <div className="p-6 flex-1 space-y-4 overflow-y-auto min-h-[200px] max-h-[300px]">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                </div>
              ) : reviews.length === 0 ? (
                <div className="flex flex-col items-center justify-center text-center py-8 text-muted-foreground">
                  <span className="text-2xl">📝</span>
                  <p className="text-xs mt-1">No reviews yet for this product.</p>
                </div>
              ) : (
                reviews.map((rev) => {
                  const isMyReview = user?.id === rev.userId;
                  const isAdmin = user?.role === 'ADMIN';
                  return (
                    <div key={rev.id} className="p-4 rounded-xl bg-card border border-border/20 space-y-2 relative group">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-2.5">
                          {rev.user.profileImage ? (
                            <img src={rev.user.profileImage} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-border/20" />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-orange-500/10 text-orange-400 flex items-center justify-center border border-orange-500/20 text-xs font-bold uppercase shrink-0">
                              {(rev.user.firstName || rev.user.name).substring(0, 2)}
                            </div>
                          )}
                          <div>
                            <h5 className="text-xs font-bold text-foreground">{rev.user.name}</h5>
                            <div className="flex items-center space-x-1.5">
                              <div className="flex text-yellow-400">
                                {[...Array(5)].map((_, i) => (
                                  <Star key={i} className={`w-2.5 h-2.5 ${i < rev.rating ? 'fill-current' : ''}`} />
                                ))}
                              </div>
                              <span className="text-[10px] text-muted-foreground">• {new Date(rev.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        {/* Badges and Actions */}
                        <div className="flex items-center space-x-1">
                          <span className="bg-emerald-500/10 text-emerald-500 border border-emerald-500/10 text-[9px] px-1.5 py-0.5 rounded-md font-bold flex items-center gap-0.5 shrink-0">
                            <BadgeCheck className="w-3 h-3 fill-current" />
                            Verified
                          </span>

                          {/* Moderation */}
                          {(isMyReview || isAdmin) && (
                            <div className="flex space-x-0.5 shrink-0">
                              {isMyReview && (
                                <button
                                  onClick={() => {
                                    setEditingReviewId(rev.id);
                                    setRating(rev.rating);
                                    setComment(rev.comment);
                                  }}
                                  className="p-1 hover:bg-secondary rounded text-muted-foreground hover:text-foreground transition-all cursor-pointer"
                                  title="Edit review"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => handleReviewDelete(rev.id)}
                                className="p-1 hover:bg-red-500/10 rounded text-muted-foreground hover:text-red-500 transition-all cursor-pointer"
                                title={isAdmin ? "Delete review (Admin)" : "Delete review"}
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>

                      <p className="text-xs text-muted-foreground leading-relaxed pl-1">
                        {rev.comment}
                      </p>
                    </div>
                  );
                })
              )}
            </div>

            {/* Submission Form */}
            <div className="p-6 border-t border-border/40 bg-card">
              {isAuthenticated ? (
                <form onSubmit={handleReviewSubmit} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-foreground">
                      {editingReviewId ? 'Edit Your Review' : 'Write a Review'}
                    </span>
                    <div className="flex items-center space-x-1">
                      {[1, 2, 3, 4, 5].map((starIndex) => (
                        <button
                          key={starIndex}
                          type="button"
                          onMouseEnter={() => setHoverRating(starIndex)}
                          onMouseLeave={() => setHoverRating(null)}
                          onClick={() => setRating(starIndex)}
                          className="text-yellow-400 hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star
                            className={`w-5.5 h-5.5 ${(hoverRating !== null ? starIndex <= hoverRating : starIndex <= rating) ? 'fill-current' : ''}`}
                          />
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="relative">
                    <textarea
                      placeholder="Share your dining experience with this masterfully prepared dish..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      rows={2}
                      className="w-full bg-background border border-border/40 rounded-xl px-3 py-2 text-xs text-foreground focus:outline-none focus:border-orange-500 placeholder:text-muted-foreground/60 resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end space-x-2">
                    {editingReviewId && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingReviewId(null);
                          setComment('');
                          setRating(5);
                        }}
                        className="px-3 py-1.5 border border-border rounded-lg text-xs font-bold text-muted-foreground hover:bg-secondary/40 cursor-pointer"
                      >
                        Cancel Edit
                      </button>
                    )}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-4 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:brightness-110 text-white text-xs font-bold rounded-lg shadow-md disabled:opacity-50 flex items-center gap-1 cursor-pointer"
                    >
                      {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                      <span>{editingReviewId ? 'Update Review' : 'Submit Review'}</span>
                    </button>
                  </div>
                </form>
              ) : (
                <div className="text-center py-3 bg-secondary/20 border border-border/30 rounded-xl">
                  <p className="text-xs text-muted-foreground">
                    Please{' '}
                    <Link href="/login" className="text-orange-400 font-bold hover:underline">
                      login
                    </Link>{' '}
                    to leave a review for this dish.
                  </p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

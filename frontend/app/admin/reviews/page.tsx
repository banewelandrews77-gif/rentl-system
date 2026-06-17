'use client';

import { reviewsApi, ReviewResponse } from '@/lib/api';
import { RequireAuth } from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import { Star, Trash2, ShieldAlert, ArrowLeft, Search, AlertCircle, Building2, User } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'react-hot-toast';

function AdminReviewsContent() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchReviews = async () => {
    try {
      const data = await reviewsApi.getAllReviews();
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load reviews.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDeleteReview = async (id: string) => {
    if (!confirm('Are you sure you want to permanently delete this review?')) return;
    setDeletingId(id);
    try {
      await reviewsApi.deleteReview(id);
      toast.success('Review deleted successfully');
      setReviews(prev => prev.filter(r => r.id !== id));
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete review');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.hostelName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.customerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.comment?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 w-full">
      <div className="mb-6">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm font-semibold text-stone-500 hover:text-stone-900 transition-colors">
          <ArrowLeft className="h-4 w-4" /> Back to Dashboard
        </Link>
      </div>

      <header className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-stone-950 flex items-center gap-3">
            <ShieldAlert className="h-8 w-8 text-rose-600" />
            Moderate Reviews
          </h1>
          <p className="mt-2 text-stone-500">
            Monitor and moderate all reviews submitted across the platform.
          </p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-400" />
          <input
            type="text"
            placeholder="Search reviews..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full rounded-2xl border border-stone-200 bg-stone-50 pl-11 pr-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:border-stone-900 focus:ring-2 focus:ring-stone-900/10 focus:outline-none transition-all"
          />
        </div>
      </header>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1,2,3].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-stone-200 h-32"></div>
          ))}
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-50 p-6 border border-rose-100 flex items-center gap-4">
          <AlertCircle className="h-6 w-6 text-rose-600 flex-shrink-0" />
          <div className="text-sm font-medium text-rose-700">{error}</div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="text-center py-20 rounded-3xl border border-dashed border-stone-200 bg-white">
          <div className="h-16 w-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="h-8 w-8 text-stone-400" />
          </div>
          <h3 className="text-lg font-bold text-stone-900 mb-2">No reviews found</h3>
          <p className="text-stone-500 text-sm max-w-sm mx-auto">
            {searchQuery ? 'Try adjusting your search terms.' : 'No reviews have been submitted on the platform yet.'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map(review => (
            <div key={review.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 hover:shadow-md transition-shadow">
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex text-amber-400">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                      ))}
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-stone-600 bg-stone-100 px-2 py-0.5 rounded-md">
                      {['','Terrible','Poor','Average','Very Good','Excellent'][review.rating]}
                    </span>
                  </div>
                  {review.comment && (
                    <p className="text-stone-700 text-sm leading-relaxed mb-4 bg-stone-50 rounded-2xl p-4 border border-stone-100">
                      &ldquo;{review.comment}&rdquo;
                    </p>
                  )}
                  <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs font-semibold text-stone-500 mt-2">
                    <span className="flex items-center gap-1.5 bg-stone-100 px-2.5 py-1 rounded-full text-stone-700">
                      <User className="h-3.5 w-3.5 text-stone-400" />
                      {review.customerName}
                    </span>
                    <Link href={`/listings/${review.hostelId}`} className="flex items-center gap-1.5 hover:text-emerald-600 transition-colors">
                      <Building2 className="h-3.5 w-3.5 text-stone-400" />
                      {review.hostelName}
                    </Link>
                  </div>
                </div>
                
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-4 flex-shrink-0 self-end sm:self-stretch">
                  <span className="text-xs text-stone-400 font-bold uppercase tracking-wider">
                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </span>
                  
                  <button
                    onClick={() => handleDeleteReview(review.id)}
                    disabled={deletingId === review.id}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-50 hover:bg-rose-100 border border-rose-100 text-rose-600 hover:text-rose-700 px-4 py-2 text-xs font-bold transition-colors disabled:opacity-50"
                  >
                    <Trash2 className="h-4 w-4" />
                    {deletingId === review.id ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function AdminReviewsPage() {
  return (
    <RequireAuth role="ADMIN">
      <AdminReviewsContent />
    </RequireAuth>
  );
}

'use client';

import { reviewsApi, ReviewResponse } from '@/lib/api';
import { useEffect, useState } from 'react';
import { Star, MessageSquare, AlertCircle, Building2, User } from 'lucide-react';
import Link from 'next/link';

export default function AgentReviewsPage() {
  const [reviews, setReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const data = await reviewsApi.getAgentReviews();
        setReviews(data);
      } catch (err: any) {
        setError(err.message || 'Failed to load reviews.');
      } finally {
        setLoading(false);
      }
    };
    fetchReviews();
  }, []);

  // Compute average rating
  const averageRating = reviews.length > 0 
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const ratingCounts = [0, 0, 0, 0, 0];
  reviews.forEach(r => {
    if (r.rating >= 1 && r.rating <= 5) {
      ratingCounts[r.rating - 1]++;
    }
  });

  const getRatingPercentage = (stars: number) => {
    if (reviews.length === 0) return 0;
    return Math.round((ratingCounts[stars - 1] / reviews.length) * 100);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 w-full">
      <header className="mb-10">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-stone-950">Property Reviews</h1>
        <p className="mt-2 text-stone-500">
          See what students are saying about your accommodations and track your performance.
        </p>
      </header>

      {loading ? (
        <div className="space-y-6 animate-pulse">
          <div className="bg-white rounded-3xl border border-stone-200 h-48"></div>
          <div className="bg-white rounded-3xl border border-stone-200 h-32"></div>
        </div>
      ) : error ? (
        <div className="rounded-2xl bg-rose-50 p-6 border border-rose-100 flex items-center gap-4">
          <AlertCircle className="h-6 w-6 text-rose-600 flex-shrink-0" />
          <div className="text-sm font-medium text-rose-700">{error}</div>
        </div>
      ) : (
        <div className="space-y-8">
          {reviews.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-white p-6 md:p-8 rounded-3xl border border-stone-200 shadow-sm">
              <div className="flex flex-col items-center justify-center text-center p-4 md:border-r border-stone-100">
                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Average Rating</span>
                <span className="text-6xl font-black text-stone-950 tracking-tight">{averageRating}</span>
                <div className="flex text-amber-400 mt-3 mb-1">
                  {[1, 2, 3, 4, 5].map(s => (
                    <Star key={s} className={`h-5 w-5 ${s <= Math.round(Number(averageRating)) ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                  ))}
                </div>
                <span className="text-xs text-stone-500 font-medium">Based on {reviews.length} reviews</span>
              </div>

              <div className="col-span-2 flex flex-col justify-center gap-2 p-4">
                {[5, 4, 3, 2, 1].map(stars => {
                  const pct = getRatingPercentage(stars);
                  return (
                    <div key={stars} className="flex items-center gap-3 text-sm">
                      <span className="w-12 font-bold text-stone-600 flex items-center justify-end gap-1">
                        {stars} <Star className="h-3.5 w-3.5 fill-stone-600 text-stone-600" />
                      </span>
                      <div className="flex-1 h-2 bg-stone-100 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full transition-all duration-500" style={{ width: `${pct}%` }}></div>
                      </div>
                      <span className="w-12 font-semibold text-stone-500 text-right">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {reviews.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-stone-200 bg-white">
              <div className="h-16 w-16 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="h-8 w-8 text-stone-400" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">No reviews yet</h3>
              <p className="text-stone-500 text-sm max-w-sm mx-auto">Reviews from students will appear here after they confirm bookings or inquiries with your listings.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map(review => (
                <div key={review.id} className="bg-white rounded-3xl border border-stone-200 shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex text-amber-400">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                          ))}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
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
                    <span className="text-xs text-stone-400 font-bold uppercase tracking-wider flex-shrink-0 self-end sm:self-start">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

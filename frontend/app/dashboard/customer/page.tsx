'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/context/AuthContext';
import { customerInquiriesApi, InquiryResponse, reservationsApi, ReservationResponse, reviewsApi, ReviewResponse } from '@/lib/api';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { FileDown, Calendar, Hotel, Clock, ArrowRight, ShieldCheck, CalendarCheck, MessageSquare, AlertCircle, Building2, Star, X } from 'lucide-react';

function CustomerDashboardContent() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'reviews'>('overview');
  const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
  const [reservations, setReservations] = useState<ReservationResponse[]>([]);
  const [myReviews, setMyReviews] = useState<ReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState<string | null>(null);
  const [error, setError] = useState('');

  // Rate-your-stay modal state
  const [reviewPrompt, setReviewPrompt] = useState<{ hostelId: string; hostelName: string } | null>(null);
  const [promptRating, setPromptRating] = useState(5);
  const [promptHover, setPromptHover] = useState(0);
  const [promptComment, setPromptComment] = useState('');
  const [promptSubmitting, setPromptSubmitting] = useState(false);
  const [promptError, setPromptError] = useState('');
  const [promptSuccess, setPromptSuccess] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [inqData, resData, revData] = await Promise.all([
          customerInquiriesApi.getMyInquiries(),
          reservationsApi.getMyReservations(),
          reviewsApi.getMyReviews().catch(() => [] as ReviewResponse[]),
        ]);
        setInquiries(inqData);
        setReservations(resData);
        setMyReviews(revData);
      } catch (err: any) {
        setError(err.message || 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDownloadInvoice = async (id: string) => {
    setDownloading(id);
    try {
      await reservationsApi.downloadInvoice(id);
    } catch (err: any) {
      alert(err.message || 'Failed to download invoice');
    } finally {
      setDownloading(null);
    }
  };

  const handleSubmitPromptReview = async () => {
    if (!reviewPrompt) return;
    setPromptSubmitting(true);
    setPromptError('');
    try {
      const newReview = await reviewsApi.create({
        hostelId: reviewPrompt.hostelId,
        rating: promptRating,
        comment: promptComment || undefined,
      });
      setMyReviews(prev => [newReview, ...prev]);
      setPromptSuccess(true);
      setTimeout(() => {
        setReviewPrompt(null);
        setPromptSuccess(false);
        setPromptRating(5);
        setPromptComment('');
      }, 2000);
    } catch (err: any) {
      setPromptError(err.message || 'Failed to submit review.');
    } finally {
      setPromptSubmitting(false);
    }
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const visibleReservations = reservations.filter(r => r.status !== 'CANCELLED');
  const totalBookings = visibleReservations.length;
  const activeStays = visibleReservations.filter(r => r.status === 'CONFIRMED' || r.status === 'COMPLETED').length;
  const pendingInquiries = inquiries.filter(i => i.status === 'PENDING').length;
  const pendingPayments = visibleReservations.filter(r => r.status === 'PENDING_PAYMENT').length;

  // Reservations that are confirmed/completed but have no review yet
  const reviewedHostelIds = new Set(myReviews.map(r => r.hostelId));
  const unreviewedStays = visibleReservations.filter(
    r => (r.status === 'CONFIRMED' || r.status === 'COMPLETED') && !reviewedHostelIds.has(r.hostelId)
  );

  const ratingLabels = ['', 'Terrible', 'Poor', 'Average', 'Very Good', 'Excellent'];

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 w-full">
      <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight text-stone-950">Overview</h1>
          <p className="mt-2 text-stone-500">
            {getGreeting()}, {user?.fullName?.split(' ')[0] || 'Guest'}. Here is what&apos;s happening with your account today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/listings"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl bg-stone-950 px-8 py-4 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-stone-800 shadow-xl"
          >
            <span className="relative z-10 flex items-center gap-2">
              Find Hostels <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </span>
          </Link>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-1 mb-8 bg-stone-100 rounded-2xl p-1 w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'overview' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-2 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${activeTab === 'reviews' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-500 hover:text-stone-700'}`}
        >
          <Star className="h-4 w-4" /> My Reviews
          {myReviews.length > 0 && (
            <span className="bg-amber-100 text-amber-700 text-xs font-black px-2 py-0.5 rounded-full">{myReviews.length}</span>
          )}
        </button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-pulse">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-white rounded-3xl border border-stone-200 h-32"></div>
          ))}
        </div>
      ) : error ? (
        <div className="mb-8 rounded-2xl bg-rose-50 p-6 border border-rose-100 flex items-center gap-4">
          <AlertCircle className="h-6 w-6 text-rose-600 flex-shrink-0" />
          <div className="text-sm font-medium text-rose-700">{error}</div>
        </div>
      ) : activeTab === 'overview' ? (
        <>
          {/* Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                    <Hotel className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Bookings</span>
                </div>
                <h3 className="text-3xl font-black text-stone-950">{totalBookings}</h3>
                <p className="text-sm font-medium text-stone-500 mt-1">Total Reservations</p>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-0 group-hover:opacity-5 transition-opacity">
                <Hotel className="h-32 w-32" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Active</span>
                </div>
                <h3 className="text-3xl font-black text-stone-950">{activeStays}</h3>
                <p className="text-sm font-medium text-stone-500 mt-1">Confirmed Stays</p>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-0 group-hover:opacity-5 transition-opacity">
                <ShieldCheck className="h-32 w-32" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                    <CalendarCheck className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Action Required</span>
                </div>
                <h3 className="text-3xl font-black text-stone-950">{pendingPayments}</h3>
                <p className="text-sm font-medium text-stone-500 mt-1">Pending Payments</p>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-0 group-hover:opacity-5 transition-opacity">
                <CalendarCheck className="h-32 w-32" />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-stone-200 shadow-sm relative overflow-hidden group">
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="h-10 w-10 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                    <MessageSquare className="h-5 w-5" />
                  </div>
                  <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Inquiries</span>
                </div>
                <h3 className="text-3xl font-black text-stone-950">{pendingInquiries}</h3>
                <p className="text-sm font-medium text-stone-500 mt-1">Pending Inquiries</p>
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-0 group-hover:opacity-5 transition-opacity">
                <MessageSquare className="h-32 w-32" />
              </div>
            </div>
          </div>

          {/* Rate Your Stay Prompts */}
          {unreviewedStays.length > 0 && (
            <div className="mb-8">
              <h2 className="text-lg font-bold text-stone-900 mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500" /> Rate Your Stay
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {unreviewedStays.map(res => (
                  <div key={res.id} className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-200 rounded-2xl p-5 flex flex-col gap-3">
                    <div>
                      <h3 className="font-bold text-stone-900">{res.hostelName}</h3>
                      <p className="text-xs text-stone-500 mt-0.5">{res.roomTypeName}</p>
                    </div>
                    <div className="flex text-amber-400 text-lg">{'★'.repeat(5)}</div>
                    <button
                      onClick={() => setReviewPrompt({ hostelId: res.hostelId, hostelName: res.hostelName })}
                      className="w-full rounded-xl bg-amber-600 px-4 py-2 text-sm font-bold text-white hover:bg-amber-500 transition"
                    >
                      Write a Review
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Reservations Section */}
            <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <Hotel className="h-5 w-5 text-indigo-600" />
                  My Bookings
                </h3>
              </div>
              <div className="p-6 flex-1 bg-stone-50/30">
                {visibleReservations.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl border border-dashed border-stone-200 bg-white">
                    <div className="h-12 w-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Calendar className="h-5 w-5 text-stone-400" />
                    </div>
                    <p className="text-sm font-medium text-stone-500">You haven&apos;t made any reservations yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {visibleReservations.map((res) => (
                      <div key={res.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-indigo-200 transition-colors">
                        <div className="flex flex-col sm:flex-row justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <Link href={`/listings/${res.hostelId}`} className="text-lg font-bold text-stone-900 hover:text-indigo-600 transition-colors">
                                {res.hostelName}
                              </Link>
                              <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                                res.status === 'CONFIRMED' || res.status === 'COMPLETED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                res.status === 'CANCELLED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                                'bg-amber-50 text-amber-600 border-amber-100'
                              }`}>
                                {res.status.replace('_', ' ')}
                              </span>
                            </div>
                            <p className="text-sm font-medium text-stone-600 flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-stone-400" /> {res.roomTypeName}
                            </p>
                            <div className="mt-3 flex items-center gap-4 text-sm text-stone-500">
                              <span className="flex items-center gap-1.5 font-medium">
                                <Calendar className="h-4 w-4 text-stone-400" />
                                {new Date(res.startDate).toLocaleDateString()} - {new Date(res.endDate).toLocaleDateString()}
                              </span>
                              <span className="font-bold text-stone-900 bg-stone-100 px-2 py-1 rounded-md">
                                GHS {res.amountPaid.toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-row sm:flex-col items-center sm:items-end justify-end gap-2 border-t sm:border-t-0 sm:border-l border-stone-100 pt-4 sm:pt-0 sm:pl-4">
                            {(res.status === 'CONFIRMED' || res.status === 'COMPLETED') && (
                              <button
                                onClick={() => handleDownloadInvoice(res.id)}
                                disabled={downloading === res.id}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-stone-800 disabled:opacity-50 transition-colors"
                              >
                                {downloading === res.id ? (
                                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                ) : (
                                  <FileDown className="h-4 w-4" />
                                )}
                                Receipt
                              </button>
                            )}
                            {res.status === 'PENDING_PAYMENT' && (
                              <Link
                                href={`/checkout/${res.hostelId}?reservationId=${res.id}&roomTypeId=${res.roomTypeId}`}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-2.5 text-xs font-bold uppercase tracking-wider text-white shadow-sm hover:bg-amber-500 transition-colors"
                              >
                                Pay Now
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>

            {/* Inquiries Section */}
            <section className="bg-white rounded-3xl border border-stone-200 shadow-sm overflow-hidden flex flex-col">
              <div className="p-6 border-b border-stone-100 flex items-center justify-between">
                <h3 className="text-lg font-bold text-stone-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-rose-600" />
                  Recent Inquiries
                </h3>
              </div>
              <div className="p-6 flex-1 bg-stone-50/30">
                {inquiries.length === 0 ? (
                  <div className="text-center py-12 rounded-2xl border border-dashed border-stone-200 bg-white">
                    <div className="h-12 w-12 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-3">
                      <Clock className="h-5 w-5 text-stone-400" />
                    </div>
                    <p className="text-sm font-medium text-stone-500">You haven&apos;t contacted any agents yet.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {inquiries.map((inquiry) => (
                      <div key={inquiry.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:border-rose-200 transition-colors">
                        <div className="flex justify-between items-start gap-4">
                          <div className="flex-1 min-w-0">
                            <h4 className="text-base font-bold text-stone-900 mb-1">
                              <Link href={`/listings/${inquiry.hostelId}`} className="hover:text-rose-600 transition-colors">
                                {inquiry.hostelName}
                              </Link>
                            </h4>
                            {inquiry.roomTypeName && (
                              <p className="text-xs font-medium text-stone-500 mb-2 flex items-center gap-1.5">
                                <Building2 className="h-3.5 w-3.5" /> Interest: {inquiry.roomTypeName}
                              </p>
                            )}
                            <p className="text-sm text-stone-600 bg-stone-50 p-3 rounded-xl border border-stone-100 mt-2">
                              <span className="italic text-stone-500">&quot;</span>
                              {inquiry.message}
                              <span className="italic text-stone-500">&quot;</span>
                            </p>
                          </div>
                          <div className="flex flex-col items-end gap-2 flex-shrink-0">
                            <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-widest rounded-lg border ${
                              inquiry.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                              inquiry.status === 'REJECTED' ? 'bg-rose-50 text-rose-600 border-rose-100' :
                              'bg-amber-50 text-amber-600 border-amber-100'
                            }`}>
                              {inquiry.status}
                            </span>
                            <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
                              {new Date(inquiry.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>
        </>
      ) : (
        /* My Reviews Tab */
        <div>
          {myReviews.length === 0 ? (
            <div className="text-center py-20 rounded-3xl border border-dashed border-stone-200 bg-white">
              <div className="h-16 w-16 bg-amber-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-amber-400" />
              </div>
              <h3 className="text-lg font-bold text-stone-900 mb-2">No reviews yet</h3>
              <p className="text-stone-500 text-sm max-w-sm mx-auto">After booking or contacting a hostel, you&apos;ll be able to leave a review. Your reviews help other students choose the right accommodation.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {myReviews.map(review => (
                <div key={review.id} className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <Link href={`/listings/${review.hostelId}`} className="text-lg font-bold text-stone-900 hover:text-amber-600 transition-colors">
                        {review.hostelName}
                      </Link>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex text-amber-400">
                          {[1,2,3,4,5].map(s => (
                            <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                          ))}
                        </div>
                        <span className="text-sm font-semibold text-amber-600">{['','Terrible','Poor','Average','Very Good','Excellent'][review.rating]}</span>
                      </div>
                      {review.comment && (
                        <p className="mt-3 text-stone-600 text-sm leading-relaxed bg-stone-50 rounded-xl px-4 py-3 border border-stone-100">
                          &ldquo;{review.comment}&rdquo;
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-stone-400 font-medium flex-shrink-0">
                      {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Rate Your Stay Popup Modal */}
      {reviewPrompt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl relative overflow-hidden">
            <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-6 pt-8 pb-10 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 mb-3">
                <Star className="h-8 w-8 text-white fill-white" />
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight">Rate Your Stay</h2>
              <p className="text-amber-100 text-sm mt-1">Share your experience at <strong className="text-white">{reviewPrompt.hostelName}</strong></p>
              <button onClick={() => setReviewPrompt(null)} className="absolute right-4 top-4 text-white/70 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-6 pb-6 -mt-4">
              <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
                {promptSuccess ? (
                  <div className="py-6 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 mb-4">
                      <ShieldCheck className="h-7 w-7 text-emerald-600" />
                    </div>
                    <h3 className="text-lg font-bold text-stone-900 mb-1">Thank you! 🎉</h3>
                    <p className="text-stone-500 text-sm">Your review has been submitted.</p>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="text-center pt-2">
                      <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Tap to rate</p>
                      <div className="flex items-center justify-center gap-2">
                        {[1,2,3,4,5].map(star => (
                          <button key={star} type="button"
                            onClick={() => setPromptRating(star)}
                            onMouseEnter={() => setPromptHover(star)}
                            onMouseLeave={() => setPromptHover(0)}
                            className="focus:outline-none transition-transform hover:scale-125"
                          >
                            <Star className={`h-10 w-10 transition-colors ${(promptHover || promptRating) >= star ? 'fill-amber-400 text-amber-400' : 'text-stone-200'}`} />
                          </button>
                        ))}
                      </div>
                      {(promptHover || promptRating) > 0 && (
                        <p className="text-sm font-semibold text-amber-600 mt-2">{ratingLabels[promptHover || promptRating]}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-stone-700 mb-1.5">Share your experience <span className="text-stone-400 font-normal">(optional)</span></label>
                      <textarea rows={3} value={promptComment} onChange={e => setPromptComment(e.target.value)}
                        placeholder="What did you love about this hostel?"
                        className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none resize-none"
                      />
                    </div>
                    {promptError && <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">{promptError}</div>}
                    <div className="flex gap-3 pt-1">
                      <button onClick={() => setReviewPrompt(null)} className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50">Skip for now</button>
                      <button onClick={handleSubmitPromptReview} disabled={promptSubmitting}
                        className="flex-1 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-500 disabled:opacity-50">
                        {promptSubmitting ? 'Submitting...' : 'Submit Review'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function CustomerDashboardPage() {
  return (
    <RequireAuth role="CUSTOMER">
      <CustomerDashboardContent />
    </RequireAuth>
  );
}

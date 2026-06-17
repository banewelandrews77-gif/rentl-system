"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ShieldCheck, XCircle, ChevronLeft, Star, X } from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { reservationsApi, reviewsApi } from "../../../lib/api";

function PaymentCallbackContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, ready } = useAuth();

    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [reservationDetails, setReservationDetails] = useState<{ hostelId: string; hostelName: string } | null>(null);

    // Review modal state
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewSubmitted, setReviewSubmitted] = useState(false);
    const [reviewError, setReviewError] = useState("");

    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');

    useEffect(() => {
        if (!ready) return;
        if (!user) {
            router.push('/login');
            return;
        }

        if (!reference) {
            setLoading(false);
            return;
        }

        const verify = async () => {
            try {
                const result = await reservationsApi.verifyPayment(reference);
                setSuccess(true);
                // Fetch reservation details to get hostelId
                try {
                    const reservations = await reservationsApi.getMyReservations();
                    const latest = reservations.find(r => r.paymentReference === reference) || reservations[reservations.length - 1];
                    if (latest) {
                        setReservationDetails({ hostelId: latest.hostelId, hostelName: latest.hostelName });
                    }
                } catch {/* silent */}
                // Auto-show the review modal after a short delay
                setTimeout(() => setShowReviewModal(true), 1800);
            } catch (err) {
                console.error("Verification failed", err);
                setSuccess(false);
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [reference, ready, user, router]);

    const handleSubmitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!reservationDetails) return;
        setIsSubmittingReview(true);
        setReviewError("");
        try {
            await reviewsApi.create({
                hostelId: reservationDetails.hostelId,
                rating: reviewRating,
                comment: reviewComment || undefined,
            });
            setReviewSubmitted(true);
            setTimeout(() => setShowReviewModal(false), 2000);
        } catch (err: any) {
            setReviewError(err.message || "Failed to submit review.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    if (loading) {
        return (
            <div className="mx-auto flex h-[70vh] items-center justify-center">
                <div className="text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent mb-4" />
                    <p className="text-stone-600 font-medium">Verifying your payment...</p>
                </div>
            </div>
        );
    }

    if (!success) {
        return (
            <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 mt-12">
                <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-red-200 text-center">
                    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-6">
                        <XCircle className="h-8 w-8 text-red-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-stone-900 mb-4">Payment Failed or Cancelled</h1>
                    <p className="text-lg text-stone-600 mb-8">
                        We could not verify your payment. If you cancelled the transaction, you can try again from your dashboard.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/customer')}
                        className="rounded-xl inline-flex items-center justify-center bg-stone-900 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-stone-800"
                    >
                        Go to My Dashboard
                    </button>
                </div>
            </div>
        );
    }

    const ratingLabels = ['', 'Terrible', 'Poor', 'Average', 'Very Good', 'Excellent'];

    return (
        <>
        <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 lg:px-8 mt-12">
            <div className="rounded-2xl bg-white p-8 shadow-sm ring-1 ring-stone-200 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 mb-6 tracking-tight">
                    <ShieldCheck className="h-8 w-8 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold text-stone-900 mb-4">Payment Successful!</h1>
                <p className="text-lg text-stone-600 mb-8">
                    Your payment was received via Paystack. Your reservation is now complete!
                </p>

                <div className="max-w-md mx-auto bg-stone-50 rounded-xl p-6 text-left mb-8 border border-stone-200">
                    <div className="text-sm text-stone-500 mb-1">Transaction Reference</div>
                    <div className="font-mono font-medium text-stone-900 mb-4 break-all">{reference}</div>

                    <p className="text-sm text-stone-500">
                        A receipt has been sent to your email by Paystack.
                    </p>
                </div>

                <div className="flex flex-col gap-3 justify-center items-center">
                    <button
                        onClick={() => router.push('/dashboard/customer')}
                        className="w-full max-w-xs rounded-xl bg-amber-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-500"
                    >
                        View My Reservations
                    </button>
                    <button
                        onClick={() => router.push('/')}
                        className="w-full max-w-xs inline-flex items-center justify-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900"
                    >
                        <ChevronLeft className="h-4 w-4" /> Return Home
                    </button>
                </div>
            </div>
        </div>

        {/* Auto Review Modal */}
        {showReviewModal && reservationDetails && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in duration-300">
                <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl relative overflow-hidden">
                    {/* Decorative header */}
                    <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-6 pt-8 pb-10 text-center">
                        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm mb-3">
                            <Star className="h-8 w-8 text-white fill-white" />
                        </div>
                        <h2 className="text-2xl font-black text-white tracking-tight">How was your stay?</h2>
                        <p className="text-amber-100 text-sm mt-1">
                            You just booked <strong className="text-white">{reservationDetails.hostelName}</strong>
                        </p>
                        <button
                            onClick={() => setShowReviewModal(false)}
                            className="absolute right-4 top-4 text-white/70 hover:text-white transition-colors"
                        >
                            <X className="h-5 w-5" />
                        </button>
                    </div>

                    <div className="px-6 pb-6 -mt-4">
                        <div className="bg-white rounded-2xl shadow-sm border border-stone-100 p-4">
                            {reviewSubmitted ? (
                                <div className="py-6 text-center">
                                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 mb-4">
                                        <ShieldCheck className="h-7 w-7 text-emerald-600" />
                                    </div>
                                    <h3 className="text-lg font-bold text-stone-900 mb-1">Thank you! 🎉</h3>
                                    <p className="text-stone-500 text-sm">Your review has been submitted.</p>
                                </div>
                            ) : (
                                <form onSubmit={handleSubmitReview} className="space-y-5">
                                    <div className="text-center pt-2">
                                        <p className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">Tap to rate</p>
                                        <div className="flex items-center justify-center gap-2">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <button
                                                    key={star}
                                                    type="button"
                                                    onClick={() => setReviewRating(star)}
                                                    onMouseEnter={() => setHoverRating(star)}
                                                    onMouseLeave={() => setHoverRating(0)}
                                                    disabled={isSubmittingReview}
                                                    className="focus:outline-none transition-transform hover:scale-125 active:scale-110 disabled:opacity-50"
                                                    aria-label={`Rate ${star} star${star > 1 ? 's' : ''}`}
                                                >
                                                    <Star
                                                        className={`h-10 w-10 transition-colors ${
                                                            (hoverRating || reviewRating) >= star
                                                                ? 'fill-amber-400 text-amber-400'
                                                                : 'text-stone-200'
                                                        }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                        {(hoverRating || reviewRating) > 0 && (
                                            <p className="text-sm font-semibold text-amber-600 mt-2">
                                                {ratingLabels[hoverRating || reviewRating]}
                                            </p>
                                        )}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-stone-700 mb-1.5">Share your experience <span className="text-stone-400 font-normal">(optional)</span></label>
                                        <textarea
                                            rows={3}
                                            value={reviewComment}
                                            onChange={(e) => setReviewComment(e.target.value)}
                                            disabled={isSubmittingReview}
                                            placeholder="What did you love about this hostel?"
                                            className="w-full rounded-xl border border-stone-200 bg-stone-50 px-4 py-3 text-sm text-stone-900 placeholder-stone-400 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 focus:outline-none transition disabled:opacity-50 resize-none"
                                        />
                                    </div>

                                    {reviewError && (
                                        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-100">
                                            {reviewError}
                                        </div>
                                    )}

                                    <div className="flex gap-3 pt-1">
                                        <button
                                            type="button"
                                            onClick={() => setShowReviewModal(false)}
                                            className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition"
                                        >
                                            Skip for now
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmittingReview || reviewRating === 0}
                                            className="flex-1 rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-500 disabled:opacity-50 transition"
                                        >
                                            {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )}
        </>
    );
}

export default function PaymentCallbackPage() {
    return (
        <Suspense fallback={<div className="mx-auto flex h-[70vh] items-center justify-center"><div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent mb-4" /></div>}>
            <PaymentCallbackContent />
        </Suspense>
    );
}

"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { MapPin, Bed, ChevronLeft, Phone, ShieldCheck, X } from "lucide-react";
import { HostelSummary } from "../../components/HostelCard";
import Map from "../../components/Map";
import { useAuth } from "../../../context/AuthContext";
import { customerInquiriesApi, reviewsApi, ReviewResponse, API_BASE, getImageUrl } from "../../../lib/api";
import { Star, StarHalf } from "lucide-react";
import Link from 'next/link';

export default function HostelDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const [hostel, setHostel] = useState<HostelSummary | null>(null);
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeImageIndex, setActiveImageIndex] = useState(0);

    const { user, role, ready } = useAuth();

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRoomTypeId, setSelectedRoomTypeId] = useState<string>("");
    const [message, setMessage] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState("");
    const [submitSuccess, setSubmitSuccess] = useState(false);

    // Review Modal State
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
    const [reviewRating, setReviewRating] = useState(5);
    const [hoverRating, setHoverRating] = useState(0);
    const [reviewComment, setReviewComment] = useState("");
    const [isSubmittingReview, setIsSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState("");
    const [reviewSubmitted, setReviewSubmitted] = useState(false);

    const handleActionClick = (actionType: 'CONTACT' | 'RESERVE', roomTypeId?: string) => {
        if (!ready) return;
        if (!user) {
            router.push(`/login?redirect=/listings/${id}`);
            return;
        }

        if (actionType === 'RESERVE' && roomTypeId) {
            router.push(`/checkout/${id}?roomTypeId=${roomTypeId}`);
        } else {
            setSelectedRoomTypeId(roomTypeId || "");
            setIsModalOpen(true);
        }
    };

    const submitInquiry = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitError("");
        try {
            await customerInquiriesApi.submit({
                hostelId: id,
                roomTypeId: selectedRoomTypeId || undefined,
                message
            });
            setSubmitSuccess(true);
            // Auto-open the review modal after showing success for 2 seconds
            setTimeout(() => {
                setIsModalOpen(false);
                setSubmitSuccess(false);
                setIsReviewModalOpen(true);
            }, 2000);
        } catch (err: any) {
            setSubmitError(err.message || "Failed to submit inquiry");
        } finally {
            setIsSubmitting(false);
        }
    };

    const submitReview = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmittingReview(true);
        setReviewError("");
        try {
            const newReview = await reviewsApi.create({
                hostelId: id,
                rating: reviewRating,
                comment: reviewComment
            });
            setReviews([newReview, ...reviews]);
            setReviewSubmitted(true);
            setTimeout(() => {
                setIsReviewModalOpen(false);
                setReviewRating(5);
                setReviewComment("");
                setReviewSubmitted(false);
            }, 2000);
        } catch (err: any) {
            setReviewError(err.message || "Failed to submit review. Make sure you have an approved inquiry or reservation for this hostel.");
        } finally {
            setIsSubmittingReview(false);
        }
    };

    useEffect(() => {
        if (!id) return;

        const fetchHostel = async () => {
            try {
                const res = await fetch(`${API_BASE}/public/hostels/${id}`);
                if (!res.ok) {
                    if (res.status === 404) throw new Error("Hostel not found");
                    throw new Error("Failed to load hostel details");
                }
                const data = await res.json();
                setHostel(data);

                // Find primary image index to set as active initially
                const primaryIdx = data.images.findIndex((img: any) => img.isPrimary); // eslint-disable-line @typescript-eslint/no-explicit-any
                if (primaryIdx !== -1) {
                    setActiveImageIndex(primaryIdx);
                }

                // Fetch reviews
                const reviewsData = await reviewsApi.getByHostel(id);
                setReviews(reviewsData);

            } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                setError(err.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchHostel();
    }, [id]);

    if (loading) {
        return (
            <div className="mx-auto flex h-[50vh] max-w-7xl items-center justify-center px-4">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            </div>
        );
    }

    if (error || !hostel) {
        return (
            <div className="mx-auto max-w-3xl px-4 py-16 text-center">
                <h2 className="text-2xl font-bold text-stone-900">Oops!</h2>
                <p className="mt-2 text-stone-600">{error || "Hostel not found"}</p>
                <button
                    onClick={() => router.back()}
                    className="mt-6 inline-flex items-center gap-2 text-amber-700 hover:text-amber-800 font-medium"
                >
                    <ChevronLeft className="h-4 w-4" /> Go back to listings
                </button>
            </div>
        );
    }

    // Use fallback images if none provided
    const images = hostel.images.length > 0
        ? hostel.images.map(img => getImageUrl(img.imageUrl))
        : ["https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop"];

    // Helper for rendering star rating
    const renderStars = (rating: number) => {
        const fullStars = Math.floor(rating);
        const hasHalf = rating % 1 >= 0.5;
        const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0);

        return (
            <div className="flex items-center text-amber-500">
                {[...Array(fullStars)].map((_, i) => <Star key={`full-${i}`} className="h-4 w-4 fill-current" />)}
                {hasHalf && <StarHalf className="h-4 w-4 fill-current" />}
                {[...Array(emptyStars)].map((_, i) => <Star key={`empty-${i}`} className="h-4 w-4 text-stone-300" />)}
            </div>
        );
    };

    return (
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Back button */}
            <button
                onClick={() => router.back()}
                className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-stone-500 hover:text-stone-900 transition-colors"
            >
                <ChevronLeft className="h-4 w-4" /> Back
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                {/* Main Content Column */}
                <div className="lg:col-span-2 space-y-8">

                    {/* Header */}
                    <div>
                        <h1 className="text-3xl font-bold text-stone-900 sm:text-4xl">
                            {hostel.name}
                        </h1>
          <Link href={`/hostels/${hostel.id}/rooms`} className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-6 py-3 text-lg font-bold text-white hover:bg-stone-800 transition-colors mt-2">
            View Rooms
          </Link>
                        <div className="mt-3 flex items-center gap-4 text-stone-600">
                            <div className="flex items-center gap-1.5">
                                <MapPin className="h-5 w-5 text-stone-400" />
                                <span>{hostel.location}</span>
                            </div>
                            {hostel.averageRating !== null && (
                                <div className="flex items-center gap-1.5">
                                    {renderStars(hostel.averageRating)}
                                    <span className="font-medium text-stone-900">{hostel.averageRating}</span>
                                    <span className="text-sm">({hostel.reviewCount} {hostel.reviewCount === 1 ? 'review' : 'reviews'})</span>
                                </div>
                            )}
                            <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-sm font-medium">
                                <ShieldCheck className="h-4 w-4" />
                                <span>Verified Agent</span>
                            </div>
                        </div>
                    </div>

                    {/* Image Gallery */}
                    <div className="space-y-4">
                        <div className="relative aspect-[16/9] w-full overflow-hidden rounded-2xl bg-stone-100">
                            <Image
                                src={images[activeImageIndex]}
                                alt={`${hostel.name} full view`}
                                fill
                                unoptimized={true}
                                className="object-cover"
                                priority
                            />
                        </div>

                        {images.length > 1 && (
                            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-none">
                                {images.map((src, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setActiveImageIndex(index)}
                                        className={`relative h-20 w-32 shrink-0 overflow-hidden rounded-xl bg-stone-100 transition-all ${activeImageIndex === index
                                            ? "ring-2 ring-amber-500 ring-offset-2"
                                            : "hover:opacity-80"
                                            }`}
                                    >
                                        <Image
                                            src={src}
                                            alt={`Thumbnail ${index + 1}`}
                                            fill
                                            unoptimized={true}
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Description */}
                    <div>
                        <h2 className="text-xl font-bold text-stone-900 mb-4">About this hostel</h2>
                        <div className="prose prose-stone max-w-none">
                            <p className="whitespace-pre-line text-stone-600 leading-relaxed">
                                {hostel.description}
                            </p>
                        </div>
                    </div>

                    {/* Room Types */}
                    <div>
                        <h2 className="text-xl font-bold text-stone-900 mb-4">Available Rooms</h2>
                        {hostel.roomTypes.length === 0 ? (
                            <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center text-stone-500">
                                No room information available yet.
                            </div>
                        ) : (
                            <div className="grid gap-4 sm:grid-cols-2">
                                {hostel.roomTypes.map((room) => (
                                    <div
                                        key={room.id}
                                        className="flex flex-col rounded-xl border border-stone-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
                                    >
                                        <div className="flex items-start justify-between gap-4 mb-4">
                                            <div>
                                                <h3 className="font-semibold text-lg text-stone-900">{room.name}</h3>
                                                <p className="text-sm text-stone-500 mt-1">Capacity: {room.capacity} students</p>
                                            </div>
                                            <div className="text-right">
                                                <span className="block font-bold text-lg text-stone-900">
                                                    GH₵ {room.pricePerYear.toLocaleString()}
                                                </span>
                                                <span className="text-xs text-stone-500">per academic year</span>
                                            </div>
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-stone-100 flex items-center justify-between">
                                            <div className="flex items-center gap-2 text-sm">
                                                <Bed className="h-4 w-4 text-stone-400" />
                                                <span className={room.availableCount > 0 ? "text-emerald-600 font-medium" : "text-red-600 font-medium"}>
                                                    {room.availableCount} / {room.totalAvailable} left
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-stone-400 uppercase tracking-wider font-semibold mr-2">
                                                    {room.capacity === 1 ? 'Single' : room.capacity === 2 ? 'Double' : room.capacity === 3 ? 'Triple' : `${room.capacity}-in-1`}
                                                </span>
                                                <button
                                                    onClick={() => handleActionClick('RESERVE', room.id)}
                                                    disabled={room.availableCount === 0 || hostel.status !== 'PUBLISHED' || role === 'AGENT'}
                                                    className="rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-stone-800 disabled:bg-stone-300 transition-colors"
                                                >
                                                    {role === 'AGENT' ? 'Customer Only' : (room.availableCount > 0 ? 'Reserve Room' : 'Sold Out')}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Reviews Section */}
                    {hostel.status === 'PUBLISHED' && (
                        <div className="pt-8 border-t border-stone-200">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-xl font-bold text-stone-900">Student Reviews</h2>
                                {role === 'CUSTOMER' && (
                                    <button
                                        onClick={() => setIsReviewModalOpen(true)}
                                        className="text-sm font-medium text-amber-700 hover:text-amber-800"
                                    >
                                        Write a Review
                                    </button>
                                )}
                            </div>
                            {reviews.length === 0 ? (
                                <div className="rounded-xl border border-stone-200 bg-stone-50 p-6 text-center text-stone-500">
                                    No reviews yet. Be the first to share your experience!
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {reviews.map((review) => (
                                        <div key={review.id} className="pb-6 border-b border-stone-100 last:border-0 last:pb-0">
                                            <div className="flex items-center justify-between mb-2">
                                                <div className="font-semibold text-stone-900">{review.customerName}</div>
                                                <div className="text-sm text-stone-500">
                                                    {new Date(review.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                                                </div>
                                            </div>
                                            {renderStars(review.rating)}
                                            {review.comment && (
                                                <p className="mt-3 text-stone-600 text-sm leading-relaxed">{review.comment}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Sidebar / CTA */}
                <div className="lg:col-span-1">
                    <div className="sticky top-8 space-y-6">

                        {/* CTA Card */}
                        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-stone-900 mb-2">Need more info?</h3>

                            {role === 'AGENT' ? (
                                <p className="text-sm text-stone-600 mb-6">
                                    You are viewing this listing as an <strong>Agent</strong>. Customers can contact you or reserve rooms directly through these listings.
                                </p>
                            ) : (
                                <>
                                    <p className="text-sm text-stone-600 mb-6">
                                        Contact the agent to schedule a viewing or ask specific questions before reserving.
                                    </p>

                                    <button
                                        onClick={() => handleActionClick('CONTACT')}
                                        className="w-full flex items-center justify-center gap-2 rounded-xl bg-amber-600 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-600 transition-colors"
                                    >
                                        <Phone className="h-4 w-4" />
                                        Contact Agent
                                    </button>

                                    <p className="mt-4 text-xs text-center text-stone-500">
                                        You can reserve rooms directly from the Available Rooms section.
                                    </p>
                                </>
                            )}
                        </div>

                        {/* Map Card */}
                        {hostel.gpsCoordinates && (
                            <div className="rounded-2xl border border-stone-200 bg-white p-1 overflow-hidden shadow-sm h-[300px]">
                                <Map
                                    hostels={[hostel]}
                                    center={
                                        hostel.gpsCoordinates.split(',').length === 2
                                            ? [parseFloat(hostel.gpsCoordinates.split(',')[0]), parseFloat(hostel.gpsCoordinates.split(',')[1])]
                                            : [5.6037, -0.1870]
                                    }
                                    zoom={15}
                                />
                            </div>
                        )}

                    </div>
                </div>
            </div>

            {/* Contact Agent Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl relative">
                        <button
                            onClick={() => { setIsModalOpen(false); setSubmitSuccess(false); }}
                            className="absolute right-4 top-4 text-stone-400 hover:text-stone-600"
                        >
                            <X className="h-5 w-5" />
                        </button>

                        <h2 className="text-xl font-bold text-stone-900 mb-4">Contact Agent</h2>

                        {submitSuccess ? (
                            <div className="text-center py-6">
                                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 mb-4">
                                    <ShieldCheck className="h-6 w-6 text-emerald-600" />
                                </div>
                                <h3 className="text-lg font-medium text-stone-900 mb-2">Inquiry Sent!</h3>
                                <p className="text-stone-600 mb-6">The agent has been notified and will review your request. Check your dashboard for updates.</p>
                                <button
                                    onClick={() => { setIsModalOpen(false); setSubmitSuccess(false); router.push('/dashboard/customer'); }}
                                    className="w-full rounded-xl bg-stone-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800"
                                >
                                    Go to Dashboard
                                </button>
                            </div>
                        ) : (
                            <form onSubmit={submitInquiry} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-stone-900 mb-1">Room Type Interest (Optional)</label>
                                    <select
                                        value={selectedRoomTypeId}
                                        onChange={(e) => setSelectedRoomTypeId(e.target.value)}
                                        className="w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2 px-3 border"
                                    >
                                        <option value="">General Inquiry / Not Sure</option>
                                        {hostel.roomTypes.map(rt => (
                                            <option key={rt.id} value={rt.id}>{rt.name} - GH₵ {rt.pricePerYear}/yr</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-stone-900 mb-1">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        required
                                        rows={4}
                                        value={message}
                                        onChange={(e) => setMessage(e.target.value)}
                                        placeholder="Hi, I'm interested in..."
                                        className="w-full rounded-lg border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm py-2 px-3 border"
                                    />
                                </div>

                                {submitError && <div className="text-sm font-medium text-red-600">{submitError}</div>}

                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full rounded-xl bg-amber-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-amber-500 disabled:bg-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-600"
                                >
                                    {isSubmitting ? "Sending..." : "Send Inquiry"}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Write Review Modal */}
            {isReviewModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
                    <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl relative overflow-hidden">
                        {/* Decorative amber header */}
                        <div className="bg-gradient-to-br from-amber-500 to-amber-600 px-6 pt-8 pb-10 text-center">
                            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm mb-3">
                                <Star className="h-8 w-8 text-white fill-white" />
                            </div>
                            <h2 className="text-2xl font-black text-white tracking-tight">How was your experience?</h2>
                            <p className="text-amber-100 text-sm mt-1">
                                {hostel ? `Share your thoughts on ${hostel.name}` : 'Share your experience to help other students.'}
                            </p>
                            <button
                                onClick={() => setIsReviewModalOpen(false)}
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
                                    <form onSubmit={submitReview} className="space-y-5">
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
                                                        aria-label={`Rate ${star} stars`}
                                                    >
                                                        <Star className={`h-10 w-10 transition-colors ${
                                                            (hoverRating || reviewRating) >= star
                                                                ? 'fill-amber-400 text-amber-400'
                                                                : 'text-stone-200'
                                                        }`} />
                                                    </button>
                                                ))}
                                            </div>
                                            {(hoverRating || reviewRating) > 0 && (
                                                <p className="text-sm font-semibold text-amber-600 mt-2">
                                                    {['', 'Terrible', 'Poor', 'Average', 'Very Good', 'Excellent'][hoverRating || reviewRating]}
                                                </p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-stone-700 mb-1.5">Share your experience <span className="text-stone-400 font-normal">(optional)</span></label>
                                            <textarea
                                                id="reviewComment"
                                                name="reviewComment"
                                                rows={3}
                                                value={reviewComment}
                                                onChange={(e) => setReviewComment(e.target.value)}
                                                disabled={isSubmittingReview}
                                                placeholder="What did you love or dislike?"
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
                                                onClick={() => setIsReviewModalOpen(false)}
                                                className="flex-1 rounded-xl border border-stone-200 px-4 py-2.5 text-sm font-medium text-stone-600 hover:bg-stone-50 transition"
                                            >
                                                Skip for now
                                            </button>
                                            <button
                                                type="submit"
                                                disabled={isSubmittingReview}
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
        </div>
    );
}

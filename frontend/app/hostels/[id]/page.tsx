'use client';

import { publicHostelsApi, reviewsApi, Hostel, ReviewResponse, getImageUrl } from '@/lib/api';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Image as ImageIcon, Star, MapPin as MapPinIcon, Phone, MessageSquare, ChevronRight } from 'lucide-react';

export default function HostelDetailsPage() {
    const { id } = useParams() as { id: string };
    const { user, role } = useAuth() || {};
    const isAuthenticated = !!user;
    const [hostel, setHostel] = useState<Hostel | null>(null);
    const [reviews, setReviews] = useState<ReviewResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    // Review form state
    const [newRating, setNewRating] = useState<number>(5);
    const [newComment, setNewComment] = useState('');
    const [submittingReview, setSubmittingReview] = useState(false);
    const [reviewError, setReviewError] = useState('');

    useEffect(() => {
        const loadHostel = async () => {
            try {
                const [hostelData, reviewsData] = await Promise.all([
                    publicHostelsApi.getHostel(id),
                    reviewsApi.getByHostel(id).catch(() => []) 
                ]);
                setHostel(hostelData);
                setReviews(reviewsData);
            } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                setError(err.message || 'Failed to load hostel details');
            } finally {
                setLoading(false);
            }
        };
        loadHostel();
    }, [id]);

    if (loading) return <div className="min-h-screen flex items-center justify-center text-stone-500">Loading hostel details...</div>;
    if (error || !hostel) return <div className="min-h-screen flex items-center justify-center text-red-600">{error || 'Hostel not found'}</div>;

    const primaryImage = hostel.images.find(img => img.isPrimary) || hostel.images[0];
    const galleryImages = hostel.images.filter(img => img !== primaryImage);

    return (
        <div className="bg-white">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold tracking-tight text-stone-900 sm:text-4xl">{hostel.name}</h1>
            <Link href={`/hostels/${hostel.id}/rooms`} className="inline-flex items-center gap-2 rounded-md bg-stone-900 px-4 py-2 text-sm font-bold text-white hover:bg-stone-800 transition-colors mt-2">
              View Rooms
            </Link>
                    <div className="mt-2 flex items-center gap-2 text-stone-500">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        <span className="text-base">{hostel.location}</span>
                    </div>
                </div>

                {/* Image Gallery */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:gap-6 lg:gap-8 mb-12">
                    {primaryImage && (
                        <div className={`aspect-[4/3] sm:aspect-[3/2] relative overflow-hidden rounded-2xl bg-stone-100 ${galleryImages.length > 0 ? 'sm:col-span-2' : 'sm:col-span-3'}`}>
                            <Image
                                src={getImageUrl(primaryImage.imageUrl)}
                                alt="Primary"
                                fill
                                className="object-cover"
                                sizes="(min-width: 1024px) 66vw, 100vw"
                            />
                        </div>
                    )}
                    {galleryImages.length > 0 && (
                        <div className="grid grid-cols-2 gap-4 sm:grid-cols-1 sm:gap-6 lg:gap-8">
                            {galleryImages.slice(0, 2).map((img, idx) => (
                                <div key={img.id} className="aspect-[4/3] sm:aspect-[3/2] relative overflow-hidden rounded-2xl bg-stone-100">
                                    <Image
                                        src={getImageUrl(img.imageUrl)}
                                        alt={`Gallery ${idx + 1}`}
                                        fill
                                        className="object-cover"
                                        sizes="(min-width: 1024px) 33vw, 50vw"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="mx-auto grid max-w-2xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">

                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <h2 className="text-2xl font-bold tracking-tight text-stone-900 mb-4">About this hostel</h2>
                        <div className="prose prose-stone text-stone-600">
                            <p className="whitespace-pre-line leading-relaxed">{hostel.description}</p>
                        </div>

                        <div className="mt-12 pt-10 border-t border-stone-200">
                            <h2 className="text-2xl font-bold tracking-tight text-stone-900 mb-8">Available Room Types</h2>
                            {hostel.roomTypes.length === 0 ? (
                                <p className="text-stone-500 italic">No room information is available at the moment.</p>
                            ) : (
                                <div className="grid gap-8 md:grid-cols-2">
                                    {hostel.roomTypes.map(rt => (
                                        <Link 
                                            key={rt.id} 
                                            href={`/checkout/${hostel.id}?roomTypeId=${rt.id}`}
                                            className={`premium-card overflow-hidden border border-stone-100 bg-white rounded-2xl shadow-sm transition-all hover:shadow-xl hover:shadow-stone-950/5 group block ${rt.availableCount === 0 ? 'pointer-events-none opacity-60' : ''}`}
                                        >
                                            <div className="relative h-48 w-full bg-stone-100 overflow-hidden">
                                                {rt.imageUrl ? (
                                                    <img 
                                                        src={getImageUrl(rt.imageUrl)} 
                                                        alt={rt.name} 
                                                        className="object-cover w-full h-full transition-transform duration-700 group-hover:scale-110" 
                                                    />
                                                ) : (
                                                    <div className="flex h-full w-full items-center justify-center">
                                                        <ImageIcon className="h-12 w-12 text-stone-200" />
                                                    </div>
                                                )}
                                                <div className="absolute top-4 right-4">
                                                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ring-1 ring-inset ${
                                                        rt.availableCount > 0 ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-rose-50 text-rose-700 ring-rose-600/10'
                                                    }`}>
                                                        {rt.availableCount > 0 ? `${rt.availableCount} available` : 'Sold out'}
                                                    </span>
                                                </div>
                                            </div>
                                            
                                            <div className="p-6">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <h3 className="text-lg font-black text-stone-950 uppercase tracking-tight">{rt.name}</h3>
                                                        <p className="text-xs text-stone-500 font-medium">Capacity: {rt.capacity} {rt.capacity === 1 ? 'Person' : 'People'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xl font-black text-stone-950">GHS {rt.pricePerYear.toLocaleString()}</p>
                                                        <p className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">per year</p>
                                                    </div>
                                                </div>

                                                <div
                                                    className={`w-full group inline-flex items-center justify-center gap-2 rounded-xl bg-stone-950 px-6 py-3.5 text-xs font-black uppercase tracking-widest text-white transition-all active:scale-95 ${rt.availableCount > 0 ? 'group-hover:bg-amber-600' : 'opacity-50'}`}
                                                >
                                                    {rt.availableCount > 0 ? 'Book This Room' : 'Sold Out'}
                                                    <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar / Agent Info */}
                    <div>
                        <div className="rounded-2xl bg-stone-50 p-6 sm:p-8 lg:p-6 xl:p-8 ring-1 ring-inset ring-stone-900/5">
                            <h3 className="text-lg font-semibold leading-8 text-stone-900">Manager Contact</h3>
                            <p className="mt-2 text-sm leading-6 text-stone-600">Get in touch with the manager to schedule a viewing or ask a question.</p>

                            <div className="mt-6 flex items-center gap-x-4">
                                <div className="h-12 w-12 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 text-xl font-bold">
                                    {hostel.agentName.charAt(0)}
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-stone-900">{hostel.agentName}</h4>
                                    <p className="text-sm text-stone-500">Verified Agent ✓</p>
                                </div>
                            </div>

                            <div className="mt-6 flex flex-col gap-3">
                                <a href={`tel:${hostel.agentPhone}`} className="flex w-full items-center justify-center rounded-md bg-stone-900 px-3 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-stone-800 transition">
                                    <svg className="-ml-0.5 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-2.896-1.596-5.48-4.18-7.076-7.076l1.293-.97c.362-.271.527-.733.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                                    </svg>
                                    {hostel.agentPhone}
                                </a>
                                <button className="flex w-full items-center justify-center rounded-md bg-white px-3 py-2.5 text-sm font-semibold text-stone-900 shadow-sm ring-1 ring-inset ring-stone-300 hover:bg-stone-50 transition">
                                    Send a Message
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Reviews Section */}
                <div className="mt-16 pt-10 border-t border-stone-200">
                    <h2 className="text-2xl font-bold tracking-tight text-stone-900 mb-8">Student Reviews</h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {reviews.length === 0 ? (
                                <p className="text-stone-500 italic">No reviews yet. Be the first to review!</p>
                            ) : (
                                reviews.map((review) => (
                                    <div key={review.id} className="p-6 bg-stone-50 rounded-2xl ring-1 ring-inset ring-stone-900/5">
                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold">
                                                {review.customerName.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-stone-900">{review.customerName}</h4>
                                                <div className="flex text-amber-400 text-sm">
                                                    {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                                                </div>
                                            </div>
                                            <span className="ml-auto text-xs text-stone-400">
                                                {new Date(review.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                        {review.comment && (
                                            <p className="text-stone-600 text-sm leading-relaxed">{review.comment}</p>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div>
                            {isAuthenticated && role === 'CUSTOMER' ? (
                                <div className="bg-white p-6 rounded-2xl ring-1 ring-inset ring-stone-200 shadow-sm">
                                    <h3 className="text-lg font-bold text-stone-900 mb-4">Write a Review</h3>
                                    {reviewError && <p className="text-sm text-red-600 mb-4">{reviewError}</p>}
                                    <form onSubmit={async (e) => {
                                        e.preventDefault();
                                        setSubmittingReview(true);
                                        setReviewError('');
                                        try {
                                            const newReview = await reviewsApi.create({ hostelId: id, rating: newRating, comment: newComment });
                                            setReviews([...reviews, newReview]);
                                            setNewComment('');
                                            setNewRating(5);
                                        } catch (err: any) {
                                            setReviewError(err.message || 'Failed to submit review');
                                        } finally {
                                            setSubmittingReview(false);
                                        }
                                    }}>
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-stone-700 mb-2">Tap a Rating</label>
                                            <div className="flex items-center gap-1">
                                                {[1, 2, 3, 4, 5].map((star) => (
                                                    <button
                                                        key={star}
                                                        type="button"
                                                        onClick={() => setNewRating(star)}
                                                        className={`text-3xl focus:outline-none transition-transform hover:scale-110 ${star <= newRating ? 'text-amber-400' : 'text-stone-200'}`}
                                                    >
                                                        <span className="pointer-events-none">★</span>
                                                    </button>
                                                ))}
                                                <span className="ml-3 text-sm font-medium text-stone-500">
                                                    {newRating === 5 ? 'Excellent' : newRating === 4 ? 'Very Good' : newRating === 3 ? 'Average' : newRating === 2 ? 'Poor' : 'Terrible'}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="mb-6">
                                            <label className="block text-sm font-bold text-stone-700 mb-2">Review Details</label>
                                            <textarea
                                                rows={5}
                                                value={newComment}
                                                onChange={(e) => setNewComment(e.target.value)}
                                                className="block w-full rounded-xl border-stone-200 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-stone-900 bg-stone-50 p-4 transition-colors"
                                                placeholder="Share your experience here..."
                                                required
                                            />
                                        </div>
                                        <button 
                                            type="submit" 
                                            disabled={submittingReview}
                                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 transition"
                                        >
                                            {submittingReview ? 'Submitting...' : 'Post Review'}
                                        </button>
                                    </form>
                                </div>
                            ) : (
                                <div className="bg-stone-50 p-6 rounded-2xl ring-1 ring-inset ring-stone-900/5 text-center">
                                    <h3 className="text-sm font-medium text-stone-900 mb-2">Want to write a review?</h3>
                                    <p className="text-xs text-stone-500 mb-4">You must be logged in as a student to leave a review.</p>
                                    <a href="/login" className="text-indigo-600 hover:text-indigo-500 font-medium text-sm">Log in here</a>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

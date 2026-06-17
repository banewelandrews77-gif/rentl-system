'use client';

import { publicHostelsApi, Hostel, getImageUrl } from '@/lib/api';
import Link from 'next/link';
import Image from 'next/image';
import React, { useEffect, useState } from 'react';

export default function PublicHostelsPage() {
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const loadHostels = async () => {
            try {
                const data = await publicHostelsApi.getAllPublished();
                setHostels(data);
            } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                setError(err.message || 'Failed to load hostels');
            } finally {
                setLoading(false);
            }
        };
        loadHostels();
    }, []);

    return (
        <div className="bg-stone-50 min-h-screen">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl">Available Hostels</h1>
                    <p className="mt-4 text-lg text-stone-600">
                        Browse through our verified listings to find your next student accommodation.
                    </p>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 mb-8">
                        <p className="text-sm text-red-700">{error}</p>
                    </div>
                )}

                {loading ? (
                    <p className="text-center text-stone-500">Loading hostels...</p>
                ) : hostels.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-stone-200 shadow-sm">
                        <h3 className="text-lg font-medium text-stone-900">No hostels found</h3>
                        <p className="mt-2 text-stone-500">There are currently no listed hostels. Please check back later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8 gap-x-6">
                        {hostels.map((hostel) => {
                            const primaryImage = hostel.images.find((img) => img.isPrimary) || hostel.images[0];
                            const lowestPrice = hostel.roomTypes.length > 0
                                ? Math.min(...hostel.roomTypes.map((rt) => rt.pricePerYear))
                                : null;

                            return (
                                <div key={hostel.id} className="group relative flex flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition-all hover:shadow-md hover:ring-indigo-200">
                                    <div className="aspect-[4/3] w-full relative overflow-hidden bg-stone-200 sm:aspect-[3/2]">
                                        {primaryImage ? (
                                            <Image
                                                src={getImageUrl(primaryImage.imageUrl)}
                                                alt={hostel.name}
                                                fill
                                                className="object-cover object-center group-hover:scale-105 transition-transform duration-300"
                                                sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                                            />
                                        ) : (
                                            <div className="flexh-full w-full items-center justify-center text-stone-400 bg-stone-100">
                                                {/* Placeholder */}
                                                <svg className="h-12 w-12 mx-auto mt-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex flex-1 flex-col p-6 pl-5">
                                        <h3 className="text-lg font-bold text-stone-900">
                                            <Link href={`/hostels/${hostel.id}`}>
                                                <span aria-hidden="true" className="absolute inset-0" />
                                                {hostel.name}
                                            </Link>
                                        </h3>
                                        <p className="mt-1 text-sm text-stone-500 line-clamp-1">{hostel.location}</p>
                                        <p className="mt-3 text-sm text-stone-600 line-clamp-2 leading-relaxed flex-1">
                                            {hostel.description}
                                        </p>
                                        <div className="mt-6 flex items-center justify-between border-t border-stone-100 pt-4">
                                            <div>
                                                {lowestPrice ? (
                                                    <p className="text-sm font-medium text-stone-900">
                                                        From <span className="text-indigo-600 font-bold text-lg">GHS {lowestPrice.toLocaleString()}</span> /yr
                                                    </p>
                                                ) : (
                                                    <p className="text-sm font-medium text-stone-500">Price on request</p>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-1 text-xs font-medium text-stone-500">
                                                <span>{hostel.roomTypes.reduce((acc, rt) => acc + rt.availableCount, 0)} rooms left</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}

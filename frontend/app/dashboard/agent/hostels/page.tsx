'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { agentHostelsApi, Hostel, getImageUrl } from '@/lib/api';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { Home, MapPin, Building2, Plus, ArrowRight, AlertCircle } from 'lucide-react';

function MyHostelsContent() {
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const router = useRouter();

    useEffect(() => {
        const load = async () => {
            try {
                const data = await agentHostelsApi.getMyHostels();
                setHostels(data);
            } catch (err: any) {
                setError(err.message || 'Failed to load hostels');
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
            <div className="h-12 w-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
            <p className="text-stone-500 font-medium">Loading your portfolio...</p>
        </div>
    );

    if (error) return (
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
            <div className="h-20 w-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <AlertCircle className="h-10 w-10 text-rose-600" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900">Connection Interrupted</h2>
            <p className="mt-2 text-stone-600">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-8 px-6 py-2 bg-stone-900 text-white rounded-full font-bold">Try Again</button>
        </div>
    );

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 w-full">
            <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="h-8 w-1 bg-stone-900 rounded-full" />
                        <span className="text-sm font-bold uppercase tracking-[0.2em] text-stone-500">Portfolio</span>
                    </div>
                    <h1 className="text-4xl font-black tracking-tight text-stone-950">My Hostels</h1>
                    <p className="mt-3 text-lg text-stone-600 max-w-xl">
                        Manage your active listings and track property performance.
                    </p>
                </div>
                <button
                    onClick={() => router.push('/dashboard/agent/hostels/new')}
                    className="group inline-flex items-center gap-3 rounded-2xl bg-stone-950 px-8 py-4 text-sm font-black uppercase tracking-widest text-white shadow-xl transition-all hover:bg-stone-800"
                >
                    <Plus className="h-5 w-5" />
                    List New Property
                </button>
            </header>

            {hostels.length === 0 ? (
                <div className="premium-card p-20 text-center bg-stone-50/50 border-dashed border-2">
                    <div className="h-24 w-24 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-8">
                        <Building2 className="h-12 w-12 text-stone-300" />
                    </div>
                    <h2 className="text-2xl font-bold text-stone-900">Your portfolio is empty</h2>
                    <p className="mt-3 text-stone-500 max-w-md mx-auto">
                        Begin your journey as a verified agent by listing your first hostel property.
                    </p>
                    <button
                        onClick={() => router.push('/dashboard/agent/hostels/new')}
                        className="mt-10 px-8 py-3 bg-white border border-stone-200 rounded-full font-bold text-stone-900 hover:bg-stone-50 transition-colors shadow-sm"
                    >
                        Create your first listing
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {hostels.map((hostel) => {
                        const primaryImage = hostel.images.find(img => img.isPrimary) || hostel.images[0];
                        return (
                            <div 
                                key={hostel.id} 
                                className="group premium-card overflow-hidden cursor-pointer hover:-translate-y-2"
                                onClick={() => router.push(`/dashboard/agent/hostels/${hostel.id}`)}
                            >
                                <div className="relative aspect-[16/10] overflow-hidden bg-stone-100">
                                    {primaryImage ? (
                                        <img
                                            src={getImageUrl(primaryImage.imageUrl)}
                                            alt={hostel.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-stone-50">
                                            <Home className="h-12 w-12 text-stone-200" />
                                        </div>
                                    )}
                                    <div className="absolute top-4 right-4">
                                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest backdrop-blur-md shadow-sm border ${
                                            hostel.status === 'PUBLISHED' 
                                            ? 'bg-emerald-500/80 text-white border-emerald-400/30' 
                                            : 'bg-stone-900/80 text-stone-100 border-white/10'
                                        }`}>
                                            {hostel.status}
                                        </span>
                                    </div>
                                </div>
                                <div className="p-6">
                                    <div className="flex items-center gap-2 text-stone-400 mb-2">
                                        <MapPin className="h-3.5 w-3.5" />
                                        <span className="text-xs font-bold uppercase tracking-wider truncate">{hostel.location}</span>
                                    </div>
                                    <h3 className="text-xl font-black text-stone-950 mb-4 group-hover:text-indigo-600 transition-colors">
                                        {hostel.name}
                                    </h3>
                                    
                                    <div className="flex items-center justify-between pt-4 border-t border-stone-100">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Base Price</span>
                                            <span className="text-lg font-black text-stone-900">
                                                GHS {hostel.roomTypes[0]?.pricePerYear || 'N/A'}
                                            </span>
                                        </div>
                                        <div className="h-10 w-10 rounded-full bg-stone-50 flex items-center justify-center group-hover:bg-stone-950 group-hover:text-white transition-all">
                                            <ArrowRight className="h-5 w-5" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

export default function MyHostelsPage() {
    return (
        <RequireAuth role="AGENT">
            <MyHostelsContent />
        </RequireAuth>
    );
}

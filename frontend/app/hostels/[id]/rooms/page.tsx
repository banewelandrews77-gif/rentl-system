'use client';

import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { publicHostelsApi, Hostel, getImageUrl } from '@/lib/api';
import { ArrowLeft, Image as ImageIcon, Users, CheckCircle2 } from 'lucide-react';
import { RequireAuth } from '@/components/RequireAuth';
import { toast } from 'react-hot-toast';

function HostelRoomsContent() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const [hostel, setHostel] = useState<Hostel | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadHostel = async () => {
    try {
      const data = await publicHostelsApi.getHostel(id);
      setHostel(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load hostel');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHostel();
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
        <div className="h-12 w-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
        <p className="text-stone-500 font-medium">Loading hostel rooms...</p>
      </div>
    );
  }

  if (error || !hostel) {
    return (
      <div className="p-20 text-center">
        <h1 className="text-2xl font-black text-rose-600">{error || 'Hostel not found'}</h1>
        <button onClick={() => router.push('/hostels')} className="mt-8 text-stone-900 font-bold underline">
          Return to Listings
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 text-stone-500 hover:text-stone-950 font-bold text-sm mb-8 transition-colors"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <header className="mb-12">
        <h1 className="text-4xl font-black text-stone-950 mb-4">{hostel.name} – Rooms</h1>
        <p className="text-stone-600">{hostel.description || <span className="italic text-stone-300">No description provided.</span>}</p>
      </header>

      {hostel.roomTypes.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-3xl">
          <Users className="h-8 w-8 text-stone-200 mx-auto mb-3" />
          <p className="text-sm font-bold text-stone-400">No rooms configured for this hostel.</p>
        </div>
      ) : (
        <div className="grid gap-8 md:grid-cols-2">
          {hostel.roomTypes.map(rt => (
            <button 
              key={rt.id} 
              onClick={() => {
                if (rt.availableCount > 0) {
                  router.push(`/checkout/${hostel.id}?roomTypeId=${rt.id}`);
                } else {
                  toast.error('This room type is currently sold out.');
                }
              }}
              className={`premium-card overflow-hidden border border-stone-100 bg-white rounded-2xl shadow-sm text-left transition-all hover:shadow-xl hover:-translate-y-1 group ${rt.availableCount === 0 ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
            >
              <div className="p-6">
                <div className="relative w-full h-64 rounded-xl overflow-hidden bg-stone-100 mb-6">
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
                
                <div className="flex justify-between items-end">
                  <div>
                    <h3 className="text-xl font-black text-stone-950 uppercase tracking-tight">{rt.name}</h3>
                    <div className="flex items-center gap-4 mt-2 text-sm text-stone-500 font-medium">
                      <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {rt.capacity} Persons</span>
                      <span className="flex items-center gap-1"><CheckCircle2 className="h-4 w-4" /> {rt.availableCount} Left</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-stone-950">GHS {rt.pricePerYear.toLocaleString()}</p>
                    <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest">Annual Fee</p>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function HostelRoomsPage() {
  return (
    <RequireAuth role="CUSTOMER">
      <HostelRoomsContent />
    </RequireAuth>
  );
}

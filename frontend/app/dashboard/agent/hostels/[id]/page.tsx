'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { agentHostelsApi, Hostel, getImageUrl } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Edit, 
  Trash2, 
  Plus, 
  Image as ImageIcon, 
  Users, 
  Wallet, 
  CheckCircle2, 
  Clock, 
  ArrowLeft,
  Settings,
  Layout,
  ExternalLink
} from 'lucide-react';

function HostelDetailContent() {
    const { id } = useParams() as { id: string };
    const router = useRouter();

    const [hostel, setHostel] = useState<Hostel | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form states
    const [showRoomForm, setShowRoomForm] = useState(false);
    const [roomData, setRoomData] = useState({ name: '', capacity: 1, pricePerYear: '', totalAvailable: 1 });
    const [roomSubmitting, setRoomSubmitting] = useState(false);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imageLoading, setImageLoading] = useState(false);
    const [roomImageLoading, setRoomImageLoading] = useState<string | null>(null);

    const loadHostel = async () => {
        try {
            const hostels = await agentHostelsApi.getMyHostels();
            const found = hostels.find(h => h.id === id);
            if (found) setHostel(found);
            else setError('Hostel not found');
        } catch (err: any) {
            setError(err.message || 'Failed to load hostel');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadHostel();
    }, [id]);

    const handleAddRoom = async (e: React.FormEvent) => {
        e.preventDefault();
        setRoomSubmitting(true);
        try {
            const updated = await agentHostelsApi.addRoomType(id, {
                ...roomData,
                pricePerYear: parseFloat(roomData.pricePerYear)
            });
            // Force a full re-fetch to ensure all calculated fields (like availability) are synced
            await loadHostel();
            setShowRoomForm(false);
            setRoomData({ name: '', capacity: 1, pricePerYear: '', totalAvailable: 1 });
            toast.success('Room type added and synchronized');
        } catch (err: any) {
            toast.error(err.message || 'Failed to add room type');
        } finally {
            setRoomSubmitting(false);
        }
    };

    const handleUploadImage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!imageFile) return;
        setImageLoading(true);
        try {
            const isFirstImage = !hostel?.images || hostel.images.length === 0;
            await agentHostelsApi.uploadImage(id, imageFile, isFirstImage);
            await loadHostel();
            setImageFile(null);
            toast.success('Gallery updated');
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload image');
        } finally {
            setImageLoading(false);
        }
    };

    const handleUploadRoomImage = async (roomId: string, file: File) => {
        setRoomImageLoading(roomId);
        try {
            await agentHostelsApi.uploadRoomImage(id, roomId, file);
            await loadHostel();
            toast.success('Room visuals updated');
        } catch (err: any) {
            toast.error(err.message || 'Failed to upload room image');
        } finally {
            setRoomImageLoading(null);
        }
    };

    const handleDeleteImage = async (imageId: string) => {
        if (!window.confirm('Are you sure you want to delete this photo?')) return;
        try {
            const updated = await agentHostelsApi.deleteImage(id, imageId);
            setHostel(updated);
            toast.success('Photo deleted');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete photo');
        }
    };

    const handlePublish = async () => {
        if (!hostel) return;
        if (hostel.roomTypes.length === 0) {
            toast.error('Add at least one room type first.');
            return;
        }
        if (hostel.images.length === 0) {
            toast.error('Upload at least one image first.');
            return;
        }

        try {
            const updated = await agentHostelsApi.updateStatus(id, 'PUBLISHED');
            setHostel(updated);
            toast.success('Property is now live!');
        } catch (err: any) {
            toast.error(err.message || 'Failed to publish');
        }
    };

    const handleDelete = async () => {
        if (!hostel) return;
        if (!window.confirm(`Delete ${hostel.name}? This cannot be undone.`)) return;

        try {
            await agentHostelsApi.delete(id);
            toast.success('Hostel removed');
            router.push('/dashboard/agent/hostels');
        } catch (err: any) {
            toast.error(err.message || 'Failed to delete');
        }
    };

    if (loading) return (
        <div className="flex flex-col items-center justify-center min-h-screen space-y-4">
            <div className="h-12 w-12 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
            <p className="text-stone-500 font-medium">Synchronizing property data...</p>
        </div>
    );
    
    if (error || !hostel) return (
        <div className="p-20 text-center">
            <h1 className="text-2xl font-black text-rose-600">{error || 'Resource not found'}</h1>
            <button onClick={() => router.push('/dashboard/agent/hostels')} className="mt-8 text-stone-900 font-bold underline">Return to Portfolio</button>
        </div>
    );

    return (
        <div className="mx-auto max-w-7xl px-4 py-12">
            <button 
                onClick={() => router.push('/dashboard/agent/hostels')}
                className="flex items-center gap-2 text-stone-500 hover:text-stone-950 font-bold text-sm mb-8 transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Portfolio
            </button>

            <header className="mb-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8 pb-12 border-b border-stone-100">
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                            hostel.status === 'PUBLISHED' 
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                            : 'bg-stone-50 text-stone-700 border border-stone-200'
                        }`}>
                            {hostel.status === 'PUBLISHED' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                            {hostel.status}
                        </span>
                        <span className="text-stone-300 text-xs">ID: {hostel.id.split('-')[0]}</span>
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-stone-950 mb-3">{hostel.name}</h1>
                    <div className="flex items-center gap-4 text-stone-500">
                        <div className="flex items-center gap-1.5 text-sm font-bold">
                            <Settings className="h-4 w-4" />
                            {hostel.location}
                        </div>
                        <div className="h-1 w-1 bg-stone-300 rounded-full" />
                        <div className="text-sm">Last updated: 2 mins ago</div>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={() => router.push(`/dashboard/agent/hostels/${id}/edit`)}
                        className="inline-flex items-center gap-2 rounded-2xl bg-white border border-stone-200 px-6 py-3.5 text-sm font-bold text-stone-900 shadow-sm hover:bg-stone-50 transition-all"
                    >
                        <Edit className="h-4 w-4" />
                        Edit Details
                    </button>
                    
                    {hostel.status === 'DRAFT' && (
                        <button
                            onClick={handlePublish}
                            className="inline-flex items-center gap-2 rounded-2xl bg-stone-950 px-8 py-3.5 text-sm font-bold text-white shadow-xl hover:bg-stone-800 transition-all"
                        >
                            <ExternalLink className="h-4 w-4" />
                            Publish Property
                        </button>
                    )}

                    <button
                        onClick={handleDelete}
                        className="inline-flex items-center gap-2 rounded-2xl bg-rose-50 text-rose-600 px-6 py-3.5 text-sm font-bold hover:bg-rose-100 transition-all"
                    >
                        <Trash2 className="h-4 w-4" />
                        Archive
                    </button>
                </div>
            </header>

            <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                {/* Left Section - Rooms & Details */}
                <div className="lg:col-span-2 space-y-12">
                    
                    {/* Room Configuration */}
                    <section className="premium-card overflow-hidden">
                        <div className="px-8 py-6 border-b border-stone-100 flex items-center justify-between bg-stone-50/50">
                            <div className="flex items-center gap-3">
                                <Layout className="h-5 w-5 text-stone-900" />
                                <h2 className="text-lg font-black uppercase tracking-tight text-stone-900">Room Configuration</h2>
                            </div>
                            <button
                                onClick={() => setShowRoomForm(!showRoomForm)}
                                className={`text-xs font-black uppercase tracking-widest px-4 py-2 rounded-full transition-all ${
                                    showRoomForm 
                                    ? 'bg-rose-100 text-rose-700 hover:bg-rose-200' 
                                    : 'bg-stone-900 text-white hover:bg-stone-800'
                                }`}
                            >
                                {showRoomForm ? 'Cancel' : 'Add Room'}
                            </button>
                        </div>

                        {showRoomForm && (
                            <div className="px-8 py-8 bg-white border-b border-stone-100 animate-in fade-in slide-in-from-top-4 duration-300">
                                <form onSubmit={handleAddRoom} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Room Designation</label>
                                            <input type="text" placeholder="e.g. 4-in-a-room" required value={roomData.name} onChange={e => setRoomData({ ...roomData, name: e.target.value })} className="block w-full rounded-xl border-stone-200 py-3 px-4 focus:ring-stone-900 focus:border-stone-900" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Person Capacity</label>
                                            <input type="number" min="1" required value={roomData.capacity} onChange={e => setRoomData({ ...roomData, capacity: parseInt(e.target.value) })} className="block w-full rounded-xl border-stone-200 py-3 px-4 focus:ring-stone-900 focus:border-stone-900" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Annual Price (GHS)</label>
                                            <input type="number" step="0.01" required value={roomData.pricePerYear} onChange={e => setRoomData({ ...roomData, pricePerYear: e.target.value })} className="block w-full rounded-xl border-stone-200 py-3 px-4 focus:ring-stone-900 focus:border-stone-900" />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase tracking-widest text-stone-500">Inventory Count</label>
                                            <input type="number" min="1" required value={roomData.totalAvailable} onChange={e => setRoomData({ ...roomData, totalAvailable: parseInt(e.target.value) })} className="block w-full rounded-xl border-stone-200 py-3 px-4 focus:ring-stone-900 focus:border-stone-900" />
                                        </div>
                                    </div>
                                    <button type="submit" disabled={roomSubmitting} className="w-full md:w-auto bg-stone-900 text-white font-black uppercase tracking-widest text-xs px-10 py-4 rounded-xl hover:bg-stone-800 transition-colors">
                                        {roomSubmitting ? 'Processing...' : 'Save Configuration'}
                                    </button>
                                </form>
                            </div>
                        )}

                        <div className="p-8">
                            {hostel.roomTypes.length === 0 ? (
                                <div className="text-center py-12 border-2 border-dashed border-stone-100 rounded-3xl">
                                    <Users className="h-8 w-8 text-stone-200 mx-auto mb-3" />
                                    <p className="text-sm font-bold text-stone-400">No rooms configured yet.</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 gap-4">
                                    {hostel.roomTypes.map(rt => (
                                        <div key={rt.id} className="group flex items-center justify-between p-6 rounded-2xl bg-stone-50/50 border border-stone-100 hover:bg-white hover:border-stone-200 transition-all hover:shadow-md">
                                            <div className="flex items-center gap-6">
                                                <div className="relative h-16 w-16 rounded-xl overflow-hidden bg-white border border-stone-100 flex items-center justify-center">
                                                    {rt.imageUrl ? (
                                                        <img 
                                                            src={`${getImageUrl(rt.imageUrl)}?t=${Date.now()}`} 
                                                            alt={rt.name} 
                                                            className="object-cover w-full h-full" 
                                                        />
                                                    ) : (
                                                        <div className="text-stone-300">
                                                            <ImageIcon className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                    
                                                    <label className="absolute inset-0 bg-stone-900/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center cursor-pointer transition-all duration-300">
                                                        <Plus className="h-4 w-4 text-white mb-1" />
                                                        <span className="text-[8px] font-black text-white uppercase tracking-tighter">Photo</span>
                                                        <input 
                                                            type="file" 
                                                            className="hidden" 
                                                            accept="image/*" 
                                                            onChange={e => e.target.files?.[0] && handleUploadRoomImage(rt.id, e.target.files[0])}
                                                            disabled={!!roomImageLoading}
                                                        />
                                                    </label>

                                                    {roomImageLoading === rt.id && (
                                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                            <div className="h-5 w-5 border-2 border-stone-900 border-t-transparent rounded-full animate-spin" />
                                                        </div>
                                                    )}
                                                </div>

                                                <div>
                                                    <h4 className="font-black text-stone-950 uppercase tracking-tight">{rt.name}</h4>
                                                    <div className="flex items-center gap-3 mt-1">
                                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Inventory: {rt.availableCount} available</span>
                                                        <div className="h-1 w-1 bg-stone-200 rounded-full" />
                                                        <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{rt.capacity} Persons</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Per Annum</div>
                                                <div className="text-xl font-black text-stone-950">GHS {rt.pricePerYear}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Description Section */}
                    <section className="premium-card p-8">
                        <h3 className="text-lg font-black uppercase tracking-tight text-stone-900 mb-6 flex items-center gap-3">
                            <ImageIcon className="h-5 w-5" />
                            Property Narrative
                        </h3>
                        <div className="text-stone-600 text-lg leading-relaxed whitespace-pre-wrap font-medium">
                            {hostel.description || <span className="italic text-stone-300">No description provided for this listing.</span>}
                        </div>
                    </section>
                </div>

                {/* Right Section - Media & Meta */}
                <div className="space-y-12">
                    <section className="premium-card overflow-hidden">
                        <div className="px-8 py-6 border-b border-stone-100 bg-stone-50/50">
                            <h3 className="text-lg font-black uppercase tracking-tight text-stone-900">Media Assets</h3>
                        </div>
                        <div className="p-8">
                            <form onSubmit={handleUploadImage} className="mb-8 space-y-4">
                                <label className="block">
                                    <span className="sr-only">Choose property photo</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={e => e.target.files && setImageFile(e.target.files[0])}
                                        className="block w-full text-xs text-stone-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-black file:uppercase file:tracking-widest file:bg-stone-900 file:text-white hover:file:bg-stone-800"
                                    />
                                </label>
                                <button type="submit" disabled={!imageFile || imageLoading} className="w-full bg-stone-100 text-stone-900 py-3.5 rounded-2xl hover:bg-stone-200 disabled:opacity-50 font-black uppercase tracking-widest text-[10px] transition-all">
                                    {imageLoading ? 'Uploading...' : 'Upload Image'}
                                </button>
                            </form>

                            {hostel.images.length === 0 ? (
                                <div className="text-center py-12 bg-stone-50 rounded-3xl border-2 border-dashed border-stone-100">
                                    <ImageIcon className="h-10 w-10 text-stone-200 mx-auto mb-3" />
                                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Gallery Empty</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-4">
                                    {hostel.images.map(img => (
                                        <div key={img.id} className="relative aspect-square rounded-2xl overflow-hidden bg-stone-100 border border-stone-100 group">
                                            <img src={`${getImageUrl(img.imageUrl)}?t=${Date.now()}`} alt="Hostel" className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-110" />
                                            {img.isPrimary && (
                                                <div className="absolute top-2 left-2 bg-stone-900 text-white text-[8px] font-black tracking-widest px-2 py-1 rounded-full shadow-lg border border-white/20 uppercase">
                                                    Primary
                                                </div>
                                            )}
                                            <button
                                                onClick={() => handleDeleteImage(img.id)}
                                                className="absolute bottom-2 right-2 bg-white/90 p-2 rounded-full text-rose-600 shadow-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-rose-600 hover:text-white"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </section>

                    <section className="premium-card p-8 bg-gradient-to-br from-indigo-50/50 to-white">
                        <h3 className="text-lg font-black uppercase tracking-tight text-stone-900 mb-6 flex items-center gap-3">
                            <Wallet className="h-5 w-5" />
                            Portfolio Summary
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-stone-500 font-bold">Total Rooms</span>
                                <span className="text-stone-900 font-black">{hostel.roomTypes.reduce((acc, rt) => acc + rt.totalAvailable, 0)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-stone-500 font-bold">Available</span>
                                <span className="text-emerald-600 font-black">{hostel.roomTypes.reduce((acc, rt) => acc + rt.availableCount, 0)}</span>
                            </div>
                            <div className="pt-4 border-t border-stone-100">
                                <div className="text-[10px] font-black text-stone-400 uppercase tracking-widest mb-1">Projected Annual Revenue</div>
                                <div className="text-2xl font-black text-stone-950">GHS {hostel.roomTypes.reduce((acc, rt) => acc + (rt.pricePerYear * rt.totalAvailable), 0).toLocaleString()}</div>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}

export default function HostelDetailPage() {
    return (
        <RequireAuth role="AGENT">
            <HostelDetailContent />
        </RequireAuth>
    );
}

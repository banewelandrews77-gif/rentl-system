'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { agentApi, agentHostelsApi, agentSubscriptionApi, AgentProfileResponse } from '@/lib/api';
import { SCHOOLS } from '@/lib/constants';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { 
  Plus, 
  ArrowLeft, 
  Building2, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  CreditCard,
  MapPin,
  University,
  Type,
  FileText,
  ChevronRight,
  ArrowRight,
  Info,
  Map as MapIcon,
  Navigation,
  Compass,
  Check
} from 'lucide-react';
import dynamic from 'next/dynamic';
const LocationPicker = dynamic(() => import('@/app/components/LocationPicker'), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-stone-100 rounded-[2.5rem]">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-900 border-t-transparent" />
        </div>
    ),
});
import { toast } from 'react-hot-toast';
import { geocode } from '@/lib/geocoding';
import { motion, AnimatePresence } from 'framer-motion';

function NewHostelContent() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        gpsCoordinates: '',
        schoolSlug: '',
    });
    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(true);
    const [error, setError] = useState('');
    const [profile, setProfile] = useState<AgentProfileResponse | null>(null);
    const [isGeocoding, setIsGeocoding] = useState(false);

    // Automatic Geocoding
    useEffect(() => {
        if (!formData.location || formData.location.length < 3) return;

        setIsGeocoding(true);
        const timer = setTimeout(async () => {
            try {
                const coords = await geocode(formData.location);
                if (coords) {
                    const gpsString = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
                    setFormData(prev => ({ ...prev, gpsCoordinates: gpsString }));
                    toast.success('Location coordinates resolved!', { id: 'geocoding' });
                }
            } catch (err) {
                // Ignore or handle
            } finally {
                setIsGeocoding(false);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [formData.location]);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        setPageLoading(true);
        try {
            const data = await agentApi.getProfileMe();
            setProfile(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load profile');
        } finally {
            setPageLoading(false);
        }
    };

    const handleSubscribe = async () => {
        setLoading(true);
        try {
            const { authorizationUrl } = await agentSubscriptionApi.initialize();
            window.location.href = authorizationUrl;
        } catch (err: any) {
            setError(err.message || 'Failed to initialize subscription');
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const hostel = await agentHostelsApi.create(formData);
            toast.success('Property profile created!');
            router.push(`/dashboard/agent/hostels/${hostel.id}`);
        } catch (err: any) {
            setError(err.message || 'Failed to create hostel');
            setLoading(false);
        }
    };

    if (pageLoading) return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] space-y-6 bg-stone-50/35">
            <div className="relative flex h-16 w-16 items-center justify-center">
                <div className="absolute inset-0 rounded-full border-4 border-stone-200/80" />
                <div className="absolute inset-0 rounded-full border-4 border-amber-600 border-t-transparent animate-spin" />
            </div>
            <p className="text-stone-500 font-bold uppercase tracking-widest text-xs animate-pulse">Synchronizing Identity...</p>
        </div>
    );

    return (
        <div className="min-h-screen bg-stone-50 text-stone-900 pb-40 relative overflow-x-hidden selection:bg-amber-200 selection:text-stone-950">
            {/* Design Ambient Glows */}
            <div className="absolute top-0 left-1/4 w-[700px] h-[500px] bg-gradient-to-r from-amber-400/10 to-teal-400/5 rounded-full blur-[140px] pointer-events-none" />
            <div className="absolute top-1/3 right-1/4 w-[600px] h-[600px] bg-rose-400/5 rounded-full blur-[130px] pointer-events-none" />
            
            <div className="mx-auto max-w-5xl px-4 py-12 relative z-10">
                {/* Back Button */}
                <button 
                    onClick={() => router.back()}
                    className="group flex items-center gap-2.5 text-stone-400 hover:text-stone-950 font-black text-[10px] uppercase tracking-[0.25em] mb-12 transition-all duration-300"
                >
                    <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1.5 text-amber-600" />
                    Back to Dashboard
                </button>

                {/* Header */}
                <header className="mb-14">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 mb-10">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 bg-stone-950 rounded-2xl flex items-center justify-center shadow-xl shadow-stone-950/20 border border-stone-800">
                                <Plus className="h-6 w-6 text-amber-500" />
                            </div>
                            <div>
                                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-stone-950">Register New Property</h1>
                                <p className="text-stone-500 text-sm font-semibold mt-1">Phase 1: Basic Information & Location Setup</p>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Progress Tracker */}
                    <div className="bg-white/60 backdrop-blur-md rounded-3xl p-6 border border-stone-200/50 shadow-sm">
                        <div className="grid grid-cols-3 gap-6 relative">
                            {[
                                { step: 1, label: 'Core Identity', desc: 'Designation & narrative', status: 'current' },
                                { step: 2, label: 'Room Types', desc: 'Pricing & capacities', status: 'upcoming' },
                                { step: 3, label: 'Visual Gallery', desc: 'Hostel image uploads', status: 'upcoming' }
                            ].map((s, idx) => (
                                <div key={s.step} className="flex flex-col gap-2 relative">
                                    <div className="flex items-center gap-3">
                                        <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[10px] font-black border transition-all duration-300 ${
                                            s.status === 'current'
                                                ? 'bg-amber-600 border-amber-500 text-white shadow-md shadow-amber-500/20'
                                                : 'bg-stone-100 border-stone-200 text-stone-400'
                                        }`}>
                                            {idx === 0 ? <Check className="h-3 w-3 text-white" /> : `0${s.step}`}
                                        </div>
                                        <h3 className={`text-xs font-black uppercase tracking-wider ${
                                            s.status === 'current' ? 'text-stone-950' : 'text-stone-400'
                                        }`}>{s.label}</h3>
                                    </div>
                                    <p className={`text-[10px] font-semibold pl-10 hidden sm:block ${
                                        s.status === 'current' ? 'text-stone-500' : 'text-stone-400'
                                    }`}>{s.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </header>

                {/* Sub-Views based on Verification & Subscriptions */}
                {profile && profile.verificationStatus !== 'VERIFIED' ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white/80 backdrop-blur-lg p-12 sm:p-16 rounded-[2.5rem] shadow-xl border border-stone-200/60 text-center"
                    >
                        <div className="h-20 w-20 bg-amber-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-amber-100 shadow-inner">
                            <ShieldCheck className="h-10 w-10 text-amber-600" />
                        </div>
                        <h3 className="text-2xl font-black text-stone-950 mb-3 tracking-tight">Account Under Verification</h3>
                        <p className="text-stone-500 max-w-sm mx-auto text-sm leading-relaxed font-semibold">
                            Our team is currently validating your business identification documents. You will be notified via email once registration permissions are unlocked.
                        </p>
                    </motion.div>
                ) : profile && (!profile.subscriptionValidUntil || new Date(profile.subscriptionValidUntil) < new Date()) ? (
                    <motion.div 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="overflow-hidden rounded-[2.5rem] shadow-2xl border border-stone-900 bg-stone-950 text-white relative p-12 sm:p-16"
                    >
                        <div className="relative z-10 text-center max-w-md mx-auto">
                            <div className="h-20 w-20 bg-white/10 backdrop-blur-xl rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-white/10">
                                <CreditCard className="h-9 w-9 text-amber-500" />
                            </div>
                            <h3 className="text-3xl font-black mb-3 tracking-tight">Activate Agent Account</h3>
                            <p className="text-stone-400 text-sm leading-relaxed mb-10 font-semibold">
                                Get access to post unlimited hostel listings. The activation fee is a flat annual subscription of <strong className="text-amber-500 font-extrabold">GHS 50.00</strong>.
                            </p>
                            <button
                                onClick={handleSubscribe}
                                disabled={loading}
                                className="group w-full sm:w-auto inline-flex items-center justify-center gap-3 rounded-2xl bg-amber-600 hover:bg-amber-500 px-10 py-5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-amber-600/20 transition-all active:scale-95 disabled:opacity-50"
                            >
                                {loading ? 'Contacting Payment Gateway...' : 'Initialize Subscription'}
                                <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </button>
                        </div>
                        
                        {/* Backdrop effects */}
                        <div className="absolute -right-20 -bottom-20 h-72 w-72 rounded-full bg-amber-500/10 blur-[100px] pointer-events-none" />
                        <div className="absolute -left-20 -top-20 h-72 w-72 rounded-full bg-indigo-500/10 blur-[100px] pointer-events-none" />
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-10">
                        
                        {/* SECTION 1: CORE DETAILS */}
                        <motion.section 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-stone-200/60"
                        >
                            <div className="flex items-center gap-3.5 mb-8 border-l-4 border-amber-600 pl-5">
                                <h2 className="text-xl font-black text-stone-950 tracking-tight">Core Identity</h2>
                                <span className="h-px flex-1 bg-stone-100" />
                            </div>

                            <div className="space-y-8">
                                {/* Name Input */}
                                <div className="space-y-3.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 flex items-center gap-2">
                                        <Type className="h-3.5 w-3.5 text-amber-600" /> Property Designation
                                    </label>
                                    <input
                                        type="text"
                                        name="name"
                                        placeholder="e.g. Sapphire Gardens Annex"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        className="block w-full rounded-2xl border-stone-200 bg-stone-50/40 py-4.5 px-5 text-lg font-black text-stone-900 placeholder:text-stone-300 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all border"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-3.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 flex items-center gap-2">
                                        <FileText className="h-3.5 w-3.5 text-amber-600" /> Narrative & Features
                                    </label>
                                    <textarea
                                        name="description"
                                        rows={4}
                                        placeholder="Describe the environment, security, and unique amenities..."
                                        value={formData.description}
                                        onChange={handleChange}
                                        required
                                        className="block w-full rounded-2xl border-stone-200 bg-stone-50/40 py-4.5 px-5 text-sm font-semibold text-stone-700 placeholder:text-stone-300 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all border resize-none"
                                    />
                                </div>
                            </div>
                        </motion.section>

                        {/* SECTION 2: LOCATION & AFFILIATION */}
                        <motion.section 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-stone-200/60"
                        >
                            <div className="flex items-center gap-3.5 mb-8 border-l-4 border-amber-600 pl-5">
                                <h2 className="text-xl font-black text-stone-950 tracking-tight">Campus & Location</h2>
                                <span className="h-px flex-1 bg-stone-100" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {/* Campus Dropdown */}
                                <div className="space-y-3.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 flex items-center gap-2">
                                        <University className="h-3.5 w-3.5 text-amber-600" /> Affiliated University
                                    </label>
                                    <div className="relative">
                                        <select
                                            name="schoolSlug"
                                            value={formData.schoolSlug}
                                            onChange={handleChange}
                                            required
                                            className="block w-full rounded-2xl border-stone-200 bg-stone-50/40 py-4.5 px-5 pr-10 text-sm font-black text-stone-900 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all border appearance-none cursor-pointer"
                                        >
                                            <option value="">Select University...</option>
                                            {SCHOOLS.map(school => (
                                                <option key={school.slug} value={school.slug}>
                                                    {school.name}
                                                </option>
                                            ))}
                                        </select>
                                        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 flex items-center text-stone-400">
                                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>

                                {/* Physical Address */}
                                <div className="space-y-3.5">
                                    <label className="text-[10px] font-black uppercase tracking-[0.25em] text-stone-400 flex items-center gap-2">
                                        <MapPin className="h-3.5 w-3.5 text-amber-600" /> Physical Address
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            name="location"
                                            placeholder="Area, Street or Landmark"
                                            value={formData.location}
                                            onChange={handleChange}
                                            required
                                            className="block w-full rounded-2xl border-stone-200 bg-stone-50/40 py-4.5 px-5 text-sm font-black text-stone-900 placeholder:text-stone-300 focus:bg-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all border"
                                        />
                                        <AnimatePresence>
                                            {isGeocoding && (
                                                <motion.div 
                                                    initial={{ opacity: 0, scale: 0.9 }}
                                                    animate={{ opacity: 1, scale: 1 }}
                                                    exit={{ opacity: 0, scale: 0.9 }}
                                                    className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-700 rounded-full text-[8px] font-black uppercase tracking-widest shadow-sm"
                                                >
                                                    <span className="h-1.5 w-1.5 bg-amber-600 rounded-full animate-ping" />
                                                    Auto-Pinning
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* SECTION 3: DIGITAL MAPPING */}
                        <motion.section 
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="bg-white p-8 md:p-12 rounded-[2rem] shadow-sm border border-stone-200/60 overflow-hidden"
                        >
                            <div className="flex items-center gap-3.5 mb-5 border-l-4 border-amber-600 pl-5">
                                <h2 className="text-xl font-black text-stone-950 tracking-tight">Interactive Map Setup</h2>
                                <span className="h-px flex-1 bg-stone-100" />
                            </div>

                            <p className="text-stone-500 font-semibold text-xs leading-relaxed max-w-2xl mb-8">
                                Drag or click on the map to set a manual location coordinate. Correct GPS coordinates are required for students using the campus search portal.
                            </p>

                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                                {/* Coordinates terminal panel */}
                                <div className="lg:col-span-4 space-y-6">
                                    <div className="p-6 rounded-2xl bg-stone-900 border border-stone-850 text-white relative overflow-hidden group shadow-md">
                                        <div className="relative z-10">
                                            <div className="flex items-center gap-2 mb-3">
                                                <Compass className="h-4 w-4 text-amber-500 animate-spin [animation-duration:6s]" />
                                                <p className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-400">Positioning Coordinates</p>
                                            </div>
                                            <p className="text-xl font-mono font-black text-amber-500 tracking-tight break-all">
                                                {formData.gpsCoordinates || '0.000000, 0.000000'}
                                            </p>
                                        </div>
                                        <Navigation className="absolute -right-6 -bottom-6 h-24 w-24 text-white/5 rotate-12 transition-transform duration-700" />
                                    </div>

                                    <div className="p-5 rounded-2xl bg-amber-50 border border-amber-100/50 flex gap-3.5 items-start">
                                        <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                                        <p className="text-[11px] text-amber-800 font-bold leading-relaxed">
                                            Auto-Pinning updates coordinates dynamically as you type the physical address. If incorrect, simply select the location directly on the map.
                                        </p>
                                    </div>
                                </div>

                                {/* Interactive Map picker */}
                                <div className="lg:col-span-8 h-[400px] rounded-3xl overflow-hidden border border-stone-250/70 shadow-sm relative group">
                                    <LocationPicker 
                                        value={formData.gpsCoordinates} 
                                        onChange={(val) => setFormData(prev => ({ ...prev, gpsCoordinates: val }))} 
                                    />
                                    <div className="absolute top-4 left-4 z-[1000]">
                                        <div className="flex items-center gap-2 px-3 py-1.5 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-stone-150/40">
                                            <MapIcon className="h-3.5 w-3.5 text-stone-900" />
                                            <span className="text-[9px] font-black uppercase tracking-widest text-stone-900">Interactive Location Picker</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.section>

                        {/* STICKY FOOTER ACTION ACTION BAR */}
                        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-t border-stone-200/80 p-5 md:p-6 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
                            <div className="mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-8 w-8 bg-emerald-50 rounded-full flex items-center justify-center border border-emerald-100">
                                        <CheckCircle2 className="h-4.5 w-4.5 text-emerald-600" />
                                    </div>
                                    <p className="text-[10px] text-stone-500 font-bold leading-relaxed max-w-xs">
                                        Proceed to step 2: configure individual hostel room details.
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full sm:w-auto group inline-flex items-center justify-center gap-3 rounded-xl bg-stone-950 hover:bg-amber-600 px-10 py-4.5 text-xs font-black uppercase tracking-widest text-white shadow-md transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {loading ? 'Saving Property...' : 'Save & Continue'}
                                    <ArrowRight className="h-4.5 w-4.5 transition-transform group-hover:translate-x-1" />
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="p-5 rounded-2xl bg-rose-50 border border-rose-100 flex items-center gap-3.5 text-rose-700 font-bold text-xs shadow-sm">
                                <AlertCircle className="h-5 w-5" />
                                {error}
                            </div>
                        )}
                    </form>
                )}
            </div>
        </div>
    );
}

export default function NewHostelPage() {
    return (
        <RequireAuth role="AGENT">
            <NewHostelContent />
        </RequireAuth>
    );
}

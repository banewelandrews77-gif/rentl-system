"use client";

import { useEffect, useState, useMemo } from "react";
import { useParams, useSearchParams } from "next/navigation";
import { API_BASE, Hostel } from "@/lib/api";
import { SCHOOL_MAP } from "@/lib/constants";
import { MapPin, Search, ArrowLeft } from "lucide-react";
import HostelCard from "@/app/components/HostelCard";
import Map from "@/app/components/Map";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function SchoolHostelsPage() {
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const schoolConfig = SCHOOL_MAP[slug as keyof typeof SCHOOL_MAP] || { name: slug, short: slug, locationQuery: slug };

    const budgetFilter = searchParams.get("budget");
    const occupancyFilter = searchParams.get("occupancy");

    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchHostels = async () => {
            try {
                const res = await fetch(`${API_BASE}/public/hostels`);
                if (!res.ok) throw new Error("Failed to fetch hostels");
                const data = await res.json();
                setHostels(data);
            } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
                setError(err.message || "An error occurred");
            } finally {
                setLoading(false);
            }
        };

        fetchHostels();
    }, [slug]);

    // Filter hostels specific to the school's location query
    const filteredHostels = useMemo(() => {
        return hostels.filter((hostel) => {
            // First check for direct schoolSlug match (reliable)
            // If not available (old hostels), fallback to location/description fuzzy matching
            const matchesSchool = hostel.schoolSlug === slug ||
                hostel.location.toLowerCase().includes(schoolConfig.locationQuery.toLowerCase()) ||
                hostel.description.toLowerCase().includes(schoolConfig.locationQuery.toLowerCase());

            // Budget filter
            let matchesBudget = true;
            if (budgetFilter) {
                matchesBudget = hostel.roomTypes.some(room => {
                    if (budgetFilter === "low") return room.pricePerYear < 5000;
                    if (budgetFilter === "mid") return room.pricePerYear >= 5000 && room.pricePerYear <= 10000;
                    if (budgetFilter === "high") return room.pricePerYear > 10000;
                    return true;
                });
            }

            // Occupancy filter
            let matchesOccupancy = true;
            if (occupancyFilter) {
                matchesOccupancy = hostel.roomTypes.some(room => 
                    room.capacity.toString() === occupancyFilter
                );
            }

            // Secondary text search filtering
            const matchesSearch =
                hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                hostel.location.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesSchool && matchesSearch && matchesBudget && matchesOccupancy;
        });
    }, [hostels, searchQuery, schoolConfig, slug, budgetFilter, occupancyFilter]);

    if (loading) {
        return (
            <div className="flex min-h-[70vh] items-center justify-center flex-col gap-4">
                <div className="relative flex h-16 w-16 items-center justify-center">
                    <span className="absolute inset-0 rounded-full border-4 border-amber-200 opacity-20"></span>
                    <span className="absolute inset-0 rounded-full border-4 border-amber-600 border-t-transparent animate-spin"></span>
                </div>
                <p className="text-stone-500 font-medium animate-pulse">Finding hostels near {schoolConfig.short}...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                <div className="rounded-2xl bg-red-50 p-8 text-center text-red-700 ring-1 ring-red-200">
                    <p className="font-bold text-lg mb-2">Error loading hostels</p>
                    <p className="text-red-600/80">{error}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-stone-50/50 pb-12">
            {/* Dynamic Hero Area for the School */}
            <div className="bg-stone-900 border-b border-stone-800 relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-10 mix-blend-luminosity"></div>
                <div className="absolute inset-0 bg-gradient-to-t from-stone-900 via-stone-900/80 to-transparent"></div>

                <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <Link href="/" className="inline-flex items-center gap-2 text-stone-400 hover:text-white transition-colors mb-6 text-sm font-medium">
                        <ArrowLeft className="h-4 w-4" /> Back to Home
                    </Link>
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
                    >
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-stone-800 text-amber-500 border border-stone-700 text-xs font-bold uppercase tracking-widest mb-4">
                                <MapPin className="h-3.5 w-3.5" /> {schoolConfig.short} Campus
                            </div>
                            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white drop-shadow-sm">
                                Hostels near <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600">{schoolConfig.short}</span>
                            </h1>
                            <p className="mt-3 text-lg text-stone-300 font-medium">
                                Browsing available student accommodations around {schoolConfig.name}.
                            </p>
                        </div>

                        <div className="w-full md:w-auto relative group">
                            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400 group-focus-within:text-amber-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search specific locations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full md:w-72 rounded-xl border-0 bg-stone-800/80 py-3.5 pl-12 pr-4 text-sm font-medium text-white placeholder:text-stone-500 focus:ring-2 focus:ring-amber-500 focus:bg-stone-800 shadow-inner backdrop-blur-sm transition-all outline-none"
                            />
                        </div>
                    </motion.div>
                </div>
            </div>

            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
                    <div className="order-2 lg:order-1 lg:col-span-3">
                        <AnimatePresence mode="popLayout">
                            {filteredHostels.length === 0 ? (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="flex h-[40vh] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-300 bg-white text-center shadow-sm"
                                >
                                    <div className="rounded-full bg-stone-100 p-4 mb-4">
                                        <MapPin className="h-8 w-8 text-stone-400" />
                                    </div>
                                    <h3 className="text-xl font-bold text-stone-900">
                                        No hostels found near {schoolConfig.short}
                                    </h3>
                                    <p className="mt-2 text-sm text-stone-500 max-w-sm">
                                        We couldn&apos;t find any listings matching this area. Check back later or clear your search filters.
                                    </p>
                                </motion.div>
                            ) : (
                                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                    {filteredHostels.map((hostel, i) => (
                                        <HostelCard key={hostel.id} hostel={hostel} index={i} />
                                    ))}
                                </div>
                            )}
                        </AnimatePresence>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="order-1 h-[400px] lg:sticky lg:top-8 lg:order-2 lg:col-span-2 lg:h-[calc(100vh-8rem)] rounded-3xl overflow-hidden shadow-lg ring-1 ring-stone-900/5 bg-stone-100"
                    >
                        <Map hostels={filteredHostels} />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

"use client";

import { useEffect, useState, useMemo, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { API_BASE } from "@/lib/api";
import { Search, MapPin, SlidersHorizontal, Map as MapIcon, List as ListIcon } from "lucide-react";
import HostelCard, { HostelSummary } from "../components/HostelCard";
import Map from "../components/Map";
import { motion, AnimatePresence } from "framer-motion";

function ListingsContent() {
  const [hostels, setHostels] = useState<HostelSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const searchParams = useSearchParams();
  const budgetParam = searchParams.get("budget");
  const occupancyParam = searchParams.get("occupancy");

  const [searchQuery, setSearchQuery] = useState("");
  const [locationFilter, setLocationFilter] = useState(searchParams.get("location") || "");
  const [showMapMobile, setShowMapMobile] = useState(false);

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
  }, []);

  const filteredHostels = useMemo(() => {
    return hostels.filter((hostel) => {
      const matchesSearch =
        hostel.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        hostel.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesLocation = hostel.location
        .toLowerCase()
        .includes(locationFilter.toLowerCase());

      // Budget filter
      let matchesBudget = true;
      if (budgetParam) {
        matchesBudget = hostel.roomTypes.some(room => {
          if (budgetParam === "low") return room.pricePerYear < 5000;
          if (budgetParam === "mid") return room.pricePerYear >= 5000 && room.pricePerYear <= 10000;
          if (budgetParam === "high") return room.pricePerYear > 10000;
          return true;
        });
      }

      // Occupancy filter
      let matchesOccupancy = true;
      if (occupancyParam) {
        matchesOccupancy = hostel.roomTypes.some(room => 
          room.capacity.toString() === occupancyParam
        );
      }

      return matchesSearch && matchesLocation && matchesBudget && matchesOccupancy;
    });
  }, [hostels, searchQuery, locationFilter, budgetParam, occupancyParam]);

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center flex-col gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-4 border-amber-200 opacity-20"></span>
          <span className="absolute inset-0 rounded-full border-4 border-amber-600 border-t-transparent animate-spin"></span>
        </div>
        <p className="text-stone-500 font-medium animate-pulse">Loading amazing places...</p>
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
      {/* Premium Header Area */}
      <div className="bg-white border-b border-stone-200/60 sticky top-0 z-40 bg-white/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-6 lg:flex-row lg:items-end justify-between"
          >
            <div className="max-w-xl">
              <h1 className="text-4xl font-extrabold tracking-tight text-stone-900 drop-shadow-sm">
                Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-amber-800">Hostels</span>
              </h1>
              <p className="mt-2 text-lg text-stone-600 font-medium tracking-wide">
                Find the perfect place to stay safely near your campus.
              </p>
            </div>

            {/* Floating Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 w-full lg:w-auto p-2 bg-stone-100/50 rounded-2xl ring-1 ring-stone-200">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Search by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500 shadow-sm transition-shadow"
                />
              </div>
              <div className="relative w-full sm:w-64">
                <MapPin className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-stone-400" />
                <input
                  type="text"
                  placeholder="Filter by location..."
                  value={locationFilter}
                  onChange={(e) => setLocationFilter(e.target.value)}
                  className="w-full rounded-xl border-0 bg-white py-3 pl-11 pr-4 text-sm font-medium text-stone-800 placeholder:text-stone-400 focus:ring-2 focus:ring-amber-500 shadow-sm transition-shadow"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <p className="text-sm font-bold text-stone-500 uppercase tracking-wider">
            {filteredHostels.length} {filteredHostels.length === 1 ? 'Result' : 'Results'} found
          </p>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setShowMapMobile(!showMapMobile)}
              className="lg:hidden inline-flex items-center gap-2 rounded-xl bg-amber-600 px-4 py-2 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-amber-600/20 active:scale-95 transition-all"
            >
              {showMapMobile ? <ListIcon className="h-4 w-4" /> : <MapIcon className="h-4 w-4" />}
              {showMapMobile ? 'Show List' : 'Show Map'}
            </button>
            <button className="inline-flex items-center gap-2 text-sm font-medium text-stone-600 hover:text-stone-900 transition-colors">
              <SlidersHorizontal className="h-4 w-4" /> Filters
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
          <div className={`order-2 lg:order-1 lg:col-span-3 ${showMapMobile ? 'hidden lg:block' : 'block'}`}>
            <AnimatePresence mode="popLayout">
              {filteredHostels.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex h-[40vh] flex-col items-center justify-center rounded-3xl border-2 border-dashed border-stone-200 bg-white text-center shadow-sm"
                >
                  <div className="rounded-full bg-stone-100 p-4 mb-4">
                    <Search className="h-8 w-8 text-stone-400" />
                  </div>
                  <h3 className="text-xl font-bold text-stone-900">
                    No hostels found
                  </h3>
                  <p className="mt-2 text-sm text-stone-500 max-w-xs">
                    Try adjusting your search filters to find what you&apos;re looking for.
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
            className={`order-1 lg:sticky lg:top-32 lg:order-2 lg:col-span-2 rounded-3xl overflow-hidden shadow-2xl ring-1 ring-stone-900/5 bg-stone-100 
              ${showMapMobile ? 'block h-[calc(100vh-200px)]' : 'hidden lg:block lg:h-[calc(100vh-10rem)]'}
            `}
          >
            <Map hostels={filteredHostels} locationFilter={locationFilter} />
          </motion.div>
        </div>
      </div>
    </div>
  );
}

export default function ListingsPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-[70vh] items-center justify-center flex-col gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-4 border-amber-200 opacity-20"></span>
          <span className="absolute inset-0 rounded-full border-4 border-amber-600 border-t-transparent animate-spin"></span>
        </div>
        <p className="text-stone-500 font-medium animate-pulse">Loading amazing places...</p>
      </div>
    }>
      <ListingsContent />
    </Suspense>
  );
}

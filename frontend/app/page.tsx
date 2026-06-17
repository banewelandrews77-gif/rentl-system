'use client';

import { motion } from "framer-motion";
import { 
  Search, 
  GraduationCap,
  Banknote,
  LayoutGrid
} from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { SCHOOLS } from "@/lib/constants";

export default function Home() {
  const router = useRouter();
  const [searchParams, setSearchParams] = useState({
    campus: "",
    budget: "",
    type: ""
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const query = new URLSearchParams();
    
    // Add optional filters
    if (searchParams.budget) query.append("budget", searchParams.budget);
    if (searchParams.type) query.append("occupancy", searchParams.type);

    if (searchParams.campus) {
      // Direct to specific school page
      router.push(`/schools/${searchParams.campus}?${query.toString()}`);
    } else {
      // Direct to generic listings page
      router.push(`/listings?${query.toString()}`);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1, delayChildren: 0.2 }
    }
  };

  const itemVariants: import("framer-motion").Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 100, damping: 20 } }
  };

  return (
    <div className="relative min-h-screen bg-white selection:bg-amber-200">
      
      {/* --- HERO & SEARCH CONSOLE --- */}
      <section className="relative overflow-hidden bg-stone-50 pt-32 pb-32 lg:pt-48 lg:pb-56">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        
        {/* Background Blobs */}
        <div className="absolute top-0 -left-1/4 w-full h-[800px] bg-amber-400/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 -right-1/4 w-full h-[800px] bg-rose-400/10 rounded-full blur-[140px] pointer-events-none" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="text-center max-w-4xl mx-auto"
          >
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white border border-stone-200 text-stone-900 text-[10px] font-black mb-8 uppercase tracking-[0.2em] shadow-sm">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              The Standard in Student Living
            </motion.div>

            <motion.h1 variants={itemVariants} className="text-6xl font-black tracking-tighter text-stone-950 sm:text-7xl md:text-9xl mb-8 leading-[0.85]">
              Find your <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600">place.</span>
            </motion.h1>

            <motion.p variants={itemVariants} className="text-xl text-stone-600 mb-16 leading-relaxed max-w-2xl mx-auto font-medium">
              Eliminate the stress of room hunting. Discover, verify, and book the most premium hostels across Ghana in seconds.
            </motion.p>

            {/* --- WEBAPP SEARCH CONSOLE --- */}
            <motion.div 
              variants={itemVariants}
              className="relative max-w-5xl mx-auto"
            >
              <div className="absolute -inset-4 bg-gradient-to-r from-amber-500/20 to-rose-500/20 rounded-[3rem] blur-2xl opacity-50" />
              <form 
                onSubmit={handleSearch}
                className="relative bg-white p-4 md:p-6 rounded-[2.5rem] shadow-2xl border border-stone-100 flex flex-col md:flex-row items-stretch gap-4 md:gap-2"
              >
                {/* Campus Input */}
                <div className="flex-1 text-left px-6 py-4 rounded-2xl hover:bg-stone-50 transition-colors border-r border-stone-100">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-2">
                    <GraduationCap className="h-3 w-3" /> Campus Location
                  </label>
                  <select 
                    value={searchParams.campus}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, campus: e.target.value }))}
                    className="w-full bg-transparent border-none p-0 text-lg font-black text-stone-900 focus:ring-0 placeholder:text-stone-300"
                  >
                    <option value="">Select a campus...</option>
                    {SCHOOLS.map(school => (
                      <option key={school.slug} value={school.slug}>
                        {school.short}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Budget Select */}
                <div className="flex-1 text-left px-6 py-4 rounded-2xl hover:bg-stone-50 transition-colors border-r border-stone-100">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-2">
                    <Banknote className="h-3 w-3" /> Yearly Budget
                  </label>
                  <select 
                    value={searchParams.budget}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, budget: e.target.value }))}
                    className="w-full bg-transparent border-none p-0 text-lg font-black text-stone-900 focus:ring-0 placeholder:text-stone-300"
                  >
                    <option value="">Any price range</option>
                    <option value="low">Under GHS 5,000</option>
                    <option value="mid">GHS 5,000 - 10,000</option>
                    <option value="high">GHS 10,000+</option>
                  </select>
                </div>

                {/* Room Type */}
                <div className="flex-1 text-left px-6 py-4 rounded-2xl hover:bg-stone-50 transition-colors">
                  <label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2 mb-2">
                    <LayoutGrid className="h-3 w-3" /> Occupancy
                  </label>
                  <select 
                    value={searchParams.type}
                    onChange={(e) => setSearchParams(prev => ({ ...prev, type: e.target.value }))}
                    className="w-full bg-transparent border-none p-0 text-lg font-black text-stone-900 focus:ring-0 placeholder:text-stone-300"
                  >
                    <option value="">All room types</option>
                    <option value="1">1-in-a-room</option>
                    <option value="2">2-in-a-room</option>
                    <option value="3">3-in-a-room</option>
                    <option value="4">4-in-a-room</option>
                  </select>
                </div>

                {/* Action Button */}
                <button 
                  type="submit"
                  className="bg-stone-950 text-white rounded-[1.8rem] px-10 py-5 flex items-center justify-center gap-3 hover:bg-amber-600 transition-all shadow-xl shadow-stone-950/20 active:scale-95 group"
                >
                  <span className="text-sm font-black uppercase tracking-widest">Search</span>
                  <Search className="h-5 w-5 group-hover:rotate-12 transition-transform" />
                </button>
              </form>
            </motion.div>
          </motion.div>
        </div>
      </section>


      <style jsx global>{`
        select {
          -webkit-appearance: none;
          -moz-appearance: none;
          appearance: none;
        }
      `}</style>
    </div>
  );
}

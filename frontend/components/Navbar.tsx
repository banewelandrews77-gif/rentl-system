'use client';

import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { 
  Home, 
  HelpCircle, 
  LayoutDashboard, 
  LogOut, 
  User, 
  LogIn, 
  UserPlus,
  Shield,
  Building,
  Menu,
  X,
  Zap
} from 'lucide-react';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { usePathname } from 'next/navigation';
import { Logo } from './Logo';

export function Navbar() {
  const { user, role, logout, ready } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '/', icon: Home },
    { name: 'Support', href: '/support', icon: HelpCircle },
  ];

  const getDashboardLink = () => {
    if (role === 'CUSTOMER') return { name: 'Dashboard', href: '/dashboard/customer', icon: LayoutDashboard };
    if (role === 'AGENT') return { name: 'Dashboard', href: '/dashboard/agent', icon: Building };
    if (role === 'ADMIN') return { name: 'Admin', href: '/admin', icon: Shield };
    return null;
  };

  const dashboardLink = getDashboardLink();
  const isHomePage = pathname === '/';

  const [latestListings, setLatestListings] = useState<any[]>([]);
  const [tickerLoading, setTickerLoading] = useState(true);

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api'}/public/hostels`);
        if (res.ok) {
          const data = await res.json();
          // Sort by latest (assuming ID or some logic, but let's just take the first 5)
          setLatestListings(data.slice(0, 5));
        }
      } catch (err) {
        console.error("Ticker fetch failed", err);
      } finally {
        setTickerLoading(false);
      }
    };
    fetchLatest();
  }, []);

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] transition-all duration-300">
      
      {/* --- LIVE ACTIVITY TICKER (Dynamic Platform Feed) --- */}
      <AnimatePresence>
        {isHomePage && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-stone-950 py-2.5 overflow-hidden relative z-[110]"
          >
            <div className="flex whitespace-nowrap animate-marquee">
              {[1,2,3].map(loop => (
                <div key={loop} className="flex items-center gap-10 mx-10">
                  {latestListings.length > 0 ? (
                    latestListings.map((h, i) => (
                      <div key={`${loop}-${h.id}`} className="flex items-center gap-10">
                        <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                          <Zap className="h-3 w-3 fill-amber-500" /> New Listing
                        </span>
                        <span className="text-[11px] font-bold text-white/90 tracking-wide">
                          <span className="text-amber-400">{h.name}</span> - {h.location}
                        </span>
                        <span className="h-1 w-1 rounded-full bg-stone-700" />
                      </div>
                    ))
                  ) : (
                    <>
                      <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-amber-500">
                        <Zap className="h-3 w-3 fill-amber-500" /> System
                      </span>
                      <span className="text-[11px] font-bold text-white/90 tracking-wide">
                        Platform performing optimally. All systems <span className="text-emerald-400">ONLINE</span>
                      </span>
                    </>
                  )}
                  {/* Generic dynamic events if data is sparse */}
                  <span className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
                    <Zap className="h-3 w-3 fill-blue-500" /> Activity
                  </span>
                  <span className="text-[11px] font-bold text-white/90 tracking-wide">
                    New student registered from <span className="text-blue-400">Legon</span>
                  </span>
                  <span className="h-1 w-1 rounded-full bg-stone-700" />
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN NAVIGATION --- */}
      <nav 
        className={`transition-all duration-300 ${
          scrolled || !isHomePage
            ? 'bg-white/80 backdrop-blur-xl border-b border-stone-200 py-3 shadow-sm' 
            : 'bg-transparent py-5'
        }`}
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <Logo scrolled={scrolled} isHomePage={isHomePage} />
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            <div className="flex items-center gap-6 border-r border-stone-200 pr-8">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  className={`flex items-center gap-2 text-sm font-bold transition-colors ${
                    scrolled || !isHomePage ? 'text-stone-500 hover:text-stone-950' : 'text-stone-600 hover:text-stone-950'
                  }`}
                >
                  <link.icon className="h-4 w-4" />
                  {link.name}
                </Link>
              ))}
            </div>

            <div className="flex items-center gap-4">
              {!ready ? (
                <div className="h-8 w-24 bg-stone-100 animate-pulse rounded-lg" />
              ) : user ? (
                <div className="flex items-center gap-4">
                  {dashboardLink && (
                    <Link 
                      href={dashboardLink.href}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl bg-amber-50 text-amber-700 text-sm font-bold hover:bg-amber-100 transition-colors shadow-sm"
                    >
                      <dashboardLink.icon className="h-4 w-4" />
                      {dashboardLink.name}
                    </Link>
                  )}
                  
                  <div className="flex items-center gap-3 pl-4 border-l border-stone-100">
                    <div className="text-right hidden lg:block">
                      <p className="text-xs font-black text-stone-950 truncate max-w-[120px]">{user.fullName}</p>
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{role}</p>
                    </div>
                    <button
                      onClick={logout}
                      className="p-2 rounded-xl text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-all"
                      title="Logout"
                    >
                      <LogOut className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <Link 
                    href="/login" 
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-black text-stone-600 hover:text-stone-950 transition-colors"
                  >
                    <LogIn className="h-4 w-4" />
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-stone-950 text-white text-sm font-black hover:bg-stone-800 shadow-xl shadow-stone-950/10 transition-all active:scale-95"
                  >
                    <UserPlus className="h-4 w-4" />
                    Join Now
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden p-2 text-stone-950"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="absolute top-full left-0 right-0 bg-white border-b border-stone-200 p-4 md:hidden shadow-2xl shadow-stone-950/20"
          >
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.name} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-stone-50 text-stone-950 font-bold"
                >
                  <link.icon className="h-5 w-5 text-stone-400" />
                  {link.name}
                </Link>
              ))}
              {user && dashboardLink && (
                <Link 
                  href={dashboardLink.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-amber-50 text-amber-700 font-bold"
                >
                  <dashboardLink.icon className="h-5 w-5" />
                  {dashboardLink.name}
                </Link>
              )}
              {!user && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <Link href="/login" className="flex items-center justify-center p-4 rounded-2xl border border-stone-200 font-black text-stone-600">Login</Link>
                  <Link href="/register" className="flex items-center justify-center p-4 rounded-2xl bg-stone-950 text-white font-black">Register</Link>
                </div>
              )}
              {user && (
                <button 
                  onClick={logout}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-rose-50 text-rose-600 font-bold"
                >
                  <LogOut className="h-5 w-5" />
                  Logout
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <style jsx global>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </header>
  );
}

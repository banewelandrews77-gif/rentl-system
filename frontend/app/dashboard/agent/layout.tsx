'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/context/AuthContext';
import { 
  LayoutDashboard, 
  Building2, 
  MessageSquare, 
  CreditCard,
  Menu,
  X,
  ShieldCheck,
  AlertCircle,
  Star
} from 'lucide-react';

export default function AgentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { verificationStatus, user } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { name: 'Overview', href: '/dashboard/agent', icon: LayoutDashboard },
    { name: 'Properties', href: '/dashboard/agent/hostels', icon: Building2 },
    { name: 'Inquiries', href: '/dashboard/agent/inquiries', icon: MessageSquare },
    { name: 'Reviews', href: '/dashboard/agent/reviews', icon: Star },
    { name: 'Subscription', href: '/dashboard/agent/subscription', icon: CreditCard },
  ];

  const isVerified = verificationStatus === 'VERIFIED';

  return (
    <RequireAuth role="AGENT">
      <div className="min-h-screen bg-stone-50 flex flex-col md:flex-row font-sans">
        {/* Mobile Nav Header */}
        <div className="md:hidden bg-stone-950 text-white flex items-center justify-between p-4 sticky top-0 z-50">
          <div className="font-black text-lg tracking-tight">Agent<span className="text-emerald-400">Hub</span></div>
          <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Sidebar Navigation */}
        <aside className={`${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        } md:translate-x-0 fixed md:sticky top-0 md:top-0 left-0 z-40 w-64 h-screen bg-stone-950 text-stone-300 transition-transform duration-300 ease-in-out border-r border-stone-800 flex flex-col`}>
          
          <div className="p-6 hidden md:block">
            <div className="font-black text-2xl tracking-tight text-white mb-1">Agent<span className="text-emerald-400">Hub</span></div>
            <div className="text-xs font-bold uppercase tracking-widest text-stone-500">Partner Portal</div>
          </div>

          <div className="px-4 py-4 md:pt-0">
            {/* User Info */}
            <div className="mb-8 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center gap-3 mb-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-bold text-lg shadow-inner">
                  {user?.fullName?.charAt(0) || 'A'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-bold text-white truncate">{user?.fullName || 'Agent'}</div>
                  <div className="text-xs text-stone-400 truncate">{user?.email}</div>
                </div>
              </div>
              <div className={`flex items-center justify-center gap-1.5 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest ${
                isVerified 
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {isVerified ? <ShieldCheck className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                {isVerified ? 'Verified' : 'Pending Verification'}
              </div>
            </div>

            <nav className="space-y-2">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard/agent');
                
                // Disable certain routes if not verified
                const isDisabled = !isVerified && item.name !== 'Overview';

                if (isDisabled) {
                  return (
                    <div key={item.name} className="flex items-center gap-3 px-4 py-3 rounded-xl text-stone-600 opacity-50 cursor-not-allowed" title="Account verification required">
                      <item.icon className="h-5 w-5" />
                      <span className="font-medium">{item.name}</span>
                    </div>
                  );
                }

                return (
                  <Link 
                    key={item.name} 
                    href={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                      isActive 
                        ? 'bg-emerald-500/10 text-emerald-400 font-bold' 
                        : 'hover:bg-white/5 hover:text-white font-medium'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 ${isActive ? 'text-emerald-400' : 'text-stone-500 group-hover:text-stone-300'}`} />
                    <span>{item.name}</span>
                    {isActive && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                  </Link>
                );
              })}
            </nav>
          </div>
          
          <div className="mt-auto p-6">
            <Link href="/" className="text-xs font-bold text-stone-500 hover:text-white uppercase tracking-widest transition-colors flex items-center gap-2">
              Return to Website
            </Link>
          </div>
        </aside>

        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div 
            className="fixed inset-0 bg-stone-950/80 backdrop-blur-sm z-30 md:hidden" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}

        {/* Main Content Area */}
        <main className="flex-1 w-full min-w-0 flex flex-col h-screen overflow-y-auto bg-stone-50">
          {children}
        </main>
      </div>
    </RequireAuth>
  );
}

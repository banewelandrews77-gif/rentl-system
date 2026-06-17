'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { useAuth } from '@/context/AuthContext';
import { agentSubscriptionApi, agentApi, AgentProfileResponse } from '@/lib/api';
import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Zap, 
  AlertCircle, 
  Calendar, 
  Hourglass, 
  AlertTriangle,
  RefreshCw 
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';

function SubscriptionContent() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<AgentProfileResponse | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [loading, setLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const data = await agentApi.getProfileMe();
      setProfile(data);
    } catch (err: any) {
      console.error('Failed to fetch profile', err);
      toast.error('Failed to load subscription details');
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      const { authorizationUrl } = await agentSubscriptionApi.initialize();
      window.location.href = authorizationUrl;
    } catch (err: any) {
      toast.error(err.message || 'Failed to initialize payment');
    } finally {
      setLoading(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center flex-col gap-4">
        <div className="relative flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 rounded-full border-4 border-amber-200 opacity-20"></span>
          <span className="absolute inset-0 rounded-full border-4 border-amber-600 border-t-transparent animate-spin"></span>
        </div>
        <p className="text-stone-500 font-medium animate-pulse">Loading subscription status...</p>
      </div>
    );
  }

  // 1. Unverified State Check
  const isVerified = profile?.verificationStatus === 'VERIFIED';
  if (!isVerified) {
    return (
      <div className="mx-auto max-w-4xl px-4 py-12 w-full">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white rounded-3xl border border-stone-200 p-8 md:p-12 text-center shadow-sm"
        >
          <div className="h-20 w-20 bg-amber-50 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-6 border border-amber-200">
            <AlertCircle className="h-10 w-10 animate-bounce" />
          </div>
          <h2 className="text-2xl font-black text-stone-900 tracking-tight">Verification Required</h2>
          <p className="mt-4 text-stone-600 max-w-xl mx-auto leading-relaxed">
            Your agent profile is currently **{profile?.verificationStatus || 'UNVERIFIED'}**. To maintain platform safety, you must complete your identity verification before subscribing to premium plans.
          </p>
          <div className="mt-8">
            <a 
              href="/dashboard/agent" 
              className="inline-flex items-center gap-2 bg-stone-950 text-white font-bold px-8 py-4 rounded-xl hover:bg-stone-800 transition-colors shadow-lg active:scale-95"
            >
              Go to Identity Verification
            </a>
          </div>
        </motion.div>
      </div>
    );
  }

  // 2. Parse Subscription Dates
  const validUntilStr = profile?.subscriptionValidUntil;
  const now = new Date();
  const validUntil = validUntilStr ? new Date(validUntilStr) : null;
  const isSubscribed = validUntil !== null && validUntil > now;
  const isExpired = validUntil !== null && validUntil <= now;

  // Compute remaining days
  let daysRemaining = 0;
  let percentRemaining = 0;
  if (isSubscribed && validUntil) {
    const diffTime = Math.abs(validUntil.getTime() - now.getTime());
    daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    // Assumed billing cycle of 365 days
    percentRemaining = Math.min(Math.max((daysRemaining / 365) * 100, 0), 100);
  }

  const formattedExpiryDate = validUntil 
    ? validUntil.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
    : '';

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 w-full">
      <header className="mb-10 text-center">
        <h1 className="text-3xl md:text-4xl font-black tracking-tight text-stone-950">
          Agent Subscription Portal
        </h1>
        <p className="mt-3 text-stone-500 max-w-2xl mx-auto">
          Ensure your properties remain active and connect directly with thousands of potential student tenants near leading Ghanaian universities.
        </p>
      </header>

      {/* Dynamic Stateful Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Plan Details & Subscription Form */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* STATE: Active Subscription */}
          {isSubscribed && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 border border-emerald-200/80 shadow-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-100 pb-6 mb-6">
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-black uppercase tracking-wider border border-emerald-200/50">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping"></span>
                    Active Subscription
                  </div>
                  <h3 className="text-xl font-extrabold text-stone-900 mt-3">Annual Professional Plan</h3>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-stone-400 font-bold uppercase tracking-wider">Plan Duration</p>
                  <p className="text-lg font-black text-stone-950">365 Days (1 Year)</p>
                </div>
              </div>

              {/* Progress & Expiration Status */}
              <div className="space-y-6 mb-8">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="font-bold text-stone-500">Days Remaining</span>
                    <span className="font-black text-stone-900">{daysRemaining} days left</span>
                  </div>
                  <div className="h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-500 ${
                        daysRemaining < 30 ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentRemaining}%` }}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-stone-400" />
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Expiration Date</p>
                      <p className="text-sm font-bold text-stone-800">{formattedExpiryDate}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Hourglass className="h-5 w-5 text-stone-400" />
                    <div>
                      <p className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Remaining Ratio</p>
                      <p className="text-sm font-bold text-stone-800">{Math.round(percentRemaining)}% of cycle</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Renewal Section */}
              <div className="bg-amber-50/50 rounded-2xl p-6 border border-amber-100">
                <h4 className="font-extrabold text-amber-900 flex items-center gap-2 text-sm uppercase tracking-wide">
                  <RefreshCw className="h-4 w-4 text-amber-600 animate-spin-slow" />
                  Pre-emptive Renewal Available
                </h4>
                <p className="text-xs text-amber-800/90 mt-2 leading-relaxed font-medium">
                  Extend your annual subscription early! We will add another **365 days** to your existing expiration date. Early renewal ensures no disruption to your listings or tenant inquiries, preserving your active remaining days.
                </p>
                <button
                  onClick={handleSubscribe}
                  disabled={loading}
                  className="mt-4 bg-amber-500 text-amber-950 font-black uppercase tracking-widest text-xs py-3 px-6 rounded-xl hover:bg-amber-400 transition-all shadow-md inline-flex items-center gap-2 active:scale-95 disabled:opacity-70"
                >
                  {loading ? 'Processing...' : 'Extend Expiration (GHS 50)'}
                </button>
              </div>

            </motion.div>
          )}

          {/* STATE: Expired Subscription */}
          {isExpired && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 border border-rose-200/80 shadow-md relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 h-40 w-40 bg-rose-500/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex items-start gap-4 border-b border-stone-100 pb-6 mb-6">
                <div className="h-12 w-12 rounded-xl bg-rose-50 border border-rose-100 text-rose-600 flex items-center justify-center flex-shrink-0">
                  <AlertTriangle className="h-6 w-6" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 text-xs font-black uppercase tracking-wider border border-rose-200/50">
                    Subscription Expired
                  </div>
                  <h3 className="text-xl font-extrabold text-stone-900 mt-3">Annual Professional Plan</h3>
                  <p className="text-xs text-stone-400 mt-1 font-bold">Your subscription expired on {formattedExpiryDate}</p>
                </div>
              </div>

              {/* Warning Banner */}
              <div className="bg-rose-50/50 rounded-2xl p-6 border border-rose-100 mb-8">
                <h4 className="font-extrabold text-rose-900 text-sm uppercase tracking-wide">
                  Listings Disabled
                </h4>
                <p className="text-xs text-rose-800/90 mt-2 leading-relaxed font-medium">
                  Your hostel listings are currently hidden from prospective student tenants. Reactivate your annual subscription to immediately restore visibility and continue receiving inquiries.
                </p>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-amber-500 text-amber-950 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-amber-400 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? 'Processing...' : 'Renew Now & Reactivate'}
              </button>
            </motion.div>
          )}

          {/* STATE: New Subscriber (Inactive) */}
          {!validUntil && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl p-8 border border-stone-200 shadow-sm"
            >
              <div className="border-b border-stone-100 pb-6 mb-6">
                <span className="text-xs font-black uppercase tracking-wider text-amber-600 bg-amber-50 border border-amber-100 px-3 py-1 rounded-full">
                  Subscription Options
                </span>
                <h3 className="text-xl font-extrabold text-stone-900 mt-4">Platform Registration Fee</h3>
                <p className="text-sm text-stone-500 mt-2">
                  Maintain verified status and unlimited listings on the premier student housing directory in Ghana.
                </p>
              </div>

              <div className="bg-stone-50 p-6 rounded-2xl border border-stone-100 mb-8">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-stone-900">GHS 50</span>
                  <span className="text-stone-400 font-bold">/ year</span>
                </div>
                <p className="text-xs text-stone-400 mt-2">Billed annually. Auto-expires unless manually renewed.</p>
              </div>

              <button
                onClick={handleSubscribe}
                disabled={loading}
                className="w-full bg-amber-500 text-amber-950 font-black uppercase tracking-widest py-4 rounded-xl hover:bg-amber-400 transition-colors shadow-lg flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-amber-950 border-t-transparent" />
                    Processing...
                  </>
                ) : (
                  <>
                    <CreditCard className="h-5 w-5" />
                    Activate Subscription
                  </>
                )}
              </button>
            </motion.div>
          )}
          
        </div>

        {/* Right Column: Premium Plan Features Checklist */}
        <div className="lg:col-span-5">
          <div className="bg-stone-950 rounded-3xl p-8 text-white relative overflow-hidden shadow-2xl border border-stone-850 group">
            {/* Background Glow */}
            <div className="absolute -top-24 -right-24 h-48 w-48 bg-amber-500/10 rounded-full blur-3xl group-hover:bg-amber-500/25 transition-all duration-500" />
            <div className="absolute -bottom-24 -left-24 h-48 w-48 bg-emerald-500/10 rounded-full blur-3xl group-hover:bg-emerald-500/25 transition-all duration-500" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-12 w-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
                  <Zap className="h-6 w-6" />
                </div>
                <h2 className="text-xl font-bold uppercase tracking-widest text-stone-200">Pro Features</h2>
              </div>

              <ul className="space-y-4 mb-8">
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-stone-300 font-medium">Unlimited property listings</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-stone-300 font-medium">Priority placement in search results</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-stone-300 font-medium">Direct student messenger connectivity</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-stone-300 font-medium">Verified Agent badge on public catalog</span>
                </li>
                <li className="flex items-center gap-3">
                  <div className="h-5 w-5 rounded-full bg-emerald-500/20 flex items-center justify-center text-emerald-400">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <span className="text-stone-300 font-medium">Hostel analytics & booking insights</span>
                </li>
              </ul>

              <div className="border-t border-stone-850 pt-6">
                <p className="text-xs text-stone-400 leading-relaxed flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-emerald-500 flex-shrink-0" />
                  All payments are strictly secure and dynamically verified via our integrated Paystack checkout link.
                </p>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

export default function SubscriptionPage() {
  return (
    <RequireAuth role="AGENT">
      <SubscriptionContent />
    </RequireAuth>
  );
}

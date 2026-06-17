'use client';

import Link from 'next/link';
import { adminApi, AdminDashboardResponse } from '@/lib/api';
import { RequireAuth } from '@/components/RequireAuth';
import { useEffect, useState } from 'react';
import { Users, Building2, UserCircle2, Clock } from 'lucide-react';

function AdminContent() {
  const [stats, setStats] = useState<AdminDashboardResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminApi.getStats()
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-3xl font-bold text-stone-900">Admin Dashboard</h1>
      <p className="mt-2 text-lg text-stone-600">Platform overview and management.</p>

      {/* Stats Grid */}
      <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total Customers</p>
              <p className="text-2xl font-bold text-stone-900">
                {loading ? '-' : stats?.totalCustomers}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <UserCircle2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Total Agents</p>
              <p className="text-2xl font-bold text-stone-900">
                {loading ? '-' : stats?.totalAgents}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Active Hostels</p>
              <p className="text-2xl font-bold text-stone-900">
                {loading ? '-' : stats?.totalHostels}
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
              <Clock className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-medium text-stone-500">Pending Verifications</p>
              <p className="text-2xl font-bold text-stone-900">
                {loading ? '-' : stats?.pendingVerifications}
              </p>
            </div>
          </div>
        </div>
      </div>

      <h2 className="mt-12 text-xl font-bold text-stone-900">Quick Links</h2>
      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Link href="/admin/verifications" className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-5 hover:border-amber-500 hover:shadow-md transition">
          <span className="font-semibold text-stone-800">Review Agents</span>
          <span className="text-stone-400">&rarr;</span>
        </Link>
        <Link href="/admin/customers" className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-5 hover:border-amber-500 hover:shadow-md transition">
          <span className="font-semibold text-stone-800">Manage Customers</span>
          <span className="text-stone-400">&rarr;</span>
        </Link>
        <Link href="/admin/agents" className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-5 hover:border-amber-500 hover:shadow-md transition">
          <span className="font-semibold text-stone-800">Manage Agents</span>
          <span className="text-stone-400">&rarr;</span>
        </Link>
        <Link href="/admin/listings" className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-5 hover:border-amber-500 hover:shadow-md transition">
          <span className="font-semibold text-stone-800">Moderate Listings</span>
          <span className="text-stone-400">&rarr;</span>
        </Link>
        <Link href="/admin/reviews" className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-5 hover:border-amber-500 hover:shadow-md transition">
          <span className="font-semibold text-stone-800">Moderate Reviews</span>
          <span className="text-stone-400">&rarr;</span>
        </Link>
        <Link href="/admin/support" className="flex items-center justify-between rounded-xl border border-stone-200 bg-white p-5 hover:border-amber-500 hover:shadow-md transition">
          <span className="font-semibold text-stone-800">Support Tickets</span>
          <span className="text-stone-400">&rarr;</span>
        </Link>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <RequireAuth role="ADMIN">
      <AdminContent />
    </RequireAuth>
  );
}

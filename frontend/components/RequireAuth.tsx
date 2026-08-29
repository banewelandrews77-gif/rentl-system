'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { ShieldAlert, LogOut } from 'lucide-react';

type Props = {
  children: React.ReactNode;
  role?: string | string[];
};

export function RequireAuth({ children, role }: Props) {
  const { user, ready, role: userRole, logout } = useAuth();
  const router = useRouter();

  const allowed = role ? (Array.isArray(role) ? role : [role]) : null;
  const isRoleAuthorized = !allowed || (userRole && allowed.includes(userRole));

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login?returnUrl=' + encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : ''));
    }
  }, [ready, user, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-stone-500 font-medium">Loading session...</p>
      </div>
    );
  }

  if (!isRoleAuthorized) {
    return (
      <div className="mx-auto max-w-md px-4 py-16 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4 border border-amber-200">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-2xl font-bold text-stone-900 mb-2">Restricted Access</h2>
        <p className="text-stone-600 text-sm mb-6">
          You are currently logged in as <strong>{user.email}</strong> ({userRole}), which does not have permission to view this page.
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => {
              logout();
              router.push('/login?returnUrl=' + encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : ''));
            }}
            className="flex items-center justify-center gap-2 w-full rounded-lg bg-amber-600 px-4 py-2.5 font-medium text-white hover:bg-amber-700 transition"
          >
            <LogOut className="h-4 w-4" /> Switch / Log in with Admin Account
          </button>
          <Link
            href="/"
            className="block w-full rounded-lg border border-stone-300 px-4 py-2.5 font-medium text-stone-700 hover:bg-stone-50 transition"
          >
            Return to Homepage
          </Link>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

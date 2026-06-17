'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

type Props = {
  children: React.ReactNode;
  role?: string | string[];
};

export function RequireAuth({ children, role }: Props) {
  const { user, ready, role: userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!ready) return;
    if (!user) {
      router.replace('/login?returnUrl=' + encodeURIComponent(typeof window !== 'undefined' ? window.location.pathname : ''));
      return;
    }
    if (role) {
      const allowed = Array.isArray(role) ? role : [role];
      if (!userRole || !allowed.includes(userRole)) {
        router.replace('/');
      }
    }
  }, [ready, user, userRole, role, router]);

  if (!ready || !user) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <p className="text-stone-500">Loading...</p>
      </div>
    );
  }
  if (role) {
    const allowed = Array.isArray(role) ? role : [role];
    if (!userRole || !allowed.includes(userRole)) {
      return null;
    }
  }
  return <>{children}</>;
}

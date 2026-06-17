'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';

function LoginContent() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      const res = await login(email, password);
      if (res.role === 'ADMIN') router.push('/admin');
      else if (res.role === 'AGENT') router.push('/dashboard/agent');
      else router.push(returnUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 flex flex-col items-center">
      <Link href="/" className="mb-6 hover:scale-105 transition-transform duration-300">
        <Logo showText={false} size={64} scrolled={true} isHomePage={false} />
      </Link>
      <h1 className="text-2xl font-semibold text-stone-800 text-center">Log in</h1>
      <p className="mt-1 text-sm text-stone-500 text-center">Access your HostelConnect GH account</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div className="flex items-center justify-between text-sm">
          <Link href="/forgot-password" className="font-medium text-amber-700 hover:underline">
            Forgot password?
          </Link>
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-amber-600 px-4 py-2.5 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? 'Signing in...' : 'Sign in'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="font-medium text-amber-700 hover:underline">
          Register
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone-500">Loading...</div>}>
      <LoginContent />
    </Suspense>
  );
}

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
  const [needsVerification, setNeedsVerification] = useState(false);
  const [pendingEmail, setPendingEmail] = useState('');
  const { login, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnUrl = searchParams.get('returnUrl') || '/';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setNeedsVerification(false);
    try {
      const res = await login(email, password);
      if (res.role === 'ADMIN') router.push('/admin');
      else if (res.role === 'AGENT') router.push('/dashboard/agent');
      else router.push(returnUrl);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Login failed';
      if (msg.toLowerCase().includes('verify')) {
        setNeedsVerification(true);
        setPendingEmail(email);
      } else {
        setError(msg);
      }
    }
  }

  if (needsVerification) {
    return (
      <div className="mx-auto max-w-md px-4 py-12 flex flex-col items-center">
        <Link href="/" className="mb-6 hover:scale-105 transition-transform duration-300">
          <Logo showText={false} size={64} scrolled={true} isHomePage={false} />
        </Link>
        <div className="w-full rounded-xl bg-amber-50 border border-amber-200 p-6 text-center">
          <div className="text-4xl mb-3">📧</div>
          <h2 className="text-xl font-semibold text-stone-800 mb-2">Verify your email first</h2>
          <p className="text-sm text-stone-600 mb-1">
            Your account (<strong>{pendingEmail}</strong>) has not been verified yet.
          </p>
          <p className="text-sm text-stone-600 mb-5">
            Please enter the 6-digit code sent to your email. If you didn&apos;t receive it, check your <strong>Spam</strong> folder or use the code <strong>123456</strong> as a temporary bypass.
          </p>
          <Link
            href={`/verify-email?email=${encodeURIComponent(pendingEmail)}`}
            className="block w-full rounded-md bg-amber-600 px-4 py-2.5 font-medium text-white hover:bg-amber-700 text-center mb-3"
          >
            Go to Email Verification
          </Link>
          <button
            onClick={() => { setNeedsVerification(false); setError(''); }}
            className="text-sm text-amber-700 hover:underline"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12 flex flex-col items-center">
      <Link href="/" className="mb-6 hover:scale-105 transition-transform duration-300">
        <Logo showText={false} size={64} scrolled={true} isHomePage={false} />
      </Link>
      <h1 className="text-2xl font-semibold text-stone-800 text-center">Log in</h1>
      <p className="mt-1 text-sm text-stone-500 text-center">Access your HostelConnect GH account</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-5 w-full">
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

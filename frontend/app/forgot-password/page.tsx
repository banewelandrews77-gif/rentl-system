'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { forgotPassword } = useAuth();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Request failed');
    }
  }

  if (sent) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <h1 className="text-2xl font-semibold text-stone-800">Check your email</h1>
        <p className="mt-2 text-sm text-stone-500">
          If an account exists for that email, we sent a password reset code. It expires in 15 minutes.
        </p>
        <Link href="/reset-password" className="mt-6 inline-block font-medium text-amber-700 hover:underline">
          Enter the code and new password →
        </Link>
        <p className="mt-8 text-sm text-stone-600">
          <Link href="/login" className="font-medium text-amber-700 hover:underline">Back to login</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold text-stone-800">Forgot password</h1>
      <p className="mt-2 text-sm text-stone-500">Enter your email and we’ll send a reset code.</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email</label>
          <input
            id="email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-amber-600 px-4 py-2.5 font-medium text-white hover:bg-amber-700"
        >
          Send reset code
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-600">
        <Link href="/login" className="font-medium text-amber-700 hover:underline">Back to login</Link>
      </p>
    </div>
  );
}

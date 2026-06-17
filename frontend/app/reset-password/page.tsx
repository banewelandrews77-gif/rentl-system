'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (newPassword.length < 8 || !/[A-Z]/.test(newPassword) || !/\d/.test(newPassword)) {
      setError('Password must be at least 8 characters with 1 uppercase and 1 number');
      return;
    }
    try {
      await resetPassword({ email, otp, newPassword, confirmPassword });
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Reset failed');
    }
  }

  if (success) {
    return (
      <div className="mx-auto max-w-md px-4 py-12">
        <div className="rounded-lg bg-green-50 p-4 text-center text-green-800">
          Password reset. Redirecting to login...
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold text-stone-800">Reset password</h1>
      <p className="mt-2 text-sm text-stone-500">Enter the code from your email and your new password.</p>
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
        <div>
          <label htmlFor="otp" className="block text-sm font-medium text-stone-700">6-digit code</label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            maxLength={6}
            required
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="newPassword" className="block text-sm font-medium text-stone-700">New password</label>
          <input
            id="newPassword"
            type="password"
            required
            minLength={8}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700">Confirm password</label>
          <input
            id="confirmPassword"
            type="password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <button
          type="submit"
          className="w-full rounded-md bg-amber-600 px-4 py-2.5 font-medium text-white hover:bg-amber-700"
        >
          Reset password
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-600">
        <Link href="/login" className="font-medium text-amber-700 hover:underline">Back to login</Link>
      </p>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-stone-500">Loading...</div>}>
      <ResetPasswordContent />
    </Suspense>
  )
}

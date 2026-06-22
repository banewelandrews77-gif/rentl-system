'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function VerifyEmailForm() {
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendCooldown, setResendCooldown] = useState(0);
  const { verifyEmail, resendVerification } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setResendMessage('');
    try {
      await verifyEmail(email, otp);
      setSuccess(true);
      setTimeout(() => router.push('/login'), 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Verification failed');
    }
  }

  async function handleResend() {
    if (!email) {
      setError('Please enter your email to resend the code.');
      return;
    }
    setError('');
    setResendMessage('');
    setResending(true);
    try {
      await resendVerification(email);
      setResendMessage('Verification code resent successfully to your email and phone.');
      setResendCooldown(60);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resend code');
    } finally {
      setResending(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-lg bg-green-50 p-4 text-center text-green-800">
        Email verified. Redirecting to login...
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-6 space-y-4">
      {error && (
        <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
          {error}
        </div>
      )}
      {resendMessage && (
        <div className="rounded-md bg-green-50 p-3 text-sm text-green-700" role="alert">
          {resendMessage}
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
          pattern="\d{6}"
          maxLength={6}
          required
          value={otp}
          onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
          className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
        />
      </div>
      <button
        type="submit"
        className="w-full rounded-md bg-amber-600 px-4 py-2.5 font-medium text-white hover:bg-amber-700"
      >
        Verify email
      </button>
      <div className="flex items-center justify-between pt-2">
        <span className="text-sm text-stone-500">Didn't receive the code?</span>
        <button
          type="button"
          disabled={resendCooldown > 0 || resending}
          onClick={handleResend}
          className={`text-sm font-medium transition-colors ${
            resendCooldown > 0 || resending
              ? 'text-stone-400 cursor-not-allowed'
              : 'text-amber-700 hover:text-amber-800 hover:underline'
          }`}
        >
          {resending ? 'Sending...' : resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </button>
      </div>
    </form>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold text-stone-800">Verify your email</h1>
      <p className="mt-2 text-sm text-stone-500">Enter the 6-digit code we sent to your email.</p>
      <Suspense fallback={<div className="mt-6 text-stone-500">Loading...</div>}>
        <VerifyEmailForm />
      </Suspense>
      <p className="mt-6 text-center text-sm text-stone-600">
        <Link href="/login" className="font-medium text-amber-700 hover:underline">Back to login</Link>
      </p>
    </div>
  );
}

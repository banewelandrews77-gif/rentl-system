'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

export default function RegisterCustomerPage() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const { registerCustomer, loading } = useAuth();
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    if (!/[A-Z]/.test(password) || !/\d/.test(password)) {
      setError('Password must contain at least 1 uppercase letter and 1 number');
      return;
    }
    try {
      await registerCustomer({
        fullName,
        email,
        phoneNumber,
        password,
        confirmPassword,
      });
      router.push('/verify-email?email=' + encodeURIComponent(email));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed');
    }
  }

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold text-stone-800">Customer registration</h1>
      <p className="mt-1 text-sm text-stone-500">Create an account to browse and show interest in hostels</p>
      <form onSubmit={handleSubmit} className="mt-8 space-y-4">
        {error && (
          <div className="rounded-md bg-red-50 p-3 text-sm text-red-700" role="alert">
            {error}
          </div>
        )}
        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-stone-700">Full name</label>
          <input
            id="fullName"
            name="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-stone-700">Email</label>
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
          <label htmlFor="phoneNumber" className="block text-sm font-medium text-stone-700">Phone number</label>
          <input
            id="phoneNumber"
            name="phoneNumber"
            type="tel"
            required
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-medium text-stone-700">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
          <p className="mt-0.5 text-xs text-stone-500">Min 8 characters, 1 uppercase, 1 number</p>
        </div>
        <div>
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-stone-700">Confirm password</label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            autoComplete="new-password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border border-stone-300 px-3 py-2 text-stone-900 shadow-sm focus:border-amber-500 focus:outline-none focus:ring-1 focus:ring-amber-500"
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-md bg-amber-600 px-4 py-2.5 font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? 'Creating account...' : 'Register'}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-stone-600">
        <Link href="/register" className="font-medium text-amber-700 hover:underline">Back</Link>
        {' · '}
        <Link href="/login" className="font-medium text-amber-700 hover:underline">Log in</Link>
      </p>
    </div>
  );
}

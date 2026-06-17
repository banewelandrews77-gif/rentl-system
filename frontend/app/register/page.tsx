'use client';

import Link from 'next/link';
import { Logo } from '@/components/Logo';

export default function RegisterChoicePage() {
  return (
    <div className="mx-auto max-w-md px-4 py-12 flex flex-col items-center text-center">
      <Link href="/" className="mb-6 hover:scale-105 transition-transform duration-300">
        <Logo showText={false} size={64} scrolled={true} isHomePage={false} />
      </Link>
      <h1 className="text-2xl font-semibold text-stone-800">Create an account</h1>
      <p className="mt-2 text-sm text-stone-500">I am looking for hostel accommodation</p>
      <div className="mt-8 flex flex-col gap-4">
        <Link
          href="/register/customer"
          className="rounded-lg border border-stone-300 bg-white px-4 py-4 font-medium text-stone-700 hover:bg-stone-50"
        >
          Register as Customer (Student / Patron)
        </Link>
        <Link
          href="/register/agent"
          className="rounded-lg border border-amber-600 bg-amber-50 px-4 py-4 font-medium text-amber-800 hover:bg-amber-100"
        >
          Register as Agent (Landlord / Representative)
        </Link>
      </div>
      <p className="mt-8 text-sm text-stone-600">
        Already have an account?{' '}
        <Link href="/login" className="font-medium text-amber-700 hover:underline">
          Log in
        </Link>
      </p>
    </div>
  );
}

'use client';

import { agentSubscriptionApi } from '@/lib/api';
import { useRouter, useSearchParams } from 'next/navigation';
import React, { useEffect, useState, Suspense } from 'react';

function SubscriptionCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const reference = searchParams.get('reference');
    const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
    const [message, setMessage] = useState('Verifying your subscription payment...');

    useEffect(() => {
        if (!reference) {
            setStatus('error');
            setMessage('No payment reference found. Please try your payment again.');
            return;
        }

        const verifyPayment = async () => {
            try {
                await agentSubscriptionApi.verify(reference);
                setStatus('success');
                setMessage('Your subscription was successful! Redirecting you back to the create hostel page...');
                setTimeout(() => {
                    router.push('/dashboard/agent/hostels/new');
                }, 3000);
            } catch (err: any) {
                setStatus('error');
                setMessage(err.message || 'Failed to verify subscription payment.');
            }
        };

        verifyPayment();
    }, [reference, router]);

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 max-w-md w-full text-center">
                {status === 'verifying' && (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-12 h-12 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
                        <h2 className="text-xl font-semibold text-stone-800">Verifying Payment</h2>
                        <p className="text-stone-500">{message}</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800">Payment Successful!</h2>
                        <p className="text-stone-600">{message}</p>
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-2">
                            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-stone-800">Payment Failed</h2>
                        <p className="text-red-600">{message}</p>
                        <button
                            onClick={() => router.push('/dashboard/agent')}
                            className="mt-6 w-full rounded-md bg-stone-800 px-4 py-2 hover:bg-stone-700 text-white font-medium transition"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function SubscriptionCallbackPage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
            <SubscriptionCallbackContent />
        </Suspense>
    );
}

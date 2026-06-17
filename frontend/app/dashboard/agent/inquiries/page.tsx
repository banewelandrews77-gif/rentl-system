'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { agentInquiriesApi, InquiryResponse } from '@/lib/api';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Check, X as XIcon } from 'lucide-react';

function AgentInquiriesContent() {
    const [inquiries, setInquiries] = useState<InquiryResponse[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [updatingId, setUpdatingId] = useState<string | null>(null);

    useEffect(() => {
        fetchInquiries();
    }, []);

    const fetchInquiries = async () => {
        try {
            const data = await agentInquiriesApi.getMyInquiries();
            setInquiries(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load inquiries.');
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (inquiryId: string, newStatus: 'APPROVED' | 'REJECTED') => {
        setUpdatingId(inquiryId);
        try {
            await agentInquiriesApi.updateStatus(inquiryId, newStatus);
            // Refresh the list locally to reflect the update instantly
            setInquiries(prev => prev.map(inq => inq.id === inquiryId ? { ...inq, status: newStatus } : inq));
        } catch (err: any) {
            alert(err.message || 'Failed to update status');
        } finally {
            setUpdatingId(null);
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-12 w-full">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-stone-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Customer Inquiries
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">
                        Review student requests for your verified listings, and optionally approve them to reveal your contact info.
                    </p>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center py-12">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
                </div>
            ) : error ? (
                <div className="rounded-md bg-red-50 p-4">
                    <div className="text-sm text-red-700">{error}</div>
                </div>
            ) : inquiries.length === 0 ? (
                <div className="text-center rounded-xl border border-stone-200 bg-white shadow-sm p-12">
                    <h3 className="mt-2 text-sm font-semibold text-stone-900">No inquiries yet</h3>
                    <p className="mt-1 text-sm text-stone-500">You haven't received any inquiries on your hostels.</p>
                </div>
            ) : (
                <div className="overflow-hidden bg-white shadow-sm ring-1 ring-stone-900/5 sm:rounded-xl">
                    <ul role="list" className="divide-y divide-stone-100">
                        {inquiries.map((inquiry) => (
                            <li key={inquiry.id} className="flex flex-col gap-x-6 px-4 py-6 sm:px-6">
                                <div className="flex flex-col md:flex-row md:justify-between gap-4">

                                    {/* Info Section */}
                                    <div className="flex-auto space-y-3">
                                        <div className="flex items-center gap-3">
                                            <h3 className="text-lg font-bold text-stone-900">
                                                {inquiry.customerName}
                                            </h3>
                                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${inquiry.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' :
                                                    inquiry.status === 'REJECTED' ? 'bg-red-50 text-red-700 ring-red-600/20' :
                                                        'bg-amber-50 text-amber-800 ring-amber-600/20'
                                                }`}>
                                                {inquiry.status}
                                            </span>
                                        </div>

                                        <div className="text-sm text-stone-600">
                                            <span className="font-semibold text-stone-900">Hostel:</span> <Link href={`/listings/${inquiry.hostelId}`} className="text-amber-600 hover:underline">{inquiry.hostelName}</Link>
                                        </div>

                                        {inquiry.roomTypeName && (
                                            <div className="text-sm text-stone-600">
                                                <span className="font-semibold text-stone-900">Interested in Room:</span> {inquiry.roomTypeName}
                                            </div>
                                        )}

                                        <div className="text-sm text-stone-600 bg-stone-50 p-3 rounded-lg border border-stone-100 italic">
                                            "{inquiry.message}"
                                        </div>

                                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 pt-2">
                                            <div className="text-sm"><span className="font-medium text-stone-900">Email:</span> <a href={`mailto:${inquiry.customerEmail}`} className="text-stone-600 hover:text-amber-700">{inquiry.customerEmail}</a></div>
                                            {inquiry.customerPhone && (
                                                <div className="text-sm"><span className="font-medium text-stone-900">Phone:</span> <a href={`tel:${inquiry.customerPhone}`} className="text-stone-600 hover:text-amber-700">{inquiry.customerPhone}</a></div>
                                            )}
                                        </div>
                                        <div className="text-xs text-stone-400">Received on: {new Date(inquiry.createdAt).toLocaleString()}</div>
                                    </div>

                                    {/* Actions Section */}
                                    <div className="flex flex-row md:flex-col justify-end gap-2 md:w-32">
                                        {inquiry.status === 'PENDING' && (
                                            <>
                                                <button
                                                    onClick={() => handleUpdateStatus(inquiry.id, 'APPROVED')}
                                                    disabled={updatingId === inquiry.id}
                                                    className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-emerald-500 disabled:opacity-50"
                                                >
                                                    <Check className="h-4 w-4" /> Approve
                                                </button>
                                                <button
                                                    onClick={() => handleUpdateStatus(inquiry.id, 'REJECTED')}
                                                    disabled={updatingId === inquiry.id}
                                                    className="flex items-center justify-center w-full rounded-lg bg-white px-3 py-2 text-sm font-semibold text-stone-900 shadow-sm ring-1 ring-inset ring-stone-300 hover:bg-stone-50 disabled:opacity-50"
                                                >
                                                    <XIcon className="h-4 w-4" /> Reject
                                                </button>
                                            </>
                                        )}
                                        {inquiry.status === 'REJECTED' && (
                                            <button
                                                onClick={() => handleUpdateStatus(inquiry.id, 'APPROVED')}
                                                disabled={updatingId === inquiry.id}
                                                className="flex items-center justify-center gap-1.5 w-full rounded-lg bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700 border border-emerald-200 hover:bg-emerald-100 disabled:opacity-50"
                                            >
                                                <Check className="h-4 w-4" /> Un-Reject
                                            </button>
                                        )}
                                    </div>

                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}

export default function AgentInquiriesPage() {
    return (
        <RequireAuth role="AGENT">
            <AgentInquiriesContent />
        </RequireAuth>
    );
}

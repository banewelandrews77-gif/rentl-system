'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { adminApi, AgentProfileParams, getImageUrl } from '@/lib/api';
import { RequireAuth } from '@/components/RequireAuth';
import { toast } from 'react-hot-toast';

function VerificationsContent() {
  const [agents, setAgents] = useState<AgentProfileParams[]>([]);
  const [loading, setLoading] = useState(true);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const fetchAgents = () => {
    setLoading(true);
    adminApi.getPendingAgents()
      .then(setAgents)
      .catch((err) => toast.error(err.message || 'Failed to load verifications'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAgents();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await adminApi.verifyAgent(id);
      toast.success('Agent verified successfully');
      fetchAgents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to verify agent');
    }
  };

  const handleReject = async (id: string) => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a rejection reason');
      return;
    }
    try {
      await adminApi.rejectAgent(id, rejectReason);
      toast.success('Agent rejected');
      setRejectingId(null);
      setRejectReason('');
      fetchAgents();
    } catch (err: any) {
      toast.error(err.message || 'Failed to reject agent');
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-stone-900">Verification Queue</h1>
          <p className="mt-2 text-lg text-stone-600">Review pending agent ID verifications.</p>
        </div>
      </div>

      <div className="space-y-6">
        {loading ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-500 shadow-sm">
            Loading verifications...
          </div>
        ) : agents.length === 0 ? (
          <div className="rounded-2xl border border-stone-200 bg-white p-8 text-center text-stone-500 shadow-sm">
            No pending verifications found.
          </div>
        ) : (
          agents.map((agent) => (
            <div key={agent.id} className="flex flex-col rounded-2xl border border-stone-200 bg-white shadow-sm md:flex-row">
              <div className="flex-1 p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-stone-900">{agent.user.fullName}</h2>
                    <div className="mt-2 space-y-1 text-sm text-stone-600">
                      <p><span className="font-medium text-stone-900">Email:</span> {agent.user.email}</p>
                      <p><span className="font-medium text-stone-900">Phone:</span> {agent.user.phoneNumber || 'N/A'}</p>
                      <p><span className="font-medium text-stone-900">Ghana Card:</span> {agent.ghanaCardNumber || 'N/A'}</p>
                      <p><span className="font-medium text-stone-900">Submissions:</span> {agent.submissionCount}</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-800">
                    Pending
                  </span>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <p className="mb-2 text-sm font-medium text-stone-900">Ghana Card</p>
                    {agent.ghanaCardUrl ? (
                      <a
                        href={getImageUrl(agent.ghanaCardUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200"
                      >
                        View Ghana Card
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <p className="text-sm italic text-stone-400">Not uploaded</p>
                    )}
                  </div>
                  <div>
                    <p className="mb-2 text-sm font-medium text-stone-900">Face Scan Snapshot</p>
                    {agent.facePhotoUrl ? (
                      <a
                        href={getImageUrl(agent.facePhotoUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex w-full items-center justify-center rounded-lg bg-stone-100 px-4 py-2 text-sm font-medium text-stone-700 transition-colors hover:bg-stone-200"
                      >
                        View Face Scan
                        <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                        </svg>
                      </a>
                    ) : (
                      <p className="text-sm italic text-stone-400">Not uploaded</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="border-t border-stone-100 bg-stone-50 p-6 md:w-80 md:border-l md:border-t-0">
                {rejectingId === agent.id ? (
                  <div className="space-y-4">
                    <div>
                      <label htmlFor={`reason-${agent.id}`} className="block text-sm font-medium text-stone-700">Rejection Reason</label>
                      <textarea
                        id={`reason-${agent.id}`}
                        rows={3}
                        className="mt-1 block w-full rounded-md border-stone-300 shadow-sm focus:border-amber-500 focus:ring-amber-500 sm:text-sm"
                        placeholder="Why is this ID being rejected?"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                      />
                    </div>
                    <div className="flex space-x-3">
                      <button
                        onClick={() => handleReject(agent.id)}
                        className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        Confirm Reject
                      </button>
                      <button
                        onClick={() => {
                          setRejectingId(null);
                          setRejectReason('');
                        }}
                        className="flex-1 rounded-md bg-stone-200 px-4 py-2 text-sm font-medium text-stone-700 shadow-sm hover:bg-stone-300 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:ring-offset-2 transition-colors duration-200"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex h-full flex-col justify-center space-y-3">
                    <button
                      onClick={() => handleApprove(agent.id)}
                      className="w-full rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      Approve Agent
                    </button>
                    <button
                      onClick={() => setRejectingId(agent.id)}
                      className="w-full rounded-md bg-white px-4 py-2 text-sm font-medium text-red-700 shadow-sm ring-1 ring-inset ring-red-300 hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors duration-200"
                    >
                      Reject Application
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default function AdminVerificationsPage() {
  return (
    <RequireAuth role="ADMIN">
      <VerificationsContent />
    </RequireAuth>
  );
}

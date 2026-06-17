'use client';

import { useEffect, useState } from 'react';
import { adminApi, AuthUser } from '@/lib/api';
import { RequireAuth } from '@/components/RequireAuth';
import { toast } from 'react-hot-toast';

function AgentsContent() {
    const [agents, setAgents] = useState<AuthUser[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        adminApi.getAgents()
            .then(setAgents)
            .catch((err) => toast.error(err.message || 'Failed to load agents'))
            .finally(() => setLoading(false));
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you sure you want to completely remove ${name}? This action cannot be undone.`)) {
            return;
        }
        try {
            await adminApi.deleteUser(id);
            toast.success('Agent removed successfully');
            setAgents(agents.filter(a => a.id !== id));
        } catch (error: any) {
            toast.error(error.message || 'Failed to remove agent');
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <h1 className="text-3xl font-bold text-stone-900">Manage Agents</h1>
            <p className="mt-2 text-lg text-stone-600">View all registered property managers and agents.</p>

            <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Name</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Email</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Phone</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Status</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-sm text-stone-500">Loading agents...</td>
                            </tr>
                        ) : agents.length === 0 ? (
                            <tr>
                                <td colSpan={5} className="px-6 py-8 text-center text-sm text-stone-500">No agents found.</td>
                            </tr>
                        ) : (
                            agents.map((agent) => (
                                <tr key={agent.id} className="hover:bg-stone-50">
                                    <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-stone-900">{agent.fullName}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-500">{agent.email}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm text-stone-500">{agent.phoneNumber || 'N/A'}</td>
                                    <td className="whitespace-nowrap px-6 py-4 text-sm">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${agent.emailVerified ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                                            {agent.emailVerified ? 'Verified' : 'Unverified'}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <button 
                                            onClick={() => handleDelete(agent.id, agent.fullName)}
                                            className="text-red-600 hover:text-red-900 transition-colors"
                                            title="Remove agent"
                                        >
                                            Remove
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default function AdminAgentsPage() {
    return (
        <RequireAuth role="ADMIN">
            <AgentsContent />
        </RequireAuth>
    );
}

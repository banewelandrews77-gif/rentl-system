'use client';

import { useEffect, useState } from 'react';
import { adminApi, Hostel, getImageUrl } from '@/lib/api';
import { RequireAuth } from '@/components/RequireAuth';
import { toast } from 'react-hot-toast';
import { Trash2, Edit } from 'lucide-react';
import Link from 'next/link';

function ListingsContent() {
    const [hostels, setHostels] = useState<Hostel[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchHostels = () => {
        setLoading(true);
        adminApi.getHostels()
            .then(data => {
                console.log('ADMIN_DEBUG: Fetched hostels:', data);
                setHostels(data);
            })
            .catch((err) => toast.error(err.message || 'Failed to load hostels'))
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        fetchHostels();
    }, []);

    const handleDelete = async (id: string, name: string) => {
        if (!window.confirm(`Are you absolutely sure you want to delete ${name}? This action cannot be undone.`)) {
            return;
        }

        try {
            await adminApi.deleteHostel(id);
            toast.success('Listing deleted successfully');
            setHostels(hostels.filter(h => h.id !== id));
        } catch (error: any) {
            toast.error(error.message || 'Failed to delete listing');
        }
    };

    return (
        <div className="mx-auto max-w-6xl px-4 py-10">
            <h1 className="text-3xl font-bold text-stone-900">Moderate Listings</h1>
            <p className="mt-2 text-lg text-stone-600">View and manage all properties on the platform.</p>

            <div className="mt-8 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
                <table className="min-w-full divide-y divide-stone-200">
                    <thead className="bg-stone-50">
                        <tr>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Property Details</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Agent Details</th>
                            <th scope="col" className="px-6 py-4 text-left text-xs font-medium uppercase tracking-wider text-stone-500">Status</th>
                            <th scope="col" className="px-6 py-4 text-right text-xs font-medium uppercase tracking-wider text-stone-500">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-200 bg-white">
                        {loading ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-sm text-stone-500">Loading listings...</td>
                            </tr>
                        ) : hostels.length === 0 ? (
                            <tr>
                                <td colSpan={4} className="px-6 py-8 text-center text-sm text-stone-500">No listings found.</td>
                            </tr>
                        ) : (
                            hostels.map((hostel) => (
                                <tr key={hostel.id} className="hover:bg-stone-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center">
                                            {hostel.images && hostel.images.length > 0 ? (
                                                <img
                                                    src={getImageUrl(hostel.images.find(img => img.isPrimary)?.imageUrl || hostel.images[0].imageUrl)}
                                                    alt=""
                                                    className="h-10 w-10 rounded-md object-cover mr-3"
                                                />
                                            ) : (
                                                <div className="h-10 w-10 rounded-md bg-stone-200 mr-3 flex items-center justify-center text-stone-400">
                                                    —
                                                </div>
                                            )}
                                            <div>
                                                <div className="text-sm font-medium text-stone-900">{hostel.name}</div>
                                                <div className="text-sm text-stone-500">{hostel.location}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-sm text-stone-900">{hostel.agentName}</div>
                                        <div className="text-sm text-stone-500">{hostel.agentPhone}</div>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                      ${hostel.status === 'PUBLISHED' ? 'bg-emerald-100 text-emerald-800' :
                                                hostel.status === 'DRAFT' ? 'bg-stone-100 text-stone-800' : 'bg-rose-100 text-rose-800'}`}>
                                            {hostel.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                                        <div className="flex items-center justify-end space-x-3">
                                            <Link
                                                href={`/admin/listings/${hostel.id}/edit`}
                                                className="text-indigo-600 hover:text-indigo-900 flex items-center"
                                                title="Edit Listing"
                                            >
                                                <Edit className="h-4 w-4 mr-1" />
                                                Edit
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(hostel.id, hostel.name)}
                                                className="text-rose-600 hover:text-rose-900 flex items-center"
                                                title="Delete Listing"
                                            >
                                                <Trash2 className="h-4 w-4 mr-1" />
                                                Delete
                                            </button>
                                        </div>
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

export default function AdminListingsPage() {
    return (
        <RequireAuth role="ADMIN">
            <ListingsContent />
        </RequireAuth>
    );
}

'use client';

import { RequireAuth } from '@/components/RequireAuth';
import { adminApi, Hostel } from '@/lib/api';
import { useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

function AdminEditHostelContent() {
    const { id } = useParams() as { id: string };
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        location: '',
        gpsCoordinates: '',
    });
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    useEffect(() => {
        const loadHostel = async () => {
            try {
                const hostels = await adminApi.getHostels();
                const hostel = hostels.find(h => h.id === id);
                if (hostel) {
                    setFormData({
                        name: hostel.name,
                        description: hostel.description,
                        location: hostel.location,
                        gpsCoordinates: hostel.gpsCoordinates || '',
                    });
                } else {
                    toast.error('Hostel not found');
                    router.push('/admin/listings');
                }
            } catch (err: any) {
                toast.error(err.message || 'Failed to load hostel');
            } finally {
                setFetching(false);
            }
        };
        loadHostel();
    }, [id, router]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            await adminApi.updateHostel(id, formData);
            toast.success('Hostel updated successfully');
            router.push('/admin/listings');
        } catch (err: any) {
            toast.error(err.message || 'Failed to update hostel');
        } finally {
            setLoading(false);
        }
    };

    if (fetching) return <div className="p-8 text-center">Loading hostel details...</div>;

    return (
        <div className="mx-auto max-w-3xl px-4 py-10">
            <div className="md:flex md:items-center md:justify-between mb-8">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-stone-900 sm:truncate sm:text-3xl sm:tracking-tight">
                        Admin: Edit Hostel Listing
                    </h2>
                    <p className="mt-1 text-sm text-stone-500">You are editing this listing as an administrator.</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-stone-900/5 sm:rounded-xl">
                <div className="px-4 py-6 sm:p-8">
                    <div className="grid max-w-2xl grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                        <div className="sm:col-span-4">
                            <label htmlFor="name" className="block text-sm font-medium leading-6 text-stone-900">
                                Hostel Name
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-stone-900 shadow-sm ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-full">
                            <label htmlFor="description" className="block text-sm font-medium leading-6 text-stone-900">
                                Description
                            </label>
                            <div className="mt-2">
                                <textarea
                                    id="description"
                                    name="description"
                                    rows={4}
                                    value={formData.description}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-stone-900 shadow-sm ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-full">
                            <label htmlFor="location" className="block text-sm font-medium leading-6 text-stone-900">
                                Location (Address or landmarks)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="location"
                                    id="location"
                                    value={formData.location}
                                    onChange={handleChange}
                                    required
                                    className="block w-full rounded-md border-0 py-1.5 text-stone-900 shadow-sm ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-4">
                            <label htmlFor="gpsCoordinates" className="block text-sm font-medium leading-6 text-stone-900">
                                GPS Coordinates (Optional)
                            </label>
                            <div className="mt-2">
                                <input
                                    type="text"
                                    name="gpsCoordinates"
                                    id="gpsCoordinates"
                                    placeholder="e.g. 5.6037, -0.1870"
                                    value={formData.gpsCoordinates}
                                    onChange={handleChange}
                                    className="block w-full rounded-md border-0 py-1.5 text-stone-900 shadow-sm ring-1 ring-inset ring-stone-300 placeholder:text-stone-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex items-center justify-end gap-x-6 border-t border-stone-900/10 px-4 py-4 sm:px-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="text-sm font-semibold leading-6 text-stone-900 hover:text-stone-600"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-300"
                    >
                        {loading ? 'Saving...' : 'Update as Admin'}
                    </button>
                </div>
            </form>
        </div>
    );
}

export default function AdminEditHostelPage() {
    return (
        <RequireAuth role="ADMIN">
            <AdminEditHostelContent />
        </RequireAuth>
    );
}

import Image from "next/image";
import Link from "next/link";
import { MapPin, Users, Bed, Star } from "lucide-react";
import { getImageUrl } from "@/lib/api";
import { motion } from "framer-motion";

export interface HostelSummary {
    id: string;
    name: string;
    location: string;
    description: string;
    status: 'DRAFT' | 'PUBLISHED' | 'UNAVAILABLE';
    gpsCoordinates?: string;
    agentName?: string;
    averageRating: number | null;
    reviewCount: number;
    images: { id: string; imageUrl: string; isPrimary: boolean }[];
    roomTypes: {
        id: string;
        name: string;
        capacity: number;
        pricePerYear: number;
        totalAvailable: number;
        availableCount: number;
        imageUrl?: string;
    }[];
}

interface HostelCardProps {
    hostel: HostelSummary;
    index?: number;
}

export default function HostelCard({ hostel, index = 0 }: HostelCardProps) {
    let primaryImage =
        hostel.images.find((img) => img.isPrimary)?.imageUrl ||
        hostel.images[0]?.imageUrl ||
        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop";

    primaryImage = getImageUrl(primaryImage);

    const startingPrice =
        hostel.roomTypes.length > 0
            ? Math.min(...hostel.roomTypes.map((rt) => rt.pricePerYear))
            : null;

    const availableBeds = hostel.roomTypes.reduce(
        (acc, rt) => acc + rt.availableCount,
        0
    );

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.05 }}
            className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-amber-900/5 hover:ring-amber-200 flex flex-col h-full"
        >
            <Link href={`/listings/${hostel.id}`} className="block flex-1 flex flex-col">
                <div className="relative aspect-[4/3] w-full overflow-hidden bg-stone-100">
                    <Image
                        src={primaryImage}
                        alt={hostel.name}
                        fill
                        unoptimized={true}
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                        sizes="(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw"
                    />

                    {/* Gradient Overlay for text pop */}
                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-80" />

                    {/* Top Badges */}
                    <div className="absolute top-3 left-3 right-3 flex justify-between items-start">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold shadow-sm backdrop-blur-md ${availableBeds > 0 ? 'bg-white/90 text-stone-900' : 'bg-red-500/90 text-white'}`}>
                            <span className={`h-1.5 w-1.5 rounded-full ${availableBeds > 0 ? 'bg-emerald-500 animate-pulse' : 'hidden'}`} />
                            {availableBeds > 0 ? `${availableBeds} beds left` : 'Fully Booked'}
                        </span>

                        {hostel.averageRating && (
                            <span className="inline-flex items-center gap-1 rounded-full bg-stone-900/80 backdrop-blur-sm px-2 py-1 text-xs font-semibold text-white shadow-sm">
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                                {hostel.averageRating.toFixed(1)}
                            </span>
                        )}
                    </div>

                    {/* Bottom Title Area */}
                    <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white drop-shadow-md mb-1 line-clamp-1">{hostel.name}</h3>
                        <p className="flex items-center gap-1 text-sm font-medium text-stone-200 drop-shadow-md">
                            <MapPin className="h-3.5 w-3.5" />
                            <span className="line-clamp-1">{hostel.location}</span>
                        </p>
                    </div>
                </div>

                <div className="flex flex-col flex-1 p-5">
                    <p className="text-sm text-stone-600 line-clamp-2 mb-4 flex-1">
                        {hostel.description}
                    </p>

                    <div className="mt-auto pt-4 border-t border-stone-100 flex items-end justify-between">
                        <div>
                            <p className="text-xs text-stone-500 font-medium mb-0.5 uppercase tracking-wider">Starting at</p>
                            {startingPrice ? (
                                <p className="text-lg font-extrabold text-amber-600">
                                    GH₵ {startingPrice.toLocaleString()} <span className="text-xs font-medium text-stone-500">/ yr</span>
                                </p>
                            ) : (
                                <p className="text-base font-semibold text-stone-900">Contact Agent</p>
                            )}
                        </div>

                        <div className="flex -space-x-2">
                            {hostel.roomTypes.length > 0 && hostel.roomTypes.slice(0, 3).map((rt, i) => (
                                <div key={i} className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-50 border-2 border-white ring-1 ring-stone-200 text-xs font-bold text-stone-600 z-10 shadow-sm transition-transform hover:scale-110 hover:z-20 cursor-help" title={`${rt.capacity} in a room`}>
                                    {rt.capacity}
                                </div>
                            ))}
                            {hostel.roomTypes.length > 3 && (
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-stone-100 border-2 border-white ring-1 ring-stone-200 text-xs font-bold text-stone-500 z-10">
                                    +{hostel.roomTypes.length - 3}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </Link>
        </motion.div>
    );
}

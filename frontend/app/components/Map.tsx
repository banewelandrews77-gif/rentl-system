"use client";

import dynamic from "next/dynamic";
import { HostelSummary } from "./HostelCard";

// The MapInner component imports react-leaflet directly, so it MUST NEVER
// be imported directly into a Server Component. It must only be dynamically
// imported with ssr: false.
const MapInner = dynamic(() => import("./MapInner"), {
    ssr: false,
    loading: () => (
        <div className="flex h-full w-full items-center justify-center bg-stone-100 rounded-2xl">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
        </div>
    ),
});

interface MapProps {
    hostels: HostelSummary[];
    locationFilter?: string;
    center?: [number, number]; // [lat, lng]
    zoom?: number;
}

export default function MapWrapper(props: MapProps) {
    if (typeof window === "undefined") {
        return (
            <div className="flex h-full w-full items-center justify-center bg-stone-100 rounded-2xl">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            </div>
        );
    }
    return <MapInner {...props} />;
}

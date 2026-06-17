"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { HostelSummary } from "./HostelCard";
import { getImageUrl } from "@/lib/api";
import { geocode } from "@/lib/geocoding";

// Fix for default marker icons in Next.js
let customIcon: L.Icon | undefined;

interface MapProps {
    hostels: HostelSummary[];
    locationFilter?: string;
    center?: [number, number]; // [lat, lng]
    zoom?: number;
}

function MapController({ 
    hostels, 
    locationFilter, 
    setSearchMarker 
}: { 
    hostels: HostelSummary[]; 
    locationFilter?: string;
    setSearchMarker: (coords: [number, number] | null) => void;
}) {
    const map = useMap();

    useEffect(() => {
        if (!map) return;

        const handleGeocoding = async () => {
            // Priority 1: Zoom to filtered hostels if they exist
            if (hostels.length > 0) {
                const validCoords = hostels
                    .filter((h) => h.gpsCoordinates)
                    .map((h) => {
                        const clean = h.gpsCoordinates!.replace(/[()]/g, "").replace(/[,;]/g, " ");
                        const parts = clean.trim().split(/\s+/);
                        if (parts.length < 2) return null;
                        const lat = parseFloat(parts[0]);
                        const lng = parseFloat(parts[1]);
                        if (isNaN(lat) || isNaN(lng)) return null;
                        return [lat, lng] as [number, number];
                    })
                    .filter((coord): coord is [number, number] => coord !== null);

                if (validCoords.length > 0) {
                    setSearchMarker(null); // Clear search marker if we have hostels
                    const bounds = L.latLngBounds(validCoords);
                    if (validCoords.length === 1) {
                        map.setView(validCoords[0], 15, { animate: true });
                    } else {
                        map.fitBounds(bounds, {
                            padding: [50, 50],
                            maxZoom: 16,
                            animate: true,
                            duration: 0.8,
                        });
                    }
                    return;
                }
            }

            // Priority 2: Zoom to the location filter area if no hostels are found
            if (locationFilter && locationFilter.length > 2) {
                const coords = await geocode(locationFilter);
                if (coords) {
                    const pos: [number, number] = [coords.lat, coords.lng];
                    setSearchMarker(pos);
                    map.setView(pos, 15, { animate: true });
                } else {
                    setSearchMarker(null);
                }
            } else {
                setSearchMarker(null);
            }
        };

        // Increase debounce to 800ms for customer side to avoid rapid API calls
        const timer = setTimeout(() => {
            map.invalidateSize();
            handleGeocoding();
        }, 800);

        return () => clearTimeout(timer);
    }, [hostels, map, locationFilter, setSearchMarker]);

    return null;
}

export default function Map({ hostels, locationFilter, center = [5.6037, -0.187], zoom = 12 }: MapProps) {
    const [isMounted, setIsMounted] = useState(false);
    const [searchMarker, setSearchMarker] = useState<[number, number] | null>(null);

    useEffect(() => {
        setIsMounted(true);
        if (!customIcon) {
            customIcon = new L.Icon({
                iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                iconRetinaUrl:
                    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
                shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });
        }
    }, []);

    if (!isMounted) {
        return (
            <div className="flex h-full w-full items-center justify-center bg-stone-100 rounded-2xl">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-amber-600 border-t-transparent" />
            </div>
        );
    }

    // Find bounds to fit all markers if there are hostels and no explicit center was provided.
    // We'll keep it simple for now and rely on center/zoom props or fallback.

    return (
        <div className="h-full w-full overflow-hidden rounded-2xl border border-stone-200">
            <MapContainer
                center={center}
                zoom={zoom}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
                style={{ minHeight: "100%" }}
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapController 
                    hostels={hostels} 
                    locationFilter={locationFilter} 
                    setSearchMarker={setSearchMarker} 
                />
                
                {searchMarker && (
                    <Marker position={searchMarker} icon={customIcon}>
                        <Popup className="p-2 font-bold text-stone-800">
                            Exploring {locationFilter}
                        </Popup>
                    </Marker>
                )}

                {hostels.map((hostel) => {
                    if (!hostel.gpsCoordinates) return null;

                    const clean = hostel.gpsCoordinates.replace(/[()]/g, "").replace(/[,;]/g, " ");
                    const parts = clean.trim().split(/\s+/);
                    
                    if (parts.length < 2) return null;
                    
                    const lat = parseFloat(parts[0]);
                    const lng = parseFloat(parts[1]);

                    if (isNaN(lat) || isNaN(lng)) return null;

                    let primaryImage =
                        hostel.images.find((img) => img.isPrimary)?.imageUrl ||
                        hostel.images[0]?.imageUrl ||
                        "https://images.unsplash.com/photo-1555854877-bab0e564b8d5?q=80&w=2069&auto=format&fit=crop";
                    primaryImage = getImageUrl(primaryImage);

                    const startingPrice =
                        hostel.roomTypes.length > 0
                            ? Math.min(...hostel.roomTypes.map((rt) => rt.pricePerYear))
                            : null;

                    return (
                        <Marker key={hostel.id} position={[lat, lng]} icon={customIcon}>
                            <Popup className="min-w-[200px] p-0 overflow-hidden rounded-xl">
                                <a href={`/listings/${hostel.id}`} className="block group">
                                    <div className="relative h-24 w-full bg-stone-100">
                                        <img
                                            src={primaryImage}
                                            alt={hostel.name}
                                            className="object-cover w-full h-full"
                                        />
                                    </div>
                                    <div className="p-3">
                                        <h4 className="font-semibold text-stone-900 line-clamp-1 group-hover:text-amber-700 transition">
                                            {hostel.name}
                                        </h4>
                                        {startingPrice && (
                                            <p className="mt-1 text-sm font-medium text-stone-700">
                                                From GH₵ {startingPrice.toLocaleString()}/yr
                                            </p>
                                        )}
                                    </div>
                                </a>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

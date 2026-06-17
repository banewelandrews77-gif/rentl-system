"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix for default marker icons
let customIcon: L.Icon | undefined;

interface LocationPickerProps {
    value: string; // "lat, lng"
    onChange: (value: string) => void;
}

function MapEvents({ onChange }: { onChange: (value: string) => void }) {
    useMapEvents({
        click(e) {
            onChange(`${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`);
        },
    });
    return null;
}

function MapController({ lat, lng }: { lat: number; lng: number }) {
    const map = useMap();

    useEffect(() => {
        if (map) {
            map.invalidateSize();
            map.setView([lat, lng], 16, { animate: true });
        }
    }, [lat, lng, map]);

    return null;
}

export default function LocationPickerInner({ value, onChange }: LocationPickerProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (!customIcon) {
            customIcon = new L.Icon({
                iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                iconRetinaUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
                shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });
        }
    }, []);

    if (!isMounted) return null;

    let position: [number, number] = [5.6037, -0.187]; // Default to Accra
    if (value && value.includes(",")) {
        const parts = value.split(",");
        const lat = parseFloat(parts[0]);
        const lng = parseFloat(parts[1]);
        if (!isNaN(lat) && !isNaN(lng)) {
            position = [lat, lng];
        }
    }

    return (
        <div className="h-[300px] w-full rounded-2xl overflow-hidden border border-stone-200 shadow-inner bg-stone-50">
            <MapContainer
                center={position}
                zoom={13}
                scrollWheelZoom={true}
                className="h-full w-full z-0"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={position} icon={customIcon} />
                <MapEvents onChange={onChange} />
                <MapController lat={position[0]} lng={position[1]} />
            </MapContainer>
            <div className="absolute bottom-2 left-2 right-2 bg-white/90 backdrop-blur-sm p-2 rounded-lg text-[10px] font-bold text-stone-500 shadow-sm z-[1000] text-center border border-stone-200">
                Click anywhere on the map to set location
            </div>
        </div>
    );
}

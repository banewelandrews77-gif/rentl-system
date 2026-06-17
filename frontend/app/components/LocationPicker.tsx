'use client';

import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Navigation, Target } from 'lucide-react';
import { toast } from 'react-hot-toast';

// Fix for default marker icons in Next.js
let customIcon: L.Icon | undefined;

interface LocationPickerProps {
    value?: string; // "lat, lng"
    onChange: (value: string) => void;
}

function LocationMarker({ value, onChange }: LocationPickerProps) {
    const map = useMap();
    const [position, setPosition] = useState<L.LatLng | null>(null);

    useEffect(() => {
        if (value) {
            const [lat, lng] = value.split(',').map(v => parseFloat(v.trim()));
            if (!isNaN(lat) && !isNaN(lng)) {
                const newPos = L.latLng(lat, lng);
                setPosition(newPos);
                map.setView(newPos, 15);
            }
        }
    }, [value, map]);

    useMapEvents({
        click(e) {
            setPosition(e.latlng);
            onChange(`${e.latlng.lat.toFixed(6)}, ${e.latlng.lng.toFixed(6)}`);
        },
    });

    return position === null ? null : (
        <Marker position={position} icon={customIcon} />
    );
}

function LocateButton({ onChange }: { onChange: (val: string) => void }) {
    const map = useMap();
    const [loading, setLoading] = useState(false);

    const handleLocate = () => {
        setLoading(true);
        map.locate({ enableHighAccuracy: true }).on('locationfound', (e) => {
            const { lat, lng } = e.latlng;
            
            // Basic Ghana boundary check (Lat: ~4.5 to 11.5, Lng: ~-3.5 to 1.5)
            const isWithinGhana = lat >= 4.0 && lat <= 12.0 && lng >= -4.0 && lng <= 2.0;
            
            if (!isWithinGhana) {
                toast.error('Location detected outside Ghana. Please pin manually.');
                setLoading(false);
                return;
            }

            const coords = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            onChange(coords);
            map.flyTo(e.latlng, 17, { duration: 1.5 });
            setLoading(false);
            toast.success('Location verified!');
        }).on('locationerror', (err) => {
            console.error('Location error:', err);
            toast.error('Could not find your location accurately.');
            setLoading(false);
        });
    };

    return (
        <button
            onClick={(e) => {
                e.preventDefault();
                handleLocate();
            }}
            disabled={loading}
            className="absolute bottom-6 right-6 z-[1000] bg-stone-950 text-white p-4 rounded-2xl shadow-2xl hover:bg-amber-500 transition-all active:scale-95 border border-white/20 group"
            title="Use my current location"
        >
            {loading ? (
                <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
                <div className="flex items-center gap-3">
                    <Target className="h-5 w-5 group-hover:rotate-45 transition-transform" />
                    <span className="text-[10px] font-black uppercase tracking-widest pr-2">Locate Me</span>
                </div>
            )}
        </button>
    );
}

function ManualCoordsInput({ value, onChange }: LocationPickerProps) {
    const [latInput, setLatInput] = useState('');
    const [lngInput, setLngInput] = useState('');

    useEffect(() => {
        if (value) {
            const [lat, lng] = value.split(',').map(v => v.trim());
            setLatInput(lat || '');
            setLngInput(lng || '');
        }
    }, [value]);

    const handleManualSubmit = () => {
        const lat = parseFloat(latInput);
        const lng = parseFloat(lngInput);
        if (!isNaN(lat) && !isNaN(lng)) {
            onChange(`${lat.toFixed(6)}, ${lng.toFixed(6)}`);
            toast.success('Coordinates updated');
        } else {
            toast.error('Invalid coordinates format');
        }
    };

    return (
        <div className="absolute top-6 right-6 z-[1000] bg-white/90 backdrop-blur-xl p-4 rounded-3xl shadow-2xl border border-stone-200 w-64 animate-in fade-in zoom-in duration-300">
            <p className="text-[9px] font-black uppercase tracking-[0.2em] text-stone-400 mb-3 ml-1">Manual GPS Override</p>
            <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                    <input 
                        type="text" 
                        placeholder="Latitude" 
                        value={latInput}
                        onChange={e => setLatInput(e.target.value)}
                        className="bg-stone-50 border-stone-200 rounded-xl text-[10px] font-bold p-2 focus:ring-stone-900 focus:border-stone-900"
                    />
                    <input 
                        type="text" 
                        placeholder="Longitude" 
                        value={lngInput}
                        onChange={e => setLngInput(e.target.value)}
                        className="bg-stone-50 border-stone-200 rounded-xl text-[10px] font-bold p-2 focus:ring-stone-900 focus:border-stone-900"
                    />
                </div>
                <button 
                    type="button"
                    onClick={handleManualSubmit}
                    className="w-full bg-stone-950 text-white text-[9px] font-black uppercase tracking-widest py-2.5 rounded-xl hover:bg-amber-600 transition-all"
                >
                    Update Pin
                </button>
            </div>
        </div>
    );
}

export default function LocationPicker({ value, onChange }: LocationPickerProps) {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
        if (!customIcon) {
            customIcon = new L.Icon({
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41],
            });
        }
    }, []);

    if (!isMounted) return (
        <div className="flex h-full w-full items-center justify-center bg-stone-100 rounded-3xl">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-stone-900 border-t-transparent" />
        </div>
    );

    const initialCenter: [number, number] = [5.6037, -0.1870]; // Accra

    return (
        <div className="relative h-full w-full">
            <MapContainer
                center={initialCenter}
                zoom={12}
                scrollWheelZoom={true}
                className="h-full w-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker value={value} onChange={onChange} />
                <LocateButton onChange={onChange} />
            </MapContainer>

            {/* Manual Input Overlay */}
            <ManualCoordsInput value={value} onChange={onChange} />

            {/* Custom Map Overlay for "App" feel */}
            <div className="absolute inset-0 pointer-events-none border-[12px] border-white/5 rounded-[2.5rem] z-[1001]" />
        </div>
    );
}

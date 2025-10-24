'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { AnimationBackground } from '@/components/AnimationBackground';
import { Loader2 } from 'lucide-react';

// Dynamically import Leaflet components (client-side only)
const MapContainer = dynamic(
    () => import('react-leaflet').then((mod) => mod.MapContainer),
    { ssr: false }
);

const TileLayer = dynamic(
    () => import('react-leaflet').then((mod) => mod.TileLayer),
    { ssr: false }
);

const Marker = dynamic(
    () => import('react-leaflet').then((mod) => mod.Marker),
    { ssr: false }
);

const Popup = dynamic(
    () => import('react-leaflet').then((mod) => mod.Popup),
    { ssr: false }
);

interface MapMarker {
    id: string;
    title: string;
    city: string;
    country: string;
    coordinates: [number, number];
    imageUrl: string;
}

export default function MapPage() {
    const [markers, setMarkers] = useState<MapMarker[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        fetchMapData();
    }, []);

    const fetchMapData = async () => {
        try {
            const response = await fetch('/api/drops/map');
            const data = await response.json();
            if (data.ok) {
                setMarkers(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch map data:', error);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isClient) {
        return (
            <div className="flex flex-col items-center justify-center w-full h-[600px]">
                <AnimationBackground />
                <Loader2 size={48} className="text-[#97F0E5] animate-spin mb-4" />
                <p className="text-[#F7F7F7]/70">Loading map...</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center w-full min-h-[600px] font-montreal">
            <AnimationBackground />

            <main className="w-full max-w-7xl px-4 py-8 mt-8">
                <div className="mb-6 text-center">
                    <h1 className="font-mondwest text-4xl md:text-6xl mb-4">
                        World Map
                    </h1>
                    <p className="text-[#F7F7F7]/70">
                        Explore culture drops from around the world. Every marker represents a place permanently stored on Walrus blockchain by our global community.
                    </p>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-[600px] bg-[#0C0F1D] border-2 border-[#97F0E5]/30 rounded-lg">
                        <Loader2 size={48} className="text-[#97F0E5] animate-spin mb-4" />
                        <p className="text-[#F7F7F7]/70">Loading markers...</p>
                    </div>
                ) : (
                    <div className="h-[600px] border-2 border-[#97F0E5] rounded-lg overflow-hidden">
                        <link
                            rel="stylesheet"
                            href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
                            integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
                            crossOrigin=""
                        />
                        <MapContainer
                            center={[20, 0]}
                            zoom={2}
                            style={{ height: '100%', width: '100%' }}
                            className="z-0"
                        >
                            <TileLayer
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            {markers.map((marker) => (
                                <Marker
                                    key={marker.id}
                                    position={[marker.coordinates[1], marker.coordinates[0]]}
                                >
                                    <Popup>
                                        <div className="p-2 min-w-[200px]">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={marker.imageUrl}
                                                alt={marker.title}
                                                className="w-full h-32 object-cover rounded mb-2"
                                            />
                                            <h3 className="font-mondwest text-sm mb-1">
                                                {marker.title}
                                            </h3>
                                            <p className="text-xs text-gray-600 mb-2">
                                                {marker.city}, {marker.country}
                                            </p>
                                            <a
                                                href={`/drop/${marker.id}`}
                                                className="text-xs text-blue-600 hover:underline"
                                            >
                                                View Details →
                                            </a>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                )}

                <div className="mt-4 text-center text-sm text-[#F7F7F7]/50">
                    {markers.length} culture drops permanently stored on Walrus blockchain
                </div>
            </main>
        </div>
    );
}


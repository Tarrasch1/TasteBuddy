'use client';

import { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Link from 'next/link';
import { Star } from 'lucide-react';

interface Review {
  id: string;
  venueName: string;
  venueSlug: string;
  rating: number;
  comment: string;
  createdAt: string;
  latitude: number;
  longitude: number;
}

interface ProfileMapProps {
  reviews: Review[];
}

// Custom marker icons based on rating
const createColoredIcon = (rating: number) => {
  let color = '#ef4444'; // red for low ratings
  if (rating >= 4) {
    color = '#22c55e'; // green for high ratings
  } else if (rating >= 3) {
    color = '#eab308'; // yellow for medium ratings
  }

  return L.divIcon({
    className: 'custom-marker',
    html: `
      <div style="
        background-color: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50% 50% 50% 0;
        transform: rotate(-45deg);
        border: 3px solid white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
      ">
        <span style="
          transform: rotate(45deg);
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">${rating}</span>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [0, -32],
  });
};

// Component to fit bounds to all markers
function FitBounds({ reviews }: { reviews: Review[] }) {
  const map = useMap();

  useEffect(() => {
    if (reviews.length > 0) {
      const bounds = L.latLngBounds(
        reviews.map((r) => [r.latitude, r.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [map, reviews]);

  return null;
}

export default function ProfileMap({ reviews }: ProfileMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return (
      <div className="h-[400px] bg-muted flex items-center justify-center">
        <p className="text-muted-foreground">Harita yükleniyor...</p>
      </div>
    );
  }

  // Calculate center from reviews
  const center = reviews.length > 0
    ? {
        lat: reviews.reduce((sum, r) => sum + r.latitude, 0) / reviews.length,
        lng: reviews.reduce((sum, r) => sum + r.longitude, 0) / reviews.length,
      }
    : { lat: 41.0082, lng: 28.9784 }; // Default to Istanbul

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={12}
      style={{ height: '400px', width: '100%' }}
      scrollWheelZoom={true}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <FitBounds reviews={reviews} />
      
      {reviews.map((review) => (
        <Marker
          key={review.id}
          position={[review.latitude, review.longitude]}
          icon={createColoredIcon(review.rating)}
        >
          <Popup>
            <div className="min-w-[200px]">
              <Link 
                href={`/venues/${review.venueSlug}`}
                className="font-semibold text-primary hover:underline block mb-1"
              >
                {review.venueName}
              </Link>
              <div className="flex items-center gap-1 mb-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-4 w-4 ${
                      star <= review.rating
                        ? review.rating >= 4
                          ? 'fill-green-500 text-green-500'
                          : review.rating >= 3
                          ? 'fill-yellow-500 text-yellow-500'
                          : 'fill-red-500 text-red-500'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
                <span className="ml-1 text-sm font-medium">{review.rating}/5</span>
              </div>
              <p className="text-sm text-muted-foreground line-clamp-3 mb-2">
                {review.comment}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(review.createdAt).toLocaleDateString('tr-TR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

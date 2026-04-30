'use client';

import { useEffect, useState } from 'react';
import L from 'leaflet';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle } from 'react-leaflet';
import { Star, Navigation, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import 'leaflet/dist/leaflet.css';

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Custom colored markers
const createColoredIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      background-color: ${color};
      width: 30px;
      height: 30px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      border: 3px solid white;
      box-shadow: 0 2px 5px rgba(0,0,0,0.3);
    "></div>`,
    iconSize: [30, 30],
    iconAnchor: [15, 30],
    popupAnchor: [0, -30],
  });
};

const UserLocationIcon = L.divIcon({
  className: 'user-location-marker',
  html: `<div style="
    background-color: #3b82f6;
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
  "></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

L.Marker.prototype.options.icon = DefaultIcon;

export interface MapVenue {
  id: string;
  name: string;
  slug: string;
  address: string;
  latitude: number;
  longitude: number;
  averageRating: number;
  reviewCount: number;
  priceLevel: number;
  category: {
    name: string;
    icon: string;
  };
  photos?: { url: string }[];
}

interface VenueMapProps {
  venues: MapVenue[];
  center?: [number, number];
  zoom?: number;
  userLocation?: { lat: number; lng: number } | null;
  onVenueClick?: (venue: MapVenue) => void;
  className?: string;
}

// Component to recenter map when center changes
function ChangeView({ center, zoom }: { center: [number, number]; zoom: number }) {
  const map = useMap();
  useEffect(() => {
    try {
      if (center[0] && center[1] && !isNaN(center[0]) && !isNaN(center[1])) {
        map.setView(center, zoom);
      }
    } catch (error) {
      console.warn('Failed to set view:', error);
    }
  }, [center, zoom, map]);
  return null;
}

// Component to fit bounds to venues
function FitBounds({ venues, userLocation }: { venues: MapVenue[]; userLocation?: { lat: number; lng: number } | null }) {
  const map = useMap();
  
  useEffect(() => {
    if (venues.length === 0 && !userLocation) return;
    
    // Filter valid coordinates
    const bounds: [number, number][] = venues
      .filter(v => v.latitude && v.longitude && !isNaN(v.latitude) && !isNaN(v.longitude))
      .map(v => [v.latitude, v.longitude]);
    
    if (userLocation && userLocation.lat && userLocation.lng && 
        !isNaN(userLocation.lat) && !isNaN(userLocation.lng)) {
      bounds.push([userLocation.lat, userLocation.lng]);
    }
    
    if (bounds.length > 0) {
      try {
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
      } catch (error) {
        console.warn('Failed to fit bounds:', error);
      }
    }
  }, [venues, userLocation, map]);
  
  return null;
}

const getCategoryColor = (category: string): string => {
  const colors: Record<string, string> = {
    'Türk Mutfağı': '#ef4444',
    'Kafe': '#8b5cf6',
    'Fast Food': '#f59e0b',
    'Japon Mutfağı': '#ec4899',
    'İtalyan Mutfağı': '#22c55e',
    'Çin Mutfağı': '#f97316',
    'Meksika Mutfağı': '#84cc16',
    'Hint Mutfağı': '#eab308',
    'Deniz Ürünleri': '#06b6d4',
    'Vegan': '#10b981',
    'Tatlıcı': '#f472b6',
    'Bar': '#6366f1',
  };
  return colors[category] || '#6b7280';
};

export default function VenueMap({ 
  venues, 
  center = [41.0082, 28.9784], // Istanbul default
  zoom = 13,
  userLocation,
  onVenueClick,
  className = 'h-[400px] md:h-[500px]'
}: VenueMapProps) {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Filter out venues with invalid coordinates
  const validVenues = venues.filter(v => 
    v.latitude && v.longitude && 
    !isNaN(v.latitude) && !isNaN(v.longitude) &&
    v.latitude >= -90 && v.latitude <= 90 &&
    v.longitude >= -180 && v.longitude <= 180
  );

  // Validate user location
  const validUserLocation = userLocation && 
    userLocation.lat && userLocation.lng &&
    !isNaN(userLocation.lat) && !isNaN(userLocation.lng) &&
    userLocation.lat >= -90 && userLocation.lat <= 90 &&
    userLocation.lng >= -180 && userLocation.lng <= 180
    ? userLocation : null;

  // Calculate center from valid data
  const mapCenter: [number, number] = validUserLocation 
    ? [validUserLocation.lat, validUserLocation.lng] 
    : validVenues.length > 0 
      ? [validVenues[0].latitude, validVenues[0].longitude]
      : center;

  if (!isMounted) {
    return (
      <div className={`${className} bg-muted rounded-xl flex items-center justify-center`}>
        <div className="text-muted-foreground">Harita yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className={`${className} rounded-xl overflow-hidden border`}>
      <MapContainer
        key={`map-${mapCenter[0]}-${mapCenter[1]}`}
        center={mapCenter}
        zoom={zoom}
        className="h-full w-full"
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        <FitBounds venues={validVenues} userLocation={validUserLocation} />
        
        {/* User location marker */}
        {validUserLocation && (
          <>
            <Marker 
              position={[validUserLocation.lat, validUserLocation.lng]} 
              icon={UserLocationIcon}
            >
              <Popup>
                <div className="text-center">
                  <p className="font-medium">📍 Konumunuz</p>
                </div>
              </Popup>
            </Marker>
            <Circle
              center={[validUserLocation.lat, validUserLocation.lng]}
              radius={100}
              pathOptions={{
                color: '#3b82f6',
                fillColor: '#3b82f6',
                fillOpacity: 0.1,
              }}
            />
          </>
        )}
        
        {/* Venue markers */}
        {validVenues.map((venue) => (
          <Marker
            key={venue.id}
            position={[venue.latitude, venue.longitude]}
            icon={createColoredIcon(getCategoryColor(venue.category.name))}
            eventHandlers={{
              click: () => onVenueClick?.(venue),
            }}
          >
            <Popup>
              <div className="min-w-[200px]">
                <div className="flex items-start gap-2 mb-2">
                  <span className="text-2xl">{venue.category.icon}</span>
                  <div>
                    <h3 className="font-semibold text-sm">{venue.name}</h3>
                    <p className="text-xs text-gray-500">{venue.category.name}</p>
                  </div>
                </div>
                
                <p className="text-xs text-gray-600 mb-2">{venue.address}</p>
                
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="text-sm font-medium">{venue.averageRating.toFixed(1)}</span>
                    <span className="text-xs text-gray-500">({venue.reviewCount})</span>
                  </div>
                  <span className="text-sm text-gray-600">
                    {Array(venue.priceLevel).fill('₺').join('')}
                  </span>
                </div>
                
                <Link
                  href={`/venues/${venue.slug}`}
                  className="flex items-center justify-center gap-1 w-full bg-primary text-white text-xs py-2 px-3 rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Detayları Gör
                  <ExternalLink className="h-3 w-3" />
                </Link>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}

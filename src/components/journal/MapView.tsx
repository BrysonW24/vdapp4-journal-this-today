'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Navigation, Loader2, Info, Compass, Smile, Locate } from 'lucide-react';
import type { JournalEntry } from '@/types/journal';

interface MapViewProps {
  entries: JournalEntry[];
}

export function MapView({ entries }: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Entries with location data
  const geoEntries = entries.filter((e) => e.location?.latitude && e.location?.longitude);

  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => {
          // Fallback to Sydney if denied
          setUserLocation({ lat: -33.8688, lng: 151.2093 });
          setLocationError('Location access denied. Showing default location.');
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      setUserLocation({ lat: -33.8688, lng: 151.2093 });
      setLocationError('Geolocation not supported.');
    }
  }, []);

  useEffect(() => {
    if (!userLocation || !mapRef.current || mapInstanceRef.current) return;

    const initMap = async () => {
      const L = await import('leaflet');

      const map = L.map(mapRef.current!, {
        center: [userLocation.lat, userLocation.lng],
        zoom: 10,
        zoomControl: false,
        attributionControl: false,
      });

      // Clean, colorful map tiles (similar to Apple Maps aesthetic)
      L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        maxZoom: 19,
      }).addTo(map);

      // Minimal attribution bottom-left
      L.control
        .attribution({
          position: 'bottomleft',
          prefix: false,
        })
        .addTo(map);

      // Zoom control bottom-right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // User location marker — blue pulsing dot
      const userIcon = L.divIcon({
        html: `<div class="map-user-marker"></div>`,
        className: '',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });

      L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
        .addTo(map)
        .bindPopup(
          '<span style="font-size:12px;font-weight:600;font-family:system-ui;">Your location</span>',
          { closeButton: false, className: 'map-popup-minimal' }
        );

      // Add entry markers
      geoEntries.forEach((entry) => {
        if (!entry.location) return;

        const entryIcon = L.divIcon({
          html: `<div class="map-entry-marker">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>
          </div>`,
          className: '',
          iconSize: [34, 34],
          iconAnchor: [17, 17],
          popupAnchor: [0, -20],
        });

        const popupContent = `
          <div style="min-width:180px;font-family:system-ui,-apple-system,sans-serif;">
            <a href="/journal/${entry.id}" style="text-decoration:none;color:inherit;display:block;">
              <p style="font-size:14px;font-weight:600;margin:0 0 3px;color:#2D3B2D;">${entry.title || 'Untitled'}</p>
              ${entry.location.placeName || entry.location.address ? `<p style="font-size:11px;color:#6B7B6B;margin:0 0 2px;">${entry.location.placeName || entry.location.address}</p>` : ''}
              <p style="font-size:10px;color:#9BA09B;margin:0;">${new Date(entry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
            </a>
          </div>
        `;

        L.marker([entry.location.latitude, entry.location.longitude], {
          icon: entryIcon,
        })
          .addTo(map)
          .bindPopup(popupContent, {
            closeButton: false,
            className: 'map-popup-entry',
          });
      });

      // Fit bounds to show all markers
      if (geoEntries.length > 0) {
        const allPoints: [number, number][] = [
          [userLocation.lat, userLocation.lng],
          ...geoEntries.map(
            (e) => [e.location!.latitude, e.location!.longitude] as [number, number]
          ),
        ];
        map.fitBounds(allPoints, { padding: [50, 50], maxZoom: 13 });
      }

      mapInstanceRef.current = map;
      setIsLoading(false);
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [userLocation, geoEntries]);

  const handleCenterOnUser = useCallback(() => {
    if (mapInstanceRef.current && userLocation) {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 13, {
        duration: 0.8,
      });
    }
  }, [userLocation]);

  const handleFitAll = useCallback(() => {
    if (!mapInstanceRef.current || !userLocation) return;
    if (geoEntries.length > 0) {
      const allPoints: [number, number][] = [
        [userLocation.lat, userLocation.lng],
        ...geoEntries.map(
          (e) => [e.location!.latitude, e.location!.longitude] as [number, number]
        ),
      ];
      mapInstanceRef.current.fitBounds(allPoints, { padding: [50, 50], maxZoom: 13 });
    } else {
      mapInstanceRef.current.flyTo([userLocation.lat, userLocation.lng], 10, { duration: 0.8 });
    }
  }, [userLocation, geoEntries]);

  return (
    <div className="-mx-4 relative">
      {/* Toolbar — icon buttons row */}
      <div className="absolute top-3 left-3 right-3 z-[500] flex items-center justify-between pointer-events-none">
        {/* Left side — location count + info */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <button
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-zen-night-card/90 backdrop-blur-md shadow-sm border border-zen-sand/20 dark:border-zen-night-border/30 flex items-center justify-center hover:bg-white dark:hover:bg-zen-night-card transition-colors"
            title="Map info"
          >
            <Info size={14} className="text-zen-forest/60 dark:text-zen-parchment/60" />
          </button>
          <button
            onClick={handleCenterOnUser}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-zen-night-card/90 backdrop-blur-md shadow-sm border border-zen-sand/20 dark:border-zen-night-border/30 flex items-center justify-center hover:bg-white dark:hover:bg-zen-night-card transition-colors"
            title="Center on my location"
          >
            <Locate size={14} className="text-zen-forest/60 dark:text-zen-parchment/60" />
          </button>
          <button
            onClick={handleFitAll}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-zen-night-card/90 backdrop-blur-md shadow-sm border border-zen-sand/20 dark:border-zen-night-border/30 flex items-center justify-center hover:bg-white dark:hover:bg-zen-night-card transition-colors"
            title="Show all entries"
          >
            <Compass size={14} className="text-zen-forest/60 dark:text-zen-parchment/60" />
          </button>
          <button
            onClick={handleCenterOnUser}
            className="w-8 h-8 rounded-full bg-white/90 dark:bg-zen-night-card/90 backdrop-blur-md shadow-sm border border-zen-sand/20 dark:border-zen-night-border/30 flex items-center justify-center hover:bg-white dark:hover:bg-zen-night-card transition-colors"
            title="Navigate"
          >
            <Navigation size={14} className="text-zen-forest/60 dark:text-zen-parchment/60" />
          </button>
        </div>

        {/* Right side — entry count badge */}
        <div className="flex items-center gap-1.5 pointer-events-auto">
          <div className="h-8 rounded-full bg-white/90 dark:bg-zen-night-card/90 backdrop-blur-md shadow-sm border border-zen-sand/20 dark:border-zen-night-border/30 flex items-center gap-1 px-2.5">
            <Smile size={14} className="text-zen-forest/60 dark:text-zen-parchment/60" />
            <span className="text-[12px] font-semibold text-zen-forest/70 dark:text-zen-parchment/70">
              {geoEntries.length}
            </span>
          </div>
        </div>
      </div>

      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-[500] flex items-center justify-center bg-zen-parchment/80 dark:bg-zen-night/80 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <Loader2 size={28} className="text-zen-sage animate-spin" />
            <span className="text-sm text-zen-moss/60 dark:text-zen-stone/60 font-medium">
              Loading map...
            </span>
          </div>
        </div>
      )}

      {/* Location error banner */}
      {locationError && (
        <div className="absolute bottom-3 left-3 right-3 z-[500]">
          <div className="bg-zen-clay/10 border border-zen-clay/20 rounded-xl px-3.5 py-2.5 text-xs text-zen-clay font-medium backdrop-blur-sm">
            {locationError}
          </div>
        </div>
      )}

      {/* Map container — fills viewport below tabs like Day One */}
      <div
        ref={mapRef}
        className="w-full overflow-hidden"
        style={{ height: 'calc(100vh - 220px)', minHeight: '500px' }}
      />

      {/* Leaflet CSS + custom marker styles */}
      <style jsx global>{`
        @import url('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

        /* User location marker — blue pulsing dot */
        .map-user-marker {
          width: 18px;
          height: 18px;
          background: #4285F4;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.25), 0 2px 8px rgba(0, 0, 0, 0.2);
          animation: userPulse 3s ease-in-out infinite;
        }

        @keyframes userPulse {
          0%, 100% { box-shadow: 0 0 0 3px rgba(66, 133, 244, 0.25), 0 2px 8px rgba(0, 0, 0, 0.2); }
          50% { box-shadow: 0 0 0 8px rgba(66, 133, 244, 0.1), 0 2px 8px rgba(0, 0, 0, 0.2); }
        }

        /* Entry marker — green journal icon */
        .map-entry-marker {
          width: 34px;
          height: 34px;
          background: #5B7F5E;
          border: 2.5px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.2s ease;
        }
        .map-entry-marker:hover {
          transform: scale(1.1);
        }

        /* Popup styling */
        .map-popup-minimal .leaflet-popup-content-wrapper,
        .map-popup-entry .leaflet-popup-content-wrapper {
          border-radius: 14px !important;
          box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12) !important;
          padding: 0 !important;
          border: 1px solid rgba(0, 0, 0, 0.04);
        }
        .map-popup-minimal .leaflet-popup-content,
        .map-popup-entry .leaflet-popup-content {
          margin: 12px 16px !important;
        }
        .map-popup-minimal .leaflet-popup-tip,
        .map-popup-entry .leaflet-popup-tip {
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.06) !important;
        }

        /* Zoom controls */
        .leaflet-control-zoom {
          border: none !important;
          box-shadow: none !important;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }
        .leaflet-control-zoom a {
          border-radius: 10px !important;
          width: 34px !important;
          height: 34px !important;
          line-height: 34px !important;
          font-size: 16px !important;
          border: none !important;
          background: rgba(255, 255, 255, 0.92) !important;
          backdrop-filter: blur(8px);
          box-shadow: 0 1px 6px rgba(0, 0, 0, 0.1) !important;
          color: #2D3B2D !important;
          font-weight: 300 !important;
        }
        .leaflet-control-zoom a:hover {
          background: rgba(255, 255, 255, 1) !important;
        }

        /* Attribution minimal */
        .leaflet-control-attribution {
          background: rgba(255, 255, 255, 0.6) !important;
          backdrop-filter: blur(4px);
          font-size: 9px !important;
          padding: 2px 6px !important;
          border-radius: 4px !important;
          color: #666 !important;
        }
        .leaflet-control-attribution a {
          color: #444 !important;
        }
      `}</style>
    </div>
  );
}

// Leaflet type for the dynamic import
declare const L: typeof import('leaflet');

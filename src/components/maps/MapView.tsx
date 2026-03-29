"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface MapMarker {
  id: number;
  lat: number;
  lng: number;
  label: string;
  emoji?: string;
  href?: string;
}

interface MapViewProps {
  markers: MapMarker[];
  center?: [number, number];
  zoom?: number;
  userPosition?: { lat: number; lng: number } | null;
  radiusKm?: number;
  className?: string;
}

export function MapView({
  markers,
  center = [46.6034, 1.8883], // Center of France
  zoom = 6,
  userPosition,
  radiusKm,
  className = "",
}: MapViewProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    const map = L.map(mapRef.current).setView(center, zoom);
    mapInstanceRef.current = map;

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Update markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    // Clear existing markers
    map.eachLayer((layer) => {
      if (layer instanceof L.Marker || layer instanceof L.Circle) {
        map.removeLayer(layer);
      }
    });

    // Add markers
    markers.forEach((m) => {
      const icon = L.divIcon({
        className: "custom-marker",
        html: `<div style="background:var(--terra,#B85C38);color:white;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:16px;border:2px solid white;box-shadow:0 2px 8px rgba(0,0,0,.2)">${m.emoji || "📍"}</div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map);
      marker.bindPopup(
        `<div style="font-family:sans-serif;font-size:13px"><strong>${m.label}</strong>${m.href ? `<br><a href="${m.href}" style="color:#B85C38">Voir</a>` : ""}</div>`,
      );
    });

    // User position
    if (userPosition) {
      const userIcon = L.divIcon({
        className: "user-marker",
        html: '<div style="width:16px;height:16px;border-radius:50%;background:#3B82F6;border:3px solid white;box-shadow:0 0 0 0 rgba(184,92,56,.4);animation:userPulse 2s infinite"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8],
      });
      L.marker([userPosition.lat, userPosition.lng], { icon: userIcon }).addTo(
        map,
      );

      if (radiusKm) {
        L.circle([userPosition.lat, userPosition.lng], {
          radius: radiusKm * 1000,
          color: "var(--terra, #B85C38)",
          fillColor: "var(--terra, #B85C38)",
          fillOpacity: 0.08,
          weight: 1.5,
        }).addTo(map);
      }
    }

    // Fit bounds if markers exist
    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers.map((m) => [m.lat, m.lng]));
      if (userPosition) {
        bounds.extend([userPosition.lat, userPosition.lng]);
      }
      map.fitBounds(bounds, { padding: [40, 40], maxZoom: 14 });
    }
  }, [markers, userPosition, radiusKm]);

  return (
    <div
      ref={mapRef}
      className={`w-full h-full min-h-[400px] rounded-card ${className}`}
    />
  );
}

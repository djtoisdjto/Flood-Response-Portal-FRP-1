import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { NeedItem, Shelter, UserLocation } from '../types';
import { HistoricalSafeZone } from '../types/disasterRelief';

interface DisasterMapProps {
  needs: NeedItem[];
  shelters: Shelter[];
  safeZones?: HistoricalSafeZone[];
  userLocation: UserLocation | null;
  selectedNeedId: string | null;
  selectedShelterId: string | null;
  selectedSafeZoneId?: string | null;
  onSelectNeed: (need: NeedItem) => void;
  onSelectShelter: (shelter: Shelter) => void;
  onSelectSafeZone?: (safeZone: HistoricalSafeZone) => void;
  isLocationPicking?: boolean;
  pickedLocation?: { lat: number; lng: number } | null;
  onPickLocation?: (lat: number, lng: number) => void;
  filterShowNeeds: boolean;
  filterShowShelters: boolean;
  filterShowSafeZones?: boolean;
  lowBandwidthMode: boolean;
}

export const DisasterMap: React.FC<DisasterMapProps> = ({
  needs,
  shelters,
  safeZones = [],
  userLocation,
  selectedNeedId,
  selectedShelterId,
  selectedSafeZoneId,
  onSelectNeed,
  onSelectShelter,
  onSelectSafeZone,
  isLocationPicking = false,
  pickedLocation,
  onPickLocation,
  filterShowNeeds,
  filterShowShelters,
  filterShowSafeZones = true,
  lowBandwidthMode,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const pickMarkerRef = useRef<L.Marker | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const initialCenter: [number, number] = userLocation
      ? [userLocation.lat, userLocation.lng]
      : [15.2287, 104.8564]; // Default Ubon Ratchathani (Mun River basin)

    const map = L.map(mapContainerRef.current, {
      center: initialCenter,
      zoom: 13,
      zoomControl: false,
    });

    // Custom Zoom control placed at top right
    L.control.zoom({ position: 'topright' }).addTo(map);

    // Invalidate map size on window resize and dashboard reset
    const handleInvalidate = () => {
      setTimeout(() => {
        map.invalidateSize();
      }, 80);
    };
    window.addEventListener('resize', handleInvalidate);
    window.addEventListener('reset-main-dashboard', handleInvalidate);

    // Standard OpenStreetMap tiles (free, lightweight)
    const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
    const tiles = L.tileLayer(tileUrl, {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors',
    });
    tiles.addTo(map);

    const markersGroup = L.layerGroup().addTo(map);
    markersLayerRef.current = markersGroup;
    mapInstanceRef.current = map;

    return () => {
      window.removeEventListener('resize', handleInvalidate);
      window.removeEventListener('reset-main-dashboard', handleInvalidate);
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Handle Location Picking click
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    const handleMapClick = (e: L.LeafletMouseEvent) => {
      if (isLocationPicking && onPickLocation) {
        onPickLocation(e.latlng.lat, e.latlng.lng);
      }
    };

    map.on('click', handleMapClick);
    return () => {
      map.off('click', handleMapClick);
    };
  }, [isLocationPicking, onPickLocation]);

  // Render picked location marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (pickMarkerRef.current) {
      map.removeLayer(pickMarkerRef.current);
      pickMarkerRef.current = null;
    }

    if (pickedLocation) {
      const pinHtml = `
        <div class="flex flex-col items-center">
          <div class="bg-indigo-600 text-white p-2 rounded-full shadow-lg border-2 border-white animate-bounce">
            <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"></path></svg>
          </div>
          <span class="bg-indigo-900 text-white text-[11px] font-bold px-2 py-0.5 rounded shadow mt-1 whitespace-nowrap">จุดที่เลือก</span>
        </div>
      `;
      const icon = L.divIcon({
        className: 'custom-pick-marker',
        html: pinHtml,
        iconSize: [40, 50],
        iconAnchor: [20, 48],
      });
      const marker = L.marker([pickedLocation.lat, pickedLocation.lng], { icon }).addTo(map);
      pickMarkerRef.current = marker;
    }
  }, [pickedLocation]);

  // Update Need and Shelter Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const layer = markersLayerRef.current;
    if (!map || !layer) return;

    layer.clearLayers();

    // 1. Render User GPS location marker
    if (userLocation) {
      const userIcon = L.divIcon({
        className: 'custom-pin',
        html: `
          <div class="relative flex items-center justify-center w-8 h-8">
            <div class="absolute w-7 h-7 bg-blue-500 rounded-full opacity-75 pulse-gps"></div>
            <div class="relative w-4 h-4 bg-blue-600 border-2 border-white rounded-full shadow-md"></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });
      const userMarker = L.marker([userLocation.lat, userLocation.lng], {
        icon: userIcon,
        zIndexOffset: 1000,
      });
      userMarker.bindTooltip('ตำแหน่งของคุณ (GPS)', { direction: 'top', offset: [0, -12] });
      layer.addLayer(userMarker);
    }

    // 2. Render Need Pins (Feature 1: Orange for Pending, Green for Claimed)
    if (filterShowNeeds) {
      needs.forEach((need) => {
        const isSelected = need.id === selectedNeedId;
        const isPending = need.status === 'pending';
        const isClaimed = need.status === 'claimed';

        // Pin color according to specifications:
        // Orange = Pending, Green = Claimed ("รับจบ")
        const bgColor = isPending ? 'bg-orange-500' : 'bg-emerald-600';
        const borderColor = isSelected ? 'border-black ring-4 ring-orange-300' : 'border-white';
        const pulseClass = isPending && need.urgency === 'critical' ? 'pulse-orange' : '';

        const iconHtml = `
          <div class="custom-pin flex flex-col items-center group">
            <div class="relative flex items-center justify-center w-9 h-9 rounded-full shadow-lg ${bgColor} text-white border-2 ${borderColor} ${pulseClass} transition-transform">
              ${
                isPending
                  ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>`
                  : `<svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2.5" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/></svg>`
              }
            </div>
            <div class="mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold shadow ${isPending ? 'bg-orange-950 text-orange-100' : 'bg-emerald-950 text-emerald-100'} whitespace-nowrap max-w-[120px] truncate">
              ${isPending ? 'ขอ: ' + need.title : '✓ รับจบแล้ว'}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'need-marker',
          html: iconHtml,
          iconSize: [40, 56],
          iconAnchor: [20, 48],
        });

        const marker = L.marker([need.lat, need.lng], { icon });
        marker.on('click', () => {
          onSelectNeed(need);
        });

        layer.addLayer(marker);
      });
    }

    // 3. Render Shelter Pins (Feature 2: Green <70%, Yellow 70-90%, Red >90% or Full)
    if (filterShowShelters) {
      shelters.forEach((shelter) => {
        const isSelected = shelter.id === selectedShelterId;
        const percent = Math.round((shelter.currentOccupancy / shelter.maxCapacity) * 100);

        let statusColor = 'bg-emerald-600';
        let badgeColor = 'bg-emerald-950 text-emerald-100';
        let statusText = 'ว่าง';

        if (percent >= 90) {
          statusColor = 'bg-red-600';
          badgeColor = 'bg-red-950 text-red-100';
          statusText = 'เต็ม/วิกฤต';
        } else if (percent >= 70) {
          statusColor = 'bg-amber-500';
          badgeColor = 'bg-amber-950 text-amber-100';
          statusText = 'หนาแน่น';
        }

        const borderColor = isSelected ? 'border-black ring-4 ring-blue-300' : 'border-white';

        const shelterHtml = `
          <div class="custom-pin flex flex-col items-center">
            <div class="relative flex items-center justify-center w-9 h-9 rounded-md shadow-lg ${statusColor} text-white border-2 ${borderColor}">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
            </div>
            <div class="mt-1 px-1.5 py-0.5 rounded text-[10px] font-bold shadow ${badgeColor} whitespace-nowrap">
              ${shelter.currentOccupancy}/${shelter.maxCapacity} (${statusText})
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'shelter-marker',
          html: shelterHtml,
          iconSize: [44, 56],
          iconAnchor: [22, 48],
        });

        const marker = L.marker([shelter.lat, shelter.lng], { icon });
        marker.on('click', () => {
          onSelectShelter(shelter);
        });

        layer.addLayer(marker);
      });
    }

    // 4. Render Historical Safe Zone Pins (Green/Teal shield pins for historical safe ground)
    if (filterShowSafeZones && safeZones.length > 0) {
      safeZones.forEach((zone) => {
        const isSelected = zone.id === selectedSafeZoneId;
        const borderColor = isSelected ? 'border-black ring-4 ring-emerald-300' : 'border-white';

        const safeZoneHtml = `
          <div class="custom-pin flex flex-col items-center">
            <div class="relative flex items-center justify-center w-8 h-8 rounded-full shadow-lg bg-teal-600 text-white border-2 ${borderColor}">
              <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fill-rule="evenodd" d="M10 1.944A11.954 11.954 0 012.166 5C2.056 5.649 2 6.319 2 7c0 5.225 3.34 9.67 8 11.317C14.66 16.67 18 12.225 18 7c0-.682-.057-1.35-.166-2.001A11.954 11.954 0 0110 1.944zM11 14a1 1 0 11-2 0 1 1 0 012 0zm0-7a1 1 0 10-2 0v3a1 1 0 102 0V7z" clip-rule="evenodd"></path></svg>
            </div>
            <div class="mt-0.5 px-1.5 py-0.5 rounded text-[9px] font-bold shadow bg-teal-950 text-teal-100 whitespace-nowrap max-w-[120px] truncate">
              🛡️ ${zone.name}
            </div>
          </div>
        `;

        const icon = L.divIcon({
          className: 'safe-zone-marker',
          html: safeZoneHtml,
          iconSize: [40, 52],
          iconAnchor: [20, 44],
        });

        const marker = L.marker([zone.lat, zone.lng], { icon });
        marker.on('click', () => {
          if (onSelectSafeZone) onSelectSafeZone(zone);
        });

        layer.addLayer(marker);
      });
    }
  }, [needs, shelters, safeZones, userLocation, selectedNeedId, selectedShelterId, selectedSafeZoneId, filterShowNeeds, filterShowShelters, filterShowSafeZones, onSelectNeed, onSelectShelter, onSelectSafeZone]);

  // Center map when selectedNeedId or selectedShelterId changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedNeedId) {
      const target = needs.find((n) => n.id === selectedNeedId);
      if (target) {
        map.panTo([target.lat, target.lng], { animate: true });
      }
    } else if (selectedShelterId) {
      const target = shelters.find((s) => s.id === selectedShelterId);
      if (target) {
        map.panTo([target.lat, target.lng], { animate: true });
      }
    } else if (selectedSafeZoneId) {
      const target = safeZones.find((z) => z.id === selectedSafeZoneId);
      if (target) {
        map.panTo([target.lat, target.lng], { animate: true });
      }
    }
  }, [selectedNeedId, selectedShelterId, selectedSafeZoneId, needs, shelters, safeZones]);

  const handleRecenter = () => {
    const map = mapInstanceRef.current;
    if (!map) return;
    if (userLocation) {
      map.setView([userLocation.lat, userLocation.lng], 14, { animate: true });
    } else {
      map.setView([15.2425, 104.8472], 13, { animate: true }); // Ubon Ratchathani City Hall
    }
  };

  return (
    <div className={`relative w-full h-full overflow-hidden ${lowBandwidthMode ? 'low-bandwidth-map' : ''}`}>
      <div id="disaster-map-container" ref={mapContainerRef} className="w-full h-full" />

      {/* Crosshair indicator when picking location */}
      {isLocationPicking && (
        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 bg-indigo-900 text-white px-4 py-2 rounded-full text-xs font-semibold shadow-xl border border-indigo-400/30 flex items-center gap-2 pointer-events-none animate-pulse">
          <span>📍 แตะบนแผนที่เพื่อระบุพิกัดที่ต้องการรับความช่วยเหลือ</span>
        </div>
      )}

      {/* Floating GPS Recenter Button */}
      <button
        id="btn-recenter-gps"
        onClick={handleRecenter}
        title="กลับไปที่ตำแหน่งของฉัน"
        className="absolute bottom-24 right-4 z-20 bg-white hover:bg-stone-50 active:scale-95 text-stone-800 p-3 rounded-xl shadow-lg border border-stone-200 transition-all flex items-center justify-center cursor-pointer"
      >
        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <circle cx="12" cy="12" r="3" />
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 2v3m0 14v3M2 12h3m14 0h3" />
        </svg>
      </button>
    </div>
  );
};

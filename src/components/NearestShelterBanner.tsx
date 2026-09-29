import React from 'react';
import { Shelter, UserLocation } from '../types';
import { calculateDistanceKm, formatDistance, getGoogleMapsNavUrl } from '../utils/distance';
import { Navigation, Compass, AlertCircle, Locate, MapPin } from 'lucide-react';

interface NearestShelterBannerProps {
  shelters: Shelter[];
  userLocation: UserLocation | null;
  onSelectShelter: (shelter: Shelter) => void;
  onRefreshGPS?: () => void;
  onUseUbonCityHall?: () => void;
}

export const NearestShelterBanner: React.FC<NearestShelterBannerProps> = ({
  shelters,
  userLocation,
  onSelectShelter,
  onRefreshGPS,
  onUseUbonCityHall,
}) => {
  if (!userLocation) return null;

  // Filter shelters that are available (< 100% capacity) and compute distance
  const availableShelters = shelters
    .filter((s) => s.currentOccupancy < s.maxCapacity)
    .map((s) => ({
      ...s,
      distanceKm: calculateDistanceKm(userLocation.lat, userLocation.lng, s.lat, s.lng),
      availableSlots: s.maxCapacity - s.currentOccupancy,
    }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  const nearest = availableShelters[0];

  if (!nearest) {
    return (
      <div className="bg-rose-900 text-rose-100 p-3 rounded-xl border border-rose-700 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          <span>ศูนย์พักพิงในพื้นที่ทั้งหมดเต็มแล้ว! กรุณาติดต่อสายด่วน 1784 เพื่อจัดสรรพื้นที่ใหม่</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-stone-900 text-white p-3 sm:p-3.5 rounded-xl shadow-md border border-blue-700/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      <div className="flex items-start sm:items-center gap-2.5 min-w-0">
        <div className="w-8 h-8 rounded-lg bg-blue-600/80 flex items-center justify-center shrink-0 border border-blue-400/30">
          <Compass className="w-4 h-4 text-white" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              ศูนย์ใกล้คุณที่สุด &bull; ยังมีที่ว่าง
            </span>
            <span
              className="distance-tag text-xs font-extrabold text-blue-300"
              data-lat={nearest.lat}
              data-lng={nearest.lng}
            >
              ห่างเพียง {formatDistance(nearest.distanceKm)}
            </span>
            {userLocation.isFallback ? (
              <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-400/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                <MapPin className="w-2.5 h-2.5" />
                <span>อ้างอิง: ศาลากลาง จ.อุบลฯ</span>
              </span>
            ) : (
              <span className="text-[10px] bg-sky-500/20 text-sky-200 border border-sky-400/30 px-1.5 py-0.5 rounded flex items-center gap-1">
                <Locate className="w-2.5 h-2.5" />
                <span>GPS อุปกรณ์จริง</span>
              </span>
            )}
          </div>
          <h4 className="text-sm font-bold text-white truncate mt-0.5">
            {nearest.name}
          </h4>
          <p className="text-[11px] text-stone-300 truncate">
            {nearest.address} &bull; ว่างอีก{' '}
            <strong className="text-emerald-400 font-bold">{nearest.availableSlots} ที่</strong>{' '}
            (จุ {nearest.currentOccupancy}/{nearest.maxCapacity})
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto flex-wrap">
        {userLocation.isFallback ? (
          <button
            onClick={onRefreshGPS}
            title="กดเพื่อตรวจจับพิกัด GPS จริงจากอุปกรณ์"
            className="text-[11px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-200 font-medium px-2.5 py-1.5 rounded-lg border border-sky-400/40 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Locate className="w-3 h-3" />
            <span>ใช้ GPS จริง</span>
          </button>
        ) : (
          <button
            onClick={onUseUbonCityHall}
            title="กดเพื่อจำลองพิกัด ณ ศาลากลางอุบลฯ เพื่อดูระยะทางในพื้นที่"
            className="text-[11px] bg-white/10 hover:bg-white/20 text-stone-200 font-medium px-2.5 py-1.5 rounded-lg border border-white/20 transition-all flex items-center gap-1 cursor-pointer"
          >
            <MapPin className="w-3 h-3" />
            <span>จำลองจุดศาลากลาง</span>
          </button>
        )}

        <button
          onClick={() => onSelectShelter(nearest)}
          className="text-xs bg-white/10 hover:bg-white/20 text-white font-semibold px-3 py-1.5 rounded-lg border border-white/20 transition-all cursor-pointer"
        >
          ดูข้อมูล
        </button>
        <a
          href={getGoogleMapsNavUrl(nearest.lat, nearest.lng, nearest.name)}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
        >
          <Navigation className="w-3.5 h-3.5" />
          <span>นำทางทันที</span>
        </a>
      </div>
    </div>
  );
};

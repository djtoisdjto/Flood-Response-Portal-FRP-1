import React from 'react';
import { Shelter } from '../types';
import { calculateDistanceKm, formatDistance, getGoogleMapsNavUrl } from '../utils/distance';
import { MapPin, Phone, Users, Navigation, Plus, Minus, Check, AlertCircle } from 'lucide-react';

interface ShelterCardProps {
  shelter: Shelter;
  userLat?: number;
  userLng?: number;
  isSelected?: boolean;
  onSelect: () => void;
  onTally: (shelterId: string, delta: number) => void;
  onOpenManage?: (shelter: Shelter) => void;
  onViewEvacuees?: (shelter: Shelter) => void;
  evacueeCount?: number;
}

export const ShelterCard: React.FC<ShelterCardProps> = ({
  shelter,
  userLat,
  userLng,
  isSelected,
  onSelect,
  onTally,
  onOpenManage,
  onViewEvacuees,
  evacueeCount,
}) => {
  const percent = Math.round((shelter.currentOccupancy / shelter.maxCapacity) * 100);
  const remainingSlots = Math.max(0, shelter.maxCapacity - shelter.currentOccupancy);

  // Status Colors according to prompt specs:
  // 🟢 Green: < 70% (ยังมีที่ว่าง)
  // 🟡 Yellow: 70% - 90% (เริ่มหนาแน่น)
  // 🔴 Red: > 90% หรือเต็มแล้ว
  let statusBadge = {
    bg: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    dot: 'bg-emerald-500',
    bar: 'bg-emerald-500',
    text: 'ยังมีที่ว่าง (พร้อมรับ)',
    icon: Check,
  };

  if (percent >= 90) {
    statusBadge = {
      bg: 'bg-rose-50 text-rose-800 border-rose-300',
      dot: 'bg-rose-500',
      bar: 'bg-rose-500',
      text: 'เต็มแล้ว / หนาแน่นวิกฤต',
      icon: AlertCircle,
    };
  } else if (percent >= 70) {
    statusBadge = {
      bg: 'bg-amber-50 text-amber-800 border-amber-300',
      dot: 'bg-amber-500',
      bar: 'bg-amber-500',
      text: 'เริ่มหนาแน่น (ใกล้เต็ม)',
      icon: AlertCircle,
    };
  }

  const distanceKm =
    userLat !== undefined && userLng !== undefined
      ? calculateDistanceKm(userLat, userLng, shelter.lat, shelter.lng)
      : null;

  return (
    <div
      id={`shelter-card-${shelter.id}`}
      onClick={onSelect}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer bg-white shadow-xs ${
        isSelected
          ? 'border-blue-500 ring-2 ring-blue-200'
          : 'border-stone-200 hover:border-stone-300'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <div>
          <h3 className="text-base font-bold text-stone-900 leading-snug">
            {shelter.name}
          </h3>
          <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
            <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
            <span className="truncate">{shelter.address}</span>
            {distanceKm !== null && (
              <span
                className="distance-tag text-blue-600 font-bold shrink-0"
                data-lat={shelter.lat}
                data-lng={shelter.lng}
              >
                ({formatDistance(distanceKm)})
              </span>
            )}
          </p>
        </div>

        {/* Visual Status Badge */}
        <span
          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold border shrink-0 ${statusBadge.bg}`}
        >
          <span className={`w-2 h-2 rounded-full ${statusBadge.dot}`} />
          <span>{statusBadge.text}</span>
        </span>
      </div>

      {/* Live Capacity Bar */}
      <div className="bg-stone-50 rounded-lg p-3 border border-stone-200/80 mb-3">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="font-semibold text-stone-700 flex items-center gap-1">
            <Users className="w-3.5 h-3.5 text-stone-500" />
            <span>ความจุปัจจุบัน:</span>
          </span>
          <span className="font-bold text-stone-900">
            <span className="text-base font-extrabold text-stone-900">
              {shelter.currentOccupancy}
            </span>
            <span className="text-stone-400"> / {shelter.maxCapacity} คน</span>
            <span className="ml-1 text-stone-500 font-normal">({percent}%)</span>
          </span>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full bg-stone-200 rounded-full h-2.5 overflow-hidden">
          <div
            className={`h-2.5 rounded-full transition-all duration-300 ${statusBadge.bar}`}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1.5">
          <span>
            {remainingSlots > 0 ? (
              <span className="text-emerald-700 font-medium">
                ว่างอีก {remainingSlots} ที่
              </span>
            ) : (
              <span className="text-rose-700 font-bold">ไม่มีที่ว่างแล้ว</span>
            )}
          </span>
          <span className="text-stone-400">
            อัปเดต: {new Date(shelter.lastUpdated).toLocaleTimeString('th-TH', { hour: '2-digit', minute: '2-digit' })} น.
          </span>
        </div>
      </div>

      {/* Facilities Chips */}
      {shelter.facilities && shelter.facilities.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {shelter.facilities.map((fac, idx) => (
            <span
              key={idx}
              className="text-[10px] bg-stone-100 text-stone-600 px-2 py-0.5 rounded border border-stone-200"
            >
              {fac}
            </span>
          ))}
          {shelter.petFriendly && (
            <span className="text-[10px] bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200 font-semibold">
              🐾 รับสัตว์เลี้ยง
            </span>
          )}
          {shelter.accessibleForDisabled && (
            <span className="text-[10px] bg-blue-50 text-blue-800 px-2 py-0.5 rounded border border-blue-200 font-semibold">
              ♿ ทางลาดวีลแชร์
            </span>
          )}
        </div>
      )}

      {/* Feature 2: Quick Tally UI for Shelter Staff (+1 / -1) */}
      <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-bold text-stone-500 mr-1">
            ปรับยอดผู้พักพิง:
          </span>

          {/* Quick -1 Button */}
          <button
            id={`btn-tally-minus-${shelter.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onTally(shelter.id, -1);
            }}
            title="ลด 1 คน"
            className="w-9 h-9 flex items-center justify-center rounded-lg bg-stone-100 hover:bg-stone-200 active:scale-90 text-stone-700 font-extrabold border border-stone-300 transition-all cursor-pointer select-none"
          >
            <Minus className="w-4 h-4" />
          </button>

          {/* Quick +1 Button (Large touch target) */}
          <button
            id={`btn-tally-plus-${shelter.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onTally(shelter.id, 1);
            }}
            title="เพิ่ม 1 คน"
            className="w-10 h-9 flex items-center justify-center rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-90 text-white font-black shadow-sm transition-all cursor-pointer select-none"
          >
            <Plus className="w-5 h-5" />
          </button>

          {/* Quick +5 Button for fast batches */}
          <button
            id={`btn-tally-plus5-${shelter.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onTally(shelter.id, 5);
            }}
            title="เพิ่มทีละ 5 คน (สำหรับรถส่งผู้อพยพ)"
            className="px-2 h-9 flex items-center justify-center rounded-lg bg-emerald-100 hover:bg-emerald-200 active:scale-90 text-emerald-800 font-bold text-xs border border-emerald-300 transition-all cursor-pointer select-none"
          >
            +5
          </button>
        </div>

        {/* Direct Google Maps Navigation, Evacuee List, Call */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {onViewEvacuees && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onViewEvacuees(shelter);
              }}
              title="ดูรายชื่อผู้พักพิงทั้งหมดในศูนย์นี้"
              className="inline-flex items-center gap-1 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-bold px-2.5 py-2 rounded-lg border border-stone-300 transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5 text-blue-600" />
              <span>รายชื่อ ({evacueeCount ?? 0})</span>
            </button>
          )}

          <a
            href={getGoogleMapsNavUrl(shelter.lat, shelter.lng, shelter.name)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm transition-all"
          >
            <Navigation className="w-3.5 h-3.5" />
            <span>นำทาง</span>
          </a>

          {shelter.contactPhone && (
            <a
              href={`tel:${shelter.contactPhone}`}
              onClick={(e) => e.stopPropagation()}
              title={`โทรหาผู้จัดการศูนย์: ${shelter.managerName}`}
              className="p-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 border border-stone-300"
            >
              <Phone className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

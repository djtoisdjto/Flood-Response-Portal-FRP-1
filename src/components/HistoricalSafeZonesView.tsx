import React, { useState } from 'react';
import { HistoricalSafeZone } from '../types/disasterRelief';
import { calculateDistanceKm, formatDistance, getGoogleMapsNavUrl } from '../utils/distance';
import { UserLocation } from '../types';
import {
  ShieldCheck,
  MapPin,
  Compass,
  Navigation,
  Mountain,
  Building,
  GraduationCap,
  Landmark,
  Search,
  CheckCircle,
  ExternalLink,
  Info
} from 'lucide-react';

interface HistoricalSafeZonesViewProps {
  safeZones: HistoricalSafeZone[];
  userLocation: UserLocation | null;
  onSelectOnMap?: (safeZone: HistoricalSafeZone) => void;
}

export const HistoricalSafeZonesView: React.FC<HistoricalSafeZonesViewProps> = ({
  safeZones,
  userLocation,
  onSelectOnMap,
}) => {
  const [filterType, setFilterType] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const getTypeIcon = (type: HistoricalSafeZone['type']) => {
    switch (type) {
      case 'temple':
        return <Landmark className="w-4 h-4 text-amber-600" />;
      case 'hill':
      case 'high_ground':
        return <Mountain className="w-4 h-4 text-emerald-600" />;
      case 'school':
        return <GraduationCap className="w-4 h-4 text-blue-600" />;
      default:
        return <Building className="w-4 h-4 text-indigo-600" />;
    }
  };

  const getTypeName = (type: HistoricalSafeZone['type']) => {
    switch (type) {
      case 'temple':
        return 'วัดบนเนินสูง';
      case 'hill':
      case 'high_ground':
        return 'เนินโคกธรรมชาติ/ที่ดอน';
      case 'school':
        return 'โรงเรียน/สถาบันยกสูง';
      default:
        return 'ศูนย์ราชการ/หอประชุม';
    }
  };

  const processedZones = safeZones.map((z) => {
    const distanceKm = userLocation
      ? calculateDistanceKm(userLocation.lat, userLocation.lng, z.lat, z.lng)
      : null;
    return { ...z, distanceKm };
  });

  const filtered = processedZones
    .filter((z) => {
      if (filterType !== 'all' && z.type !== filterType) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          z.name.toLowerCase().includes(q) ||
          z.district.toLowerCase().includes(q) ||
          z.historicalRecord.toLowerCase().includes(q) ||
          z.recommendation.toLowerCase().includes(q)
        );
      }
      return true;
    })
    .sort((a, b) => {
      if (a.distanceKm !== null && b.distanceKm !== null) {
        return a.distanceKm - b.distanceKm;
      }
      return 0;
    });

  return (
    <div className="space-y-4">
      {/* Intro Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-stone-900 text-white p-4 rounded-2xl border border-emerald-700/40 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-6 h-6 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-base font-bold text-white">จุดรอดชีวิตจากสถิติในอดีต (Historical Safe Zones)</h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
                ภูมิปัญญาท้องถิ่น &bull; ข้อมูลจริง
              </span>
            </div>
            <p className="text-xs text-emerald-100/90 mt-1 leading-relaxed">
              รวบรวมพิกัดจุดที่น้ำมูลและน้ำชี <strong>"ไม่เคยท่วมถึง"</strong> จากสถิติมหาอุทกภัยปี 2545, 2562 และ 2565 ยืนยันโดยชาวบ้านและผู้เฒ่าผู้แก่ในพื้นที่ สำหรับอพยพหลบภัยและนำรถยนต์ขึ้นจอด
            </p>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาจุดปลอดภัย, อำเภอ, วัด..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl text-xs focus:outline-hidden focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setFilterType('all')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
              filterType === 'all'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            ทั้งหมด ({safeZones.length})
          </button>
          <button
            onClick={() => setFilterType('temple')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
              filterType === 'temple'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            วัดบนเนิน
          </button>
          <button
            onClick={() => setFilterType('hill')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
              filterType === 'hill'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            เนินโคกสูง
          </button>
          <button
            onClick={() => setFilterType('high_ground')}
            className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
              filterType === 'high_ground'
                ? 'bg-emerald-600 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            ที่ดอน/ศูนย์บัญชาการ
          </button>
        </div>
      </div>

      {/* Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filtered.map((zone) => (
          <div
            key={zone.id}
            className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div>
              {/* Card Header */}
              <div className="flex items-start justify-between gap-2 mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
                    {getTypeIcon(zone.type)}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-stone-900 leading-snug">{zone.name}</h4>
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
                      <span>{getTypeName(zone.type)}</span>
                      <span>&bull;</span>
                      <span>{zone.district}</span>
                      {zone.elevationMeters && (
                        <>
                          <span>&bull;</span>
                          <span className="text-emerald-700 font-semibold">สูง {zone.elevationMeters} ม. รทก.</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {zone.distanceKm !== null && (
                  <span className="shrink-0 text-xs font-extrabold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-lg border border-blue-200">
                    {formatDistance(zone.distanceKm)}
                  </span>
                )}
              </div>

              {/* Historical Record Box */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 mb-2.5 text-xs">
                <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-900 mb-1">
                  <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                  <span>บันทึกประวัติศาสตร์จริง:</span>
                </div>
                <p className="text-emerald-800 text-[11px] leading-relaxed">
                  "{zone.historicalRecord}"
                </p>
                <div className="mt-1 text-[10px] text-emerald-700/80 font-medium">
                  ยืนยันโดยชาวบ้านและสถิติ: <strong>{zone.witnessCount} ครัวเรือน</strong>
                </div>
              </div>

              {/* Recommendation & Access */}
              <div className="space-y-1 text-xs text-stone-600">
                <p className="text-[11px]">
                  <strong>ลักษณะพื้นที่:</strong> {zone.recommendation}
                </p>
                <p className="text-[11px] text-stone-500">
                  <strong>เส้นทางเข้าถึง:</strong> {zone.accessRoute}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-3 pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
              {onSelectOnMap && (
                <button
                  type="button"
                  onClick={() => onSelectOnMap(zone)}
                  className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-bold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                  <span>ดูหมุดบนแผนที่</span>
                </button>
              )}

              <a
                href={getGoogleMapsNavUrl(zone.lat, zone.lng, zone.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm active:scale-95 transition-all ml-auto cursor-pointer"
              >
                <Navigation className="w-3.5 h-3.5" />
                <span>นำทางไปจุดปลอดภัย</span>
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

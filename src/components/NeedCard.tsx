import React from 'react';
import { NeedItem } from '../types';
import { CATEGORIES } from '../data/categories';
import { calculateDistanceKm, formatDistance, getGoogleMapsNavUrl } from '../utils/distance';
import { AlertTriangle, Clock, MapPin, Phone, CheckCircle2, User, Navigation } from 'lucide-react';

interface NeedCardProps {
  need: NeedItem;
  userLat?: number;
  userLng?: number;
  isSelected?: boolean;
  onSelect: () => void;
  onClaim: (need: NeedItem) => void;
  onComplete?: (needId: string) => void;
}

export const NeedCard: React.FC<NeedCardProps> = ({
  need,
  userLat,
  userLng,
  isSelected,
  onSelect,
  onClaim,
  onComplete,
}) => {
  const categoryMeta = CATEGORIES[need.category] || CATEGORIES.other;
  const isPending = need.status === 'pending';
  const isClaimed = need.status === 'claimed';
  const isCompleted = need.status === 'completed';

  const distanceKm =
    userLat !== undefined && userLng !== undefined
      ? calculateDistanceKm(userLat, userLng, need.lat, need.lng)
      : null;

  return (
    <div
      id={`need-card-${need.id}`}
      onClick={onSelect}
      className={`relative p-4 rounded-xl border transition-all cursor-pointer bg-white shadow-xs ${
        isSelected
          ? 'border-orange-500 ring-2 ring-orange-200'
          : isPending
          ? 'border-orange-200 hover:border-orange-300'
          : 'border-emerald-200 bg-emerald-50/30'
      }`}
    >
      {/* Header Row: Category Badge + Status Badge */}
      <div className="flex items-center justify-between gap-2 mb-2 flex-wrap">
        <span
          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-xs font-semibold border ${categoryMeta.badgeBg} ${categoryMeta.badgeText}`}
        >
          <span>{categoryMeta.label}</span>
        </span>

        {/* Status Indicator according to specs (Orange Pending, Green Claimed) */}
        {isPending ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-800 border border-orange-300">
            <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
            <span>รอความช่วยเหลือ (หมุดส้ม)</span>
          </span>
        ) : isClaimed ? (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>รับจบแล้ว (หมุดเขียว)</span>
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <span>ส่งมอบเรียบร้อย</span>
          </span>
        )}
      </div>

      {/* Title & Items requested */}
      <h3 className="text-base font-bold text-stone-900 leading-snug mb-1.5">
        {need.title}
      </h3>

      <div className="bg-stone-50 rounded-lg p-2.5 border border-stone-200/70 mb-3 text-xs text-stone-800 space-y-1">
        <div className="font-semibold text-stone-900 flex items-center gap-1.5">
          <span className="text-orange-600">●</span>
          <span>จำนวน/สิ่งที่ต้องการ:</span> {need.quantity}
        </div>
        {need.notes && (
          <p className="text-stone-600 italic">
            หมายเหตุ: &ldquo;{need.notes}&rdquo;
          </p>
        )}
      </div>

      {/* Location & Requester Info */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs text-stone-600 mb-3">
        <div className="flex items-center gap-1.5 truncate">
          <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate">{need.locationName}</span>
          {distanceKm !== null && (
            <span
              className="distance-tag text-orange-600 font-bold shrink-0"
              data-lat={need.lat}
              data-lng={need.lng}
            >
              ({formatDistance(distanceKm)})
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5 truncate">
          <User className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <span className="truncate">{need.requesterName}</span>
          <a
            href={`tel:${need.contactPhone}`}
            onClick={(e) => e.stopPropagation()}
            className="text-blue-600 hover:underline flex items-center gap-0.5 font-medium shrink-0 ml-1"
          >
            <Phone className="w-3 h-3" />
            <span>{need.contactPhone}</span>
          </a>
        </div>
      </div>

      {/* If Claimed: Show Claimer Details to prevent duplicate donation */}
      {isClaimed && need.claimedBy && (
        <div className="mb-3 p-2.5 rounded-lg bg-emerald-50 border border-emerald-200 text-xs text-emerald-900">
          <div className="font-bold flex items-center gap-1 mb-1 text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ผู้รับจบ: {need.claimedBy.name}</span>
          </div>
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-emerald-700">
            <span>โทร: {need.claimedBy.phone}</span>
            {need.claimedBy.vehicleOrNote && (
              <span>ยานพาหนะ: {need.claimedBy.vehicleOrNote}</span>
            )}
            {need.claimedBy.estimatedArrivalMinutes && (
              <span className="font-semibold text-emerald-800">
                คาดว่าจะถึงใน ~{need.claimedBy.estimatedArrivalMinutes} นาที
              </span>
            )}
          </div>
        </div>
      )}

      {/* Action Footer */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-stone-100 flex-wrap">
        <div className="flex items-center gap-2">
          {need.urgency === 'critical' && (
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
              <AlertTriangle className="w-3 h-3" />
              <span>ด่วนมาก/วิกฤต</span>
            </span>
          )}
          <a
            href={getGoogleMapsNavUrl(need.lat, need.lng, need.locationName)}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="inline-flex items-center gap-1 text-xs text-stone-600 hover:text-stone-900 font-medium px-2 py-1 rounded bg-stone-100 hover:bg-stone-200"
          >
            <Navigation className="w-3 h-3 text-stone-500" />
            <span>นำทาง</span>
          </a>
        </div>

        {/* Claim Action Button (Primary CTA for Feature 1) */}
        {isPending ? (
          <button
            id={`btn-claim-${need.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onClaim(need);
            }}
            className="bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>รับจบ (Claim)</span>
          </button>
        ) : isClaimed ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-emerald-700 font-medium">
              กำลังนำส่ง
            </span>
            {onComplete && (
              <button
                id={`btn-complete-${need.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(need.id);
                }}
                className="text-xs text-stone-600 hover:text-stone-900 underline font-medium cursor-pointer"
              >
                เสร็จสิ้นแล้ว
              </button>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};

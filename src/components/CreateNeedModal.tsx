import React, { useState, useEffect } from 'react';
import { NeedCategory, UrgencyLevel, UserLocation } from '../types';
import { CATEGORIES } from '../data/categories';
import { X, MapPin, AlertTriangle, CheckCircle2, ShieldAlert } from 'lucide-react';

interface CreateNeedModalProps {
  isOpen: boolean;
  onClose: () => void;
  userLocation: UserLocation | null;
  onSubmit: (newNeed: {
    title: string;
    category: NeedCategory;
    urgency: UrgencyLevel;
    requesterName: string;
    contactPhone: string;
    locationName: string;
    lat: number;
    lng: number;
    quantity: string;
    notes?: string;
  }) => void;
  onStartPickLocation: () => void;
  pickedLocation: { lat: number; lng: number } | null;
  isOnline: boolean;
}

export const CreateNeedModal: React.FC<CreateNeedModalProps> = ({
  isOpen,
  onClose,
  userLocation,
  onSubmit,
  onStartPickLocation,
  pickedLocation,
  isOnline,
}) => {
  const [category, setCategory] = useState<NeedCategory>('food_water');
  const [urgency, setUrgency] = useState<UrgencyLevel>('high');
  const [title, setTitle] = useState('');
  const [quantity, setQuantity] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [locationName, setLocationName] = useState('');
  const [lat, setLat] = useState<number>(15.2287);
  const [lng, setLng] = useState<number>(104.8564);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Sync coords when userLocation or pickedLocation arrives
  useEffect(() => {
    if (pickedLocation) {
      setLat(pickedLocation.lat);
      setLng(pickedLocation.lng);
    } else if (userLocation) {
      setLat(userLocation.lat);
      setLng(userLocation.lng);
    }
  }, [pickedLocation, userLocation]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('กรุณาระบุหัวข้อสิ่งของที่ต้องการ');
      return;
    }
    if (!quantity.trim()) {
      setError('กรุณาระบุจำนวนหรือรายละเอียดสิ่งของ');
      return;
    }
    if (!requesterName.trim()) {
      setError('กรุณาระบุชื่อผู้ขอ / ตัวแทนผู้ประสบภัย');
      return;
    }
    if (!contactPhone.trim()) {
      setError('กรุณาระบุเบอร์โทรศัพท์ติดต่อ');
      return;
    }
    if (!locationName.trim()) {
      setError('กรุณาระบุชื่อสถานที่/จุดสังเกต');
      return;
    }

    onSubmit({
      title: title.trim(),
      category,
      urgency,
      requesterName: requesterName.trim(),
      contactPhone: contactPhone.trim(),
      locationName: locationName.trim(),
      lat,
      lng,
      quantity: quantity.trim(),
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-orange-600 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-700 flex items-center justify-center text-white font-bold">
              +
            </div>
            <div>
              <h2 className="text-base font-bold">โพสต์ขอความช่วยเหลือ (ของขาด)</h2>
              <p className="text-xs text-orange-100">
                ระบุพิกัดและสิ่งของที่ต้องการ หมุดจะแสดงเป็นสีส้มบนแผนที่
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-orange-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isOnline && (
          <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs text-amber-900 flex items-center gap-2 shrink-0">
            <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
            <span>ทำงานแบบออฟไลน์: คำขอนี้จะถูกบันทึกในเครื่องทันทีและซิงค์เมื่อมีสัญญาณ</span>
          </div>
        )}

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-sm">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          {/* Urgency Level Tabs */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              ระดับความเร่งด่วน <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setUrgency('critical')}
                className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                  urgency === 'critical'
                    ? 'bg-rose-600 text-white border-rose-600 shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                🔴 วิกฤต/ติดค้าง
              </button>
              <button
                type="button"
                onClick={() => setUrgency('high')}
                className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                  urgency === 'high'
                    ? 'bg-orange-600 text-white border-orange-600 shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                🟠 ด่วนมาก
              </button>
              <button
                type="button"
                onClick={() => setUrgency('normal')}
                className={`py-2 px-2 text-xs font-bold rounded-lg border text-center transition-all cursor-pointer ${
                  urgency === 'normal'
                    ? 'bg-stone-800 text-white border-stone-800 shadow-sm'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700 border-stone-200'
                }`}
              >
                ⚪ ทั่วไป
              </button>
            </div>
          </div>

          {/* Category Selection */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1.5">
              หมวดหมู่สิ่งของ <span className="text-rose-500">*</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
              {(Object.keys(CATEGORIES) as NeedCategory[]).map((catKey) => {
                const item = CATEGORIES[catKey];
                const active = category === catKey;
                return (
                  <button
                    key={catKey}
                    type="button"
                    onClick={() => setCategory(catKey)}
                    className={`p-2 text-left rounded-lg border text-xs font-medium transition-all flex flex-col justify-between cursor-pointer ${
                      active
                        ? 'bg-orange-50 border-orange-500 text-orange-950 ring-1 ring-orange-400'
                        : 'bg-stone-50 hover:bg-stone-100 border-stone-200 text-stone-700'
                    }`}
                  >
                    <span className="font-bold">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title & Quantity */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              หัวข้อความต้องการ <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น ขอน้ำดื่ม 15 แพ็ค และอาหารกล่อง 30 กล่อง"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ระบุจำนวน / สิ่งของโดยละเอียด <span className="text-rose-500">*</span>
            </label>
            <textarea
              rows={2}
              required
              placeholder="เช่น น้ำดื่มขนาด 600ml จำนวน 20 แพ็ค, นมผงตราหมี 2 กล่อง, ผ้าอ้อมผู้ใหญ่ไซส์ M 3 ห่อ"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Location Details & Map Pin Picker */}
          <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-orange-600" />
                <span>พิกัดและสถานที่จัดส่ง</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onStartPickLocation();
                }}
                className="text-xs text-indigo-700 bg-indigo-50 hover:bg-indigo-100 px-2.5 py-1 rounded-md border border-indigo-200 font-semibold cursor-pointer"
              >
                📍 จิ้มเลือกบนแผนที่
              </button>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-stone-600 mb-0.5">
                ชื่อสถานที่ / จุดสังเกต / ซอย <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ชุมชนท่ากอไผ่ ซอย 2, ชุมชนวังแดง หรือ ถ.สถลมาร์ค"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
              />
            </div>

            <div className="text-[11px] text-stone-500 flex items-center gap-2">
              <span>พิกัด GPS:</span>
              <span className="font-mono bg-white px-2 py-0.5 rounded border border-stone-200">
                {lat.toFixed(5)}, {lng.toFixed(5)}
              </span>
              {pickedLocation && (
                <span className="text-indigo-600 font-bold">✓ เลือกจากแผนที่แล้ว</span>
              )}
            </div>
          </div>

          {/* Contact Person */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                ชื่อผู้ติดต่อ <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น ป้าสมศรี / ผู้ใหญ่บ้าน ม.2"
                value={requesterName}
                onChange={(e) => setRequesterName(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1">
                เบอร์โทรศัพท์ <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                required
                placeholder="เช่น 089-123-4567"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
                className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              หมายเหตุสำหรับการเดินทางเข้าถึง (ถ้ามี)
            </label>
            <input
              type="text"
              placeholder="เช่น น้ำลึกระดับเอว ต้องใช้เรือเท่านั้น, มีสุนัขดุ, ถนนหน้าซอยขาด"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-orange-500"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              id="btn-submit-create-need"
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-orange-600 hover:bg-orange-700 active:scale-95 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยืนยันโพสต์ขอความช่วยเหลือ (หมุดส้ม)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { NeedItem } from '../types';
import { CheckCircle2, X, AlertCircle, Clock, Truck } from 'lucide-react';

interface ClaimModalProps {
  need: NeedItem | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirmClaim: (
    needId: string,
    donor: { name: string; phone: string; vehicleOrNote?: string; estimatedArrivalMinutes?: number }
  ) => void;
  isOnline: boolean;
}

export const ClaimModal: React.FC<ClaimModalProps> = ({
  need,
  isOpen,
  onClose,
  onConfirmClaim,
  isOnline,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [vehicle, setVehicle] = useState('รถกระบะ / รถยนต์ยกสูง');
  const [eta, setEta] = useState('30');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen || !need) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('กรุณาระบุชื่อผู้รับจบ หรือชื่อทีม/หน่วยกู้ภัย');
      return;
    }
    if (!phone.trim()) {
      setError('กรุณาระบุเบอร์โทรศัพท์ที่ติดต่อได้');
      return;
    }

    onConfirmClaim(need.id, {
      name: name.trim(),
      phone: phone.trim(),
      vehicleOrNote: vehicle,
      estimatedArrivalMinutes: parseInt(eta, 10) || 30,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-emerald-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-base font-bold">ยืนยันการรับจบ (Claim)</h2>
              <p className="text-xs text-emerald-100">
                เมื่อกดยืนยัน หมุดจะเปลี่ยนเป็นสีเขียวทันทีเพื่อไม่ให้บริจาคซ้ำซ้อน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-emerald-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Item Summary */}
        <div className="p-4 bg-stone-50 border-b border-stone-200 text-xs text-stone-700">
          <div className="font-bold text-stone-900 mb-1">{need.title}</div>
          <div className="text-stone-600">
            📍 <strong>พิกัด/สถานที่:</strong> {need.locationName}
          </div>
          <div className="text-stone-600 mt-0.5">
            📦 <strong>สิ่งที่ต้องการ:</strong> {need.quantity}
          </div>
          <div className="text-stone-600 mt-0.5">
            📞 <strong>ผู้ติดต่อเดิม:</strong> {need.requesterName} ({need.contactPhone})
          </div>
        </div>

        {!isOnline && (
          <div className="mx-4 mt-3 p-2.5 rounded-lg bg-amber-50 border border-amber-300 text-xs text-amber-900 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              ขณะนี้คุณอยู่ในโหมดออฟไลน์ ระบบจะบันทึกการรับจบลงเครื่อง และซิงค์ทันทีเมื่อเน็ตกลับมา
            </span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 space-y-3.5 text-sm">
          {error && (
            <div className="p-2 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              ชื่อผู้ให้ / หน่วยงาน / ทีมกู้ภัย <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="เช่น นายธวัชชัย / กู้ภัยร่วมกตัญญู / กลุ่มศิษย์เก่า"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-stone-700 mb-1">
              เบอร์โทรศัพท์สำหรับประสานงาน <span className="text-rose-500">*</span>
            </label>
            <input
              type="tel"
              required
              placeholder="เช่น 081-234-5678"
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value);
                setError(null);
              }}
              className="w-full px-3 py-2 text-sm rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5 text-stone-400" />
                <span>ยานพาหนะ/อุปกรณ์</span>
              </label>
              <select
                value={vehicle}
                onChange={(e) => setVehicle(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="รถกระบะ / 4WD ยกสูง">รถกระบะ 4WD ยกสูง</option>
                <option value="เรือยาง / เรือท้องแบน">เรือยาง / เรือท้องแบน</option>
                <option value="รถหกล้อกู้ภัย">รถหกล้อกู้ภัย</option>
                <option value="มอเตอร์ไซค์วิบาก">มอเตอร์ไซค์วิบาก</option>
                <option value="เดินเท้าลุยน้ำ">เดินเท้าลุยน้ำ</option>
                <option value="รถเก๋ง / มอเตอร์ไซค์ทั่วไป">รถทั่วไป (ถนนแห้ง)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-stone-400" />
                <span>เวลาที่จะถึงโดยประมาณ</span>
              </label>
              <select
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="w-full px-2.5 py-2 text-xs rounded-lg border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              >
                <option value="15">~ 15 นาที</option>
                <option value="30">~ 30 นาที</option>
                <option value="45">~ 45 นาที</option>
                <option value="60">~ 1 ชั่วโมง</option>
                <option value="120">~ 2 ชั่วโมง</option>
                <option value="240">~ 4 ชั่วโมง</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2 border-t border-stone-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:bg-stone-100 rounded-lg cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              id="btn-confirm-claim-submit"
              type="submit"
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 active:scale-95 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>ยืนยันรับจบ (เปลี่ยนเป็นหมุดเขียว)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

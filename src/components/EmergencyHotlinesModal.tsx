import React from 'react';
import { EMERGENCY_HOTLINES } from '../data/initialData';
import { PhoneCall, X, ShieldAlert } from 'lucide-react';

interface EmergencyHotlinesModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const EmergencyHotlinesModal: React.FC<EmergencyHotlinesModalProps> = ({
  isOpen,
  onClose,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-rose-600 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneCall className="w-6 h-6 text-white" />
            <div>
              <h2 className="text-base font-bold">เบอร์โทรสายด่วนฉุกเฉิน</h2>
              <p className="text-xs text-rose-100">แตะเพื่อโทรออกทันที (โทรฟรี 24 ชั่วโมง)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-rose-700 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 divide-y divide-stone-100 max-h-[70vh] overflow-y-auto space-y-2">
          {EMERGENCY_HOTLINES.map((item) => (
            <div key={item.number} className="pt-2 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base text-stone-900 font-mono">
                    {item.number}
                  </span>
                  <span className="font-semibold text-xs text-stone-800 truncate">
                    {item.name}
                  </span>
                </div>
                <p className="text-xs text-stone-500 mt-0.5">{item.desc}</p>
              </div>

              <a
                href={`tel:${item.number}`}
                className="shrink-0 bg-rose-600 hover:bg-rose-700 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all"
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>โทร</span>
              </a>
            </div>
          ))}
        </div>

        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600">
          <div className="flex items-center gap-1.5 text-stone-500">
            <ShieldAlert className="w-4 h-4 text-stone-400" />
            <span>กรณีฉุกเฉินวิกฤตโทร 1669 ทันที</span>
          </div>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-700 font-semibold"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

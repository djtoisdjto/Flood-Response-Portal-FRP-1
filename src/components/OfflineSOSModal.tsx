import React, { useState } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { triggerNativeSMS, buildSOSMessage } from '../utils/smsFallback';
import { EMERGENCY_HOTLINES } from '../data/initialData';
import {
  PhoneCall,
  MessageSquareWarning,
  Send,
  Navigation,
  LifeBuoy,
  Users,
  HeartPulse,
  Baby,
  Copy,
  Check,
  AlertTriangle,
  Locate,
  X,
  WifiOff,
  Radio
} from 'lucide-react';

interface OfflineSOSModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const OfflineSOSModal: React.FC<OfflineSOSModalProps> = ({ isOpen, onClose }) => {
  const { userLocation, isOnline, refreshDeviceGPS, setUserLocationToUbonCityHall } = useDisaster();

  // Form parameters
  const [targetRecipient, setTargetRecipient] = useState<string>('191');
  const [peopleCount, setPeopleCount] = useState<number>(1);
  const [hasElderlyOrChildren, setHasElderlyOrChildren] = useState<boolean>(false);
  const [needsBoat, setNeedsBoat] = useState<boolean>(true);
  const [needsMedical, setNeedsMedical] = useState<boolean>(false);
  const [details, setDetails] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'sms' | 'hotlines'>('sms');

  if (!isOpen) return null;

  const currentLat = userLocation?.lat ?? 15.2425;
  const currentLng = userLocation?.lng ?? 104.8472;

  const smsParams = {
    phone: targetRecipient,
    lat: currentLat,
    lng: currentLng,
    accuracy: userLocation?.accuracy,
    locationLabel: userLocation?.locationLabel || (userLocation?.isFallback ? 'พิกัดสำรองศาลากลางอุบลฯ' : 'พิกัดจากเครื่อง'),
    peopleCount,
    hasElderlyOrChildren,
    needsBoat,
    needsMedical,
    details,
  };

  const previewMessage = buildSOSMessage(smsParams);

  const handleLaunchSMS = () => {
    triggerNativeSMS(smsParams, targetRecipient);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(previewMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-rose-600 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-white shrink-0 animate-pulse">
              <MessageSquareWarning className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold">ระบบแจ้งเหตุฉุกเฉิน SOS (ไม่ง้อเน็ต)</h2>
                {!isOnline && (
                  <span className="bg-white/20 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <WifiOff className="w-2.5 h-2.5" /> ออฟไลน์
                  </span>
                )}
              </div>
              <p className="text-xs text-rose-100">
                เปิดแอป SMS ในมือถือพร้อมใส่พิกัด GPS อัตโนมัติ ส่งหากู้ภัยได้ทันที
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-rose-700 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch between SMS Fallback & Direct Calling */}
        <div className="flex border-b border-stone-200 bg-stone-50 text-xs font-bold shrink-0">
          <button
            onClick={() => setActiveTab('sms')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'sms'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>แจ้งกู้ภัยผ่าน SMS ออฟไลน์</span>
          </button>
          <button
            onClick={() => setActiveTab('hotlines')}
            className={`flex-1 py-2.5 flex items-center justify-center gap-1.5 border-b-2 cursor-pointer transition-colors ${
              activeTab === 'hotlines'
                ? 'border-rose-600 text-rose-600 bg-white'
                : 'border-transparent text-stone-500 hover:text-stone-700'
            }`}
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>เบอร์โทรสายด่วน (โทรออก)</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-4 overflow-y-auto space-y-4 text-xs">
          {activeTab === 'sms' ? (
            <>
              {/* Highlight Banner */}
              <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 flex items-start gap-2.5 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div className="text-[11px] leading-relaxed">
                  <strong>เมื่อสัญญาณอินเทอร์เน็ตขาดหาย:</strong> ระบบนี้จะสร้างข้อความขอความช่วยเหลือและดึงพิกัดดาวเทียม (GPS) จากชิปในมือถือ แล้วสั่งเปิดแอป SMS เพื่อส่งไปยังเบอร์ฉุกเฉินได้โดยไม่ต้องมีเน็ต
                </div>
              </div>

              {/* 1. Recipient Selection */}
              <div>
                <label className="block text-stone-700 font-bold mb-1.5">
                  เลือกปลายทางที่จะส่ง SMS:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setTargetRecipient('191')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      targetRecipient === '191'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-stone-900">191</div>
                    <div className="text-[10px] text-stone-500">ตำรวจ/ศูนย์รับแจ้งเหตุ</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetRecipient('1669')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      targetRecipient === '1669'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-stone-900">1669</div>
                    <div className="text-[10px] text-stone-500">กู้ชีพ/การแพทย์ฉุกเฉิน</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetRecipient('045323111')}
                    className={`p-2 rounded-xl border text-left cursor-pointer transition-all ${
                      targetRecipient === '045323111'
                        ? 'border-rose-600 bg-rose-50 text-rose-900 font-bold'
                        : 'border-stone-200 hover:border-stone-300'
                    }`}
                  >
                    <div className="text-sm font-extrabold text-stone-900">045-323-111</div>
                    <div className="text-[10px] text-stone-500">กู้ภัยสว่างบูชาธรรม วารินฯ</div>
                  </button>
                </div>
              </div>

              {/* 2. Situation & Needs Quick Toggles */}
              <div className="space-y-2">
                <label className="block text-stone-700 font-bold">
                  สถานการณ์และความต้องการเร่งด่วน:
                </label>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNeedsBoat(!needsBoat)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      needsBoat
                        ? 'bg-blue-50 border-blue-500 text-blue-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <LifeBuoy className="w-4 h-4 text-blue-600" />
                    <span>ต้องการเรือกู้ภัย</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setNeedsMedical(!needsMedical)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      needsMedical
                        ? 'bg-rose-50 border-rose-500 text-rose-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <HeartPulse className="w-4 h-4 text-rose-600" />
                    <span>ต้องการแพทย์/ยา</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setHasElderlyOrChildren(!hasElderlyOrChildren)}
                    className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all ${
                      hasElderlyOrChildren
                        ? 'bg-amber-50 border-amber-500 text-amber-900 font-bold'
                        : 'bg-stone-50 border-stone-200 text-stone-600'
                    }`}
                  >
                    <Baby className="w-4 h-4 text-amber-600" />
                    <span>มีเด็ก/คนชรา/ติดเตียง</span>
                  </button>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-stone-50 border border-stone-200">
                    <span className="text-stone-700 font-medium">จำนวนผู้ประสบภัย:</span>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => setPeopleCount(Math.max(1, peopleCount - 1))}
                        className="w-6 h-6 rounded bg-white border border-stone-300 font-bold hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                      >
                        -
                      </button>
                      <span className="font-extrabold w-5 text-center text-sm">{peopleCount}</span>
                      <button
                        type="button"
                        onClick={() => setPeopleCount(peopleCount + 1)}
                        className="w-6 h-6 rounded bg-white border border-stone-300 font-bold hover:bg-stone-100 flex items-center justify-center cursor-pointer"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Details & Location Confirmation */}
              <div>
                <label className="block text-stone-700 font-bold mb-1">
                  รายละเอียดเพิ่มเติม (เช่น บ้านเลขที่ ซอย เสาระดับน้ำ):
                </label>
                <input
                  type="text"
                  value={details}
                  onChange={(e) => setDetails(e.target.value)}
                  placeholder="เช่น ชุมชนหาดสวนยา บ้านไม้ 2 ชั้น น้ำท่วมบันไดขั้นสุดท้าย"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:outline-hidden focus:border-rose-500 bg-stone-50"
                />
              </div>

              {/* Current GPS Badge */}
              <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <Navigation className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                  <span className="text-blue-900">
                    พิกัด GPS ที่จะส่ง: <strong>{currentLat.toFixed(5)}, {currentLng.toFixed(5)}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={refreshDeviceGPS}
                    className="text-blue-700 hover:underline font-bold flex items-center gap-0.5 cursor-pointer"
                  >
                    <Locate className="w-3 h-3" /> อัปเดต GPS
                  </button>
                </div>
              </div>

              {/* Message Preview Box */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-stone-600 text-[11px]">ตัวอย่างข้อความ SMS ที่ระบบจะพิมพ์ให้:</span>
                  <button
                    type="button"
                    onClick={handleCopy}
                    className="text-[11px] text-stone-500 hover:text-stone-800 flex items-center gap-1 cursor-pointer"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">คัดลอกแล้ว</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>คัดลอกข้อความ</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-2.5 bg-stone-900 text-emerald-400 font-mono text-[10px] rounded-xl whitespace-pre-wrap leading-relaxed max-h-28 overflow-y-auto border border-stone-700">
                  {previewMessage}
                </pre>
              </div>

              {/* Big Action Button: Open SMS App */}
              <button
                type="button"
                id="btn-launch-sms-app"
                onClick={handleLaunchSMS}
                className="w-full py-3.5 px-4 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-98 text-white font-extrabold text-sm shadow-lg flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>กดเพื่อเปิดแอป SMS ในมือถือทันที</span>
              </button>
            </>
          ) : (
            /* Emergency Hotlines Direct Dialing */
            <div className="divide-y divide-stone-100 space-y-2">
              <p className="text-[11px] text-stone-500 pb-2">
                สามารถแตะปุ่ม "โทรออก" เพื่อโทรศัพท์ผ่านสัญญาณมือถือได้ทันที (ไม่ต้องใช้อินเทอร์เน็ต)
              </p>
              {EMERGENCY_HOTLINES.map((item) => (
                <div key={item.number} className="pt-2.5 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-base text-stone-900">
                        {item.number}
                      </span>
                      <span className="font-semibold text-xs text-stone-800 truncate">
                        {item.name}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 mt-0.5">{item.desc}</p>
                  </div>
                  <a
                    href={`tel:${item.number}`}
                    className="shrink-0 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    <span>โทร</span>
                  </a>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-stone-50 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500 shrink-0">
          <span>กรณีฉุกเฉินระดับวิกฤต น้ำท่วมมิดชั้นหนึ่ง แนะนำโทร 1669 หรือ 191 ทันที</span>
          <button
            onClick={onClose}
            className="px-3 py-1 bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-700 font-semibold cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

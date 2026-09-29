import React, { useState } from 'react';
import { CrowdsourcedClue } from '../types/disasterRelief';
import {
  MessageSquare,
  AlertTriangle,
  Waves,
  Ship,
  ShieldCheck,
  ThumbsUp,
  Clock,
  PlusCircle,
  CheckCircle2,
  Radio,
  MapPin,
  X,
  Phone
} from 'lucide-react';

interface CrowdsourcedCluesViewProps {
  clues: CrowdsourcedClue[];
  onAddClue: (newClue: Omit<CrowdsourcedClue, 'id' | 'timestamp' | 'upvotes' | 'verified'>) => void;
  onUpvoteClue: (clueId: string) => void;
  isOnline: boolean;
}

export const CrowdsourcedCluesView: React.FC<CrowdsourcedCluesViewProps> = ({
  clues,
  onAddClue,
  onUpvoteClue,
  isOnline,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  // Form State
  const [category, setCategory] = useState<CrowdsourcedClue['category']>('water_level');
  const [locationName, setLocationName] = useState('');
  const [description, setDescription] = useState('');
  const [waterLevelCm, setWaterLevelCm] = useState<number | undefined>(undefined);
  const [reporterName, setReporterName] = useState('');
  const [reporterPhone, setReporterPhone] = useState('');

  const getCategoryBadge = (cat: CrowdsourcedClue['category']) => {
    switch (cat) {
      case 'water_level':
        return {
          label: 'ระดับน้ำ/น้ำล้นตลิ่ง',
          color: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: <Waves className="w-3.5 h-3.5 text-blue-600" />,
        };
      case 'stranded_person':
        return {
          label: 'คนติดเกาะ/ขอความช่วยเหลือ',
          color: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />,
        };
      case 'boat_available':
        return {
          label: 'มีเรือ/จิตอาสารับส่ง',
          color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: <Ship className="w-3.5 h-3.5 text-emerald-600" />,
        };
      case 'route_blocked':
        return {
          label: 'ทางขาด/น้ำท่วมถนน',
          color: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />,
        };
      case 'safe_spot':
        return {
          label: 'จุดจอดรถ/พื้นที่ปลอดภัย',
          color: 'bg-teal-100 text-teal-800 border-teal-200',
          icon: <ShieldCheck className="w-3.5 h-3.5 text-teal-600" />,
        };
    }
  };

  const filteredClues = clues.filter((c) => {
    if (selectedFilter !== 'all' && c.category !== selectedFilter) return false;
    return true;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!locationName.trim() || !description.trim()) return;

    onAddClue({
      category,
      locationName: locationName.trim(),
      description: description.trim(),
      waterLevelCm: waterLevelCm ? Number(waterLevelCm) : undefined,
      reporterName: reporterName.trim() || 'ชาวบ้านจิตอาสา',
      reporterPhone: reporterPhone.trim() || undefined,
      lat: 15.2287 + (Math.random() - 0.5) * 0.04,
      lng: 104.8564 + (Math.random() - 0.5) * 0.04,
      source: isOnline ? 'web_pwa' : 'sms_fallback',
    });

    setLocationName('');
    setDescription('');
    setWaterLevelCm(undefined);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-stone-200 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Radio className="w-4 h-4 text-orange-600 animate-pulse" />
            <span>กระดานเบาะแสและระดับน้ำจริงจากชาวบ้าน (Crowdsourced)</span>
          </h3>
          <p className="text-xs text-stone-500 mt-0.5">
            รวบรวมเบาะแสภาคสนาม จุดน้ำท่วมสูง รถผ่านได้ไหม หรือจุดที่ต้องการเรือด่วน
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ แจ้งเบาะแสในพื้นที่</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
        <button
          onClick={() => setSelectedFilter('all')}
          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
            selectedFilter === 'all'
              ? 'bg-stone-900 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          ทั้งหมด ({clues.length})
        </button>
        <button
          onClick={() => setSelectedFilter('water_level')}
          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
            selectedFilter === 'water_level'
              ? 'bg-blue-600 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          ระดับน้ำ
        </button>
        <button
          onClick={() => setSelectedFilter('route_blocked')}
          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
            selectedFilter === 'route_blocked'
              ? 'bg-amber-600 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          ทางขาด/น้ำท่วมทาง
        </button>
        <button
          onClick={() => setSelectedFilter('stranded_person')}
          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
            selectedFilter === 'stranded_person'
              ? 'bg-rose-600 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          คนติดเกาะ
        </button>
        <button
          onClick={() => setSelectedFilter('boat_available')}
          className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-colors cursor-pointer shrink-0 ${
            selectedFilter === 'boat_available'
              ? 'bg-emerald-600 text-white'
              : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
          }`}
        >
          มีเรือรับส่ง
        </button>
      </div>

      {/* Clues Stream */}
      <div className="space-y-3">
        {filteredClues.map((clue) => {
          const badge = getCategoryBadge(clue.category);
          return (
            <div
              key={clue.id}
              className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs hover:border-orange-300 transition-all"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full border ${badge.color}`}
                  >
                    {badge.icon}
                    <span>{badge.label}</span>
                  </span>
                  <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-orange-500" />
                    <span>{clue.locationName}</span>
                  </span>
                  {clue.waterLevelCm !== undefined && (
                    <span className="text-[11px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200">
                      ระดับน้ำ {clue.waterLevelCm} ซม.
                    </span>
                  )}
                </div>

                <button
                  onClick={() => onUpvoteClue(clue.id)}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold text-stone-600 hover:text-orange-600 bg-stone-50 hover:bg-orange-50 border border-stone-200 transition-all cursor-pointer"
                  title="กดเพื่อยืนยันว่าข้อมูลนี้เป็นจริงและเป็นประโยชน์"
                >
                  <ThumbsUp className="w-3 h-3 text-orange-500" />
                  <span>{clue.upvotes} ยืนยัน</span>
                </button>
              </div>

              <p className="text-xs text-stone-700 leading-relaxed bg-stone-50/60 p-2.5 rounded-xl border border-stone-100">
                "{clue.description}"
              </p>

              <div className="mt-3 flex items-center justify-between text-[11px] text-stone-400">
                <div className="flex items-center gap-2">
                  <span>ผู้แจ้ง: <strong>{clue.reporterName}</strong></span>
                  {clue.reporterPhone && (
                    <span className="text-stone-500 font-mono">({clue.reporterPhone})</span>
                  )}
                  {clue.source === 'sms_fallback' && (
                    <span className="bg-purple-50 text-purple-700 px-1.5 py-0.2 rounded border border-purple-200 font-semibold text-[10px]">
                      SMS Fallback
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 text-stone-400">
                  <Clock className="w-3 h-3" />
                  <span>เมื่อสักครู่</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal for adding a new Clue */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div
            className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-xs"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="bg-orange-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Radio className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold">แจ้งเบาะแสระดับน้ำหรือสถานการณ์</h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-orange-700 text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-3">
              <div>
                <label className="block text-stone-700 font-bold mb-1">ประเภทเบาะแส:</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-orange-500 bg-white"
                >
                  <option value="water_level">ระดับน้ำ / น้ำล้นตลิ่ง</option>
                  <option value="route_blocked">ทางขาด / ถนนน้ำท่วมรถผ่านไม่ได้</option>
                  <option value="stranded_person">คนติดเกาะ / สัตว์เลี้ยงต้องการเรือ</option>
                  <option value="boat_available">มีเรือกู้ภัย / จิตอาสาพร้อมรับส่ง</option>
                  <option value="safe_spot">พื้นที่ปลอดภัย / จุดจอดรถน้ำไม่ท่วม</option>
                </select>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">สถานที่ / พิกัดจุดสังเกต:</label>
                <input
                  type="text"
                  required
                  value={locationName}
                  onChange={(e) => setLocationName(e.target.value)}
                  placeholder="เช่น สะพานเสรีประชาธิปไตย หรือ ซอยวัดบ้านนาควาย"
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ระดับน้ำ (ซม.) ถ้ารู้:</label>
                  <input
                    type="number"
                    value={waterLevelCm || ''}
                    onChange={(e) => setWaterLevelCm(e.target.value ? Number(e.target.value) : undefined)}
                    placeholder="เช่น 50 หรือ 120"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-stone-700 font-bold mb-1">ชื่อผู้แจ้ง:</label>
                  <input
                    type="text"
                    value={reporterName}
                    onChange={(e) => setReporterName(e.target.value)}
                    placeholder="เช่น สมชาย จิตอาสา"
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-orange-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">รายละเอียดสภาพการณ์:</label>
                <textarea
                  required
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="ระบุข้อเท็จจริง เช่น น้ำเริ่มเอ่อท่วมถนนเมื่อ 10 นาทีที่แล้ว รถเก๋งห้ามผ่าน..."
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md cursor-pointer"
                >
                  ส่งเบาะแสทันที
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

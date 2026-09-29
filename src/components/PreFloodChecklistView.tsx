import React, { useState, useEffect } from 'react';
import { GoBagChecklistItem } from '../types/smartReliefKit';
import { INITIAL_GOBAG_CHECKLIST } from '../data/phibunReliefData';
import {
  ShieldAlert,
  CheckCircle2,
  Circle,
  Smartphone,
  FileText,
  Pill,
  Droplets,
  UtensilsCrossed,
  Flashlight,
  Sparkles,
  Shirt,
  Coins,
  CloudRain,
  RotateCcw,
  Share2,
  BellRing,
  AlertTriangle,
  Info,
  ArrowLeft
} from 'lucide-react';

const STORAGE_KEY = 'gobag_checklist_v1_phibun';

interface PreFloodChecklistViewProps {
  onBackToHub?: () => void;
}

export const PreFloodChecklistView: React.FC<PreFloodChecklistViewProps> = ({ onBackToHub }) => {
  const [items, setItems] = useState<GoBagChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_GOBAG_CHECKLIST;
  });

  const [activeFilter, setActiveFilter] = useState<'all' | 'must_have' | 'pending' | 'checked'>('all');

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // Ignore
    }
  }, [items]);

  const toggleItem = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  };

  const handleReset = () => {
    setItems((prev) => prev.map((item) => ({ ...item, checked: false })));
  };

  const checkedCount = items.filter((i) => i.checked).length;
  const progressPercent = Math.round((checkedCount / items.length) * 100);

  const filteredItems = items.filter((item) => {
    if (activeFilter === 'must_have') return item.priority === 'must_have';
    if (activeFilter === 'pending') return !item.checked;
    if (activeFilter === 'checked') return item.checked;
    return true;
  });

  const getItemIcon = (iconName: string) => {
    switch (iconName) {
      case 'Smartphone':
        return <Smartphone className="w-6 h-6 text-blue-600" />;
      case 'FileText':
        return <FileText className="w-6 h-6 text-indigo-600" />;
      case 'Pill':
        return <Pill className="w-6 h-6 text-rose-600" />;
      case 'Droplets':
        return <Droplets className="w-6 h-6 text-sky-600" />;
      case 'UtensilsCrossed':
        return <UtensilsCrossed className="w-6 h-6 text-amber-600" />;
      case 'Flashlight':
        return <Flashlight className="w-6 h-6 text-orange-600" />;
      case 'Sparkles':
        return <Sparkles className="w-6 h-6 text-teal-600" />;
      case 'Shirt':
        return <Shirt className="w-6 h-6 text-purple-600" />;
      case 'Coins':
        return <Coins className="w-6 h-6 text-emerald-600" />;
      default:
        return <ShieldAlert className="w-6 h-6 text-stone-600" />;
    }
  };

  return (
    // FIX SCROLL ISSUE: Wrapper คอนเทนเนอร์หลักของ Go-Bag Checklist
    // 1. ใช้ space-y-4 max-w-4xl mx-auto w-full pb-16
    // 2. ไม่ใช้ h-screen, fixed หรือ overflow-hidden ทำให้ content ทุกการ์ดไหลตาม Document Flow ปกติ
    // 3. เลื่อน Scroll ลงดูการ์ดและคำแนะนำด้านล่างได้ลื่นไหลทั้ง Desktop และ Mobile
    <div className="space-y-4 max-w-4xl mx-auto w-full pb-16">
      {/* 1. Heavy Rain & Early Warning Trigger Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-4 sm:p-5 rounded-2xl shadow-md border border-blue-700/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center shrink-0 text-amber-300 animate-pulse">
              <CloudRain className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider animate-pulse">
                  แจ้งเตือนฝนตกหนัก &bull; เสี่ยงน้ำเอ่อตลิ่ง
                </span>
                <span className="text-blue-200 text-xs font-semibold">
                  พื้นที่นำร่อง: เทศบาลเมืองพิบูลมังสาหาร (แม่น้ำมูล)
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-1">
                เช็กลิสต์จัดกระเป๋าฉุกเฉิน (Go-Bag Checklist)
              </h2>
              <p className="text-xs text-blue-100/90 mt-0.5 leading-relaxed">
                เตรียมสิ่งของจำเป็นให้พร้อมยกขึ้นที่สูงหรือพร้อมอพยพได้ภายใน 5 นาที เพื่อความปลอดภัยของคนในครอบครัว
              </p>
            </div>
          </div>

          {/* Quick Readiness Score Widget */}
          <div className="bg-white/10 backdrop-blur-xs rounded-xl p-3 border border-white/20 text-center shrink-0 min-w-[140px]">
            <div className="text-[11px] text-blue-200 font-medium">ความพร้อมของคุณ</div>
            <div className="text-2xl font-black text-amber-300 mt-0.5">{progressPercent}%</div>
            <div className="text-[10px] text-blue-200/80">
              เตรียมแล้ว {checkedCount}/{items.length} รายการ
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-4 pt-3 border-t border-white/10">
          <div className="w-full bg-blue-950/60 rounded-full h-2.5 overflow-hidden p-0.5 border border-blue-800">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                progressPercent === 100
                  ? 'bg-emerald-400'
                  : progressPercent >= 60
                  ? 'bg-amber-400'
                  : 'bg-rose-400'
              }`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-[10px] text-blue-200 mt-1">
            <span>เริ่มต้นเตรียม</span>
            <span>
              {progressPercent === 100
                ? 'ยอดเยี่ยม! กระเป๋าฉุกเฉินพร้อมรับมือ 100%'
                : 'คลิกติ๊กถูก (Check) เมื่อจัดของลงกระเป๋าแล้ว'}
            </span>
            <span>พร้อมสมบูรณ์</span>
          </div>
        </div>
      </div>

      {/* 2. Filter & Quick Actions */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 text-xs">
          <button
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            ทั้งหมด ({items.length})
          </button>
          <button
            onClick={() => setActiveFilter('must_have')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeFilter === 'must_have'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
            }`}
          >
            จำเป็นสูงสุด (Must-Have)
          </button>
          <button
            onClick={() => setActiveFilter('pending')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            ยังไม่พร้อม ({items.length - checkedCount})
          </button>
          <button
            onClick={() => setActiveFilter('checked')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${
              activeFilter === 'checked'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            พร้อมแล้ว ({checkedCount})
          </button>
        </div>

        <button
          onClick={handleReset}
          className="text-xs text-stone-500 hover:text-stone-800 flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-100 transition-colors cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>รีเซ็ตเช็กลิสต์</span>
        </button>
      </div>

      {/* 3. Interactive Checklist Cards (Big Icons, Easy-to-Tap) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            onClick={() => toggleItem(item.id)}
            className={`p-4 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 select-none ${
              item.checked
                ? 'bg-emerald-50/70 border-emerald-300 shadow-2xs'
                : 'bg-white border-stone-200 hover:border-blue-300 hover:shadow-xs'
            }`}
          >
            {/* Big Friendly Category Icon */}
            <div
              className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 transition-transform ${
                item.checked ? 'bg-emerald-100 scale-95' : 'bg-stone-100'
              }`}
            >
              {getItemIcon(item.iconName)}
            </div>

            {/* Content Text */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                {item.priority === 'must_have' && (
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-rose-100 text-rose-700 border border-rose-200">
                    จำเป็นต้องมี
                  </span>
                )}
                {item.checked && (
                  <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    เตรียมเรียบร้อยแล้ว
                  </span>
                )}
              </div>

              <h4
                className={`text-sm font-bold mt-1 leading-snug transition-colors ${
                  item.checked ? 'text-emerald-950 line-through opacity-85' : 'text-stone-900'
                }`}
              >
                {item.title}
              </h4>

              <p className="text-xs text-stone-500 mt-1 leading-relaxed">
                {item.description}
              </p>
            </div>

            {/* Checkmark Button */}
            <div className="shrink-0 pt-1">
              {item.checked ? (
                <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-full border-2 border-stone-300 hover:border-blue-500 flex items-center justify-center text-transparent hover:text-stone-300 transition-colors">
                  <Circle className="w-4 h-4" />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* 4. Practical Flood Safety Advice Box */}
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 space-y-1.5">
        <div className="flex items-center gap-2 font-bold text-sm text-amber-950">
          <AlertTriangle className="w-4 h-4 text-amber-600" />
          <span>คำแนะนำก่อนน้ำท่วมถึงตัวบ้าน (เทศบาลเมืองพิบูลมังสาหาร)</span>
        </div>
        <p className="leading-relaxed">
          1. <strong>ตัดสวิตช์ไฟหลัก (เบรกเกอร์)</strong> ทันทีเมื่อระดับน้ำเริ่มเอ่อท่วมชั้นล่าง หรือยกเบรกเกอร์แยกส่วนเฉพาะชั้นบน
        </p>
        <p className="leading-relaxed">
          2. <strong>ยกรถยนต์และทรัพย์สินขึ้นที่สูง</strong> แนะนำจุดจอดปลอดภัยในอดีต เช่น เนินวัดดอนธาตุ หรือจุดที่เทศบาลจัดเตรียมไว้
        </p>
        <p className="leading-relaxed">
          3. หากมี <strong>ผู้ป่วยติดเตียงหรือหญิงใกล้คลอด</strong> กรุณากดปุ่ม <strong>"SOS ฉุกเฉิน"</strong> หรือโทรแจ้ง <strong>1669</strong> ทันที ไม่ควรรอจนน้ำท่วมทางสัญจร
        </p>
      </div>

      {/* 5. Bottom Navigation & Scroll Actions */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
        {onBackToHub ? (
          <button
            onClick={onBackToHub}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold shadow-xs transition-all cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>กลับสู่ศูนย์รวมเมนูช่วยเหลือ</span>
          </button>
        ) : (
          <div />
        )}

        <button
          onClick={() => {
            const root = document.getElementById('app-root-layout') || window;
            root.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="text-slate-500 hover:text-blue-600 font-semibold px-3 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
        >
          &uarr; เลื่อนกลับขึ้นด้านบนสุด
        </button>
      </div>
    </div>
  );
};

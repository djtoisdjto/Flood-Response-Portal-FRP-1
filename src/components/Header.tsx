import React from 'react';
import { useDisaster } from '../context/DisasterContext';
import { Wifi, WifiOff, RefreshCw, Zap, PhoneCall, Gauge, ShieldAlert, Users, Search, MessageSquareWarning } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  onOpenSOS: () => void;
  onOpenCreateNeed: () => void;
  onOpenGlobalSearch?: () => void;
  onNavigateHome?: () => void;
  onNavigateToHub?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSOS,
  onOpenCreateNeed,
  onOpenGlobalSearch,
  onNavigateHome,
  onNavigateToHub,
}) => {
  const {
    isOnline,
    isSimulatedOffline,
    toggleSimulatedOffline,
    lowBandwidthMode,
    toggleLowBandwidth,
    offlineQueue,
    syncOfflineQueue,
    lastSyncMessage,
  } = useDisaster();

  return (
    <header className="bg-stone-900 text-stone-100 border-b border-stone-800 shadow-md sticky top-0 z-30">
      {/* Top emergency announcement bar if there is a sync message or offline warning */}
      {lastSyncMessage && (
        <div className="bg-emerald-600 text-white text-xs font-semibold px-4 py-1 text-center flex items-center justify-center gap-2 transition-all">
          <Zap className="w-3.5 h-3.5" />
          <span>{lastSyncMessage}</span>
        </div>
      )}

      {isSimulatedOffline && (
        <div className="bg-amber-600 text-white text-xs font-bold px-4 py-1 text-center flex items-center justify-center gap-2">
          <WifiOff className="w-3.5 h-3.5" />
          <span>กำลังเปิดใช้งาน [โหมดจำลองออฟไลน์ / Offline Test] การกดรับจบและอัปเดตจะเก็บลงคิวในเครื่อง</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2.5 flex items-center justify-between gap-3">
        {/* Brand with Back Button to Page 2 (Main Hub) */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {onNavigateToHub && (
            <button
              id="btn-header-back-to-hub"
              onClick={onNavigateToHub}
              title="ย้อนกลับไปหน้าหลักรวมฟังก์ชัน (Main Hub)"
              className="flex items-center gap-1 sm:gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 hover:border-stone-500 transition-all cursor-pointer shrink-0 active:scale-95 group"
            >
              <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden xs:inline">หน้าหลัก</span>
            </button>
          )}

          {/* Logo & Title as Reset / Home Navigation Button */}
          <button
            id="btn-brand-home"
            onClick={onNavigateToHub || onNavigateHome}
            title="คลิกเพื่อย้อนกลับหน้าหลักศูนย์ประสานงานอุทกภัยอุบลราชธานี"
            className="flex items-center gap-2.5 min-w-0 text-left hover:opacity-90 active:scale-[0.99] transition-all cursor-pointer bg-transparent border-0 p-0 focus:outline-hidden group"
          >
            <div className="w-9 h-9 rounded-xl bg-orange-600 group-hover:bg-orange-500 flex items-center justify-center text-white shrink-0 shadow-inner transition-colors">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-sm sm:text-base font-bold text-white tracking-tight truncate group-hover:text-orange-200 transition-colors">
                  ศูนย์ประสานงานอุทกภัยอุบลราชธานี
                </h1>
                <span className="hidden md:inline-flex text-[11px] font-semibold px-2 py-0.5 rounded bg-blue-900/80 text-blue-200 border border-blue-700">
                  ต.ในเมือง &bull; วารินชำราบ
                </span>
              </div>
              <p className="text-[11px] text-stone-400 truncate">
                Match-Need &bull; ความจุศูนย์พักพิงสด &bull; ระบบตามหาญาติข้ามศูนย์
              </p>
            </div>
          </button>
        </div>

        {/* Action Controls & Offline System Badges */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Global Relative Search (Header quick button) */}
          {onOpenGlobalSearch && (
            <button
              id="btn-header-relative-search"
              onClick={onOpenGlobalSearch}
              title="ระบบตามหาญาติข้ามศูนย์พักพิง"
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold px-2.5 sm:px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all cursor-pointer"
            >
              <Users className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ตามหาญาติ</span>
            </button>
          )}

          {/* Queued Sync items counter */}
          {offlineQueue.length > 0 && (
            <button
              id="btn-sync-queue"
              onClick={() => syncOfflineQueue()}
              title="คลิกเพื่อซิงค์ข้อมูลลงเซิร์ฟเวอร์ทันที"
              className="flex items-center gap-1.5 bg-amber-500 hover:bg-amber-400 text-amber-950 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm animate-pulse cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>{offlineQueue.length} รอซิงค์</span>
            </button>
          )}

          {/* Network State & Offline Simulation Toggle */}
          <button
            id="btn-toggle-offline-simulation"
            onClick={toggleSimulatedOffline}
            title={isOnline ? 'คลิกเพื่อทดสอบโหมดออฟไลน์' : 'คลิกเพื่อเปิดโหมดออนไลน์'}
            className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              isOnline
                ? 'bg-emerald-950/80 border-emerald-700/60 text-emerald-300 hover:bg-emerald-900/80'
                : 'bg-rose-950/90 border-rose-600 text-rose-200 hover:bg-rose-900'
            }`}
          >
            {isOnline ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
                <span className="hidden sm:inline">ออนไลน์</span>
              </>
            ) : (
              <>
                <WifiOff className="w-3.5 h-3.5 text-rose-300" />
                <span>ออฟไลน์</span>
              </>
            )}
          </button>

          {/* Low Bandwidth / Data Saver Toggle */}
          <button
            id="btn-toggle-low-bandwidth"
            onClick={toggleLowBandwidth}
            title="โหมดประหยัดเน็ต/แบตเตอรี่ (ลดการโหลดภาพและแผนที่หนัก)"
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
              lowBandwidthMode
                ? 'bg-amber-900/60 border-amber-600 text-amber-200'
                : 'bg-stone-800 hover:bg-stone-700 border-stone-700 text-stone-300'
            }`}
          >
            <Gauge className="w-3.5 h-3.5" />
            <span>{lowBandwidthMode ? 'ประหยัดเน็ต: เปิด' : 'ประหยัดเน็ต'}</span>
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton className="hidden md:flex" />

          {/* SOS Hotlines Button */}
          <button
            id="btn-sos-hotlines"
            onClick={onOpenSOS}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold px-2.5 sm:px-3 py-1.5 rounded-lg text-xs shadow-md transition-all cursor-pointer animate-pulse"
            title="ระบบแจ้งเหตุ SOS และเปิด SMS ส่งพิกัดอัตโนมัติ (ไม่ง้อเน็ต)"
          >
            <MessageSquareWarning className="w-3.5 h-3.5" />
            <span>SOS (SMS)</span>
          </button>

          {/* Post Need Request Button */}
          <button
            id="btn-request-help"
            onClick={onOpenCreateNeed}
            className="flex items-center gap-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold px-3 py-1.5 rounded-lg text-xs shadow-md transition-all cursor-pointer"
          >
            <span>+ ขอความช่วยเหลือ</span>
          </button>
        </div>
      </div>
    </header>
  );
};

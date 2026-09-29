import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  HeartHandshake,
  HelpCircle,
  PhoneCall,
  ChevronRight,
  Sparkles,
  Lock,
  UserCheck,
  KeyRound,
  ShieldCheck
} from 'lucide-react';
import { OfficialAuthModal } from './OfficialAuthModal';
import { AgencyOfficial } from '../types/officialAuth';

interface WelcomeScreenProps {
  onEnterHub: () => void;
  onOfficialLoginSuccess?: (official: AgencyOfficial) => void;
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onEnterHub,
  onOfficialLoginSuccess,
}) => {
  const [isFadingOut, setIsFadingOut] = useState(false);
  const [progress, setProgress] = useState(55);

  // Official Auth Modal state
  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState(false);
  const [officialModalMode, setOfficialModalMode] = useState<'login' | 'register'>('login');

  // Gentle progress animation
  useEffect(() => {
    const pTimer = setInterval(() => {
      setProgress((prev) => (prev >= 98 ? 98 : prev + 10));
    }, 350);

    return () => clearInterval(pTimer);
  }, []);

  const handleEnter = () => {
    if (isFadingOut) return;
    setIsFadingOut(true);

    setTimeout(() => {
      onEnterHub();
    }, 450);
  };

  const handleOpenOfficialLogin = () => {
    setOfficialModalMode('login');
    setIsOfficialModalOpen(true);
  };

  const handleOpenHiddenRegister = () => {
    setOfficialModalMode('register');
    setIsOfficialModalOpen(true);
  };

  const handleOfficialSuccess = (official: AgencyOfficial) => {
    if (onOfficialLoginSuccess) {
      onOfficialLoginSuccess(official);
    }
    // Also enter hub with officer role
    handleEnter();
  };

  return (
    <section
      id="page-welcome"
      className={`page-view fixed inset-0 w-screen h-screen z-[9999] flex flex-col justify-between select-none bg-slate-50/98 backdrop-blur-xs text-slate-800 transition-opacity duration-500 ease-in-out ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      style={{
        background: 'radial-gradient(circle at 50% 25%, #f8fafc 0%, #f1f5f9 100%)',
      }}
    >
      {/* Subtle Background Mesh Grid */}
      <div className="absolute inset-0 pointer-events-none opacity-40 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px]" />

      {/* ========================================================
          SECRET / HIDDEN ACCESS BUTTONS (มุมซ้ายบนของหน้าจอ)
          2 ปุ่มเล็กๆ ซ่อนไว้แนบเนียนสำหรับเจ้าหน้าที่ใหม่ลงทะเบียน/ตั้งรหัสผ่าน
          ======================================================== */}
      <div className="absolute top-1.5 left-2 z-30 flex items-center gap-1 opacity-25 hover:opacity-100 transition-opacity duration-300">
        <button
          id="secret-btn-agency-verify"
          onClick={handleOpenHiddenRegister}
          title="[Secret Access 1] ยืนยันตัวตนเจ้าหน้าที่ใหม่ผ่าน ThaiD"
          className="w-5 h-5 rounded-md bg-slate-300/60 hover:bg-blue-600 hover:text-white text-slate-600 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
        >
          <KeyRound className="w-3 h-3" />
        </button>
        <button
          id="secret-btn-dopa-thaid"
          onClick={handleOpenHiddenRegister}
          title="[Secret Access 2] เชื่อมต่อระบบพิสูจน์อัตลักษณ์ดิจิทัล ThaiD"
          className="w-5 h-5 rounded-md bg-slate-300/60 hover:bg-indigo-600 hover:text-white text-slate-600 flex items-center justify-center text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
        >
          <ShieldCheck className="w-3 h-3" />
        </button>
      </div>

      {/* 1. TOP BAR */}
      <header className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
        {/* Top Left: Logo & Brand Name */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight leading-snug">
              ศูนย์ประสานงานอุทกภัยอุบลราชธานี
            </h2>
            <p className="text-[11px] text-slate-500">
              เทศบาลนครอุบลฯ &bull; วารินชำราบ &bull; พิบูลมังสาหาร &bull; ปภ.
            </p>
          </div>
        </div>

        {/* Top Right: Official Login & Hotline Actions */}
        <div className="flex items-center gap-2">
          {/* Explicit Official Login Button (ตามข้อกำหนด 1) */}
          <button
            id="btn-welcome-official-login"
            onClick={handleOpenOfficialLogin}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold shadow-xs transition-all cursor-pointer group active:scale-95"
            title="เข้าสู่ระบบเฉพาะสำหรับเจ้าหน้าที่รัฐและกู้ภัย"
          >
            <Lock className="w-3.5 h-3.5 text-blue-400 group-hover:rotate-12 transition-transform" />
            <span>สำหรับเจ้าหน้าที่</span>
          </button>

          <a
            href="tel:1784"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white text-xs font-semibold text-slate-700 border border-slate-200/90 shadow-2xs transition-all hover:border-slate-300"
            title="สายด่วน ปภ. 1784"
          >
            <PhoneCall className="w-3.5 h-3.5 text-rose-500" />
            <span className="hidden sm:inline">สายด่วน 1784</span>
          </a>
        </div>
      </header>

      {/* 2. HERO SECTION (CENTERED) */}
      <main className="relative z-10 max-w-xl w-full mx-auto px-6 py-6 flex flex-col items-center text-center my-auto">
        {/* Friendly Hero Relief Icon */}
        <div className="relative mb-5">
          <div className="absolute -inset-3 rounded-full bg-blue-500/10 blur-xl animate-pulse" />
          <div className="relative w-24 h-24 rounded-3xl bg-white border border-blue-100 shadow-xl shadow-blue-500/10 flex items-center justify-center text-blue-600 transition-transform duration-300 hover:scale-105">
            <HeartHandshake className="w-12 h-12 text-blue-600" strokeWidth={1.75} />
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-white" />
          </div>
        </div>

        {/* Clean Editorial Kicker (Anti-slop: unboxed metadata) */}
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500 mb-3">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>ระบบพร้อมใช้งาน</span>
          <span aria-hidden="true" className="text-slate-300">&bull;</span>
          <span>Match-Need</span>
          <span aria-hidden="true" className="text-slate-300">&bull;</span>
          <span>ThaiD Verified</span>
        </div>

        {/* Main Welcome Heading */}
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug mb-2.5">
          ยินดีต้อนรับสู่<br />
          <span className="text-blue-600">แพลตฟอร์มช่วยเหลือผู้ประสบภัยอุทกภัย</span>
        </h1>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm text-slate-500 font-normal max-w-md mx-auto mb-6 leading-relaxed">
          จังหวัดอุบลราชธานี - บูรณาการฐานข้อมูลศูนย์พักพิง สิ่งของบริจาค และระบบเตรียมพร้อมรายครัวเรือน
        </p>

        {/* Minimal Progress Bar preview */}
        <div className="w-full max-w-xs mb-6">
          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden mb-1.5">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <p className="text-[11px] text-slate-400">
            ระบบเตรียมพร้อมข้อมูลศูนย์พักพิงและสิ่งของจำเป็น
          </p>
        </div>

        {/* Dual Actions: Citizen Entry + Official Action */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-sm justify-center">
          {/* Main Citizen CTA Button */}
          <button
            id="btn-enter-dashboard"
            onClick={handleEnter}
            className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-sm sm:text-base shadow-lg shadow-blue-500/25 hover:shadow-blue-500/35 transition-all cursor-pointer"
          >
            <span>เข้าสู่ระบบศูนย์ประสานงาน</span>
            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        {/* Subtle Official link underneath */}
        <div className="mt-4 text-xs text-slate-400 flex items-center justify-center gap-1.5">
          <span>เจ้าหน้าที่รัฐ/กู้ภัย:</span>
          <button
            onClick={handleOpenOfficialLogin}
            className="text-slate-700 font-bold hover:text-blue-600 hover:underline cursor-pointer"
          >
            ล็อกอินเจ้าหน้าที่
          </button>
          <span>&bull;</span>
          <button
            onClick={handleOpenHiddenRegister}
            className="text-blue-600 font-bold hover:underline cursor-pointer"
          >
            ยืนยันตัวตน ThaiD
          </button>
        </div>
      </main>

      {/* 3. FOOTER */}
      <footer className="relative z-10 w-full max-w-7xl mx-auto px-4 py-3 text-center text-[11px] text-slate-400">
        เทศบาลนครอุบลราชธานี &bull; เทศบาลเมืองวารินชำราบ &bull; เทศบาลเมืองพิบูลมังสาหาร &bull; ปภ. จังหวัดอุบลราชธานี
      </footer>

      {/* Official Auth Modal (Official Login / ThaiD Verification / Set Password) */}
      <OfficialAuthModal
        isOpen={isOfficialModalOpen}
        onClose={() => setIsOfficialModalOpen(false)}
        initialMode={officialModalMode}
        onLoginSuccess={handleOfficialSuccess}
      />
    </section>
  );
};

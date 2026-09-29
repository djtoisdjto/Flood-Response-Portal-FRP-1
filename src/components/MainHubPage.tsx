import React, { useState } from 'react';
import {
  ArrowLeft,
  Building2,
  Users,
  PhoneCall,
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  Radio,
  CloudRain,
  Package,
  Calendar,
  CheckCircle2,
  UserCheck,
  Lock,
  LogOut,
  MoreVertical,
  LifeBuoy,
  Wifi,
  WifiOff,
  Filter,
  Layers,
  MapPin,
  Car
} from 'lucide-react';
import { Shelter, NeedItem } from '../types';
import { HistoricalSafeZone, CrowdsourcedClue } from '../types/disasterRelief';
import { PhibunHousehold } from '../types/smartReliefKit';
import { AgencyOfficial } from '../types/officialAuth';
import { PWAInstallButton } from './PWAInstallButton';
import { HistoricalSafeZonesView } from './HistoricalSafeZonesView';
import { CrowdsourcedCluesView } from './CrowdsourcedCluesView';
import { PreFloodChecklistView } from './PreFloodChecklistView';
import { SmartReliefKitAdminView } from './SmartReliefKitAdminView';
import { DistributionTimelineView } from './DistributionTimelineView';
import { OfficialAuthModal } from './OfficialAuthModal';
import { EmergencyHotlinesModal } from './EmergencyHotlinesModal';
import { WarinIncidentsMap } from './WarinIncidentsMap';

interface MainHubPageProps {
  onBackToWelcome: () => void;
  onNavigateToMapDashboard: () => void;
  onOpenRelativeSearch: () => void;
  onOpenCreateNeed: () => void;
  onOpenSOS: () => void;
  shelters: Shelter[];
  needs: NeedItem[];
  safeZones: HistoricalSafeZone[];
  clues: CrowdsourcedClue[];
  households: PhibunHousehold[];
  currentOfficial: AgencyOfficial | null;
  onOfficialLoginSuccess: (official: AgencyOfficial) => void;
  onOfficialLogout: () => void;
  onAddClue: (newClue: Omit<CrowdsourcedClue, 'id' | 'timestamp' | 'upvotes' | 'verified'>) => void;
  onUpvoteClue: (clueId: string) => void;
  onSelectSafeZoneOnMap: (safeZone: HistoricalSafeZone) => void;
  onDispatchNextPhase: (householdId: string, daysDuration: number, officer: string) => void;
  isOnline: boolean;
}

export const MainHubPage: React.FC<MainHubPageProps> = ({
  onBackToWelcome,
  onNavigateToMapDashboard,
  onOpenRelativeSearch,
  onOpenCreateNeed,
  onOpenSOS,
  shelters,
  needs,
  safeZones,
  clues,
  households,
  currentOfficial,
  onOfficialLoginSuccess,
  onOfficialLogout,
  onAddClue,
  onUpvoteClue,
  onSelectSafeZoneOnMap,
  onDispatchNextPhase,
  isOnline,
}) => {
  const [activeSection, setActiveSection] = useState<'hub' | 'gobag' | 'smartkit' | 'timeline' | 'safezones' | 'clues' | 'warin'>('hub');
  const [hubCategory, setHubCategory] = useState<'all' | 'citizen' | 'official' | 'situation'>('all');
  const [isOfficialModalOpen, setIsOfficialModalOpen] = useState(false);
  const [isHotlinesModalOpen, setIsHotlinesModalOpen] = useState(false);
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);

  const totalOccupancy = shelters.reduce((acc, s) => acc + s.currentOccupancy, 0);
  const totalCapacity = shelters.reduce((acc, s) => acc + s.maxCapacity, 0);

  const bedriddenTotal = households.reduce((sum, h) => sum + h.demographics.bedriddenPatients, 0);
  const infantTotal = households.reduce((sum, h) => sum + h.demographics.infantsAndToddlers, 0);
  const vulnerableTotal = bedriddenTotal + infantTotal;

  // Filter modules based on segmented control
  const showCitizen = hubCategory === 'all' || hubCategory === 'citizen';
  const showOfficial = hubCategory === 'all' || hubCategory === 'official';
  const showSituation = hubCategory === 'all' || hubCategory === 'situation';

  return (
    // FIX SCROLL ISSUE & MODERN CLEAN CONTAINER:
    // min-h-screen ไหลตาม Document Flow ปกติ ไม่มีการใช้ h-screen หรือ overflow-hidden บังคับ
    <section
      id="page-main-hub"
      className="page-view flex flex-col min-h-screen w-full bg-[#F8FAFC] text-slate-800 select-none pb-20"
    >
      {/* ============================================================
          1. HEADER: CLEAN, UNCLUTTERED & BALANCED
          ============================================================ */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-3">
          {/* Left: Back / Brand */}
          <div className="flex items-center gap-3">
            {activeSection !== 'hub' ? (
              <button
                onClick={() => setActiveSection('hub')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer group active:scale-95"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>กลับสู่ศูนย์รวมเมนู</span>
              </button>
            ) : (
              <button
                id="btn-hub-back-to-welcome"
                onClick={onBackToWelcome}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer group active:scale-95"
                title="ย้อนกลับไปหน้าต้อนรับ (Welcome Page)"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
                <span>หน้าแรก</span>
              </button>
            )}

            {/* Brand Logo & Editorial Kicker */}
            <div className="hidden sm:flex items-center gap-2.5 pl-1">
              <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center text-white shrink-0 shadow-xs">
                <ShieldAlert className="w-4 h-4 text-blue-400" />
              </div>
              <div className="text-left">
                <h1 className="text-xs sm:text-sm font-bold text-slate-900 tracking-tight leading-none">
                  ศูนย์ประสานงานอุทกภัยอุบลฯ
                </h1>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  เทศบาลเมืองพิบูลมังสาหาร &bull; ปภ.
                </p>
              </div>
            </div>
          </div>

          {/* Right Actions: Official Status, SOS Button & More Menu */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Official Authentication Status */}
            {currentOfficial ? (
              <div className="flex items-center gap-2 bg-emerald-50/80 border border-emerald-200/90 px-2.5 py-1 rounded-xl text-xs">
                <div className="flex items-center gap-1.5 text-emerald-900 font-semibold">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="hidden md:inline truncate max-w-[110px]">{currentOfficial.fullName}</span>
                  <span className="text-[10px] bg-emerald-600 text-white px-1.5 py-0.2 rounded font-bold">ThaiD</span>
                </div>
                <button
                  onClick={onOfficialLogout}
                  title="ออกจากระบบเจ้าหน้าที่"
                  className="text-slate-400 hover:text-rose-600 cursor-pointer ml-0.5"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsOfficialModalOpen(true)}
                className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-slate-500" />
                <span>สำหรับเจ้าหน้าที่</span>
              </button>
            )}

            {/* SOS Emergency Callout (Clear, High-Priority Accent) */}
            <button
              id="btn-hub-sos-offline"
              onClick={onOpenSOS}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
              title="ระบบ SOS แจ้งเหตุฉุกเฉินและเปิด SMS ส่งพิกัดอัตโนมัติ"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>SOS ฉุกเฉิน</span>
            </button>

            {/* More Menu Dropdown Toggle (Reduces UI clutter) */}
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen((prev) => !prev)}
                className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                  isMoreMenuOpen
                    ? 'bg-slate-200 border-slate-300 text-slate-900'
                    : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                }`}
                title="เมนูเพิ่มเติมและเครื่องมือช่วยเหลือ"
              >
                <MoreVertical className="w-4 h-4" />
              </button>

              {/* Dropdown Menu */}
              {isMoreMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMoreMenuOpen(false)}
                  />
                  <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl z-50 p-1.5 text-xs text-slate-700 divide-y divide-slate-100 animate-in fade-in zoom-in-95 duration-150">
                    <div className="py-1">
                      <button
                        onClick={() => {
                          setIsHotlinesModalOpen(true);
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
                      >
                        <PhoneCall className="w-3.5 h-3.5 text-rose-600" />
                        <span>เบอร์โทรสายด่วนฉุกเฉิน 24 ชม.</span>
                      </button>

                      <button
                        onClick={() => {
                          onOpenRelativeSearch();
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
                      >
                        <Users className="w-3.5 h-3.5 text-blue-600" />
                        <span>ตามหาญาติข้ามศูนย์พักพิง</span>
                      </button>

                      <button
                        onClick={() => {
                          onNavigateToMapDashboard();
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
                      >
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>แผนที่สดศูนย์พักพิง (GIS)</span>
                      </button>

                      <button
                        onClick={() => {
                          setActiveSection('warin');
                          setIsMoreMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
                      >
                        <Car className="w-3.5 h-3.5 text-rose-600" />
                        <span>แผนที่อุบัติเหตุ อ.วารินชำราบ (Live Map)</span>
                      </button>
                    </div>

                    <div className="py-1">
                      {!currentOfficial && (
                        <button
                          onClick={() => {
                            setIsOfficialModalOpen(true);
                            setIsMoreMenuOpen(false);
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-100 transition-colors text-left font-medium cursor-pointer"
                        >
                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                          <span>ล็อกอินเจ้าหน้าที่ (ThaiD)</span>
                        </button>
                      )}

                      <div className="px-3 py-1.5 flex items-center justify-between text-slate-500">
                        <span className="flex items-center gap-1.5">
                          {isOnline ? (
                            <Wifi className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <WifiOff className="w-3 h-3 text-rose-600" />
                          )}
                          <span>สถานะการเชื่อมต่อ</span>
                        </span>
                        <span className="font-semibold text-slate-800">
                          {isOnline ? 'ออนไลน์' : 'ออฟไลน์'}
                        </span>
                      </div>

                      <div className="pt-1 px-1">
                        <PWAInstallButton />
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          SUB-VIEWS OR MAIN HUB CARDS
          ============================================================ */}
      {activeSection === 'gobag' ? (
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 pb-16">
          <PreFloodChecklistView onBackToHub={() => setActiveSection('hub')} />
        </div>
      ) : activeSection === 'smartkit' ? (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 pb-16">
          <SmartReliefKitAdminView
            households={households}
            onDispatchNextPhase={onDispatchNextPhase}
          />
        </div>
      ) : activeSection === 'timeline' ? (
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 pb-16">
          <DistributionTimelineView
            households={households}
            onSelectHousehold={() => {
              setActiveSection('smartkit');
            }}
            onDispatchNextPhase={onDispatchNextPhase}
          />
        </div>
      ) : activeSection === 'safezones' ? (
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 pb-16">
          <HistoricalSafeZonesView
            safeZones={safeZones}
            userLocation={null}
            onSelectOnMap={(zone) => {
              onSelectSafeZoneOnMap(zone);
            }}
          />
        </div>
      ) : activeSection === 'clues' ? (
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 pb-16">
          <CrowdsourcedCluesView
            clues={clues}
            onAddClue={onAddClue}
            onUpvoteClue={onUpvoteClue}
            isOnline={isOnline}
          />
        </div>
      ) : activeSection === 'warin' ? (
        <div className="max-w-6xl mx-auto w-full px-4 sm:px-6 py-6 flex-1 pb-16">
          <WarinIncidentsMap onBackToHub={() => setActiveSection('hub')} />
        </div>
      ) : (
        <>
          {/* ========================================================
              2. MODERN HERO SECTION: GENEROUS WHITE SPACE & MINIMALIST
              ======================================================== */}
          <div className="max-w-5xl mx-auto w-full px-4 sm:px-6 pt-8 sm:pt-12 pb-6">
            {/* Quiet Editorial Kicker (Anti-Slop: No candy pills) */}
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 mb-2">
              <span className="w-2 h-2 rounded-full bg-blue-600" />
              <span>ระบบเตรียมความพร้อมและจัดการอุทกภัย</span>
              <span aria-hidden="true" className="text-slate-300">&bull;</span>
              <span>เทศบาลเมืองพิบูลมังสาหาร</span>
            </div>

            {/* Clear, High-Contrast Typography Hierarchy */}
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
              ศูนย์รวมฟังก์ชันช่วยเหลือผู้ประสบภัย
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl mt-2 leading-relaxed font-normal">
              เตรียมพร้อมก่อนน้ำท่วมด้วยเช็กลิสต์จัดกระเป๋าฉุกเฉิน บริหารจัดการถุงยังชีพอัจฉริยะรายครัวเรือน และเชื่อมต่อศูนย์พักพิงแบบเรียลไทม์
            </p>

            {/* Key Metrics Row: High Contrast, Structured & Clean */}
            <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-white rounded-2xl border border-slate-200/80 p-3 sm:p-4 shadow-2xs">
              <div className="px-2 sm:px-3 py-1 border-r border-slate-100 last:border-r-0">
                <div className="text-[11px] font-medium text-slate-500">ครัวเรือนนำร่อง</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {households.length} <span className="text-xs font-normal text-slate-400">หลัง</span>
                </div>
              </div>

              <div className="px-2 sm:px-3 py-1 border-r border-slate-100 last:border-r-0">
                <div className="text-[11px] font-medium text-slate-500">กลุ่มเปราะบาง (ติดเตียง/ทารก)</div>
                <div className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5">
                  {vulnerableTotal} <span className="text-xs font-normal text-slate-400">คน</span>
                </div>
              </div>

              <div className="px-2 sm:px-3 py-1 border-r border-slate-100 last:border-r-0">
                <div className="text-[11px] font-medium text-slate-500">ศูนย์พักพิงพร้อมรับ</div>
                <div className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5">
                  {shelters.length} <span className="text-xs font-normal text-slate-400">ศูนย์</span>
                </div>
              </div>

              <div className="px-2 sm:px-3 py-1">
                <div className="text-[11px] font-medium text-slate-500">สถานะระบบ</div>
                <div className="text-xl sm:text-2xl font-black text-emerald-600 mt-0.5 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-sm sm:text-base font-bold text-slate-900">พร้อมใช้งาน</span>
                </div>
              </div>
            </div>

            {/* ========================================================
                3. SEGMENTED CATEGORY CONTROL (Information Architecture)
                ======================================================== */}
            <div className="mt-7 flex items-center justify-between gap-3 flex-wrap">
              <div className="inline-flex items-center p-1 bg-slate-200/70 rounded-xl text-xs font-semibold text-slate-600">
                <button
                  onClick={() => setHubCategory('all')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    hubCategory === 'all'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  ทั้งหมด
                </button>
                <button
                  onClick={() => setHubCategory('citizen')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    hubCategory === 'citizen'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  สำหรับประชาชน
                </button>
                <button
                  onClick={() => setHubCategory('official')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    hubCategory === 'official'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  สำหรับเจ้าหน้าที่/กู้ภัย
                </button>
                <button
                  onClick={() => setHubCategory('situation')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all cursor-pointer ${
                    hubCategory === 'situation'
                      ? 'bg-white text-slate-900 shadow-2xs font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  สถานการณ์ & GIS
                </button>
              </div>

              {/* Sub-label count */}
              <div className="text-xs text-slate-400 font-medium">
                {hubCategory === 'all' && 'แสดงฟังก์ชันทั้งหมด (7 ฟังก์ชัน)'}
                {hubCategory === 'citizen' && 'เฉพาะบริการประชาชนและเตรียมพร้อม'}
                {hubCategory === 'official' && 'เฉพาะระบบปฏิบัติงานและจัดสรรสิ่งของ'}
                {hubCategory === 'situation' && 'เฉพาะข้อมูลแผนที่และรายงานระดับน้ำ'}
              </div>
            </div>
          </div>

          {/* ========================================================
              4. CARD GRID: CLEAN, STRUCTURED & INTERACTIVE
              ======================================================== */}
          <main className="max-w-5xl mx-auto w-full px-4 sm:px-6 flex-1 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
              {/* CARD 1: CITIZEN VIEW - PRE-FLOOD GO-BAG CHECKLIST */}
              {showCitizen && (
                <div
                  id="card-btn-preflood-checklist"
                  onClick={() => setActiveSection('gobag')}
                  className="group rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-amber-400/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    {/* Header line with clean kicker & icon */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <CloudRain className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-amber-800">
                        สำหรับประชาชน
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-amber-800 transition-colors">
                      เตรียมพร้อมก่อนน้ำท่วม (Go-Bag Checklist)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      เช็กลิสต์จัดกระเป๋าฉุกเฉิน 9 สิ่งของจำเป็น เช่น พาวเวอร์แบงค์ ยาประจำตัว เอกสารสำคัญ และน้ำดื่มสะอาด พร้อมระบบบันทึกความพร้อม
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-amber-700 transition-colors">
                    <span className="text-slate-500">9 รายการจำเป็น</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>เปิดเช็กลิสต์</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              )}

              {/* CARD 2: ADMIN & RESCUE VIEW - SMART RELIEF KIT */}
              {showOfficial && (
                <div
                  id="card-btn-smart-relief-kit"
                  onClick={() => setActiveSection('smartkit')}
                  className="group rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-indigo-400/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Package className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-indigo-800">
                        สำหรับเจ้าหน้าที่ & กู้ภัย
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-800 transition-colors">
                      จัดการถุงยังชีพอัจฉริยะ (Smart Relief Kit)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      คำนวณของในถุงตามโครงสร้างประชากรจริงรายครัวเรือน แยกบ้านผู้ป่วยติดเตียง บ้านมีทารก และสตรีมีครรภ์ เลิกแจกแบบ One-Size-Fits-All
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-indigo-700 transition-colors">
                    <span className="text-slate-500">นำร่อง 45 ครัวเรือน</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>เปิดระบบจัดการ</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              )}

              {/* CARD 3: DISTRIBUTION TIMELINE & FORECASTING */}
              {showOfficial && (
                <div
                  id="card-btn-distribution-timeline"
                  onClick={() => setActiveSection('timeline')}
                  className="group rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-slate-400 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-slate-600">
                        รอบการแจกจ่าย
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-slate-800 transition-colors">
                      ไทม์ไลน์รอบแจกถุงยังชีพ (Timeline & Forecasting)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      ประเมินวันหมดอายุของถุงยังชีพแต่ละหลัง (Phase 1, 2, 3) พร้อมแจ้งเตือนเจ้าหน้าที่ล่วงหน้า 24 ชม. ป้องกันภาวะขาดแคลน
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                    <span className="text-slate-500">แจ้งเตือน Phase 2</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>ดูตารางนัดหมาย</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              )}

              {/* CARD 4: MAP DASHBOARD */}
              {(showSituation || showOfficial) && (
                <div
                  id="card-btn-map-dashboard"
                  onClick={onNavigateToMapDashboard}
                  className="group rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-blue-400/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-blue-700">
                        GIS & ศูนย์พักพิง
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                      ศูนย์พักพิง & แผนที่ความจุสด (Map Dashboard)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      ตรวจสอบความจุศูนย์พักพิงทั้ง 6 แห่ง คำนวณระยะทางจาก GPS จริง หมุดของขาด/รับจบ และหมุดจุดปลอดภัยในอดีต
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                    <span className="text-slate-500">6 ศูนย์หลัก</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>เข้าสู่แผนที่สด</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              )}

              {/* CARD: WARIN CHAMRAP INCIDENTS & REAL-TIME ALERTS */}
              {(showSituation || showCitizen || showOfficial) && (
                <div
                  id="card-btn-warin-incidents"
                  onClick={() => setActiveSection('warin')}
                  className="group rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-rose-400/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Car className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-rose-700">
                        อ.วารินชำราบ &bull; Live Alert
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-rose-700 transition-colors">
                      เตือนภัยอุบัติเหตุ & น้ำท่วมทาง (อ.วารินชำราบ)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      แผนที่ปักหมุดอุบัติเหตุ จุดน้ำเอ่อท่วมผิวจราจร เส้นทางปิดซ่อมแซม และแนะนำทางเลี่ยงแบบเรียลไทม์ (Google Maps & GIS Monitor)
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-rose-700 transition-colors">
                    <span className="text-slate-500">7 จุดแจ้งเตือนล่าสุด</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>เปิดแผนที่เตือนภัย</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              )}

              {/* CARD 5: HISTORICAL SAFE ZONE */}
              {(showSituation || showCitizen) && (
                <div
                  id="card-btn-safe-zones"
                  onClick={() => setActiveSection('safezones')}
                  className="group rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-emerald-400/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <ShieldCheck className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-800">
                        สถิติ 50 ปี
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                      จุดรอดชีวิตในอดีต (Historical Safe Zones)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      จุดที่น้ำไม่เคยท่วมถึง เช่น วัดดอนธาตุ เนินวัดหนองป่าพง สำหรับจอดรถยนต์หนีน้ำและเป็นจุดรวมพลปลอดภัย
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    <span className="text-slate-500">{safeZones.length} จุดปลอดภัย</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>ดูพิกัดปลอดภัย</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              )}

              {/* CARD 6: CROWDSOURCED CLUES */}
              {(showSituation || showCitizen) && (
                <div
                  id="card-btn-crowdsourced-clues"
                  onClick={() => setActiveSection('clues')}
                  className="group rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-sky-400/80 transition-all duration-200 cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl bg-sky-50 text-sky-700 flex items-center justify-center group-hover:scale-105 transition-transform">
                        <Radio className="w-5 h-5" />
                      </div>
                      <span className="text-[11px] font-semibold text-sky-800">
                        รายงานชุมชน
                      </span>
                    </div>

                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                      เบาะแสระดับน้ำจริง (Crowdsourced Clues)
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 mt-1.5 leading-relaxed">
                      อัปเดตระดับน้ำแม่น้ำมูล สะพานเสรี แก่งสะพือ ถนนขาด และเรือจิตอาสาภาคสนามที่พร้อมช่วยเหลือ
                    </p>
                  </div>

                  <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-sky-700 transition-colors">
                    <span className="text-slate-500">{clues.length} รายงานล่าสุด</span>
                    <span className="inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                      <span>ดูเบาะแส</span>
                      <ChevronRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
              )}

              {/* CARD 7: RELATIVE SEARCH */}
              {showCitizen && (
                <div
                  id="card-btn-relative-search"
                  onClick={onOpenRelativeSearch}
                  className="group rounded-2xl bg-white border border-slate-200/90 p-6 shadow-2xs hover:shadow-md hover:border-purple-400/80 transition-all duration-200 cursor-pointer flex flex-col justify-between md:col-span-2"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-[11px] font-semibold text-purple-800">
                          ฐานข้อมูลผู้ประสบภัย
                        </div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-purple-800 transition-colors">
                          ระบบตามหาญาติข้ามศูนย์พักพิง (Evacuee Search)
                        </h3>
                        <p className="text-xs sm:text-sm text-slate-600 mt-1 leading-relaxed max-w-2xl">
                          ค้นหารายชื่อผู้ประสบภัยที่ลงทะเบียนเข้าพักในศูนย์อพยพ 922+ รายชื่อ ค้นหาด้วยชื่อ สกุล หรือเบอร์โทร
                        </p>
                      </div>
                    </div>

                    <div className="sm:self-center shrink-0">
                      <span className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 group-hover:bg-purple-700 text-white text-xs font-bold transition-colors">
                        <span>ค้นหาญาติ</span>
                        <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </main>

          {/* ========================================================
              5. FOOTER: QUIET & PROFESSIONAL
              ======================================================== */}
          <footer className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-10 text-center text-xs text-slate-400">
            <div className="border-t border-slate-200/80 pt-6">
              <p>
                ศูนย์ปฏิบัติการร่วม &bull; เทศบาลเมืองพิบูลมังสาหาร &bull; มหาวิทยาลัยอุบลราชธานี &bull; ปภ. จังหวัดอุบลราชธานี
              </p>
            </div>
          </footer>
        </>
      )}

      {/* Official Auth Modal */}
      <OfficialAuthModal
        isOpen={isOfficialModalOpen}
        onClose={() => setIsOfficialModalOpen(false)}
        initialMode="login"
        onLoginSuccess={onOfficialLoginSuccess}
      />

      {/* Emergency Hotlines Modal */}
      <EmergencyHotlinesModal
        isOpen={isHotlinesModalOpen}
        onClose={() => setIsHotlinesModalOpen(false)}
      />
    </section>
  );
};

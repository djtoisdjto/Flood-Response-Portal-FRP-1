import React, { useState, useEffect } from 'react';
import { DisasterProvider, useDisaster } from './context/DisasterContext';
import { Header } from './components/Header';
import { DisasterMap } from './components/DisasterMap';
import { DisasterFeed } from './components/DisasterFeed';
import { NearestShelterBanner } from './components/NearestShelterBanner';
import { ClaimModal } from './components/ClaimModal';
import { CreateNeedModal } from './components/CreateNeedModal';
import { OfflineSOSModal } from './components/OfflineSOSModal';
import { AdminModeratorModal } from './components/AdminModeratorModal';
import { GlobalEvacueeSearchModal } from './components/GlobalEvacueeSearchModal';
import { WelcomeScreen } from './components/WelcomeScreen';
import { MainHubPage } from './components/MainHubPage';
import { NeedItem, Shelter } from './types';
import { HistoricalSafeZone, CrowdsourcedClue } from './types/disasterRelief';
import { PhibunHousehold } from './types/smartReliefKit';
import { AgencyOfficial } from './types/officialAuth';
import { HISTORICAL_SAFE_ZONES, INITIAL_CROWDSOURCED_CLUES } from './data/disasterReliefData';
import { INITIAL_PHIBUN_HOUSEHOLDS } from './data/phibunReliefData';
import { calculateTailoredReliefKit } from './utils/reliefKitCalculator';
import { Map, List, Shield, Filter, Users, ShieldCheck, Radio, WifiOff } from 'lucide-react';

export type PageId = 'page-welcome' | 'page-main-hub' | 'page-map-dashboard';

const STORAGE_KEYS = {
  CLUES: 'matchneed_crowdsourced_clues_v1_ubon',
  HOUSEHOLDS: 'matchneed_phibun_households_v1',
};

const MainLayout: React.FC = () => {
  const {
    needs,
    shelters,
    evacuees,
    userLocation,
    selectedNeedId,
    selectedShelterId,
    setSelectedNeedId,
    setSelectedShelterId,
    claimNeed,
    createNeed,
    isOnline,
    lowBandwidthMode,
    refreshDeviceGPS,
    setUserLocationToUbonCityHall,
  } = useDisaster();

  // 3-Page Navigation Hierarchy state (Page 1 -> Page 2 -> Page 3)
  const [currentPage, setCurrentPage] = useState<PageId>('page-welcome');

  // Key Feature 2: Historical Safe Zones
  const [safeZones] = useState<HistoricalSafeZone[]>(HISTORICAL_SAFE_ZONES);
  const [selectedSafeZoneId, setSelectedSafeZoneId] = useState<string | null>(null);

  // Key Feature 3: Crowdsourced Clues from Locals
  const [clues, setClues] = useState<CrowdsourcedClue[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.CLUES);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_CROWDSOURCED_CLUES;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.CLUES, JSON.stringify(clues));
    } catch {
      // Ignore
    }
  }, [clues]);

  // Key Feature 4: Phibun Mangsahan Households & Tailored Relief Kit Dispatch
  const [households, setHouseholds] = useState<PhibunHousehold[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.HOUSEHOLDS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return INITIAL_PHIBUN_HOUSEHOLDS;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEYS.HOUSEHOLDS, JSON.stringify(households));
    } catch {
      // Ignore
    }
  }, [households]);

  const handleDispatchNextPhase = (householdId: string, daysDuration: number, officer: string) => {
    setHouseholds((prev) =>
      prev.map((hh) => {
        if (hh.id !== householdId) return hh;

        const nextPhaseNumber = hh.distributionHistory.length + 1;
        const now = new Date();
        const depletion = new Date(now.getTime() + daysDuration * 24 * 60 * 60 * 1000);
        const nextDelivery = new Date(depletion.getTime() - 24 * 60 * 60 * 1000); // 24h prior

        const newDistRecord = {
          distributionId: `dist-${hh.id}-p${nextPhaseNumber}-${Date.now()}`,
          householdId: hh.id,
          phase: nextPhaseNumber,
          distributedAt: now.toISOString(),
          suppliesDurationDays: daysDuration,
          depletionDate: depletion.toISOString(),
          nextScheduledDeliveryDate: nextDelivery.toISOString(),
          status: 'delivered' as const,
          officerInCharge: officer,
          kitItems: calculateTailoredReliefKit(hh.demographics, daysDuration),
        };

        return {
          ...hh,
          lastDistribution: newDistRecord,
          distributionHistory: [...hh.distributionHistory, newDistRecord],
        };
      })
    );
  };

  const handleAddClue = (newClue: Omit<CrowdsourcedClue, 'id' | 'timestamp' | 'upvotes' | 'verified'>) => {
    const item: CrowdsourcedClue = {
      ...newClue,
      id: `clue-${Date.now()}`,
      timestamp: new Date().toISOString(),
      upvotes: 1,
      verified: false,
    };
    setClues((prev) => [item, ...prev]);
  };

  const handleUpvoteClue = (clueId: string) => {
    setClues((prev) =>
      prev.map((c) => (c.id === clueId ? { ...c, upvotes: c.upvotes + 1 } : c))
    );
  };

  // Modals state
  const [isClaimModalOpen, setIsClaimModalOpen] = useState(false);
  const [targetNeedToClaim, setTargetNeedToClaim] = useState<NeedItem | null>(null);
  const [isCreateNeedOpen, setIsCreateNeedOpen] = useState(false);
  const [isSOSOpen, setIsSOSOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);

  // Official Authentication state
  const [currentOfficial, setCurrentOfficial] = useState<AgencyOfficial | null>(() => {
    try {
      const saved = localStorage.getItem('matchneed_current_official_session');
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return null;
  });

  const handleOfficialLoginSuccess = (official: AgencyOfficial) => {
    setCurrentOfficial(official);
    try {
      localStorage.setItem('matchneed_current_official_session', JSON.stringify(official));
    } catch {
      // Ignore
    }
    navigateTo('page-main-hub');
  };

  const handleOfficialLogout = () => {
    setCurrentOfficial(null);
    try {
      localStorage.removeItem('matchneed_current_official_session');
    } catch {
      // Ignore
    }
  };

  // Global Evacuee Search Modal state
  const [isEvacueeModalOpen, setIsEvacueeModalOpen] = useState(false);
  const [evacueeModalShelterId, setEvacueeModalShelterId] = useState<string | null>(null);

  // Map / List view toggling on mobile
  const [mobileView, setMobileView] = useState<'map' | 'list'>('map');

  // Map Filter layers
  const [filterShowNeeds, setFilterShowNeeds] = useState(true);
  const [filterShowShelters, setFilterShowShelters] = useState(true);
  const [filterShowSafeZones, setFilterShowSafeZones] = useState(true);

  // Location Picking state
  const [isLocationPicking, setIsLocationPicking] = useState(false);
  const [pickedLocation, setPickedLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Active Feed tab
  const [feedTab, setFeedTab] = useState<'all' | 'needs' | 'claimed' | 'shelters' | 'safezones' | 'clues'>('all');

  const handleOpenClaim = (need: NeedItem) => {
    setTargetNeedToClaim(need);
    setIsClaimModalOpen(true);
  };

  const handleStartPickLocation = () => {
    setIsLocationPicking(true);
    setMobileView('map');
  };

  const handlePickLocation = (lat: number, lng: number) => {
    setPickedLocation({ lat, lng });
    setIsLocationPicking(false);
    setIsCreateNeedOpen(true);
  };

  const handleOpenGlobalSearch = (shelterId?: string | null) => {
    setEvacueeModalShelterId(shelterId || null);
    setIsEvacueeModalOpen(true);
  };

  const handleSelectSafeZoneOnMap = (zone: HistoricalSafeZone) => {
    setSelectedSafeZoneId(zone.id);
    setSelectedNeedId(null);
    setSelectedShelterId(null);
    setMobileView('map');
    if (currentPage !== 'page-map-dashboard') {
      navigateTo('page-map-dashboard');
    }
  };

  // Reset/Route back to full Main Dashboard View
  const handleResetMainDashboard = () => {
    setSelectedNeedId(null);
    setSelectedShelterId(null);
    setSelectedSafeZoneId(null);

    setIsClaimModalOpen(false);
    setTargetNeedToClaim(null);
    setIsCreateNeedOpen(false);
    setIsSOSOpen(false);
    setIsAdminOpen(false);
    setIsEvacueeModalOpen(false);
    setEvacueeModalShelterId(null);
    setIsLocationPicking(false);
    setPickedLocation(null);

    setFeedTab('all');
    setFilterShowNeeds(true);
    setFilterShowShelters(true);
    setFilterShowSafeZones(true);
    setMobileView('map');

    window.dispatchEvent(new Event('reset-main-dashboard'));
    window.dispatchEvent(new Event('resize'));
  };

  // SPA 3-Page Navigation Router (Page 1 -> Page 2 -> Page 3)
  const navigateTo = (pageId: string) => {
    if (pageId === 'page-welcome' || pageId === 'welcome') {
      setCurrentPage('page-welcome');
    } else if (pageId === 'page-main-hub' || pageId === 'main-hub' || pageId === 'hub') {
      setCurrentPage('page-main-hub');
    } else if (
      pageId === 'page-map-dashboard' ||
      pageId === 'map-dashboard' ||
      pageId === 'map' ||
      pageId === 'home'
    ) {
      setCurrentPage('page-map-dashboard');
      handleResetMainDashboard();
      setTimeout(() => {
        window.dispatchEvent(new Event('resize'));
        window.dispatchEvent(new Event('reset-main-dashboard'));
      }, 100);
    }
  };

  // Expose global navigation function for external/Vanilla JS interoperability
  useEffect(() => {
    (window as unknown as { navigateTo?: (view: string) => void; renderMainDashboard?: () => void }).navigateTo = (view: string) => {
      navigateTo(view);
    };
    (window as unknown as { renderMainDashboard?: () => void }).renderMainDashboard = () => {
      navigateTo('page-map-dashboard');
    };
  }, []);

  return (
    // FIX SCROLL ISSUE: เปลี่ยนจาก `w-screen h-screen overflow-hidden` ที่ล็อกความสูงหน้าจอแบบตายตัว
    // มาเป็น conditional layout wrapper: ถ้าเป็นหน้าแผนที่สด (map) ใช้ `h-screen overflow-hidden`
    // แต่ถ้าเป็นหน้า Hub/Go-Bag Checklist/Admin ให้ใช้ `min-h-screen overflow-y-auto overflow-x-hidden` เพื่อให้เลื่อนดูคอนเทนต์ได้ครบถ้วน
    <div
      id="app-root-layout"
      className={`relative w-full ${
        currentPage === 'page-map-dashboard'
          ? 'h-screen overflow-hidden'
          : 'min-h-screen overflow-y-auto overflow-x-hidden'
      } bg-[#F8FAFC]`}
    >
      {/* ============================================================
          PAGE 1: WELCOME PAGE (SPLASH SCREEN)
          ============================================================ */}
      {currentPage === 'page-welcome' && (
        <WelcomeScreen
          onEnterHub={() => navigateTo('page-main-hub')}
          onOfficialLoginSuccess={handleOfficialLoginSuccess}
        />
      )}

      {/* ============================================================
          PAGE 2: MAIN HUB PAGE (ศูนย์รวมฟังก์ชัน)
          ============================================================ */}
      {currentPage === 'page-main-hub' && (
        <MainHubPage
          onBackToWelcome={() => navigateTo('page-welcome')}
          onNavigateToMapDashboard={() => navigateTo('page-map-dashboard')}
          onOpenRelativeSearch={() => handleOpenGlobalSearch(null)}
          onOpenCreateNeed={() => setIsCreateNeedOpen(true)}
          onOpenSOS={() => setIsSOSOpen(true)}
          shelters={shelters}
          needs={needs}
          safeZones={safeZones}
          clues={clues}
          households={households}
          currentOfficial={currentOfficial}
          onOfficialLoginSuccess={handleOfficialLoginSuccess}
          onOfficialLogout={handleOfficialLogout}
          onAddClue={handleAddClue}
          onUpvoteClue={handleUpvoteClue}
          onSelectSafeZoneOnMap={handleSelectSafeZoneOnMap}
          onDispatchNextPhase={handleDispatchNextPhase}
          isOnline={isOnline}
        />
      )}

      {/* ============================================================
          PAGE 3: MAP DASHBOARD PAGE (หน้ารอง - แผนที่เรียลไทม์)
          ============================================================ */}
      <section
        id="page-map-dashboard"
        className={`page-view flex-col h-screen w-screen overflow-hidden bg-stone-100 select-none ${
          currentPage === 'page-map-dashboard' ? 'flex' : 'hidden'
        }`}
      >
        {/* 1. Header with Back Button to Page 2 */}
        <Header
          onOpenSOS={() => setIsSOSOpen(true)}
          onOpenCreateNeed={() => setIsCreateNeedOpen(true)}
          onOpenGlobalSearch={() => handleOpenGlobalSearch(null)}
          onNavigateHome={() => navigateTo('page-main-hub')}
          onNavigateToHub={() => navigateTo('page-main-hub')}
        />

        {/* 2. Nearest Shelter Recommendation Alert Banner */}
        <div className="px-3 sm:px-4 pt-2 shrink-0">
          <NearestShelterBanner
            shelters={shelters}
            userLocation={userLocation}
            onSelectShelter={(shelter) => {
              setSelectedShelterId(shelter.id);
              setSelectedNeedId(null);
              setSelectedSafeZoneId(null);
              setMobileView('map');
            }}
            onRefreshGPS={refreshDeviceGPS}
            onUseUbonCityHall={setUserLocationToUbonCityHall}
          />
        </div>

        {/* 3. Mobile View Switcher & Relative Search Quick Bar */}
        <div className="flex sm:hidden px-3 pt-2 pb-1 gap-1.5 shrink-0">
          <button
            onClick={() => setMobileView('map')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
              mobileView === 'map'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200'
            }`}
          >
            <Map className="w-3.5 h-3.5" />
            <span>แผนที่สด</span>
          </button>

          <button
            onClick={() => setMobileView('list')}
            className={`flex-1 py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer ${
              mobileView === 'list'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-700 border border-stone-200'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            <span>รายการ ({needs.length + shelters.length})</span>
          </button>

          <button
            onClick={() => handleOpenGlobalSearch(null)}
            className="px-3 py-2 rounded-lg font-bold text-xs bg-blue-600 text-white flex items-center justify-center gap-1 shadow-xs cursor-pointer shrink-0"
          >
            <Users className="w-3.5 h-3.5" />
            <span>ตามหาญาติ</span>
          </button>
        </div>

        {/* 4. Main Body: Split View (Desktop) / Tabbed (Mobile) */}
        <div className="flex-1 flex overflow-hidden p-2 sm:p-4 gap-3">
          {/* Left Column: Feed & Tally */}
          <div
            className={`w-full sm:w-[420px] lg:w-[460px] h-full rounded-2xl overflow-hidden shadow-sm border border-stone-200 bg-white flex flex-col shrink-0 ${
              mobileView === 'list' ? 'flex' : 'hidden sm:flex'
            }`}
          >
            <DisasterFeed
              onClaimNeed={handleOpenClaim}
              onOpenCreateNeed={() => setIsCreateNeedOpen(true)}
              activeTab={feedTab}
              setActiveTab={setFeedTab}
              onOpenGlobalEvacueeSearch={() => handleOpenGlobalSearch(null)}
              onViewShelterEvacuees={(shelter) => handleOpenGlobalSearch(shelter.id)}
              safeZones={safeZones}
              clues={clues}
              onAddClue={handleAddClue}
              onUpvoteClue={handleUpvoteClue}
              onSelectSafeZoneOnMap={handleSelectSafeZoneOnMap}
            />
          </div>

          {/* Right Column: Leaflet Interactive Map */}
          <div
            className={`flex-1 h-full rounded-2xl overflow-hidden shadow-sm border border-stone-200 relative bg-stone-200 ${
              mobileView === 'map' ? 'flex' : 'hidden sm:flex'
            }`}
          >
            <DisasterMap
              needs={needs}
              shelters={shelters}
              safeZones={safeZones}
              userLocation={userLocation}
              selectedNeedId={selectedNeedId}
              selectedShelterId={selectedShelterId}
              selectedSafeZoneId={selectedSafeZoneId}
              onSelectNeed={(need) => {
                setSelectedNeedId(need.id);
                setSelectedShelterId(null);
                setSelectedSafeZoneId(null);
                if (need.status === 'pending') {
                  handleOpenClaim(need);
                }
              }}
              onSelectShelter={(shelter) => {
                setSelectedShelterId(shelter.id);
                setSelectedNeedId(null);
                setSelectedSafeZoneId(null);
              }}
              onSelectSafeZone={(zone) => {
                setSelectedSafeZoneId(zone.id);
                setSelectedNeedId(null);
                setSelectedShelterId(null);
              }}
              isLocationPicking={isLocationPicking}
              pickedLocation={pickedLocation}
              onPickLocation={handlePickLocation}
              filterShowNeeds={filterShowNeeds}
              filterShowShelters={filterShowShelters}
              filterShowSafeZones={filterShowSafeZones}
              lowBandwidthMode={lowBandwidthMode}
            />

            {/* Map Layer Filter Pills Overlay */}
            <div className="absolute top-3 left-3 z-20 flex flex-wrap items-center gap-1.5 bg-white/95 backdrop-blur-xs p-1.5 rounded-xl shadow-md border border-stone-200 text-xs">
              <span className="text-[11px] font-bold text-stone-500 px-1 flex items-center gap-1">
                <Filter className="w-3 h-3" /> ชั้นข้อมูล:
              </span>

              <button
                onClick={() => setFilterShowNeeds((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  filterShowNeeds
                    ? 'bg-orange-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-orange-400" />
                <span>ของขาด/รับจบ</span>
              </button>

              <button
                onClick={() => setFilterShowShelters((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  filterShowShelters
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                <span>ศูนย์พักพิง</span>
              </button>

              <button
                onClick={() => setFilterShowSafeZones((prev) => !prev)}
                className={`px-2.5 py-1 rounded-lg font-bold text-[11px] transition-all cursor-pointer flex items-center gap-1 ${
                  filterShowSafeZones
                    ? 'bg-teal-700 text-white shadow-xs'
                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                }`}
                title="จุดรอดชีวิตจากสถิติในอดีต (Historical Safe Zone)"
              >
                <ShieldCheck className="w-3 h-3 text-teal-300" />
                <span>จุดปลอดภัยในอดีต</span>
              </button>

              {/* Quick Trigger for Global Evacuee Search directly on map */}
              <button
                onClick={() => handleOpenGlobalSearch(null)}
                className="px-2.5 py-1 rounded-lg font-bold text-[11px] bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 flex items-center gap-1 cursor-pointer"
              >
                <Users className="w-3 h-3 text-blue-600" />
                <span>ตามหาญาติ</span>
              </button>
            </div>

            {/* Map Legend on Bottom Left */}
            <div className="absolute bottom-4 left-4 z-20 hidden md:flex items-center gap-2 bg-white/95 backdrop-blur-xs px-3 py-1.5 rounded-lg shadow-md border border-stone-200 text-[11px] font-medium text-stone-700">
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
                <span>ของขาด</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>รับจบ</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded bg-blue-600" />
                <span>ศูนย์พักพิง</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-600" />
                <span>จุดรอดชีวิต (Safe Zone)</span>
              </span>
            </div>

            {/* Bottom Right Floating Action for Moderator */}
            <button
              onClick={() => setIsAdminOpen(true)}
              title="ศูนย์ควบคุมและผู้ดูแลระบบ (Agency Moderator)"
              className="absolute bottom-4 right-18 z-20 bg-stone-900/90 hover:bg-stone-900 text-stone-200 hover:text-white px-3 py-2 rounded-xl shadow-lg border border-stone-700 text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Shield className="w-3.5 h-3.5 text-emerald-400" />
              <span className="hidden sm:inline">ผู้ดูแลระบบ/ปภ.</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. Modals */}
      <ClaimModal
        need={targetNeedToClaim}
        isOpen={isClaimModalOpen}
        onClose={() => {
          setIsClaimModalOpen(false);
          setTargetNeedToClaim(null);
        }}
        onConfirmClaim={(needId, donor) => {
          claimNeed(needId, donor);
        }}
        isOnline={isOnline}
      />

      <CreateNeedModal
        isOpen={isCreateNeedOpen}
        onClose={() => setIsCreateNeedOpen(false)}
        userLocation={userLocation}
        onSubmit={(newNeed) => {
          createNeed(newNeed);
          setMobileView('map');
        }}
        onStartPickLocation={handleStartPickLocation}
        pickedLocation={pickedLocation}
        isOnline={isOnline}
      />

      {/* Offline SOS Modal (SMS Fallback & Hotlines) */}
      <OfflineSOSModal
        isOpen={isSOSOpen}
        onClose={() => setIsSOSOpen(false)}
      />

      <AdminModeratorModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      {/* 6. Global Evacuee Search & Shelter Density Modal */}
      <GlobalEvacueeSearchModal
        isOpen={isEvacueeModalOpen}
        onClose={() => {
          setIsEvacueeModalOpen(false);
          setEvacueeModalShelterId(null);
        }}
        initialShelterFilterId={evacueeModalShelterId}
        onSelectShelterNav={(shelter) => {
          setSelectedShelterId(shelter.id);
          setSelectedNeedId(null);
          setSelectedSafeZoneId(null);
          setIsEvacueeModalOpen(false);
          setMobileView('map');
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <DisasterProvider>
      <MainLayout />
    </DisasterProvider>
  );
}

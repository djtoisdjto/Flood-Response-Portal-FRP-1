import React, { useState, useMemo } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { NeedCard } from './NeedCard';
import { ShelterCard } from './ShelterCard';
import { HistoricalSafeZonesView } from './HistoricalSafeZonesView';
import { CrowdsourcedCluesView } from './CrowdsourcedCluesView';
import { NeedItem, Shelter, NeedCategory } from '../types';
import { HistoricalSafeZone, CrowdsourcedClue } from '../types/disasterRelief';
import { CATEGORIES } from '../data/categories';
import {
  Search,
  CheckCircle2,
  Home,
  PackageOpen,
  Users,
  ShieldCheck,
  Radio
} from 'lucide-react';

interface DisasterFeedProps {
  onClaimNeed: (need: NeedItem) => void;
  onOpenCreateNeed: () => void;
  activeTab: 'all' | 'needs' | 'claimed' | 'shelters' | 'safezones' | 'clues';
  setActiveTab: (tab: 'all' | 'needs' | 'claimed' | 'shelters' | 'safezones' | 'clues') => void;
  onOpenGlobalEvacueeSearch: () => void;
  onViewShelterEvacuees: (shelter: Shelter) => void;
  safeZones: HistoricalSafeZone[];
  clues: CrowdsourcedClue[];
  onAddClue: (newClue: Omit<CrowdsourcedClue, 'id' | 'timestamp' | 'upvotes' | 'verified'>) => void;
  onUpvoteClue: (clueId: string) => void;
  onSelectSafeZoneOnMap?: (safeZone: HistoricalSafeZone) => void;
}

export const DisasterFeed: React.FC<DisasterFeedProps> = ({
  onClaimNeed,
  onOpenCreateNeed,
  activeTab,
  setActiveTab,
  onOpenGlobalEvacueeSearch,
  onViewShelterEvacuees,
  safeZones,
  clues,
  onAddClue,
  onUpvoteClue,
  onSelectSafeZoneOnMap,
}) => {
  const {
    needs,
    shelters,
    evacuees,
    userLocation,
    selectedNeedId,
    selectedShelterId,
    setSelectedNeedId,
    setSelectedShelterId,
    tallyShelter,
    completeNeed,
    isOnline,
  } = useDisaster();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedUrgency, setSelectedUrgency] = useState<string>('all');

  // Counts
  const pendingNeeds = useMemo(() => needs.filter((n) => n.status === 'pending'), [needs]);
  const claimedNeeds = useMemo(() => needs.filter((n) => n.status === 'claimed'), [needs]);
  const totalOccupancy = useMemo(
    () => shelters.reduce((sum, s) => sum + s.currentOccupancy, 0),
    [shelters]
  );
  const totalCapacity = useMemo(
    () => shelters.reduce((sum, s) => sum + s.maxCapacity, 0),
    [shelters]
  );

  // Filtered Needs
  const filteredNeeds = useMemo(() => {
    if (activeTab === 'shelters' || activeTab === 'safezones' || activeTab === 'clues') return [];

    return needs.filter((item) => {
      if (activeTab === 'needs' && item.status !== 'pending') return false;
      if (activeTab === 'claimed' && item.status !== 'claimed') return false;

      // Category filter
      if (selectedCategory !== 'all' && item.category !== selectedCategory) return false;

      // Urgency filter
      if (selectedUrgency !== 'all' && item.urgency !== selectedUrgency) return false;

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = item.title.toLowerCase().includes(query);
        const matchLoc = item.locationName.toLowerCase().includes(query);
        const matchItems = item.quantity.toLowerCase().includes(query);
        const matchReq = item.requesterName.toLowerCase().includes(query);
        if (!matchTitle && !matchLoc && !matchItems && !matchReq) return false;
      }

      return true;
    });
  }, [needs, activeTab, selectedCategory, selectedUrgency, searchQuery]);

  // Filtered Shelters
  const filteredShelters = useMemo(() => {
    if (activeTab === 'needs' || activeTab === 'claimed' || activeTab === 'safezones' || activeTab === 'clues') return [];

    return shelters.filter((shelter) => {
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = shelter.name.toLowerCase().includes(query);
        const matchAddr = shelter.address.toLowerCase().includes(query);
        if (!matchName && !matchAddr) return false;
      }
      return true;
    });
  }, [shelters, activeTab, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-stone-100/70 border-r border-stone-200">
      {/* 1. Quick Emergency Metric Bar */}
      <div className="bg-white p-2.5 sm:p-3 border-b border-stone-200 shrink-0">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-1.5 sm:p-2">
            <div className="text-[10px] sm:text-[11px] font-semibold text-orange-800">รอรับจบ (หมุดส้ม)</div>
            <div className="text-lg sm:text-xl font-black text-orange-600 leading-tight">
              {pendingNeeds.length}
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-1.5 sm:p-2">
            <div className="text-[10px] sm:text-[11px] font-semibold text-emerald-800">รับจบแล้ว (หมุดเขียว)</div>
            <div className="text-lg sm:text-xl font-black text-emerald-600 leading-tight">
              {claimedNeeds.length}
            </div>
          </div>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-1.5 sm:p-2">
            <div className="text-[10px] sm:text-[11px] font-semibold text-blue-800">ผู้พักพิงรวม</div>
            <div className="text-lg sm:text-xl font-black text-blue-700 leading-tight">
              {totalOccupancy}
              <span className="text-xs font-normal text-stone-500">/{totalCapacity}</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Navigation / Category Tabs */}
      <div className="bg-white px-3 pt-2 border-b border-stone-200 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none text-xs">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'all'
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
            }`}
          >
            ทั้งหมด ({needs.length + shelters.length})
          </button>

          <button
            onClick={() => setActiveTab('needs')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'needs'
                ? 'bg-orange-600 text-white shadow-xs'
                : 'bg-orange-50 hover:bg-orange-100 text-orange-800 border border-orange-200'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-orange-500" />
            <span>ของขาด ({pendingNeeds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('claimed')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'claimed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>รับจบแล้ว ({claimedNeeds.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('shelters')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'shelters'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-blue-50 hover:bg-blue-100 text-blue-800 border border-blue-200'
            }`}
          >
            <Home className="w-3.5 h-3.5" />
            <span>ศูนย์พักพิง ({shelters.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('safezones')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'safezones'
                ? 'bg-teal-700 text-white shadow-xs'
                : 'bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>จุดรอดชีวิต ({safeZones.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clues')}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-bold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'clues'
                ? 'bg-sky-700 text-white shadow-xs'
                : 'bg-sky-50 hover:bg-sky-100 text-sky-800 border border-sky-200'
            }`}
          >
            <Radio className="w-3.5 h-3.5" />
            <span>เบาะแส ({clues.length})</span>
          </button>
        </div>

        {/* Search & Filter Bar (Only shown for list view items) */}
        {activeTab !== 'safezones' && activeTab !== 'clues' && (
          <div className="py-2 flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="ค้นหาชื่อ, สิ่งของ, สถานที่ในอุบลฯ..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-hidden"
              />
            </div>

            {activeTab !== 'shelters' && (
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 text-stone-700 focus:outline-hidden"
              >
                <option value="all">ทุกหมวดหมู่</option>
                {(Object.keys(CATEGORIES) as NeedCategory[]).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIES[c].label}
                  </option>
                ))}
              </select>
            )}
          </div>
        )}
      </div>

      {/* 3. Scrollable List of Cards or Dedicated Views */}
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {activeTab === 'safezones' ? (
          <HistoricalSafeZonesView
            safeZones={safeZones}
            userLocation={userLocation}
            onSelectOnMap={onSelectSafeZoneOnMap}
          />
        ) : activeTab === 'clues' ? (
          <CrowdsourcedCluesView
            clues={clues}
            onAddClue={onAddClue}
            onUpvoteClue={onUpvoteClue}
            isOnline={isOnline}
          />
        ) : (
          <>
            {/* Render Needs */}
            {filteredNeeds.map((need) => (
              <NeedCard
                key={need.id}
                need={need}
                userLat={userLocation?.lat}
                userLng={userLocation?.lng}
                isSelected={selectedNeedId === need.id}
                onSelect={() => {
                  setSelectedNeedId(need.id);
                  setSelectedShelterId(null);
                }}
                onClaim={onClaimNeed}
                onComplete={completeNeed}
              />
            ))}

            {/* Render Shelters */}
            {filteredShelters.map((shelter) => {
              const count = evacuees.filter((e) => e.shelterId === shelter.id).length;
              return (
                <ShelterCard
                  key={shelter.id}
                  shelter={shelter}
                  userLat={userLocation?.lat}
                  userLng={userLocation?.lng}
                  isSelected={selectedShelterId === shelter.id}
                  onSelect={() => {
                    setSelectedShelterId(shelter.id);
                    setSelectedNeedId(null);
                  }}
                  onTally={tallyShelter}
                  onViewEvacuees={onViewShelterEvacuees}
                  evacueeCount={count}
                />
              );
            })}

            {filteredNeeds.length === 0 && filteredShelters.length === 0 && (
              <div className="py-12 text-center text-stone-500">
                <PackageOpen className="w-10 h-10 mx-auto text-stone-300 mb-2" />
                <p className="text-sm font-semibold">ไม่พบข้อมูลที่ตรงกับเงื่อนไข</p>
                <p className="text-xs text-stone-400 mt-1">ลองเปลี่ยนคำค้นหาหรือตัวกรองหมวดหมู่</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Mobile CTA floating bar */}
      <div className="p-3 bg-white border-t border-stone-200 sm:hidden">
        <button
          onClick={onOpenCreateNeed}
          className="w-full bg-orange-600 hover:bg-orange-500 active:scale-95 text-white font-bold text-xs py-2.5 rounded-xl shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
        >
          <span>+ โพสต์ขอความช่วยเหลือ (ของขาด)</span>
        </button>
      </div>
    </div>
  );
};

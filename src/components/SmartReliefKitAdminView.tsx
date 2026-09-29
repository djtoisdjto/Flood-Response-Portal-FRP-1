import React, { useState, useMemo } from 'react';
import { PhibunHousehold, SmartReliefKitItem } from '../types/smartReliefKit';
import { calculateTailoredReliefKit, calculateDistributionSchedule } from '../utils/reliefKitCalculator';
import {
  Package,
  Users,
  Baby,
  HeartPulse,
  Clock,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Send,
  Search,
  Filter,
  Layers,
  Sparkles,
  MapPin,
  ChevronRight,
  Info,
  PhoneCall,
  Printer,
  FileCheck
} from 'lucide-react';

interface SmartReliefKitAdminViewProps {
  households: PhibunHousehold[];
  onDispatchNextPhase: (householdId: string, daysDuration: number, officer: string) => void;
  onSelectHouseholdOnMap?: (household: PhibunHousehold) => void;
}

export const SmartReliefKitAdminView: React.FC<SmartReliefKitAdminViewProps> = ({
  households,
  onDispatchNextPhase,
  onSelectHouseholdOnMap,
}) => {
  const [selectedHouseholdId, setSelectedHouseholdId] = useState<string>(households[0]?.id || '');
  const [searchCommunity, setSearchCommunity] = useState<string>('');
  const [filterVulnerability, setFilterVulnerability] = useState<'all' | 'bedridden' | 'infants' | 'pregnant' | 'overdue'>('all');
  const [packTargetDays, setPackTargetDays] = useState<number>(4);
  const [dispatchOfficer, setDispatchOfficer] = useState<string>('ทีมกู้ภัยเทศบาลเมืองพิบูลฯ');
  const [isPackingModalOpen, setIsPackingModalOpen] = useState<boolean>(false);
  const [confirmToast, setConfirmToast] = useState<string | null>(null);

  // Selected Household Object
  const selectedHousehold = households.find((h) => h.id === selectedHouseholdId) || households[0];

  // Dynamic Calculation of Tailored Kit for the selected household
  const tailoredKit = useMemo(() => {
    if (!selectedHousehold) return [];
    return calculateTailoredReliefKit(selectedHousehold.demographics, packTargetDays);
  }, [selectedHousehold, packTargetDays]);

  // Overall Statistics for Phibun Pilot
  const stats = useMemo(() => {
    let totalPeople = 0;
    let bedriddenCount = 0;
    let infantsCount = 0;
    let pregnantCount = 0;
    let overdueCount = 0;

    households.forEach((h) => {
      totalPeople += h.demographics.totalMembers;
      bedriddenCount += h.demographics.bedriddenPatients;
      infantsCount += h.demographics.infantsAndToddlers;
      pregnantCount += h.demographics.pregnantWomen;

      const lastDist = h.distributionHistory[h.distributionHistory.length - 1];
      if (lastDist) {
        const sched = calculateDistributionSchedule(lastDist.distributedAt, h.demographics, lastDist.suppliesDurationDays);
        if (sched.isOverdue) overdueCount++;
      }
    });

    return { totalPeople, bedriddenCount, infantsCount, pregnantCount, overdueCount };
  }, [households]);

  // Filtered Household List
  const filteredHouseholds = households.filter((h) => {
    if (searchCommunity.trim()) {
      const q = searchCommunity.toLowerCase();
      const matchName = h.headOfHousehold.toLowerCase().includes(q);
      const matchComm = h.communityName.toLowerCase().includes(q);
      const matchNum = h.houseNumber.toLowerCase().includes(q);
      if (!matchName && !matchComm && !matchNum) return false;
    }

    if (filterVulnerability === 'bedridden') return h.demographics.bedriddenPatients > 0;
    if (filterVulnerability === 'infants') return h.demographics.infantsAndToddlers > 0;
    if (filterVulnerability === 'pregnant') return h.demographics.pregnantWomen > 0;
    if (filterVulnerability === 'overdue') {
      const lastDist = h.distributionHistory[h.distributionHistory.length - 1];
      if (!lastDist) return false;
      const sched = calculateDistributionSchedule(lastDist.distributedAt, h.demographics, lastDist.suppliesDurationDays);
      return sched.isOverdue;
    }

    return true;
  });

  const handleConfirmDispatch = () => {
    if (!selectedHousehold) return;
    onDispatchNextPhase(selectedHousehold.id, packTargetDays, dispatchOfficer);
    setIsPackingModalOpen(false);
    setConfirmToast(`บันทึกการจัดส่งถุงยังชีพ Phase ถัดไป ให้บ้าน ${selectedHousehold.headOfHousehold} เรียบร้อยแล้ว`);
    setTimeout(() => setConfirmToast(null), 4000);
  };

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {confirmToast && (
        <div className="bg-emerald-600 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-lg flex items-center justify-between animate-in fade-in duration-300">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            <span>{confirmToast}</span>
          </div>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-stone-900 text-white p-4 sm:p-5 rounded-2xl border border-stone-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-400/30 flex items-center justify-center text-orange-400 shrink-0">
              <Package className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Tailored Relief Kit &bull; Smart Distribution
                </span>
                <span className="text-stone-300 text-xs font-semibold">
                  พื้นที่นำร่อง: เทศบาลเมืองพิบูลมังสาหาร
                </span>
              </div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                ระบบจัดการถุงยังชีพอัจฉริยะรายครัวเรือน (Smart Relief Kit)
              </h2>
              <p className="text-xs text-stone-300 mt-0.5">
                ยกเลิก One-Size-Fits-All: คำนวณสิ่งของตามโครงสร้างประชากรจริง และแจ้งเตือนรอบแจกจ่ายก่อนของหมด
              </p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
            <div className="bg-stone-800/80 p-2 rounded-xl border border-stone-700">
              <div className="text-[10px] text-stone-400">ครัวเรือนในระบบ</div>
              <div className="text-base font-extrabold text-white">{households.length} หลัง</div>
            </div>
            <div className="bg-stone-800/80 p-2 rounded-xl border border-stone-700">
              <div className="text-[10px] text-rose-300">ผู้ป่วยติดเตียง</div>
              <div className="text-base font-extrabold text-rose-400">{stats.bedriddenCount} คน</div>
            </div>
            <div className="bg-stone-800/80 p-2 rounded-xl border border-stone-700">
              <div className="text-[10px] text-amber-300">เด็กเล็ก/ทารก</div>
              <div className="text-base font-extrabold text-amber-400">{stats.infantsCount} คน</div>
            </div>
            <div className="bg-stone-800/80 p-2 rounded-xl border border-stone-700">
              <div className="text-[10px] text-rose-300 font-bold">รอบแจกที่ถึงกำหนด</div>
              <div className="text-base font-extrabold text-rose-400">{stats.overdueCount} หลัง</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column Split: Households Selector & Tailored Kit Packing Sheet */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Left Column: Household Registry (4 Cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {/* Search & Filter Header */}
          <div className="p-3 border-b border-stone-200 space-y-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchCommunity}
                onChange={(e) => setSearchCommunity(e.target.value)}
                placeholder="ค้นหาชื่อเจ้าบ้าน, ชุมชน, บ้านเลขที่..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-hidden focus:border-orange-500"
              />
            </div>

            <div className="flex items-center gap-1 overflow-x-auto pb-1 text-[11px]">
              <button
                onClick={() => setFilterVulnerability('all')}
                className={`px-2 py-1 rounded-lg font-bold shrink-0 cursor-pointer ${
                  filterVulnerability === 'all'
                    ? 'bg-stone-900 text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                ทั้งหมด ({households.length})
              </button>
              <button
                onClick={() => setFilterVulnerability('bedridden')}
                className={`px-2 py-1 rounded-lg font-bold shrink-0 cursor-pointer ${
                  filterVulnerability === 'bedridden'
                    ? 'bg-rose-600 text-white'
                    : 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                }`}
              >
                ติดเตียง ({stats.bedriddenCount})
              </button>
              <button
                onClick={() => setFilterVulnerability('infants')}
                className={`px-2 py-1 rounded-lg font-bold shrink-0 cursor-pointer ${
                  filterVulnerability === 'infants'
                    ? 'bg-amber-600 text-white'
                    : 'bg-amber-50 text-amber-700 hover:bg-amber-100'
                }`}
              >
                เด็กเล็ก ({stats.infantsCount})
              </button>
              <button
                onClick={() => setFilterVulnerability('overdue')}
                className={`px-2 py-1 rounded-lg font-bold shrink-0 cursor-pointer ${
                  filterVulnerability === 'overdue'
                    ? 'bg-red-700 text-white'
                    : 'bg-red-50 text-red-700 hover:bg-red-100'
                }`}
              >
                ต้องส่งด่วน ({stats.overdueCount})
              </button>
            </div>
          </div>

          {/* Households List */}
          <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
            {filteredHouseholds.map((hh) => {
              const isSelected = hh.id === selectedHouseholdId;
              const lastDist = hh.distributionHistory[hh.distributionHistory.length - 1];
              const sched = lastDist
                ? calculateDistributionSchedule(lastDist.distributedAt, hh.demographics, lastDist.suppliesDurationDays)
                : null;

              return (
                <div
                  key={hh.id}
                  onClick={() => setSelectedHouseholdId(hh.id)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                    isSelected ? 'bg-orange-50/80 border-l-4 border-orange-600' : 'hover:bg-stone-50'
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-stone-900 truncate">
                        {hh.headOfHousehold}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-stone-100 text-stone-600 font-mono">
                        บ้านเลขที่ {hh.houseNumber}
                      </span>
                    </div>

                    <div className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{hh.communityName}</span>
                    </div>

                    {/* Vulnerability Tags */}
                    <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                      <span className="text-[10px] px-1.5 py-0.2 rounded bg-blue-50 text-blue-700 border border-blue-200">
                        สมาชิก {hh.demographics.totalMembers} คน
                      </span>

                      {hh.demographics.bedriddenPatients > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 border border-rose-200">
                          ติดเตียง {hh.demographics.bedriddenPatients}
                        </span>
                      )}

                      {hh.demographics.infantsAndToddlers > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          ทารก/เด็ก {hh.demographics.infantsAndToddlers}
                        </span>
                      )}

                      {hh.demographics.pregnantWomen > 0 && (
                        <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-pink-100 text-pink-800 border border-pink-200">
                          ตั้งครรภ์ {hh.demographics.pregnantWomen}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Distribution Status Badge */}
                  <div className="shrink-0 text-right">
                    {sched?.isOverdue ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200 animate-pulse">
                        <AlertTriangle className="w-3 h-3 text-red-600" />
                        <span>ของหมดแล้ว</span>
                      </span>
                    ) : sched?.urgencyStatus === 'warning_soon' ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        <Clock className="w-3 h-3 text-amber-600" />
                        <span>หมดใน 24 ชม.</span>
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        เหลืออีก ~{sched?.daysRemaining || 0} วัน
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Tailored Smart Kit Packing View (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col h-[650px] overflow-hidden">
          {selectedHousehold ? (
            <>
              {/* Household Summary Card Header */}
              <div className="p-4 bg-gradient-to-r from-stone-50 to-orange-50/50 border-b border-stone-200 shrink-0">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="bg-orange-600 text-white text-[10px] font-bold px-2 py-0.5 rounded">
                        Household ID: {selectedHousehold.id}
                      </span>
                      <span className="text-xs font-bold text-stone-700">
                        {selectedHousehold.communityName}
                      </span>
                    </div>

                    <h3 className="text-base font-extrabold text-stone-900 mt-1">
                      บ้าน {selectedHousehold.headOfHousehold} (บ้านเลขที่ {selectedHousehold.houseNumber})
                    </h3>
                    <p className="text-xs text-stone-600 mt-0.5 flex items-center gap-2">
                      <span>โทร: <strong>{selectedHousehold.phone}</strong></span>
                      <span>&bull;</span>
                      <span className="text-stone-500">{selectedHousehold.notes}</span>
                    </p>
                  </div>

                  {/* Days Selector */}
                  <div className="text-right shrink-0">
                    <span className="text-[11px] font-bold text-stone-600 block mb-1">
                      คำนวณสำหรับระยะเวลา:
                    </span>
                    <div className="inline-flex rounded-xl bg-white border border-stone-200 p-0.5 text-xs shadow-2xs">
                      {[3, 4, 7].map((days) => (
                        <button
                          key={days}
                          onClick={() => setPackTargetDays(days)}
                          className={`px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer ${
                            packTargetDays === days
                              ? 'bg-orange-600 text-white'
                              : 'text-stone-600 hover:bg-stone-100'
                          }`}
                        >
                          {days} วัน
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Demographics Breakdown Matrix */}
                <div className="mt-3 grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-xs">
                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <div className="text-[10px] text-stone-500">สมาชิกทั้งหมด</div>
                    <div className="font-extrabold text-stone-900">{selectedHousehold.demographics.totalMembers} คน</div>
                  </div>
                  <div className={`p-2 rounded-xl border ${selectedHousehold.demographics.infantsAndToddlers > 0 ? 'bg-amber-50 border-amber-300' : 'bg-white border-stone-200'}`}>
                    <div className="text-[10px] text-stone-500">ทารก/เด็กเล็ก</div>
                    <div className={`font-extrabold ${selectedHousehold.demographics.infantsAndToddlers > 0 ? 'text-amber-700' : 'text-stone-700'}`}>
                      {selectedHousehold.demographics.infantsAndToddlers} คน
                    </div>
                  </div>
                  <div className={`p-2 rounded-xl border ${selectedHousehold.demographics.bedriddenPatients > 0 ? 'bg-rose-50 border-rose-300' : 'bg-white border-stone-200'}`}>
                    <div className="text-[10px] text-stone-500">ผู้ป่วยติดเตียง</div>
                    <div className={`font-extrabold ${selectedHousehold.demographics.bedriddenPatients > 0 ? 'text-rose-700' : 'text-stone-700'}`}>
                      {selectedHousehold.demographics.bedriddenPatients} คน
                    </div>
                  </div>
                  <div className={`p-2 rounded-xl border ${selectedHousehold.demographics.pregnantWomen > 0 ? 'bg-pink-50 border-pink-300' : 'bg-white border-stone-200'}`}>
                    <div className="text-[10px] text-stone-500">สตรีมีครรภ์</div>
                    <div className={`font-extrabold ${selectedHousehold.demographics.pregnantWomen > 0 ? 'text-pink-700' : 'text-stone-700'}`}>
                      {selectedHousehold.demographics.pregnantWomen} คน
                    </div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <div className="text-[10px] text-stone-500">หญิงเจริญพันธุ์</div>
                    <div className="font-extrabold text-stone-900">{selectedHousehold.demographics.womenReproductiveAge} คน</div>
                  </div>
                  <div className="bg-white p-2 rounded-xl border border-stone-200">
                    <div className="text-[10px] text-stone-500">ผู้สูงอายุ (60+)</div>
                    <div className="font-extrabold text-stone-900">{selectedHousehold.demographics.elderly} คน</div>
                  </div>
                </div>
              </div>

              {/* Tailored Kit Items List */}
              <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-700 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-orange-600" />
                    <span>รายการสิ่งของที่ต้องจัดลงถุงยังชีพของบ้านนี้ ({tailoredKit.length} รายการ):</span>
                  </span>
                  <span className="text-[11px] text-stone-500">
                    คำนวณตามประชากร {selectedHousehold.demographics.totalMembers} คน / {packTargetDays} วัน
                  </span>
                </div>

                <div className="space-y-2">
                  {tailoredKit.map((item, idx) => (
                    <div
                      key={item.itemId}
                      className={`p-3 rounded-xl border transition-all flex items-start justify-between gap-3 text-xs ${
                        item.isSpecialNeed
                          ? 'bg-amber-50/70 border-amber-300 shadow-2xs'
                          : 'bg-stone-50/70 border-stone-200'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-stone-200 text-stone-700 font-bold flex items-center justify-center text-[10px] shrink-0">
                            {idx + 1}
                          </span>
                          <span className="font-bold text-stone-900 text-xs">
                            {item.name}
                          </span>
                          {item.isSpecialNeed && (
                            <span className="text-[9px] font-extrabold px-1.5 py-0.2 rounded bg-amber-500 text-white uppercase">
                              จัดเฉพาะกลุ่ม
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-stone-500 mt-1 pl-7 leading-relaxed">
                          {item.reason}
                        </p>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-base font-extrabold text-orange-600 font-mono">
                          {item.quantity} <span className="text-xs font-normal text-stone-600">{item.unit}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Bottom Bar */}
              <div className="p-3.5 bg-stone-50 border-t border-stone-200 flex items-center justify-between gap-2 shrink-0">
                <div className="text-xs text-stone-600">
                  <span>ประวัติส่งแล้ว: <strong>{selectedHousehold.distributionHistory.length} รอบ</strong></span>
                  {selectedHousehold.distributionHistory.length > 0 && (
                    <span className="text-stone-400 ml-2">
                      (รอบล่าสุด {new Date(selectedHousehold.distributionHistory[selectedHousehold.distributionHistory.length - 1].distributedAt).toLocaleDateString('th-TH')})
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPackingModalOpen(true)}
                    className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1.5 shadow-md transition-all cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>บันทึกส่งถุงยังชีพรอบใหม่ (Phase {selectedHousehold.distributionHistory.length + 1})</span>
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 text-center text-stone-400">
              กรุณาเลือกครัวเรือนจากรายการด้านซ้าย
            </div>
          )}
        </div>
      </div>

      {/* Confirmation Modal */}
      {isPackingModalOpen && selectedHousehold && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl border border-stone-200 overflow-hidden text-xs">
            <div className="bg-orange-600 text-white p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileCheck className="w-5 h-5 text-white" />
                <h3 className="text-base font-bold">ยืนยันการจัดส่งถุงยังชีพอัจฉริยะ</h3>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div className="bg-stone-50 p-3 rounded-xl border border-stone-200 space-y-1">
                <div><strong>ผู้รับ:</strong> {selectedHousehold.headOfHousehold} (บ้านเลขที่ {selectedHousehold.houseNumber})</div>
                <div><strong>ชุมชน:</strong> {selectedHousehold.communityName}</div>
                <div><strong>จำนวนสมาชิก:</strong> {selectedHousehold.demographics.totalMembers} คน (เด็ก {selectedHousehold.demographics.infantsAndToddlers}, ติดเตียง {selectedHousehold.demographics.bedriddenPatients})</div>
                <div><strong>รองรับการดำรงชีพ:</strong> {packTargetDays} วัน (รวม {tailoredKit.length} รายการ)</div>
              </div>

              <div>
                <label className="block text-stone-700 font-bold mb-1">เจ้าหน้าที่/ทีมผู้รับผิดชอบการแจก:</label>
                <input
                  type="text"
                  value={dispatchOfficer}
                  onChange={(e) => setDispatchOfficer(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <p className="text-[11px] text-stone-500">
                เมื่อกดบันทึก ระบบจะเริ่มนับเวลาถอยหลัง {packTargetDays} วัน และจะแจ้งเตือนเจ้าหน้าที่ล่วงหน้า 24 ชม. ก่อนสิ่งของจะหมดเพื่อเข้าแจกจ่ายรอบต่อไป
              </p>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPackingModalOpen(false)}
                  className="px-3 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDispatch}
                  className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold cursor-pointer"
                >
                  ยืนยันบันทึกการส่ง
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

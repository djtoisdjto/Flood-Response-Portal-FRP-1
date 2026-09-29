import React, { useState, useMemo } from 'react';
import { useDisaster } from '../context/DisasterContext';
import { Evacuee, Shelter } from '../types';
import { calculateDistanceKm, formatDistance, getGoogleMapsNavUrl } from '../utils/distance';
import {
  Search,
  Users,
  UserCheck,
  MapPin,
  Phone,
  X,
  Plus,
  HeartPulse,
  Navigation,
  CheckCircle2,
  Building2,
  AlertCircle,
  Clock,
  Home,
  UserPlus
} from 'lucide-react';

interface GlobalEvacueeSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialShelterFilterId?: string | null;
  onSelectShelterNav: (shelter: Shelter) => void;
}

export const GlobalEvacueeSearchModal: React.FC<GlobalEvacueeSearchModalProps> = ({
  isOpen,
  onClose,
  initialShelterFilterId,
  onSelectShelterNav,
}) => {
  const { evacuees, shelters, addEvacuee, userLocation } = useDisaster();

  const [activeSubTab, setActiveSubTab] = useState<'search' | 'density' | 'register'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedShelterFilter, setSelectedShelterFilter] = useState<string>(
    initialShelterFilterId || 'all'
  );

  // Registration form state
  const [regName, setRegName] = useState('');
  const [regAge, setRegAge] = useState('');
  const [regGender, setRegGender] = useState<'male' | 'female' | 'other'>('male');
  const [regShelterId, setRegShelterId] = useState<string>(
    initialShelterFilterId || (shelters[0]?.id || '')
  );
  const [regVillage, setRegVillage] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regRelative, setRegRelative] = useState('');
  const [regNotes, setRegNotes] = useState('');
  const [regSuccess, setRegSuccess] = useState(false);

  // Sync initial shelter filter if prop changes
  React.useEffect(() => {
    if (initialShelterFilterId) {
      setSelectedShelterFilter(initialShelterFilterId);
      setRegShelterId(initialShelterFilterId);
    }
  }, [initialShelterFilterId]);

  // Filtered Evacuees
  const filteredEvacuees = useMemo(() => {
    return evacuees.filter((e) => {
      // Shelter filter
      if (selectedShelterFilter !== 'all' && e.shelterId !== selectedShelterFilter) {
        return false;
      }
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = e.name.toLowerCase().includes(query);
        const matchVillage = e.originalVillage.toLowerCase().includes(query);
        const matchShelter = (e.shelterName || '').toLowerCase().includes(query);
        const matchRelative = (e.relativeContact || '').toLowerCase().includes(query);
        const matchPhone = (e.contactPhone || '').includes(query);
        if (!matchName && !matchVillage && !matchShelter && !matchRelative && !matchPhone) {
          return false;
        }
      }
      return true;
    });
  }, [evacuees, selectedShelterFilter, searchQuery]);

  if (!isOpen) return null;

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName.trim() || !regShelterId) return;

    addEvacuee({
      name: regName.trim(),
      age: regAge ? parseInt(regAge, 10) : undefined,
      gender: regGender,
      shelterId: regShelterId,
      originalVillage: regVillage.trim() || 'อ.เมืองอุบลราชธานี/วารินชำราบ',
      status: 'safe',
      contactPhone: regPhone.trim() || undefined,
      relativeContact: regRelative.trim() || undefined,
      notes: regNotes.trim() || undefined,
    });

    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setActiveSubTab('search');
      setRegName('');
      setRegAge('');
      setRegVillage('');
      setRegPhone('');
      setRegRelative('');
      setRegNotes('');
    }, 1200);
  };

  const getShelterById = (id: string) => shelters.find((s) => s.id === id);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/65 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-stone-900 text-white p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white font-bold">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold">ระบบตามหาญาติ &amp; รายชื่อผู้ประสบภัย (อุบลฯ)</h2>
                <span className="text-[10px] bg-blue-900 text-blue-200 px-2 py-0.5 rounded border border-blue-700 font-semibold">
                  Global Search
                </span>
              </div>
              <p className="text-xs text-stone-400">
                ค้นหารายชื่อข้ามศูนย์พักพิงทุกแห่งในจังหวัดอุบลราชธานี หรือตรวจสอบความหนาแน่นศูนย์
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-stone-800 text-stone-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-Tab Navigation Bar */}
        <div className="bg-stone-100 px-4 py-2 border-b border-stone-200 flex items-center justify-between gap-2 flex-wrap shrink-0">
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveSubTab('search')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'search'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>ค้นหาบุคคล ({evacuees.length})</span>
            </button>

            <button
              onClick={() => setActiveSubTab('density')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeSubTab === 'density'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-stone-700 hover:bg-stone-200 border border-stone-200'
              }`}
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>ความหนาแน่นศูนย์ ({shelters.length})</span>
            </button>
          </div>

          <button
            onClick={() => setActiveSubTab('register')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeSubTab === 'register'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>+ ลงทะเบียนผู้พักพิง</span>
          </button>
        </div>

        {/* TAB 1: Global Search & List View */}
        {activeSubTab === 'search' && (
          <div className="flex-1 overflow-hidden flex flex-col">
            {/* Prominent Search Bar */}
            <div className="p-3 sm:p-4 bg-white border-b border-stone-200 space-y-2 shrink-0">
              <div className="relative">
                <Search className="w-4 h-4 text-blue-600 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  autoFocus
                  placeholder="พิมพ์ชื่อ-นามสกุล, ชุมชนเดิม (เช่น ท่ากอไผ่, วังแดง, เกตุแก้ว) หรือเบอร์โทร..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-8 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs"
                  >
                    ล้าง
                  </button>
                )}
              </div>

              {/* Shelter filter chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
                <span className="text-[11px] font-bold text-stone-500 shrink-0">กรองตามศูนย์:</span>
                <button
                  onClick={() => setSelectedShelterFilter('all')}
                  className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 cursor-pointer ${
                    selectedShelterFilter === 'all'
                      ? 'bg-stone-800 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  ทุกศูนย์ ({evacuees.length})
                </button>
                {shelters.map((s) => {
                  const countInShelter = evacuees.filter((e) => e.shelterId === s.id).length;
                  const isSelected = selectedShelterFilter === s.id;
                  return (
                    <button
                      key={s.id}
                      onClick={() => setSelectedShelterFilter(s.id)}
                      className={`px-2.5 py-1 rounded-md text-xs font-semibold shrink-0 cursor-pointer truncate max-w-[200px] ${
                        isSelected
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'bg-stone-100 text-stone-700 hover:bg-stone-200'
                      }`}
                    >
                      {s.name} ({countInShelter})
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Evacuee Results List */}
            <div className="flex-1 overflow-y-auto p-3 sm:p-4 space-y-2.5 bg-stone-50">
              {filteredEvacuees.length > 0 ? (
                filteredEvacuees.map((evacuee) => {
                  const shelter = getShelterById(evacuee.shelterId);
                  const distanceKm =
                    userLocation && shelter
                      ? calculateDistanceKm(userLocation.lat, userLocation.lng, shelter.lat, shelter.lng)
                      : null;

                  return (
                    <div
                      key={evacuee.id}
                      className="bg-white p-3.5 rounded-xl border border-stone-200 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                    >
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="font-extrabold text-sm sm:text-base text-stone-900">
                            {evacuee.name}
                          </span>
                          {evacuee.age && (
                            <span className="text-xs text-stone-500 font-medium">
                              (อายุ {evacuee.age} ปี)
                            </span>
                          )}
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>ปลอดภัยแล้ว</span>
                          </span>
                          {evacuee.status === 'medical_attention' && (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-800 border border-rose-200">
                              <HeartPulse className="w-3 h-3 text-rose-600" />
                              <span>รับการดูแลพยาบาล</span>
                            </span>
                          )}
                        </div>

                        {/* Location of current shelter & origin village */}
                        <div className="text-xs text-stone-600 space-y-0.5">
                          <div className="flex items-center gap-1 text-blue-900 font-semibold">
                            <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                            <span>ศูนย์พักพิงปัจจุบัน:</span>
                            <span className="text-blue-700 underline font-bold">
                              {evacuee.shelterName || (shelter ? shelter.name : 'ศูนย์พักพิง')}
                            </span>
                            {distanceKm !== null && (
                              <span className="text-blue-500 text-[11px] font-normal">
                                ({formatDistance(distanceKm)})
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1 text-stone-500">
                            <Home className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                            <span>ภูมิลำเนาเดิม: {evacuee.originalVillage}</span>
                          </div>

                          {evacuee.relativeContact && (
                            <div className="text-stone-700 italic text-[11px] mt-1 bg-stone-50 p-1.5 rounded border border-stone-200/60">
                              <strong>ข้อมูลติดต่อญาติ:</strong> {evacuee.relativeContact}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Right Action buttons */}
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                        {evacuee.contactPhone && (
                          <a
                            href={`tel:${evacuee.contactPhone}`}
                            className="text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 px-2.5 py-1.5 rounded-lg border border-stone-300 flex items-center gap-1"
                          >
                            <Phone className="w-3.5 h-3.5 text-stone-600" />
                            <span>โทร</span>
                          </a>
                        )}

                        {shelter && (
                          <a
                            href={getGoogleMapsNavUrl(shelter.lat, shelter.lng, shelter.name)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1"
                          >
                            <Navigation className="w-3.5 h-3.5" />
                            <span>นำทางไปศูนย์</span>
                          </a>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-12 text-center text-stone-500">
                  <UserCheck className="w-12 h-12 mx-auto text-stone-300 mb-2" />
                  <p className="text-sm font-bold text-stone-700">ไม่พบรายชื่อที่ค้นหา</p>
                  <p className="text-xs text-stone-400 mt-1 max-w-sm mx-auto">
                    หากไม่พบชื่อ สามารถกดปุ่ม &ldquo;+ ลงทะเบียนผู้พักพิง&rdquo; ด้านบน เพื่อเพิ่มชื่อเข้าระบบได้ทันที
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: Shelter Density View (Overview of all shelters in Ubon) */}
        {activeSubTab === 'density' && (
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-50">
            <div className="bg-blue-50 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 mb-2">
              💡 <strong>ระบบมอนิเตอร์ความหนาแน่น:</strong> แสดงภาพรวมศูนย์พักพิงทั้งหมดในจังหวัดอุบลราชธานี เพื่อกระจายผู้อพยพไปยังศูนย์ที่ยังมีที่ว่าง (<span className="text-emerald-700 font-bold">สีเขียว &lt;70%</span>) หลีกเลี่ยงศูนย์ที่เต็มแล้ว (<span className="text-rose-700 font-bold">สีแดง &gt;90%</span>)
            </div>

            {shelters.map((shelter) => {
              const percent = Math.round((shelter.currentOccupancy / shelter.maxCapacity) * 100);
              const remaining = Math.max(0, shelter.maxCapacity - shelter.currentOccupancy);
              const distanceKm =
                userLocation
                  ? calculateDistanceKm(userLocation.lat, userLocation.lng, shelter.lat, shelter.lng)
                  : null;

              let densityColor = 'bg-emerald-500';
              let densityBadge = 'bg-emerald-50 text-emerald-800 border-emerald-300';
              let densityText = '🟢 มีที่ว่างมาก (<70%)';

              if (percent >= 90) {
                densityColor = 'bg-rose-500';
                densityBadge = 'bg-rose-50 text-rose-800 border-rose-300';
                densityText = '🔴 เต็ม/เกือบเต็ม (>90%)';
              } else if (percent >= 70) {
                densityColor = 'bg-amber-500';
                densityBadge = 'bg-amber-50 text-amber-800 border-amber-300';
                densityText = '🟡 เริ่มหนาแน่น (70-90%)';
              }

              const countRegistered = evacuees.filter((e) => e.shelterId === shelter.id).length;

              return (
                <div
                  key={shelter.id}
                  className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-sm font-bold text-stone-900">{shelter.name}</h4>
                      <p className="text-xs text-stone-500 mt-0.5 flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-stone-400" />
                        <span>{shelter.address}</span>
                        {distanceKm !== null && (
                          <span className="text-blue-600 font-semibold">
                            ({formatDistance(distanceKm)})
                          </span>
                        )}
                      </p>
                    </div>

                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${densityBadge}`}>
                      {densityText}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-2 mb-2">
                    <div className="flex items-center justify-between text-xs mb-1 font-medium text-stone-700">
                      <span>
                        ผู้พักพิง: <strong>{shelter.currentOccupancy}</strong> / {shelter.maxCapacity} คน
                      </span>
                      <span>{percent}%</span>
                    </div>
                    <div className="w-full bg-stone-100 rounded-full h-3 overflow-hidden border border-stone-200">
                      <div
                        className={`h-3 rounded-full transition-all duration-300 ${densityColor}`}
                        style={{ width: `${Math.min(100, percent)}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1">
                      <span>
                        {remaining > 0 ? (
                          <span className="text-emerald-700 font-semibold">
                            ว่างอีก {remaining} ที่
                          </span>
                        ) : (
                          <span className="text-rose-700 font-bold">เต็มพิกัดแล้ว</span>
                        )}
                      </span>
                      <span>ลงทะเบียนในระบบแล้ว {countRegistered} คน</span>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2 flex-wrap">
                    <button
                      onClick={() => {
                        setSelectedShelterFilter(shelter.id);
                        setActiveSubTab('search');
                      }}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>ดูรายชื่อ {countRegistered} คนในศูนย์นี้ &rarr;</span>
                    </button>

                    <div className="flex items-center gap-2">
                      <a
                        href={getGoogleMapsNavUrl(shelter.lat, shelter.lng, shelter.name)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg shadow-xs flex items-center gap-1"
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        <span>นำทาง</span>
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: Register Evacuee Form */}
        {activeSubTab === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-stone-50 text-xs">
            {regSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl text-emerald-800 font-bold flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>ลงทะเบียนผู้พักพิงสำเร็จ! กำลังกลับไปหน้ารายชื่อ...</span>
              </div>
            )}

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                ชื่อ - นามสกุล ผู้ประสบภัย <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="เช่น นายสมบูรณ์ ทองดี"
                value={regName}
                onChange={(e) => setRegName(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">อายุ (ปี)</label>
                <input
                  type="number"
                  placeholder="เช่น 45"
                  value={regAge}
                  onChange={(e) => setRegAge(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">เพศ</label>
                <select
                  value={regGender}
                  onChange={(e) => setRegGender(e.target.value as any)}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="male">ชาย</option>
                  <option value="female">หญิง</option>
                  <option value="other">อื่นๆ</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                ศูนย์พักพิงที่เข้าพัก <span className="text-rose-500">*</span>
              </label>
              <select
                value={regShelterId}
                onChange={(e) => setRegShelterId(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {shelters.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.district}) - พักอยู่ {s.currentOccupancy}/{s.maxCapacity}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">
                ชุมชน / ภูมิลำเนาเดิมที่ถูกน้ำท่วม
              </label>
              <input
                type="text"
                placeholder="เช่น ชุมชนท่ากอไผ่ อ.วารินชำราบ, ชุมชนวังแดง ต.ในเมือง"
                value={regVillage}
                onChange={(e) => setRegVillage(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-stone-700 mb-1">เบอร์โทรศัพท์ผู้ประสบภัย</label>
                <input
                  type="tel"
                  placeholder="เช่น 081-234-5678"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-stone-700 mb-1">ชื่อและเบอร์ติดต่อญาติ</label>
                <input
                  type="text"
                  placeholder="เช่น ลูกสาวชื่อ กานดา โทร 089-xxx-xxxx"
                  value={regRelative}
                  onChange={(e) => setRegRelative(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-bold text-stone-700 mb-1">หมายเหตุ / โรคประจำตัว / ข้อควรระวัง</label>
              <input
                type="text"
                placeholder="เช่น ความดันสูง, มีสัตว์เลี้ยงสุนัข 1 ตัว, ต้องใช้รถเข็น"
                value={regNotes}
                onChange={(e) => setRegNotes(e.target.value)}
                className="w-full px-3 py-2 text-sm bg-white border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setActiveSubTab('search')}
                className="px-4 py-2 text-stone-600 hover:bg-stone-200 rounded-lg font-semibold"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm"
              >
                บันทึกลงทะเบียนผู้พักพิง
              </button>
            </div>
          </form>
        )}

        {/* Modal Footer */}
        <div className="p-3 bg-stone-100 border-t border-stone-200 flex items-center justify-between text-xs text-stone-600 shrink-0">
          <span className="text-[11px] text-stone-500">
            ระบบซิงค์ข้อมูลตามหาญาติแบบเรียลไทม์ &bull; รองรับการทำงานออฟไลน์
          </span>
          <button
            onClick={onClose}
            className="px-3 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-lg font-semibold text-stone-700 cursor-pointer"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
};

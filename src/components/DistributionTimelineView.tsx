import React, { useState } from 'react';
import { PhibunHousehold } from '../types/smartReliefKit';
import { calculateDistributionSchedule } from '../utils/reliefKitCalculator';
import {
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle2,
  MapPin,
  ChevronRight,
  TrendingDown,
  Sparkles,
  Send,
  Users,
  Search,
  Filter
} from 'lucide-react';

interface DistributionTimelineProps {
  households: PhibunHousehold[];
  onSelectHousehold: (householdId: string) => void;
  onDispatchNextPhase: (householdId: string, daysDuration: number, officer: string) => void;
}

export const DistributionTimelineView: React.FC<DistributionTimelineProps> = ({
  households,
  onSelectHousehold,
  onDispatchNextPhase,
}) => {
  const [filterPeriod, setFilterPeriod] = useState<'all' | 'overdue' | 'due_24h' | 'due_3d'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Process timeline records
  const timelineItems = households.map((hh) => {
    const lastDist = hh.distributionHistory[hh.distributionHistory.length - 1];
    const sched = lastDist
      ? calculateDistributionSchedule(lastDist.distributedAt, hh.demographics, lastDist.suppliesDurationDays)
      : null;

    return {
      household: hh,
      lastDist,
      sched,
      nextDeliveryDate: sched ? new Date(sched.nextScheduledDeliveryDate) : null,
      depletionDate: sched ? new Date(sched.depletionDate) : null,
    };
  });

  // Sort by earliest depletion date
  const sorted = timelineItems.sort((a, b) => {
    if (!a.depletionDate) return 1;
    if (!b.depletionDate) return -1;
    return a.depletionDate.getTime() - b.depletionDate.getTime();
  });

  const filtered = sorted.filter((item) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = item.household.headOfHousehold.toLowerCase().includes(q);
      const matchComm = item.household.communityName.toLowerCase().includes(q);
      if (!matchName && !matchComm) return false;
    }

    if (filterPeriod === 'overdue') return item.sched?.isOverdue;
    if (filterPeriod === 'due_24h') return item.sched?.urgencyStatus === 'warning_soon';
    if (filterPeriod === 'due_3d') return (item.sched?.daysRemaining || 0) <= 3 && !item.sched?.isOverdue;
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Overview Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 sm:p-5 rounded-2xl border border-indigo-800 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0">
              <Calendar className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-indigo-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                  Distribution Timeline & Forecasting
                </span>
                <span className="text-indigo-200 text-xs font-semibold">
                  เทศบาลเมืองพิบูลมังสาหาร
                </span>
              </div>
              <h3 className="text-lg sm:text-xl font-extrabold text-white mt-0.5">
                ปฏิทินและไทม์ไลน์แจ้งเตือนรอบแจกจ่ายถุงยังชีพ
              </h3>
              <p className="text-xs text-indigo-100/90 mt-0.5 leading-relaxed">
                ระบบคำนวณอัตราการบริโภครายวัน และส่งสัญญาณเตือนล่วงหน้า 24 ชม. ก่อนถุงยังชีพหมด เพื่อป้องกันภาวะขาดแคลนอาหาร
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-2 items-center justify-between">
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 text-xs">
          <button
            onClick={() => setFilterPeriod('all')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              filterPeriod === 'all'
                ? 'bg-stone-900 text-white'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
            }`}
          >
            ทั้งหมด ({households.length})
          </button>
          <button
            onClick={() => setFilterPeriod('overdue')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              filterPeriod === 'overdue'
                ? 'bg-red-700 text-white'
                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            }`}
          >
            เลยกำหนดแจก / ของหมด
          </button>
          <button
            onClick={() => setFilterPeriod('due_24h')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              filterPeriod === 'due_24h'
                ? 'bg-amber-600 text-white'
                : 'bg-amber-50 text-amber-800 border border-amber-200 hover:bg-amber-100'
            }`}
          >
            ต้องแจกภายใน 24 ชม.
          </button>
          <button
            onClick={() => setFilterPeriod('due_3d')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-colors cursor-pointer shrink-0 ${
              filterPeriod === 'due_3d'
                ? 'bg-blue-600 text-white'
                : 'bg-blue-50 text-blue-800 border border-blue-200 hover:bg-blue-100'
            }`}
          >
            เตรียมของใน 3 วัน
          </button>
        </div>

        <div className="relative w-full sm:w-64 text-xs">
          <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ, ชุมชน..."
            className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-xl focus:outline-hidden focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Timeline Stream */}
      <div className="space-y-3">
        {filtered.map((item, index) => {
          const hh = item.household;
          const sched = item.sched;
          const isOverdue = sched?.isOverdue;
          const isWarning = sched?.urgencyStatus === 'warning_soon';

          return (
            <div
              key={hh.id}
              className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                isOverdue
                  ? 'bg-red-50/80 border-red-300 shadow-xs'
                  : isWarning
                  ? 'bg-amber-50/80 border-amber-300 shadow-xs'
                  : 'bg-white border-stone-200 hover:border-indigo-300'
              }`}
            >
              {/* Left Info */}
              <div className="flex items-start gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    isOverdue
                      ? 'bg-red-600 text-white'
                      : isWarning
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-100 text-stone-700'
                  }`}
                >
                  {isOverdue ? (
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                  ) : (
                    <Clock className="w-5 h-5" />
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-extrabold text-stone-900 truncate">
                      บ้าน {hh.headOfHousehold} (บ้านเลขที่ {hh.houseNumber})
                    </h4>
                    <span className="text-[11px] text-stone-500">
                      &bull; {hh.communityName}
                    </span>
                    {isOverdue && (
                      <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-red-600 text-white animate-pulse">
                        ของหมดแล้ว ต้องส่งทันที!
                      </span>
                    )}
                    {isWarning && (
                      <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-amber-500 text-white">
                        ของใกล้หมด (ภายใน 24 ชม.)
                      </span>
                    )}
                  </div>

                  <div className="mt-1 flex items-center gap-2 text-xs text-stone-600 flex-wrap">
                    <span>สมาชิก <strong>{hh.demographics.totalMembers} คน</strong></span>
                    {hh.demographics.bedriddenPatients > 0 && (
                      <span className="text-rose-700 font-bold">&bull; ติดเตียง {hh.demographics.bedriddenPatients} คน</span>
                    )}
                    {hh.demographics.infantsAndToddlers > 0 && (
                      <span className="text-amber-700 font-bold">&bull; ทารก {hh.demographics.infantsAndToddlers} คน</span>
                    )}
                    {hh.demographics.pregnantWomen > 0 && (
                      <span className="text-pink-700 font-bold">&bull; สตรีมีครรภ์ {hh.demographics.pregnantWomen} คน</span>
                    )}
                  </div>

                  {/* Delivery & Depletion Dates */}
                  <div className="mt-1.5 text-[11px] text-stone-500 flex items-center gap-3 flex-wrap">
                    <span>
                      แจกรอบล่าสุด (Phase {hh.distributionHistory.length}):{' '}
                      <strong>
                        {item.lastDist ? new Date(item.lastDist.distributedAt).toLocaleDateString('th-TH') : '-'}
                      </strong>
                    </span>
                    <span>
                      คาดว่าของจะหมดใน:{' '}
                      <strong className={isOverdue ? 'text-red-700 font-extrabold' : 'text-stone-800'}>
                        {item.depletionDate ? item.depletionDate.toLocaleDateString('th-TH') : '-'} (~{sched?.daysRemaining || 0} วัน)
                      </strong>
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Action Buttons */}
              <div className="flex items-center gap-2 shrink-0 self-end sm:self-auto">
                <button
                  onClick={() => onSelectHousehold(hh.id)}
                  className="px-3 py-1.5 rounded-xl bg-white border border-stone-200 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition-colors cursor-pointer"
                >
                  ดูสิ่งของที่ต้องแพ็ก
                </button>

                <button
                  onClick={() => onDispatchNextPhase(hh.id, 4, 'ทีมกู้ภัยเทศบาลเมืองพิบูลฯ')}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-600 hover:bg-orange-700 active:scale-95 text-white font-bold text-xs flex items-center gap-1 shadow-sm transition-all cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>บันทึกส่งรอบถัดไป</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

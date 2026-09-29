import React from 'react';
import { useDisaster } from '../context/DisasterContext';
import { ShieldCheck, Download, RefreshCw, X, FileSpreadsheet, AlertTriangle } from 'lucide-react';

interface AdminModeratorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminModeratorModal: React.FC<AdminModeratorModalProps> = ({ isOpen, onClose }) => {
  const { needs, shelters, resetToDefaultData, offlineQueue } = useDisaster();

  if (!isOpen) return null;

  const handleExportCSV = () => {
    // Generate simple CSV for needs
    const headers = ['ID', 'Title', 'Category', 'Urgency', 'Status', 'Quantity', 'Location', 'Requester', 'Phone', 'ClaimedBy', 'ClaimerPhone', 'CreatedAt'];
    const rows = needs.map((n) => [
      n.id,
      `"${n.title.replace(/"/g, '""')}"`,
      n.category,
      n.urgency,
      n.status,
      `"${n.quantity.replace(/"/g, '""')}"`,
      `"${n.locationName.replace(/"/g, '""')}"`,
      `"${n.requesterName.replace(/"/g, '""')}"`,
      `"${n.contactPhone}"`,
      n.claimedBy ? `"${n.claimedBy.name.replace(/"/g, '""')}"` : '""',
      n.claimedBy ? `"${n.claimedBy.phone}"` : '""',
      n.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `disaster_relief_needs_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ needs, shelters, offlineQueue }, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', dataStr);
    link.setAttribute('download', `disaster_state_backup_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div
        className="bg-white w-full max-w-lg rounded-2xl shadow-2xl border border-stone-200 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-stone-900 text-white p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-6 h-6 text-emerald-400" />
            <div>
              <h2 className="text-base font-bold">ศูนย์ควบคุมและผู้ดูแลระบบ (Agency / Moderator)</h2>
              <p className="text-xs text-stone-400">สำหรับเจ้าหน้าที่ ปภ., อปท. และศูนย์สั่งการบรรเทาสาธารณภัย</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-stone-800 text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 space-y-4 text-xs text-stone-700">
          {/* Status summary */}
          <div className="grid grid-cols-2 gap-2.5">
            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <div className="font-semibold text-stone-500">คำขอของขาดทั้งหมด</div>
              <div className="text-2xl font-black text-stone-900 mt-1">{needs.length} รายการ</div>
              <div className="text-[11px] text-stone-500 mt-1">
                🟠 รอความช่วยเหลือ: {needs.filter((n) => n.status === 'pending').length} | 🟢 รับจบแล้ว: {needs.filter((n) => n.status === 'claimed').length}
              </div>
            </div>

            <div className="p-3 rounded-xl bg-stone-50 border border-stone-200">
              <div className="font-semibold text-stone-500">ศูนย์พักพิงในระบบ</div>
              <div className="text-2xl font-black text-stone-900 mt-1">{shelters.length} ศูนย์</div>
              <div className="text-[11px] text-stone-500 mt-1">
                อัตราครองเตียงรวม: {Math.round((shelters.reduce((a, b) => a + b.currentOccupancy, 0) / shelters.reduce((a, b) => a + b.maxCapacity, 0)) * 100)}%
              </div>
            </div>
          </div>

          {/* Export tools */}
          <div className="space-y-2">
            <div className="font-bold text-stone-900 text-sm">ส่งออกข้อมูลสำหรับรายงานและแผนงานโลจิสติกส์</div>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-1.5 bg-emerald-700 hover:bg-emerald-600 active:scale-95 text-white font-bold px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                <FileSpreadsheet className="w-4 h-4" />
                <span>ส่งออกตาราง CSV (Excel)</span>
              </button>

              <button
                onClick={handleExportJSON}
                className="flex items-center gap-1.5 bg-stone-800 hover:bg-stone-700 active:scale-95 text-white font-bold px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>สำรองข้อมูล JSON</span>
              </button>
            </div>
          </div>

          {/* Danger zone / reset demo */}
          <div className="pt-3 border-t border-stone-200 flex items-center justify-between">
            <div>
              <div className="font-bold text-stone-900">รีเซ็ตข้อมูลตัวอย่าง</div>
              <p className="text-[11px] text-stone-500">คืนค่าคำขอของขาดและศูนย์พักพิงเริ่มต้น</p>
            </div>
            <button
              onClick={() => {
                if (window.confirm('คุณต้องการคืนค่าข้อมูลเริ่มต้นของระบบใช่หรือไม่?')) {
                  resetToDefaultData();
                  onClose();
                }
              }}
              className="flex items-center gap-1 text-xs text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-lg border border-rose-300 font-semibold cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>รีเซ็ต Demo Data</span>
            </button>
          </div>
        </div>

        <div className="p-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-stone-200 hover:bg-stone-300 rounded-lg text-stone-800 font-bold text-xs"
          >
            ปิดหน้าต่าง
          </button>
        </div>
      </div>
    </div>
  );
};

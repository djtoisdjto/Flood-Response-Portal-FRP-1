import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Lock,
  Mail,
  User,
  ArrowRight,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  X,
  KeyRound,
  Eye,
  EyeOff,
  RefreshCw,
  QrCode,
  Building2,
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { AgencyOfficial, OfficialAuthSession } from '../types/officialAuth';
import { OFFICIAL_REGISTRY_DATABASE } from '../data/officialRegistryData';

interface OfficialAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'register';
  onLoginSuccess: (official: AgencyOfficial) => void;
}

const STORAGE_KEY_OFFICIALS = 'matchneed_officials_db_v1';

export const OfficialAuthModal: React.FC<OfficialAuthModalProps> = ({
  isOpen,
  onClose,
  initialMode = 'login',
  onLoginSuccess,
}) => {
  const [mode, setMode] = useState<'login' | 'verify_registry' | 'thaid_flow' | 'set_password' | 'success'>(
    initialMode === 'register' ? 'verify_registry' : 'login'
  );

  // Officials State with LocalStorage
  const [officials, setOfficials] = useState<AgencyOfficial[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY_OFFICIALS);
      if (saved) return JSON.parse(saved);
    } catch {
      // Ignore
    }
    return OFFICIAL_REGISTRY_DATABASE;
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY_OFFICIALS, JSON.stringify(officials));
    } catch {
      // Ignore
    }
  }, [officials]);

  // Mode synchronization when prop changes
  useEffect(() => {
    if (initialMode === 'register') {
      setMode('verify_registry');
    } else {
      setMode('login');
    }
    setError(null);
  }, [initialMode, isOpen]);

  // Form Inputs: Login
  const [loginFullName, setLoginFullName] = useState('');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Form Inputs: Verification & ThaiD
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [verifiedOfficial, setVerifiedOfficial] = useState<AgencyOfficial | null>(null);

  // Form Inputs: Set Custom Password
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // UI status
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [thaiDSimulationStep, setThaiDSimulationStep] = useState<number>(0);

  if (!isOpen) return null;

  // 1. Handle Standard Official Login (Name + Gmail + Custom Password)
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = loginEmail.trim().toLowerCase();
      const cleanName = loginFullName.trim().toLowerCase();

      // Find in database
      const found = officials.find(
        (o) =>
          o.email.toLowerCase() === cleanEmail &&
          o.fullName.toLowerCase().includes(cleanName.split(' ')[0] || cleanName)
      );

      if (!found) {
        setError('ไม่พบบัญชีเจ้าหน้าที่ในระบบ กรุณาตรวจสอบชื่อและ Gmail หรือลงทะเบียนยืนยันตัวตนใหม่');
        return;
      }

      if (!found.customPasswordHash) {
        setError('เจ้าหน้าที่ท่านนี้ยังไม่ได้ตั้งรหัสผ่าน กรุณายืนยันตัวตนผ่าน ThaiD เพื่อตั้งรหัสผ่านก่อน');
        setRegFullName(found.fullName);
        setRegEmail(found.email);
        setVerifiedOfficial(found);
        setMode('thaid_flow');
        return;
      }

      if (found.customPasswordHash !== loginPassword) {
        setError('รหัสผ่านไม่ถูกต้อง (กรุณาใช้ Custom Password ที่เจ้าหน้าที่ตั้งไว้ในระบบ ไม่ใช่รหัสผ่าน Gmail)');
        return;
      }

      // Success
      onLoginSuccess(found);
      onClose();
    }, 450);
  };

  // 2. Handle Hidden Registration - Step 1: Agency Database Check
  const handleVerifyAgencyDatabase = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const cleanEmail = regEmail.trim().toLowerCase();
      const cleanName = regFullName.trim().toLowerCase();

      const found = officials.find(
        (o) =>
          o.email.toLowerCase() === cleanEmail ||
          o.fullName.toLowerCase() === cleanName
      );

      if (!found) {
        setError(
          'ไม่พบรายชื่อในฐานข้อมูลกลางของหน่วยงานรัฐ/กู้ภัย กรุณาติดต่อกองอำนวยการ ปภ. อุบลฯ หรือ ปลัดเทศบาล'
        );
        return;
      }

      // Found in registry! Proceed to ThaiD flow
      setVerifiedOfficial(found);
      setMode('thaid_flow');
      setThaiDSimulationStep(1); // Ready to launch ThaiD
    }, 500);
  };

  // 3. Handle ThaiD Authentication Simulation
  const handleSimulateThaiDApproval = () => {
    setThaiDSimulationStep(2); // In progress
    setTimeout(() => {
      setThaiDSimulationStep(3); // Success verified
      setTimeout(() => {
        setMode('set_password');
      }, 1000);
    }, 1500);
  };

  // 4. Handle Custom Password Creation
  const handleSetPasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (newPassword.length < 6) {
      setError('รหัสผ่านต้องมีความยาวอย่างน้อย 6 ตัวอักษร');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน');
      return;
    }

    if (!verifiedOfficial) return;

    // Save newly created password and mark ThaiD verified
    const updated: AgencyOfficial = {
      ...verifiedOfficial,
      customPasswordHash: newPassword,
      thaiDVerified: true,
      thaiDSub: `thaid-dopa-${Math.floor(100000000 + Math.random() * 900000000)}`,
      thaiDVerifiedAt: new Date().toISOString(),
    };

    setOfficials((prev) =>
      prev.map((o) => (o.id === verifiedOfficial.id ? updated : o))
    );

    setVerifiedOfficial(updated);
    setMode('success');
  };

  return (
    <div className="fixed inset-0 z-[10000] flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 border border-blue-400/30 flex items-center justify-center text-white shadow-inner">
              <ShieldCheck className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-base font-bold text-white leading-tight">
                  ระบบยืนยันตัวตนเจ้าหน้าที่รัฐ & กู้ภัย
                </h3>
              </div>
              <p className="text-xs text-blue-200/90 mt-0.5">
                ThaiD Digital Identity Verification &bull; จ.อุบลราชธานี
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-white/10 text-slate-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="m-4 mb-0 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">{error}</div>
          </div>
        )}

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* ========================================================
              MODE 1: STANDARD OFFICIAL LOGIN
              ======================================================== */}
          {mode === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                  สำหรับเจ้าหน้าที่ปฏิบัติการ
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-2">
                  เข้าสู่ระบบศูนย์ประสานงาน (Official Login)
                </h4>
                <p className="text-xs text-slate-500 mt-0.5 leading-relaxed">
                  กรอกชื่อ-นามสกุล, Gmail และรหัสผ่าน Custom Password ที่ท่านได้ตั้งไว้กับระบบ
                </p>
              </div>

              {/* 1. Full Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  1. ชื่อ-นามสกุล เจ้าหน้าที่
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={loginFullName}
                    onChange={(e) => setLoginFullName(e.target.value)}
                    placeholder="เช่น นายประสิทธิ์ สุขใจ หรือ ชัยวัฒน์"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* 2. Gmail */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  2. Gmail (อีเมลติดต่อเจ้าหน้าที่)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="example.disaster@gmail.com"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all text-slate-800"
                  />
                </div>
              </div>

              {/* 3. Custom Password */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-bold text-slate-700">
                    3. รหัสผ่านระบบ (Custom Password)
                  </label>
                  <span className="text-[10px] text-slate-400">
                    *ไม่ใช่รหัสผ่านของ Gmail
                  </span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="รหัสผ่านที่ท่านตั้งไว้ในระบบ"
                    className="w-full pl-9 pr-10 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-bold text-xs shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังตรวจสอบสิทธิ์...</span>
                  </>
                ) : (
                  <>
                    <span>เข้าสู่ระบบเจ้าหน้าที่</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Quick Switch to New Official / ThaiD */}
              <div className="pt-2 text-center text-xs text-slate-500">
                ยังไม่เคยตั้งรหัสผ่าน หรือเป็นเจ้าหน้าที่ใหม่?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setMode('verify_registry');
                  }}
                  className="text-blue-600 font-bold hover:underline cursor-pointer"
                >
                  ยืนยันตัวตน ThaiD & ตั้งรหัสผ่าน
                </button>
              </div>
            </form>
          )}

          {/* ========================================================
              MODE 2: HIDDEN REGISTRATION - STEP 1: CHECK AGENCY REGISTRY
              ======================================================== */}
          {mode === 'verify_registry' && (
            <form onSubmit={handleVerifyAgencyDatabase} className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-blue-700 bg-blue-50 p-3 rounded-2xl border border-blue-200">
                <Building2 className="w-4 h-4 shrink-0 text-blue-600" />
                <span>
                  <strong>ขั้นตอนที่ 1/3:</strong> ตรวจสอบรายชื่อในฐานข้อมูลกลางของหน่วยงานรัฐ
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  ลงทะเบียนเจ้าหน้าที่ใหม่ (ผ่าน ThaiD)
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  ระบบจะตรวจสอบรายชื่อและ Gmail ของท่านกับฐานข้อมูลกลางของ ปภ. หรือเทศบาล ก่อนส่งไปเปิดแอป ThaiD เพื่อยืนยันตัวตน
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ชื่อ-นามสกุล เจ้าหน้าที่ (ภาษาไทย)
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    placeholder="เช่น นายประสิทธิ์ สุขใจ หรือ ชัยวัฒน์"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Gmail ที่ใช้ติดต่อราชการ/กู้ภัย
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="prasit.disaster@gmail.com หรือ chaiwat.sa.66@ubu.ac.th"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <div className="font-bold text-slate-700">รายชื่อตัวอย่างในฐานข้อมูลกลาง:</div>
                <div>&bull; นายประสิทธิ์ สุขใจ (prasit.disaster@gmail.com) - เทศบาลเมืองพิบูลมังสาหาร</div>
                <div>&bull; นายชัยวัฒน์ สว่างธรรม (chaiwat.sa.66@ubu.ac.th) - ม.อุบลราชธานี</div>
                <div>&bull; สิบเอก สมพงษ์ แก่นนคร (sompong.dopa@gmail.com) - อ.วารินชำราบ</div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>กำลังตรวจสอบฐานข้อมูลหน่วยงาน...</span>
                  </>
                ) : (
                  <>
                    <span>ตรวจสอบสิทธิ์และไปต่อ ThaiD</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setMode('login')}
                className="w-full text-center text-xs text-slate-500 hover:text-slate-800 font-semibold cursor-pointer"
              >
                &larr; กลับไปหน้าล็อกอินปกติ
              </button>
            </form>
          )}

          {/* ========================================================
              MODE 3: THAID INTEGRATION & VERIFICATION FLOW
              ======================================================== */}
          {mode === 'thaid_flow' && verifiedOfficial && (
            <div className="space-y-4 text-center">
              <div className="w-16 h-16 rounded-3xl bg-blue-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-blue-500/25">
                <Smartphone className="w-8 h-8" />
              </div>

              <div>
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-800">
                  ขั้นตอนที่ 2/3: ยืนยันตัวตนดิจิทัล
                </span>
                <h4 className="text-base font-extrabold text-slate-900 mt-2">
                  ยืนยันตัวตนผ่านแอปพลิเคชัน ThaiD
                </h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  ระบบตรวจพบชื่อ <strong>{verifiedOfficial.fullName}</strong> สังกัด{' '}
                  <strong>{verifiedOfficial.agencyName}</strong> ถูกต้อง
                </p>
              </div>

              {/* Simulation Card / Deep Link Container */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs text-left space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs">
                      ID
                    </div>
                    <span className="font-bold text-slate-800">ThaiD OpenID Connect</span>
                  </div>
                  <span className="text-[10px] text-slate-400">กรมการปกครอง (DOPA)</span>
                </div>

                {thaiDSimulationStep === 1 && (
                  <>
                    <p className="text-[11px] text-slate-600">
                      ระบบเตรียมส่งคำขอ (Redirect / Deep Link) ไปยังแอปพลิเคชัน ThaiD บนอุปกรณ์ของท่าน เพื่อขอความยินยอมในการพิสูจน์ตัวตน:
                    </p>
                    <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-1 font-mono text-[10px] text-slate-600">
                      <div>Scope: openid, pid, full_name</div>
                      <div>Client: Disaster Relief Ubon Ratchathani</div>
                      <div>Redirect: thaid://auth?state=ubon_rescue_2026</div>
                    </div>
                    <button
                      type="button"
                      onClick={handleSimulateThaiDApproval}
                      className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm cursor-pointer"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>เปิดแอป ThaiD และยืนยันตัวตน</span>
                    </button>
                  </>
                )}

                {thaiDSimulationStep === 2 && (
                  <div className="py-4 text-center space-y-2">
                    <RefreshCw className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                    <p className="font-bold text-slate-800 text-xs">
                      กำลังรอการอนุมัติการยืนยันตัวตนในแอป ThaiD...
                    </p>
                    <p className="text-[10px] text-slate-400">
                      กรุณากดยืนยันด้วยการสแกนลายนิ้วมือหรือใบหน้าในมือถือ
                    </p>
                  </div>
                )}

                {thaiDSimulationStep === 3 && (
                  <div className="py-3 text-center space-y-1.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800">
                    <CheckCircle2 className="w-6 h-6 text-emerald-600 mx-auto" />
                    <p className="font-bold text-xs">ยืนยันตัวตนผ่าน ThaiD สำเร็จ!</p>
                    <p className="text-[10px] text-emerald-600">กำลังนำท่านไปสู่หน้าตั้งรหัสผ่านใหม่...</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================
              MODE 4: SET CUSTOM PASSWORD
              ======================================================== */}
          {mode === 'set_password' && verifiedOfficial && (
            <form onSubmit={handleSetPasswordSubmit} className="space-y-4">
              <div className="flex items-center gap-2 text-xs text-emerald-800 bg-emerald-50 p-3 rounded-2xl border border-emerald-200">
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>
                  <strong>ขั้นตอนที่ 3/3:</strong> ยืนยันตัวตนสำเร็จ! ตั้งรหัสผ่านประจำตัว
                </span>
              </div>

              <div>
                <h4 className="text-base font-extrabold text-slate-900">
                  ตั้งรหัสผ่านเจ้าหน้าที่ (Custom Password)
                </h4>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  สำหรับคุณ <strong>{verifiedOfficial.fullName}</strong> ({verifiedOfficial.agencyName})
                  ใช้รหัสผ่านนี้ในการล็อกอินเข้าสู่ระบบในครั้งถัดไป
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="ตั้งรหัสผ่านที่จำง่ายและปลอดภัย"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  ยืนยันรหัสผ่านใหม่อีกครั้ง
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="พิมพ์รหัสผ่านเดิมซ้ำอีกครั้ง"
                    className="w-full pl-9 pr-3 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:border-blue-600 focus:bg-white text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>บันทึกรหัสผ่านและเข้าสู่ระบบทันที</span>
              </button>
            </form>
          )}

          {/* ========================================================
              MODE 5: SUCCESS STATE
              ======================================================== */}
          {mode === 'success' && verifiedOfficial && (
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-lg font-extrabold text-slate-900">
                  ตั้งรหัสผ่านสำเร็จเรียบร้อย
                </h4>
                <p className="text-xs text-slate-600 mt-1 max-w-sm mx-auto">
                  บัญชีของ <strong>{verifiedOfficial.fullName}</strong> ได้ผูกกับ ThaiD Digital ID และพร้อมเข้าใช้งานระบบศูนย์สั่งการแล้ว
                </p>
              </div>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 text-left text-xs space-y-1 text-slate-700 max-w-sm mx-auto">
                <div><strong>ชื่อ-นามสกุล:</strong> {verifiedOfficial.fullName}</div>
                <div><strong>Gmail:</strong> {verifiedOfficial.email}</div>
                <div><strong>หน่วยงาน:</strong> {verifiedOfficial.agencyName}</div>
                <div><strong>สถานะ ThaiD:</strong> <span className="text-emerald-600 font-bold">ยืนยันตัวตนแล้ว</span></div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onLoginSuccess(verifiedOfficial);
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>เข้าสู่แดชบอร์ดหลักศูนย์ประสานงาน</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

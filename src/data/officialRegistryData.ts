import { AgencyOfficial } from '../types/officialAuth';

/**
 * ฐานข้อมูลเจ้าหน้าที่และกู้ภัยกลางของหน่วยงาน (Central Agency Official Registry)
 * สำหรับตรวจสอบสิทธิ์เจ้าหน้าที่ก่อนส่งยืนยันตัวตนผ่าน ThaiD
 */
export const OFFICIAL_REGISTRY_DATABASE: AgencyOfficial[] = [
  {
    id: 'off-001',
    fullName: 'นายประสิทธิ์ สุขใจ',
    email: 'prasit.disaster@gmail.com',
    agencyName: 'เทศบาลเมืองพิบูลมังสาหาร',
    role: 'commander',
    customPasswordHash: 'Phibun@2026', // รหัสผ่านตัวอย่างที่เคยตั้งไว้แล้ว
    thaiDVerified: true,
    thaiDSub: 'thaid-dopa-987412365',
    thaiDVerifiedAt: '2026-08-15T09:30:00Z',
    phone: '081-998-7766',
  },
  {
    id: 'off-002',
    fullName: 'นางสาวพิมพ์ใจ บุญหลาย',
    email: 'pimjai.rescue@gmail.com',
    agencyName: 'ปภ. จังหวัดอุบลราชธานี',
    role: 'officer',
    customPasswordHash: 'SafeUbon2026!',
    thaiDVerified: true,
    thaiDSub: 'thaid-dopa-112233445',
    thaiDVerifiedAt: '2026-09-01T14:20:00Z',
    phone: '089-554-3322',
  },
  {
    id: 'off-003',
    fullName: 'นายชัยวัฒน์ สว่างธรรม',
    email: 'chaiwat.sa.66@ubu.ac.th',
    agencyName: 'ศูนย์บรรเทาสาธารณภัย มหาวิทยาลัยอุบลราชธานี',
    role: 'rescuer',
    customPasswordHash: undefined, // ยังไม่เคยตั้งรหัสผ่าน -> ต้องยืนยันผ่าน ThaiD ก่อน
    thaiDVerified: false,
    phone: '086-778-9900',
  },
  {
    id: 'off-004',
    fullName: 'สิบเอก สมพงษ์ แก่นนคร',
    email: 'sompong.dopa@gmail.com',
    agencyName: 'ที่ว่าการอำเภอวารินชำราบ (ฝ่ายความมั่นคง)',
    role: 'officer',
    customPasswordHash: undefined, // เจ้าหน้าที่ใหม่ รอผูก ThaiD
    thaiDVerified: false,
    phone: '084-332-1100',
  }
];

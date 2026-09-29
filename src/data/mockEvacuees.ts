/**
 * Mock Data สำหรับระบบค้นหาญาติในศูนย์พักพิงอุทกภัย จ.อุบลราชธานี
 * 
 * ยอดรวมผู้พักพิงทั้งหมด: 922 รายชื่อ
 * - ศูนย์พักพิงโรงเรียนอุบลวิทยาคม: 135 คน
 * - ศูนย์พักพิงวิทยาลัยเทคนิคอุบลราชธานี: 220 คน
 * - ศูนย์อพยพหอประชุมที่ว่าการอำเภอวารินชำราบ: 192 คน
 * - ศูนย์พักพิงวัดมหาวนาราม พระอารามหลวง (วัดป่าใหญ่): 110 คน
 * - ศูนย์พักพิงโรงเรียนเทศบาล 2 หนองบัว: 85 คน
 * - ศูนย์พักพิงและศูนย์ประสานงาน มหาวิทยาลัยอุบลราชธานี: 180 คน
 */

export interface MockEvacueeItem {
  id: string;
  firstName: string;
  lastName: string;
  shelterName: string;
  checkInDate: string;
  status: string;
}

// ฐานข้อมูลชื่อจริงภาษาไทย (ชาย-หญิง)
const THAI_FIRST_NAMES = [
  'สมชาย', 'สมศักดิ์', 'ประเสริฐ', 'อาทิตย์', 'ธีรพงษ์', 'วิชัย', 'ณรงค์', 'ชัยวัฒน์',
  'ธนากร', 'ปิยะ', 'สุรศักดิ์', 'อนุสรณ์', 'พงษ์ศธร', 'สิทธิชัย', 'ภานุวัฒน์', 'อานนท์',
  'เกียรติศักดิ์', 'เอกชัย', 'ศราวุธ', 'ชาญชัย', 'วีระ', 'นพดล', 'บุญมา', 'บุญมี',
  'บุญหลาย', 'ไกรสร', 'คำสิงห์', 'บัวลอย', 'สมาน', 'อุดม', 'เจริญ', 'เสถียร',
  'บรรจง', 'ทองคำ', 'ทองใบ', 'มานพ', 'ชัชวาล', 'ศิริชัย', 'วรวุฒิ', 'พีรพล',
  'สมจิตต์', 'อรทัย', 'กัลยา', 'พรรณี', 'ศิริพร', 'สุภาพร', 'วราภรณ์', 'รัตนา',
  'นงนุช', 'มะลิ', 'กรรณิการ์', 'วิไลพร', 'จารุณี', 'ปิยฉัตร', 'ชุติมา', 'ดวงพร',
  'พรทิพย์', 'นภัสสร', 'กานดา', 'อัมพร', 'บุญเรือน', 'มาลัย', 'สมศรี', 'สายทอง',
  'บัวผัน', 'คำปัน', 'บัวคำ', 'ทองสุข', 'วันดี', 'ลัดดา', 'ลำดวน', 'ช่อผกา',
  'สุปรียา', 'ประนอม', 'ยุพิน', 'จินตนา', 'พยอม', 'สมหมาย', 'อุไร', 'ดวงใจ'
];

// นามสกุลคนไทยและสกุลท้องถิ่นอุบลฯ / อีสาน
const THAI_LAST_NAMES = [
  'วงศ์สวรรค์', 'บัวขาว', 'ศรีอุบล', 'วารินทร์', 'อินทร์แปลง', 'คำดี', 'ใจกล้า',
  'สารคาม', 'พลเยี่ยม', 'อุบลเลิศ', 'รัตนวงศ์', 'โคตรสมบัติ', 'บุญลือ', 'ทองดี',
  'บรรจงกิจ', 'สายสุนทร', 'ชัยนาท', 'ภูผาสุข', 'แก้วมณี', 'โพธิ์งาม', 'แสนสุข',
  'จันทร์เพ็ญ', 'สิงห์ทอง', 'สุทธิสาร', 'มงคลกุล', 'นามวงศ์', 'ศรีสุข', 'บัวเทศ',
  'ป้องกันภัย', 'พิมพา', 'บุญชู', 'ศรีสวัสดิ์', 'เจริญผล', 'หาญณรงค์', 'มิ่งขวัญ',
  'ทรัพย์เจริญ', 'วงศ์คำผา', 'ไชยศรี', 'ชนะชัย', 'ศรีเมือง', 'พูนทรัพย์', 'แสงจันทร์',
  'อิ่มสุข', 'มั่นคง', 'ดวงใจ', 'อุดมพร', 'พรหมจักร', 'กิตติคุณ', 'โสภา', 'คงเจริญ'
];

// สถานะผู้พักพิง
const STATUS_OPTIONS = [
  'ปลอดภัย',
  'ปลอดภัย',
  'ปลอดภัย',
  'ปลอดภัย',
  'ปลอดภัย',
  'บาดเจ็บเล็กน้อย',
  'ต้องการการดูแลพิเศษ',
  'ส่งต่อแพทย์แล้ว'
];

// กำหนดเป้าหมายจำนวนผู้ประสบภัยของแต่ละศูนย์ (รวม 922 คน)
export const SHELTER_QUOTAS = [
  { name: 'ศูนย์พักพิงโรงเรียนอุบลวิทยาคม', count: 135 },
  { name: 'ศูนย์พักพิงวิทยาลัยเทคนิคอุบลราชธานี', count: 220 },
  { name: 'ศูนย์อพยพหอประชุมที่ว่าการอำเภอวารินชำราบ', count: 192 },
  { name: 'ศูนย์พักพิงวัดมหาวนาราม พระอารามหลวง (วัดป่าใหญ่)', count: 110 },
  { name: 'ศูนย์พักพิงโรงเรียนเทศบาล 2 หนองบัว', count: 85 },
  { name: 'ศูนย์พักพิงและศูนย์ประสานงาน มหาวิทยาลัยอุบลราชธานี', count: 180 },
] as const;

// ฟังก์ชันสร้าง Mock Data แบบ Deterministic สุ่มแต่แน่นอน
function generateMockEvacuees(): MockEvacueeItem[] {
  const result: MockEvacueeItem[] = [];
  let globalIndex = 1;

  for (const shelter of SHELTER_QUOTAS) {
    for (let i = 0; i < shelter.count; i++) {
      // Deterministic PRNG formula based on index to ensure consistent output
      const nameIndex = (globalIndex * 17 + i * 3) % THAI_FIRST_NAMES.length;
      const lastNameIndex = (globalIndex * 31 + i * 7) % THAI_LAST_NAMES.length;
      const statusIndex = (globalIndex * 13 + i * 5) % STATUS_OPTIONS.length;

      // วันที่เช็คอินช่วงกันยายน (ระหว่าง 12-21 กันยายน 2026)
      const day = 12 + ((globalIndex * 7 + i) % 10);
      const hour = 8 + ((globalIndex * 3 + i) % 12);
      const minute = ((globalIndex * 11 + i * 9) % 60);

      const paddedDay = day.toString().padStart(2, '0');
      const paddedHour = hour.toString().padStart(2, '0');
      const paddedMin = minute.toString().padStart(2, '0');
      const checkInDate = `2026-09-${paddedDay} ${paddedHour}:${paddedMin}`;

      const idString = `EV-${globalIndex.toString().padStart(3, '0')}`;

      result.push({
        id: idString,
        firstName: THAI_FIRST_NAMES[nameIndex],
        lastName: THAI_LAST_NAMES[lastNameIndex],
        shelterName: shelter.name,
        checkInDate,
        status: STATUS_OPTIONS[statusIndex],
      });

      globalIndex++;
    }
  }

  return result;
}

// ชุดข้อมูลหลักที่มีครบ 922 รายชื่อตามโควตา
export const evacueesList: MockEvacueeItem[] = generateMockEvacuees();

/**
 * ฟังก์ชันสำหรับรับค่าจากช่องค้นหา (String)
 * แล้วทำการ Filter หาชื่อหรือนามสกุลที่ตรงกันจาก Array evacueesList
 * 
 * @param query ข้อความค้นหา (ชื่อ, นามสกุล หรือชื่อเต็ม)
 * @param list รายการผู้ประสบภัยที่ต้องการค้นหา (default: evacueesList)
 * @returns รายการผู้ประสบภัยที่ตรงกับเงื่อนไข
 */
export function searchEvacuees(
  query: string,
  list: MockEvacueeItem[] = evacueesList
): MockEvacueeItem[] {
  if (!query || typeof query !== 'string') {
    return list;
  }

  const cleanQuery = query.trim().toLowerCase();
  if (cleanQuery === '') {
    return list;
  }

  return list.filter((item) => {
    const fullName = `${item.firstName} ${item.lastName}`.toLowerCase();
    const reverseFullName = `${item.lastName} ${item.firstName}`.toLowerCase();
    const fName = item.firstName.toLowerCase();
    const lName = item.lastName.toLowerCase();
    const shelter = item.shelterName.toLowerCase();
    const id = item.id.toLowerCase();

    return (
      fName.includes(cleanQuery) ||
      lName.includes(cleanQuery) ||
      fullName.includes(cleanQuery) ||
      reverseFullName.includes(cleanQuery) ||
      shelter.includes(cleanQuery) ||
      id.includes(cleanQuery)
    );
  });
}

const SHELTER_ID_MAP: Record<string, string> = {
  'ศูนย์พักพิงโรงเรียนอุบลวิทยาคม': 'shelter-1',
  'ศูนย์พักพิงวิทยาลัยเทคนิคอุบลราชธานี': 'shelter-2',
  'ศูนย์อพยพหอประชุมที่ว่าการอำเภอวารินชำราบ': 'shelter-3',
  'ศูนย์พักพิงวัดมหาวนาราม พระอารามหลวง (วัดป่าใหญ่)': 'shelter-4',
  'ศูนย์พักพิงโรงเรียนเทศบาล 2 หนองบัว': 'shelter-5',
  'ศูนย์พักพิงและศูนย์ประสานงาน มหาวิทยาลัยอุบลราชธานี': 'shelter-6',
};

const VILLAGES = [
  'ชุมชนท่ากอไผ่ อ.วารินชำราบ',
  'ชุมชนวังแดง ต.ในเมือง',
  'ชุมชนเกตุแก้ว ซอย 2 อ.วารินชำราบ',
  'ชุมชนหาดคูเดื่อ ต.แจระแม',
  'ชุมชนกุดลาด ต.กุดลาด',
  'บ้านคำขวาง อ.วารินชำราบ',
  'ชุมชนบูรพา 2 ต.ในเมือง',
  'ชุมชนดอนงิ้ว ต.วารินชำราบ',
  'ชุมชนหนองบัวพัฒนา ต.ในเมือง',
  'ชุมชนวัดด้ามพร้า ต.ขามใหญ่',
  'ชุมชนศรีประดู่ ต.ในเมือง',
  'บ้านท่าบ้งมั่ง ต.วารินชำราบ'
];

/**
 * แปลง MockEvacueeItem เป็นโครงสร้างข้อมูล Evacuee สำหรับใช้งานในแอป
 */
export function getInitialAppEvacuees(): any[] {
  return evacueesList.map((item, idx) => {
    const isMale = !item.firstName.endsWith('า') && !item.firstName.endsWith('ี') && !item.firstName.endsWith('ร');
    const age = 15 + ((idx * 13) % 65);
    const prefix = age < 15 ? (isMale ? 'ด.ช.' : 'ด.ญ.') : (isMale ? 'นาย' : 'นาง/น.ส.');
    const village = VILLAGES[idx % VILLAGES.length];
    const shelterId = SHELTER_ID_MAP[item.shelterName] || 'shelter-1';

    let appStatus: 'safe' | 'medical_attention' | 'missing_relatives' = 'safe';
    if (item.status.includes('บาดเจ็บ') || item.status.includes('แพทย์')) {
      appStatus = 'medical_attention';
    } else if (item.status.includes('ดูแลพิเศษ')) {
      appStatus = 'medical_attention';
    }

    return {
      id: item.id.toLowerCase(),
      name: `${prefix}${item.firstName} ${item.lastName}`,
      age,
      gender: isMale ? 'male' : 'female',
      shelterId,
      shelterName: item.shelterName,
      originalVillage: village,
      status: appStatus,
      contactPhone: `08${(idx % 9)}${((idx * 7) % 9000000 + 1000000)}`,
      relativeContact: `ญาติ: ${item.lastName} (ติดต่อผ่านศูนย์)`,
      registeredAt: new Date(item.checkInDate.replace(' ', 'T') + ':00+07:00').toISOString(),
      notes: `สถานะเบื้องต้น: ${item.status}`,
    };
  });
}


import { HouseholdMemberDemographics, SmartReliefKitItem, ReliefDistributionRecord } from '../types/smartReliefKit';

/**
 * Standard daily nutritional & hygiene consumption parameters
 * Reference: National Disaster Management & Public Health Emergency Guidelines
 */
export const CONSUMPTION_RATES = {
  WATER_LITERS_PER_PERSON_DAY: 3.0, // น้ำดื่มสะอาด 3 ลิตร/คน/วัน (ขวด 1.5L x 2)
  RICE_GRAMS_PER_PERSON_DAY: 400, // ข้าวสาร 400 กรัม/คน/วัน
  CANNED_MEALS_PER_PERSON_DAY: 2, // อาหารสำเร็จรูป/ปลากระป๋อง 2 กระป๋อง/คน/วัน
  INFANT_DIAPERS_PER_DAY: 5, // แพมเพิสทารก 5 ชิ้น/วัน
  ADULT_DIAPERS_PER_BEDRIDDEN_DAY: 4, // ผ้าอ้อมผู้ใหญ่/ผู้ป่วยติดเตียง 4 ชิ้น/วัน
  UNDERPADS_PER_BEDRIDDEN_DAY: 2, // แผ่นรองซับ 2 ชิ้น/วัน
  SANITARY_PADS_PER_WOMAN_CYCLE: 12, // ผ้าอนามัย 1 ห่อ (12-16 ชิ้น) ต่องวด
};

/**
 * 2. Dynamic Calculation Logic
 * คำนวณสิ่งของในถุงยังชีพของครัวเรือนแบบเฉพาะเจาะจง (Tailored Smart Relief Kit)
 * ตามข้อมูลจริงระดับครัวเรือน (Household-Specific Demographics)
 */
export function calculateTailoredReliefKit(
  demographics: HouseholdMemberDemographics,
  targetDays = 4
): SmartReliefKitItem[] {
  const items: SmartReliefKitItem[] = [];
  const {
    totalMembers,
    infantsAndToddlers,
    children,
    adults,
    elderly,
    bedriddenPatients,
    pregnantWomen,
    womenReproductiveAge,
    chronicDiseasePatients,
  } = demographics;

  if (totalMembers <= 0) return items;

  // 1. BASELINE SUBSISTENCE (ของยังชีพพื้นฐานตามจำนวนคนและระยะเวลา)
  // น้ำดื่มสะอาด (แพ็ค 1.5 ลิตร x 6 ขวด = 9 ลิตร)
  const totalWaterLitersNeeded = totalMembers * CONSUMPTION_RATES.WATER_LITERS_PER_PERSON_DAY * targetDays;
  const waterPacks = Math.max(1, Math.ceil(totalWaterLitersNeeded / 9));
  items.push({
    itemId: 'kit-water',
    name: 'น้ำดื่มสะอาด RO (แพ็ค 1.5L x 6 ขวด)',
    category: 'water',
    quantity: waterPacks,
    unit: 'แพ็ค',
    reason: `คำนวณสำหรับสมาชิก ${totalMembers} คน ดื่มกิน ${targetDays} วัน (รวม ~${Math.round(totalWaterLitersNeeded)} ลิตร)`,
    isSpecialNeed: false,
  });

  // ข้าวสารคัดพิเศษ (ถุง 5 กก.)
  const totalRiceKg = (totalMembers * CONSUMPTION_RATES.RICE_GRAMS_PER_PERSON_DAY * targetDays) / 1000;
  const riceBags = Math.max(1, Math.ceil(totalRiceKg / 5));
  items.push({
    itemId: 'kit-rice',
    name: 'ข้าวสารหอมมะลิอุบลราชธานี (ถุง 5 กก.)',
    category: 'food',
    quantity: riceBags,
    unit: 'ถุง (5 กก.)',
    reason: `สำหรับปรุงอาหาร ${totalMembers} คน เป็นเวลา ${targetDays} วัน (~${totalRiceKg.toFixed(1)} กก.)`,
    isSpecialNeed: false,
  });

  // ปลากระป๋อง / อาหารปรุงสุกพร้อมทาน (MRE / Canned Food)
  const cannedCount = Math.ceil(totalMembers * CONSUMPTION_RATES.CANNED_MEALS_PER_PERSON_DAY * targetDays);
  items.push({
    itemId: 'kit-canned-food',
    name: 'ปลากระป๋องในซอสมะเขือเทศ / อาหารสำเร็จรูป',
    category: 'food',
    quantity: cannedCount,
    unit: 'กระป๋อง',
    reason: `อาหารโปรตีนพร้อมทานสำหรับ ${totalMembers} คน (เฉลี่ย 2 มื้อ/คน/วัน)`,
    isSpecialNeed: false,
  });

  // บะหมี่กึ่งสำเร็จรูป / อาหารแห้ง
  const noodlePacks = Math.ceil(totalMembers * 2 * targetDays);
  items.push({
    itemId: 'kit-instant-noodles',
    name: 'บะหมี่กึ่งสำเร็จรูป / โจ๊กกึ่งสำเร็จรูป',
    category: 'food',
    quantity: noodlePacks,
    unit: 'ซอง',
    reason: `อาหารสำรองฉุกเฉินสำหรับ ${totalMembers} คน`,
    isSpecialNeed: false,
  });

  // กล่องยาสามัญประจำบ้าน (พาราเซตามอล, ยาแก้แพ้, ผงเกลือแร่ ORS, เบตาดีน, สำลี, ยาทาน้ำกัดเท้า)
  items.push({
    itemId: 'kit-basic-meds',
    name: 'ชุดยาสามัญประจำบ้าน + ยาทาน้ำกัดเท้าฉุกเฉิน',
    category: 'medical',
    quantity: 1,
    unit: 'ชุด',
    reason: `ยารักษาโรคพื้นฐานและแผลน้ำกัดเท้าสำหรับครัวเรือน`,
    isSpecialNeed: false,
  });

  // ไฟฉายกันน้ำ + ถ่านสำรอง หรือไฟฉายพลังงานแสงอาทิตย์
  items.push({
    itemId: 'kit-light',
    name: 'ไฟฉาย LED ส่องสว่าง + ถ่านสำรอง (หรือโคมไฟชาร์จแสงอาทิตย์)',
    category: 'general',
    quantity: 1,
    unit: 'ชุด',
    reason: `ส่องสว่างเวลากลางคืน กรณีตัดกระแสไฟฟ้าชุมชน`,
    isSpecialNeed: false,
  });

  // -------------------------------------------------------------
  // 2. DYNAMIC SPECIAL NEEDS (คำนวณตามเงื่อนไขประชากรเฉพาะกลุ่ม)
  // -------------------------------------------------------------

  // ก. เด็กเล็กและทารก (Infants & Toddlers 0-3 ปี)
  if (infantsAndToddlers > 0) {
    const infantDiapersTotal = infantsAndToddlers * CONSUMPTION_RATES.INFANT_DIAPERS_PER_DAY * targetDays;
    const infantDiaperPacks = Math.max(1, Math.ceil(infantDiapersTotal / 30));
    items.push({
      itemId: 'kit-infant-diapers',
      name: 'ผ้าอ้อมสำเร็จรูปเด็กเล็ก (แพมเพิส)',
      category: 'infant',
      quantity: infantDiaperPacks,
      unit: 'ห่อใหญ่ (30 ชิ้น)',
      reason: `*จำเป็นพิเศษ:* บ้านมีเด็กเล็ก/ทารก ${infantsAndToddlers} คน (~${infantDiapersTotal} ชิ้น)`,
      isSpecialNeed: true,
    });

    items.push({
      itemId: 'kit-infant-formula',
      name: 'นมผงเด็ก / นมกล่อง UHT สำหรับเด็ก',
      category: 'infant',
      quantity: infantsAndToddlers * 2,
      unit: 'กล่อง/แพ็ค',
      reason: `*จำเป็นพิเศษ:* โภชนาการสำหรับเด็กเล็ก ${infantsAndToddlers} คน`,
      isSpecialNeed: true,
    });

    items.push({
      itemId: 'kit-baby-wipes',
      name: 'ทิชชูเปียกสำหรับเด็ก (สูตรอ่อนโยน)',
      category: 'infant',
      quantity: infantsAndToddlers * 2,
      unit: 'ห่อ',
      reason: `*จำเป็นพิเศษ:* สุขอนามัยเด็กเล็ก ป้องกันผดผื่นและการติดเชื้อ`,
      isSpecialNeed: true,
    });
  }

  // ข. สตรีมีครรภ์ (Pregnant Women)
  if (pregnantWomen > 0) {
    items.push({
      itemId: 'kit-pregnant-care',
      name: 'ชุดบำรุงครรภ์ + วิตามินเสริมธาตุเหล็ก / กรดโฟลิก + นมบำรุงแม่',
      category: 'special_care',
      quantity: pregnantWomen,
      unit: 'ชุด',
      reason: `*จำเป็นพิเศษ:* มีสตรีมีครรภ์ในบ้าน ${pregnantWomen} คน ต้องการสารอาหารเฉพาะ`,
      isSpecialNeed: true,
    });
  }

  // ค. ผู้หญิงวัยเจริญพันธุ์ (Women Reproductive Age)
  if (womenReproductiveAge > 0) {
    const sanitaryPacks = Math.max(1, Math.ceil(womenReproductiveAge * 1.5));
    items.push({
      itemId: 'kit-sanitary-pads',
      name: 'ผ้าอนามัยสำหรับสุภาพสตรี (สูตรกลางวัน/กลางคืน)',
      category: 'women_hygiene',
      quantity: sanitaryPacks,
      unit: 'ห่อ',
      reason: `*สุขอนามัยสุภาพสตรี:* สำหรับผู้หญิงวัยเจริญพันธุ์ ${womenReproductiveAge} คน`,
      isSpecialNeed: true,
    });
  }

  // ง. ผู้ป่วยติดเตียง (Bedridden Patients)
  if (bedriddenPatients > 0) {
    const adultDiapersTotal = bedriddenPatients * CONSUMPTION_RATES.ADULT_DIAPERS_PER_BEDRIDDEN_DAY * targetDays;
    const adultDiaperPacks = Math.max(1, Math.ceil(adultDiapersTotal / 10)); // แพ็คละ 10 ชิ้น
    items.push({
      itemId: 'kit-adult-diapers',
      name: 'ผ้าอ้อมผู้ใหญ่ (Adult Diapers)',
      category: 'special_care',
      quantity: adultDiaperPacks,
      unit: 'แพ็ค (10 ชิ้น)',
      reason: `*จำเป็นวิกฤต:* สำหรับผู้ป่วยติดเตียง ${bedriddenPatients} คน (~${adultDiapersTotal} ชิ้น)`,
      isSpecialNeed: true,
    });

    const underpadsTotal = bedriddenPatients * CONSUMPTION_RATES.UNDERPADS_PER_BEDRIDDEN_DAY * targetDays;
    const underpadPacks = Math.max(1, Math.ceil(underpadsTotal / 10));
    items.push({
      itemId: 'kit-underpads',
      name: 'แผ่นรองซับสิ่งขับถ่ายกันเปื้อน (Underpads)',
      category: 'special_care',
      quantity: underpadPacks,
      unit: 'แพ็ค (10 ชิ้น)',
      reason: `*จำเป็นวิกฤต:* สุขอนามัยเตียงผู้ป่วยติดเตียง ป้องกันแผลกดทับ`,
      isSpecialNeed: true,
    });

    items.push({
      itemId: 'kit-antiseptic-cleaner',
      name: 'น้ำยาทำความสะอาดแผลกดทับ + ถุงมือแพทย์ปลอดเชื้อ',
      category: 'special_care',
      quantity: bedriddenPatients,
      unit: 'เซ็ต',
      reason: `*จำเป็นวิกฤต:* ป้องกันการติดเชื้อในผู้ป่วยติดเตียง`,
      isSpecialNeed: true,
    });
  }

  // จ. ผู้สูงอายุ (Elderly 60+)
  if (elderly > 0 && bedriddenPatients === 0) {
    items.push({
      itemId: 'kit-elderly-balm',
      name: 'ยาดม ยาหม่อง ยาแก้ปวดเมื่อย และอาหารเสริมแคลเซียมผู้สูงอายุ',
      category: 'elderly',
      quantity: Math.max(1, Math.ceil(elderly / 2)),
      unit: 'ชุด',
      reason: `*สุขภาวะผู้สูงอายุ:* สำหรับผู้สูงอายุ ${elderly} คนในบ้าน`,
      isSpecialNeed: true,
    });
  }

  // ฉ. ผู้ป่วยโรคเรื้อรัง (Chronic Disease Patients)
  if (chronicDiseasePatients > 0) {
    items.push({
      itemId: 'kit-chronic-box',
      name: 'กล่องบรรจุยาป้องกันน้ำซึม (Waterproof Med Box) + สมุดคู่มือยา',
      category: 'medical',
      quantity: 1,
      unit: 'กล่อง',
      reason: `*ป้องกันยาเสียหาย:* ครัวเรือนมีผู้ป่วยโรคเรื้อรัง ${chronicDiseasePatients} คน`,
      isSpecialNeed: true,
    });
  }

  return items;
}

/**
 * 3. Timeline & Forecasting Algorithm
 * คำนวณวันหมดอายุของถุงยังชีพ และกำหนดการจัดส่งรอบถัดไป
 */
export function calculateDistributionSchedule(
  distributedDateStr: string,
  demographics: HouseholdMemberDemographics,
  suppliesDurationDays = 4
): {
  depletionDate: string;
  nextScheduledDeliveryDate: string;
  isOverdue: boolean;
  daysRemaining: number;
  urgencyStatus: 'safe' | 'warning_soon' | 'critical_overdue';
} {
  const distributedTime = new Date(distributedDateStr).getTime();
  const depletionTime = distributedTime + suppliesDurationDays * 24 * 60 * 60 * 1000;

  // นัดส่งล่วงหน้าก่อนของหมด 1 วัน เพื่อไม่ให้เกิดภาวะขาดแคลน
  const bufferHours = suppliesDurationDays > 2 ? 24 : 12;
  const nextDeliveryTime = depletionTime - bufferHours * 60 * 60 * 1000;

  const now = Date.now();
  const diffHours = (depletionTime - now) / (1000 * 60 * 60);
  const daysRemaining = Math.max(0, Math.round((diffHours / 24) * 10) / 10);

  const isOverdue = now >= depletionTime;
  let urgencyStatus: 'safe' | 'warning_soon' | 'critical_overdue' = 'safe';

  if (isOverdue) {
    urgencyStatus = 'critical_overdue';
  } else if (diffHours <= 24) {
    urgencyStatus = 'warning_soon';
  }

  return {
    depletionDate: new Date(depletionTime).toISOString(),
    nextScheduledDeliveryDate: new Date(nextDeliveryTime).toISOString(),
    isOverdue,
    daysRemaining,
    urgencyStatus,
  };
}

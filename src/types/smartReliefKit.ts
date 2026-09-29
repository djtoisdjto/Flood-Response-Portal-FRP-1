/**
 * Pre-Flood & Smart Relief Kit System Types
 * Pilot Area: Phibun Mangsahan Municipality (เทศบาลเมืองพิบูลมังสาหาร จ.อุบลราชธานี)
 */

export interface GoBagChecklistItem {
  id: string;
  category: 'critical' | 'documents' | 'medical' | 'subsistence' | 'sanitation' | 'communication';
  title: string;
  description: string;
  iconName: string;
  priority: 'must_have' | 'recommended' | 'optional';
  checked: boolean;
}

export interface HouseholdMemberDemographics {
  totalMembers: number;
  infantsAndToddlers: number; // 0-3 ขวบ (ทารก/เด็กเล็ก)
  children: number; // 4-12 ปี
  adults: number;
  elderly: number; // 60+ ปี
  bedriddenPatients: number; // ผู้ป่วยติดเตียง
  pregnantWomen: number; // สตรีมีครรภ์
  womenReproductiveAge: number; // ผู้หญิงวัยเจริญพันธุ์ (12-50 ปี)
  chronicDiseasePatients: number; // ผู้มีโรคประจำตัว (เบาหวาน ความดัน ไต)
  petsCount: number; // สุนัข แมว ปศุสัตว์
}

export interface SmartReliefKitItem {
  itemId: string;
  name: string;
  category: 'food' | 'water' | 'medical' | 'infant' | 'elderly' | 'women_hygiene' | 'special_care' | 'general';
  quantity: number;
  unit: string;
  reason: string; // เหตุผลที่คำนวณให้ (เช่น สำหรับทารก 1 คน, สำหรับผู้ป่วยติดเตียง)
  isSpecialNeed: boolean;
}

export interface ReliefDistributionRecord {
  distributionId: string;
  householdId: string;
  phase: number; // 1, 2, 3...
  distributedAt: string; // ISO date
  suppliesDurationDays: number; // วันที่ถุงยังชีพชุดนี้รองรับได้
  depletionDate: string; // วันที่ของจะหมด
  nextScheduledDeliveryDate: string; // วันที่ต้องแจกรอบถัดไป
  status: 'scheduled' | 'dispatched' | 'delivered' | 'critical_overdue';
  officerInCharge: string;
  notes?: string;
  kitItems: SmartReliefKitItem[];
}

export interface PhibunHousehold {
  id: string;
  houseNumber: string;
  communityName: string; // ชุมชนในเทศบาลเมืองพิบูลมังสาหาร เช่น ชุมชนสะพานโดม, ชุมชนดอนธาตุ, ชุมชนสนามบิน
  headOfHousehold: string;
  phone: string;
  lat: number;
  lng: number;
  floodRiskLevel: 'critical_high' | 'high' | 'medium' | 'low';
  demographics: HouseholdMemberDemographics;
  lastDistribution?: ReliefDistributionRecord;
  distributionHistory: ReliefDistributionRecord[];
  notes?: string;
}

export interface ReliefForecastSummary {
  totalHouseholds: number;
  totalBeneficiaries: number;
  dueTodayOrOverdueCount: number;
  dueIn3DaysCount: number;
  bedriddenCount: number;
  infantsCount: number;
  pregnantCount: number;
  specialKitsNeededCount: number;
}

export interface HistoricalSafeZone {
  id: string;
  name: string;
  type: 'temple' | 'hill' | 'school' | 'high_ground' | 'community_hall';
  elevationMeters?: number;
  lat: number;
  lng: number;
  historicalRecord: string; // สถิติน้ำท่วมในอดีต (เช่น ไม่เคยท่วมปี 2562, 2565)
  witnessCount: number; // จำนวนชาวบ้าน/สถิติที่ยืนยัน
  recommendation: string;
  accessRoute: string; // ทางเข้าหรือข้อควรระวัง
  district: string;
  subdistrict: string;
  verifiedByCommunity: boolean;
}

export interface CrowdsourcedClue {
  id: string;
  category: 'water_level' | 'stranded_person' | 'boat_available' | 'route_blocked' | 'safe_spot';
  locationName: string;
  lat: number;
  lng: number;
  description: string;
  waterLevelCm?: number;
  reporterName: string;
  reporterPhone?: string;
  timestamp: string;
  source: 'sms_fallback' | 'web_pwa' | 'local_radio' | 'rescue_volunteer';
  upvotes: number;
  verified: boolean;
}

export interface SMSDistressTemplate {
  targetPhone: string;
  emergencyType: string;
  peopleCount: number;
  needsBoat: boolean;
  needsMedical: boolean;
  notes: string;
  lat: number;
  lng: number;
}

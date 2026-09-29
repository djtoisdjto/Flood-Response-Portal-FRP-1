export interface AgencyOfficial {
  id: string;
  fullName: string;
  email: string; // Gmail
  agencyName: string; // เช่น เทศบาลเมืองพิบูลมังสาหาร, ปภ. อุบลฯ, กู้ภัยสว่างบูชาธรรม
  role: 'rescuer' | 'officer' | 'commander' | 'admin';
  customPasswordHash?: string; // รหัสผ่านที่เจ้าหน้าที่ตั้งเอง
  thaiDVerified: boolean;
  thaiDSub?: string; // ThaiD Digital ID identifier
  thaiDVerifiedAt?: string;
  phone?: string;
}

export interface OfficialAuthSession {
  isAuthenticated: boolean;
  official: AgencyOfficial | null;
  token?: string;
  loginAt?: string;
}

export interface ThaiDVerificationPayload {
  fullName: string;
  email: string;
  idCardLast4?: string;
  authCode?: string;
}

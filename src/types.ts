export type NeedCategory =
  | 'food_water'
  | 'medical'
  | 'baby_elderly'
  | 'clothing_blanket'
  | 'rescue_boat'
  | 'hygiene'
  | 'power_light'
  | 'other';

export type UrgencyLevel = 'critical' | 'high' | 'normal';

export type NeedStatus = 'pending' | 'claimed' | 'completed';

export interface NeedItem {
  id: string;
  title: string;
  category: NeedCategory;
  urgency: UrgencyLevel;
  status: NeedStatus;
  requesterName: string;
  contactPhone: string;
  locationName: string;
  lat: number;
  lng: number;
  quantity: string;
  notes?: string;
  createdAt: string;
  claimedBy?: {
    name: string;
    phone: string;
    vehicleOrNote?: string;
    estimatedArrivalMinutes?: number;
    claimedAt: string;
  };
  verifiedByAdmin?: boolean;
}

export type ShelterType = 'school' | 'temple' | 'government' | 'stadium' | 'community' | 'hospital';

export interface Shelter {
  id: string;
  name: string;
  type: ShelterType;
  currentOccupancy: number;
  maxCapacity: number;
  lat: number;
  lng: number;
  address: string;
  district: string;
  province: string;
  managerName: string;
  contactPhone: string;
  facilities: string[];
  accessibleForDisabled: boolean;
  petFriendly: boolean;
  notes?: string;
  lastUpdated: string;
}

export type OfflineActionType =
  | 'CLAIM_NEED'
  | 'CREATE_NEED'
  | 'TALLY_SHELTER'
  | 'COMPLETE_NEED'
  | 'UPDATE_SHELTER_MAX'
  | 'REGISTER_EVACUEE';

export interface Evacuee {
  id: string;
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  shelterId: string;
  shelterName?: string;
  originalVillage: string;
  status: 'safe' | 'medical_attention' | 'missing_relatives';
  contactPhone?: string;
  relativeContact?: string;
  registeredAt: string;
  notes?: string;
}

export interface OfflineQueueItem {
  id: string;
  action: OfflineActionType;
  payload: any;
  timestamp: number;
}

export interface UserLocation {
  lat: number;
  lng: number;
  accuracy?: number;
  isFallback?: boolean;
  locationLabel?: string;
}

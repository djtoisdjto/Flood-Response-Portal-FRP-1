export type IncidentType = 'accident' | 'flood_road' | 'road_closed' | 'hazard' | 'news';

export type IncidentSeverity = 'critical' | 'warning' | 'info';

export interface WarinIncident {
  id: string;
  title: string;
  type: IncidentType;
  severity: IncidentSeverity;
  locationName: string;
  subdistrict: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  reportedTime: string; // e.g. "10 นาทีที่แล้ว" or "28 ก.ย. 21:40"
  timestamp: number;
  description: string;
  trafficStatus: 'blocked' | 'heavy_delay' | 'small_vehicle_forbidden' | 'normal_caution';
  detourAdvice?: string;
  reporterSource: string;
  casualties?: string;
  upvotes?: number;
}

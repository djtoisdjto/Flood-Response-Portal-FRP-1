/**
 * Fallback location: ศาลากลางจังหวัดอุบลราชธานี
 */
export const UBON_FALLBACK_LOCATION = {
  lat: 15.2425,
  lng: 104.8472,
  name: 'ศาลากลางจังหวัดอุบลราชธานี',
};

/**
 * Haversine formula to compute distance between two latitude/longitude points in kilometers.
 */
export function calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Radius of earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Alias for calculateDistanceKm
export const calculateDistance = calculateDistanceKm;

/**
 * Format distance according to requirements:
 * - < 1 km: e.g. "850 ม."
 * - >= 1 km: e.g. "1.2 กม." (1 decimal place)
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)} ม.`;
  }
  return `${km.toFixed(1)} กม.`;
}

export const formatDistanceDisplay = formatDistance;

/**
 * DOM Auto-Update: วนลูปอัปเดต Element ที่แสดงระยะทาง (.distance-tag)
 * ทั้งในการ์ดศูนย์พักพิง และการ์ดโพสต์ขอความช่วยเหลือ
 */
export function updateAllDistancesUI(userLat: number, userLon: number): void {
  if (typeof document === 'undefined') return;

  const elements = document.querySelectorAll<HTMLElement>('.distance-tag');
  elements.forEach((el) => {
    const latStr = el.getAttribute('data-lat');
    const lngStr = el.getAttribute('data-lng');
    if (!latStr || !lngStr) return;

    const targetLat = parseFloat(latStr);
    const targetLon = parseFloat(lngStr);
    if (isNaN(targetLat) || isNaN(targetLon)) return;

    const km = calculateDistanceKm(userLat, userLon, targetLat, targetLon);
    el.textContent = `(${formatDistance(km)})`;
  });
}

/**
 * Geolocation: ดึงพิกัด GPS ปัจจุบันของผู้ใช้
 * หากปฏิเสธหรือไม่มี GPS จะ fallback เป็น ศาลากลาง จ.อุบลราชธานี [15.2425, 104.8472]
 */
export function getUserLocation(
  callback?: (coords: { lat: number; lng: number; isFallback: boolean }) => void
): Promise<{ lat: number; lng: number; isFallback: boolean }> {
  return new Promise((resolve) => {
    const handleSuccess = (lat: number, lng: number, isFallback: boolean) => {
      const result = { lat, lng, isFallback };
      updateAllDistancesUI(lat, lng);
      if (callback) callback(result);
      resolve(result);
    };

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          handleSuccess(pos.coords.latitude, pos.coords.longitude, false);
        },
        () => {
          // Fallback case: ปฏิเสธ หรือเกิดข้อผิดพลาด
          handleSuccess(UBON_FALLBACK_LOCATION.lat, UBON_FALLBACK_LOCATION.lng, true);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      // ไม่มี Geolocation API ในอุปกรณ์
      handleSuccess(UBON_FALLBACK_LOCATION.lat, UBON_FALLBACK_LOCATION.lng, true);
    }
  });
}

export function getGoogleMapsNavUrl(lat: number, lng: number, label?: string): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${label ? `&destination_place_id=${encodeURIComponent(label)}` : ''}`;
}

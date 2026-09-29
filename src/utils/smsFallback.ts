/**
 * SMS Fallback Utility for Emergency Distress
 * When internet connectivity is down or low, opens native SMS client
 * with pre-filled GPS coordinates and urgent rescue message.
 */

export interface SOSDistressParams {
  phone?: string;
  lat: number;
  lng: number;
  accuracy?: number;
  locationLabel?: string;
  peopleCount?: number;
  hasElderlyOrChildren?: boolean;
  needsBoat?: boolean;
  needsMedical?: boolean;
  details?: string;
}

/**
 * Builds standard distress SMS body
 */
export function buildSOSMessage(params: SOSDistressParams): string {
  const {
    lat,
    lng,
    accuracy,
    locationLabel,
    peopleCount = 1,
    hasElderlyOrChildren = false,
    needsBoat = true,
    needsMedical = false,
    details = '',
  } = params;

  const now = new Date();
  const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')} น.`;
  const mapsLink = `https://maps.google.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;

  let text = `[ด่วน! ขอความช่วยเหลืออุทกภัยอุบลฯ]\n`;
  text += `พิกัด GPS: ${lat.toFixed(6)}, ${lng.toFixed(6)}\n`;
  if (accuracy) text += `(ความแม่นยำ ~${Math.round(accuracy)} ม.)\n`;
  if (locationLabel) text += `สถานที่: ${locationLabel}\n`;
  text += `แผนที่: ${mapsLink}\n`;
  text += `จำนวนผู้ประสบภัย: ${peopleCount} คน\n`;

  const tags: string[] = [];
  if (needsBoat) tags.push('ต้องการเรือด่วน');
  if (needsMedical) tags.push('มีผู้ป่วย/ต้องการการแพทย์');
  if (hasElderlyOrChildren) tags.push('มีเด็ก/คนชรา/ผู้ป่วยติดเตียง');

  if (tags.length > 0) {
    text += `สถานะ: ${tags.join(', ')}\n`;
  }

  if (details.trim()) {
    text += `รายละเอียด: ${details.trim()}\n`;
  }

  text += `เวลาแจ้ง: ${timeStr} (ส่งผ่านระบบ Offline PWA SOS)`;
  return text;
}

/**
 * Creates cross-platform SMS URI
 * iOS uses "&body=" while Android / RFC uses "?body="
 */
export function createSmsUri(phone: string, body: string): string {
  const isIOS = typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent);
  const cleanPhone = phone.replace(/[^0-9+]/g, '');
  const encodedBody = encodeURIComponent(body);

  if (isIOS) {
    return `sms:${cleanPhone}&body=${encodedBody}`;
  }
  return `sms:${cleanPhone}?body=${encodedBody}`;
}

/**
 * Triggers native SMS application
 */
export function triggerNativeSMS(params: SOSDistressParams, targetPhone = '191'): { success: boolean; uri: string; message: string } {
  const message = buildSOSMessage(params);
  const uri = createSmsUri(targetPhone, message);

  try {
    // Attempt navigation to SMS URI
    window.location.href = uri;
    return { success: true, uri, message };
  } catch (err) {
    console.error('Failed to trigger SMS app:', err);
    return { success: false, uri, message };
  }
}

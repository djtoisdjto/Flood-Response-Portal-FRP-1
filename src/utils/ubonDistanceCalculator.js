/**
 * =========================================================================
 * Ubon Ratchathani Real Distance Calculator (Vanilla JavaScript)
 * ระบบคำนวณระยะทางจริงแบบ Dynamic จาก GPS ผู้ใช้ สำหรับระบบจัดการอุทกภัยอุบลราชธานี
 * =========================================================================
 */

// 1. พิกัดเริ่มต้น Fallback: ศาลากลางจังหวัดอุบลราชธานี
export const UBON_FALLBACK_COORDINATES = {
  lat: 15.2425,
  lng: 104.8472,
  name: 'ศาลากลางจังหวัดอุบลราชธานี'
};

// 2. ตัวอย่างข้อมูลศูนย์พักพิงในอุบลราชธานีพร้อมพิกัดจริง (Real Coordinates)
export const UBON_SHELTERS_DATA = [
  {
    id: 'shelter-1',
    name: 'โรงเรียนอุบลวิทยาคม',
    lat: 15.2285,
    lng: 104.8563,
    address: 'ถ.เขื่อนธานี ต.ในเมือง อ.เมืองอุบลราชธานี'
  },
  {
    id: 'shelter-2',
    name: 'วิทยาลัยเทคนิคอุบลราชธานี',
    lat: 15.2341,
    lng: 104.8475,
    address: 'ถ.แจ้งสนิท ต.ในเมือง อ.เมืองอุบลราชธานี'
  },
  {
    id: 'shelter-3',
    name: 'หอประชุมที่ว่าการอำเภอวารินชำราบ',
    lat: 15.1962,
    lng: 104.8598,
    address: 'ถ.สถลมาร์ค ต.วารินชำราบ อ.วารินชำราบ'
  },
  {
    id: 'shelter-4',
    name: 'วัดมหาวนาราม พระอารามหลวง (วัดป่าใหญ่)',
    lat: 15.2328,
    lng: 104.8614,
    address: 'ถ.หลวง ต.ในเมือง อ.เมืองอุบลราชธานี'
  },
  {
    id: 'shelter-5',
    name: 'โรงเรียนเทศบาล 2 หนองบัว',
    lat: 15.2491,
    lng: 104.8522,
    address: 'ต.ในเมือง อ.เมืองอุบลราชธานี'
  },
  {
    id: 'shelter-6',
    name: 'มหาวิทยาลัยอุบลราชธานี',
    lat: 15.1189,
    lng: 104.9031,
    address: 'ถ.สถลมาร์ค ต.เมืองศรีไค อ.วารินชำราบ'
  }
];

/**
 * 3. Haversine Formula คำนวณระยะทางตามความโค้งของโลก
 * @param {number} lat1 ละติจูดจุดเริ่มต้น
 * @param {number} lon1 ลองจิจูดจุดเริ่มต้น
 * @param {number} lat2 ละติจูดจุดเป้าหมาย
 * @param {number} lon2 ลองจิจูดจุดเป้าหมาย
 * @returns {number} ระยะทางเป็นกิโลเมตร (km)
 */
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // รัศมีของโลกโดยเฉลี่ย (กิโลเมตร)
  const toRad = (degree) => (degree * Math.PI) / 180;

  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * ฟังก์ชันจัดรูปแบบการแสดงผลระยะทาง:
 * - ถ้าระยะทางน้อยกว่า 1 กม. แสดงเป็นเมตร เช่น "850 ม."
 * - ถ้าระยะทางตั้งแต่ 1 กม. ขึ้นไป แสดงเป็นกิโลเมตร ทศนิยม 1 ตำแหน่ง เช่น "1.2 กม."
 * @param {number} km ระยะทางเป็นกิโลเมตร
 * @returns {string} ข้อความระยะทางพร้อมหน่วย
 */
export function formatDistanceDisplay(km) {
  if (km < 1) {
    return `${Math.round(km * 1000)} ม.`;
  }
  return `${km.toFixed(1)} กม.`;
}

/**
 * 4. DOM Auto-Update: วนลูปอัปเดต Element ที่แสดงระยะทาง (.distance-tag) บนหน้าเว็บทันที
 * โดยอ่านพิกัดเป้าหมายจาก data-lat และ data-lng ของ Element
 * @param {number} userLat ละติจูดของผู้ใช้
 * @param {number} userLon ลองจิจูดของผู้ใช้
 */
export function updateAllDistancesUI(userLat, userLon) {
  if (typeof document === 'undefined') return;

  const distanceElements = document.querySelectorAll('.distance-tag');

  distanceElements.forEach((el) => {
    const targetLat = parseFloat(el.getAttribute('data-lat'));
    const targetLon = parseFloat(el.getAttribute('data-lng'));

    if (!isNaN(targetLat) && !isNaN(targetLon)) {
      const distKm = calculateDistance(userLat, userLon, targetLat, targetLon);
      el.textContent = `(${formatDistanceDisplay(distKm)})`;
    }
  });
}

/**
 * 5. ดึงพิกัด GPS ปัจจุบันของผู้ใช้ผ่าน HTML5 Geolocation API
 * พร้อม Fallback เป็น ศาลากลางจังหวัดอุบลราชธานี เมื่อถูกปฏิเสธหรือไม่รองรับ
 * @param {function} [onSuccess] Callback เมื่อได้พิกัดสำเร็จ (lat, lng, isFallback)
 * @param {function} [onError] Callback เมื่อเกิด Error
 * @returns {Promise<{lat: number, lng: number, isFallback: boolean}>}
 */
export function getUserLocation(onSuccess, onError) {
  return new Promise((resolve) => {
    // ฟังก์ชันช่วยจัดการผลลัพธ์
    const handleResult = (coords, isFallback) => {
      // อัปเดต UI บนหน้าเว็บโดยอัตโนมัติทันทีที่ได้พิกัด
      updateAllDistancesUI(coords.lat, coords.lng);

      if (typeof onSuccess === 'function') {
        onSuccess(coords.lat, coords.lng, isFallback);
      }
      resolve({ lat: coords.lat, lng: coords.lng, isFallback });
    };

    if (typeof navigator !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // ได้รับพิกัด GPS จริงจากอุปกรณ์
          const realCoords = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          handleResult(realCoords, false);
        },
        (error) => {
          // Fallback Case: ผู้ใช้ปฏิเสธการเข้าถึง หรือไม่สามารถระบุตำแหน่งได้
          console.warn('[Geolocation] ใช้พิกัดสำรองศาลากลาง จ.อุบลราชธานี เนื่องจาก:', error.message);
          if (typeof onError === 'function') {
            onError(error);
          }
          handleResult(UBON_FALLBACK_COORDINATES, true);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 60000
        }
      );
    } else {
      // Fallback Case: เบราว์เซอร์หรืออุปกรณ์ไม่รองรับ Geolocation
      console.warn('[Geolocation] เบราว์เซอร์ไม่รองรับ GPS, ใช้พิกัดสำรองศาลากลาง จ.อุบลราชธานี');
      handleResult(UBON_FALLBACK_COORDINATES, true);
    }
  });
}

// ผูกเข้ากับ window object สำหรับรันหรือทดสอบใน Console ได้ทันที
if (typeof window !== 'undefined') {
  window.UbonDistanceCalculator = {
    UBON_FALLBACK_COORDINATES,
    UBON_SHELTERS_DATA,
    calculateDistance,
    formatDistanceDisplay,
    updateAllDistancesUI,
    getUserLocation
  };
}

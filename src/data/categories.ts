import { NeedCategory } from '../types';

export interface CategoryMeta {
  id: NeedCategory;
  label: string;
  iconName: string;
  badgeBg: string;
  badgeText: string;
  description: string;
}

export const CATEGORIES: Record<NeedCategory, CategoryMeta> = {
  food_water: {
    id: 'food_water',
    label: 'น้ำดื่มและอาหาร',
    iconName: 'Droplets',
    badgeBg: 'bg-blue-50 border-blue-200',
    badgeText: 'text-blue-800',
    description: 'น้ำดื่มสะอาด, ข้าวสาร, อาหารแห้ง, ข้าวกล่องปรุงสุก',
  },
  medical: {
    id: 'medical',
    label: 'ยารักษาโรค / ปฐมพยาบาล',
    iconName: 'HeartPulse',
    badgeBg: 'bg-rose-50 border-rose-200',
    badgeText: 'text-rose-800',
    description: 'ยาประจำตัว, ยาน้ำกัดเท้า, ชุดทำแผล, ยาลดไข้',
  },
  baby_elderly: {
    id: 'baby_elderly',
    label: 'เด็กอ่อน / ผู้สูงอายุ',
    iconName: 'Baby',
    badgeBg: 'bg-purple-50 border-purple-200',
    badgeText: 'text-purple-800',
    description: 'แพมเพิสเด็ก-ผู้ใหญ่, นมผง, แผ่นรองซับ, รถเข็น',
  },
  rescue_boat: {
    id: 'rescue_boat',
    label: 'เรือ / อุปกรณ์กู้ภัย',
    iconName: 'LifeBuoy',
    badgeBg: 'bg-amber-50 border-amber-200',
    badgeText: 'text-amber-900',
    description: 'เรือยาง, เรือพาย, เสื้อชูชีพ, เชือกกู้ภัย, ไฟส่องสว่าง',
  },
  clothing_blanket: {
    id: 'clothing_blanket',
    label: 'เครื่องนุ่งห่ม / กันหนาว',
    iconName: 'Shirt',
    badgeBg: 'bg-teal-50 border-teal-200',
    badgeText: 'text-teal-800',
    description: 'ผ้าห่ม, เสื้อกันหนาว, เสื้อผ้าแห้ง, ผ้าเช็ดตัว',
  },
  power_light: {
    id: 'power_light',
    label: 'ไฟฟ้า / แสงสว่าง',
    iconName: 'Zap',
    badgeBg: 'bg-yellow-50 border-yellow-200',
    badgeText: 'text-yellow-900',
    description: 'ไฟฉาย, ถ่านไฟฉาย, พาวเวอร์แบงก์, เครื่องปั่นไฟ',
  },
  hygiene: {
    id: 'hygiene',
    label: 'สุขอนามัย / ถุงยังชีพ',
    iconName: 'Sparkles',
    badgeBg: 'bg-emerald-50 border-emerald-200',
    badgeText: 'text-emerald-800',
    description: 'ถุงขยะดำ, กระดาษทิชชู่, สบู่, ผ้าอนามัย, น้ำยาฆ่าเชื้อ',
  },
  other: {
    id: 'other',
    label: 'ความช่วยเหลืออื่นๆ',
    iconName: 'HelpCircle',
    badgeBg: 'bg-stone-50 border-stone-200',
    badgeText: 'text-stone-800',
    description: 'อาหารสัตว์, อุปกรณ์ซ่อมแซม, การขนส่ง',
  },
};

// ═══════════════════════════════════════════════════════════════
//  USKUNA RASM XARITASI
//  Har bir uskuna turi yoki IDsi uchun transparent PNG path
//  va harorat indikator nuqtalarini saqlaydi.
// ═══════════════════════════════════════════════════════════════

// Rasm fayllari: /public/images/uskunalar/ papkaga joylashtiring
// Fayl nomi: tur_id.png (masalan: pech_001.png, konverter_001.png)

/**
 * Uskuna turi bo'yicha default rasm
 * Agar aniq ID uchun rasm bo'lmasa, tur bo'yicha fallback ishlatiladi
 */
// Hozircha barcha turlar uchun bitta rasm ishlatiladi.
// Keyinchalik har bir tur uchun alohida transparent PNG tayyorlab qo'ying:
//   Pech: "/images/uskunalar/pech.png",
//   Konverter: "/images/uskunalar/konverter.png",
//   ...
const DEFAULT_IMG = "/images/Electric Arc Furnace in action.png";

const TUR_IMAGES = {
  Pech: DEFAULT_IMG,
  Konverter: DEFAULT_IMG,
  "Elektr Pech": DEFAULT_IMG,
  Prokat: DEFAULT_IMG,
  Nasos: DEFAULT_IMG,
  Kran: DEFAULT_IMG,
  Kesish: DEFAULT_IMG,
  Transport: DEFAULT_IMG,
  Sensor: DEFAULT_IMG,
  Manipulator: DEFAULT_IMG,
  Press: DEFAULT_IMG,
  Sovitish: DEFAULT_IMG,
  Tekislash: DEFAULT_IMG,
  Qadoqlash: DEFAULT_IMG,
};

/**
 * Alohida uskunalar uchun maxsus rasm
 * (bir turda bir nechta turli ko'rinishdagi uskuna bo'lsa)
 */
const ID_IMAGES = {
  // Masalan:
  "USK-001": "/images/uskunalar/klet.png",
  "USK-002": "/images/uskunalar/vakuum.png",
};

/**
 * Har bir uskuna turi uchun harorat indikator nuqtalari
 *
 * x, y — foizda (rasmga nisbatan)
 * temp — default harorat (API dan kelsa override bo'ladi)
 * color — rang ("auto" bo'lsa haroratga qarab hisoblanadi)
 * side — label qaysi tomonda chiqadi ("left" | "right")
 * key — uskuna parametridan qaysi fieldni ishlatish (ixtiyoriy)
 * pulse — animated bo'lsinmi
 */
const TUR_TEMP_POINTS = {
  "Elektr Pech": [
    { x: 65, y: 10, side: "right", key: "haroratYuqori", color: "#ffd60a" },
    { x: 20, y: 25, side: "left", key: "haroratChap", color: "#00e676" },
    { x: 22, y: 38, side: "left", color: "#ffd60a" },
    { x: 55, y: 20, side: "right", color: "#00e676" },
    { x: 58, y: 35, side: "right", color: "#ffd60a" },
    { x: 60, y: 45, side: "right", color: "#00e676" },
    { x: 88, y: 28, side: "right", color: "#ff6b1a", pulse: true },
    { x: 18, y: 50, side: "left", color: "#00e676" },
    { x: 15, y: 62, side: "left", color: "#00e676" },
    { x: 28, y: 80, side: "left", color: "#00d4ff" },
  ],
  Pech: [
    { x: 50, y: 5, side: "right", color: "#ffd60a", pulse: true },
    { x: 20, y: 30, side: "left", color: "#ff6b1a" },
    { x: 80, y: 30, side: "right", color: "#ff6b1a" },
    { x: 50, y: 55, side: "right", color: "#00e676" },
    { x: 30, y: 75, side: "left", color: "#00d4ff" },
    { x: 70, y: 85, side: "right", color: "#00d4ff" },
  ],
  Konverter: [
    { x: 50, y: 8, side: "right", color: "#ffd60a", pulse: true },
    { x: 25, y: 35, side: "left", color: "#ff6b1a" },
    { x: 75, y: 35, side: "right", color: "#ff6b1a" },
    { x: 50, y: 60, side: "right", color: "#00e676" },
    { x: 80, y: 70, side: "right", color: "#00d4ff" },
  ],
  Prokat: [
    { x: 15, y: 40, side: "left", color: "#ff6b1a" },
    { x: 50, y: 30, side: "right", color: "#ffd60a" },
    { x: 85, y: 40, side: "right", color: "#00e676" },
    { x: 50, y: 70, side: "left", color: "#00d4ff" },
  ],
  Nasos: [
    { x: 30, y: 25, side: "left", color: "#00d4ff" },
    { x: 70, y: 25, side: "right", color: "#00d4ff" },
    { x: 50, y: 60, side: "right", color: "#00e676" },
  ],
  Kran: [
    { x: 50, y: 15, side: "right", color: "#ffd60a" },
    { x: 30, y: 50, side: "left", color: "#00e676" },
    { x: 70, y: 70, side: "right", color: "#00d4ff" },
  ],
};

// Default fallback (agar turga mos nuqtalar topilmasa)
const DEFAULT_TEMP_POINTS = [
  { x: 50, y: 15, side: "right", color: "#ffd60a", pulse: true },
  { x: 25, y: 40, side: "left", color: "#ff6b1a" },
  { x: 75, y: 40, side: "right", color: "#00e676" },
  { x: 50, y: 70, side: "right", color: "#00d4ff" },
];

/**
 * Uskuna uchun rasm pathini qaytaradi
 * Avval ID bo'yicha, keyin tur bo'yicha qidiradi
 */
export function getUskunaImage(uskuna) {
  if (ID_IMAGES[uskuna.id]) return ID_IMAGES[uskuna.id];
  if (TUR_IMAGES[uskuna.tur]) return TUR_IMAGES[uskuna.tur];
  return DEFAULT_IMG;
}

/**
 * Uskuna uchun harorat nuqtalarini qaytaradi
 * Real parametrlar bo'lsa, temp qiymatini hisoblab beradi
 */
export function getUskunaTempPoints(uskuna) {
  const basePts = TUR_TEMP_POINTS[uskuna.tur] || DEFAULT_TEMP_POINTS;

  return basePts.map((pt) => {
    let temp;

    // Agar key berilgan bo'lsa, uskunadan shu fieldni olishga harakat qil
    if (pt.key && uskuna[pt.key] != null) {
      temp = uskuna[pt.key];
    } else {
      // Haroratni taxminiy hisoblash (bazaviy harorat ± random)
      const base = uskuna.harorat || 35;
      const variance = base > 100 ? base * 0.05 : 5;
      temp = +(base - variance + Math.random() * variance * 2).toFixed(1);
    }

    // Rangni avtomatik aniqlash (agar "auto" bo'lsa)
    let color = pt.color;
    if (color === "auto") {
      if (temp > 50) color = "#ff6b1a";
      else if (temp > 40) color = "#ffd60a";
      else color = "#00e676";
    }

    return { ...pt, temp, color };
  });
}

/**
 * Holat rangini qaytaradi
 */
export function getHolatColor(holat) {
  if (holat === "faol") return "#00e676";
  if (holat === "ogohlantirish") return "#ffd60a";
  return "#ff2d55";
}

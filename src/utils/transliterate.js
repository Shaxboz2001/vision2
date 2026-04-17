const latinToCyrillicRules = [
  [/G‘/g, "Ғ"],
  [/G'/g, "Ғ"],
  [/g‘/g, "ғ"],
  [/g'/g, "ғ"],
  [/O‘/g, "Ў"],
  [/O'/g, "Ў"],
  [/o‘/g, "ў"],
  [/o'/g, "ў"],

  [/SH/g, "Ш"],
  [/Sh/g, "Ш"],
  [/sh/g, "ш"],

  [/CH/g, "Ч"],
  [/Ch/g, "Ч"],
  [/ch/g, "ч"],

  [/YO/g, "Ё"],
  [/Yo/g, "Ё"],
  [/yo/g, "ё"],

  [/YU/g, "Ю"],
  [/Yu/g, "Ю"],
  [/yu/g, "ю"],

  [/YA/g, "Я"],
  [/Ya/g, "Я"],
  [/ya/g, "я"],

  [/A/g, "А"],
  [/a/g, "а"],
  [/B/g, "Б"],
  [/b/g, "б"],
  [/D/g, "Д"],
  [/d/g, "д"],
  [/E/g, "Е"],
  [/e/g, "е"],
  [/F/g, "Ф"],
  [/f/g, "ф"],
  [/G/g, "Г"],
  [/g/g, "г"],
  [/H/g, "Ҳ"],
  [/h/g, "ҳ"],
  [/I/g, "И"],
  [/i/g, "и"],
  [/J/g, "Ж"],
  [/j/g, "ж"],
  [/K/g, "К"],
  [/k/g, "к"],
  [/L/g, "Л"],
  [/l/g, "л"],
  [/M/g, "М"],
  [/m/g, "м"],
  [/N/g, "Н"],
  [/n/g, "н"],
  [/O/g, "О"],
  [/o/g, "о"],
  [/P/g, "П"],
  [/p/g, "п"],
  [/Q/g, "Қ"],
  [/q/g, "қ"],
  [/R/g, "Р"],
  [/r/g, "р"],
  [/S/g, "С"],
  [/s/g, "с"],
  [/T/g, "Т"],
  [/t/g, "т"],
  [/U/g, "У"],
  [/u/g, "у"],
  [/V/g, "В"],
  [/v/g, "в"],
  [/X/g, "Х"],
  [/x/g, "х"],
  [/Y/g, "Й"],
  [/y/g, "й"],
  [/Z/g, "З"],
  [/z/g, "з"],
  [/'/g, "ъ"],
];

const customWordMap = {
  innovatsion: "инновацион",
  Innovatsion: "Инновацион",
  INNOVATSION: "ИННОВАЦИОН",

  raqamli: "рақамли",
  Raqamli: "Рақамли",
  RAQAMLI: "РАҚАМЛИ",

  xavfsiz: "хавфсиз",
  Xavfsiz: "Хавфсиз",
  XAVFSIZ: "ХАВФСИЗ",

  kombinat: "комбинат",
  Kombinat: "Комбинат",
  KOMBINAT: "КОМБИНАТ",

  boshqaruvi: "бошқаруви",
  Boshqaruvi: "Бошқаруви",
  BOSHQARUVI: "БОШҚАРУВИ",

  "bo'linmalar": "бўлинмалар",
  "Bo'linmalar": "Бўлинмалар",
  "BO'LINMALAR": "БЎЛИНМАЛАР",
};

function applyCustomWords(text = "") {
  let result = String(text);

  for (const [from, to] of Object.entries(customWordMap)) {
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    result = result.replace(new RegExp(`\\b${escaped}\\b`, "g"), to);
  }

  return result;
}

export function latinToCyrillic(text = "") {
  let result = String(text);

  // 1. Avval custom so‘zlar
  result = applyCustomWords(result);

  // 2. Avval murakkab kombinatsiyalar
  const complexRules = latinToCyrillicRules.slice(0, 23);
  const simpleRules = latinToCyrillicRules.slice(23);

  for (const [pattern, value] of complexRules) {
    result = result.replace(pattern, value);
  }

  // 3. Keyin oddiy harflar
  for (const [pattern, value] of simpleRules) {
    result = result.replace(pattern, value);
  }

  return result;
}

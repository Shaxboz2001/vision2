#!/usr/bin/env node

/**
 * O'zbek lotin → kirill transliteratsiya scripti
 * 
 * Ishlatish:
 *   node lat2cyr.mjs src/i18n/locales/lat.json src/i18n/locales/cyr.json
 * 
 * Qayta ishga tushirsangiz cyr.json ustiga yoziladi.
 * Shuning uchun avval qo'lda tuzatgan joylaringizni yo'qotmaslik uchun
 * --merge rejimidan foydalaning:
 *   node lat2cyr.mjs src/i18n/locales/lat.json src/i18n/locales/cyr.json --merge
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';

// ============================================================
// Transliteratsiya xaritasi
// Digraflar (2-3 belgili) birinchi tekshiriladi, keyin yakka harflar
// ============================================================

// MUHIM: Apostrof-li digraflar (o', g') birinchi tekshiriladi,
// chunki "Yo'q" = Y+o'+q (Йўқ), "Yo" digraf emas!
const DIGRAPHS_APOSTROPHE = [
  ["O'", "Ў"], ["o'", "ў"], ["Oʻ", "Ў"], ["oʻ", "ў"], ["O`", "Ў"], ["o`", "ў"],
  ["G'", "Ғ"], ["g'", "ғ"], ["Gʻ", "Ғ"], ["gʻ", "ғ"], ["G`", "Ғ"], ["g`", "ғ"],
];

const DIGRAPHS_REGULAR = [
  ["Sh", "Ш"], ["sh", "ш"],
  ["Ch", "Ч"], ["ch", "ч"],
  ["Yo", "Ё"], ["yo", "ё"],
  ["Yu", "Ю"], ["yu", "ю"],
  ["Ya", "Я"], ["ya", "я"],
  ["Ye", "Е"], ["ye", "е"],
  ["Ts", "Ц"], ["ts", "ц"],
];

const SINGLE = {
  'A': 'А', 'a': 'а',
  'B': 'Б', 'b': 'б',
  'D': 'Д', 'd': 'д',
  'E': 'Е', 'e': 'е', // (э — so'z boshida istisnolar bor, lekin amalda е ishlatiladi)
  'F': 'Ф', 'f': 'ф',
  'G': 'Г', 'g': 'г',
  'H': 'Ҳ', 'h': 'ҳ',
  'I': 'И', 'i': 'и',
  'J': 'Ж', 'j': 'ж',
  'K': 'К', 'k': 'к',
  'L': 'Л', 'l': 'л',
  'M': 'М', 'm': 'м',
  'N': 'Н', 'n': 'н',
  'O': 'О', 'o': 'о',
  'P': 'П', 'p': 'п',
  'Q': 'Қ', 'q': 'қ',
  'R': 'Р', 'r': 'р',
  'S': 'С', 's': 'с',
  'T': 'Т', 't': 'т',
  'U': 'У', 'u': 'у',
  'V': 'В', 'v': 'в',
  'X': 'Х', 'x': 'х',
  'Y': 'Й', 'y': 'й',
  'Z': 'З', 'z': 'з',
};

// Unlilар — ye/yo/ya/yu digraflarini so'z boshida yoki unlidan keyin aniqlash uchun
const VOWELS = new Set('aeiouAEIOUаеиоуўАЕИОУЎ');

/**
 * Bitta stringni lotin → kirill ga o'giradi
 * {{placeholder}} lar o'zgartirilmaydi
 */
function transliterate(text) {
  // 1. Placeholderlarni himoyalash (harfsiz marker ishlatamiz)
  const placeholders = [];
  const protected_ = text.replace(/\{\{.*?\}\}/g, (match) => {
    placeholders.push(match);
    return `\x01${placeholders.length - 1}\x02`;
  });

  let result = '';
  let i = 0;
  const src = protected_;

  while (i < src.length) {
    let matched = false;

    // 2. Placeholder markerlarni skip qil
    if (src[i] === '\x01') {
      const end = src.indexOf('\x02', i);
      if (end !== -1) {
        result += src.substring(i, end + 1);
        i = end + 1;
        continue;
      }
    }

    // 3. Avval apostrof-li digraflar (o', g') — eng yuqori prioritet
    for (const [lat, cyr] of DIGRAPHS_APOSTROPHE) {
      if (src.substring(i, i + lat.length) === lat) {
        result += cyr;
        i += lat.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // 4. Oddiy digraflar (sh, ch, yo, ya, yu, ye, ts)
    for (const [lat, cyr] of DIGRAPHS_REGULAR) {
      if (src.substring(i, i + lat.length) === lat) {
        // "Yo/Yu/Ya/Ye" faqat so'z boshida yoki unlidan keyin
        if (['yo', 'yu', 'ya', 'ye'].includes(lat.toLowerCase())) {
          const prevChar = i > 0 ? src[i - 1] : null;
          const isWordStart = !prevChar || /[\s\-.,;:!?()"'«»_]/.test(prevChar);
          const afterVowel = prevChar && VOWELS.has(prevChar);
          if (!isWordStart && !afterVowel) {
            break;
          }
        }

        // "Yo" dan keyin apostrof kelsa, bu "Y + o'" demak (Masalan: Yo'q = Йўқ)
        if (['yo', 'ya'].includes(lat.toLowerCase())) {
          const nextChar = src[i + lat.length];
          if (nextChar === "'" || nextChar === "ʻ" || nextChar === "`") {
            break; // digraf emas — alohida harf sifatida davom et
          }
        }

        result += cyr;
        i += lat.length;
        matched = true;
        break;
      }
    }
    if (matched) continue;

    // 5. Yakka apostrof — tutuq belgisi (ъ)
    if (src[i] === "'" || src[i] === "ʻ" || src[i] === "`") {
      result += 'ъ';
      i++;
      continue;
    }

    // 6. Yakka harflar
    if (SINGLE[src[i]]) {
      result += SINGLE[src[i]];
      i++;
      continue;
    }

    // 7. Boshqa belgilar o'zgarmaydi
    result += src[i];
    i++;
  }

  // 8. Placeholderlarni qaytarish
  return result.replace(/\x01(\d+)\x02/g, (_, idx) => placeholders[parseInt(idx)]);
}

/**
 * JSON obyektni rekursiv transliteratsiya qiladi
 */
function transliterateObject(obj) {
  if (typeof obj === 'string') {
    return transliterate(obj);
  }
  if (Array.isArray(obj)) {
    return obj.map(transliterateObject);
  }
  if (typeof obj === 'object' && obj !== null) {
    const out = {};
    for (const [key, value] of Object.entries(obj)) {
      out[key] = transliterateObject(value); // keylar o'zgarmaydi
    }
    return out;
  }
  return obj; // number, boolean, null
}

/**
 * Deep merge: mavjud cyr.json dagi qo'lda tuzatilgan qiymatlarni saqlaydi,
 * faqat YANGI keylarni qo'shadi
 */
function deepMerge(existing, generated) {
  if (typeof generated === 'string') {
    return existing !== undefined ? existing : generated;
  }
  if (typeof generated === 'object' && generated !== null && !Array.isArray(generated)) {
    const out = { ...generated };
    for (const key of Object.keys(generated)) {
      if (existing && typeof existing === 'object' && key in existing) {
        out[key] = deepMerge(existing[key], generated[key]);
      }
    }
    return out;
  }
  return existing !== undefined ? existing : generated;
}

// ============================================================
// CLI
// ============================================================

const args = process.argv.slice(2);
const mergeMode = args.includes('--merge');
const files = args.filter(a => !a.startsWith('--'));

if (files.length < 1) {
  console.log('Ishlatish: node lat2cyr.mjs <lat.json> [cyr.json] [--merge]');
  console.log('  --merge  Mavjud cyr.json dagi qo\'lda tuzatilgan qiymatlarni saqlaydi');
  process.exit(1);
}

const inputPath = files[0];
const outputPath = files[1] || inputPath.replace('lat', 'cyr');

const latData = JSON.parse(readFileSync(inputPath, 'utf-8'));
const generated = transliterateObject(latData);

let finalData = generated;

if (mergeMode && existsSync(outputPath)) {
  const existing = JSON.parse(readFileSync(outputPath, 'utf-8'));
  finalData = deepMerge(existing, generated);
  console.log(`✅ Merge rejimi: mavjud tarjimalar saqlanadi, yangilari qo'shiladi`);
}

writeFileSync(outputPath, JSON.stringify(finalData, null, 2) + '\n', 'utf-8');

// Statistika
function countKeys(obj) {
  if (typeof obj === 'string') return 1;
  if (typeof obj === 'object' && obj !== null) {
    return Object.values(obj).reduce((sum, v) => sum + countKeys(v), 0);
  }
  return 0;
}

const total = countKeys(finalData);
console.log(`✅ ${outputPath} yaratildi — ${total} ta string transliteratsiya qilindi`);

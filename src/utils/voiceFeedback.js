// utils/voiceFeedback.js
//
// Tayyor MP3 fayllarni ijro etadi.
// Fayllar: public/audio/ papkasida turadi.
//
// Preload qilinadi — boshlanganda yuklab olinadi, keyin bir zumda ijro etadi.

const SOUNDS = {
  accepted:   "/audio/qabul_qilindi.mp3",
  processing: "/audio/tekshirilmoqda.mp3",
  opened:     "/audio/sahifa_ochildi.mp3",
  retry:      "/audio/qaytadan_urin.mp3",
};

// Preloaded audio elementlar
const _cache = {};
let _currentAudio = null;

// ─── Preload ──────────────────────────────────────────
function preload() {
  for (const [key, src] of Object.entries(SOUNDS)) {
    const audio = new Audio(src);
    audio.preload = "auto";
    audio.volume = 0.85;
    // Brauzer cache ga yuklash
    audio.load();
    _cache[key] = audio;
  }
}

// ─── Play ─────────────────────────────────────────────
/**
 * Ovozni ijro etish.
 *
 * @param {"accepted"|"processing"|"opened"|"retry"} key
 * @returns {Promise<void>} — ijro tugaganda resolve bo'ladi
 */
function speak(key) {
  return new Promise((resolve) => {
    // Avvalgisini to'xtatish
    if (_currentAudio) {
      _currentAudio.pause();
      _currentAudio.currentTime = 0;
      _currentAudio = null;
    }

    const cached = _cache[key];
    if (!cached) {
      resolve();
      return;
    }

    // Clone — bir vaqtda bir necha marta play qilish uchun
    const audio = cached.cloneNode();
    audio.volume = 0.85;
    _currentAudio = audio;

    audio.onended = () => {
      _currentAudio = null;
      resolve();
    };

    audio.onerror = () => {
      _currentAudio = null;
      resolve();
    };

    audio.play().catch(() => {
      _currentAudio = null;
      resolve();
    });
  });
}

// ─── Status ───────────────────────────────────────────
function isSpeaking() {
  return _currentAudio !== null && !_currentAudio.paused;
}

function stop() {
  if (_currentAudio) {
    _currentAudio.pause();
    _currentAudio.currentTime = 0;
    _currentAudio = null;
  }
}

// Init
if (typeof window !== "undefined") {
  preload();
}

export const voiceFeedback = { speak, isSpeaking, stop };

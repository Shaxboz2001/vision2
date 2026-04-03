// hooks/useWakeWord.js
import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Wake word detection hook — Web Speech API orqali doimiy tinglaydi.
 *
 * "Durdona" eshitilganda onWakeWord() chaqiriladi.
 *
 * Web Speech API brauzerda bepul ishlaydi, resurs kam sarflaydi.
 * Whisper faqat wake word dan keyin ishga tushadi.
 */

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export function useWakeWord({
  wakeWord = "durdona",
  onWakeWord,
  enabled = true,
}) {
  const [isActive, setIsActive] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const recognitionRef = useRef(null);
  const restartTimeoutRef = useRef(null);

  const startListening = useCallback(() => {
    if (!SpeechRecognition) {
      console.warn("SpeechRecognition API mavjud emas");
      return;
    }

    // Avvalgisini to'xtatish
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ru-RU"; // Rus/O'zbek aralash uchun
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        // Barcha alternativalarni tekshirish
        for (let j = 0; j < event.results[i].length; j++) {
          const text = event.results[i][j].transcript.toLowerCase().trim();
          setLastHeard(text);

          // Wake word bor-yo'qligini tekshirish
          if (text.includes(wakeWord.toLowerCase())) {
            console.log(`Wake word aniqlandi: "${text}"`);
            // Vaqtincha to'xtatish — command recording boshlanishi uchun
            recognition.abort();
            onWakeWord?.();
            // 4 sekunddan keyin qayta tinglash (command recording tugagandan keyin)
            restartTimeoutRef.current = setTimeout(() => {
              startListening();
            }, 5000);
            return;
          }
        }
      }
    };

    recognition.onerror = (event) => {
      // "no-speech" va "aborted" — normal holatlar, restart qilish
      if (event.error === "no-speech" || event.error === "aborted") {
        return;
      }
      console.warn("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
      // Avtomatik restart — doimiy tinglash uchun
      if (enabled) {
        restartTimeoutRef.current = setTimeout(() => {
          startListening();
        }, 300);
      }
    };

    try {
      recognition.start();
      recognitionRef.current = recognition;
      setIsActive(true);
    } catch (err) {
      console.error("Speech recognition start error:", err);
    }
  }, [wakeWord, onWakeWord, enabled]);

  const stopListening = useCallback(() => {
    setIsActive(false);
    clearTimeout(restartTimeoutRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
      recognitionRef.current = null;
    }
  }, []);

  // Auto-start/stop based on enabled flag
  useEffect(() => {
    if (enabled) {
      startListening();
    } else {
      stopListening();
    }
    return () => stopListening();
  }, [enabled, startListening, stopListening]);

  return {
    isActive,
    lastHeard,
    startListening,
    stopListening,
  };
}

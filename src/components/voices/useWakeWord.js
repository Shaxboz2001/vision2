// hooks/useWakeWord.js
import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Wake word detection — Web Speech API orqali doimiy tinglaydi.
 * "Muhlisa" eshitilganda onWakeWord() chaqiriladi.
 */

const SpeechRecognition =
  typeof window !== "undefined"
    ? window.SpeechRecognition || window.webkitSpeechRecognition
    : null;

export function useWakeWord({
  wakeWord = "muhlisa",
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

    if (recognitionRef.current) {
      try {
        recognitionRef.current.abort();
      } catch {}
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "ru-RU";
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      for (let i = event.resultIndex; i < event.results.length; i++) {
        for (let j = 0; j < event.results[i].length; j++) {
          const text = event.results[i][j].transcript.toLowerCase().trim();
          setLastHeard(text);

          if (text.includes(wakeWord.toLowerCase())) {
            console.log(`Wake word aniqlandi: "${text}"`);
            recognition.abort();
            onWakeWord?.();
            // Command recording tugagandan keyin qayta tinglash
            restartTimeoutRef.current = setTimeout(() => {
              startListening();
            }, 5000);
            return;
          }
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech" || event.error === "aborted") return;
      console.warn("Speech recognition error:", event.error);
    };

    recognition.onend = () => {
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

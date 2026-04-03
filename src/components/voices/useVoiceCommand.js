// hooks/useVoiceCommand.js
import { useState, useRef, useCallback } from "react";

const VOICE_API = import.meta.env.VITE_VOICE_API || "http://172.16.55.13:8006";

function checkMediaDevices() {
  if (typeof navigator === "undefined") {
    return { ok: false, reason: "Brauzer qo'llab-quvvatlamaydi" };
  }
  if (!window.isSecureContext) {
    return {
      ok: false,
      reason:
        "Mikrofon faqat HTTPS yoki localhost da ishlaydi. " +
        "Chrome: chrome://flags/#unsafely-treat-insecure-origin-as-secure " +
        "ga http://172.16.55.13:8003 ni qo'shing va Relaunch bosing",
    };
  }
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    return {
      ok: false,
      reason: "Brauzer mediaDevices API ni qo'llab-quvvatlamaydi",
    };
  }
  return { ok: true, reason: null };
}

async function getMicStream() {
  const check = checkMediaDevices();
  if (!check.ok) throw new Error(check.reason);

  return navigator.mediaDevices.getUserMedia({
    audio: {
      sampleRate: 16000,
      channelCount: 1,
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: true,
    },
  });
}

export function useVoiceCommand({ onCommand, maxDuration = 3500 }) {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState(null);
  const recorderRef = useRef(null);
  const timeoutRef = useRef(null);
  const streamRef = useRef(null);

  const stopAndProcess = useCallback(
    async (chunks) => {
      setIsListening(false);
      setIsProcessing(true);
      setError(null);

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      try {
        const blob = new Blob(chunks, { type: "audio/webm" });

        if (blob.size < 1000) {
          setError("Ovoz yetarli emas");
          setIsProcessing(false);
          return;
        }

        const form = new FormData();
        form.append("audio", blob, "voice.webm");

        const res = await fetch(`${VOICE_API}/api/voice/command`, {
          method: "POST",
          body: form,
        });

        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || `Server xatolik: ${res.status}`);
        }

        const data = await res.json();
        setTranscript(data.transcript || "");

        if ((data.camera_name || data.camera_id) && data.confidence >= 0.5) {
          onCommand?.({
            camera_name: data.camera_name,
            camera_id: data.camera_id,
            action: data.action,
          });
        } else if (data.transcript) {
          setError(`"${data.transcript}" — kamera topilmadi`);
        } else {
          setError("Ovoz aniqlanmadi");
        }
      } catch (err) {
        console.error("Voice command error:", err);
        setError(err.message || "Xatolik yuz berdi");
      } finally {
        setIsProcessing(false);
      }
    },
    [onCommand],
  );

  // Asosiy recording funksiyasi — tugma yoki wake word orqali chaqiriladi
  const startRecording = useCallback(async () => {
    setError(null);
    setTranscript("");

    try {
      const stream = await getMicStream();
      streamRef.current = stream;

      const mimeType = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";

      const recorder = new MediaRecorder(stream, { mimeType });
      recorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => stopAndProcess(chunks);

      recorder.start();
      setIsListening(true);

      timeoutRef.current = setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, maxDuration);
    } catch (err) {
      setIsListening(false);
      if (err.name === "NotAllowedError") {
        setError("Mikrofon ruxsati berilmagan");
      } else if (err.name === "NotFoundError") {
        setError("Mikrofon topilmadi");
      } else {
        setError(err.message);
      }
    }
  }, [maxDuration, stopAndProcess]);

  // Tugma bosilganda — toggle
  const startListening = useCallback(async () => {
    if (isListening && recorderRef.current) {
      clearTimeout(timeoutRef.current);
      recorderRef.current.stop();
      return;
    }
    await startRecording();
  }, [isListening, startRecording]);

  // Wake word dan chaqirish uchun — doim yangi recording boshlaydi
  const triggerListening = useCallback(async () => {
    if (isListening || isProcessing) return;
    console.log("Wake word triggered — recording boshlanmoqda...");
    await startRecording();
  }, [isListening, isProcessing, startRecording]);

  return {
    isListening,
    isProcessing,
    transcript,
    error,
    startListening, // tugma uchun (toggle)
    triggerListening, // wake word uchun (avtomatik)
    clearError: () => setError(null),
  };
}

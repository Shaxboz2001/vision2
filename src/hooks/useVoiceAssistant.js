// hooks/useVoiceAssistant.js
//
// Fix: wake word "Muhlisa" ning boshi ("mu") yo'qolish muammosi.
//
// Eski arxitektura: VAD rms > threshold bo'lganda MediaRecorder yaratardi →
//   natijada "mu" tovushi ALREADY tugab ketgandan keyin record boshlanardi →
//   Whisper ga "xlisa, kameralarni och" keladi → has_wake_word: false.
//
// Yangi arxitektura:
//   1. AudioWorklet DOIM ishlaydi va main thread ga PCM frame yuboradi.
//   2. Ring buffer (600ms) doim to'ladi — idle holda ham.
//   3. RMS > START_THRESHOLD bo'lganda: ring buffer ni PRE-ROLL sifatida olib,
//      undan keyingi PCM frame larni qo'shib ketamiz. "mu" saqlanadi.
//   4. STOP_THRESHOLD pastroq (hysteresis) — false stop larni oldini oladi.
//   5. WAV encode client-side — backend ffmpeg avtomatik o'qiydi.

import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { voiceFeedback } from "@/utils/voiceFeedback";

const API = import.meta.env.VITE_VOICE_API || "https://172.16.55.13:8006";

// VAD parametrlari
const SR = 16000;
const PREROLL_MS = 600; // Wake word boshini qamrash uchun
const START_THRESHOLD = 0.025; // Start uchun pastroq (sensitive)
const STOP_THRESHOLD = 0.015; // Stop uchun yanada pastroq (hysteresis)
const SILENCE_MS = 600;
const MAX_REC_MS = 4500;
const MIN_REC_MS = 600;

// ─── WAV encoder (Float32 → WAV Blob) ───────────────
function encodeWAV(samples, sampleRate) {
  const buffer = new ArrayBuffer(44 + samples.length * 2);
  const view = new DataView(buffer);
  const writeStr = (off, s) => {
    for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
  };

  writeStr(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  writeStr(8, "WAVE");
  writeStr(12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  writeStr(36, "data");
  view.setUint32(40, samples.length * 2, true);

  let off = 44;
  for (let i = 0; i < samples.length; i++, off += 2) {
    const s = Math.max(-1, Math.min(1, samples[i]));
    view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }
  return new Blob([buffer], { type: "audio/wav" });
}

export function useVoiceAssistant() {
  const nav = useNavigate();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastTranscript, setLastTranscript] = useState("");
  const [lastCommand, setLastCommand] = useState(null);
  const [error, setError] = useState(null);

  // Audio pipeline
  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const workletRef = useRef(null);

  // Ring buffer — doim to'ladi (pre-roll)
  const ringRef = useRef(null);
  const ringIdxRef = useRef(0);
  const ringFilledRef = useRef(0);

  // Active recording buffer
  const recBufRef = useRef([]); // Float32Array[] chunks
  const recSamplesRef = useRef(0);
  const recordingRef = useRef(false);
  const startTimeRef = useRef(0);

  // Timers / flags
  const silenceTimerRef = useRef(null);
  const maxTimerRef = useRef(null);
  const enabledRef = useRef(false);
  const busyRef = useRef(false);
  const abortRef = useRef(null);

  // ─── Cleanup ──────────────────────────────────────
  const cleanup = useCallback(() => {
    enabledRef.current = false;
    busyRef.current = false;
    recordingRef.current = false;

    clearTimeout(silenceTimerRef.current);
    clearTimeout(maxTimerRef.current);
    silenceTimerRef.current = null;
    maxTimerRef.current = null;

    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    voiceFeedback.stop();

    if (workletRef.current) {
      try {
        workletRef.current.port.onmessage = null;
        workletRef.current.disconnect();
      } catch {}
      workletRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (ctxRef.current) {
      try {
        ctxRef.current.close();
      } catch {}
      ctxRef.current = null;
    }

    ringRef.current = null;
    ringIdxRef.current = 0;
    ringFilledRef.current = 0;
    recBufRef.current = [];
    recSamplesRef.current = 0;

    setIsListening(false);
    setIsRecording(false);
    setIsProcessing(false);
    setIsSpeaking(false);
  }, []);

  // ─── Say (audio feedback) ─────────────────────────
  const say = useCallback(async (key) => {
    busyRef.current = true;
    setIsSpeaking(true);
    try {
      await voiceFeedback.speak(key);
    } catch {}
    await new Promise((r) => setTimeout(r, 150));
    setIsSpeaking(false);
    busyRef.current = false;
  }, []);

  // ─── Send to backend ──────────────────────────────
  const send = useCallback(
    async (samples) => {
      if (samples.length < SR * 0.4) return; // <400ms — juda qisqa
      busyRef.current = true;
      setIsProcessing(true);
      setError(null);

      if (abortRef.current) abortRef.current.abort();
      const ctrl = new AbortController();
      abortRef.current = ctrl;

      try {
        const blob = encodeWAV(samples, SR);
        const fd = new FormData();
        fd.append("audio", blob, "v.wav");

        const res = await fetch(`${API}/api/voice/command`, {
          method: "POST",
          body: fd,
          signal: ctrl.signal,
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          throw new Error(errData.detail || `HTTP ${res.status}`);
        }
        const d = await res.json();
        console.log("[Voice]", d.transcript, d);

        if (!d.has_wake_word) {
          busyRef.current = false;
          setIsProcessing(false);
          return;
        }

        setLastTranscript(d.transcript);
        setIsProcessing(false);
        const found = d.nav_path || d.camera_name || d.camera_id;

        if (found) {
          if (d.camera_name || d.camera_id) {
            setLastCommand({ label: d.camera_name || `Kamera ${d.camera_id}` });
            nav("/kameralar");
            setTimeout(() => {
              window.dispatchEvent(
                new CustomEvent("voice-camera-command", {
                  detail: {
                    camera_name: d.camera_name,
                    camera_id: d.camera_id,
                  },
                }),
              );
            }, 300);
          } else if (d.nav_path) {
            setLastCommand({ label: d.nav_label });
            nav(d.nav_path);
          }
          await say("accepted");
          await say("opened");
          setTimeout(() => setLastCommand(null), 3000);
        } else {
          await say("accepted");
          setError("Tanilmadi");
          await say("retry");
          setTimeout(() => setError(null), 3000);
        }
      } catch (e) {
        if (e.name === "AbortError") return;
        console.error("[Voice]", e);
        setIsProcessing(false);
        setError(e.message);
        await say("retry");
        setTimeout(() => setError(null), 3000);
      } finally {
        busyRef.current = false;
        setIsProcessing(false);
        abortRef.current = null;
      }
    },
    [nav, say],
  );

  // ─── Recording start — ring buffer ni pre-roll sifatida oladi ─
  const startRecording = useCallback(() => {
    if (recordingRef.current) return;
    recordingRef.current = true;
    startTimeRef.current = Date.now();

    // Ring buffer ni linear ketma-ketlikda ajratib olish
    const ring = ringRef.current;
    if (ring) {
      const idx = ringIdxRef.current;
      const filled = ringFilledRef.current;
      const preroll = new Float32Array(filled);

      if (filled < ring.length) {
        // Buffer hali to'lmagan — [0..filled] qismini olamiz
        preroll.set(ring.subarray(0, filled));
      } else {
        // Buffer to'lgan — circular: [idx..end] + [0..idx]
        const tailLen = ring.length - idx;
        preroll.set(ring.subarray(idx), 0);
        preroll.set(ring.subarray(0, idx), tailLen);
      }

      recBufRef.current = [preroll];
      recSamplesRef.current = preroll.length;
    } else {
      recBufRef.current = [];
      recSamplesRef.current = 0;
    }

    setIsRecording(true);

    // Max duration safeguard
    maxTimerRef.current = setTimeout(() => {
      stopRecordingRef.current?.(true);
    }, MAX_REC_MS);
  }, []);

  // ─── Recording stop ───────────────────────────────
  const stopRecording = useCallback(
    (force = false) => {
      if (!recordingRef.current) return;
      recordingRef.current = false;

      clearTimeout(maxTimerRef.current);
      clearTimeout(silenceTimerRef.current);
      maxTimerRef.current = null;
      silenceTimerRef.current = null;

      setIsRecording(false);

      const dur = Date.now() - startTimeRef.current;
      if (dur < MIN_REC_MS && !force) {
        recBufRef.current = [];
        recSamplesRef.current = 0;
        return;
      }

      // Merge chunks → single Float32Array
      const total = recSamplesRef.current;
      const merged = new Float32Array(total);
      let off = 0;
      for (const c of recBufRef.current) {
        merged.set(c, off);
        off += c.length;
      }
      recBufRef.current = [];
      recSamplesRef.current = 0;

      send(merged);
    },
    [send],
  );

  // stopRecording ref — startRecording ichidan chaqirish uchun
  const stopRecordingRef = useRef(stopRecording);
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  // ─── Frame handler (AudioWorklet dan keladi) ──────
  const onFrame = useCallback(
    (pcm, rms) => {
      const ring = ringRef.current;
      if (!ring) return;

      // Recording active — PCM ni rec buffer ga qo'shamiz
      if (recordingRef.current) {
        recBufRef.current.push(pcm);
        recSamplesRef.current += pcm.length;

        // Silence detection (hysteresis)
        if (rms < STOP_THRESHOLD) {
          if (!silenceTimerRef.current) {
            silenceTimerRef.current = setTimeout(() => {
              silenceTimerRef.current = null;
              stopRecordingRef.current?.(false);
            }, SILENCE_MS);
          }
        } else {
          clearTimeout(silenceTimerRef.current);
          silenceTimerRef.current = null;
        }
        return;
      }

      // Idle — ring buffer ni yangilaymiz (pre-roll uchun)
      for (let i = 0; i < pcm.length; i++) {
        ring[ringIdxRef.current] = pcm[i];
        ringIdxRef.current = (ringIdxRef.current + 1) % ring.length;
        if (ringFilledRef.current < ring.length) ringFilledRef.current++;
      }

      // Feedback playing yoki processing — speech detect qilmaymiz
      if (busyRef.current || voiceFeedback.isSpeaking()) return;

      // Speech start detection
      if (rms > START_THRESHOLD) {
        startRecording();
      }
    },
    [startRecording],
  );

  // ─── Toggle mic ───────────────────────────────────
  const toggleMic = useCallback(async () => {
    if (isEnabled) {
      cleanup();
      setIsEnabled(false);
      return;
    }

    cleanup();

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: SR,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: SR });
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      // AudioWorklet yuklash
      try {
        await ctx.audioWorklet.addModule("/audio-vad-processor.js");
      } catch (e) {
        cleanup();
        setError(
          "AudioWorklet yuklanmadi. /audio-vad-processor.js fayli public/ da bormi?",
        );
        console.error(e);
        return;
      }

      const src = ctx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(ctx, "vad-processor");

      // Ring buffer init
      const ringSize = Math.floor((SR * PREROLL_MS) / 1000);
      ringRef.current = new Float32Array(ringSize);
      ringIdxRef.current = 0;
      ringFilledRef.current = 0;

      worklet.port.onmessage = (e) => {
        if (e.data?.type === "frame") {
          onFrame(e.data.pcm, e.data.rms);
        }
      };

      src.connect(worklet);
      // Worklet output ga ulash SHART EMAS (faqat analysis node sifatida ishlatyapmiz).
      // Ba'zi browser lar da output yo'q bo'lsa process() chaqirilmasligi mumkin —
      // shu sababli ctx.destination ga ulamaymiz, lekin agar muammo chiqsa:
      // worklet.connect(ctx.destination);

      workletRef.current = worklet;

      enabledRef.current = true;
      busyRef.current = false;
      recordingRef.current = false;
      setIsEnabled(true);
      setIsListening(true);
      setError(null);
    } catch (e) {
      cleanup();
      setError(
        e.name === "NotAllowedError"
          ? "Mikrofon ruxsati yo'q"
          : e.name === "NotFoundError"
            ? "Mikrofon topilmadi"
            : e.message,
      );
    }
  }, [isEnabled, cleanup, onFrame]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    isEnabled,
    isListening,
    isRecording,
    isProcessing,
    isSpeaking,
    lastTranscript,
    lastCommand,
    error,
    toggleMic,
  };
}

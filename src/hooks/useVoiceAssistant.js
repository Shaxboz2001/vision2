// // hooks/useVoiceAssistant.js
// //
// // FINAL — clean logging + reliable VAD
// //
// // Console log policy (user feedback: "hamma so'zni consolega yozmoqda"):
// //   - SUCCESS: routing bajarildi → "✓ /datchiklar ← datchiklarni och"
// //   - WAKE but no target: → "⚠ wake but no target: '...'"
// //   - IGNORED: no wake word → SILENT (console clean)
// //   - ERROR: always logged
// //
// // Agar user DevTools'da to'liq log kerak bo'lsa:
// //   window.__voiceVerbose = true

// import { useState, useRef, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { voiceFeedback } from "@/utils/voiceFeedback";

// const API = import.meta.env.VITE_VOICE_API || "https://172.16.55.13:8006";

// // VAD
// const SR = 16000;
// const PREROLL_MS = 900;
// const START_THRESHOLD = 0.018;
// const STOP_THRESHOLD = 0.012;
// const SILENCE_MS = 700;
// const MAX_REC_MS = 5000;
// const MIN_REC_MS = 500;

// const HEALTH_CHECK_MS = 30_000;

// // Log helpers
// const isVerbose = () =>
//   typeof window !== "undefined" && window.__voiceVerbose === true;

// const logInfo = (...args) => console.log("%c[Voice]", "color:#00d4ff", ...args);
// const logWarn = (...args) => console.warn("[Voice]", ...args);
// const logError = (...args) => console.error("[Voice]", ...args);
// const logDebug = (...args) => {
//   if (isVerbose()) console.log("%c[Voice debug]", "color:#666", ...args);
// };

// function encodeWAV(samples, sampleRate) {
//   const buffer = new ArrayBuffer(44 + samples.length * 2);
//   const view = new DataView(buffer);
//   const writeStr = (off, s) => {
//     for (let i = 0; i < s.length; i++) view.setUint8(off + i, s.charCodeAt(i));
//   };
//   writeStr(0, "RIFF");
//   view.setUint32(4, 36 + samples.length * 2, true);
//   writeStr(8, "WAVE");
//   writeStr(12, "fmt ");
//   view.setUint32(16, 16, true);
//   view.setUint16(20, 1, true);
//   view.setUint16(22, 1, true);
//   view.setUint32(24, sampleRate, true);
//   view.setUint32(28, sampleRate * 2, true);
//   view.setUint16(32, 2, true);
//   view.setUint16(34, 16, true);
//   writeStr(36, "data");
//   view.setUint32(40, samples.length * 2, true);
//   let off = 44;
//   for (let i = 0; i < samples.length; i++, off += 2) {
//     const s = Math.max(-1, Math.min(1, samples[i]));
//     view.setInt16(off, s < 0 ? s * 0x8000 : s * 0x7fff, true);
//   }
//   return new Blob([buffer], { type: "audio/wav" });
// }

// export function useVoiceAssistant() {
//   const nav = useNavigate();
//   const [isEnabled, setIsEnabled] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [lastTranscript, setLastTranscript] = useState("");
//   const [lastCommand, setLastCommand] = useState(null);
//   const [errorMsg, setErrorMsg] = useState(null);

//   const streamRef = useRef(null);
//   const ctxRef = useRef(null);
//   const workletRef = useRef(null);

//   const ringRef = useRef(null);
//   const ringIdxRef = useRef(0);
//   const ringFilledRef = useRef(0);

//   const recBufRef = useRef([]);
//   const recSamplesRef = useRef(0);
//   const recordingRef = useRef(false);
//   const startTimeRef = useRef(0);

//   const silenceTimerRef = useRef(null);
//   const maxTimerRef = useRef(null);
//   const healthTimerRef = useRef(null);
//   const enabledRef = useRef(false);
//   const busyRef = useRef(false);
//   const abortRef = useRef(null);

//   const statsRef = useRef({ frames: 0, recordings: 0, sends: 0, routed: 0 });

//   const cleanup = useCallback(() => {
//     enabledRef.current = false;
//     busyRef.current = false;
//     recordingRef.current = false;

//     [silenceTimerRef, maxTimerRef, healthTimerRef].forEach((r) => {
//       if (r.current) {
//         clearTimeout(r.current);
//         clearInterval(r.current);
//         r.current = null;
//       }
//     });

//     if (abortRef.current) {
//       abortRef.current.abort();
//       abortRef.current = null;
//     }

//     voiceFeedback.stop();

//     if (workletRef.current) {
//       try {
//         workletRef.current.port.onmessage = null;
//         workletRef.current.disconnect();
//       } catch {}
//       workletRef.current = null;
//     }
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((t) => t.stop());
//       streamRef.current = null;
//     }
//     if (ctxRef.current) {
//       try {
//         ctxRef.current.close();
//       } catch {}
//       ctxRef.current = null;
//     }

//     ringRef.current = null;
//     ringIdxRef.current = 0;
//     ringFilledRef.current = 0;
//     recBufRef.current = [];
//     recSamplesRef.current = 0;

//     setIsListening(false);
//     setIsRecording(false);
//     setIsProcessing(false);
//     setIsSpeaking(false);
//   }, []);

//   const say = useCallback(async (key) => {
//     busyRef.current = true;
//     setIsSpeaking(true);
//     try {
//       await voiceFeedback.speak(key);
//     } catch {}
//     await new Promise((r) => setTimeout(r, 150));
//     setIsSpeaking(false);
//     busyRef.current = false;
//   }, []);

//   const send = useCallback(
//     async (samples) => {
//       if (samples.length < SR * 0.4) return;
//       busyRef.current = true;
//       setIsProcessing(true);
//       setErrorMsg(null);
//       statsRef.current.sends++;

//       if (abortRef.current) abortRef.current.abort();
//       const ctrl = new AbortController();
//       abortRef.current = ctrl;

//       try {
//         const blob = encodeWAV(samples, SR);
//         const fd = new FormData();
//         fd.append("audio", blob, "v.wav");

//         const res = await fetch(`${API}/api/voice/command`, {
//           method: "POST",
//           body: fd,
//           signal: ctrl.signal,
//         });
//         if (!res.ok) {
//           const errData = await res.json().catch(() => ({}));
//           throw new Error(errData.detail || `HTTP ${res.status}`);
//         }
//         const d = await res.json();

//         // ═══ LOG POLICY ═══
//         // Verbose mode: hammasini log qiladi
//         // Normal: faqat wake + routing'ni
//         if (isVerbose()) {
//           logDebug(d.transcript, d);
//         }

//         // No wake → silent exit
//         if (!d.has_wake_word) {
//           busyRef.current = false;
//           setIsProcessing(false);
//           return;
//         }

//         setLastTranscript(d.transcript);
//         setIsProcessing(false);
//         const found = d.nav_path || d.camera_name || d.camera_id;

//         if (found) {
//           // ✓ Successful routing
//           statsRef.current.routed++;
//           const target = d.camera_name
//             ? `cam:${d.camera_name}`
//             : d.nav_label || d.nav_path;
//           logInfo(`✓ ${target} ← "${d.transcript}"`);

//           if (d.camera_name || d.camera_id) {
//             setLastCommand({ label: d.camera_name || `Kamera ${d.camera_id}` });
//             nav("/kameralar");
//             setTimeout(() => {
//               window.dispatchEvent(
//                 new CustomEvent("voice-camera-command", {
//                   detail: {
//                     camera_name: d.camera_name,
//                     camera_id: d.camera_id,
//                   },
//                 }),
//               );
//             }, 300);
//           } else if (d.nav_path) {
//             setLastCommand({ label: d.nav_label });
//             nav(d.nav_path);
//           }
//           await say("accepted");
//           await say("opened");
//           setTimeout(() => setLastCommand(null), 3000);
//         } else {
//           // ⚠ Wake but no target
//           logWarn(`⚠ wake but no target: "${d.transcript}"`);
//           await say("accepted");
//           setErrorMsg("Tanilmadi");
//           await say("retry");
//           setTimeout(() => setErrorMsg(null), 3000);
//         }
//       } catch (e) {
//         if (e.name === "AbortError") return;
//         logError("send error:", e.message);
//         setIsProcessing(false);
//         setErrorMsg(e.message);
//         await say("retry");
//         setTimeout(() => setErrorMsg(null), 3000);
//       } finally {
//         busyRef.current = false;
//         setIsProcessing(false);
//         abortRef.current = null;
//       }
//     },
//     [nav, say],
//   );

//   const startRecording = useCallback(() => {
//     if (recordingRef.current) return;
//     recordingRef.current = true;
//     startTimeRef.current = Date.now();
//     statsRef.current.recordings++;

//     const ring = ringRef.current;
//     if (ring) {
//       const idx = ringIdxRef.current;
//       const filled = ringFilledRef.current;
//       const preroll = new Float32Array(filled);

//       if (filled < ring.length) {
//         preroll.set(ring.subarray(0, filled));
//       } else {
//         const tailLen = ring.length - idx;
//         preroll.set(ring.subarray(idx), 0);
//         preroll.set(ring.subarray(0, idx), tailLen);
//       }

//       recBufRef.current = [preroll];
//       recSamplesRef.current = preroll.length;
//     } else {
//       recBufRef.current = [];
//       recSamplesRef.current = 0;
//     }

//     setIsRecording(true);

//     maxTimerRef.current = setTimeout(() => {
//       stopRecordingRef.current?.(true);
//     }, MAX_REC_MS);
//   }, []);

//   const stopRecording = useCallback(
//     (force = false) => {
//       if (!recordingRef.current) return;
//       recordingRef.current = false;

//       clearTimeout(maxTimerRef.current);
//       clearTimeout(silenceTimerRef.current);
//       maxTimerRef.current = null;
//       silenceTimerRef.current = null;

//       setIsRecording(false);

//       const dur = Date.now() - startTimeRef.current;
//       if (dur < MIN_REC_MS && !force) {
//         recBufRef.current = [];
//         recSamplesRef.current = 0;
//         return;
//       }

//       const total = recSamplesRef.current;
//       const merged = new Float32Array(total);
//       let off = 0;
//       for (const c of recBufRef.current) {
//         merged.set(c, off);
//         off += c.length;
//       }
//       recBufRef.current = [];
//       recSamplesRef.current = 0;

//       send(merged);
//     },
//     [send],
//   );

//   const stopRecordingRef = useRef(stopRecording);
//   useEffect(() => {
//     stopRecordingRef.current = stopRecording;
//   }, [stopRecording]);

//   const onFrame = useCallback(
//     (pcm, rms) => {
//       const ring = ringRef.current;
//       if (!ring) return;
//       statsRef.current.frames++;

//       if (recordingRef.current) {
//         recBufRef.current.push(pcm);
//         recSamplesRef.current += pcm.length;

//         if (rms < STOP_THRESHOLD) {
//           if (!silenceTimerRef.current) {
//             silenceTimerRef.current = setTimeout(() => {
//               silenceTimerRef.current = null;
//               stopRecordingRef.current?.(false);
//             }, SILENCE_MS);
//           }
//         } else {
//           clearTimeout(silenceTimerRef.current);
//           silenceTimerRef.current = null;
//         }
//         return;
//       }

//       for (let i = 0; i < pcm.length; i++) {
//         ring[ringIdxRef.current] = pcm[i];
//         ringIdxRef.current = (ringIdxRef.current + 1) % ring.length;
//         if (ringFilledRef.current < ring.length) ringFilledRef.current++;
//       }

//       if (busyRef.current || voiceFeedback.isSpeaking()) return;

//       if (rms > START_THRESHOLD) {
//         startRecording();
//       }
//     },
//     [startRecording],
//   );

//   const startHealthCheck = useCallback(() => {
//     healthTimerRef.current = setInterval(async () => {
//       const ctx = ctxRef.current;
//       if (!ctx) return;
//       if (ctx.state === "suspended") {
//         logWarn("AudioContext suspended — resuming");
//         try {
//           await ctx.resume();
//         } catch (e) {
//           logError("resume failed:", e);
//         }
//       }
//       if (typeof window !== "undefined") {
//         window.__voiceStats = { ...statsRef.current, ctxState: ctx.state };
//       }
//     }, HEALTH_CHECK_MS);
//   }, []);

//   const toggleMic = useCallback(async () => {
//     if (isEnabled) {
//       cleanup();
//       setIsEnabled(false);
//       return;
//     }

//     cleanup();

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           sampleRate: SR,
//           channelCount: 1,
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         },
//       });
//       streamRef.current = stream;

//       const ctx = new AudioContext({
//         sampleRate: SR,
//         latencyHint: "interactive",
//       });
//       ctxRef.current = ctx;
//       if (ctx.state === "suspended") await ctx.resume();

//       try {
//         await ctx.audioWorklet.addModule("/audio-vad-processor.js");
//       } catch (e) {
//         cleanup();
//         setErrorMsg("AudioWorklet yuklanmadi (public/audio-vad-processor.js)");
//         logError(e);
//         return;
//       }

//       const src = ctx.createMediaStreamSource(stream);
//       const worklet = new AudioWorkletNode(ctx, "vad-processor");

//       const ringSize = Math.floor((SR * PREROLL_MS) / 1000);
//       ringRef.current = new Float32Array(ringSize);
//       ringIdxRef.current = 0;
//       ringFilledRef.current = 0;

//       worklet.port.onmessage = (e) => {
//         if (e.data?.type === "frame") {
//           onFrame(e.data.pcm, e.data.rms);
//         }
//       };

//       src.connect(worklet);
//       workletRef.current = worklet;

//       enabledRef.current = true;
//       busyRef.current = false;
//       recordingRef.current = false;
//       statsRef.current = { frames: 0, recordings: 0, sends: 0, routed: 0 };

//       startHealthCheck();

//       setIsEnabled(true);
//       setIsListening(true);
//       setErrorMsg(null);

//       logInfo("mic enabled — say 'Muxlisa, ...'");
//     } catch (e) {
//       cleanup();
//       setErrorMsg(
//         e.name === "NotAllowedError"
//           ? "Mikrofon ruxsati yo'q"
//           : e.name === "NotFoundError"
//             ? "Mikrofon topilmadi"
//             : e.message,
//       );
//     }
//   }, [isEnabled, cleanup, onFrame, startHealthCheck]);

//   useEffect(() => () => cleanup(), [cleanup]);

//   return {
//     isEnabled,
//     isListening,
//     isRecording,
//     isProcessing,
//     isSpeaking,
//     lastTranscript,
//     lastCommand,
//     error: errorMsg,
//     toggleMic,
//   };
// }

// hooks/useVoiceAssistant.js
//
// ML Voice Assistant — Unified Wav2Vec2 Classifier backend bilan
//
// Backend: D:\armatura\inference-backend\main.py (port 8006)
//   POST /api/voice/command → { has_wake_word, nav_path, nav_label, confidence, intent_id, rejected, reason }
//
// Log policy (console clean):
//   ✓ Success:  [Voice] ✓ Kameralar (96%) → /kameralar
//   ⚠ Warning:  [Voice] ⚠ rejected: low_confidence (62%)
//   ❌ Error:   [Voice] error: ...
//   Ignored (silence_or_noise) → SILENT
//
// Verbose mode (full debug):
//   window.__voiceVerbose = true

import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { voiceFeedback } from "@/utils/voiceFeedback";

const API = "https://172.16.55.13:8006";

// VAD config
const SR = 16000;
const PREROLL_MS = 900;
const START_THRESHOLD = 0.018;
const STOP_THRESHOLD = 0.012;
const SILENCE_MS = 700;
const MAX_REC_MS = 5000;
const MIN_REC_MS = 500;
const HEALTH_CHECK_MS = 30_000;

// ═══ Logging ════════════════════════════════════════
const isVerbose = () =>
  typeof window !== "undefined" && window.__voiceVerbose === true;

const logInfo = (...args) => console.log("%c[Voice]", "color:#00d4ff", ...args);
const logWarn = (...args) => console.warn("[Voice]", ...args);
const logError = (...args) => console.error("[Voice]", ...args);
const logDebug = (...args) => {
  if (isVerbose()) console.log("%c[Voice debug]", "color:#666", ...args);
};

// ═══ WAV encoder ════════════════════════════════════
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
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
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

// ═══ Hook ═══════════════════════════════════════════
export function useVoiceAssistant() {
  const nav = useNavigate();
  const [isEnabled, setIsEnabled] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [lastCommand, setLastCommand] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const workletRef = useRef(null);

  const ringRef = useRef(null);
  const ringIdxRef = useRef(0);
  const ringFilledRef = useRef(0);

  const recBufRef = useRef([]);
  const recSamplesRef = useRef(0);
  const recordingRef = useRef(false);
  const startTimeRef = useRef(0);

  const silenceTimerRef = useRef(null);
  const maxTimerRef = useRef(null);
  const healthTimerRef = useRef(null);
  const enabledRef = useRef(false);
  const busyRef = useRef(false);
  const abortRef = useRef(null);

  const statsRef = useRef({ frames: 0, recordings: 0, sends: 0, routed: 0 });

  // ─── Cleanup ──────────────────────────────────────
  const cleanup = useCallback(() => {
    enabledRef.current = false;
    busyRef.current = false;
    recordingRef.current = false;

    [silenceTimerRef, maxTimerRef, healthTimerRef].forEach((r) => {
      if (r.current) {
        clearTimeout(r.current);
        clearInterval(r.current);
        r.current = null;
      }
    });

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

  // ─── TTS ──────────────────────────────────────────
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

  // ─── Send audio to ML backend ─────────────────────
  const send = useCallback(
    async (samples) => {
      if (samples.length < SR * 0.4) return;
      busyRef.current = true;
      setIsProcessing(true);
      setErrorMsg(null);
      statsRef.current.sends++;

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
        setIsProcessing(false);
        console.log("Siz gapirdingiz:", d);
        // Verbose debug
        logDebug("response:", d);

        const confPct = (d.confidence * 100).toFixed(0);

        // ─── CASE 1: Rejected (silence/noise or low confidence) ───
        if (d.rejected) {
          // silence_or_noise — silent ignore (console clean)
          if (d.reason === "silence_or_noise") {
            logDebug(`ignored: silence_or_noise (${confPct}%)`);
            busyRef.current = false;
            return;
          }

          // low_confidence — user gap'ni tushunolmadi
          logWarn(`⚠ rejected: ${d.reason} — ${d.intent_id} (${confPct}%)`);
          await say("retry");
          setErrorMsg("Tanilmadi");
          setTimeout(() => setErrorMsg(null), 2500);
          return;
        }

        // ─── CASE 2: Success — route ──────────────────
        if (d.nav_path) {
          statsRef.current.routed++;
          const target = d.nav_label || d.nav_path;
          logInfo(`✓ ${target} (${confPct}%) → ${d.nav_path}`);

          setLastCommand({ label: d.nav_label });
          nav(d.nav_path);
          await say("accepted");
          await say("opened");
          setTimeout(() => setLastCommand(null), 3000);
          return;
        }

        // ─── CASE 3: Edge case — no route ─────────────
        logWarn(`⚠ no route: ${d.intent_id} (${confPct}%)`);
        setErrorMsg("Route topilmadi");
        setTimeout(() => setErrorMsg(null), 2500);
      } catch (e) {
        if (e.name === "AbortError") return;
        logError("error:", e.message);
        setIsProcessing(false);
        setErrorMsg(e.message);
        await say("retry");
        setTimeout(() => setErrorMsg(null), 3000);
      } finally {
        busyRef.current = false;
        setIsProcessing(false);
        abortRef.current = null;
      }
    },
    [nav, say],
  );

  // ─── Recording start ──────────────────────────────
  const startRecording = useCallback(() => {
    if (recordingRef.current) return;
    recordingRef.current = true;
    startTimeRef.current = Date.now();
    statsRef.current.recordings++;

    const ring = ringRef.current;
    if (ring) {
      const idx = ringIdxRef.current;
      const filled = ringFilledRef.current;
      const preroll = new Float32Array(filled);

      if (filled < ring.length) {
        preroll.set(ring.subarray(0, filled));
      } else {
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

  const stopRecordingRef = useRef(stopRecording);
  useEffect(() => {
    stopRecordingRef.current = stopRecording;
  }, [stopRecording]);

  // ─── Frame processor (VAD) ────────────────────────
  const onFrame = useCallback(
    (pcm, rms) => {
      const ring = ringRef.current;
      if (!ring) return;
      statsRef.current.frames++;

      if (recordingRef.current) {
        recBufRef.current.push(pcm);
        recSamplesRef.current += pcm.length;

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

      // Preroll ring buffer
      for (let i = 0; i < pcm.length; i++) {
        ring[ringIdxRef.current] = pcm[i];
        ringIdxRef.current = (ringIdxRef.current + 1) % ring.length;
        if (ringFilledRef.current < ring.length) ringFilledRef.current++;
      }

      if (busyRef.current || voiceFeedback.isSpeaking()) return;

      if (rms > START_THRESHOLD) {
        startRecording();
      }
    },
    [startRecording],
  );

  // ─── Health check ─────────────────────────────────
  const startHealthCheck = useCallback(() => {
    healthTimerRef.current = setInterval(async () => {
      const ctx = ctxRef.current;
      if (!ctx) return;
      if (ctx.state === "suspended") {
        logWarn("AudioContext suspended — resuming");
        try {
          await ctx.resume();
        } catch (e) {
          logError("resume failed:", e);
        }
      }
      if (typeof window !== "undefined") {
        window.__voiceStats = { ...statsRef.current, ctxState: ctx.state };
      }
    }, HEALTH_CHECK_MS);
  }, []);

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

      const ctx = new AudioContext({
        sampleRate: SR,
        latencyHint: "interactive",
      });
      ctxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      try {
        await ctx.audioWorklet.addModule("/audio-vad-processor.js");
      } catch (e) {
        cleanup();
        setErrorMsg("AudioWorklet yuklanmadi (public/audio-vad-processor.js)");
        logError(e);
        return;
      }

      const src = ctx.createMediaStreamSource(stream);
      const worklet = new AudioWorkletNode(ctx, "vad-processor");

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
      workletRef.current = worklet;

      enabledRef.current = true;
      busyRef.current = false;
      recordingRef.current = false;
      statsRef.current = { frames: 0, recordings: 0, sends: 0, routed: 0 };

      startHealthCheck();

      setIsEnabled(true);
      setIsListening(true);
      setErrorMsg(null);

      logInfo("mic enabled — say 'Muxlisa, ...'");
    } catch (e) {
      cleanup();
      setErrorMsg(
        e.name === "NotAllowedError"
          ? "Mikrofon ruxsati yo'q"
          : e.name === "NotFoundError"
            ? "Mikrofon topilmadi"
            : e.message,
      );
    }
  }, [isEnabled, cleanup, onFrame, startHealthCheck]);

  useEffect(() => () => cleanup(), [cleanup]);

  return {
    isEnabled,
    isListening,
    isRecording,
    isProcessing,
    isSpeaking,
    lastTranscript: "", // ML classifier transcript ishlatmaydi
    lastCommand,
    error: errorMsg,
    toggleMic,
  };
}

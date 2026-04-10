// // hooks/useVoiceAssistant.js
// import { useState, useRef, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";

// const API = import.meta.env.VITE_VOICE_API || "http://172.16.55.13:8006";

// // ─── VAD tuning ──────────────────────────────────────
// const VOL_THRESHOLD = 0.025; // ovoz boshlash chegarasi
// const SILENCE_MS = 700; // 700ms jimlik → to'xtatish (tezroq!)
// const MAX_REC_MS = 4000; // max 4s yozish
// const MIN_REC_MS = 400; // min 400ms

// export function useVoiceAssistant() {
//   const nav = useNavigate();
//   const [isEnabled, setIsEnabled] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [lastTranscript, setLastTranscript] = useState("");
//   const [lastCommand, setLastCommand] = useState(null);
//   const [error, setError] = useState(null);

//   const streamRef = useRef(null);
//   const audioCtxRef = useRef(null);
//   const analyserRef = useRef(null);
//   const rafRef = useRef(null);
//   const silenceRef = useRef(null);
//   const recRef = useRef(null);
//   const startTimeRef = useRef(0);
//   const enabledRef = useRef(false);
//   const busyRef = useRef(false);
//   const peakRef = useRef(0);

//   // ─── Whisper ga yuborish ────────────────────────────
//   const send = useCallback(
//     async (blob) => {
//       if (blob.size < 2000 || busyRef.current) return;
//       busyRef.current = true;
//       setIsProcessing(true);
//       setError(null);

//       try {
//         const fd = new FormData();
//         fd.append("audio", blob, "v.webm");

//         const res = await fetch(`${API}/api/voice/command`, {
//           method: "POST",
//           body: fd,
//         });
//         if (!res.ok)
//           throw new Error(
//             (await res.json().catch(() => ({}))).detail || res.status,
//           );

//         const d = await res.json();

//         if (!d.transcript || !d.has_wake_word) return;

//         setLastTranscript(d.transcript);

//         if (d.nav_path) {
//           setLastCommand({ label: d.nav_label });
//           nav(d.nav_path);
//         } else if (d.camera_name || d.camera_id) {
//           setLastCommand({ label: d.camera_name });
//           nav("/kameralar");
//           setTimeout(() => {
//             window.dispatchEvent(
//               new CustomEvent("voice-camera-command", {
//                 detail: { camera_name: d.camera_name, camera_id: d.camera_id },
//               }),
//             );
//           }, 400);
//         } else if (d.confidence === 0) {
//           setError("Tanilmadi");
//         }

//         if (d.nav_path || d.camera_name || d.camera_id) {
//           setTimeout(() => setLastCommand(null), 3000);
//         }
//       } catch (e) {
//         console.error("[Voice]", e);
//         setError(e.message);
//       } finally {
//         busyRef.current = false;
//         setIsProcessing(false);
//         setTimeout(() => setError(null), 3000);
//       }
//     },
//     [nav],
//   );

//   // ─── VAD loop ───────────────────────────────────────
//   const runVAD = useCallback(() => {
//     const an = analyserRef.current;
//     if (!an || !enabledRef.current) return;

//     const buf = new Float32Array(an.fftSize);
//     let recording = false;
//     let chunks = [];
//     let rec = null;

//     const tick = () => {
//       if (!enabledRef.current) return;
//       an.getFloatTimeDomainData(buf);

//       // RMS
//       let s = 0;
//       for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
//       const rms = Math.sqrt(s / buf.length);

//       if (rms > VOL_THRESHOLD) {
//         clearTimeout(silenceRef.current);
//         if (rms > peakRef.current) peakRef.current = rms;

//         if (!recording && !busyRef.current) {
//           recording = true;
//           chunks = [];
//           peakRef.current = rms;
//           startTimeRef.current = Date.now();
//           setIsRecording(true);

//           const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
//             ? "audio/webm;codecs=opus"
//             : "audio/webm";

//           rec = new MediaRecorder(streamRef.current, { mimeType: mime });
//           recRef.current = rec;
//           rec.ondataavailable = (e) => {
//             if (e.data.size > 0) chunks.push(e.data);
//           };
//           rec.onstop = () => {
//             const dur = Date.now() - startTimeRef.current;
//             setIsRecording(false);
//             recording = false;

//             // Peak volume filtr — juda past bo'lsa (shovqin), skip
//             if (
//               dur >= MIN_REC_MS &&
//               chunks.length &&
//               peakRef.current > VOL_THRESHOLD * 1.5
//             ) {
//               send(new Blob(chunks, { type: "audio/webm" }));
//             } else {
//               console.log(
//                 "[Voice] Skip: dur=" +
//                   dur +
//                   "ms peak=" +
//                   peakRef.current.toFixed(4),
//               );
//             }
//           };
//           rec.start(80);

//           // Max vaqt
//           setTimeout(() => {
//             if (rec?.state === "recording") rec.stop();
//           }, MAX_REC_MS);
//         }
//       } else if (recording && rec?.state === "recording") {
//         clearTimeout(silenceRef.current);
//         silenceRef.current = setTimeout(() => {
//           if (rec?.state === "recording") rec.stop();
//         }, SILENCE_MS);
//       }

//       rafRef.current = requestAnimationFrame(tick);
//     };

//     rafRef.current = requestAnimationFrame(tick);
//   }, [send]);

//   // ─── Toggle ─────────────────────────────────────────
//   const toggleMic = useCallback(async () => {
//     if (isEnabled) {
//       enabledRef.current = false;
//       setIsEnabled(false);
//       setIsListening(false);
//       setIsRecording(false);
//       cancelAnimationFrame(rafRef.current);
//       clearTimeout(silenceRef.current);
//       if (recRef.current?.state === "recording") recRef.current.stop();
//       if (streamRef.current) {
//         streamRef.current.getTracks().forEach((t) => t.stop());
//         streamRef.current = null;
//       }
//       if (audioCtxRef.current) {
//         audioCtxRef.current.close();
//         audioCtxRef.current = null;
//       }
//       return;
//     }

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           sampleRate: 16000,
//           channelCount: 1,
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         },
//       });
//       streamRef.current = stream;

//       const ctx = new (window.AudioContext || window.webkitAudioContext)();
//       audioCtxRef.current = ctx;
//       const src = ctx.createMediaStreamSource(stream);
//       const an = ctx.createAnalyser();
//       an.fftSize = 512;
//       src.connect(an);
//       analyserRef.current = an;

//       enabledRef.current = true;
//       setIsEnabled(true);
//       setIsListening(true);
//       setError(null);
//       runVAD();
//     } catch (e) {
//       setError(
//         e.name === "NotAllowedError"
//           ? "Mikrofon ruxsati yo'q"
//           : e.name === "NotFoundError"
//             ? "Mikrofon topilmadi"
//             : e.message,
//       );
//     }
//   }, [isEnabled, runVAD]);

//   useEffect(
//     () => () => {
//       enabledRef.current = false;
//       cancelAnimationFrame(rafRef.current);
//       clearTimeout(silenceRef.current);
//       streamRef.current?.getTracks().forEach((t) => t.stop());
//       audioCtxRef.current?.close();
//     },
//     [],
//   );

//   return {
//     isEnabled,
//     isListening,
//     isRecording,
//     isProcessing,
//     lastTranscript,
//     lastCommand,
//     error,
//     toggleMic,
//   };
// }

// hooks/useVoiceAssistant.js
// hooks/useVoiceAssistant.js

// hooks/useVoiceAssistant.js
// hooks/useVoiceAssistant.js
// import { useState, useRef, useCallback, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { voiceFeedback } from "@/utils/voiceFeedback";

// const API = import.meta.env.VITE_VOICE_API || "https://172.16.55.13:8006";

// const VOL_THRESHOLD = 0.025;
// const SILENCE_MS = 700;
// const MAX_REC_MS = 4000;
// const MIN_REC_MS = 400;

// export function useVoiceAssistant() {
//   const nav = useNavigate();
//   const [isEnabled, setIsEnabled] = useState(false);
//   const [isListening, setIsListening] = useState(false);
//   const [isRecording, setIsRecording] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [isSpeaking, setIsSpeaking] = useState(false);
//   const [lastTranscript, setLastTranscript] = useState("");
//   const [lastCommand, setLastCommand] = useState(null);
//   const [error, setError] = useState(null);

//   const streamRef = useRef(null);
//   const audioCtxRef = useRef(null);
//   const analyserRef = useRef(null);
//   const rafRef = useRef(null);
//   const silenceRef = useRef(null);
//   const recRef = useRef(null);
//   const startRef = useRef(0);
//   const enabledRef = useRef(false);
//   const busyRef = useRef(false);
//   const peakRef = useRef(0);

//   // ─── To'liq tozalash ────────────────────────────────
//   const cleanup = useCallback(() => {
//     // 1. Flaglar reset
//     enabledRef.current = false;
//     busyRef.current = false;

//     // 2. Animatsiya va timerlarni to'xtatish
//     cancelAnimationFrame(rafRef.current);
//     rafRef.current = null;
//     clearTimeout(silenceRef.current);
//     silenceRef.current = null;

//     // 3. Audio feedback to'xtatish
//     voiceFeedback.stop();

//     // 4. MediaRecorder to'xtatish
//     if (recRef.current) {
//       try {
//         if (recRef.current.state === "recording") recRef.current.stop();
//       } catch {}
//       recRef.current = null;
//     }

//     // 5. Mikrofon stream to'xtatish
//     if (streamRef.current) {
//       streamRef.current.getTracks().forEach((t) => t.stop());
//       streamRef.current = null;
//     }

//     // 6. AudioContext yopish
//     if (audioCtxRef.current) {
//       try {
//         audioCtxRef.current.close();
//       } catch {}
//       audioCtxRef.current = null;
//     }

//     // 7. Analyser tozalash
//     analyserRef.current = null;

//     // 8. UI state reset
//     setIsListening(false);
//     setIsRecording(false);
//     setIsProcessing(false);
//     setIsSpeaking(false);
//   }, []);

//   // ─── Audio ketma-ketligi ────────────────────────────
//   const playSequence = useCallback(async (...keys) => {
//     busyRef.current = true;
//     setIsSpeaking(true);
//     for (const key of keys) {
//       try {
//         await voiceFeedback.speak(key);
//       } catch {}
//     }
//     await new Promise((r) => setTimeout(r, 250));
//     setIsSpeaking(false);
//     busyRef.current = false;
//   }, []);

//   // ─── Whisper ga yuborish ────────────────────────────
//   const send = useCallback(
//     async (blob) => {
//       if (blob.size < 2000 || busyRef.current) return;
//       busyRef.current = true;
//       setIsProcessing(true);
//       setError(null);

//       try {
//         const fd = new FormData();
//         fd.append("audio", blob, "v.webm");

//         const res = await fetch(`${API}/api/voice/command`, {
//           method: "POST",
//           body: fd,
//         });
//         if (!res.ok)
//           throw new Error(
//             (await res.json().catch(() => ({}))).detail || res.status,
//           );

//         const d = await res.json();
//         console.log("[Voice]", d.transcript, d);

//         if (!d.has_wake_word) {
//           busyRef.current = false;
//           setIsProcessing(false);
//           return;
//         }

//         setLastTranscript(d.transcript);
//         const found = d.nav_path || d.camera_name || d.camera_id;

//         if (found) {
//           setIsProcessing(false);
//           await playSequence("accepted", "processing", "opened");

//           if (d.nav_path) {
//             setLastCommand({ label: d.nav_label });
//             nav(d.nav_path);
//           } else {
//             setLastCommand({ label: d.camera_name });
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
//             }, 400);
//           }
//           setTimeout(() => setLastCommand(null), 3000);
//           return;
//         }

//         setIsProcessing(false);
//         setError("Tanilmadi");
//         await playSequence("accepted", "processing", "retry");
//         setTimeout(() => setError(null), 3000);
//       } catch (e) {
//         console.error("[Voice]", e);
//         setIsProcessing(false);
//         setError(e.message);
//         await playSequence("retry");
//         setTimeout(() => setError(null), 3000);
//       } finally {
//         busyRef.current = false;
//         setIsProcessing(false);
//       }
//     },
//     [nav, playSequence],
//   );

//   // ─── VAD ────────────────────────────────────────────
//   const runVAD = useCallback(() => {
//     const an = analyserRef.current;
//     if (!an || !enabledRef.current) return;

//     const buf = new Float32Array(an.fftSize);
//     let recording = false;
//     let chunks = [];
//     let rec = null;

//     const tick = () => {
//       if (!enabledRef.current) return;

//       if (busyRef.current || voiceFeedback.isSpeaking()) {
//         rafRef.current = requestAnimationFrame(tick);
//         return;
//       }

//       an.getFloatTimeDomainData(buf);
//       let s = 0;
//       for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
//       const rms = Math.sqrt(s / buf.length);

//       if (rms > VOL_THRESHOLD) {
//         clearTimeout(silenceRef.current);
//         if (rms > peakRef.current) peakRef.current = rms;

//         if (!recording && !busyRef.current) {
//           recording = true;
//           chunks = [];
//           peakRef.current = rms;
//           startRef.current = Date.now();
//           setIsRecording(true);

//           const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
//             ? "audio/webm;codecs=opus"
//             : "audio/webm";

//           rec = new MediaRecorder(streamRef.current, { mimeType: mime });
//           recRef.current = rec;
//           rec.ondataavailable = (e) => {
//             if (e.data.size > 0) chunks.push(e.data);
//           };
//           rec.onstop = () => {
//             const dur = Date.now() - startRef.current;
//             setIsRecording(false);
//             recording = false;

//             if (
//               dur >= MIN_REC_MS &&
//               chunks.length &&
//               peakRef.current > VOL_THRESHOLD * 1.5
//             ) {
//               send(new Blob(chunks, { type: "audio/webm" }));
//             }
//           };
//           rec.start(80);

//           setTimeout(() => {
//             if (rec?.state === "recording") rec.stop();
//           }, MAX_REC_MS);
//         }
//       } else if (recording && rec?.state === "recording") {
//         clearTimeout(silenceRef.current);
//         silenceRef.current = setTimeout(() => {
//           if (rec?.state === "recording") rec.stop();
//         }, SILENCE_MS);
//       }

//       rafRef.current = requestAnimationFrame(tick);
//     };

//     rafRef.current = requestAnimationFrame(tick);
//   }, [send]);

//   // ─── Toggle ─────────────────────────────────────────
//   const toggleMic = useCallback(async () => {
//     if (isEnabled) {
//       cleanup();
//       setIsEnabled(false);
//       return;
//     }

//     // Yangi session — hamma narsa fresh
//     cleanup();

//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         audio: {
//           sampleRate: 16000,
//           channelCount: 1,
//           echoCancellation: true,
//           noiseSuppression: true,
//           autoGainControl: true,
//         },
//       });
//       streamRef.current = stream;

//       const ctx = new AudioContext({ sampleRate: 16000 });
//       audioCtxRef.current = ctx;

//       // AudioContext suspended bo'lishi mumkin — resume qilish
//       if (ctx.state === "suspended") {
//         await ctx.resume();
//       }

//       const src = ctx.createMediaStreamSource(stream);
//       const an = ctx.createAnalyser();
//       an.fftSize = 512;
//       src.connect(an);
//       analyserRef.current = an;

//       enabledRef.current = true;
//       busyRef.current = false;
//       setIsEnabled(true);
//       setIsListening(true);
//       setError(null);

//       runVAD();
//     } catch (e) {
//       cleanup();
//       setError(
//         e.name === "NotAllowedError"
//           ? "Mikrofon ruxsati yo'q"
//           : e.name === "NotFoundError"
//             ? "Mikrofon topilmadi"
//             : e.message,
//       );
//     }
//   }, [isEnabled, cleanup, runVAD]);

//   // Unmount cleanup
//   useEffect(() => () => cleanup(), [cleanup]);

//   return {
//     isEnabled,
//     isListening,
//     isRecording,
//     isProcessing,
//     isSpeaking,
//     lastTranscript,
//     lastCommand,
//     error,
//     toggleMic,
//   };
// }
// hooks/useVoiceAssistant.js
// hooks/useVoiceAssistant.js
// hooks/useVoiceAssistant.js
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { voiceFeedback } from "@/utils/voiceFeedback";

const API = import.meta.env.VITE_VOICE_API || "https://172.16.55.13:8006";

const VOL_THRESHOLD = 0.025;
const SILENCE_MS = 600;
const MAX_REC_MS = 4000;
const MIN_REC_MS = 400;

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

  const streamRef = useRef(null);
  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const silenceRef = useRef(null);
  const recRef = useRef(null);
  const startRef = useRef(0);
  const enabledRef = useRef(false);
  const busyRef = useRef(false);
  const peakRef = useRef(0);

  const cleanup = useCallback(() => {
    enabledRef.current = false;
    busyRef.current = false;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    clearTimeout(silenceRef.current);
    silenceRef.current = null;
    voiceFeedback.stop();
    if (recRef.current) {
      try {
        if (recRef.current.state === "recording") recRef.current.stop();
      } catch {}
      recRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (audioCtxRef.current) {
      try {
        audioCtxRef.current.close();
      } catch {}
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setIsListening(false);
    setIsRecording(false);
    setIsProcessing(false);
    setIsSpeaking(false);
  }, []);

  // ─── Audio ijro — busyRef bilan himoyalangan ───────
  const say = useCallback(async (key) => {
    busyRef.current = true;
    setIsSpeaking(true);
    try {
      await voiceFeedback.speak(key);
    } catch {}
    await new Promise((r) => setTimeout(r, 300));
    setIsSpeaking(false);
    busyRef.current = false;
  }, []);

  // ─── Backend ga yuborish ────────────────────────────
  const send = useCallback(
    async (blob) => {
      if (blob.size < 2000 || busyRef.current) return;
      busyRef.current = true;
      setIsProcessing(true);
      setError(null);

      try {
        const fd = new FormData();
        fd.append("audio", blob, "v.webm");
        const res = await fetch(`${API}/api/voice/command`, {
          method: "POST",
          body: fd,
        });
        if (!res.ok)
          throw new Error(
            (await res.json().catch(() => ({}))).detail || res.status,
          );
        const d = await res.json();
        console.log("[Voice]", d.transcript, d);

        // Wake word yo'q → jimlik
        if (!d.has_wake_word) {
          busyRef.current = false;
          setIsProcessing(false);
          return;
        }

        setLastTranscript(d.transcript);
        setIsProcessing(false);

        const found = d.nav_path || d.camera_name || d.camera_id;

        if (found) {
          // 🔊 Qabul qilindi → amal → 🔊 Ochildi
          await say("accepted");

          if (d.nav_path) {
            setLastCommand({ label: d.nav_label });
            nav(d.nav_path);
          } else {
            setLastCommand({ label: d.camera_name });
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
            }, 400);
          }

          await say("opened");
          setTimeout(() => setLastCommand(null), 3000);
        } else {
          // 🔊 Qabul qilindi → 🔊 Qaytadan ayting
          await say("accepted");
          setError("Tanilmadi");
          await say("retry");
          setTimeout(() => setError(null), 3000);
        }
      } catch (e) {
        console.error("[Voice]", e);
        setIsProcessing(false);
        setError(e.message);
        await say("retry");
        setTimeout(() => setError(null), 3000);
      } finally {
        busyRef.current = false;
        setIsProcessing(false);
      }
    },
    [nav, say],
  );

  // ─── VAD ────────────────────────────────────────────
  const runVAD = useCallback(() => {
    const an = analyserRef.current;
    if (!an || !enabledRef.current) return;

    const buf = new Float32Array(an.fftSize);
    let recording = false;
    let chunks = [];
    let rec = null;

    const tick = () => {
      if (!enabledRef.current) return;

      // Audio aytilayotganda yoki processing da — VAD to'xtaydi
      if (busyRef.current || voiceFeedback.isSpeaking()) {
        rafRef.current = requestAnimationFrame(tick);
        return;
      }

      an.getFloatTimeDomainData(buf);
      let s = 0;
      for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
      const rms = Math.sqrt(s / buf.length);

      if (rms > VOL_THRESHOLD) {
        clearTimeout(silenceRef.current);
        if (rms > peakRef.current) peakRef.current = rms;

        if (!recording && !busyRef.current) {
          recording = true;
          chunks = [];
          peakRef.current = rms;
          startRef.current = Date.now();
          setIsRecording(true);

          const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "audio/webm";
          rec = new MediaRecorder(streamRef.current, { mimeType: mime });
          recRef.current = rec;
          rec.ondataavailable = (e) => {
            if (e.data.size > 0) chunks.push(e.data);
          };
          rec.onstop = () => {
            const dur = Date.now() - startRef.current;
            setIsRecording(false);
            recording = false;
            if (
              dur >= MIN_REC_MS &&
              chunks.length &&
              peakRef.current > VOL_THRESHOLD * 1.5
            ) {
              send(new Blob(chunks, { type: "audio/webm" }));
            }
          };
          rec.start(80);
          setTimeout(() => {
            if (rec?.state === "recording") rec.stop();
          }, MAX_REC_MS);
        }
      } else if (recording && rec?.state === "recording") {
        clearTimeout(silenceRef.current);
        silenceRef.current = setTimeout(() => {
          if (rec?.state === "recording") rec.stop();
        }, SILENCE_MS);
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
  }, [send]);

  // ─── Toggle ─────────────────────────────────────────
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
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      const ctx = new AudioContext({ sampleRate: 16000 });
      audioCtxRef.current = ctx;
      if (ctx.state === "suspended") await ctx.resume();

      const src = ctx.createMediaStreamSource(stream);
      const an = ctx.createAnalyser();
      an.fftSize = 512;
      src.connect(an);
      analyserRef.current = an;

      enabledRef.current = true;
      busyRef.current = false;
      setIsEnabled(true);
      setIsListening(true);
      setError(null);
      runVAD();
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
  }, [isEnabled, cleanup, runVAD]);

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

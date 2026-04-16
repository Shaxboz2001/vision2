// hooks/useVoiceAssistant.js
//
// Tezlik degradatsiyasi fix:
//   1. AbortController — eski fetch lar cancel qilinadi
//   2. Har recording dan keyin chunks tozalanadi
//   3. MediaRecorder har safar yangi yaratiladi va eski ref null qilinadi
//   4. requestAnimationFrame o'rniga setInterval (barqaror tezlik)

import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { voiceFeedback } from "@/utils/voiceFeedback";

const API = import.meta.env.VITE_VOICE_API || "https://172.16.55.13:8006";

const VOL_THRESHOLD = 0.035;
const SILENCE_MS = 500;
const MAX_REC_MS = 4000;
const MIN_REC_MS = 500;
const VAD_INTERVAL = 50; // 50ms interval (20 FPS) — barqaror, CPU friendly

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
  const vadIntervalRef = useRef(null); // setInterval ID
  const silenceRef = useRef(null);
  const recRef = useRef(null);
  const chunksRef = useRef([]); // chunks ref da — closure muammo yo'q
  const startRef = useRef(0);
  const enabledRef = useRef(false);
  const busyRef = useRef(false);
  const peakRef = useRef(0);
  const recordingRef = useRef(false);
  const abortRef = useRef(null); // AbortController

  const cleanup = useCallback(() => {
    enabledRef.current = false;
    busyRef.current = false;
    recordingRef.current = false;

    // VAD interval
    clearInterval(vadIntervalRef.current);
    vadIntervalRef.current = null;

    clearTimeout(silenceRef.current);
    silenceRef.current = null;

    // Fetch cancel
    if (abortRef.current) {
      abortRef.current.abort();
      abortRef.current = null;
    }

    voiceFeedback.stop();

    if (recRef.current) {
      try {
        if (recRef.current.state === "recording") recRef.current.stop();
      } catch {}
      recRef.current = null;
    }
    chunksRef.current = [];

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

  const say = useCallback(async (key) => {
    busyRef.current = true;
    setIsSpeaking(true);
    try {
      await voiceFeedback.speak(key);
    } catch {}
    await new Promise((r) => setTimeout(r, 200));
    setIsSpeaking(false);
    busyRef.current = false;
  }, []);

  const send = useCallback(
    async (blob) => {
      if (blob.size < 2000 || busyRef.current) return;
      busyRef.current = true;
      setIsProcessing(true);
      setError(null);

      // Eski fetch ni cancel qilish
      if (abortRef.current) abortRef.current.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const fd = new FormData();
        fd.append("audio", blob, "v.webm");
        const res = await fetch(`${API}/api/voice/command`, {
          method: "POST",
          body: fd,
          signal: controller.signal,
        });
        if (!res.ok)
          throw new Error(
            (await res.json().catch(() => ({}))).detail || res.status,
          );
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
        if (e.name === "AbortError") return; // cancel qilingan — normal
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

  // ─── VAD — setInterval bilan (barqaror tezlik) ─────
  const startVAD = useCallback(() => {
    const an = analyserRef.current;
    if (!an || !enabledRef.current) return;

    const buf = new Float32Array(an.fftSize);

    vadIntervalRef.current = setInterval(() => {
      if (!enabledRef.current) return;
      if (busyRef.current || voiceFeedback.isSpeaking()) return;

      an.getFloatTimeDomainData(buf);
      let s = 0;
      for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
      const rms = Math.sqrt(s / buf.length);

      if (rms > VOL_THRESHOLD) {
        clearTimeout(silenceRef.current);
        if (rms > peakRef.current) peakRef.current = rms;

        if (!recordingRef.current && !busyRef.current) {
          recordingRef.current = true;
          chunksRef.current = [];
          peakRef.current = rms;
          startRef.current = Date.now();
          setIsRecording(true);

          const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
            ? "audio/webm;codecs=opus"
            : "audio/webm";
          const rec = new MediaRecorder(streamRef.current, { mimeType: mime });
          recRef.current = rec;

          rec.ondataavailable = (e) => {
            if (e.data.size > 0) chunksRef.current.push(e.data);
          };

          rec.onstop = () => {
            const dur = Date.now() - startRef.current;
            setIsRecording(false);
            recordingRef.current = false;

            if (dur >= MIN_REC_MS && chunksRef.current.length) {
              const blob = new Blob(chunksRef.current, { type: "audio/webm" });
              chunksRef.current = []; // GC
              send(blob);
            } else {
              chunksRef.current = []; // GC
            }
            recRef.current = null; // GC
          };

          rec.start(80);
          setTimeout(() => {
            if (rec.state === "recording") rec.stop();
          }, MAX_REC_MS);
        }
      } else if (
        recordingRef.current &&
        recRef.current?.state === "recording"
      ) {
        clearTimeout(silenceRef.current);
        silenceRef.current = setTimeout(() => {
          if (recRef.current?.state === "recording") recRef.current.stop();
        }, SILENCE_MS);
      }
    }, VAD_INTERVAL);
  }, [send]);

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
      recordingRef.current = false;
      setIsEnabled(true);
      setIsListening(true);
      setError(null);
      startVAD();
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
  }, [isEnabled, cleanup, startVAD]);

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

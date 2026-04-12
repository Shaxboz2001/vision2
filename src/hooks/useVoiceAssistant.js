// hooks/useVoiceAssistant.js
import { useState, useRef, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { voiceFeedback } from "@/utils/voiceFeedback";

const API = import.meta.env.VITE_VOICE_API || "https://172.16.55.13:8006";

const VOL_THRESHOLD = 0.035;
const SILENCE_MS = 500; // 800→500ms (tezroq to'xtash)
const MAX_REC_MS = 4000;
const MIN_REC_MS = 500;

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

  const say = useCallback(async (key) => {
    busyRef.current = true;
    setIsSpeaking(true);
    try {
      await voiceFeedback.speak(key);
    } catch {}
    await new Promise((r) => setTimeout(r, 200)); // 300→200ms
    setIsSpeaking(false);
    busyRef.current = false;
  }, []);

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

        if (!d.has_wake_word) {
          busyRef.current = false;
          setIsProcessing(false);
          return;
        }

        setLastTranscript(d.transcript);
        setIsProcessing(false);
        const found = d.nav_path || d.camera_name || d.camera_id;

        if (found) {
          // Avval navigate, keyin audio (tezroq)
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
            }, 300);
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

  const runVAD = useCallback(() => {
    const an = analyserRef.current;
    if (!an || !enabledRef.current) return;

    const buf = new Float32Array(an.fftSize);
    let recording = false;
    let chunks = [];
    let rec = null;

    const tick = () => {
      if (!enabledRef.current) return;

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
            if (dur >= MIN_REC_MS && chunks.length) {
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

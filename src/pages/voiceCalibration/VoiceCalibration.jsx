// pages/VoiceCalibration.jsx
//
// Ovozli buyruqlarni o'rgatish sahifasi.
// Route: /voice-calibration (App.jsx ga qo'shing)
//
// Foydalanish:
//   1. Ro'yxatdan route tanlang (masalan: "Kameralar")
//   2. 🎤 bosing va "kameralarni och" deng
//   3. Tizim Whisper natijasini alias sifatida saqlaydi
//   4. Endi "UMK AI, kameralarni och" deyilganda ishlaydi

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Box,
  Paper,
  Typography,
  Grid,
  Button,
  IconButton,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  Tooltip,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import StopIcon from "@mui/icons-material/Stop";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SchoolIcon from "@mui/icons-material/School";

const API = import.meta.env.VITE_VOICE_API || "/voice-api";

export default function VoiceCalibration() {
  const [routes, setRoutes] = useState({ navigation: [], cameras: [] });
  const [aliases, setAliases] = useState([]);
  const [selected, setSelected] = useState(null); // { target, type, label, cam_id }
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState(null); // { ok, transcript, saved_text, error }
  const recorderRef = useRef(null);
  const streamRef = useRef(null);

  // ─── Load data ──────────────────────────────────────
  const loadRoutes = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/voice/routes`);
      setRoutes(await res.json());
    } catch {}
  }, []);

  const loadAliases = useCallback(async () => {
    try {
      const res = await fetch(`${API}/api/voice/aliases`);
      const data = await res.json();
      setAliases(data.aliases || []);
    } catch {}
  }, []);

  useEffect(() => {
    loadRoutes();
    loadAliases();
  }, [loadRoutes, loadAliases]);

  // ─── Record & Send ─────────────────────────────────
  const startRecording = useCallback(async () => {
    if (!selected) return;
    setResult(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          sampleRate: 16000,
          channelCount: 1,
          echoCancellation: true,
          noiseSuppression: true,
        },
      });
      streamRef.current = stream;

      const mime = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? "audio/webm;codecs=opus"
        : "audio/webm";
      const recorder = new MediaRecorder(stream, { mimeType: mime });
      recorderRef.current = recorder;
      const chunks = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop());
        setIsRecording(false);
        setIsProcessing(true);

        try {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const fd = new FormData();
          fd.append("audio", blob, "calibrate.webm");
          fd.append("target", selected.target);
          fd.append("target_type", selected.type);
          fd.append("label", selected.label);
          if (selected.cam_id) fd.append("cam_id", String(selected.cam_id));

          const res = await fetch(`${API}/api/voice/calibrate`, {
            method: "POST",
            body: fd,
          });
          const data = await res.json();
          setResult(data);
          if (data.ok) loadAliases();
        } catch (err) {
          setResult({ ok: false, error: err.message });
        } finally {
          setIsProcessing(false);
        }
      };

      recorder.start();
      setIsRecording(true);

      // 4s dan keyin auto-stop
      setTimeout(() => {
        if (recorder.state === "recording") recorder.stop();
      }, 4000);
    } catch (err) {
      setResult({ ok: false, error: "Mikrofon: " + err.message });
    }
  }, [selected, loadAliases]);

  const stopRecording = useCallback(() => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }, []);

  // ─── Delete alias ──────────────────────────────────
  const deleteAlias = useCallback(
    async (text, target) => {
      try {
        await fetch(`${API}/api/voice/aliases`, {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, target }),
        });
        loadAliases();
      } catch {}
    },
    [loadAliases],
  );

  return (
    <Box sx={{ p: 3, maxWidth: 900, mx: "auto" }}>
      {/* Header */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
        <SchoolIcon sx={{ fontSize: 28, color: "#00d4ff" }} />
        <Box>
          <Typography
            sx={{
              fontFamily: "'Orbitron', monospace",
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            UMK AI — SO'Z O'RGATISH
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.65rem",
              color: "#6b7280",
            }}
          >
            Har bir bo'limni tanlang va ovoz bilan ayting • Tizim avtomatik
            o'rganadi
          </Typography>
        </Box>
      </Box>

      <Grid container spacing={2.5}>
        {/* LEFT — Route selection */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.7rem",
                color: "#6b7280",
                letterSpacing: "0.1em",
                mb: 1.5,
              }}
            >
              1. BO'LIMNI TANLANG
            </Typography>

            <Typography
              sx={{ fontSize: "0.65rem", color: "#6b7280", mb: 0.5, mt: 1 }}
            >
              Sahifalar
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 2 }}>
              {routes.navigation?.map((r) => (
                <Chip
                  key={r.path}
                  label={r.label}
                  size="small"
                  onClick={() =>
                    setSelected({ target: r.path, type: "nav", label: r.label })
                  }
                  color={selected?.target === r.path ? "primary" : "default"}
                  variant={selected?.target === r.path ? "filled" : "outlined"}
                  sx={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "0.72rem",
                  }}
                />
              ))}
            </Box>

            <Typography sx={{ fontSize: "0.65rem", color: "#6b7280", mb: 0.5 }}>
              Kameralar
            </Typography>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
              {routes.cameras?.map((c) => (
                <Chip
                  key={c.id}
                  label={c.name}
                  size="small"
                  onClick={() =>
                    setSelected({
                      target: c.name,
                      type: "cam",
                      label: c.name,
                      cam_id: c.id,
                    })
                  }
                  color={selected?.target === c.name ? "secondary" : "default"}
                  variant={selected?.target === c.name ? "filled" : "outlined"}
                  sx={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "0.72rem",
                  }}
                />
              ))}
            </Box>
          </Paper>

          {/* Record */}
          <Paper sx={{ p: 2, mt: 2 }}>
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.7rem",
                color: "#6b7280",
                letterSpacing: "0.1em",
                mb: 1.5,
              }}
            >
              2. MIKROFONGA AYTING
            </Typography>

            {selected ? (
              <Box sx={{ textAlign: "center" }}>
                <Typography
                  sx={{
                    fontSize: "0.75rem",
                    mb: 1.5,
                    color: "#94a3b8",
                    fontFamily: "'Share Tech Mono', monospace",
                  }}
                >
                  Tanlangan:{" "}
                  <strong style={{ color: "#00d4ff" }}>{selected.label}</strong>
                  <br />
                  Masalan: <em>"{selected.label.toLowerCase()}ni och"</em>
                </Typography>

                {isProcessing ? (
                  <CircularProgress size={40} sx={{ color: "#00d4ff" }} />
                ) : (
                  <IconButton
                    onClick={isRecording ? stopRecording : startRecording}
                    sx={{
                      width: 64,
                      height: 64,
                      backgroundColor: isRecording
                        ? "rgba(255,45,85,0.15)"
                        : "rgba(0,212,255,0.1)",
                      border: `2px solid ${isRecording ? "#ff2d55" : "#00d4ff"}`,
                      color: isRecording ? "#ff2d55" : "#00d4ff",
                      animation: isRecording ? "recPulse 1s infinite" : "none",
                      "@keyframes recPulse": {
                        "0%,100%": { boxShadow: "0 0 0 0 rgba(255,45,85,.3)" },
                        "50%": { boxShadow: "0 0 0 12px rgba(255,45,85,0)" },
                      },
                    }}
                  >
                    {isRecording ? (
                      <StopIcon sx={{ fontSize: 28 }} />
                    ) : (
                      <MicIcon sx={{ fontSize: 28 }} />
                    )}
                  </IconButton>
                )}

                <Typography
                  sx={{
                    fontSize: "0.6rem",
                    mt: 1,
                    color: "#6b7280",
                    fontFamily: "'Share Tech Mono', monospace",
                  }}
                >
                  {isRecording
                    ? "Gapiring... (4s)"
                    : isProcessing
                      ? "Aniqlanmoqda..."
                      : "Bosing va gapiring"}
                </Typography>

                {/* Result */}
                {result && (
                  <Box sx={{ mt: 2 }}>
                    {result.ok ? (
                      <Alert
                        severity="success"
                        icon={<CheckCircleIcon />}
                        sx={{ fontSize: "0.75rem" }}
                      >
                        Saqlandi: <strong>«{result.saved_text}»</strong> →{" "}
                        {selected.label}
                      </Alert>
                    ) : (
                      <Alert severity="error" sx={{ fontSize: "0.75rem" }}>
                        {result.error || "Xatolik"}
                        {result.transcript &&
                          ` (eshitildi: "${result.transcript}")`}
                      </Alert>
                    )}
                  </Box>
                )}
              </Box>
            ) : (
              <Typography
                sx={{
                  textAlign: "center",
                  color: "#6b7280",
                  fontSize: "0.75rem",
                }}
              >
                Avval yuqoridan bo'lim tanlang
              </Typography>
            )}
          </Paper>
        </Grid>

        {/* RIGHT — Learned aliases */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.7rem",
                color: "#6b7280",
                letterSpacing: "0.1em",
                mb: 1.5,
              }}
            >
              O'RGANILGAN SO'ZLAR ({aliases.length})
            </Typography>

            {aliases.length === 0 ? (
              <Typography
                sx={{
                  color: "#6b7280",
                  fontSize: "0.75rem",
                  textAlign: "center",
                  py: 3,
                }}
              >
                Hali so'z o'rgatilmagan. Chapdan bo'lim tanlab, mikrofonga
                gapiring.
              </Typography>
            ) : (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {aliases.map((a, i) => (
                  <Box
                    key={i}
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      p: 1,
                      borderRadius: 1,
                      border: "1px solid",
                      borderColor: "divider",
                    }}
                  >
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography
                        sx={{
                          fontFamily: "'Share Tech Mono', monospace",
                          fontSize: "0.72rem",
                          color: "#e2e8f0",
                        }}
                      >
                        «{a.text}»
                      </Typography>
                      <Typography sx={{ fontSize: "0.6rem", color: "#6b7280" }}>
                        → {a.label || a.target} ({a.type})
                      </Typography>
                    </Box>
                    <Tooltip title="O'chirish">
                      <IconButton
                        size="small"
                        onClick={() => deleteAlias(a.text, a.target)}
                        sx={{
                          color: "#6b7280",
                          "&:hover": { color: "#ff2d55" },
                        }}
                      >
                        <DeleteIcon sx={{ fontSize: 16 }} />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}

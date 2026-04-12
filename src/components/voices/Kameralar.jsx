import { useState, useCallback, useMemo, useRef, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogContent,
  IconButton,
  CircularProgress,
  Tooltip,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import VideocamIcon from "@mui/icons-material/Videocam";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SensorsOffRoundedIcon from "@mui/icons-material/SensorsOffRounded";
import { getKameralar } from "@/api";
import { SectionHeader, LiveBadge } from "@/components/common";
import { useVoiceCommand } from "./useVoiceCommand";
import { useWakeWord } from "./useWakeWord";
import VoiceMicButton from "./VoiceMicButton";

const STREAM_BASE = "http://172.16.55.13:8889";

const CAMERA_STREAMS = [
  {
    id: 1,
    name: "Kamera 01",
    subPath: "cam01_sub",
    mainPath: "cam01_main",
    location: "1-uchastka",
  },
  {
    id: 2,
    name: "Kamera 02",
    subPath: "cam02_sub",
    mainPath: "cam02_main",
    location: "1-uchastka",
  },
  {
    id: 3,
    name: "Kamera 03",
    subPath: "cam03_sub",
    mainPath: "cam03_main",
    location: "2-uchastka",
  },
  {
    id: 4,
    name: "Kamera 04",
    subPath: "cam04_sub",
    mainPath: "cam04_main",
    location: "2-uchastka",
  },
  {
    id: 5,
    name: "Kamera 05",
    subPath: "cam05_sub",
    mainPath: "cam05_main",
    location: "3-uchastka",
  },
  {
    id: 6,
    name: "Kamera 06",
    subPath: "cam06_sub",
    mainPath: "cam06_main",
    location: "3-uchastka",
  },
  {
    id: 7,
    name: "Kamera 07",
    subPath: "cam07_sub",
    mainPath: "cam07_main",
    location: "4-uchastka",
  },
  {
    id: 8,
    name: "Kamera 08",
    subPath: "cam08_sub",
    mainPath: "cam08_main",
    location: "4-uchastka",
  },
  {
    id: 9,
    name: "Kamera 09",
    subPath: "cam09_sub",
    mainPath: "cam09_main",
    location: "5-uchastka",
  },
  {
    id: 10,
    name: "Kamera 10",
    subPath: "cam10_sub",
    mainPath: "cam10_main",
    location: "5-uchastka",
  },
  {
    id: 11,
    name: "Kamera 11",
    subPath: "cam11_sub",
    mainPath: "cam11_main",
    location: "6-uchastka",
  },
  {
    id: 12,
    name: "Kamera 12",
    subPath: "cam12_sub",
    mainPath: "cam12_main",
    location: "6-uchastka",
  },
];

function getStreamConfig(cam) {
  return CAMERA_STREAMS.find((item) => String(item.id) === String(cam?.id));
}

function getCameraStatusMeta(status) {
  switch (status) {
    case "jonli":
      return {
        label: "JONLI",
        color: "#34d399",
        bg: "rgba(16,185,129,0.16)",
        border: "1px solid rgba(16,185,129,0.34)",
      };
    case "xato":
      return {
        label: "XATO",
        color: "#f87171",
        bg: "rgba(239,68,68,0.16)",
        border: "1px solid rgba(239,68,68,0.34)",
      };
    case "signal_yoq":
      return {
        label: "SIGNAL YO‘Q",
        color: "#cbd5e1",
        bg: "rgba(148,163,184,0.16)",
        border: "1px solid rgba(148,163,184,0.28)",
      };
    default:
      return {
        label: "NOMA’LUM",
        color: "#cbd5e1",
        bg: "rgba(148,163,184,0.16)",
        border: "1px solid rgba(148,163,184,0.28)",
      };
  }
}

function buildStreamUrl(cam, isLarge = false) {
  const config = getStreamConfig(cam);
  if (!config) return null;

  const path = isLarge ? config.mainPath : config.subPath;
  const controls = isLarge ? "true" : "false";

  return `${STREAM_BASE}/${path}?controls=${controls}&muted=true&autoplay=true&playsInline=true`;
}

function StatsCard({ title, value, color, icon }) {
  return (
    <Paper
      sx={{
        p: 1.5,
        borderRadius: 3,
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(7,10,18,0.98) 100%)",
        border: "1px solid rgba(255,255,255,0.06)",
        boxShadow: "0 10px 24px rgba(0,0,0,0.18)",
      }}
    >
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Box>
          <Typography
            sx={{
              fontSize: "1.65rem",
              fontWeight: 800,
              lineHeight: 1,
              color,
            }}
          >
            {value}
          </Typography>
          <Typography
            sx={{
              mt: 0.5,
              fontSize: "0.64rem",
              letterSpacing: "0.12em",
              color: "#94a3b8",
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: "50%",
            display: "grid",
            placeItems: "center",
            color,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.06)",
          }}
        >
          {icon}
        </Box>
      </Stack>
    </Paper>
  );
}

function CameraCard({ cam, highlighted = false, onOpen }) {
  const streamCfg = getStreamConfig(cam);
  const streamUrl = buildStreamUrl(cam, false);
  const statusMeta = getCameraStatusMeta(cam?.holat);

  return (
    <Box
      sx={{
        position: "relative",
        borderRadius: 3,
        overflow: "hidden",
        background:
          "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(7,10,18,0.98) 100%)",
        border: highlighted
          ? "2px solid #00ff9d"
          : "1px solid rgba(255,255,255,0.06)",
        boxShadow: highlighted
          ? "0 0 0 1px rgba(0,255,157,0.14), 0 18px 34px rgba(0,0,0,0.30)"
          : "0 14px 28px rgba(0,0,0,0.20)",
        transition: "all 0.28s ease",
        "&:hover": {
          transform: cam?.holat === "jonli" ? "translateY(-3px)" : "none",
          boxShadow:
            cam?.holat === "jonli"
              ? "0 18px 36px rgba(0,0,0,0.30)"
              : "0 14px 28px rgba(0,0,0,0.20)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 10",
          background: "#000",
          cursor: cam?.holat === "jonli" ? "pointer" : "default",
        }}
        onClick={() => cam?.holat === "jonli" && onOpen?.(cam)}
      >
        {streamUrl ? (
          <iframe
            src={streamUrl}
            title={`camera-${cam?.id}-sub`}
            allow="autoplay; fullscreen"
            allowFullScreen
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              display: "block",
              background: "#000",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "100%",
              height: "100%",
              display: "grid",
              placeItems: "center",
              px: 2,
              textAlign: "center",
              color: "#94a3b8",
            }}
          >
            <Typography sx={{ fontSize: "0.82rem" }}>
              Stream topilmadi
            </Typography>
          </Box>
        )}

        {cam?.holat === "jonli" && (
          <Tooltip title="Kattalashtirish">
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpen?.(cam);
              }}
              sx={{
                position: "absolute",
                top: 10,
                right: 10,
                zIndex: 3,
                color: "#fff",
                background: "rgba(6,8,16,0.74)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.12)",
                "&:hover": {
                  background: "rgba(6,8,16,0.95)",
                },
              }}
            >
              <ZoomOutMapIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}

        <Box
          sx={{
            position: "absolute",
            left: 10,
            right: 10,
            bottom: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 1,
            pointerEvents: "none",
          }}
        >
          <Box
            sx={{
              px: 1,
              py: 0.45,
              borderRadius: 999,
              background: "rgba(6,8,16,0.72)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(8px)",
              maxWidth: "70%",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "#e5e7eb",
                fontWeight: 700,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {cam?.nom || streamCfg?.name || "Noma’lum kamera"}
            </Typography>
          </Box>

          <Box
            sx={{
              px: 1,
              py: 0.35,
              borderRadius: 999,
              background: statusMeta.bg,
              border: statusMeta.border,
            }}
          >
            <Typography
              sx={{
                fontSize: "0.62rem",
                fontWeight: 800,
                color: statusMeta.color,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
              }}
            >
              {statusMeta.label}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 1.25 }}>
        <Typography
          sx={{
            fontSize: "0.9rem",
            fontWeight: 700,
            color: "#f8fafc",
            lineHeight: 1.2,
          }}
        >
          {cam?.nom || streamCfg?.name || "Noma’lum kamera"}
        </Typography>

        <Typography
          sx={{
            mt: 0.5,
            fontSize: "0.72rem",
            color: "#94a3b8",
          }}
        >
          {cam?.sex || "—"} · {cam?.uchastka || streamCfg?.location || "—"}
        </Typography>
      </Box>
    </Box>
  );
}

function CameraDialog({ cam, open, onClose }) {
  const streamUrl = buildStreamUrl(cam, true);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.99) 0%, rgba(6,8,16,0.99) 100%)",
          border: "1px solid rgba(0,212,255,0.22)",
          borderRadius: 3,
          overflow: "hidden",
        },
      }}
    >
      {cam && (
        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  color: "#00d4ff",
                }}
              >
                {cam?.id} — {cam?.nom || "Kamera"}
              </Typography>
              <Typography
                sx={{
                  mt: 0.25,
                  fontSize: "0.72rem",
                  color: "#94a3b8",
                }}
              >
                {cam?.sex || "—"} · {cam?.uchastka || "—"} · {cam?.fps || "—"}{" "}
                fps
              </Typography>
            </Box>

            <IconButton
              size="small"
              onClick={onClose}
              sx={{ color: "#94a3b8" }}
            >
              <CloseIcon />
            </IconButton>
          </Box>

          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                position: "relative",
                aspectRatio: "16 / 9",
                borderRadius: 3,
                overflow: "hidden",
                background: "#000",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              {streamUrl ? (
                <iframe
                  src={streamUrl}
                  title={`camera-${cam?.id}-main`}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  style={{
                    width: "100%",
                    height: "100%",
                    border: "none",
                    display: "block",
                    background: "#000",
                  }}
                />
              ) : (
                <Box
                  sx={{
                    width: "100%",
                    height: "100%",
                    display: "grid",
                    placeItems: "center",
                    color: "#94a3b8",
                  }}
                >
                  <Typography>Asosiy stream topilmadi</Typography>
                </Box>
              )}
            </Box>
          </Box>
        </DialogContent>
      )}
    </Dialog>
  );
}

export default function Kameralar() {
  const [filter, setFilter] = useState("barchasi");
  const [fullscreenCam, setFullscreenCam] = useState(null);
  const [highlightedCamId, setHighlightedCamId] = useState(null);
  const timeoutRef = useRef(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["kameralar"],
    queryFn: getKameralar,
    refetchInterval: 10000,
  });

  const kameralar = useMemo(() => data?.data || [], [data]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const openCamera = useCallback((cam) => {
    if (!cam) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    setHighlightedCamId(cam.id);

    timeoutRef.current = setTimeout(() => {
      setFullscreenCam(cam);
      setHighlightedCamId(null);
      timeoutRef.current = null;
    }, 220);
  }, []);

  const handleVoiceCommand = useCallback(
    ({ camera_name, camera_id }) => {
      let cam = null;

      if (camera_id) {
        cam =
          kameralar.find((item) => String(item.id) === String(camera_id)) ||
          kameralar.find((item) => String(item.channel) === String(camera_id));
      }

      if (!cam && camera_name) {
        const query = String(camera_name).toLowerCase().trim();
        cam =
          kameralar.find((item) => item.nom?.toLowerCase() === query) ||
          kameralar.find((item) => item.nom?.toLowerCase()?.includes(query));
      }

      if (!cam && camera_id && Number(camera_id) <= kameralar.length) {
        cam = kameralar[Number(camera_id) - 1];
      }

      if (!cam) return;
      openCamera(cam);
    },
    [kameralar, openCamera],
  );

  const voice = useVoiceCommand({
    onCommand: handleVoiceCommand,
  });

  const wakeWord = useWakeWord({
    wakeWord: "дурдона",
    onWakeWord: voice.triggerListening,
    enabled: true,
  });

  const filtered = useMemo(() => {
    if (filter === "barchasi") return kameralar;
    if (filter === "jonli") {
      return kameralar.filter((cam) => cam.holat === "jonli");
    }
    return kameralar.filter((cam) => cam.holat !== "jonli");
  }, [filter, kameralar]);

  const stats = useMemo(() => {
    const jami = kameralar.length;
    const jonli = kameralar.filter((cam) => cam.holat === "jonli").length;
    const xato = kameralar.filter((cam) => cam.holat === "xato").length;
    const signalYoq = kameralar.filter(
      (cam) => cam.holat === "signal_yoq",
    ).length;

    return {
      jami,
      jonli,
      xato,
      signalYoq,
    };
  }, [kameralar]);

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: { xs: "flex-start", md: "center" },
          justifyContent: "space-between",
          flexDirection: { xs: "column", md: "row" },
          gap: 1.5,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "Arial, sans-serif",
              fontSize: "1.15rem",
              fontWeight: 800,
              letterSpacing: "0.14em",
              color: "#f8fafc",
            }}
          >
            KAMERA NAZORATI
          </Typography>

          <Typography
            sx={{
              mt: 0.5,
              fontFamily: "Arial, sans-serif",
              fontSize: "0.68rem",
              color: "#94a3b8",
            }}
          >
            {stats.jonli}/{stats.jami} kamera jonli · PyVision Video Analitika
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            flexWrap: "wrap",
          }}
        >
          <VoiceMicButton
            isListening={voice.isListening}
            isProcessing={voice.isProcessing}
            transcript={voice.transcript}
            error={voice.error}
            onClick={voice.startListening}
            wakeWordActive={wakeWord.isActive}
          />

          <LiveBadge />

          <FormControl size="small" sx={{ minWidth: 160 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{
                fontFamily: "Arial, sans-serif",
                fontSize: "0.78rem",
              }}
            >
              <MenuItem value="barchasi">Barchasi ({stats.jami})</MenuItem>
              <MenuItem value="jonli">Jonli ({stats.jonli})</MenuItem>
              <MenuItem value="nosoz">
                Nosoz ({stats.xato + stats.signalYoq})
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      <Grid container spacing={1.5}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="JAMI KAMERA"
            value={stats.jami}
            color="#00d4ff"
            icon={<VideocamIcon fontSize="small" />}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <StatsCard
            title="JONLI"
            value={stats.jonli}
            color="#00ff9d"
            icon={<VideocamIcon fontSize="small" />}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <StatsCard
            title="NOSOZ"
            value={stats.xato}
            color="#ff2d55"
            icon={<WarningAmberRoundedIcon fontSize="small" />}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <StatsCard
            title="SIGNAL YO‘Q"
            value={stats.signalYoq}
            color="#94a3b8"
            icon={<SensorsOffRoundedIcon fontSize="small" />}
          />
        </Grid>
      </Grid>

      <Paper
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          background:
            "linear-gradient(180deg, rgba(15,23,42,0.98) 0%, rgba(7,10,18,0.98) 100%)",
          border: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <SectionHeader title="Kameralar" dot="#ff2d55">
          <LiveBadge />
        </SectionHeader>

        <Box sx={{ p: 2 }}>
          {isLoading ? (
            <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
              <Typography sx={{ color: "#cbd5e1" }}>
                Kameralarni yuklashda xatolik bo‘ldi
              </Typography>
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
              <Typography sx={{ color: "#94a3b8" }}>
                Bu filtr bo‘yicha kamera topilmadi
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {filtered.map((cam) => (
                <Grid item xs={12} sm={6} md={4} xl={3} key={cam.id}>
                  <CameraCard
                    cam={cam}
                    highlighted={highlightedCamId === cam.id}
                    onOpen={openCamera}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      </Paper>

      <CameraDialog
        cam={fullscreenCam}
        open={!!fullscreenCam}
        onClose={() => setFullscreenCam(null)}
      />
    </Box>
  );
}

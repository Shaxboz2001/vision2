import { useState, useCallback, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { alpha, useTheme } from "@mui/material/styles";
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
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import VideocamIcon from "@mui/icons-material/Videocam";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SensorsOffRoundedIcon from "@mui/icons-material/SensorsOffRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import { getKameralar } from "@/api";
import { SectionHeader, LiveBadge } from "@/components/common";

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

function buildStreamUrl(cam, isLarge = false) {
  const config = getStreamConfig(cam);
  if (!config) return null;

  const path = isLarge ? config.mainPath : config.subPath;
  const controls = isLarge ? "true" : "false";

  return `${STREAM_BASE}/${path}?controls=${controls}&muted=true&autoplay=true&playsInline=true`;
}

function getCameraStatusMeta(status, theme) {
  const isDark = theme.palette.mode === "dark";

  switch (status) {
    case "jonli":
      return {
        label: "JONLI",
        color: theme.palette.success.main,
        bg: alpha(theme.palette.success.main, isDark ? 0.18 : 0.12),
        border: `1px solid ${alpha(theme.palette.success.main, isDark ? 0.38 : 0.25)}`,
        icon: <CheckCircleRoundedIcon sx={{ fontSize: 14 }} />,
      };

    case "xato":
      return {
        label: "XATO",
        color: theme.palette.error.main,
        bg: alpha(theme.palette.error.main, isDark ? 0.18 : 0.1),
        border: `1px solid ${alpha(theme.palette.error.main, isDark ? 0.38 : 0.22)}`,
        icon: <WarningAmberRoundedIcon sx={{ fontSize: 14 }} />,
      };

    case "signal_yoq":
      return {
        label: "SIGNAL YO‘Q",
        color: theme.palette.text.secondary,
        bg: alpha(theme.palette.text.secondary, isDark ? 0.18 : 0.08),
        border: `1px solid ${alpha(theme.palette.text.secondary, isDark ? 0.28 : 0.16)}`,
        icon: <SensorsOffRoundedIcon sx={{ fontSize: 14 }} />,
      };

    default:
      return {
        label: "NOMA’LUM",
        color: theme.palette.text.secondary,
        bg: alpha(theme.palette.text.secondary, isDark ? 0.18 : 0.08),
        border: `1px solid ${alpha(theme.palette.text.secondary, isDark ? 0.28 : 0.16)}`,
        icon: <SensorsOffRoundedIcon sx={{ fontSize: 14 }} />,
      };
  }
}

function PageShell({ children }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box
      sx={{
        p: { xs: 1.5, sm: 2, md: 2.5 },
        minHeight: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 2,
        background: isDark
          ? `
            radial-gradient(circle at top left, rgba(0,212,255,0.10), transparent 25%),
            radial-gradient(circle at top right, rgba(34,197,94,0.10), transparent 22%),
            linear-gradient(180deg, #0b1220 0%, #09101a 100%)
          `
          : `
            radial-gradient(circle at top left, rgba(37,99,235,0.08), transparent 25%),
            radial-gradient(circle at top right, rgba(16,185,129,0.08), transparent 22%),
            linear-gradient(180deg, #f8fbff 0%, #eef4fa 100%)
          `,
      }}
    >
      {children}
    </Box>
  );
}

function SurfaceCard({ children, sx = {} }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: `1px solid ${alpha(
          isDark ? "#ffffff" : theme.palette.primary.main,
          isDark ? 0.08 : 0.1,
        )}`,
        background: isDark
          ? "linear-gradient(180deg, rgba(15,23,42,0.94) 0%, rgba(7,10,18,0.96) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(247,250,252,0.98) 100%)",
        boxShadow: isDark
          ? "0 14px 40px rgba(0,0,0,0.28)"
          : "0 14px 34px rgba(15, 23, 42, 0.08)",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function StatsCard({ title, value, color, icon }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <SurfaceCard
      sx={{
        p: 1.6,
        height: "100%",
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        spacing={1.5}
      >
        <Box>
          <Typography
            sx={{
              fontSize: { xs: "1.35rem", sm: "1.55rem", md: "1.7rem" },
              fontWeight: 900,
              lineHeight: 1,
              color,
            }}
          >
            {value}
          </Typography>

          <Typography
            sx={{
              mt: 0.6,
              fontSize: "0.68rem",
              fontWeight: 700,
              letterSpacing: "0.14em",
              color: isDark ? "rgba(226,232,240,0.72)" : "text.secondary",
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box
          sx={{
            width: 44,
            height: 44,
            borderRadius: "14px",
            display: "grid",
            placeItems: "center",
            color,
            background: alpha(color, isDark ? 0.14 : 0.1),
            border: `1px solid ${alpha(color, isDark ? 0.25 : 0.18)}`,
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
      </Stack>
    </SurfaceCard>
  );
}

function CameraCard({ cam, highlighted = false, onOpen }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const streamCfg = getStreamConfig(cam);
  const streamUrl = buildStreamUrl(cam, false);
  const statusMeta = getCameraStatusMeta(cam?.holat, theme);
  const isLive = cam?.holat === "jonli";

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        borderRadius: 4,
        overflow: "hidden",
        background: isDark
          ? "linear-gradient(180deg, rgba(15,23,42,0.96) 0%, rgba(7,10,18,0.98) 100%)"
          : "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(245,248,252,1) 100%)",
        border: highlighted
          ? `1.5px solid ${alpha(theme.palette.success.main, 0.9)}`
          : `1px solid ${alpha(
              isDark ? "#ffffff" : theme.palette.primary.main,
              isDark ? 0.08 : 0.1,
            )}`,
        boxShadow: highlighted
          ? isDark
            ? `0 0 0 1px ${alpha(theme.palette.success.main, 0.18)}, 0 18px 40px rgba(0,0,0,0.34)`
            : `0 0 0 1px ${alpha(theme.palette.success.main, 0.14)}, 0 16px 34px rgba(15,23,42,0.12)`
          : isDark
            ? "0 14px 30px rgba(0,0,0,0.22)"
            : "0 10px 24px rgba(15,23,42,0.08)",
        transition: "all 0.28s ease",
        "&:hover": {
          transform: isLive ? "translateY(-4px)" : "none",
          boxShadow: isDark
            ? "0 18px 38px rgba(0,0,0,0.30)"
            : "0 16px 34px rgba(15,23,42,0.12)",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          aspectRatio: "16 / 10",
          background: "#000",
          cursor: isLive ? "pointer" : "default",
        }}
        onClick={() => isLive && onOpen?.(cam)}
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
              color: isDark ? "#94a3b8" : "text.secondary",
            }}
          >
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 600 }}>
              Stream topilmadi
            </Typography>
          </Box>
        )}

        {isLive && (
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
                background: "rgba(6,8,16,0.72)",
                backdropFilter: "blur(8px)",
                border: "1px solid rgba(255,255,255,0.14)",
                "&:hover": {
                  background: "rgba(6,8,16,0.92)",
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
              py: 0.5,
              borderRadius: 999,
              background: "rgba(6,8,16,0.70)",
              border: "1px solid rgba(255,255,255,0.10)",
              backdropFilter: "blur(8px)",
              maxWidth: "72%",
            }}
          >
            <Typography
              sx={{
                fontSize: "0.68rem",
                color: "#f8fafc",
                fontWeight: 800,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {cam?.nom || streamCfg?.name || "Noma’lum kamera"}
            </Typography>
          </Box>
          {/* 
          <Box
            sx={{
              px: 1,
              py: 0.38,
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              background: statusMeta.bg,
              border: statusMeta.border,
            }}
          >
            {statusMeta.icon}
            <Typography
              sx={{
                fontSize: "0.60rem",
                fontWeight: 900,
                color: statusMeta.color,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                lineHeight: 1,
              }}
            >
              {statusMeta.label}
            </Typography>
          </Box> */}
        </Box>
      </Box>

      {/* <Box sx={{ p: 1.4 }}>
        <Typography
          sx={{
            fontSize: "0.94rem",
            fontWeight: 800,
            color: "text.primary",
            lineHeight: 1.25,
          }}
        >
          {cam?.nom || streamCfg?.name || "Noma’lum kamera"}
        </Typography>

        <Typography
          sx={{
            mt: 0.55,
            fontSize: "0.74rem",
            color: "text.secondary",
            lineHeight: 1.5,
          }}
        >
          {cam?.sex || "—"} · {cam?.uchastka || streamCfg?.location || "—"}
        </Typography>
      </Box> */}
    </Box>
  );
}

function CameraDialog({ cam, open, onClose }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const streamUrl = buildStreamUrl(cam, true);

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="xl"
      fullWidth
      PaperProps={{
        sx: {
          background: isDark
            ? "linear-gradient(180deg, rgba(15,23,42,0.99) 0%, rgba(6,8,16,0.99) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.99) 0%, rgba(245,248,252,0.99) 100%)",
          border: `1px solid ${alpha(theme.palette.primary.main, isDark ? 0.28 : 0.14)}`,
          borderRadius: 4,
          overflow: "hidden",
          boxShadow: isDark
            ? "0 24px 60px rgba(0,0,0,0.40)"
            : "0 24px 50px rgba(15,23,42,0.16)",
        },
      }}
    >
      {cam && (
        <DialogContent sx={{ p: 0 }}>
          <Box
            sx={{
              px: 2,
              py: 1.5,
              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              gap: 2,
            }}
          >
            <Box>
              {/* <Typography
                sx={{
                  fontSize: "0.96rem",
                  fontWeight: 900,
                  color: theme.palette.primary.main,
                }}
              >
                {cam?.id} — {cam?.nom || "Kamera"}
              </Typography> */}

              {/* <Typography
                sx={{
                  mt: 0.35,
                  fontSize: "0.74rem",
                  color: "text.secondary",
                }}
              >
                {cam?.sex || "—"} · {cam?.uchastka || "—"} · {cam?.fps || "—"}{" "}
                fps
              </Typography> */}
            </Box>

            <IconButton
              size="small"
              onClick={onClose}
              sx={{
                color: "text.secondary",
                border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
              }}
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
                border: `1px solid ${alpha(theme.palette.divider, 0.9)}`,
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
                    color: "text.secondary",
                  }}
                >
                  <Typography sx={{ fontWeight: 700 }}>
                    Asosiy stream topilmadi
                  </Typography>
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
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [filter, setFilter] = useState("barchasi");
  const [fullscreenCam, setFullscreenCam] = useState(null);
  const [highlightedCamId, setHighlightedCamId] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["kameralar"],
    queryFn: getKameralar,
    refetchInterval: 10000,
  });

  const kameralar = useMemo(() => data?.data || [], [data]);

  const openCamera = useCallback((cam) => {
    if (!cam) return;
    setHighlightedCamId(cam.id);

    setTimeout(() => {
      setFullscreenCam(cam);
      setHighlightedCamId(null);
    }, 180);
  }, []);

  const filtered = useMemo(() => {
    if (filter === "barchasi") return kameralar;
    if (filter === "jonli")
      return kameralar.filter((cam) => cam.holat === "jonli");
    if (filter === "xato")
      return kameralar.filter((cam) => cam.holat === "xato");
    if (filter === "signal_yoq")
      return kameralar.filter((cam) => cam.holat === "signal_yoq");
    return kameralar;
  }, [filter, kameralar]);

  const stats = useMemo(() => {
    const jami = kameralar.length;
    const jonli = kameralar.filter((cam) => cam.holat === "jonli").length;
    const xato = kameralar.filter((cam) => cam.holat === "xato").length;
    const signalYoq = kameralar.filter(
      (cam) => cam.holat === "signal_yoq",
    ).length;

    return { jami, jonli, xato, signalYoq };
  }, [kameralar]);

  return (
    <PageShell>
      {/* <SurfaceCard sx={{ p: { xs: 1.5, sm: 2, md: 2.2 } }}>
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
                fontSize: { xs: "1rem", sm: "1.12rem", md: "1.22rem" },
                fontWeight: 900,
                letterSpacing: "0.14em",
                color: "text.primary",
              }}
            >
              KAMERA NAZORATI
            </Typography>

            <Typography
              sx={{
                mt: 0.6,
                fontFamily: "Arial, sans-serif",
                fontSize: "0.73rem",
                color: "text.secondary",
              }}
            >
              {stats.jonli}/{stats.jami} kamera jonli · PyVision Video Analitika
            </Typography>
          </Box>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.2}
            alignItems={{ xs: "stretch", sm: "center" }}
            sx={{ width: { xs: "100%", md: "auto" } }}
          >
            <LiveBadge />

            <Chip
              icon={<VideocamIcon />}
              label="Mikrofon o‘chirildi"
              sx={{
                height: 34,
                fontWeight: 700,
                borderRadius: 999,
                color: theme.palette.text.primary,
                background: alpha(
                  theme.palette.warning.main,
                  isDark ? 0.16 : 0.1,
                ),
                border: `1px solid ${alpha(theme.palette.warning.main, isDark ? 0.28 : 0.18)}`,
              }}
            />

            <FormControl size="small" sx={{ minWidth: 180 }}>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{
                  fontSize: "0.82rem",
                  fontWeight: 700,
                  borderRadius: 2.5,
                  background: isDark
                    ? alpha("#ffffff", 0.03)
                    : alpha(theme.palette.common.white, 0.88),
                }}
              >
                <MenuItem value="barchasi">Barchasi ({stats.jami})</MenuItem>
                <MenuItem value="jonli">Jonli ({stats.jonli})</MenuItem>
                <MenuItem value="xato">Xato ({stats.xato})</MenuItem>
                <MenuItem value="signal_yoq">
                  Signal yo‘q ({stats.signalYoq})
                </MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </Box>
      </SurfaceCard> */}

      <Grid container spacing={1.6}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="JAMI KAMERA"
            value={stats.jami}
            color={theme.palette.primary.main}
            icon={<VideocamIcon fontSize="small" />}
          />
        </Grid>

        {/* <Grid item xs={6} sm={3}>
          <StatsCard
            title="JONLI"
            value={stats.jonli}
            color={theme.palette.success.main}
            icon={<CheckCircleRoundedIcon fontSize="small" />}
          />
        </Grid> */}

        <Grid item xs={6} sm={3}>
          <StatsCard
            title="XATO"
            value={stats.xato}
            color={theme.palette.error.main}
            icon={<WarningAmberRoundedIcon fontSize="small" />}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <StatsCard
            title="SIGNAL YO‘Q"
            value={stats.signalYoq}
            color={theme.palette.text.secondary}
            icon={<SensorsOffRoundedIcon fontSize="small" />}
          />
        </Grid>
      </Grid>

      <SurfaceCard sx={{ overflow: "hidden" }}>
        <SectionHeader title="Kameralar" dot={theme.palette.error.main}>
          {/* <LiveBadge /> */}
        </SectionHeader>

        <Box sx={{ p: 2 }}>
          {isLoading ? (
            <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
              <CircularProgress />
            </Box>
          ) : isError ? (
            <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
              <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
                Kameralarni yuklashda xatolik bo‘ldi
              </Typography>
            </Box>
          ) : filtered.length === 0 ? (
            <Box sx={{ minHeight: 280, display: "grid", placeItems: "center" }}>
              <Typography sx={{ color: "text.secondary", fontWeight: 700 }}>
                Bu filtr bo‘yicha kamera topilmadi
              </Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
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
      </SurfaceCard>

      <CameraDialog
        cam={fullscreenCam}
        open={!!fullscreenCam}
        onClose={() => setFullscreenCam(null)}
      />
    </PageShell>
  );
}

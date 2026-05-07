import { useState, useCallback, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { alpha, useTheme } from "@mui/material/styles";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  CircularProgress,
  Tooltip,
  Stack,
  Chip,
  FormControl,
  Select,
  MenuItem,
  Button,
  TextField,
} from "@mui/material";

import CloseIcon from "@mui/icons-material/Close";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import VideocamIcon from "@mui/icons-material/Videocam";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import SensorsOffRoundedIcon from "@mui/icons-material/SensorsOffRounded";
import CheckCircleRoundedIcon from "@mui/icons-material/CheckCircleRounded";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import { SectionHeader } from "@/components/common";
import {
  getKameralar,
  createKamera,
  updateKamera,
  deleteKamera,
} from "@/api/cameras";

const STREAM_BASE = "https://172.16.55.13:8889";

const PURPOSE_META = {
  kuzatuv: { label: "KUZATUV", color: "#38bdf8" },
  ai_lom: { label: "AI LOM", color: "#f97316" },
  ai_tb: { label: "AI TB", color: "#a855f7" },
  ppe: { label: "PPE", color: "#22c55e" },
};

function getPurposeMeta(purpose) {
  return PURPOSE_META[purpose] || PURPOSE_META.kuzatuv;
}

function buildStreamUrl(cam, isLarge = false) {
  if (!cam?.mediamtx_name) return null;

  const path = isLarge
    ? `${cam.mediamtx_name}_main`
    : `${cam.mediamtx_name}_sub`;

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
    <SurfaceCard sx={{ p: 1.6, height: "100%" }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between">
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

function CameraFormDialog({
  open,
  mode,
  initialData,
  onClose,
  onSubmit,
  loading,
}) {
  const isEdit = mode === "edit";

  const [form, setForm] = useState({
    name: "",
    ip: "",
    username: "admin",
    password: "",
    purpose: "kuzatuv",
    location: "",
    status: "jonli",
  });

  useEffect(() => {
    if (!open) return;

    if (initialData) {
      setForm({
        name: initialData.nom || initialData.name || "",
        ip: initialData.ip || "",
        username: initialData.username || "admin",
        password: "",
        purpose: initialData.purpose || "kuzatuv",
        location: initialData.location || initialData.uchastka || "",
        status: initialData.holat || initialData.status || "jonli",
      });
    } else {
      setForm({
        name: "",
        ip: "",
        username: "admin",
        password: "",
        purpose: "kuzatuv",
        location: "",
        status: "jonli",
      });
    }
  }, [open, initialData]);

  const change = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const canSave =
    form.name.trim() &&
    form.ip.trim() &&
    form.username.trim() &&
    (isEdit || form.password.trim());

  const handleSubmit = () => {
    const payload = {
      name: form.name.trim(),
      ip: form.ip.trim(),
      username: form.username.trim(),
      purpose: form.purpose,
      location: form.location.trim(),
      status: form.status,
    };

    if (form.password.trim()) {
      payload.password = form.password;
    }

    onSubmit(payload);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ fontWeight: 900 }}>
        {isEdit ? "Kamerani tahrirlash" : "Yangi kamera qo‘shish"}
      </DialogTitle>

      <DialogContent sx={{ display: "grid", gap: 2.2, pt: 1 }}>
        <TextField
          label="Kamera nomi"
          value={form.name}
          onChange={(e) => change("name", e.target.value)}
          placeholder="Kamera 13"
          fullWidth
        />

        <TextField
          label="IP manzil"
          value={form.ip}
          onChange={(e) => change("ip", e.target.value)}
          placeholder="172.16.35.150"
          fullWidth
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <TextField
            label="Username"
            value={form.username}
            onChange={(e) => change("username", e.target.value)}
            fullWidth
          />

          <TextField
            label={
              isEdit ? "Password (bo‘sh qoldirilsa eski qoladi)" : "Password"
            }
            type="password"
            value={form.password}
            onChange={(e) => change("password", e.target.value)}
            fullWidth
          />
        </Stack>

        <TextField
          label="Joylashuv"
          value={form.location}
          onChange={(e) => change("location", e.target.value)}
          placeholder="1-uchastka"
          fullWidth
        />

        <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
          <FormControl fullWidth>
            <Select
              value={form.purpose}
              onChange={(e) => change("purpose", e.target.value)}
            >
              <MenuItem value="kuzatuv">Kuzatuv</MenuItem>
              <MenuItem value="ai_lom">AI LOM</MenuItem>
              <MenuItem value="ai_tb">AI TB</MenuItem>
              <MenuItem value="ppe">PPE</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth>
            <Select
              value={form.status}
              onChange={(e) => change("status", e.target.value)}
            >
              <MenuItem value="jonli">Jonli</MenuItem>
              <MenuItem value="xato">Xato</MenuItem>
              <MenuItem value="signal_yoq">Signal yo‘q</MenuItem>
            </Select>
          </FormControl>
        </Stack>

        <Stack
          direction="row"
          spacing={1}
          justifyContent="flex-end"
          sx={{ mt: 1 }}
        >
          <Button onClick={onClose} disabled={loading}>
            Bekor qilish
          </Button>

          <Button
            variant="contained"
            disabled={!canSave || loading}
            onClick={handleSubmit}
            sx={{ fontWeight: 900 }}
          >
            {loading ? "Saqlanmoqda..." : isEdit ? "Yangilash" : "Saqlash"}
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}

function CameraCard({
  cam,
  highlighted = false,
  onOpen,
  onEdit,
  onDelete,
  actionLoading,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const streamUrl = buildStreamUrl(cam, false);
  const statusMeta = getCameraStatusMeta(cam?.holat, theme);
  const purposeMeta = getPurposeMeta(cam?.purpose);
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
        boxShadow: isDark
          ? "0 14px 30px rgba(0,0,0,0.22)"
          : "0 10px 24px rgba(15,23,42,0.08)",
        transition: "all 0.28s ease",
        "&:hover": {
          transform: isLive ? "translateY(-4px)" : "none",
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
              pointerEvents: "none",
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
            <Typography sx={{ fontSize: "0.82rem", fontWeight: 700 }}>
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
                "&:hover": { background: "rgba(6,8,16,0.92)" },
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
              maxWidth: "58%",
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
              {cam?.nom || "Noma’lum kamera"}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.6} alignItems="center">
            <Chip
              label={purposeMeta.label}
              size="small"
              sx={{
                height: 22,
                fontSize: "0.58rem",
                fontWeight: 900,
                color: "#fff",
                background: purposeMeta.color,
                borderRadius: 999,
              }}
            />

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
                  fontSize: "0.56rem",
                  fontWeight: 900,
                  color: statusMeta.color,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  lineHeight: 1,
                }}
              >
                {statusMeta.label}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Box>

      <Box sx={{ p: 1.35 }}>
        <Stack direction="row" justifyContent="space-between" gap={1}>
          <Box sx={{ minWidth: 0 }}>
            <Typography
              sx={{
                fontSize: "0.92rem",
                fontWeight: 900,
                color: "text.primary",
                lineHeight: 1.25,
              }}
            >
              {cam?.nom || "Noma’lum kamera"}
            </Typography>

            <Typography
              sx={{
                mt: 0.55,
                fontSize: "0.73rem",
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              {cam?.location || cam?.uchastka || "—"} ·{" "}
              {cam?.ip || cam?.mediamtx_name || "—"}
            </Typography>
          </Box>

          <Stack direction="row" spacing={0.5} flexShrink={0}>
            <Tooltip title="Tahrirlash">
              <span>
                <IconButton
                  size="small"
                  disabled={actionLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.(cam);
                  }}
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title="O‘chirish">
              <span>
                <IconButton
                  size="small"
                  color="error"
                  disabled={actionLoading}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete?.(cam);
                  }}
                >
                  <DeleteIcon fontSize="small" />
                </IconButton>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </Box>
    </Box>
  );
}

function CameraDialog({ cam, open, onClose }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const streamUrl = buildStreamUrl(cam, true);
  const purposeMeta = getPurposeMeta(cam?.purpose);

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
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography
                  sx={{
                    fontSize: "0.96rem",
                    fontWeight: 900,
                    color: theme.palette.primary.main,
                  }}
                >
                  {cam?.nom || "Kamera"}
                </Typography>

                <Chip
                  label={purposeMeta.label}
                  size="small"
                  sx={{
                    height: 22,
                    fontSize: "0.62rem",
                    fontWeight: 900,
                    color: "#fff",
                    background: purposeMeta.color,
                    borderRadius: 999,
                  }}
                />
              </Stack>

              <Typography
                sx={{ mt: 0.35, fontSize: "0.74rem", color: "text.secondary" }}
              >
                {cam?.location || cam?.uchastka || "—"} ·{" "}
                {cam?.ip || cam?.mediamtx_name || "—"}
              </Typography>
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
  const queryClient = useQueryClient();

  const [filter, setFilter] = useState("barchasi");
  const [purposeFilter, setPurposeFilter] = useState("barchasi");
  const [fullscreenCam, setFullscreenCam] = useState(null);
  const [highlightedCamId, setHighlightedCamId] = useState(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("create");
  const [editingCam, setEditingCam] = useState(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["kameralar"],
    queryFn: getKameralar,
    refetchInterval: 10000,
  });

  const createMutation = useMutation({
    mutationFn: createKamera,
    onSuccess: async () => {
      setFormOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["kameralar"] });
    },
    onError: (err) => {
      console.error(err);
      alert("Kamera qo‘shishda xatolik bo‘ldi.");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }) => updateKamera(id, payload),
    onSuccess: async () => {
      setFormOpen(false);
      setEditingCam(null);
      await queryClient.invalidateQueries({ queryKey: ["kameralar"] });
    },
    onError: (err) => {
      console.error(err);
      alert("Kamera yangilashda xatolik bo‘ldi.");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteKamera,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["kameralar"] });
    },
    onError: (err) => {
      console.error(err);
      alert("Kamera o‘chirishda xatolik bo‘ldi.");
    },
  });

  const kameralar = useMemo(() => data?.data || [], [data]);

  const actionLoading =
    createMutation.isPending ||
    updateMutation.isPending ||
    deleteMutation.isPending;

  const handleCreateOpen = () => {
    setEditingCam(null);
    setFormMode("create");
    setFormOpen(true);
  };

  const handleEditOpen = (cam) => {
    setEditingCam(cam);
    setFormMode("edit");
    setFormOpen(true);
  };

  const handleSubmitForm = (payload) => {
    if (formMode === "edit" && editingCam?.id) {
      updateMutation.mutate({ id: editingCam.id, payload });
      return;
    }

    createMutation.mutate(payload);
  };

  const handleDelete = (cam) => {
    const ok = window.confirm(
      `"${cam?.nom || cam?.mediamtx_name}" kamerani o‘chirasizmi?`,
    );

    if (!ok) return;

    deleteMutation.mutate(cam.id);
  };

  const openCamera = useCallback((cam) => {
    if (!cam) return;

    setHighlightedCamId(cam.id);

    setTimeout(() => {
      setFullscreenCam(cam);
      setHighlightedCamId(null);
    }, 180);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { camera_name, camera_id } = e.detail || {};
      let cam = null;

      if (camera_id) {
        cam =
          kameralar.find((c) => String(c.id) === String(camera_id)) ||
          kameralar.find((c) => String(c.channel) === String(camera_id));
      }

      if (!cam && camera_name) {
        const q = String(camera_name).toLowerCase();

        cam =
          kameralar.find((c) => c.nom?.toLowerCase() === q) ||
          kameralar.find((c) => c.nom?.toLowerCase()?.includes(q));
      }

      if (!cam && camera_id && Number(camera_id) <= kameralar.length) {
        cam = kameralar[Number(camera_id) - 1];
      }

      if (cam) openCamera(cam);
    };

    window.addEventListener("voice-camera-command", handler);
    return () => window.removeEventListener("voice-camera-command", handler);
  }, [kameralar, openCamera]);

  const filtered = useMemo(() => {
    let list = kameralar;

    if (filter === "jonli") {
      list = list.filter((cam) => cam.holat === "jonli");
    } else if (filter === "xato") {
      list = list.filter((cam) => cam.holat === "xato");
    } else if (filter === "signal_yoq") {
      list = list.filter((cam) => cam.holat === "signal_yoq");
    }

    if (purposeFilter !== "barchasi") {
      list = list.filter((cam) => cam.purpose === purposeFilter);
    }

    return list;
  }, [filter, purposeFilter, kameralar]);

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
      <Grid container spacing={1.6}>
        <Grid item xs={6} sm={3}>
          <StatsCard
            title="JAMI KAMERA"
            value={stats.jami}
            color={theme.palette.primary.main}
            icon={<VideocamIcon fontSize="small" />}
          />
        </Grid>

        <Grid item xs={6} sm={3}>
          <StatsCard
            title="JONLI"
            value={stats.jonli}
            color={theme.palette.success.main}
            icon={<CheckCircleRoundedIcon fontSize="small" />}
          />
        </Grid>

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
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
          >
            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                sx={{ fontSize: "0.78rem", fontWeight: 800, borderRadius: 2.5 }}
              >
                <MenuItem value="barchasi">Barchasi</MenuItem>
                <MenuItem value="jonli">Jonli</MenuItem>
                <MenuItem value="xato">Xato</MenuItem>
                <MenuItem value="signal_yoq">Signal yo‘q</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <Select
                value={purposeFilter}
                onChange={(e) => setPurposeFilter(e.target.value)}
                sx={{ fontSize: "0.78rem", fontWeight: 800, borderRadius: 2.5 }}
              >
                <MenuItem value="barchasi">Barcha maqsad</MenuItem>
                <MenuItem value="kuzatuv">Kuzatuv</MenuItem>
                <MenuItem value="ai_lom">AI LOM</MenuItem>
                <MenuItem value="ai_tb">AI TB</MenuItem>
                <MenuItem value="ppe">PPE</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={handleCreateOpen}
              disabled={actionLoading}
              sx={{
                borderRadius: 2.5,
                fontSize: "0.78rem",
                fontWeight: 900,
                textTransform: "none",
              }}
            >
              Kamera qo‘shish
            </Button>
          </Stack>
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
                    onEdit={handleEditOpen}
                    onDelete={handleDelete}
                    actionLoading={actionLoading}
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

      <CameraFormDialog
        open={formOpen}
        mode={formMode}
        initialData={editingCam}
        onClose={() => {
          setFormOpen(false);
          setEditingCam(null);
        }}
        onSubmit={handleSubmitForm}
        loading={actionLoading}
      />
    </PageShell>
  );
}

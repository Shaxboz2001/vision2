import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  IconButton,
  Tabs,
  Tab,
  useTheme,
  Chip,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getSexlarHybrid, getUskunalarHybrid } from "@/api/hybrid";
import { StatusChip, CardSkeleton } from "@/components/common";
import { setUskunaFilter, setUskunaSelected } from "@/store";
import { DataGrid } from "@mui/x-data-grid";

// ─────────────────────────────────────────────────────────────
// FONT + UI TOKENS
// ─────────────────────────────────────────────────────────────
const FONT_FAMILY = `"Inter", "Arial", sans-serif`;

const getUiTokens = (isDark) => ({
  bg: isDark ? "#0b1220" : "#f3f7fb",
  panel: isDark ? "#111827" : "#ffffff",
  panel2: isDark ? "#0f172a" : "#f8fafc",
  elevated: isDark ? "#162033" : "#ffffff",
  border: isDark ? "rgba(148,163,184,0.14)" : "rgba(15,23,42,0.08)",
  borderStrong: isDark ? "rgba(148,163,184,0.24)" : "rgba(15,23,42,0.14)",
  text: isDark ? "#e5edf7" : "#0f172a",
  subtext: isDark ? "#94a3b8" : "#64748b",
  muted: isDark ? "#64748b" : "#94a3b8",
  hover: isDark ? "#162033" : "#eef4ff",
  accent: "#2563eb",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#0ea5e9",
  purple: "#8b5cf6",
  shadow: isDark
    ? "0 18px 40px rgba(2, 6, 23, 0.45)"
    : "0 14px 34px rgba(15, 23, 42, 0.08)",
  glow: (color) =>
    isDark
      ? `0 10px 30px rgba(2,6,23,0.55), 0 0 0 1px ${color}18`
      : `0 10px 30px rgba(15,23,42,0.10), 0 0 0 1px ${color}12`,
});

// ─────────────────────────────────────────────────────────────
// USKUNA TYPE COLORS
// ─────────────────────────────────────────────────────────────
const TUR_COLOR = {
  Pech: "#f97316",
  Konverter: "#06b6d4",
  "Elektr Pech": "#8b5cf6",
  Prokat: "#22c55e",
  Nasos: "#0ea5e9",
  Kran: "#eab308",
  Kesish: "#ef4444",
  Transport: "#14b8a6",
  Sensor: "#6366f1",
  Manipulator: "#ec4899",
  Press: "#f43f5e",
  Sovitish: "#38bdf8",
  Tekislash: "#a855f7",
  Qadoqlash: "#10b981",
};

// ─────────────────────────────────────────────────────────────
// IMAGES
// ─────────────────────────────────────────────────────────────
const ID_IMAGES = {
  "USK-001": "/images/uskunalar/klet.png",
  "USK-002": "/images/uskunalar/vakuum.png",
  "USK-003": "/images/uskunalar/rolikli pech.png",
  "USK-017": "/images/uskunalar/pech elpk.png",
  "USK-018": "/images/uskunalar/ELK Pechka.png",
  "USK-019": "/images/uskunalar/pech elpk.png",
  "USK-053": "/images/uskunalar/klet vertikal.png",
  "USK-051": "/images/uskunalar/klet vertikal.png",
  "USK-049": "/images/uskunalar/klet vertikal.png",
  "USK-047": "/images/uskunalar/pech klet gorizontalniy.png",
  "USK-048": "/images/uskunalar/pech klet gorizontalniy.png",
  "USK-050": "/images/uskunalar/pech klet gorizontalniy.png",
  "USK-052": "/images/uskunalar/pech klet gorizontalniy.png",
  "USK-046": "/images/uskunalar/pech pshb.png",
  "USK-005": "/images/uskunalar/pech pshb.png",
  "USK-054": "/images/uskunalar/pech pshb.png",
  "USK-004": "/images/uskunalar/klet gorizontalniy.png",
  "USK-067": "/images/uskunalar/klet gorizontalniy.png",
  "USK-055": "/images/uskunalar/klet gorizontalniy.png",
  "USK-056": "/images/uskunalar/klet gorizontalniy.png",
  "USK-057": "/images/uskunalar/klet gorizontalniy.png",
  "USK-058": "/images/uskunalar/klet gorizontalniy.png",
  "USK-059": "/images/uskunalar/klet gorizontalniy.png",
  "USK-060": "/images/uskunalar/klet gorizontalniy.png",
  "USK-061": "/images/uskunalar/klet gorizontalniy.png",
  "USK-062": "/images/uskunalar/klet gorizontalniy.png",
  "USK-063": "/images/uskunalar/klet gorizontalniy.png",
  "USK-064": "/images/uskunalar/klet gorizontalniy.png",
  "USK-065": "/images/uskunalar/klet gorizontalniy.png",
  "USK-066": "/images/uskunalar/klet gorizontalniy.png",
  "USK-068": "/images/uskunalar/yakuni guruh klet.png",
  "USK-069": "/images/uskunalar/yakuni guruh klet.png",
  "USK-070": "/images/uskunalar/yakuni guruh klet.png",
  "USK-071": "/images/uskunalar/yakuni guruh klet.png",
  "USK-072": "/images/uskunalar/yakuni guruh klet.png",
  "USK-073": "/images/uskunalar/yakuni guruh klet.png",
  "USK-074": "/images/uskunalar/yakuni guruh klet.png",
  "USK-075": "/images/uskunalar/yakuni guruh klet.png",
  "USK-076": "/images/uskunalar/yakuni guruh klet.png",
  "USK-077": "/images/uskunalar/yakuni guruh klet.png",
  "USK-078": "/images/uskunalar/yakuni guruh klet.png",
  "USK-079": "/images/uskunalar/yakuni guruh klet.png",
};

function UskunaImage({ u }) {
  const src = ID_IMAGES[u.id] || "/images/uskunalar/default.png";

  return (
    <img
      src={src}
      alt={u.nom}
      onError={(e) => {
        e.currentTarget.src = "/images/uskunalar/pech elpk.png";
      }}
      style={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        display: "block",
        userSelect: "none",
        pointerEvents: "none",
      }}
    />
  );
}

function UskunaDiagram({ u }) {
  return <UskunaImage u={u} />;
}

// ─────────────────────────────────────────────────────────────
// HELPERS
// ─────────────────────────────────────────────────────────────
const getStatusBorder = (holat, ui) => {
  if (holat === "xato") return "rgba(239,68,68,0.35)";
  if (holat === "ogohlantirish") return "rgba(245,158,11,0.35)";
  return ui.border;
};

const getEfficiencyColor = (value, ui) => {
  if (value > 80) return ui.success;
  if (value > 50) return ui.warning;
  return ui.error;
};

// ─────────────────────────────────────────────────────────────
// PART INFO PANEL
// ─────────────────────────────────────────────────────────────
function PartInfoPanel({ part, onClose }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const ui = getUiTokens(isDark);

  if (!part) return null;

  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 16,
        left: 16,
        right: 16,
        background: isDark ? "rgba(9,13,24,0.94)" : "rgba(255,255,255,0.96)",
        border: `1px solid ${part.color}33`,
        borderLeft: `4px solid ${part.color}`,
        borderRadius: 3,
        px: 2,
        py: 1.5,
        zIndex: 10,
        backdropFilter: "blur(10px)",
        boxShadow: ui.shadow,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
        gap: 1,
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.7 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: part.color,
              boxShadow: `0 0 10px ${part.color}`,
            }}
          />
          <Typography
            sx={{
              fontFamily: FONT_FAMILY,
              fontSize: "0.7rem",
              fontWeight: 700,
              color: part.color,
              letterSpacing: "0.08em",
            }}
          >
            {part.id}
          </Typography>
          <Chip
            label={part.vazifa}
            size="small"
            sx={{
              height: 22,
              fontSize: "0.68rem",
              fontWeight: 700,
              fontFamily: FONT_FAMILY,
              bgcolor: `${part.color}16`,
              color: part.color,
              border: `1px solid ${part.color}33`,
              borderRadius: 2,
            }}
          />
        </Box>

        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: "0.95rem",
            color: ui.text,
            mb: 0.3,
          }}
        >
          {part.nom}
        </Typography>

        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.8rem",
            color: ui.subtext,
            mb: 0.5,
          }}
        >
          {part.tavsif}
        </Typography>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", mt: 0.5 }}>
          {part.parametrlar?.map((p, i) => (
            <Box
              key={i}
              sx={{ display: "flex", gap: 0.5, alignItems: "center" }}
            >
              <Typography
                sx={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "0.72rem",
                  color: ui.subtext,
                }}
              >
                {p.nom}:
              </Typography>
              <Typography
                sx={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "0.76rem",
                  color: part.color,
                  fontWeight: 700,
                }}
              >
                {p.qiymat}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      <IconButton
        size="small"
        onClick={onClose}
        sx={{
          color: ui.subtext,
          "&:hover": { color: ui.error, background: `${ui.error}10` },
          flexShrink: 0,
        }}
      >
        <CloseIcon sx={{ fontSize: 18 }} />
      </IconButton>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// USKUNA CARD
// ─────────────────────────────────────────────────────────────
function UskunaCard({ u, onClick }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const ui = getUiTokens(isDark);

  const c = TUR_COLOR[u.tur] || "#64748b";
  const samColor = getEfficiencyColor(u.samaradorlik, ui);

  return (
    <Box
      onClick={() => onClick(u)}
      sx={{
        position: "relative",
        height: "100%",
        background: `linear-gradient(180deg, ${ui.panel} 0%, ${ui.panel2} 100%)`,
        border: "1px solid",
        borderColor: getStatusBorder(u.holat, ui),
        borderRadius: 4,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: ui.shadow,
        "&:hover": {
          transform: "translateY(-6px)",
          borderColor: `${c}55`,
          boxShadow: ui.glow(c),
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${c}10 0%, transparent 45%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          height: 220,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          px: 2,
          py: 2,
          background: isDark
            ? `radial-gradient(circle at top, ${c}12 0%, transparent 64%)`
            : `radial-gradient(circle at top, ${c}10 0%, transparent 64%)`,
          borderBottom: "1px solid",
          borderColor: ui.border,
        }}
      >
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            filter: isDark
              ? "drop-shadow(0 14px 24px rgba(0,0,0,0.30))"
              : "drop-shadow(0 10px 16px rgba(15,23,42,0.10))",
          }}
        >
          <UskunaDiagram u={u} />
        </Box>

        <Box sx={{ position: "absolute", top: 12, left: 12 }}>
          <Chip
            label={u.tur}
            size="small"
            sx={{
              height: 24,
              fontSize: "0.72rem",
              fontWeight: 700,
              fontFamily: FONT_FAMILY,
              bgcolor: `${c}18`,
              color: c,
              border: `1px solid ${c}33`,
              borderRadius: 2,
              backdropFilter: "blur(8px)",
            }}
          />
        </Box>

        <Box sx={{ position: "absolute", top: 12, right: 12 }}>
          <StatusChip holat={u.holat} />
        </Box>
      </Box>

      <Box sx={{ p: 2 }}>
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontWeight: 800,
            fontSize: "1rem",
            color: ui.text,
            mb: 0.35,
            lineHeight: 1.3,
            minHeight: 42,
          }}
        >
          {u.nom}
        </Typography>

        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.78rem",
            color: ui.subtext,
            mb: 1.4,
          }}
        >
          ID: {u.id}
        </Typography>

        <Grid container spacing={1} sx={{ mb: 1.4 }}>
          {[
            {
              l: "Harorat",
              v: `${u.harorat ?? "—"}°C`,
              c2: u.harorat > 1000 ? ui.error : "#f97316",
            },
            {
              l: "Bosim",
              v: `${u.bosim ?? "—"} bar`,
              c2: ui.info,
            },
            {
              l: "Quvvat",
              v: `${u.quvvat ?? "—"} kW`,
              c2: ui.purple,
            },
          ].map((s) => (
            <Grid item xs={4} key={s.l}>
              <Box
                sx={{
                  p: 1,
                  borderRadius: 2.5,
                  textAlign: "center",
                  background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
                  border: "1px solid",
                  borderColor: ui.border,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "0.8rem",
                    fontWeight: 800,
                    color: s.c2,
                    lineHeight: 1.2,
                  }}
                >
                  {s.v}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "0.64rem",
                    color: ui.subtext,
                    mt: 0.35,
                  }}
                >
                  {s.l}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            p: 1.2,
            borderRadius: 2.5,
            background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
            border: "1px solid",
            borderColor: ui.border,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 0.8,
            }}
          >
            <Typography
              sx={{
                fontFamily: FONT_FAMILY,
                fontSize: "0.72rem",
                fontWeight: 700,
                color: ui.subtext,
              }}
            >
              Samaradorlik
            </Typography>

            <Typography
              sx={{
                fontFamily: FONT_FAMILY,
                fontSize: "0.82rem",
                fontWeight: 800,
                color: samColor,
              }}
            >
              {u.samaradorlik}%
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={u.samaradorlik}
            sx={{
              height: 8,
              borderRadius: 999,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.06)"
                : "rgba(15,23,42,0.06)",
              "& .MuiLinearProgress-bar": {
                borderRadius: 999,
                backgroundColor: samColor,
              },
            }}
          />
        </Box>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function Uskunalar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const ui = getUiTokens(isDark);

  const selectedSex = useSelector((state) => state.ui.selectedSex);
  const filter = useSelector((state) => state.uskunalar.filter);

  const [view, setView] = useState(0);

  const today = new Date().toISOString().split("T")[0];
  const effectiveSexId = filter.sexId || selectedSex?.id || "";

  const { data: sexlar, isLoading: sexlarLoading } = useQuery({
    queryKey: ["sexlar", "hybrid", today],
    queryFn: () =>
      getSexlarHybrid({
        startDate: today,
        endDate: today,
      }),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const { data, isLoading: uskunalarLoading } = useQuery({
    queryKey: [
      "uskunalar",
      "hybrid",
      effectiveSexId || "all",
      filter.uchastkId || "all",
      today,
    ],
    queryFn: () =>
      getUskunalarHybrid(
        {
          sexId: effectiveSexId || undefined,
          uchastkId: filter.uchastkId || undefined,
        },
        {
          startDate: today,
          endDate: today,
        },
      ),
    refetchInterval: effectiveSexId === "SEX-07" ? 60_000 : false,
    refetchOnWindowFocus: true,
  });

  const uskunalar = data?.data || [];
  const sx = sexlar?.data || [];
  const isLoading = sexlarLoading || uskunalarLoading;

  let filtered = [...uskunalar];

  if (effectiveSexId) {
    filtered = filtered.filter((u) => u.sexId === effectiveSexId);
  }

  if (filter.uchastkId) {
    filtered = filtered.filter((u) => u.uchastkId === filter.uchastkId);
  }

  if (filter.holat) {
    filtered = filtered.filter((u) => u.holat === filter.holat);
  }

  const handleOpen = (u) => {
    dispatch(setUskunaSelected(u.id));
    navigate(`/uskunalar/${u.id}`, { state: { uskuna: u } });
  };

  const stats = [
    { label: "Jami uskunalar", value: uskunalar.length, color: ui.accent },
    {
      label: "Faol",
      value: uskunalar.filter((u) => u.holat === "faol").length,
      color: ui.success,
    },
    {
      label: "Ogohlantirish",
      value: uskunalar.filter((u) => u.holat === "ogohlantirish").length,
      color: ui.warning,
    },
    {
      label: "Xato",
      value: uskunalar.filter((u) => u.holat === "xato").length,
      color: ui.error,
    },
    {
      label: "O‘rt. samaradorlik",
      value: `${Math.round(
        uskunalar.reduce((sum, u) => sum + (u.samaradorlik || 0), 0) /
          (uskunalar.length || 1),
      )}%`,
      color: ui.purple,
    },
  ];

  const columns = [
    {
      field: "rowNumber",
      headerName: "№",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.78rem",
            fontWeight: 700,
            color: ui.accent,
          }}
        >
          {params.api.getRowIndexRelativeToVisibleRows(params.id) + 1}
        </Typography>
      ),
    },
    {
      field: "nom",
      headerName: "Nomi",
      flex: 1.2,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            fontSize: "0.88rem",
            color: ui.text,
          }}
        >
          {p.value}
        </Typography>
      ),
    },
    {
      field: "tur",
      headerName: "Turi",
      width: 130,
      renderCell: (p) => {
        const color = TUR_COLOR[p.value] || ui.muted;
        return (
          <Chip
            label={p.value}
            size="small"
            sx={{
              height: 24,
              fontSize: "0.72rem",
              fontWeight: 700,
              fontFamily: FONT_FAMILY,
              bgcolor: `${color}16`,
              color,
              borderRadius: 2,
              border: `1px solid ${color}25`,
            }}
          />
        );
      },
    },
    {
      field: "holat",
      headerName: "Holat",
      width: 140,
      renderCell: (p) => <StatusChip holat={p.value} />,
    },
    {
      field: "samaradorlik",
      headerName: "Samaradorlik",
      width: 180,
      renderCell: (p) => {
        const barColor = getEfficiencyColor(p.value, ui);
        return (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              width: "100%",
            }}
          >
            <LinearProgress
              variant="determinate"
              value={p.value}
              sx={{
                flex: 1,
                height: 8,
                borderRadius: 999,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.06)"
                  : "rgba(15,23,42,0.06)",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  backgroundColor: barColor,
                },
              }}
            />
            <Typography
              sx={{
                fontFamily: FONT_FAMILY,
                fontSize: "0.76rem",
                fontWeight: 700,
                minWidth: 40,
                color: barColor,
              }}
            >
              {p.value}%
            </Typography>
          </Box>
        );
      },
    },
    {
      field: "harorat",
      headerName: "Harorat",
      width: 120,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.8rem",
            fontWeight: 700,
            color: p.value > 1000 ? ui.error : ui.text,
          }}
        >
          {p.value}°C
        </Typography>
      ),
    },
    {
      field: "keyingiTA",
      headerName: "Keyingi TA",
      width: 120,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.8rem",
            fontWeight: 700,
            color: p.value < 30 ? ui.warning : ui.subtext,
          }}
        >
          {p.value} kun
        </Typography>
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100%",
        p: { xs: 1.5, sm: 2, md: 2.5 },
        background: ui.bg,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* HEADER */}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.2 },
          borderRadius: 4,
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #111827 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
          border: "1px solid",
          borderColor: ui.border,
          boxShadow: ui.shadow,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: FONT_FAMILY,
                fontSize: { xs: "1.2rem", md: "1.55rem" },
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: ui.text,
                mb: 0.4,
              }}
            >
              Uskunalar monitoringi
            </Typography>

            <Typography
              sx={{
                fontFamily: FONT_FAMILY,
                fontSize: "0.9rem",
                color: ui.subtext,
              }}
            >
              {filtered.length} ta uskuna · Holat · Samaradorlik · Texnik
              ko‘rsatkichlar
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 1.2, flexWrap: "wrap" }}>
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Bo‘lim</InputLabel>
              <Select
                value={effectiveSexId}
                label="Bo‘lim"
                onChange={(e) =>
                  dispatch(
                    setUskunaFilter({
                      ...filter,
                      sexId: e.target.value,
                    }),
                  )
                }
                sx={{
                  borderRadius: 3,
                  background: isDark ? "#0b1220" : "#ffffff",
                  fontFamily: FONT_FAMILY,
                }}
              >
                <MenuItem value="">Barchasi</MenuItem>
                {sx.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 160 }}>
              <InputLabel>Holat</InputLabel>
              <Select
                value={filter.holat || ""}
                label="Holat"
                onChange={(e) =>
                  dispatch(
                    setUskunaFilter({
                      ...filter,
                      holat: e.target.value,
                    }),
                  )
                }
                sx={{
                  borderRadius: 3,
                  background: isDark ? "#0b1220" : "#ffffff",
                  fontFamily: FONT_FAMILY,
                }}
              >
                <MenuItem value="">Barchasi</MenuItem>
                {["faol", "ogohlantirish", "xato"].map((h) => (
                  <MenuItem
                    key={h}
                    value={h}
                    sx={{ textTransform: "capitalize" }}
                  >
                    {h}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        </Box>
      </Paper>

      {/* STATS */}
      <Grid container spacing={1.5}>
        {stats.map((item) => (
          <Grid item xs={12} sm={6} md={2.4} key={item.label}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 4,
                background: ui.panel,
                border: "1px solid",
                borderColor: ui.border,
                boxShadow: ui.shadow,
                height: "100%",
              }}
            >
              <Typography
                sx={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "0.8rem",
                  color: ui.subtext,
                  mb: 1,
                }}
              >
                {item.label}
              </Typography>

              <Typography
                sx={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  color: item.color,
                  lineHeight: 1,
                }}
              >
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* CONTENT */}
      <Paper
        sx={{
          borderRadius: 4,
          overflow: "hidden",
          background: ui.panel,
          border: "1px solid",
          borderColor: ui.border,
          boxShadow: ui.shadow,
        }}
      >
        <Box
          sx={{
            px: 2,
            borderBottom: "1px solid",
            borderColor: ui.border,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 1,
          }}
        >
          <Tabs
            value={view}
            onChange={(_, v) => setView(v)}
            sx={{
              minHeight: 50,
              "& .MuiTabs-indicator": {
                height: 3,
                borderRadius: 999,
                bgcolor: ui.accent,
              },
            }}
          >
            <Tab
              label="Karta ko‘rinish"
              sx={{
                minHeight: 50,
                textTransform: "none",
                fontSize: "0.82rem",
                fontWeight: 800,
                fontFamily: FONT_FAMILY,
              }}
            />
            <Tab
              label="Jadval ko‘rinish"
              sx={{
                minHeight: 50,
                textTransform: "none",
                fontSize: "0.82rem",
                fontWeight: 800,
                fontFamily: FONT_FAMILY,
              }}
            />
          </Tabs>

          <Typography
            sx={{
              fontFamily: FONT_FAMILY,
              fontSize: "0.8rem",
              color: ui.subtext,
              pr: 1,
            }}
          >
            {filtered.length} ta uskuna
          </Typography>
        </Box>

        {view === 0 && (
          <Box sx={{ p: 2 }}>
            {isLoading ? (
              <CardSkeleton rows={6} />
            ) : (
              <Grid container spacing={1.5}>
                {filtered.map((u) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={u.id}>
                    <UskunaCard u={u} onClick={handleOpen} />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        )}

        {view === 1 && (
          <Box sx={{ height: 560 }}>
            {isLoading ? (
              <CardSkeleton rows={8} />
            ) : (
              <DataGrid
                rows={filtered}
                columns={columns}
                pageSize={10}
                rowsPerPageOptions={[10]}
                disableSelectionOnClick
                onRowClick={(p) => handleOpen(p.row)}
                sx={{
                  border: "none",
                  cursor: "pointer",
                  fontFamily: FONT_FAMILY,
                  color: ui.text,
                  "& .MuiDataGrid-columnHeaders": {
                    background: isDark ? "#0b1220" : "#f8fafc",
                    borderBottom: `1px solid ${ui.border}`,
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    fontFamily: FONT_FAMILY,
                    color: ui.text,
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: `1px solid ${ui.border}`,
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: isDark
                      ? "rgba(37,99,235,0.08)"
                      : "#eef4ff",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: `1px solid ${ui.border}`,
                    background: isDark ? "#0b1220" : "#f8fafc",
                  },
                }}
              />
            )}
          </Box>
        )}
      </Paper>
    </Box>
  );
}

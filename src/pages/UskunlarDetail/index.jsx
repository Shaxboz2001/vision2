import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Chip,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  LinearProgress,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  useTheme,
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import VideocamOutlinedIcon from "@mui/icons-material/VideocamOutlined";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend,
  Tooltip,
  BarChart,
  Bar,
  AreaChart,
  Area,
  Cell,
} from "recharts";
import {
  useEAFReport,
  useLRFReport,
  useTSCReport,
  useVODReport,
  useProductionStats,
  useAllProductionStats,
  PERIOD_OPTIONS,
  PERIOD_LABELS,
} from "@/hooks/useProduction";
import { StatusChip } from "@/components/common";
import EAFFurnace3D from "../../components/UskunaImages/EafUskuna";
import UskunaImageView from "../../components/UskunaImages/UskunaImageView";

// ═══════════════════════════════════════════════════════════════
//  useProductionStatsWithFallback
//  Bugun plavka bo'lmasa → kecha → hafta ga avtomatik o'tadi
//  Foydalanuvchi qo'lda period o'zgartirsa, fallback to'xtaydi
// ═══════════════════════════════════════════════════════════════
const FALLBACK_CHAIN = ["today", "yesterday", "week"];

function useProductionStatsWithFallback(apiKey, initialPeriod = "today") {
  const stats = useProductionStats(apiKey, initialPeriod);
  const fallbackIndexRef = useRef(0);
  const userChangedRef = useRef(false);
  const prevPeriodRef = useRef(stats.period);

  // Foydalanuvchi qo'lda period o'zgartirganini aniqlash
  if (prevPeriodRef.current !== stats.period) {
    const wasAutoFallback = FALLBACK_CHAIN.includes(prevPeriodRef.current);
    const isUserAction =
      !wasAutoFallback ||
      stats.period !== FALLBACK_CHAIN[fallbackIndexRef.current];
    if (isUserAction) {
      userChangedRef.current = true;
    }
    prevPeriodRef.current = stats.period;
  }

  // Auto-fallback: bugun bo'sh bo'lsa keyingisiga o'tish
  useEffect(() => {
    if (
      !stats.isLoading &&
      !userChangedRef.current &&
      stats.data?.length === 0 &&
      fallbackIndexRef.current < FALLBACK_CHAIN.length - 1
    ) {
      const currentIdx = FALLBACK_CHAIN.indexOf(stats.period);
      if (currentIdx >= 0 && currentIdx < FALLBACK_CHAIN.length - 1) {
        const nextPeriod = FALLBACK_CHAIN[currentIdx + 1];
        fallbackIndexRef.current = currentIdx + 1;
        prevPeriodRef.current = nextPeriod;
        stats.setPeriod(nextPeriod);
      }
    }
  }, [stats.isLoading, stats.data?.length, stats.period, stats.setPeriod]);

  return stats;
}

function PartInfoPanel({ part, onClose }) {
  if (!part) return null;
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 12,
        left: 12,
        right: 12,
        background: "rgba(5,8,18,0.97)",
        border: `1px solid ${part.color}55`,
        borderLeft: `3px solid ${part.color}`,
        borderRadius: "4px",
        p: "10px 14px",
        zIndex: 10,
        backdropFilter: "blur(8px)",
        boxShadow: `0 8px 32px rgba(0,0,0,0.6), 0 0 0 1px ${part.color}15`,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "space-between",
      }}
    >
      <Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: part.color,
              boxShadow: `0 0 8px ${part.color}`,
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.58rem",
              color: part.color,
              letterSpacing: "0.12em",
            }}
          >
            {part.id}
          </Typography>
          <Chip
            label={part.vazifa}
            size="small"
            sx={{
              height: 16,
              fontSize: "0.5rem",
              fontFamily: "'Arial',san-serif",
              bgcolor: `${part.color}18`,
              color: part.color,
              borderRadius: "2px",
              "& .MuiChip-label": { px: 0.6 },
            }}
          />
        </Box>
        <Typography
          sx={{
            fontFamily: "'san-serif',sans-serif",
            fontWeight: 700,
            fontSize: "0.88rem",
            color: "#e8eaf0",
            mb: 0.4,
          }}
        >
          {part.nom}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            fontSize: "0.65rem",
            color: "#9ca3af",
            mb: 0.3,
          }}
        >
          {part.tavsif}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", mt: 0.5 }}>
          {part.parametrlar?.map((p, i) => (
            <Box
              key={i}
              sx={{ display: "flex", gap: 0.5, alignItems: "center" }}
            >
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.58rem",
                  color: "#6b7280",
                }}
              >
                {p.nom}:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.65rem",
                  color: part.color,
                  fontWeight: 600,
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
          color: "#374151",
          ml: 1,
          mt: -0.5,
          "&:hover": { color: "#ff2d55" },
          flexShrink: 0,
        }}
      >
        <CloseIcon sx={{ fontSize: 14 }} />
      </IconButton>
    </Box>
  );
}

const fmtValue = (v, d = 1) =>
  v != null && !isNaN(v) ? Number(v).toFixed(d) : "—";

const getLast = (arr) =>
  Array.isArray(arr) && arr.length ? arr[arr.length - 1] : null;

const getLastTemp = (heat) => {
  const t = getLast(heat?.temperatures || []);
  return t?.temperature ?? null;
};

const getDelayCount = (heats = []) =>
  heats.reduce((sum, h) => sum + (h.delays?.length || 0), 0);

const getTotalProductWeight = (heats = []) =>
  heats.reduce((sum, h) => {
    const products = Array.isArray(h.tscProducts) ? h.tscProducts : [];
    return (
      sum + products.reduce((s, p) => s + (Number(p.productWeight) || 0), 0)
    );
  }, 0);

const getTotalSlabs = (heats = []) =>
  heats.reduce(
    (sum, h) =>
      sum +
      ((h.tscProducts || []).filter((p) => p.productType === 1).length || 0),
    0,
  );

const avg = (arr = []) =>
  arr.length ? arr.reduce((s, x) => s + x, 0) / arr.length : 0;

// const getScoreColor = (score) => {
//   if (score >= 85) return "#00e676";
//   if (score >= 65) return "#ffd60a";
//   return "#ff2d55";
// };

const inferApiKeyFromMeta = (uskuna) => {
  if (!uskuna) return null;

  // SEX-07 — po'lat eritish sexi (4 ta API bor)
  if (uskuna.sexId === "SEX-07") {
    // UCH-07B — Elektrda eritish pechi (EAF)
    if (uskuna.uchastkId === "UCH-07B") return "eaf";
    // UCH-07D — Kovsh tozalash pechi (LRF)
    if (uskuna.uchastkId === "UCH-07D") return "lrf";
    // UCH-07C — Uzluksiz quyish (TSC) + Vakuum (VOD)
    if (uskuna.uchastkId === "UCH-07C") return "tsc";
    // UCH-07A — VOD (vakuum ostida tozalash)
    if (uskuna.uchastkId === "UCH-07A") return "vod";
    // Qolganlar
    if (["UCH-07E", "UCH-07F"].includes(uskuna.uchastkId)) return "tsc";
  }

  // Tur bo'yicha aniqlash (boshqa sexlar)
  if (uskuna.tur === "Elektr Pech") return "eaf";
  if (uskuna.tur === "Konverter") return "eaf";
  if (uskuna.tur === "Pech") return "lrf";
  if (uskuna.tur === "Prokat") return "tsc";
  if (uskuna.tur === "Kesish") return "tsc";
  if (uskuna.tur === "Sovitish") return "tsc";

  // Bu uskuna hech qaysi API ga tegishli emas — fake data ishlatiladi
  return null;
};

const getLiveMetrics = (apiKey, heats) => {
  const latest = getLast(heats);

  if (!latest) {
    return {
      currentTemp: 0,
      totalHeats: 0,
      totalDelays: 0,
      score: 0,
      status: "toxtagan",
      primaryValue: "—",
      secondaryValue: "—",
      avgSpeed: 0,
    };
  }

  if (apiKey === "eaf") {
    const avgEnergy = avg(heats.map((h) => Number(h.electricalEnergy) || 0));
    const avgTap = avg(heats.map((h) => Number(h.tappingWeight) || 0));
    const score = Math.max(
      0,
      Math.min(
        100,
        100 - getDelayCount(heats) * 5 - (avgEnergy > 15000 ? 10 : 0),
      ),
    );

    return {
      currentTemp: getLastTemp(latest) || 0,
      totalHeats: heats.length,
      totalDelays: getDelayCount(heats),
      score,
      status: score >= 85 ? "faol" : score >= 65 ? "ogohlantirish" : "xato",
      primaryValue: `${fmtValue(avgEnergy / 1000, 1)} MWh`,
      secondaryValue: `${fmtValue(avgTap / 1000, 1)} t`,
      avgSpeed: 0,
    };
  }

  if (apiKey === "lrf") {
    const avgEnergy = avg(heats.map((h) => Number(h.electricalEnergy) || 0));
    const avgAr = avg(heats.map((h) => Number(h.totalArConsumption) || 0));
    const score = Math.max(
      0,
      Math.min(
        100,
        100 -
          getDelayCount(heats) * 5 -
          (avgAr > 20 ? 8 : 0) -
          (avgEnergy > 12000 ? 8 : 0),
      ),
    );

    return {
      currentTemp: getLastTemp(latest) || 0,
      totalHeats: heats.length,
      totalDelays: getDelayCount(heats),
      score,
      status: score >= 85 ? "faol" : score >= 65 ? "ogohlantirish" : "xato",
      primaryValue: `${fmtValue(avgAr, 1)} m³ Ar`,
      secondaryValue: `${fmtValue(avgEnergy / 1000, 1)} MWh`,
      avgSpeed: 0,
    };
  }

  if (apiKey === "vod") {
    const avgSteel = avg(heats.map((h) => Number(h.finalSteelWeight) || 0));
    const avgSlag = avg(heats.map((h) => Number(h.finalSlagWeight) || 0));
    const score = Math.max(0, Math.min(100, 100 - getDelayCount(heats) * 6));

    return {
      currentTemp: getLastTemp(latest) || 0,
      totalHeats: heats.length,
      totalDelays: getDelayCount(heats),
      score,
      status: score >= 85 ? "faol" : score >= 65 ? "ogohlantirish" : "xato",
      primaryValue: `${fmtValue(avgSteel / 1000, 1)} t`,
      secondaryValue: `${fmtValue(avgSlag / 1000, 1)} t`,
      avgSpeed: 0,
    };
  }

  const avgSpeed = avg(
    heats
      .flatMap((h) => h.tscStrands || [])
      .map((s) => Number(s.castSpeedAvg) || 0)
      .filter((x) => x > 0),
  );

  const totalWeight = getTotalProductWeight(heats) / 1000;
  const totalSlabs = getTotalSlabs(heats);
  const score = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        Math.min(100, (totalWeight / 400) * 100) * 0.7 +
          Math.min(100, (avgSpeed / 1.2) * 100) * 0.3 -
          getDelayCount(heats) * 3,
      ),
    ),
  );

  return {
    currentTemp: getLastTemp(latest) || latest?.liquidusTemperature || 0,
    totalHeats: heats.length,
    totalDelays: getDelayCount(heats),
    score,
    status: score >= 85 ? "faol" : score >= 65 ? "ogohlantirish" : "xato",
    primaryValue: `${fmtValue(totalWeight, 1)} t`,
    secondaryValue: `${fmtValue(totalSlabs, 0)} slab`,
    avgSpeed,
  };
};

const getOverviewChartData = (apiKey, heats) => {
  if (!Array.isArray(heats)) return [];

  if (apiKey === "tsc") {
    return heats.map((h, i) => ({
      i: i + 1,
      temp: getLastTemp(h) || h.liquidusTemperature || 0,
      ref: h.liquidusTemperature || null,
      time:
        h.ladleOpeningDate ||
        h.ladleArrivalDate ||
        h.startTime ||
        h.productionDate ||
        null,
    }));
  }

  return heats.map((h, i) => ({
    i: i + 1,
    temp: getLastTemp(h) || 0,
    time: h.startTime || h.ladleOpeningDate || h.productionDate || null,
  }));
};
// ─── Rang palitralari ────────────────────────────────────────────
const TUR_COLOR = {
  Pech: "#ff6b1a",
  Konverter: "#00d4ff",
  "Elektr Pech": "#a78bfa",
  Prokat: "#00e676",
  Nasos: "#29b6f6",
  Kran: "#ffd60a",
  Kesish: "#ff5252",
};

// ─── Yordamchi ───────────────────────────────────────────────────
const fmtN = (v, d = 1) =>
  v != null && !isNaN(v) ? Number(v).toFixed(d) : "—";
const fmtT = (s) =>
  s
    ? new Date(s).toLocaleString("uz-UZ", {
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
const fmtDur = (s, e) => {
  if (!s || !e) return "—";
  const m = Math.round((new Date(e) - new Date(s)) / 60000);
  return `${Math.floor(m / 60)}s ${m % 60}d`;
};

// ─── Period tanlagich ─────────────────────────────────────────────
function PeriodSelector({ period, onChange, color }) {
  return (
    <FormControl size="small">
      <Select
        value={period}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          fontFamily: "'Arial', san-serif",
          fontSize: "0.68rem",
          color,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: `${color}40` },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: color },
          "& .MuiSvgIcon-root": { color },
          minWidth: 140,
        }}
      >
        {PERIOD_OPTIONS.map((o) => (
          <MenuItem
            key={o.value}
            value={o.value}
            sx={{
              fontFamily: "'Arial', san-serif",
              fontSize: "0.68rem",
            }}
          >
            {o.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

function HeatSelector({ heats, selectedId, onChange, color }) {
  if (!heats.length) return null;
  return (
    <FormControl size="small">
      <Select
        value={selectedId ?? ""}
        onChange={(e) => onChange(e.target.value)}
        sx={{
          fontFamily: "'Arial', san-serif",
          fontSize: "0.68rem",
          color,
          "& .MuiOutlinedInput-notchedOutline": { borderColor: `${color}40` },
          "&:hover .MuiOutlinedInput-notchedOutline": { borderColor: color },
          "& .MuiSvgIcon-root": { color },
          minWidth: 200,
        }}
      >
        {[...heats].reverse().map((h) => (
          <MenuItem
            key={h.heatId}
            value={h.heatId}
            sx={{
              fontFamily: "'Arial', san-serif",
              fontSize: "0.68rem",
            }}
          >
            #{h.heatId} — {h.steelGradeName} ·{" "}
            {fmtT(h.startTime || h.ladleOpeningDate)}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
}

// ─── Stat kartochka ───────────────────────────────────────────────
function StatCard({
  icon,
  label,
  value,
  unit,
  color = "#00d4ff",
  big = false,
}) {
  return (
    <Box
      sx={{
        p: 2,
        background: `linear-gradient(135deg, ${color}12 0%, ${color}06 100%)`,
        border: `1px solid ${color}35`,
        borderRadius: 2,
        borderLeft: `4px solid ${color}`,
        display: "flex",
        flexDirection: "column",
        gap: 0.5,
        transition: "all 0.2s",
        "&:hover": {
          borderColor: color,
          boxShadow: `0 4px 20px ${color}20`,
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontSize: "1.1rem" }}>{icon}</Typography>
        <Typography
          sx={{
            fontFamily: "'Arial', san-serif",
            fontSize: "0.6rem",
            color: "#8896a5",
            letterSpacing: "0.1em",
            textTransform: "uppercase",
          }}
        >
          {label}
        </Typography>
      </Box>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
        <Typography
          sx={{
            fontFamily: "'Arial', san-serif",
            fontSize: big ? "1.8rem" : "1.3rem",
            fontWeight: 700,
            color,
            lineHeight: 1,
          }}
        >
          {value ?? "—"}
        </Typography>
        {unit && (
          <Typography
            sx={{
              fontFamily: "'Arial', san-serif",
              fontSize: "0.65rem",
              color: "#8896a5",
            }}
          >
            {unit}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── Sektsiya sarlavhasi ──────────────────────────────────────────
function SectionTitle({ children, color = "#00d4ff" }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
      <Box sx={{ width: 3, height: 20, background: color, borderRadius: 2 }} />
      <Typography
        sx={{
          fontFamily: "'Arial', san-serif",
          fontSize: "0.72rem",
          color,
          letterSpacing: "0.12em",
          textTransform: "uppercase",
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

// ─── Info qatori ─────────────────────────────────────────────────
function InfoRow({ label, value, color = "#c8d8e8" }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        py: 0.9,
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        "&:last-child": { borderBottom: 0 },
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Arial', san-serif",
          fontSize: "0.68rem",
          color: "#8896a5",
        }}
      >
        {label}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Arial', san-serif",
          fontSize: "0.72rem",
          fontWeight: 600,
          color,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ─── Kimyoviy element ────────────────────────────────────────────
function ChemCard({ code, value, color }) {
  return (
    <Box
      sx={{
        px: 1.2,
        py: 0.8,
        background: `${color}10`,
        border: `1px solid ${color}30`,
        borderRadius: 1.5,
        textAlign: "center",
        minWidth: 52,
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Arial', san-serif",
          fontSize: "0.62rem",
          color: "#8896a5",
          mb: 0.2,
        }}
      >
        {code}
      </Typography>
      <Typography
        sx={{
          fontFamily: "'Arial', san-serif",
          fontSize: "0.72rem",
          fontWeight: 700,
          color,
        }}
      >
        {value}
      </Typography>
    </Box>
  );
}

// ─── Harorat grafigi ─────────────────────────────────────────────
function TempChart({ data, c, isDark, extraLines = [] }) {
  if (!data?.length)
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: "'Arial', san-serif",
            fontSize: "0.7rem",
            color: "#4b5563",
          }}
        >
          Harorat ma'lumoti yo'q
        </Typography>
      </Box>
    );
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke={isDark ? "#1a2235" : "#e5e7eb"}
        />
        <XAxis dataKey="i" tick={{ fontSize: 11, fill: "#8896a5" }} />
        <YAxis
          domain={["auto", "auto"]}
          tick={{ fontSize: 11, fill: "#8896a5" }}
        />
        <RTooltip
          contentStyle={{
            background: "#0a0f1e",
            border: `1px solid ${c}50`,
            borderRadius: 8,
            fontSize: 12,
            fontFamily: "san-serif",
          }}
          formatter={(v, n) => [v, n]}
          labelFormatter={(_, p) => p?.[0]?.payload?.t || ""}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line
          type="monotone"
          dataKey="temp"
          stroke={c}
          dot={{ r: 4, fill: c }}
          name="Harorat °C"
          strokeWidth={2.5}
        />
        {extraLines.map((l) => (
          <Line
            key={l.key}
            type="monotone"
            dataKey={l.key}
            stroke={l.color}
            dot={l.dot ?? false}
            name={l.name}
            strokeWidth={l.width ?? 1.5}
            strokeDasharray={l.dash}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── Kimyoviy tarkib bloki ────────────────────────────────────────
function ChemAnalysis({ heat, c }) {
  if (!heat?.steelAnalysis?.length) return null;
  const a = heat.steelAnalysis[heat.steelAnalysis.length - 1];
  return (
    <Box sx={{ mb: 4 }}>
      <SectionTitle color={c}>
        Kimyoviy tarkib — {a.sampleId} · {fmtT(a.sampleTime)}
      </SectionTitle>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {a.chemicalAnalysis?.map((ca) => (
          <ChemCard
            key={ca.code}
            code={ca.code}
            color={c}
            value={Number(ca.value).toFixed(ca.value < 0.01 ? 4 : 3)}
          />
        ))}
      </Box>
    </Box>
  );
}

function AnalyzeDialog({ open, onClose, metrics, heats, apiKey }) {
  if (!metrics) return null;

  const issues = [];
  const good = [];

  if (metrics.totalDelays > 0) {
    issues.push(`⛔ Delaylar soni: ${metrics.totalDelays}`);
  } else {
    good.push("🟢 Delay yo'q");
  }

  if (metrics.currentTemp <= 0) {
    issues.push("🌡 Harorat ma'lumoti topilmadi");
  } else {
    good.push(`🌡 Joriy harorat: ${metrics.currentTemp}°C`);
  }

  if (apiKey === "tsc") {
    const totalWeight = getTotalProductWeight(heats) / 1000;
    const totalSlabs = getTotalSlabs(heats);

    if (totalWeight > 0) {
      good.push(`📦 Mahsulot og'irligi: ${fmtValue(totalWeight, 1)} t`);
    }
    if (totalSlabs > 0) {
      good.push(`🧱 Slablar soni: ${totalSlabs}`);
    }
  }

  if (metrics.score < 65) {
    issues.push(`🔴 Umumiy baho past: ${metrics.score}`);
  } else if (metrics.score >= 85) {
    good.push(`✅ Umumiy baho yaxshi: ${metrics.score}`);
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Analyze
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers>
        <Typography sx={{ color: "#ff2d55", mb: 1, fontWeight: 700 }}>
          Muammolar:
        </Typography>
        {issues.length ? (
          issues.map((i, idx) => (
            <Typography key={idx} sx={{ mb: 0.5 }}>
              {i}
            </Typography>
          ))
        ) : (
          <Typography sx={{ mb: 2 }}>Yo'q</Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ color: "#00e676", mb: 1, fontWeight: 700 }}>
          Yaxshi tomonlar:
        </Typography>
        {good.length ? (
          good.map((g, idx) => (
            <Typography key={idx} sx={{ mb: 0.5 }}>
              {g}
            </Typography>
          ))
        ) : (
          <Typography>Yo'q</Typography>
        )}
      </DialogContent>
    </Dialog>
  );
}
// ─── Kechikishlar bloki ───────────────────────────────────────────
// ─── Kechikish turi → ma'lumot ────────────────────────────────────
const DELAY_INFO = {
  // EAF kechikishlari
  MELTING_OFF_TIME: {
    label: "Elektr o'chiq vaqt",
    desc: "Pech o'chiq — namuna olish, kimyoviy tahlil yoki texnik sabab",
    color: "#ff6b1a",
    icon: "⚡",
    type: "critical",
  },
  CHARGE_TIME: {
    label: "Yuklash vaqti",
    desc: "LOM savatini tushirish — tom ochiq, elektr o'chiq",
    color: "#ffd60a",
    icon: "🏗️",
    type: "normal",
  },
  PREPARATION_TIME: {
    label: "Tayyorgarlik",
    desc: "Kovsh o'rnatish va pechni keyingi heatga tayyorlash",
    color: "#00d4ff",
    icon: "🔧",
    type: "normal",
  },
  TAP_TIME: {
    label: "Chiqarish vaqti",
    desc: "Suyuq po'latni kovshga quyish jarayoni",
    color: "#a78bfa",
    icon: "🫗",
    type: "normal",
  },
  POWER_OFF_TIME: {
    label: "Quvvat o'chiq",
    desc: "Rejalashtirilmagan elektr to'xtash",
    color: "#ff2d55",
    icon: "🔴",
    type: "critical",
  },
  ELECTRODE_TIME: {
    label: "Elektrod almashtirish",
    desc: "Elektrod almashtirish yoki sozlash",
    color: "#ffd60a",
    icon: "🔩",
    type: "normal",
  },
  TAPPING_TIME: {
    label: "Po'lat chiqarish",
    desc: "Tayyor po'latni pechdan kovshga quyish",
    color: "#ff9500",
    icon: "🌊",
    type: "normal",
  },
  DESLAGGING_TIME: {
    label: "Shlak chiqarish",
    desc: "Pechdan shlakni chiqarib tashlash",
    color: "#6b7280",
    icon: "🪣",
    type: "normal",
  },
  // LRF kechikishlari
  STIRRING_TIME: {
    label: "Aralash vaqti",
    desc: "Argon bilan po'latni aralashtirish",
    color: "#00d4ff",
    icon: "💨",
    type: "normal",
  },
  SAMPLING_TIME: {
    label: "Namuna olish",
    desc: "Kimyoviy tahlil uchun namuna olish va natijani kutish",
    color: "#00e676",
    icon: "🧪",
    type: "normal",
  },
  WAITING_TIME: {
    label: "Kutish vaqti",
    desc: "Keyingi bosqich (TSC) tayyor bo'lishini kutish",
    color: "#8896a5",
    icon: "⏳",
    type: "warning",
  },
  // TSC kechikishlari
  LADLE_CHANGE: {
    label: "Kovsh almashtirish",
    desc: "Bir kovshdan ikkinchi kovshga o'tish",
    color: "#ff9500",
    icon: "🔄",
    type: "normal",
  },
  TUNDISH_CHANGE: {
    label: "Tundish almashtirish",
    desc: "Eskirgan tundishni yangi bilan almashtirish",
    color: "#a78bfa",
    icon: "🔄",
    type: "normal",
  },
  MOULD_CHANGE: {
    label: "Qolip almashtirish",
    desc: "Qolipni tozalash yoki almashtirish",
    color: "#ffd60a",
    icon: "🔩",
    type: "normal",
  },
  BREAKOUT: {
    label: "Quyish buzilishi",
    desc: "Favqulodda — suyuq po'lat qolipdan chiqib ketdi",
    color: "#ff2d55",
    icon: "🚨",
    type: "critical",
  },
};

// Noma'lum kod uchun default
const getDelayInfo = (code) =>
  DELAY_INFO[code] ?? {
    label: code,
    desc: "Kechikish turi",
    color: "#6b7280",
    icon: "⏸️",
    type: "normal",
  };

// Davomiylikni minutga aylantirish
const getDurMinutes = (start, stop) => {
  if (!start || !stop) return 0;
  return Math.round((new Date(stop) - new Date(start)) / 60000);
};

// ══════════════════════════════════════════════════════════════════
//  DelaysBlock
// ══════════════════════════════════════════════════════════════════
function DelaysBlock({ heat }) {
  if (!heat?.delays?.length) return null;

  // Jami kechikish vaqtini hisoblash
  const totalMin = heat.delays.reduce(
    (s, d) => s + getDurMinutes(d.startTime, d.stopTime),
    0,
  );

  // Tur bo'yicha guruhlab yig'indi
  const byType = heat.delays.reduce((acc, d) => {
    const info = getDelayInfo(d.delayOperation);
    if (!acc[d.delayOperation]) {
      acc[d.delayOperation] = { info, count: 0, totalMin: 0 };
    }
    acc[d.delayOperation].count++;
    acc[d.delayOperation].totalMin += getDurMinutes(d.startTime, d.stopTime);
    return acc;
  }, {});

  // Critical kechikishlar bormi?
  const hasCritical = Object.values(byType).some(
    (v) => v.info.type === "critical" && v.totalMin > 10,
  );

  return (
    <Box sx={{ mb: 4 }}>
      {/* Sarlavha + umumiy statistika */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 2,
          flexWrap: "wrap",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 3,
              height: 20,
              background: "#ffd60a",
              borderRadius: 2,
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Arial', san-serif",
              fontSize: "0.72rem",
              color: "#ffd60a",
              letterSpacing: "0.12em",
            }}
          >
            KECHIKISHLAR
          </Typography>
        </Box>

        {/* Jami */}
        <Box
          sx={{
            px: 1.5,
            py: 0.4,
            background: "rgba(255,214,10,0.1)",
            border: "1px solid rgba(255,214,10,0.3)",
            borderRadius: 1,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Arial', san-serif",
              fontSize: "0.65rem",
              color: "#ffd60a",
            }}
          >
            {heat.delays.length} ta · {Math.floor(totalMin / 60)}s{" "}
            {totalMin % 60}d
          </Typography>
        </Box>

        {/* Critical ogohlantirish */}
        {hasCritical && (
          <Box
            sx={{
              px: 1.5,
              py: 0.4,
              background: "rgba(255,45,85,0.1)",
              border: "1px solid rgba(255,45,85,0.3)",
              borderRadius: 1,
              display: "flex",
              alignItems: "center",
              gap: 0.5,
            }}
          >
            <Typography sx={{ fontSize: "0.7rem" }}>⚠️</Typography>
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: "0.62rem",
                color: "#ff2d55",
              }}
            >
              Kritik kechikish bor
            </Typography>
          </Box>
        )}
      </Box>

      {/* Tur bo'yicha xulosa */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
        {Object.entries(byType).map(([code, { info, count, totalMin: tm }]) => (
          <Box
            key={code}
            sx={{
              px: 1.2,
              py: 0.6,
              background: `${info.color}10`,
              border: `1px solid ${info.color}30`,
              borderRadius: 1.5,
              display: "flex",
              alignItems: "center",
              gap: 0.8,
            }}
          >
            <Typography sx={{ fontSize: "0.75rem" }}>{info.icon}</Typography>
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Arial', san-serif",
                  fontSize: "0.62rem",
                  color: info.color,
                }}
              >
                {info.label}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Arial', san-serif",
                  fontSize: "0.55rem",
                  color: "#8896a5",
                }}
              >
                {count} marta · {Math.floor(tm / 60)}s {tm % 60}d
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>

      {/* Batafsil ro'yxat */}
      <Paper
        sx={{
          border: "1px solid rgba(255,214,10,0.15)",
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {heat.delays.map((d, i) => {
          const info = getDelayInfo(d.delayOperation);
          const durMin = getDurMinutes(d.startTime, d.stopTime);
          const isSlow = info.type === "critical" || durMin > 15;

          return (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                px: 2,
                py: 1.4,
                borderBottom:
                  i < heat.delays.length - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : 0,
                background: isSlow ? `${info.color}06` : "transparent",
                "&:hover": { background: `${info.color}10` },
                transition: "background 0.15s",
              }}
            >
              {/* Rang chizig'i */}
              <Box
                sx={{
                  width: 4,
                  alignSelf: "stretch",
                  background: info.color,
                  borderRadius: 2,
                  flexShrink: 0,
                  minHeight: 36,
                }}
              />

              {/* Icon */}
              <Typography sx={{ fontSize: "1rem", flexShrink: 0, mt: 0.2 }}>
                {info.icon}
              </Typography>

              {/* Ma'lumot */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.3,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Arial', san-serif",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: info.color,
                    }}
                  >
                    {info.label}
                  </Typography>
                  {isSlow && (
                    <Box
                      sx={{
                        px: 0.8,
                        py: 0.1,
                        background: `${info.color}20`,
                        border: `1px solid ${info.color}40`,
                        borderRadius: 0.8,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Arial', san-serif",
                          fontSize: "0.52rem",
                          color: info.color,
                        }}
                      >
                        {info.type === "critical" ? "KRITIK" : "UZOQ"}
                      </Typography>
                    </Box>
                  )}
                </Box>
                <Typography
                  sx={{
                    fontFamily: "'Arial', san-serif",
                    fontSize: "0.62rem",
                    color: "#8896a5",
                    mb: 0.3,
                  }}
                >
                  {info.desc}
                </Typography>
                {d.delayReason?.trim() && (
                  <Typography
                    sx={{
                      fontFamily: "'Arial', san-serif",
                      fontSize: "0.62rem",
                      color: "#c8d8e8",
                    }}
                  >
                    📋 Sabab: {d.delayReason}
                  </Typography>
                )}
              </Box>

              {/* Vaqt */}
              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Typography
                  sx={{
                    fontFamily: "'Arial', san-serif",
                    fontSize: "0.75rem",
                    fontWeight: 700,
                    color:
                      durMin > 15
                        ? "#ff2d55"
                        : durMin > 5
                          ? "#ffd60a"
                          : "#00e676",
                  }}
                >
                  {fmtDur(d.startTime, d.stopTime)}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Arial', san-serif",
                    fontSize: "0.55rem",
                    color: "#8896a5",
                    mt: 0.2,
                  }}
                >
                  {new Date(d.startTime).toLocaleTimeString("uz-UZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {" → "}
                  {new Date(d.stopTime).toLocaleTimeString("uz-UZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Paper>
    </Box>
  );
}

// ─── Materiallar bloki ────────────────────────────────────────────
function MaterialsBlock({ heat, c }) {
  if (!heat?.materialAdditions?.length) return null;
  const grouped = heat.materialAdditions.reduce((acc, m) => {
    acc[m.materialCode] = (acc[m.materialCode] || 0) + m.materialWgt;
    return acc;
  }, {});
  return (
    <Box sx={{ mb: 4 }}>
      <SectionTitle color={c}>Material qo'shilishlari</SectionTitle>
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
        {Object.entries(grouped).map(([code, wgt]) => (
          <Box
            key={code}
            sx={{
              px: 1.5,
              py: 1,
              background: `${c}10`,
              border: `1px solid ${c}30`,
              borderRadius: 1.5,
              textAlign: "center",
              minWidth: 70,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: "0.65rem",
                color: "#8896a5",
                mb: 0.3,
              }}
            >
              {code}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: "0.78rem",
                fontWeight: 700,
                color: c,
              }}
            >
              {wgt}{" "}
              <span style={{ fontSize: "0.55rem", color: "#8896a5" }}>kg</span>
            </Typography>
          </Box>
        ))}
      </Box>
    </Box>
  );
}

// ─── Heats jadvali sarlavhalari ───────────────────────────────────
function HeatsTable({ heats, c, isDark, columns }) {
  return (
    <Paper
      sx={{ border: `1px solid ${c}20`, borderRadius: 2, overflow: "hidden" }}
    >
      <Table>
        <TableHead>
          <TableRow
            sx={{ background: isDark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.04)" }}
          >
            {columns.map((col) => (
              <TableCell
                key={col.key}
                sx={{ py: 1.2, borderBottom: `1px solid ${c}25` }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Arial', san-serif",
                    fontSize: "0.65rem",
                    color: "#8896a5",
                    whiteSpace: "nowrap",
                  }}
                >
                  {col.label}
                </Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {heats.map((h, i) => (
            <TableRow
              key={h.heatId}
              sx={{
                "&:hover": { background: `${c}08` },
                background:
                  i % 2 === 0
                    ? "transparent"
                    : isDark
                      ? "rgba(255,255,255,0.01)"
                      : "rgba(0,0,0,0.01)",
              }}
            >
              {columns.map((col) => (
                <TableCell
                  key={col.key}
                  sx={{
                    py: 1.2,
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: col.mono
                        ? "'Arial', san-serif"
                        : "'Arial', san-serif",
                      fontSize: "0.72rem",
                      color: col.color ?? "#c8d8e8",
                      fontWeight: col.bold ? 700 : 400,
                      whiteSpace: col.nowrap ? "nowrap" : "normal",
                    }}
                  >
                    {col.render ? col.render(h) : (h[col.key] ?? "—")}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

// ══════════════════════════════════════════════════════════════════
//  EAF STATS TAB
// ══════════════════════════════════════════════════════════════════
function EAFStatsTab({ uskuna, c, isDark }) {
  const {
    data: heats,
    isLoading,
    isError,
    refetch,
    isFetching,
    period,
    setPeriod,
    periodLabel,
    totalHeats,
  } = useProductionStatsWithFallback("eaf", "today");

  const [selectedHeatId, setSelectedHeatId] = useState(null);
  const prevPeriodRef = useRef(period);
  if (prevPeriodRef.current !== period) {
    prevPeriodRef.current = period;
    if (selectedHeatId !== null) setSelectedHeatId(heats[heats.length - 1]);
  }

  const selectedHeat =
    heats.find((h) => h.heatId === selectedHeatId) ?? heats[heats.length - 1];

  const avgTapping = heats.length
    ? Math.round(
        heats.reduce((s, h) => s + (h.tappingWeight || 0), 0) / heats.length,
      )
    : 0;
  const avgEnergy = heats.length
    ? Math.round(
        heats.reduce((s, h) => s + (h.electricalEnergy || 0), 0) / heats.length,
      )
    : 0;
  const totalScrap = heats.reduce((s, h) => s + (h.totalScrap || 0), 0);
  const totalHBI = heats.reduce((s, h) => s + (h.totalHBI || 0), 0);
  const totalTapping = heats.reduce((s, h) => s + (h.tappingWeight || 0), 0);

  const tempData = (selectedHeat?.temperatures || []).map((t, i) => ({
    i: i + 1,
    temp: t.temperature,
    o2: t.o2 || 0,
    t: fmtT(t.dateTime),
  }));

  const [open, setOpen] = useState(false);
  const [selectedHeatBtn, setSelectedHeatBtn] = useState(null);

  if (isLoading)
    return (
      <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={36} sx={{ color: c }} />
      </Box>
    );
  if (isError)
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography sx={{ fontSize: "2rem", mb: 1 }}>⚠️</Typography>
        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            fontSize: "0.75rem",
            color: "#ff2d55",
          }}
        >
          EAF API xato
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      {/* Sarlavha + period */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 12px ${c}`,
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.85rem",
              color: c,
              letterSpacing: "0.15em",
            }}
          >
            ELEKTRDA ERITISH PECHI KO‘RSATKICHLARI
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.4,
              background: `${c}15`,
              border: `1px solid ${c}30`,
              borderRadius: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.65rem",
                color: c,
              }}
            >
              {totalHeats} PLAVKA
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PeriodSelector period={period} onChange={setPeriod} color={c} />
          <IconButton
            size="small"
            onClick={refetch}
            sx={{
              color: isFetching ? c : "#8896a5",
              animation: isFetching ? "spin 1s linear infinite" : "none",
              "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      {/* Statistika kartalar */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="🔥"
            label="Plavka soni"
            value={totalHeats}
            color="#00d4ff"
            big
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="⚖️"
            label="Jami chiqarish"
            value={fmtN(totalTapping / 1000, 1)}
            unit="t"
            color="#00e676"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="⚖️"
            label="O'rt chiqarish"
            value={fmtN(avgTapping / 1000, 2)}
            unit="t"
            color="#00e676"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="⚡"
            label="O'rt elektr"
            value={fmtN(avgEnergy / 1000, 1)}
            unit="MWh"
            color="#ffd60a"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="🏗️"
            label="Jami Lom"
            value={fmtN(totalScrap / 1000, 1)}
            unit="t"
            color="#ff6b1a"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="🔩"
            label="Jami METALL"
            value={fmtN(totalHBI / 1000, 1)}
            unit="t"
            color="#a78bfa"
          />
        </Grid>
      </Grid>

      {/* Oxirgi heat */}
      {selectedHeat && (
        <Box sx={{ mb: 4 }}>
          {/* Heat tanlagich */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{ width: 3, height: 20, background: c, borderRadius: 2 }}
              />
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.72rem",
                  color: c,
                  letterSpacing: "0.12em",
                }}
              >
                PLAVKANI TANLANG
              </Typography>
            </Box>
            <HeatSelector
              heats={heats}
              selectedId={selectedHeatId ?? selectedHeat?.heatId}
              onChange={(id) => setSelectedHeatId(Number(id))}
              color={c}
            />
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.62rem",
                color: "#8896a5",
              }}
            >
              {fmtT(selectedHeat.startTime)} → {fmtT(selectedHeat.stopTime)} ·{" "}
              {fmtDur(selectedHeat.startTime, selectedHeat.stopTime)}
            </Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 2,
                  border: `1px solid ${c}20`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <InfoRow
                  label="Suyuq Metall"
                  value={`${fmtN((selectedHeat.tappingWeight || 0) / 1000, 2)} t`}
                  color="#00e676"
                />
                <InfoRow
                  label="Elektr energiya"
                  value={`${fmtN(selectedHeat.electricalEnergy / 1000, 1)} MWh`}
                  color="#ffd60a"
                />
                <InfoRow
                  label="Kislorod (O₂)"
                  value={`${fmtN(selectedHeat.injectedO2, 0)} m³`}
                  color="#00d4ff"
                />
                <InfoRow
                  label="Uglerod"
                  value={`${fmtN(selectedHeat.injectedCarbon, 0)} kg`}
                  color="#ff9500"
                />
                <InfoRow
                  label="Yoqilg'i"
                  value={`${fmtN(selectedHeat.injectedFuel, 0)} kg`}
                  color="#a78bfa"
                />
                <InfoRow
                  label="O'rt quvvat"
                  value={`${fmtN((selectedHeat.averagePower || 0) / 1000, 0)} MW`}
                  color="#ffd60a"
                />
                <InfoRow
                  label="Quvvat vaqti"
                  value={`${Math.floor((selectedHeat.powerOnTime || 0) / 60)} min`}
                  color="#00e676"
                />
                <InfoRow
                  label="Lom"
                  value={`${fmtN((selectedHeat.totalScrap || 0) / 1000, 1)} t`}
                  color="#8896a5"
                />
                <InfoRow
                  label="METALL"
                  value={`${fmtN((selectedHeat.totalHBI || 0) / 1000, 1)} t`}
                  color="#8896a5"
                />
                <InfoRow
                  label="Smena"
                  value={selectedHeat.shift || "—"}
                  color="#8896a5"
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 2,
                  border: `1px solid ${c}20`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.65rem",
                    color: "#8896a5",
                    mb: 2,
                    letterSpacing: "0.08em",
                  }}
                >
                  HARORAT DINAMIKASI
                </Typography>
                <TempChart
                  data={tempData}
                  c={c}
                  isDark={isDark}
                  extraLines={[
                    {
                      key: "o2",
                      color: "#ff6b1a",
                      name: "O₂",
                      dot: { r: 3, fill: "#ff6b1a" },
                      width: 1.5,
                    },
                  ]}
                />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      <ChemAnalysis heat={selectedHeat} c={c} />
      <DelaysBlock heat={selectedHeat} />

      {/* Jadval */}
      <Box>
        <SectionTitle color={c}>{periodLabel} — barcha plavkalar</SectionTitle>
        <HeatsTable
          heats={heats}
          c={c}
          isDark={isDark}
          columns={[
            {
              key: "heatId",
              label: "Plavka ID",
              bold: true,
              color: c,
              render: (h) => `#${h.heatId}`,
            },
            {
              key: "steelGradeName",
              label: "Po'lat",
              mono: true,
              color: "#c8d8e8",
            },
            {
              key: "startTime",
              label: "Boshlanish",
              mono: true,
              color: "#8896a5",
              nowrap: true,
              render: (h) => fmtT(h.startTime),
            },
            {
              key: "dur",
              label: "Davomiylik",
              mono: true,
              color: "#8896a5",
              render: (h) => fmtDur(h.startTime, h.stopTime),
            },
            {
              key: "tappingWeight",
              label: "Suyuq Metall",
              bold: true,
              color: "#00e676",
              render: (h) => `${fmtN((h.tappingWeight || 0) / 1000, 2)} t`,
            },
            {
              key: "electricalEnergy",
              label: "Elektr",
              mono: true,
              color: "#ffd60a",
              render: (h) => `${fmtN((h.electricalEnergy || 0) / 1000, 1)} MWh`,
            },
            {
              key: "injectedO2",
              label: "O₂",
              mono: true,
              color: "#00d4ff",
              render: (h) => `${fmtN(h.injectedO2, 0)} m³`,
            },
            {
              key: "yield",
              label: "Samaradorlik",
              bold: true,
              render: (h) => {
                const scrap = h.totalScrap || 0;
                const hbi = h.totalHBI || 0;
                const output = h.tappingWeight || 0;

                const val = scrap + hbi > 0 ? output / (scrap + hbi) : 0;

                let color = "#ff2d55"; // red
                if (val > 0.9)
                  color = "#00ff9d"; // green
                else if (val > 0.8) color = "#ffd60a"; // yellow

                return <span style={{ color }}>{fmtN(val * 100, 1)} %</span>;
              },
            },

            // ⚡ 2. ENERGY PER TON
            {
              key: "energyPerTon",
              label: "kWh/t",
              mono: true,
              render: (h) => {
                const energy = h.electricalEnergy || 0;
                const output = h.tappingWeight || 0;

                const val = output > 0 ? energy / (output / 1000) : 0;
                let color = "#00ff9d"; // green
                if (val > 500) color = "#ff2d55";
                else if (val > 400) color = "#ffd60a";

                return (
                  <span
                    style={{ color, cursor: "pointer" }}
                    onClick={() => {
                      setSelectedHeatBtn(h);
                      setOpen(true);
                    }}
                  >
                    {fmtN(val, 0)}
                  </span>
                );
              },
            },

            // 🔥 3. SCRAP / HBI
            {
              key: "ratio",
              label: "LOM/METALL",
              mono: true,
              render: (h) => {
                const scrap = h.totalScrap || 0;
                const hbi = h.totalHBI || 0;

                const val = hbi > 0 ? scrap / hbi : 0;

                let color = "#ff2d55"; // red
                if (val >= 2 && val <= 4) color = "#00ff9d";
                else if ((val >= 1 && val < 2) || (val > 4 && val <= 6))
                  color = "#ffd60a";

                return <span style={{ color }}>{fmtN(val, 2)}</span>;
              },
            },
          ]}
        />
        <Dialog
          open={open}
          onClose={() => setOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>🔍 Heat #{selectedHeatBtn?.heatId}</DialogTitle>

          <DialogContent>
            {selectedHeatBtn && (
              <>
                <Typography>
                  ⚡ Energy: {selectedHeatBtn.electricalEnergy} kWh
                </Typography>

                <Typography>
                  🏭 Output: {(selectedHeatBtn.tappingWeight / 1000).toFixed(1)}{" "}
                  t
                </Typography>

                {analyzeHeat(selectedHeatBtn).map((item, i) => (
                  <Box
                    key={i}
                    mb={2}
                    p={1.5}
                    sx={{ border: "1px solid #333", borderRadius: 2 }}
                  >
                    <Typography fontWeight={700}>{item.title}</Typography>

                    <Typography fontSize="0.8rem">📊 {item.value}</Typography>

                    <Typography fontSize="0.8rem" color="#ff2d55">
                      ❌ {item.problem}
                    </Typography>

                    {item.reason?.map((r, idx) => (
                      <Typography key={idx} fontSize="0.75rem">
                        • {r}
                      </Typography>
                    ))}

                    <Typography fontSize="0.8rem" color="#00ff9d">
                      💡 {item.solution}
                    </Typography>
                  </Box>
                ))}
              </>
            )}
          </DialogContent>
        </Dialog>
      </Box>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════
//  LRF STATS TAB
// ══════════════════════════════════════════════════════════════════
function analyzeHeatLRF(h) {
  const reasons = [];

  // 1. Duration
  const durationMin = (new Date(h.stopTime) - new Date(h.startTime)) / 60000;

  if (durationMin > 120) {
    reasons.push(
      `⏱ Jarayon juda uzoq davom etgan (${Math.round(durationMin)} min)`,
    );
  }

  // 2. Power %
  const totalSec = (new Date(h.stopTime) - new Date(h.startTime)) / 1000;

  const powerPercent = totalSec ? (h.powerOnTime / totalSec) * 100 : 0;

  if (powerPercent < 50) {
    reasons.push(
      `⚡ Power past (${Math.round(powerPercent)}%) — pech ko‘p vaqt o‘chiq bo‘lgan`,
    );
  }

  // 3. Power OFF lar soni
  const powerOffs =
    h.lrfEvents?.filter((e) => e.eventCode === "POWER_OFF").length || 0;

  if (powerOffs > 2) {
    reasons.push(`🔌 ${powerOffs} marta POWER_OFF bo‘lgan — jarayon uzilgan`);
  }

  // 4. Delay
  if (h.delays?.length > 0) {
    const totalDelay = h.delays.reduce((sum, d) => {
      return sum + (new Date(d.stopTime) - new Date(d.startTime));
    }, 0);

    reasons.push(`⛔ Delay mavjud (${Math.round(totalDelay / 60000)} min)`);
  }

  // 5. Energiya
  if (h.electricalEnergy > 15000) {
    reasons.push(`🔥 Elektr sarfi yuqori (${h.electricalEnergy} kWh)`);
  }

  // 6. Temperatura
  if (h.temperatures?.length) {
    const temps = h.temperatures.map((t) => t.temperature);
    const maxTemp = Math.max(...temps);

    if (maxTemp < 1580) {
      reasons.push(`🌡 Maksimal temperatura past (${maxTemp}°C)`);
    }
  }

  // 7. Material qo‘shish ko‘p bo‘lsa
  if ((h.materialAdditions?.length || 0) > 5) {
    reasons.push(
      `⚗️ Juda ko‘p material qo‘shilgan (${h.materialAdditions.length} marta)`,
    );
  }

  // Default
  if (reasons.length === 0) {
    reasons.push("✅ Jarayon normal o‘tgan");
  }

  return reasons;
}
function TempChartLRF({ data }) {
  const chartData = (data || []).map((t) => ({
    time: new Date(t.dateTime).toLocaleTimeString(),
    temp: t.temperature,
  }));

  return (
    <div style={{ width: "100%", height: 250 }}>
      <ResponsiveContainer>
        <LineChart data={chartData}>
          <XAxis dataKey="time" />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey="temp" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
function EventsTimeline({ events }) {
  const sorted = [...(events || [])].sort(
    (a, b) => new Date(a.eventDate) - new Date(b.eventDate),
  );

  return (
    <div style={{ maxHeight: 200, overflow: "auto" }}>
      {sorted.map((e, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          <b>{e.eventCode}</b> — {new Date(e.eventDate).toLocaleTimeString()}
        </div>
      ))}
    </div>
  );
}
function AnalysisList({ heat }) {
  const reasons = analyzeHeatLRF(heat);

  return (
    <div>
      {reasons.map((r, i) => (
        <div key={i} style={{ marginBottom: 6 }}>
          {r}
        </div>
      ))}
    </div>
  );
}
function HeatDetailsModal({ heat, onClose }) {
  if (!heat) return null;

  return (
    <Dialog open={!!heat} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Heat #{heat.heatId} — Batafsil tahlil</DialogTitle>

      <DialogContent>
        <Grid container spacing={3}>
          {/* ANALYSIS */}
          <Grid item xs={12}>
            <Typography variant="h6">🧠 Tahlil</Typography>
            <AnalysisList heat={heat} />
          </Grid>

          {/* TEMPERATURE */}
          <Grid item xs={12}>
            <Typography variant="h6">🌡 Temperatura grafigi</Typography>
            <TempChartLRF data={heat.temperatures} />
          </Grid>

          {/* EVENTS */}
          <Grid item xs={12}>
            <Typography variant="h6">⏱ Voqealar (Timeline)</Typography>
            <EventsTimeline events={heat.lrfEvents} />
          </Grid>
        </Grid>
      </DialogContent>
    </Dialog>
  );
}
function getStatus(h) {
  if (!h) return "—";

  const start = new Date(h.startTime);
  const stop = new Date(h.stopTime);

  const durationMin = (stop - start) / 60000;
  const totalSec = (stop - start) / 1000;

  const powerPercent = totalSec ? ((h.powerOnTime || 0) / totalSec) * 100 : 0;

  const delaysCount = h.delays?.length || 0;

  const powerOffs =
    h.lrfEvents?.filter((e) => e.eventCode === "POWER_OFF").length || 0;

  const energy = h.electricalEnergy || 0;

  const temps = h.temperatures?.map((t) => t.temperature) || [];
  const maxTemp = temps.length ? Math.max(...temps) : 0;

  // 🔴 CRITICAL
  if (delaysCount > 2 || powerPercent < 40) {
    return "❌ Muammo";
  }

  // 🟡 WARNING
  if (
    durationMin > 120 ||
    powerPercent < 60 ||
    energy > 15000 ||
    powerOffs > 2 ||
    maxTemp < 1580
  ) {
    return "⚠️ Ogohlantirish";
  }

  // 🟢 NORMAL
  return "✅ Normal";
}
function getStatusColor(status) {
  if (status.includes("❌")) return "#ef5350";
  if (status.includes("⚠️")) return "#ffb300";
  return "#00e676";
}
function LRFStatsTab({ c, isDark }) {
  const {
    data: heats,
    isLoading,
    isError,
    refetch,
    isFetching,
    period,
    setPeriod,
    periodLabel,
    totalHeats,
  } = useProductionStatsWithFallback("lrf", "today");
  const [selectedHeatId, setSelectedHeatId] = useState(null);
  const prevPeriodRef = useRef(period);
  const [selectedHeatLrf, setSelectedHeatLrf] = useState(null);
  if (prevPeriodRef.current !== period) {
    prevPeriodRef.current = period;
    if (selectedHeatId !== null) setSelectedHeatId(heats.length - 1);
  }
  const selectedHeat =
    heats.find((h) => h.heatId === selectedHeatId) ?? heats[heats.length - 1];
  heats.find((h) => h.heatId === selectedHeatId) ?? heats[heats.length - 1];

  const avgFinal = heats.length
    ? Math.round(
        heats.reduce((s, h) => s + (h.finalSteelWeight || 0), 0) / heats.length,
      )
    : 0;
  const avgEnergy = heats.length
    ? Math.round(
        heats.reduce((s, h) => s + (h.electricalEnergy || 0), 0) / heats.length,
      )
    : 0;
  const avgAr = heats.length
    ? (
        heats.reduce((s, h) => s + (h.totalArConsumption || 0), 0) /
        heats.length
      ).toFixed(1)
    : 0;
  const totalFinal = heats.reduce((s, h) => s + (h.finalSteelWeight || 0), 0);

  const tempData = (selectedHeat?.temperatures || []).map((t, i) => ({
    i: i + 1,
    temp: t.temperature,
    t: fmtT(t.dateTime),
  }));

  if (isLoading)
    return (
      <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={36} sx={{ color: c }} />
      </Box>
    );
  if (isError)
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography sx={{ fontSize: "2rem", mb: 1 }}>⚠️</Typography>
        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            fontSize: "0.75rem",
            color: "#ff2d55",
          }}
        >
          LRF API xato
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 12px ${c}`,
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.85rem",
              color: c,
              letterSpacing: "0.15em",
            }}
          >
            Kovsh Tozalash Pechi HISOBOTI
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.4,
              background: `${c}15`,
              border: `1px solid ${c}30`,
              borderRadius: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.65rem",
                color: c,
              }}
            >
              {totalHeats} Plavka
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PeriodSelector period={period} onChange={setPeriod} color={c} />
          <IconButton
            size="small"
            onClick={refetch}
            sx={{
              color: isFetching ? c : "#8896a5",
              animation: isFetching ? "spin 1s linear infinite" : "none",
              "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="🔥"
            label="Plavka soni"
            value={totalHeats}
            color="#00d4ff"
            big
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="⚖️"
            label="Jami yakuniy"
            value={fmtN(totalFinal / 1000, 1)}
            unit="t"
            color="#00e676"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="⚖️"
            label="O'rt yakuniy"
            value={fmtN(avgFinal / 1000, 2)}
            unit="t"
            color="#00e676"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="⚡"
            label="O'rt elektr"
            value={fmtN(avgEnergy / 1000, 1)}
            unit="MWh"
            color="#ffd60a"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="💨"
            label="O'rt Ar sarfi"
            value={avgAr}
            unit="m³"
            color="#a78bfa"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="🪣"
            label="Kovsh"
            value={selectedHeat?.ladleId || "—"}
            color="#ff6b1a"
          />
        </Grid>
      </Grid>

      {selectedHeat && (
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{ width: 3, height: 20, background: c, borderRadius: 2 }}
              />
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.72rem",
                  color: c,
                  letterSpacing: "0.12em",
                }}
              >
                PLAVKANI TANLANG
              </Typography>
            </Box>
            <HeatSelector
              heats={heats}
              selectedId={selectedHeatId ?? selectedHeat?.heatId}
              onChange={(id) => setSelectedHeatId(Number(id))}
              color={c}
            />
          </Box>
          <SectionTitle color={c}>
            #{selectedHeat.heatId} — {selectedHeat.steelGradeName}
          </SectionTitle>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 2,
                  border: `1px solid ${c}20`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <InfoRow
                  label="Boshlang'ich og'irlik"
                  value={`${fmtN((selectedHeat.startSteelWeight || 0) / 1000, 2)} t`}
                  color="#8896a5"
                />
                <InfoRow
                  label="Yakuniy og'irlik"
                  value={`${fmtN((selectedHeat.finalSteelWeight || 0) / 1000, 2)} t`}
                  color="#00e676"
                />
                <InfoRow
                  label="Boshlang'ich shlak"
                  value={`${fmtN((selectedHeat.startSlagWeight || 0) / 1000, 2)} t`}
                  color="#8896a5"
                />
                <InfoRow
                  label="Yakuniy shlak"
                  value={`${fmtN((selectedHeat.finalSlagWeight || 0) / 1000, 2)} t`}
                  color="#ff9500"
                />
                <InfoRow
                  label="Elektr energiya"
                  value={`${fmtN(selectedHeat.electricalEnergy / 1000, 1)} MWh`}
                  color="#ffd60a"
                />
                <InfoRow
                  label="Ar sarfi"
                  value={`${fmtN(selectedHeat.totalArConsumption, 1)} m³`}
                  color="#a78bfa"
                />
                <InfoRow
                  label="Davomiylik"
                  value={fmtDur(selectedHeat.startTime, selectedHeat.stopTime)}
                  color="#00d4ff"
                />
                <InfoRow
                  label="Smena"
                  value={selectedHeat.shift || "—"}
                  color="#8896a5"
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 2,
                  border: `1px solid ${c}20`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.65rem",
                    color: "#8896a5",
                    mb: 2,
                    letterSpacing: "0.08em",
                  }}
                >
                  HARORAT DINAMIKASI
                </Typography>
                <TempChart data={tempData} c={c} isDark={isDark} />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      <MaterialsBlock heat={selectedHeat} c={c} />
      <ChemAnalysis heat={selectedHeat} c={c} />

      <Box>
        <SectionTitle color={c}>{periodLabel} — barcha plavkalar</SectionTitle>
        <HeatsTable
          heats={heats}
          c={c}
          isDark={isDark}
          columns={[
            {
              key: "heatId",
              label: "Plavka ID",
              bold: true,
              color: c,
              render: (h) => `#${h.heatId}`,
            },
            {
              key: "steelGradeName",
              label: "Po'lat",
              mono: true,
              color: "#c8d8e8",
            },
            {
              key: "startTime",
              label: "Boshlanish",
              mono: true,
              color: "#8896a5",
              nowrap: true,
              render: (h) => fmtT(h.startTime),
            },
            {
              key: "dur",
              label: "Davomiylik",
              mono: true,
              color: "#8896a5",
              render: (h) => fmtDur(h.startTime, h.stopTime),
            },
            // {
            //   key: "startSteelWeight",
            //   label: "Boshlang‘ich og‘irlik",
            //   mono: true,
            //   color: "#90caf9",
            //   render: (h) => `${fmtN((h.startSteelWeight || 0) / 1000, 2)} t`,
            // },
            // {
            //   key: "finalSteelWeight",
            //   label: "Yakuniy og'irlik",
            //   bold: true,
            //   color: "#00e676",
            //   render: (h) => `${fmtN((h.finalSteelWeight || 0) / 1000, 2)} t`,
            // },
            {
              key: "deltaWeight",
              label: "Δ Og‘irlik",
              mono: true,
              color: "#4dd0e1",
              render: (h) =>
                `${fmtN(((h.finalSteelWeight || 0) - (h.startSteelWeight || 0)) / 1000, 2)} t`,
            },
            {
              key: "slagDelta",
              label: "Δ Shlak",
              mono: true,
              color: "#ff8a65",
              render: (h) =>
                `${fmtN(((h.finalSlagWeight || 0) - (h.startSlagWeight || 0)) / 1000, 2)} t`,
            },
            {
              key: "electricalEnergy",
              label: "Elektr sarfi",
              mono: true,
              color: "#ffd60a",
              render: (h) => `${fmtN((h.electricalEnergy || 0) / 1000, 1)} MWh`,
            },
            {
              key: "energyPerTon",
              label: "kWh/t",
              mono: true,
              color: "#ffd54f",
              render: (h) => {
                const weight = (h.finalSteelWeight || 1) / 1000;
                return `${fmtN((h.electricalEnergy || 0) / weight, 0)} kWh/t`;
              },
            },
            {
              key: "powerRatio",
              label: "Pech Ishlagan %",
              mono: true,
              color: "#81c784",
              render: (h) => {
                const total =
                  (new Date(h.stopTime) - new Date(h.startTime)) / 1000;
                return total
                  ? `${fmtN(((h.powerOnTime || 0) / total) * 100, 0)}%`
                  : "—";
              },
            },
            {
              key: "status",
              label: "Jarayon holati",
              bold: true,
              render: (h) => {
                const status = getStatus(h);

                return (
                  <span
                    style={{
                      cursor: "pointer",
                      color: getStatusColor(status),
                      fontWeight: 700,
                    }}
                    onClick={() => setSelectedHeatLrf(h)}
                  >
                    {status}
                  </span>
                );
              },
            },
            {
              key: "totalArConsumption",
              label: "Argon sarfi",
              mono: true,
              color: "#a78bfa",
              render: (h) => `${fmtN(h.totalArConsumption, 1)} m³`,
            },
          ]}
        />
        <HeatDetailsModal
          heat={selectedHeatLrf}
          onClose={() => setSelectedHeatLrf(null)}
        />
      </Box>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════
//  TSC STATS TAB
// ══════════════════════════════════════════════════════════════════

function analyzeTSCAdvanced(h) {
  const issues = [];
  const good = [];

  const duration =
    (new Date(h.ladleCloseDate) - new Date(h.ladleOpeningDate)) / 60000;

  const speeds = h.tscStrands?.map((s) => s.castSpeedAvg) || [];
  const avgSpeed = speeds.length
    ? speeds.reduce((a, b) => a + b, 0) / speeds.length
    : 0;

  const loss = h.tundishSkullWeight || 0;

  const temps = h.temperatures?.map((t) => t.temperature) || [];

  // ❌ MUAMMOLAR
  if (h.delays?.length > 0) {
    issues.push(`⛔ ${h.delays.length} ta delay`);
  }

  if (avgSpeed < 0.8) {
    issues.push(`⚡ Tezlik past (${avgSpeed.toFixed(2)})`);
  }

  if (loss > 3000) {
    issues.push(`❌ Loss katta (${loss} kg)`);
  }

  if (temps.length && Math.min(...temps) < h.liquidusTemperature) {
    issues.push(`🌡 Temp past`);
  }

  // ✅ YAXSHI TOMONLAR
  if (avgSpeed > 1.2) {
    good.push("⚡ Tezlik yaxshi");
  }

  if (loss < 1000) {
    good.push("✅ Loss kam");
  }

  if (!h.delays?.length) {
    good.push("🟢 Delay yo‘q");
  }

  return { issues, good };
}
function getScore(h) {
  let score = 100;

  const eff = ((h.finalSteelWeight || 0) / (h.startSteelWeight || 1)) * 100;
  const loss = h.tundishSkullWeight || 0;
  const delays = h.delays?.length || 0;
  const speed = h.tscStrands?.[0]?.castSpeedAvg || 0;

  const temps = h.temperatures?.map((t) => t.temperature) || [];
  const diff = temps.length ? Math.min(...temps) - h.liquidusTemperature : 0;

  // ❌ penalti
  if (eff < 95) score -= 10;
  if (eff < 90) score -= 15;

  if (loss > 1000) score -= 10;
  if (loss > 3000) score -= 15;

  if (diff < -10) score -= 10;
  if (diff < -25) score -= 15;

  if (speed < 1) score -= 10;
  if (speed < 0.8) score -= 15;

  if (delays > 0) score -= delays * 5;

  return Math.max(score, 0);
}
function getScoreColor(score) {
  if (score >= 85) return "#00e676"; // yashil
  if (score >= 65) return "#ffd60a"; // sariq
  return "#ff2d55"; // qizil
}
function formatEvent(code) {
  const map = {
    LADLE_OPEN: "🪣 Ladle ochildi",
    LADLE_CLOSE: "🪣 Ladle yopildi",
    START_CAST: "▶️ Quyish boshlandi",
    STOP_CAST: "⏹ Quyish to‘xtadi",
    DELAY: "⛔ Delay",
  };

  return map[code] || code;
}
function AnalyzeDialogTSC({ open, onClose, heat }) {
  const { issues, good } = analyzeTSCAdvanced(heat);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Analyze #{heat.heatId}
        <IconButton
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Typography sx={{ color: "#ff2d55", mb: 1, fontWeight: 700 }}>
          Muammolar:
        </Typography>
        {issues.length ? (
          issues.map((i, idx) => (
            <Typography key={idx} sx={{ mb: 0.5 }}>
              {i}
            </Typography>
          ))
        ) : (
          <Typography>Yo‘q</Typography>
        )}

        <Divider sx={{ my: 2 }} />

        <Typography sx={{ color: "#00e676", mb: 1, fontWeight: 700 }}>
          Yaxshi tomonlar:
        </Typography>
        {good.map((g, idx) => (
          <Typography key={idx} sx={{ mb: 0.5 }}>
            {g}
          </Typography>
        ))}
      </DialogContent>
    </Dialog>
  );
}
function TSCStatsTab({ c, isDark }) {
  const {
    data: heats,
    isLoading,
    isError,
    refetch,
    isFetching,
    period,
    setPeriod,
    periodLabel,
    totalHeats,
  } = useProductionStatsWithFallback("tsc", "today");
  const [openAnalyze, setOpenAnalyze] = useState(false);
  const [selectedHeatAnalyze, setSelectedHeatAnalyze] = useState(null);

  const [selectedHeatId, setSelectedHeatId] = useState(null);
  const prevPeriodRef = useRef(period);
  if (prevPeriodRef.current !== period) {
    prevPeriodRef.current = period;
    if (selectedHeatId !== null) setSelectedHeatId(heats.length - 1);
  }
  const selectedHeat =
    heats.find((h) => h.heatId === selectedHeatId) ?? heats[heats.length - 1];
  const lastStrand = selectedHeat?.tscStrands?.[0];
  const totalSlabs = heats.reduce(
    (s, h) =>
      s + (h.tscProducts?.filter((p) => p.productType === 1).length || 0),
    0,
  );
  const avgSpeed = heats.length
    ? (
        heats.reduce((s, h) => s + (h.tscStrands?.[0]?.castSpeedAvg || 0), 0) /
        heats.length
      ).toFixed(2)
    : 0;
  const totalLength = heats.reduce(
    (s, h) => s + (h.tscStrands?.[0]?.castLength || 0),
    0,
  );

  const tempData = (selectedHeat?.temperatures || []).map((t, i) => ({
    i: i + 1,
    temp: t.temperature,
    liq: selectedHeat?.liquidusTemperature,
    t: fmtT(t.dateTime),
  }));

  if (isLoading)
    return (
      <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={36} sx={{ color: c }} />
      </Box>
    );
  if (isError)
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography sx={{ fontSize: "2rem", mb: 1 }}>⚠️</Typography>
        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            fontSize: "0.75rem",
            color: "#ff2d55",
          }}
        >
          TSC API xato
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 12px ${c}`,
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.85rem",
              color: c,
              letterSpacing: "0.15em",
            }}
          >
            UZLUKSIZ QUYISH MASHINASI HISOBOTI
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.4,
              background: `${c}15`,
              border: `1px solid ${c}30`,
              borderRadius: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.65rem",
                color: c,
              }}
            >
              {totalHeats} PLAVKA
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PeriodSelector period={period} onChange={setPeriod} color={c} />
          <IconButton
            size="small"
            onClick={refetch}
            sx={{
              color: isFetching ? c : "#8896a5",
              animation: isFetching ? "spin 1s linear infinite" : "none",
              "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="🔥"
            label="Plavka soni"
            value={totalHeats}
            color="#00d4ff"
            big
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="📦"
            label="Jami slab"
            value={totalSlabs}
            color="#00e676"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="⚡"
            label="O'rt tezlik"
            value={avgSpeed}
            unit="m/min"
            color="#ffd60a"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="📏"
            label="Jami uzunlik"
            value={fmtN(totalLength / 1000, 1)}
            unit="m"
            color="#a78bfa"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="🪣"
            label="Tundish"
            value={selectedHeat?.tundishId || "—"}
            color="#ff6b1a"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="🌡️"
            label="Likvidus"
            value={selectedHeat?.liquidusTemperature || "—"}
            unit="°C"
            color="#ff2d55"
          />
        </Grid>
      </Grid>

      {selectedHeat && (
        <Box sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 2,
              mb: 2,
              flexWrap: "wrap",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Box
                sx={{ width: 3, height: 20, background: c, borderRadius: 2 }}
              />
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.72rem",
                  color: c,
                  letterSpacing: "0.12em",
                }}
              >
                PLAVKANI TANLANG
              </Typography>
            </Box>
            <HeatSelector
              heats={heats}
              selectedId={selectedHeatId ?? selectedHeat?.heatId}
              onChange={(id) => setSelectedHeatId(Number(id))}
              color={c}
            />
          </Box>
          <SectionTitle color={c}>
            #{selectedHeat.heatId} — {selectedHeat.steelGradeName}
          </SectionTitle>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 2,
                  border: `1px solid ${c}20`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <InfoRow
                  label="Boshlang'ich og'irlik"
                  value={`${fmtN((selectedHeat.startSteelWeight || 0) / 1000, 1)} t`}
                  color="#8896a5"
                />
                <InfoRow
                  label="Tundish"
                  value={selectedHeat.tundishId || "—"}
                  color={c}
                />
                <InfoRow
                  label="Tundish ishlagan soni"
                  value={`${selectedHeat.tundishLife || "—"} quyish`}
                  color="#ff9500"
                />
                <InfoRow
                  label="Likvidus harorat"
                  value={`${selectedHeat.liquidusTemperature || "—"} °C`}
                  color="#ff2d55"
                />
                <InfoRow
                  label="Davomiylik"
                  value={fmtDur(
                    selectedHeat.ladleOpeningDate,
                    selectedHeat.ladleCloseDate,
                  )}
                  color="#00d4ff"
                />
                {lastStrand && (
                  <>
                    <InfoRow
                      label="Profil"
                      value={lastStrand.profileName}
                      color={c}
                    />
                    <InfoRow
                      label="Quyish tezligi"
                      value={`${fmtN(lastStrand.castSpeedAvg, 2)} m/min`}
                      color="#ffd60a"
                    />
                    <InfoRow
                      label="Uzunlik"
                      value={`${fmtN(lastStrand.castLength / 1000, 1)} m`}
                      color="#00e676"
                    />
                    <InfoRow
                      label="Qolip"
                      value={lastStrand.mouldId}
                      color="#a78bfa"
                    />
                    <InfoRow
                      label="Qolipga quyilgan soni"
                      value={`${lastStrand.mouldLife} quyish`}
                      color="#ff9500"
                    />
                  </>
                )}
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 2,
                  border: `1px solid ${c}20`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.65rem",
                    color: "#8896a5",
                    mb: 2,
                    letterSpacing: "0.08em",
                  }}
                >
                  HARORAT vs LIKVIDUS ({selectedHeat.liquidusTemperature}°C)
                </Typography>
                <TempChart
                  data={tempData}
                  c={c}
                  isDark={isDark}
                  extraLines={[
                    {
                      key: "liq",
                      color: "#ff2d55",
                      name: "Likvidus °C",
                      width: 1.5,
                      dash: "8,4",
                    },
                  ]}
                />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      <ChemAnalysis heat={selectedHeat} c={c} />

      {/* Slab mahsulotlar */}
      {selectedHeat?.tscProducts?.filter((p) => p.productType === 1).length >
        0 && (
        <Box sx={{ mb: 4 }}>
          <SectionTitle color={c}>
            Slab mahsulotlar (
            {selectedHeat.tscProducts.filter((p) => p.productType === 1).length}{" "}
            ta)
          </SectionTitle>
          <Paper
            sx={{
              border: `1px solid ${c}20`,
              borderRadius: 2,
              overflow: "hidden",
            }}
          >
            <Table>
              <TableHead>
                <TableRow sx={{ background: "rgba(0,0,0,0.4)" }}>
                  {[
                    "Slab ID",
                    "Uzunlik",
                    "Qalinlik",
                    "Og'irlik",
                    "Kesish vaqti",
                  ].map((h) => (
                    <TableCell
                      key={h}
                      sx={{ py: 1.2, borderBottom: `1px solid ${c}25` }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Arial',san-serif",
                          fontSize: "0.65rem",
                          color: "#8896a5",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {h}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {selectedHeat.tscProducts
                  .filter((p) => p.productType === 1)
                  .map((p, i) => (
                    <TableRow
                      key={p.productNo}
                      sx={{ "&:hover": { background: `${c}08` } }}
                    >
                      <TableCell
                        sx={{
                          py: 1.2,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Arial',san-serif",
                            fontSize: "0.72rem",
                            color: c,
                            fontWeight: 700,
                          }}
                        >
                          {p.slabId}
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 1.2,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Arial',san-serif",
                            fontSize: "0.72rem",
                            color: "#c8d8e8",
                          }}
                        >
                          {fmtN(p.productLength / 1000, 2)} m
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 1.2,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Arial',san-serif",
                            fontSize: "0.72rem",
                            color: "#8896a5",
                          }}
                        >
                          {fmtN(p.productThickness, 1)} mm
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 1.2,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Arial',san-serif",
                            fontSize: "0.72rem",
                            color: "#00e676",
                            fontWeight: 700,
                          }}
                        >
                          {fmtN(p.productWeight / 1000, 2)} t
                        </Typography>
                      </TableCell>
                      <TableCell
                        sx={{
                          py: 1.2,
                          borderBottom: "1px solid rgba(255,255,255,0.04)",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Arial',san-serif",
                            fontSize: "0.68rem",
                            color: "#8896a5",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {fmtT(p.productCutDate)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </Paper>
        </Box>
      )}

      <Box>
        <SectionTitle color={c}>{periodLabel} — barcha plavkalar</SectionTitle>
        <HeatsTable
          heats={heats}
          c={c}
          isDark={isDark}
          columns={[
            {
              key: "heatId",
              label: "Plavka ID",
              bold: true,
              color: c,
              render: (h) => `#${h.heatId}`,
            },
            {
              key: "steelGradeName",
              label: "Po'lat",
              mono: true,
              color: "#c8d8e8",
            },
            {
              key: "ladleOpeningDate",
              label: "Ochilish",
              mono: true,
              color: "#8896a5",
              nowrap: true,
              render: (h) => fmtT(h.ladleOpeningDate),
            },
            {
              key: "dur",
              label: "Davomiylik",
              mono: true,
              color: "#8896a5",
              render: (h) => fmtDur(h.ladleOpeningDate, h.ladleCloseDate),
            },
            {
              key: "tundishId",
              label: "Tundish",
              mono: true,
              color: "#ff6b1a",
            },
            {
              key: "slabs",
              label: "Slab soni",
              bold: true,
              color: "#00e676",
              render: (h) =>
                h.tscProducts?.filter((p) => p.productType === 1).length || 0,
            },
            {
              key: "speed",
              label: "Tezlik",
              mono: true,
              color: "#ffd60a",
              render: (h) =>
                `${fmtN(h.tscStrands?.[0]?.castSpeedAvg, 2)} m/min`,
            },
            {
              key: "eff",
              label: "Samaradorlik",
              render: (h) => {
                const eff =
                  ((h.finalSteelWeight || 0) / (h.startSteelWeight || 1)) * 100;

                const color =
                  eff >= 95 ? "#00e676" : eff >= 90 ? "#ffd60a" : "#ff2d55";

                return (
                  <span style={{ color, fontWeight: 700 }}>
                    {eff.toFixed(1)}%
                  </span>
                );
              },
            },
            {
              key: "loss",
              label: "Yo‘qotish",
              render: (h) => {
                const loss = h.tundishSkullWeight || 0;

                const color =
                  loss <= 1000
                    ? "#00e676"
                    : loss <= 3000
                      ? "#ffd60a"
                      : "#ff2d55";

                return (
                  <span style={{ color, fontWeight: 700 }}>{loss} kg</span>
                );
              },
            },
            {
              key: "tempDiff",
              label: "Temp Δ",
              render: (h) => {
                const temps = h.temperatures?.map((t) => t.temperature) || [];
                if (!temps.length) return "—";

                const diff = Math.min(...temps) - h.liquidusTemperature;

                const color =
                  diff >= 0 ? "#00e676" : diff >= -20 ? "#ffd60a" : "#ff2d55";

                return (
                  <span style={{ color, fontWeight: 700 }}>{diff} °C</span>
                );
              },
            },
            {
              key: "score",
              label: "Umumiy baho",
              render: (h) => {
                const s = getScore(h);

                return (
                  <span style={{ color: getScoreColor(s), fontWeight: 700 }}>
                    {s}
                  </span>
                );
              },
            },
            {
              key: "status",
              label: "Status",
              render: (h) => {
                const score = getScore(h);

                const color =
                  score >= 85 ? "#00e676" : score >= 65 ? "#ffd60a" : "#ff2d55";

                return (
                  <span
                    style={{ color, fontWeight: 700, cursor: "pointer" }}
                    onClick={() => {
                      setSelectedHeatAnalyze(h);
                      setOpenAnalyze(true);
                    }}
                  >
                    {score >= 85
                      ? "🟢 GOOD"
                      : score >= 65
                        ? "🟡 NORMAL"
                        : "🔴 BAD"}
                  </span>
                );
              },
            },
          ]}
        />
      </Box>
      {selectedHeatAnalyze && (
        <AnalyzeDialogTSC
          open={openAnalyze}
          onClose={() => setOpenAnalyze(false)}
          heat={selectedHeatAnalyze}
        />
      )}
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════
//  VOD STATS TAB
// ══════════════════════════════════════════════════════════════════
function VODStatsTab({ c, isDark }) {
  const {
    data: heats,
    isLoading,
    isError,
    refetch,
    isFetching,
    period,
    setPeriod,
    periodLabel,
    totalHeats,
  } = useProductionStatsWithFallback("vod", "today");

  const lastHeat = heats[heats.length - 1];
  const avgFinal = heats.length
    ? Math.round(
        heats.reduce((s, h) => s + (h.finalSteelWeight || 0), 0) / heats.length,
      )
    : 0;
  const avgVacuum = heats.length
    ? (
        heats.reduce((s, h) => s + (h.minVacuumPressure || 0), 0) / heats.length
      ).toFixed(1)
    : 0;
  const avgDeep = heats.length
    ? Math.round(
        heats.reduce((s, h) => s + (h.totalDeepVacuumTime || 0), 0) /
          heats.length,
      )
    : 0;
  const avgAr = heats.length
    ? (
        heats.reduce((s, h) => s + (h.totalArConsumption || 0), 0) /
        heats.length
      ).toFixed(1)
    : 0;
  const totalFinal = heats.reduce((s, h) => s + (h.finalSteelWeight || 0), 0);

  const tempData = (lastHeat?.temperatures || []).map((t, i) => ({
    i: i + 1,
    temp: t.temperature,
    o2: t.o2 || 0,
    carbon: t.carbon || 0,
    t: fmtT(t.dateTime),
  }));

  if (isLoading)
    return (
      <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={36} sx={{ color: c }} />
      </Box>
    );
  if (isError)
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography sx={{ fontSize: "2rem", mb: 1 }}>⚠️</Typography>
        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            fontSize: "0.75rem",
            color: "#ff2d55",
          }}
        >
          VOD API xato
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ p: { xs: 2, md: 3 } }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 10,
              height: 10,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 12px ${c}`,
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.85rem",
              color: c,
              letterSpacing: "0.15em",
            }}
          >
            VAKUUM OSTIDA TOZALASH HISOBOTI
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.4,
              background: `${c}15`,
              border: `1px solid ${c}30`,
              borderRadius: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.65rem",
                color: c,
              }}
            >
              {totalHeats} Plavka
            </Typography>
          </Box>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <PeriodSelector period={period} onChange={setPeriod} color={c} />
          <IconButton
            size="small"
            onClick={refetch}
            sx={{
              color: isFetching ? c : "#8896a5",
              animation: isFetching ? "spin 1s linear infinite" : "none",
              "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
            }}
          >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Box>

      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="🔥"
            label="Plavka soni"
            value={totalHeats}
            color="#00d4ff"
            big
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="⚖️"
            label="Jami yakuniy"
            value={fmtN(totalFinal / 1000, 1)}
            unit="t"
            color="#00e676"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="⚖️"
            label="O'rt yakuniy"
            value={fmtN(avgFinal / 1000, 2)}
            unit="t"
            color="#00e676"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="🌀"
            label="Min vakuum"
            value={avgVacuum}
            unit="mbar"
            color="#a78bfa"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="⏱️"
            label="Chuqur vak."
            value={Math.floor(avgDeep / 60)}
            unit="min"
            color="#00d4ff"
          />
        </Grid>
        <Grid item xs={6} sm={4} md={2}>
          <StatCard
            icon="💨"
            label="O'rt Ar"
            value={avgAr}
            unit="m³"
            color="#a78bfa"
          />
        </Grid>
      </Grid>

      {lastHeat && (
        <Box sx={{ mb: 4 }}>
          <SectionTitle color={c}>
            Oxirgi Plavka #{lastHeat.heatId} — {lastHeat.steelGradeName}
            <Typography
              component="span"
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.62rem",
                color: "#8896a5",
                ml: 1,
              }}
            >
              {fmtT(lastHeat.startTime)} → {fmtT(lastHeat.stopTime)} (
              {fmtDur(lastHeat.startTime, lastHeat.stopTime)})
            </Typography>
          </SectionTitle>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <Paper
                sx={{
                  p: 2,
                  border: `1px solid ${c}20`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <InfoRow
                  label="Boshlang'ich og'irlik"
                  value={`${fmtN((lastHeat.startSteelWeight || 0) / 1000, 2)} t`}
                  color="#8896a5"
                />
                <InfoRow
                  label="Yakuniy og'irlik"
                  value={`${fmtN((lastHeat.finalSteelWeight || 0) / 1000, 2)} t`}
                  color="#00e676"
                />
                <InfoRow
                  label="Yakuniy shlak"
                  value={`${fmtN((lastHeat.finalSlagWeight || 0) / 1000, 2)} t`}
                  color="#ff9500"
                />
                <Divider
                  sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.06)" }}
                />
                <InfoRow
                  label="Min vakuum bosimi"
                  value={`${fmtN(lastHeat.minVacuumPressure, 1)} mbar`}
                  color="#a78bfa"
                />
                <InfoRow
                  label="Jami pompalash"
                  value={`${Math.floor((lastHeat.totalPumpVacuumTime || 0) / 60)} min`}
                  color="#00d4ff"
                />
                <InfoRow
                  label="Chuqur vakuum"
                  value={`${Math.floor((lastHeat.totalDeepVacuumTime || 0) / 60)} min`}
                  color="#a78bfa"
                />
                <InfoRow
                  label="Purflash vaqti"
                  value={`${Math.floor((lastHeat.totalBlowTime || 0) / 60)} min`}
                  color="#ff6b1a"
                />
                <Divider
                  sx={{ my: 1.5, borderColor: "rgba(255,255,255,0.06)" }}
                />
                <InfoRow
                  label="Ar sarfi"
                  value={`${fmtN(lastHeat.totalArConsumption, 1)} m³`}
                  color="#a78bfa"
                />
                <InfoRow
                  label="N₂ sarfi"
                  value={`${fmtN(lastHeat.totalN2Consumption, 1)} m³`}
                  color="#00d4ff"
                />
                <InfoRow
                  label="Kislorod"
                  value={`${fmtN(lastHeat.totalOxygen, 0)} m³`}
                  color="#ff6b1a"
                />
                <InfoRow
                  label="Smena"
                  value={lastHeat.shift || "—"}
                  color="#8896a5"
                />
              </Paper>
            </Grid>
            <Grid item xs={12} md={8}>
              <Paper
                sx={{
                  p: 2,
                  border: `1px solid ${c}20`,
                  borderRadius: 2,
                  height: "100%",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.65rem",
                    color: "#8896a5",
                    mb: 2,
                    letterSpacing: "0.08em",
                  }}
                >
                  HARORAT DINAMIKASI
                </Typography>
                <TempChart
                  data={tempData}
                  c={c}
                  isDark={isDark}
                  extraLines={[
                    {
                      key: "o2",
                      color: "#ff6b1a",
                      name: "O₂",
                      dot: { r: 3, fill: "#ff6b1a" },
                      width: 1.5,
                    },
                    {
                      key: "carbon",
                      color: "#00ff9d",
                      name: "C%",
                      dot: { r: 2, fill: "#00ff9d" },
                      width: 1.5,
                    },
                  ]}
                />
              </Paper>
            </Grid>
          </Grid>
        </Box>
      )}

      <MaterialsBlock heat={lastHeat} c={c} />
      <ChemAnalysis heat={lastHeat} c={c} />
      <DelaysBlock heat={lastHeat} />

      <Box>
        <SectionTitle color={c}>{periodLabel} — barcha heats</SectionTitle>
        <HeatsTable
          heats={heats}
          c={c}
          isDark={isDark}
          columns={[
            {
              key: "heatId",
              label: "Plavka ID",
              bold: true,
              color: c,
              render: (h) => `#${h.heatId}`,
            },
            {
              key: "steelGradeName",
              label: "Po'lat",
              mono: true,
              color: "#c8d8e8",
            },
            {
              key: "startTime",
              label: "Boshlanish",
              mono: true,
              color: "#8896a5",
              nowrap: true,
              render: (h) => fmtT(h.startTime),
            },
            {
              key: "dur",
              label: "Davomiylik",
              mono: true,
              color: "#8896a5",
              render: (h) => fmtDur(h.startTime, h.stopTime),
            },
            {
              key: "finalSteelWeight",
              label: "Yakuniy",
              bold: true,
              color: "#00e676",
              render: (h) => `${fmtN((h.finalSteelWeight || 0) / 1000, 2)} t`,
            },
            {
              key: "minVacuumPressure",
              label: "Min vakuum",
              mono: true,
              color: "#a78bfa",
              render: (h) => `${fmtN(h.minVacuumPressure, 1)} mbar`,
            },
            {
              key: "totalDeepVacuumTime",
              label: "Chuqur vak.",
              mono: true,
              color: "#00d4ff",
              render: (h) =>
                `${Math.floor((h.totalDeepVacuumTime || 0) / 60)} min`,
            },
          ]}
        />
      </Box>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════
//  REAL HISTORY TAB — API datadan voqealar tarixi
// ══════════════════════════════════════════════════════════════════
function RealHistoryTab({ apiKey, c, isDark }) {
  const {
    data: heats,
    isLoading,
    isError,
    period,
    setPeriod,
    periodLabel,
  } = useProductionStatsWithFallback(apiKey, "today");

  if (isLoading)
    return (
      <Box sx={{ py: 8, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={36} sx={{ color: c }} />
      </Box>
    );

  if (isError)
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <Typography sx={{ fontSize: "2rem", mb: 1 }}>⚠️</Typography>
        <Typography sx={{ fontSize: "0.75rem", color: "#ff2d55" }}>
          API xato
        </Typography>
      </Box>
    );

  // Barcha voqealarni yig'ish
  const allEvents = [];

  heats.forEach((h) => {
    // Heat boshlanishi
    const startKey = h.startTime || h.ladleArrivalDate || h.ladleOpeningDate;
    if (startKey) {
      allEvents.push({
        time: new Date(startKey),
        type: "start",
        icon: "🔥",
        color: "#00e676",
        title: `Plavka #${h.heatId} boshlandi`,
        detail: `${h.steelGradeName || "—"} · ${h.practiceName || "—"}`,
        heatId: h.heatId,
      });
    }

    // Heat tugashi
    const stopKey = h.stopTime || h.ladleCloseDate;
    if (stopKey) {
      allEvents.push({
        time: new Date(stopKey),
        type: "stop",
        icon: "✅",
        color: "#00d4ff",
        title: `Plavka #${h.heatId} tugadi`,
        detail: h.finalSteelWeight
          ? `Yakuniy: ${fmtN((h.finalSteelWeight || 0) / 1000, 2)} t`
          : h.tappingWeight
            ? `Chiqarish: ${fmtN((h.tappingWeight || 0) / 1000, 2)} t`
            : "",
        heatId: h.heatId,
      });
    }

    // Harorat o'lchovlari
    (h.temperatures || []).forEach((t) => {
      allEvents.push({
        time: new Date(t.dateTime),
        type: "temp",
        icon: "🌡",
        color:
          t.temperature > 1650
            ? "#ff2d55"
            : t.temperature > 1600
              ? "#ffd60a"
              : "#00e676",
        title: `Harorat: ${t.temperature}°C`,
        detail: `O₂: ${t.o2 || "—"} · C: ${t.carbon || "—"} · Heat #${h.heatId}`,
        heatId: h.heatId,
      });
    });

    // Kechikishlar
    (h.delays || []).forEach((d) => {
      const info = getDelayInfo(d.delayOperation);
      const dur = getDurMinutes(d.startTime, d.stopTime);
      allEvents.push({
        time: new Date(d.startTime),
        type: "delay",
        icon: info.icon,
        color: info.color,
        title: `${info.label} — ${dur} min`,
        detail: d.delayReason || info.desc,
        heatId: h.heatId,
        critical: info.type === "critical" || dur > 15,
      });
    });

    // EAF Events
    (h.eafEvents || []).forEach((e) => {
      allEvents.push({
        time: new Date(e.eventDate),
        type: "event",
        icon: "⚡",
        color: "#ffd60a",
        title: `EAF: ${e.eventCode}`,
        detail: `Heat #${h.heatId}`,
        heatId: h.heatId,
      });
    });

    // LRF Events
    (h.lrfEvents || []).forEach((e) => {
      allEvents.push({
        time: new Date(e.eventDate),
        type: "event",
        icon: "⚗️",
        color: "#a78bfa",
        title: `LRF: ${e.eventCode}`,
        detail: `Heat #${h.heatId}`,
        heatId: h.heatId,
      });
    });

    // VOD Events
    (h.vodEvents || []).forEach((e) => {
      allEvents.push({
        time: new Date(e.eventDate),
        type: "event",
        icon: "🌀",
        color: "#00d4ff",
        title: `VOD: ${e.eventCode}`,
        detail: `Heat #${h.heatId}`,
        heatId: h.heatId,
      });
    });

    // TSC Events
    (h.tscEvents || []).forEach((e) => {
      allEvents.push({
        time: new Date(e.eventDate),
        type: "event",
        icon: "🧊",
        color: "#00e676",
        title: `TSC: ${e.eventCode}`,
        detail: `Heat #${h.heatId}`,
        heatId: h.heatId,
      });
    });

    // Material qo'shilishlari
    (h.materialAdditions || h.ladleAdditions || []).forEach((m) => {
      if (m.additionDate) {
        allEvents.push({
          time: new Date(m.additionDate),
          type: "material",
          icon: "📦",
          color: "#ff9500",
          title: `Material: ${m.materialCode}`,
          detail: `${fmtN(m.materialWgt, 0)} kg · Heat #${h.heatId}`,
          heatId: h.heatId,
        });
      }
    });

    // Scrap bucket
    (h.scrapBuckets || []).forEach((b) => {
      if (b.dischargeTime) {
        const totalWgt = (b.bucketCharges || []).reduce(
          (s, ch) => s + (ch.materialWgt || 0),
          0,
        );
        allEvents.push({
          time: new Date(b.dischargeTime),
          type: "scrap",
          icon: "🏗️",
          color: "#ff6b1a",
          title: `Savat #${b.bucketSequence} tushirildi`,
          detail: `${fmtN(totalWgt / 1000, 1)} t · ${(b.bucketCharges || []).length} qatlam · Heat #${h.heatId}`,
          heatId: h.heatId,
        });
      }
    });

    // Kimyoviy tahlillar
    (h.steelAnalysis || []).forEach((a) => {
      if (a.sampleTime) {
        allEvents.push({
          time: new Date(a.sampleTime),
          type: "analysis",
          icon: "🔬",
          color: "#a78bfa",
          title: `Kimyoviy tahlil: ${a.sampleId}`,
          detail: `${(a.chemicalAnalysis || []).length} element · Heat #${h.heatId}`,
          heatId: h.heatId,
        });
      }
    });
  });

  // Vaqt bo'yicha tartiblash (eng yangi tepada)
  allEvents.sort((a, b) => b.time - a.time);

  // Filtrlash uchun event turlari
  const EVENT_TYPES = [
    { key: "all", label: "Barchasi", color: c },
    { key: "start", label: "Boshlanish", color: "#00e676" },
    { key: "stop", label: "Tugash", color: "#00d4ff" },
    { key: "temp", label: "Harorat", color: "#ff6b1a" },
    { key: "delay", label: "Kechikish", color: "#ffd60a" },
    { key: "event", label: "Voqealar", color: "#a78bfa" },
    { key: "material", label: "Materiallar", color: "#ff9500" },
    { key: "scrap", label: "Savat", color: "#ff6b1a" },
    { key: "analysis", label: "Tahlil", color: "#a78bfa" },
  ];

  const [filterType, setFilterType] = useState("all");

  const filtered =
    filterType === "all"
      ? allEvents
      : allEvents.filter((e) => e.type === filterType);

  // Harorat dinamikasi grafik datasi
  const tempChartData = allEvents
    .filter((e) => e.type === "temp")
    .reverse()
    .map((e, i) => ({
      i: i + 1,
      temp: parseInt(e.title.match(/(\d+)/)?.[1]) || 0,
      t: e.time.toLocaleTimeString("uz-UZ", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

  // Kechikishlar statistikasi
  const delayEvents = allEvents.filter((e) => e.type === "delay");
  const totalDelayCount = delayEvents.length;
  const criticalDelays = delayEvents.filter((e) => e.critical).length;

  return (
    <Box sx={{ maxWidth: 900 }}>
      {/* Sarlavha */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 3,
          flexWrap: "wrap",
          gap: 1.5,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Box
            sx={{
              width: 3,
              height: 20,
              background: c,
              borderRadius: 2,
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.72rem",
              color: c,
              letterSpacing: "0.12em",
            }}
          >
            REAL VAQT TARIXI
          </Typography>
          <Box
            sx={{
              px: 1.5,
              py: 0.4,
              background: `${c}15`,
              border: `1px solid ${c}30`,
              borderRadius: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.62rem",
                color: c,
              }}
            >
              {filtered.length} voqea
            </Typography>
          </Box>
        </Box>
        <PeriodSelector period={period} onChange={setPeriod} color={c} />
      </Box>

      {/* Statistika xulosa */}
      <Grid container spacing={1.5} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon="🔥"
            label="Plavkalar"
            value={heats.length}
            color="#00d4ff"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon="📋"
            label="Voqealar"
            value={allEvents.length}
            color="#00e676"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon="⏸️"
            label="Kechikishlar"
            value={totalDelayCount}
            color="#ffd60a"
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <StatCard
            icon="🚨"
            label="Kritik"
            value={criticalDelays}
            color="#ff2d55"
          />
        </Grid>
      </Grid>

      {/* Harorat mini-grafik */}
      {tempChartData.length > 0 && (
        <Paper
          sx={{
            p: 2,
            mb: 3,
            border: `1px solid ${c}20`,
            borderRadius: 2,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.65rem",
              color: "#8896a5",
              mb: 1.5,
              letterSpacing: "0.08em",
            }}
          >
            HARORAT TARIXI
          </Typography>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart
              data={tempChartData}
              margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
            >
              <defs>
                <linearGradient id="tempGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={c} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#1a2235" : "#e5e7eb"}
              />
              <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#8896a5" }} />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 10, fill: "#8896a5" }}
              />
              <RTooltip
                contentStyle={{
                  background: "#0a0f1e",
                  border: `1px solid ${c}50`,
                  borderRadius: 8,
                  fontSize: 12,
                }}
                formatter={(v) => [`${v}°C`, "Harorat"]}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke={c}
                fill="url(#tempGrad)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </Paper>
      )}

      {/* Filtrlar */}
      <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8, mb: 2.5 }}>
        {EVENT_TYPES.map((t) => {
          const count =
            t.key === "all"
              ? allEvents.length
              : allEvents.filter((e) => e.type === t.key).length;
          if (count === 0 && t.key !== "all") return null;
          return (
            <Chip
              key={t.key}
              label={`${t.label} (${count})`}
              size="small"
              onClick={() => setFilterType(t.key)}
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.6rem",
                bgcolor: filterType === t.key ? `${t.color}25` : "transparent",
                color: filterType === t.key ? t.color : "#8896a5",
                border: `1px solid ${filterType === t.key ? t.color : "rgba(255,255,255,0.08)"}`,
                cursor: "pointer",
                "&:hover": {
                  bgcolor: `${t.color}15`,
                  color: t.color,
                },
              }}
            />
          );
        })}
      </Box>

      {/* Voqealar ro'yxati */}
      <Paper
        sx={{
          border: `1px solid ${c}15`,
          borderRadius: 2,
          overflow: "hidden",
        }}
      >
        {filtered.length === 0 ? (
          <Box sx={{ py: 4, textAlign: "center" }}>
            <Typography sx={{ fontSize: "0.72rem", color: "#8896a5" }}>
              Voqealar topilmadi
            </Typography>
          </Box>
        ) : (
          filtered.slice(0, 100).map((ev, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 2,
                px: 2,
                py: 1.4,
                borderBottom:
                  i < Math.min(filtered.length, 100) - 1
                    ? "1px solid rgba(255,255,255,0.04)"
                    : 0,
                background: ev.critical ? `${ev.color}06` : "transparent",
                "&:hover": { background: `${ev.color}08` },
                transition: "background 0.15s",
              }}
            >
              {/* Rang chizig'i */}
              <Box
                sx={{
                  width: 3,
                  alignSelf: "stretch",
                  background: ev.color,
                  borderRadius: 2,
                  flexShrink: 0,
                  minHeight: 36,
                }}
              />

              {/* Icon */}
              <Typography sx={{ fontSize: "0.95rem", flexShrink: 0, mt: 0.1 }}>
                {ev.icon}
              </Typography>

              {/* Ma'lumot */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 0.2,
                    flexWrap: "wrap",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Arial',san-serif",
                      fontSize: "0.72rem",
                      fontWeight: 600,
                      color: ev.color,
                    }}
                  >
                    {ev.title}
                  </Typography>
                  {ev.critical && (
                    <Box
                      sx={{
                        px: 0.8,
                        py: 0.1,
                        background: "#ff2d5520",
                        border: "1px solid #ff2d5540",
                        borderRadius: 0.8,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Arial',san-serif",
                          fontSize: "0.5rem",
                          color: "#ff2d55",
                        }}
                      >
                        KRITIK
                      </Typography>
                    </Box>
                  )}
                </Box>
                {ev.detail && (
                  <Typography
                    sx={{
                      fontFamily: "'Arial',san-serif",
                      fontSize: "0.62rem",
                      color: "#8896a5",
                    }}
                  >
                    {ev.detail}
                  </Typography>
                )}
              </Box>

              {/* Vaqt */}
              <Box sx={{ textAlign: "right", flexShrink: 0 }}>
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.65rem",
                    color: "#c8d8e8",
                    fontWeight: 600,
                  }}
                >
                  {ev.time.toLocaleTimeString("uz-UZ", {
                    hour: "2-digit",
                    minute: "2-digit",
                    second: "2-digit",
                  })}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.55rem",
                    color: "#6b7280",
                    mt: 0.2,
                  }}
                >
                  {ev.time.toLocaleDateString("uz-UZ", {
                    month: "2-digit",
                    day: "2-digit",
                  })}
                </Typography>
              </Box>
            </Box>
          ))
        )}
        {filtered.length > 100 && (
          <Box
            sx={{
              py: 1.5,
              textAlign: "center",
              background: "rgba(0,0,0,0.2)",
            }}
          >
            <Typography sx={{ fontSize: "0.62rem", color: "#6b7280" }}>
              Yana {filtered.length - 100} ta voqea...
            </Typography>
          </Box>
        )}
      </Paper>
    </Box>
  );
}

const CAMERA_FEED = {
  id: "cam-eaf-1",
  name: "EAF — Asosiy ko'rinish",
  location: "Eritish pechi yuqoridan",
  status: "online",
  icon: "🔥",
};

function CamerasTab({ c, isDark }) {
  const [selectedCam, setSelectedCam] = useState(null);

  const cam = CAMERA_FEED;
  const isOnline = cam.status === "online";

  return (
    <Box sx={{ maxWidth: 1200 }}>
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          mb: 3,
          flexWrap: "wrap",
        }}
      >
        <Box
          sx={{
            width: 4,
            height: 22,
            background: c,
            borderRadius: 3,
            boxShadow: `0 0 16px ${c}55`,
          }}
        />

        <Typography
          sx={{
            fontFamily: "'Arial', sans-serif",
            fontSize: "0.78rem",
            fontWeight: 700,
            color: c,
            letterSpacing: "0.14em",
          }}
        >
          KAMERA MONITORING
        </Typography>

        <Box
          sx={{
            px: 1.6,
            py: 0.45,
            background: `${isOnline ? "#00e676" : "#ff2d55"}15`,
            border: `1px solid ${isOnline ? "#00e676" : "#ff2d55"}35`,
            borderRadius: 999,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Arial', sans-serif",
              fontSize: "0.62rem",
              fontWeight: 700,
              color: isOnline ? "#00e676" : "#ff2d55",
              letterSpacing: "0.05em",
            }}
          >
            {isOnline ? "1 TA FAOL KAMERA" : "KAMERA O‘CHIQ"}
          </Typography>
        </Box>
      </Box>

      {/* Single Camera Card */}
      <Paper
        onClick={() => setSelectedCam(cam)}
        sx={{
          overflow: "hidden",
          borderRadius: 4,
          cursor: "pointer",
          border: `1px solid ${isOnline ? c : "#ff2d55"}25`,
          background: isDark
            ? "linear-gradient(180deg, rgba(10,15,30,0.96) 0%, rgba(16,22,40,0.98) 100%)"
            : "linear-gradient(180deg, rgba(255,255,255,0.96) 0%, rgba(248,250,252,0.98) 100%)",
          boxShadow: isDark
            ? "0 20px 50px rgba(0,0,0,0.35)"
            : "0 20px 50px rgba(15,23,42,0.08)",
          transition: "all 0.25s ease",
          "&:hover": {
            transform: "translateY(-4px)",
            borderColor: isOnline ? c : "#ff2d55",
            boxShadow: `0 24px 60px ${isOnline ? c : "#ff2d55"}18`,
          },
        }}
      >
        {/* Camera Preview Area */}
        <Box
          sx={{
            position: "relative",
            height: { xs: 280, sm: 360, md: 460 },
            background: isDark
              ? "linear-gradient(135deg, #09111f 0%, #0f172a 45%, #172033 100%)"
              : "linear-gradient(135deg, #e2e8f0 0%, #f8fafc 45%, #dbe4f0 100%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "hidden",
          }}
        >
          {/* Background effect */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              background: isDark
                ? "radial-gradient(circle at 20% 20%, rgba(0,212,255,0.10), transparent 35%), radial-gradient(circle at 80% 30%, rgba(0,230,118,0.08), transparent 30%)"
                : "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.10), transparent 35%), radial-gradient(circle at 80% 30%, rgba(16,185,129,0.08), transparent 30%)",
            }}
          />

          {/* Center Icon / Placeholder */}
          <Box
            sx={{
              position: "relative",
              zIndex: 2,
              textAlign: "center",
            }}
          >
            <Typography
              sx={{
                fontSize: { xs: "4rem", sm: "5rem", md: "6rem" },
                opacity: isDark ? 0.22 : 0.28,
                mb: 1,
                filter: "drop-shadow(0 8px 20px rgba(0,0,0,0.18))",
              }}
            >
              {cam.icon}
            </Typography>

            <Typography
              sx={{
                fontFamily: "'Arial', sans-serif",
                fontSize: { xs: "0.8rem", sm: "0.9rem" },
                fontWeight: 700,
                color: isDark
                  ? "rgba(255,255,255,0.82)"
                  : "rgba(15,23,42,0.72)",
                mb: 0.5,
              }}
            >
              {isOnline
                ? "Jonli kamera oqimi shu yerda chiqadi"
                : "Kamera hozir faol emas"}
            </Typography>

            <Typography
              sx={{
                fontFamily: "'Arial', sans-serif",
                fontSize: "0.68rem",
                color: isDark ? "#94a3b8" : "#64748b",
              }}
            >
              RTSP / HLS / WebRTC ulansa preview shu blokda ko‘rinadi
            </Typography>
          </Box>

          {/* Top left REC */}
          {isOnline && (
            <Box
              sx={{
                position: "absolute",
                top: 16,
                left: 16,
                display: "flex",
                alignItems: "center",
                gap: 0.8,
                px: 1.2,
                py: 0.6,
                borderRadius: 999,
                background: "rgba(15,23,42,0.65)",
                backdropFilter: "blur(10px)",
                border: "1px solid rgba(255,255,255,0.08)",
                zIndex: 3,
              }}
            >
              <Box
                sx={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "#ff2d55",
                  animation: "pulseRec 1.4s infinite",
                  "@keyframes pulseRec": {
                    "0%,100%": { opacity: 1, transform: "scale(1)" },
                    "50%": { opacity: 0.45, transform: "scale(0.8)" },
                  },
                }}
              />
              <Typography
                sx={{
                  fontFamily: "'Arial', sans-serif",
                  fontSize: "0.62rem",
                  fontWeight: 800,
                  color: "#ff5a76",
                  letterSpacing: "0.08em",
                }}
              >
                LIVE REC
              </Typography>
            </Box>
          )}

          {/* Top right status */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              display: "flex",
              alignItems: "center",
              gap: 0.7,
              px: 1.2,
              py: 0.6,
              borderRadius: 999,
              background: isOnline
                ? "rgba(0,230,118,0.12)"
                : "rgba(255,45,85,0.12)",
              border: `1px solid ${isOnline ? "#00e676" : "#ff2d55"}40`,
              backdropFilter: "blur(10px)",
              zIndex: 3,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: isOnline ? "#00e676" : "#ff2d55",
                boxShadow: `0 0 10px ${isOnline ? "#00e676" : "#ff2d55"}`,
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Arial', sans-serif",
                fontSize: "0.62rem",
                fontWeight: 700,
                color: isOnline ? "#00e676" : "#ff2d55",
                letterSpacing: "0.04em",
              }}
            >
              {isOnline ? "ONLINE" : "OFFLINE"}
            </Typography>
          </Box>

          {/* Bottom time */}
          <Typography
            sx={{
              position: "absolute",
              bottom: 16,
              right: 16,
              fontFamily: "'Arial', sans-serif",
              fontSize: "0.66rem",
              color: "#e2e8f0",
              background: "rgba(15,23,42,0.72)",
              px: 1.1,
              py: 0.5,
              borderRadius: 999,
              backdropFilter: "blur(8px)",
              zIndex: 3,
            }}
          >
            {new Date().toLocaleTimeString("uz-UZ", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </Typography>
        </Box>

        {/* Info area */}
        <Box
          sx={{
            p: { xs: 2, sm: 2.5 },
            display: "flex",
            alignItems: { xs: "flex-start", md: "center" },
            justifyContent: "space-between",
            flexDirection: { xs: "column", md: "row" },
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: "'Arial', sans-serif",
                fontSize: { xs: "1rem", sm: "1.08rem" },
                fontWeight: 800,
                color: "text.primary",
                mb: 0.5,
              }}
            >
              {cam.name}
            </Typography>

            <Typography
              sx={{
                fontFamily: "'Arial', sans-serif",
                fontSize: "0.78rem",
                color: "text.secondary",
                mb: 1.2,
              }}
            >
              {cam.location}
            </Typography>

            <Box
              sx={{
                display: "flex",
                flexWrap: "wrap",
                gap: 1,
              }}
            >
              <Box
                sx={{
                  px: 1.2,
                  py: 0.55,
                  borderRadius: 999,
                  background: isDark ? "rgba(255,255,255,0.04)" : "#f1f5f9",
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{ fontSize: "0.66rem", color: "text.secondary" }}
                >
                  ID: {cam.id}
                </Typography>
              </Box>

              <Box
                sx={{
                  px: 1.2,
                  py: 0.55,
                  borderRadius: 999,
                  background: `${c}12`,
                  border: `1px solid ${c}25`,
                }}
              >
                <Typography sx={{ fontSize: "0.66rem", color: c }}>
                  Asosiy kuzatuv kamerasi
                </Typography>
              </Box>
            </Box>
          </Box>

          <Button
            variant="contained"
            onClick={(e) => {
              e.stopPropagation();
              setSelectedCam(cam);
            }}
            sx={{
              minWidth: 180,
              borderRadius: 999,
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              background: `linear-gradient(135deg, ${c} 0%, ${c}cc 100%)`,
              "&:hover": {
                boxShadow: `0 12px 30px ${c}35`,
              },
            }}
          >
            Katta ko‘rishda ochish
          </Button>
        </Box>
      </Paper>

      {/* Dialog */}
      <Dialog
        open={!!selectedCam}
        onClose={() => setSelectedCam(null)}
        maxWidth="lg"
        fullWidth
      >
        {selectedCam && (
          <>
            <DialogTitle
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 2,
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Typography sx={{ fontSize: "1.4rem" }}>
                  {selectedCam.icon}
                </Typography>
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "'Arial', sans-serif",
                      fontSize: "0.95rem",
                      fontWeight: 700,
                    }}
                  >
                    {selectedCam.name}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Arial', sans-serif",
                      fontSize: "0.7rem",
                      color: "text.secondary",
                    }}
                  >
                    {selectedCam.location}
                  </Typography>
                </Box>
              </Box>

              <IconButton onClick={() => setSelectedCam(null)} size="small">
                <CloseIcon />
              </IconButton>
            </DialogTitle>

            <DialogContent sx={{ pb: 3 }}>
              <Box
                sx={{
                  height: { xs: 320, sm: 420, md: 560 },
                  borderRadius: 3,
                  position: "relative",
                  overflow: "hidden",
                  background: isDark
                    ? "linear-gradient(135deg, #09111f 0%, #10192d 50%, #172033 100%)"
                    : "linear-gradient(135deg, #e2e8f0 0%, #f8fafc 50%, #dbe4f0 100%)",
                  border: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                <VideocamOutlinedIcon
                  sx={{
                    fontSize: 64,
                    color: isDark ? "#64748b" : "#475569",
                  }}
                />

                <Typography
                  sx={{
                    fontFamily: "'Arial', sans-serif",
                    fontSize: "0.9rem",
                    fontWeight: 700,
                    color: "text.primary",
                  }}
                >
                  {selectedCam.status === "online"
                    ? "Jonli oqim oynasi"
                    : "Kamera hozir ishlamayapti"}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: "'Arial', sans-serif",
                    fontSize: "0.72rem",
                    color: "text.secondary",
                    textAlign: "center",
                    maxWidth: 520,
                  }}
                >
                  Bu joyga sen keyin `img`, `video`, `iframe`, `ReactPlayer`,
                  HLS yoki WebRTC stream ulab qo‘yasan.
                </Typography>

                <Box
                  sx={{
                    mt: 1,
                    px: 1.4,
                    py: 0.7,
                    borderRadius: 999,
                    background: `${c}12`,
                    border: `1px solid ${c}30`,
                  }}
                >
                  <Typography sx={{ fontSize: "0.66rem", color: c }}>
                    {selectedCam.id}
                  </Typography>
                </Box>
              </Box>
            </DialogContent>
          </>
        )}
      </Dialog>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════
//  SXEMA USTIDAGI LIVE METRIKALAR (harorat + suyuq metall)
// ══════════════════════════════════════════════════════════════════
// ══════════════════════════════════════════════════════════════════
//  REAL DATA SXEMA WRAPPER — uskuna objectni real API datasi bilan boyitadi
//  Natijada UskunaImageView chap/o'ng panellari real ko'rsatadi
// ══════════════════════════════════════════════════════════════════
function RealDataSxemaWrapper({ uskuna, apiKey, c, isDark }) {
  // ═══ API ga tegishli bo'lmagan uskuna — statik/fake data bilan ko'rsatish ═══
  if (!apiKey) {
    return <UskunaImageView uskuna={uskuna} />;
  }

  return (
    <RealDataSxemaInner uskuna={uskuna} apiKey={apiKey} c={c} isDark={isDark} />
  );
}

function RealDataSxemaInner({ uskuna, apiKey, c, isDark }) {
  const {
    data: heats,
    isLoading,
    isFetching,
    refetch,
    period,
    setPeriod,
    periodLabel,
  } = useProductionStatsWithFallback(apiKey, "today");

  const [selectedHeatId, setSelectedHeatId] = useState(null);

  // ── Real data extraction ────────────────────────────────────
  const latest = heats?.length
    ? heats.find((h) => h.heatId === selectedHeatId) || heats[heats.length - 1]
    : null;

  const temps = latest?.temperatures || [];
  const lastTemp = temps.length ? temps[temps.length - 1].temperature : 0;
  const lastO2 = temps.length ? temps[temps.length - 1].o2 : null;
  const lastCarbon = temps.length ? temps[temps.length - 1].carbon : null;

  // ── Energiya / Quvvat ─────────────────────────────────────
  const energy = latest?.electricalEnergy || 0;
  const avgPower = latest?.averagePower || 0;
  const powerOnTime = latest?.powerOnTime || 0;
  const powerKW =
    avgPower > 0 ? Math.round(avgPower / 1000) : uskuna.quvvat || 0;

  // ── Samaradorlik hisoblash (real) ─────────────────────────
  let realSamaradorlik = uskuna.samaradorlik || 0;
  if (heats?.length) {
    if (apiKey === "eaf") {
      // Yield asosida
      const totalInput = heats.reduce(
        (s, h) => s + (h.totalScrap || 0) + (h.totalHBI || 0),
        0,
      );
      const totalOutput = heats.reduce((s, h) => s + (h.tappingWeight || 0), 0);
      realSamaradorlik =
        totalInput > 0
          ? Math.round((totalOutput / totalInput) * 100)
          : uskuna.samaradorlik || 0;
    } else if (apiKey === "lrf" || apiKey === "vod") {
      // Kechikishlardan hisoblash
      const totalDelays = heats.reduce(
        (s, h) => s + (h.delays?.length || 0),
        0,
      );
      realSamaradorlik = Math.max(0, Math.min(100, 100 - totalDelays * 5));
    } else if (apiKey === "tsc") {
      // Chiqarish hajmiga qarab
      const totalProd = heats.reduce(
        (s, h) =>
          s +
          (h.tscProducts || []).reduce(
            (ps, p) => ps + (p.productWeight || 0),
            0,
          ),
        0,
      );
      realSamaradorlik = Math.min(
        100,
        Math.round((totalProd / 1000 / Math.max(1, heats.length * 100)) * 100),
      );
    }
  }

  // ── KIO (Ko'rsatkich ishonchliligi) ───────────────────────
  let realKIO = 100;
  if (heats?.length) {
    const totalDelayMin = heats.reduce((s, h) => {
      return (
        s +
        (h.delays || []).reduce(
          (ds, d) => ds + getDurMinutes(d.startTime, d.stopTime),
          0,
        )
      );
    }, 0);
    // Ish vaqtini hisoblash
    const totalWorkMin = heats.reduce((s, h) => {
      const start = h.startTime || h.ladleOpeningDate || h.ladleArrivalDate;
      const stop = h.stopTime || h.ladleCloseDate;
      if (start && stop) {
        return s + Math.round((new Date(stop) - new Date(start)) / 60000);
      }
      return s;
    }, 0);
    realKIO =
      totalWorkMin > 0
        ? Math.round(((totalWorkMin - totalDelayMin) / totalWorkMin) * 1000) /
          10
        : 100;
    realKIO = Math.max(0, Math.min(100, realKIO));
  }

  // ── Real ish vaqti (bugungi plavkalar davomiyligi) ────────
  const totalWorkHours = heats?.length
    ? heats.reduce((s, h) => {
        const start = h.startTime || h.ladleOpeningDate;
        const stop = h.stopTime || h.ladleCloseDate;
        if (start && stop) {
          return s + (new Date(stop) - new Date(start)) / 3600000;
        }
        return s;
      }, 0)
    : 0;

  const totalProstoy = heats?.length
    ? heats.reduce((s, h) => {
        return (
          s +
          (h.delays || []).reduce(
            (ds, d) => ds + getDurMinutes(d.startTime, d.stopTime),
            0,
          ) /
            60
        );
      }, 0)
    : 0;

  // ── Uskuna objectini real data bilan boyitish ─────────────
  const enrichedUskuna = useMemo(() => {
    if (!latest) return uskuna;
    return {
      ...uskuna,
      harorat: lastTemp > 0 ? lastTemp : uskuna.harorat,
      quvvat: powerKW > 0 ? powerKW : uskuna.quvvat,
      samaradorlik: realSamaradorlik,
      kio: realKIO,
      ishVaqti:
        totalWorkHours > 0 ? totalWorkHours.toFixed(1) : uskuna.ishVaqti,
      prostoy: totalProstoy.toFixed(1),
      // EAF specific
      electricalEnergy: energy,
      averagePower: latest?.averagePower || 0,
      injectedO2: latest?.injectedO2,
      injectedCarbon: latest?.injectedCarbon,
      injectedFuel: latest?.injectedFuel,
      tappingWeight: latest?.tappingWeight,
      totalScrap: latest?.totalScrap,
      totalHBI: latest?.totalHBI,
      startHotHeel: latest?.startHotHeel,
      // LRF specific
      totalArConsumption: latest?.totalArConsumption,
      totalN2Consumption: latest?.totalN2Consumption,
      // VOD specific
      minVacuumPressure: latest?.minVacuumPressure,
      totalDeepVacuumTime: latest?.totalDeepVacuumTime,
      // TSC specific
      avgCastSpeed:
        (latest?.tscStrands || []).length > 0
          ? (
              (latest.tscStrands || []).reduce(
                (s, st) => s + (st.castSpeedAvg || 0),
                0,
              ) / latest.tscStrands.length
            ).toFixed(2)
          : null,
      // Oxirgi heat info
      _latestHeat: latest,
      _heatsCount: heats?.length || 0,
      _apiKey: apiKey,
      // Temperature history uchun
      _temperatures: temps,
      _lastO2: lastO2,
      _lastCarbon: lastCarbon,
    };
  }, [
    uskuna,
    latest,
    lastTemp,
    powerKW,
    realSamaradorlik,
    realKIO,
    totalWorkHours,
    totalProstoy,
    energy,
    temps,
    lastO2,
    lastCarbon,
    heats?.length,
    apiKey,
  ]);

  return (
    <Box>
      {/* UskunaImageView — boyitilgan uskuna bilan (ichida real data overlaylar bor) */}
      <UskunaImageView uskuna={enrichedUskuna} />

      {/* SxemaLiveOverlay — batafsil dashboard pastda */}
      <SxemaLiveOverlay apiKey={apiKey} c={c} isDark={isDark} />
    </Box>
  );
}

function SxemaLiveOverlay({ apiKey, c, isDark }) {
  const {
    data: heats,
    isLoading,
    isFetching,
    refetch,
    period,
    setPeriod,
    periodLabel,
  } = useProductionStatsWithFallback(apiKey, "today");

  const [selectedHeatId, setSelectedHeatId] = useState(null);

  if (isLoading)
    return (
      <Box sx={{ py: 4, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={28} sx={{ color: c }} />
      </Box>
    );

  if (!heats?.length)
    return (
      <Box sx={{ py: 3, textAlign: "center" }}>
        <Typography sx={{ fontSize: "0.7rem", color: "#6b7280" }}>
          Hozircha plavka ma'lumoti yo'q
        </Typography>
      </Box>
    );

  const latest =
    heats.find((h) => h.heatId === selectedHeatId) || heats[heats.length - 1];

  // ── Harorat ────────────────────────────────────────────────
  const temps = latest?.temperatures || [];
  const lastTemp = temps.length ? temps[temps.length - 1].temperature : 0;
  const lastO2 = temps.length ? temps[temps.length - 1].o2 : null;
  const lastCarbon = temps.length ? temps[temps.length - 1].carbon : null;
  const tempColor =
    lastTemp > 1680
      ? "#ff2d55"
      : lastTemp > 1620
        ? "#ffd60a"
        : lastTemp > 0
          ? "#00e676"
          : "#6b7280";

  const tempChartData = temps.map((t, i) => ({
    i: i + 1,
    temp: t.temperature,
    o2: t.o2 || null,
    carbon: t.carbon ? t.carbon * 100 : null,
    t: new Date(t.dateTime).toLocaleTimeString("uz-UZ", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  }));

  // ── Suyuq metall ──────────────────────────────────────────
  const liquidMetal =
    (latest?.tappingWeight || latest?.finalSteelWeight || 0) / 1000;
  const startWeight =
    (latest?.startSteelWeight || latest?.totalScrap || 0) / 1000;
  const slagWeight =
    (latest?.finalSlagWeight || latest?.startSlagWeight || 0) / 1000;
  const liquidPercent = Math.min(100, Math.max(0, (liquidMetal / 140) * 100));

  // ── Heat davomiyligi ──────────────────────────────────────
  const heatStart =
    latest?.startTime || latest?.ladleArrivalDate || latest?.ladleOpeningDate;
  const heatStop = latest?.stopTime || latest?.ladleCloseDate;
  const durationMin =
    heatStart && heatStop
      ? Math.round((new Date(heatStop) - new Date(heatStart)) / 60000)
      : 0;
  const isLive = heatStart && !heatStop;

  // ── Energiya ──────────────────────────────────────────────
  const energy = latest?.electricalEnergy || 0;
  const powerOnTime = latest?.powerOnTime || 0;
  const avgPower = latest?.averagePower || 0;

  // ── EAF-specific ──────────────────────────────────────────
  const injectedO2 = latest?.injectedO2 || 0;
  const injectedCarbon = latest?.injectedCarbon || 0;
  const injectedFuel = latest?.injectedFuel || 0;
  const totalScrap = latest?.totalScrap || 0;
  const totalHBI = latest?.totalHBI || 0;
  const hotHeel = latest?.startHotHeel || 0;

  // ── LRF-specific ──────────────────────────────────────────
  const totalAr = latest?.totalArConsumption || 0;
  const totalN2 = latest?.totalN2Consumption || 0;

  // ── VOD-specific ──────────────────────────────────────────
  const minVacuum = latest?.minVacuumPressure || 0;
  const deepVacuumTime = latest?.totalDeepVacuumTime || 0;
  const pumpVacuumTime = latest?.totalPumpVacuumTime || 0;
  const blowTime = latest?.totalBlowTime || 0;
  const totalOxygen = latest?.totalOxygen || 0;

  // ── TSC-specific ──────────────────────────────────────────
  const strands = latest?.tscStrands || [];
  const products = latest?.tscProducts || [];
  const avgCastSpeed = strands.length
    ? (
        strands.reduce((s, st) => s + (st.castSpeedAvg || 0), 0) /
        strands.length
      ).toFixed(2)
    : 0;
  const tundishId = latest?.tundishId || null;
  const tundishLife = latest?.tundishLife || 0;
  const liquidusTemp = latest?.liquidusTemperature || 0;

  // ── Kechikishlar xulosa ───────────────────────────────────
  const delays = latest?.delays || [];
  const totalDelayMin = delays.reduce(
    (s, d) => s + getDurMinutes(d.startTime, d.stopTime),
    0,
  );

  // ── Kimyoviy tarkib ───────────────────────────────────────
  const lastAnalysis = latest?.steelAnalysis?.length
    ? latest.steelAnalysis[latest.steelAnalysis.length - 1]
    : null;

  // ── Materiallar ───────────────────────────────────────────
  const materials = latest?.materialAdditions || latest?.ladleAdditions || [];
  const materialGrouped = materials.reduce((acc, m) => {
    acc[m.materialCode] = (acc[m.materialCode] || 0) + (m.materialWgt || 0);
    return acc;
  }, {});

  // ── Scrap bucketlar (EAF) ─────────────────────────────────
  const buckets = latest?.scrapBuckets || [];

  // ── Energiya trendi (barcha heats) ────────────────────────
  const energyTrend = heats.map((h, i) => ({
    i: i + 1,
    heatId: h.heatId,
    energy: (h.electricalEnergy || 0) / 1000,
    output: (h.tappingWeight || h.finalSteelWeight || 0) / 1000,
  }));

  // ── Samaradorlik (EAF) ────────────────────────────────────
  const yieldVal =
    totalScrap + totalHBI > 0
      ? ((latest?.tappingWeight || 0) / (totalScrap + totalHBI)) * 100
      : 0;
  const yieldColor =
    yieldVal > 90 ? "#00e676" : yieldVal > 80 ? "#ffd60a" : "#ff2d55";

  // ── API nomi ──────────────────────────────────────────────
  const API_NAMES = {
    eaf: "ELEKTRDA ERITISH PECHI",
    lrf: "KOVSH TOZALASH PECHI",
    vod: "VAKUUM OSTIDA TOZALASH",
    tsc: "UZLUKSIZ QUYISH MASHINASI",
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* ═══ STATUS BAR ═══ */}
      <Paper
        sx={{
          p: 1.5,
          mb: 2,
          border: `1px solid ${c}25`,
          borderRadius: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
          background: isDark
            ? `linear-gradient(135deg, ${c}08 0%, transparent 100%)`
            : `linear-gradient(135deg, ${c}05 0%, transparent 100%)`,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: isLive ? "#00e676" : c,
              boxShadow: isLive ? "0 0 8px #00e676" : `0 0 6px ${c}`,
              animation: isLive ? "pulse 1.5s infinite" : "none",
              "@keyframes pulse": {
                "0%,100%": { opacity: 1 },
                "50%": { opacity: 0.4 },
              },
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.65rem",
              color: c,
              fontWeight: 700,
              letterSpacing: "0.1em",
            }}
          >
            {API_NAMES[apiKey] || "USKUNA"}
          </Typography>
          <Chip
            label={isLive ? "JARAYONDA" : "TUGAGAN"}
            size="small"
            sx={{
              height: 18,
              fontSize: "0.5rem",
              fontFamily: "'Arial',san-serif",
              bgcolor: isLive ? "#00e67620" : `${c}15`,
              color: isLive ? "#00e676" : "#8896a5",
              border: `1px solid ${isLive ? "#00e67640" : `${c}30`}`,
            }}
          />
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <HeatSelector
            heats={heats}
            selectedId={selectedHeatId ?? latest?.heatId}
            onChange={(id) => setSelectedHeatId(Number(id))}
            color={c}
          />
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.58rem",
              color: "#8896a5",
            }}
          >
            {fmtT(heatStart)} → {heatStop ? fmtT(heatStop) : "..."} ·{" "}
            {durationMin > 0
              ? `${Math.floor(durationMin / 60)}s ${durationMin % 60}d`
              : "—"}
          </Typography>
          <PeriodSelector period={period} onChange={setPeriod} color={c} />
          <IconButton
            size="small"
            onClick={refetch}
            sx={{
              color: isFetching ? c : "#6b7280",
              animation: isFetching ? "spin 1s linear infinite" : "none",
              "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
            }}
          >
            <RefreshIcon fontSize="small" />
          </IconButton>
        </Box>
      </Paper>

      {/* ═══ ASOSIY METRIKALAR ═══ */}
      <Grid container spacing={1.5} sx={{ mb: 2 }}>
        {/* Harorat — katta karta */}
        <Grid item xs={6} sm={4} md={2}>
          <Box
            sx={{
              p: 1.5,
              background: `linear-gradient(135deg, ${tempColor}10 0%, transparent 100%)`,
              border: `1px solid ${tempColor}30`,
              borderLeft: `4px solid ${tempColor}`,
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.55rem",
                color: "#8896a5",
                letterSpacing: "0.08em",
                mb: 0.5,
              }}
            >
              🌡 HARORAT
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "1.6rem",
                fontWeight: 700,
                color: tempColor,
                lineHeight: 1,
              }}
            >
              {lastTemp > 0 ? lastTemp : "—"}
              <span style={{ fontSize: "0.7rem", color: "#8896a5" }}> °C</span>
            </Typography>
            {lastO2 != null && (
              <Typography
                sx={{ fontSize: "0.55rem", color: "#6b7280", mt: 0.3 }}
              >
                O₂: {lastO2} · C: {lastCarbon ?? "—"}
              </Typography>
            )}
          </Box>
        </Grid>

        {/* Suyuq metall */}
        <Grid item xs={6} sm={4} md={2}>
          <Box
            sx={{
              p: 1.5,
              background:
                "linear-gradient(135deg, #00e67610 0%, transparent 100%)",
              border: "1px solid #00e67630",
              borderLeft: "4px solid #00e676",
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.55rem",
                color: "#8896a5",
                letterSpacing: "0.08em",
                mb: 0.5,
              }}
            >
              🫗 SUYUQ METALL
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "1.6rem",
                fontWeight: 700,
                color: "#00e676",
                lineHeight: 1,
              }}
            >
              {fmtN(liquidMetal, 1)}
              <span style={{ fontSize: "0.7rem", color: "#8896a5" }}> t</span>
            </Typography>
            {/* Vizual tank mini */}
            <Box
              sx={{
                mt: 0.8,
                height: 8,
                borderRadius: 4,
                background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  width: `${liquidPercent}%`,
                  height: "100%",
                  background:
                    "linear-gradient(90deg, #ffd60a, #ff6b1a, #ff2d55)",
                  borderRadius: 4,
                  transition: "width 0.6s ease",
                }}
              />
            </Box>
          </Box>
        </Grid>

        {/* API-specific kartalar */}
        {apiKey === "eaf" && (
          <>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="⚡"
                label="Elektr"
                value={fmtN(energy / 1000, 1)}
                unit="MWh"
                color="#ffd60a"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="💨"
                label="Kislorod"
                value={fmtN(injectedO2, 0)}
                unit="m³"
                color="#00d4ff"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="🏗️"
                label="Lom"
                value={fmtN(totalScrap / 1000, 1)}
                unit="t"
                color="#ff6b1a"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="🧮"
                label="Samaradorlik"
                value={fmtN(yieldVal, 1)}
                unit="%"
                color={yieldColor}
              />
            </Grid>
          </>
        )}

        {apiKey === "lrf" && (
          <>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="⚡"
                label="Elektr"
                value={fmtN(energy / 1000, 1)}
                unit="MWh"
                color="#ffd60a"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="💨"
                label="Argon"
                value={fmtN(totalAr, 1)}
                unit="m³"
                color="#a78bfa"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="🔋"
                label="Quvvat vaqti"
                value={Math.floor(powerOnTime / 60)}
                unit="min"
                color="#00e676"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="💧"
                label="N₂ sarfi"
                value={fmtN(totalN2, 1)}
                unit="m³"
                color="#00d4ff"
              />
            </Grid>
          </>
        )}

        {apiKey === "vod" && (
          <>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="🌀"
                label="Min vakuum"
                value={fmtN(minVacuum, 1)}
                unit="mbar"
                color="#a78bfa"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="⏱️"
                label="Chuqur vak."
                value={Math.floor(deepVacuumTime / 60)}
                unit="min"
                color="#00d4ff"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="💨"
                label="Argon"
                value={fmtN(totalAr, 1)}
                unit="m³"
                color="#a78bfa"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="🔥"
                label="Purflash"
                value={Math.floor(blowTime / 60)}
                unit="min"
                color="#ff6b1a"
              />
            </Grid>
          </>
        )}

        {apiKey === "tsc" && (
          <>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="⚡"
                label="Quyish tezl."
                value={avgCastSpeed}
                unit="m/min"
                color="#00d4ff"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="🧊"
                label="Strandlar"
                value={strands.length}
                color="#a78bfa"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="📦"
                label="Mahsulotlar"
                value={products.length}
                color="#00e676"
              />
            </Grid>
            <Grid item xs={6} sm={4} md={2}>
              <StatCard
                icon="🫙"
                label="Tundish"
                value={tundishLife}
                unit={"x · " + (tundishId || "—")}
                color="#ff9500"
              />
            </Grid>
          </>
        )}
      </Grid>

      {/* ═══ CHARTLAR + DETALLAR ═══ */}
      <Grid container spacing={2}>
        {/* Harorat grafik — interaktiv */}
        <Grid item xs={12} md={8}>
          <Paper
            sx={{
              p: 2,
              border: `1px solid ${c}20`,
              borderRadius: 2,
              height: "100%",
            }}
          >
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                mb: 1.5,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.62rem",
                  color: "#8896a5",
                  letterSpacing: "0.08em",
                }}
              >
                HARORAT DINAMIKASI — HEAT #{latest?.heatId}
              </Typography>
              {temps.length > 0 && (
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.55rem",
                    color: "#6b7280",
                  }}
                >
                  {temps.length} o'lchov · {fmtT(temps[0]?.dateTime)} →{" "}
                  {fmtT(temps[temps.length - 1]?.dateTime)}
                </Typography>
              )}
            </Box>
            {tempChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={220}>
                <LineChart
                  data={tempChartData}
                  margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#1a2235" : "#e5e7eb"}
                  />
                  <XAxis dataKey="t" tick={{ fontSize: 10, fill: "#8896a5" }} />
                  <YAxis
                    yAxisId="temp"
                    domain={["auto", "auto"]}
                    tick={{ fontSize: 10, fill: "#8896a5" }}
                    label={{
                      value: "°C",
                      angle: -90,
                      position: "insideLeft",
                      style: { fontSize: 10, fill: "#8896a5" },
                    }}
                  />
                  <YAxis
                    yAxisId="o2"
                    orientation="right"
                    tick={{ fontSize: 10, fill: "#ff6b1a" }}
                    domain={["auto", "auto"]}
                  />
                  <RTooltip
                    contentStyle={{
                      background: isDark ? "#0a0f1e" : "#fff",
                      border: `1px solid ${c}50`,
                      borderRadius: 8,
                      fontSize: 12,
                      fontFamily: "san-serif",
                    }}
                    formatter={(v, n) => {
                      if (n === "Harorat °C") return [`${v}°C`, n];
                      if (n === "O₂") return [v, n];
                      if (n === "C×100")
                        return [`${(v / 100).toFixed(4)}%`, "Carbon"];
                      return [v, n];
                    }}
                    labelFormatter={(_, p) => p?.[0]?.payload?.t || ""}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Line
                    yAxisId="temp"
                    type="monotone"
                    dataKey="temp"
                    stroke={c}
                    dot={{ r: 3, fill: c }}
                    name="Harorat °C"
                    strokeWidth={2.5}
                  />
                  <Line
                    yAxisId="o2"
                    type="monotone"
                    dataKey="o2"
                    stroke="#ff6b1a"
                    dot={{ r: 2, fill: "#ff6b1a" }}
                    name="O₂"
                    strokeWidth={1.5}
                    connectNulls
                  />
                  {tempChartData.some((d) => d.carbon != null) && (
                    <Line
                      yAxisId="o2"
                      type="monotone"
                      dataKey="carbon"
                      stroke="#00ff9d"
                      dot={{ r: 2, fill: "#00ff9d" }}
                      name="C×100"
                      strokeWidth={1.5}
                      strokeDasharray="4 2"
                      connectNulls
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <Box sx={{ py: 4, textAlign: "center" }}>
                <Typography sx={{ fontSize: "0.7rem", color: "#4b5563" }}>
                  Harorat ma'lumoti yo'q
                </Typography>
              </Box>
            )}
            {/* Harorat ostida info */}
            {temps.length > 1 && (
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 1.5,
                  pt: 1.5,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  flexWrap: "wrap",
                }}
              >
                {[
                  {
                    l: "Min",
                    v: `${Math.min(...temps.map((t) => t.temperature))}°C`,
                    c: "#00d4ff",
                  },
                  {
                    l: "Max",
                    v: `${Math.max(...temps.map((t) => t.temperature))}°C`,
                    c: "#ff2d55",
                  },
                  {
                    l: "O'rtacha",
                    v: `${Math.round(temps.reduce((s, t) => s + t.temperature, 0) / temps.length)}°C`,
                    c: "#ffd60a",
                  },
                  {
                    l: "Delta",
                    v: `${Math.max(...temps.map((t) => t.temperature)) - Math.min(...temps.map((t) => t.temperature))}°C`,
                    c: "#a78bfa",
                  },
                ].map((m) => (
                  <Box
                    key={m.l}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Typography sx={{ fontSize: "0.58rem", color: "#6b7280" }}>
                      {m.l}:
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.65rem",
                        fontWeight: 700,
                        color: m.c,
                        fontFamily: "'Arial',san-serif",
                      }}
                    >
                      {m.v}
                    </Typography>
                  </Box>
                ))}
              </Box>
            )}
          </Paper>
        </Grid>

        {/* O'ng tomon: Suyuq metall + kechikishlar + plavka info */}
        <Grid item xs={12} md={4}>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 2,
              height: "100%",
            }}
          >
            {/* Suyuq metall tank */}
            <Paper
              sx={{
                p: 2,
                border: "1px solid #00e67620",
                borderRadius: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.6rem",
                  color: "#8896a5",
                  letterSpacing: "0.08em",
                  mb: 1.5,
                }}
              >
                🫗 SUYUQ METALL HAJMI
              </Typography>

              {/* Vizual tank */}
              <Box
                sx={{
                  height: 80,
                  borderRadius: 2,
                  background: isDark ? "rgba(0,0,0,0.3)" : "rgba(0,0,0,0.04)",
                  border: "1px solid rgba(0,230,118,0.12)",
                  overflow: "hidden",
                  position: "relative",
                  mb: 1.5,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    height: `${liquidPercent}%`,
                    background:
                      "linear-gradient(180deg, #ff6b1a 0%, #ffd60a 50%, #ff2d55 100%)",
                    opacity: 0.65,
                    transition: "height 0.8s ease",
                  }}
                />
                {/* Suyuq metall to'lqini */}
                {liquidPercent > 5 && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: `${liquidPercent - 3}%`,
                      left: 0,
                      right: 0,
                      height: 6,
                      background:
                        "linear-gradient(180deg, #ff6b1a80, transparent)",
                      animation: "wave 2s ease-in-out infinite",
                      "@keyframes wave": {
                        "0%,100%": { transform: "translateY(0)" },
                        "50%": { transform: "translateY(-3px)" },
                      },
                    }}
                  />
                )}
                <Box
                  sx={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%,-50%)",
                    textAlign: "center",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Arial',san-serif",
                      fontSize: "1.3rem",
                      fontWeight: 700,
                      color: "#fff",
                      textShadow: "0 2px 8px rgba(0,0,0,0.6)",
                      lineHeight: 1,
                    }}
                  >
                    {fmtN(liquidMetal, 1)} t
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Arial',san-serif",
                      fontSize: "0.55rem",
                      color: "rgba(255,255,255,0.7)",
                      textShadow: "0 1px 4px rgba(0,0,0,0.5)",
                    }}
                  >
                    {Math.round(liquidPercent)}% · Kovsh{" "}
                    {latest?.ladleId || "—"}
                  </Typography>
                </Box>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between" }}>
                <Typography sx={{ fontSize: "0.55rem", color: "#6b7280" }}>
                  Boshlang'ich: {fmtN(startWeight, 1)} t
                </Typography>
                <Typography sx={{ fontSize: "0.55rem", color: "#6b7280" }}>
                  Shlak: {fmtN(slagWeight, 2)} t
                </Typography>
              </Box>
            </Paper>

            {/* Plavka asosiy info */}
            <Paper
              sx={{
                p: 2,
                border: `1px solid ${c}20`,
                borderRadius: 2,
                flex: 1,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.6rem",
                  color: "#8896a5",
                  letterSpacing: "0.08em",
                  mb: 1,
                }}
              >
                📋 PLAVKA #{latest?.heatId} MA'LUMOTLARI
              </Typography>
              <InfoRow
                label="Po'lat markasi"
                value={latest?.steelGradeName || "—"}
                color={c}
              />
              <InfoRow
                label="Texnologiya"
                value={latest?.practiceName || "—"}
                color="#c8d8e8"
              />
              <InfoRow
                label="Smena / Brigada"
                value={`${latest?.shift || "—"} / ${latest?.team || "—"}`}
                color="#8896a5"
              />
              <InfoRow
                label="Usta"
                value={latest?.foreman || "—"}
                color="#8896a5"
              />
              {delays.length > 0 && (
                <InfoRow
                  label="Kechikishlar"
                  value={`${delays.length} ta · ${Math.floor(totalDelayMin / 60)}s ${totalDelayMin % 60}d`}
                  color={totalDelayMin > 30 ? "#ff2d55" : "#ffd60a"}
                />
              )}
              {apiKey === "eaf" && (
                <>
                  <Divider
                    sx={{ my: 1, borderColor: "rgba(255,255,255,0.06)" }}
                  />
                  <InfoRow
                    label="O'rt quvvat"
                    value={`${fmtN(avgPower / 1000, 0)} MW`}
                    color="#ffd60a"
                  />
                  <InfoRow
                    label="Quvvat vaqti"
                    value={`${Math.floor(powerOnTime / 60)} min`}
                    color="#00e676"
                  />
                  <InfoRow
                    label="Uglerod"
                    value={`${fmtN(injectedCarbon, 0)} kg`}
                    color="#ff9500"
                  />
                  <InfoRow
                    label="Yoqilg'i"
                    value={`${fmtN(injectedFuel, 0)} kg`}
                    color="#a78bfa"
                  />
                  {hotHeel > 0 && (
                    <InfoRow
                      label="Hot heel"
                      value={`${fmtN(hotHeel / 1000, 1)} t`}
                      color="#ff6b1a"
                    />
                  )}
                </>
              )}
              {apiKey === "vod" && (
                <>
                  <Divider
                    sx={{ my: 1, borderColor: "rgba(255,255,255,0.06)" }}
                  />
                  <InfoRow
                    label="Min vakuum"
                    value={`${fmtN(minVacuum, 1)} mbar`}
                    color="#a78bfa"
                  />
                  <InfoRow
                    label="Pompalash"
                    value={`${Math.floor(pumpVacuumTime / 60)} min`}
                    color="#00d4ff"
                  />
                  <InfoRow
                    label="Kislorod"
                    value={`${fmtN(totalOxygen, 0)} m³`}
                    color="#ff6b1a"
                  />
                </>
              )}
              {apiKey === "tsc" && liquidusTemp > 0 && (
                <>
                  <Divider
                    sx={{ my: 1, borderColor: "rgba(255,255,255,0.06)" }}
                  />
                  <InfoRow
                    label="Liquidus"
                    value={`${liquidusTemp}°C`}
                    color="#ff6b1a"
                  />
                </>
              )}
            </Paper>
          </Box>
        </Grid>
      </Grid>

      {/* ═══ PASTKI QATOR: Energiya trendi + Materiallar + Kimyo ═══ */}
      <Grid container spacing={2} sx={{ mt: 0.5 }}>
        {/* Energiya / chiqarish trendi */}
        {energyTrend.length > 1 && (
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 2,
                border: `1px solid ${c}20`,
                borderRadius: 2,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.62rem",
                  color: "#8896a5",
                  letterSpacing: "0.08em",
                  mb: 1.5,
                }}
              >
                ⚡ ENERGIYA VA CHIQARISH TRENDI — {periodLabel}
              </Typography>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart
                  data={energyTrend}
                  margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke={isDark ? "#1a2235" : "#e5e7eb"}
                  />
                  <XAxis
                    dataKey="heatId"
                    tick={{ fontSize: 10, fill: "#8896a5" }}
                    tickFormatter={(v) => `#${v}`}
                  />
                  <YAxis tick={{ fontSize: 10, fill: "#8896a5" }} />
                  <RTooltip
                    contentStyle={{
                      background: isDark ? "#0a0f1e" : "#fff",
                      border: `1px solid ${c}50`,
                      borderRadius: 8,
                      fontSize: 12,
                    }}
                    formatter={(v, n) => [
                      `${fmtN(v, 1)} ${n === "Energiya" ? "MWh" : "t"}`,
                      n,
                    ]}
                  />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Bar
                    dataKey="energy"
                    fill="#ffd60a"
                    name="Energiya"
                    radius={[3, 3, 0, 0]}
                    opacity={0.8}
                  />
                  <Bar
                    dataKey="output"
                    fill="#00e676"
                    name="Chiqarish"
                    radius={[3, 3, 0, 0]}
                    opacity={0.8}
                  />
                </BarChart>
              </ResponsiveContainer>
              {/* Trendi ostida xulosa */}
              <Box
                sx={{
                  display: "flex",
                  gap: 2,
                  mt: 1,
                  pt: 1,
                  borderTop: "1px solid",
                  borderColor: "divider",
                  flexWrap: "wrap",
                }}
              >
                {[
                  {
                    l: "Jami energiya",
                    v: `${fmtN(
                      energyTrend.reduce((s, e) => s + e.energy, 0),
                      1,
                    )} MWh`,
                    c: "#ffd60a",
                  },
                  {
                    l: "Jami chiqarish",
                    v: `${fmtN(
                      energyTrend.reduce((s, e) => s + e.output, 0),
                      1,
                    )} t`,
                    c: "#00e676",
                  },
                  {
                    l: "O'rtacha",
                    v: `${fmtN(energyTrend.reduce((s, e) => s + e.energy, 0) / energyTrend.length, 1)} MWh`,
                    c: "#8896a5",
                  },
                ].map((m) => (
                  <Box
                    key={m.l}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Typography sx={{ fontSize: "0.55rem", color: "#6b7280" }}>
                      {m.l}:
                    </Typography>
                    <Typography
                      sx={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        color: m.c,
                        fontFamily: "'Arial',san-serif",
                      }}
                    >
                      {m.v}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Paper>
          </Grid>
        )}

        {/* Materiallar + Kimyoviy tarkib */}
        <Grid item xs={12} md={energyTrend.length > 1 ? 6 : 12}>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
            {/* Materiallar */}
            {Object.keys(materialGrouped).length > 0 && (
              <Paper
                sx={{
                  p: 2,
                  border: `1px solid ${c}20`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.62rem",
                    color: "#8896a5",
                    letterSpacing: "0.08em",
                    mb: 1,
                  }}
                >
                  📦 MATERIAL QO'SHILISHLARI
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                  {Object.entries(materialGrouped).map(([code, wgt]) => (
                    <Box
                      key={code}
                      sx={{
                        px: 1.2,
                        py: 0.8,
                        background: `${c}08`,
                        border: `1px solid ${c}25`,
                        borderRadius: 1.5,
                        textAlign: "center",
                        minWidth: 56,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Arial',san-serif",
                          fontSize: "0.58rem",
                          color: "#8896a5",
                          mb: 0.2,
                        }}
                      >
                        {code}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Arial',san-serif",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: c,
                        }}
                      >
                        {wgt}{" "}
                        <span style={{ fontSize: "0.5rem", color: "#6b7280" }}>
                          kg
                        </span>
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Scrap bucketlar (EAF) */}
            {buckets.length > 0 && (
              <Paper
                sx={{
                  p: 2,
                  border: "1px solid #ff6b1a20",
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.62rem",
                    color: "#8896a5",
                    letterSpacing: "0.08em",
                    mb: 1,
                  }}
                >
                  🏗️ SCRAP SAVATLAR
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {buckets.map((b, i) => {
                    const bWgt = (b.bucketCharges || []).reduce(
                      (s, ch) => s + (ch.materialWgt || 0),
                      0,
                    );
                    return (
                      <Box
                        key={i}
                        sx={{
                          px: 1.5,
                          py: 1,
                          background: "#ff6b1a08",
                          border: "1px solid #ff6b1a25",
                          borderRadius: 1.5,
                          textAlign: "center",
                        }}
                      >
                        <Typography
                          sx={{
                            fontFamily: "'Arial',san-serif",
                            fontSize: "0.55rem",
                            color: "#8896a5",
                            mb: 0.2,
                          }}
                        >
                          Savat #{b.bucketSequence}
                        </Typography>
                        <Typography
                          sx={{
                            fontFamily: "'Arial',san-serif",
                            fontSize: "0.75rem",
                            fontWeight: 700,
                            color: "#ff6b1a",
                          }}
                        >
                          {fmtN(bWgt / 1000, 1)} t
                        </Typography>
                        <Typography
                          sx={{ fontSize: "0.5rem", color: "#6b7280" }}
                        >
                          {(b.bucketCharges || []).length} qatlam
                        </Typography>
                      </Box>
                    );
                  })}
                </Box>
              </Paper>
            )}

            {/* TSC strandlar */}
            {strands.length > 0 && (
              <Paper
                sx={{
                  p: 2,
                  border: "1px solid #00d4ff20",
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.62rem",
                    color: "#8896a5",
                    letterSpacing: "0.08em",
                    mb: 1,
                  }}
                >
                  🧊 STRANDLAR
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
                  {strands.map((s, i) => (
                    <Box
                      key={i}
                      sx={{
                        px: 1.5,
                        py: 1,
                        background: "#00d4ff08",
                        border: "1px solid #00d4ff25",
                        borderRadius: 1.5,
                        textAlign: "center",
                        minWidth: 80,
                      }}
                    >
                      <Typography
                        sx={{
                          fontFamily: "'Arial',san-serif",
                          fontSize: "0.55rem",
                          color: "#8896a5",
                        }}
                      >
                        Strand #{s.strandNo}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Arial',san-serif",
                          fontSize: "0.72rem",
                          fontWeight: 700,
                          color: "#00d4ff",
                        }}
                      >
                        {fmtN(s.castSpeedAvg, 2)} m/min
                      </Typography>
                      <Typography sx={{ fontSize: "0.5rem", color: "#6b7280" }}>
                        {fmtN(s.castLength, 0)} m · {s.profileName || "—"}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Paper>
            )}

            {/* Kimyoviy tarkib */}
            {lastAnalysis && (
              <Paper
                sx={{
                  p: 2,
                  border: `1px solid ${c}20`,
                  borderRadius: 2,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.62rem",
                    color: "#8896a5",
                    letterSpacing: "0.08em",
                    mb: 1,
                  }}
                >
                  🔬 KIMYOVIY TARKIB — {lastAnalysis.sampleId} ·{" "}
                  {fmtT(lastAnalysis.sampleTime)}
                </Typography>
                <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.8 }}>
                  {(lastAnalysis.chemicalAnalysis || []).map((ca) => (
                    <ChemCard
                      key={ca.code}
                      code={ca.code}
                      color={c}
                      value={Number(ca.value).toFixed(ca.value < 0.01 ? 4 : 3)}
                    />
                  ))}
                </Box>
              </Paper>
            )}
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}

// Analytics
export function analyzeHeat(h) {
  const results = [];

  const scrap = h.totalScrap || 0;
  const hbi = h.totalHBI || 0;
  const outputKg = h.tappingWeight || 0;
  const outputTon = outputKg / 1000;
  const energy = h.electricalEnergy || 0;

  const energyPerTon = outputTon > 0 ? energy / outputTon : 0;
  const yieldVal = scrap + hbi > 0 ? outputKg / (scrap + hbi) : 0;

  const temps = h.temperatures || [];
  const delays = h.delays || [];

  const lastTemp = temps.at(-1)?.temperature || 0;
  const minTemp = temps.length
    ? Math.min(...temps.map((t) => t.temperature))
    : 0;

  const ratio = hbi > 0 ? scrap / hbi : 0;

  // ⏱ DELAY DETAIL (soat hisoblash)
  let totalDelayMin = 0;
  let delayReasons = [];

  delays.forEach((d) => {
    const start = new Date(d.startTime);
    const stop = new Date(d.stopTime);
    const diffMin = (stop - start) / 60000;

    totalDelayMin += diffMin;

    if (d.delayReason) {
      delayReasons.push(`${d.delayReason} (${Math.round(diffMin)} min)`);
    }
  });

  const delayHours = (totalDelayMin / 60).toFixed(1);

  // ⚡ ENERGY
  if (energyPerTon > 450) {
    results.push({
      title: "⚡ Elektr sarfi yuqori",
      value: `${energyPerTon.toFixed(0)} kWh/t`,
      problem: `Normadan ${(energyPerTon - 400).toFixed(0)} kWh ko‘p`,

      reason: [
        totalDelayMin > 0 &&
          `⏱ ${delayHours} soat ishlamagan (${delayReasons.join(", ")})`,

        minTemp > 0 &&
          minTemp < 1500 &&
          `🌡 Harorat ${minTemp}°C gacha tushgan`,

        ratio > 5 && `🪨 Scrap juda ko‘p (${ratio.toFixed(1)})`,
      ].filter(Boolean),

      solution: "Delaylarni kamaytirish va temperaturani ushlab turish",
    });
  }

  // 🌡 TEMPERATURE
  if (minTemp < 1500) {
    results.push({
      title: "🌡 Harorat muammosi",
      value: `${lastTemp}°C`,
      problem: `Minimal ${minTemp}°C bo‘lgan (norma 1600+)`,
      reason: [
        "Energiya yetishmagan",
        totalDelayMin > 0 && "Jarayon uzilgan",
      ].filter(Boolean),
      solution: "Power rejimini oshirish",
    });
  }

  // ⏱ DELAY
  if (totalDelayMin > 0) {
    results.push({
      title: "⏱ Kechikishlar",
      value: `${delayHours} soat`,
      problem: `${Math.round(totalDelayMin)} minut ishlab turmagan`,
      reason: delayReasons,
      solution: "Uskunalarni tekshirish",
    });
  }

  // 🧮 YIELD
  if (yieldVal < 0.9) {
    results.push({
      title: "🧮 Samaradorlik past",
      value: `${(yieldVal * 100).toFixed(1)}%`,
      problem: "Metall yo‘qotish yuqori",
      reason: [
        ratio < 1 && "HBI ko‘p ishlatilgan",
        ratio > 6 && "Scrap sifati past",
      ].filter(Boolean),
      solution: "Material balansni optimallashtirish",
    });
  }

  // 🪨 RATIO
  if (ratio > 6 || ratio < 1) {
    results.push({
      title: "🪨 Scrap/HBI balans",
      value: ratio.toFixed(2),
      problem: "Optimal emas (2–4 bo‘lishi kerak)",
      reason: [`Joriy ratio: ${ratio.toFixed(2)}`],
      solution: "Xom ashyoni qayta balanslash",
    });
  }

  if (results.length === 0) {
    results.push({
      title: "✅ Hammasi yaxshi",
      value: "",
      problem: "",
      reason: [],
      solution: "",
    });
  }

  return results;
}

// ══════════════════════════════════════════════════════════════════
//  ASOSIY SAHIFA
// ══════════════════════════════════════════════════════════════════

export default function UskunaDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [tab, setTab] = useState(0);

  const uskuna = location.state?.uskuna ?? null;

  if (!uskuna) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            color: "text.secondary",
          }}
        >
          Uskuna topilmadi: {id}
        </Typography>
        <Box sx={{ mt: 2 }}>
          <IconButton onClick={() => navigate(-1)}>
            <ArrowBackIcon />
          </IconButton>
        </Box>
      </Box>
    );
  }

  const c = TUR_COLOR[uskuna.tur] || "#00d4ff";

  const isSex07 = uskuna.sexId === "SEX-07";

  const API_TABS = {
    "UCH-07B": [
      { key: "eaf", label: "🔥 Elektrda eritish pechi ko‘rsatkichlari" },
    ],
    "UCH-07D": [
      { key: "lrf", label: "⚗️ Kovsh tozalash pechi ko‘rsatkichlari" },
    ],
    "UCH-07C": [
      { key: "tsc", label: "🧊 Qolipga quyish ko‘rsatkichlari" },
      { key: "vod", label: "🌀 Vakuum ostida tozalash ko‘rsatkichlari" },
    ],
  };

  const uchastkaTabs = isSex07 ? API_TABS[uskuna.uchastkId] || [] : [];

  const tabs = [
    "🔧 Interaktiv Sxema",
    ...uchastkaTabs.map((t) => t.label),
    "📹 Kameralar",
    "📋 Tarix",
  ];

  const TAB_SXEMA = 0;
  const TAB_KAMERALAR = 1 + uchastkaTabs.length;
  const TAB_TARIX = 2 + uchastkaTabs.length;

  const activeApiKey =
    tab >= 1 && tab < TAB_KAMERALAR ? uchastkaTabs[tab - 1]?.key : null;

  return (
    <Box sx={{ minHeight: "100%", bgcolor: "background.default" }}>
      {/* HEADER */}
      <Box
        sx={{
          px: 2.5,
          py: 1.2,
          display: "flex",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: isDark ? "#080c18" : "#fff",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <IconButton
          size="small"
          onClick={() => navigate(-1)}
          sx={{ color: "text.secondary", "&:hover": { color: "primary.main" } }}
        >
          <ArrowBackIcon fontSize="small" />
        </IconButton>

        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            fontSize: "0.62rem",
            color: "text.secondary",
          }}
        >
          Uskunalar
        </Typography>

        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            fontSize: "0.62rem",
            color: "divider",
          }}
        >
          /
        </Typography>

        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            fontSize: "0.62rem",
            color: "text.primary",
            ml: 0.5,
          }}
        >
          {uskuna.nom}
        </Typography>

        <Box sx={{ flex: 1 }} />

        <StatusChip holat={uskuna.holat} />

        <Chip
          label={uskuna.tur}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.58rem",
            fontFamily: "'Arial',san-serif",
            bgcolor: `${c}18`,
            color: c,
            border: `1px solid ${c}40`,
            borderRadius: "2px",
          }}
        />

        {isSex07 && uchastkaTabs.length > 0 && (
          <Chip
            label={uchastkaTabs.map((t) => t.key.toUpperCase()).join("+")}
            size="small"
            sx={{
              height: 20,
              fontSize: "0.58rem",
              bgcolor: `${c}20`,
              color: c,
              fontFamily: "san-serif",
            }}
          />
        )}
      </Box>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          px: 2.5,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: isDark ? "#060810" : "#fafbfc",
          minHeight: 40,
          "& .MuiTabs-indicator": { bgcolor: c },
          "& .MuiTab-root": {
            fontSize: "1rem",
            minHeight: 40,
            fontFamily: "'Arial',san-serif",
            letterSpacing: "0.06em",
          },
        }}
      >
        {tabs.map((t, i) => (
          <Tab key={i} label={t} />
        ))}
      </Tabs>

      {/* CONTENT */}
      <Box
        sx={{
          p:
            tab === TAB_SXEMA || tab === TAB_KAMERALAR || tab === TAB_TARIX
              ? 2.5
              : 0,
        }}
      >
        {tab === TAB_SXEMA && (
          <RealDataSxemaWrapper
            uskuna={uskuna}
            apiKey={inferApiKeyFromMeta(uskuna)}
            c={c}
            isDark={isDark}
          />
        )}

        {activeApiKey === "eaf" && (
          <EAFStatsTab uskuna={uskuna} c={c} isDark={isDark} />
        )}
        {activeApiKey === "lrf" && <LRFStatsTab c={c} isDark={isDark} />}
        {activeApiKey === "vod" && <VODStatsTab c={c} isDark={isDark} />}
        {activeApiKey === "tsc" && <TSCStatsTab c={c} isDark={isDark} />}

        {tab === TAB_KAMERALAR && <CamerasTab c={c} isDark={isDark} />}

        {tab === TAB_TARIX && inferApiKeyFromMeta(uskuna) && (
          <RealHistoryTab
            apiKey={inferApiKeyFromMeta(uskuna)}
            c={c}
            isDark={isDark}
          />
        )}
        {tab === TAB_TARIX && !inferApiKeyFromMeta(uskuna) && (
          <Paper sx={{ p: 3, maxWidth: 600, border: `1px solid ${c}20` }}>
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.72rem",
                color: "#8896a5",
                textAlign: "center",
              }}
            >
              Bu uskuna uchun real-time tarix mavjud emas.
              <br />
              Faqat EAF, LRF, VOD, TSC uskunalari uchun API tarixi ko'rsatiladi.
            </Typography>
          </Paper>
        )}
      </Box>
    </Box>
  );
}

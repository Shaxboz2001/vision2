import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  IconButton,
  useTheme,
  Divider,
  LinearProgress,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import RefreshIcon from "@mui/icons-material/Refresh";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";

// ═══════════════════════════════════════════════════════
//  Transparent PNG o'rniga import path (loyihangizga moslab o'zgartiring)
// ═══════════════════════════════════════════════════════
// import equipmentImage from "@/assets/images/transparent.png";
// yoki:
const equipmentImage = "/images/uskunalar/klet.png"; // public papkada bo'lsa

// ─── GAUGE COMPONENT (KIO / Quvvat) ───────────────────
function GaugeWidget({
  value,
  label,
  size = 140,
  color,
  maxVal = 100,
  unit = "%",
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const radius = (size - 20) / 2;
  const cx = size / 2;
  const cy = size / 2 + 10;
  const startAngle = 225;
  const endAngle = -45;
  const totalAngle = startAngle - endAngle;
  const progress = Math.min(value / maxVal, 1);
  const currentAngle = startAngle - totalAngle * progress;

  const polarToCartesian = (angle) => {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + radius * Math.cos(rad), y: cy - radius * Math.sin(rad) };
  };

  const describeArc = (start, end) => {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = start - end > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${radius} ${radius} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  };

  const gradientId = `gauge-grad-${label?.replace(/\s/g, "")}`;

  return (
    <Box sx={{ position: "relative", width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="0%">
            <stop
              offset="0%"
              stopColor={color || "#ff6b1a"}
              stopOpacity="0.3"
            />
            <stop
              offset="100%"
              stopColor={color || "#ff6b1a"}
              stopOpacity="1"
            />
          </linearGradient>
          <filter id={`glow-${gradientId}`}>
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* BG arc */}
        <path
          d={describeArc(startAngle, endAngle)}
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.08)"}
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={describeArc(startAngle, currentAngle)}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth="10"
          strokeLinecap="round"
          filter={`url(#glow-${gradientId})`}
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const angle = startAngle - totalAngle * (tick / 100);
          const outer = polarToCartesian(angle);
          const innerR = radius - 14;
          const rad = (angle * Math.PI) / 180;
          const inner = {
            x: cx + innerR * Math.cos(rad),
            y: cy - innerR * Math.sin(rad),
          };
          return (
            <g key={tick}>
              <line
                x1={inner.x}
                y1={inner.y}
                x2={outer.x}
                y2={outer.y}
                stroke={isDark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"}
                strokeWidth="1.5"
              />
            </g>
          );
        })}
        {/* Value */}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          fill={color || "#ff6b1a"}
          fontSize={size * 0.22}
          fontFamily="'Arial', san-serif"
          fontWeight="700"
        >
          {typeof value === "number" ? value.toFixed(1) : value}
        </text>
        <text
          x={cx}
          y={cy + size * 0.13}
          textAnchor="middle"
          fill={isDark ? "rgba(255,255,255,0.5)" : "rgba(0,0,0,0.5)"}
          fontSize={size * 0.09}
          fontFamily="'Arial', san-serif"
        >
          {unit}
        </text>
      </svg>
      {label && (
        <Typography
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            textAlign: "center",
            fontFamily: "'san-serif', sans-serif",
            fontWeight: 700,
            fontSize: "0.7rem",
            color: "text.secondary",
            letterSpacing: "0.1em",
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
}

// ─── TEMPERATURE INDICATOR (rasm ustida) ─────────────
function TempIndicator({
  temp,
  x,
  y,
  labelSide = "right",
  color = "#00e676",
  animated = false,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isLeft = labelSide === "left";

  return (
    <Box
      sx={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%, -50%)",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        gap: 0.5,
        flexDirection: isLeft ? "row-reverse" : "row",
      }}
    >
      {/* Dot */}
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 10px ${color}, 0 0 20px ${color}40`,
          animation: animated ? "pulse 2s ease-in-out infinite" : "none",
          "@keyframes pulse": {
            "0%, 100%": { transform: "scale(1)", opacity: 1 },
            "50%": { transform: "scale(1.3)", opacity: 0.7 },
          },
        }}
      />
      {/* Line */}
      <Box
        sx={{
          width: 30,
          height: "1px",
          background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${color}, transparent)`,
        }}
      />
      {/* Label */}
      <Box
        sx={{
          background: isDark ? "rgba(0,0,0,0.85)" : "rgba(255,255,255,0.95)",
          border: `1px solid ${color}40`,
          borderRadius: "4px",
          px: 1,
          py: 0.3,
          backdropFilter: "blur(8px)",
          whiteSpace: "nowrap",
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Arial', san-serif",
            fontSize: "0.72rem",
            fontWeight: 700,
            color: color,
            lineHeight: 1.2,
          }}
        >
          {temp}°C
        </Typography>
      </Box>
    </Box>
  );
}

// ─── STAT ROW COMPONENT ──────────────────────────────
function StatRow({ label, value, unit, valueColor }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 1,
        px: 1.5,
        borderBottom: "1px solid",
        borderColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
        "&:last-child": { borderBottom: "none" },
        "&:hover": {
          background: isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.015)",
        },
        transition: "background 0.2s",
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Arial', san-serif",
          fontSize: "0.72rem",
          color: "text.secondary",
          letterSpacing: "0.03em",
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
        <Typography
          sx={{
            fontFamily: "'Arial', san-serif",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: valueColor || "text.primary",
          }}
        >
          {value}
        </Typography>
        {unit && (
          <Typography
            sx={{
              fontFamily: "'Arial', san-serif",
              fontSize: "0.6rem",
              color: "text.disabled",
            }}
          >
            {unit}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

// ─── MINI CHART ──────────────────────────────────────
function MiniChart({ data, dataKey, color, title, unit }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 1,
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Arial', san-serif",
            fontSize: "0.62rem",
            color: "text.secondary",
            letterSpacing: "0.1em",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Arial', san-serif",
            fontSize: "0.85rem",
            fontWeight: 700,
            color: color,
          }}
        >
          {data[data.length - 1]?.[dataKey]} {unit}
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={90}>
        <AreaChart
          data={data}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <defs>
            <linearGradient id={`grad-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.3} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)"}
          />
          <XAxis
            dataKey="time"
            tick={{
              fontSize: 8,
              fill: isDark ? "#555" : "#bbb",
              fontFamily: "'Arial'",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={["dataMin - 20", "dataMax + 20"]} />
          <RTooltip
            contentStyle={{
              background: isDark
                ? "rgba(10,12,20,0.95)"
                : "rgba(255,255,255,0.95)",
              border: `1px solid ${color}40`,
              borderRadius: 4,
              fontFamily: "'Arial'",
              fontSize: "0.65rem",
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#grad-${dataKey})`}
            dot={false}
            activeDot={{ r: 3, fill: color, stroke: "#fff", strokeWidth: 1 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════
//  ASOSIY COMPONENT — USKUNA XARAKTERISTIKASI
// ═══════════════════════════════════════════════════════
export default function EquipmentCharacteristics({ uskuna }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [now, setNow] = useState(new Date());

  // Auto-refresh vaqt
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── MOCK DATA (API dan keladigan ma'lumotlar bilan almashtiring) ───
  const u = uskuna || {
    id: "EAF-01",
    nom: "Elektr Yoy Pechi №1",
    model: "Danieli EAF 120t",
    tur: "Elektr Pech",
    holat: "faol",
    quvvat: 120,
    harorat: 1650,
    bosim: 2.4,
    samaradorlik: 87.5,
    ishVaqti: 13.3,
    prostoySutka: 0.0,
    prostoyOldingi: 0.0,
    kio: 100,
    energiya: 485,
    rasxodVoda: 3934.8,
  };

  // Chart data generator
  const chartData = useMemo(() => {
    const data = [];
    for (let i = 0; i < 30; i++) {
      const h = 12 + Math.floor(i * 2);
      const m = (i * 2) % 60;
      data.push({
        time: `${h}:${String(m).padStart(2, "0")}`,
        voda: Math.round(3900 + Math.random() * 100),
        harorat: Math.round(u.harorat - 50 + Math.random() * 100),
        energiya: Math.round(u.energiya - 30 + Math.random() * 60),
      });
    }
    return data;
  }, [u.harorat, u.energiya]);

  // Temperature points — uskunaning turli nuqtalaridagi haroratlar
  const tempPoints = [
    { temp: 41.5, x: 68, y: 12, color: "#ffd60a", labelSide: "right" },
    { temp: 35.3, x: 22, y: 25, color: "#00e676", labelSide: "left" },
    { temp: 38.7, x: 25, y: 35, color: "#ffd60a", labelSide: "left" },
    { temp: 31.5, x: 55, y: 20, color: "#00e676", labelSide: "right" },
    { temp: 37.4, x: 58, y: 30, color: "#ffd60a", labelSide: "right" },
    { temp: 35.2, x: 60, y: 40, color: "#00e676", labelSide: "right" },
    {
      temp: 41.9,
      x: 90,
      y: 28,
      color: "#ff6b1a",
      labelSide: "right",
      animated: true,
    },
    { temp: 35.1, x: 20, y: 45, color: "#00e676", labelSide: "left" },
    { temp: 36.1, x: 18, y: 55, color: "#00e676", labelSide: "left" },
    { temp: 30.9, x: 30, y: 78, color: "#00d4ff", labelSide: "left" },
  ];

  const c =
    u.holat === "faol"
      ? "#00e676"
      : u.holat === "ogohlantirish"
        ? "#ffd60a"
        : "#ff2d55";

  const formatTime = (d) =>
    `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        background: isDark
          ? "linear-gradient(180deg, #060a14 0%, #0a0e1a 100%)"
          : "linear-gradient(180deg, #f4f6fa 0%, #ebeef5 100%)",
        p: { xs: 1.5, md: 2.5 },
        fontFamily: "'Arial', sans-serif",
      }}
    >
      {/* ═══ HEADER BAR ═══ */}
      <Paper
        sx={{
          mb: 2,
          p: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: isDark
            ? "linear-gradient(135deg, rgba(0,212,255,0.06) 0%, rgba(0,0,0,0.4) 100%)"
            : "rgba(255,255,255,0.9)",
          border: "1px solid",
          borderColor: isDark ? `${c}20` : "divider",
          borderRadius: 2,
          backdropFilter: "blur(10px)",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          {/* Status dot */}
          <Box
            sx={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 12px ${c}80`,
              animation:
                u.holat === "faol" ? "pulse 2s ease-in-out infinite" : "none",
              "@keyframes pulse": {
                "0%, 100%": { boxShadow: `0 0 12px ${c}80` },
                "50%": { boxShadow: `0 0 24px ${c}` },
              },
            }}
          />
          <Box>
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: { xs: "0.85rem", md: "1.1rem" },
                fontWeight: 700,
                color: "text.primary",
                letterSpacing: "0.1em",
              }}
            >
              Xarakteristika {u.nom || "EAF-01"}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: "0.6rem",
                color: "text.secondary",
              }}
            >
              {u.model} · {u.tur} · ID: {u.id}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Chip
            label={u.holat?.toUpperCase() || "FAOL"}
            size="small"
            sx={{
              height: 24,
              fontFamily: "'Arial', san-serif",
              fontSize: "0.6rem",
              fontWeight: 700,
              bgcolor: `${c}18`,
              color: c,
              borderRadius: "4px",
              letterSpacing: "0.08em",
              border: `1px solid ${c}30`,
            }}
          />
          <IconButton size="small" sx={{ color: "text.secondary" }}>
            <RefreshIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Paper>

      {/* ═══ MAIN CONTENT ═══ */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "280px 1fr 300px" },
          gap: 2,
        }}
      >
        {/* ─── LEFT PANEL: Ko'rsatkichlar ─── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Quvvat Gauge */}
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: "1px solid",
              borderColor: isDark ? "rgba(255,107,26,0.15)" : "divider",
              background: isDark
                ? "linear-gradient(180deg, rgba(255,107,26,0.04) 0%, transparent 100%)"
                : undefined,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: "0.6rem",
                color: "text.secondary",
                letterSpacing: "0.12em",
                mb: 1,
              }}
            >
              QUVVAT
            </Typography>
            <GaugeWidget
              value={u.samaradorlik}
              label=""
              size={160}
              color="#ff6b1a"
            />
            <Typography
              sx={{
                fontFamily: "'san-serif', sans-serif",
                fontWeight: 600,
                fontSize: "0.75rem",
                color: "text.secondary",
                mt: 0.5,
              }}
            >
              Samaradorlik
            </Typography>
          </Paper>

          {/* Suv grafigi */}
          <Paper
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: isDark ? "rgba(0,212,255,0.12)" : "divider",
            }}
          >
            <MiniChart
              data={chartData}
              dataKey="voda"
              color="#00d4ff"
              title="HISOBLANGAN SUV (m³/s)"
              unit="m³/s"
            />
          </Paper>

          {/* Energiya grafigi */}
          <Paper
            sx={{
              p: 2,
              border: "1px solid",
              borderColor: isDark ? "rgba(167,139,250,0.12)" : "divider",
            }}
          >
            <MiniChart
              data={chartData}
              dataKey="energiya"
              color="#a78bfa"
              title="ENERGIYA SARFI (kVt)"
              unit="kVt"
            />
          </Paper>
        </Box>

        {/* ─── CENTER: Uskuna rasmi + harorat indikatorlari ─── */}
        <Paper
          sx={{
            position: "relative",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: { xs: 400, md: 600 },
            border: "1px solid",
            borderColor: isDark ? "rgba(255,255,255,0.06)" : "divider",
            background: isDark
              ? "radial-gradient(ellipse at center, rgba(0,230,118,0.03) 0%, transparent 70%)"
              : "radial-gradient(ellipse at center, rgba(0,230,118,0.04) 0%, transparent 70%)",
          }}
        >
          {/* Grid pattern overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: isDark
                ? "linear-gradient(rgba(255,255,255,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.015) 1px, transparent 1px)"
                : "linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              zIndex: 1,
            }}
          />

          {/* Glowing ring under equipment */}
          <Box
            sx={{
              position: "absolute",
              bottom: "8%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "70%",
              height: 0,
              borderRadius: "50%",
              boxShadow: `0 0 80px 40px ${c}15, 0 0 120px 60px ${c}08`,
              zIndex: 1,
            }}
          />

          {/* Ring SVG */}
          <Box
            sx={{
              position: "absolute",
              bottom: "5%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "75%",
              zIndex: 2,
            }}
          >
            <svg
              viewBox="0 0 400 60"
              style={{ width: "100%", display: "block" }}
            >
              <ellipse
                cx="200"
                cy="30"
                rx="195"
                ry="25"
                fill="none"
                stroke={c}
                strokeWidth="2.5"
                opacity="0.5"
              />
              <ellipse
                cx="200"
                cy="30"
                rx="195"
                ry="25"
                fill="none"
                stroke={c}
                strokeWidth="1"
                opacity="0.15"
                strokeDasharray="8,6"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from="0 200 30"
                  to="360 200 30"
                  dur="60s"
                  repeatCount="indefinite"
                />
              </ellipse>
            </svg>
          </Box>

          {/* Equipment Image */}
          <Box
            sx={{
              position: "relative",
              width: "80%",
              maxWidth: 500,
              zIndex: 3,
              filter: isDark
                ? "drop-shadow(0 20px 60px rgba(0,0,0,0.6))"
                : "drop-shadow(0 20px 40px rgba(0,0,0,0.15))",
            }}
          >
            <img
              src={equipmentImage}
              alt={u.nom || "Equipment"}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "contain",
              }}
            />

            {/* Temperature indicators */}
            {tempPoints.map((tp, i) => (
              <TempIndicator
                key={i}
                temp={tp.temp}
                x={tp.x}
                y={tp.y}
                color={tp.color}
                labelSide={tp.labelSide}
                animated={tp.animated}
              />
            ))}
          </Box>

          {/* Pokazateli label */}
          <Typography
            sx={{
              position: "absolute",
              top: 16,
              left: 20,
              fontFamily: "'Arial', san-serif",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "text.secondary",
              letterSpacing: "0.15em",
              zIndex: 5,
            }}
          >
            KO'RSATKICHLAR
          </Typography>

          {/* Top right: Suv ko'rsatkichi */}
          <Box
            sx={{
              position: "absolute",
              top: 16,
              right: 20,
              zIndex: 5,
              textAlign: "right",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: "0.55rem",
                color: "text.secondary",
                letterSpacing: "0.1em",
              }}
            >
              HISOBLANGAN SUV (m³/s)
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: "1.5rem",
                fontWeight: 700,
                color: "#00e676",
              }}
            >
              {u.rasxodVoda?.toLocaleString("ru") || "3 934,8"}
            </Typography>
          </Box>
        </Paper>

        {/* ─── RIGHT PANEL ─── */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* KIO Gauge */}
          <Paper
            sx={{
              p: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              border: "1px solid",
              borderColor: isDark ? `${c}15` : "divider",
              background: isDark
                ? `linear-gradient(180deg, ${c}06 0%, transparent 100%)`
                : undefined,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: "0.6rem",
                color: "text.secondary",
                letterSpacing: "0.12em",
                mb: 1,
              }}
            >
              KIO
            </Typography>
            <GaugeWidget value={u.kio || 100} label="" size={160} color={c} />
          </Paper>

          {/* Ish vaqti */}
          <Paper
            sx={{
              border: "1px solid",
              borderColor: isDark ? "rgba(255,255,255,0.06)" : "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                borderBottom: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.04)" : "divider",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Arial', san-serif",
                  fontSize: "0.6rem",
                  color: "text.secondary",
                  letterSpacing: "0.12em",
                }}
              >
                ISH VAQTI
              </Typography>
            </Box>
            <StatRow
              label="Ish vaqti"
              value={u.ishVaqti || 13.3}
              unit="soat"
              valueColor="#00e676"
            />
            <StatRow
              label="Prostoy (bugun)"
              value={u.prostoySutka || 0.0}
              unit="soat"
              valueColor={u.prostoySutka > 0 ? "#ffd60a" : "text.primary"}
            />
            <StatRow
              label="Prostoy (kecha)"
              value={u.prostoyOldingi || 0.0}
              unit="soat"
              valueColor={u.prostoyOldingi > 0 ? "#ffd60a" : "text.primary"}
            />
          </Paper>

          {/* Energiya */}
          <Paper
            sx={{
              border: "1px solid",
              borderColor: isDark ? "rgba(167,139,250,0.12)" : "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                borderBottom: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.04)" : "divider",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Arial', san-serif",
                  fontSize: "0.6rem",
                  color: "text.secondary",
                  letterSpacing: "0.12em",
                }}
              >
                ENERGOSARFIYOT
              </Typography>
            </Box>
            <StatRow
              label="Joriy quvvat"
              value={u.energiya || 485}
              unit="kVt"
              valueColor="#a78bfa"
            />
            <StatRow
              label="Kunlik sarfiyot"
              value={Math.round((u.energiya || 485) * (u.ishVaqti || 13.3))}
              unit="kVt·s"
              valueColor="#a78bfa"
            />
            <StatRow
              label="O'rtacha"
              value={Math.round((u.energiya || 485) * 0.92)}
              unit="kVt"
              valueColor="text.secondary"
            />
          </Paper>

          {/* Bosim va Harorat */}
          <Paper
            sx={{
              border: "1px solid",
              borderColor: isDark ? "rgba(0,212,255,0.12)" : "divider",
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                px: 2,
                py: 1,
                borderBottom: "1px solid",
                borderColor: isDark ? "rgba(255,255,255,0.04)" : "divider",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Arial', san-serif",
                  fontSize: "0.6rem",
                  color: "text.secondary",
                  letterSpacing: "0.12em",
                }}
              >
                ASOSIY PARAMETRLAR
              </Typography>
            </Box>
            <StatRow
              label="Harorat"
              value={u.harorat || 1650}
              unit="°C"
              valueColor="#ff6b1a"
            />
            <StatRow
              label="Bosim"
              value={u.bosim || 2.4}
              unit="bar"
              valueColor="#00d4ff"
            />
            <StatRow
              label="Quvvat"
              value={u.quvvat || 120}
              unit="MVt"
              valueColor="#00e676"
            />
          </Paper>
        </Box>
      </Box>

      {/* ═══ FOOTER TIME BAR ═══ */}
      <Paper
        sx={{
          mt: 2,
          px: 2.5,
          py: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          border: "1px solid",
          borderColor: isDark ? "rgba(255,255,255,0.06)" : "divider",
          borderRadius: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
          <Box
            sx={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00e676",
              boxShadow: "0 0 8px #00e67660",
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Arial', san-serif",
              fontSize: "0.65rem",
              color: "text.secondary",
            }}
          >
            {formatTime(now)}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 3 }}>
          <Typography
            sx={{
              fontFamily: "'Arial', san-serif",
              fontSize: "0.6rem",
              color: "text.disabled",
            }}
          >
            INTERVAL: 1s
          </Typography>
          <Chip
            label="REALTIME"
            size="small"
            sx={{
              height: 20,
              fontFamily: "'Arial', san-serif",
              fontSize: "0.55rem",
              bgcolor: "#00e67615",
              color: "#00e676",
              borderRadius: "3px",
              border: "1px solid #00e67625",
            }}
          />
        </Box>
      </Paper>
    </Box>
  );
}

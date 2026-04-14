// ═══════════════════════════════════════════════════════════════
//  USKUNA IMAGE VIEW — PI Vision uslubida uskuna ko'rsatish
//  SVG diagrammalar o'rniga transparent PNG + harorat indikatorlar
// ═══════════════════════════════════════════════════════════════
import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Box,
  Typography,
  Paper,
  Chip,
  Grid,
  LinearProgress,
  IconButton,
  useTheme,
} from "@mui/material";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
} from "recharts";
import RefreshIcon from "@mui/icons-material/Refresh";
import {
  getUskunaImage,
  getUskunaTempPoints,
  getHolatColor,
} from "./UskunaImageMap";

// ═══════════════════════════════════════════════════════════════
//  CALLOUT LINE — Premium SCADA/HMI annotation
//  Nuqta (uskunada) → yorqin chiziq → premium glass karta (chetda)
// ═══════════════════════════════════════════════════════════════
function CalloutLine({
  value,
  unit,
  label,
  color = "#00e676",
  dotX = 50,
  dotY = 50,
  side = "left",
  pulse,
  compact = false,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isLeft = side === "left";

  return (
    <>
      {/* ── NUQTA: tashqi halqa + ichki yadro ── */}
      <Box
        sx={{
          position: "absolute",
          left: `${dotX}%`,
          top: `${dotY}%`,
          transform: "translate(-50%, -50%)",
          zIndex: 8,
          pointerEvents: "none",
        }}
      >
        {/* Tashqi halqa */}
        <Box
          sx={{
            width: 18,
            height: 18,
            borderRadius: "50%",
            border: `1.5px solid ${color}55`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `radial-gradient(circle, ${color}12 0%, transparent 70%)`,
            ...(pulse && {
              animation: "cRingPulse 2.5s ease-in-out infinite",
              "@keyframes cRingPulse": {
                "0%,100%": {
                  borderColor: `${color}55`,
                  boxShadow: `0 0 0 0 ${color}20`,
                },
                "50%": {
                  borderColor: `${color}aa`,
                  boxShadow: `0 0 0 5px ${color}08`,
                },
              },
            }),
          }}
        >
          {/* Ichki yadro */}
          <Box
            sx={{
              width: 7,
              height: 7,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 8px ${color}cc, 0 0 16px ${color}40`,
            }}
          />
        </Box>
      </Box>

      {/* ── CHIZIQ: 3 qatlam (glow + asosiy + highlight) ── */}
      <Box
        sx={{
          position: "absolute",
          top: `${dotY}%`,
          left: isLeft ? 0 : `${dotX}%`,
          right: isLeft ? `${100 - dotX}%` : 0,
          height: 0,
          zIndex: 6,
          pointerEvents: "none",
          // 1-qatlam: keng glow (pastda)
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-3px",
            left: 0,
            right: 0,
            height: "6px",
            borderRadius: "3px",
            background: isLeft
              ? `linear-gradient(to right, ${color}03 0%, ${color}12 50%, ${color}25 100%)`
              : `linear-gradient(to left, ${color}03 0%, ${color}12 50%, ${color}25 100%)`,
            filter: "blur(3px)",
          },
          // 2-qatlam: asosiy chiziq
          "&::after": {
            content: '""',
            position: "absolute",
            top: "-0.5px",
            left: 0,
            right: 0,
            height: "1.5px",
            borderRadius: "1px",
            background: isLeft
              ? `linear-gradient(to right, ${color}08 0%, ${color}40 30%, ${color}88 70%, ${color}cc 100%)`
              : `linear-gradient(to left, ${color}08 0%, ${color}40 30%, ${color}88 70%, ${color}cc 100%)`,
          },
        }}
      >
        {/* 3-qatlam: nuqta yonida yorqin uchi */}
        <Box
          sx={{
            position: "absolute",
            top: "-1px",
            ...(isLeft ? { right: 0 } : { left: 0 }),
            width: "30px",
            height: "2px",
            borderRadius: "1px",
            background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${color}dd, transparent)`,
            boxShadow: `0 0 6px ${color}50`,
          }}
        />
      </Box>

      {/* ── KARTA: premium glass panel ── */}
      <Box
        sx={{
          position: "absolute",
          top: `${dotY}%`,
          transform: "translateY(-50%)",
          ...(isLeft ? { left: 0 } : { right: 0 }),
          zIndex: 9,
          pointerEvents: "none",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "stretch",
            flexDirection: isLeft ? "row" : "row-reverse",
            // Tashqi soya
            filter: isDark
              ? `drop-shadow(0 4px 16px rgba(0,0,0,0.5)) drop-shadow(0 0 20px ${color}10)`
              : `drop-shadow(0 4px 12px rgba(0,0,0,0.08))`,
          }}
        >
          {/* Rangli aksent chiziq (gradient + glow) */}
          <Box
            sx={{
              width: 3,
              position: "relative",
              borderRadius: isLeft ? "6px 0 0 6px" : "0 6px 6px 0",
              overflow: "hidden",
              // Asosiy gradient
              background: `linear-gradient(180deg, ${color} 0%, ${color}60 100%)`,
              // Glow effekt
              "&::before": {
                content: '""',
                position: "absolute",
                inset: "-2px",
                background: color,
                filter: "blur(6px)",
                opacity: isDark ? 0.35 : 0.2,
                borderRadius: "inherit",
              },
            }}
          />

          {/* Asosiy karta */}
          <Box
            sx={{
              minWidth: compact ? 82 : 105,
              position: "relative",
              overflow: "hidden",
              // Glass background
              background: isDark
                ? `linear-gradient(135deg, rgba(12,15,28,0.95) 0%, rgba(8,10,22,0.98) 100%)`
                : `linear-gradient(135deg, rgba(255,255,255,0.97) 0%, rgba(248,250,252,0.99) 100%)`,
              backdropFilter: "blur(24px)",
              // Border
              border: `1px solid ${isDark ? `${color}25` : `${color}30`}`,
              borderLeft: isLeft ? "none" : undefined,
              borderRight: !isLeft ? "none" : undefined,
              borderRadius: isLeft ? "0 8px 8px 0" : "8px 0 0 8px",
              px: compact ? 1.2 : 1.5,
              py: compact ? 0.6 : 0.8,
              // Ichki yuqori yorug'lik
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "1px",
                background: isDark
                  ? `linear-gradient(90deg, transparent, ${color}20, transparent)`
                  : `linear-gradient(90deg, transparent, ${color}15, transparent)`,
              },
              // Pulse border animatsiya
              ...(pulse && {
                animation: "cCardGlow 3s ease-in-out infinite",
                "@keyframes cCardGlow": {
                  "0%,100%": {
                    borderColor: isDark ? `${color}25` : `${color}30`,
                  },
                  "50%": { borderColor: isDark ? `${color}55` : `${color}50` },
                },
              }),
            }}
          >
            {/* Label sarlavha */}
            {!!label && (
              <Typography
                sx={{
                  fontFamily: "'Arial', sans-serif",
                  fontSize: compact ? "0.44rem" : "0.48rem",
                  fontWeight: 600,
                  color: isDark ? `${color}70` : `${color}90`,
                  letterSpacing: "0.14em",
                  lineHeight: 1,
                  mb: "4px",
                  textTransform: "uppercase",
                  textAlign: isLeft ? "left" : "right",
                  whiteSpace: "nowrap",
                }}
              >
                {label}
              </Typography>
            )}

            {/* Qiymat qatori */}
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: isLeft ? "flex-start" : "flex-end",
                gap: "5px",
              }}
            >
              {/* Katta raqam */}
              <Typography
                sx={{
                  fontFamily:
                    "'JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Consolas', monospace",
                  fontSize: compact ? "0.88rem" : "1.05rem",
                  fontWeight: 700,
                  color,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  // Yengil text glow
                  textShadow: isDark ? `0 0 12px ${color}30` : "none",
                }}
              >
                {value}
              </Typography>
              {/* Birlik */}
              {!!unit && (
                <Typography
                  sx={{
                    fontFamily: "'Arial', sans-serif",
                    fontSize: compact ? "0.5rem" : "0.56rem",
                    fontWeight: 500,
                    color: isDark ? "#5e6d82" : "#94a3b8",
                    lineHeight: 1,
                  }}
                >
                  {unit}
                </Typography>
              )}
            </Box>
          </Box>
        </Box>
      </Box>
    </>
  );
}

// Backward compatibility — TempIndicator va DataIndicator CalloutLine ga yo'naltiradi
function TempIndicator({
  temp,
  x,
  y,
  side = "right",
  color = "#00e676",
  pulse,
}) {
  return (
    <CalloutLine
      value={temp}
      unit="°C"
      label="Harorat"
      color={color}
      dotX={x}
      dotY={y}
      side={side}
      pulse={pulse}
    />
  );
}

function DataIndicator({
  label,
  value,
  unit,
  x,
  y,
  side = "right",
  color = "#00d4ff",
  pulse,
}) {
  return (
    <CalloutLine
      value={value}
      unit={unit}
      label={label || ""}
      color={color}
      dotX={x}
      dotY={y}
      side={side}
      pulse={pulse}
    />
  );
}

// ─── GAUGE WIDGET (KIO / Quvvat) ────────────────────────────
function GaugeWidget({ value, size = 140, color = "#ff6b1a", label }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const r = (size - 20) / 2;
  const cx = size / 2;
  const cy = size / 2 + 8;
  const startA = 225;
  const endA = -45;
  const totalA = startA - endA;
  const progress = Math.min(value / 100, 1);
  const curA = startA - totalA * progress;

  const p2c = (a) => ({
    x: cx + r * Math.cos((a * Math.PI) / 180),
    y: cy - r * Math.sin((a * Math.PI) / 180),
  });

  const arc = (s, e) => {
    const sp = p2c(s);
    const ep = p2c(e);
    return `M ${sp.x} ${sp.y} A ${r} ${r} 0 ${s - e > 180 ? 1 : 0} 1 ${ep.x} ${ep.y}`;
  };

  const gid = `gauge-${label?.replace(/\s/g, "") || "default"}`;

  return (
    <Box sx={{ position: "relative", width: size, height: size, mx: "auto" }}>
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={gid} x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} />
          </linearGradient>
          <filter id={`gl-${gid}`}>
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {/* BG arc */}
        <path
          d={arc(startA, endA)}
          fill="none"
          stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
          strokeWidth="10"
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <path
          d={arc(startA, curA)}
          fill="none"
          stroke={`url(#${gid})`}
          strokeWidth="10"
          strokeLinecap="round"
          filter={`url(#gl-${gid})`}
        />
        {/* Tick marks */}
        {[0, 25, 50, 75, 100].map((t) => {
          const a = startA - totalA * (t / 100);
          const o = p2c(a);
          const ir = r - 14;
          const inn = {
            x: cx + ir * Math.cos((a * Math.PI) / 180),
            y: cy - ir * Math.sin((a * Math.PI) / 180),
          };
          return (
            <line
              key={t}
              x1={inn.x}
              y1={inn.y}
              x2={o.x}
              y2={o.y}
              stroke={isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.12)"}
              strokeWidth="1.5"
            />
          );
        })}
        {/* Value */}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.22}
          fontFamily="'Arial', san-serif"
          fontWeight="700"
        >
          {typeof value === "number" ? value.toFixed(1) : value}
        </text>
        <text
          x={cx}
          y={cy + size * 0.12}
          textAnchor="middle"
          fill={isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)"}
          fontSize={size * 0.09}
          fontFamily="'Arial', san-serif"
        >
          %
        </text>
      </svg>
      {label && (
        <Typography
          sx={{
            textAlign: "center",
            fontFamily: "'san-serif', sans-serif",
            fontWeight: 700,
            fontSize: "0.68rem",
            color: "text.secondary",
            letterSpacing: "0.1em",
            mt: -0.5,
          }}
        >
          {label}
        </Typography>
      )}
    </Box>
  );
}

// ─── STAT ROW ────────────────────────────────────────────────
function StatRow({ label, value, unit, valueColor }) {
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 0.8,
        px: 1.5,
        borderBottom: "1px solid",
        borderColor: (t) =>
          t.palette.mode === "dark"
            ? "rgba(255,255,255,0.04)"
            : "rgba(0,0,0,0.04)",
        "&:last-child": { borderBottom: "none" },
        "&:hover": {
          bgcolor: (t) =>
            t.palette.mode === "dark"
              ? "rgba(255,255,255,0.015)"
              : "rgba(0,0,0,0.01)",
        },
        transition: "background 0.2s",
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Arial', san-serif",
          fontSize: "0.7rem",
          color: "text.secondary",
        }}
      >
        {label}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
        <Typography
          sx={{
            fontFamily: "'Arial', san-serif",
            fontSize: "0.9rem",
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
              fontSize: "0.55rem",
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

// ─── MINI SPARKLINE ──────────────────────────────────────────
function MiniChart({ data, dataKey, color, title, currentValue, unit }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box>
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
            fontFamily: "'Arial', san-serif",
            fontSize: "0.58rem",
            color: "text.secondary",
            letterSpacing: "0.1em",
          }}
        >
          {title}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Arial', san-serif",
            fontSize: "0.82rem",
            fontWeight: 700,
            color,
          }}
        >
          {currentValue} {unit}
        </Typography>
      </Box>
      <ResponsiveContainer width="100%" height={80}>
        <AreaChart
          data={data}
          margin={{ top: 2, right: 2, bottom: 2, left: 2 }}
        >
          <defs>
            <linearGradient id={`mcg-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.04)"}
          />
          <XAxis
            dataKey="time"
            tick={{
              fontSize: 8,
              fill: isDark ? "#444" : "#bbb",
              fontFamily: "'Arial'",
            }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide domain={["dataMin - 10", "dataMax + 10"]} />
          <RTooltip
            contentStyle={{
              background: isDark
                ? "rgba(10,12,20,0.95)"
                : "rgba(255,255,255,0.95)",
              border: `1px solid ${color}40`,
              borderRadius: 4,
              fontFamily: "'Arial'",
              fontSize: "0.62rem",
            }}
          />
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#mcg-${dataKey})`}
            dot={false}
            activeDot={{ r: 3, fill: color }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════
//  ASOSIY COMPONENT — PI Vision ko'rinishida uskuna ko'rsatish
//  Bu TAB_SXEMA o'rniga ishlatiladi
// ═══════════════════════════════════════════════════════════════
export default function UskunaImageView({ uskuna }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const u = uskuna;
  const c = getHolatColor(u.holat);
  const imageSrc = getUskunaImage(u);
  const defaultTempPoints = useMemo(() => getUskunaTempPoints(u), [u]);

  // Agar real harorat o'lchovlari bo'lsa — ulardan temp nuqtalar yaratish
  const tempPoints = useMemo(() => {
    const temps = u._temperatures || [];
    if (temps.length === 0) return defaultTempPoints;

    // Real haroratlarni rasm ustidagi nuqtalarga mapping
    // DefaultTempPoints pozitsiyalarini saqlab, real qiymatlar bilan almashtirish
    if (defaultTempPoints.length > 0 && temps.length > 0) {
      return defaultTempPoints.map((dp, i) => {
        // Har bir default nuqtaga real harorat tayinlash (davriy)
        const tempIdx = Math.min(i, temps.length - 1);
        const realTemp = temps[tempIdx]?.temperature;
        const tempColor =
          realTemp > 1680
            ? "#ff2d55"
            : realTemp > 1620
              ? "#ffd60a"
              : realTemp > 0
                ? "#00e676"
                : dp.color;
        return {
          ...dp,
          temp: realTemp || dp.temp,
          color: tempColor,
        };
      });
    }

    // Agar defaultTempPoints bo'sh bo'lsa — real datadan to'liq yasash
    const positions = [
      { x: 42, y: 38, side: "left" },
      { x: 58, y: 50, side: "right" },
      { x: 45, y: 65, side: "left" },
      { x: 56, y: 35, side: "right" },
    ];
    return temps.slice(0, 4).map((t, i) => {
      const pos = positions[i] || positions[0];
      const tempColor =
        t.temperature > 1680
          ? "#ff2d55"
          : t.temperature > 1620
            ? "#ffd60a"
            : "#00e676";
      return {
        temp: t.temperature,
        x: pos.x,
        y: pos.y,
        side: pos.side,
        color: tempColor,
        pulse: i === temps.length - 1,
      };
    });
  }, [defaultTempPoints, u._temperatures]);

  const samColor =
    u.samaradorlik > 80
      ? "#00e676"
      : u.samaradorlik > 50
        ? "#ffd60a"
        : "#ff2d55";

  // Real chart data (enrichedUskuna._temperatures dan yoki fallback)
  const chartData = useMemo(() => {
    const temps = u._temperatures || [];
    if (temps.length > 0) {
      return temps.map((t, i) => ({
        time: new Date(t.dateTime).toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        harorat: t.temperature || 0,
        quvvat: Math.round(u.quvvat || (u.averagePower || 0) / 1000 || 100),
      }));
    }
    // Fallback: agar real data yo'q bo'lsa
    const data = [];
    for (let i = 0; i < 20; i++) {
      const h = 12 + Math.floor(i * 3);
      const m = (i * 3) % 60;
      data.push({
        time: `${h % 24}:${String(m).padStart(2, "0")}`,
        harorat: Math.round((u.harorat || 35) * (0.97 + Math.random() * 0.06)),
        quvvat: Math.round((u.quvvat || 100) * (0.9 + Math.random() * 0.2)),
      });
    }
    return data;
  }, [u._temperatures, u.harorat, u.quvvat, u.averagePower]);

  // Rasm ustiga FAQAT eng muhim data — callout chiziqlar bilan chetda
  const extraDataPoints = useMemo(() => {
    const points = [];
    const h = u._latestHeat;
    if (!h) return points;

    // ═══ EAF ═══
    if (u._apiKey === "eaf") {
      const liquid = h.tappingWeight || h.finalSteelWeight || 0;
      if (liquid > 0)
        points.push({
          label: "SUYUQ METALL",
          value: (liquid / 1000).toFixed(1),
          unit: "t",
          x: 35,
          y: 90,
          side: "left",
          color: "#00e676",
          pulse: true,
        });

      if (h.electricalEnergy > 0)
        points.push({
          label: "ENERGIYA",
          value: (h.electricalEnergy / 1000).toFixed(1),
          unit: "MWh",
          x: 65,
          y: 8,
          side: "right",
          color: "#ffd60a",
        });

      if (h.injectedO2 > 0)
        points.push({
          label: "KISLOROD",
          value: Math.round(h.injectedO2),
          unit: "m³",
          x: 38,
          y: 22,
          side: "left",
          color: "#00d4ff",
        });

      if (h.totalScrap > 0)
        points.push({
          label: "LOM",
          value: (h.totalScrap / 1000).toFixed(1),
          unit: "t",
          x: 62,
          y: 92,
          side: "right",
          color: "#ff6b1a",
        });
    }

    // ═══ LRF ═══
    if (u._apiKey === "lrf") {
      const liquid = h.finalSteelWeight || 0;
      if (liquid > 0)
        points.push({
          label: "SUYUQ METALL",
          value: (liquid / 1000).toFixed(1),
          unit: "t",
          x: 35,
          y: 90,
          side: "left",
          color: "#00e676",
          pulse: true,
        });

      if (h.totalArConsumption > 0)
        points.push({
          label: "ARGON",
          value: Number(h.totalArConsumption).toFixed(1),
          unit: "m³",
          x: 60,
          y: 8,
          side: "right",
          color: "#a78bfa",
        });

      if (h.electricalEnergy > 0)
        points.push({
          label: "ENERGIYA",
          value: (h.electricalEnergy / 1000).toFixed(1),
          unit: "MWh",
          x: 62,
          y: 92,
          side: "right",
          color: "#ffd60a",
        });

      if (h.totalN2Consumption > 0)
        points.push({
          label: "AZOT",
          value: Number(h.totalN2Consumption).toFixed(1),
          unit: "m³",
          x: 40,
          y: 22,
          side: "left",
          color: "#00d4ff",
        });
    }

    // ═══ VOD ═══
    if (u._apiKey === "vod") {
      const liquid = h.finalSteelWeight || 0;
      if (liquid > 0)
        points.push({
          label: "SUYUQ METALL",
          value: (liquid / 1000).toFixed(1),
          unit: "t",
          x: 35,
          y: 90,
          side: "left",
          color: "#00e676",
          pulse: true,
        });

      if (h.minVacuumPressure > 0)
        points.push({
          label: "VAKUUM",
          value: Number(h.minVacuumPressure).toFixed(1),
          unit: "mbar",
          x: 60,
          y: 8,
          side: "right",
          color: "#a78bfa",
          pulse: true,
        });

      if (h.totalArConsumption > 0)
        points.push({
          label: "ARGON",
          value: Number(h.totalArConsumption).toFixed(1),
          unit: "m³",
          x: 62,
          y: 92,
          side: "right",
          color: "#a78bfa",
        });

      if (h.totalOxygen > 0)
        points.push({
          label: "KISLOROD",
          value: Math.round(h.totalOxygen),
          unit: "m³",
          x: 40,
          y: 22,
          side: "left",
          color: "#00d4ff",
        });
    }

    // ═══ TSC ═══
    if (u._apiKey === "tsc") {
      const liquid = h.startSteelWeight || h.finalSteelWeight || 0;
      if (liquid > 0)
        points.push({
          label: "SUYUQ METALL",
          value: (liquid / 1000).toFixed(1),
          unit: "t",
          x: 35,
          y: 90,
          side: "left",
          color: "#00e676",
          pulse: true,
        });

      if (h.tscStrands?.length) {
        const avgSpd =
          h.tscStrands.reduce((s, st) => s + (st.castSpeedAvg || 0), 0) /
          h.tscStrands.length;
        if (avgSpd > 0)
          points.push({
            label: "QUYISH TEZLIGI",
            value: avgSpd.toFixed(2),
            unit: "m/min",
            x: 60,
            y: 8,
            side: "right",
            color: "#00d4ff",
            pulse: true,
          });
      }

      if ((h.tscProducts || []).length > 0)
        points.push({
          label: "MAHSULOT",
          value: h.tscProducts.length,
          unit: "ta",
          x: 62,
          y: 92,
          side: "right",
          color: "#ff9500",
        });

      if (h.tundishId)
        points.push({
          label: "TUNDISH",
          value: h.tundishId,
          unit: `#${h.tundishLife || "—"}`,
          x: 40,
          y: 22,
          side: "left",
          color: "#ff6b1a",
        });
    }

    return points;
  }, [u._latestHeat, u._apiKey]);

  return (
    <Grid container spacing={2}>
      {/* ═══ CHAP PANEL: Gauge + Grafik ═══ */}
      <Grid item xs={12} md={2.5}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Samaradorlik Gauge */}
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              border: `1px solid ${samColor}20`,
              background: isDark
                ? `linear-gradient(180deg, ${samColor}05 0%, transparent 100%)`
                : undefined,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: "0.58rem",
                color: "text.secondary",
                letterSpacing: "0.12em",
                mb: 1,
              }}
            >
              QUVVAT
            </Typography>
            <GaugeWidget
              value={u.samaradorlik || 0}
              size={150}
              color={samColor}
              label="Samaradorlik"
            />
          </Paper>

          {/* Harorat grafigi — real data */}
          <Paper sx={{ p: 1.5, border: "1px solid", borderColor: "divider" }}>
            <MiniChart
              data={chartData}
              dataKey="harorat"
              color="#ff6b1a"
              title="HARORAT"
              currentValue={u.harorat || "—"}
              unit="°C"
            />
          </Paper>

          {/* Quvvat grafigi */}
          <Paper sx={{ p: 1.5, border: "1px solid", borderColor: "divider" }}>
            <MiniChart
              data={chartData}
              dataKey="quvvat"
              color="#a78bfa"
              title={
                u._apiKey === "eaf"
                  ? "QUVVAT"
                  : u._apiKey === "lrf"
                    ? "QUVVAT"
                    : "QUVVAT"
              }
              currentValue={u.quvvat || "—"}
              unit={u.averagePower > 1000 ? "MW" : "kW"}
            />
          </Paper>

          {/* Suyuq metall — faqat agar mavjud bo'lsa */}
          {u._latestHeat &&
            (u._latestHeat.tappingWeight > 0 ||
              u._latestHeat.finalSteelWeight > 0) && (
              <Paper
                sx={{
                  p: 1.5,
                  border: "1px solid",
                  borderColor: "divider",
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
                      fontFamily: "'Arial', san-serif",
                      fontSize: "0.58rem",
                      color: "text.secondary",
                      letterSpacing: "0.1em",
                    }}
                  >
                    🫗 SUYUQ METALL
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Arial', san-serif",
                      fontSize: "0.82rem",
                      fontWeight: 700,
                      color: "#00e676",
                    }}
                  >
                    {(
                      (u._latestHeat.tappingWeight ||
                        u._latestHeat.finalSteelWeight ||
                        0) / 1000
                    ).toFixed(1)}{" "}
                    t
                  </Typography>
                </Box>
                {/* Tank vizualizatsiya */}
                <Box
                  sx={{
                    height: 24,
                    borderRadius: 1,
                    background: isDark
                      ? "rgba(255,255,255,0.03)"
                      : "rgba(0,0,0,0.04)",
                    border: "1px solid rgba(0,230,118,0.12)",
                    overflow: "hidden",
                    position: "relative",
                  }}
                >
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      width: `${Math.min(
                        100,
                        ((u._latestHeat.tappingWeight ||
                          u._latestHeat.finalSteelWeight ||
                          0) /
                          1000 /
                          140) *
                          100,
                      )}%`,
                      height: "100%",
                      background:
                        "linear-gradient(90deg, #ffd60a, #ff6b1a, #ff2d55)",
                      opacity: 0.6,
                      borderRadius: 1,
                      transition: "width 0.8s ease",
                    }}
                  />
                </Box>
              </Paper>
            )}
        </Box>
      </Grid>

      {/* ═══ MARKAZ: Uskuna rasmi + harorat indikatorlar ═══ */}
      <Grid item xs={12} md={7}>
        <Paper
          sx={{
            position: "relative",
            overflow: "visible",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: { xs: 350, md: 520 },
            border: `1px solid ${c}20`,
            background: isDark
              ? `radial-gradient(ellipse at center, ${c}04 0%, transparent 70%)`
              : `radial-gradient(ellipse at center, ${c}06 0%, transparent 70%)`,
          }}
        >
          {/* Grid pattern */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: isDark
                ? "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)"
                : "linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              zIndex: 1,
            }}
          />

          {/* Glowing ring */}
          {/* <Box
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
                opacity="0.4"
              />
              <ellipse
                cx="200"
                cy="30"
                rx="195"
                ry="25"
                fill="none"
                stroke={c}
                strokeWidth="1"
                opacity="0.12"
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
          </Box> */}

          {/* Glow shadow */}
          <Box
            sx={{
              position: "absolute",
              bottom: "7%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "60%",
              height: 0,
              boxShadow: `0 0 80px 40px ${c}12, 0 0 120px 60px ${c}06`,
              zIndex: 1,
            }}
          />

          {/* Equipment Image */}
          <Box
            sx={{
              position: "relative",
              width: "80%",
              // maxWidth: 450,
              zIndex: 3,
              filter: isDark
                ? "drop-shadow(0 20px 60px rgba(0,0,0,0.6))"
                : "drop-shadow(0 15px 30px rgba(0,0,0,0.12))",
            }}
          >
            <img
              src={imageSrc}
              alt={u.nom || "Uskuna"}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
                objectFit: "contain",
              }}
              onError={(e) => {
                // Fallback: agar rasm topilmasa placeholder ko'rsat
                e.target.style.display = "none";
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
                side={tp.side}
                pulse={tp.pulse}
              />
            ))}

            {/* Qo'shimcha real data indikatorlar (suyuq metall, energiya, O2...) */}
            {extraDataPoints.map((dp, i) => (
              <DataIndicator
                key={`data-${i}`}
                label={dp.label}
                value={dp.value}
                unit={dp.unit}
                icon={dp.icon}
                x={dp.x}
                y={dp.y}
                side={dp.side}
                color={dp.color}
                pulse={dp.pulse}
                size={dp.size}
              />
            ))}
          </Box>

          {/* Top label — real heat kontekst */}
          <Box
            sx={{
              position: "absolute",
              top: 14,
              left: 18,
              zIndex: 5,
              display: "flex",
              alignItems: "center",
              gap: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "text.secondary",
                letterSpacing: "0.15em",
              }}
            >
              KO'RSATKICHLAR
            </Typography>
            {u._latestHeat && (
              <Chip
                label={`#${u._latestHeat.heatId} · ${u._latestHeat.steelGradeName || ""}`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.5rem",
                  fontFamily: "'Arial', san-serif",
                  bgcolor: `${c}15`,
                  color: c,
                  border: `1px solid ${c}30`,
                }}
              />
            )}
          </Box>

          {/* Top-right: holat */}
          <Box
            sx={{
              position: "absolute",
              top: 14,
              right: 18,
              display: "flex",
              alignItems: "center",
              gap: 1,
              zIndex: 5,
            }}
          >
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                background: c,
                boxShadow: `0 0 10px ${c}80`,
                animation:
                  u.holat === "faol"
                    ? "statusGlow 2s ease-in-out infinite"
                    : "none",
                "@keyframes statusGlow": {
                  "0%, 100%": { boxShadow: `0 0 10px ${c}80` },
                  "50%": { boxShadow: `0 0 20px ${c}` },
                },
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: "0.6rem",
                color: c,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              {u.holat?.toUpperCase?.() || "—"}
            </Typography>
          </Box>
        </Paper>
      </Grid>

      {/* ═══ O'NG PANEL: KIO + Stats ═══ */}
      <Grid item xs={12} md={2.5}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* KIO Gauge */}
          <Paper
            sx={{
              p: 2,
              textAlign: "center",
              border: `1px solid ${c}15`,
              background: isDark
                ? `linear-gradient(180deg, ${c}04 0%, transparent 100%)`
                : undefined,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: "0.58rem",
                color: "text.secondary",
                letterSpacing: "0.12em",
                mb: 1,
              }}
            >
              KIO
            </Typography>
            <GaugeWidget value={u.kio ?? 100} size={150} color={c} label="" />
          </Paper>

          {/* Ish vaqti */}
          <Paper sx={{ border: "1px solid", borderColor: "divider" }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.8,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Arial', san-serif",
                  fontSize: "0.58rem",
                  color: "text.secondary",
                  letterSpacing: "0.12em",
                }}
              >
                ISH VAQTI
              </Typography>
            </Box>
            <StatRow
              label="Ish vaqti"
              value={u.ishVaqti || "—"}
              unit="soat"
              valueColor="#00e676"
            />
            <StatRow label="Prostoy" value={u.prostoy ?? "0.0"} unit="soat" />
          </Paper>

          {/* Asosiy parametrlar — real API data */}
          <Paper sx={{ border: "1px solid", borderColor: "divider" }}>
            <Box
              sx={{
                px: 1.5,
                py: 0.8,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Arial', san-serif",
                  fontSize: "0.58rem",
                  color: "text.secondary",
                  letterSpacing: "0.12em",
                }}
              >
                PARAMETRLAR
              </Typography>
            </Box>
            <StatRow
              label="Harorat"
              value={u.harorat || "—"}
              unit="°C"
              valueColor="#ff6b1a"
            />
            {/* EAF specific */}
            {u._apiKey === "eaf" && (
              <>
                <StatRow
                  label="Suyuq metall"
                  value={
                    u.tappingWeight ? (u.tappingWeight / 1000).toFixed(1) : "—"
                  }
                  unit="t"
                  valueColor="#00e676"
                />
                <StatRow
                  label="Elektr"
                  value={
                    u.electricalEnergy
                      ? (u.electricalEnergy / 1000).toFixed(1)
                      : "—"
                  }
                  unit="MWh"
                  valueColor="#ffd60a"
                />
                <StatRow
                  label="Kislorod"
                  value={u.injectedO2 ? Math.round(u.injectedO2) : "—"}
                  unit="m³"
                  valueColor="#00d4ff"
                />
              </>
            )}
            {/* LRF specific */}
            {u._apiKey === "lrf" && (
              <>
                <StatRow
                  label="Argon"
                  value={
                    u.totalArConsumption
                      ? Number(u.totalArConsumption).toFixed(1)
                      : "—"
                  }
                  unit="m³"
                  valueColor="#a78bfa"
                />
                <StatRow
                  label="Quvvat"
                  value={u.quvvat || "—"}
                  unit="MW"
                  valueColor="#ffd60a"
                />
              </>
            )}
            {/* VOD specific */}
            {u._apiKey === "vod" && (
              <>
                <StatRow
                  label="Vakuum"
                  value={
                    u.minVacuumPressure
                      ? Number(u.minVacuumPressure).toFixed(1)
                      : "—"
                  }
                  unit="mbar"
                  valueColor="#a78bfa"
                />
                <StatRow
                  label="Chuqur vak."
                  value={
                    u.totalDeepVacuumTime
                      ? Math.floor(u.totalDeepVacuumTime / 60)
                      : "—"
                  }
                  unit="min"
                  valueColor="#00d4ff"
                />
              </>
            )}
            {/* TSC specific */}
            {u._apiKey === "tsc" && u.avgCastSpeed && (
              <StatRow
                label="Quyish tezl."
                value={u.avgCastSpeed}
                unit="m/min"
                valueColor="#00d4ff"
              />
            )}
            {/* Umumiy: bosim va TA — faqat agar API-specific yo'q bo'lsa */}
            {!u._apiKey && (
              <>
                <StatRow
                  label="Bosim"
                  value={u.bosim || "—"}
                  unit="bar"
                  valueColor="#00d4ff"
                />
                <StatRow
                  label="Quvvat"
                  value={u.quvvat || "—"}
                  unit="kW"
                  valueColor="#a78bfa"
                />
              </>
            )}
            <StatRow
              label="Keyingi TA"
              value={u.keyingiTA || "—"}
              unit="kun"
              valueColor={u.keyingiTA < 30 ? "#ffd60a" : "text.secondary"}
            />
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );
}

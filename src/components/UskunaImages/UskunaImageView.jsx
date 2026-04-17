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
import { useScriptText } from "@/hooks/useScriptText";
import {
  getUskunaImage,
  getUskunaTempPoints,
  getHolatColor,
} from "./UskunaImageMap";

// ═══════════════════════════════════════════════════════════════
//  CALLOUT LINE — Premium SCADA/HMI annotation with elbow connector
//  Nuqta (uskunada) → gorizontal chiziq → vertikal tirsakli → glass karta (chetda)
// ═══════════════════════════════════════════════════════════════
function CalloutLine({
  value,
  unit,
  label,
  color = "#00e676",
  dotX = 50,
  dotY = 50,
  cardY: _cardY,
  side = "left",
  pulse,
  compact = false,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isLeft = side === "left";
  const { t } = useScriptText();

  const cardY = _cardY ?? dotY;
  const hasElbow = Math.abs(cardY - dotY) > 1.5;
  const elbowTop = Math.min(dotY, cardY);
  const elbowHeight = Math.abs(cardY - dotY);

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
        <Box
          sx={{
            width: 20,
            height: 20,
            borderRadius: "50%",
            border: `2px solid ${color}60`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
            ...(pulse && {
              animation: "cRingPulse 2.5s ease-in-out infinite",
              "@keyframes cRingPulse": {
                "0%,100%": {
                  borderColor: `${color}55`,
                  boxShadow: `0 0 0 0 ${color}20`,
                },
                "50%": {
                  borderColor: `${color}bb`,
                  boxShadow: `0 0 0 6px ${color}12`,
                },
              },
            }),
          }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: color,
              boxShadow: `0 0 10px ${color}cc, 0 0 18px ${color}50`,
            }}
          />
        </Box>
      </Box>

      {/* ── GORIZONTAL CHIZIQ: nuqtadan chetga (dotY darajasida) ── */}
      <Box
        sx={{
          position: "absolute",
          top: `${dotY}%`,
          left: isLeft ? 0 : `${dotX}%`,
          right: isLeft ? `${100 - dotX}%` : 0,
          height: 0,
          zIndex: 6,
          pointerEvents: "none",
          // Glow
          "&::before": {
            content: '""',
            position: "absolute",
            top: "-3px",
            left: 0,
            right: 0,
            height: "6px",
            borderRadius: "3px",
            background: isLeft
              ? `linear-gradient(to right, ${color}04 0%, ${color}15 50%, ${color}30 100%)`
              : `linear-gradient(to left, ${color}04 0%, ${color}15 50%, ${color}30 100%)`,
            filter: "blur(3px)",
          },
          // Asosiy chiziq
          "&::after": {
            content: '""',
            position: "absolute",
            top: "-0.75px",
            left: 0,
            right: 0,
            height: "2px",
            borderRadius: "1px",
            background: isLeft
              ? `linear-gradient(to right, ${color}08 0%, ${color}50 30%, ${color}99 70%, ${color}dd 100%)`
              : `linear-gradient(to left, ${color}08 0%, ${color}50 30%, ${color}99 70%, ${color}dd 100%)`,
          },
        }}
      >
        {/* Nuqta yonida yorqin uchi */}
        <Box
          sx={{
            position: "absolute",
            top: "-1px",
            ...(isLeft ? { right: 0 } : { left: 0 }),
            width: "28px",
            height: "2px",
            borderRadius: "1px",
            background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${color}dd, transparent)`,
            boxShadow: `0 0 6px ${color}50`,
          }}
        />
      </Box>

      {/* ── VERTIKAL TIRSAKLI CHIZIQ: dotY dan cardY gacha chetda ── */}
      {hasElbow && (
        <Box
          sx={{
            position: "absolute",
            top: `${elbowTop}%`,
            height: `${elbowHeight}%`,
            ...(isLeft ? { left: 0 } : { right: 0 }),
            width: 0,
            zIndex: 6,
            pointerEvents: "none",
            // Vertikal chiziq
            "&::after": {
              content: '""',
              position: "absolute",
              top: 0,
              ...(isLeft ? { left: "-1px" } : { right: "-1px" }),
              width: "2px",
              height: "100%",
              borderRadius: "1px",
              background: `linear-gradient(to bottom, ${color}${dotY < cardY ? "cc" : "40"} 0%, ${color}${dotY < cardY ? "40" : "cc"} 100%)`,
            },
            // Glow
            "&::before": {
              content: '""',
              position: "absolute",
              top: 0,
              ...(isLeft ? { left: "-3px" } : { right: "-3px" }),
              width: "6px",
              height: "100%",
              borderRadius: "3px",
              background: `linear-gradient(to bottom, ${color}12, ${color}06)`,
              filter: "blur(3px)",
            },
          }}
        />
      )}

      {/* ── KARTA: premium glass panel — cardY pozitsiyasida ── */}
      <Box
        sx={{
          position: "absolute",
          top: `${cardY}%`,
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
            filter: isDark
              ? `drop-shadow(0 4px 16px rgba(0,0,0,0.5)) drop-shadow(0 0 20px ${color}12)`
              : `drop-shadow(0 4px 14px rgba(0,0,0,0.1)) drop-shadow(0 1px 3px rgba(0,0,0,0.06))`,
          }}
        >
          {/* Rangli aksent chiziq */}
          <Box
            sx={{
              width: 4,
              position: "relative",
              borderRadius: isLeft ? "6px 0 0 6px" : "0 6px 6px 0",
              overflow: "hidden",
              background: `linear-gradient(180deg, ${color} 0%, ${color}60 100%)`,
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
              minWidth: compact ? 100 : 125,
              position: "relative",
              overflow: "hidden",
              background: isDark
                ? `linear-gradient(135deg, rgba(15,18,35,0.96) 0%, rgba(10,12,26,0.98) 100%)`
                : `linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,250,0.99) 100%)`,
              backdropFilter: "blur(24px)",
              border: `1px solid ${isDark ? `${color}30` : `${color}40`}`,
              borderLeft: isLeft ? "none" : undefined,
              borderRight: !isLeft ? "none" : undefined,
              borderRadius: isLeft ? "0 10px 10px 0" : "10px 0 0 10px",
              px: compact ? 1.4 : 1.8,
              py: compact ? 0.8 : 1,
              ...(!isDark && {
                boxShadow: `0 2px 8px rgba(0,0,0,0.06), 0 0 0 1px ${color}12`,
              }),
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "1px",
                background: isDark
                  ? `linear-gradient(90deg, transparent, ${color}25, transparent)`
                  : `linear-gradient(90deg, transparent, ${color}20, transparent)`,
              },
              ...(pulse && {
                animation: "cCardGlow 3s ease-in-out infinite",
                "@keyframes cCardGlow": {
                  "0%,100%": {
                    borderColor: isDark ? `${color}30` : `${color}40`,
                  },
                  "50%": { borderColor: isDark ? `${color}60` : `${color}55` },
                },
              }),
            }}
          >
            {/* Label */}
            {!!label && (
              <Typography
                sx={{
                  fontFamily: "'Arial', sans-serif",
                  fontSize: compact ? "0.54rem" : "0.6rem",
                  fontWeight: 700,
                  color: isDark ? `${color}90` : color,
                  letterSpacing: "0.14em",
                  lineHeight: 1,
                  mb: "5px",
                  textTransform: "uppercase",
                  textAlign: isLeft ? "left" : "right",
                  whiteSpace: "nowrap",
                }}
              >
                {t(label)}
              </Typography>
            )}

            {/* Qiymat */}
            <Box
              sx={{
                display: "flex",
                alignItems: "baseline",
                justifyContent: isLeft ? "flex-start" : "flex-end",
                gap: "6px",
              }}
            >
              <Typography
                sx={{
                  fontFamily:
                    "'JetBrains Mono', 'SF Mono', 'Cascadia Code', 'Consolas', monospace",
                  fontSize: compact ? "1.1rem" : "1.3rem",
                  fontWeight: 700,
                  color,
                  lineHeight: 1,
                  letterSpacing: "-0.03em",
                  textShadow: isDark
                    ? `0 0 14px ${color}40`
                    : `0 1px 2px rgba(0,0,0,0.08)`,
                }}
              >
                {value}
              </Typography>
              {!!unit && (
                <Typography
                  sx={{
                    fontFamily: "'Arial', sans-serif",
                    fontSize: compact ? "0.6rem" : "0.68rem",
                    fontWeight: 600,
                    color: isDark ? "#7a8a9e" : "#64748b",
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

// Backward compat — TempIndicator va DataIndicator CalloutLine ga yo'naltiradi
function TempIndicator({
  temp,
  x,
  y,
  cardY,
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
      cardY={cardY}
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
  cardY,
  side = "right",
  color = "#00d4ff",
  pulse,
  compact,
}) {
  return (
    <CalloutLine
      value={value}
      unit={unit}
      label={label || ""}
      color={color}
      dotX={x}
      dotY={y}
      cardY={cardY}
      side={side}
      pulse={pulse}
      compact={compact}
    />
  );
}

// ─── GAUGE WIDGET (KIO / Quvvat) ────────────────────────────
function GaugeWidget({ value, size = 140, color = "#ff6b1a", label }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { t } = useScriptText();
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
        {[0, 25, 50, 75, 100].map((tick) => {
          const a = startA - totalA * (tick / 100);
          const o = p2c(a);
          const ir = r - 14;
          const inn = {
            x: cx + ir * Math.cos((a * Math.PI) / 180),
            y: cy - ir * Math.sin((a * Math.PI) / 180),
          };
          return (
            <line
              key={tick}
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
          fontFamily="'Arial', sans-serif"
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
          fontFamily="'Arial', sans-serif"
        >
          %
        </text>
      </svg>
      {label && (
        <Typography
          sx={{
            textAlign: "center",
            fontFamily: "'Arial', sans-serif",
            fontWeight: 700,
            fontSize: "0.68rem",
            color: "text.secondary",
            letterSpacing: "0.1em",
            mt: -0.5,
          }}
        >
          {t(label)}
        </Typography>
      )}
    </Box>
  );
}

// ─── STAT ROW ────────────────────────────────────────────────
function StatRow({ label, value, unit, valueColor }) {
  const { t } = useScriptText();

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 0.8,
        px: 1.5,
        borderBottom: "1px solid",
        borderColor: (themeObj) =>
          themeObj.palette.mode === "dark"
            ? "rgba(255,255,255,0.04)"
            : "rgba(0,0,0,0.04)",
        "&:last-child": { borderBottom: "none" },
        "&:hover": {
          bgcolor: (themeObj) =>
            themeObj.palette.mode === "dark"
              ? "rgba(255,255,255,0.015)"
              : "rgba(0,0,0,0.01)",
        },
        transition: "background 0.2s",
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Arial', sans-serif",
          fontSize: "0.7rem",
          color: "text.secondary",
        }}
      >
        {t(label)}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5 }}>
        <Typography
          sx={{
            fontFamily: "'Arial', sans-serif",
            fontSize: "0.9rem",
            fontWeight: 700,
            color: valueColor || "text.primary",
          }}
        >
          {typeof value === "string" ? t(value) : value}
        </Typography>
        {unit && (
          <Typography
            sx={{
              fontFamily: "'Arial', sans-serif",
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
  const { t } = useScriptText();

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
            fontFamily: "'Arial', sans-serif",
            fontSize: "0.58rem",
            color: "text.secondary",
            letterSpacing: "0.1em",
          }}
        >
          {t(title)}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Arial', sans-serif",
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
  const { t } = useScriptText();

  const u = uskuna;
  const c = getHolatColor(u.holat);
  const imageSrc = getUskunaImage(u);
  const defaultTempPoints = useMemo(() => getUskunaTempPoints(u), [u]);

  // Agar real harorat o'lchovlari bo'lsa — ulardan temp nuqtalar yaratish
  const tempPoints = useMemo(() => {
    const MAX_TEMP_POINTS = 2; // Faqat 2 ta harorat ko'rsatiladi
    const temps = u._temperatures || [];
    if (temps.length === 0) return defaultTempPoints.slice(0, MAX_TEMP_POINTS);

    // Real haroratlarni rasm ustidagi nuqtalarga mapping
    // DefaultTempPoints pozitsiyalarini saqlab, real qiymatlar bilan almashtirish
    if (defaultTempPoints.length > 0 && temps.length > 0) {
      return defaultTempPoints.slice(0, MAX_TEMP_POINTS).map((dp, i) => {
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
      { x: 42, y: 40, side: "left" },
      { x: 60, y: 62, side: "right" },
    ];
    return temps.slice(0, MAX_TEMP_POINTS).map((temp, i) => {
      const pos = positions[i] || positions[0];
      const tempColor =
        temp.temperature > 1680
          ? "#ff2d55"
          : temp.temperature > 1620
            ? "#ffd60a"
            : "#00e676";
      return {
        temp: temp.temperature,
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
      return temps.map((temp) => ({
        time: new Date(temp.dateTime).toLocaleTimeString("uz-UZ", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        harorat: temp.temperature || 0,
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
          x: 72,
          y: 50,
          side: "right",
          color: "#ffd60a",
          compact: true,
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

  // ═══ OVERLAP RESOLUTION (elbow connector support) ═══
  // dotY — nuqta pozitsiyasi (o'zgarmaydi), cardY — karta pozitsiyasi (adjust qilinadi)
  const { resolvedTempPoints, resolvedExtraPoints } = useMemo(() => {
    const MIN_GAP = 14; // kartalar orasida minimal % masofa

    // Barcha nuqtalarni yig'ish, dotY ni saqlash
    const all = [
      ...tempPoints.map((p, i) => ({
        ...p,
        _type: "temp",
        _idx: i,
        dotY: p.y,
        cardY: p.y,
      })),
      ...extraDataPoints.map((p, i) => ({
        ...p,
        _type: "extra",
        _idx: i,
        dotY: p.y,
        cardY: p.y,
      })),
    ];

    // Tomonlar bo'yicha guruhlash
    const sides = { left: [], right: [] };
    all.forEach((p) => {
      const s = p.side || "right";
      if (sides[s]) sides[s].push(p);
    });

    // Har bir guruhdagi kartalarni dotY bo'yicha sort, keyin cardY ni adjust
    Object.values(sides).forEach((group) => {
      group.sort((a, b) => a.dotY - b.dotY);
      for (let i = 1; i < group.length; i++) {
        const prev = group[i - 1];
        const curr = group[i];
        if (curr.cardY - prev.cardY < MIN_GAP) {
          curr.cardY = prev.cardY + MIN_GAP;
        }
      }
      // Agar eng pastdagi karta 95% dan oshsa — yuqoriga qaytarish
      const last = group[group.length - 1];
      if (last && last.cardY > 95) {
        const overflow = last.cardY - 95;
        group.forEach((p) => {
          p.cardY = Math.max(3, p.cardY - overflow);
        });
        // Qayta tekshirish
        for (let i = 1; i < group.length; i++) {
          if (group[i].cardY - group[i - 1].cardY < MIN_GAP) {
            group[i].cardY = group[i - 1].cardY + MIN_GAP;
          }
        }
      }
    });

    // Natijalarni qaytarish — y = dotY (nuqta), cardY = adjusted karta pozitsiyasi
    const rTemp = all
      .filter((p) => p._type === "temp")
      .sort((a, b) => a._idx - b._idx)
      .map(({ _type, _idx, ...rest }) => ({ ...rest, y: rest.dotY }));

    const rExtra = all
      .filter((p) => p._type === "extra")
      .sort((a, b) => a._idx - b._idx)
      .map(({ _type, _idx, ...rest }) => ({ ...rest, y: rest.dotY }));

    return { resolvedTempPoints: rTemp, resolvedExtraPoints: rExtra };
  }, [tempPoints, extraDataPoints]);

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
                fontFamily: "'Arial', sans-serif",
                fontSize: "0.58rem",
                color: "text.secondary",
                letterSpacing: "0.12em",
                mb: 1,
              }}
            >
              {t("QUVVAT")}
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
                      fontFamily: "'Arial', sans-serif",
                      fontSize: "0.58rem",
                      color: "text.secondary",
                      letterSpacing: "0.1em",
                    }}
                  >
                    🫗 {t("SUYUQ METALL")}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Arial', sans-serif",
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

            {/* Temperature indicators — elbow connector */}
            {resolvedTempPoints.map((tp, i) => (
              <TempIndicator
                key={i}
                temp={tp.temp}
                x={tp.x}
                y={tp.dotY}
                cardY={tp.cardY}
                color={tp.color}
                side={tp.side}
                pulse={tp.pulse}
              />
            ))}

            {/* Qo'shimcha real data indikatorlar — elbow connector */}
            {resolvedExtraPoints.map((dp, i) => (
              <DataIndicator
                key={`data-${i}`}
                label={dp.label}
                value={dp.value}
                unit={dp.unit}
                x={dp.x}
                y={dp.dotY}
                cardY={dp.cardY}
                side={dp.side}
                color={dp.color}
                pulse={dp.pulse}
                compact={dp.compact}
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
                fontFamily: "'Arial', sans-serif",
                fontSize: "0.68rem",
                fontWeight: 600,
                color: "text.secondary",
                letterSpacing: "0.15em",
              }}
            >
              {t("KO'RSATKICHLAR")}
            </Typography>
            {u._latestHeat && (
              <Chip
                label={`#${u._latestHeat.heatId} · ${t(
                  u._latestHeat.steelGradeName || "",
                )}`}
                size="small"
                sx={{
                  height: 18,
                  fontSize: "0.5rem",
                  fontFamily: "'Arial', sans-serif",
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
                fontFamily: "'Arial', sans-serif",
                fontSize: "0.6rem",
                color: c,
                fontWeight: 700,
                letterSpacing: "0.08em",
              }}
            >
              {t(u.holat?.toUpperCase?.() || "—")}
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
                fontFamily: "'Arial', sans-serif",
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
                  fontFamily: "'Arial', sans-serif",
                  fontSize: "0.58rem",
                  color: "text.secondary",
                  letterSpacing: "0.12em",
                }}
              >
                {t("ISH VAQTI")}
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
                  fontFamily: "'Arial', sans-serif",
                  fontSize: "0.58rem",
                  color: "text.secondary",
                  letterSpacing: "0.12em",
                }}
              >
                {t("PARAMETRLAR")}
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

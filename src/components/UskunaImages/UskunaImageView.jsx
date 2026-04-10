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

// ─── HARORAT INDIKATORI (rasm ustida) ────────────────────────
function TempIndicator({
  temp,
  x,
  y,
  side = "right",
  color = "#00e676",
  pulse,
}) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const isLeft = side === "left";

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
        gap: "4px",
        flexDirection: isLeft ? "row-reverse" : "row",
        pointerEvents: "none",
      }}
    >
      {/* Nuqta */}
      <Box
        sx={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 10px ${color}, 0 0 20px ${color}40`,
          flexShrink: 0,
          ...(pulse && {
            animation: "tempPulse 2s ease-in-out infinite",
            "@keyframes tempPulse": {
              "0%, 100%": { transform: "scale(1)", opacity: 1 },
              "50%": { transform: "scale(1.4)", opacity: 0.6 },
            },
          }),
        }}
      />
      {/* Chiziq */}
      <Box
        sx={{
          width: 28,
          height: "1px",
          flexShrink: 0,
          background: `linear-gradient(${isLeft ? "to left" : "to right"}, ${color}, transparent)`,
        }}
      />
      {/* Label */}
      <Box
        sx={{
          background: isDark ? "rgba(0,0,0,0.88)" : "rgba(255,255,255,0.95)",
          border: `1px solid ${color}35`,
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
            fontSize: "0.7rem",
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
  const tempPoints = useMemo(() => getUskunaTempPoints(u), [u]);

  const samColor =
    u.samaradorlik > 80
      ? "#00e676"
      : u.samaradorlik > 50
        ? "#ffd60a"
        : "#ff2d55";

  // Mock chart data (production da API dan keladigan data bilan almashtiring)
  const chartData = useMemo(() => {
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
  }, [u.harorat, u.quvvat]);

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

          {/* Harorat grafigi */}
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
              title="QUVVAT"
              currentValue={u.quvvat || "—"}
              unit="kW"
            />
          </Paper>
        </Box>
      </Grid>

      {/* ═══ MARKAZ: Uskuna rasmi + harorat indikatorlar ═══ */}
      <Grid item xs={12} md={7}>
        <Paper
          sx={{
            position: "relative",
            overflow: "hidden",
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
          </Box>

          {/* Top label */}
          <Typography
            sx={{
              position: "absolute",
              top: 14,
              left: 18,
              fontFamily: "'Arial', san-serif",
              fontSize: "0.68rem",
              fontWeight: 600,
              color: "text.secondary",
              letterSpacing: "0.15em",
              zIndex: 5,
            }}
          >
            KO'RSATKICHLAR
          </Typography>

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
            <GaugeWidget value={100} size={150} color={c} label="" />
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
            <StatRow label="Prostoy" value="0.0" unit="soat" />
          </Paper>

          {/* Asosiy parametrlar */}
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
            <StatRow
              label="Keyingi TA"
              value={u.keyingiTA || "—"}
              unit="kun"
              valueColor={u.keyingiTA < 30 ? "#ffd60a" : "text.secondary"}
            />
          </Paper>

          {/* Ma'lumotlar */}
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
                MA'LUMOTLAR
              </Typography>
            </Box>
            <StatRow label="Model" value={u.model || "—"} />
            <StatRow label="Hudud" value={u.uchastkId || "—"} />
            <StatRow label="Ishlab" value={u.ishlab || "—"} />
          </Paper>
        </Box>
      </Grid>
    </Grid>
  );
}

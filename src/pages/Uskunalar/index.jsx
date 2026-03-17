import { useState, useCallback } from "react";
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
  Drawer,
  Divider,
  IconButton,
  Tabs,
  Tab,
  useTheme,
  Chip,
  Badge,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  CircularProgress,
  Collapse,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { getUskunalar, getSexlar } from "@/api";
import { useEAFReport } from "@/hooks/useProduction";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RTooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import RefreshIcon from "@mui/icons-material/Refresh";
import { StatusChip, SectionHeader, CardSkeleton } from "@/components/common";
import { setUskunaFilter, setUskunaSelected } from "@/store";
import { DataGrid } from "@mui/x-data-grid";
import { CameraFeed } from "../Kameralar";

// ─── RANG PALITRALARI ───────────────────────────────────────────────
const TUR_COLOR = {
  Pech: "#ff6b1a",
  Konverter: "#00d4ff",
  "Elektr Pech": "#a78bfa",
  Prokat: "#00e676",
  Nasos: "#29b6f6",
  Kran: "#ffd60a",
  Kesish: "#ff5252",
};

// ─── QISM TOOLTIP PANELI ────────────────────────────────────────────
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
              fontFamily: "'Share Tech Mono',monospace",
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
              fontFamily: "'Share Tech Mono',monospace",
              bgcolor: `${part.color}18`,
              color: part.color,
              borderRadius: "2px",
              "& .MuiChip-label": { px: 0.6 },
            }}
          />
        </Box>
        <Typography
          sx={{
            fontFamily: "'Rajdhani',sans-serif",
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
            fontFamily: "'Share Tech Mono',monospace",
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
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.58rem",
                  color: "#6b7280",
                }}
              >
                {p.nom}:
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
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

// ══════════════════════════════════════════════════════════════════════
//   DOMNA PECHI — to'liq anatomik SVG
// ══════════════════════════════════════════════════════════════════════
function DomnaPechiDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);

  const parts = {
    KOLOSHNIK: {
      id: "KOLOSHNIK",
      nom: "Koloshnik",
      vazifa: "Tepasi",
      color: "#00d4ff",
      tavsif: "Pechinig eng yuqori qismi. Ruda, koks va ohaktosh yuklanadi.",
      parametrlar: [
        { nom: "Gaz bosimi", qiymat: `${(u.bosim * 0.25).toFixed(1)} bar` },
        { nom: "Holat", qiymat: "Faol" },
      ],
    },
    YUKLASH: {
      id: "YUKLASH",
      nom: "Yuklash Qurilmasi",
      vazifa: "Kiritish",
      color: "#a78bfa",
      tavsif:
        "Ruda va koksni pechin ichiga teng taqsimlaydi. Bell yoki bell-less tizimi.",
      parametrlar: [
        { nom: "Ruda oqimi", qiymat: `${Math.round(u.quvvat / 40)} t/soat` },
        { nom: "Koks nisbati", qiymat: "1:4.5" },
      ],
    },
    SHAFT: {
      id: "SHAFT",
      nom: "Shaft (Pech Tanasi)",
      vazifa: "Asosiy zona",
      color: "#ff6b1a",
      tavsif:
        "Pechinig asosiy ishchi qismi. Ruda bu yerda qizib eriydi va kimyoviy reaksiya ketadi.",
      parametrlar: [
        { nom: "Harorat", qiymat: `${u.harorat}°C` },
        { nom: "Bosim", qiymat: `${u.bosim} bar` },
        { nom: "Balandlik", qiymat: "28 m" },
      ],
    },
    ZAPLES: {
      id: "ZAPLES",
      nom: "Zaples",
      vazifa: "Toraytuvchi",
      color: "#ffd60a",
      tavsif: "Shaftdan gornga o'tish qismi. Toraytirib bosimni oshiradi.",
      parametrlar: [
        { nom: "Diametr", qiymat: "8.2 m" },
        { nom: "Harorat", qiymat: `${Math.round(u.harorat * 1.05)}°C` },
      ],
    },
    RASSVAR: {
      id: "RASSVAR",
      nom: "Rassvar",
      vazifa: "Kengayuvchi",
      color: "#ff6b1a",
      tavsif: "Gornga qadar kengayadi. Havo va kislorod kiritiladi.",
      parametrlar: [
        { nom: "Havo oqimi", qiymat: `${Math.round(u.quvvat * 1.8)} m³/min` },
        { nom: "Kislorod", qiymat: `${Math.round(u.quvvat * 0.4)} m³/min` },
      ],
    },
    GORN: {
      id: "GORN",
      nom: "Gorn (Pastki Kamera)",
      vazifa: "Eritish",
      color: "#ff2d55",
      tavsif: "Pechinig eng issiq qismi. Bu yerda cho'yan va shlak to'planadi.",
      parametrlar: [
        { nom: "Harorat", qiymat: `${Math.round(u.harorat * 1.1)}°C` },
        { nom: "Cho'yan hosili", qiymat: `${Math.round(u.quvvat / 8)} t/soat` },
        { nom: "Shlak", qiymat: `${Math.round(u.quvvat / 20)} t/soat` },
      ],
    },
    LETKA: {
      id: "LETKA",
      nom: "Letka (Chiqish Teshigi)",
      vazifa: "Chiqarish",
      color: "#ff9500",
      tavsif:
        "Gorndagi suyuq cho'yan va shlakni chiqarish uchun maxsus teshik.",
      parametrlar: [
        { nom: "Kun davomida", qiymat: "4-6 marta" },
        { nom: "Temperatura", qiymat: `${Math.round(u.harorat * 0.95)}°C` },
      ],
    },
    VOZDUSHKA: {
      id: "VOZDUSHKA",
      nom: "Vozdushka (Tuyerlar)",
      vazifa: "Havo kiritish",
      color: "#00ff9d",
      tavsif: "Pechin yon devorlarida joylashgan. Qizdirilgan havo kiritadi.",
      parametrlar: [
        { nom: "Havo harorati", qiymat: "1100°C" },
        { nom: "Tuyerlar soni", qiymat: "28 ta" },
        { nom: "Bosim", qiymat: `${(u.bosim * 0.9).toFixed(1)} bar` },
      ],
    },
    GAZOPROVOD: {
      id: "GAZOPROVOD",
      nom: "Koloshnik Gazi Quvuri",
      vazifa: "Gaz chiqarish",
      color: "#00d4ff",
      tavsif:
        "Pechin tepasidan koloshnik gazini yig'ib energiya manbai sifatida ishlatiladi.",
      parametrlar: [
        { nom: "Gaz hajmi", qiymat: `${Math.round(u.quvvat * 3)} m³/soat` },
        { nom: "CO miqdori", qiymat: "25%" },
      ],
    },
  };

  const handleClick = useCallback(
    (id) => {
      setActive((prev) => (prev?.id === parts[id]?.id ? null : parts[id]));
    },
    [u],
  );

  const accentFill = (key) => {
    const base = parts[key]?.color || "#6b7280";
    if (!isDark) return `${base}14`;
    return active?.id === key ? `${base}30` : `${base}18`;
  };
  const stroke = (key) =>
    active?.id === key ? parts[key]?.color : `${parts[key]?.color}88`;
  const sw = (key) => (active?.id === key ? 2.5 : 1.8);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 380 440"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <radialGradient id="fireGlow" cx="50%" cy="70%" r="50%">
            <stop offset="0%" stopColor="#ff4500" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff2d55" stopOpacity="0" />
          </radialGradient>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="2.5" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Grid fon */}
        {[...Array(10)].map((_, i) => (
          <line
            key={`h${i}`}
            x1="0"
            y1={i * 44}
            x2="380"
            y2={i * 44}
            stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.025)"}
            strokeWidth="1"
          />
        ))}
        {[...Array(8)].map((_, i) => (
          <line
            key={`v${i}`}
            x1={i * 50}
            y1="0"
            x2={i * 50}
            y2="440"
            stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.025)"}
            strokeWidth="1"
          />
        ))}

        {/* ── KOLOSHNIK (tepa) ── */}
        <g
          onClick={() => handleClick("KOLOSHNIK")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "KOLOSHNIK" ? 0.35 : 1}
        >
          <ellipse
            cx="190"
            cy="62"
            rx="68"
            ry="18"
            fill={accentFill("KOLOSHNIK")}
            stroke={stroke("KOLOSHNIK")}
            strokeWidth={sw("KOLOSHNIK")}
          />
          <text
            x="190"
            y="66"
            fill={parts.KOLOSHNIK.color}
            fontSize="8"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            KOLOSHNIK
          </text>
        </g>

        {/* ── YUKLASH qurilmasi ── */}
        <g
          onClick={() => handleClick("YUKLASH")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "YUKLASH" ? 0.35 : 1}
        >
          <rect
            x="154"
            y="78"
            width="72"
            height="24"
            rx="3"
            fill={accentFill("YUKLASH")}
            stroke={stroke("YUKLASH")}
            strokeWidth={sw("YUKLASH")}
          />
          <text
            x="190"
            y="93"
            fill={parts.YUKLASH.color}
            fontSize="7"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            YUKLASH QURILMASI
          </text>
        </g>

        {/* ── SHAFT (asosiy tana) ── */}
        <g
          onClick={() => handleClick("SHAFT")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "SHAFT" ? 0.35 : 1}
        >
          <path
            d="M122 102 L108 200 L272 200 L258 102Z"
            fill={accentFill("SHAFT")}
            stroke={stroke("SHAFT")}
            strokeWidth={sw("SHAFT")}
          />
          <text
            x="190"
            y="158"
            fill={parts.SHAFT.color}
            fontSize="9"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
            fontWeight="bold"
          >
            SHAFT
          </text>
          <text
            x="190"
            y="172"
            fill={parts.SHAFT.color}
            fontSize="7"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.65"
          >
            {u.harorat}°C
          </text>
        </g>

        {/* ── ZAPLES ── */}
        <g
          onClick={() => handleClick("ZAPLES")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "ZAPLES" ? 0.35 : 1}
        >
          <path
            d="M108 200 L98 232 L282 232 L272 200Z"
            fill={accentFill("ZAPLES")}
            stroke={stroke("ZAPLES")}
            strokeWidth={sw("ZAPLES")}
          />
          <text
            x="190"
            y="221"
            fill={parts.ZAPLES.color}
            fontSize="7.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            ZAPLES
          </text>
        </g>

        {/* ── RASSVAR ── */}
        <g
          onClick={() => handleClick("RASSVAR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "RASSVAR" ? 0.35 : 1}
        >
          <path
            d="M98 232 L92 270 L288 270 L282 232Z"
            fill={accentFill("RASSVAR")}
            stroke={stroke("RASSVAR")}
            strokeWidth={sw("RASSVAR")}
          />
          <text
            x="190"
            y="256"
            fill={parts.RASSVAR.color}
            fontSize="7.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            RASSVAR
          </text>
        </g>

        {/* ── VOZDUSHKA (tuyerlar) ── */}
        <g
          onClick={() => handleClick("VOZDUSHKA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "VOZDUSHKA" ? 0.35 : 1}
        >
          {/* chap quvur */}
          <rect
            x="28"
            y="252"
            width="64"
            height="12"
            rx="6"
            fill={accentFill("VOZDUSHKA")}
            stroke={stroke("VOZDUSHKA")}
            strokeWidth={sw("VOZDUSHKA")}
          />
          {/* o'ng quvur */}
          <rect
            x="288"
            y="252"
            width="64"
            height="12"
            rx="6"
            fill={accentFill("VOZDUSHKA")}
            stroke={stroke("VOZDUSHKA")}
            strokeWidth={sw("VOZDUSHKA")}
          />
          <text
            x="60"
            y="248"
            fill={parts.VOZDUSHKA.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            TUYERLAR
          </text>
          {/* havo oqim strelkasi */}
          <path
            d="M92 258 L108 258"
            fill="none"
            stroke={parts.VOZDUSHKA.color}
            strokeWidth="1.5"
            opacity="0.5"
            markerEnd="url(#arrowG)"
          />
          <path
            d="M288 258 L272 258"
            fill="none"
            stroke={parts.VOZDUSHKA.color}
            strokeWidth="1.5"
            opacity="0.5"
          />
        </g>

        {/* ── GORN ── */}
        <g
          onClick={() => handleClick("GORN")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "GORN" ? 0.35 : 1}
        >
          <path
            d="M92 270 L88 326 L292 326 L288 270Z"
            fill={accentFill("GORN")}
            stroke={stroke("GORN")}
            strokeWidth={sw("GORN")}
          />
          {/* Olov animatsiyasi */}
          {u.holat === "faol" && (
            <ellipse
              cx="190"
              cy="310"
              rx="40"
              ry="15"
              fill="url(#fireGlow)"
              opacity="0.7"
            >
              <animate
                attributeName="ry"
                values="15;20;13;18;15"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </ellipse>
          )}
          <text
            x="190"
            y="300"
            fill={parts.GORN.color}
            fontSize="9"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
            fontWeight="bold"
          >
            GORN
          </text>
          <text
            x="190"
            y="315"
            fill={parts.GORN.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.65"
          >
            {Math.round(u.harorat * 1.1)}°C
          </text>
        </g>

        {/* ── LETKA ── */}
        <g
          onClick={() => handleClick("LETKA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "LETKA" ? 0.35 : 1}
        >
          {/* cho'yan letka */}
          <rect
            x="288"
            y="298"
            width="68"
            height="14"
            rx="7"
            fill={accentFill("LETKA")}
            stroke={stroke("LETKA")}
            strokeWidth={sw("LETKA")}
          />
          <text
            x="322"
            y="310"
            fill={parts.LETKA.color}
            fontSize="6"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            LETKA
          </text>
          {/* suyuq metall oqim */}
          {u.holat === "faol" && (
            <path
              d="M356 305 Q368 305 372 315 Q368 325 356 325"
              fill="#ff950025"
              stroke="#ff9500"
              strokeWidth="1.2"
              opacity="0.6"
            >
              <animate
                attributeName="opacity"
                values="0.6;0.2;0.6"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </path>
          )}
        </g>

        {/* ── PECH TAGI ── */}
        <ellipse
          cx="190"
          cy="326"
          rx="102"
          ry="12"
          fill={isDark ? "rgba(255,45,85,0.1)" : "rgba(255,45,85,0.06)"}
          stroke="#ff2d5555"
          strokeWidth="1.5"
        />
        <rect
          x="88"
          y="326"
          width="204"
          height="18"
          rx="0"
          fill={isDark ? "rgba(100,100,120,0.15)" : "rgba(100,100,120,0.06)"}
          stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
          strokeWidth="1"
        />

        {/* ── GAZOPROVOD (chap yuqori quvur) ── */}
        <g
          onClick={() => handleClick("GAZOPROVOD")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "GAZOPROVOD" ? 0.35 : 1}
        >
          <path
            d="M258 70 Q310 55 330 30"
            fill="none"
            stroke={stroke("GAZOPROVOD")}
            strokeWidth={sw("GAZOPROVOD")}
            strokeDasharray="7,4"
            strokeLinecap="round"
          />
          <circle
            cx="330"
            cy="30"
            r="7"
            fill={accentFill("GAZOPROVOD")}
            stroke={stroke("GAZOPROVOD")}
            strokeWidth="1.5"
          />
          <text
            x="332"
            y="17"
            fill={parts.GAZOPROVOD.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            opacity="0.85"
          >
            GAZ QUVURI
          </text>
          {u.holat === "faol" && (
            <circle
              cx="295"
              cy="50"
              r="3"
              fill={parts.GAZOPROVOD.color}
              opacity="0.6"
            >
              <animate
                attributeName="cy"
                values="50;44;50"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.1;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>

        {/* ── CHAP LEGEND CHIZIQLAR ── */}
        <line
          x1="60"
          y1="62"
          x2="122"
          y2="80"
          stroke={`${parts.KOLOSHNIK.color}40`}
          strokeWidth="0.8"
          strokeDasharray="3,2"
        />
        <line
          x1="50"
          y1="155"
          x2="108"
          y2="155"
          stroke={`${parts.SHAFT.color}40`}
          strokeWidth="0.8"
          strokeDasharray="3,2"
        />
        <line
          x1="40"
          y1="295"
          x2="88"
          y2="300"
          stroke={`${parts.GORN.color}40`}
          strokeWidth="0.8"
          strokeDasharray="3,2"
        />

        {/* ── CHAP LEGEND MATNLAR ── */}
        <text
          x="55"
          y="58"
          fill={parts.KOLOSHNIK.color}
          fontSize="6.5"
          fontFamily="'Share Tech Mono',monospace"
          textAnchor="end"
          opacity="0.6"
        >
          KOLOSHNIK
        </text>
        <text
          x="48"
          y="150"
          fill={parts.SHAFT.color}
          fontSize="6.5"
          fontFamily="'Share Tech Mono',monospace"
          textAnchor="end"
          opacity="0.6"
        >
          SHAFT
        </text>
        <text
          x="36"
          y="290"
          fill={parts.GORN.color}
          fontSize="6.5"
          fontFamily="'Share Tech Mono',monospace"
          textAnchor="end"
          opacity="0.6"
        >
          GORN
        </text>

        {/* ── O'LCHOV ko'rsatkich (o'ng tomon) ── */}
        <line
          x1="355"
          y1="102"
          x2="355"
          y2="326"
          stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
          strokeWidth="1"
          strokeDasharray="4,3"
        />
        <text
          x="370"
          y="215"
          fill={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)"}
          fontSize="6"
          fontFamily="'Share Tech Mono',monospace"
          textAnchor="middle"
          transform="rotate(90, 370, 215)"
        >
          UMUMIY BALANDLIK: ~32m
        </text>
      </svg>

      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════════
//   KONVERTER — BOF (Basic Oxygen Furnace)
// ══════════════════════════════════════════════════════════════════════
function KonverterDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const angle = u.holat === "faol" ? 0 : 25;

  const parts = {
    LANCE: {
      id: "LANCE",
      nom: "Kislorod Lansesi",
      vazifa: "Kislorod kiritish",
      color: "#00ff9d",
      tavsif:
        "Yuqoridan tushiriladigan mis naychalar. Suyuq cho'yanga kislorod purkaydigan asosiy qurilma.",
      parametrlar: [
        { nom: "O₂ oqim", qiymat: `${Math.round(u.quvvat * 2.2)} m³/min` },
        { nom: "Harorat (lance)", qiymat: "Su bilan sovutilgan" },
        { nom: "Tezlik", qiymat: "450 m/s (supersonic)" },
      ],
    },
    TANA: {
      id: "TANA",
      nom: "Konverter Tanasi",
      vazifa: "Asosiy korpus",
      color: "#00d4ff",
      tavsif:
        "Tashqi po'lat qobiq va ichki olovbardosh g'ishtdan iborat silindrsimon korpus.",
      parametrlar: [
        { nom: "Sig'im", qiymat: "300 t" },
        { nom: "Qobiq qalinligi", qiymat: "50 mm" },
        { nom: "G'isht qalinligi", qiymat: "800 mm" },
      ],
    },
    VANNA: {
      id: "VANNA",
      nom: "Metall Vannasi",
      vazifa: "Eritilgan metall",
      color: "#ff6b1a",
      tavsif:
        "Konverter pastidagi eritilgan cho'yan va po'lat to'planadigan qism.",
      parametrlar: [
        { nom: "Harorat", qiymat: `${u.harorat}°C` },
        { nom: "Cho'yan og'irligi", qiymat: `${Math.round(u.quvvat / 3)} t` },
        { nom: "C miqdori", qiymat: "0.03-0.1%" },
      ],
    },
    BOYINTANA: {
      id: "BOYINTANA",
      nom: "Konverter Bo'yni",
      vazifa: "Gaz chiqish",
      color: "#a78bfa",
      tavsif:
        "Reaksiya natijasida hosil bo'lgan issiq gazlar chiqadigan yuqori ochiq qism.",
      parametrlar: [
        { nom: "Gaz harorati", qiymat: `${Math.round(u.harorat * 0.9)}°C` },
        { nom: "CO₂ miqdori", qiymat: "15-20%" },
        { nom: "CO miqdori", qiymat: "60-70%" },
      ],
    },
    POKRYVALO: {
      id: "POKRYVALO",
      nom: "Gaz Tutuvchi Qopqoq",
      vazifa: "Gaz yig'ish",
      color: "#ffd60a",
      tavsif:
        "Konverter og'ziga yaqin joylashib chiqayotgan gazlarni yig'uvchi qopqoq.",
      parametrlar: [
        { nom: "Gaz hajmi", qiymat: `${Math.round(u.quvvat * 2.5)} m³/min` },
        { nom: "Sovutish suvi", qiymat: "1200 L/min" },
      ],
    },
    TRUNNION: {
      id: "TRUNNION",
      nom: "Aylanish O'qi (Trunnion)",
      vazifa: "Ag'darish",
      color: "#00d4ff",
      tavsif:
        "Konverterni ag'darib chiqarish uchun yon tomon o'qlari. Gidravlik motor boshqaradi.",
      parametrlar: [
        { nom: "Ko'tarish kuchi", qiymat: "1200 t" },
        { nom: "Burchak tezligi", qiymat: "1 rpm" },
        { nom: "Burilish", qiymat: "0–360°" },
      ],
    },
    CHIQARISH: {
      id: "CHIQARISH",
      nom: "Po'lat Chiqarish Og'zi (Taphole)",
      vazifa: "Chiqarish",
      color: "#ff2d55",
      tavsif:
        "Tayyor po'latni kovsh g'altakka chiqarish uchun yon teshik. Argon puflanadi.",
      parametrlar: [
        { nom: "Chiqarish vaqti", qiymat: "4-6 daqiqa" },
        { nom: "Harorat", qiymat: `${Math.round(u.harorat * 0.98)}°C` },
        { nom: "Argon", qiymat: `${Math.round(u.quvvat * 0.1)} m³/min` },
      ],
    },
    SHLAKKOVSH: {
      id: "SHLAKKOVSH",
      nom: "Shlak Kovshi",
      vazifa: "Shlak yig'ish",
      color: "#6b7280",
      tavsif:
        "Konverter og'dirilganda shlak (oksidlangan qatlam) yig'iladigan maxsus idish.",
      parametrlar: [
        {
          nom: "Shlak miqdori",
          qiymat: `${Math.round(u.quvvat / 25)} t/quyma`,
        },
        { nom: "Harorat", qiymat: `${Math.round(u.harorat * 0.85)}°C` },
      ],
    },
  };

  const click = (id) =>
    setActive((prev) => (prev?.id === id ? null : parts[id]));
  const af = (k) =>
    active?.id === k
      ? `${parts[k]?.color}35`
      : `${parts[k]?.color}${isDark ? "18" : "10"}`;
  const st = (k) =>
    active?.id === k ? parts[k]?.color : `${parts[k]?.color}80`;
  const sw = (k) => (active?.id === k ? 2.5 : 1.8);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 420 420"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <radialGradient id="metalGlow" cx="50%" cy="80%" r="60%">
            <stop offset="0%" stopColor="#ff6b1a" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff2d55" stopOpacity="0" />
          </radialGradient>
          <filter id="glow2">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {[...Array(10)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 42}
            x2="420"
            y2={i * 42}
            stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"}
            strokeWidth="1"
          />
        ))}

        {/* ── LANCE ── */}
        <g
          onClick={() => click("LANCE")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "LANCE" ? 0.3 : 1}
        >
          <rect
            x="185"
            y="8"
            width="22"
            height="110"
            rx="11"
            fill={af("LANCE")}
            stroke={st("LANCE")}
            strokeWidth={sw("LANCE")}
          />
          <ellipse
            cx="196"
            cy="116"
            rx="10"
            ry="6"
            fill={st("LANCE")}
            opacity="0.5"
          />
          {u.holat === "faol" && (
            <>
              <ellipse
                cx="196"
                cy="118"
                rx="6"
                ry="3"
                fill="#00ff9d"
                opacity="0.6"
              >
                <animate
                  attributeName="ry"
                  values="3;5;3"
                  dur="0.9s"
                  repeatCount="indefinite"
                />
              </ellipse>
            </>
          )}
          <text
            x="212"
            y="55"
            fill={parts.LANCE.color}
            fontSize="7"
            fontFamily="'Share Tech Mono',monospace"
            opacity="0.8"
          >
            LANCE
          </text>
          <line
            x1="208"
            y1="52"
            x2="225"
            y2="52"
            stroke={`${parts.LANCE.color}50`}
            strokeWidth="0.8"
            strokeDasharray="3,2"
          />
        </g>

        {/* ── POKRYVALO (gaz qopqog') ── */}
        <g
          onClick={() => click("POKRYVALO")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "POKRYVALO" ? 0.3 : 1}
        >
          <path
            d="M128 118 Q128 108 196 105 Q264 108 264 118 L270 140 Q264 132 196 130 Q128 132 122 140Z"
            fill={af("POKRYVALO")}
            stroke={st("POKRYVALO")}
            strokeWidth={sw("POKRYVALO")}
          />
          {/* gaz chiqish quvuri */}
          <path
            d="M128 125 Q80 110 62 90"
            fill="none"
            stroke={st("POKRYVALO")}
            strokeWidth={sw("POKRYVALO")}
            strokeDasharray="6,4"
          />
          <circle
            cx="62"
            cy="90"
            r="8"
            fill={af("POKRYVALO")}
            stroke={st("POKRYVALO")}
            strokeWidth="1.5"
          />
          <text
            x="42"
            y="78"
            fill={parts.POKRYVALO.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            opacity="0.8"
          >
            GAZ
          </text>
        </g>

        {/* ── BO'YIN (og'iz) ── */}
        <g
          onClick={() => click("BOYINTANA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "BOYINTANA" ? 0.3 : 1}
        >
          <path
            d="M138 140 Q136 162 118 180 L274 180 Q256 162 254 140Z"
            fill={af("BOYINTANA")}
            stroke={st("BOYINTANA")}
            strokeWidth={sw("BOYINTANA")}
          />
          <text
            x="196"
            y="164"
            fill={parts.BOYINTANA.color}
            fontSize="7.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            BO'YIN
          </text>
        </g>

        {/* ── TANA (asosiy silindr) ── */}
        <g
          onClick={() => click("TANA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "TANA" ? 0.3 : 1}
        >
          <path
            d="M118 180 L110 310 Q110 320 196 322 Q282 320 282 310 L274 180Z"
            fill={af("TANA")}
            stroke={st("TANA")}
            strokeWidth={sw("TANA")}
          />
          <text
            x="196"
            y="248"
            fill={parts.TANA.color}
            fontSize="9"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
            fontWeight="bold"
          >
            TANA
          </text>
          <text
            x="196"
            y="262"
            fill={parts.TANA.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.6"
          >
            300 t sig'im
          </text>
        </g>

        {/* ── VANNA (eritilgan metall) ── */}
        <g
          onClick={() => click("VANNA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "VANNA" ? 0.3 : 1}
        >
          <path
            d="M115 298 Q112 335 196 340 Q280 335 277 298Z"
            fill={af("VANNA")}
            stroke={st("VANNA")}
            strokeWidth={sw("VANNA")}
          />
          {u.holat === "faol" && (
            <ellipse
              cx="196"
              cy="320"
              rx="55"
              ry="12"
              fill="url(#metalGlow)"
              opacity="0.7"
            >
              <animate
                attributeName="ry"
                values="12;16;11;14;12"
                dur="3s"
                repeatCount="indefinite"
              />
            </ellipse>
          )}
          <text
            x="196"
            y="322"
            fill={parts.VANNA.color}
            fontSize="7.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            METALL VANNASI
          </text>
        </g>

        {/* ── TRUNNION (chap o'q) ── */}
        <g
          onClick={() => click("TRUNNION")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "TRUNNION" ? 0.3 : 1}
        >
          <rect
            x="36"
            y="228"
            width="74"
            height="28"
            rx="14"
            fill={af("TRUNNION")}
            stroke={st("TRUNNION")}
            strokeWidth={sw("TRUNNION")}
          />
          <rect
            x="310"
            y="228"
            width="74"
            height="28"
            rx="14"
            fill={af("TRUNNION")}
            stroke={st("TRUNNION")}
            strokeWidth={sw("TRUNNION")}
          />
          <text
            x="73"
            y="246"
            fill={parts.TRUNNION.color}
            fontSize="6"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            TRUNNION
          </text>
        </g>

        {/* ── CHIQARISH og'zi ── */}
        <g
          onClick={() => click("CHIQARISH")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "CHIQARISH" ? 0.3 : 1}
        >
          <path
            d="M278 290 Q316 285 336 296 Q318 308 278 306Z"
            fill={af("CHIQARISH")}
            stroke={st("CHIQARISH")}
            strokeWidth={sw("CHIQARISH")}
          />
          {u.holat === "faol" && (
            <path
              d="M336 298 Q355 294 368 300 Q356 306 336 305"
              fill="#ff630025"
              stroke="#ff6300"
              strokeWidth="1"
              opacity="0.7"
            >
              <animate
                attributeName="opacity"
                values="0.7;0.2;0.7"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
          )}
          <text
            x="340"
            y="282"
            fill={parts.CHIQARISH.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            opacity="0.8"
          >
            TAPHOLE
          </text>
        </g>

        {/* ── SHLAK KOVSH ── */}
        <g
          onClick={() => click("SHLAKKOVSH")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "SHLAKKOVSH" ? 0.3 : 1}
        >
          <path
            d="M14 352 Q12 390 56 396 Q100 400 112 390 L116 352Z"
            fill={af("SHLAKKOVSH")}
            stroke={st("SHLAKKOVSH")}
            strokeWidth={sw("SHLAKKOVSH")}
          />
          <text
            x="65"
            y="380"
            fill={parts.SHLAKKOVSH.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            SHLAK KOVSH
          </text>
        </g>

        {/* ── LEGEND ── */}
        {[
          { key: "LANCE", lx: 240, ly: 25 },
          { key: "BOYINTANA", lx: 310, ly: 160 },
          { key: "TANA", lx: 318, ly: 230 },
          { key: "VANNA", lx: 310, ly: 340 },
        ].map((lb) => (
          <g key={lb.key} style={{ pointerEvents: "none" }}>
            <line
              x1={lb.lx - 10}
              y1={lb.ly}
              x2={lb.lx - 30}
              y2={lb.ly}
              stroke={`${parts[lb.key].color}40`}
              strokeWidth="0.8"
              strokeDasharray="3,2"
            />
            <text
              x={lb.lx}
              y={lb.ly + 4}
              fill={parts[lb.key].color}
              fontSize="6.5"
              fontFamily="'Share Tech Mono',monospace"
              opacity="0.65"
            >
              {lb.key}
            </text>
          </g>
        ))}
      </svg>
      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════════
//   ELEKTR PECH — EAF (Electric Arc Furnace)
// ══════════════════════════════════════════════════════════════════════
function ElektrPechDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isWarn = u.holat === "ogohlantirish";
  const eColor = isWarn ? "#ffd60a" : "#a78bfa";

  const parts = {
    SVOD: {
      id: "SVOD",
      nom: "Pech Svodi (Yopiladigan Tom)",
      vazifa: "Himoya",
      color: "#00d4ff",
      tavsif:
        "Olovga chidamli magnezit g'ishtdan yasalgan oval shakldagi qopqoq. Ko'tariladi va suriladi.",
      parametrlar: [
        { nom: "Material", qiymat: "MgO-C g'isht" },
        { nom: "Sovutish", qiymat: "Suv bilan" },
        { nom: "Og'irligi", qiymat: "80 t" },
      ],
    },
    ELEKTROD_A: {
      id: "ELEKTROD-A",
      nom: "A-Faza Elektrodi",
      vazifa: "Tok o'tkazish",
      color: eColor,
      tavsif:
        "Grafitdan yasalgan elektrod. Tok o'tib ark hosil qiladi va metall eriydi.",
      parametrlar: [
        { nom: "Tok kuchi", qiymat: `${Math.round(u.quvvat * 0.8)} kA` },
        { nom: "Kuchlanish", qiymat: "600-900 V" },
        { nom: "Diametr", qiymat: "610 mm" },
      ],
    },
    ELEKTROD_B: {
      id: "ELEKTROD-B",
      nom: "B-Faza Elektrodi",
      vazifa: "Tok o'tkazish",
      color: eColor,
      tavsif:
        "3-fazali elektr tizimining ikkinchi elektrodi. A va C bilan birga ark yoyini hosil qiladi.",
      parametrlar: [
        { nom: "Tok kuchi", qiymat: `${Math.round(u.quvvat * 0.8)} kA` },
        { nom: "Iste'mol", qiymat: `${Math.round(u.quvvat / 3)} kWh/t` },
      ],
    },
    ELEKTROD_C: {
      id: "ELEKTROD-C",
      nom: "C-Faza Elektrodi",
      vazifa: "Tok o'tkazish",
      color: eColor,
      tavsif:
        "3-fazali tizimning uchinchi elektrodi. Avtomatik PLC bilan boshqariladi.",
      parametrlar: [
        { nom: "Tok kuchi", qiymat: `${Math.round(u.quvvat * 0.8)} kA` },
        { nom: "Chuqurlik", qiymat: "Avtomatik" },
      ],
    },
    STENA: {
      id: "STENA",
      nom: "Pech Devori",
      vazifa: "Korpus",
      color: "#ff6b1a",
      tavsif:
        "Tashqi po'lat qobiq va ichki qatlamdan iborat. Ichki qism olovga chidamli g'isht.",
      parametrlar: [
        { nom: "Harorat (devor)", qiymat: `${u.harorat}°C` },
        { nom: "Qalinlik", qiymat: "700 mm (g'isht)" },
        { nom: "Sovutish", qiymat: "Suv panellari" },
      ],
    },
    POD: {
      id: "POD",
      nom: "Pech Podi (Tagi)",
      vazifa: "Taglik",
      color: "#ff2d55",
      tavsif:
        "Pechinig tubida joylashgan. Magnezit yoki dolomiт massasi bilan qoplangan.",
      parametrlar: [
        { nom: "Harorat", qiymat: `${Math.round(u.harorat * 1.05)}°C` },
        { nom: "Material", qiymat: "Magnezit-karbon" },
        { nom: "Qalinlik", qiymat: "1.2 m" },
      ],
    },
    TAPHOLE: {
      id: "TAPHOLE",
      nom: "Chiqarish Teshigi (Taphole)",
      vazifa: "Chiqarish",
      color: "#ff9500",
      tavsif:
        "Tayyor po'lat chiqariladi. Har quyishdan so'ng magnezit massa bilan berkitiladi.",
      parametrlar: [
        { nom: "Chiqarish vaqti", qiymat: "3-5 daqiqa" },
        { nom: "Harorat", qiymat: `${Math.round(u.harorat * 0.95)}°C` },
      ],
    },
    TRANSFORMATOR: {
      id: "TRANSFORMATOR",
      nom: "Quvvat Transformatori",
      vazifa: "Elektr ta'minot",
      color: "#00d4ff",
      tavsif:
        "Yuqori kuchlanish (110 kV) ni pastki kuchlanishga (600-900 V) tushiradi.",
      parametrlar: [
        { nom: "Quvvat", qiymat: `${u.quvvat} MVA` },
        { nom: "Kirish kuchlanish", qiymat: "110 kV" },
        { nom: "Chiqish kuchlanish", qiymat: "600-900 V" },
      ],
    },
    GAZOCHIK: {
      id: "GAZOCHIK",
      nom: "Gaz Chiqarish Tizimi",
      vazifa: "Gaz tozalash",
      color: "#00ff9d",
      tavsif:
        "Reaksiya gazlari (CO, CO₂) va chang ushlanadi. 4-panel quvur orqali filtrlarga.",
      parametrlar: [
        { nom: "Gaz hajmi", qiymat: `${Math.round(u.quvvat * 1.8)} m³/min` },
        { nom: "Chang miqdori", qiymat: "< 10 mg/m³" },
      ],
    },
  };

  const click = (id) =>
    setActive((prev) => (prev?.id === id ? null : parts[id]));
  const af = (k) =>
    active?.id === k
      ? `${parts[k]?.color}38`
      : `${parts[k]?.color}${isDark ? "18" : "0f"}`;
  const st = (k) =>
    active?.id === k ? parts[k]?.color : `${parts[k]?.color}80`;
  const sw = (k) => (active?.id === k ? 2.5 : 1.8);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 420 420"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <radialGradient id="arcGlow" cx="50%" cy="50%" r="40%">
            <stop offset="0%" stopColor={eColor} stopOpacity="0.7" />
            <stop offset="100%" stopColor={eColor} stopOpacity="0" />
          </radialGradient>
        </defs>
        {[...Array(10)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 42}
            x2="420"
            y2={i * 42}
            stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"}
            strokeWidth="1"
          />
        ))}

        {/* ── TRANSFORMATOR (chap) ── */}
        <g
          onClick={() => click("TRANSFORMATOR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "TRANSFORMATOR" ? 0.3 : 1}
        >
          <rect
            x="10"
            y="100"
            width="70"
            height="110"
            rx="5"
            fill={af("TRANSFORMATOR")}
            stroke={st("TRANSFORMATOR")}
            strokeWidth={sw("TRANSFORMATOR")}
          />
          {/* Kabel chiziqlar */}
          <line
            x1="80"
            y1="130"
            x2="120"
            y2="100"
            stroke={st("TRANSFORMATOR")}
            strokeWidth="1.5"
            strokeDasharray="5,3"
          />
          <line
            x1="80"
            y1="155"
            x2="165"
            y2="90"
            stroke={st("TRANSFORMATOR")}
            strokeWidth="1.5"
            strokeDasharray="5,3"
          />
          <line
            x1="80"
            y1="180"
            x2="210"
            y2="82"
            stroke={st("TRANSFORMATOR")}
            strokeWidth="1.5"
            strokeDasharray="5,3"
          />
          <text
            x="45"
            y="155"
            fill={parts.TRANSFORMATOR.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            TRANSFOR-{"\n"}MATOR
          </text>
          <text
            x="45"
            y="167"
            fill={parts.TRANSFORMATOR.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.65"
          >
            {u.quvvat} MVA
          </text>
        </g>

        {/* ── SVOD ── */}
        <g
          onClick={() => click("SVOD")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "SVOD" ? 0.3 : 1}
        >
          <ellipse
            cx="230"
            cy="130"
            rx="100"
            ry="28"
            fill={af("SVOD")}
            stroke={st("SVOD")}
            strokeWidth={sw("SVOD")}
          />
          <text
            x="230"
            y="134"
            fill={parts.SVOD.color}
            fontSize="8"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            SVOD
          </text>
        </g>

        {/* ── ELEKTRODLAR ── */}
        {[
          { key: "ELEKTROD_A", cx: 175, label: "A" },
          { key: "ELEKTROD_B", cx: 230, label: "B" },
          { key: "ELEKTROD_C", cx: 285, label: "C" },
        ].map((el) => (
          <g
            key={el.key}
            onClick={() => click(el.key)}
            style={{ cursor: "pointer" }}
            opacity={active && active.id !== parts[el.key]?.id ? 0.3 : 1}
          >
            <rect
              x={el.cx - 11}
              y="20"
              width="22"
              height="145"
              rx="11"
              fill={af(el.key)}
              stroke={st(el.key)}
              strokeWidth={sw(el.key)}
            />
            <text
              x={el.cx}
              y="36"
              fill={parts[el.key].color}
              fontSize="8"
              fontFamily="'Share Tech Mono',monospace"
              textAnchor="middle"
              opacity="0.8"
            >
              {el.label}
            </text>
            {/* ark uchqun */}
            {u.holat !== "toxtagan" && (
              <ellipse
                cx={el.cx}
                cy="163"
                rx="9"
                ry="5"
                fill={eColor}
                opacity="0.6"
              >
                <animate
                  attributeName="opacity"
                  values="0.7;0.1;0.7"
                  dur={`${0.5 + Math.random() * 0.5}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="ry"
                  values="5;8;4;7;5"
                  dur="0.7s"
                  repeatCount="indefinite"
                />
              </ellipse>
            )}
          </g>
        ))}

        {/* ── STENA ── */}
        <g
          onClick={() => click("STENA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "STENA" ? 0.3 : 1}
        >
          <path
            d="M130 155 L120 310 L340 310 L330 155Z"
            fill={af("STENA")}
            stroke={st("STENA")}
            strokeWidth={sw("STENA")}
          />
          <text
            x="230"
            y="240"
            fill={parts.STENA.color}
            fontSize="8.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            DEVORLAR
          </text>
          <text
            x="230"
            y="255"
            fill={parts.STENA.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.6"
          >
            {u.harorat}°C
          </text>
        </g>

        {/* ARC GLOW */}
        {u.holat !== "toxtagan" && (
          <ellipse
            cx="230"
            cy="200"
            rx="60"
            ry="35"
            fill="url(#arcGlow)"
            opacity="0.5"
            style={{ pointerEvents: "none" }}
          >
            <animate
              attributeName="ry"
              values="35;45;30;40;35"
              dur="1.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;0.15;0.5"
              dur="1s"
              repeatCount="indefinite"
            />
          </ellipse>
        )}

        {/* ── POD ── */}
        <g
          onClick={() => click("POD")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "POD" ? 0.3 : 1}
        >
          <path
            d="M120 310 Q118 348 230 355 Q342 348 340 310Z"
            fill={af("POD")}
            stroke={st("POD")}
            strokeWidth={sw("POD")}
          />
          <text
            x="230"
            y="338"
            fill={parts.POD.color}
            fontSize="7.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            POD
          </text>
        </g>

        {/* ── TAPHOLE ── */}
        <g
          onClick={() => click("TAPHOLE")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "TAPHOLE" ? 0.3 : 1}
        >
          <path
            d="M340 290 Q375 286 390 296 Q375 307 340 305Z"
            fill={af("TAPHOLE")}
            stroke={st("TAPHOLE")}
            strokeWidth={sw("TAPHOLE")}
          />
          {u.holat === "faol" && (
            <path
              d="M390 298 Q408 294 415 300 Q408 306 390 304"
              fill="#ff950020"
              stroke="#ff9500"
              strokeWidth="1"
              opacity="0.7"
            >
              <animate
                attributeName="opacity"
                values="0.7;0.1;0.7"
                dur="2s"
                repeatCount="indefinite"
              />
            </path>
          )}
          <text
            x="368"
            y="282"
            fill={parts.TAPHOLE.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            TAPHOLE
          </text>
        </g>

        {/* ── GAZOCHIK ── */}
        <g
          onClick={() => click("GAZOCHIK")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "GAZOCHIK" ? 0.3 : 1}
        >
          <path
            d="M130 165 Q95 145 72 125"
            fill="none"
            stroke={st("GAZOCHIK")}
            strokeWidth={sw("GAZOCHIK")}
            strokeDasharray="6,4"
          />
          <circle
            cx="72"
            cy="125"
            r="10"
            fill={af("GAZOCHIK")}
            stroke={st("GAZOCHIK")}
            strokeWidth="1.8"
          />
          <text
            x="50"
            y="112"
            fill={parts.GAZOCHIK.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            opacity="0.8"
          >
            GAZ
          </text>
          {u.holat !== "toxtagan" && (
            <circle
              cx="101"
              cy="145"
              r="3"
              fill={parts.GAZOCHIK.color}
              opacity="0.5"
            >
              <animate
                attributeName="cy"
                values="145;138;145"
                dur="1.8s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>

        {/* ── OGOHLANTIRISH (agar holat warn) ── */}
        {isWarn && (
          <g style={{ pointerEvents: "none" }}>
            <path
              d="M340 60 L360 30 L380 60Z"
              fill="none"
              stroke="#ffd60a"
              strokeWidth="2"
            />
            <text
              x="360"
              y="56"
              fill="#ffd60a"
              fontSize="10"
              textAnchor="middle"
              opacity="0.9"
            >
              !
            </text>
            <text
              x="360"
              y="70"
              fill="#ffd60a"
              fontSize="6"
              fontFamily="'Share Tech Mono',monospace"
              textAnchor="middle"
              opacity="0.7"
            >
              OGOHLANT.
            </text>
          </g>
        )}
      </svg>
      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════════
//   PROKAT MASHINASI
// ══════════════════════════════════════════════════════════════════════
function ProkatDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isActive = u.holat === "faol";
  const c = "#00e676";

  const parts = {
    USTKI_ROLIK: {
      id: "USTKI-ROLIK",
      nom: "Ustki Ishchi Rolik",
      vazifa: "Bosim",
      color: c,
      tavsif:
        "Metallni ustidan bosib shakl beradi. Maxsus po'latdan yasalgan, ichi suv bilan sovutilgan.",
      parametrlar: [
        { nom: "Harorat", qiymat: `${Math.round(u.harorat * 0.95)}°C` },
        { nom: "RPM", qiymat: `${Math.round(u.quvvat * 15)}` },
        { nom: "Diametr", qiymat: "650 mm" },
      ],
    },
    PASTKI_ROLIK: {
      id: "PASTKI-ROLIK",
      nom: "Pastki Ishchi Rolik",
      vazifa: "Tayanch",
      color: "#29b6f6",
      tavsif:
        "Metallni pastidan ushlab turadi. Ustki rolik bilan birgalikda metal yo'g'onligini belgilaydi.",
      parametrlar: [
        { nom: "Bosim", qiymat: `${Math.round(u.bosim * 180)} kN` },
        { nom: "Tezlik", qiymat: `${Math.round(u.quvvat / 4)} m/min` },
      ],
    },
    TAYANCHROLIK: {
      id: "TAYANCH-ROLIK",
      nom: "Tayanch Roliklar",
      vazifa: "Mustahkamlik",
      color: "#6b7280",
      tavsif:
        "Ishchi roliklarni yon tomondan mahkamlaydi. Deformatsiyani kamaytiradi.",
      parametrlar: [
        { nom: "Og'irligi", qiymat: "45 t" },
        { nom: "Diametr", qiymat: "1400 mm" },
      ],
    },
    METALL_TASMA: {
      id: "METALL-TASMA",
      nom: "Prokat Materialı",
      vazifa: "Mahsulot",
      color: "#ff6b1a",
      tavsif:
        "Roliklar orasidan o'tayotgan qizdirilgan metall. Har o'tishda qalinligi kamayadi.",
      parametrlar: [
        { nom: "Harorat", qiymat: `${u.harorat}°C` },
        { nom: "Qalinlik", qiymat: "8-40 mm" },
        { nom: "Kenglik", qiymat: "600-1500 mm" },
      ],
    },
    PRESS_MEXANIZM: {
      id: "PRESS",
      nom: "Gidravlik Press",
      vazifa: "Bosim boshqaruv",
      color: "#ffd60a",
      tavsif:
        "Ishchi roliklar orasidagi masofani (gap) boshqaradi. Mahsulot qalinligini aniq belgilaydi.",
      parametrlar: [
        { nom: "Kuch", qiymat: `${Math.round(u.bosim * 200)} kN` },
        { nom: "Aniqlik", qiymat: "±0.01 mm" },
        { nom: "Gidravlik bosim", qiymat: `${Math.round(u.bosim * 40)} bar` },
      ],
    },
    MOTOR: {
      id: "MOTOR",
      nom: "Bosh Elektr Motor",
      vazifa: "Harakatlantirish",
      color: "#a78bfa",
      tavsif:
        "DC yoki AC motor. Reduktor orqali roriklarni aylantiradi. Tezlik invertor boshqaradi.",
      parametrlar: [
        { nom: "Quvvat", qiymat: `${u.quvvat} kW` },
        { nom: "Tezlik", qiymat: `${Math.round(u.quvvat * 2)} rpm` },
        { nom: "Boshqaruv", qiymat: "VFD (invertor)" },
      ],
    },
    SOVUTISH: {
      id: "SOVUTISH",
      nom: "Sovutish Tizimi",
      vazifa: "Harorat nazorat",
      color: "#29b6f6",
      tavsif:
        "Roliklarni va metallni suv bilan sovutadi. Harorat bir tekis ushlanadi.",
      parametrlar: [
        { nom: "Suv oqimi", qiymat: `${Math.round(u.quvvat * 8)} L/min` },
        { nom: "Harorat (kirish)", qiymat: "25°C" },
        { nom: "Harorat (chiqish)", qiymat: "55°C" },
      ],
    },
    KESUVCHI: {
      id: "KESUVCHI",
      nom: "Issiq Qaychi (Flying Shear)",
      vazifa: "Kesish",
      color: "#ff5252",
      tavsif:
        "Harakat paytida metallni kerakli uzunlikda kesadi. Gidravlik yoki mexanik.",
      parametrlar: [
        { nom: "Kesish kuchi", qiymat: `${Math.round(u.quvvat * 3)} kN` },
        { nom: "Max tezlik", qiymat: "40 m/min" },
      ],
    },
  };

  const click = (id) =>
    setActive((prev) => (prev?.id === id ? null : parts[id]));
  const af = (k) =>
    active?.id === k
      ? `${parts[k]?.color}38`
      : `${parts[k]?.color}${isDark ? "18" : "0f"}`;
  const st = (k) =>
    active?.id === k ? parts[k]?.color : `${parts[k]?.color}80`;
  const sw = (k) => (active?.id === k ? 2.5 : 1.8);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 500 380"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {[...Array(9)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 42}
            x2="500"
            y2={i * 42}
            stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"}
            strokeWidth="1"
          />
        ))}

        {/* ── MOTOR ── */}
        <g
          onClick={() => click("MOTOR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "MOTOR" ? 0.3 : 1}
        >
          <rect
            x="10"
            y="130"
            width="78"
            height="100"
            rx="6"
            fill={af("MOTOR")}
            stroke={st("MOTOR")}
            strokeWidth={sw("MOTOR")}
          />
          {isActive && (
            <circle
              cx="49"
              cy="180"
              r="22"
              fill={af("MOTOR")}
              stroke={st("MOTOR")}
              strokeWidth="1.5"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 49 180"
                to="360 49 180"
                dur="3s"
                repeatCount="indefinite"
              />
            </circle>
          )}
          <text
            x="49"
            y="246"
            fill={parts.MOTOR.color}
            fontSize="7"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            MOTOR
          </text>
          <text
            x="49"
            y="258"
            fill={parts.MOTOR.color}
            fontSize="6"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.6"
          >
            {u.quvvat} kW
          </text>
          {/* reduktor */}
          <rect
            x="88"
            y="158"
            width="22"
            height="44"
            rx="3"
            fill={af("MOTOR")}
            stroke={st("MOTOR")}
            strokeWidth="1.2"
          />
          <text
            x="99"
            y="182"
            fill={parts.MOTOR.color}
            fontSize="5.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.75"
          >
            RED
          </text>
        </g>

        {/* ── PRESS (yuqorida) ── */}
        <g
          onClick={() => click("PRESS_MEXANIZM")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "PRESS_MEXANIZM" ? 0.3 : 1}
        >
          <rect
            x="175"
            y="22"
            width="140"
            height="60"
            rx="5"
            fill={af("PRESS_MEXANIZM")}
            stroke={st("PRESS_MEXANIZM")}
            strokeWidth={sw("PRESS_MEXANIZM")}
          />
          <rect
            x="205"
            y="82"
            width="24"
            height="40"
            rx="4"
            fill={af("PRESS_MEXANIZM")}
            stroke={st("PRESS_MEXANIZM")}
            strokeWidth="1.5"
          />
          <rect
            x="261"
            y="82"
            width="24"
            height="40"
            rx="4"
            fill={af("PRESS_MEXANIZM")}
            stroke={st("PRESS_MEXANIZM")}
            strokeWidth="1.5"
          />
          <text
            x="245"
            y="56"
            fill={parts.PRESS_MEXANIZM.color}
            fontSize="8"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            GIDRAVLIK PRESS
          </text>
          <text
            x="245"
            y="70"
            fill={parts.PRESS_MEXANIZM.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.65"
          >
            {Math.round(u.bosim * 200)} kN
          </text>
        </g>

        {/* ── TAYANCH ROLIK (ustki) ── */}
        <g
          onClick={() => click("TAYANCHROLIK")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "TAYANCHROLIK" ? 0.3 : 1}
        >
          <rect
            x="110"
            y="120"
            width="280"
            height="44"
            rx="22"
            fill={af("TAYANCHROLIK")}
            stroke={st("TAYANCHROLIK")}
            strokeWidth={sw("TAYANCHROLIK")}
          />
          <text
            x="250"
            y="146"
            fill={parts.TAYANCHROLIK.color}
            fontSize="7.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            USTKI TAYANCH ROLIK
          </text>
        </g>

        {/* ── USTKI ISHCHI ROLIK ── */}
        <g
          onClick={() => click("USTKI_ROLIK")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "USTKI_ROLIK" ? 0.3 : 1}
        >
          <rect
            x="110"
            y="162"
            width="280"
            height="36"
            rx="18"
            fill={af("USTKI_ROLIK")}
            stroke={st("USTKI_ROLIK")}
            strokeWidth={sw("USTKI_ROLIK")}
          />
          {isActive &&
            [150, 210, 270, 330].map((cx) => (
              <circle
                key={cx}
                cx={cx}
                cy="180"
                r="14"
                fill={af("USTKI_ROLIK")}
                stroke={st("USTKI_ROLIK")}
                strokeWidth="1"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${cx} 180`}
                  to={`360 ${cx} 180`}
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          <text
            x="250"
            y="184"
            fill={parts.USTKI_ROLIK.color}
            fontSize="7.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            USTKI ISHCHI ROLIK
          </text>
        </g>

        {/* ── METALL TASMA ── */}
        <g
          onClick={() => click("METALL_TASMA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "METALL_TASMA" ? 0.3 : 1}
        >
          <rect
            x="0"
            y="196"
            width="500"
            height="20"
            rx="2"
            fill={af("METALL_TASMA")}
            stroke={st("METALL_TASMA")}
            strokeWidth={sw("METALL_TASMA")}
          />
          <text
            x="250"
            y="209"
            fill={parts.METALL_TASMA.color}
            fontSize="7.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            PROKAT MATERIALI — {u.harorat}°C
          </text>
          {isActive && (
            <rect
              x="0"
              y="196"
              width="200"
              height="20"
              rx="2"
              fill={`${parts.METALL_TASMA.color}25`}
            >
              <animate
                attributeName="x"
                values="-200;500"
                dur="2.5s"
                repeatCount="indefinite"
              />
            </rect>
          )}
        </g>

        {/* ── PASTKI ISHCHI ROLIK ── */}
        <g
          onClick={() => click("PASTKI_ROLIK")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "PASTKI_ROLIK" ? 0.3 : 1}
        >
          <rect
            x="110"
            y="214"
            width="280"
            height="36"
            rx="18"
            fill={af("PASTKI_ROLIK")}
            stroke={st("PASTKI_ROLIK")}
            strokeWidth={sw("PASTKI_ROLIK")}
          />
          {isActive &&
            [150, 210, 270, 330].map((cx) => (
              <circle
                key={cx}
                cx={cx}
                cy="232"
                r="14"
                fill={af("PASTKI_ROLIK")}
                stroke={st("PASTKI_ROLIK")}
                strokeWidth="1"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${cx} 232`}
                  to={`-360 ${cx} 232`}
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          <text
            x="250"
            y="236"
            fill={parts.PASTKI_ROLIK.color}
            fontSize="7.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            PASTKI ISHCHI ROLIK
          </text>
        </g>

        {/* ── PASTKI TAYANCH ROLIK ── */}
        <g
          onClick={() => click("TAYANCHROLIK")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "TAYANCHROLIK" ? 0.3 : 1}
        >
          <rect
            x="110"
            y="248"
            width="280"
            height="44"
            rx="22"
            fill={af("TAYANCHROLIK")}
            stroke={st("TAYANCHROLIK")}
            strokeWidth="1.5"
          />
          <text
            x="250"
            y="274"
            fill={parts.TAYANCHROLIK.color}
            fontSize="7.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            PASTKI TAYANCH ROLIK
          </text>
        </g>

        {/* ── SOVUTISH ── */}
        <g
          onClick={() => click("SOVUTISH")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "SOVUTISH" ? 0.3 : 1}
        >
          <path
            d="M395 162 Q430 162 445 175 Q430 195 395 195"
            fill="none"
            stroke={st("SOVUTISH")}
            strokeWidth={sw("SOVUTISH")}
            strokeDasharray="5,3"
          />
          <path
            d="M395 214 Q435 214 448 225 Q435 238 395 238"
            fill="none"
            stroke={st("SOVUTISH")}
            strokeWidth="1.5"
            strokeDasharray="5,3"
          />
          <text
            x="450"
            y="205"
            fill={parts.SOVUTISH.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            opacity="0.8"
          >
            SOVUTISH SUV
          </text>
        </g>

        {/* ── KESUVCHI ── */}
        <g
          onClick={() => click("KESUVCHI")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "KESUVCHI" ? 0.3 : 1}
        >
          <rect
            x="20"
            y="196"
            width="10"
            height="20"
            rx="2"
            fill={af("KESUVCHI")}
            stroke={st("KESUVCHI")}
            strokeWidth="1.8"
          />
          <path
            d="M20 193 L30 193"
            stroke={parts.KESUVCHI.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <path
            d="M20 219 L30 219"
            stroke={parts.KESUVCHI.color}
            strokeWidth="2.5"
            strokeLinecap="round"
            opacity="0.7"
          />
          <text
            x="30"
            y="188"
            fill={parts.KESUVCHI.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            opacity="0.8"
          >
            QAYCHI
          </text>
        </g>
      </svg>
      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════════
//   NASOS
// ══════════════════════════════════════════════════════════════════════
function NasosDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isError = u.holat === "xato";
  const isActive = u.holat === "faol";
  const mc = isError ? "#ff2d55" : "#29b6f6";

  const parts = {
    KORPUS: {
      id: "KORPUS",
      nom: "Nasos Korpusi (Spirale)",
      vazifa: "Asosiy qobiq",
      color: mc,
      tavsif:
        "Cho'yan yoki po'latdan yasalgan. Spiralsimon kanal suyuqlikni to'playdi va bosimini oshiradi.",
      parametrlar: [
        { nom: "Bosim", qiymat: `${u.bosim} bar` },
        { nom: "Material", qiymat: "Cho'yan GG25" },
        { nom: "Holat", qiymat: isError ? "⚠ NOSOZ" : "✓ NORMAL" },
      ],
    },
    KRYLATKA: {
      id: "KRYLATKA",
      nom: "Krylatka (Impeller)",
      vazifa: "Suyuqlik harakati",
      color: "#00ff9d",
      tavsif:
        "Nasosning asosiy ishchi qismi. Aylanib suyuqlikni markazdan chekka tomonga itaradi.",
      parametrlar: [
        { nom: "RPM", qiymat: `${Math.round(u.quvvat * 24)}` },
        { nom: "Diametr", qiymat: "380 mm" },
        { nom: "Qanotlar soni", qiymat: "7 ta" },
      ],
    },
    INLET: {
      id: "INLET",
      nom: "Kirish Quvuri (Suction)",
      vazifa: "Suyuqlik kirishi",
      color: "#ffd60a",
      tavsif:
        "Suyuqlik pastki bosimda tortib olinadi. Filtr va klapan o'rnatiladi.",
      parametrlar: [
        { nom: "Bosim", qiymat: `${(u.bosim * 0.15).toFixed(2)} bar` },
        { nom: "Diametr", qiymat: "DN 200" },
        { nom: "Oqim", qiymat: `${Math.round(u.quvvat * 8)} m³/soat` },
      ],
    },
    OUTLET: {
      id: "OUTLET",
      nom: "Chiqish Quvuri (Discharge)",
      vazifa: "Suyuqlik chiqishi",
      color: "#ff6b1a",
      tavsif:
        "Yuqori bosimda siqilgan suyuqlik chiqib ketadi. Chek klapan o'rnatilgan.",
      parametrlar: [
        { nom: "Bosim", qiymat: `${u.bosim} bar` },
        { nom: "Diametr", qiymat: "DN 150" },
        { nom: "Tezlik", qiymat: `${Math.round(u.quvvat * 2.5)} m/s` },
      ],
    },
    MOTOR: {
      id: "MOTOR",
      nom: "Elektr Motor",
      vazifa: "Harakatlantirish",
      color: "#a78bfa",
      tavsif:
        "Nasos bilan to'g'ridan-to'g'ri yoki muftali ulangan asenkron motor.",
      parametrlar: [
        { nom: "Quvvat", qiymat: `${u.quvvat} kW` },
        { nom: "Kuchlanish", qiymat: "380/660 V" },
        { nom: "Sinfi", qiymat: "IP55" },
      ],
    },
    SALNIK: {
      id: "SALNIK",
      nom: "Mexanik Zıpma (Salnik)",
      vazifa: "Germetizatsiya",
      color: "#ff2d55",
      tavsif:
        "Val o'tadigan joyda suyuqlik oqmasligi uchun o'rnatilgan germetik halqa.",
      parametrlar: [
        { nom: "Holat", qiymat: isError ? "⚠ OQYAPTI" : "✓ Germetik" },
        { nom: "Material", qiymat: "SiC/SiC" },
        { nom: "Umr", qiymat: "8000 soat" },
      ],
    },
    MUFTA: {
      id: "MUFTA",
      nom: "Elastik Mufta",
      vazifa: "Ulash",
      color: "#6b7280",
      tavsif: "Motor valini nasos valiga ulaydi. Tebranishni kamaytiradi.",
      parametrlar: [
        { nom: "Moment", qiymat: `${Math.round(u.quvvat * 9.5)} Nm` },
        { nom: "Material", qiymat: "Poliuretan" },
      ],
    },
    PODSHIPNIK: {
      id: "PODSHIPNIK",
      nom: "Podshipniklar",
      vazifa: "Val tayanchi",
      color: "#00d4ff",
      tavsif:
        "Krylatka valini ushlab turadi. Moylanadi yoki yog'li vanna bilan.",
      parametrlar: [
        { nom: "Turi", qiymat: "Radial-osial" },
        { nom: "Moy", qiymat: "ISO VG 68" },
        { nom: "Harorat", qiymat: `${Math.round(u.harorat * 0.06)}°C` },
      ],
    },
  };

  const click = (id) =>
    setActive((prev) => (prev?.id === id ? null : parts[id]));
  const af = (k) =>
    active?.id === k
      ? `${parts[k]?.color}38`
      : `${parts[k]?.color}${isDark ? "18" : "0f"}`;
  const st = (k) =>
    active?.id === k ? parts[k]?.color : `${parts[k]?.color}80`;
  const sw = (k) => (active?.id === k ? 2.5 : 1.8);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 440 360"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {isError && (
          <rect x="0" y="0" width="440" height="360" fill="#ff2d5505" />
        )}
        {[...Array(9)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 40}
            x2="440"
            y2={i * 40}
            stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"}
            strokeWidth="1"
          />
        ))}

        {/* ── INLET quvur ── */}
        <g
          onClick={() => click("INLET")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "INLET" ? 0.3 : 1}
        >
          <rect
            x="8"
            y="148"
            width="72"
            height="30"
            rx="15"
            fill={af("INLET")}
            stroke={st("INLET")}
            strokeWidth={sw("INLET")}
          />
          <path
            d="M80 163 L98 163"
            stroke={st("INLET")}
            strokeWidth="2"
            opacity="0.5"
            markerEnd="url(#arr)"
          />
          <text
            x="44"
            y="195"
            fill={parts.INLET.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            KIRISH (SUCTION)
          </text>
          <text
            x="44"
            y="207"
            fill={parts.INLET.color}
            fontSize="6"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.6"
          >
            {Math.round(u.quvvat * 8)} m³/h
          </text>
        </g>

        {/* ── KORPUS ── */}
        <g
          onClick={() => click("KORPUS")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "KORPUS" ? 0.3 : 1}
        >
          <ellipse
            cx="195"
            cy="178"
            rx="95"
            ry="88"
            fill={af("KORPUS")}
            stroke={st("KORPUS")}
            strokeWidth={sw("KORPUS")}
          />
          <text
            x="195"
            y="235"
            fill={parts.KORPUS.color}
            fontSize="7.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            SPIRALE KORPUS
          </text>
          <text
            x="195"
            y="248"
            fill={parts.KORPUS.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.6"
          >
            {u.bosim} bar
          </text>
        </g>

        {/* ── KRYLATKA ── */}
        <g
          onClick={() => click("KRYLATKA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "KRYLATKA" ? 0.3 : 1}
        >
          {[0, 51, 103, 154, 206, 257, 308].map((angle, i) => {
            const rad = (angle * Math.PI) / 180;
            const ox = 195 + Math.cos(rad) * 45;
            const oy = 178 + Math.sin(rad) * 45;
            const ox2 = 195 + Math.cos(rad) * 72;
            const oy2 = 178 + Math.sin(rad) * 72;
            return (
              <path
                key={i}
                d={`M195 178 Q${(ox + 195) / 2} ${(oy + 178) / 2} ${ox2} ${oy2} Q${ox2 * 0.9 + 195 * 0.1} ${oy2 * 0.9 + 178 * 0.1} 195 178`}
                fill={`${parts.KRYLATKA.color}${isDark ? "22" : "12"}`}
                stroke={st("KRYLATKA")}
                strokeWidth="1.5"
              >
                {isActive && (
                  <animateTransform
                    attributeName="transform"
                    type="rotate"
                    from={`0 195 178`}
                    to={`360 195 178`}
                    dur="1.8s"
                    repeatCount="indefinite"
                  />
                )}
              </path>
            );
          })}
          <circle
            cx="195"
            cy="178"
            r="18"
            fill={af("KRYLATKA")}
            stroke={st("KRYLATKA")}
            strokeWidth="1.8"
          />
          {isError && (
            <text
              x="195"
              y="183"
              fill="#ff2d55"
              fontSize="14"
              textAnchor="middle"
              opacity="0.7"
            >
              ✕
            </text>
          )}
        </g>

        {/* ── SALNIK ── */}
        <g
          onClick={() => click("SALNIK")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "SALNIK" ? 0.3 : 1}
        >
          <ellipse
            cx="195"
            cy="178"
            rx="22"
            ry="22"
            fill="none"
            stroke={st("SALNIK")}
            strokeWidth={isError ? 3 : sw("SALNIK")}
            strokeDasharray={isError ? "none" : "4,3"}
          />
          {isError && (
            <text x="215" y="165" fill="#ff2d55" fontSize="10" opacity="0.8">
              !
            </text>
          )}
        </g>

        {/* ── OUTLET (tepaga chiqish) ── */}
        <g
          onClick={() => click("OUTLET")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "OUTLET" ? 0.3 : 1}
        >
          <rect
            x="172"
            y="60"
            width="30"
            height="90"
            rx="15"
            fill={af("OUTLET")}
            stroke={st("OUTLET")}
            strokeWidth={sw("OUTLET")}
          />
          <text
            x="250"
            y="108"
            fill={parts.OUTLET.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            opacity="0.8"
          >
            CHIQISH
          </text>
          <line
            x1="202"
            y1="108"
            x2="248"
            y2="108"
            stroke={`${parts.OUTLET.color}40`}
            strokeWidth="0.8"
            strokeDasharray="3,2"
          />
          {isActive && (
            <circle
              cx="187"
              cy="82"
              r="3"
              fill={parts.OUTLET.color}
              opacity="0.6"
            >
              <animate
                attributeName="cy"
                values="150;65;150"
                dur="2s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                values="0.6;0.1;0.6"
                dur="2s"
                repeatCount="indefinite"
              />
            </circle>
          )}
        </g>

        {/* ── PODSHIPNIK ── */}
        <g
          onClick={() => click("PODSHIPNIK")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "PODSHIPNIK" ? 0.3 : 1}
        >
          <ellipse
            cx="195"
            cy="178"
            rx="12"
            ry="12"
            fill={af("PODSHIPNIK")}
            stroke={st("PODSHIPNIK")}
            strokeWidth="1.5"
          />
        </g>

        {/* ── MUFTA ── */}
        <g
          onClick={() => click("MUFTA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "MUFTA" ? 0.3 : 1}
        >
          <rect
            x="285"
            y="164"
            width="26"
            height="28"
            rx="4"
            fill={af("MUFTA")}
            stroke={st("MUFTA")}
            strokeWidth={sw("MUFTA")}
          />
          <text
            x="298"
            y="308"
            fill={parts.MUFTA.color}
            fontSize="6"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.7"
          >
            MUFTA
          </text>
        </g>

        {/* ── MOTOR ── */}
        <g
          onClick={() => click("MOTOR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "MOTOR" ? 0.3 : 1}
        >
          <rect
            x="308"
            y="120"
            width="115"
            height="115"
            rx="8"
            fill={af("MOTOR")}
            stroke={st("MOTOR")}
            strokeWidth={sw("MOTOR")}
          />
          {/* motor qovurg'asi */}
          {[135, 150, 165, 180, 195, 210].map((y) => (
            <line
              key={y}
              x1="308"
              y1={y}
              x2="424"
              y2={y}
              stroke={`${parts.MOTOR.color}25`}
              strokeWidth="1.5"
            />
          ))}
          <text
            x="366"
            y="178"
            fill={parts.MOTOR.color}
            fontSize="8.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
            fontWeight="bold"
          >
            MOTOR
          </text>
          <text
            x="366"
            y="193"
            fill={parts.MOTOR.color}
            fontSize="7"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.65"
          >
            {u.quvvat} kW
          </text>
          {isError && (
            <text
              x="366"
              y="222"
              fill="#ff2d55"
              fontSize="8"
              fontFamily="'Share Tech Mono',monospace"
              textAnchor="middle"
              opacity="0.7"
            >
              ◉ TO'XTATILDI
            </text>
          )}
        </g>

        {/* val */}
        <rect
          x="289"
          y="173"
          width="22"
          height="12"
          rx="2"
          fill={isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.05)"}
          stroke={isDark ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.15)"}
          strokeWidth="1"
        />

        {isError && (
          <g style={{ pointerEvents: "none" }}>
            <circle
              cx="195"
              cy="178"
              r="104"
              fill="none"
              stroke="#ff2d55"
              strokeWidth="1.5"
              strokeDasharray="10,5"
              opacity="0.3"
            >
              <animate
                attributeName="stroke-dashoffset"
                values="0;15"
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
            <text
              x="195"
              y="310"
              fill="#ff2d55"
              fontSize="8"
              fontFamily="'Share Tech Mono',monospace"
              textAnchor="middle"
              opacity="0.8"
            >
              ⚠ USKUNA NOSOZ — TEXNIK XIZMAT KERAK
            </text>
          </g>
        )}
      </svg>
      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════════
//   KRAN (Overhead Crane)
// ══════════════════════════════════════════════════════════════════════
function KranDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isActive = u.holat === "faol";
  const c = "#ffd60a";

  const parts = {
    RELS: {
      id: "RELS",
      nom: "Rels Yo'li",
      vazifa: "Harakat platformasi",
      color: "#6b7280",
      tavsif:
        "Bino ustiga o'rnatilgan po'lat rels. Kran ular ustida harakatlaniadi.",
      parametrlar: [
        { nom: "Uzunlik", qiymat: "120 m" },
        { nom: "Profil", qiymat: "KR-100" },
        { nom: "Material", qiymat: "Temir yo'l po'lati" },
      ],
    },
    FERMA: {
      id: "FERMA",
      nom: "Ko'prik Fermasi",
      vazifa: "Asosiy konstruksiya",
      color: "#00d4ff",
      tavsif:
        "Kran yurish mexanizmi harakatlanadigan asosiy po'lat ko'prik. Kuchli, engil.",
      parametrlar: [
        { nom: "Oralig'i", qiymat: "28 m" },
        { nom: "Og'irligi", qiymat: "42 t" },
        { nom: "Material", qiymat: "S355 po'lat" },
      ],
    },
    TELEZKA: {
      id: "TELEZKA",
      nom: "Yuruvchi Telezka",
      vazifa: "Ko'ndalang harakat",
      color: c,
      tavsif:
        "Ko'prik bo'ylab harakatlanadigan qurilma. Ko'tarish mexanizmini o'z ichiga oladi.",
      parametrlar: [
        { nom: "Og'irligi", qiymat: "8.5 t" },
        { nom: "Tezlik", qiymat: "40 m/min" },
        { nom: "Motor", qiymat: `${Math.round(u.quvvat / 4)} kW` },
      ],
    },
    KOTARISH: {
      id: "KOTARISH",
      nom: "Ko'tarish Mexanizmi (Hoist)",
      vazifa: "Ko'tarish",
      color: "#ff6b1a",
      tavsif:
        "Baraban va kanat tizimi. Yuk ko'tarilib tushiriladi. Elektromagnit tormoz bor.",
      parametrlar: [
        { nom: "Ko'tarish kuchi", qiymat: `${Math.round(u.quvvat * 0.28)} t` },
        { nom: "Tezlik", qiymat: "8 m/min" },
        { nom: "Motor", quvvat: `${u.quvvat} kW` },
      ],
    },
    KANAT: {
      id: "KANAT",
      nom: "Po'lat Kanat",
      vazifa: "Yuk ko'tarish",
      color: "#a78bfa",
      tavsif:
        "Ko'p qatlamli po'lat sim kanati. Minimal qiruvchi kuch bilan maksimal yuk ko'taradi.",
      parametrlar: [
        { nom: "Diametr", qiymat: "32 mm" },
        { nom: "Uzunlik", qiymat: "40 m" },
        { nom: "Yuk sig'imi", qiymat: `${Math.round(u.quvvat * 0.3)} t` },
      ],
    },
    KRYUK: {
      id: "KRYUK",
      nom: "Ko'tarish Kryuki",
      vazifa: "Yuk ilish",
      color: "#ff2d55",
      tavsif:
        "Yuk ilish qurilmasi. Xavfsizlik klapani bilan. Darajali yukni ko'rsatadi.",
      parametrlar: [
        { nom: "Sig'imi", qiymat: `${Math.round(u.quvvat * 0.28)} t` },
        { nom: "Material", qiymat: "34CrNiMo6" },
        { nom: "Holat", qiymat: isActive ? "✓ Faol" : "— Faolsiz" },
      ],
    },
    KABIN: {
      id: "KABIN",
      nom: "Operator Kabinasi",
      vazifa: "Boshqaruv",
      color: "#00ff9d",
      tavsif:
        "Kranchi o'tirib boshqaradigan konditsionerlangan kabina. Barcha tizimlar ko'rinadi.",
      parametrlar: [
        { nom: "Xodimlar", qiymat: "1 operator" },
        { nom: "Ko'rish", qiymat: "360° panorama" },
        { nom: "Aloqa", qiymat: "Ratsiya + kamera" },
      ],
    },
    YURISH_MOTOR: {
      id: "YURISH-MOTOR",
      nom: "Ko'prik Yurish Motori",
      vazifa: "Uzunlik harakat",
      color: "#a78bfa",
      tavsif:
        "Kran ko'prigini rels bo'ylab harakatlantiradi. 4 ta motor (2 ta har yonda).",
      parametrlar: [
        { nom: "Tezlik", qiymat: "80 m/min (max)" },
        { nom: "Motor x4", qiymat: `${Math.round(u.quvvat / 6)} kW` },
        { nom: "Tormoz", qiymat: "Elektromagnit" },
      ],
    },
  };

  const click = (id) =>
    setActive((prev) => (prev?.id === id ? null : parts[id]));
  const af = (k) =>
    active?.id === k
      ? `${parts[k]?.color}38`
      : `${parts[k]?.color}${isDark ? "18" : "0f"}`;
  const st = (k) =>
    active?.id === k ? parts[k]?.color : `${parts[k]?.color}80`;
  const sw = (k) => (active?.id === k ? 2.5 : 1.8);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 480 380"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        {[...Array(9)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 42}
            x2="480"
            y2={i * 42}
            stroke={isDark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)"}
            strokeWidth="1"
          />
        ))}

        {/* ── RELS ── */}
        <g
          onClick={() => click("RELS")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "RELS" ? 0.3 : 1}
        >
          <rect
            x="0"
            y="36"
            width="480"
            height="12"
            rx="4"
            fill={af("RELS")}
            stroke={st("RELS")}
            strokeWidth={sw("RELS")}
          />
          {[20, 60, 100, 140, 180, 220, 260, 300, 340, 380, 420, 460].map(
            (x) => (
              <rect
                key={x}
                x={x}
                y="22"
                width="10"
                height="28"
                rx="1"
                fill={af("RELS")}
                stroke={`${parts.RELS.color}60`}
                strokeWidth="1"
              />
            ),
          )}
          <text
            x="240"
            y="30"
            fill={parts.RELS.color}
            fontSize="7"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            RELS YO'LI
          </text>
        </g>

        {/* ── FERMA ── */}
        <g
          onClick={() => click("FERMA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "FERMA" ? 0.3 : 1}
        >
          <rect
            x="30"
            y="48"
            width="420"
            height="44"
            rx="4"
            fill={af("FERMA")}
            stroke={st("FERMA")}
            strokeWidth={sw("FERMA")}
          />
          {/* diagonal truslar */}
          {[60, 120, 180, 240, 300, 360, 420].map((x) => (
            <>
              <line
                key={`d1${x}`}
                x1={x}
                y1="48"
                x2={x + 30}
                y2="92"
                stroke={`${parts.FERMA.color}30`}
                strokeWidth="1.5"
              />
              <line
                key={`d2${x}`}
                x1={x + 30}
                y1="48"
                x2={x}
                y2="92"
                stroke={`${parts.FERMA.color}30`}
                strokeWidth="1.5"
              />
            </>
          ))}
          <text
            x="240"
            y="75"
            fill={parts.FERMA.color}
            fontSize="8"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            KO'PRIK FERMASI
          </text>
          <text
            x="240"
            y="88"
            fill={parts.FERMA.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.6"
          >
            28 m oraliq
          </text>
        </g>

        {/* ── YURISH MOTORLAR ── */}
        <g
          onClick={() => click("YURISH_MOTOR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "YURISH_MOTOR" ? 0.3 : 1}
        >
          <rect
            x="30"
            y="48"
            width="44"
            height="44"
            rx="4"
            fill={af("YURISH_MOTOR")}
            stroke={st("YURISH_MOTOR")}
            strokeWidth={sw("YURISH_MOTOR")}
          />
          <rect
            x="406"
            y="48"
            width="44"
            height="44"
            rx="4"
            fill={af("YURISH_MOTOR")}
            stroke={st("YURISH_MOTOR")}
            strokeWidth={sw("YURISH_MOTOR")}
          />
          {isActive &&
            [52, 428].map((cx) => (
              <circle
                key={cx}
                cx={cx}
                cy="70"
                r="14"
                fill={af("YURISH_MOTOR")}
                stroke={st("YURISH_MOTOR")}
                strokeWidth="1"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${cx} 70`}
                  to={`360 ${cx} 70`}
                  dur="2.5s"
                  repeatCount="indefinite"
                />
              </circle>
            ))}
          <text
            x="52"
            y="108"
            fill={parts.YURISH_MOTOR.color}
            fontSize="5.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.75"
          >
            MOTOR
          </text>
          <text
            x="428"
            y="108"
            fill={parts.YURISH_MOTOR.color}
            fontSize="5.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.75"
          >
            MOTOR
          </text>
        </g>

        {/* ── KABIN ── */}
        <g
          onClick={() => click("KABIN")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "KABIN" ? 0.3 : 1}
        >
          <rect
            x="32"
            y="92"
            width="60"
            height="50"
            rx="5"
            fill={af("KABIN")}
            stroke={st("KABIN")}
            strokeWidth={sw("KABIN")}
          />
          {/* deraza */}
          <rect
            x="38"
            y="98"
            width="48"
            height="28"
            rx="3"
            fill={isDark ? "rgba(0,255,157,0.08)" : "rgba(0,255,157,0.05)"}
            stroke={`${parts.KABIN.color}60`}
            strokeWidth="1"
          />
          <text
            x="62"
            y="154"
            fill={parts.KABIN.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            KABIN
          </text>
        </g>

        {/* ── TELEZKA ── */}
        <g
          onClick={() => click("TELEZKA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "TELEZKA" ? 0.3 : 1}
        >
          <rect
            x="195"
            y="90"
            width="130"
            height="55"
            rx="6"
            fill={af("TELEZKA")}
            stroke={st("TELEZKA")}
            strokeWidth={sw("TELEZKA")}
          />
          {/* telezka g'ildiraklar */}
          {[215, 305].map((cx) => (
            <circle
              key={cx}
              cx={cx}
              cy="92"
              r="7"
              fill={af("TELEZKA")}
              stroke={st("TELEZKA")}
              strokeWidth="1.5"
            >
              {isActive && (
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${cx} 92`}
                  to={`360 ${cx} 92`}
                  dur="1s"
                  repeatCount="indefinite"
                />
              )}
            </circle>
          ))}
          <text
            x="260"
            y="122"
            fill={parts.TELEZKA.color}
            fontSize="7.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            TELEZKA
          </text>
        </g>

        {/* ── KO'TARISH MEXANIZM ── */}
        <g
          onClick={() => click("KOTARISH")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "KOTARISH" ? 0.3 : 1}
        >
          <rect
            x="222"
            y="143"
            width="76"
            height="50"
            rx="5"
            fill={af("KOTARISH")}
            stroke={st("KOTARISH")}
            strokeWidth={sw("KOTARISH")}
          />
          {/* baraban */}
          <ellipse
            cx="260"
            cy="168"
            rx="28"
            ry="18"
            fill={af("KOTARISH")}
            stroke={st("KOTARISH")}
            strokeWidth="1.5"
          >
            {isActive && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from="0 260 168"
                to="360 260 168"
                dur="2s"
                repeatCount="indefinite"
              />
            )}
          </ellipse>
          <text
            x="260"
            y="173"
            fill={parts.KOTARISH.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            HOIST
          </text>
        </g>

        {/* ── KANAT ── */}
        <g
          onClick={() => click("KANAT")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "KANAT" ? 0.3 : 1}
        >
          <path
            d="M252 193 L245 300"
            stroke={st("KANAT")}
            strokeWidth={sw("KANAT")}
            strokeDasharray="6,4"
          />
          <path
            d="M268 193 L275 300"
            stroke={st("KANAT")}
            strokeWidth={sw("KANAT")}
            strokeDasharray="6,4"
          />
          <text
            x="300"
            y="250"
            fill={parts.KANAT.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            opacity="0.75"
          >
            KANAT
          </text>
        </g>

        {/* ── KRYUK ── */}
        <g
          onClick={() => click("KRYUK")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "KRYUK" ? 0.3 : 1}
        >
          <ellipse
            cx="260"
            cy="308"
            rx="28"
            ry="18"
            fill={af("KRYUK")}
            stroke={st("KRYUK")}
            strokeWidth={sw("KRYUK")}
          />
          <path
            d="M244 316 Q238 344 248 355 Q265 365 272 352 Q276 340 272 330"
            fill="none"
            stroke={st("KRYUK")}
            strokeWidth={sw("KRYUK")}
            strokeLinecap="round"
          />
          <text
            x="260"
            y="310"
            fill={parts.KRYUK.color}
            fontSize="7"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            KRYUK
          </text>
          <text
            x="260"
            y="374"
            fill={parts.KRYUK.color}
            fontSize="6.5"
            fontFamily="'Share Tech Mono',monospace"
            textAnchor="middle"
            opacity="0.65"
          >
            {Math.round(u.quvvat * 0.28)} t
          </text>
        </g>
      </svg>
      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

function KesishDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isActive = u.holat === "faol";
  const isErr = u.holat === "xato";
  const isWarn = u.holat === "ogohlantirish";

  const parts = {
    PRESS: {
      id: "PRESS",
      nom: "Gidravlik Press (6 silindr)",
      vazifa: "Bosim",
      color: "#00d4ff",
      tavsif: "6 ta silindr. Ustki pichoqni harakatlantiradi.",
      parametrlar: [
        { nom: "Bosim", qiymat: `${"180 bar"}` },
        { nom: "Kuch", qiymat: `${u.quvvat * 2 + " kN"}` },
      ],
    },
    USTKI_PICHOK: {
      id: "USTKI_PICHOK",
      nom: "Ustki Pichoq (Harakatlanuvchi)",
      vazifa: "Kesish",
      color: "#a78bfa",
      tavsif: "Gidravlik piston orqali harakatlanadi. O'tkir qirra.",
      parametrlar: [
        { nom: "Tezlik", qiymat: `${"12 mm/s"}` },
        { nom: "Kuch", qiymat: `${u.quvvat * 1.5 + " kN"}` },
      ],
    },
    PASTKI_PICHOK: {
      id: "PASTKI_PICHOK",
      nom: "Pastki Pichoq (Sobit)",
      vazifa: "Tayanch",
      color: "#00e676",
      tavsif: "Sobit pichoq. Metallni alt tomondan ushlab turadi.",
      parametrlar: [
        { nom: "Qalinlik", qiymat: `${"80 mm"}` },
        { nom: "Material", qiymat: `${"Tool Steel"}` },
      ],
    },
    PANEL: {
      id: "PANEL",
      nom: "Boshqaruv Paneli",
      vazifa: "Boshqaruv",
      color: "#ff9500",
      tavsif: "PLC boshqaruv. Ekran, tugmalar, indikatorlar.",
      parametrlar: [
        { nom: "Kes/son", qiymat: `${"1248 ta"}` },
        { nom: "Holat", qiymat: `${u.holat}` },
      ],
    },
    HIDRAVLIK: {
      id: "HIDRAVLIK",
      nom: "Gidravlik Stansiya",
      vazifa: "Quvvat",
      color: "#29b6f6",
      tavsif: "Yog' baki + nasos. Silindrlarni ta'minlaydi.",
      parametrlar: [
        { nom: "Bosim", qiymat: `${"180 bar"}` },
        { nom: "Quvvat", qiymat: `${u.quvvat + " kW"}` },
      ],
    },
  };

  const hit = (k) => setActive((prev) => (prev?.id === k ? null : parts[k]));

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 480 640"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="ks_frame" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#040810" />
            <stop offset="28%" stopColor="#0e1828" />
            <stop offset="55%" stopColor="#141e32" />
            <stop offset="78%" stopColor="#0e1828" />
            <stop offset="100%" stopColor="#040810" />
          </linearGradient>
          <linearGradient id="ks_blade" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#203848" />
            <stop offset="30%" stopColor="#304e68" />
            <stop offset="55%" stopColor="#406080" />
            <stop offset="80%" stopColor="#304e68" />
            <stop offset="100%" stopColor="#182e40" />
          </linearGradient>
          <linearGradient id="ks_blade_edge" x1="0%" y1="100%" x2="0%" y2="0%">
            <stop offset="0%" stopColor="#6a9ab8" />
            <stop offset="25%" stopColor="#90bcd8" />
            <stop offset="55%" stopColor="#78a8c4" />
            <stop offset="100%" stopColor="#3a6888" />
          </linearGradient>
          <linearGradient id="ks_hyd" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#08101e" />
            <stop offset="40%" stopColor="#182840" />
            <stop offset="60%" stopColor="#1e3048" />
            <stop offset="100%" stopColor="#08101e" />
          </linearGradient>
          <linearGradient id="ks_metal" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bb4400" />
            <stop offset="30%" stopColor="#ff7800" />
            <stop offset="50%" stopColor="#ffaa00" />
            <stop offset="70%" stopColor="#ff7800" />
            <stop offset="100%" stopColor="#bb4400" />
          </linearGradient>
          <radialGradient id="ks_spark" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffee44" />
            <stop offset="55%" stopColor="#ff8800" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#ff4400" stopOpacity="0" />
          </radialGradient>
          <linearGradient id="ks_oil" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a1828" />
            <stop offset="50%" stopColor="#162438" />
            <stop offset="100%" stopColor="#0a1828" />
          </linearGradient>
          <filter id="ks_glow4">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="ks_blur3">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="ks_blur6">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <rect width="480" height="640" fill="#05080e" />

        {/* ============================================================
     USTKI QISM — gidravlik press
     ============================================================ */}

        {/* Gidravlik stansiya (yuqori orqa) */}
        <rect
          x="44"
          y="28"
          width="392"
          height="62"
          rx="5"
          fill="url(#ks_frame)"
          stroke="#121e30"
          strokeWidth="2"
        />
        <rect
          x="48"
          y="32"
          width="384"
          height="54"
          rx="4"
          fill="#080e1a"
          stroke="#0e1828"
          strokeWidth="1"
        />

        {/* 6 ta gidravlik silindr */}
        <g fill="url(#ks_hyd)" stroke="#1e3040" strokeWidth="1.8">
          <rect x="62" y="34" width="42" height="52" rx="7" />
          <rect x="124" y="34" width="42" height="52" rx="7" />
          <rect x="196" y="34" width="42" height="52" rx="7" />
          <rect x="268" y="34" width="42" height="52" rx="7" />
          <rect x="340" y="34" width="42" height="52" rx="7" />
          <rect x="402" y="34" width="28" height="52" rx="7" />
        </g>
        {/* Silindr ichki (piston görünen) */}
        <g fill="#0a1828" stroke="#1a2e40" strokeWidth="1">
          <rect x="67" y="38" width="32" height="44" rx="5" />
          <rect x="129" y="38" width="32" height="44" rx="5" />
          <rect x="201" y="38" width="32" height="44" rx="5" />
          <rect x="273" y="38" width="32" height="44" rx="5" />
          <rect x="345" y="38" width="32" height="44" rx="5" />
          <rect x="407" y="38" width="18" height="44" rx="5" />
        </g>
        {/* Silindr yuz (xrom) */}
        <g fill="#1e3848" opacity="0.4">
          <rect x="68" y="40" width="10" height="40" rx="2" />
          <rect x="130" y="40" width="10" height="40" rx="2" />
          <rect x="202" y="40" width="10" height="40" rx="2" />
          <rect x="274" y="40" width="10" height="40" rx="2" />
          <rect x="346" y="40" width="10" height="40" rx="2" />
        </g>
        {/* Gidravlik linia (tepa) */}
        <path
          d="M83 34 Q83 16 130 12 Q240 6 360 12 Q407 16 416 34"
          fill="none"
          stroke="#162838"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M83 34 Q83 16 130 12 Q240 6 360 12 Q407 16 416 34"
          fill="none"
          stroke="#243848"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Gidravlik oqim */}
        <path
          d="M83 34 Q83 16 130 12 Q240 6 360 12 Q407 16 416 34"
          fill="none"
          stroke="#4488aa"
          strokeWidth="1.8"
          strokeDasharray="8,6"
          opacity="0.35"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="0;-28"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </path>
        {/* Bosim o'lchagich (tepa o'ng) */}
        <circle
          cx="446"
          cy="42"
          r="18"
          fill="#08101e"
          stroke="#162030"
          strokeWidth="1.8"
        />
        <circle
          cx="446"
          cy="42"
          r="13"
          fill="#060c18"
          stroke="#102030"
          strokeWidth="1.2"
        />
        <circle
          cx="446"
          cy="42"
          r="11"
          fill="none"
          stroke="#1a2838"
          strokeWidth="0.6"
          strokeDasharray="2,2"
        />
        <line
          x1="446"
          y1="42"
          x2="452"
          y2="34"
          stroke="#ff6600"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        <circle cx="446" cy="42" r="2.5" fill="#ff6600" />

        {/* Piston shtoklar (6 ta) */}
        <g fill="#162838" stroke="#2a4258" strokeWidth="1.2">
          <rect x="74" y="86" width="18" height="62" rx="7" />
          <rect x="136" y="86" width="18" height="62" rx="7" />
          <rect x="208" y="86" width="18" height="62" rx="7" />
          <rect x="280" y="86" width="18" height="62" rx="7" />
          <rect x="352" y="86" width="18" height="62" rx="7" />
          <rect x="410" y="86" width="14" height="62" rx="5" />
        </g>
        {/* Shtok xrom yuzasi */}
        <g fill="#2e5a78" opacity="0.4">
          <rect x="76" y="88" width="6" height="58" rx="2" />
          <rect x="138" y="88" width="6" height="58" rx="2" />
          <rect x="210" y="88" width="6" height="58" rx="2" />
          <rect x="282" y="88" width="6" height="58" rx="2" />
          <rect x="354" y="88" width="6" height="58" rx="2" />
        </g>

        {/* Harakatlanuvchi balka (ustki pichoq tutgich) */}
        <rect
          x="44"
          y="148"
          width="392"
          height="42"
          rx="5"
          fill="url(#ks_frame)"
          stroke="#1a2838"
          strokeWidth="2"
        />
        {/* Balka kuchlaydiruvchi nervalar */}
        <g stroke="#0e1828" strokeWidth="1.5" fill="none">
          <line x1="44" y1="169" x2="436" y2="169" />
        </g>
        {/* Balka boltlari */}
        <g fill="#08101e" stroke="#14202e" strokeWidth="1">
          <circle cx="56" cy="158" r="5" /> <circle cx="56" cy="182" r="5" />
          <circle cx="96" cy="158" r="5" /> <circle cx="96" cy="182" r="5" />
          <circle cx="144" cy="158" r="5" /> <circle cx="144" cy="182" r="5" />
          <circle cx="196" cy="158" r="5" /> <circle cx="196" cy="182" r="5" />
          <circle cx="248" cy="158" r="5" /> <circle cx="248" cy="182" r="5" />
          <circle cx="300" cy="158" r="5" /> <circle cx="300" cy="182" r="5" />
          <circle cx="352" cy="158" r="5" /> <circle cx="352" cy="182" r="5" />
          <circle cx="400" cy="158" r="5" /> <circle cx="400" cy="182" r="5" />
          <circle cx="428" cy="158" r="5" /> <circle cx="428" cy="182" r="5" />
        </g>

        {/* ============================================================
     USTKI PICHOQ
     ============================================================ */}
        <rect
          x="44"
          y="190"
          width="392"
          height="26"
          rx="3"
          fill="url(#ks_blade)"
          stroke="#1e3848"
          strokeWidth="1.8"
        >
          <animate
            attributeName="y"
            values="190;220;190"
            dur="2.5s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
          />
        </rect>
        {/* Pichoq kesuvchi qirra */}
        <rect
          x="44"
          y="212"
          width="392"
          height="4"
          rx="1"
          fill="url(#ks_blade_edge)"
          opacity="0.9"
        >
          <animate
            attributeName="y"
            values="212;242;212"
            dur="2.5s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
          />
        </rect>
        {/* Pichoq sirt highlight */}
        <rect
          x="44"
          y="191"
          width="392"
          height="4"
          rx="1"
          fill="#5a8aaa"
          opacity="0.35"
        >
          <animate
            attributeName="y"
            values="191;221;191"
            dur="2.5s"
            repeatCount="indefinite"
            calcMode="spline"
            keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
          />
        </rect>

        {/* ============================================================
     METALL TASMA (kesilayotgan)
     ============================================================ */}
        {/* Kirish (chap) */}
        <rect
          x="0"
          y="216"
          width="56"
          height="20"
          fill="#bb4400"
          opacity="0.88"
        />
        {/* Asosiy tasma */}
        <rect x="44" y="216" width="392" height="20" fill="url(#ks_metal)" />
        {/* Chiqish (o'ng) */}
        <rect
          x="424"
          y="216"
          width="56"
          height="20"
          fill="#884400"
          opacity="0.75"
        />
        {/* Harakatlanuvchi yorug'lik */}
        <rect
          x="-80"
          y="216"
          width="60"
          height="20"
          fill="#ffee88"
          opacity="0.18"
        >
          <animate
            attributeName="x"
            values="-80;520"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </rect>
        {/* Tasma yuzasi */}
        <g stroke="#ff660028" strokeWidth="1">
          <line x1="0" y1="219" x2="480" y2="219" />
          <line x1="0" y1="226" x2="480" y2="226" />
          <line x1="0" y1="234" x2="480" y2="234" />
        </g>
        {/* Issiqlik */}
        <rect
          x="0"
          y="212"
          width="480"
          height="28"
          fill="#ff7700"
          opacity="0.05"
          filter="url(#ks_blur3)"
        />

        {/* ============================================================
     KESISH NUQTASI — UCHQUNLAR
     ============================================================ */}
        <ellipse
          cx="240"
          cy="226"
          rx="16"
          ry="8"
          fill="url(#ks_spark)"
          opacity="0.8"
          filter="url(#ks_glow4)"
        >
          <animate
            attributeName="rx"
            values="16;22;11;18;16"
            dur="0.45s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.8;0.15;0.8"
            dur="0.4s"
            repeatCount="indefinite"
          />
        </ellipse>
        <g filter="url(#ks_glow4)">
          <line
            x1="237"
            y1="222"
            x2="228"
            y2="206"
            stroke="#ffee44"
            strokeWidth="2"
            opacity="0.85"
          >
            <animate
              attributeName="opacity"
              values="0.85;0;0.85"
              dur="0.38s"
              repeatCount="indefinite"
            />
          </line>
          <line
            x1="243"
            y1="222"
            x2="252"
            y2="206"
            stroke="#ffcc00"
            strokeWidth="2"
            opacity="0.8"
          >
            <animate
              attributeName="opacity"
              values="0.8;0;0.8"
              dur="0.32s"
              begin="0.08s"
              repeatCount="indefinite"
            />
          </line>
          <line
            x1="240"
            y1="221"
            x2="240"
            y2="204"
            stroke="#ff9900"
            strokeWidth="1.5"
            opacity="0.7"
          >
            <animate
              attributeName="opacity"
              values="0.7;0;0.7"
              dur="0.3s"
              begin="0.16s"
              repeatCount="indefinite"
            />
          </line>
          <line
            x1="234"
            y1="223"
            x2="224"
            y2="211"
            stroke="#ffaa00"
            strokeWidth="1.5"
            opacity="0.6"
          >
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="0.36s"
              begin="0.22s"
              repeatCount="indefinite"
            />
          </line>
          <line
            x1="246"
            y1="223"
            x2="256"
            y2="210"
            stroke="#ffcc44"
            strokeWidth="1.5"
            opacity="0.6"
          >
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="0.34s"
              begin="0.12s"
              repeatCount="indefinite"
            />
          </line>
        </g>
        <ellipse
          cx="240"
          cy="226"
          rx="40"
          ry="16"
          fill="#ff8800"
          opacity="0.1"
          filter="url(#ks_blur6)"
        />

        {/* ============================================================
     PASTKI PICHOQ (sobit)
     ============================================================ */}
        <rect
          x="44"
          y="236"
          width="392"
          height="22"
          rx="3"
          fill="url(#ks_blade)"
          stroke="#1e3848"
          strokeWidth="1.8"
        />
        <rect
          x="44"
          y="236"
          width="392"
          height="4"
          rx="1"
          fill="url(#ks_blade_edge)"
          opacity="0.8"
        />

        {/* Pastki pichoq tutgich vintlar */}
        <g fill="#08101e" stroke="#141e2e" strokeWidth="1">
          <circle cx="56" cy="247" r="5" /> <circle cx="56" cy="257" r="5" />
          <circle cx="96" cy="247" r="5" /> <circle cx="96" cy="257" r="5" />
          <circle cx="144" cy="247" r="5" /> <circle cx="144" cy="257" r="5" />
          <circle cx="196" cy="247" r="5" /> <circle cx="196" cy="257" r="5" />
          <circle cx="248" cy="247" r="5" /> <circle cx="248" cy="257" r="5" />
          <circle cx="300" cy="247" r="5" /> <circle cx="300" cy="257" r="5" />
          <circle cx="352" cy="247" r="5" /> <circle cx="352" cy="257" r="5" />
          <circle cx="400" cy="247" r="5" /> <circle cx="400" cy="257" r="5" />
          <circle cx="428" cy="247" r="5" /> <circle cx="428" cy="257" r="5" />
        </g>

        {/* ============================================================
     PASTKI ASOSIY RAMA
     ============================================================ */}
        <rect
          x="28"
          y="258"
          width="424"
          height="148"
          rx="6"
          fill="url(#ks_frame)"
          stroke="#101828"
          strokeWidth="2.5"
        />
        <rect
          x="34"
          y="264"
          width="412"
          height="136"
          rx="4"
          fill="#06090f"
          stroke="#0c1420"
          strokeWidth="1.5"
        />

        {/* Pastki rama kuchlaydiruvchi qovurg'alar */}
        <g stroke="#0e1828" strokeWidth="1.8" fill="none">
          <line x1="34" y1="298" x2="446" y2="298" />
          <line x1="34" y1="332" x2="446" y2="332" />
          <line x1="34" y1="366" x2="446" y2="366" />
          <line x1="34" y1="390" x2="446" y2="390" />
        </g>
        {/* Diagonal qovurg'alar */}
        <g stroke="#0c1828" strokeWidth="1.2" fill="none" opacity="0.5">
          <line x1="34" y1="264" x2="84" y2="406" />
          <line x1="84" y1="264" x2="34" y2="406" />
          <line x1="84" y1="264" x2="160" y2="406" />
          <line x1="160" y1="264" x2="84" y2="406" />
          <line x1="320" y1="264" x2="396" y2="406" />
          <line x1="396" y1="264" x2="320" y2="406" />
          <line x1="396" y1="264" x2="446" y2="406" />
          <line x1="446" y1="264" x2="396" y2="406" />
        </g>

        {/* ============================================================
     GIDRAVLIK STANSIYA (o'ng tomon)
     ============================================================ */}
        <rect
          x="282"
          y="270"
          width="152"
          height="122"
          rx="4"
          fill="url(#ks_oil)"
          stroke="#162030"
          strokeWidth="1.8"
        />
        {/* Yog' baki qovurg'alar */}
        <g stroke="#0e1828" strokeWidth="1.5" fill="#080e1a">
          <rect x="286" y="278" width="144" height="6" rx="1" />
          <rect x="286" y="288" width="144" height="6" rx="1" />
          <rect x="286" y="298" width="144" height="6" rx="1" />
          <rect x="286" y="308" width="144" height="6" rx="1" />
          <rect x="286" y="318" width="144" height="6" rx="1" />
          <rect x="286" y="328" width="144" height="6" rx="1" />
          <rect x="286" y="338" width="144" height="6" rx="1" />
          <rect x="286" y="348" width="144" height="6" rx="1" />
          <rect x="286" y="358" width="144" height="6" rx="1" />
          <rect x="286" y="368" width="144" height="6" rx="1" />
          <rect x="286" y="378" width="144" height="6" rx="1" />
        </g>
        {/* Gidronasoskasi */}
        <circle
          cx="358"
          cy="330"
          r="32"
          fill="#060e18"
          stroke="#102030"
          strokeWidth="2"
        />
        <circle
          cx="358"
          cy="330"
          r="24"
          fill="#0a1420"
          stroke="#162030"
          strokeWidth="1.8"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 358 330"
            to="360 358 330"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="358"
          cy="330"
          r="12"
          fill="#080e1a"
          stroke="#101828"
          strokeWidth="1.2"
        />
        <circle
          cx="358"
          cy="330"
          r="5"
          fill="#0e1828"
          stroke="#182838"
          strokeWidth="1"
        />
        {/* Gidravlik hose ulanishlari */}
        <g fill="none" stroke="#162030" strokeWidth="4" strokeLinecap="round">
          <path d="M282 300 Q268 300 258 290 Q248 278 248 264" />
          <path d="M282 330 Q268 332 258 340 Q248 350 240 360" />
          <path d="M282 360 Q265 358 248 370 Q234 380 230 396" />
        </g>
        <g fill="none" stroke="#1e3040" strokeWidth="2" strokeLinecap="round">
          <path d="M282 300 Q268 300 258 290 Q248 278 248 264" />
          <path d="M282 330 Q268 332 258 340 Q248 350 240 360" />
          <path d="M282 360 Q265 358 248 370 Q234 380 230 396" />
        </g>

        {/* ============================================================
     BOSHQARUV PANELI (chap tomon)
     ============================================================ */}
        <rect
          x="36"
          y="270"
          width="192"
          height="126"
          rx="4"
          fill="#0a1428"
          stroke="#162030"
          strokeWidth="1.8"
        />

        {/* Ekran */}
        <rect
          x="42"
          y="278"
          width="110"
          height="70"
          rx="3"
          fill="#040c18"
          stroke="#0e2030"
          strokeWidth="1.5"
        />
        <rect
          x="44"
          y="280"
          width="106"
          height="66"
          rx="2"
          fill="#020a10"
          stroke="#081828"
          strokeWidth="1"
        />
        {/* Ekran ma'lumotlari */}
        <g fontFamily="'Courier New',monospace" fontSize="7.5" fill="#00cc88">
          <text x="48" y="296">
            HOLAT : FAOL
          </text>
          <text x="48" y="308">
            BOSIM : 180 bar
          </text>
          <text x="48" y="320">
            TEZLIK : 12 mm/s
          </text>
          <text x="48" y="332">
            KES/SON : 1248 ta
          </text>
          <text x="48" y="344">
            HARORAT : 42°C
          </text>
        </g>
        {/* Ekran kursor miltillashi */}
        <rect x="100" y="344" width="6" height="8" fill="#00cc88" opacity="0.9">
          <animate
            attributeName="opacity"
            values="0.9;0;0.9"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </rect>

        {/* Tugmalar bloki */}
        <rect
          x="158"
          y="278"
          width="64"
          height="16"
          rx="3"
          fill="#0c1828"
          stroke="#182030"
          strokeWidth="1"
        />
        <text
          x="190"
          y="290"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="6"
          fill="#2a4a60"
        >
          NAZORAT
        </text>
        {/* START/STOP/RESET tugmalari */}
        <g>
          <rect
            x="160"
            y="298"
            width="26"
            height="14"
            rx="3"
            fill="#122a18"
            stroke="#1e4024"
            strokeWidth="1"
          />
          <text
            x="173"
            y="308"
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="6"
            fill="#44aa55"
          >
            START
          </text>
          <rect
            x="190"
            y="298"
            width="26"
            height="14"
            rx="3"
            fill="#2a1212"
            stroke="#40181a"
            strokeWidth="1"
          />
          <text
            x="203"
            y="308"
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="6"
            fill="#aa4444"
          >
            STOP
          </text>
          <rect
            x="160"
            y="316"
            width="58"
            height="14"
            rx="3"
            fill="#1a1a10"
            stroke="#2e2e18"
            strokeWidth="1"
          />
          <text
            x="189"
            y="326"
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="6"
            fill="#aaaa44"
          >
            RESET
          </text>
        </g>
        {/* Reostat (qalinlik tanlash) */}
        <rect
          x="160"
          y="334"
          width="58"
          height="16"
          rx="3"
          fill="#0c1828"
          stroke="#182030"
          strokeWidth="1"
        />
        <rect
          x="164"
          y="338"
          width="42"
          height="8"
          rx="2"
          fill="#060e18"
          stroke="#0e1828"
          strokeWidth="0.8"
        />
        <rect
          x="180"
          y="337"
          width="12"
          height="10"
          rx="2"
          fill="#1a2e40"
          stroke="#243848"
          strokeWidth="1"
        />
        <text
          x="189"
          y="358"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="5.5"
          fill="#2a3e52"
        >
          QALINLIK
        </text>

        {/* Indikator chiroqlar */}
        <g>
          <circle
            cx="44"
            cy="362"
            r="6"
            fill="#00cc00"
            opacity="0.9"
            filter="url(#ks_blur3)"
          >
            <animate
              attributeName="opacity"
              values="0.9;0.4;0.9"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x="56"
            y="366"
            fontFamily="monospace"
            fontSize="6"
            fill="#2a5030"
          >
            TAYYOR
          </text>

          <circle
            cx="100"
            cy="362"
            r="6"
            fill="#ff9900"
            opacity="0.8"
            filter="url(#ks_blur3)"
          >
            <animate
              attributeName="opacity"
              values="0.8;0.2;0.8"
              dur="2.5s"
              begin="0.5s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x="112"
            y="366"
            fontFamily="monospace"
            fontSize="6"
            fill="#504020"
          >
            BOSIM
          </text>

          <circle cx="156" cy="362" r="6" fill="#cc2200" opacity="0.4" />
          <text
            x="168"
            y="366"
            fontFamily="monospace"
            fontSize="6"
            fill="#402020"
          >
            AVARIA
          </text>
        </g>

        {/* Metall hisoblagich */}
        <rect
          x="42"
          y="372"
          width="54"
          height="20"
          rx="3"
          fill="#060e18"
          stroke="#0e2030"
          strokeWidth="1.2"
        />
        <text
          x="69"
          y="380"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="6"
          fill="#2a5060"
        >
          HISOB
        </text>
        <text
          x="69"
          y="389"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="8"
          fill="#00aacc"
          fontWeight="bold"
        >
          001248
        </text>

        {/* ============================================================
     KESISH STOLICHA (o'rta oraliq)
     ============================================================ */}
        {/* Qabul qilish stolchasi (chiqish tomoni) */}
        <rect
          x="0"
          y="236"
          width="50"
          height="18"
          fill="#101828"
          stroke="#162030"
          strokeWidth="1.2"
        />
        <rect
          x="430"
          y="236"
          width="50"
          height="18"
          fill="#101828"
          stroke="#162030"
          strokeWidth="1.2"
        />
        {/* Stolcha roliklariga */}
        <g fill="#080e18" stroke="#122030" strokeWidth="1.2">
          <ellipse cx="14" cy="245" rx="7" ry="7" />
          <ellipse cx="28" cy="245" rx="7" ry="7" />
          <ellipse cx="42" cy="245" rx="7" ry="7" />
          <ellipse cx="438" cy="245" rx="7" ry="7" />
          <ellipse cx="452" cy="245" rx="7" ry="7" />
          <ellipse cx="466" cy="245" rx="7" ry="7" />
        </g>

        {/* ============================================================
     ZAMIN PLITASI
     ============================================================ */}
        <rect
          x="16"
          y="406"
          width="448"
          height="18"
          rx="4"
          fill="#080c18"
          stroke="#101828"
          strokeWidth="1.5"
        />
        <rect
          x="4"
          y="422"
          width="472"
          height="12"
          rx="3"
          fill="#06080f"
          stroke="#0c1018"
          strokeWidth="1"
        />
        {/* Anchor boltlar */}
        <g fill="#0a1020" stroke="#141e2c" strokeWidth="1">
          <rect x="32" y="402" width="16" height="22" rx="3" />
          <rect x="70" y="402" width="16" height="22" rx="3" />
          <rect x="240" y="402" width="16" height="22" rx="3" />
          <rect x="394" y="402" width="16" height="22" rx="3" />
          <rect x="432" y="402" width="16" height="22" rx="3" />
        </g>

        {/* ============================================================
     YAG'DU
     ============================================================ */}
        <ellipse
          cx="240"
          cy="226"
          rx="60"
          ry="24"
          fill="#ffaa00"
          opacity="0.07"
          filter="url(#ks_blur6)"
        />

        {/* ============================================================
     MATN
     ============================================================ */}
        <text
          x="240"
          y="470"
          textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize="13"
          fontWeight="bold"
          fill="#1e3855"
          letterSpacing="4"
        >
          KESISH STANOGI
        </text>
        <text
          x="240"
          y="488"
          textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize="9"
          fill="#162a40"
          letterSpacing="3"
        >
          HYDRAULIC SHEAR · CS-1200
        </text>

        {/* ── INTERAKTIV QATLAM (shaffof bosiladigan zonalar) ── */}
        {/* Har qism uchun alohida bosimli maydon SVGda to'g'ridan chizilgan elementlar ustiga */}
        {/* Foydalanuvchi SVG ustiga bosgan joyni JS orqali aniqlaymiz */}
      </svg>

      {/* ── QISMLAR TUGMALARI (SVG tashqarisida) ── */}
      <Box
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          display: "flex",
          flexDirection: "column",
          gap: 0.4,
          maxHeight: "60%",
          overflow: "hidden",
        }}
      >
        {Object.values(parts).map((p) => (
          <Box
            key={p.id}
            onClick={() => hit(p.id)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 0.7,
              py: 0.3,
              background:
                active?.id === p.id ? `${p.color}28` : "rgba(5,8,18,0.75)",
              border: `1px solid ${active?.id === p.id ? p.color : p.color + "40"}`,
              borderRadius: "3px",
              cursor: "pointer",
              transition: "all 0.15s",
              backdropFilter: "blur(4px)",
              "&:hover": { background: `${p.color}20`, borderColor: p.color },
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: p.color,
                boxShadow: active?.id === p.id ? `0 0 6px ${p.color}` : "none",
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.48rem",
                color: active?.id === p.id ? p.color : "#6b7280",
                letterSpacing: "0.06em",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              {p.nom}
            </Typography>
          </Box>
        ))}
      </Box>

      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════
//   Rulo — Haqiqiy SVG + Interaktiv
// ══════════════════════════════════════════════════════════════════
function RuloDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isActive = u.holat === "faol";
  const isErr = u.holat === "xato";
  const isWarn = u.holat === "ogohlantirish";

  const parts = {
    MANDREL: {
      id: "MANDREL",
      nom: "Mandrel va Rulo O'rami",
      vazifa: "O'rash",
      color: "#ff6b1a",
      tavsif: "Metall tasma spiralda o'raladi. Harorat: 800-900°C.",
      parametrlar: [
        { nom: "Diametr", qiymat: `${"840 mm (max)"}` },
        { nom: "Harorat", qiymat: `${u.harorat}` },
      ],
    },
    BOSUVCHI: {
      id: "BOSUVCHI",
      nom: "Bosuvchi Rolik",
      vazifa: "Bosim",
      color: "#00d4ff",
      tavsif: "Gidravlik silindr bilan siqadi. O'ralishni ta'minlaydi.",
      parametrlar: [
        { nom: "Kuch", qiymat: `${u.quvvat * 1.2 + " kN"}` },
        { nom: "Diametr", qiymat: `${"280 mm"}` },
      ],
    },
    MOTOR: {
      id: "MOTOR",
      nom: "Motor va Reduktor",
      vazifa: "Harakat",
      color: "#a78bfa",
      tavsif: "Mandrelni aylantiradi. Tezlik VFD bilan boshqariladi.",
      parametrlar: [
        { nom: "Quvvat", qiymat: `${u.quvvat + " kW"}` },
        { nom: "RPM", qiymat: `${"480"}` },
      ],
    },
    TRANSPORT: {
      id: "TRANSPORT",
      nom: "Kirish Transport Roliklarni",
      vazifa: "Kirish",
      color: "#00e676",
      tavsif: "Tasma prokattan rulo mashimasiga yo'naltiradi.",
      parametrlar: [
        { nom: "Tezlik", qiymat: `${"18 m/s"}` },
        { nom: "Harakat", qiymat: `${"Avtomatik"}` },
      ],
    },
    PANEL: {
      id: "PANEL",
      nom: "Boshqaruv Paneli",
      vazifa: "Boshqaruv",
      color: "#ff9500",
      tavsif: "RPM, rulo diametri, holat ko'rsatgichlari.",
      parametrlar: [
        { nom: "Holat", qiymat: `${u.holat}` },
        { nom: "RPM", qiymat: `${"480"}` },
      ],
    },
  };

  const hit = (k) => setActive((prev) => (prev?.id === k ? null : parts[k]));

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 480 640"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="rw_frame" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#040810" />
            <stop offset="28%" stopColor="#0e1828" />
            <stop offset="55%" stopColor="#141e30" />
            <stop offset="80%" stopColor="#0e1828" />
            <stop offset="100%" stopColor="#040810" />
          </linearGradient>
          <linearGradient id="rw_mandrel" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0a1828" />
            <stop offset="30%" stopColor="#1e3848" />
            <stop offset="55%" stopColor="#284858" />
            <stop offset="80%" stopColor="#1e3848" />
            <stop offset="100%" stopColor="#0a1828" />
          </linearGradient>
          <radialGradient id="rw_rulo" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#1e4060" />
            <stop offset="40%" stopColor="#142e48" />
            <stop offset="75%" stopColor="#0c2030" />
            <stop offset="100%" stopColor="#061420" />
          </radialGradient>
          <radialGradient id="rw_rulo_hot" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#cc4400" />
            <stop offset="40%" stopColor="#882800" />
            <stop offset="75%" stopColor="#441200" />
            <stop offset="100%" stopColor="#200800" />
          </radialGradient>
          <linearGradient id="rw_band" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#bb4400" />
            <stop offset="30%" stopColor="#ff7800" />
            <stop offset="50%" stopColor="#ffaa00" />
            <stop offset="70%" stopColor="#ff7800" />
            <stop offset="100%" stopColor="#bb4400" />
          </linearGradient>
          <linearGradient id="rw_motor" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#070810" />
            <stop offset="40%" stopColor="#101825" />
            <stop offset="60%" stopColor="#141c2a" />
            <stop offset="100%" stopColor="#070810" />
          </linearGradient>
          <linearGradient id="rw_press_roll" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#060c14" />
            <stop offset="35%" stopColor="#142030" />
            <stop offset="65%" stopColor="#1a2838" />
            <stop offset="100%" stopColor="#060c14" />
          </linearGradient>
          <filter id="rw_glow4">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="rw_glow8">
            <feGaussianBlur stdDeviation="8" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="rw_blur3">
            <feGaussianBlur stdDeviation="3" />
          </filter>
          <filter id="rw_blur6">
            <feGaussianBlur stdDeviation="6" />
          </filter>
        </defs>

        <rect width="480" height="640" fill="#05080e" />

        {/* ============================================================
     KIRISH ROLIKLARNI TRANSPORT LINIYASI (chap)
     ============================================================ */}
        {/* Kirish yo'l yotqizgichi */}
        <rect
          x="0"
          y="248"
          width="72"
          height="14"
          rx="5"
          fill="#0e1828"
          stroke="#182838"
          strokeWidth="1.5"
        />
        {/* Transport roliklarni */}
        <g fill="#070e18" stroke="#122030" strokeWidth="1.5">
          <ellipse cx="10" cy="255" rx="8" ry="7" />
          <ellipse cx="26" cy="255" rx="8" ry="7" />
          <ellipse cx="42" cy="255" rx="8" ry="7" />
          <ellipse cx="58" cy="255" rx="8" ry="7" />
        </g>
        <g fill="none" stroke="#1a3040" strokeWidth="1">
          <ellipse cx="10" cy="255" rx="5" ry="4" />
          <ellipse cx="26" cy="255" rx="5" ry="4" />
          <ellipse cx="42" cy="255" rx="5" ry="4" />
          <ellipse cx="58" cy="255" rx="5" ry="4" />
        </g>

        {/* Kirish metall tasma */}
        <rect
          x="0"
          y="248"
          width="80"
          height="14"
          fill="url(#rw_band)"
          opacity="0.85"
        />
        <rect
          x="-60"
          y="248"
          width="50"
          height="14"
          fill="#ffee88"
          opacity="0.15"
        >
          <animate
            attributeName="x"
            values="-60;80"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </rect>
        {/* Issiqlik */}
        <rect
          x="0"
          y="244"
          width="80"
          height="22"
          fill="#ff7700"
          opacity="0.06"
          filter="url(#rw_blur3)"
        />

        {/* ============================================================
     YOZUVCHI QURILMA (deflector rollar) — kirish yo'naltirgichi
     ============================================================ */}
        {/* Yo'naltiruvchi rolik 1 */}
        <rect
          x="72"
          y="220"
          width="28"
          height="80"
          rx="8"
          fill="url(#rw_press_roll)"
          stroke="#1a3040"
          strokeWidth="1.8"
        />
        <rect
          x="76"
          y="224"
          width="20"
          height="72"
          rx="6"
          fill="#081828"
          stroke="#142030"
          strokeWidth="1"
        />
        <g fill="#080e18" stroke="#142030" strokeWidth="1.2">
          <ellipse cx="86" cy="238" rx="8" ry="10" />
          <ellipse cx="86" cy="260" rx="8" ry="10">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 86 260"
              to="360 86 260"
              dur="1.5s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="86" cy="282" rx="8" ry="10" />
        </g>
        {/* Yo'naltiruvchi rolik 2 */}
        <rect
          x="72"
          y="234"
          width="28"
          height="32"
          rx="7"
          fill="url(#rw_press_roll)"
          stroke="#1a3040"
          strokeWidth="1.8"
        />

        {/* Kirish metall yo'li (egrilik orqali) */}
        <path
          d="M72 255 Q86 255 86 242 Q86 232 94 228"
          fill="none"
          stroke="#884400"
          strokeWidth="14"
          strokeLinecap="round"
        />
        <path
          d="M72 255 Q86 255 86 242 Q86 232 94 228"
          fill="none"
          stroke="url(#rw_band)"
          strokeWidth="10"
          strokeLinecap="round"
          opacity="0.85"
        />
        {/* Harakatlanuvchi yorug'lik (eg) */}
        <path
          d="M72 255 Q86 255 86 242 Q86 232 94 228"
          fill="none"
          stroke="#ffee88"
          strokeWidth="4"
          strokeDasharray="10,8"
          opacity="0.18"
        >
          <animate
            attributeName="stroke-dashoffset"
            values="0;-36"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </path>

        {/* ============================================================
     ASOSIY RULO MANDREL VA RULO O'ZI
     ============================================================ */}
        {/* Mandrel o'qi (gorizontal) */}
        <rect
          x="88"
          y="172"
          width="248"
          height="30"
          rx="8"
          fill="url(#rw_mandrel)"
          stroke="#1a3040"
          strokeWidth="2"
        />
        <rect
          x="92"
          y="176"
          width="240"
          height="22"
          rx="6"
          fill="#081828"
          stroke="#122030"
          strokeWidth="1.2"
        />
        {/* O'q xrom sirt */}
        <rect
          x="93"
          y="177"
          width="60"
          height="8"
          rx="3"
          fill="#1e3848"
          opacity="0.35"
        />

        {/* Mandrel flanslari (qisqich) */}
        {/* Chap flans */}
        <ellipse
          cx="102"
          cy="187"
          rx="28"
          ry="32"
          fill="url(#rw_mandrel)"
          stroke="#1e3040"
          strokeWidth="2"
        />
        <ellipse
          cx="102"
          cy="187"
          rx="22"
          ry="26"
          fill="#0a1828"
          stroke="#162030"
          strokeWidth="1.5"
        />
        <ellipse
          cx="102"
          cy="187"
          rx="14"
          ry="18"
          fill="#061220"
          stroke="#102030"
          strokeWidth="1"
        />
        {/* Flans boltlari */}
        <g fill="#0a1420" stroke="#1a2838" strokeWidth="1">
          <circle cx="102" cy="163" r="4" />
          <circle cx="118" cy="170" r="4" />
          <circle cx="122" cy="187" r="4" />
          <circle cx="118" cy="204" r="4" />
          <circle cx="102" cy="211" r="4" />
          <circle cx="86" cy="204" r="4" />
          <circle cx="82" cy="187" r="4" />
          <circle cx="86" cy="170" r="4" />
        </g>

        {/* O'ng flans */}
        <ellipse
          cx="322"
          cy="187"
          rx="28"
          ry="32"
          fill="url(#rw_mandrel)"
          stroke="#1e3040"
          strokeWidth="2"
        />
        <ellipse
          cx="322"
          cy="187"
          rx="22"
          ry="26"
          fill="#0a1828"
          stroke="#162030"
          strokeWidth="1.5"
        />
        <ellipse
          cx="322"
          cy="187"
          rx="14"
          ry="18"
          fill="#061220"
          stroke="#102030"
          strokeWidth="1"
        />
        <g fill="#0a1420" stroke="#1a2838" strokeWidth="1">
          <circle cx="322" cy="163" r="4" />
          <circle cx="338" cy="170" r="4" />
          <circle cx="342" cy="187" r="4" />
          <circle cx="338" cy="204" r="4" />
          <circle cx="322" cy="211" r="4" />
          <circle cx="306" cy="204" r="4" />
          <circle cx="302" cy="187" r="4" />
          <circle cx="306" cy="170" r="4" />
        </g>

        {/* RULO TANASI (o'ramlar) */}
        {/* Eng tashqi qatlam (issiq qizil) */}
        <ellipse
          cx="212"
          cy="187"
          rx="95"
          ry="95"
          fill="url(#rw_rulo_hot)"
          stroke="#441200"
          strokeWidth="2"
          opacity="0.9"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 212 187"
            to="360 212 187"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </ellipse>
        {/* O'ram chiziqlar (spiral ko'rinish) */}
        <ellipse
          cx="212"
          cy="187"
          rx="88"
          ry="88"
          fill="none"
          stroke="#882200"
          strokeWidth="1.5"
          opacity="0.8"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 212 187"
            to="360 212 187"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse
          cx="212"
          cy="187"
          rx="80"
          ry="80"
          fill="none"
          stroke="#661800"
          strokeWidth="2"
          opacity="0.7"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 212 187"
            to="360 212 187"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse
          cx="212"
          cy="187"
          rx="72"
          ry="72"
          fill="none"
          stroke="#551400"
          strokeWidth="2"
          opacity="0.6"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 212 187"
            to="360 212 187"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse
          cx="212"
          cy="187"
          rx="63"
          ry="63"
          fill="none"
          stroke="#441000"
          strokeWidth="1.5"
          opacity="0.5"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 212 187"
            to="360 212 187"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse
          cx="212"
          cy="187"
          rx="54"
          ry="54"
          fill="none"
          stroke="#330e00"
          strokeWidth="1.5"
          opacity="0.5"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 212 187"
            to="360 212 187"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse
          cx="212"
          cy="187"
          rx="44"
          ry="44"
          fill="none"
          stroke="#220a00"
          strokeWidth="1.5"
          opacity="0.45"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 212 187"
            to="360 212 187"
            dur="2.2s"
            repeatCount="indefinite"
          />
        </ellipse>
        {/* Ichki qatlamlar (to'qroq) */}
        <ellipse
          cx="212"
          cy="187"
          rx="34"
          ry="34"
          fill="#180800"
          stroke="#1a0800"
          strokeWidth="1.2"
          opacity="0.8"
        />
        <ellipse
          cx="212"
          cy="187"
          rx="24"
          ry="24"
          fill="#100600"
          stroke="#120600"
          strokeWidth="1.2"
          opacity="0.9"
        />
        {/* Issiqlik glow */}
        <ellipse
          cx="212"
          cy="187"
          rx="96"
          ry="96"
          fill="#cc3300"
          opacity="0.08"
          filter="url(#rw_blur6)"
        >
          <animate
            attributeName="opacity"
            values="0.08;0.04;0.08"
            dur="2s"
            repeatCount="indefinite"
          />
        </ellipse>
        <ellipse
          cx="212"
          cy="187"
          rx="50"
          ry="50"
          fill="#ff6600"
          opacity="0.12"
          filter="url(#rw_blur3)"
        >
          <animate
            attributeName="opacity"
            values="0.12;0.05;0.12"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* Mandrel markazi ko'rinadigan qismi */}
        <ellipse
          cx="212"
          cy="187"
          rx="14"
          ry="14"
          fill="#0a1828"
          stroke="#162838"
          strokeWidth="2"
        />
        <ellipse
          cx="212"
          cy="187"
          rx="8"
          ry="8"
          fill="#061020"
          stroke="#102030"
          strokeWidth="1.5"
        />

        {/* ============================================================
     BOSUVCHI ROLIK (pressure roll)
     ============================================================ */}
        {/* Bosuvchi rolik kolonnasi */}
        <rect
          x="198"
          y="78"
          width="28"
          height="44"
          rx="5"
          fill="url(#rw_mandrel)"
          stroke="#1a3040"
          strokeWidth="1.8"
        />
        {/* Gidravlik silindr (bosuvchi) */}
        <rect
          x="202"
          y="38"
          width="20"
          height="44"
          rx="6"
          fill="url(#rw_frame)"
          stroke="#162030"
          strokeWidth="1.5"
        />
        <rect
          x="206"
          y="42"
          width="12"
          height="36"
          rx="4"
          fill="#081828"
          stroke="#122030"
          strokeWidth="1"
        />
        <rect
          x="208"
          y="44"
          width="4"
          height="32"
          rx="2"
          fill="#1e3848"
          opacity="0.35"
        />
        {/* Gidravlik flanets tepa */}
        <rect
          x="194"
          y="34"
          width="36"
          height="10"
          rx="4"
          fill="#10202e"
          stroke="#1e2e40"
          strokeWidth="1.5"
        />
        <g fill="#0a1428" stroke="#162030" strokeWidth="1">
          <circle cx="200" cy="39" r="3.5" />{" "}
          <circle cx="224" cy="39" r="3.5" />
        </g>
        {/* Bosuvchi rolik o'zi */}
        <rect
          x="118"
          y="78"
          width="188"
          height="34"
          rx="17"
          fill="url(#rw_press_roll)"
          stroke="#1a3040"
          strokeWidth="2"
        />
        <rect
          x="122"
          y="82"
          width="180"
          height="26"
          rx="13"
          fill="#081828"
          stroke="#12202e"
          strokeWidth="1.2"
        />
        {/* Bosuvchi rolik disklar */}
        <g fill="#060c18" stroke="#142030" strokeWidth="1.5">
          <ellipse cx="140" cy="95" rx="12" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 140 95"
              to="360 140 95"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="178" cy="95" rx="12" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 178 95"
              to="360 178 95"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="212" cy="95" rx="12" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 212 95"
              to="360 212 95"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="246" cy="95" rx="12" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 246 95"
              to="360 246 95"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="284" cy="95" rx="12" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 284 95"
              to="360 284 95"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* ============================================================
     ASOSIY RAME (ikki yon ustun)
     ============================================================ */}
        {/* Chap ustun */}
        <rect
          x="62"
          y="92"
          width="44"
          height="248"
          rx="5"
          fill="url(#rw_frame)"
          stroke="#0e1828"
          strokeWidth="2.2"
        />
        {/* Ustun diagonal kuchlaydiruvchilar */}
        <g stroke="#141e2e" strokeWidth="1.5" opacity="0.6">
          <line x1="62" y1="120" x2="106" y2="158" />{" "}
          <line x1="106" y1="120" x2="62" y2="158" />
          <line x1="62" y1="168" x2="106" y2="206" />{" "}
          <line x1="106" y1="168" x2="62" y2="206" />
          <line x1="62" y1="220" x2="106" y2="258" />{" "}
          <line x1="106" y1="220" x2="62" y2="258" />
          <line x1="62" y1="278" x2="106" y2="316" />{" "}
          <line x1="106" y1="278" x2="62" y2="316" />
        </g>
        {/* Ustun boltlari */}
        <g fill="#08101e" stroke="#121c2c" strokeWidth="1">
          <circle cx="74" cy="112" r="5" /> <circle cx="74" cy="158" r="5" />
          <circle cx="74" cy="206" r="5" /> <circle cx="74" cy="254" r="5" />
          <circle cx="94" cy="112" r="5" /> <circle cx="94" cy="158" r="5" />
          <circle cx="94" cy="206" r="5" /> <circle cx="94" cy="254" r="5" />
        </g>

        {/* O'ng ustun */}
        <rect
          x="374"
          y="92"
          width="44"
          height="248"
          rx="5"
          fill="url(#rw_frame)"
          stroke="#0e1828"
          strokeWidth="2.2"
        />
        <g stroke="#141e2e" strokeWidth="1.5" opacity="0.6">
          <line x1="374" y1="120" x2="418" y2="158" />{" "}
          <line x1="418" y1="120" x2="374" y2="158" />
          <line x1="374" y1="168" x2="418" y2="206" />{" "}
          <line x1="418" y1="168" x2="374" y2="206" />
          <line x1="374" y1="220" x2="418" y2="258" />{" "}
          <line x1="418" y1="220" x2="374" y2="258" />
          <line x1="374" y1="278" x2="418" y2="316" />{" "}
          <line x1="418" y1="278" x2="374" y2="316" />
        </g>
        <g fill="#08101e" stroke="#121c2c" strokeWidth="1">
          <circle cx="386" cy="112" r="5" /> <circle cx="386" cy="158" r="5" />
          <circle cx="386" cy="206" r="5" /> <circle cx="386" cy="254" r="5" />
          <circle cx="406" cy="112" r="5" /> <circle cx="406" cy="158" r="5" />
          <circle cx="406" cy="206" r="5" /> <circle cx="406" cy="254" r="5" />
        </g>

        {/* ============================================================
     MOTOR BLOKI (o'ng tomon)
     ============================================================ */}
        <rect
          x="418"
          y="128"
          width="54"
          height="128"
          rx="5"
          fill="url(#rw_motor)"
          stroke="#101828"
          strokeWidth="2"
        />
        {/* Radyator qovurg'alar */}
        <g stroke="#0c1420" strokeWidth="1.5" fill="#080c18">
          <rect x="422" y="136" width="46" height="5" rx="1" />
          <rect x="422" y="145" width="46" height="5" rx="1" />
          <rect x="422" y="154" width="46" height="5" rx="1" />
          <rect x="422" y="163" width="46" height="5" rx="1" />
          <rect x="422" y="172" width="46" height="5" rx="1" />
          <rect x="422" y="181" width="46" height="5" rx="1" />
          <rect x="422" y="190" width="46" height="5" rx="1" />
          <rect x="422" y="199" width="46" height="5" rx="1" />
          <rect x="422" y="208" width="46" height="5" rx="1" />
          <rect x="422" y="217" width="46" height="5" rx="1" />
          <rect x="422" y="226" width="46" height="5" rx="1" />
          <rect x="422" y="235" width="46" height="5" rx="1" />
          <rect x="422" y="244" width="46" height="5" rx="1" />
        </g>
        {/* Motor markazi */}
        <circle
          cx="445"
          cy="192"
          r="28"
          fill="#060c18"
          stroke="#101828"
          strokeWidth="2"
        />
        <circle
          cx="445"
          cy="192"
          r="20"
          fill="#0a1420"
          stroke="#162030"
          strokeWidth="1.8"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 445 192"
            to="360 445 192"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="445"
          cy="192"
          r="10"
          fill="#060e18"
          stroke="#102030"
          strokeWidth="1.2"
        />
        <circle
          cx="445"
          cy="192"
          r="4"
          fill="#0e1828"
          stroke="#1a2838"
          strokeWidth="1"
        />
        {/* Motor val ulanishi */}
        <rect
          x="392"
          y="182"
          width="30"
          height="20"
          rx="8"
          fill="#102030"
          stroke="#1a2e40"
          strokeWidth="1.5"
        />
        <rect
          x="418"
          y="186"
          width="6"
          height="12"
          rx="3"
          fill="#162838"
          stroke="#243848"
          strokeWidth="1"
        />
        {/* Terminal */}
        <rect
          x="422"
          y="250"
          width="46"
          height="12"
          rx="3"
          fill="#0c1828"
          stroke="#1a2838"
          strokeWidth="1"
        />
        <g fill="#1e4060">
          <circle cx="430" cy="256" r="3" /> <circle cx="438" cy="256" r="3" />
          <circle cx="446" cy="256" r="3" /> <circle cx="454" cy="256" r="3" />{" "}
          <circle cx="462" cy="256" r="3" />
        </g>

        {/* ============================================================
     REDUKTOR
     ============================================================ */}
        <rect
          x="354"
          y="158"
          width="46"
          height="68"
          rx="4"
          fill="#0e1828"
          stroke="#182838"
          strokeWidth="1.5"
        />
        <rect
          x="358"
          y="162"
          width="38"
          height="60"
          rx="3"
          fill="#081220"
          stroke="#122030"
          strokeWidth="1"
        />
        {/* Reduktor tishli g'ildiraklar (ko'rinadigan) */}
        <circle
          cx="377"
          cy="185"
          r="16"
          fill="#060e18"
          stroke="#142030"
          strokeWidth="1.5"
        />
        <circle
          cx="377"
          cy="185"
          r="11"
          fill="#0a1420"
          stroke="#1a2838"
          strokeWidth="1.2"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 377 185"
            to="360 377 185"
            dur="1.8s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="377"
          cy="185"
          r="5"
          fill="#081018"
          stroke="#101828"
          strokeWidth="1"
        />
        <circle
          cx="377"
          cy="210"
          r="11"
          fill="#060e18"
          stroke="#142030"
          strokeWidth="1.5"
        />
        <circle
          cx="377"
          cy="210"
          r="7"
          fill="#0a1420"
          stroke="#1a2838"
          strokeWidth="1.2"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 377 210"
            to="-360 377 210"
            dur="1.2s"
            repeatCount="indefinite"
          />
        </circle>

        {/* ============================================================
     BOSHQARUV PANELI (chap tomon)
     ============================================================ */}
        <rect
          x="0"
          y="340"
          width="64"
          height="148"
          rx="4"
          fill="#0a1428"
          stroke="#162030"
          strokeWidth="1.8"
        />
        {/* Panel ekrani */}
        <rect
          x="4"
          y="348"
          width="56"
          height="44"
          rx="3"
          fill="#040c18"
          stroke="#0e2030"
          strokeWidth="1.5"
        />
        <rect
          x="6"
          y="350"
          width="52"
          height="40"
          rx="2"
          fill="#020a10"
          stroke="#081828"
          strokeWidth="1"
        />
        {/* Ekran matn */}
        <g fontFamily="'Courier New',monospace" fontSize="6.5" fill="#00cc88">
          <text x="32" y="362" textAnchor="middle">
            HOLAT:FAOL
          </text>
          <text x="32" y="372" textAnchor="middle">
            RPM: 480
          </text>
          <text x="32" y="382" textAnchor="middle">
            RULO:Ø840
          </text>
        </g>
        <rect x="50" y="387" width="5" height="7" fill="#00cc88" opacity="0.9">
          <animate
            attributeName="opacity"
            values="0.9;0;0.9"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </rect>
        {/* Tugmalar */}
        <rect
          x="6"
          y="398"
          width="24"
          height="12"
          rx="3"
          fill="#122a18"
          stroke="#1e4024"
          strokeWidth="1"
        />
        <text
          x="18"
          y="407"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="5.5"
          fill="#44aa55"
        >
          START
        </text>
        <rect
          x="34"
          y="398"
          width="24"
          height="12"
          rx="3"
          fill="#2a1212"
          stroke="#401818"
          strokeWidth="1"
        />
        <text
          x="46"
          y="407"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="5.5"
          fill="#aa4444"
        >
          STOP
        </text>
        {/* Tezlik reostat */}
        <rect
          x="6"
          y="414"
          width="52"
          height="14"
          rx="3"
          fill="#0c1828"
          stroke="#182030"
          strokeWidth="1"
        />
        <rect
          x="10"
          y="418"
          width="36"
          height="6"
          rx="2"
          fill="#06101e"
          stroke="#0e1828"
          strokeWidth="0.8"
        />
        <rect
          x="26"
          y="417"
          width="10"
          height="8"
          rx="2"
          fill="#1a2e40"
          stroke="#243848"
          strokeWidth="1"
        />
        <text
          x="32"
          y="436"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="5"
          fill="#2a3e52"
        >
          TEZLIK
        </text>
        {/* Chiroqlar */}
        <circle
          cx="12"
          cy="448"
          r="6"
          fill="#00cc00"
          opacity="0.9"
          filter="url(#rw_blur3)"
        >
          <animate
            attributeName="opacity"
            values="0.9;0.4;0.9"
            dur="2s"
            repeatCount="indefinite"
          />
        </circle>
        <text
          x="24"
          y="452"
          fontFamily="monospace"
          fontSize="5.5"
          fill="#2a5030"
        >
          FAOL
        </text>
        <circle cx="12" cy="464" r="6" fill="#ff9900" opacity="0.4" />
        <text
          x="24"
          y="468"
          fontFamily="monospace"
          fontSize="5.5"
          fill="#503020"
        >
          YUKL.
        </text>
        <circle cx="12" cy="480" r="6" fill="#cc0000" opacity="0.3" />
        <text
          x="24"
          y="484"
          fontFamily="monospace"
          fontSize="5.5"
          fill="#402020"
        >
          STOP
        </text>

        {/* ============================================================
     PASTKI RAME VA ZAMIN
     ============================================================ */}
        {/* Asosiy rame pastki qismi */}
        <rect
          x="52"
          y="340"
          width="376"
          height="64"
          rx="5"
          fill="url(#rw_frame)"
          stroke="#0e1828"
          strokeWidth="2.2"
        />
        <rect
          x="58"
          y="346"
          width="364"
          height="52"
          rx="3"
          fill="#060910"
          stroke="#0c1420"
          strokeWidth="1.5"
        />
        {/* Pastki rame diagonal kuchlaydiruvchilar */}
        <g stroke="#0e1828" strokeWidth="1.5" fill="none" opacity="0.5">
          <line x1="58" y1="346" x2="108" y2="398" />
          <line x1="108" y1="346" x2="58" y2="398" />
          <line x1="108" y1="346" x2="188" y2="398" />
          <line x1="188" y1="346" x2="108" y2="398" />
          <line x1="292" y1="346" x2="372" y2="398" />
          <line x1="372" y1="346" x2="292" y2="398" />
          <line x1="372" y1="346" x2="422" y2="398" />
          <line x1="422" y1="346" x2="372" y2="398" />
        </g>
        {/* Zamin plitasi */}
        <rect
          x="28"
          y="404"
          width="424"
          height="18"
          rx="4"
          fill="#07090f"
          stroke="#0e1220"
          strokeWidth="1.5"
        />
        <rect
          x="14"
          y="420"
          width="452"
          height="12"
          rx="3"
          fill="#050710"
          stroke="#0a0f18"
          strokeWidth="1"
        />
        {/* Anchor boltlar */}
        <g fill="#090c18" stroke="#131c28" strokeWidth="1">
          <rect x="40" y="400" width="14" height="22" rx="3" />
          <rect x="80" y="400" width="14" height="22" rx="3" />
          <rect x="226" y="400" width="14" height="22" rx="3" />
          <rect x="386" y="400" width="14" height="22" rx="3" />
          <rect x="426" y="400" width="14" height="22" rx="3" />
        </g>

        {/* ============================================================
     YAG'DU
     ============================================================ */}
        <ellipse
          cx="212"
          cy="187"
          rx="110"
          ry="110"
          fill="#cc3300"
          opacity="0.05"
          filter="url(#rw_glow8)"
        />

        {/* ============================================================
     MATN
     ============================================================ */}
        <text
          x="240"
          y="472"
          textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize="13"
          fontWeight="bold"
          fill="#1e3855"
          letterSpacing="4"
        >
          RULO PAKETLOVCHI
        </text>
        <text
          x="240"
          y="490"
          textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize="9"
          fill="#162a40"
          letterSpacing="3"
        >
          COILER / DOWNCOILER · RW-800
        </text>

        {/* ── INTERAKTIV QATLAM (shaffof bosiladigan zonalar) ── */}
        {/* Har qism uchun alohida bosimli maydon SVGda to'g'ridan chizilgan elementlar ustiga */}
        {/* Foydalanuvchi SVG ustiga bosgan joyni JS orqali aniqlaymiz */}
      </svg>

      {/* ── QISMLAR TUGMALARI (SVG tashqarisida) ── */}
      <Box
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          display: "flex",
          flexDirection: "column",
          gap: 0.4,
          maxHeight: "60%",
          overflow: "hidden",
        }}
      >
        {Object.values(parts).map((p) => (
          <Box
            key={p.id}
            onClick={() => hit(p.id)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 0.7,
              py: 0.3,
              background:
                active?.id === p.id ? `${p.color}28` : "rgba(5,8,18,0.75)",
              border: `1px solid ${active?.id === p.id ? p.color : p.color + "40"}`,
              borderRadius: "3px",
              cursor: "pointer",
              transition: "all 0.15s",
              backdropFilter: "blur(4px)",
              "&:hover": { background: `${p.color}20`, borderColor: p.color },
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: p.color,
                boxShadow: active?.id === p.id ? `0 0 6px ${p.color}` : "none",
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.48rem",
                color: active?.id === p.id ? p.color : "#6b7280",
                letterSpacing: "0.06em",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              {p.nom}
            </Typography>
          </Box>
        ))}
      </Box>

      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════
//   Ingichka — Haqiqiy SVG + Interaktiv
// ══════════════════════════════════════════════════════════════════
function IngichkaDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isActive = u.holat === "faol";
  const isErr = u.holat === "xato";
  const isWarn = u.holat === "ogohlantirish";

  const parts = {
    VINT_PRESS: {
      id: "VINT_PRESS",
      nom: "Vintli Press (4 vint)",
      vazifa: "Aniq bosim",
      color: "#00d4ff",
      tavsif: "±0.01mm aniqlik. Gidravlik o'rniga vintli - ingichkaga xos.",
      parametrlar: [
        { nom: "Aniqlik", qiymat: `${"±0.01 mm"}` },
        { nom: "Kuch", qiymat: `${u.quvvat * 2.5 + " kN"}` },
      ],
    },
    USTKI_BACKUP: {
      id: "USTKI_BACKUP",
      nom: "Ustki Tayanch Rolik",
      vazifa: "Qo'llab",
      color: "#a78bfa",
      tavsif: "Kichik ishchi rolikni yon tomondan qo'llaydi.",
      parametrlar: [
        { nom: "Diametr", qiymat: `${"1400 mm"}` },
        { nom: "Og'irlik", qiymat: `${"48 t"}` },
      ],
    },
    ISHCHI_ROLIK: {
      id: "ISHCHI_ROLIK",
      nom: "Ishchi Roliklar (Kichik)",
      vazifa: "Prokat",
      color: "#00e676",
      tavsif: "Kichik diametrli - ingichka listga xos. Tezroq aylanadi.",
      parametrlar: [
        { nom: "Diametr", qiymat: `${"280 mm"}` },
        { nom: "RPM", qiymat: `${u.samaradorlik * 45}` },
      ],
    },
    METALL_TASMA: {
      id: "METALL_TASMA",
      nom: "Ingichka Metall Tasma",
      vazifa: "Mahsulot",
      color: "#c8d8e8",
      tavsif: "Sovuq prokat. Kumush rang, ko'zgusimon yuzasi.",
      parametrlar: [
        { nom: "Qalinlik", qiymat: `${"1.6 mm"}` },
        { nom: "Kenglik", qiymat: `${"1600 mm"}` },
      ],
    },
    YOG_TIZIM: {
      id: "YOG_TIZIM",
      nom: "Emulsiya Yog'lash",
      vazifa: "Yog'lash",
      color: "#4488aa",
      tavsif: "Ikki qatlamli emulsiya purkovchi. Rolik va metallni sovutadi.",
      parametrlar: [
        { nom: "Oqim", qiymat: `${u.quvvat * 12 + " L/min"}` },
        { nom: "Temp", qiymat: `${"28°C"}` },
      ],
    },
    QALINLIK: {
      id: "QALINLIK",
      nom: "Qalinlik O'lchagich",
      vazifa: "O'lchov",
      color: "#ffd60a",
      tavsif: "X-ray o'lchagich. Real-time qalinlik nazorati.",
      parametrlar: [
        { nom: "O'lchov", qiymat: `${"1.60 mm"}` },
        { nom: "Aniqlik", qiymat: `${"±0.002 mm"}` },
      ],
    },
  };

  const hit = (k) => setActive((prev) => (prev?.id === k ? null : parts[k]));

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 480 640"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          {/* Ranglar */}
          <linearGradient id="cl_frame" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#040810" />
            <stop offset="25%" stopColor="#0c1828" />
            <stop offset="55%" stopColor="#121e30" />
            <stop offset="80%" stopColor="#0c1828" />
            <stop offset="100%" stopColor="#040810" />
          </linearGradient>
          <linearGradient id="cl_rolik_work" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#050a12" />
            <stop offset="20%" stopColor="#0e2030" />
            <stop offset="45%" stopColor="#183040" />
            <stop offset="65%" stopColor="#1e3848" />
            <stop offset="85%" stopColor="#0e2030" />
            <stop offset="100%" stopColor="#050a12" />
          </linearGradient>
          <linearGradient id="cl_rolik_back" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#040810" />
            <stop offset="22%" stopColor="#0a1828" />
            <stop offset="50%" stopColor="#142030" />
            <stop offset="78%" stopColor="#0a1828" />
            <stop offset="100%" stopColor="#040810" />
          </linearGradient>
          {/* Sovuq metall tasma — kumush/kulrang (issiq emas) */}
          <linearGradient id="cl_band" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a4858" />
            <stop offset="25%" stopColor="#5a7088" />
            <stop offset="50%" stopColor="#7090a8" />
            <stop offset="75%" stopColor="#5a7088" />
            <stop offset="100%" stopColor="#3a4858" />
          </linearGradient>
          {/* Yupqa tasma highlight (ingichka = ko'proq yorug'lik) */}
          <linearGradient id="cl_band_shine" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.12" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#ffffff" stopOpacity="0.08" />
          </linearGradient>
          <linearGradient id="cl_press" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0e1828" />
            <stop offset="50%" stopColor="#162438" />
            <stop offset="100%" stopColor="#0a1220" />
          </linearGradient>
          <linearGradient id="cl_motor" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#060810" />
            <stop offset="40%" stopColor="#0e1422" />
            <stop offset="60%" stopColor="#121828" />
            <stop offset="100%" stopColor="#060810" />
          </linearGradient>
          <linearGradient id="cl_screw" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0a1828" />
            <stop offset="40%" stopColor="#1e3448" />
            <stop offset="60%" stopColor="#243e54" />
            <stop offset="100%" stopColor="#0a1828" />
          </linearGradient>
          {/* Yog'lash moyi (sariq-yashil) */}
          <radialGradient id="cl_oil_drop" cx="50%" cy="30%" r="60%">
            <stop offset="0%" stopColor="#aacc00" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#448800" stopOpacity="0" />
          </radialGradient>

          <filter id="cl_glow3">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="cl_glow6">
            <feGaussianBlur stdDeviation="6" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="cl_blur2">
            <feGaussianBlur stdDeviation="2" />
          </filter>
          <filter id="cl_blur4">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>

        <rect width="480" height="640" fill="#04060c" />

        {/* ============================================================
     VINTLI PRESSLASH TIZIMI (yuqori) — ingichkaga xos
     ============================================================ */}
        {/* Asosiy tepa balka (mashhur "housing" ustunlari) */}
        <rect
          x="30"
          y="24"
          width="420"
          height="52"
          rx="4"
          fill="url(#cl_press)"
          stroke="#121e30"
          strokeWidth="2"
        />

        {/* 4 ta vintli vint mexanizmi (ingichka listda aniqroq bosim) */}
        {/* Vint 1 (chap) */}
        <g>
          <rect
            x="58"
            y="18"
            width="36"
            height="62"
            rx="6"
            fill="url(#cl_screw)"
            stroke="#1e3448"
            strokeWidth="1.8"
          />
          <rect
            x="63"
            y="22"
            width="26"
            height="54"
            rx="4"
            fill="#081828"
            stroke="#142030"
            strokeWidth="1"
          />
          {/* Vintning spiral chiziqlar */}
          <g stroke="#1e3040" strokeWidth="1" opacity="0.6">
            <line x1="63" y1="30" x2="89" y2="30" />
            <line x1="63" y1="37" x2="89" y2="37" />
            <line x1="63" y1="44" x2="89" y2="44" />
            <line x1="63" y1="51" x2="89" y2="51" />
            <line x1="63" y1="58" x2="89" y2="58" />
            <line x1="63" y1="65" x2="89" y2="65" />
          </g>
          {/* Vint boshi */}
          <rect
            x="52"
            y="14"
            width="48"
            height="12"
            rx="4"
            fill="#0e1e2e"
            stroke="#1e2e40"
            strokeWidth="1.5"
          />
          <circle
            cx="76"
            cy="20"
            r="14"
            fill="#0a1828"
            stroke="#182838"
            strokeWidth="1.5"
          />
          <circle
            cx="76"
            cy="20"
            r="10"
            fill="#061220"
            stroke="#102030"
            strokeWidth="1.2"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 76 20"
              to="360 76 20"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <g stroke="#1e3040" strokeWidth="1" fill="none">
            <line x1="76" y1="10" x2="76" y2="30" />
            <line x1="66" y1="20" x2="86" y2="20" />
          </g>
        </g>
        {/* Vint 2 */}
        <g>
          <rect
            x="158"
            y="18"
            width="36"
            height="62"
            rx="6"
            fill="url(#cl_screw)"
            stroke="#1e3448"
            strokeWidth="1.8"
          />
          <rect
            x="163"
            y="22"
            width="26"
            height="54"
            rx="4"
            fill="#081828"
            stroke="#142030"
            strokeWidth="1"
          />
          <g stroke="#1e3040" strokeWidth="1" opacity="0.6">
            <line x1="163" y1="30" x2="189" y2="30" />
            <line x1="163" y1="37" x2="189" y2="37" />
            <line x1="163" y1="44" x2="189" y2="44" />
            <line x1="163" y1="51" x2="189" y2="51" />
            <line x1="163" y1="58" x2="189" y2="58" />
            <line x1="163" y1="65" x2="189" y2="65" />
          </g>
          <rect
            x="152"
            y="14"
            width="48"
            height="12"
            rx="4"
            fill="#0e1e2e"
            stroke="#1e2e40"
            strokeWidth="1.5"
          />
          <circle
            cx="176"
            cy="20"
            r="14"
            fill="#0a1828"
            stroke="#182838"
            strokeWidth="1.5"
          />
          <circle
            cx="176"
            cy="20"
            r="10"
            fill="#061220"
            stroke="#102030"
            strokeWidth="1.2"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 176 20"
              to="360 176 20"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <g stroke="#1e3040" strokeWidth="1" fill="none">
            <line x1="176" y1="10" x2="176" y2="30" />
            <line x1="166" y1="20" x2="186" y2="20" />
          </g>
        </g>
        {/* Vint 3 */}
        <g>
          <rect
            x="286"
            y="18"
            width="36"
            height="62"
            rx="6"
            fill="url(#cl_screw)"
            stroke="#1e3448"
            strokeWidth="1.8"
          />
          <rect
            x="291"
            y="22"
            width="26"
            height="54"
            rx="4"
            fill="#081828"
            stroke="#142030"
            strokeWidth="1"
          />
          <g stroke="#1e3040" strokeWidth="1" opacity="0.6">
            <line x1="291" y1="30" x2="317" y2="30" />
            <line x1="291" y1="37" x2="317" y2="37" />
            <line x1="291" y1="44" x2="317" y2="44" />
            <line x1="291" y1="51" x2="317" y2="51" />
            <line x1="291" y1="58" x2="317" y2="58" />
            <line x1="291" y1="65" x2="317" y2="65" />
          </g>
          <rect
            x="280"
            y="14"
            width="48"
            height="12"
            rx="4"
            fill="#0e1e2e"
            stroke="#1e2e40"
            strokeWidth="1.5"
          />
          <circle
            cx="304"
            cy="20"
            r="14"
            fill="#0a1828"
            stroke="#182838"
            strokeWidth="1.5"
          />
          <circle
            cx="304"
            cy="20"
            r="10"
            fill="#061220"
            stroke="#102030"
            strokeWidth="1.2"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 304 20"
              to="360 304 20"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <g stroke="#1e3040" strokeWidth="1" fill="none">
            <line x1="304" y1="10" x2="304" y2="30" />
            <line x1="294" y1="20" x2="314" y2="20" />
          </g>
        </g>
        {/* Vint 4 (o'ng) */}
        <g>
          <rect
            x="386"
            y="18"
            width="36"
            height="62"
            rx="6"
            fill="url(#cl_screw)"
            stroke="#1e3448"
            strokeWidth="1.8"
          />
          <rect
            x="391"
            y="22"
            width="26"
            height="54"
            rx="4"
            fill="#081828"
            stroke="#142030"
            strokeWidth="1"
          />
          <g stroke="#1e3040" strokeWidth="1" opacity="0.6">
            <line x1="391" y1="30" x2="417" y2="30" />
            <line x1="391" y1="37" x2="417" y2="37" />
            <line x1="391" y1="44" x2="417" y2="44" />
            <line x1="391" y1="51" x2="417" y2="51" />
            <line x1="391" y1="58" x2="417" y2="58" />
            <line x1="391" y1="65" x2="417" y2="65" />
          </g>
          <rect
            x="380"
            y="14"
            width="48"
            height="12"
            rx="4"
            fill="#0e1e2e"
            stroke="#1e2e40"
            strokeWidth="1.5"
          />
          <circle
            cx="404"
            cy="20"
            r="14"
            fill="#0a1828"
            stroke="#182838"
            strokeWidth="1.5"
          />
          <circle
            cx="404"
            cy="20"
            r="10"
            fill="#061220"
            stroke="#102030"
            strokeWidth="1.2"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 404 20"
              to="360 404 20"
              dur="4s"
              repeatCount="indefinite"
            />
          </circle>
          <g stroke="#1e3040" strokeWidth="1" fill="none">
            <line x1="404" y1="10" x2="404" y2="30" />
            <line x1="394" y1="20" x2="414" y2="20" />
          </g>
        </g>
        {/* Vint elektr motor (tepa orqa) */}
        <rect
          x="30"
          y="24"
          width="420"
          height="14"
          rx="3"
          fill="#0a1828"
          stroke="#162030"
          strokeWidth="1.5"
        />
        <g fill="#162030" stroke="#243848" strokeWidth="1">
          <rect x="38" y="26" width="38" height="10" rx="2" />
          <rect x="138" y="26" width="38" height="10" rx="2" />
          <rect x="266" y="26" width="38" height="10" rx="2" />
          <rect x="366" y="26" width="38" height="10" rx="2" />
        </g>

        {/* ============================================================
     USTKI TAYANCH ROLIK (backup roll — katta diametr)
     ============================================================ */}
        <rect
          x="16"
          y="76"
          width="448"
          height="66"
          rx="33"
          fill="url(#cl_rolik_back)"
          stroke="#0e1e2e"
          strokeWidth="2.5"
        />
        <rect
          x="20"
          y="80"
          width="440"
          height="58"
          rx="29"
          fill="#060e18"
          opacity="0.6"
        />
        {/* Backup rolik sirt chiziqlar */}
        <rect
          x="16"
          y="79"
          width="448"
          height="5"
          rx="2"
          fill="#152030"
          opacity="0.5"
        />
        <rect
          x="16"
          y="138"
          width="448"
          height="4"
          rx="2"
          fill="#0e1828"
          opacity="0.5"
        />
        {/* Rolik disklar */}
        <g fill="#050c14" stroke="#0e2030" strokeWidth="1.5">
          <circle cx="54" cy="109" r="26" />
          <circle cx="116" cy="109" r="26" />
          <circle cx="180" cy="109" r="26" />
          <circle cx="240" cy="109" r="26" />
          <circle cx="300" cy="109" r="26" />
          <circle cx="364" cy="109" r="26" />
          <circle cx="426" cy="109" r="26" />
        </g>
        <g fill="none" stroke="#1a2e40" strokeWidth="1.2">
          <circle cx="54" cy="109" r="17" />
          <circle cx="116" cy="109" r="17" />
          <circle cx="180" cy="109" r="17" />
          <circle cx="240" cy="109" r="17" />
          <circle cx="300" cy="109" r="17" />
          <circle cx="364" cy="109" r="17" />
          <circle cx="426" cy="109" r="17" />
        </g>
        {/* Markaz vallar */}
        <g fill="#0a1828" stroke="#162838" strokeWidth="1">
          <circle cx="54" cy="109" r="8" />
          <circle cx="116" cy="109" r="8" />
          <circle cx="180" cy="109" r="8" />
          <circle cx="240" cy="109" r="8" />
          <circle cx="300" cy="109" r="8" />
          <circle cx="364" cy="109" r="8" />
          <circle cx="426" cy="109" r="8" />
        </g>

        {/* ============================================================
     USTKI KICHIK ISHCHI ROLIK (kichik diametr — ingichkaga xos)
     ============================================================ */}
        <rect
          x="20"
          y="142"
          width="440"
          height="34"
          rx="17"
          fill="url(#cl_rolik_work)"
          stroke="#1a3040"
          strokeWidth="2.2"
        />
        <rect
          x="24"
          y="146"
          width="432"
          height="26"
          rx="13"
          fill="#060e18"
          opacity="0.5"
        />
        {/* Ishchi rolik sirt — yupqa */}
        <rect
          x="20"
          y="144"
          width="440"
          height="4"
          rx="2"
          fill="#1a3040"
          opacity="0.6"
        />
        {/* Disklar (kichikroq) */}
        <g fill="#04080f" stroke="#162838" strokeWidth="1.8">
          <ellipse cx="54" cy="159" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 54 159"
              to="360 54 159"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="108" cy="159" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 108 159"
              to="360 108 159"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="162" cy="159" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 162 159"
              to="360 162 159"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="216" cy="159" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 216 159"
              to="360 216 159"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="240" cy="159" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 240 159"
              to="360 240 159"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="264" cy="159" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 264 159"
              to="360 264 159"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="318" cy="159" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 318 159"
              to="360 318 159"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="372" cy="159" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 372 159"
              to="360 372 159"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="426" cy="159" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 426 159"
              to="360 426 159"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* ============================================================
     YOG'LASH TIZIMI — ingichka listga xos (emulsion purkovchi)
     ============================================================ */}
        {/* Yog' kollektori (ustki) */}
        <rect
          x="20"
          y="175"
          width="440"
          height="10"
          rx="4"
          fill="#0a1828"
          stroke="#162030"
          strokeWidth="1.2"
        />
        {/* Purkovchi teshiklar */}
        <g fill="#1e4060" stroke="#2a5070" strokeWidth="0.8">
          <circle cx="50" cy="180" r="2.5" />
          <circle cx="80" cy="180" r="2.5" />
          <circle cx="110" cy="180" r="2.5" />
          <circle cx="140" cy="180" r="2.5" />
          <circle cx="170" cy="180" r="2.5" />
          <circle cx="200" cy="180" r="2.5" />
          <circle cx="230" cy="180" r="2.5" />
          <circle cx="260" cy="180" r="2.5" />
          <circle cx="290" cy="180" r="2.5" />
          <circle cx="320" cy="180" r="2.5" />
          <circle cx="350" cy="180" r="2.5" />
          <circle cx="380" cy="180" r="2.5" />
          <circle cx="410" cy="180" r="2.5" />
          <circle cx="440" cy="180" r="2.5" />
        </g>
        {/* Emulsiya tomchilari (animatsiya) */}
        <g fill="#224466" opacity="0.6" filter="url(#cl_blur2)">
          <ellipse cx="80" cy="186" rx="1.5" ry="3">
            <animate
              attributeName="cy"
              values="182;196;182"
              dur="0.8s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="0.8s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="140" cy="186" rx="1.5" ry="3">
            <animate
              attributeName="cy"
              values="182;196;182"
              dur="0.7s"
              begin="0.15s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="0.7s"
              begin="0.15s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="200" cy="186" rx="1.5" ry="3">
            <animate
              attributeName="cy"
              values="182;196;182"
              dur="0.85s"
              begin="0.3s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="0.85s"
              begin="0.3s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="260" cy="186" rx="1.5" ry="3">
            <animate
              attributeName="cy"
              values="182;196;182"
              dur="0.75s"
              begin="0.1s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="0.75s"
              begin="0.1s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="320" cy="186" rx="1.5" ry="3">
            <animate
              attributeName="cy"
              values="182;196;182"
              dur="0.9s"
              begin="0.4s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="0.9s"
              begin="0.4s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="380" cy="186" rx="1.5" ry="3">
            <animate
              attributeName="cy"
              values="182;196;182"
              dur="0.8s"
              begin="0.2s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="0.8s"
              begin="0.2s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="440" cy="186" rx="1.5" ry="3">
            <animate
              attributeName="cy"
              values="182;196;182"
              dur="0.72s"
              begin="0.35s"
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.6;0;0.6"
              dur="0.72s"
              begin="0.35s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* ============================================================
     INGICHKA METALL TASMA (sovuq, kumush rang)
     ============================================================ */}
        {/* Kirish tasma (chap) */}
        <rect x="0" y="194" width="28" height="8" fill="url(#cl_band)" />
        {/* Asosiy tasma (juda yupqa — 8px) */}
        <rect x="0" y="194" width="480" height="8" fill="url(#cl_band)" />
        {/* Yuzasi yorug'ligi (ingichka metallning xarakter ko'zgusimonligi) */}
        <rect x="0" y="194" width="480" height="8" fill="url(#cl_band_shine)" />
        {/* Harakatlanuvchi highlight (tezroq — ingichka list tezroq harakatlanadi) */}
        <rect
          x="-60"
          y="194"
          width="40"
          height="8"
          fill="#ffffff"
          opacity="0.14"
        >
          <animate
            attributeName="x"
            values="-60;520"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </rect>
        <rect
          x="-120"
          y="194"
          width="30"
          height="8"
          fill="#ffffff"
          opacity="0.08"
        >
          <animate
            attributeName="x"
            values="-120;520"
            dur="0.8s"
            begin="0.25s"
            repeatCount="indefinite"
          />
        </rect>
        {/* Tasma chetlari (ingichka list chetlari aniq) */}
        <line
          x1="0"
          y1="194"
          x2="480"
          y2="194"
          stroke="#6080a0"
          strokeWidth="1"
          opacity="0.6"
        />
        <line
          x1="0"
          y1="202"
          x2="480"
          y2="202"
          stroke="#4060808"
          strokeWidth="1"
          opacity="0.5"
        />

        {/* ============================================================
     PASTKI KICHIK ISHCHI ROLIK
     ============================================================ */}
        <rect
          x="20"
          y="202"
          width="440"
          height="34"
          rx="17"
          fill="url(#cl_rolik_work)"
          stroke="#1a3040"
          strokeWidth="2.2"
        />
        <rect
          x="24"
          y="206"
          width="432"
          height="26"
          rx="13"
          fill="#060e18"
          opacity="0.5"
        />
        <rect
          x="20"
          y="232"
          width="440"
          height="4"
          rx="2"
          fill="#0e1828"
          opacity="0.6"
        />
        {/* Disklar */}
        <g fill="#04080f" stroke="#162838" strokeWidth="1.8">
          <ellipse cx="54" cy="219" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 54 219"
              to="-360 54 219"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="108" cy="219" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 108 219"
              to="-360 108 219"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="162" cy="219" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 162 219"
              to="-360 162 219"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="216" cy="219" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 216 219"
              to="-360 216 219"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="240" cy="219" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 240 219"
              to="-360 240 219"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="264" cy="219" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 264 219"
              to="-360 264 219"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="318" cy="219" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 318 219"
              to="-360 318 219"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="372" cy="219" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 372 219"
              to="-360 372 219"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
          <ellipse cx="426" cy="219" rx="14" ry="17">
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 426 219"
              to="-360 426 219"
              dur="0.9s"
              repeatCount="indefinite"
            />
          </ellipse>
        </g>

        {/* ============================================================
     PASTKI YOG'LASH KOLLEKTORI
     ============================================================ */}
        <rect
          x="20"
          y="235"
          width="440"
          height="10"
          rx="4"
          fill="#0a1828"
          stroke="#162030"
          strokeWidth="1.2"
        />
        <g fill="#1e4060" stroke="#2a5070" strokeWidth="0.8">
          <circle cx="50" cy="240" r="2.5" />{" "}
          <circle cx="80" cy="240" r="2.5" />
          <circle cx="110" cy="240" r="2.5" />{" "}
          <circle cx="140" cy="240" r="2.5" />
          <circle cx="170" cy="240" r="2.5" />{" "}
          <circle cx="200" cy="240" r="2.5" />
          <circle cx="230" cy="240" r="2.5" />{" "}
          <circle cx="260" cy="240" r="2.5" />
          <circle cx="290" cy="240" r="2.5" />{" "}
          <circle cx="320" cy="240" r="2.5" />
          <circle cx="350" cy="240" r="2.5" />{" "}
          <circle cx="380" cy="240" r="2.5" />
          <circle cx="410" cy="240" r="2.5" />{" "}
          <circle cx="440" cy="240" r="2.5" />
        </g>

        {/* ============================================================
     PASTKI TAYANCH ROLIK (backup roll)
     ============================================================ */}
        <rect
          x="16"
          y="244"
          width="448"
          height="66"
          rx="33"
          fill="url(#cl_rolik_back)"
          stroke="#0e1e2e"
          strokeWidth="2.5"
        />
        <rect
          x="20"
          y="248"
          width="440"
          height="58"
          rx="29"
          fill="#060e18"
          opacity="0.6"
        />
        <rect
          x="16"
          y="305"
          width="448"
          height="5"
          rx="2"
          fill="#0e1828"
          opacity="0.5"
        />
        <g fill="#050c14" stroke="#0e2030" strokeWidth="1.5">
          <circle cx="54" cy="277" r="26" />
          <circle cx="116" cy="277" r="26" />
          <circle cx="180" cy="277" r="26" />
          <circle cx="240" cy="277" r="26" />
          <circle cx="300" cy="277" r="26" />
          <circle cx="364" cy="277" r="26" />
          <circle cx="426" cy="277" r="26" />
        </g>
        <g fill="none" stroke="#1a2e40" strokeWidth="1.2">
          <circle cx="54" cy="277" r="17" />
          <circle cx="116" cy="277" r="17" />
          <circle cx="180" cy="277" r="17" />
          <circle cx="240" cy="277" r="17" />
          <circle cx="300" cy="277" r="17" />
          <circle cx="364" cy="277" r="17" />
          <circle cx="426" cy="277" r="17" />
        </g>
        <g fill="#0a1828" stroke="#162838" strokeWidth="1">
          <circle cx="54" cy="277" r="8" />
          <circle cx="116" cy="277" r="8" />
          <circle cx="180" cy="277" r="8" />
          <circle cx="240" cy="277" r="8" />
          <circle cx="300" cy="277" r="8" />
          <circle cx="364" cy="277" r="8" />
          <circle cx="426" cy="277" r="8" />
        </g>

        {/* ============================================================
     ASOSIY HOUSING (rame ustunlari)
     ============================================================ */}
        {/* Chap ustun (oyna tirqishi) */}
        <rect
          x="6"
          y="76"
          width="30"
          height="234"
          rx="4"
          fill="url(#cl_frame)"
          stroke="#0c1828"
          strokeWidth="2.2"
        />
        <g stroke="#121e2e" strokeWidth="1.5" opacity="0.55">
          <line x1="6" y1="110" x2="36" y2="150" />{" "}
          <line x1="36" y1="110" x2="6" y2="150" />
          <line x1="6" y1="165" x2="36" y2="205" />{" "}
          <line x1="36" y1="165" x2="6" y2="205" />
          <line x1="6" y1="222" x2="36" y2="262" />{" "}
          <line x1="36" y1="222" x2="6" y2="262" />
          <line x1="6" y1="278" x2="36" y2="310" />{" "}
          <line x1="36" y1="278" x2="6" y2="310" />
        </g>
        <g fill="#07101e" stroke="#101c2c" strokeWidth="1">
          <circle cx="20" cy="100" r="5" /> <circle cx="20" cy="145" r="5" />
          <circle cx="20" cy="195" r="5" /> <circle cx="20" cy="245" r="5" />
          <circle cx="20" cy="295" r="5" />
        </g>

        {/* O'ng ustun */}
        <rect
          x="444"
          y="76"
          width="30"
          height="234"
          rx="4"
          fill="url(#cl_frame)"
          stroke="#0c1828"
          strokeWidth="2.2"
        />
        <g stroke="#121e2e" strokeWidth="1.5" opacity="0.55">
          <line x1="444" y1="110" x2="474" y2="150" />{" "}
          <line x1="474" y1="110" x2="444" y2="150" />
          <line x1="444" y1="165" x2="474" y2="205" />{" "}
          <line x1="474" y1="165" x2="444" y2="205" />
          <line x1="444" y1="222" x2="474" y2="262" />{" "}
          <line x1="474" y1="222" x2="444" y2="262" />
          <line x1="444" y1="278" x2="474" y2="310" />{" "}
          <line x1="474" y1="278" x2="444" y2="310" />
        </g>
        <g fill="#07101e" stroke="#101c2c" strokeWidth="1">
          <circle cx="459" cy="100" r="5" /> <circle cx="459" cy="145" r="5" />
          <circle cx="459" cy="195" r="5" /> <circle cx="459" cy="245" r="5" />
          <circle cx="459" cy="295" r="5" />
        </g>

        {/* ============================================================
     MOTOR va REDUKTOR TIZIMI
     ============================================================ */}
        {/* Asosiy motor korpusi */}
        <rect
          x="0"
          y="376"
          width="118"
          height="104"
          rx="5"
          fill="url(#cl_motor)"
          stroke="#0e1828"
          strokeWidth="2"
        />
        {/* Qovurg'alar */}
        <g stroke="#0c1220" strokeWidth="1.5" fill="#080c18">
          <rect x="4" y="384" width="110" height="6" rx="1" />
          <rect x="4" y="394" width="110" height="6" rx="1" />
          <rect x="4" y="404" width="110" height="6" rx="1" />
          <rect x="4" y="414" width="110" height="6" rx="1" />
          <rect x="4" y="424" width="110" height="6" rx="1" />
          <rect x="4" y="434" width="110" height="6" rx="1" />
          <rect x="4" y="444" width="110" height="6" rx="1" />
          <rect x="4" y="454" width="110" height="6" rx="1" />
          <rect x="4" y="464" width="110" height="6" rx="1" />
          <rect x="4" y="472" width="110" height="6" rx="1" />
        </g>
        {/* Motor markazi */}
        <circle
          cx="59"
          cy="428"
          r="34"
          fill="#060c18"
          stroke="#101828"
          strokeWidth="2"
        />
        <circle
          cx="59"
          cy="428"
          r="25"
          fill="#0a1420"
          stroke="#162030"
          strokeWidth="1.8"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 59 428"
            to="360 59 428"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="59"
          cy="428"
          r="12"
          fill="#060e18"
          stroke="#101828"
          strokeWidth="1.2"
        />
        <circle
          cx="59"
          cy="428"
          r="5"
          fill="#0e1828"
          stroke="#1a2838"
          strokeWidth="1"
        />
        {/* Terminal blok */}
        <rect
          x="6"
          y="376"
          width="72"
          height="14"
          rx="3"
          fill="#0c1828"
          stroke="#1a2838"
          strokeWidth="1.2"
        />
        <g fill="#1e4060">
          <circle cx="14" cy="383" r="3.5" />{" "}
          <circle cx="24" cy="383" r="3.5" />
          <circle cx="34" cy="383" r="3.5" />{" "}
          <circle cx="44" cy="383" r="3.5" />
          <circle cx="54" cy="383" r="3.5" />
        </g>

        {/* Reduktor */}
        <rect
          x="118"
          y="392"
          width="52"
          height="72"
          rx="4"
          fill="#0a1828"
          stroke="#162838"
          strokeWidth="1.5"
        />
        <rect
          x="122"
          y="396"
          width="44"
          height="64"
          rx="3"
          fill="#060e18"
          stroke="#101828"
          strokeWidth="1"
        />
        {/* Reduktor g'ildiraklari */}
        <circle
          cx="144"
          cy="418"
          r="18"
          fill="#060c18"
          stroke="#122030"
          strokeWidth="1.5"
        />
        <circle
          cx="144"
          cy="418"
          r="12"
          fill="#0a1420"
          stroke="#182838"
          strokeWidth="1.2"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 144 418"
            to="360 144 418"
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="144"
          cy="418"
          r="6"
          fill="#081018"
          stroke="#101828"
          strokeWidth="1"
        />
        <circle
          cx="144"
          cy="442"
          r="13"
          fill="#060c18"
          stroke="#122030"
          strokeWidth="1.5"
        />
        <circle
          cx="144"
          cy="442"
          r="8"
          fill="#0a1420"
          stroke="#182838"
          strokeWidth="1.2"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 144 442"
            to="-360 144 442"
            dur="1.0s"
            repeatCount="indefinite"
          />
        </circle>
        {/* Val ulanish */}
        <rect
          x="168"
          y="410"
          width="42"
          height="14"
          rx="7"
          fill="#102030"
          stroke="#1e2e40"
          strokeWidth="1.5"
        />

        {/* ============================================================
     QALINLIK O'LCHAGICH (thickness gauge) — ingichkaga xos
     ============================================================ */}
        {/* X-ray qalinlik o'lchagich korpusi */}
        <rect
          x="196"
          y="320"
          width="88"
          height="56"
          rx="5"
          fill="#0a1428"
          stroke="#162030"
          strokeWidth="1.8"
        />
        {/* O'lchagich emitter/detector */}
        <rect
          x="200"
          y="324"
          width="36"
          height="18"
          rx="3"
          fill="#0c1e30"
          stroke="#1a2e44"
          strokeWidth="1.2"
        />
        <rect
          x="244"
          y="324"
          width="36"
          height="18"
          rx="3"
          fill="#0c1e30"
          stroke="#1a2e44"
          strokeWidth="1.2"
        />
        {/* X-ray nuri (metall orqali) */}
        <line
          x1="218"
          y1="333"
          x2="262"
          y2="333"
          stroke="#00aaff"
          strokeWidth="1.5"
          opacity="0.5"
          strokeDasharray="4,3"
        >
          <animate
            attributeName="opacity"
            values="0.5;0.1;0.5"
            dur="0.6s"
            repeatCount="indefinite"
          />
        </line>
        {/* O'lchov ko'rsatgich */}
        <rect
          x="200"
          y="346"
          width="80"
          height="26"
          rx="3"
          fill="#040c18"
          stroke="#0e2030"
          strokeWidth="1.2"
        />
        <text
          x="240"
          y="358"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="8"
          fill="#00d4ff"
        >
          1.60 mm
        </text>
        <text
          x="240"
          y="368"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="6"
          fill="#1a4060"
        >
          QALINLIK
        </text>
        {/* Ulanish quvuri */}
        <line
          x1="240"
          y1="376"
          x2="240"
          y2="393"
          stroke="#162030"
          strokeWidth="3"
        />

        {/* ============================================================
     YOG'LASH BAKI va NASOSI
     ============================================================ */}
        <rect
          x="338"
          y="380"
          width="106"
          height="90"
          rx="4"
          fill="#0a1428"
          stroke="#162030"
          strokeWidth="1.8"
        />
        {/* Bak qovurg'alar */}
        <g stroke="#0e1828" strokeWidth="1.2" fill="#080c18">
          <rect x="342" y="388" width="98" height="5" rx="1" />
          <rect x="342" y="397" width="98" height="5" rx="1" />
          <rect x="342" y="406" width="98" height="5" rx="1" />
          <rect x="342" y="415" width="98" height="5" rx="1" />
          <rect x="342" y="424" width="98" height="5" rx="1" />
          <rect x="342" y="433" width="98" height="5" rx="1" />
          <rect x="342" y="442" width="98" height="5" rx="1" />
          <rect x="342" y="451" width="98" height="5" rx="1" />
          <rect x="342" y="460" width="98" height="5" rx="1" />
        </g>
        {/* Bak ichidagi emulsiya ko'rinishi */}
        <rect
          x="344"
          y="440"
          width="94"
          height="28"
          rx="2"
          fill="#0a2030"
          stroke="#162838"
          strokeWidth="1"
        />
        <ellipse
          cx="391"
          cy="440"
          rx="47"
          ry="4"
          fill="#1a4060"
          opacity="0.5"
        />
        {/* Moy pompa markazi */}
        <circle
          cx="391"
          cy="428"
          r="20"
          fill="#060e18"
          stroke="#102030"
          strokeWidth="1.5"
        />
        <circle
          cx="391"
          cy="428"
          r="13"
          fill="#0a1420"
          stroke="#162030"
          strokeWidth="1.2"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 391 428"
            to="360 391 428"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          cx="391"
          cy="428"
          r="6"
          fill="#081018"
          stroke="#101828"
          strokeWidth="1"
        />
        {/* Yog' quvurlari */}
        <path
          d="M338 400 Q320 400 316 388 Q312 376 316 364"
          fill="none"
          stroke="#162030"
          strokeWidth="5"
          strokeLinecap="round"
        />
        <path
          d="M338 400 Q320 400 316 388 Q312 376 316 364"
          fill="none"
          stroke="#1e3040"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        <path
          d="M338 418 Q330 418 320 408 Q310 398 304 388"
          fill="none"
          stroke="#162030"
          strokeWidth="4"
          strokeLinecap="round"
        />

        {/* ============================================================
     BOSHQARUV PANELI
     ============================================================ */}
        <rect
          x="170"
          y="376"
          width="164"
          height="104"
          rx="4"
          fill="#0a1428"
          stroke="#162030"
          strokeWidth="1.8"
        />
        {/* Asosiy ekran */}
        <rect
          x="174"
          y="382"
          width="100"
          height="62"
          rx="3"
          fill="#030c14"
          stroke="#0e2030"
          strokeWidth="1.5"
        />
        <rect
          x="176"
          y="384"
          width="96"
          height="58"
          rx="2"
          fill="#020810"
          stroke="#081828"
          strokeWidth="1"
        />
        <g fontFamily="'Courier New',monospace" fontSize="6.5" fill="#00cc88">
          <text x="178" y="396">
            HOLAT : FAOL
          </text>
          <text x="178" y="406">
            BOSIM : 220 t
          </text>
          <text x="178" y="416">
            TEZLIK : 18 m/s
          </text>
          <text x="178" y="426">
            QALINL : 1.60mm
          </text>
          <text x="178" y="436">
            REJA : 1.55mm
          </text>
        </g>
        <rect x="266" y="436" width="5" height="7" fill="#00cc88" opacity="0.9">
          <animate
            attributeName="opacity"
            values="0.9;0;0.9"
            dur="0.8s"
            repeatCount="indefinite"
          />
        </rect>
        {/* O'ng panel tugmalari */}
        <rect
          x="280"
          y="382"
          width="50"
          height="62"
          rx="3"
          fill="#0c1828"
          stroke="#182030"
          strokeWidth="1"
        />
        <g>
          <rect
            x="282"
            y="386"
            width="46"
            height="11"
            rx="2"
            fill="#122a18"
            stroke="#1e4024"
            strokeWidth="1"
          />
          <text
            x="305"
            y="395"
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="6"
            fill="#44aa55"
          >
            START
          </text>
          <rect
            x="282"
            y="401"
            width="46"
            height="11"
            rx="2"
            fill="#2a1212"
            stroke="#401818"
            strokeWidth="1"
          />
          <text
            x="305"
            y="410"
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="6"
            fill="#aa4444"
          >
            STOP
          </text>
          <rect
            x="282"
            y="416"
            width="46"
            height="11"
            rx="2"
            fill="#1a1a10"
            stroke="#2e2e18"
            strokeWidth="1"
          />
          <text
            x="305"
            y="425"
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="6"
            fill="#aaaa44"
          >
            RESET
          </text>
          <rect
            x="282"
            y="431"
            width="46"
            height="11"
            rx="2"
            fill="#0e1828"
            stroke="#182838"
            strokeWidth="1"
          />
          <text
            x="305"
            y="440"
            textAnchor="middle"
            fontFamily="monospace"
            fontSize="6"
            fill="#2a4a60"
          >
            AUTO
          </text>
        </g>
        {/* Qalinlik rostlagich knob */}
        <rect
          x="174"
          y="448"
          width="70"
          height="26"
          rx="3"
          fill="#0c1828"
          stroke="#182030"
          strokeWidth="1"
        />
        <rect
          x="178"
          y="452"
          width="48"
          height="8"
          rx="2"
          fill="#060e18"
          stroke="#0e1828"
          strokeWidth="0.8"
        />
        <rect
          x="198"
          y="451"
          width="12"
          height="10"
          rx="2"
          fill="#1a2e40"
          stroke="#243848"
          strokeWidth="1"
        />
        <text
          x="209"
          y="470"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="5.5"
          fill="#2a3e52"
        >
          QALINLIK
        </text>
        {/* Chiroqlar */}
        <g>
          <circle
            cx="254"
            cy="454"
            r="5"
            fill="#00cc00"
            opacity="0.9"
            filter="url(#cl_blur2)"
          >
            <animate
              attributeName="opacity"
              values="0.9;0.4;0.9"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x="264"
            y="458"
            fontFamily="monospace"
            fontSize="5.5"
            fill="#2a5030"
          >
            FAOL
          </text>
          <circle cx="254" cy="467" r="5" fill="#ff9900" opacity="0.5" />
          <text
            x="264"
            y="471"
            fontFamily="monospace"
            fontSize="5.5"
            fill="#503020"
          >
            YUKL.
          </text>
          <circle cx="254" cy="480" r="5" fill="#cc0000" opacity="0.35" />
          <text
            x="264"
            y="484"
            fontFamily="monospace"
            fontSize="5.5"
            fill="#402020"
          >
            XATO
          </text>
        </g>

        {/* ============================================================
     ZAMIN PLITASI
     ============================================================ */}
        <rect
          x="16"
          y="494"
          width="448"
          height="18"
          rx="4"
          fill="#07090f"
          stroke="#0e1220"
          strokeWidth="1.5"
        />
        <rect
          x="4"
          y="510"
          width="472"
          height="12"
          rx="3"
          fill="#050710"
          stroke="#0a0f18"
          strokeWidth="1"
        />
        <g fill="#090c18" stroke="#131c28" strokeWidth="1">
          <rect x="28" y="490" width="14" height="22" rx="3" />
          <rect x="70" y="490" width="14" height="22" rx="3" />
          <rect x="226" y="490" width="14" height="22" rx="3" />
          <rect x="396" y="490" width="14" height="22" rx="3" />
          <rect x="438" y="490" width="14" height="22" rx="3" />
        </g>

        {/* ============================================================
     MATN
     ============================================================ */}
        <text
          x="240"
          y="552"
          textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize="13"
          fontWeight="bold"
          fill="#1e3855"
          letterSpacing="4"
        >
          INGICHKA LIST
        </text>
        <text
          x="240"
          y="570"
          textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize="13"
          fontWeight="bold"
          fill="#1e3855"
          letterSpacing="4"
        >
          PROKATI
        </text>
        <text
          x="240"
          y="588"
          textAnchor="middle"
          fontFamily="'Courier New',monospace"
          fontSize="9"
          fill="#162a40"
          letterSpacing="3"
        >
          COLD ROLLING MILL · CLM-1600
        </text>

        {/* ── INTERAKTIV QATLAM (shaffof bosiladigan zonalar) ── */}
        {/* Har qism uchun alohida bosimli maydon SVGda to'g'ridan chizilgan elementlar ustiga */}
        {/* Foydalanuvchi SVG ustiga bosgan joyni JS orqali aniqlaymiz */}
      </svg>

      {/* ── QISMLAR TUGMALARI (SVG tashqarisida) ── */}
      <Box
        sx={{
          position: "absolute",
          top: 6,
          right: 6,
          display: "flex",
          flexDirection: "column",
          gap: 0.4,
          maxHeight: "60%",
          overflow: "hidden",
        }}
      >
        {Object.values(parts).map((p) => (
          <Box
            key={p.id}
            onClick={() => hit(p.id)}
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              px: 0.7,
              py: 0.3,
              background:
                active?.id === p.id ? `${p.color}28` : "rgba(5,8,18,0.75)",
              border: `1px solid ${active?.id === p.id ? p.color : p.color + "40"}`,
              borderRadius: "3px",
              cursor: "pointer",
              transition: "all 0.15s",
              backdropFilter: "blur(4px)",
              "&:hover": { background: `${p.color}20`, borderColor: p.color },
            }}
          >
            <Box
              sx={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: p.color,
                boxShadow: active?.id === p.id ? `0 0 6px ${p.color}` : "none",
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.48rem",
                color: active?.id === p.id ? p.color : "#6b7280",
                letterSpacing: "0.06em",
                lineHeight: 1.2,
                whiteSpace: "nowrap",
              }}
            >
              {p.nom}
            </Typography>
          </Box>
        ))}
      </Box>

      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ─────────────────────────────────────────────
// TRANSPORT — Slab/Prokat rolgang liniyasi
// ─────────────────────────────────────────────
function TransportDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isActive = u.holat === "faol";
  const isErr = u.holat === "xato";

  const parts = {
    ROLGANG: {
      id: "ROLGANG",
      nom: "Rolgang Roliklarni",
      vazifa: "Transport",
      color: "#00d4ff",
      tavsif: "Parallel joylashgan po'lat roliklar. Metallni yo'naltiradi.",
      parametrlar: [
        { nom: "Roliklar soni", qiymat: "24 ta" },
        {
          nom: "Tezlik",
          qiymat: `${Math.round((u.quvvat || 220) * 0.15)} m/min`,
        },
        { nom: "Diametr", qiymat: "320 mm" },
      ],
    },
    SLAB: {
      id: "SLAB",
      nom: "Slab (Transport materiali)",
      vazifa: "Mahsulot",
      color: "#ff6b1a",
      tavsif: "Issiq slab roliklar ustida harakatlanadi. 1200°C gacha.",
      parametrlar: [
        { nom: "Og'irlik", qiymat: "18-32 t" },
        { nom: "Harorat", qiymat: `${u.harorat || 1150}°C` },
        { nom: "O'lcham", qiymat: "250×1200×9000 mm" },
      ],
    },
    MOTOR: {
      id: "MOTOR",
      nom: "Rolik Motorlari",
      vazifa: "Harakatlantirish",
      color: "#a78bfa",
      tavsif: "Har rolik uchun alohida DC motor. Tezlik sinxronlashtirilgan.",
      parametrlar: [
        {
          nom: "Quvvat (har)",
          qiymat: `${Math.round((u.quvvat || 220) / 24)} kW`,
        },
        { nom: "Jami quvvat", qiymat: `${u.quvvat || 220} kW` },
        { nom: "Boshqaruv", qiymat: "PLC sinxron" },
      ],
    },
    TORMOZ: {
      id: "TORMOZ",
      nom: "Tormoz va To'xtatgich",
      vazifa: "Nazorat",
      color: "#ff2d55",
      tavsif: "Gidravlik tormoz. Slabni aniq pozitsiyada to'xtatadi.",
      parametrlar: [
        { nom: "To'xtatish vaqti", qiymat: "< 2 s" },
        { nom: "Aniqlik", qiymat: "±10 mm" },
      ],
    },
  };

  const click = (id) =>
    setActive((prev) => (prev?.id === id ? null : parts[id]));
  const af = (k) =>
    active?.id === k ? `${parts[k]?.color}30` : `${parts[k]?.color}18`;
  const st = (k) =>
    active?.id === k ? parts[k]?.color : `${parts[k]?.color}80`;
  const sw = (k) => (active?.id === k ? 2.5 : 1.8);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 480 340"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="tr_frame" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#040810" />
            <stop offset="50%" stopColor="#0e1828" />
            <stop offset="100%" stopColor="#040810" />
          </linearGradient>
          <linearGradient id="tr_slab" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#993300" />
            <stop offset="30%" stopColor="#cc4400" />
            <stop offset="50%" stopColor="#ff7700" />
            <stop offset="70%" stopColor="#cc4400" />
            <stop offset="100%" stopColor="#882200" />
          </linearGradient>
          <linearGradient id="tr_rolik" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#060c18" />
            <stop offset="30%" stopColor="#162838" />
            <stop offset="55%" stopColor="#1e3040" />
            <stop offset="80%" stopColor="#162838" />
            <stop offset="100%" stopColor="#060c18" />
          </linearGradient>
          <filter id="tr_glow">
            <feGaussianBlur stdDeviation="4" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="tr_blur3">
            <feGaussianBlur stdDeviation="3" />
          </filter>
        </defs>

        <rect width="480" height="340" fill="#04060c" />

        {/* Asos rama */}
        <rect
          x="16"
          y="160"
          width="448"
          height="90"
          rx="4"
          fill="url(#tr_frame)"
          stroke="#0e1828"
          strokeWidth="2"
        />
        <rect
          x="20"
          y="164"
          width="440"
          height="82"
          rx="3"
          fill="#06090f"
          stroke="#0c1420"
          strokeWidth="1.5"
        />

        {/* Diagonal kuchlaydiruvchilar */}
        <g stroke="#0e1828" strokeWidth="1.2" opacity="0.5">
          {[60, 120, 180, 240, 300, 360].map((x) => (
            <g key={x}>
              <line x1={x} y1="164" x2={x + 40} y2="246" />
              <line x1={x + 40} y1="164" x2={x} y2="246" />
            </g>
          ))}
        </g>

        {/* ROLIKLAR (24 ta — 16 ko'rinadi) */}
        <g
          onClick={() => click("ROLGANG")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "ROLGANG" ? 0.3 : 1}
        >
          {[
            32, 62, 92, 122, 152, 182, 212, 242, 272, 302, 332, 362, 392, 422,
          ].map((x, i) => (
            <g key={x}>
              {/* Rolik tanasi */}
              <rect
                x={x}
                y="146"
                width="22"
                height="68"
                rx="11"
                fill="url(#tr_rolik)"
                stroke="#1a3040"
                strokeWidth="1.8"
              />
              <rect
                x={x + 4}
                y="150"
                width="14"
                height="60"
                rx="7"
                fill="#081828"
                stroke="#122030"
                strokeWidth="1"
              />
              {/* Rolik disk */}
              <ellipse cx={x + 11} cy="165" rx="8" ry="10">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${x + 11} 165`}
                  to={`${isActive ? 360 : 0} ${x + 11} 165`}
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <ellipse cx={x + 11} cy="180" rx="8" ry="10">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${x + 11} 180`}
                  to={`${isActive ? 360 : 0} ${x + 11} 180`}
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </ellipse>
              <ellipse cx={x + 11} cy="196" rx="8" ry="10">
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${x + 11} 196`}
                  to={`${isActive ? 360 : 0} ${x + 11} 196`}
                  dur="1.2s"
                  repeatCount="indefinite"
                />
              </ellipse>
              {/* Rolik o'qi markazi */}
              <circle
                cx={x + 11}
                cy="180"
                r="4"
                fill="#0a1828"
                stroke="#162838"
                strokeWidth="1"
              />
            </g>
          ))}
        </g>

        {/* SLAB */}
        <g
          onClick={() => click("SLAB")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "SLAB" ? 0.3 : 1}
        >
          <rect
            x="40"
            y="150"
            width="340"
            height="60"
            rx="3"
            fill="url(#tr_slab)"
            stroke="#882200"
            strokeWidth="1.5"
          />
          {/* Slab yuzasi highlight */}
          <rect
            x="40"
            y="152"
            width="340"
            height="8"
            rx="2"
            fill="#ff9900"
            opacity="0.15"
          />
          {/* Harakatlanuvchi issiqlik */}
          <rect
            x="-60"
            y="150"
            width="80"
            height="60"
            fill="#ffaa00"
            opacity="0.08"
          >
            <animate
              attributeName="x"
              values="-60;420"
              dur="2s"
              repeatCount="indefinite"
            />
          </rect>
          {/* Issiqlik glow */}
          <rect
            x="40"
            y="145"
            width="340"
            height="70"
            fill="#ff5500"
            opacity="0.06"
            filter="url(#tr_blur3)"
          />
          <text
            x="210"
            y="184"
            fill="#ff9900"
            fontSize="8"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            SLAB — {u.harorat || 1150}°C
          </text>
          {/* O'lchov belgilari */}
          <line
            x1="42"
            y1="220"
            x2="378"
            y2="220"
            stroke="#882200"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="42"
            y1="216"
            x2="42"
            y2="224"
            stroke="#882200"
            strokeWidth="1"
            opacity="0.5"
          />
          <line
            x1="378"
            y1="216"
            x2="378"
            y2="224"
            stroke="#882200"
            strokeWidth="1"
            opacity="0.5"
          />
          <text
            x="210"
            y="232"
            fill="#662200"
            fontSize="6"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.7"
          >
            9000 mm
          </text>
        </g>

        {/* MOTORLAR (pastki) */}
        <g
          onClick={() => click("MOTOR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "MOTOR" ? 0.3 : 1}
        >
          <rect
            x="16"
            y="246"
            width="448"
            height="38"
            rx="3"
            fill="#0a1428"
            stroke="#162030"
            strokeWidth="1.5"
          />
          {/* Motor qovurg'alar */}
          {[
            32, 62, 92, 122, 152, 182, 212, 242, 272, 302, 332, 362, 392, 422,
          ].map((x) => (
            <g key={x}>
              <rect
                x={x + 2}
                y="250"
                width="18"
                height="30"
                rx="3"
                fill="#060e18"
                stroke="#102030"
                strokeWidth="1"
              />
              <circle
                cx={x + 11}
                cy="265"
                r="8"
                fill="#0a1420"
                stroke="#162838"
                strokeWidth="1"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${x + 11} 265`}
                  to={`${isActive ? 360 : 0} ${x + 11} 265`}
                  dur="1.5s"
                  repeatCount="indefinite"
                />
              </circle>
              <circle
                cx={x + 11}
                cy="265"
                r="3.5"
                fill="#060c18"
                stroke="#101828"
                strokeWidth="0.8"
              />
            </g>
          ))}
          <text
            x="240"
            y="292"
            fill="#00d4ff"
            fontSize="7"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.7"
          >
            {u.quvvat || 220} kW — ROLGANG MOTORLARI
          </text>
        </g>

        {/* TORMOZ BLOKI */}
        <g
          onClick={() => click("TORMOZ")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "TORMOZ" ? 0.3 : 1}
        >
          <rect
            x="390"
            y="120"
            width="72"
            height="32"
            rx="4"
            fill={af("TORMOZ")}
            stroke={st("TORMOZ")}
            strokeWidth={sw("TORMOZ")}
          />
          <rect
            x="394"
            y="124"
            width="30"
            height="24"
            rx="3"
            fill="#0a1428"
            stroke="#162030"
            strokeWidth="1"
          />
          <rect
            x="428"
            y="124"
            width="30"
            height="24"
            rx="3"
            fill="#0a1428"
            stroke="#162030"
            strokeWidth="1"
          />
          {/* Tormoz indikator */}
          <circle
            cx="409"
            cy="136"
            r="7"
            fill={isErr ? "#ff2d55" : "#002233"}
            stroke={st("TORMOZ")}
            strokeWidth="1"
          />
          <circle
            cx="443"
            cy="136"
            r="7"
            fill={isErr ? "#ff2d55" : "#002233"}
            stroke={st("TORMOZ")}
            strokeWidth="1"
          />
          <text
            x="426"
            y="162"
            fill={parts.TORMOZ.color}
            fontSize="6.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            TORMOZ
          </text>
        </g>

        {/* Yo'nalish strelkasi */}
        <path
          d="M16 136 L46 136"
          stroke="#00d4ff"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
          markerEnd="url(#arr_tr)"
        />
        <text
          x="50"
          y="132"
          fill="#1a4060"
          fontSize="7"
          fontFamily="monospace"
          opacity="0.8"
        >
          KIRISH
        </text>
        <path
          d="M434 136 L464 136"
          stroke="#ff6b1a"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.6"
          markerEnd="url(#arr_tr)"
        />
        <text
          x="390"
          y="132"
          fill="#442200"
          fontSize="7"
          fontFamily="monospace"
          opacity="0.8"
        >
          CHIQISH
        </text>

        <defs>
          <marker
            id="arr_tr"
            viewBox="0 0 8 8"
            refX="6"
            refY="4"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path
              d="M1 1L7 4L1 7"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        {/* Zamin */}
        <rect
          x="8"
          y="296"
          width="464"
          height="12"
          rx="3"
          fill="#060810"
          stroke="#0c1220"
          strokeWidth="1.5"
        />
        <g fill="#080c18" stroke="#121c28" strokeWidth="1">
          <rect x="30" y="286" width="12" height="18" rx="2" />
          <rect x="80" y="286" width="12" height="18" rx="2" />
          <rect x="234" y="286" width="12" height="18" rx="2" />
          <rect x="388" y="286" width="12" height="18" rx="2" />
          <rect x="438" y="286" width="12" height="18" rx="2" />
        </g>

        <text
          x="240"
          y="322"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
          fill="#1e3855"
          letterSpacing="3"
        >
          ROLGANG LINIYASI
        </text>
        <text
          x="240"
          y="336"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="8"
          fill="#162a40"
          letterSpacing="2"
        >
          TRANSPORT ROLLER TABLE · TRT-{u.quvvat || 220}
        </text>
      </svg>
      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ─────────────────────────────────────────────
// SENSOR — Slab/Qalinlik markalash tizimi
// ─────────────────────────────────────────────
function SensorDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isActive = u.holat === "faol";

  const parts = {
    SKANER: {
      id: "SKANER",
      nom: "Lazer/X-ray Skaner",
      vazifa: "O'lchov",
      color: "#00ff9d",
      tavsif: "Metallning qalinligi, kengligi va o'lchamlarini o'lchaydi.",
      parametrlar: [
        { nom: "Aniqlik", qiymat: "±0.1 mm" },
        { nom: "Tezlik", qiymat: "1000 sk/s" },
        { nom: "Texnologiya", qiymat: "Lazer triangulatsiya" },
      ],
    },
    KAMERA: {
      id: "KAMERA",
      nom: "Termal Kamera",
      vazifa: "Harorat nazorat",
      color: "#ff6b1a",
      tavsif: "Infraqizil kamera. Slab haroratini real-time kuzatadi.",
      parametrlar: [
        { nom: "Diapazon", qiymat: "200-1400°C" },
        { nom: "Aniqlik", qiymat: "±5°C" },
        { nom: "Piksel", qiymat: "640×480" },
      ],
    },
    MARKALASH: {
      id: "MARKALASH",
      nom: "Markalash Tizimi",
      vazifa: "ID berish",
      color: "#ffd60a",
      tavsif: "Har slabga unikal kod beradi. Lazer yoki bo'yoq bilan.",
      parametrlar: [
        { nom: "Usul", qiymat: "Lazer gravyura" },
        { nom: "Kod", qiymat: "QR + barkod" },
        { nom: "Tezlik", qiymat: "< 3 s/dona" },
      ],
    },
    SENSOR_BLOK: {
      id: "SENSOR_BLOK",
      nom: "Pozitsiya Sensorlari",
      vazifa: "Pozitsiya",
      color: "#a78bfa",
      tavsif: "Slab kelganini va to'xtagan pozitsiyasini aniqlaydi.",
      parametrlar: [
        { nom: "Turi", qiymat: "Induksion proximity" },
        { nom: "Soni", qiymat: "8 ta" },
        { nom: "Javob vaqti", qiymat: "< 5 ms" },
      ],
    },
    PLC: {
      id: "PLC",
      nom: "PLC Boshqaruv Bloki",
      vazifa: "Boshqaruv",
      color: "#00d4ff",
      tavsif: "Siemens S7-1500. Barcha sensorlarni boshqaradi.",
      parametrlar: [
        { nom: "Model", qiymat: "Siemens S7-1500" },
        { nom: "Tsikl", qiymat: "1 ms" },
        { nom: "I/O", qiymat: "256/256" },
      ],
    },
  };

  const click = (id) =>
    setActive((prev) => (prev?.id === id ? null : parts[id]));
  const af = (k) =>
    active?.id === k ? `${parts[k]?.color}30` : `${parts[k]?.color}18`;
  const st = (k) =>
    active?.id === k ? parts[k]?.color : `${parts[k]?.color}80`;
  const sw = (k) => (active?.id === k ? 2.5 : 1.8);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 480 380"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <filter id="sn_glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="sn_blur">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <rect width="480" height="380" fill="#04060c" />
        {/* Grid */}
        {[...Array(9)].map((_, i) => (
          <line
            key={i}
            x1="0"
            y1={i * 42}
            x2="480"
            y2={i * 42}
            stroke="rgba(255,255,255,0.02)"
            strokeWidth="1"
          />
        ))}

        {/* Portal rama (sensor archi) */}
        <rect
          x="100"
          y="60"
          width="20"
          height="220"
          rx="4"
          fill="#0a1828"
          stroke="#162030"
          strokeWidth="2"
        />
        <rect
          x="360"
          y="60"
          width="20"
          height="220"
          rx="4"
          fill="#0a1828"
          stroke="#162030"
          strokeWidth="2"
        />
        <rect
          x="100"
          y="60"
          width="280"
          height="20"
          rx="4"
          fill="#0a1828"
          stroke="#162030"
          strokeWidth="2"
        />

        {/* LAZER SKANER (yuqori) */}
        <g
          onClick={() => click("SKANER")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "SKANER" ? 0.3 : 1}
        >
          <rect
            x="160"
            y="48"
            width="160"
            height="36"
            rx="5"
            fill={af("SKANER")}
            stroke={st("SKANER")}
            strokeWidth={sw("SKANER")}
          />
          <rect
            x="166"
            y="54"
            width="68"
            height="24"
            rx="3"
            fill="#040c14"
            stroke="#0e2830"
            strokeWidth="1"
          />
          <rect
            x="246"
            y="54"
            width="68"
            height="24"
            rx="3"
            fill="#040c14"
            stroke="#0e2830"
            strokeWidth="1"
          />
          {/* Lazer nuri */}
          {isActive && (
            <>
              <line
                x1="200"
                y1="84"
                x2="200"
                y2="200"
                stroke="#00ff9d"
                strokeWidth="1.5"
                opacity="0.5"
                strokeDasharray="4,3"
              >
                <animate
                  attributeName="opacity"
                  values="0.5;0.1;0.5"
                  dur="0.6s"
                  repeatCount="indefinite"
                />
              </line>
              <line
                x1="280"
                y1="84"
                x2="280"
                y2="200"
                stroke="#00ff9d"
                strokeWidth="1.5"
                opacity="0.5"
                strokeDasharray="4,3"
              >
                <animate
                  attributeName="opacity"
                  values="0.5;0.1;0.5"
                  dur="0.6s"
                  begin="0.3s"
                  repeatCount="indefinite"
                />
              </line>
              {/* Lazer yoy (kenglik o'lchov) */}
              <path
                d="M200 200 L280 200"
                stroke="#00ff9d"
                strokeWidth="2"
                opacity="0.6"
                filter="url(#sn_glow)"
              >
                <animate
                  attributeName="opacity"
                  values="0.6;0.1;0.6"
                  dur="0.5s"
                  repeatCount="indefinite"
                />
              </path>
            </>
          )}
          <text
            x="240"
            y="70"
            fill={parts.SKANER.color}
            fontSize="7"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            LAZER SKANER
          </text>
        </g>

        {/* TERMAL KAMERA (chap ustun) */}
        <g
          onClick={() => click("KAMERA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "KAMERA" ? 0.3 : 1}
        >
          <rect
            x="28"
            y="120"
            width="74"
            height="56"
            rx="5"
            fill={af("KAMERA")}
            stroke={st("KAMERA")}
            strokeWidth={sw("KAMERA")}
          />
          {/* Kamera linzasi */}
          <circle
            cx="65"
            cy="148"
            r="20"
            fill="#040c14"
            stroke={st("KAMERA")}
            strokeWidth="1.5"
          />
          <circle
            cx="65"
            cy="148"
            r="14"
            fill="#060e18"
            stroke="#1a2838"
            strokeWidth="1"
          />
          <circle
            cx="65"
            cy="148"
            r="8"
            fill="#0a1420"
            stroke="#162030"
            strokeWidth="1"
          />
          <circle cx="65" cy="148" r="4" fill="#ff4400" opacity="0.7">
            <animate
              attributeName="opacity"
              values="0.7;0.2;0.7"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          {/* Infra qizil nuri */}
          {isActive && (
            <path
              d="M102 148 L160 178 L160 122 Z"
              fill="#ff6b1a"
              opacity="0.08"
            />
          )}
          <text
            x="65"
            y="186"
            fill={parts.KAMERA.color}
            fontSize="6.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            TERMAL KAM.
          </text>
        </g>

        {/* MARKALASH TIZIMI (o'ng ustun) */}
        <g
          onClick={() => click("MARKALASH")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "MARKALASH" ? 0.3 : 1}
        >
          <rect
            x="378"
            y="120"
            width="80"
            height="56"
            rx="5"
            fill={af("MARKALASH")}
            stroke={st("MARKALASH")}
            strokeWidth={sw("MARKALASH")}
          />
          <rect
            x="382"
            y="128"
            width="72"
            height="20"
            rx="3"
            fill="#0c1828"
            stroke="#182838"
            strokeWidth="1"
          />
          {/* Barkod tasviri */}
          <g stroke="#ffd60a" strokeWidth="1.5" opacity="0.7">
            {[
              386, 390, 395, 398, 404, 407, 412, 416, 420, 424, 428, 432, 436,
              440, 444, 448,
            ].map((x) => (
              <line key={x} x1={x} y1="130" x2={x} y2="146" />
            ))}
          </g>
          {/* Lazer nuri markalash */}
          {isActive && (
            <line
              x1="418"
              y1="148"
              x2="380"
              y2="178"
              stroke="#ffd60a"
              strokeWidth="1.5"
              opacity="0.6"
              strokeDasharray="3,2"
            >
              <animate
                attributeName="opacity"
                values="0.6;0;0.6"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </line>
          )}
          <text
            x="418"
            y="186"
            fill={parts.MARKALASH.color}
            fontSize="6.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            MARKALASH
          </text>
        </g>

        {/* SLAB (markalanayotgan) */}
        <g
          onClick={() => click("SENSOR_BLOK")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "SENSOR_BLOK" ? 0.3 : 1}
        >
          {/* Slab tanasi */}
          <rect
            x="110"
            y="176"
            width="260"
            height="54"
            rx="3"
            fill="#882200"
            stroke="#cc3300"
            strokeWidth="1.5"
          />
          <rect
            x="110"
            y="178"
            width="260"
            height="8"
            rx="2"
            fill="#cc4400"
            opacity="0.4"
          />
          {/* Slab markalash kodi */}
          <rect
            x="130"
            y="190"
            width="60"
            height="30"
            rx="2"
            fill="#0a0800"
            stroke="#442200"
            strokeWidth="0.8"
          />
          <g stroke="#ffd60a" strokeWidth="1" opacity="0.8">
            {[134, 138, 143, 146, 151, 155, 160, 164, 168, 172, 176, 180].map(
              (x) => (
                <line key={x} x1={x} y1="193" x2={x} y2="217" />
              ),
            )}
          </g>
          {/* Proximity sensorlar */}
          {[118, 358].map((x) => (
            <circle
              key={x}
              cx={x}
              cy="203"
              r="7"
              fill={af("SENSOR_BLOK")}
              stroke={st("SENSOR_BLOK")}
              strokeWidth="1.5"
            >
              <animate
                attributeName="fill"
                values={`${af("SENSOR_BLOK")};${parts.SENSOR_BLOK.color}50;${af("SENSOR_BLOK")}`}
                dur="1s"
                repeatCount="indefinite"
              />
            </circle>
          ))}
          <text
            x="240"
            y="208"
            fill="#ff9900"
            fontSize="7.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            SLAB ID: SL-2024-08471
          </text>
        </g>

        {/* PLC BLOKI */}
        <g
          onClick={() => click("PLC")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "PLC" ? 0.3 : 1}
        >
          <rect
            x="150"
            y="260"
            width="180"
            height="76"
            rx="5"
            fill={af("PLC")}
            stroke={st("PLC")}
            strokeWidth={sw("PLC")}
          />
          <rect
            x="156"
            y="268"
            width="100"
            height="60"
            rx="3"
            fill="#030c18"
            stroke="#0e2030"
            strokeWidth="1.2"
          />
          {/* Ekran */}
          <g fontFamily="monospace" fontSize="6" fill="#00cc88">
            <text x="160" y="282">
              HOLAT : FAOL
            </text>
            <text x="160" y="292">
              SKAN: 1245/sek
            </text>
            <text x="160" y="302">
              ID: SL-2024-08471
            </text>
            <text x="160" y="312">
              HARORAT: 1152°C
            </text>
            <text x="160" y="322">
              KENGLIK: 1198mm
            </text>
          </g>
          <rect
            x="272"
            y="268"
            width="52"
            height="60"
            rx="3"
            fill="#0c1828"
            stroke="#182030"
            strokeWidth="1"
          />
          {/* Indikatorlar */}
          <circle
            cx="280"
            cy="280"
            r="5"
            fill="#00cc00"
            opacity="0.9"
            filter="url(#sn_glow)"
          >
            <animate
              attributeName="opacity"
              values="0.9;0.4;0.9"
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <circle cx="296" cy="280" r="5" fill="#ff9900" opacity="0.6" />
          <circle cx="312" cy="280" r="5" fill="#cc0000" opacity="0.3" />
          <text
            x="291"
            y="300"
            fill="#0e2030"
            fontSize="5.5"
            fontFamily="monospace"
            textAnchor="middle"
          >
            SIEMENS
          </text>
          <text
            x="291"
            y="310"
            fill="#00d4ff"
            fontSize="6.5"
            fontFamily="monospace"
            textAnchor="middle"
          >
            S7-1500
          </text>
        </g>

        {/* Ulanish chiziqlar */}
        <line
          x1="102"
          y1="148"
          x2="160"
          y2="148"
          stroke="#ff6b1a50"
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />
        <line
          x1="378"
          y1="148"
          x2="328"
          y2="148"
          stroke="#ffd60a50"
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />
        <line
          x1="240"
          y1="230"
          x2="240"
          y2="260"
          stroke="#00d4ff50"
          strokeWidth="1.5"
          strokeDasharray="4,3"
        />

        <text
          x="240"
          y="358"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
          fill="#1e3855"
          letterSpacing="3"
        >
          SENSOR TIZIMI
        </text>
        <text
          x="240"
          y="372"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="8"
          fill="#162a40"
          letterSpacing="2"
        >
          SLAB IDENTIFICATION & MEASUREMENT SYSTEM
        </text>
      </svg>
      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ─────────────────────────────────────────────
// MANIPULATOR — Pech yuklash manipulyatori
// ─────────────────────────────────────────────
function ManipulatorDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isActive = u.holat === "faol";

  const parts = {
    SHTANGA: {
      id: "SHTANGA",
      nom: "Itaruvchi Shtanga",
      vazifa: "Yuklash",
      color: "#00d4ff",
      tavsif: "Gidravlik silindr orqali slabni pechin ichiga itaradi.",
      parametrlar: [
        { nom: "Stroke", qiymat: "12,000 mm" },
        { nom: "Kuch", qiymat: "850 kN" },
        { nom: "Tezlik", qiymat: "0.5 m/min" },
      ],
    },
    GIDROSILINDR: {
      id: "GIDROSILINDR",
      nom: "Asosiy Gidravlik Silindr",
      vazifa: "Harakatlantirish",
      color: "#a78bfa",
      tavsif: "Katta diametrli silindr. Itaruvchi shtangani boshqaradi.",
      parametrlar: [
        { nom: "Bosim", qiymat: "280 bar" },
        { nom: "Diametr", qiymat: "400 mm" },
        { nom: "Stroke", qiymat: "2500 mm" },
      ],
    },
    QISQICH: {
      id: "QISQICH",
      nom: "Slab Qisqichi",
      vazifa: "Ushlab turish",
      color: "#ffd60a",
      tavsif: "Slabni pozitsiyada ushlab turadi. Yuklanish paytida bloklaydi.",
      parametrlar: [
        { nom: "Ushlab turish kuchi", qiymat: "500 kN" },
        { nom: "Boshqaruv", qiymat: "Pnevmatik" },
      ],
    },
    STOL: {
      id: "STOL",
      nom: "Ko'tarish Stoli",
      vazifa: "Balandlik",
      color: "#ff6b1a",
      tavsif: "Slabni pech eshigi balandligiga ko'taradi.",
      parametrlar: [
        { nom: "Ko'tarish balandligi", qiymat: "800 mm" },
        { nom: "Yuklanish", qiymat: "35 t" },
      ],
    },
  };

  const click = (id) =>
    setActive((prev) => (prev?.id === id ? null : parts[id]));
  const af = (k) =>
    active?.id === k ? `${parts[k]?.color}30` : `${parts[k]?.color}18`;
  const st = (k) =>
    active?.id === k ? parts[k]?.color : `${parts[k]?.color}80`;
  const sw = (k) => (active?.id === k ? 2.5 : 1.8);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 480 360"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="mn_frame" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#040810" />
            <stop offset="50%" stopColor="#0e1828" />
            <stop offset="100%" stopColor="#040810" />
          </linearGradient>
          <linearGradient id="mn_cyl" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#0a1828" />
            <stop offset="30%" stopColor="#1e3848" />
            <stop offset="55%" stopColor="#2a4a5a" />
            <stop offset="80%" stopColor="#1e3848" />
            <stop offset="100%" stopColor="#0a1828" />
          </linearGradient>
          <filter id="mn_glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="480" height="360" fill="#04060c" />

        {/* ASOS RAMA */}
        <rect
          x="16"
          y="230"
          width="450"
          height="56"
          rx="4"
          fill="url(#mn_frame)"
          stroke="#0e1828"
          strokeWidth="2"
        />
        <g stroke="#0e1828" strokeWidth="1.2" opacity="0.5">
          {[50, 110, 170, 230, 290, 350, 410].map((x) => (
            <g key={x}>
              <line x1={x} y1="230" x2={x + 40} y2="286" />
              <line x1={x + 40} y1="230" x2={x} y2="286" />
            </g>
          ))}
        </g>

        {/* KO'TARISH STOLI */}
        <g
          onClick={() => click("STOL")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "STOL" ? 0.3 : 1}
        >
          <rect
            x="30"
            y="188"
            width="190"
            height="44"
            rx="4"
            fill={af("STOL")}
            stroke={st("STOL")}
            strokeWidth={sw("STOL")}
          />
          {/* Stol ustki yuzasi */}
          <rect
            x="34"
            y="192"
            width="182"
            height="6"
            rx="2"
            fill="#1a2030"
            opacity="0.5"
          />
          {/* Ko'tarish silindrlar */}
          {[60, 110, 160].map((x) => (
            <g key={x}>
              <rect
                x={x}
                y="232"
                width="14"
                height="40"
                rx="5"
                fill="#0a1828"
                stroke="#162838"
                strokeWidth="1.2"
              />
              <rect
                x={x + 3}
                y="235"
                width="8"
                height="34"
                rx="3"
                fill="#061018"
                stroke="#101828"
                strokeWidth="1"
              />
            </g>
          ))}
          <text
            x="125"
            y="218"
            fill={parts.STOL.color}
            fontSize="7.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            KO'TARISH STOLI
          </text>
          {/* Slab stol ustida */}
          <rect
            x="36"
            y="178"
            width="186"
            height="14"
            rx="2"
            fill="#882200"
            stroke="#cc3300"
            strokeWidth="1.2"
          />
          <text
            x="129"
            y="188"
            fill="#ff9900"
            fontSize="6"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            SLAB
          </text>
        </g>

        {/* PECH ESHIGI */}
        <rect
          x="278"
          y="90"
          width="26"
          height="148"
          rx="3"
          fill="#1e2838"
          stroke="#2a3848"
          strokeWidth="2"
        />
        <rect
          x="282"
          y="100"
          width="18"
          height="88"
          rx="2"
          fill="#ff450010"
          stroke="#ff4500"
          strokeWidth="1"
          strokeDasharray="4,3"
        />
        <text
          x="291"
          y="260"
          fill="#ff4500"
          fontSize="6.5"
          fontFamily="monospace"
          textAnchor="middle"
          opacity="0.8"
          transform="rotate(-90, 291, 200)"
        >
          PECH ESHIGI
        </text>
        {/* Olov ko'rinishi pech ichida */}
        <rect
          x="304"
          y="90"
          width="160"
          height="148"
          rx="4"
          fill="#110500"
          stroke="#221000"
          strokeWidth="1.5"
        />
        <ellipse cx="384" cy="164" rx="50" ry="40" fill="#ff4500" opacity="0.1">
          <animate
            attributeName="ry"
            values="40;50;35;45;40"
            dur="2.5s"
            repeatCount="indefinite"
          />
        </ellipse>

        {/* ITARUVCHI SHTANGA */}
        <g
          onClick={() => click("SHTANGA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "SHTANGA" ? 0.3 : 1}
        >
          <rect
            x="220"
            y="181"
            width="56"
            height="20"
            rx="6"
            fill={af("SHTANGA")}
            stroke={st("SHTANGA")}
            strokeWidth={sw("SHTANGA")}
          />
          {/* Shtanga xrom yuzasi */}
          <rect
            x="224"
            y="183"
            width="20"
            height="6"
            rx="2"
            fill="#1e4060"
            opacity="0.4"
          />
          {/* Harakatlanish animatsiyasi */}
          {isActive && (
            <rect
              x="220"
              y="181"
              width="56"
              height="20"
              rx="6"
              fill={parts.SHTANGA.color}
              opacity="0.05"
            >
              <animate
                attributeName="x"
                values="220;240;220"
                dur="3s"
                repeatCount="indefinite"
              />
            </rect>
          )}
          <text
            x="248"
            y="210"
            fill={parts.SHTANGA.color}
            fontSize="6.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            SHTANGA
          </text>
        </g>

        {/* GIDRAVLIK SILINDR */}
        <g
          onClick={() => click("GIDROSILINDR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "GIDROSILINDR" ? 0.3 : 1}
        >
          <rect
            x="28"
            y="126"
            width="196"
            height="58"
            rx="8"
            fill="url(#mn_cyl)"
            stroke={st("GIDROSILINDR")}
            strokeWidth={sw("GIDROSILINDR")}
          />
          <rect
            x="34"
            y="132"
            width="184"
            height="46"
            rx="6"
            fill="#060e18"
            stroke="#0e1828"
            strokeWidth="1"
          />
          {/* Silindr chiziqlar */}
          <g stroke="#1e3040" strokeWidth="1.2">
            <line x1="34" y1="148" x2="218" y2="148" />
            <line x1="34" y1="162" x2="218" y2="162" />
          </g>
          {/* Piston */}
          <rect
            x="100"
            y="133"
            width="48"
            height="44"
            rx="4"
            fill="#162838"
            stroke="#243848"
            strokeWidth="1.5"
          >
            {isActive && (
              <animate
                attributeName="x"
                values="100;140;100"
                dur="3s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            )}
          </rect>
          <rect
            x="104"
            y="137"
            width="16"
            height="36"
            rx="3"
            fill="#1e3848"
            opacity="0.5"
          >
            {isActive && (
              <animate
                attributeName="x"
                values="104;144;104"
                dur="3s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            )}
          </rect>
          <text
            x="120"
            y="158"
            fill={parts.GIDROSILINDR.color}
            fontSize="7"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            GIDRO SILINDR
          </text>
          <text
            x="120"
            y="170"
            fill={parts.GIDROSILINDR.color}
            fontSize="6"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.6"
          >
            280 bar
          </text>
          {/* Gidravlik ulanishlar */}
          <circle
            cx="40"
            cy="155"
            r="5"
            fill="#0e2030"
            stroke={st("GIDROSILINDR")}
            strokeWidth="1.2"
          />
          <circle
            cx="210"
            cy="155"
            r="5"
            fill="#0e2030"
            stroke={st("GIDROSILINDR")}
            strokeWidth="1.2"
          />
        </g>

        {/* QISQICH */}
        <g
          onClick={() => click("QISQICH")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "QISQICH" ? 0.3 : 1}
        >
          <rect
            x="30"
            y="80"
            width="60"
            height="48"
            rx="4"
            fill={af("QISQICH")}
            stroke={st("QISQICH")}
            strokeWidth={sw("QISQICH")}
          />
          {/* Qisqich tish */}
          <path
            d="M60 128 L46 148 L74 148 Z"
            fill={af("QISQICH")}
            stroke={st("QISQICH")}
            strokeWidth="1.5"
          />
          <text
            x="60"
            y="108"
            fill={parts.QISQICH.color}
            fontSize="6.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            QISQICH
          </text>
          <text
            x="60"
            y="120"
            fill={parts.QISQICH.color}
            fontSize="5.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.6"
          >
            500 kN
          </text>
        </g>

        {/* Zamin */}
        <rect
          x="8"
          y="294"
          width="464"
          height="14"
          rx="3"
          fill="#060810"
          stroke="#0c1220"
          strokeWidth="1.5"
        />
        <g fill="#080c18" stroke="#121c28" strokeWidth="1">
          {[30, 80, 230, 380, 440].map((x) => (
            <rect key={x} x={x} y="284" width="12" height="18" rx="2" />
          ))}
        </g>

        <text
          x="240"
          y="330"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
          fill="#1e3855"
          letterSpacing="3"
        >
          YUKLASH MANIPULYATORI
        </text>
        <text
          x="240"
          y="346"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="8"
          fill="#162a40"
          letterSpacing="2"
        >
          FURNACE CHARGING PUSHER · FCP-850
        </text>
      </svg>
      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ─────────────────────────────────────────────
// PRESS — Gidravlik press
// ─────────────────────────────────────────────
function PressDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isActive = u.holat === "faol";

  const parts = {
    SILINDR: {
      id: "SILINDR",
      nom: "Asosiy Gidravlik Silindrlar",
      vazifa: "Bosim",
      color: "#00d4ff",
      tavsif: "4 ta asosiy silindr. Metallni presslab shakl beradi.",
      parametrlar: [
        { nom: "Bosim", qiymat: "320 bar" },
        { nom: "Kuch (jami)", qiymat: `${u.quvvat || 2000} kN` },
        { nom: "Silindrlar", qiymat: "4 ta" },
      ],
    },
    USTKI_ZHTAMP: {
      id: "USTKI_ZHTAMP",
      nom: "Ustki Shtamp (Punson)",
      vazifa: "Shakl berish",
      color: "#a78bfa",
      tavsif: "Metallga kerakli shakl beradi. Almashtiriladigan.",
      parametrlar: [
        { nom: "Material", qiymat: "D2 po'lat" },
        { nom: "Qattiqligi", qiymat: "58-62 HRC" },
      ],
    },
    PASTKI_ZHTAMP: {
      id: "PASTKI_ZHTAMP",
      nom: "Pastki Matritsa",
      vazifa: "Tayanch",
      color: "#00e676",
      tavsif: "Sobit matritsa. Metallni pastdan ushlab turadi.",
      parametrlar: [
        { nom: "Material", qiymat: "D2 po'lat" },
        { nom: "Mustahkamlik", qiymat: "2500 MPa" },
      ],
    },
    GIDROSTANSIYA: {
      id: "GIDROSTANSIYA",
      nom: "Gidravlik Stansiya",
      vazifa: "Quvvat manbai",
      color: "#ffd60a",
      tavsif: "Yog' nasosi + bak. Bosimni ta'minlaydi.",
      parametrlar: [
        { nom: "Bosim", qiymat: "320 bar" },
        { nom: "Oqim", qiymat: "480 L/min" },
        { nom: "Motor", qiymat: `${u.quvvat || 200} kW` },
      ],
    },
    USTKI_BALKA: {
      id: "USTKI_BALKA",
      nom: "Harakatlanuvchi Balka",
      vazifa: "Bosim uzatish",
      color: "#ff6b1a",
      tavsif: "Silindrlardan kuchni shtampga uzatadi.",
      parametrlar: [
        { nom: "Og'irligi", qiymat: "28 t" },
        { nom: "Material", qiymat: "S355 po'lat" },
      ],
    },
  };

  const click = (id) =>
    setActive((prev) => (prev?.id === id ? null : parts[id]));
  const af = (k) =>
    active?.id === k ? `${parts[k]?.color}30` : `${parts[k]?.color}18`;
  const st = (k) =>
    active?.id === k ? parts[k]?.color : `${parts[k]?.color}80`;
  const sw = (k) => (active?.id === k ? 2.5 : 1.8);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 480 400"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="pr_frame" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#040810" />
            <stop offset="50%" stopColor="#0e1828" />
            <stop offset="100%" stopColor="#040810" />
          </linearGradient>
          <linearGradient id="pr_cyl" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#0a1828" />
            <stop offset="30%" stopColor="#1e3848" />
            <stop offset="60%" stopColor="#243e50" />
            <stop offset="100%" stopColor="#0a1828" />
          </linearGradient>
          <linearGradient id="pr_stamp" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1a2838" />
            <stop offset="40%" stopColor="#243040" />
            <stop offset="60%" stopColor="#2e3c4c" />
            <stop offset="100%" stopColor="#141e2c" />
          </linearGradient>
          <filter id="pr_glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="480" height="400" fill="#04060c" />

        {/* Ustki rama */}
        <rect
          x="30"
          y="24"
          width="420"
          height="48"
          rx="5"
          fill="url(#pr_frame)"
          stroke="#0e1828"
          strokeWidth="2.2"
        />
        <rect
          x="36"
          y="30"
          width="408"
          height="36"
          rx="3"
          fill="#060a14"
          stroke="#0c1620"
          strokeWidth="1.5"
        />

        {/* 4 ta gidravlik silindr */}
        <g
          onClick={() => click("SILINDR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "SILINDR" ? 0.3 : 1}
        >
          {[70, 160, 270, 360].map((x) => (
            <g key={x}>
              {/* Silindr korpusi */}
              <rect
                x={x}
                y="28"
                width="50"
                height="44"
                rx="8"
                fill="url(#pr_cyl)"
                stroke={st("SILINDR")}
                strokeWidth="1.8"
              />
              <rect
                x={x + 5}
                y="33"
                width="40"
                height="34"
                rx="5"
                fill="#070e18"
                stroke="#122030"
                strokeWidth="1"
              />
              {/* Xrom sirt */}
              <rect
                x={x + 6}
                y="34"
                width="12"
                height="30"
                rx="3"
                fill="#1e3848"
                opacity="0.3"
              />
              {/* Piston shtoki */}
              <rect
                x={x + 18}
                y="72"
                width="14"
                height="60"
                rx="6"
                fill="#162838"
                stroke="#243848"
                strokeWidth="1.5"
              >
                {isActive && (
                  <animate
                    attributeName="height"
                    values="60;80;60"
                    dur="2s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
                  />
                )}
              </rect>
              {/* Shtok xrom */}
              <rect
                x={x + 20}
                y="74"
                width="6"
                height="56"
                rx="2"
                fill="#2e5a78"
                opacity="0.4"
              >
                {isActive && (
                  <animate
                    attributeName="height"
                    values="56;76;56"
                    dur="2s"
                    repeatCount="indefinite"
                    calcMode="spline"
                    keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
                  />
                )}
              </rect>
              {/* Bosim ko'rsatgich */}
              <circle
                cx={x + 45}
                cy="38"
                r="7"
                fill="#08101e"
                stroke={st("SILINDR")}
                strokeWidth="1"
              />
              <line
                x1={x + 45}
                y1="38"
                x2={x + 49}
                y2="32"
                stroke="#ff6600"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </g>
          ))}
          <text
            x="240"
            y="20"
            fill={parts.SILINDR.color}
            fontSize="7.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.7"
          >
            GIDRAVLIK SILINDRLAR × 4
          </text>
        </g>

        {/* HARAKATLANUVCHI BALKA */}
        <g
          onClick={() => click("USTKI_BALKA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "USTKI_BALKA" ? 0.3 : 1}
        >
          <rect
            x="46"
            y="132"
            width="388"
            height="44"
            rx="4"
            fill={af("USTKI_BALKA")}
            stroke={st("USTKI_BALKA")}
            strokeWidth={sw("USTKI_BALKA")}
          >
            {isActive && (
              <animate
                attributeName="y"
                values="132;150;132"
                dur="2s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            )}
          </rect>
          <rect
            x="52"
            y="136"
            width="376"
            height="4"
            rx="2"
            fill="#2a3848"
            opacity="0.5"
          >
            {isActive && (
              <animate
                attributeName="y"
                values="136;154;136"
                dur="2s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            )}
          </rect>
          <text
            x="240"
            y="162"
            fill={parts.USTKI_BALKA.color}
            fontSize="8"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            HARAKATLANUVCHI BALKA
          </text>
        </g>

        {/* USTKI SHTAMP */}
        <g
          onClick={() => click("USTKI_ZHTAMP")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "USTKI_ZHTAMP" ? 0.3 : 1}
        >
          <rect
            x="100"
            y="176"
            width="280"
            height="36"
            rx="3"
            fill="url(#pr_stamp)"
            stroke={st("USTKI_ZHTAMP")}
            strokeWidth={sw("USTKI_ZHTAMP")}
          >
            {isActive && (
              <animate
                attributeName="y"
                values="176;194;176"
                dur="2s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            )}
          </rect>
          <rect
            x="100"
            y="178"
            width="280"
            height="4"
            rx="1"
            fill="#4a6a88"
            opacity="0.4"
          >
            {isActive && (
              <animate
                attributeName="y"
                values="178;196;178"
                dur="2s"
                repeatCount="indefinite"
                calcMode="spline"
                keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
              />
            )}
          </rect>
          {/* Shtamp tishli qirra */}
          {[100, 135, 170, 205, 240, 275, 310, 345].map((x) => (
            <rect
              key={x}
              x={x}
              y="208"
              width="26"
              height="8"
              rx="2"
              fill="url(#pr_stamp)"
              stroke={st("USTKI_ZHTAMP")}
              strokeWidth="1"
            >
              {isActive && (
                <animate
                  attributeName="y"
                  values="208;226;208"
                  dur="2s"
                  repeatCount="indefinite"
                  calcMode="spline"
                  keySplines="0.4 0 0.2 1;0.4 0 0.2 1"
                />
              )}
            </rect>
          ))}
          <text
            x="240"
            y="197"
            fill={parts.USTKI_ZHTAMP.color}
            fontSize="7.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            USTKI SHTAMP (PUNSON)
          </text>
        </g>

        {/* METALL (presslanyotgan) */}
        <rect
          x="80"
          y="218"
          width="320"
          height="16"
          rx="2"
          fill="#884400"
          stroke="#cc4400"
          strokeWidth="1.2"
        />
        <rect
          x="80"
          y="220"
          width="320"
          height="4"
          rx="1"
          fill="#aa5500"
          opacity="0.4"
        />

        {/* PASTKI SHTAMP/MATRITSA */}
        <g
          onClick={() => click("PASTKI_ZHTAMP")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "PASTKI_ZHTAMP" ? 0.3 : 1}
        >
          {/* Tishli qirra */}
          {[100, 135, 170, 205, 240, 275, 310, 345].map((x) => (
            <rect
              key={x}
              x={x}
              y="234"
              width="26"
              height="8"
              rx="2"
              fill="url(#pr_stamp)"
              stroke={st("PASTKI_ZHTAMP")}
              strokeWidth="1"
            />
          ))}
          <rect
            x="100"
            y="242"
            width="280"
            height="34"
            rx="3"
            fill="url(#pr_stamp)"
            stroke={st("PASTKI_ZHTAMP")}
            strokeWidth={sw("PASTKI_ZHTAMP")}
          />
          <rect
            x="100"
            y="272"
            width="280"
            height="4"
            rx="1"
            fill="#1a3040"
            opacity="0.5"
          />
          <text
            x="240"
            y="264"
            fill={parts.PASTKI_ZHTAMP.color}
            fontSize="7.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            PASTKI MATRITSA (SOBIT)
          </text>
        </g>

        {/* Yon ustunlar */}
        <rect
          x="30"
          y="24"
          width="28"
          height="292"
          rx="4"
          fill="url(#pr_frame)"
          stroke="#0e1828"
          strokeWidth="2"
        />
        <rect
          x="422"
          y="24"
          width="28"
          height="292"
          rx="4"
          fill="url(#pr_frame)"
          stroke="#0e1828"
          strokeWidth="2"
        />
        {/* Ustun diagonal */}
        <g stroke="#0e1828" strokeWidth="1.2" opacity="0.5">
          {[60, 120, 180, 240].map((y) => (
            <g key={y}>
              <line x1="30" y1={y} x2="58" y2={y + 40} />
              <line x1="58" y1={y} x2="30" y2={y + 40} />
              <line x1="422" y1={y} x2="450" y2={y + 40} />
              <line x1="450" y1={y} x2="422" y2={y + 40} />
            </g>
          ))}
        </g>

        {/* GIDROSTANSIYA (o'ng tomon) */}
        <g
          onClick={() => click("GIDROSTANSIYA")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "GIDROSTANSIYA" ? 0.3 : 1}
        >
          <text
            x="240"
            y="346"
            textAnchor="middle"
            fill={parts.GIDROSTANSIYA.color}
            fontSize="6.5"
            fontFamily="monospace"
            opacity="0.7"
          >
            GIDROSTANSIYA: {u.quvvat || 200} kW · 320 BAR · 480 L/MIN
          </text>
        </g>

        {/* Zamin */}
        <rect
          x="16"
          y="320"
          width="448"
          height="14"
          rx="3"
          fill="#060810"
          stroke="#0c1220"
          strokeWidth="1.5"
        />
        <g fill="#080c18" stroke="#121c28" strokeWidth="1">
          {[40, 100, 230, 380, 438].map((x) => (
            <rect key={x} x={x} y="308" width="12" height="20" rx="2" />
          ))}
        </g>

        <text
          x="240"
          y="358"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
          fill="#1e3855"
          letterSpacing="3"
        >
          GIDRAVLIK PRESS
        </text>
        <text
          x="240"
          y="372"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="8"
          fill="#162a40"
          letterSpacing="2"
        >
          HYDRAULIC PRESS · HP-{u.quvvat || 2000}
        </text>
      </svg>
      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ─────────────────────────────────────────────
// SOVITISH — Cooling Bed
// ─────────────────────────────────────────────
function SovitishDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isActive = u.holat === "faol";

  const parts = {
    TOKNOS: {
      id: "TOKNOS",
      nom: "To'qnos Tish Mexanizmi",
      vazifa: "Harakatlanish",
      color: "#29b6f6",
      tavsif: "Listni asta sekin sovitish maydonida harakatlantiradi.",
      parametrlar: [
        { nom: "Tezlik", qiymat: "0.1-2 m/min" },
        { nom: "Qadam", qiymat: "250 mm" },
        { nom: "Mexanizm", qiymat: "Tishli rack" },
      ],
    },
    LIST: {
      id: "LIST",
      nom: "Sovitilayotgan List",
      vazifa: "Mahsulot",
      color: "#60a0c8",
      tavsif: "Prokattan chiqqan issiq list asta soviydi. 900°C → 60°C.",
      parametrlar: [
        { nom: "Kirish harorat", qiymat: "900°C" },
        { nom: "Chiqish harorat", qiymat: "< 80°C" },
        { nom: "Qalinlik", qiymat: "5-40 mm" },
      ],
    },
    VENTILATOR: {
      id: "VENTILATOR",
      nom: "Majburiy Sovitish Ventilyatorlari",
      vazifa: "Sovitish",
      color: "#00d4ff",
      tavsif: "Pastdan sovuq havo purkaladi. Sovitish tezligini oshiradi.",
      parametrlar: [
        { nom: "Soni", qiymat: "6 ta" },
        { nom: "Quvvat (har)", qiymat: "45 kW" },
        { nom: "Havo oqimi", qiymat: "18000 m³/h" },
      ],
    },
    HARORAT_SENSOR: {
      id: "HARORAT_SENSOR",
      nom: "Harorat Sensorlari",
      vazifa: "Nazorat",
      color: "#ff9500",
      tavsif: "Pirometrlar. Listning turli nuqtalarida haroratni o'lchaydi.",
      parametrlar: [
        { nom: "Soni", qiymat: "12 ta" },
        { nom: "Aniqligi", qiymat: "±5°C" },
        { nom: "Turi", qiymat: "Infraqizil pirometr" },
      ],
    },
  };

  const click = (id) =>
    setActive((prev) => (prev?.id === id ? null : parts[id]));
  const af = (k) =>
    active?.id === k ? `${parts[k]?.color}30` : `${parts[k]?.color}18`;
  const st = (k) =>
    active?.id === k ? parts[k]?.color : `${parts[k]?.color}80`;
  const sw = (k) => (active?.id === k ? 2.5 : 1.8);

  // List harorat gradyenti (issiqdan sovuqqa)
  const listColors = [
    "#cc4400",
    "#994400",
    "#664422",
    "#445566",
    "#336688",
    "#336688",
  ];

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 480 360"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="cb_list" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#cc4400" />
            <stop offset="25%" stopColor="#884422" />
            <stop offset="50%" stopColor="#445566" />
            <stop offset="75%" stopColor="#336688" />
            <stop offset="100%" stopColor="#224455" />
          </linearGradient>
          <filter id="cb_glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id="cb_blur">
            <feGaussianBlur stdDeviation="4" />
          </filter>
        </defs>
        <rect width="480" height="360" fill="#04060c" />

        {/* Asos plita */}
        <rect
          x="16"
          y="174"
          width="448"
          height="80"
          rx="4"
          fill="#06090f"
          stroke="#0c1420"
          strokeWidth="2"
        />

        {/* TISHLI MEXANIZM (sovitish bed tezlatgich) */}
        <g
          onClick={() => click("TOKNOS")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "TOKNOS" ? 0.3 : 1}
        >
          {/* Tishli rack chiziqlar */}
          {[
            24, 56, 88, 120, 152, 184, 216, 248, 280, 312, 344, 376, 408, 440,
          ].map((x) => (
            <g key={x}>
              <rect
                x={x}
                y="174"
                width="24"
                height="14"
                rx="2"
                fill={af("TOKNOS")}
                stroke={st("TOKNOS")}
                strokeWidth="1.2"
              >
                {isActive && (
                  <animate
                    attributeName="y"
                    values="174;180;174"
                    dur="1.5s"
                    begin={`${(x / 480) * 1}s`}
                    repeatCount="indefinite"
                  />
                )}
              </rect>
            </g>
          ))}
          <text
            x="240"
            y="204"
            fill={parts.TOKNOS.color}
            fontSize="6.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.7"
          >
            TO'QNOS TISH MEXANIZMI
          </text>
        </g>

        {/* LIST (sovitilayotgan) */}
        <g
          onClick={() => click("LIST")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "LIST" ? 0.3 : 1}
        >
          {/* Bir nechta list (cooling bed da bir vaqtda bir necha list) */}
          {[0, 1, 2].map((row) => (
            <g key={row}>
              <rect
                x={20 + row * 8}
                y={116 + row * 6}
                width={360 - row * 16}
                height={22 - row * 2}
                rx="2"
                fill="url(#cb_list)"
                stroke="#442200"
                strokeWidth="1"
                opacity={1 - row * 0.25}
              />
              {/* Issiqlik glow (birinchi list yangi kelgan) */}
              {row === 0 && (
                <rect
                  x="20"
                  y="112"
                  width="100"
                  height="30"
                  fill="#cc3300"
                  opacity="0.08"
                  filter="url(#cb_blur)"
                />
              )}
            </g>
          ))}
          {/* Harorat o'zgarish gradient ko'rsatgichi */}
          <text
            x="30"
            y="112"
            fill="#ff6600"
            fontSize="7"
            fontFamily="monospace"
            opacity="0.8"
          >
            900°C
          </text>
          <text
            x="360"
            y="112"
            fill="#4488aa"
            fontSize="7"
            fontFamily="monospace"
            opacity="0.8"
          >
            80°C
          </text>
          <path
            d="M68 109 L355 109"
            stroke="url(#cb_list)"
            strokeWidth="1.5"
            opacity="0.4"
          />
        </g>

        {/* VENTILYATORLAR */}
        <g
          onClick={() => click("VENTILATOR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "VENTILATOR" ? 0.3 : 1}
        >
          {[40, 120, 200, 280, 360, 440].map((x, i) => (
            <g key={x}>
              {/* Ventilator korpusi */}
              <circle
                cx={x}
                cy="222"
                r="20"
                fill={af("VENTILATOR")}
                stroke={st("VENTILATOR")}
                strokeWidth="1.5"
              />
              <circle
                cx={x}
                cy="222"
                r="14"
                fill="#060e18"
                stroke="#0e2030"
                strokeWidth="1"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${x} 222`}
                  to={`${isActive ? 360 : 0} ${x} 222`}
                  dur={`${0.8 + i * 0.1}s`}
                  repeatCount="indefinite"
                />
              </circle>
              {/* Peroq */}
              <path
                d={`M${x} 222 L${x + 12} 214 Q${x + 14} 222 ${x + 12} 230 Z`}
                fill={st("VENTILATOR")}
                opacity="0.5"
              >
                <animateTransform
                  attributeName="transform"
                  type="rotate"
                  from={`0 ${x} 222`}
                  to={`${isActive ? 360 : 0} ${x} 222`}
                  dur={`${0.8 + i * 0.1}s`}
                  repeatCount="indefinite"
                />
              </path>
              {/* Havo oqim strelkasi */}
              {isActive && (
                <line
                  x1={x}
                  y1="242"
                  x2={x}
                  y2="175"
                  stroke="#00d4ff"
                  strokeWidth="1.5"
                  strokeDasharray="4,3"
                  opacity="0.4"
                >
                  <animate
                    attributeName="stroke-dashoffset"
                    values="0;-14"
                    dur="0.8s"
                    repeatCount="indefinite"
                  />
                </line>
              )}
              <circle
                cx={x}
                cy="222"
                r="4"
                fill="#0a1828"
                stroke="#162838"
                strokeWidth="1"
              />
            </g>
          ))}
          {/* Ventilator asosi */}
          <rect
            x="16"
            y="240"
            width="448"
            height="14"
            rx="3"
            fill="#0a1428"
            stroke="#162030"
            strokeWidth="1.5"
          />
        </g>

        {/* HARORAT SENSORLAR */}
        <g
          onClick={() => click("HARORAT_SENSOR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "HARORAT_SENSOR" ? 0.3 : 1}
        >
          {[60, 140, 220, 300, 380].map((x, i) => (
            <g key={x}>
              <line
                x1={x}
                y1="96"
                x2={x}
                y2="116"
                stroke={st("HARORAT_SENSOR")}
                strokeWidth="1.5"
              />
              <rect
                x={x - 12}
                y="78"
                width="24"
                height="20"
                rx="4"
                fill={af("HARORAT_SENSOR")}
                stroke={st("HARORAT_SENSOR")}
                strokeWidth="1.5"
              />
              <circle
                cx={x}
                cy="88"
                r="5"
                fill="#0c1828"
                stroke={st("HARORAT_SENSOR")}
                strokeWidth="1"
              >
                <animate
                  attributeName="fill"
                  values="#0c1828;#ff6600;#0c1828"
                  dur={`${1.5 + i * 0.2}s`}
                  repeatCount="indefinite"
                />
              </circle>
              {/* Harorat qiymati */}
              <text
                x={x}
                y="68"
                fill={parts.HARORAT_SENSOR.color}
                fontSize="6"
                fontFamily="monospace"
                textAnchor="middle"
                opacity="0.75"
              >
                {[890, 650, 420, 220, 85][i]}°C
              </text>
            </g>
          ))}
        </g>

        {/* Yo'nalish */}
        <path
          d="M16 140 L46 140"
          stroke="#cc4400"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
          markerEnd="url(#arr_cb)"
        />
        <text
          x="50"
          y="136"
          fill="#662200"
          fontSize="7"
          fontFamily="monospace"
          opacity="0.8"
        >
          900°C
        </text>
        <path
          d="M400 140 L430 140"
          stroke="#4488aa"
          strokeWidth="2"
          strokeLinecap="round"
          opacity="0.7"
          markerEnd="url(#arr_cb)"
        />
        <text
          x="360"
          y="136"
          fill="#224455"
          fontSize="7"
          fontFamily="monospace"
          opacity="0.8"
        >
          ↓80°C
        </text>

        <defs>
          <marker
            id="arr_cb"
            viewBox="0 0 8 8"
            refX="6"
            refY="4"
            markerWidth="4"
            markerHeight="4"
            orient="auto"
          >
            <path
              d="M1 1L7 4L1 7"
              fill="none"
              stroke="#e2e8f0"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        {/* Zamin */}
        <rect
          x="8"
          y="266"
          width="464"
          height="12"
          rx="3"
          fill="#060810"
          stroke="#0c1220"
          strokeWidth="1.5"
        />
        <g fill="#080c18" stroke="#121c28" strokeWidth="1">
          {[30, 80, 240, 400, 448].map((x) => (
            <rect key={x} x={x} y="256" width="12" height="18" rx="2" />
          ))}
        </g>

        <text
          x="240"
          y="302"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
          fill="#1e3855"
          letterSpacing="3"
        >
          SOVITISH STOLI
        </text>
        <text
          x="240"
          y="318"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="8"
          fill="#162a40"
          letterSpacing="2"
        >
          COOLING BED · CB-480
        </text>
      </svg>
      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ─────────────────────────────────────────────
// TEKISLASH — List tekislash mashinasi
// ─────────────────────────────────────────────
function TekislashDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isActive = u.holat === "faol";

  const parts = {
    ROLIKLAR: {
      id: "ROLIKLAR",
      nom: "Tekislash Roliklarni (9 ta)",
      vazifa: "Tekislash",
      color: "#00e676",
      tavsif: "Ko'p qatorli roliklar. Listning egriligini yo'q qiladi.",
      parametrlar: [
        { nom: "Roliklar soni", qiymat: "9 ta (4+5)" },
        { nom: "Diametr", qiymat: "200 mm" },
        {
          nom: "Tezlik",
          qiymat: `${Math.round((u.quvvat || 400) * 0.1)} m/min`,
        },
      ],
    },
    LIST: {
      id: "LIST",
      nom: "Tekislanayotgan List",
      vazifa: "Mahsulot",
      color: "#78a8c4",
      tavsif: "Egri list roliklar orasidan o'tib tekislanadi.",
      parametrlar: [
        { nom: "Qalinlik", qiymat: "5-40 mm" },
        { nom: "Kenglik", qiymat: "1200-2500 mm" },
        { nom: "Egrilik chiqish", qiymat: "< 2 mm/m" },
      ],
    },
    PRESS_BLOK: {
      id: "PRESS_BLOK",
      nom: "Bosim Regulyatori",
      vazifa: "Bosim boshqaruv",
      color: "#ffd60a",
      tavsif: "Roliklar orasidagi masofani boshqaradi. AGC tizimi.",
      parametrlar: [
        { nom: "Bosim", qiymat: `${Math.round((u.quvvat || 400) * 0.8)} kN` },
        { nom: "AGC aniqlik", qiymat: "±0.02 mm" },
      ],
    },
    MOTOR: {
      id: "MOTOR",
      nom: "Asosiy Elektr Motor",
      vazifa: "Harakatlantirish",
      color: "#a78bfa",
      tavsif: "AC sinxron motor. Tezlik VFD bilan boshqariladi.",
      parametrlar: [
        { nom: "Quvvat", qiymat: `${u.quvvat || 400} kW` },
        { nom: "RPM", qiymat: "750" },
        { nom: "Boshqaruv", qiymat: "VFD" },
      ],
    },
  };

  const click = (id) =>
    setActive((prev) => (prev?.id === id ? null : parts[id]));
  const af = (k) =>
    active?.id === k ? `${parts[k]?.color}30` : `${parts[k]?.color}18`;
  const st = (k) =>
    active?.id === k ? parts[k]?.color : `${parts[k]?.color}80`;
  const sw = (k) => (active?.id === k ? 2.5 : 1.8);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 480 340"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="lv_frame" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#040810" />
            <stop offset="50%" stopColor="#0e1828" />
            <stop offset="100%" stopColor="#040810" />
          </linearGradient>
          <linearGradient id="lv_rolik" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#060c14" />
            <stop offset="30%" stopColor="#142030" />
            <stop offset="55%" stopColor="#1e2e3c" />
            <stop offset="80%" stopColor="#142030" />
            <stop offset="100%" stopColor="#060c14" />
          </linearGradient>
          <linearGradient id="lv_list" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a4858" />
            <stop offset="50%" stopColor="#60889a" />
            <stop offset="100%" stopColor="#3a4858" />
          </linearGradient>
        </defs>
        <rect width="480" height="340" fill="#04060c" />

        {/* Ustki rama */}
        <rect
          x="16"
          y="28"
          width="448"
          height="44"
          rx="4"
          fill="url(#lv_frame)"
          stroke="#0e1828"
          strokeWidth="2"
        />

        {/* BOSIM REGULYATORI */}
        <g
          onClick={() => click("PRESS_BLOK")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "PRESS_BLOK" ? 0.3 : 1}
        >
          {[60, 120, 180, 240, 300, 360, 420].map((x) => (
            <g key={x}>
              <rect
                x={x - 14}
                y="22"
                width="28"
                height="54"
                rx="5"
                fill={af("PRESS_BLOK")}
                stroke={st("PRESS_BLOK")}
                strokeWidth="1.5"
              />
              <rect
                x={x - 10}
                y="26"
                width="20"
                height="46"
                rx="3"
                fill="#080e18"
                stroke="#121c28"
                strokeWidth="1"
              />
              <rect
                x={x - 8}
                y="28"
                width="8"
                height="40"
                rx="2"
                fill="#162030"
                opacity="0.35"
              />
            </g>
          ))}
        </g>

        {/* USTKI ROLIKLAR (4 ta) */}
        <g
          onClick={() => click("ROLIKLAR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "ROLIKLAR" ? 0.3 : 1}
        >
          {[60, 150, 240, 330, 420].map((x) => (
            <rect
              key={x}
              x={x - 28}
              y="72"
              width="56"
              height="30"
              rx="15"
              fill="url(#lv_rolik)"
              stroke={st("ROLIKLAR")}
              strokeWidth="1.8"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${x} 87`}
                to={`${isActive ? 360 : 0} ${x} 87`}
                dur="1.2s"
                repeatCount="indefinite"
              />
            </rect>
          ))}
          {/* Disk ko'rinishlari */}
          {[60, 150, 240, 330, 420].map((x) => (
            <g key={`d_${x}`}>
              <ellipse
                cx={x - 20}
                cy="87"
                rx="12"
                ry="15"
                fill="#040c18"
                stroke="#0e2030"
                strokeWidth="1.2"
              />
              <ellipse
                cx={x}
                cy="87"
                rx="12"
                ry="15"
                fill="#040c18"
                stroke="#0e2030"
                strokeWidth="1.2"
              />
              <ellipse
                cx={x + 20}
                cy="87"
                rx="12"
                ry="15"
                fill="#040c18"
                stroke="#0e2030"
                strokeWidth="1.2"
              />
            </g>
          ))}
        </g>

        {/* LIST */}
        <g
          onClick={() => click("LIST")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "LIST" ? 0.3 : 1}
        >
          <rect x="0" y="100" width="480" height="10" fill="url(#lv_list)" />
          <rect
            x="0"
            y="100"
            width="480"
            height="10"
            fill="#ffffff"
            opacity="0.08"
          />
          {/* Harakatlanuvchi highlight */}
          <rect
            x="-50"
            y="100"
            width="40"
            height="10"
            fill="#ffffff"
            opacity="0.15"
          >
            <animate
              attributeName="x"
              values="-50;520"
              dur="1s"
              repeatCount="indefinite"
            />
          </rect>
          {/* Kirish (biroz egri ko'rinish) */}
          <path
            d="M0 100 Q30 96 60 100"
            fill="none"
            stroke="#5a7888"
            strokeWidth="2"
            opacity="0.5"
          />
          <path
            d="M420 100 Q450 102 480 100"
            fill="none"
            stroke="#5a7888"
            strokeWidth="2"
            opacity="0.5"
          />
        </g>

        {/* PASTKI ROLIKLAR (5 ta — offset) */}
        <g
          onClick={() => click("ROLIKLAR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "ROLIKLAR" ? 0.3 : 1}
        >
          {[30, 105, 195, 285, 375, 450].map((x) => (
            <rect
              key={x}
              x={x - 28}
              y="110"
              width="56"
              height="30"
              rx="15"
              fill="url(#lv_rolik)"
              stroke={st("ROLIKLAR")}
              strokeWidth="1.8"
            >
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${x} 125`}
                to={`${isActive ? -360 : 0} ${x} 125`}
                dur="1.2s"
                repeatCount="indefinite"
              />
            </rect>
          ))}
          {[30, 105, 195, 285, 375, 450].map((x) => (
            <g key={`d2_${x}`}>
              <ellipse
                cx={x - 20}
                cy="125"
                rx="12"
                ry="15"
                fill="#040c18"
                stroke="#0e2030"
                strokeWidth="1.2"
              />
              <ellipse
                cx={x}
                cy="125"
                rx="12"
                ry="15"
                fill="#040c18"
                stroke="#0e2030"
                strokeWidth="1.2"
              />
              <ellipse
                cx={x + 20}
                cy="125"
                rx="12"
                ry="15"
                fill="#040c18"
                stroke="#0e2030"
                strokeWidth="1.2"
              />
            </g>
          ))}
        </g>

        {/* Pastki rama */}
        <rect
          x="16"
          y="140"
          width="448"
          height="44"
          rx="4"
          fill="url(#lv_frame)"
          stroke="#0e1828"
          strokeWidth="2"
        />

        {/* MOTOR bloki */}
        <g
          onClick={() => click("MOTOR")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "MOTOR" ? 0.3 : 1}
        >
          <rect
            x="16"
            y="196"
            width="130"
            height="80"
            rx="5"
            fill={af("MOTOR")}
            stroke={st("MOTOR")}
            strokeWidth={sw("MOTOR")}
          />
          {/* Qovurg'alar */}
          <g stroke="#0c1220" strokeWidth="1.2" fill="#080c18">
            {[204, 212, 220, 228, 236, 244, 252, 260].map((y) => (
              <rect key={y} x="20" y={y} width="122" height="6" rx="1" />
            ))}
          </g>
          <circle
            cx="81"
            cy="236"
            r="28"
            fill="#060c18"
            stroke="#101828"
            strokeWidth="2"
          />
          <circle
            cx="81"
            cy="236"
            r="20"
            fill="#0a1420"
            stroke="#162030"
            strokeWidth="1.8"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 81 236"
              to={`${isActive ? 360 : 0} 81 236`}
              dur="1.5s"
              repeatCount="indefinite"
            />
          </circle>
          <circle
            cx="81"
            cy="236"
            r="10"
            fill="#060e18"
            stroke="#101828"
            strokeWidth="1.2"
          />
          <circle
            cx="81"
            cy="236"
            r="4"
            fill="#0e1828"
            stroke="#1a2838"
            strokeWidth="1"
          />
          <text
            x="81"
            y="286"
            fill={parts.MOTOR.color}
            fontSize="7"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            {u.quvvat || 400} kW
          </text>
        </g>

        {/* Reduktor */}
        <rect
          x="146"
          y="206"
          width="50"
          height="60"
          rx="4"
          fill="#0a1828"
          stroke="#162838"
          strokeWidth="1.5"
        />
        <circle
          cx="171"
          cy="228"
          r="16"
          fill="#060c18"
          stroke="#122030"
          strokeWidth="1.5"
        />
        <circle
          cx="171"
          cy="228"
          r="10"
          fill="#0a1420"
          stroke="#182838"
          strokeWidth="1.2"
        >
          <animateTransform
            attributeName="transform"
            type="rotate"
            from="0 171 228"
            to={`${isActive ? 360 : 0} 171 228`}
            dur="1.5s"
            repeatCount="indefinite"
          />
        </circle>
        <circle cx="171" cy="228" r="4" fill="#081018" />
        <rect
          x="194"
          y="225"
          width="40"
          height="12"
          rx="6"
          fill="#102030"
          stroke="#1e2e40"
          strokeWidth="1.5"
        />

        {/* Yo'nalish */}
        <text
          x="12"
          y="92"
          fill="#3a5868"
          fontSize="7"
          fontFamily="monospace"
          opacity="0.8"
        >
          → KIRISH
        </text>
        <text
          x="390"
          y="92"
          fill="#3a5868"
          fontSize="7"
          fontFamily="monospace"
          opacity="0.8"
        >
          CHIQISH →
        </text>

        {/* Zamin */}
        <rect
          x="8"
          y="286"
          width="464"
          height="12"
          rx="3"
          fill="#060810"
          stroke="#0c1220"
          strokeWidth="1.5"
        />
        <g fill="#080c18" stroke="#121c28" strokeWidth="1">
          {[30, 80, 240, 400, 448].map((x) => (
            <rect key={x} x={x} y="276" width="12" height="18" rx="2" />
          ))}
        </g>

        <text
          x="240"
          y="316"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
          fill="#1e3855"
          letterSpacing="3"
        >
          LIST TEKISLASH
        </text>
        <text
          x="240"
          y="330"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="8"
          fill="#162a40"
          letterSpacing="2"
        >
          LEVELING MACHINE · LM-{u.quvvat || 400}
        </text>
      </svg>
      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}

// ─────────────────────────────────────────────
// QADOQLASH — List paketlash liniyasi
// ─────────────────────────────────────────────
function QadoqlashDiagram({ u, isDark }) {
  const [active, setActive] = useState(null);
  const isActive = u.holat === "faol";

  const parts = {
    STOL: {
      id: "STOL",
      nom: "Yig'ish Stoli",
      vazifa: "Yig'ish",
      color: "#00d4ff",
      tavsif: "Kesilgan listlar paket hosil qilib yig'iladi.",
      parametrlar: [
        { nom: "Sig'im", qiymat: "30 t" },
        { nom: "O'lcham", qiymat: "3000×2000 mm" },
        { nom: "Ko'tarish", qiymat: "Gidravlik" },
      ],
    },
    PAKET: {
      id: "PAKET",
      nom: "Tayyor Paket",
      vazifa: "Mahsulot",
      color: "#4a7a9a",
      tavsif: "Bir xil o'lchamdagi listlar paketi. Bog'lash va yorliqlash.",
      parametrlar: [
        { nom: "Og'irligi", qiymat: "5-25 t" },
        { nom: "Listlar soni", qiymat: "10-50 ta" },
        { nom: "Standart", qiymat: "GOST/EN 10051" },
      ],
    },
    BOMLASH: {
      id: "BOMLASH",
      nom: "Bog'lash Mashinasi",
      vazifa: "Bog'lash",
      color: "#ffd60a",
      tavsif: "Po'lat lenta bilan paketni mahkamlaydi. 4 ta kamar.",
      parametrlar: [
        { nom: "Lenta kengligi", qiymat: "32 mm" },
        { nom: "Lenta qalinligi", qiymat: "0.8 mm" },
        { nom: "Kuchlanish", qiymat: "1200 N" },
      ],
    },
    KRAN_HOOK: {
      id: "KRAN_HOOK",
      nom: "Ko'tarish Moslamasi",
      vazifa: "Ko'chirish",
      color: "#ff6b1a",
      tavsif: "Tayyor paketni omborga ko'chiradi. Magnit yoki kryuk bilan.",
      parametrlar: [
        { nom: "Ko'tarish kuchi", qiymat: "35 t" },
        { nom: "Turi", qiymat: "Elektromagnit" },
      ],
    },
    YORLIQ: {
      id: "YORLIQ",
      nom: "Avtomatik Yorliqlash",
      vazifa: "Identifikatsiya",
      color: "#00ff9d",
      tavsif: "Har paketga shtrix-kod va ma'lumotli yorliq yapishtiriladi.",
      parametrlar: [
        { nom: "Ma'lumot", qiymat: "Quyma, o'lcham, standart" },
        { nom: "Usul", qiymat: "Termotransfer printer" },
      ],
    },
  };

  const click = (id) =>
    setActive((prev) => (prev?.id === id ? null : parts[id]));
  const af = (k) =>
    active?.id === k ? `${parts[k]?.color}30` : `${parts[k]?.color}18`;
  const st = (k) =>
    active?.id === k ? parts[k]?.color : `${parts[k]?.color}80`;
  const sw = (k) => (active?.id === k ? 2.5 : 1.8);

  return (
    <Box sx={{ position: "relative", width: "100%", height: "100%" }}>
      <svg
        viewBox="0 0 480 380"
        style={{ width: "100%", height: "100%", display: "block" }}
      >
        <defs>
          <linearGradient id="pk_frame" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#040810" />
            <stop offset="50%" stopColor="#0e1828" />
            <stop offset="100%" stopColor="#040810" />
          </linearGradient>
          <linearGradient id="pk_list" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#3a5060" />
            <stop offset="50%" stopColor="#4a6878" />
            <stop offset="100%" stopColor="#2a3848" />
          </linearGradient>
          <filter id="pk_glow">
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="480" height="380" fill="#04060c" />

        {/* KRAN HOOK (yuqori) */}
        <g
          onClick={() => click("KRAN_HOOK")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "KRAN_HOOK" ? 0.3 : 1}
        >
          <rect
            x="200"
            y="16"
            width="80"
            height="22"
            rx="4"
            fill={af("KRAN_HOOK")}
            stroke={st("KRAN_HOOK")}
            strokeWidth={sw("KRAN_HOOK")}
          />
          {/* Kanat */}
          <line
            x1="228"
            y1="38"
            x2="216"
            y2="68"
            stroke={st("KRAN_HOOK")}
            strokeWidth="1.8"
            strokeDasharray="5,3"
          />
          <line
            x1="252"
            y1="38"
            x2="264"
            y2="68"
            stroke={st("KRAN_HOOK")}
            strokeWidth="1.8"
            strokeDasharray="5,3"
          />
          {/* Kryuk */}
          <path
            d="M216 68 L264 68 L264 80 Q264 92 248 92 Q232 92 232 84 Q232 76 244 76"
            fill="none"
            stroke={st("KRAN_HOOK")}
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <text
            x="240"
            y="28"
            fill={parts.KRAN_HOOK.color}
            fontSize="7"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            KO'TARISH
          </text>
          {/* Elektromagnit */}
          <ellipse
            cx="240"
            cy="80"
            rx="28"
            ry="10"
            fill={af("KRAN_HOOK")}
            stroke={st("KRAN_HOOK")}
            strokeWidth="1.5"
          />
          {isActive && (
            <ellipse
              cx="240"
              cy="80"
              rx="28"
              ry="10"
              fill="#ff6b1a"
              opacity="0.1"
            >
              <animate
                attributeName="ry"
                values="10;14;10"
                dur="1.5s"
                repeatCount="indefinite"
              />
            </ellipse>
          )}
        </g>

        {/* PAKET ASOSIY (3D ko'rinish) */}
        <g
          onClick={() => click("PAKET")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "PAKET" ? 0.3 : 1}
        >
          {/* Paket qatlamlari (listlar) */}
          {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((i) => (
            <rect
              key={i}
              x="80"
              y={148 + i * 5}
              width="290"
              height="4"
              rx="1"
              fill="url(#pk_list)"
              stroke="#2a3848"
              strokeWidth="0.5"
              opacity={1 - i * 0.03}
            />
          ))}
          {/* Yon yuz (3D effekt) */}
          <path
            d="M370 148 L390 138 L390 203 L370 213 Z"
            fill="#2a3848"
            stroke="#3a4858"
            strokeWidth="0.8"
          />
          <path
            d="M80 148 L100 138 L390 138 L370 148 Z"
            fill="#3a5060"
            stroke="#4a6070"
            strokeWidth="0.8"
          />
          {/* Paket kontur */}
          <rect
            x="80"
            y="148"
            width="290"
            height="66"
            rx="2"
            fill="none"
            stroke={st("PAKET")}
            strokeWidth="1.8"
          />
          {/* Paket hajm */}
          <text
            x="225"
            y="188"
            fill={parts.PAKET.color}
            fontSize="8"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            TAYYOR PAKET
          </text>
          <text
            x="225"
            y="200"
            fill={parts.PAKET.color}
            fontSize="6.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.6"
          >
            13 ta list · ~18 t
          </text>
        </g>

        {/* BOG'LASH KAMARLAR */}
        <g
          onClick={() => click("BOMLASH")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "BOMLASH" ? 0.3 : 1}
        >
          {[120, 185, 260, 335].map((x) => (
            <g key={x}>
              <rect
                x={x - 4}
                y="146"
                width="8"
                height="70"
                rx="2"
                fill={af("BOMLASH")}
                stroke={st("BOMLASH")}
                strokeWidth="1.5"
              />
              {/* Kamar qistirma */}
              <rect
                x={x - 8}
                y="168"
                width="16"
                height="14"
                rx="3"
                fill="#1a1400"
                stroke={st("BOMLASH")}
                strokeWidth="1.2"
              />
            </g>
          ))}
          {/* Bog'lash mashinasi korpusi */}
          <rect
            x="60"
            y="226"
            width="60"
            height="44"
            rx="4"
            fill={af("BOMLASH")}
            stroke={st("BOMLASH")}
            strokeWidth={sw("BOMLASH")}
          />
          <rect
            x="64"
            y="230"
            width="52"
            height="36"
            rx="3"
            fill="#0c1828"
            stroke="#182030"
            strokeWidth="1"
          />
          <circle
            cx="90"
            cy="248"
            r="12"
            fill="#060e18"
            stroke={st("BOMLASH")}
            strokeWidth="1.5"
          >
            <animateTransform
              attributeName="transform"
              type="rotate"
              from="0 90 248"
              to={`${isActive ? 360 : 0} 90 248`}
              dur="2s"
              repeatCount="indefinite"
            />
          </circle>
          <text
            x="90"
            y="278"
            fill={parts.BOMLASH.color}
            fontSize="6.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            BOG'LASH
          </text>
        </g>

        {/* YIG'ISH STOLI */}
        <g
          onClick={() => click("STOL")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "STOL" ? 0.3 : 1}
        >
          <rect
            x="60"
            y="214"
            width="360"
            height="18"
            rx="3"
            fill={af("STOL")}
            stroke={st("STOL")}
            strokeWidth={sw("STOL")}
          />
          {/* Stol oyoqlari */}
          {[80, 200, 320, 400].map((x) => (
            <g key={x}>
              <rect
                x={x}
                y="232"
                width="12"
                height="40"
                rx="3"
                fill="#0a1828"
                stroke="#162030"
                strokeWidth="1.2"
              />
              {/* Oyoq hidravlik silindr */}
              <rect
                x={x + 3}
                y="236"
                width="6"
                height="32"
                rx="2"
                fill="#162838"
                stroke="#243848"
                strokeWidth="1"
              />
            </g>
          ))}
          <text
            x="240"
            y="226"
            fill={parts.STOL.color}
            fontSize="7.5"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.85"
          >
            YIG'ISH STOLI
          </text>
        </g>

        {/* YORLIQLASH */}
        <g
          onClick={() => click("YORLIQ")}
          style={{ cursor: "pointer" }}
          opacity={active && active.id !== "YORLIQ" ? 0.3 : 1}
        >
          <rect
            x="360"
            y="226"
            width="80"
            height="44"
            rx="4"
            fill={af("YORLIQ")}
            stroke={st("YORLIQ")}
            strokeWidth={sw("YORLIQ")}
          />
          {/* Printer */}
          <rect
            x="364"
            y="230"
            width="72"
            height="32"
            rx="3"
            fill="#0a1828"
            stroke="#162030"
            strokeWidth="1"
          />
          <rect
            x="368"
            y="234"
            width="64"
            height="16"
            rx="2"
            fill="#040c18"
            stroke="#0e2030"
            strokeWidth="1"
          />
          {/* Barkod */}
          <g stroke="#00ff9d" strokeWidth="1" opacity="0.7">
            {[
              372, 376, 381, 384, 389, 392, 397, 401, 406, 410, 415, 419, 423,
              427,
            ].map((x) => (
              <line key={x} x1={x} y1="236" x2={x} y2="248" />
            ))}
          </g>
          {/* Yorliq chiqishi */}
          {isActive && (
            <rect
              x="390"
              y="262"
              width="40"
              height="8"
              rx="1"
              fill="#002818"
              stroke="#00ff9d"
              strokeWidth="0.8"
            >
              <animate
                attributeName="y"
                values="262;255;262"
                dur="2s"
                repeatCount="indefinite"
              />
            </rect>
          )}
          <text
            x="400"
            y="278"
            fill={parts.YORLIQ.color}
            fontSize="6"
            fontFamily="monospace"
            textAnchor="middle"
            opacity="0.8"
          >
            YORLIQLASH
          </text>
        </g>

        {/* Zamin */}
        <rect
          x="8"
          y="286"
          width="464"
          height="12"
          rx="3"
          fill="#060810"
          stroke="#0c1220"
          strokeWidth="1.5"
        />
        <g fill="#080c18" stroke="#121c28" strokeWidth="1">
          {[40, 100, 240, 380, 440].map((x) => (
            <rect key={x} x={x} y="276" width="12" height="18" rx="2" />
          ))}
        </g>

        <text
          x="240"
          y="320"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="11"
          fontWeight="bold"
          fill="#1e3855"
          letterSpacing="3"
        >
          PAKETLASH LINIYASI
        </text>
        <text
          x="240"
          y="336"
          textAnchor="middle"
          fontFamily="monospace"
          fontSize="8"
          fill="#162a40"
          letterSpacing="2"
        >
          PACKAGING LINE · PKL-35
        </text>
      </svg>
      <PartInfoPanel part={active} onClose={() => setActive(null)} />
    </Box>
  );
}
// ──────────────────────────────────────────────────────────────────────
// Tur bo'yicha diagram tanlash
// ──────────────────────────────────────────────────────────────────────
function UskunaDiagram({ u, isDark }) {
  const getProkratDiagram = () => {
    if (
      u.model?.startsWith("CLM") ||
      u.nom?.toLowerCase().includes("ingichka")
    ) {
      return <IngichkaDiagram u={u} isDark={isDark} />;
    }
    if (u.model?.startsWith("RW") || u.nom?.toLowerCase().includes("rulo")) {
      return <RuloDiagram u={u} isDark={isDark} />;
    }
    return <ProkatDiagram u={u} isDark={isDark} />;
  };

  const map = {
    Pech: <DomnaPechiDiagram u={u} isDark={isDark} />,
    Konverter: <KonverterDiagram u={u} isDark={isDark} />,
    "Elektr Pech": <ElektrPechDiagram u={u} isDark={isDark} />,
    Prokat: getProkratDiagram(),
    Nasos: <NasosDiagram u={u} isDark={isDark} />,
    Kran: <KranDiagram u={u} isDark={isDark} />,
    Kesish: <KesishDiagram u={u} isDark={isDark} />,
    // ── YANGI TURLAR ──
    Transport: <TransportDiagram u={u} isDark={isDark} />,
    Sensor: <SensorDiagram u={u} isDark={isDark} />,
    Manipulator: <ManipulatorDiagram u={u} isDark={isDark} />,
    Press: <PressDiagram u={u} isDark={isDark} />,
    Sovitish: <SovitishDiagram u={u} isDark={isDark} />,
    Tekislash: <TekislashDiagram u={u} isDark={isDark} />,
    Qadoqlash: <QadoqlashDiagram u={u} isDark={isDark} />,
  };

  return map[u.tur] || <QadoqlashDiagram u={u} isDark={isDark} />;
}
// ══════════════════════════════════════════════════════════════════════
//  USKUNA DETAIL DRAWER
// ══════════════════════════════════════════════════════════════════════
// ─── EAF API key mapper ─────────────────────────────────────────────
const UCH_API = {
  "UCH-07A": "eaf",
  "UCH-07B": "lrf",
  "UCH-07C": "tsc",
};

// ─── Yordamchi formatlovchilar ───────────────────────────────────────
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

// ─── EAF Statistika Tab ─────────────────────────────────────────────
function EAFStatsTab({ uskuna, c, isDark }) {
  const today = new Date().toISOString().split("T")[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
  const {
    data: heats,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useEAFReport({ startDate: yesterday, endDate: today });

  const lastHeat = heats[heats.length - 1];

  // Harorat grafigi uchun data
  const tempData = (lastHeat?.temperatures || []).map((t, i) => ({
    i: i + 1,
    temp: t.temperature,
    o2: t.o2 || 0,
    t: fmtT(t.dateTime),
  }));

  // Kun statistikasi
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

  if (isLoading)
    return (
      <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
        <CircularProgress size={28} sx={{ color: c }} />
      </Box>
    );

  if (isError)
    return (
      <Box sx={{ py: 4, textAlign: "center" }}>
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.65rem",
            color: "#ff2d55",
          }}
        >
          API xato — server ishlayaptimi?
        </Typography>
      </Box>
    );

  return (
    <Box sx={{ p: 2 }}>
      {/* ── Sarlavha + yangilash ── */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          mb: 2,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 8px ${c}`,
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.62rem",
              color: c,
              letterSpacing: "0.1em",
            }}
          >
            EAF BUGUNGI STATISTIKA
          </Typography>
          <Chip
            label={`${heats.length} heat`}
            size="small"
            sx={{
              height: 16,
              fontSize: "0.5rem",
              bgcolor: `${c}18`,
              color: c,
              fontFamily: "monospace",
            }}
          />
        </Box>
        <RefreshIcon
          onClick={refetch}
          sx={{
            fontSize: 16,
            color: isFetching ? c : "#6b7280",
            cursor: "pointer",
            animation: isFetching ? "spin 1s linear infinite" : "none",
            "@keyframes spin": { "100%": { transform: "rotate(360deg)" } },
          }}
        />
      </Box>

      {/* ── Kun umumiy statistikasi ── */}
      <Grid container spacing={1} sx={{ mb: 2 }}>
        {[
          { l: "HEAT SONI", v: heats.length, c: "#00d4ff", icon: "🔥" },
          {
            l: "O'RT CHIQARISH",
            v: `${fmtN(avgTapping / 1000, 1)} t`,
            c: "#00e676",
            icon: "⚖️",
          },
          {
            l: "O'RT ELEKTR",
            v: `${fmtN(avgEnergy / 1000, 1)} MWh`,
            c: "#ffd60a",
            icon: "⚡",
          },
          {
            l: "JAMI SHLAM",
            v: `${fmtN(totalScrap / 1000, 1)} t`,
            c: "#ff6b1a",
            icon: "🏗️",
          },
          {
            l: "JAMI HBI",
            v: `${fmtN(totalHBI / 1000, 1)} t`,
            c: "#a78bfa",
            icon: "🔩",
          },
          { l: "SMENA", v: lastHeat?.shift || "—", c: "#6b7280", icon: "👷" },
        ].map((s) => (
          <Grid item xs={4} key={s.l}>
            <Box
              sx={{
                p: 1,
                background: `${s.c}10`,
                border: `1px solid ${s.c}25`,
                borderRadius: 1,
                textAlign: "center",
              }}
            >
              <Typography sx={{ fontSize: "0.75rem", mb: 0.2 }}>
                {s.icon}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: "0.75rem",
                  fontWeight: 700,
                  color: s.c,
                }}
              >
                {s.v}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.47rem",
                  color: "#6b7280",
                  letterSpacing: "0.06em",
                }}
              >
                {s.l}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      {/* ── Oxirgi heat ── */}
      {lastHeat && (
        <Box
          sx={{
            mb: 2,
            p: 1.5,
            background: `${c}08`,
            border: `1px solid ${c}25`,
            borderRadius: 1,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <Typography
              sx={{
                fontFamily: "'Orbitron',monospace",
                fontSize: "0.65rem",
                color: c,
                fontWeight: 700,
              }}
            >
              OXIRGI HEAT #{lastHeat.heatId}
            </Typography>
            <Chip
              label={lastHeat.steelGradeName}
              size="small"
              sx={{
                height: 16,
                fontSize: "0.5rem",
                bgcolor: `${c}18`,
                color: c,
                fontFamily: "monospace",
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.55rem",
                color: "#6b7280",
                ml: "auto",
              }}
            >
              {fmtT(lastHeat.startTime)} → {fmtT(lastHeat.stopTime)}
            </Typography>
          </Box>
          <Grid container spacing={0.8}>
            {[
              {
                l: "Chiqarish",
                v: `${fmtN((lastHeat.tappingWeight || 0) / 1000, 2)} t`,
                c: "#00e676",
              },
              {
                l: "Elektr",
                v: `${fmtN(lastHeat.electricalEnergy / 1000, 1)} MWh`,
                c: "#ffd60a",
              },
              {
                l: "O₂",
                v: `${fmtN(lastHeat.injectedO2, 0)} m³`,
                c: "#00d4ff",
              },
              {
                l: "Uglerod",
                v: `${fmtN(lastHeat.injectedCarbon, 0)} kg`,
                c: "#ff9500",
              },
              {
                l: "Yoqilg'i",
                v: `${fmtN(lastHeat.injectedFuel, 0)} kg`,
                c: "#a78bfa",
              },
              {
                l: "Quvvat vaqt",
                v: `${Math.floor((lastHeat.powerOnTime || 0) / 60)}d`,
                c: "#ff6b1a",
              },
              {
                l: "O'rt quvvat",
                v: `${fmtN((lastHeat.averagePower || 0) / 1000, 0)} MW`,
                c: "#ffd60a",
              },
              {
                l: "Shlam",
                v: `${fmtN((lastHeat.totalScrap || 0) / 1000, 1)} t`,
                c: "#6b7280",
              },
              {
                l: "HBI",
                v: `${fmtN((lastHeat.totalHBI || 0) / 1000, 1)} t`,
                c: "#6b7280",
              },
            ].map((s) => (
              <Grid item xs={4} key={s.l}>
                <Box
                  sx={{
                    px: 0.8,
                    py: 0.5,
                    background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
                    borderRadius: 0.5,
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.48rem",
                      color: "#6b7280",
                    }}
                  >
                    {s.l}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.65rem",
                      fontWeight: 700,
                      color: s.c,
                    }}
                  >
                    {s.v}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}

      {/* ── Harorat grafigi ── */}
      {tempData.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.6rem",
              color: "#6b7280",
              mb: 1,
              letterSpacing: "0.08em",
            }}
          >
            OXIRGI HEAT — HARORAT GRAFIGI (°C)
          </Typography>
          <ResponsiveContainer width="100%" height={150}>
            <LineChart data={tempData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke={isDark ? "#1a2235" : "#e5e7eb"}
              />
              <XAxis dataKey="i" tick={{ fontSize: 9, fill: "#6b7280" }} />
              <YAxis
                domain={["auto", "auto"]}
                tick={{ fontSize: 9, fill: "#6b7280" }}
              />
              <RTooltip
                contentStyle={{
                  background: "#060810",
                  border: `1px solid ${c}40`,
                  fontSize: 11,
                  fontFamily: "monospace",
                }}
                formatter={(v, n) => [v, n]}
                labelFormatter={(_, p) => p?.[0]?.payload?.t || ""}
              />
              <Legend wrapperStyle={{ fontSize: 10 }} />
              <Line
                type="monotone"
                dataKey="temp"
                stroke={c}
                dot={{ r: 3 }}
                name="Harorat °C"
                strokeWidth={2}
              />
              <Line
                type="monotone"
                dataKey="o2"
                stroke="#ff6b1a"
                dot={{ r: 2 }}
                name="O₂"
                strokeWidth={1.5}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      )}

      {/* ── Kimyoviy tarkib ── */}
      {lastHeat?.steelAnalysis?.length > 0 &&
        (() => {
          const analysis =
            lastHeat.steelAnalysis[lastHeat.steelAnalysis.length - 1];
          return (
            <Box sx={{ mb: 2 }}>
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.6rem",
                  color: "#6b7280",
                  mb: 1,
                  letterSpacing: "0.08em",
                }}
              >
                KIMYOVIY TARKIB — {analysis.sampleId} ·{" "}
                {fmtT(analysis.sampleTime)}
              </Typography>
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 0.5 }}>
                {analysis.chemicalAnalysis?.map((ca) => (
                  <Box
                    key={ca.code}
                    sx={{
                      px: 0.8,
                      py: 0.4,
                      background: `${c}12`,
                      border: `1px solid ${c}28`,
                      borderRadius: 0.5,
                      textAlign: "center",
                      minWidth: 40,
                    }}
                  >
                    <Typography
                      sx={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: "0.48rem",
                        color: "#6b7280",
                      }}
                    >
                      {ca.code}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Orbitron',monospace",
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        color: c,
                      }}
                    >
                      {Number(ca.value).toFixed(ca.value < 0.01 ? 4 : 3)}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </Box>
          );
        })()}

      {/* ── Kechikishlar ── */}
      {lastHeat?.delays?.length > 0 && (
        <Box sx={{ mb: 2 }}>
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.6rem",
              color: "#ffd60a",
              mb: 1,
              letterSpacing: "0.08em",
            }}
          >
            KECHIKISHLAR ({lastHeat.delays.length} ta)
          </Typography>
          {lastHeat.delays.map((d, i) => (
            <Box
              key={i}
              sx={{
                display: "flex",
                gap: 1,
                py: 0.5,
                borderBottom: "1px solid",
                borderColor: "divider",
                "&:last-child": { border: 0 },
              }}
            >
              <Box
                sx={{
                  width: 3,
                  background: "#ffd60a",
                  borderRadius: 1,
                  flexShrink: 0,
                }}
              />
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.58rem",
                  color: "#c8d8e8",
                  flex: 1,
                }}
              >
                {d.delayOperation}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.55rem",
                  color: "#6b7280",
                  flexShrink: 0,
                }}
              >
                {fmtDur(d.startTime, d.stopTime)}
              </Typography>
            </Box>
          ))}
        </Box>
      )}

      {/* ── Barcha heats ro'yxati ── */}
      <Typography
        sx={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: "0.6rem",
          color: "#6b7280",
          mb: 1,
          letterSpacing: "0.08em",
        }}
      >
        BUGUNGI BARCHA HEATS
      </Typography>
      <Box sx={{ overflow: "auto", maxHeight: 200 }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              {[
                "Heat",
                "Po'lat",
                "Boshlanish",
                "Davomiylik",
                "Chiqarish",
                "Elektr",
              ].map((h) => (
                <TableCell
                  key={h}
                  sx={{
                    py: 0.5,
                    background: isDark ? "#04060c" : "#f8fafc",
                    borderBottom: `1px solid ${c}25`,
                    whiteSpace: "nowrap",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.5rem",
                      color: "#6b7280",
                    }}
                  >
                    {h}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {heats.map((h) => (
              <TableRow
                key={h.heatId}
                sx={{ "&:hover": { background: `${c}08` } }}
              >
                <TableCell
                  sx={{
                    py: 0.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.6rem",
                      color: c,
                      fontWeight: 700,
                    }}
                  >
                    #{h.heatId}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    py: 0.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.58rem",
                      color: "#c8d8e8",
                    }}
                  >
                    {h.steelGradeName}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    py: 0.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.55rem",
                      color: "#9ca3af",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {fmtT(h.startTime)}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    py: 0.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.55rem",
                      color: "#9ca3af",
                    }}
                  >
                    {fmtDur(h.startTime, h.stopTime)}
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    py: 0.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.6rem",
                      color: "#00e676",
                      fontWeight: 700,
                    }}
                  >
                    {fmtN((h.tappingWeight || 0) / 1000, 2)} t
                  </Typography>
                </TableCell>
                <TableCell
                  sx={{
                    py: 0.5,
                    borderBottom: "1px solid",
                    borderColor: "divider",
                  }}
                >
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.58rem",
                      color: "#ffd60a",
                    }}
                  >
                    {fmtN((h.electricalEnergy || 0) / 1000, 1)} MWh
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Box>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  USKUNA DETAIL DRAWER
// ══════════════════════════════════════════════════════════════════════
function UskunaDetail({ uskuna, onClose }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [tab, setTab] = useState(0);
  if (!uskuna) return null;
  const c = TUR_COLOR[uskuna.tur] || "#00d4ff";
  const samColor =
    uskuna.samaradorlik > 80
      ? "#00e676"
      : uskuna.samaradorlik > 50
        ? "#ffd60a"
        : "#ff2d55";

  // SEX-07 uchunga EAF tab qo'shiladi
  const isSex07 = uskuna.sexId === "SEX-07";

  const tabs = [
    "🔧 Interaktiv Sxema",
    "📊 Ko'rsatkichlar",
    ...(isSex07 ? ["🔥 EAF Statistika"] : []),
    "📋 Tarix",
    "Kamera",
  ];
  // Tab indekslari
  const TAB_SXEMA = 0;
  const TAB_KORS = 1;
  const TAB_EAF = isSex07 ? 2 : -1;
  const TAB_TARIX = isSex07 ? 3 : 2;
  const TAB_KAMERA = isSex07 ? 4 : 3;

  return (
    <Box
      sx={{
        width: 740,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* HEADER */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          background: isDark ? `${c}08` : `${c}04`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <Box>
            <Box sx={{ display: "flex", gap: 1, mb: 0.5 }}>
              <Typography
                sx={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: "0.65rem",
                  color: c,
                  letterSpacing: "0.15em",
                }}
              >
                {uskuna.nom}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: "0.65rem",
                  color: "text.disabled",
                  letterSpacing: "0.1em",
                }}
              >
                {uskuna.model}
              </Typography>
              {isSex07 && (
                <Chip
                  label="SEX-07 · EAF"
                  size="small"
                  sx={{
                    height: 16,
                    fontSize: "0.48rem",
                    bgcolor: `${c}20`,
                    color: c,
                    fontFamily: "monospace",
                    ml: 0.5,
                  }}
                />
              )}
            </Box>
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1.05rem",
                color: "text.primary",
                mb: 0.5,
              }}
            >
              {uskuna.nom}
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: 1,
                flexWrap: "wrap",
                alignItems: "center",
              }}
            >
              <StatusChip holat={uskuna.holat} />
              <Chip
                label={uskuna.tur}
                size="small"
                sx={{
                  height: 20,
                  fontSize: "0.6rem",
                  fontFamily: "'Share Tech Mono',monospace",
                  bgcolor: `${c}18`,
                  color: c,
                  border: `1px solid ${c}40`,
                  borderRadius: "2px",
                  "& .MuiChip-label": { px: 0.8 },
                }}
              />
              {/* <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.6rem",
                  color: "text.secondary",
                }}
              >
                {uskuna.se} · {uskuna.uchastkId}
              </Typography> */}
            </Box>
          </Box>
          <IconButton
            size="small"
            onClick={onClose}
            sx={{ color: "text.secondary", "&:hover": { color: "error.main" } }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* TABS */}
      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          minHeight: 38,
          "& .MuiTabs-indicator": { bgcolor: c },
        }}
      >
        {tabs.map((t, i) => (
          <Tab
            key={i}
            label={t}
            sx={{
              fontSize: "0.6rem",
              minHeight: 38,
              fontFamily: "'Share Tech Mono',monospace",
              letterSpacing: "0.06em",
            }}
          />
        ))}
      </Tabs>

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {/* TAB 0 — INTERAKTIV SXEMA */}
        {tab === TAB_SXEMA && (
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                mb: 1.5,
                p: 1,
                background: isDark
                  ? "rgba(0,212,255,0.04)"
                  : "rgba(0,100,200,0.04)",
                border: "1px solid",
                borderColor: isDark
                  ? "rgba(0,212,255,0.15)"
                  : "rgba(0,100,200,0.12)",
                borderRadius: 1,
              }}
            >
              <InfoOutlinedIcon sx={{ fontSize: 14, color: "primary.main" }} />
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.62rem",
                  color: "primary.main",
                  letterSpacing: "0.06em",
                }}
              >
                Qism ustiga BOSING — nomi, tavsifi va joriy ko'rsatkichlari
                chiqadi
              </Typography>
            </Box>
            <Box
              sx={{
                background: isDark ? "rgba(4,6,14,0.95)" : "#f4f7fc",
                border: `1px solid ${c}30`,
                borderRadius: 1,
                position: "relative",
                overflow: "hidden",
                minHeight: 340,
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 8,
                  left: 8,
                  width: 16,
                  height: 16,
                  borderTop: `2px solid ${c}50`,
                  borderLeft: `2px solid ${c}50`,
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 8,
                  right: 8,
                  width: 16,
                  height: 16,
                  borderTop: `2px solid ${c}50`,
                  borderRight: `2px solid ${c}50`,
                },
              }}
            >
              <UskunaDiagram u={uskuna} isDark={isDark} />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  left: 8,
                  width: 16,
                  height: 16,
                  borderBottom: `2px solid ${c}50`,
                  borderLeft: `2px solid ${c}50`,
                }}
              />
              <Box
                sx={{
                  position: "absolute",
                  bottom: 8,
                  right: 8,
                  width: 16,
                  height: 16,
                  borderBottom: `2px solid ${c}50`,
                  borderRight: `2px solid ${c}50`,
                }}
              />
              <Typography
                sx={{
                  position: "absolute",
                  top: 6,
                  right: 14,
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.5rem",
                  color: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)",
                  letterSpacing: "0.1em",
                }}
              >
                PYVISION · {uskuna.id}
              </Typography>
            </Box>
          </Box>
        )}

        {/* TAB 1 — KO'RSATKICHLAR */}
        {tab === TAB_KORS && (
          <Box sx={{ p: 2 }}>
            <Box
              sx={{
                mb: 2,
                p: 1.5,
                background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mb: 0.8,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.6rem",
                    color: "text.secondary",
                    letterSpacing: "0.1em",
                  }}
                >
                  UMUMIY SAMARADORLIK
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    color: samColor,
                  }}
                >
                  {uskuna.samaradorlik}%
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={uskuna.samaradorlik}
                sx={{
                  height: 10,
                  borderRadius: 1,
                  "& .MuiLinearProgress-bar": {
                    background: `linear-gradient(90deg, ${samColor}aa, ${samColor})`,
                    borderRadius: 1,
                  },
                }}
              />
            </Box>
            <Grid container spacing={1}>
              {[
                {
                  l: "HARORAT",
                  v: `${uskuna.harorat}°C`,
                  c: uskuna.harorat > 1000 ? "#ff2d55" : "#ff6b1a",
                  icon: "🌡️",
                },
                {
                  l: "BOSIM",
                  v: `${uskuna.bosim} bar`,
                  c: "#00d4ff",
                  icon: "💨",
                },
                {
                  l: "QUVVAT",
                  v: `${uskuna.quvvat} kW`,
                  c: "#a78bfa",
                  icon: "⚡",
                },
                {
                  l: "ISH VAQTI",
                  v: `${uskuna.ishVaqti.toLocaleString()} soat`,
                  c: "#00e676",
                  icon: "⏱️",
                },
                {
                  l: "KEYINGI TA",
                  v: `${uskuna.keyingiTA} kun`,
                  c: uskuna.keyingiTA < 30 ? "#ffd60a" : "#6b7280",
                  icon: "🔧",
                },
                {
                  l: "ISHLAB CHIQILGAN",
                  v: uskuna.ishlab,
                  c: "#6b7280",
                  icon: "📅",
                },
              ].map((m) => (
                <Grid item xs={6} key={m.l}>
                  <Box
                    sx={{
                      background: isDark
                        ? "rgba(0,0,0,0.2)"
                        : "rgba(0,0,0,0.025)",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 1.2,
                    }}
                  >
                    <Typography sx={{ fontSize: "0.8rem", mb: 0.2 }}>
                      {m.icon}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        color: m.c,
                      }}
                    >
                      {m.v}
                    </Typography>
                    <Typography
                      sx={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: "0.5rem",
                        color: "text.disabled",
                        letterSpacing: "0.08em",
                        mt: 0.2,
                      }}
                    >
                      {m.l}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
            <Box
              sx={{
                mt: 1.5,
                p: 1.2,
                background:
                  uskuna.keyingiTA < 30
                    ? isDark
                      ? "rgba(255,214,10,0.06)"
                      : "rgba(255,214,10,0.04)"
                    : isDark
                      ? "rgba(0,212,255,0.04)"
                      : "rgba(0,100,200,0.03)",
                border: "1px solid",
                borderColor:
                  uskuna.keyingiTA < 30
                    ? "rgba(255,214,10,0.3)"
                    : "rgba(0,212,255,0.2)",
                borderRadius: 1,
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.65rem",
                  color:
                    uskuna.keyingiTA < 30 ? "warning.main" : "primary.main",
                }}
              >
                {uskuna.keyingiTA < 30
                  ? "⚠️ Texnik xizmat YAQINLASHDI"
                  : "✅ Texnik xizmat jadvalda"}{" "}
                — {uskuna.keyingiTA} kun qoldi
              </Typography>
            </Box>
          </Box>
        )}

        {/* TAB 2 — EAF STATISTIKA (faqat SEX-07) */}
        {isSex07 && tab === TAB_EAF && (
          <EAFStatsTab uskuna={uskuna} c={c} isDark={isDark} />
        )}

        {/* TARIX TAB */}
        {tab === TAB_TARIX && (
          <Box sx={{ p: 2 }}>
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.62rem",
                color: "text.secondary",
                mb: 1.5,
                letterSpacing: "0.1em",
              }}
            >
              TEXNIK TARIX VA VOQEALAR
            </Typography>
            {[
              {
                t: "2 soat oldin",
                e: "Avtomatik diagnostika o'tkazildi",
                c: "#00d4ff",
                i: "🔍",
                ok: true,
              },
              {
                t: "8 soat oldin",
                e: "Smena almashinuvi va topshiriq",
                c: "#6b7280",
                i: "👷",
                ok: true,
              },
              {
                t: "1 kun oldin",
                e: "Yog'lash va tozalash ishlari",
                c: "#00e676",
                i: "🔧",
                ok: true,
              },
              {
                t: "3 kun oldin",
                e: "Ko'rsatkichlar norma doirasida",
                c: "#00e676",
                i: "✅",
                ok: true,
              },
              {
                t: "5 kun oldin",
                e: "Harorat ogohlantirish chegarasida",
                c: "#ffd60a",
                i: "⚠️",
                ok: false,
              },
              {
                t: "7 kun oldin",
                e: "Salnik almashtrildi va silinov",
                c: "#00d4ff",
                i: "🔩",
                ok: true,
              },
              {
                t: "12 kun oldin",
                e: "Rejalashtirilgan texnik xizmat",
                c: "#a78bfa",
                i: "📋",
                ok: true,
              },
              {
                t: `${uskuna.ishlab} yil`,
                e: "Uskuna ishga tushirildi",
                c: c,
                i: "🏭",
                ok: true,
              },
            ].map((log, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  py: 0.9,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  "&:last-child": { borderBottom: "none" },
                }}
              >
                <Box
                  sx={{
                    width: 3,
                    background: log.c,
                    borderRadius: 1,
                    flexShrink: 0,
                    alignSelf: "stretch",
                    minHeight: 28,
                  }}
                />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    sx={{
                      fontSize: "0.78rem",
                      color: "text.primary",
                      mb: 0.15,
                    }}
                  >
                    {log.i} {log.e}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.58rem",
                      color: "text.secondary",
                    }}
                  >
                    {log.t}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: 8,
                    height: 8,
                    borderRadius: "50%",
                    background: log.ok ? "#00e676" : "#ffd60a",
                    alignSelf: "center",
                    flexShrink: 0,
                  }}
                />
              </Box>
            ))}
          </Box>
        )}
        {/* kamera */}
        {tab === TAB_KAMERA && (
          <Box sx={{ marginTop: "20px" }}>
            <CameraFeed cam={{ channel: 2 }} />
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  USKUNA KARTA (grid ko'rinish)
// ══════════════════════════════════════════════════════════════════════
function UskunaCard({ u, onClick }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const c = TUR_COLOR[u.tur] || "#6b7280";
  const samColor =
    u.samaradorlik > 80
      ? "#00e676"
      : u.samaradorlik > 50
        ? "#ffd60a"
        : "#ff2d55";
  const borderC =
    u.holat === "xato"
      ? "#ff2d5555"
      : u.holat === "ogohlantirish"
        ? "#ffd60a44"
        : "divider";

  return (
    <Box
      onClick={() => onClick(u)}
      sx={{
        background: isDark ? "#0d1220" : "#fff",
        border: "1px solid",
        borderColor: borderC,
        borderTop: `2px solid ${c}`,
        borderRadius: 1,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.22s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 28px ${c}22`,
          borderColor: `${c}55`,
        },
      }}
    >
      {/* SVG MINI PREVIEW */}
      <Box
        sx={{
          height: 110,
          background: isDark ? `${c}06` : `${c}04`,
          borderBottom: "1px solid",
          borderColor: `${c}20`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            transform: "scale(0.38)",
            transformOrigin: "top center",
            height: "265%",
            pointerEvents: "none",
            opacity: 0.85,
          }}
        >
          <UskunaDiagram u={u} isDark={isDark} />
        </Box>
        {/* overlay gradient */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? `linear-gradient(to bottom, transparent 60%, #0d1220 100%)`
              : `linear-gradient(to bottom, transparent 60%, #fff 100%)`,
          }}
        />
        {/* badges */}
        {/* <Box
          sx={{
            position: "absolute",
            top: 6,
            left: 6,
            bgcolor: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.8)",
            border: `1px solid ${c}40`,
            borderRadius: 0.5,
            px: 0.7,
            py: 0.2,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.55rem",
              color: c,
            }}
          >
            {u.id}
          </Typography>
        </Box> */}
        <Box sx={{ position: "absolute", top: 6, right: 6 }}>
          <StatusChip holat={u.holat} />
        </Box>
      </Box>

      {/* INFO */}
      <Box sx={{ p: 1.3 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.82rem",
            color: "text.primary",
            mb: 0.4,
          }}
        >
          {u.nom}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, mb: 0.9 }}>
          <Chip
            label={u.tur}
            size="small"
            sx={{
              height: 18,
              fontSize: "0.55rem",
              fontFamily: "'Share Tech Mono',monospace",
              bgcolor: `${c}14`,
              color: c,
              border: `1px solid ${c}30`,
              borderRadius: "2px",
              "& .MuiChip-label": { px: 0.7 },
            }}
          />
          {/* <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.58rem",
              color: "text.secondary",
              alignSelf: "center",
            }}
          >
            {u.sexId}
          </Typography> */}
        </Box>
        <Grid container spacing={0.5} sx={{ mb: 0.9 }}>
          {[
            {
              l: "°C",
              v: u.harorat,
              c2: u.harorat > 1000 ? "#ff2d55" : "#ff6b1a",
            },
            { l: "bar", v: u.bosim, c2: "#00d4ff" },
            { l: "kW", v: u.quvvat, c2: "#a78bfa" },
          ].map((s) => (
            <Grid item xs={4} key={s.l}>
              <Box
                sx={{
                  textAlign: "center",
                  background: isDark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.025)",
                  borderRadius: 0.5,
                  py: 0.4,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: s.c2,
                  }}
                >
                  {s.v}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.44rem",
                    color: "text.disabled",
                  }}
                >
                  {s.l}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={u.samaradorlik}
            sx={{
              flex: 1,
              height: 4,
              "& .MuiLinearProgress-bar": { background: samColor },
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.62rem",
              color: samColor,
              minWidth: 32,
            }}
          >
            {u.samaradorlik}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

// ══════════════════════════════════════════════════════════════════════
//  ASOSIY SAHIFA
// ══════════════════════════════════════════════════════════════════════
export default function Uskunalar() {
  const dispatch = useDispatch();
  // const selectedUchastka = useSelector((state) => state.ui.selectedUchastka);
  const selectedSex = useSelector((state) => state.ui.selectedSex);
  const filter = useSelector((s) => s.uskunalar.filter);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedUsk, setSelectedUsk] = useState(null);
  const [view, setView] = useState(0);

  const { data: sexlar } = useQuery({
    queryKey: ["sexlar"],
    queryFn: getSexlar,
  });
  const { data, isLoading } = useQuery({
    queryKey: ["uskunalar", filter],
    queryFn: () => getUskunalar({ sexId: filter.sexId || undefined }),
  });
  const uskunalar = data?.data || [];
  const sx = sexlar?.data || [];
  let filtered = filter.holat
    ? uskunalar.filter((u) => u.holat === filter.holat)
    : uskunalar;

  filtered = filter.uchastkId
    ? uskunalar.filter((u) => u.uchastkId === filter.uchastkId)
    : uskunalar;

  const handleOpen = (u) => {
    setSelectedUsk(u);
    setDrawerOpen(true);
    dispatch(setUskunaSelected(u.id));
  };

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 90,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.68rem",
            color: "primary.main",
          }}
        >
          {p.value}
        </Typography>
      ),
    },
    {
      field: "nom",
      headerName: "NOMI",
      flex: 1,
      renderCell: (p) => (
        <Typography sx={{ fontWeight: 600, fontSize: "0.84rem" }}>
          {p.value}
        </Typography>
      ),
    },
    {
      field: "tur",
      headerName: "TURI",
      width: 110,
      renderCell: (p) => (
        <Chip
          label={p.value}
          size="small"
          sx={{
            height: 20,
            fontSize: "0.58rem",
            fontFamily: "'Share Tech Mono',monospace",
            bgcolor: `${TUR_COLOR[p.value] || "#6b7280"}18`,
            color: TUR_COLOR[p.value] || "#6b7280",
            borderRadius: "2px",
            "& .MuiChip-label": { px: 0.8 },
          }}
        />
      ),
    },
    // {
    //   field: "sexId",
    //   headerName: "BO'LINMA",
    //   width: 80,
    //   renderCell: (p) => (
    //     <Typography
    //       sx={{
    //         fontFamily: "'Share Tech Mono',monospace",
    //         fontSize: "0.68rem",
    //         color: "secondary.main",
    //       }}
    //     >
    //       {p.value}
    //     </Typography>
    //   ),
    // },
    {
      field: "holat",
      headerName: "HOLAT",
      width: 130,
      renderCell: (p) => <StatusChip holat={p.value} />,
    },
    {
      field: "samaradorlik",
      headerName: "SAMARADORLIK",
      width: 155,
      renderCell: (p) => (
        <Box
          sx={{ display: "flex", alignItems: "center", gap: 1, width: "100%" }}
        >
          <LinearProgress
            variant="determinate"
            value={p.value}
            sx={{
              flex: 1,
              "& .MuiLinearProgress-bar": {
                background:
                  p.value > 80
                    ? "#00e676"
                    : p.value > 50
                      ? "#ffd60a"
                      : "#ff2d55",
              },
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.65rem",
              minWidth: 32,
            }}
          >
            {p.value}%
          </Typography>
        </Box>
      ),
    },
    {
      field: "harorat",
      headerName: "HARORAT",
      width: 100,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.7rem",
            color: p.value > 1000 ? "error.main" : "text.primary",
          }}
        >
          {p.value}°C
        </Typography>
      ),
    },
    {
      field: "keyingiTA",
      headerName: "KEYINGI TA",
      width: 110,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.7rem",
            color: p.value < 30 ? "warning.main" : "text.secondary",
          }}
        >
          {p.value} kun
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'Orbitron',monospace",
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "text.primary",
            }}
          >
            USKUNALAR
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.65rem",
              color: "text.secondary",
            }}
          >
            {filtered.length} ta uskuna · Interaktiv anatomik sxemalar · Qismini
            bosib ma'lumot oling
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          <FormControl size="small" sx={{ minWidth: 148 }}>
            <InputLabel>SEX</InputLabel>
            <Select
              value={selectedSex?.id || filter.sexId || ""}
              onChange={(e) =>
                dispatch(setUskunaFilter({ sexId: e.target.value }))
              }
              label="BO'LINMA"
            >
              <MenuItem value="">Barchasi</MenuItem>
              {sx.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.nom}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel>HOLAT</InputLabel>
            <Select
              value={filter.holat || ""}
              onChange={(e) =>
                dispatch(setUskunaFilter({ holat: e.target.value }))
              }
              label="HOLAT"
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

      {/* STATS */}
      <Grid container spacing={1.5}>
        {[
          { l: "JAMI", v: uskunalar.length, c: "primary.main" },
          {
            l: "FAOL",
            v: uskunalar.filter((u) => u.holat === "faol").length,
            c: "success.main",
          },
          {
            l: "OGOHLANTIRISH",
            v: uskunalar.filter((u) => u.holat === "ogohlantirish").length,
            c: "warning.main",
          },
          {
            l: "XATO",
            v: uskunalar.filter((u) => u.holat === "xato").length,
            c: "error.main",
          },
          {
            l: "O'RT. SAMARADORLIK",
            v: `${Math.round(uskunalar.reduce((s, u) => s + u.samaradorlik, 0) / (uskunalar.length || 1))}%`,
            c: "secondary.main",
          },
        ].map((s) => (
          <Grid item xs={6} sm={2.4} key={s.l}>
            <Paper sx={{ p: 1.5, textAlign: "center" }}>
              <Typography
                sx={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: s.c,
                }}
              >
                {s.v}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.55rem",
                  color: "text.secondary",
                  letterSpacing: "0.08em",
                }}
              >
                {s.l}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* VIEW TABS */}
      <Paper sx={{ p: 0 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "divider",
            px: 2,
          }}
        >
          <Tabs
            value={view}
            onChange={(_, v) => setView(v)}
            sx={{
              minHeight: 42,
              "& .MuiTabs-indicator": { bgcolor: "primary.main" },
            }}
          >
            <Tab
              label="Karta ko'rinish"
              sx={{ fontSize: "0.65rem", minHeight: 42 }}
            />
            <Tab
              label="Jadval ko'rinish"
              sx={{ fontSize: "0.65rem", minHeight: 42 }}
            />
          </Tabs>
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.62rem",
              color: "text.secondary",
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
          <Box sx={{ height: 520 }}>
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
                sx={{ border: "none", cursor: "pointer" }}
              />
            )}
          </Box>
        )}
      </Paper>

      {/* DETAIL DRAWER */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{
          sx: {
            background: isDark ? "#080c18" : "#f6f9fc",
            border: "none",
            borderLeft: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <UskunaDetail
          uskuna={selectedUsk}
          onClose={() => setDrawerOpen(false)}
        />
      </Drawer>
    </Box>
  );
}

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
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { getUskunalar, getSexlar } from "@/api";
import { StatusChip, SectionHeader, CardSkeleton } from "@/components/common";
import { setUskunaFilter, setUskunaSelected } from "@/store";
import { DataGrid } from "@mui/x-data-grid";

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

// ──────────────────────────────────────────────────────────────────────
// Tur bo'yicha diagram tanlash
// ──────────────────────────────────────────────────────────────────────
function UskunaDiagram({ u, isDark }) {
  const map = {
    Pech: <DomnaPechiDiagram u={u} isDark={isDark} />,
    Konverter: <KonverterDiagram u={u} isDark={isDark} />,
    "Elektr Pech": <ElektrPechDiagram u={u} isDark={isDark} />,
    Prokat: <ProkatDiagram u={u} isDark={isDark} />,
    Nasos: <NasosDiagram u={u} isDark={isDark} />,
    Kran: <KranDiagram u={u} isDark={isDark} />,
  };
  return (
    map[u.tur] || (
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
        }}
      >
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.75rem",
            color: "text.disabled",
          }}
        >
          {u.tur} — SXEMA YO'Q
        </Typography>
      </Box>
    )
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

  return (
    <Box
      sx={{
        width: 540,
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
                {uskuna.id}
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
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.6rem",
                  color: "text.secondary",
                }}
              >
                {uskuna.sexId} · {uskuna.uchastkId}
              </Typography>
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
        {["🔧 Interaktiv Sxema", "📊 Ko'rsatkichlar", "📋 Tarix"].map(
          (t, i) => (
            <Tab
              key={i}
              label={t}
              sx={{
                fontSize: "0.65rem",
                minHeight: 38,
                fontFamily: "'Share Tech Mono',monospace",
                letterSpacing: "0.06em",
              }}
            />
          ),
        )}
      </Tabs>

      <Box sx={{ flex: 1, overflow: "auto" }}>
        {/* TAB 0 — INTERAKTIV SXEMA */}
        {tab === 0 && (
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
            {/* SVG RASM MAYDONI */}
            <Box
              sx={{
                background: isDark ? "rgba(4,6,14,0.95)" : "#f4f7fc",
                border: `1px solid ${c}30`,
                borderRadius: 1,
                position: "relative",
                overflow: "hidden",
                minHeight: 340,
                // corner brackets
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
              {/* bottom corners */}
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
              {/* watermark */}
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
        {tab === 1 && (
          <Box sx={{ p: 2 }}>
            {/* samaradorlik */}
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

        {/* TAB 2 — TARIX */}
        {tab === 2 && (
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
        <Box
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
        </Box>
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
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.58rem",
              color: "text.secondary",
              alignSelf: "center",
            }}
          >
            {u.sexId}
          </Typography>
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
  console.log(filtered);

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
    {
      field: "sexId",
      headerName: "SEX",
      width: 80,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.68rem",
            color: "secondary.main",
          }}
        >
          {p.value}
        </Typography>
      ),
    },
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
              value={selectedSex.id || filter.sexId || ""}
              onChange={(e) =>
                dispatch(setUskunaFilter({ sexId: e.target.value }))
              }
              label="SEX"
            >
              <MenuItem value="">Barchasi</MenuItem>
              {sx.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {s.id}
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

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Grid,
  Paper,
  Typography,
  LinearProgress,
  Divider,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  useTheme,
} from "@mui/material";
import { getSexlar, getUchastkalar, getUskunalar } from "@/api";
import {
  StatusChip,
  SectionHeader,
  StatBox,
  CardSkeleton,
} from "@/components/common";
import { setSelectedSex } from "@/store";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

// ─── SVG ILLUSTRATSIYALAR ───────────────────────────────────────────
const SexSVG = {
  "SEX-01": ({ color = "#ff6b1a", pulse = false }) => (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Domna pechi */}
      <rect
        x="40"
        y="30"
        width="40"
        height="45"
        rx="4"
        fill={color}
        opacity="0.15"
        stroke={color}
        strokeWidth="1.5"
      />
      <path
        d="M45 30 Q60 10 75 30"
        fill={color}
        opacity="0.2"
        stroke={color}
        strokeWidth="1.5"
      />
      <rect
        x="52"
        y="60"
        width="6"
        height="15"
        rx="2"
        fill={color}
        opacity="0.5"
      />
      <rect
        x="62"
        y="60"
        width="6"
        height="15"
        rx="2"
        fill={color}
        opacity="0.5"
      />
      {/* Olov */}
      <path
        d="M55 35 Q58 28 60 32 Q62 26 65 30 Q67 24 60 20 Q53 24 55 35Z"
        fill="#ff2d55"
        opacity="0.7"
      >
        {pulse && (
          <animate
            attributeName="opacity"
            values="0.7;0.4;0.7"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </path>
      {/* Tutun */}
      <circle cx="50" cy="14" r="4" fill={color} opacity="0.12" />
      <circle cx="60" cy="8" r="5" fill={color} opacity="0.08" />
      <circle cx="70" cy="12" r="3" fill={color} opacity="0.1" />
      {/* Quvur */}
      <rect
        x="20"
        y="45"
        width="20"
        height="6"
        rx="3"
        fill={color}
        opacity="0.3"
      />
      <rect
        x="80"
        y="50"
        width="20"
        height="6"
        rx="3"
        fill={color}
        opacity="0.3"
      />
      {/* Taglik */}
      <rect
        x="35"
        y="75"
        width="50"
        height="3"
        rx="1.5"
        fill={color}
        opacity="0.25"
      />
    </svg>
  ),

  "SEX-02": ({ color = "#00d4ff", pulse = false }) => (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Konverter silindr */}
      <ellipse
        cx="60"
        cy="28"
        rx="22"
        ry="10"
        fill={color}
        opacity="0.15"
        stroke={color}
        strokeWidth="1.5"
      />
      <rect
        x="38"
        y="28"
        width="44"
        height="38"
        fill={color}
        opacity="0.1"
        stroke={color}
        strokeWidth="1.5"
      />
      <ellipse
        cx="60"
        cy="66"
        rx="22"
        ry="8"
        fill={color}
        opacity="0.15"
        stroke={color}
        strokeWidth="1.2"
      />
      {/* Lance quvur */}
      <rect
        x="57"
        y="5"
        width="6"
        height="30"
        rx="3"
        fill={color}
        opacity="0.5"
      />
      <circle cx="60" cy="7" r="4" fill={color} opacity="0.3" />
      {/* Qizil po'lat chiqishi */}
      <path d="M82 50 Q95 48 100 52 Q98 56 82 56Z" fill="#ff6b1a" opacity="0.5">
        {pulse && (
          <animate
            attributeName="d"
            values="M82 50 Q95 48 100 52 Q98 56 82 56Z;M82 50 Q96 47 102 51 Q100 57 82 56Z;M82 50 Q95 48 100 52 Q98 56 82 56Z"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </path>
      {/* Oksigen trubkasi */}
      <path
        d="M20 20 Q30 30 38 35"
        stroke={color}
        strokeWidth="2"
        strokeDasharray="4,3"
        opacity="0.4"
      />
      {/* O'lchov asbob */}
      <rect
        x="25"
        y="40"
        width="8"
        height="12"
        rx="2"
        fill={color}
        opacity="0.2"
        stroke={color}
        strokeWidth="1"
      />
      <rect
        x="87"
        y="35"
        width="8"
        height="12"
        rx="2"
        fill={color}
        opacity="0.2"
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  ),

  "SEX-03": ({ color = "#a78bfa", pulse = false }) => (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Elektr pech korpus */}
      <rect
        x="30"
        y="25"
        width="60"
        height="50"
        rx="5"
        fill={color}
        opacity="0.12"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Elektrodlar */}
      <rect
        x="45"
        y="10"
        width="5"
        height="30"
        rx="2.5"
        fill={color}
        opacity="0.5"
      />
      <rect
        x="57"
        y="8"
        width="5"
        height="32"
        rx="2.5"
        fill={color}
        opacity="0.6"
      />
      <rect
        x="69"
        y="10"
        width="5"
        height="30"
        rx="2.5"
        fill={color}
        opacity="0.5"
      />
      {/* Uchqun */}
      <circle cx="47" cy="40" r="3" fill="#ffd60a" opacity="0.8">
        {pulse && (
          <animate
            attributeName="opacity"
            values="0.8;0.2;0.8"
            dur="0.8s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle cx="59" cy="38" r="4" fill="#ffd60a" opacity="0.9">
        {pulse && (
          <animate
            attributeName="opacity"
            values="0.9;0.1;0.9"
            dur="0.6s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      <circle cx="71" cy="40" r="3" fill="#ffd60a" opacity="0.8">
        {pulse && (
          <animate
            attributeName="opacity"
            values="0.8;0.3;0.8"
            dur="1s"
            repeatCount="indefinite"
          />
        )}
      </circle>
      {/* Tok kabellari */}
      <path
        d="M15 15 Q25 20 30 30"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
        strokeLinecap="round"
      />
      <path
        d="M105 15 Q95 20 90 30"
        stroke={color}
        strokeWidth="2"
        opacity="0.3"
        strokeLinecap="round"
      />
      {/* Chiqindi */}
      <rect
        x="30"
        y="65"
        width="14"
        height="10"
        rx="2"
        fill={color}
        opacity="0.2"
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  ),

  "SEX-04": ({ color = "#00ff9d", pulse = false }) => (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Prokatka rolikları */}
      {[20, 38, 56, 74, 92].map((x, i) => (
        <g key={i}>
          <rect
            x={x}
            y="30"
            width="10"
            height="24"
            rx="5"
            fill={color}
            opacity="0.3"
            stroke={color}
            strokeWidth="1.2"
          />
          <circle cx={x + 5} cy="42" r="4" fill={color} opacity="0.5">
            {pulse && (
              <animateTransform
                attributeName="transform"
                type="rotate"
                from={`0 ${x + 5} 42`}
                to={`360 ${x + 5} 42`}
                dur={`${1 + i * 0.1}s`}
                repeatCount="indefinite"
              />
            )}
          </circle>
        </g>
      ))}
      {/* Metall tasmasi */}
      <rect
        x="10"
        y="40"
        width="100"
        height="6"
        rx="3"
        fill={color}
        opacity="0.2"
      />
      <rect
        x="10"
        y="40"
        width="60"
        height="6"
        rx="3"
        fill={color}
        opacity="0.4"
      >
        {pulse && (
          <animate
            attributeName="width"
            values="60;80;60"
            dur="1.5s"
            repeatCount="indefinite"
          />
        )}
      </rect>
      {/* Krепеж */}
      <rect
        x="10"
        y="20"
        width="100"
        height="8"
        rx="2"
        fill={color}
        opacity="0.1"
        stroke={color}
        strokeWidth="1"
      />
      <rect
        x="10"
        y="58"
        width="100"
        height="8"
        rx="2"
        fill={color}
        opacity="0.1"
        stroke={color}
        strokeWidth="1"
      />
      {/* Temperatura sensori */}
      <circle
        cx="15"
        cy="55"
        r="5"
        fill="#ff6b1a"
        opacity="0.4"
        stroke="#ff6b1a"
        strokeWidth="1"
      />
    </svg>
  ),

  "SEX-05": ({ color = "#ff2d55", pulse = false }) => (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Quyish krychagi */}
      <path
        d="M20 20 L50 20 L55 35 L65 35 L70 20 L100 20"
        stroke={color}
        strokeWidth="2.5"
        opacity="0.4"
        strokeLinecap="round"
      />
      <rect
        x="45"
        y="35"
        width="30"
        height="20"
        rx="3"
        fill={color}
        opacity="0.15"
        stroke={color}
        strokeWidth="1.5"
      />
      {/* Kran */}
      <rect
        x="55"
        y="5"
        width="10"
        height="30"
        rx="5"
        fill={color}
        opacity="0.3"
        stroke={color}
        strokeWidth="1.2"
      />
      {/* Eritilgan metall (nosoz holatda qizil) */}
      <path d="M48 52 Q60 65 72 52" fill={color} opacity="0.35">
        {pulse && (
          <animate
            attributeName="opacity"
            values="0.35;0.1;0.35"
            dur="2s"
            repeatCount="indefinite"
          />
        )}
      </path>
      {/* Xato belgisi */}
      <circle
        cx="95"
        cy="20"
        r="10"
        fill="#ff2d55"
        opacity="0.15"
        stroke="#ff2d55"
        strokeWidth="1.5"
      />
      <path
        d="M90 15 L100 25 M100 15 L90 25"
        stroke="#ff2d55"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.7"
      />
      {/* Qoliplar */}
      <rect
        x="15"
        y="55"
        width="16"
        height="20"
        rx="2"
        fill={color}
        opacity="0.1"
        stroke={color}
        strokeWidth="1"
      />
      <rect
        x="35"
        y="58"
        width="16"
        height="17"
        rx="2"
        fill={color}
        opacity="0.1"
        stroke={color}
        strokeWidth="1"
      />
    </svg>
  ),

  "SEX-06": ({ color = "#6b7280", pulse = false }) => (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      {/* Dastgoh */}
      <rect
        x="25"
        y="20"
        width="70"
        height="45"
        rx="4"
        fill={color}
        opacity="0.08"
        stroke={color}
        strokeWidth="1.5"
        strokeDasharray="5,3"
      />
      {/* Tokar dastgohi */}
      <rect
        x="35"
        y="30"
        width="50"
        height="20"
        rx="3"
        fill={color}
        opacity="0.12"
        stroke={color}
        strokeWidth="1"
      />
      <circle
        cx="50"
        cy="40"
        r="8"
        fill={color}
        opacity="0.15"
        stroke={color}
        strokeWidth="1.2"
      />
      <circle cx="50" cy="40" r="4" fill={color} opacity="0.2" />
      <circle
        cx="80"
        cy="40"
        r="5"
        fill={color}
        opacity="0.15"
        stroke={color}
        strokeWidth="1"
      />
      {/* Kalit/asbob */}
      <path d="M65 30 L75 20 L80 25 L70 35Z" fill={color} opacity="0.25" />
      {/* To'xtatilgan belgisi */}
      <rect
        x="90"
        y="12"
        width="18"
        height="18"
        rx="4"
        fill={color}
        opacity="0.12"
        stroke={color}
        strokeWidth="1.2"
      />
      <rect
        x="95"
        y="17"
        width="8"
        height="8"
        rx="1"
        fill={color}
        opacity="0.4"
      />
      {/* Taglik */}
      <rect
        x="25"
        y="65"
        width="70"
        height="4"
        rx="2"
        fill={color}
        opacity="0.2"
      />
    </svg>
  ),
  "SEX-07": ({ pulse = false }) => (
    <svg
      viewBox="0 0 120 80"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ width: "100%", height: "100%" }}
    >
      <defs>
        {/* Korpus metall gradyenti */}
        <linearGradient
          id="korpus"
          x1="8"
          y1="22"
          x2="96"
          y2="68"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4a5568" />
          <stop offset="40%" stopColor="#2d3748" />
          <stop offset="100%" stopColor="#1a202c" />
        </linearGradient>
        {/* Chap rulon (po'lat) */}
        <linearGradient
          id="rulon_l"
          x1="17"
          y1="36"
          x2="29"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#718096" />
          <stop offset="30%" stopColor="#e2e8f0" />
          <stop offset="60%" stopColor="#a0aec0" />
          <stop offset="100%" stopColor="#4a5568" />
        </linearGradient>
        {/* O'ng rulon (po'lat) */}
        <linearGradient
          id="rulon_r"
          x1="75"
          y1="36"
          x2="87"
          y2="36"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#718096" />
          <stop offset="30%" stopColor="#e2e8f0" />
          <stop offset="60%" stopColor="#a0aec0" />
          <stop offset="100%" stopColor="#4a5568" />
        </linearGradient>
        {/* Yuqori bosim silindr (sariq po'lat) */}
        <linearGradient
          id="bosim_t"
          x1="44"
          y1="33"
          x2="60"
          y2="33"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#744210" />
          <stop offset="35%" stopColor="#f6c34b" />
          <stop offset="65%" stopColor="#d69e2e" />
          <stop offset="100%" stopColor="#744210" />
        </linearGradient>
        {/* Pastki bosim silindr */}
        <linearGradient
          id="bosim_b"
          x1="44"
          y1="47"
          x2="60"
          y2="47"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#744210" />
          <stop offset="35%" stopColor="#f6c34b" />
          <stop offset="65%" stopColor="#d69e2e" />
          <stop offset="100%" stopColor="#744210" />
        </linearGradient>
        {/* Nazorat paneli (ko'k) */}
        <linearGradient
          id="panel"
          x1="96"
          y1="10"
          x2="116"
          y2="38"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#2b4299" />
          <stop offset="100%" stopColor="#1a2a6c" />
        </linearGradient>
        {/* Taglik */}
        <linearGradient
          id="taglik"
          x1="8"
          y1="68"
          x2="96"
          y2="72"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#4a5568" />
          <stop offset="50%" stopColor="#718096" />
          <stop offset="100%" stopColor="#4a5568" />
        </linearGradient>
        {/* List lenta (qizil) */}
        <linearGradient
          id="list_grad"
          x1="29"
          y1="40"
          x2="75"
          y2="46"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0%" stopColor="#c0392b" />
          <stop offset="50%" stopColor="#e74c3c" />
          <stop offset="100%" stopColor="#c0392b" />
        </linearGradient>
        {/* Strelka */}
        <marker
          id="arr07c"
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

      {/* Asosiy korpus */}
      <rect
        x="8"
        y="22"
        width="88"
        height="46"
        rx="4"
        fill="url(#korpus)"
        stroke="#718096"
        strokeWidth="0.8"
      />
      <rect
        x="9"
        y="22.5"
        width="86"
        height="1.5"
        rx="1"
        fill="#718096"
        opacity="0.5"
      />

      {/* Chap rulon bloki */}
      <rect
        x="13"
        y="30"
        width="20"
        height="30"
        rx="3"
        fill="#2d3748"
        stroke="#4a5568"
        strokeWidth="0.6"
      />
      <ellipse
        cx="23"
        cy="45"
        rx="7"
        ry="10"
        fill="url(#rulon_l)"
        stroke="#a0aec0"
        strokeWidth="0.5"
      />
      <line
        x1="23"
        y1="35.2"
        x2="23"
        y2="54.8"
        stroke="#4a5568"
        strokeWidth="0.6"
        opacity="0.7"
      />
      <ellipse
        cx="23"
        cy="45"
        rx="2"
        ry="2.8"
        fill="#2d3748"
        stroke="#718096"
        strokeWidth="0.5"
      />
      <circle cx="23" cy="45" r="1" fill="#e2e8f0" />

      {/* O'ng rulon bloki */}
      <rect
        x="71"
        y="30"
        width="20"
        height="30"
        rx="3"
        fill="#2d3748"
        stroke="#4a5568"
        strokeWidth="0.6"
      />
      <ellipse
        cx="81"
        cy="45"
        rx="7"
        ry="10"
        fill="url(#rulon_r)"
        stroke="#a0aec0"
        strokeWidth="0.5"
      />
      <line
        x1="81"
        y1="35.2"
        x2="81"
        y2="54.8"
        stroke="#4a5568"
        strokeWidth="0.6"
        opacity="0.7"
      />
      <ellipse
        cx="81"
        cy="45"
        rx="2"
        ry="2.8"
        fill="#2d3748"
        stroke="#718096"
        strokeWidth="0.5"
      />
      <circle cx="81" cy="45" r="1" fill="#e2e8f0" />

      {/* List lenta */}
      <path
        d="M30 43.5 Q41 40.5 52 43.5 Q63 46.5 74 43.5"
        stroke="url(#list_grad)"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <path
        d="M30 43.5 Q41 40.5 52 43.5 Q63 46.5 74 43.5"
        stroke="#ff6b6b"
        strokeWidth="1"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M30 46 Q41 43 52 46 Q63 49 74 46"
        stroke="#922b21"
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.7"
      />

      {/* Yuqori bosim silindr */}
      <ellipse
        cx="52"
        cy="37"
        rx="9"
        ry="5.5"
        fill="url(#bosim_t)"
        stroke="#b7791f"
        strokeWidth="0.8"
      />
      <ellipse cx="52" cy="37" rx="3.5" ry="2" fill="#744210" opacity="0.6" />

      {/* Pastki bosim silindr */}
      <ellipse
        cx="52"
        cy="53"
        rx="9"
        ry="5.5"
        fill="url(#bosim_b)"
        stroke="#b7791f"
        strokeWidth="0.8"
      />
      <ellipse cx="52" cy="53" rx="3.5" ry="2" fill="#744210" opacity="0.6" />

      {/* Shatun */}
      <rect
        x="50"
        y="42"
        width="4"
        height="11"
        rx="1"
        fill="#4a5568"
        stroke="#718096"
        strokeWidth="0.5"
      />

      {/* Nazorat paneli */}
      <rect
        x="96"
        y="9"
        width="20"
        height="30"
        rx="3"
        fill="url(#panel)"
        stroke="#4299e1"
        strokeWidth="0.8"
      />
      <rect
        x="97"
        y="9.5"
        width="18"
        height="1"
        rx="0.5"
        fill="#63b3ed"
        opacity="0.5"
      />
      <circle
        cx="106"
        cy="16"
        r="3"
        fill="#38a169"
        stroke="#276749"
        strokeWidth="0.5"
      />
      <circle cx="106" cy="16" r="1.5" fill="#68d391" opacity="0.8" />
      <circle
        cx="106"
        cy="24"
        r="2.5"
        fill="#e53e3e"
        stroke="#9b2c2c"
        strokeWidth="0.5"
      />
      <circle cx="106" cy="24" r="1.2" fill="#fc8181" opacity="0.7" />
      <rect
        x="99"
        y="30"
        width="14"
        height="3"
        rx="1.5"
        fill="#2c5282"
        stroke="#4299e1"
        strokeWidth="0.4"
      />
      <rect
        x="103"
        y="29.5"
        width="4"
        height="4"
        rx="1"
        fill="#90cdf4"
        stroke="#4299e1"
        strokeWidth="0.4"
      />

      {/* Tezlik o'zgartgich */}
      <path
        d="M91 40 L100 36 L100 44 Z"
        fill="#f6c34b"
        stroke="#b7791f"
        strokeWidth="0.5"
      />

      {/* Kirish/chiqish strelkalar */}
      <path
        d="M1 45 L11 45"
        stroke="#e2e8f0"
        strokeWidth="1.2"
        strokeLinecap="round"
        markerEnd="url(#arr07c)"
      />
      <text x="1" y="42" fontSize="3.5" fill="#a0aec0" fontFamily="monospace">
        IN
      </text>
      <path
        d="M93 45 L104 45"
        stroke="#e2e8f0"
        strokeWidth="1.2"
        strokeLinecap="round"
        markerEnd="url(#arr07c)"
      />
      <text x="95" y="42" fontSize="3.5" fill="#a0aec0" fontFamily="monospace">
        OUT
      </text>

      {/* Taglik va oyoqlar */}
      <rect
        x="8"
        y="68"
        width="88"
        height="5"
        rx="2"
        fill="url(#taglik)"
        stroke="#4a5568"
        strokeWidth="0.6"
      />
      <rect
        x="14"
        y="73"
        width="6"
        height="7"
        rx="1.5"
        fill="#2d3748"
        stroke="#4a5568"
        strokeWidth="0.5"
      />
      <rect x="24" y="75" width="4" height="5" rx="1" fill="#4a5568" />
      <rect
        x="84"
        y="73"
        width="6"
        height="7"
        rx="1.5"
        fill="#2d3748"
        stroke="#4a5568"
        strokeWidth="0.5"
      />
      <rect x="76" y="75" width="4" height="5" rx="1" fill="#4a5568" />

      {/* Yer soyasi */}
      <ellipse cx="52" cy="81" rx="44" ry="2" fill="#000" opacity="0.2" />
    </svg>
  ),
};

// ─── SEX DETAIL PANEL ───────────────────────────────────────────────
function SexDetailPanel({ sex }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const { data: uch } = useQuery({
    queryKey: ["uchastkalar", sex.id],
    queryFn: () => getUchastkalar(sex.id),
  });
  const { data: usk } = useQuery({
    queryKey: ["uskunalar", sex.id],
    queryFn: () => getUskunalar({ sexId: sex.id }),
  });
  const uchastkalar = uch?.data || [];
  const uskunalar = usk?.data || [];

  return (
    <Box sx={{ p: 2 }}>
      <Grid container spacing={2} sx={{ mb: 2 }}>
        {[
          { l: "HOLAT", v: <StatusChip holat={sex.holat} /> },
          { l: "ISHCHILAR", v: sex.ishchilar, c: "primary.main" },
          {
            l: "HARORAT",
            v: `${sex.harorat}°C`,
            c: sex.harorat > 1400 ? "error.main" : "secondary.main",
          },
          {
            l: "YUK KO'RS.",
            v: `${sex.yuk}%`,
            c: sex.yuk > 90 ? "warning.main" : "success.main",
          },
          { l: "SMENA", v: sex.smena, c: "primary.main" },
        ].map((s) => (
          <Grid item xs={6} sm={2.4} key={s.l}>
            <Box
              sx={{
                background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1.5,
                textAlign: "center",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.55rem",
                  color: "text.secondary",
                  letterSpacing: "0.1em",
                  mb: 0.5,
                }}
              >
                {s.l}
              </Typography>
              {typeof s.v === "string" || typeof s.v === "number" ? (
                <Typography
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.9rem",
                    color: s.c || "text.primary",
                  }}
                >
                  {s.v}
                </Typography>
              ) : (
                s.v
              )}
            </Box>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={6}>
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.6rem",
              color: "text.secondary",
              letterSpacing: "0.15em",
              mb: 1,
            }}
          >
            UCHASTKALAR
          </Typography>
          {uchastkalar.map((u) => (
            <Box
              key={u.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 0.8,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.65rem",
                  color: "secondary.main",
                  minWidth: 70,
                }}
              >
                {u.id}
              </Typography>
              <Typography
                sx={{ fontSize: "0.8rem", flex: 1, color: "text.primary" }}
              >
                {u.nom}
              </Typography>
              <StatusChip holat={u.holat} />
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.65rem",
                  color: "text.secondary",
                }}
              >
                {u.harorat}°C
              </Typography>
            </Box>
          ))}
        </Grid>
        <Grid item xs={12} md={6}>
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.6rem",
              color: "text.secondary",
              letterSpacing: "0.15em",
              mb: 1,
            }}
          >
            USKUNALAR
          </Typography>
          {uskunalar.map((u) => (
            <Box
              key={u.id}
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.5,
                py: 0.8,
                borderBottom: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.65rem",
                  color: "primary.main",
                  minWidth: 70,
                }}
              >
                {u.id}
              </Typography>
              <Typography
                sx={{ fontSize: "0.8rem", flex: 1, color: "text.primary" }}
              >
                {u.nom}
              </Typography>
              <StatusChip holat={u.holat} />
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.65rem",
                  color: u.samaradorlik > 80 ? "success.main" : "warning.main",
                }}
              >
                {u.samaradorlik}%
              </Typography>
            </Box>
          ))}
        </Grid>
      </Grid>
    </Box>
  );
}

// ─── SEX KARTI ──────────────────────────────────────────────────────
const holatRang = {
  faol: "#00ff9d",
  ogohlantirish: "#ffd60a",
  xato: "#ff2d55",
  toxtagan: "#6b7280",
};
const svgColor = {
  "SEX-01": "#ff6b1a",
  "SEX-02": "#00d4ff",
  "SEX-03": "#a78bfa",
  "SEX-04": "#00ff9d",
  "SEX-05": "#ff2d55",
  "SEX-06": "#6b7280",
};

function SexCard({ s, selected, onClick }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const Illustration = SexSVG[s.id];
  const color = svgColor[s.id] || "#00d4ff";
  const isSelected = selected?.id === s.id;

  return (
    <Paper
      onClick={onClick}
      sx={{
        cursor: "pointer",
        borderColor: isSelected ? color : "divider",
        boxShadow: isSelected
          ? `0 0 0 1px ${color}40, 0 4px 20px ${color}20`
          : "none",
        transition: "all 0.25s",
        "&:hover": {
          borderColor: `${color}66`,
          transform: "translateY(-2px)",
          boxShadow: `0 6px 24px ${color}18`,
        },
        overflow: "hidden",
      }}
    >
      {/* Rangli yuqori chiziq */}
      <Box sx={{ height: 3, background: holatRang[s.holat] || "#374151" }} />

      {/* SVG RASMLI YUQORI QISM */}
      <Box
        sx={{
          height: 110,
          background: isDark
            ? `radial-gradient(ellipse at center, ${color}10 0%, transparent 70%)`
            : `radial-gradient(ellipse at center, ${color}08 0%, transparent 70%)`,
          borderBottom: "1px solid",
          borderColor: "divider",
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 1,
        }}
      >
        {/* Grid pattern arxitektura bg */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: isDark
              ? `linear-gradient(${color}06 1px,transparent 1px),linear-gradient(90deg,${color}06 1px,transparent 1px)`
              : `linear-gradient(${color}05 1px,transparent 1px),linear-gradient(90deg,${color}05 1px,transparent 1px)`,
            backgroundSize: "16px 16px",
          }}
        />
        {Illustration && (
          <Illustration color={color} pulse={s.holat === "faol"} />
        )}
        {/* ID badge */}
        <Box
          sx={{
            position: "absolute",
            top: 8,
            left: 8,
            background: isDark ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.7)",
            border: `1px solid ${color}40`,
            borderRadius: 0.5,
            px: 0.8,
            py: 0.2,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.58rem",
              color: color,
              letterSpacing: "0.08em",
            }}
          >
            {s.id}
          </Typography>
        </Box>
        {/* Holat dot */}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            right: 10,
            width: 8,
            height: 8,
            borderRadius: "50%",
            background: holatRang[s.holat],
            boxShadow: `0 0 6px ${holatRang[s.holat]}`,
            animation:
              s.holat === "faol" ? "blink 1.5s ease-in-out infinite" : "none",
            "@keyframes blink": {
              "0%,100%": { opacity: 1 },
              "50%": { opacity: 0.4 },
            },
          }}
        />
      </Box>

      {/* INFO QISM */}
      <Box sx={{ p: 1.5 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1.2,
          }}
        >
          <Typography
            sx={{ fontWeight: 700, fontSize: "0.9rem", color: "text.primary" }}
          >
            {s.nom}
          </Typography>
          <StatusChip holat={s.holat} />
        </Box>

        {/* STATS ROW */}
        <Grid container spacing={0.5} sx={{ mb: 1.2 }}>
          {[
            { l: "UCHASTKA", v: s.uchastkalar, c: color },
            {
              l: "USKUNA",
              v: `${s.faolUskunalar}/${s.uskunalar}`,
              c: "#ff6b1a",
            },
            { l: "ISHCHI", v: s.ishchilar, c: isDark ? "#00ff9d" : "#00a85a" },
            { l: "SMENA", v: s.smena, c: isDark ? "#ffd60a" : "#d97700" },
          ].map((st) => (
            <Grid item xs={3} key={st.l}>
              <Box
                sx={{
                  textAlign: "center",
                  background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.03)",
                  borderRadius: 0.5,
                  py: 0.6,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.78rem",
                    fontWeight: 700,
                    color: st.c,
                  }}
                >
                  {st.v}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.47rem",
                    color: "text.disabled",
                    letterSpacing: "0.08em",
                  }}
                >
                  {st.l}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* YUK PROGRESS */}
        <Box>
          <Box
            sx={{ display: "flex", justifyContent: "space-between", mb: 0.4 }}
          >
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.58rem",
                color: "text.secondary",
              }}
            >
              YUK KO'RSATKICHI
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.62rem",
                color: s.yuk > 90 ? "warning.main" : color,
              }}
            >
              {s.yuk}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate"
            value={s.yuk}
            sx={{
              mb: 0.6,
              height: 5,
              "& .MuiLinearProgress-bar": {
                background:
                  s.yuk > 90 ? "#ffd60a" : s.yuk > 0 ? color : "#374151",
              },
            }}
          />
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.58rem",
                color: "text.secondary",
              }}
            >
              HARORAT
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.68rem",
                color:
                  s.harorat > 1400
                    ? "error.main"
                    : s.harorat > 100
                      ? "secondary.main"
                      : "text.secondary",
              }}
            >
              {s.harorat}°C
            </Typography>
          </Box>
        </Box>
      </Box>
    </Paper>
  );
}

// ─── ASOSIY SAHIFA ──────────────────────────────────────────────────
export default function Sexlar() {
  const [selected, setSelected] = useState(null);
  const { data, isLoading } = useQuery({
    queryKey: ["sexlar"],
    queryFn: getSexlar,
  });
  const sexlar = data?.data || [];
  const navigate = useNavigate();
  const dispatch = useDispatch();
  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
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
            BO'LINMALAR BOSHQARUVI
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.65rem",
              color: "text.secondary",
            }}
          >
            Jami {sexlar.length} sex ·{" "}
            {sexlar.filter((s) => s.holat === "faol").length} faol ·{" "}
            {sexlar.filter((s) => s.holat === "xato").length} xato
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5 }}>
          {Object.entries(holatRang).map(([h, c]) => (
            <Box
              key={h}
              sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
            >
              <Box
                sx={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: c,
                  boxShadow: `0 0 5px ${c}`,
                }}
              />
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.6rem",
                  color: "text.secondary",
                  textTransform: "capitalize",
                }}
              >
                {h}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* KARTALAR */}
      {isLoading ? (
        <CardSkeleton />
      ) : (
        <Grid container spacing={1.5}>
          {sexlar.map((s) => (
            <Grid item xs={12} sm={6} md={4} key={s.id}>
              <SexCard
                s={s}
                selected={selected}
                onClick={() => {
                  const newSelected = selected?.id === s.id ? null : s;

                  setSelected(newSelected);

                  if (newSelected) {
                    dispatch(setSelectedSex(newSelected));
                    navigate("/uchastkalar");
                  }
                }}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* JADVAL KO'RINISH */}
      <Paper>
        <SectionHeader title="Bo'linmalar Jadvali" dot="#ff6b1a" />
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>BO'LINMALAR</TableCell>
              <TableCell>HOLAT</TableCell>
              <TableCell>UCHASTKALAR</TableCell>
              <TableCell>USKUNALAR</TableCell>
              <TableCell>YUK</TableCell>
              <TableCell>HARORAT</TableCell>
              <TableCell>ISHCHILAR</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sexlar.map((s) => (
              <TableRow
                key={s.id}
                onClick={() => setSelected(selected?.id === s.id ? null : s)}
                sx={{ cursor: "pointer" }}
              >
                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Box sx={{ width: 28, height: 28, flexShrink: 0 }}>
                      {(() => {
                        const SvgIcon = SexSVG[s.id];
                        return SvgIcon ? (
                          <SvgIcon color={svgColor[s.id]} />
                        ) : null;
                      })()}
                    </Box>
                    <Box>
                      <Typography
                        sx={{
                          fontWeight: 600,
                          fontSize: "0.83rem",
                          color: "text.primary",
                        }}
                      >
                        {s.nom}
                      </Typography>
                      <Typography
                        sx={{
                          fontFamily: "'Share Tech Mono',monospace",
                          fontSize: "0.58rem",
                          color: "text.secondary",
                        }}
                      >
                        {s.id}
                      </Typography>
                    </Box>
                  </Box>
                </TableCell>
                <TableCell>
                  <StatusChip holat={s.holat} />
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.72rem",
                      color: "text.secondary",
                    }}
                  >
                    {s.uchastkalar} ta
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.75rem",
                      color: "text.primary",
                    }}
                  >
                    {s.faolUskunalar}/{s.uskunalar}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      minWidth: 110,
                    }}
                  >
                    <LinearProgress
                      variant="determinate"
                      value={s.yuk}
                      sx={{
                        flex: 1,
                        "& .MuiLinearProgress-bar": {
                          background:
                            s.yuk > 90
                              ? "#ffd60a"
                              : s.yuk > 0
                                ? svgColor[s.id]
                                : "#374151",
                        },
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: "0.65rem",
                        color: "text.secondary",
                        minWidth: 28,
                      }}
                    >
                      {s.yuk}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.75rem",
                      color:
                        s.harorat > 1400
                          ? "error.main"
                          : s.harorat > 200
                            ? "secondary.main"
                            : "text.secondary",
                    }}
                  >
                    {s.harorat}°C
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.75rem",
                      color: "success.main",
                    }}
                  >
                    {s.ishchilar}
                  </Typography>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* DETAIL PANEL */}
      {selected && (
        <Paper sx={{ border: `1px solid ${svgColor[selected.id]}40` }}>
          <SectionHeader
            title={`${selected.nom} — Batafsil Ma'lumot`}
            dot={svgColor[selected.id]}
            action={
              <span
                onClick={() => setSelected(null)}
                style={{ cursor: "pointer" }}
              >
                ✕ YOPISH
              </span>
            }
          />
          <SexDetailPanel sex={selected} />
        </Paper>
      )}
    </Box>
  );
}

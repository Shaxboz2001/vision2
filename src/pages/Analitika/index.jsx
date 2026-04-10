// import { useQuery } from "@tanstack/react-query";
// import {
//   Box,
//   Grid,
//   Paper,
//   Typography,
//   Tabs,
//   Tab,
//   Divider,
// } from "@mui/material";
// import { useState } from "react";
// import {
//   AreaChart,
//   Area,
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   RadarChart,
//   Radar,
//   PolarGrid,
//   PolarAngleAxis,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts";
// import { getHaroratGrafik, getIshlabGrafik } from "@/api";
// import { SectionHeader } from "@/components/common";

// const CT = ({ active, payload, label }) => {
//   if (!active || !payload?.length) return null;
//   return (
//     <Box
//       sx={{
//         background: "#0d1220",
//         border: "1px solid #1e2a3d",
//         p: 1.5,
//         borderRadius: 1,
//       }}
//     >
//       <Typography
//         sx={{
//           fontFamily: "'Arial',san-serif",
//           fontSize: "0.6rem",
//           color: "#6b7280",
//           mb: 0.5,
//         }}
//       >
//         {label}
//       </Typography>
//       {payload.map((p) => (
//         <Typography
//           key={p.dataKey}
//           sx={{
//             fontFamily: "'Arial',san-serif",
//             fontSize: "0.68rem",
//             color: p.color,
//           }}
//         >
//           {p.name}: {p.value}
//         </Typography>
//       ))}
//     </Box>
//   );
// };

// const samaradorlikData = [
//   { sex: "ЛПК", samaradorlik: 94, plan: 90 },
//   { sex: "ПТНП", samaradorlik: 82, plan: 85 },
//   { sex: "СПП", samaradorlik: 72, plan: 85 },
//   { sex: "ШПП", samaradorlik: 88, plan: 88 },
//   // {
//   //   sex: "Подразделение по переработке лома и отходов металла",
//   //   samaradorlik: 45,
//   //   plan: 80,
//   // },
//   { sex: "ЦПФ", samaradorlik: 60, plan: 80 },
//   { sex: "ЭСПЦ", samaradorlik: 60, plan: 80 },
// ];

// const energiyaData = Array.from({ length: 12 }, (_, i) => ({
//   oy: [
//     "Yan",
//     "Fev",
//     "Mar",
//     "Apr",
//     "May",
//     "Iyn",
//     "Iyl",
//     "Avg",
//     "Sen",
//     "Okt",
//     "Noy",
//     "Dek",
//   ][i],
//   iste_mol: Math.round(2400 + Math.sin(i * 0.6) * 400 + Math.random() * 200),
//   tejash: Math.round(200 + Math.random() * 150),
// }));

// const holatData = [
//   { nom: "Faol", qiymat: 38, color: "#00ff9d" },
//   { nom: "Ogohlantirish", qiymat: 2, color: "#ffd60a" },
//   { nom: "Xato", qiymat: 1, color: "#ff2d55" },
//   { nom: "To'xtatildi", qiymat: 1, color: "#374151" },
// ];

// const radarData = [
//   { subject: "Harorat", SEX01: 92, SEX02: 88, SEX04: 78 },
//   { subject: "Bosim", SEX01: 85, SEX02: 90, SEX04: 75 },
//   { subject: "Samaradorlik", SEX01: 94, SEX02: 82, SEX04: 88 },
//   { subject: "Energiya", SEX01: 78, SEX02: 82, SEX04: 90 },
//   { subject: "Xavfsizlik", SEX01: 95, SEX02: 88, SEX04: 96 },
//   { subject: "Sifat", SEX01: 91, SEX02: 84, SEX04: 93 },
// ];

// export default function Analitika() {
//   const [tab, setTab] = useState(0);
//   const { data: harorat } = useQuery({
//     queryKey: ["harorat-grafik"],
//     queryFn: getHaroratGrafik,
//   });
//   const { data: ishlab } = useQuery({
//     queryKey: ["ishlab-grafik"],
//     queryFn: getIshlabGrafik,
//   });

//   const hg = (harorat?.data || []).filter((_, i) => i % 3 === 0);
//   const ig = ishlab?.data || [];

//   return (
//     <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
//       <Box>
//         <Typography
//           sx={{
//             fontFamily: "'Arial',san-serif",
//             fontSize: "1.1rem",
//             fontWeight: 700,
//             letterSpacing: "0.15em",
//           }}
//         >
//           ANALITIKA
//         </Typography>
//         <Typography
//           sx={{
//             fontFamily: "'Arial',san-serif",
//             fontSize: "0.65rem",
//             color: "#6b7280",
//           }}
//         >
//           Ko'rsatkichlar tahlili va grafiklar
//         </Typography>
//       </Box>

//       {/* TABS */}
//       <Paper sx={{ p: 0 }}>
//         <Tabs
//           value={tab}
//           onChange={(_, v) => setTab(v)}
//           sx={{
//             borderBottom: "1px solid #1e2a3d",
//             "& .MuiTabs-indicator": { background: "#00d4ff" },
//           }}
//         >
//           {[
//             "Ishlab Chiqarish",
//             "Harorat",
//             "Energiya",
//             "Samaradorlik",
//             "Bo'linmalarlar Taqqoslash",
//           ].map((label, i) => (
//             <Tab
//               key={i}
//               label={label}
//               sx={{
//                 fontFamily: "'Arial',san-serif",
//                 fontSize: "0.65rem",
//                 letterSpacing: "0.1em",
//                 color: tab === i ? "#00d4ff" : "#6b7280",
//                 minHeight: 44,
//               }}
//             />
//           ))}
//         </Tabs>

//         <Box sx={{ p: 2.5 }}>
//           {/* ISHLAB CHIQARISH */}
//           {tab === 0 && (
//             <Grid container spacing={2}>
//               <Grid item xs={12} md={8}>
//                 <Typography
//                   sx={{
//                     fontFamily: "'Arial',san-serif",
//                     fontSize: "0.65rem",
//                     color: "#6b7280",
//                     mb: 1.5,
//                     letterSpacing: "0.1em",
//                   }}
//                 >
//                   HAFTALIK ISHLAB CHIQARISH (TONNADA)
//                 </Typography>
//                 <Box sx={{ height: 280 }}>
//                   <ResponsiveContainer>
//                     <BarChart data={ig}>
//                       <CartesianGrid
//                         strokeDasharray="3 3"
//                         stroke="rgba(30,42,61,0.8)"
//                       />
//                       <XAxis
//                         dataKey="kun"
//                         tick={{
//                           fontFamily: "'Arial',san-serif",
//                           fontSize: 10,
//                           fill: "#6b7280",
//                         }}
//                       />
//                       <YAxis
//                         tick={{
//                           fontFamily: "'Arial',san-serif",
//                           fontSize: 10,
//                           fill: "#6b7280",
//                         }}
//                       />
//                       <Tooltip content={<CT />} />
//                       <Legend
//                         wrapperStyle={{
//                           fontFamily: "'Arial',san-serif",
//                           fontSize: "0.65rem",
//                         }}
//                       />
//                       <Bar
//                         dataKey="choyan"
//                         name="Armatura"
//                         fill="#ff6b1a"
//                         opacity={0.85}
//                         radius={[2, 2, 0, 0]}
//                       />
//                       <Bar
//                         dataKey="polat"
//                         name="List"
//                         fill="#00d4ff"
//                         opacity={0.85}
//                         radius={[2, 2, 0, 0]}
//                       />
//                       <Bar
//                         dataKey="prokat"
//                         name="Zoldir Shar"
//                         fill="#00ff9d"
//                         opacity={0.85}
//                         radius={[2, 2, 0, 0]}
//                       />
//                     </BarChart>
//                   </ResponsiveContainer>
//                 </Box>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Typography
//                   sx={{
//                     fontFamily: "'Arial',san-serif",
//                     fontSize: "0.65rem",
//                     color: "#6b7280",
//                     mb: 1.5,
//                   }}
//                 >
//                   USKUNALAR HOLATI
//                 </Typography>
//                 <Box
//                   sx={{
//                     height: 280,
//                     display: "flex",
//                     alignItems: "center",
//                     justifyContent: "center",
//                   }}
//                 >
//                   <ResponsiveContainer>
//                     <PieChart>
//                       <Pie
//                         data={holatData}
//                         cx="50%"
//                         cy="50%"
//                         innerRadius={60}
//                         outerRadius={100}
//                         dataKey="qiymat"
//                         paddingAngle={2}
//                       >
//                         {holatData.map((entry, i) => (
//                           <Cell key={i} fill={entry.color} />
//                         ))}
//                       </Pie>
//                       <Tooltip
//                         formatter={(v, n, p) => [v, p.payload.nom]}
//                         contentStyle={{
//                           background: "#0d1220",
//                           border: "1px solid #1e2a3d",
//                           fontFamily: "'Arial',san-serif",
//                           fontSize: "0.7rem",
//                         }}
//                       />
//                     </PieChart>
//                   </ResponsiveContainer>
//                 </Box>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     flexWrap: "wrap",
//                     gap: 1,
//                     justifyContent: "center",
//                   }}
//                 >
//                   {holatData.map((d) => (
//                     <Box
//                       key={d.nom}
//                       sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
//                     >
//                       <Box
//                         sx={{
//                           width: 8,
//                           height: 8,
//                           borderRadius: "50%",
//                           background: d.color,
//                         }}
//                       />
//                       <Typography
//                         sx={{
//                           fontFamily: "'Arial',san-serif",
//                           fontSize: "0.6rem",
//                           color: "#6b7280",
//                         }}
//                       >
//                         {d.nom} ({d.qiymat})
//                       </Typography>
//                     </Box>
//                   ))}
//                 </Box>
//               </Grid>
//             </Grid>
//           )}

//           {/* HARORAT */}
//           {tab === 1 && (
//             <Box>
//               <Typography
//                 sx={{
//                   fontFamily: "'Arial',san-serif",
//                   fontSize: "0.65rem",
//                   color: "#6b7280",
//                   mb: 1.5,
//                   letterSpacing: "0.1em",
//                 }}
//               >
//                 24-SOATLIK HARORAT DINAMIKASI
//               </Typography>
//               <Box sx={{ height: 320 }}>
//                 <ResponsiveContainer>
//                   <AreaChart data={hg}>
//                     <defs>
//                       {[
//                         ["domna", "#ff2d55"],
//                         ["konverter", "#ff6b1a"],
//                         ["pech", "#00d4ff"],
//                       ].map(([k, c]) => (
//                         <linearGradient
//                           key={k}
//                           id={`grad_${k}`}
//                           x1="0"
//                           y1="0"
//                           x2="0"
//                           y2="1"
//                         >
//                           <stop offset="5%" stopColor={c} stopOpacity={0.3} />
//                           <stop offset="95%" stopColor={c} stopOpacity={0.02} />
//                         </linearGradient>
//                       ))}
//                     </defs>
//                     <CartesianGrid
//                       strokeDasharray="3 3"
//                       stroke="rgba(30,42,61,0.8)"
//                     />
//                     <XAxis
//                       dataKey="soat"
//                       tick={{
//                         fontFamily: "'Arial',san-serif",
//                         fontSize: 9,
//                         fill: "#6b7280",
//                       }}
//                     />
//                     <YAxis
//                       domain={[1200, 1700]}
//                       tick={{
//                         fontFamily: "'Arial',san-serif",
//                         fontSize: 9,
//                         fill: "#6b7280",
//                       }}
//                     />
//                     <Tooltip content={<CT />} />
//                     <Legend
//                       wrapperStyle={{
//                         fontFamily: "'Arial',san-serif",
//                         fontSize: "0.65rem",
//                       }}
//                     />
//                     <Area
//                       type="monotone"
//                       dataKey="domna"
//                       name="Domna"
//                       stroke="#ff2d55"
//                       fill="url(#grad_domna)"
//                       strokeWidth={2}
//                     />
//                     <Area
//                       type="monotone"
//                       dataKey="konverter"
//                       name="Konverter"
//                       stroke="#ff6b1a"
//                       fill="url(#grad_konverter)"
//                       strokeWidth={2}
//                     />
//                     <Area
//                       type="monotone"
//                       dataKey="pech"
//                       name="Elektr Pech"
//                       stroke="#00d4ff"
//                       fill="url(#grad_pech)"
//                       strokeWidth={2}
//                     />
//                   </AreaChart>
//                 </ResponsiveContainer>
//               </Box>
//             </Box>
//           )}

//           {/* ENERGIYA */}
//           {tab === 2 && (
//             <Box>
//               <Typography
//                 sx={{
//                   fontFamily: "'Arial',san-serif",
//                   fontSize: "0.65rem",
//                   color: "#6b7280",
//                   mb: 1.5,
//                 }}
//               >
//                 YILLIK ENERGIYA SARFI (kWh)
//               </Typography>
//               <Box sx={{ height: 320 }}>
//                 <ResponsiveContainer>
//                   <BarChart data={energiyaData}>
//                     <CartesianGrid
//                       strokeDasharray="3 3"
//                       stroke="rgba(30,42,61,0.8)"
//                     />
//                     <XAxis
//                       dataKey="oy"
//                       tick={{
//                         fontFamily: "'Arial',san-serif",
//                         fontSize: 9,
//                         fill: "#6b7280",
//                       }}
//                     />
//                     <YAxis
//                       tick={{
//                         fontFamily: "'Arial',san-serif",
//                         fontSize: 9,
//                         fill: "#6b7280",
//                       }}
//                     />
//                     <Tooltip content={<CT />} />
//                     <Legend
//                       wrapperStyle={{
//                         fontFamily: "'Arial',san-serif",
//                         fontSize: "0.65rem",
//                       }}
//                     />
//                     <Bar
//                       dataKey="iste_mol"
//                       name="Iste'mol (kWh)"
//                       fill="#ff6b1a"
//                       opacity={0.85}
//                       radius={[2, 2, 0, 0]}
//                     />
//                     <Bar
//                       dataKey="tejash"
//                       name="Tejash (kWh)"
//                       fill="#00ff9d"
//                       opacity={0.85}
//                       radius={[2, 2, 0, 0]}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </Box>
//             </Box>
//           )}

//           {/* SAMARADORLIK */}
//           {tab === 3 && (
//             <Box>
//               <Typography
//                 sx={{
//                   fontFamily: "'Arial',san-serif",
//                   fontSize: "0.65rem",
//                   color: "#6b7280",
//                   mb: 1.5,
//                 }}
//               >
//                 BO'LINMALAR SAMARADORLIGI (HAQIQIY vs PLAN)
//               </Typography>
//               <Box sx={{ height: 320 }}>
//                 <ResponsiveContainer>
//                   <BarChart data={samaradorlikData} layout="vertical">
//                     <CartesianGrid
//                       strokeDasharray="3 3"
//                       stroke="rgba(30,42,61,0.8)"
//                     />
//                     <XAxis
//                       type="number"
//                       domain={[0, 100]}
//                       tick={{
//                         fontFamily: "'Arial',san-serif",
//                         fontSize: 9,
//                         fill: "#6b7280",
//                       }}
//                     />
//                     <YAxis
//                       dataKey="sex"
//                       type="category"
//                       tick={{
//                         fontFamily: "'Arial',san-serif",
//                         fontSize: 9,
//                         fill: "#6b7280",
//                       }}
//                       width={60}
//                     />
//                     <Tooltip content={<CT />} />
//                     <Legend
//                       wrapperStyle={{
//                         fontFamily: "'Arial',san-serif",
//                         fontSize: "0.65rem",
//                       }}
//                     />
//                     <Bar
//                       dataKey="plan"
//                       name="Plan %"
//                       fill="rgba(0,212,255,0.2)"
//                       radius={[0, 2, 2, 0]}
//                     />
//                     <Bar
//                       dataKey="samaradorlik"
//                       name="Haqiqiy %"
//                       fill="#00d4ff"
//                       opacity={0.85}
//                       radius={[0, 2, 2, 0]}
//                     />
//                   </BarChart>
//                 </ResponsiveContainer>
//               </Box>
//             </Box>
//           )}

//           {/* RADAR */}
//           {tab === 4 && (
//             <Box>
//               <Typography
//                 sx={{
//                   fontFamily: "'Arial',san-serif",
//                   fontSize: "0.65rem",
//                   color: "#6b7280",
//                   mb: 1.5,
//                 }}
//               >
//                 BO'LINMALAR MULTIDIMENSIONAL TAQQOSLASH
//               </Typography>
//               <Box sx={{ height: 340 }}>
//                 <ResponsiveContainer>
//                   <RadarChart data={radarData}>
//                     <PolarGrid stroke="rgba(30,42,61,0.8)" />
//                     <PolarAngleAxis
//                       dataKey="subject"
//                       tick={{
//                         fontFamily: "'Arial',san-serif",
//                         fontSize: 10,
//                         fill: "#6b7280",
//                       }}
//                     />
//                     <Radar
//                       name="ЛПК Домна"
//                       dataKey="SEX01"
//                       stroke="#ff2d55"
//                       fill="#ff2d55"
//                       fillOpacity={0.15}
//                     />
//                     <Radar
//                       name="ЭСПП Конвертер"
//                       dataKey="SEX02"
//                       stroke="#00d4ff"
//                       fill="#00d4ff"
//                       fillOpacity={0.15}
//                     />
//                     <Radar
//                       name="СПП Прокат"
//                       dataKey="SEX04"
//                       stroke="#00ff9d"
//                       fill="#00ff9d"
//                       fillOpacity={0.15}
//                     />
//                     <Legend
//                       wrapperStyle={{
//                         fontFamily: "'Arial',san-serif",
//                         fontSize: "0.65rem",
//                       }}
//                     />
//                     <Tooltip
//                       contentStyle={{
//                         background: "#0d1220",
//                         border: "1px solid #1e2a3d",
//                         fontFamily: "'Arial',san-serif",
//                         fontSize: "0.7rem",
//                       }}
//                     />
//                   </RadarChart>
//                 </ResponsiveContainer>
//               </Box>
//             </Box>
//           )}
//         </Box>
//       </Paper>
//     </Box>
//   );
// }

import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useQueries } from "@tanstack/react-query";
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Drawer,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PrecisionManufacturingRoundedIcon from "@mui/icons-material/PrecisionManufacturingRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import TrendingDownRoundedIcon from "@mui/icons-material/TrendingDownRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import InsightsRoundedIcon from "@mui/icons-material/InsightsRounded";
import WaterfallChartRoundedIcon from "@mui/icons-material/WaterfallChartRounded";
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  AreaChart,
  Area,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
} from "recharts";

import {
  getEAFHeatReport,
  getLRFHeatReport,
  getTSCHeatReport,
  getVODHeatReport,
} from "@/api/production";

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

const safeArr = (v) => (Array.isArray(v) ? v : []);

const safeText = (v, fallback = "-") => {
  if (v === null || v === undefined) return fallback;
  const s = String(v).trim();
  return s ? s : fallback;
};

const safeShift = (v) => safeText(v, "Noma'lum smena");
const safeTeam = (v) => safeText(v, "Noma'lum brigada");
const safePerson = (v) => safeText(v, "Kiritilmagan");

const fmtN = (n, d = 0) =>
  Number(n || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const sum = (arr = [], getter = (x) => x) =>
  safeArr(arr).reduce((a, b) => a + Number(getter(b) || 0), 0);

const avg = (arr = [], getter = (x) => x) => {
  const vals = safeArr(arr)
    .map((x) => Number(getter(x)))
    .filter((x) => Number.isFinite(x));
  return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
};

const kgToTon = (kg) => Number(kg || 0) / 1000;

const minutesBetween = (start, stop) => {
  if (!start || !stop) return 0;
  const ms = new Date(stop).getTime() - new Date(start).getTime();
  return ms > 0 ? Math.round(ms / 60000) : 0;
};

const formatDateTime = (v) => {
  if (!v) return "—";
  const d = dayjs(v);
  if (!d.isValid()) return "—";
  return d.format("DD.MM.YYYY HH:mm");
};

const toDateTimeLocal = (d) => dayjs(d).format("YYYY-MM-DDTHH:mm");

const formatApiDate = (v) => {
  if (!v) return "";
  const d = dayjs(v);
  if (!d.isValid()) return "";
  return d.format("YYYY-MM-DDTHH:mm:ss");
};

const getTemps = (heat) =>
  safeArr(heat?.temperatures)
    .map((t) => ({
      value: Number(t?.temperature || 0),
      o2: Number(t?.o2 || 0),
      carbon: Number(t?.carbon || 0),
      time: t?.dateTime || null,
    }))
    .filter((x) => Number.isFinite(x.value));

const getAvgTemp = (heat) => avg(getTemps(heat), (x) => x.value);

const getLastTemp = (heat) => {
  const arr = getTemps(heat);
  return arr.length ? arr[arr.length - 1].value : 0;
};

const getDelayMinutes = (heat) =>
  sum(heat?.delays, (d) => minutesBetween(d?.startTime, d?.stopTime));

const calcKwhPerTon = (energy, weightKg) => {
  const ton = kgToTon(weightKg);
  return ton > 0 ? Number(energy || 0) / ton : 0;
};

const pickLatest = (arr, startField = "startTime") => {
  const list = safeArr(arr);
  if (!list.length) return null;

  return [...list].sort((a, b) => {
    const ta = new Date(a?.[startField] || 0).getTime();
    const tb = new Date(b?.[startField] || 0).getTime();
    return tb - ta;
  })[0];
};

const groupByDay = (items, dateField, valueFn) => {
  const map = {};

  safeArr(items).forEach((item) => {
    const d = item?.[dateField];
    if (!d) return;
    const key = dayjs(d).format("DD.MM");
    if (!map[key]) map[key] = [];
    map[key].push(item);
  });

  return Object.entries(map).map(([kun, arr]) => ({
    kun,
    value: valueFn(arr),
  }));
};

const mergeSeriesByDay = ({ eaf, lrf, tsc, vod }) => {
  const keys = new Set([
    ...safeArr(eaf).map((x) => x.kun),
    ...safeArr(lrf).map((x) => x.kun),
    ...safeArr(tsc).map((x) => x.kun),
    ...safeArr(vod).map((x) => x.kun),
  ]);

  return [...keys]
    .map((kun) => ({
      kun,
      eaf: eaf.find((x) => x.kun === kun)?.value || 0,
      lrf: lrf.find((x) => x.kun === kun)?.value || 0,
      tsc: tsc.find((x) => x.kun === kun)?.value || 0,
      vod: vod.find((x) => x.kun === kun)?.value || 0,
    }))
    .sort((a, b) => {
      const [ad, am] = a.kun.split(".").map(Number);
      const [bd, bm] = b.kun.split(".").map(Number);
      return am === bm ? ad - bd : am - bm;
    });
};

const mergeTempSeries = (seriesMap) => {
  const bucket = new Map();

  Object.entries(seriesMap).forEach(([key, arr]) => {
    safeArr(arr).forEach((p, idx) => {
      const label = p.time ? dayjs(p.time).format("HH:mm") : `${idx + 1}`;
      const old = bucket.get(label) || { time: label };
      old[key] = p.value;
      bucket.set(label, old);
    });
  });

  return [...bucket.values()].sort((a, b) => a.time.localeCompare(b.time));
};

const getLastChemValue = (steelAnalysis = [], code) => {
  const list = safeArr(steelAnalysis);
  if (!list.length) return 0;

  const latest = [...list].sort(
    (a, b) =>
      new Date(b?.sampleTime || 0).getTime() -
      new Date(a?.sampleTime || 0).getTime(),
  )[0];

  const found = safeArr(latest?.chemicalAnalysis).find(
    (x) => String(x?.code || "").toLowerCase() === String(code).toLowerCase(),
  );

  return Number(found?.value || 0);
};

const trendForecast = (data = [], key) => {
  const clean = safeArr(data)
    .map((x) => Number(x?.[key]) || 0)
    .filter((x) => Number.isFinite(x));

  if (clean.length < 3) {
    return { trend: "stable", delta: 0, message: "Prognoz uchun ma'lumot kam" };
  }

  const split = Math.max(1, Math.floor(clean.length * 0.7));
  const prev = clean.slice(0, split);
  const last = clean.slice(split);

  const prevAvg = avg(prev);
  const lastAvg = avg(last);
  const delta = prevAvg ? ((lastAvg - prevAvg) / prevAvg) * 100 : 0;

  if (delta > 3) {
    return {
      trend: "up",
      delta,
      message: `So‘nggi davrda +${fmtN(Math.abs(delta), 1)}% o‘sish`,
    };
  }
  if (delta < -3) {
    return {
      trend: "down",
      delta,
      message: `So‘nggi davrda -${fmtN(Math.abs(delta), 1)}% pasayish`,
    };
  }

  return { trend: "stable", delta, message: "Ko‘rsatkich barqaror" };
};

const getStatusMeta = (score) => {
  if (score >= 85) return { label: "Yaxshi", color: "#22c55e" };
  if (score >= 65) return { label: "O'rtacha", color: "#f59e0b" };
  return { label: "Xavfli", color: "#ef4444" };
};

const riskLevel = (value, yellowFrom, redFrom, smallerIsWorse = false) => {
  if (smallerIsWorse) {
    if (value <= redFrom) return { label: "Yuqori", color: "#ef4444" };
    if (value <= yellowFrom) return { label: "O'rta", color: "#f59e0b" };
    return { label: "Past", color: "#22c55e" };
  }

  if (value >= redFrom) return { label: "Yuqori", color: "#ef4444" };
  if (value >= yellowFrom) return { label: "O'rta", color: "#f59e0b" };
  return { label: "Past", color: "#22c55e" };
};

const getSeverityColor = (v) => {
  if (v === "kritik") return "#ef4444";
  if (v === "ogohlantirish") return "#f59e0b";
  return "#0ea5e9";
};

const normalizeHeat = (h) => ({
  ...h,
  shift: safeShift(h?.shift),
  team: safeTeam(h?.team),
  foreman: safePerson(h?.foreman),
  superintendent: safePerson(h?.superintendent),
});

const daysInMonth = (dateLike) => {
  const d = dayjs(dateLike);
  return d.daysInMonth();
};

const dayOfYear = (dateLike) => {
  const d = dayjs(dateLike);
  return d.diff(dayjs(d).startOf("year"), "day") + 1;
};

/* ═══════════════════════════════════════════════════════════════
   FORECAST HELPERS
═══════════════════════════════════════════════════════════════ */

function buildSimpleForecast(rows = [], dateField, valueGetter) {
  const daily = groupByDay(rows, dateField, (arr) => sum(arr, valueGetter));
  const values = daily.map((x) => Number(x.value || 0)).filter((x) => x >= 0);

  if (!values.length) {
    return {
      tomorrow: 0,
      monthEnd: 0,
      yearEnd: 0,
      avgPerDay: 0,
      chart: [],
      insight: "Prognoz uchun ma'lumot yetarli emas",
    };
  }

  const last7 = values.slice(-7);
  const last14 = values.slice(-14);

  const avg7 = avg(last7);
  const avg14 = avg(last14.length ? last14 : values);

  const trendPct = avg14 ? ((avg7 - avg14) / avg14) * 100 : 0;
  const tomorrow = Math.max(0, avg7 + avg7 * (trendPct / 100) * 0.35);

  const now = dayjs();
  const passedDaysMonth = Math.max(1, now.date());
  const monthActual = sum(values);
  const monthForecast =
    monthActual + Math.max(0, daysInMonth(now) - passedDaysMonth) * tomorrow;

  const passedDaysYear = Math.max(1, dayOfYear(now));
  const yearForecast = (monthActual / passedDaysMonth) * 365;

  const chart = [
    { name: "Ertaga", value: tomorrow },
    { name: "Oy yakuni", value: monthForecast },
    { name: "Yil yakuni", value: yearForecast },
  ];

  let insight = "Ko‘rsatkich barqaror";
  if (trendPct > 5) insight = "Ijobiy trend kuzatilmoqda";
  else if (trendPct < -5) insight = "Pasayish trendi kuzatilmoqda";

  return {
    tomorrow,
    monthEnd: monthForecast,
    yearEnd: yearForecast,
    avgPerDay: avg7,
    chart,
    insight,
  };
}

/* ═══════════════════════════════════════════════════════════════
   ANALYTICS BUILDERS
═══════════════════════════════════════════════════════════════ */

function buildEAFAnalytics(rows) {
  const enriched = safeArr(rows).map((h) => {
    const x = normalizeHeat(h);
    const tappingWeight = Number(x?.tappingWeight) || 0;
    const energy = Number(x?.electricalEnergy) || 0;
    const o2 = Number(x?.injectedO2) || 0;
    const scrap = Number(x?.totalScrap) || 0;
    const hbi = Number(x?.totalHBI) || 0;
    const ratio = hbi > 0 ? scrap / hbi : 0;

    return {
      ...x,
      tappingWeight,
      energy,
      o2,
      scrap,
      hbi,
      ratio,
      latestTemp: getLastTemp(x),
      avgTemp: getAvgTemp(x),
      delayMin: getDelayMinutes(x),
      durationMin: minutesBetween(x?.startTime, x?.stopTime),
      carbon: getLastChemValue(x?.steelAnalysis, "C"),
      kwhPerTon: calcKwhPerTon(energy, tappingWeight),
    };
  });

  const totalTons = kgToTon(sum(enriched, (x) => x.tappingWeight));
  const totalEnergy = sum(enriched, (x) => x.energy);
  const avgKwhPerTon = avg(enriched, (x) => x.kwhPerTon);
  const avgDelay = avg(enriched, (x) => x.delayMin);
  const avgDuration = avg(enriched, (x) => x.durationMin);
  const avgRatio = avg(enriched, (x) => x.ratio);
  const avgTemp = avg(enriched, (x) => x.avgTemp);

  let score = 100;
  if (avgKwhPerTon > 520) score -= 18;
  else if (avgKwhPerTon > 470) score -= 8;
  if (avgDelay > 15) score -= 15;
  else if (avgDelay > 8) score -= 7;
  if (avgRatio < 2 || avgRatio > 4) score -= 8;
  if (avgDuration > 95) score -= 10;

  const forecast = buildSimpleForecast(enriched, "productionDate", (x) =>
    kgToTon(x.tappingWeight),
  );

  return {
    name: "EAF",
    rows: enriched,
    totalHeats: enriched.length,
    totalTons,
    totalEnergy,
    avgKwhPerTon,
    avgDelay,
    avgDuration,
    avgRatio,
    avgTemp,
    score: Math.max(30, Math.min(100, score)),
    trend: trendForecast(enriched, "kwhPerTon"),
    forecast,
  };
}

function buildLRFAnalytics(rows) {
  const enriched = safeArr(rows).map((h) => {
    const x = normalizeHeat(h);
    const steel =
      Number(x?.finalSteelWeight) || Number(x?.startSteelWeight) || 0;
    const energy = Number(x?.electricalEnergy) || 0;

    return {
      ...x,
      steel,
      energy,
      avgTemp: getAvgTemp(x),
      latestTemp: getLastTemp(x),
      delayMin: getDelayMinutes(x),
      durationMin: minutesBetween(x?.startTime, x?.stopTime),
      kwhPerTon: calcKwhPerTon(energy, steel),
      arPerTon:
        steel > 0 ? Number(x?.totalArConsumption || 0) / kgToTon(steel) : 0,
      n2PerTon:
        steel > 0 ? Number(x?.totalN2Consumption || 0) / kgToTon(steel) : 0,
    };
  });

  const totalTons = kgToTon(sum(enriched, (x) => x.steel));
  const avgKwhPerTon = avg(enriched, (x) => x.kwhPerTon);
  const avgTemp = avg(enriched, (x) => x.avgTemp);
  const avgDelay = avg(enriched, (x) => x.delayMin);

  let score = 100;
  if (avgKwhPerTon > 55) score -= 15;
  else if (avgKwhPerTon > 40) score -= 7;
  if (avgDelay > 12) score -= 10;
  if (avgTemp < 1500) score -= 8;

  const forecast = buildSimpleForecast(enriched, "productionDate", (x) =>
    kgToTon(x.steel),
  );

  return {
    name: "LRF",
    rows: enriched,
    totalHeats: enriched.length,
    totalTons,
    avgKwhPerTon,
    avgTemp,
    avgDelay,
    score: Math.max(30, Math.min(100, score)),
    trend: trendForecast(enriched, "kwhPerTon"),
    forecast,
  };
}

function buildTSCAnalytics(rows) {
  const enriched = safeArr(rows).map((h) => {
    const x = normalizeHeat(h);
    const steel =
      Number(x?.finalSteelWeight) || Number(x?.startSteelWeight) || 0;
    const strands = safeArr(x?.tscStrands);
    const slabs = safeArr(x?.tscProducts).filter(
      (p) => Number(p?.productType) === 1,
    );
    const avgTemp = getAvgTemp(x);
    const liquidus = Number(x?.liquidusTemperature || 0);

    return {
      ...x,
      steel,
      avgTemp,
      liquidus,
      delta: avgTemp && liquidus ? avgTemp - liquidus : 0,
      delayMin: getDelayMinutes(x),
      castLength: sum(strands, (s) => s?.castLength),
      castSpeedAvg: avg(strands, (s) => s?.castSpeedAvg),
      slabCount: slabs.length,
      slabWeight: sum(slabs, (s) => s?.productWeight),
    };
  });

  const totalTons = kgToTon(sum(enriched, (x) => x.slabWeight || x.steel));
  const totalSlabs = sum(enriched, (x) => x.slabCount);
  const avgCastSpeed = avg(enriched, (x) => x.castSpeedAvg);
  const avgDelta = avg(enriched, (x) => x.delta);
  const avgDelay = avg(enriched, (x) => x.delayMin);

  let score = 100;
  if (avgCastSpeed < 0.75) score -= 18;
  else if (avgCastSpeed < 1.0) score -= 8;
  if (avgDelta < 15) score -= 12;
  if (avgDelay > 10) score -= 8;

  const forecast = buildSimpleForecast(enriched, "productionDate", (x) =>
    kgToTon(x.slabWeight || x.steel),
  );

  return {
    name: "TSC",
    rows: enriched,
    totalHeats: enriched.length,
    totalTons,
    totalSlabs,
    avgCastSpeed,
    avgDelta,
    avgDelay,
    score: Math.max(30, Math.min(100, score)),
    trend: trendForecast(enriched, "castSpeedAvg"),
    forecast,
  };
}

function buildVODAnalytics(rows) {
  const enriched = safeArr(rows).map((h) => {
    const x = normalizeHeat(h);
    const startSteel = Number(x?.startSteelWeight) || 0;
    const finalSteel = Number(x?.finalSteelWeight) || 0;

    return {
      ...x,
      startSteel,
      finalSteel,
      avgTemp: getAvgTemp(x),
      latestTemp: getLastTemp(x),
      delayMin: getDelayMinutes(x),
      oxygenPerTon:
        kgToTon(finalSteel) > 0
          ? Number(x?.totalOxygen || 0) / kgToTon(finalSteel)
          : 0,
      yieldLossPct:
        startSteel > 0 ? ((startSteel - finalSteel) / startSteel) * 100 : 0,
    };
  });

  const totalTons = kgToTon(sum(enriched, (x) => x.finalSteel));
  const avgYieldLoss = avg(enriched, (x) => x.yieldLossPct);
  const avgMinVac = avg(enriched, (x) => x?.minVacuumPressure || 0);
  const avgDelay = avg(enriched, (x) => x.delayMin);

  let score = 100;
  if (avgYieldLoss > 2.5) score -= 16;
  else if (avgYieldLoss > 1.5) score -= 8;
  if (avgMinVac > 5) score -= 12;
  else if (avgMinVac > 3) score -= 6;
  if (avgDelay > 10) score -= 8;

  const forecast = buildSimpleForecast(enriched, "productionDate", (x) =>
    kgToTon(x.finalSteel),
  );

  return {
    name: "VOD",
    rows: enriched,
    totalHeats: enriched.length,
    totalTons,
    avgYieldLoss,
    avgMinVac,
    avgDelay,
    score: Math.max(30, Math.min(100, score)),
    trend: trendForecast(enriched, "yieldLossPct"),
    forecast,
  };
}

function buildExecutiveSummary(eaf, lrf, tsc, vod) {
  const units = [eaf, lrf, tsc, vod];
  const totalHeats = sum(units, (x) => x.totalHeats);
  const totalTons = sum(units, (x) => x.totalTons);
  const avgScore = avg(units, (x) => x.score);
  const status = getStatusMeta(avgScore);

  const strongest = [...units].sort((a, b) => b.score - a.score)[0];
  const weakest = [...units].sort((a, b) => a.score - b.score)[0];

  const risks = [];
  if (eaf.avgKwhPerTon > 500) risks.push("EAF energiya sarfi yuqori");
  if (eaf.avgDelay > 10) risks.push("EAF kechikishlari me’yordan yuqori");
  if (lrf.avgTemp < 1500)
    risks.push("LRF harorat nazorati kuchaytirilishi kerak");
  if (tsc.avgDelta < 15) risks.push("TSC superheat past");
  if (vod.totalHeats > 0 && vod.avgYieldLoss > 2)
    risks.push("VOD metall yo‘qotishi yuqori");

  const recommendations = [];
  if (eaf.avgKwhPerTon > 500) {
    recommendations.push(
      "EAF da charge mix va power-on rejimini optimallashtirish",
    );
  }
  if (eaf.avgRatio < 2 || eaf.avgRatio > 4) {
    recommendations.push("LOM/HBI nisbatini 2–4 oralig‘ida ushlash");
  }
  if (lrf.avgDelay > 10) {
    recommendations.push(
      "LRF da material addition ketma-ketligini standartlashtirish",
    );
  }
  if (tsc.avgDelta < 15) {
    recommendations.push(
      "TSC da liquidusdan yuqori harorat zaxirasini oshirish",
    );
  }
  if (vod.totalHeats > 0 && vod.avgYieldLoss > 2) {
    recommendations.push("VOD vacuum va blow parametrlarini qayta sozlash");
  }
  if (!recommendations.length) {
    recommendations.push(
      "Jarayonlar barqaror, nuqtaviy optimizatsiya tavsiya etiladi",
    );
  }

  return {
    totalHeats,
    totalTons,
    avgScore,
    status,
    strongest,
    weakest,
    risks,
    recommendations,
  };
}

function buildAnomalies(eaf, lrf, tsc, vod) {
  const list = [];

  eaf.rows.forEach((h) => {
    if (h.kwhPerTon > 520) {
      list.push({
        process: "EAF",
        heatId: h.heatId,
        type: "Yuqori energiya sarfi",
        value: `${fmtN(h.kwhPerTon, 1)} kWh/t`,
        risk: riskLevel(h.kwhPerTon, 470, 520),
        reason:
          "Elektr energiya sarfi yuqori. Charge mix yoki power-on time qayta ko‘rilishi kerak.",
        raw: h,
      });
    }
    if (h.delayMin > 15) {
      list.push({
        process: "EAF",
        heatId: h.heatId,
        type: "Katta kechikish",
        value: `${fmtN(h.delayMin, 0)} min`,
        risk: riskLevel(h.delayMin, 8, 15),
        reason: "Delay sabablarini alohida ko‘rib chiqish kerak.",
        raw: h,
      });
    }
  });

  lrf.rows.forEach((h) => {
    if (h.latestTemp > 0 && h.latestTemp < 1500) {
      list.push({
        process: "LRF",
        heatId: h.heatId,
        type: "Past yakuniy harorat",
        value: `${fmtN(h.latestTemp, 0)} °C`,
        risk: riskLevel(h.latestTemp, 1520, 1500, true),
        reason: "Yakuniy termik rejim sifatga ta’sir qilishi mumkin.",
        raw: h,
      });
    }
  });

  tsc.rows.forEach((h) => {
    if (h.delta < 15) {
      list.push({
        process: "TSC",
        heatId: h.heatId,
        type: "Superheat past",
        value: `${fmtN(h.delta, 1)} °C`,
        risk: riskLevel(h.delta, 20, 15, true),
        reason:
          "Liquidusga yaqin temperatura quyish barqarorligiga xavf tug‘diradi.",
        raw: h,
      });
    }
    if (h.castSpeedAvg > 0 && h.castSpeedAvg < 0.8) {
      list.push({
        process: "TSC",
        heatId: h.heatId,
        type: "Quyish tezligi past",
        value: `${fmtN(h.castSpeedAvg, 2)} m/min`,
        risk: riskLevel(h.castSpeedAvg, 1.0, 0.8, true),
        reason: "Quyish tezligi pastligi unumdorlikka ta’sir qiladi.",
        raw: h,
      });
    }
  });

  vod.rows.forEach((h) => {
    if (h.yieldLossPct > 2) {
      list.push({
        process: "VOD",
        heatId: h.heatId,
        type: "Metall yo‘qotish yuqori",
        value: `${fmtN(h.yieldLossPct, 2)} %`,
        risk: riskLevel(h.yieldLossPct, 1.5, 2),
        reason: "Yakuniy chiqish foizi pasaygan.",
        raw: h,
      });
    }
  });

  const weight = { Yuqori: 3, "O'rta": 2, Past: 1 };
  return list.sort((a, b) => weight[b.risk.label] - weight[a.risk.label]);
}

function buildDirectorMessage(executive, eaf, lrf, tsc, vod, warnings = []) {
  const parts = [];

  parts.push(
    `Tizim joriy ishlab chiqarish holatini ${executive.status.label.toLowerCase()} deb baholadi.`,
  );
  parts.push(
    `Eng kuchli blok ${executive.strongest?.name}, eng ko‘p e’tibor talab qiladigan blok ${executive.weakest?.name}.`,
  );

  if (eaf.avgKwhPerTon > 500) {
    parts.push("EAF bo‘yicha energiya sarfi yuqori.");
  }
  if (tsc.avgDelta < 15 && tsc.totalHeats > 0) {
    parts.push("TSC bo‘yicha superheat pastligi kuzatilmoqda.");
  }
  if (vod.totalHeats > 0 && vod.avgYieldLoss > 2) {
    parts.push("VOD bo‘yicha metall yo‘qotish darajasi oshgan.");
  }
  if (warnings.length) {
    parts.push(
      `Ayrim endpointlarda ma’lumot olishda cheklov kuzatildi: ${warnings.join(", ")}.`,
    );
  }

  parts.push(`AI tavsiyasi: ${executive.recommendations[0]}.`);

  return parts.join(" ");
}

/* ═══════════════════════════════════════════════════════════════
   UI HELPERS
═══════════════════════════════════════════════════════════════ */

function useUi() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return {
    isDark,
    paperSoft: isDark
      ? "linear-gradient(180deg, rgba(15,23,42,0.94), rgba(12,18,32,0.98))"
      : "linear-gradient(180deg, #ffffff, #f8fbff)",
    border: isDark ? "rgba(148,163,184,0.16)" : "rgba(15,23,42,0.08)",
    borderStrong: isDark ? "rgba(148,163,184,0.24)" : "rgba(15,23,42,0.12)",
    textMain: isDark ? "#e5eef9" : "#0f172a",
    textSoft: isDark ? "#a8b3c7" : "#475569",
    textMuted: isDark ? "#7c8aa5" : "#64748b",
    grid: isDark ? "rgba(148,163,184,0.18)" : "rgba(15,23,42,0.10)",
    shadow: isDark
      ? "0 10px 28px rgba(0,0,0,0.24)"
      : "0 10px 24px rgba(15,23,42,0.06)",
  };
}

function DashboardPaper({ children, sx = {} }) {
  const ui = useUi();
  return (
    <Paper
      sx={{
        background: ui.paperSoft,
        border: `1px solid ${ui.border}`,
        boxShadow: ui.shadow,
        borderRadius: 3,
        overflow: "hidden",
        ...sx,
      }}
    >
      {children}
    </Paper>
  );
}

function CustomTooltip({ active, payload, label }) {
  const ui = useUi();
  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        background: ui.isDark ? "#0f172a" : "#ffffff",
        border: `1px solid ${ui.borderStrong}`,
        p: 1.5,
        borderRadius: 2,
        minWidth: 160,
      }}
    >
      <Typography
        sx={{
          fontSize: "0.72rem",
          color: ui.textSoft,
          mb: 0.8,
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>
      {payload.map((p) => (
        <Typography
          key={`${p.name}-${p.dataKey}`}
          sx={{
            fontSize: "0.82rem",
            color: p.color,
            lineHeight: 1.7,
            fontWeight: 700,
          }}
        >
          {p.name}: {fmtN(p.value, 1)}
        </Typography>
      ))}
    </Box>
  );
}

function KPI({ title, value, subtitle, color, icon }) {
  return (
    <DashboardPaper sx={{ p: 2.1, height: "100%" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="flex-start"
      >
        <Box>
          <Typography
            sx={{ fontSize: "0.74rem", color: "text.secondary", mb: 0.8 }}
          >
            {title}
          </Typography>
          <Typography sx={{ fontSize: "1.55rem", fontWeight: 900, color }}>
            {value}
          </Typography>
          <Typography
            sx={{ fontSize: "0.74rem", color: "text.secondary", mt: 0.5 }}
          >
            {subtitle}
          </Typography>
        </Box>
        <Box sx={{ color }}>{icon}</Box>
      </Stack>
    </DashboardPaper>
  );
}

function UnitScoreCard({ unit }) {
  const status = getStatusMeta(unit.score);

  return (
    <DashboardPaper sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: 800 }}>{unit.name}</Typography>
        <Chip
          size="small"
          label={status.label}
          sx={{
            background: `${status.color}22`,
            color: status.color,
            border: `1px solid ${status.color}55`,
            fontWeight: 700,
          }}
        />
      </Stack>

      <Typography sx={{ mt: 1, fontSize: "2rem", fontWeight: 900 }}>
        {fmtN(unit.score, 0)}
      </Typography>

      <LinearProgress
        variant="determinate"
        value={unit.score}
        sx={{
          mt: 1,
          height: 8,
          borderRadius: 999,
          "& .MuiLinearProgress-bar": {
            backgroundColor: status.color,
            borderRadius: 999,
          },
        }}
      />

      <Stack spacing={0.6} sx={{ mt: 1.4 }}>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
          Heatlar: <b>{fmtN(unit.totalHeats, 0)}</b>
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
          Hajm: <b>{fmtN(unit.totalTons, 1)} t</b>
        </Typography>
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
          Trend: <b>{unit.trend.message}</b>
        </Typography>
      </Stack>
    </DashboardPaper>
  );
}

function MiniInfoCard({ title, rows = [] }) {
  return (
    <DashboardPaper sx={{ p: 2.1, height: "100%" }}>
      <Typography sx={{ fontSize: "1rem", fontWeight: 800, mb: 1.4 }}>
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.05 }}>
        {rows.map((r, idx) => (
          <Box key={r.label}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                gap: 1.5,
              }}
            >
              <Typography sx={{ fontSize: "0.86rem", color: "text.secondary" }}>
                {r.label}
              </Typography>
              <Typography
                sx={{
                  fontSize: "0.86rem",
                  fontWeight: 800,
                  color: r.color || "text.primary",
                }}
              >
                {r.value}
              </Typography>
            </Box>
            {idx < rows.length - 1 && <Divider sx={{ mt: 0.95 }} />}
          </Box>
        ))}
      </Box>
    </DashboardPaper>
  );
}

function ForecastCard({ title, forecast, color = "#0ea5e9" }) {
  return (
    <DashboardPaper sx={{ p: 2.1, height: "100%" }}>
      <Typography sx={{ fontSize: "1rem", fontWeight: 800, mb: 1.4 }}>
        {title}
      </Typography>

      <Stack spacing={1}>
        <Typography sx={{ fontSize: "0.84rem", color: "text.secondary" }}>
          Ertangi kun: <b style={{ color }}>{fmtN(forecast.tomorrow, 1)} t</b>
        </Typography>
        <Typography sx={{ fontSize: "0.84rem", color: "text.secondary" }}>
          Oy yakuni: <b style={{ color }}>{fmtN(forecast.monthEnd, 1)} t</b>
        </Typography>
        <Typography sx={{ fontSize: "0.84rem", color: "text.secondary" }}>
          Yil prognozi: <b style={{ color }}>{fmtN(forecast.yearEnd, 1)} t</b>
        </Typography>
        <Typography
          sx={{ fontSize: "0.8rem", color: "text.secondary", mt: 0.6 }}
        >
          {forecast.insight}
        </Typography>
      </Stack>
    </DashboardPaper>
  );
}

function HeatDetailDrawer({ open, onClose, item }) {
  const raw = item?.raw;
  const temps = safeArr(raw?.temperatures);
  const delays = safeArr(raw?.delays);

  const latestSteel = safeArr(raw?.steelAnalysis).length
    ? [...safeArr(raw?.steelAnalysis)].sort(
        (a, b) =>
          new Date(b?.sampleTime || 0).getTime() -
          new Date(a?.sampleTime || 0).getTime(),
      )[0]
    : null;

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Box
        sx={{
          width: { xs: 360, sm: 520 },
          p: 2,
          minHeight: "100%",
          background: "#0f172a",
          color: "#e2e8f0",
        }}
      >
        <Typography sx={{ fontSize: "1rem", fontWeight: 800, mb: 1 }}>
          Heat tafsiloti
        </Typography>

        <DashboardPaper sx={{ p: 2, mb: 2 }}>
          <Stack spacing={0.8}>
            <Typography>
              <b>Jarayon:</b> {item?.process}
            </Typography>
            <Typography>
              <b>Heat ID:</b> {safeText(raw?.heatId)}
            </Typography>
            <Typography>
              <b>Po‘lat:</b> {safeText(raw?.steelGradeName)}
            </Typography>
            <Typography>
              <b>Practice:</b> {safeText(raw?.practiceName)}
            </Typography>
            <Typography>
              <b>Shift:</b> {safeShift(raw?.shift)}
            </Typography>
            <Typography>
              <b>Team:</b> {safeTeam(raw?.team)}
            </Typography>
            <Typography>
              <b>Foreman:</b> {safePerson(raw?.foreman)}
            </Typography>
            <Typography>
              <b>Superintendent:</b> {safePerson(raw?.superintendent)}
            </Typography>
            <Typography>
              <b>Ladle ID:</b> {safeText(raw?.ladleId)}
            </Typography>
          </Stack>
        </DashboardPaper>

        <DashboardPaper sx={{ p: 2, mb: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>AI izoh</Typography>
          <Typography
            sx={{ fontSize: "0.84rem", color: "#94a3b8", lineHeight: 1.7 }}
          >
            {item?.reason}
          </Typography>
        </DashboardPaper>

        <DashboardPaper sx={{ p: 2, mb: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            Temperaturalar
          </Typography>
          <Stack spacing={0.7}>
            {temps.length ? (
              temps.slice(-5).map((t, i) => (
                <Typography
                  key={i}
                  sx={{ fontSize: "0.82rem", color: "#94a3b8" }}
                >
                  {formatDateTime(t?.dateTime)} — {fmtN(t?.temperature, 1)} °C
                </Typography>
              ))
            ) : (
              <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Temperatura ma'lumoti yo‘q
              </Typography>
            )}
          </Stack>
        </DashboardPaper>

        <DashboardPaper sx={{ p: 2, mb: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>Delaylar</Typography>
          <Stack spacing={0.9}>
            {delays.length ? (
              delays.map((d, i) => (
                <Box key={i}>
                  <Typography sx={{ fontSize: "0.84rem" }}>
                    {safeText(d?.delayType, "Delay")} /{" "}
                    {safeText(d?.delayReason)}
                  </Typography>
                  <Typography sx={{ fontSize: "0.76rem", color: "#94a3b8" }}>
                    {formatDateTime(d?.startTime)} —{" "}
                    {formatDateTime(d?.stopTime)}
                  </Typography>
                </Box>
              ))
            ) : (
              <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Delay ma'lumoti yo‘q
              </Typography>
            )}
          </Stack>
        </DashboardPaper>

        <DashboardPaper sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            Kimyoviy tahlil
          </Typography>
          {latestSteel?.chemicalAnalysis?.length ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#94a3b8" }}>Kod</TableCell>
                    <TableCell sx={{ color: "#94a3b8" }}>Qiymat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latestSteel.chemicalAnalysis.map((c, i) => (
                    <TableRow key={i}>
                      <TableCell sx={{ color: "#e2e8f0" }}>{c?.code}</TableCell>
                      <TableCell sx={{ color: "#e2e8f0" }}>
                        {fmtN(c?.value, 4)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>
              Kimyoviy tahlil mavjud emas
            </Typography>
          )}
        </DashboardPaper>
      </Box>
    </Drawer>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN
═══════════════════════════════════════════════════════════════ */

export default function Analitika() {
  const ui = useUi();
  const [tab, setTab] = useState(0);
  const [selectedAnomaly, setSelectedAnomaly] = useState(null);

  const now = dayjs();
  const before30 = now.subtract(30, "day");

  const [filters, setFilters] = useState({
    heatId: "",
    startDate: toDateTimeLocal(before30),
    endDate: toDateTimeLocal(now),
    process: "ALL",
  });

  const [appliedFilters, setAppliedFilters] = useState({
    heatId: "",
    startDate: formatApiDate(before30),
    endDate: formatApiDate(now),
    process: "ALL",
  });

  const buildParams = () => {
    const params = {};
    if (appliedFilters.heatId) params.heatId = appliedFilters.heatId;
    if (appliedFilters.startDate) params.startDate = appliedFilters.startDate;
    if (appliedFilters.endDate) params.endDate = appliedFilters.endDate;
    return params;
  };

  const safeQuery = async (fn, name) => {
    try {
      const data = await fn();
      return { ok: true, data: safeArr(data), warning: null, name };
    } catch (err) {
      return {
        ok: false,
        data: [],
        warning: `${name} ma'lumotlari vaqtincha olinmadi`,
        error: err,
        name,
      };
    }
  };

  const queryParams = useMemo(buildParams, [appliedFilters]);

  const shouldRun = (name) =>
    appliedFilters.process === "ALL" || appliedFilters.process === name;

  const results = useQueries({
    queries: [
      {
        queryKey: ["analytics", "EAF", queryParams, appliedFilters.process],
        enabled: shouldRun("EAF"),
        queryFn: () => safeQuery(() => getEAFHeatReport(queryParams), "EAF"),
        staleTime: 60_000,
      },
      {
        queryKey: ["analytics", "LRF", queryParams, appliedFilters.process],
        enabled: shouldRun("LRF"),
        queryFn: () => safeQuery(() => getLRFHeatReport(queryParams), "LRF"),
        staleTime: 60_000,
      },
      {
        queryKey: ["analytics", "TSC", queryParams, appliedFilters.process],
        enabled: shouldRun("TSC"),
        queryFn: () => safeQuery(() => getTSCHeatReport(queryParams), "TSC"),
        staleTime: 60_000,
      },
      {
        queryKey: ["analytics", "VOD", queryParams, appliedFilters.process],
        enabled: shouldRun("VOD"),
        queryFn: () => safeQuery(() => getVODHeatReport(queryParams), "VOD"),
        staleTime: 60_000,
      },
    ],
  });

  const loading = results.some((q) => q.isLoading);

  const eafRes = results[0]?.data || {
    ok: true,
    data: [],
    warning: null,
    name: "EAF",
  };
  const lrfRes = results[1]?.data || {
    ok: true,
    data: [],
    warning: null,
    name: "LRF",
  };
  const tscRes = results[2]?.data || {
    ok: true,
    data: [],
    warning: null,
    name: "TSC",
  };
  const vodRes = results[3]?.data || {
    ok: true,
    data: [],
    warning: null,
    name: "VOD",
  };

  const warnings = [
    eafRes.warning,
    lrfRes.warning,
    tscRes.warning,
    vodRes.warning,
  ].filter(Boolean);

  const analytics = useMemo(() => {
    const eaf = buildEAFAnalytics(eafRes.data);
    const lrf = buildLRFAnalytics(lrfRes.data);
    const tsc = buildTSCAnalytics(tscRes.data);
    const vod = buildVODAnalytics(vodRes.data);

    const executive = buildExecutiveSummary(eaf, lrf, tsc, vod);
    const anomalies = buildAnomalies(eaf, lrf, tsc, vod);
    const directorMessage = buildDirectorMessage(
      executive,
      eaf,
      lrf,
      tsc,
      vod,
      warnings,
    );

    const latestEAF = pickLatest(eaf.rows, "startTime");
    const latestLRF = pickLatest(lrf.rows, "startTime");
    const latestTSC = pickLatest(tsc.rows, "ladleOpeningDate");
    const latestVOD = pickLatest(vod.rows, "startTime");

    const tempChartData = mergeTempSeries({
      eaf: getTemps(latestEAF),
      lrf: getTemps(latestLRF),
      tsc: getTemps(latestTSC),
      vod: getTemps(latestVOD),
    });

    const productionChartData = mergeSeriesByDay({
      eaf: groupByDay(eaf.rows, "productionDate", (arr) =>
        kgToTon(sum(arr, (x) => x.tappingWeight)),
      ),
      lrf: groupByDay(lrf.rows, "productionDate", (arr) =>
        kgToTon(sum(arr, (x) => x.steel)),
      ),
      tsc: groupByDay(tsc.rows, "productionDate", (arr) =>
        kgToTon(sum(arr, (x) => x.slabWeight || x.steel)),
      ),
      vod: groupByDay(vod.rows, "productionDate", (arr) =>
        kgToTon(sum(arr, (x) => x.finalSteel)),
      ),
    });

    const scoreChart = [
      { name: "EAF", score: eaf.score },
      { name: "LRF", score: lrf.score },
      { name: "TSC", score: tsc.score },
      { name: "VOD", score: vod.score },
    ];

    const unknownShiftCount = [
      ...eaf.rows,
      ...lrf.rows,
      ...tsc.rows,
      ...vod.rows,
    ].filter((x) => safeShift(x.shift) === "Noma'lum smena").length;

    const alerts = [];

    if (eaf.totalHeats && eaf.avgKwhPerTon > 500) {
      alerts.push({
        id: "eaf-energy",
        xabar: `EAF energiya sarfi yuqori: ${fmtN(eaf.avgKwhPerTon, 1)} kWh/t`,
        daraja: "kritik",
      });
    }
    if (tsc.totalHeats && tsc.avgDelta < 15) {
      alerts.push({
        id: "tsc-superheat",
        xabar: `TSC superheat past: ${fmtN(tsc.avgDelta, 1)} °C`,
        daraja: "ogohlantirish",
      });
    }
    if (vod.totalHeats && vod.avgYieldLoss > 2) {
      alerts.push({
        id: "vod-loss",
        xabar: `VOD metall yo‘qotish yuqori: ${fmtN(vod.avgYieldLoss, 2)} %`,
        daraja: "kritik",
      });
    }
    if (warnings.length) {
      alerts.push({
        id: "api-warn",
        xabar: warnings.join(", "),
        daraja: "info",
      });
    }
    if (unknownShiftCount > 0) {
      alerts.push({
        id: "shift-null",
        xabar: `${unknownShiftCount} ta yozuvda smena kiritilmagan`,
        daraja: "info",
      });
    }
    if (!alerts.length) {
      alerts.push({
        id: "normal",
        xabar: "Muhim ogohlantirish aniqlanmadi",
        daraja: "info",
      });
    }

    return {
      eaf,
      lrf,
      tsc,
      vod,
      executive,
      anomalies,
      directorMessage,
      tempChartData,
      productionChartData,
      scoreChart,
      latestEAF,
      latestLRF,
      latestTSC,
      latestVOD,
      alerts,
      unknownShiftCount,
    };
  }, [eafRes.data, lrfRes.data, tscRes.data, vodRes.data, warnings]);

  const applyFilters = () => {
    setAppliedFilters({
      heatId: filters.heatId.trim(),
      startDate: formatApiDate(filters.startDate),
      endDate: formatApiDate(filters.endDate),
      process: filters.process,
    });
  };

  const resetFilters = () => {
    const now2 = dayjs();
    const before302 = now2.subtract(30, "day");

    setFilters({
      heatId: "",
      startDate: toDateTimeLocal(before302),
      endDate: toDateTimeLocal(now2),
      process: "ALL",
    });

    setAppliedFilters({
      heatId: "",
      startDate: formatApiDate(before302),
      endDate: formatApiDate(now2),
      process: "ALL",
    });
  };

  if (loading) {
    return (
      <Box sx={{ p: 3, minHeight: 420, display: "grid", placeItems: "center" }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress />
          <Typography sx={{ color: "text.secondary" }}>
            AI analitika ma'lumotlari yuklanmoqda...
          </Typography>
        </Stack>
      </Box>
    );
  }

  const {
    eaf,
    lrf,
    tsc,
    vod,
    executive,
    anomalies,
    directorMessage,
    tempChartData,
    productionChartData,
    scoreChart,
    latestEAF,
    latestLRF,
    latestTSC,
    latestVOD,
    alerts,
    unknownShiftCount,
  } = analytics;

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2.5 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      <DashboardPaper sx={{ p: 2.3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Typography
              sx={{ fontSize: "1.25rem", fontWeight: 900, color: ui.textMain }}
            >
              AI ANALITIKA VA ISHLAB CHIQARISH TAHLILCHISI
            </Typography>
            <Typography
              sx={{ color: ui.textSoft, mt: 0.6, fontSize: "0.84rem" }}
            >
              EAF • LRF • TSC • VOD bo‘yicha KPI, risk, prognoz va rahbariyat
              uchun tezkor xulosa
            </Typography>
          </Box>

          <Stack alignItems={{ xs: "flex-start", md: "flex-end" }} spacing={1}>
            <Chip
              label={`Umumiy holat: ${executive.status.label}`}
              sx={{
                background: `${executive.status.color}22`,
                color: executive.status.color,
                border: `1px solid ${executive.status.color}55`,
                fontWeight: 800,
              }}
            />
            <Typography
              sx={{ color: ui.textMain, fontWeight: 900, fontSize: "2rem" }}
            >
              {fmtN(executive.avgScore, 0)}
            </Typography>
          </Stack>
        </Stack>

        <DashboardPaper
          sx={{
            mt: 2,
            p: 2,
            background:
              "linear-gradient(135deg, rgba(14,165,233,0.12), rgba(34,197,94,0.10))",
            border: "1px solid rgba(14,165,233,0.22)",
          }}
        >
          <Stack
            direction="row"
            spacing={1.2}
            alignItems="center"
            sx={{ mb: 1 }}
          >
            <AutoAwesomeRoundedIcon sx={{ color: "#0ea5e9" }} />
            <Typography sx={{ color: ui.textMain, fontWeight: 800 }}>
              Direktor uchun AI xulosa
            </Typography>
          </Stack>
          <Typography
            sx={{ color: ui.textSoft, lineHeight: 1.8, fontSize: "0.86rem" }}
          >
            {directorMessage}
          </Typography>
        </DashboardPaper>
      </DashboardPaper>

      {warnings.length > 0 && (
        <Alert severity="warning">
          Ayrim endpointlar vaqtincha ma’lumot qaytarmadi. Sahifa ishlashda
          davom etadi: {warnings.join(", ")}
        </Alert>
      )}

      <DashboardPaper sx={{ p: 2 }}>
        <Typography sx={{ fontWeight: 800, mb: 2, color: ui.textMain }}>
          Filterlar
        </Typography>

        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Heat ID"
              value={filters.heatId}
              onChange={(e) =>
                setFilters((s) => ({ ...s, heatId: e.target.value }))
              }
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              type="datetime-local"
              label="Boshlanish sanasi"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((s) => ({ ...s, startDate: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              type="datetime-local"
              label="Tugash sanasi"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((s) => ({ ...s, endDate: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              size="small"
              label="Jarayon"
              value={filters.process}
              onChange={(e) =>
                setFilters((s) => ({ ...s, process: e.target.value }))
              }
            >
              <MenuItem value="ALL">Barchasi</MenuItem>
              <MenuItem value="EAF">EAF</MenuItem>
              <MenuItem value="LRF">LRF</MenuItem>
              <MenuItem value="TSC">TSC</MenuItem>
              <MenuItem value="VOD">VOD</MenuItem>
            </TextField>
          </Grid>

          <Grid item xs={12}>
            <Stack direction="row" spacing={1.2}>
              <Button
                variant="contained"
                startIcon={<SearchRoundedIcon />}
                onClick={applyFilters}
              >
                Tahlil qilish
              </Button>
              <Button
                variant="outlined"
                startIcon={<RestartAltRoundedIcon />}
                onClick={resetFilters}
              >
                Tozalash
              </Button>
            </Stack>
          </Grid>
        </Grid>
      </DashboardPaper>

      <Grid container spacing={1.5}>
        <Grid item xs={12} sm={6} md={3}>
          <KPI
            title="Jami heatlar"
            value={fmtN(executive.totalHeats, 0)}
            subtitle="Tanlangan filtr bo‘yicha"
            color="#0ea5e9"
            icon={<PrecisionManufacturingRoundedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPI
            title="Jami hajm"
            value={`${fmtN(executive.totalTons, 1)} t`}
            subtitle="Barcha jarayonlar yig‘indisi"
            color="#22c55e"
            icon={<WaterfallChartRoundedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPI
            title="Eng kuchli blok"
            value={safeText(executive.strongest?.name)}
            subtitle={`Ball: ${fmtN(executive.strongest?.score, 0)}`}
            color="#f59e0b"
            icon={<TrendingUpRoundedIcon />}
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KPI
            title="Noma'lum smena"
            value={fmtN(unknownShiftCount, 0)}
            subtitle="Smena kiritilmagan yozuvlar"
            color="#ef4444"
            icon={<WarningAmberRoundedIcon />}
          />
        </Grid>
      </Grid>

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{
          borderBottom: `1px solid ${ui.border}`,
          "& .MuiTabs-indicator": { background: "#0ea5e9" },
        }}
      >
        {[
          "AI Xulosa",
          "KPI",
          "Grafiklar",
          "Prognoz",
          "Og'ishlar",
          "Tafsilot",
        ].map((t) => (
          <Tab
            key={t}
            label={t}
            sx={{
              color: ui.textSoft,
              fontWeight: 700,
              minHeight: 42,
              textTransform: "none",
            }}
          />
        ))}
      </Tabs>

      {tab === 0 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <DashboardPaper sx={{ height: "100%" }}>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.4 }}>
                  Asosiy risklar
                </Typography>
                <Stack spacing={1}>
                  {(executive.risks.length
                    ? executive.risks
                    : ["Jiddiy xavf indikatorlari aniqlanmadi"]
                  ).map((r, i) => (
                    <Typography
                      key={i}
                      sx={{ color: ui.textSoft, fontSize: "0.84rem" }}
                    >
                      • {r}
                    </Typography>
                  ))}
                </Stack>

                <Divider sx={{ my: 2 }} />

                <Typography sx={{ fontWeight: 800, mb: 1.4 }}>
                  AI tavsiyalar
                </Typography>
                <Stack spacing={1}>
                  {executive.recommendations.map((r, i) => (
                    <Typography
                      key={i}
                      sx={{ color: ui.textSoft, fontSize: "0.84rem" }}
                    >
                      • {r}
                    </Typography>
                  ))}
                </Stack>
              </Box>
            </DashboardPaper>
          </Grid>

          <Grid item xs={12} md={4}>
            <DashboardPaper sx={{ height: "100%" }}>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.4 }}>
                  Ogohlantirishlar
                </Typography>
                <Stack spacing={1.1}>
                  {alerts.map((o) => (
                    <Box
                      key={o.id}
                      sx={{
                        display: "flex",
                        gap: 1.2,
                        alignItems: "flex-start",
                        p: 1.1,
                        borderRadius: 2,
                        background: "rgba(255,255,255,0.02)",
                        border: `1px solid ${ui.border}`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          mt: 0.7,
                          borderRadius: "50%",
                          background: getSeverityColor(o.daraja),
                          flexShrink: 0,
                        }}
                      />
                      <Box>
                        <Typography
                          sx={{ fontSize: "0.84rem", color: ui.textMain }}
                        >
                          {o.xabar}
                        </Typography>
                        <Typography
                          sx={{
                            fontSize: "0.72rem",
                            color: ui.textMuted,
                            mt: 0.3,
                          }}
                        >
                          {o.daraja}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Stack>
              </Box>
            </DashboardPaper>
          </Grid>
        </Grid>
      )}

      {tab === 1 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <UnitScoreCard unit={eaf} />
          </Grid>
          <Grid item xs={12} md={3}>
            <UnitScoreCard unit={lrf} />
          </Grid>
          <Grid item xs={12} md={3}>
            <UnitScoreCard unit={tsc} />
          </Grid>
          <Grid item xs={12} md={3}>
            <UnitScoreCard unit={vod} />
          </Grid>

          <Grid item xs={12} md={3}>
            <MiniInfoCard
              title="EAF"
              rows={[
                { label: "Heatlar", value: fmtN(eaf.totalHeats, 0) },
                {
                  label: "Jami energiya",
                  value: `${fmtN(eaf.totalEnergy, 0)} kWh`,
                  color: "#f59e0b",
                },
                { label: "kWh/t", value: fmtN(eaf.avgKwhPerTon, 1) },
                { label: "Delay", value: `${fmtN(eaf.avgDelay, 0)} min` },
                { label: "LOM/HBI", value: fmtN(eaf.avgRatio, 2) },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <MiniInfoCard
              title="LRF"
              rows={[
                { label: "Heatlar", value: fmtN(lrf.totalHeats, 0) },
                {
                  label: "kWh/t",
                  value: fmtN(lrf.avgKwhPerTon, 1),
                  color: "#f59e0b",
                },
                { label: "Harorat", value: `${fmtN(lrf.avgTemp, 0)} °C` },
                { label: "Delay", value: `${fmtN(lrf.avgDelay, 0)} min` },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <MiniInfoCard
              title="TSC"
              rows={[
                { label: "Heatlar", value: fmtN(tsc.totalHeats, 0) },
                { label: "Slablar", value: fmtN(tsc.totalSlabs, 0) },
                {
                  label: "Cast speed",
                  value: `${fmtN(tsc.avgCastSpeed, 2)} m/min`,
                  color: "#22c55e",
                },
                { label: "Superheat", value: `${fmtN(tsc.avgDelta, 1)} °C` },
              ]}
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <MiniInfoCard
              title="VOD"
              rows={[
                { label: "Heatlar", value: fmtN(vod.totalHeats, 0) },
                {
                  label: "Yield loss",
                  value: `${fmtN(vod.avgYieldLoss, 2)} %`,
                  color: "#ef4444",
                },
                { label: "Min vacuum", value: fmtN(vod.avgMinVac, 2) },
                { label: "Delay", value: `${fmtN(vod.avgDelay, 0)} min` },
              ]}
            />
          </Grid>
        </Grid>
      )}

      {tab === 2 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <DashboardPaper>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                  Harorat dinamikasi
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tempChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                      <XAxis
                        dataKey="time"
                        tick={{ fill: ui.textMuted, fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: ui.textMuted, fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Line
                        dataKey="eaf"
                        name="EAF"
                        stroke="#f97316"
                        strokeWidth={2.4}
                        dot={false}
                      />
                      <Line
                        dataKey="lrf"
                        name="LRF"
                        stroke="#facc15"
                        strokeWidth={2.4}
                        dot={false}
                      />
                      <Line
                        dataKey="tsc"
                        name="TSC"
                        stroke="#22c55e"
                        strokeWidth={2.4}
                        dot={false}
                      />
                      <Line
                        dataKey="vod"
                        name="VOD"
                        stroke="#38bdf8"
                        strokeWidth={2.4}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DashboardPaper>
          </Grid>

          <Grid item xs={12} md={5}>
            <DashboardPaper>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                  Ishlab chiqarish dinamikasi
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={productionChartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                      <XAxis
                        dataKey="kun"
                        tick={{ fill: ui.textMuted, fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: ui.textMuted, fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        dataKey="eaf"
                        name="EAF"
                        fill="#f97316"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="lrf"
                        name="LRF"
                        fill="#facc15"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="tsc"
                        name="TSC"
                        fill="#22c55e"
                        radius={[4, 4, 0, 0]}
                      />
                      <Bar
                        dataKey="vod"
                        name="VOD"
                        fill="#38bdf8"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DashboardPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <DashboardPaper>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                  Samaradorlik ballari
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={scoreChart}>
                      <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: ui.textMuted, fontSize: 11 }}
                      />
                      <YAxis
                        tick={{ fill: ui.textMuted, fontSize: 11 }}
                        domain={[0, 100]}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        dataKey="score"
                        name="Ball"
                        stroke="#0ea5e9"
                        fill="#0ea5e9"
                        fillOpacity={0.18}
                        strokeWidth={2.4}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DashboardPaper>
          </Grid>

          <Grid item xs={12} md={6}>
            <DashboardPaper>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                  Jarayonlar taqqoslanishi
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={[
                        {
                          subject: "Barqarorlik",
                          EAF: eaf.score,
                          LRF: lrf.score,
                          TSC: tsc.score,
                          VOD: vod.score,
                        },
                        {
                          subject: "Kechikish",
                          EAF: Math.max(0, 100 - eaf.avgDelay * 5),
                          LRF: Math.max(0, 100 - lrf.avgDelay * 6),
                          TSC: Math.max(0, 100 - tsc.avgDelay * 7),
                          VOD: Math.max(0, 100 - vod.avgDelay * 7),
                        },
                        {
                          subject: "Hajm",
                          EAF: Math.min(100, eaf.totalTons / 3),
                          LRF: Math.min(100, lrf.totalTons / 3),
                          TSC: Math.min(100, tsc.totalTons / 3),
                          VOD: Math.min(100, vod.totalTons / 3),
                        },
                        {
                          subject: "Sifat",
                          EAF: 78,
                          LRF: 82,
                          TSC: Math.max(
                            0,
                            Math.min(100, 50 + tsc.avgDelta * 2),
                          ),
                          VOD: Math.max(0, 100 - vod.avgYieldLoss * 18),
                        },
                      ]}
                    >
                      <PolarGrid stroke={ui.grid} />
                      <PolarAngleAxis
                        dataKey="subject"
                        tick={{ fill: ui.textMuted, fontSize: 11 }}
                      />
                      <Radar
                        name="EAF"
                        dataKey="EAF"
                        stroke="#f97316"
                        fill="#f97316"
                        fillOpacity={0.12}
                      />
                      <Radar
                        name="LRF"
                        dataKey="LRF"
                        stroke="#facc15"
                        fill="#facc15"
                        fillOpacity={0.12}
                      />
                      <Radar
                        name="TSC"
                        dataKey="TSC"
                        stroke="#22c55e"
                        fill="#22c55e"
                        fillOpacity={0.12}
                      />
                      <Radar
                        name="VOD"
                        dataKey="VOD"
                        stroke="#38bdf8"
                        fill="#38bdf8"
                        fillOpacity={0.12}
                      />
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DashboardPaper>
          </Grid>
        </Grid>
      )}

      {tab === 3 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <ForecastCard
              title="EAF prognozi"
              forecast={eaf.forecast}
              color="#f97316"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <ForecastCard
              title="LRF prognozi"
              forecast={lrf.forecast}
              color="#facc15"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <ForecastCard
              title="TSC prognozi"
              forecast={tsc.forecast}
              color="#22c55e"
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <ForecastCard
              title="VOD prognozi"
              forecast={vod.forecast}
              color="#38bdf8"
            />
          </Grid>

          <Grid item xs={12}>
            <DashboardPaper>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                  Prognozlar taqqoslanishi
                </Typography>
                <Box sx={{ height: 320 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Ertaga",
                          EAF: eaf.forecast.tomorrow,
                          LRF: lrf.forecast.tomorrow,
                          TSC: tsc.forecast.tomorrow,
                          VOD: vod.forecast.tomorrow,
                        },
                        {
                          name: "Oy yakuni",
                          EAF: eaf.forecast.monthEnd,
                          LRF: lrf.forecast.monthEnd,
                          TSC: tsc.forecast.monthEnd,
                          VOD: vod.forecast.monthEnd,
                        },
                        {
                          name: "Yil yakuni",
                          EAF: eaf.forecast.yearEnd,
                          LRF: lrf.forecast.yearEnd,
                          TSC: tsc.forecast.yearEnd,
                          VOD: vod.forecast.yearEnd,
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: ui.textMuted, fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: ui.textMuted, fontSize: 11 }} />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar dataKey="EAF" fill="#f97316" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="LRF" fill="#facc15" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="TSC" fill="#22c55e" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="VOD" fill="#38bdf8" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DashboardPaper>
          </Grid>
        </Grid>
      )}

      {tab === 4 && (
        <DashboardPaper sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 800, mb: 2 }}>
            AI aniqlagan muhim og‘ishlar
          </Typography>

          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Jarayon</TableCell>
                  <TableCell>Heat ID</TableCell>
                  <TableCell>Muammo</TableCell>
                  <TableCell>Qiymat</TableCell>
                  <TableCell>Risk</TableCell>
                  <TableCell>Amal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {anomalies.length ? (
                  anomalies.slice(0, 20).map((a, i) => (
                    <TableRow key={i} hover>
                      <TableCell>{a.process}</TableCell>
                      <TableCell>{a.heatId}</TableCell>
                      <TableCell>{a.type}</TableCell>
                      <TableCell>{a.value}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={a.risk.label}
                          sx={{
                            background: `${a.risk.color}22`,
                            color: a.risk.color,
                            border: `1px solid ${a.risk.color}55`,
                            fontWeight: 700,
                          }}
                        />
                      </TableCell>
                      <TableCell>
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => setSelectedAnomaly(a)}
                        >
                          Ko‘rish
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Muammo topilmadi
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>

          <HeatDetailDrawer
            open={!!selectedAnomaly}
            onClose={() => setSelectedAnomaly(null)}
            item={selectedAnomaly}
          />
        </DashboardPaper>
      )}

      {tab === 5 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={3}>
            <MiniInfoCard
              title="Oxirgi EAF"
              rows={
                latestEAF
                  ? [
                      ["Heat ID", `#${latestEAF.heatId}`],
                      ["Steel", safeText(latestEAF.steelGradeName)],
                      ["Boshlanish", formatDateTime(latestEAF.startTime)],
                      ["Shift", safeShift(latestEAF.shift)],
                      ["kWh/t", fmtN(latestEAF.kwhPerTon, 1)],
                    ].map(([label, value]) => ({ label, value }))
                  : [{ label: "Holat", value: "Ma'lumot yo'q" }]
              }
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <MiniInfoCard
              title="Oxirgi LRF"
              rows={
                latestLRF
                  ? [
                      ["Heat ID", `#${latestLRF.heatId}`],
                      ["Steel", safeText(latestLRF.steelGradeName)],
                      ["Boshlanish", formatDateTime(latestLRF.startTime)],
                      ["Shift", safeShift(latestLRF.shift)],
                      ["Harorat", `${fmtN(latestLRF.latestTemp, 0)} °C`],
                    ].map(([label, value]) => ({ label, value }))
                  : [{ label: "Holat", value: "Ma'lumot yo'q" }]
              }
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <MiniInfoCard
              title="Oxirgi TSC"
              rows={
                latestTSC
                  ? [
                      ["Heat ID", `#${latestTSC.heatId}`],
                      ["Steel", safeText(latestTSC.steelGradeName)],
                      ["Opening", formatDateTime(latestTSC.ladleOpeningDate)],
                      ["Shift", safeShift(latestTSC.shift)],
                      [
                        "Cast speed",
                        `${fmtN(latestTSC.castSpeedAvg, 2)} m/min`,
                      ],
                    ].map(([label, value]) => ({ label, value }))
                  : [{ label: "Holat", value: "Ma'lumot yo'q" }]
              }
            />
          </Grid>

          <Grid item xs={12} md={3}>
            <MiniInfoCard
              title="Oxirgi VOD"
              rows={
                latestVOD
                  ? [
                      ["Heat ID", `#${latestVOD.heatId}`],
                      ["Steel", safeText(latestVOD.steelGradeName)],
                      ["Boshlanish", formatDateTime(latestVOD.startTime)],
                      ["Shift", safeShift(latestVOD.shift)],
                      ["Yield loss", `${fmtN(latestVOD.yieldLossPct, 2)} %`],
                    ].map(([label, value]) => ({ label, value }))
                  : [{ label: "Holat", value: "Ma'lumot yo'q" }]
              }
            />
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

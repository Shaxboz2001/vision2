// import { useMemo } from "react";
// import dayjs from "dayjs";
// import {
//   Box,
//   Grid,
//   Paper,
//   Table,
//   TableHead,
//   TableRow,
//   TableCell,
//   TableBody,
//   Typography,
//   LinearProgress,
//   Chip,
//   Stack,
//   Divider,
//   useTheme,
//   alpha,
// } from "@mui/material";
// import {
//   BarChart,
//   Bar,
//   LineChart,
//   Line,
//   XAxis,
//   YAxis,
//   Tooltip,
//   ResponsiveContainer,
//   CartesianGrid,
//   Legend,
// } from "recharts";

// import {
//   KpiCard,
//   StatusChip,
//   DarajaChip,
//   SectionHeader,
//   LiveBadge,
//   CardSkeleton,
// } from "@/components/common";

// import {
//   useAllProductionStats,
//   PERIOD_OPTIONS,
//   PERIOD_LABELS,
// } from "@/hooks/useProduction";

// /* ═══════════════════════════════════════════════════════════════
//    HELPERS
// ═══════════════════════════════════════════════════════════════ */

// const safeArr = (v) => (Array.isArray(v) ? v : []);

// const fmtN = (n, d = 0) =>
//   Number(n || 0).toLocaleString("ru-RU", {
//     minimumFractionDigits: d,
//     maximumFractionDigits: d,
//   });

// const sum = (arr = []) => arr.reduce((a, b) => a + Number(b || 0), 0);

// const avg = (arr = []) => {
//   const vals = arr.map((x) => Number(x)).filter((x) => Number.isFinite(x));
//   return vals.length ? sum(vals) / vals.length : 0;
// };

// const kgToTon = (kg) => Number(kg || 0) / 1000;

// const minutesBetween = (start, stop) => {
//   if (!start || !stop) return 0;
//   const ms = new Date(stop).getTime() - new Date(start).getTime();
//   return ms > 0 ? Math.round(ms / 60000) : 0;
// };

// const formatDateTime = (v) => {
//   if (!v) return "—";
//   const d = dayjs(v);
//   if (!d.isValid()) return "—";
//   return d.format("DD.MM HH:mm");
// };

// const getTemps = (heat) =>
//   safeArr(heat?.temperatures)
//     .map((t) => ({
//       value: Number(t?.temperature || 0),
//       o2: Number(t?.o2 || 0),
//       carbon: Number(t?.carbon || 0),
//       time: t?.dateTime || null,
//     }))
//     .filter((x) => Number.isFinite(x.value));

// const getAvgTemp = (heat) => avg(getTemps(heat).map((x) => x.value));

// const getLastTemp = (heat) => {
//   const arr = getTemps(heat);
//   return arr.length ? arr[arr.length - 1].value : 0;
// };

// const getDelayMinutes = (heat) =>
//   sum(
//     safeArr(heat?.delays).map((d) => minutesBetween(d?.startTime, d?.stopTime)),
//   );

// const calcKwhPerTon = (energy, weightKg) => {
//   const ton = kgToTon(weightKg);
//   return ton > 0 ? Number(energy || 0) / ton : 0;
// };

// const pickLatest = (arr, startField = "startTime") => {
//   const list = safeArr(arr);
//   if (!list.length) return null;

//   return [...list].sort((a, b) => {
//     const ta = new Date(a?.[startField] || 0).getTime();
//     const tb = new Date(b?.[startField] || 0).getTime();
//     return tb - ta;
//   })[0];
// };

// const groupByDay = (items, dateField, valueFn) => {
//   const map = {};

//   safeArr(items).forEach((item) => {
//     const d = item?.[dateField];
//     if (!d) return;

//     const key = dayjs(d).format("DD.MM");
//     if (!map[key]) map[key] = [];
//     map[key].push(item);
//   });

//   return Object.entries(map).map(([kun, arr]) => ({
//     kun,
//     value: valueFn(arr),
//   }));
// };

// const mergeProdSeries = ({ eaf, lrf, vod, tsc }) => {
//   const keys = new Set([
//     ...eaf.map((x) => x.kun),
//     ...lrf.map((x) => x.kun),
//     ...vod.map((x) => x.kun),
//     ...tsc.map((x) => x.kun),
//   ]);

//   return [...keys]
//     .map((kun) => ({
//       kun,
//       eaf: eaf.find((x) => x.kun === kun)?.value || 0,
//       lrf: lrf.find((x) => x.kun === kun)?.value || 0,
//       vod: vod.find((x) => x.kun === kun)?.value || 0,
//       tsc: tsc.find((x) => x.kun === kun)?.value || 0,
//     }))
//     .sort((a, b) => {
//       const [ad, am] = a.kun.split(".").map(Number);
//       const [bd, bm] = b.kun.split(".").map(Number);
//       return am === bm ? ad - bd : am - bm;
//     });
// };

// const mergeTempSeries = (seriesMap) => {
//   const bucket = new Map();

//   Object.entries(seriesMap).forEach(([key, arr]) => {
//     safeArr(arr).forEach((p, idx) => {
//       const label = p.time ? dayjs(p.time).format("HH:mm") : `${idx + 1}`;
//       const old = bucket.get(label) || { time: label };
//       old[key] = p.value;
//       bucket.set(label, old);
//     });
//   });

//   return [...bucket.values()].sort((a, b) => a.time.localeCompare(b.time));
// };

// const getSeverityColor = (v) => {
//   if (v === "kritik") return "#ef4444";
//   if (v === "ogohlantirish") return "#f59e0b";
//   return "#0ea5e9";
// };

// const getStatusByProcess = (heat, type) => {
//   if (!heat) return "toxtagan";

//   if (type === "EAF") {
//     const lastTemp = getLastTemp(heat);
//     const delay = getDelayMinutes(heat);
//     if (delay > 30 || lastTemp > 1700) return "ogohlantirish";
//     return "faol";
//   }

//   if (type === "LRF") {
//     const lastTemp = getLastTemp(heat);
//     if ((heat?.powerOnTime || 0) > 80 || lastTemp > 1700)
//       return "ogohlantirish";
//     return "faol";
//   }

//   if (type === "VOD") {
//     if ((heat?.minVacuumPressure || 0) > 5) return "ogohlantirish";
//     return "faol";
//   }

//   if (type === "TSC") {
//     const avgCastSpeed = avg(
//       safeArr(heat?.tscStrands).map((s) => Number(s?.castSpeedAvg || 0)),
//     );
//     if (avgCastSpeed > 0 && avgCastSpeed < 0.8) return "ogohlantirish";
//     return "faol";
//   }

//   return "faol";
// };

// /* ═══════════════════════════════════════════════════════════════
//    UI HELPERS
// ═══════════════════════════════════════════════════════════════ */

// function useDashboardUi() {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === "dark";

//   return {
//     isDark,
//     bg: theme.palette.background.default,
//     paper: theme.palette.background.paper,
//     border: isDark ? "rgba(148,163,184,0.16)" : "rgba(15,23,42,0.08)",
//     borderStrong: isDark ? "rgba(148,163,184,0.26)" : "rgba(15,23,42,0.12)",
//     textMain: isDark ? "#e5eef9" : "#0f172a",
//     textSoft: isDark ? "#a8b3c7" : "#475569",
//     textMuted: isDark ? "#7c8aa5" : "#64748b",
//     paperSoft: isDark
//       ? "linear-gradient(180deg, rgba(15,23,42,0.92), rgba(12,18,32,0.96))"
//       : "linear-gradient(180deg, #ffffff, #f8fbff)",
//     sectionBg: isDark ? "rgba(255,255,255,0.02)" : "rgba(2,6,23,0.015)",
//     shadow: isDark
//       ? "0 10px 28px rgba(0,0,0,0.24)"
//       : "0 10px 24px rgba(15,23,42,0.06)",
//     progressBg: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
//     gridStroke: isDark ? "rgba(148,163,184,0.18)" : "rgba(15,23,42,0.10)",
//     chartTick: isDark ? "#94a3b8" : "#64748b",
//     danger: "#ef4444",
//     warning: "#f59e0b",
//     info: "#0ea5e9",
//     success: "#10b981",
//     orange: "#f97316",
//     blue: "#38bdf8",
//     yellow: "#facc15",
//     cyan: "#06b6d4",
//     green: "#22c55e",
//     cellHeadBg: isDark ? "rgba(255,255,255,0.025)" : "rgba(15,23,42,0.03)",
//   };
// }

// function DashboardPaper({ children, sx = {} }) {
//   const ui = useDashboardUi();

//   return (
//     <Paper
//       sx={{
//         background: ui.paperSoft,
//         border: `1px solid ${ui.border}`,
//         boxShadow: ui.shadow,
//         borderRadius: 3,
//         overflow: "hidden",
//         ...sx,
//       }}
//     >
//       {children}
//     </Paper>
//   );
// }

// /* ═══════════════════════════════════════════════════════════════
//    TOOLTIP
// ═══════════════════════════════════════════════════════════════ */

// function CustomTooltip({ active, payload, label }) {
//   const ui = useDashboardUi();

//   if (!active || !payload?.length) return null;

//   return (
//     <Box
//       sx={{
//         background: ui.isDark ? "#0f172a" : "#ffffff",
//         border: `1px solid ${ui.borderStrong}`,
//         p: 1.5,
//         borderRadius: 2,
//         minWidth: 160,
//         boxShadow: ui.shadow,
//       }}
//     >
//       <Typography
//         sx={{
//           fontFamily: "'Share Tech Mono', monospace",
//           fontSize: "0.72rem",
//           color: ui.textSoft,
//           mb: 0.8,
//           fontWeight: 700,
//         }}
//       >
//         {label}
//       </Typography>

//       {payload.map((p) => (
//         <Typography
//           key={`${p.name}-${p.dataKey}`}
//           sx={{
//             fontFamily: "'Share Tech Mono', monospace",
//             fontSize: "0.82rem",
//             color: p.color,
//             lineHeight: 1.7,
//             fontWeight: 700,
//           }}
//         >
//           {p.name}: {fmtN(p.value, 1)}
//         </Typography>
//       ))}
//     </Box>
//   );
// }

// /* ═══════════════════════════════════════════════════════════════
//    SMALL INFO CARD
// ═══════════════════════════════════════════════════════════════ */

// function MiniInfoCard({ title, rows = [] }) {
//   const ui = useDashboardUi();

//   return (
//     <DashboardPaper sx={{ p: 2.2, height: "100%" }}>
//       <Typography
//         sx={{
//           fontSize: "1rem",
//           fontWeight: 800,
//           mb: 1.5,
//           color: ui.textMain,
//           letterSpacing: "0.02em",
//         }}
//       >
//         {title}
//       </Typography>

//       <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
//         {rows.map((r, idx) => (
//           <Box key={r.label}>
//             <Box
//               sx={{
//                 display: "flex",
//                 justifyContent: "space-between",
//                 gap: 2,
//                 alignItems: "center",
//               }}
//             >
//               <Typography
//                 sx={{
//                   fontSize: "0.86rem",
//                   color: ui.textSoft,
//                   fontWeight: 500,
//                 }}
//               >
//                 {r.label}
//               </Typography>
//               <Typography
//                 sx={{
//                   fontSize: "0.88rem",
//                   fontWeight: 800,
//                   fontFamily: "'Share Tech Mono', monospace",
//                   color: r.color || ui.textMain,
//                   textAlign: "right",
//                 }}
//               >
//                 {r.value}
//               </Typography>
//             </Box>
//             {idx < rows.length - 1 && (
//               <Divider sx={{ mt: 1, borderColor: ui.border }} />
//             )}
//           </Box>
//         ))}
//       </Box>
//     </DashboardPaper>
//   );
// }

// /* ═══════════════════════════════════════════════════════════════
//    DASHBOARD
// ═══════════════════════════════════════════════════════════════ */

// export default function Dashboard() {
//   const ui = useDashboardUi();

//   const { eaf, lrf, vod, tsc, period, setPeriod, periodLabel, isAnyLoading } =
//     useAllProductionStats("today");

//   const eafList = safeArr(eaf?.data);
//   const lrfList = safeArr(lrf?.data);
//   const vodList = safeArr(vod?.data);
//   const tscList = safeArr(tsc?.data);

//   const latestEAF = useMemo(() => pickLatest(eafList, "startTime"), [eafList]);
//   const latestLRF = useMemo(() => pickLatest(lrfList, "startTime"), [lrfList]);
//   const latestVOD = useMemo(() => pickLatest(vodList, "startTime"), [vodList]);
//   const latestTSC = useMemo(
//     () => pickLatest(tscList, "ladleOpeningDate"),
//     [tscList],
//   );

//   const kpiItems = useMemo(() => {
//     const totalProductionTon =
//       kgToTon(sum(eafList.map((x) => x.tappingWeight))) +
//       kgToTon(sum(lrfList.map((x) => x.finalSteelWeight))) +
//       kgToTon(sum(vodList.map((x) => x.finalSteelWeight))) +
//       kgToTon(sum(tscList.map((x) => x.finalSteelWeight)));

//     const totalEnergy =
//       sum(eafList.map((x) => x.electricalEnergy)) +
//       sum(lrfList.map((x) => x.electricalEnergy));

//     const allTemps = [
//       ...eafList.map(getAvgTemp),
//       ...lrfList.map(getAvgTemp),
//       ...vodList.map(getAvgTemp),
//       ...tscList.map(getAvgTemp),
//     ].filter(Boolean);

//     const avgTemp = avg(allTemps);

//     const activeUnits = [latestEAF, latestLRF, latestVOD, latestTSC].filter(
//       Boolean,
//     ).length;
//     const totalUnits = 4;

//     const totalTempPoints =
//       sum(eafList.map((x) => safeArr(x.temperatures).length)) +
//       sum(lrfList.map((x) => safeArr(x.temperatures).length)) +
//       sum(vodList.map((x) => safeArr(x.temperatures).length)) +
//       sum(tscList.map((x) => safeArr(x.temperatures).length));

//     return [
//       {
//         label: "ISHLAB CHIQARISH",
//         value: fmtN(totalProductionTon, 1),
//         unit: "t",
//         trend: `${periodLabel} bo'yicha`,
//         trendUp: true,
//         color: ui.orange,
//       },
//       {
//         label: "FAOL USKUNALAR",
//         value: `${activeUnits}/${totalUnits}`,
//         unit: "",
//         trend: "EAF / LRF / VOD / TSC",
//         trendUp: true,
//         color: ui.blue,
//       },
//       {
//         label: "O'RTA HARORAT",
//         value: fmtN(avgTemp, 0),
//         unit: "°C",
//         trend: "Barcha jarayonlar bo'yicha",
//         trendUp: false,
//         color: ui.danger,
//       },
//       {
//         label: "FAOL DATCHIKLAR",
//         value: fmtN(totalTempPoints, 0),
//         unit: "",
//         trend: "Temperatura nuqtalari",
//         trendUp: true,
//         color: ui.success,
//       },
//       {
//         label: "ENERGIYA SARFI",
//         value: fmtN(totalEnergy, 0),
//         unit: "kWh",
//         trend: "EAF + LRF",
//         trendUp: false,
//         color: ui.yellow,
//       },
//     ];
//   }, [
//     eafList,
//     lrfList,
//     vodList,
//     tscList,
//     latestEAF,
//     latestLRF,
//     latestVOD,
//     latestTSC,
//     periodLabel,
//     ui,
//   ]);

//   const processRows = useMemo(() => {
//     const eafKwhTon = latestEAF
//       ? calcKwhPerTon(latestEAF.electricalEnergy, latestEAF.tappingWeight)
//       : 0;

//     const lrfKwhTon = latestLRF
//       ? calcKwhPerTon(latestLRF.electricalEnergy, latestLRF.finalSteelWeight)
//       : 0;

//     const vodDuration = latestVOD
//       ? minutesBetween(latestVOD.startTime, latestVOD.stopTime)
//       : 0;

//     const tscAvgSpeed = latestTSC
//       ? avg(safeArr(latestTSC.tscStrands).map((s) => s.castSpeedAvg))
//       : 0;

//     return [
//       {
//         id: "EAF",
//         emoji: "🔥",
//         nom: "EAF",
//         holat: getStatusByProcess(latestEAF, "EAF"),
//         uchastkalar: 1,
//         faolUskunalar: latestEAF ? 1 : 0,
//         uskunalar: 1,
//         yuk: Math.min(100, Math.round(eafKwhTon)),
//         harorat: Math.round(getLastTemp(latestEAF)),
//         count: eafList.length,
//         meta: latestEAF
//           ? `#${latestEAF.heatId} • ${latestEAF.steelGradeName || "—"}`
//           : "Ma'lumot yo'q",
//       },
//       {
//         id: "LRF",
//         emoji: "⚡",
//         nom: "LRF",
//         holat: getStatusByProcess(latestLRF, "LRF"),
//         uchastkalar: 1,
//         faolUskunalar: latestLRF ? 1 : 0,
//         uskunalar: 1,
//         yuk: Math.min(100, Math.round(lrfKwhTon)),
//         harorat: Math.round(getLastTemp(latestLRF)),
//         count: lrfList.length,
//         meta: latestLRF
//           ? `#${latestLRF.heatId} • ${latestLRF.steelGradeName || "—"}`
//           : "Ma'lumot yo'q",
//       },
//       {
//         id: "VOD",
//         emoji: "🫧",
//         nom: "VOD",
//         holat: getStatusByProcess(latestVOD, "VOD"),
//         uchastkalar: 1,
//         faolUskunalar: latestVOD ? 1 : 0,
//         uskunalar: 1,
//         yuk: Math.min(100, Math.round(vodDuration)),
//         harorat: Math.round(getLastTemp(latestVOD)),
//         count: vodList.length,
//         meta: latestVOD
//           ? `#${latestVOD.heatId} • ${latestVOD.steelGradeName || "—"}`
//           : "Ma'lumot yo'q",
//       },
//       {
//         id: "TSC",
//         emoji: "🏭",
//         nom: "TSC",
//         holat: getStatusByProcess(latestTSC, "TSC"),
//         uchastkalar: 1,
//         faolUskunalar: latestTSC ? 1 : 0,
//         uskunalar: 1,
//         yuk: Math.min(100, Math.round(tscAvgSpeed * 100)),
//         harorat: Math.round(getLastTemp(latestTSC)),
//         count: tscList.length,
//         meta: latestTSC
//           ? `#${latestTSC.heatId} • ${latestTSC.steelGradeName || "—"}`
//           : "Ma'lumot yo'q",
//       },
//     ];
//   }, [
//     latestEAF,
//     latestLRF,
//     latestVOD,
//     latestTSC,
//     eafList,
//     lrfList,
//     vodList,
//     tscList,
//   ]);

//   const alerts = useMemo(() => {
//     const out = [];

//     if (latestEAF) {
//       const eafKwhTon = calcKwhPerTon(
//         latestEAF.electricalEnergy,
//         latestEAF.tappingWeight,
//       );

//       if (eafKwhTon > 520) {
//         out.push({
//           id: "eaf-energy",
//           xabar: `EAF energiya sarfi yuqori: ${fmtN(eafKwhTon, 1)} kWh/t`,
//           daraja: "kritik",
//           vaqt: new Date().toISOString(),
//         });
//       }

//       const delayMin = getDelayMinutes(latestEAF);
//       if (delayMin > 30) {
//         out.push({
//           id: "eaf-delay",
//           xabar: `EAF bekor turish vaqti yuqori: ${delayMin} min`,
//           daraja: "ogohlantirish",
//           vaqt: new Date().toISOString(),
//         });
//       }
//     }

//     if (latestLRF) {
//       const lrfKwhTon = calcKwhPerTon(
//         latestLRF.electricalEnergy,
//         latestLRF.finalSteelWeight,
//       );

//       if (lrfKwhTon > 80) {
//         out.push({
//           id: "lrf-energy",
//           xabar: `LRF energiya sarfi yuqori: ${fmtN(lrfKwhTon, 1)} kWh/t`,
//           daraja: "ogohlantirish",
//           vaqt: new Date().toISOString(),
//         });
//       }
//     }

//     if (latestVOD) {
//       if ((latestVOD.minVacuumPressure || 0) > 5) {
//         out.push({
//           id: "vod-pressure",
//           xabar: `VOD vacuum pressure normadan yuqori: ${fmtN(
//             latestVOD.minVacuumPressure,
//             2,
//           )}`,
//           daraja: "kritik",
//           vaqt: new Date().toISOString(),
//         });
//       }
//     }

//     if (latestTSC) {
//       const avgCastSpeed = avg(
//         safeArr(latestTSC.tscStrands).map((s) => s.castSpeedAvg),
//       );

//       if (avgCastSpeed > 0 && avgCastSpeed < 0.8) {
//         out.push({
//           id: "tsc-speed",
//           xabar: `TSC quyish tezligi past: ${fmtN(avgCastSpeed, 2)} m/min`,
//           daraja: "kritik",
//           vaqt: new Date().toISOString(),
//         });
//       }
//     }

//     if (!out.length) {
//       out.push({
//         id: "normal",
//         xabar: "Muhim ogohlantirish aniqlanmadi",
//         daraja: "info",
//         vaqt: new Date().toISOString(),
//       });
//     }

//     return out;
//   }, [latestEAF, latestLRF, latestVOD, latestTSC]);

//   const tempChartData = useMemo(() => {
//     return mergeTempSeries({
//       eaf: getTemps(latestEAF),
//       lrf: getTemps(latestLRF),
//       vod: getTemps(latestVOD),
//       tsc: getTemps(latestTSC),
//     });
//   }, [latestEAF, latestLRF, latestVOD, latestTSC]);

//   const productionChartData = useMemo(() => {
//     const eafSeries = groupByDay(eafList, "productionDate", (arr) =>
//       kgToTon(sum(arr.map((x) => x.tappingWeight))),
//     );

//     const lrfSeries = groupByDay(lrfList, "productionDate", (arr) =>
//       kgToTon(sum(arr.map((x) => x.finalSteelWeight))),
//     );

//     const vodSeries = groupByDay(vodList, "productionDate", (arr) =>
//       kgToTon(sum(arr.map((x) => x.finalSteelWeight))),
//     );

//     const tscSeries = groupByDay(tscList, "productionDate", (arr) =>
//       kgToTon(sum(arr.map((x) => x.finalSteelWeight))),
//     );

//     return mergeProdSeries({
//       eaf: eafSeries,
//       lrf: lrfSeries,
//       vod: vodSeries,
//       tsc: tscSeries,
//     });
//   }, [eafList, lrfList, vodList, tscList]);

//   const tscStats = useMemo(() => {
//     const totalSlabs = sum(
//       tscList.map((heat) => safeArr(heat.tscProducts).length),
//     );

//     const totalCastLength = sum(
//       tscList.flatMap((heat) =>
//         safeArr(heat.tscStrands).map((s) => Number(s.castLength || 0)),
//       ),
//     );

//     const avgCastSpeed = avg(
//       tscList.flatMap((heat) =>
//         safeArr(heat.tscStrands).map((s) => Number(s.castSpeedAvg || 0)),
//       ),
//     );

//     const avgTundishLife = avg(
//       tscList.map((heat) => Number(heat.tundishLife || 0)),
//     );

//     return {
//       totalSlabs,
//       totalCastLength,
//       avgCastSpeed,
//       avgTundishLife,
//     };
//   }, [tscList]);

//   const planItems = useMemo(() => {
//     return [
//       {
//         nom: "EAF Eritish",
//         plan: 900,
//         haqiqiy: kgToTon(sum(eafList.map((x) => x.tappingWeight))),
//         color: ui.orange,
//       },
//       {
//         nom: "LRF Qayta Ishlov",
//         plan: 900,
//         haqiqiy: kgToTon(sum(lrfList.map((x) => x.finalSteelWeight))),
//         color: ui.yellow,
//       },
//       {
//         nom: "VOD Vakuum",
//         plan: 700,
//         haqiqiy: kgToTon(sum(vodList.map((x) => x.finalSteelWeight))),
//         color: ui.blue,
//       },
//       {
//         nom: "TSC Quyish",
//         plan: 850,
//         haqiqiy: kgToTon(sum(tscList.map((x) => x.finalSteelWeight))),
//         color: ui.success,
//       },
//     ];
//   }, [eafList, lrfList, vodList, tscList, ui]);

//   const hasFatalError =
//     eaf?.isError && lrf?.isError && vod?.isError && tsc?.isError;

//   if (hasFatalError) {
//     return (
//       <Box sx={{ p: 3 }}>
//         <DashboardPaper sx={{ p: 3 }}>
//           <Typography
//             sx={{
//               fontWeight: 800,
//               fontSize: "1.1rem",
//               mb: 1,
//               color: ui.textMain,
//             }}
//           >
//             Dashboard ma'lumotlarini yuklashda xatolik
//           </Typography>
//           <Typography sx={{ color: ui.textSoft, fontSize: "0.95rem" }}>
//             Barcha API larni tekshirib chiqing.
//           </Typography>
//         </DashboardPaper>
//       </Box>
//     );
//   }

//   return (
//     <Box
//       sx={{
//         p: { xs: 1.5, md: 2.5 },
//         display: "flex",
//         flexDirection: "column",
//         gap: 2,
//       }}
//     >
//       <DashboardPaper sx={{ p: 1.75 }}>
//         <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
//           {PERIOD_OPTIONS.map((opt) => (
//             <Chip
//               key={opt.value}
//               label={opt.label}
//               clickable
//               onClick={() => setPeriod(opt.value)}
//               color={period === opt.value ? "primary" : "default"}
//               sx={{
//                 borderRadius: 2,
//                 fontWeight: 700,
//                 fontSize: "0.82rem",
//                 height: 34,
//               }}
//             />
//           ))}
//           <Chip
//             label={`Tanlangan davr: ${PERIOD_LABELS[period] || period}`}
//             sx={{
//               ml: "auto",
//               fontWeight: 800,
//               fontSize: "0.82rem",
//               height: 34,
//             }}
//           />
//         </Stack>
//       </DashboardPaper>

//       <Grid container spacing={1.5}>
//         {kpiItems.map((item) => (
//           <Grid item xs={12} sm={6} md={2.4} key={item.label}>
//             <KpiCard {...item} loading={isAnyLoading} />
//           </Grid>
//         ))}
//       </Grid>

//       <Grid container spacing={2}>
//         <Grid item xs={12} lg={8}>
//           <DashboardPaper>
//             <SectionHeader title="Bo'linmalar Holati" action="BARCHASI →">
//               <LiveBadge />
//             </SectionHeader>

//             {isAnyLoading ? (
//               <CardSkeleton />
//             ) : (
//               <Table size="small">
//                 <TableHead>
//                   <TableRow
//                     sx={{
//                       background: ui.cellHeadBg,
//                       "& .MuiTableCell-root": {
//                         fontSize: "0.76rem",
//                         fontWeight: 800,
//                         color: ui.textSoft,
//                         letterSpacing: "0.08em",
//                         borderBottomColor: ui.border,
//                       },
//                     }}
//                   >
//                     <TableCell>BO'LINMA NOMI</TableCell>
//                     <TableCell>HOLAT</TableCell>
//                     <TableCell>UCHASTKA</TableCell>
//                     <TableCell>USKUNALAR</TableCell>
//                     <TableCell>YUK</TableCell>
//                     <TableCell>HARORAT</TableCell>
//                   </TableRow>
//                 </TableHead>

//                 <TableBody>
//                   {processRows.map((s) => (
//                     <TableRow
//                       key={s.id}
//                       sx={{
//                         "& .MuiTableCell-root": {
//                           borderBottomColor: ui.border,
//                           py: 1.4,
//                         },
//                         "&:hover": {
//                           background: ui.sectionBg,
//                         },
//                       }}
//                     >
//                       <TableCell>
//                         <Box
//                           sx={{
//                             display: "flex",
//                             alignItems: "center",
//                             gap: 1.2,
//                           }}
//                         >
//                           <Box
//                             sx={{
//                               width: 30,
//                               height: 30,
//                               borderRadius: 2,
//                               display: "grid",
//                               placeItems: "center",
//                               background: alpha(ui.info, 0.1),
//                               fontSize: 16,
//                             }}
//                           >
//                             {s.emoji}
//                           </Box>
//                           <Box>
//                             <Typography
//                               sx={{
//                                 fontWeight: 800,
//                                 fontSize: "0.95rem",
//                                 color: ui.textMain,
//                                 lineHeight: 1.2,
//                               }}
//                             >
//                               {s.nom}
//                             </Typography>
//                             <Typography
//                               sx={{
//                                 fontFamily: "'Share Tech Mono', monospace",
//                                 fontSize: "0.72rem",
//                                 color: ui.textMuted,
//                                 mt: 0.25,
//                               }}
//                             >
//                               {s.meta}
//                             </Typography>
//                           </Box>
//                         </Box>
//                       </TableCell>

//                       <TableCell>
//                         <StatusChip holat={s.holat} />
//                       </TableCell>

//                       <TableCell>
//                         <Typography
//                           sx={{
//                             fontFamily: "'Share Tech Mono', monospace",
//                             fontSize: "0.82rem",
//                             color: ui.textSoft,
//                             fontWeight: 700,
//                           }}
//                         >
//                           {s.uchastkalar} ta
//                         </Typography>
//                       </TableCell>

//                       <TableCell>
//                         <Typography
//                           sx={{
//                             fontFamily: "'Share Tech Mono', monospace",
//                             fontSize: "0.84rem",
//                             fontWeight: 800,
//                             color: ui.textMain,
//                           }}
//                         >
//                           {s.faolUskunalar}/{s.uskunalar}
//                         </Typography>
//                       </TableCell>

//                       <TableCell>
//                         <Box
//                           sx={{
//                             display: "flex",
//                             alignItems: "center",
//                             gap: 1,
//                             minWidth: 150,
//                           }}
//                         >
//                           <LinearProgress
//                             variant="determinate"
//                             value={s.yuk}
//                             sx={{
//                               flex: 1,
//                               height: 8,
//                               borderRadius: 999,
//                               backgroundColor: ui.progressBg,
//                               "& .MuiLinearProgress-bar": {
//                                 borderRadius: 999,
//                                 background:
//                                   s.yuk > 90
//                                     ? ui.warning
//                                     : s.yuk > 0
//                                       ? ui.info
//                                       : ui.textMuted,
//                               },
//                             }}
//                           />
//                           <Typography
//                             sx={{
//                               fontFamily: "'Share Tech Mono', monospace",
//                               fontSize: "0.74rem",
//                               color: s.yuk > 90 ? ui.warning : ui.textSoft,
//                               minWidth: 38,
//                               fontWeight: 700,
//                             }}
//                           >
//                             {s.yuk}%
//                           </Typography>
//                         </Box>
//                       </TableCell>

//                       <TableCell>
//                         <Typography
//                           sx={{
//                             fontFamily: "'Share Tech Mono', monospace",
//                             fontSize: "0.84rem",
//                             fontWeight: 800,
//                             color:
//                               s.harorat > 1650
//                                 ? ui.danger
//                                 : s.harorat > 1450
//                                   ? ui.orange
//                                   : ui.textSoft,
//                           }}
//                         >
//                           {s.harorat ? `${s.harorat}°C` : "—"}
//                         </Typography>
//                       </TableCell>
//                     </TableRow>
//                   ))}
//                 </TableBody>
//               </Table>
//             )}
//           </DashboardPaper>
//         </Grid>

//         <Grid item xs={12} lg={4}>
//           <DashboardPaper sx={{ height: "100%" }}>
//             <SectionHeader
//               title="Ogohlantirishlar"
//               dot={ui.danger}
//               action="HAMMASI →"
//             />
//             <Box sx={{ p: 1.6 }}>
//               {alerts.slice(0, 6).map((o) => (
//                 <Box
//                   key={o.id}
//                   sx={{
//                     display: "flex",
//                     gap: 1.5,
//                     py: 1.2,
//                     borderBottom: `1px solid ${ui.border}`,
//                     "&:last-child": { borderBottom: "none" },
//                   }}
//                 >
//                   <Box
//                     sx={{
//                       width: 4,
//                       borderRadius: 99,
//                       flexShrink: 0,
//                       alignSelf: "stretch",
//                       minHeight: 40,
//                       background: getSeverityColor(o.daraja),
//                     }}
//                   />
//                   <Box sx={{ flex: 1 }}>
//                     <Typography
//                       sx={{
//                         fontSize: "0.88rem",
//                         mb: 0.55,
//                         color: ui.textMain,
//                         lineHeight: 1.45,
//                         fontWeight: 600,
//                       }}
//                     >
//                       {o.xabar}
//                     </Typography>
//                     <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
//                       <DarajaChip daraja={o.daraja} />
//                     </Box>
//                   </Box>
//                   <Typography
//                     sx={{
//                       fontFamily: "'Share Tech Mono', monospace",
//                       fontSize: "0.68rem",
//                       color: ui.textMuted,
//                       whiteSpace: "nowrap",
//                       pt: 0.2,
//                       fontWeight: 700,
//                     }}
//                   >
//                     {Math.round((Date.now() - new Date(o.vaqt)) / 60000)}m
//                   </Typography>
//                 </Box>
//               ))}
//             </Box>
//           </DashboardPaper>
//         </Grid>
//       </Grid>

//       <Grid container spacing={2}>
//         <Grid item xs={12} md={7}>
//           <DashboardPaper>
//             <SectionHeader title="Harorat Grafigi" dot={ui.orange}>
//               <Box sx={{ display: "flex", gap: 2.2, flexWrap: "wrap" }}>
//                 {[
//                   ["EAF", ui.danger],
//                   ["LRF", ui.orange],
//                   ["VOD", ui.blue],
//                   ["TSC", ui.success],
//                 ].map(([n, c]) => (
//                   <Box
//                     key={n}
//                     sx={{ display: "flex", alignItems: "center", gap: 0.7 }}
//                   >
//                     <Box
//                       sx={{
//                         width: 12,
//                         height: 3,
//                         background: c,
//                         borderRadius: 1,
//                       }}
//                     />
//                     <Typography
//                       sx={{
//                         fontFamily: "'Share Tech Mono', monospace",
//                         fontSize: "0.72rem",
//                         color: ui.textSoft,
//                         fontWeight: 700,
//                       }}
//                     >
//                       {n}
//                     </Typography>
//                   </Box>
//                 ))}
//               </Box>
//             </SectionHeader>

//             <Box sx={{ p: 2, height: 290 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <LineChart
//                   data={tempChartData}
//                   margin={{ top: 5, right: 12, left: -10, bottom: 5 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" stroke={ui.gridStroke} />
//                   <XAxis
//                     dataKey="time"
//                     tick={{
//                       fontFamily: "'Share Tech Mono', monospace",
//                       fontSize: 11,
//                       fill: ui.chartTick,
//                     }}
//                     axisLine={{ stroke: ui.gridStroke }}
//                     tickLine={{ stroke: ui.gridStroke }}
//                   />
//                   <YAxis
//                     tick={{
//                       fontFamily: "'Share Tech Mono', monospace",
//                       fontSize: 11,
//                       fill: ui.chartTick,
//                     }}
//                     axisLine={{ stroke: ui.gridStroke }}
//                     tickLine={{ stroke: ui.gridStroke }}
//                   />
//                   <Tooltip content={<CustomTooltip />} />
//                   <Legend
//                     wrapperStyle={{
//                       fontSize: "12px",
//                       color: ui.textSoft,
//                     }}
//                   />
//                   <Line
//                     dataKey="eaf"
//                     name="EAF"
//                     stroke={ui.danger}
//                     strokeWidth={2.5}
//                     dot={false}
//                   />
//                   <Line
//                     dataKey="lrf"
//                     name="LRF"
//                     stroke={ui.orange}
//                     strokeWidth={2.5}
//                     dot={false}
//                   />
//                   <Line
//                     dataKey="vod"
//                     name="VOD"
//                     stroke={ui.blue}
//                     strokeWidth={2.5}
//                     dot={false}
//                   />
//                   <Line
//                     dataKey="tsc"
//                     name="TSC"
//                     stroke={ui.success}
//                     strokeWidth={2.5}
//                     dot={false}
//                   />
//                 </LineChart>
//               </ResponsiveContainer>
//             </Box>
//           </DashboardPaper>
//         </Grid>

//         <Grid item xs={12} md={5}>
//           <DashboardPaper>
//             <SectionHeader
//               title="Ishlab Chiqarish Dinamikasi"
//               dot={ui.success}
//             />
//             <Box sx={{ p: 2, height: 290 }}>
//               <ResponsiveContainer width="100%" height="100%">
//                 <BarChart
//                   data={productionChartData}
//                   margin={{ top: 5, right: 12, left: -10, bottom: 5 }}
//                 >
//                   <CartesianGrid strokeDasharray="3 3" stroke={ui.gridStroke} />
//                   <XAxis
//                     dataKey="kun"
//                     tick={{
//                       fontFamily: "'Share Tech Mono', monospace",
//                       fontSize: 11,
//                       fill: ui.chartTick,
//                     }}
//                     axisLine={{ stroke: ui.gridStroke }}
//                     tickLine={{ stroke: ui.gridStroke }}
//                   />
//                   <YAxis
//                     tick={{
//                       fontFamily: "'Share Tech Mono', monospace",
//                       fontSize: 11,
//                       fill: ui.chartTick,
//                     }}
//                     axisLine={{ stroke: ui.gridStroke }}
//                     tickLine={{ stroke: ui.gridStroke }}
//                   />
//                   <Tooltip content={<CustomTooltip />} />
//                   <Legend
//                     wrapperStyle={{
//                       fontSize: "12px",
//                       color: ui.textSoft,
//                     }}
//                   />
//                   <Bar
//                     dataKey="eaf"
//                     name="EAF"
//                     fill={ui.orange}
//                     radius={[4, 4, 0, 0]}
//                   />
//                   <Bar
//                     dataKey="lrf"
//                     name="LRF"
//                     fill={ui.yellow}
//                     radius={[4, 4, 0, 0]}
//                   />
//                   <Bar
//                     dataKey="vod"
//                     name="VOD"
//                     fill={ui.blue}
//                     radius={[4, 4, 0, 0]}
//                   />
//                   <Bar
//                     dataKey="tsc"
//                     name="TSC"
//                     fill={ui.success}
//                     radius={[4, 4, 0, 0]}
//                   />
//                 </BarChart>
//               </ResponsiveContainer>
//             </Box>
//           </DashboardPaper>
//         </Grid>
//       </Grid>

//       <DashboardPaper>
//         <SectionHeader title="Ishlab Chiqarish Plani" dot={ui.info} />
//         <Box sx={{ p: 2.2, display: "flex", gap: 3, flexWrap: "wrap" }}>
//           {planItems.map((item) => {
//             const percent = item.plan
//               ? Math.min(100, (item.haqiqiy / item.plan) * 100)
//               : 0;

//             return (
//               <Box key={item.nom} sx={{ flex: "1 1 220px", minWidth: 220 }}>
//                 <Box
//                   sx={{
//                     display: "flex",
//                     justifyContent: "space-between",
//                     mb: 0.7,
//                     gap: 1,
//                   }}
//                 >
//                   <Typography
//                     sx={{
//                       fontSize: "0.9rem",
//                       fontWeight: 700,
//                       color: ui.textMain,
//                     }}
//                   >
//                     {item.nom}
//                   </Typography>
//                   <Typography
//                     sx={{
//                       fontFamily: "'Share Tech Mono', monospace",
//                       fontSize: "0.76rem",
//                       color: item.color,
//                       fontWeight: 800,
//                     }}
//                   >
//                     {fmtN(item.haqiqiy, 1)} / {fmtN(item.plan, 0)} t
//                   </Typography>
//                 </Box>

//                 <LinearProgress
//                   variant="determinate"
//                   value={percent}
//                   sx={{
//                     height: 8,
//                     borderRadius: 999,
//                     backgroundColor: ui.progressBg,
//                     "& .MuiLinearProgress-bar": {
//                       borderRadius: 999,
//                       background: item.color,
//                     },
//                   }}
//                 />

//                 <Typography
//                   sx={{
//                     fontFamily: "'Share Tech Mono', monospace",
//                     fontSize: "0.72rem",
//                     color: ui.textSoft,
//                     mt: 0.55,
//                     fontWeight: 700,
//                   }}
//                 >
//                   {Math.round(percent)}% bajarildi
//                 </Typography>
//               </Box>
//             );
//           })}
//         </Box>
//       </DashboardPaper>

//       <Grid container spacing={2}>
//         <Grid item xs={12} md={3}>
//           <MiniInfoCard
//             title="EAF"
//             rows={[
//               { label: "Heatlar", value: fmtN(eafList.length, 0) },
//               {
//                 label: "Jami energiya",
//                 value: `${fmtN(sum(eafList.map((x) => x.electricalEnergy)), 0)} kWh`,
//                 color: ui.yellow,
//               },
//               {
//                 label: "Jami O₂",
//                 value: fmtN(sum(eafList.map((x) => x.injectedO2)), 0),
//               },
//               {
//                 label: "O'rtacha power-on",
//                 value: `${fmtN(avg(eafList.map((x) => x.powerOnTime)), 0)} min`,
//               },
//               {
//                 label: "Oxirgi plavka",
//                 value: latestEAF ? formatDateTime(latestEAF.startTime) : "—",
//               },
//             ]}
//           />
//         </Grid>

//         <Grid item xs={12} md={3}>
//           <MiniInfoCard
//             title="LRF"
//             rows={[
//               { label: "Heatlar", value: fmtN(lrfList.length, 0) },
//               {
//                 label: "Jami energiya",
//                 value: `${fmtN(sum(lrfList.map((x) => x.electricalEnergy)), 0)} kWh`,
//                 color: ui.yellow,
//               },
//               {
//                 label: "Argon",
//                 value: fmtN(sum(lrfList.map((x) => x.totalArConsumption)), 0),
//               },
//               {
//                 label: "Azot",
//                 value: fmtN(sum(lrfList.map((x) => x.totalN2Consumption)), 0),
//               },
//               {
//                 label: "O'rtacha harorat",
//                 value: `${fmtN(avg(lrfList.map(getAvgTemp)), 0)} °C`,
//               },
//             ]}
//           />
//         </Grid>

//         <Grid item xs={12} md={3}>
//           <MiniInfoCard
//             title="VOD"
//             rows={[
//               { label: "Heatlar", value: fmtN(vodList.length, 0) },
//               {
//                 label: "Jami O₂",
//                 value: fmtN(sum(vodList.map((x) => x.totalOxygen)), 0),
//               },
//               {
//                 label: "Blow time",
//                 value: `${fmtN(avg(vodList.map((x) => x.totalBlowTime)), 0)} min`,
//               },
//               {
//                 label: "Deep vacuum",
//                 value: `${fmtN(avg(vodList.map((x) => x.totalDeepVacuumTime)), 0)} min`,
//               },
//               {
//                 label: "Min vacuum",
//                 value: fmtN(avg(vodList.map((x) => x.minVacuumPressure)), 2),
//               },
//             ]}
//           />
//         </Grid>

//         <Grid item xs={12} md={3}>
//           <MiniInfoCard
//             title="TSC"
//             rows={[
//               { label: "Heatlar", value: fmtN(tscList.length, 0) },
//               {
//                 label: "Slablar",
//                 value: fmtN(tscStats.totalSlabs, 0),
//               },
//               {
//                 label: "Cast length",
//                 value: `${fmtN(tscStats.totalCastLength, 0)} m`,
//               },
//               {
//                 label: "Avg cast speed",
//                 value: `${fmtN(tscStats.avgCastSpeed, 2)} m/min`,
//               },
//               {
//                 label: "Avg tundish life",
//                 value: fmtN(tscStats.avgTundishLife, 0),
//               },
//             ]}
//           />
//         </Grid>
//       </Grid>

//       <DashboardPaper>
//         <SectionHeader title="Oxirgi Jarayonlar" dot={ui.info} />
//         <Box sx={{ p: 2.2 }}>
//           <Grid container spacing={2}>
//             {[
//               {
//                 title: "EAF",
//                 heat: latestEAF,
//                 rows: latestEAF
//                   ? [
//                       ["Heat ID", `#${latestEAF.heatId}`],
//                       ["Steel grade", latestEAF.steelGradeName || "—"],
//                       ["Boshlanish", formatDateTime(latestEAF.startTime)],
//                       ["Tugash", formatDateTime(latestEAF.stopTime)],
//                       [
//                         "Tapping",
//                         `${fmtN(kgToTon(latestEAF.tappingWeight), 1)} t`,
//                       ],
//                       [
//                         "kWh/t",
//                         fmtN(
//                           calcKwhPerTon(
//                             latestEAF.electricalEnergy,
//                             latestEAF.tappingWeight,
//                           ),
//                           1,
//                         ),
//                       ],
//                     ]
//                   : [],
//               },
//               {
//                 title: "LRF",
//                 heat: latestLRF,
//                 rows: latestLRF
//                   ? [
//                       ["Heat ID", `#${latestLRF.heatId}`],
//                       ["Steel grade", latestLRF.steelGradeName || "—"],
//                       ["Boshlanish", formatDateTime(latestLRF.startTime)],
//                       ["Tugash", formatDateTime(latestLRF.stopTime)],
//                       [
//                         "Final steel",
//                         `${fmtN(kgToTon(latestLRF.finalSteelWeight), 1)} t`,
//                       ],
//                       ["Power on", `${fmtN(latestLRF.powerOnTime, 0)} min`],
//                     ]
//                   : [],
//               },
//               {
//                 title: "VOD",
//                 heat: latestVOD,
//                 rows: latestVOD
//                   ? [
//                       ["Heat ID", `#${latestVOD.heatId}`],
//                       ["Steel grade", latestVOD.steelGradeName || "—"],
//                       ["Boshlanish", formatDateTime(latestVOD.startTime)],
//                       ["Tugash", formatDateTime(latestVOD.stopTime)],
//                       [
//                         "Final steel",
//                         `${fmtN(kgToTon(latestVOD.finalSteelWeight), 1)} t`,
//                       ],
//                       [
//                         "Deep vacuum",
//                         `${fmtN(latestVOD.totalDeepVacuumTime, 0)} min`,
//                       ],
//                     ]
//                   : [],
//               },
//               {
//                 title: "TSC",
//                 heat: latestTSC,
//                 rows: latestTSC
//                   ? [
//                       ["Heat ID", `#${latestTSC.heatId}`],
//                       ["Steel grade", latestTSC.steelGradeName || "—"],
//                       ["Opening", formatDateTime(latestTSC.ladleOpeningDate)],
//                       ["Close", formatDateTime(latestTSC.ladleCloseDate)],
//                       [
//                         "Final steel",
//                         `${fmtN(kgToTon(latestTSC.finalSteelWeight), 1)} t`,
//                       ],
//                       [
//                         "Liquidus",
//                         `${fmtN(latestTSC.liquidusTemperature, 0)} °C`,
//                       ],
//                     ]
//                   : [],
//               },
//             ].map((card) => (
//               <Grid item xs={12} md={6} lg={3} key={card.title}>
//                 <DashboardPaper sx={{ p: 2.1, height: "100%" }}>
//                   <Typography
//                     sx={{
//                       fontWeight: 800,
//                       mb: 1.2,
//                       fontSize: "0.98rem",
//                       color: ui.textMain,
//                     }}
//                   >
//                     {card.title}
//                   </Typography>

//                   {!card.heat ? (
//                     <Typography
//                       sx={{ fontSize: "0.88rem", color: ui.textSoft }}
//                     >
//                       Ma'lumot yo'q
//                     </Typography>
//                   ) : (
//                     <Box
//                       sx={{
//                         display: "flex",
//                         flexDirection: "column",
//                         gap: 0.9,
//                       }}
//                     >
//                       {card.rows.map(([label, value], idx) => (
//                         <Box key={label}>
//                           <Box
//                             sx={{
//                               display: "flex",
//                               justifyContent: "space-between",
//                               gap: 1,
//                               alignItems: "flex-start",
//                             }}
//                           >
//                             <Typography
//                               sx={{
//                                 fontSize: "0.82rem",
//                                 color: ui.textSoft,
//                                 fontWeight: 500,
//                               }}
//                             >
//                               {label}
//                             </Typography>
//                             <Typography
//                               sx={{
//                                 fontSize: "0.84rem",
//                                 fontFamily: "'Share Tech Mono', monospace",
//                                 fontWeight: 800,
//                                 color: ui.textMain,
//                                 textAlign: "right",
//                               }}
//                             >
//                               {value}
//                             </Typography>
//                           </Box>
//                           {idx < card.rows.length - 1 && (
//                             <Divider sx={{ mt: 0.9, borderColor: ui.border }} />
//                           )}
//                         </Box>
//                       ))}
//                     </Box>
//                   )}
//                 </DashboardPaper>
//               </Grid>
//             ))}
//           </Grid>
//         </Box>
//       </DashboardPaper>
//     </Box>
//   );
// }

import { useMemo } from "react";
import dayjs from "dayjs";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Typography,
  LinearProgress,
  Chip,
  Stack,
  Divider,
  useTheme,
  alpha,
} from "@mui/material";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts";

import {
  KpiCard,
  StatusChip,
  DarajaChip,
  SectionHeader,
  LiveBadge,
  CardSkeleton,
} from "@/components/common";

import {
  useAllProductionStats,
  PERIOD_OPTIONS,
  PERIOD_LABELS,
} from "@/hooks/useProduction";

/* ═══════════════════════════════════════════════════════════════
   HELPERS
═══════════════════════════════════════════════════════════════ */

const safeArr = (v) => (Array.isArray(v) ? v : []);

const fmtN = (n, d = 0) =>
  Number(n || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const sum = (arr = []) => arr.reduce((a, b) => a + Number(b || 0), 0);

const avg = (arr = []) => {
  const vals = arr.map((x) => Number(x)).filter((x) => Number.isFinite(x));
  return vals.length ? sum(vals) / vals.length : 0;
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
  return d.format("DD.MM HH:mm");
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

const getAvgTemp = (heat) => avg(getTemps(heat).map((x) => x.value));

const getLastTemp = (heat) => {
  const arr = getTemps(heat);
  return arr.length ? arr[arr.length - 1].value : 0;
};

const getDelayMinutes = (heat) =>
  sum(
    safeArr(heat?.delays).map((d) => minutesBetween(d?.startTime, d?.stopTime)),
  );

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

const mergeProdSeries = ({ eaf, lrf, vod, tsc }) => {
  const keys = new Set([
    ...eaf.map((x) => x.kun),
    ...lrf.map((x) => x.kun),
    ...vod.map((x) => x.kun),
    ...tsc.map((x) => x.kun),
  ]);

  return [...keys]
    .map((kun) => ({
      kun,
      eaf: eaf.find((x) => x.kun === kun)?.value || 0,
      lrf: lrf.find((x) => x.kun === kun)?.value || 0,
      vod: vod.find((x) => x.kun === kun)?.value || 0,
      tsc: tsc.find((x) => x.kun === kun)?.value || 0,
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

const getSeverityColor = (v) => {
  if (v === "kritik") return "#ef4444";
  if (v === "ogohlantirish") return "#f59e0b";
  return "#0ea5e9";
};

const getStatusByProcess = (heat, type) => {
  if (!heat) return "toxtagan";

  if (type === "EAF") {
    const lastTemp = getLastTemp(heat);
    const delay = getDelayMinutes(heat);
    if (delay > 30 || lastTemp > 1700) return "ogohlantirish";
    return "faol";
  }

  if (type === "LRF") {
    const lastTemp = getLastTemp(heat);
    if ((heat?.powerOnTime || 0) > 80 || lastTemp > 1700) {
      return "ogohlantirish";
    }
    return "faol";
  }

  if (type === "VOD") {
    if ((heat?.minVacuumPressure || 0) > 5) return "ogohlantirish";
    return "faol";
  }

  if (type === "TSC") {
    const avgCastSpeed = avg(
      safeArr(heat?.tscStrands).map((s) => Number(s?.castSpeedAvg || 0)),
    );
    if (avgCastSpeed > 0 && avgCastSpeed < 0.8) return "ogohlantirish";
    return "faol";
  }

  return "faol";
};

/* ═══════════════════════════════════════════════════════════════
   UI TOKENS
═══════════════════════════════════════════════════════════════ */

function useDashboardUi() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return {
    isDark,
    bg: isDark ? "#0b1220" : "#eef3f8",
    paper: isDark ? "#111827" : "#ffffff",
    paperSoft: isDark
      ? "linear-gradient(180deg, rgba(15,23,42,0.96), rgba(11,18,32,0.98))"
      : "linear-gradient(180deg, #ffffff 0%, #f8fbff 100%)",
    border: isDark ? "rgba(148,163,184,0.16)" : "rgba(15,23,42,0.08)",
    borderStrong: isDark ? "rgba(148,163,184,0.24)" : "rgba(15,23,42,0.12)",
    textMain: isDark ? "#e8eef8" : "#0f172a",
    textSoft: isDark ? "#a5b4cc" : "#475569",
    textMuted: isDark ? "#7f8ba3" : "#64748b",
    title: isDark ? "#f8fafc" : "#0f172a",
    sectionBg: isDark ? "rgba(255,255,255,0.02)" : "rgba(15,23,42,0.02)",
    progressBg: isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
    gridStroke: isDark ? "rgba(148,163,184,0.16)" : "rgba(15,23,42,0.10)",
    chartTick: isDark ? "#94a3b8" : "#64748b",
    shadow: isDark
      ? "0 12px 30px rgba(0,0,0,0.28)"
      : "0 10px 24px rgba(15,23,42,0.06)",
    orange: "#f97316",
    yellow: "#facc15",
    blue: "#0ea5e9",
    cyan: "#06b6d4",
    green: "#10b981",
    red: "#ef4444",
    headBg: isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.03)",
    lpkAccent: isDark ? "#38bdf8" : "#0f5fcc",
  };
}

function DashboardPaper({ children, sx = {} }) {
  const ui = useDashboardUi();

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

/* ═══════════════════════════════════════════════════════════════
   TOOLTIP
═══════════════════════════════════════════════════════════════ */

function CustomTooltip({ active, payload, label }) {
  const ui = useDashboardUi();

  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        background: ui.isDark ? "#0f172a" : "#ffffff",
        border: `1px solid ${ui.borderStrong}`,
        p: 1.5,
        borderRadius: 2,
        minWidth: 170,
        boxShadow: ui.shadow,
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Share Tech Mono', monospace",
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
            fontFamily: "'Share Tech Mono', monospace",
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

/* ═══════════════════════════════════════════════════════════════
   MINI CARD
═══════════════════════════════════════════════════════════════ */

function MiniInfoCard({ title, rows = [] }) {
  const ui = useDashboardUi();

  return (
    <DashboardPaper sx={{ p: 2.15, height: "100%" }}>
      <Typography
        sx={{
          fontSize: "1rem",
          fontWeight: 800,
          mb: 1.4,
          color: ui.title,
          letterSpacing: "0.02em",
        }}
      >
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
                alignItems: "center",
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.86rem",
                  color: ui.textSoft,
                  fontWeight: 500,
                }}
              >
                {r.label}
              </Typography>

              <Typography
                sx={{
                  fontSize: "0.86rem",
                  fontWeight: 800,
                  fontFamily: "'Share Tech Mono', monospace",
                  color: r.color || ui.textMain,
                  textAlign: "right",
                }}
              >
                {r.value}
              </Typography>
            </Box>

            {idx < rows.length - 1 && (
              <Divider sx={{ mt: 0.95, borderColor: ui.border }} />
            )}
          </Box>
        ))}
      </Box>
    </DashboardPaper>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const ui = useDashboardUi();

  const { eaf, lrf, vod, tsc, period, setPeriod, periodLabel, isAnyLoading } =
    useAllProductionStats("today");

  const eafList = safeArr(eaf?.data);
  const lrfList = safeArr(lrf?.data);
  const vodList = safeArr(vod?.data);
  const tscList = safeArr(tsc?.data);

  const latestEAF = useMemo(() => pickLatest(eafList, "startTime"), [eafList]);
  const latestLRF = useMemo(() => pickLatest(lrfList, "startTime"), [lrfList]);
  const latestVOD = useMemo(() => pickLatest(vodList, "startTime"), [vodList]);
  const latestTSC = useMemo(
    () => pickLatest(tscList, "ladleOpeningDate"),
    [tscList],
  );

  const complexInfo = {
    short: "ЛПК",
    title: "Quyuv Prokatlash Kompleksi",
    subtitle:
      "LPK bo‘yicha real vaqt statistikasi, jarayonlar holati va ishlab chiqarish ko‘rsatkichlari",
  };

  const kpiItems = useMemo(() => {
    const totalProductionTon =
      kgToTon(sum(eafList.map((x) => x.tappingWeight))) +
      kgToTon(sum(lrfList.map((x) => x.finalSteelWeight))) +
      kgToTon(sum(vodList.map((x) => x.finalSteelWeight))) +
      kgToTon(sum(tscList.map((x) => x.finalSteelWeight)));

    const totalEnergy =
      sum(eafList.map((x) => x.electricalEnergy)) +
      sum(lrfList.map((x) => x.electricalEnergy));

    const allTemps = [
      ...eafList.map(getAvgTemp),
      ...lrfList.map(getAvgTemp),
      ...vodList.map(getAvgTemp),
      ...tscList.map(getAvgTemp),
    ].filter(Boolean);

    const avgTemp = avg(allTemps);

    const activeUnits = [latestEAF, latestLRF, latestVOD, latestTSC].filter(
      Boolean,
    ).length;
    const totalUnits = 4;

    const totalTempPoints =
      sum(eafList.map((x) => safeArr(x.temperatures).length)) +
      sum(lrfList.map((x) => safeArr(x.temperatures).length)) +
      sum(vodList.map((x) => safeArr(x.temperatures).length)) +
      sum(tscList.map((x) => safeArr(x.temperatures).length));

    return [
      {
        label: "LPK ISHLAB CHIQARISH",
        value: fmtN(totalProductionTon, 1),
        unit: "t",
        trend: `${periodLabel} bo'yicha jami`,
        trendUp: true,
        color: ui.orange,
      },
      {
        label: "LPK JARAYONLARI",
        value: `${activeUnits}/${totalUnits}`,
        unit: "",
        trend: "EAF / LRF / VOD / TSC",
        trendUp: true,
        color: ui.blue,
      },
      {
        label: "LPK O'RTA HARORATI",
        value: fmtN(avgTemp, 0),
        unit: "°C",
        trend: "Kompleks bo‘yicha o‘rtacha",
        trendUp: false,
        color: ui.red,
      },
      {
        label: "LPK DATCHIK NUQTALARI",
        value: fmtN(totalTempPoints, 0),
        unit: "",
        trend: "Temperatura o‘lchovlari",
        trendUp: true,
        color: ui.green,
      },
      {
        label: "LPK ENERGIYA SARFI",
        value: fmtN(totalEnergy, 0),
        unit: "kWh",
        trend: "EAF + LRF bo‘yicha",
        trendUp: false,
        color: ui.yellow,
      },
    ];
  }, [
    eafList,
    lrfList,
    vodList,
    tscList,
    latestEAF,
    latestLRF,
    latestVOD,
    latestTSC,
    periodLabel,
    ui,
  ]);

  const processRows = useMemo(() => {
    const eafKwhTon = latestEAF
      ? calcKwhPerTon(latestEAF.electricalEnergy, latestEAF.tappingWeight)
      : 0;

    const lrfKwhTon = latestLRF
      ? calcKwhPerTon(latestLRF.electricalEnergy, latestLRF.finalSteelWeight)
      : 0;

    const vodDuration = latestVOD
      ? minutesBetween(latestVOD.startTime, latestVOD.stopTime)
      : 0;

    const tscAvgSpeed = latestTSC
      ? avg(safeArr(latestTSC.tscStrands).map((s) => s.castSpeedAvg))
      : 0;

    return [
      {
        id: "EAF",
        emoji: "🔥",
        nom: "EAF Eritish",
        holat: getStatusByProcess(latestEAF, "EAF"),
        uchastkalar: 1,
        faolUskunalar: latestEAF ? 1 : 0,
        uskunalar: 1,
        yuk: Math.min(100, Math.round(eafKwhTon)),
        harorat: Math.round(getLastTemp(latestEAF)),
        meta: latestEAF
          ? `#${latestEAF.heatId} • ${latestEAF.steelGradeName || "—"}`
          : "Ma'lumot yo'q",
      },
      {
        id: "LRF",
        emoji: "⚡",
        nom: "LRF Qayta Ishlov",
        holat: getStatusByProcess(latestLRF, "LRF"),
        uchastkalar: 1,
        faolUskunalar: latestLRF ? 1 : 0,
        uskunalar: 1,
        yuk: Math.min(100, Math.round(lrfKwhTon)),
        harorat: Math.round(getLastTemp(latestLRF)),
        meta: latestLRF
          ? `#${latestLRF.heatId} • ${latestLRF.steelGradeName || "—"}`
          : "Ma'lumot yo'q",
      },
      {
        id: "VOD",
        emoji: "🫧",
        nom: "VOD Vakuum",
        holat: getStatusByProcess(latestVOD, "VOD"),
        uchastkalar: 1,
        faolUskunalar: latestVOD ? 1 : 0,
        uskunalar: 1,
        yuk: Math.min(100, Math.round(vodDuration)),
        harorat: Math.round(getLastTemp(latestVOD)),
        meta: latestVOD
          ? `#${latestVOD.heatId} • ${latestVOD.steelGradeName || "—"}`
          : "Ma'lumot yo'q",
      },
      {
        id: "TSC",
        emoji: "🏭",
        nom: "TSC Quyish",
        holat: getStatusByProcess(latestTSC, "TSC"),
        uchastkalar: 1,
        faolUskunalar: latestTSC ? 1 : 0,
        uskunalar: 1,
        yuk: Math.min(100, Math.round(tscAvgSpeed * 100)),
        harorat: Math.round(getLastTemp(latestTSC)),
        meta: latestTSC
          ? `#${latestTSC.heatId} • ${latestTSC.steelGradeName || "—"}`
          : "Ma'lumot yo'q",
      },
    ];
  }, [latestEAF, latestLRF, latestVOD, latestTSC]);

  const alerts = useMemo(() => {
    const out = [];

    if (latestEAF) {
      const eafKwhTon = calcKwhPerTon(
        latestEAF.electricalEnergy,
        latestEAF.tappingWeight,
      );

      if (eafKwhTon > 520) {
        out.push({
          id: "eaf-energy",
          xabar: `EAF energiya sarfi yuqori: ${fmtN(eafKwhTon, 1)} kWh/t`,
          daraja: "kritik",
          vaqt: new Date().toISOString(),
        });
      }

      const delayMin = getDelayMinutes(latestEAF);
      if (delayMin > 30) {
        out.push({
          id: "eaf-delay",
          xabar: `EAF bekor turish vaqti yuqori: ${delayMin} min`,
          daraja: "ogohlantirish",
          vaqt: new Date().toISOString(),
        });
      }

      if ((latestEAF.powerOnTime || 0) > 70) {
        out.push({
          id: "eaf-poweron",
          xabar: `EAF power-on time uzun: ${latestEAF.powerOnTime} min`,
          daraja: "ogohlantirish",
          vaqt: new Date().toISOString(),
        });
      }
    }

    if (latestLRF) {
      const lrfKwhTon = calcKwhPerTon(
        latestLRF.electricalEnergy,
        latestLRF.finalSteelWeight,
      );

      if (lrfKwhTon > 80) {
        out.push({
          id: "lrf-energy",
          xabar: `LRF energiya sarfi yuqori: ${fmtN(lrfKwhTon, 1)} kWh/t`,
          daraja: "ogohlantirish",
          vaqt: new Date().toISOString(),
        });
      }

      if ((latestLRF.powerOnTime || 0) > 80) {
        out.push({
          id: "lrf-time",
          xabar: `LRF davomiyligi uzun: ${latestLRF.powerOnTime} min`,
          daraja: "ogohlantirish",
          vaqt: new Date().toISOString(),
        });
      }
    }

    if (latestVOD) {
      if ((latestVOD.totalDeepVacuumTime || 0) > 40) {
        out.push({
          id: "vod-vacuum",
          xabar: `VOD deep vacuum vaqti yuqori: ${latestVOD.totalDeepVacuumTime} min`,
          daraja: "ogohlantirish",
          vaqt: new Date().toISOString(),
        });
      }

      if ((latestVOD.minVacuumPressure || 0) > 5) {
        out.push({
          id: "vod-pressure",
          xabar: `VOD vacuum pressure normadan yuqori: ${fmtN(
            latestVOD.minVacuumPressure,
            2,
          )}`,
          daraja: "kritik",
          vaqt: new Date().toISOString(),
        });
      }

      const vodDelay = getDelayMinutes(latestVOD);
      if (vodDelay > 20) {
        out.push({
          id: "vod-delay",
          xabar: `VOD bekor turish vaqti: ${vodDelay} min`,
          daraja: "ogohlantirish",
          vaqt: new Date().toISOString(),
        });
      }
    }

    if (latestTSC) {
      const avgCastSpeed = avg(
        safeArr(latestTSC.tscStrands).map((s) => s.castSpeedAvg),
      );

      if (avgCastSpeed > 0 && avgCastSpeed < 0.8) {
        out.push({
          id: "tsc-speed",
          xabar: `TSC quyish tezligi past: ${fmtN(avgCastSpeed, 2)} m/min`,
          daraja: "kritik",
          vaqt: new Date().toISOString(),
        });
      }

      const temp = getLastTemp(latestTSC);
      const liquidus = Number(latestTSC.liquidusTemperature || 0);

      if (liquidus && temp > liquidus + 40) {
        out.push({
          id: "tsc-temp-high",
          xabar: `TSC harorati liquidusdan ${fmtN(temp - liquidus, 0)}°C yuqori`,
          daraja: "ogohlantirish",
          vaqt: new Date().toISOString(),
        });
      }

      if (liquidus && temp < liquidus - 20) {
        out.push({
          id: "tsc-temp-low",
          xabar: `TSC harorati liquidusdan ${fmtN(liquidus - temp, 0)}°C past`,
          daraja: "kritik",
          vaqt: new Date().toISOString(),
        });
      }
    }

    if (!out.length) {
      out.push({
        id: "normal",
        xabar: "Muhim ogohlantirish aniqlanmadi",
        daraja: "info",
        vaqt: new Date().toISOString(),
      });
    }

    return out;
  }, [latestEAF, latestLRF, latestVOD, latestTSC]);

  const tempChartData = useMemo(() => {
    return mergeTempSeries({
      eaf: getTemps(latestEAF),
      lrf: getTemps(latestLRF),
      vod: getTemps(latestVOD),
      tsc: getTemps(latestTSC),
    });
  }, [latestEAF, latestLRF, latestVOD, latestTSC]);

  const productionChartData = useMemo(() => {
    const eafSeries = groupByDay(eafList, "productionDate", (arr) =>
      kgToTon(sum(arr.map((x) => x.tappingWeight))),
    );

    const lrfSeries = groupByDay(lrfList, "productionDate", (arr) =>
      kgToTon(sum(arr.map((x) => x.finalSteelWeight))),
    );

    const vodSeries = groupByDay(vodList, "productionDate", (arr) =>
      kgToTon(sum(arr.map((x) => x.finalSteelWeight))),
    );

    const tscSeries = groupByDay(tscList, "productionDate", (arr) =>
      kgToTon(sum(arr.map((x) => x.finalSteelWeight))),
    );

    return mergeProdSeries({
      eaf: eafSeries,
      lrf: lrfSeries,
      vod: vodSeries,
      tsc: tscSeries,
    });
  }, [eafList, lrfList, vodList, tscList]);

  const tscStats = useMemo(() => {
    const totalSlabs = sum(
      tscList.map((heat) => safeArr(heat.tscProducts).length),
    );

    const totalCastLength = sum(
      tscList.flatMap((heat) =>
        safeArr(heat.tscStrands).map((s) => Number(s.castLength || 0)),
      ),
    );

    const avgCastSpeed = avg(
      tscList.flatMap((heat) =>
        safeArr(heat.tscStrands).map((s) => Number(s.castSpeedAvg || 0)),
      ),
    );

    const avgTundishLife = avg(
      tscList.map((heat) => Number(heat.tundishLife || 0)),
    );

    return {
      totalSlabs,
      totalCastLength,
      avgCastSpeed,
      avgTundishLife,
    };
  }, [tscList]);

  const planItems = useMemo(() => {
    return [
      {
        nom: "EAF Eritish",
        plan: 900,
        haqiqiy: kgToTon(sum(eafList.map((x) => x.tappingWeight))),
        color: ui.orange,
      },
      {
        nom: "LRF Qayta Ishlov",
        plan: 900,
        haqiqiy: kgToTon(sum(lrfList.map((x) => x.finalSteelWeight))),
        color: ui.yellow,
      },
      {
        nom: "VOD Vakuum",
        plan: 700,
        haqiqiy: kgToTon(sum(vodList.map((x) => x.finalSteelWeight))),
        color: ui.blue,
      },
      {
        nom: "TSC Quyish",
        plan: 850,
        haqiqiy: kgToTon(sum(tscList.map((x) => x.finalSteelWeight))),
        color: ui.green,
      },
    ];
  }, [eafList, lrfList, vodList, tscList, ui]);

  const hasFatalError =
    eaf?.isError && lrf?.isError && vod?.isError && tsc?.isError;

  if (hasFatalError) {
    return (
      <Box sx={{ p: 3 }}>
        <DashboardPaper sx={{ p: 3 }}>
          <Typography
            sx={{
              fontWeight: 800,
              fontSize: "1.08rem",
              mb: 1,
              color: ui.title,
            }}
          >
            LPK dashboard ma'lumotlarini yuklashda xatolik
          </Typography>
          <Typography sx={{ color: ui.textSoft, fontSize: "0.94rem" }}>
            Barcha API larni tekshirib chiqing.
          </Typography>
        </DashboardPaper>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2.5 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        bgcolor: "transparent",
      }}
    >
      <DashboardPaper sx={{ p: { xs: 1.6, md: 2.2 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            flexDirection: { xs: "column", md: "row" },
            gap: 1.5,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: "'Orbitron', monospace",
                fontSize: { xs: "1rem", md: "1.18rem" },
                fontWeight: 900,
                letterSpacing: "0.08em",
                color: ui.lpkAccent,
                textTransform: "uppercase",
                lineHeight: 1.2,
              }}
            >
              {complexInfo.short} — {complexInfo.title}
            </Typography>

            <Typography
              sx={{
                mt: 0.55,
                fontSize: "0.92rem",
                color: ui.textSoft,
                fontWeight: 500,
                lineHeight: 1.5,
              }}
            >
              {complexInfo.subtitle}
            </Typography>
          </Box>

          <Chip
            label="FAOL KOMPLEKS"
            sx={{
              height: 32,
              fontSize: "0.74rem",
              fontWeight: 800,
              borderRadius: 2,
              color: ui.green,
              background: alpha(ui.green, 0.1),
              border: `1px solid ${alpha(ui.green, 0.2)}`,
            }}
          />
        </Box>
      </DashboardPaper>

      <DashboardPaper sx={{ p: 1.75 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            label="Kompleks: ЛПК"
            sx={{
              borderRadius: 2,
              fontWeight: 800,
              fontSize: "0.82rem",
              height: 34,
            }}
          />

          {PERIOD_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              clickable
              onClick={() => setPeriod(opt.value)}
              color={period === opt.value ? "primary" : "default"}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                fontSize: "0.82rem",
                height: 34,
              }}
            />
          ))}

          <Chip
            label={`Tanlangan davr: ${PERIOD_LABELS[period] || period}`}
            sx={{
              ml: "auto",
              fontWeight: 800,
              fontSize: "0.82rem",
              height: 34,
            }}
          />
        </Stack>
      </DashboardPaper>

      <Grid container spacing={1.5}>
        {kpiItems.map((item) => (
          <Grid item xs={12} sm={6} md={2.4} key={item.label}>
            <KpiCard {...item} loading={isAnyLoading} />
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <DashboardPaper>
            <SectionHeader title="LPK Jarayonlari Holati" action="JARAYONLAR →">
              <LiveBadge />
            </SectionHeader>

            {isAnyLoading ? (
              <CardSkeleton />
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow
                    sx={{
                      background: ui.headBg,
                      "& .MuiTableCell-root": {
                        fontSize: "0.76rem",
                        fontWeight: 800,
                        color: ui.textSoft,
                        letterSpacing: "0.08em",
                        borderBottomColor: ui.border,
                      },
                    }}
                  >
                    <TableCell>JARAYON NOMI</TableCell>
                    <TableCell>HOLAT</TableCell>
                    <TableCell>UCHASTKA</TableCell>
                    <TableCell>USKUNALAR</TableCell>
                    <TableCell>YUK</TableCell>
                    <TableCell>HARORAT</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {processRows.map((s) => (
                    <TableRow
                      key={s.id}
                      sx={{
                        "& .MuiTableCell-root": {
                          borderBottomColor: ui.border,
                          py: 1.4,
                        },
                        "&:hover": {
                          background: ui.sectionBg,
                        },
                      }}
                    >
                      <TableCell>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1.15,
                          }}
                        >
                          <Box
                            sx={{
                              width: 30,
                              height: 30,
                              borderRadius: 2,
                              display: "grid",
                              placeItems: "center",
                              background: alpha(ui.blue, 0.1),
                              fontSize: 16,
                            }}
                          >
                            {s.emoji}
                          </Box>

                          <Box>
                            <Typography
                              sx={{
                                fontWeight: 800,
                                fontSize: "0.93rem",
                                color: ui.title,
                                lineHeight: 1.2,
                              }}
                            >
                              {s.nom}
                            </Typography>

                            <Typography
                              sx={{
                                fontFamily: "'Share Tech Mono', monospace",
                                fontSize: "0.72rem",
                                color: ui.textMuted,
                                mt: 0.22,
                              }}
                            >
                              {s.meta}
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
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: "0.82rem",
                            color: ui.textSoft,
                            fontWeight: 700,
                          }}
                        >
                          {s.uchastkalar} ta
                        </Typography>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: "0.84rem",
                            fontWeight: 800,
                            color: ui.textMain,
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
                            minWidth: 150,
                          }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={s.yuk}
                            sx={{
                              flex: 1,
                              height: 8,
                              borderRadius: 999,
                              backgroundColor: ui.progressBg,
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 999,
                                background:
                                  s.yuk > 90
                                    ? ui.yellow
                                    : s.yuk > 0
                                      ? ui.blue
                                      : ui.textMuted,
                              },
                            }}
                          />
                          <Typography
                            sx={{
                              fontFamily: "'Share Tech Mono', monospace",
                              fontSize: "0.74rem",
                              color: s.yuk > 90 ? ui.yellow : ui.textSoft,
                              minWidth: 38,
                              fontWeight: 700,
                            }}
                          >
                            {s.yuk}%
                          </Typography>
                        </Box>
                      </TableCell>

                      <TableCell>
                        <Typography
                          sx={{
                            fontFamily: "'Share Tech Mono', monospace",
                            fontSize: "0.84rem",
                            fontWeight: 800,
                            color:
                              s.harorat > 1650
                                ? ui.red
                                : s.harorat > 1450
                                  ? ui.orange
                                  : ui.textSoft,
                          }}
                        >
                          {s.harorat ? `${s.harorat}°C` : "—"}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DashboardPaper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <DashboardPaper sx={{ height: "100%" }}>
            <SectionHeader
              title="LPK Ogohlantirishlari"
              dot={ui.red}
              action="HAMMASI →"
            />
            <Box sx={{ p: 1.6 }}>
              {alerts.slice(0, 6).map((o) => (
                <Box
                  key={o.id}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    py: 1.15,
                    borderBottom: `1px solid ${ui.border}`,
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Box
                    sx={{
                      width: 4,
                      borderRadius: 99,
                      flexShrink: 0,
                      alignSelf: "stretch",
                      minHeight: 40,
                      background: getSeverityColor(o.daraja),
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography
                      sx={{
                        fontSize: "0.88rem",
                        mb: 0.55,
                        color: ui.textMain,
                        lineHeight: 1.45,
                        fontWeight: 600,
                      }}
                    >
                      {o.xabar}
                    </Typography>

                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <DarajaChip daraja={o.daraja} />
                    </Box>
                  </Box>

                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: "0.68rem",
                      color: ui.textMuted,
                      whiteSpace: "nowrap",
                      pt: 0.2,
                      fontWeight: 700,
                    }}
                  >
                    {Math.round((Date.now() - new Date(o.vaqt)) / 60000)}m
                  </Typography>
                </Box>
              ))}
            </Box>
          </DashboardPaper>
        </Grid>
      </Grid>

      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <DashboardPaper>
            <SectionHeader title="LPK Harorat Grafigi" dot={ui.orange}>
              <Box sx={{ display: "flex", gap: 2.2, flexWrap: "wrap" }}>
                {[
                  ["EAF", ui.red],
                  ["LRF", ui.orange],
                  ["VOD", ui.blue],
                  ["TSC", ui.green],
                ].map(([n, c]) => (
                  <Box
                    key={n}
                    sx={{ display: "flex", alignItems: "center", gap: 0.7 }}
                  >
                    <Box
                      sx={{
                        width: 12,
                        height: 3,
                        background: c,
                        borderRadius: 1,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "'Share Tech Mono', monospace",
                        fontSize: "0.72rem",
                        color: ui.textSoft,
                        fontWeight: 700,
                      }}
                    >
                      {n}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </SectionHeader>

            <Box sx={{ p: 2, height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={tempChartData}
                  margin={{ top: 5, right: 12, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={ui.gridStroke} />

                  <XAxis
                    dataKey="time"
                    tick={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 11,
                      fill: ui.chartTick,
                    }}
                    axisLine={{ stroke: ui.gridStroke }}
                    tickLine={{ stroke: ui.gridStroke }}
                  />

                  <YAxis
                    tick={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 11,
                      fill: ui.chartTick,
                    }}
                    axisLine={{ stroke: ui.gridStroke }}
                    tickLine={{ stroke: ui.gridStroke }}
                  />

                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      fontSize: "12px",
                    }}
                  />

                  <Line
                    dataKey="eaf"
                    name="EAF"
                    stroke={ui.red}
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    dataKey="lrf"
                    name="LRF"
                    stroke={ui.orange}
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    dataKey="vod"
                    name="VOD"
                    stroke={ui.blue}
                    strokeWidth={2.5}
                    dot={false}
                  />
                  <Line
                    dataKey="tsc"
                    name="TSC"
                    stroke={ui.green}
                    strokeWidth={2.5}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </DashboardPaper>
        </Grid>

        <Grid item xs={12} md={5}>
          <DashboardPaper>
            <SectionHeader
              title="LPK Ishlab Chiqarish Dinamikasi"
              dot={ui.green}
            />
            <Box sx={{ p: 2, height: 290 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productionChartData}
                  margin={{ top: 5, right: 12, left: -10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke={ui.gridStroke} />

                  <XAxis
                    dataKey="kun"
                    tick={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 11,
                      fill: ui.chartTick,
                    }}
                    axisLine={{ stroke: ui.gridStroke }}
                    tickLine={{ stroke: ui.gridStroke }}
                  />

                  <YAxis
                    tick={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: 11,
                      fill: ui.chartTick,
                    }}
                    axisLine={{ stroke: ui.gridStroke }}
                    tickLine={{ stroke: ui.gridStroke }}
                  />

                  <Tooltip content={<CustomTooltip />} />
                  <Legend
                    wrapperStyle={{
                      fontSize: "12px",
                    }}
                  />

                  <Bar
                    dataKey="eaf"
                    name="EAF"
                    fill={ui.orange}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="lrf"
                    name="LRF"
                    fill={ui.yellow}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="vod"
                    name="VOD"
                    fill={ui.blue}
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="tsc"
                    name="TSC"
                    fill={ui.green}
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </DashboardPaper>
        </Grid>
      </Grid>

      <DashboardPaper>
        <SectionHeader title="LPK Ishlab Chiqarish Rejasi" dot={ui.blue} />
        <Box sx={{ p: 2.2, display: "flex", gap: 3, flexWrap: "wrap" }}>
          {planItems.map((item) => {
            const percent = item.plan
              ? Math.min(100, (item.haqiqiy / item.plan) * 100)
              : 0;

            return (
              <Box key={item.nom} sx={{ flex: "1 1 220px", minWidth: 220 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    mb: 0.7,
                    gap: 1,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: "0.9rem",
                      fontWeight: 700,
                      color: ui.title,
                    }}
                  >
                    {item.nom}
                  </Typography>

                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono', monospace",
                      fontSize: "0.76rem",
                      color: item.color,
                      fontWeight: 800,
                    }}
                  >
                    {fmtN(item.haqiqiy, 1)} / {fmtN(item.plan, 0)} t
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={percent}
                  sx={{
                    height: 8,
                    borderRadius: 999,
                    backgroundColor: ui.progressBg,
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      background: item.color,
                    },
                  }}
                />

                <Typography
                  sx={{
                    fontFamily: "'Share Tech Mono', monospace",
                    fontSize: "0.72rem",
                    color: ui.textSoft,
                    mt: 0.55,
                    fontWeight: 700,
                  }}
                >
                  {Math.round(percent)}% bajarildi
                </Typography>
              </Box>
            );
          })}
        </Box>
      </DashboardPaper>

      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <MiniInfoCard
            title="LPK / EAF"
            rows={[
              { label: "Heatlar", value: fmtN(eafList.length, 0) },
              {
                label: "Jami energiya",
                value: `${fmtN(sum(eafList.map((x) => x.electricalEnergy)), 0)} kWh`,
                color: ui.yellow,
              },
              {
                label: "Jami O₂",
                value: fmtN(sum(eafList.map((x) => x.injectedO2)), 0),
              },
              {
                label: "O'rtacha power-on",
                value: `${fmtN(avg(eafList.map((x) => x.powerOnTime)), 0)} min`,
              },
              {
                label: "Oxirgi plavka",
                value: latestEAF ? formatDateTime(latestEAF.startTime) : "—",
              },
            ]}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <MiniInfoCard
            title="LPK / LRF"
            rows={[
              { label: "Heatlar", value: fmtN(lrfList.length, 0) },
              {
                label: "Jami energiya",
                value: `${fmtN(sum(lrfList.map((x) => x.electricalEnergy)), 0)} kWh`,
                color: ui.yellow,
              },
              {
                label: "Argon",
                value: fmtN(sum(lrfList.map((x) => x.totalArConsumption)), 0),
              },
              {
                label: "Azot",
                value: fmtN(sum(lrfList.map((x) => x.totalN2Consumption)), 0),
              },
              {
                label: "O'rtacha harorat",
                value: `${fmtN(avg(lrfList.map(getAvgTemp)), 0)} °C`,
              },
            ]}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <MiniInfoCard
            title="LPK / VOD"
            rows={[
              { label: "Heatlar", value: fmtN(vodList.length, 0) },
              {
                label: "Jami O₂",
                value: fmtN(sum(vodList.map((x) => x.totalOxygen)), 0),
              },
              {
                label: "Blow time",
                value: `${fmtN(avg(vodList.map((x) => x.totalBlowTime)), 0)} min`,
              },
              {
                label: "Deep vacuum",
                value: `${fmtN(avg(vodList.map((x) => x.totalDeepVacuumTime)), 0)} min`,
              },
              {
                label: "Min vacuum",
                value: fmtN(avg(vodList.map((x) => x.minVacuumPressure)), 2),
              },
            ]}
          />
        </Grid>

        <Grid item xs={12} md={3}>
          <MiniInfoCard
            title="LPK / TSC"
            rows={[
              { label: "Heatlar", value: fmtN(tscList.length, 0) },
              {
                label: "Slablar",
                value: fmtN(tscStats.totalSlabs, 0),
              },
              {
                label: "Cast length",
                value: `${fmtN(tscStats.totalCastLength, 0)} m`,
              },
              {
                label: "Avg cast speed",
                value: `${fmtN(tscStats.avgCastSpeed, 2)} m/min`,
              },
              {
                label: "Avg tundish life",
                value: fmtN(tscStats.avgTundishLife, 0),
              },
            ]}
          />
        </Grid>
      </Grid>

      <DashboardPaper>
        <SectionHeader title="LPK Oxirgi Jarayonlari" dot={ui.blue} />
        <Box sx={{ p: 2.2 }}>
          <Grid container spacing={2}>
            {[
              {
                title: "EAF",
                heat: latestEAF,
                rows: latestEAF
                  ? [
                      ["Heat ID", `#${latestEAF.heatId}`],
                      ["Steel grade", latestEAF.steelGradeName || "—"],
                      ["Boshlanish", formatDateTime(latestEAF.startTime)],
                      ["Tugash", formatDateTime(latestEAF.stopTime)],
                      [
                        "Tapping",
                        `${fmtN(kgToTon(latestEAF.tappingWeight), 1)} t`,
                      ],
                      [
                        "kWh/t",
                        fmtN(
                          calcKwhPerTon(
                            latestEAF.electricalEnergy,
                            latestEAF.tappingWeight,
                          ),
                          1,
                        ),
                      ],
                    ]
                  : [],
              },
              {
                title: "LRF",
                heat: latestLRF,
                rows: latestLRF
                  ? [
                      ["Heat ID", `#${latestLRF.heatId}`],
                      ["Steel grade", latestLRF.steelGradeName || "—"],
                      ["Boshlanish", formatDateTime(latestLRF.startTime)],
                      ["Tugash", formatDateTime(latestLRF.stopTime)],
                      [
                        "Final steel",
                        `${fmtN(kgToTon(latestLRF.finalSteelWeight), 1)} t`,
                      ],
                      ["Power on", `${fmtN(latestLRF.powerOnTime, 0)} min`],
                    ]
                  : [],
              },
              {
                title: "VOD",
                heat: latestVOD,
                rows: latestVOD
                  ? [
                      ["Heat ID", `#${latestVOD.heatId}`],
                      ["Steel grade", latestVOD.steelGradeName || "—"],
                      ["Boshlanish", formatDateTime(latestVOD.startTime)],
                      ["Tugash", formatDateTime(latestVOD.stopTime)],
                      [
                        "Final steel",
                        `${fmtN(kgToTon(latestVOD.finalSteelWeight), 1)} t`,
                      ],
                      [
                        "Deep vacuum",
                        `${fmtN(latestVOD.totalDeepVacuumTime, 0)} min`,
                      ],
                    ]
                  : [],
              },
              {
                title: "TSC",
                heat: latestTSC,
                rows: latestTSC
                  ? [
                      ["Heat ID", `#${latestTSC.heatId}`],
                      ["Steel grade", latestTSC.steelGradeName || "—"],
                      ["Opening", formatDateTime(latestTSC.ladleOpeningDate)],
                      ["Close", formatDateTime(latestTSC.ladleCloseDate)],
                      [
                        "Final steel",
                        `${fmtN(kgToTon(latestTSC.finalSteelWeight), 1)} t`,
                      ],
                      [
                        "Liquidus",
                        `${fmtN(latestTSC.liquidusTemperature, 0)} °C`,
                      ],
                    ]
                  : [],
              },
            ].map((card) => (
              <Grid item xs={12} md={6} lg={3} key={card.title}>
                <DashboardPaper sx={{ p: 2.1, height: "100%" }}>
                  <Typography
                    sx={{
                      fontWeight: 800,
                      mb: 1.2,
                      fontSize: "0.98rem",
                      color: ui.title,
                    }}
                  >
                    {card.title}
                  </Typography>

                  {!card.heat ? (
                    <Typography
                      sx={{ fontSize: "0.88rem", color: ui.textSoft }}
                    >
                      Ma'lumot yo'q
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.9,
                      }}
                    >
                      {card.rows.map(([label, value], idx) => (
                        <Box key={label}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 1,
                              alignItems: "flex-start",
                            }}
                          >
                            <Typography
                              sx={{
                                fontSize: "0.82rem",
                                color: ui.textSoft,
                                fontWeight: 500,
                              }}
                            >
                              {label}
                            </Typography>

                            <Typography
                              sx={{
                                fontSize: "0.84rem",
                                fontFamily: "'Share Tech Mono', monospace",
                                fontWeight: 800,
                                color: ui.textMain,
                                textAlign: "right",
                              }}
                            >
                              {value}
                            </Typography>
                          </Box>

                          {idx < card.rows.length - 1 && (
                            <Divider sx={{ mt: 0.9, borderColor: ui.border }} />
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </DashboardPaper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </DashboardPaper>
    </Box>
  );
}

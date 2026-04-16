// import { useQuery } from "@tanstack/react-query";
// import { useDispatch, useSelector } from "react-redux";
// import {
//   Box,
//   Grid,
//   Paper,
//   Typography,
//   Select,
//   MenuItem,
//   FormControl,
//   InputLabel,
//   LinearProgress,
//   ToggleButton,
//   ToggleButtonGroup,
// } from "@mui/material";
// import GridViewIcon from "@mui/icons-material/GridView";
// import ListIcon from "@mui/icons-material/List";
// import { getDatchiklar, getSexlar } from "@/api";
// import { StatusChip, SectionHeader, CardSkeleton } from "@/components/common";
// import { setDatchikFilter, setViewMode } from "@/store";
// import { DataGrid } from "@mui/x-data-grid";
// import { useTheme } from "@mui/material";

// const turIcons = {
//   harorat: "🌡",
//   bosim: "💨",
//   gaz: "⛽",
//   quvvat: "⚡",
//   oqim: "🌊",
//   tebranish: "📳",
// };
// const turColors = {
//   harorat: "#ff2d55",
//   bosim: "#ff6b1a",
//   gaz: "#ffd60a",
//   quvvat: "#00d4ff",
//   oqim: "#00ff9d",
//   tebranish: "#a78bfa",
// };

// function DatchikCard({ d, isDark }) {
//   const color = turColors[d.tur] || "#00d4ff";
//   const pct =
//     d.qiymat !== null ? Math.min(100, (d.qiymat / d.chegara) * 100) : 0;
//   const isAlert = d.holat === "xato" || d.holat === "ogohlantirish";

//   return (
//     <Box
//       sx={{
//         background: !isDark ? "#fff" : "#0a0e1a",
//         border: `1px solid ${isAlert ? (d.holat === "xato" ? "rgba(255,45,85,0.4)" : "rgba(255,214,10,0.3)") : "#1e2a3d"}`,
//         borderRadius: 1,
//         p: 1.5,
//         cursor: "pointer",
//         transition: "all 0.2s",
//         "&:hover": {
//           borderColor: `rgba(${color === "#ff2d55" ? "255,45,85" : "0,212,255"},0.3)`,
//           transform: "translateY(-1px)",
//         },
//       }}
//     >
//       <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
//         <Typography
//           sx={{
//             fontFamily: "'Arial',san-serif",
//             fontSize: "0.55rem",
//             color: "#6b7280",
//             letterSpacing: "0.1em",
//           }}
//         >
//           {turIcons[d.tur]} {d.id}
//         </Typography>
//         <StatusChip holat={d.holat} />
//       </Box>
//       <Typography sx={{ fontWeight: 600, fontSize: "0.8rem", mb: 0.8 }}>
//         {d.nom}
//       </Typography>
//       <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 0.8 }}>
//         <Typography
//           sx={{
//             fontFamily: "'Arial',san-serif",
//             fontSize: "1.4rem",
//             fontWeight: 700,
//             color: d.holat === "xato" ? "#ff2d55" : color,
//           }}
//         >
//           {d.qiymat !== null ? d.qiymat : "—"}
//         </Typography>
//         <Typography sx={{ color: "#6b7280", fontSize: "0.7rem" }}>
//           {d.birlik}
//         </Typography>
//       </Box>
//       <Box sx={{ mb: 0.8 }}>
//         <LinearProgress
//           variant="determinate"
//           value={pct}
//           sx={{
//             "& .MuiLinearProgress-bar": {
//               background: pct > 95 ? "#ff2d55" : pct > 80 ? "#ffd60a" : color,
//             },
//           }}
//         />
//       </Box>
//       <Box sx={{ display: "flex", justifyContent: "space-between" }}>
//         {/* <Typography
//           sx={{
//             fontFamily: "'Arial',san-serif",
//             fontSize: "0.55rem",
//             color: "#6b7280",
//           }}
//         >
//           {d.sexId}
//         </Typography> */}
//         <Typography
//           sx={{
//             fontFamily: "'Arial',san-serif",
//             fontSize: "0.55rem",
//             color: "#6b7280",
//           }}
//         >
//           Chegara: {d.chegara} {d.birlik}
//         </Typography>
//       </Box>
//     </Box>
//   );
// }

// export default function Datchiklar() {
//   const theme = useTheme();
//   const isDark = theme.palette.mode === "dark";
//   const dispatch = useDispatch();
//   const filter = useSelector((s) => s.datchiklar.filter);
//   const viewMode = useSelector((s) => s.datchiklar.viewMode);

//   const { data: sexlar } = useQuery({
//     queryKey: ["sexlar"],
//     queryFn: getSexlar,
//   });
//   const { data, isLoading } = useQuery({
//     queryKey: ["datchiklar", filter],
//     queryFn: () =>
//       getDatchiklar({
//         sexId: filter.sexId || undefined,
//         tur: filter.tur || undefined,
//       }),
//     refetchInterval: 3000,
//   });

//   const datchiklar = data?.data || [];
//   const sx = sexlar?.data || [];

//   const columns = [
//     {
//       field: "id",
//       headerName: "ID",
//       width: 110,
//       renderCell: (p) => (
//         <Typography
//           sx={{
//             fontFamily: "'Arial',san-serif",
//             fontSize: "0.7rem",
//             color: "#ff6b1a",
//           }}
//         >
//           {p.value}
//         </Typography>
//       ),
//     },
//     { field: "nom", headerName: "NOMI", width: 140 },
//     {
//       field: "tur",
//       headerName: "TURI",
//       width: 100,
//       renderCell: (p) => (
//         <Typography
//           sx={{ fontFamily: "'Arial',san-serif", fontSize: "0.7rem" }}
//         >
//           {turIcons[p.value]} {p.value}
//         </Typography>
//       ),
//     },
//     { field: "sexId", headerName: "SEX", width: 80 },
//     {
//       field: "holat",
//       headerName: "HOLAT",
//       width: 130,
//       renderCell: (p) => <StatusChip holat={p.value} />,
//     },
//     {
//       field: "qiymat",
//       headerName: "QIYMAT",
//       width: 100,
//       renderCell: (p) => (
//         <Typography
//           sx={{
//             fontFamily: "'Arial',san-serif",
//             fontSize: "0.75rem",
//             color:
//               p.row.holat === "xato"
//                 ? "#ff2d55"
//                 : turColors[p.row.tur] || "#e8eaf0",
//           }}
//         >
//           {p.value !== null ? `${p.value} ${p.row.birlik}` : "—"}
//         </Typography>
//       ),
//     },
//     {
//       field: "chegara",
//       headerName: "CHEGARA",
//       width: 100,
//       renderCell: (p) => (
//         <Typography
//           sx={{
//             fontFamily: "'Arial',san-serif",
//             fontSize: "0.7rem",
//             color: "#6b7280",
//           }}
//         >
//           {p.value} {p.row.birlik}
//         </Typography>
//       ),
//     },
//     {
//       field: "uchastkId",
//       headerName: "HUDUD",
//       width: 120,
//       renderCell: (p) => (
//         <Typography
//           sx={{
//             fontFamily: "'Arial',san-serif",
//             fontSize: "0.65rem",
//             color: "#6b7280",
//           }}
//         >
//           {p.value}
//         </Typography>
//       ),
//     },
//   ];

//   return (
//     <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "flex-start",
//           justifyContent: "space-between",
//           flexWrap: "wrap",
//           gap: 1,
//         }}
//       >
//         <Box>
//           <Typography
//             sx={{
//               fontFamily: "'Arial',san-serif",
//               fontSize: "1.1rem",
//               fontWeight: 700,
//               letterSpacing: "0.15em",
//             }}
//           >
//             DATCHIKLAR
//           </Typography>
//           <Typography
//             sx={{
//               fontFamily: "'Arial',san-serif",
//               fontSize: "0.65rem",
//               color: "#6b7280",
//             }}
//           >
//             Jonli monitoring · {datchiklar.length} datchik · Har 3 soniyada
//             yangilanadi
//           </Typography>
//         </Box>
//         <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
//           <FormControl size="small" sx={{ minWidth: 150 }}>
//             <InputLabel
//               sx={{
//                 fontFamily: "'Arial',san-serif",
//                 fontSize: "0.7rem",
//               }}
//             >
//               BO'LINMA
//             </InputLabel>
//             <Select
//               value={filter.sexId || ""}
//               onChange={(e) =>
//                 dispatch(setDatchikFilter({ sexId: e.target.value }))
//               }
//               label="BO'LINMA"
//               sx={{
//                 fontFamily: "'Arial',san-serif",
//                 fontSize: "0.75rem",
//               }}
//             >
//               <MenuItem value="">
//                 <em>Barchasi</em>
//               </MenuItem>
//               {sx.map((s) => (
//                 <MenuItem
//                   key={s.id}
//                   value={s.id}
//                   sx={{
//                     fontFamily: "'Arial',san-serif",
//                     fontSize: "0.75rem",
//                   }}
//                 >
//                   {s.nom}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//           <FormControl size="small" sx={{ minWidth: 140 }}>
//             <InputLabel
//               sx={{
//                 fontFamily: "'Arial',san-serif",
//                 fontSize: "0.7rem",
//               }}
//             >
//               TURI
//             </InputLabel>
//             <Select
//               value={filter.tur || ""}
//               onChange={(e) =>
//                 dispatch(setDatchikFilter({ tur: e.target.value }))
//               }
//               label="TURI"
//               sx={{
//                 fontFamily: "'Arial',san-serif",
//                 fontSize: "0.75rem",
//               }}
//             >
//               <MenuItem value="">
//                 <em>Barchasi</em>
//               </MenuItem>
//               {Object.entries(turIcons).map(([k, v]) => (
//                 <MenuItem
//                   key={k}
//                   value={k}
//                   sx={{
//                     fontFamily: "'Arial',san-serif",
//                     fontSize: "0.75rem",
//                   }}
//                 >
//                   {v} {k}
//                 </MenuItem>
//               ))}
//             </Select>
//           </FormControl>
//           <ToggleButtonGroup
//             value={viewMode}
//             exclusive
//             onChange={(_, v) => v && dispatch(setViewMode(v))}
//             size="small"
//           >
//             <ToggleButton value="grid">
//               <GridViewIcon sx={{ fontSize: 16 }} />
//             </ToggleButton>
//             <ToggleButton value="list">
//               <ListIcon sx={{ fontSize: 16 }} />
//             </ToggleButton>
//           </ToggleButtonGroup>
//         </Box>
//       </Box>

//       {/* STATS */}
//       <Grid container spacing={1.5}>
//         {Object.entries(turIcons).map(([tur, icon]) => {
//           const count = datchiklar.filter((d) => d.tur === tur).length;
//           const alerts = datchiklar.filter(
//             (d) =>
//               d.tur === tur &&
//               (d.holat === "xato" || d.holat === "ogohlantirish"),
//           ).length;
//           return (
//             <Grid item xs={6} sm={4} md={2} key={tur}>
//               <Paper
//                 sx={{
//                   p: 1.5,
//                   textAlign: "center",
//                   cursor: "pointer",
//                   borderColor:
//                     filter.tur === tur ? "rgba(0,212,255,0.4)" : "#1e2a3d",
//                   "&:hover": { borderColor: "rgba(0,212,255,0.25)" },
//                 }}
//                 onClick={() =>
//                   dispatch(
//                     setDatchikFilter({ tur: filter.tur === tur ? "" : tur }),
//                   )
//                 }
//               >
//                 <Typography sx={{ fontSize: 22, mb: 0.5 }}>{icon}</Typography>
//                 <Typography
//                   sx={{
//                     fontFamily: "'Arial',san-serif",
//                     fontSize: "1.2rem",
//                     fontWeight: 700,
//                     color: turColors[tur],
//                   }}
//                 >
//                   {count}
//                 </Typography>
//                 <Typography
//                   sx={{
//                     fontFamily: "'Arial',san-serif",
//                     fontSize: "0.55rem",
//                     color: "#6b7280",
//                     textTransform: "uppercase",
//                     letterSpacing: "0.1em",
//                   }}
//                 >
//                   {tur}
//                 </Typography>
//                 {alerts > 0 && (
//                   <Typography
//                     sx={{
//                       fontFamily: "'Arial',san-serif",
//                       fontSize: "0.55rem",
//                       color: "#ff2d55",
//                       mt: 0.3,
//                     }}
//                   >
//                     ⚠ {alerts} ogohlantirish
//                   </Typography>
//                 )}
//               </Paper>
//             </Grid>
//           );
//         })}
//       </Grid>

//       {viewMode === "grid" ? (
//         <Box>
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               justifyContent: "space-between",
//               mb: 1.5,
//             }}
//           >
//             <Typography
//               sx={{
//                 fontFamily: "'Arial',san-serif",
//                 fontSize: "0.65rem",
//                 color: "#6b7280",
//               }}
//             >
//               {datchiklar.length} ta datchik ko'rsatilmoqda
//             </Typography>
//           </Box>
//           {isLoading ? (
//             <CardSkeleton />
//           ) : (
//             <Grid container spacing={1.5}>
//               {datchiklar.map((d) => (
//                 <Grid item xs={12} sm={6} md={4} lg={3} key={d.id}>
//                   <DatchikCard d={d} isDark={isDark} />
//                 </Grid>
//               ))}
//             </Grid>
//           )}
//         </Box>
//       ) : (
//         <Paper>
//           <SectionHeader
//             title="Datchiklar Ro'yxati"
//             action={`${datchiklar.length} ta`}
//           />
//           <Box sx={{ height: 550 }}>
//             {isLoading ? (
//               <CardSkeleton rows={10} />
//             ) : (
//               <DataGrid
//                 rows={datchiklar}
//                 columns={columns}
//                 pageSize={15}
//                 rowsPerPageOptions={[15]}
//                 disableSelectionOnClick
//                 sx={{ border: "none" }}
//               />
//             )}
//           </Box>
//         </Paper>
//       )}
//     </Box>
//   );
// }

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
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  useTheme,
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import ListIcon from "@mui/icons-material/List";
import SensorsIcon from "@mui/icons-material/Sensors";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import { getDatchiklar, getSexlar } from "@/api";
import { StatusChip, SectionHeader, CardSkeleton } from "@/components/common";
import { setDatchikFilter, setViewMode } from "@/store";
import { DataGrid } from "@mui/x-data-grid";

// ─────────────────────────────────────────────────────────────
// UI TOKENS
// ─────────────────────────────────────────────────────────────
const FONT_FAMILY = `"Inter", "Arial", sans-serif`;

const getUiTokens = (isDark) => ({
  bg: isDark ? "#0b1220" : "#f3f7fb",
  panel: isDark ? "#111827" : "#ffffff",
  panel2: isDark ? "#0f172a" : "#f8fafc",
  elevated: isDark ? "#162033" : "#ffffff",
  border: isDark ? "rgba(148,163,184,0.14)" : "rgba(15,23,42,0.08)",
  borderStrong: isDark ? "rgba(148,163,184,0.24)" : "rgba(15,23,42,0.14)",
  text: isDark ? "#e5edf7" : "#0f172a",
  subtext: isDark ? "#94a3b8" : "#64748b",
  muted: isDark ? "#64748b" : "#94a3b8",
  hover: isDark ? "#162033" : "#eef4ff",
  accent: "#2563eb",
  success: "#22c55e",
  warning: "#f59e0b",
  error: "#ef4444",
  info: "#0ea5e9",
  purple: "#8b5cf6",
  shadow: isDark
    ? "0 18px 40px rgba(2, 6, 23, 0.45)"
    : "0 14px 34px rgba(15, 23, 42, 0.08)",
  glow: (color) =>
    isDark
      ? `0 10px 30px rgba(2,6,23,0.55), 0 0 0 1px ${color}18`
      : `0 10px 30px rgba(15,23,42,0.10), 0 0 0 1px ${color}12`,
});

// ─────────────────────────────────────────────────────────────
// SENSOR TYPES
// ─────────────────────────────────────────────────────────────
const turIcons = {
  harorat: "🌡",
  bosim: "💨",
  gaz: "⛽",
  quvvat: "⚡",
  oqim: "🌊",
  tebranish: "📳",
};

const turColors = {
  harorat: "#ef4444",
  bosim: "#f97316",
  gaz: "#eab308",
  quvvat: "#06b6d4",
  oqim: "#22c55e",
  tebranish: "#8b5cf6",
};

const getTypeColor = (tur) => turColors[tur] || "#06b6d4";

const getProgressColor = (pct, baseColor, ui) => {
  if (pct > 95) return ui.error;
  if (pct > 80) return ui.warning;
  return baseColor;
};

const getCardBorder = (holat, ui) => {
  if (holat === "xato") return "rgba(239,68,68,0.35)";
  if (holat === "ogohlantirish") return "rgba(245,158,11,0.35)";
  return ui.border;
};

// ─────────────────────────────────────────────────────────────
// DATCHIK CARD
// ─────────────────────────────────────────────────────────────
function DatchikCard({ d, isDark }) {
  const ui = getUiTokens(isDark);
  const color = getTypeColor(d.tur);
  const pct =
    d.qiymat !== null && d.chegara
      ? Math.min(100, (d.qiymat / d.chegara) * 100)
      : 0;
  const progressColor = getProgressColor(pct, color, ui);

  return (
    <Box
      sx={{
        position: "relative",
        height: "100%",
        background: `linear-gradient(180deg, ${ui.panel} 0%, ${ui.panel2} 100%)`,
        border: "1px solid",
        borderColor: getCardBorder(d.holat, ui),
        borderRadius: 4,
        p: 2,
        cursor: "pointer",
        transition: "all 0.25s ease",
        boxShadow: ui.shadow,
        overflow: "hidden",
        "&:hover": {
          transform: "translateY(-5px)",
          borderColor: `${color}55`,
          boxShadow: ui.glow(color),
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          background: `linear-gradient(135deg, ${color}10 0%, transparent 50%, transparent 100%)`,
          pointerEvents: "none",
        }}
      />

      <Box
        sx={{
          position: "relative",
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          mb: 1.2,
          gap: 1,
        }}
      >
        <Box>
          {/* <Typography
            sx={{
              fontFamily: FONT_FAMILY,
              fontSize: "0.72rem",
              fontWeight: 700,
              color: color,
              letterSpacing: "0.08em",
              mb: 0.4,
            }}
          >
            {turIcons[d.tur]} {d.id}
          </Typography> */}

          <Typography
            sx={{
              fontFamily: FONT_FAMILY,
              fontWeight: 800,
              fontSize: "0.98rem",
              color: ui.text,
              lineHeight: 1.3,
            }}
          >
            {d.nom}
          </Typography>
        </Box>

        <StatusChip holat={d.holat} />
      </Box>

      <Box
        sx={{
          p: 1.4,
          borderRadius: 3,
          background: isDark ? "rgba(255,255,255,0.03)" : "#f8fafc",
          border: "1px solid",
          borderColor: ui.border,
          mb: 1.4,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.7 }}>
          <Typography
            sx={{
              fontFamily: FONT_FAMILY,
              fontSize: "1.75rem",
              fontWeight: 900,
              color: d.holat === "xato" ? ui.error : color,
              lineHeight: 1,
            }}
          >
            {d.qiymat !== null ? d.qiymat : "—"}
          </Typography>

          <Typography
            sx={{
              fontFamily: FONT_FAMILY,
              color: ui.subtext,
              fontSize: "0.82rem",
              fontWeight: 600,
            }}
          >
            {d.birlik}
          </Typography>
        </Box>

        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.72rem",
            color: ui.subtext,
            mt: 0.6,
          }}
        >
          Joriy o‘lchov qiymati
        </Typography>
      </Box>

      <Box sx={{ mb: 1.2 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 0.7,
          }}
        >
          <Typography
            sx={{
              fontFamily: FONT_FAMILY,
              fontSize: "0.72rem",
              color: ui.subtext,
              fontWeight: 700,
            }}
          >
            Chegaraga nisbatan
          </Typography>
          <Typography
            sx={{
              fontFamily: FONT_FAMILY,
              fontSize: "0.76rem",
              color: progressColor,
              fontWeight: 800,
            }}
          >
            {Math.round(pct)}%
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            height: 8,
            borderRadius: 999,
            backgroundColor: isDark
              ? "rgba(255,255,255,0.06)"
              : "rgba(15,23,42,0.06)",
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              backgroundColor: progressColor,
            },
          }}
        />
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 1,
          flexWrap: "wrap",
          pt: 0.6,
        }}
      >
        <Chip
          label={`${turIcons[d.tur]} ${d.tur}`}
          size="small"
          sx={{
            height: 24,
            fontSize: "0.72rem",
            fontWeight: 700,
            fontFamily: FONT_FAMILY,
            bgcolor: `${color}16`,
            color,
            border: `1px solid ${color}25`,
            borderRadius: 2,
          }}
        />

        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.72rem",
            color: ui.subtext,
            fontWeight: 600,
          }}
        >
          Chegara: {d.chegara} {d.birlik}
        </Typography>
      </Box>
    </Box>
  );
}

// ─────────────────────────────────────────────────────────────
// MAIN PAGE
// ─────────────────────────────────────────────────────────────
export default function Datchiklar() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const ui = getUiTokens(isDark);

  const dispatch = useDispatch();
  const filter = useSelector((s) => s.datchiklar.filter);
  const viewMode = useSelector((s) => s.datchiklar.viewMode);

  const { data: sexlar } = useQuery({
    queryKey: ["sexlar"],
    queryFn: getSexlar,
  });

  const { data, isLoading } = useQuery({
    queryKey: ["datchiklar", filter],
    queryFn: () =>
      getDatchiklar({
        sexId: filter.sexId || undefined,
        tur: filter.tur || undefined,
      }),
    refetchInterval: 3000,
    refetchOnWindowFocus: true,
  });

  const datchiklar = data?.data || [];
  const sx = sexlar?.data || [];

  const totalAlerts = datchiklar.filter(
    (d) => d.holat === "xato" || d.holat === "ogohlantirish",
  ).length;

  const avgLoad = datchiklar.length
    ? Math.round(
        datchiklar.reduce((sum, d) => {
          const pct =
            d.qiymat !== null && d.chegara
              ? Math.min(100, (d.qiymat / d.chegara) * 100)
              : 0;
          return sum + pct;
        }, 0) / datchiklar.length,
      )
    : 0;

  const stats = [
    {
      label: "Jami datchiklar",
      value: datchiklar.length,
      color: ui.accent,
      icon: <SensorsIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Ogohlantirishlar",
      value: totalAlerts,
      color: ui.warning,
      icon: <WarningAmberRoundedIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "Faol turlar",
      value: Object.keys(turIcons).filter(
        (tur) => datchiklar.filter((d) => d.tur === tur).length > 0,
      ).length,
      color: ui.info,
      icon: <GridViewIcon sx={{ fontSize: 18 }} />,
    },
    {
      label: "O‘rt. yuklama",
      value: `${avgLoad}%`,
      color: ui.purple,
      icon: <ListIcon sx={{ fontSize: 18 }} />,
    },
  ];

  const columns = [
    {
      field: "rowNumber",
      headerName: "№",
      width: 80,
      sortable: false,
      renderCell: (params) => (
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.78rem",
            fontWeight: 700,
            color: ui.accent,
          }}
        >
          {params.api.getRowIndexRelativeToVisibleRows(params.id) + 1}
        </Typography>
      ),
    },
    {
      field: "id",
      headerName: "ID",
      width: 120,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.78rem",
            fontWeight: 700,
            color: ui.info,
          }}
        >
          {p.value}
        </Typography>
      ),
    },
    {
      field: "nom",
      headerName: "Nomi",
      flex: 1.2,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontWeight: 700,
            fontSize: "0.88rem",
            color: ui.text,
          }}
        >
          {p.value}
        </Typography>
      ),
    },
    {
      field: "tur",
      headerName: "Turi",
      width: 130,
      renderCell: (p) => {
        const color = getTypeColor(p.value);
        return (
          <Chip
            label={`${turIcons[p.value] || "•"} ${p.value}`}
            size="small"
            sx={{
              height: 24,
              fontSize: "0.72rem",
              fontWeight: 700,
              fontFamily: FONT_FAMILY,
              bgcolor: `${color}16`,
              color,
              borderRadius: 2,
              border: `1px solid ${color}25`,
            }}
          />
        );
      },
    },
    {
      field: "sexId",
      headerName: "Bo‘lim",
      width: 110,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.78rem",
            color: ui.subtext,
            fontWeight: 600,
          }}
        >
          {p.value}
        </Typography>
      ),
    },
    {
      field: "holat",
      headerName: "Holat",
      width: 130,
      renderCell: (p) => <StatusChip holat={p.value} />,
    },
    {
      field: "qiymat",
      headerName: "Qiymat",
      width: 130,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.8rem",
            fontWeight: 800,
            color: p.row.holat === "xato" ? ui.error : getTypeColor(p.row.tur),
          }}
        >
          {p.value !== null ? `${p.value} ${p.row.birlik}` : "—"}
        </Typography>
      ),
    },
    {
      field: "chegara",
      headerName: "Chegara",
      width: 120,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.78rem",
            color: ui.subtext,
            fontWeight: 600,
          }}
        >
          {p.value} {p.row.birlik}
        </Typography>
      ),
    },
    {
      field: "uchastkId",
      headerName: "Hudud",
      width: 130,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: FONT_FAMILY,
            fontSize: "0.75rem",
            color: ui.subtext,
          }}
        >
          {p.value}
        </Typography>
      ),
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100%",
        p: { xs: 1.5, sm: 2, md: 2.5 },
        background: ui.bg,
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* HEADER */}
      <Paper
        sx={{
          p: { xs: 1.5, sm: 2, md: 2.2 },
          borderRadius: 4,
          background: isDark
            ? "linear-gradient(135deg, #0f172a 0%, #111827 100%)"
            : "linear-gradient(135deg, #ffffff 0%, #f8fbff 100%)",
          border: "1px solid",
          borderColor: ui.border,
          boxShadow: ui.shadow,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          <Box>
            <Typography
              sx={{
                fontFamily: FONT_FAMILY,
                fontSize: { xs: "1.2rem", md: "1.55rem" },
                fontWeight: 900,
                letterSpacing: "-0.02em",
                color: ui.text,
                mb: 0.4,
              }}
            >
              Datchiklar monitoringi
            </Typography>

            <Typography
              sx={{
                fontFamily: FONT_FAMILY,
                fontSize: "0.9rem",
                color: ui.subtext,
              }}
            >
              Jonli monitoring · {datchiklar.length} ta datchik · Har 3 soniyada
              yangilanadi
            </Typography>
          </Box>

          <Box
            sx={{
              display: "flex",
              gap: 1.2,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 170 }}>
              <InputLabel>Bo‘lim</InputLabel>
              <Select
                value={filter.sexId || ""}
                label="Bo‘lim"
                onChange={(e) =>
                  dispatch(
                    setDatchikFilter({
                      ...filter,
                      sexId: e.target.value,
                    }),
                  )
                }
                sx={{
                  borderRadius: 3,
                  background: isDark ? "#0b1220" : "#ffffff",
                  fontFamily: FONT_FAMILY,
                }}
              >
                <MenuItem value="">Barchasi</MenuItem>
                {sx.map((s) => (
                  <MenuItem key={s.id} value={s.id}>
                    {s.nom}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Turi</InputLabel>
              <Select
                value={filter.tur || ""}
                label="Turi"
                onChange={(e) =>
                  dispatch(
                    setDatchikFilter({
                      ...filter,
                      tur: e.target.value,
                    }),
                  )
                }
                sx={{
                  borderRadius: 3,
                  background: isDark ? "#0b1220" : "#ffffff",
                  fontFamily: FONT_FAMILY,
                }}
              >
                <MenuItem value="">Barchasi</MenuItem>
                {Object.entries(turIcons).map(([k, v]) => (
                  <MenuItem key={k} value={k}>
                    {v} {k}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, v) => v && dispatch(setViewMode(v))}
              size="small"
              sx={{
                background: isDark ? "#0b1220" : "#ffffff",
                borderRadius: 3,
                border: `1px solid ${ui.border}`,
                overflow: "hidden",
                "& .MuiToggleButton-root": {
                  px: 1.4,
                  py: 0.8,
                  border: "none",
                  color: ui.subtext,
                  "&.Mui-selected": {
                    background: `${ui.accent}14`,
                    color: ui.accent,
                  },
                },
              }}
            >
              <ToggleButton value="grid">
                <GridViewIcon sx={{ fontSize: 18 }} />
              </ToggleButton>
              <ToggleButton value="list">
                <ListIcon sx={{ fontSize: 18 }} />
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
      </Paper>

      {/* TOP STATS */}
      <Grid container spacing={1.5}>
        {stats.map((item) => (
          <Grid item xs={12} sm={6} md={3} key={item.label}>
            <Paper
              sx={{
                p: 2,
                borderRadius: 4,
                background: ui.panel,
                border: "1px solid",
                borderColor: ui.border,
                boxShadow: ui.shadow,
                height: "100%",
              }}
            >
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
                    fontFamily: FONT_FAMILY,
                    fontSize: "0.8rem",
                    color: ui.subtext,
                  }}
                >
                  {item.label}
                </Typography>
                <Box
                  sx={{
                    color: item.color,
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {item.icon}
                </Box>
              </Box>

              <Typography
                sx={{
                  fontFamily: FONT_FAMILY,
                  fontSize: "1.8rem",
                  fontWeight: 900,
                  color: item.color,
                  lineHeight: 1,
                }}
              >
                {item.value}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* TYPE STATS */}
      <Grid container spacing={1.5}>
        {Object.entries(turIcons).map(([tur, icon]) => {
          const count = datchiklar.filter((d) => d.tur === tur).length;
          const alerts = datchiklar.filter(
            (d) =>
              d.tur === tur &&
              (d.holat === "xato" || d.holat === "ogohlantirish"),
          ).length;
          const color = getTypeColor(tur);
          const active = filter.tur === tur;

          return (
            <Grid item xs={6} sm={4} md={2} key={tur}>
              <Paper
                onClick={() =>
                  dispatch(
                    setDatchikFilter({
                      ...filter,
                      tur: active ? "" : tur,
                    }),
                  )
                }
                sx={{
                  p: 1.6,
                  textAlign: "center",
                  cursor: "pointer",
                  borderRadius: 4,
                  background: active
                    ? isDark
                      ? `${color}12`
                      : `${color}10`
                    : ui.panel,
                  border: "1px solid",
                  borderColor: active ? `${color}55` : ui.border,
                  boxShadow: active ? ui.glow(color) : ui.shadow,
                  transition: "all 0.22s ease",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    borderColor: `${color}44`,
                  },
                }}
              >
                <Typography sx={{ fontSize: 22, mb: 0.6 }}>{icon}</Typography>

                <Typography
                  sx={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "1.25rem",
                    fontWeight: 900,
                    color,
                    lineHeight: 1,
                  }}
                >
                  {count}
                </Typography>

                <Typography
                  sx={{
                    fontFamily: FONT_FAMILY,
                    fontSize: "0.68rem",
                    color: ui.subtext,
                    textTransform: "uppercase",
                    letterSpacing: "0.08em",
                    mt: 0.4,
                  }}
                >
                  {tur}
                </Typography>

                {alerts > 0 && (
                  <Typography
                    sx={{
                      fontFamily: FONT_FAMILY,
                      fontSize: "0.68rem",
                      color: ui.error,
                      mt: 0.5,
                      fontWeight: 700,
                    }}
                  >
                    ⚠ {alerts} ogohlantirish
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {/* CONTENT */}
      {viewMode === "grid" ? (
        <Paper
          sx={{
            p: 2,
            borderRadius: 4,
            background: ui.panel,
            border: "1px solid",
            borderColor: ui.border,
            boxShadow: ui.shadow,
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
              flexWrap: "wrap",
              gap: 1,
            }}
          >
            <Typography
              sx={{
                fontFamily: FONT_FAMILY,
                fontSize: "0.82rem",
                color: ui.subtext,
              }}
            >
              {datchiklar.length} ta datchik ko‘rsatilmoqda
            </Typography>
          </Box>

          {isLoading ? (
            <CardSkeleton />
          ) : (
            <Grid container spacing={1.5}>
              {datchiklar.map((d) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={d.id}>
                  <DatchikCard d={d} isDark={isDark} />
                </Grid>
              ))}
            </Grid>
          )}
        </Paper>
      ) : (
        <Paper
          sx={{
            borderRadius: 4,
            overflow: "hidden",
            background: ui.panel,
            border: "1px solid",
            borderColor: ui.border,
            boxShadow: ui.shadow,
          }}
        >
          <SectionHeader
            title="Datchiklar ro‘yxati"
            action={`${datchiklar.length} ta`}
          />

          <Box sx={{ height: 560 }}>
            {isLoading ? (
              <CardSkeleton rows={10} />
            ) : (
              <DataGrid
                rows={datchiklar}
                columns={columns}
                pageSize={15}
                rowsPerPageOptions={[15]}
                disableSelectionOnClick
                sx={{
                  border: "none",
                  fontFamily: FONT_FAMILY,
                  color: ui.text,
                  "& .MuiDataGrid-columnHeaders": {
                    background: isDark ? "#0b1220" : "#f8fafc",
                    borderBottom: `1px solid ${ui.border}`,
                  },
                  "& .MuiDataGrid-columnHeaderTitle": {
                    fontWeight: 800,
                    fontSize: "0.8rem",
                    fontFamily: FONT_FAMILY,
                    color: ui.text,
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: `1px solid ${ui.border}`,
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: isDark
                      ? "rgba(37,99,235,0.08)"
                      : "#eef4ff",
                  },
                  "& .MuiDataGrid-footerContainer": {
                    borderTop: `1px solid ${ui.border}`,
                    background: isDark ? "#0b1220" : "#f8fafc",
                  },
                }}
              />
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

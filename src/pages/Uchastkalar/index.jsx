import { useMemo, useState } from "react";
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
  IconButton,
  Divider,
  useTheme,
  Tabs,
  Tab,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import PeopleIcon from "@mui/icons-material/People";
import BuildIcon from "@mui/icons-material/Build";
import SpeedIcon from "@mui/icons-material/Speed";
import WaterIcon from "@mui/icons-material/Water";
import { StatusChip, CardSkeleton } from "@/components/common";
import { setSelectedUchastka, setUskunaFilter } from "@/store";
import { DataGrid } from "@mui/x-data-grid";
import { useNavigate } from "react-router-dom";
import { getSexlarHybrid, getUchastkalarHybrid } from "@/api/hybrid";

// ─── UCHASTKA MINI CHART (sparkline) ──────────────────────────────
const MiniSparkline = ({ color = "#00d4ff", pct = 70 }) => {
  const pts = Array.from(
    { length: 8 },
    (_, i) => pct + Math.sin(i * 0.8) * 12 + (Math.random() * 8 - 4),
  );
  const max = Math.max(...pts);
  const min = Math.min(...pts);
  const norm = pts.map((p) => 30 - ((p - min) / Math.max(1, max - min)) * 28);
  const path = norm
    .map((y, x) => `${x === 0 ? "M" : "L"}${x * 10},${y}`)
    .join(" ");

  return (
    <svg viewBox="0 0 70 32" style={{ width: 70, height: 32, opacity: 0.5 }}>
      <path
        d={path}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={70} cy={norm[7]} r="2.5" fill={color} />
    </svg>
  );
};

const uchastkRang = {
  faol: "#00ff9d",
  ogohlantirish: "#ffd60a",
  xato: "#ff2d55",
  toxtagan: "#6b7280",
};

function getTempColor(value) {
  if (value > 1200) return "#ff2d55";
  if (value > 200) return "#ff6b1a";
  return "#8896a5";
}

function getEfficiencyColor(value, isDark) {
  if (value >= 90) return isDark ? "#00ff9d" : "#00a85a";
  if (value >= 70) return "#ffd60a";
  return "#ff2d55";
}

// ─── UCHASTKA DETAIL DRAWER ────────────────────────────────────────
function UchastkadDetail({ u, onClose }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [tab, setTab] = useState(0);
  const { t } = useScriptText();

  if (!u) return null;

  const metrics = [
    {
      icon: <ThermostatIcon sx={{ fontSize: 16 }} />,
      label: "Harorat",
      val: `${u.harorat}°C`,
      color: getTempColor(u.harorat),
      pct: Math.min(100, (u.harorat / 1700) * 100),
    },
    {
      icon: <WaterIcon sx={{ fontSize: 16 }} />,
      label: "Bosim",
      val: `${u.bosim} bar`,
      color: "#00d4ff",
      pct: Math.min(100, (u.bosim / 10) * 100),
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 16 }} />,
      label: "Samaradorlik",
      val: `${u.samaradorlik}%`,
      color: getEfficiencyColor(u.samaradorlik, isDark),
      pct: u.samaradorlik,
    },
    {
      icon: <BuildIcon sx={{ fontSize: 16 }} />,
      label: "Uskunalar",
      val: `${u.uskunalar} ta`,
      color: "#a78bfa",
      pct: Math.min(100, (u.uskunalar / 8) * 100),
    },
    {
      icon: <PeopleIcon sx={{ fontSize: 16 }} />,
      label: "Ishchilar",
      val: `${u.ishchilar} kishi`,
      color: isDark ? "#00ff9d" : "#00a85a",
      pct: Math.min(100, (u.ishchilar / 140) * 100),
    },
  ];

  return (
    <Box
      sx={{
        width: 360,
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)",
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
            <Typography
              sx={{
                fontWeight: 700,
                fontSize: "1rem",
                color: "text.primary",
                mb: 0.4,
              }}
            >
              {t(u.nom)}
            </Typography>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <StatusChip holat={u.holat} />
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

      <Tabs
        value={tab}
        onChange={(_, v) => setTab(v)}
        sx={{
          borderBottom: "1px solid",
          borderColor: "divider",
          "& .MuiTabs-indicator": { background: "primary.main" },
          minHeight: 38,
        }}
      >
        <Tab
          label={t("Ko'rsatkichlar")}
          sx={{ fontSize: "0.65rem", minHeight: 38 }}
        />
        <Tab label={t("Tarix")} sx={{ fontSize: "0.65rem", minHeight: 38 }} />
      </Tabs>

      <Box sx={{ flex: 1, overflow: "auto", p: 2 }}>
        {tab === 0 && (
          <>
            <Grid container spacing={1} sx={{ mb: 2 }}>
              {metrics.map((m) => (
                <Grid item xs={6} key={m.label}>
                  <Box
                    sx={{
                      background: isDark
                        ? "rgba(0,0,0,0.2)"
                        : "rgba(0,0,0,0.02)",
                      border: "1px solid",
                      borderColor: "divider",
                      borderRadius: 1,
                      p: 1.2,
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 0.5,
                        color: m.color,
                      }}
                    >
                      {m.icon}
                      <Typography
                        sx={{
                          fontFamily: "'Arial',san-serif",
                          fontSize: "0.58rem",
                          color: "text.secondary",
                          letterSpacing: "0.08em",
                        }}
                      >
                        {t(m.label)}
                      </Typography>
                    </Box>

                    <Typography
                      sx={{
                        fontFamily: "'Arial',san-serif",
                        fontSize: "0.88rem",
                        fontWeight: 700,
                        color: m.color,
                        mb: 0.5,
                      }}
                    >
                      {m.val}
                    </Typography>

                    <LinearProgress
                      variant="determinate"
                      value={m.pct}
                      sx={{
                        height: 3,
                        "& .MuiLinearProgress-bar": { background: m.color },
                      }}
                    />
                  </Box>
                </Grid>
              ))}
            </Grid>

            <Divider sx={{ mb: 1.5 }} />

            {[
              { l: "Sex", v: u.sexId },
              { l: "Hudud ID", v: u.id },
              { l: "Holat", v: u.holat },
              { l: "Harorat", v: `${u.harorat}°C` },
              { l: "Bosim", v: `${u.bosim} bar` },
              { l: "Uskunalar", v: `${u.uskunalar} ta` },
              { l: "Ishchilar", v: `${u.ishchilar} kishi` },
              { l: "Samaradorlik", v: `${u.samaradorlik}%` },
              ...(u.extraLabel ? [{ l: "Qo'shimcha", v: u.extraLabel }] : []),
            ].map((it) => (
              <Box
                key={it.l}
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  py: 0.7,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                  gap: 1,
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.62rem",
                    color: "text.secondary",
                  }}
                >
                  {t(it.l)}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.7rem",
                    color: "text.primary",
                    textAlign: "right",
                  }}
                >
                  {it.v}
                </Typography>
              </Box>
            ))}
          </>
        )}

        {tab === 1 && (
          <Box>
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.62rem",
                color: "text.secondary",
                mb: 1.5,
              }}
            >
              {t("OXIRGI 24 SOAT HARORAT DINAMIKASI")}
            </Typography>

            <Box
              sx={{
                background: isDark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.02)",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 1,
                p: 1.5,
                mb: 1.5,
              }}
            >
              <svg viewBox="0 0 300 80" style={{ width: "100%" }}>
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff6b1a" stopOpacity="0.3" />
                    <stop
                      offset="100%"
                      stopColor="#ff6b1a"
                      stopOpacity="0.02"
                    />
                  </linearGradient>
                </defs>

                {(() => {
                  const pts = Array.from({ length: 25 }, (_, i) => ({
                    x: i * 12,
                    y:
                      70 -
                      ((u.harorat + Math.sin(i * 0.5) * 60 - 200) / 1500) * 65,
                  }));

                  const line = pts
                    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
                    .join(" ");

                  const area = `M0,75 ${pts
                    .map((p) => `L${p.x},${p.y}`)
                    .join(" ")} L${pts[pts.length - 1].x},75 Z`;

                  return (
                    <>
                      <path d={area} fill="url(#areaGrad)" />
                      <path
                        d={line}
                        fill="none"
                        stroke="#ff6b1a"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </>
                  );
                })()}
              </svg>

              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  mt: 0.5,
                }}
              >
                {["00:00", "12:00", "24:00"].map((x) => (
                  <Typography
                    key={x}
                    sx={{
                      fontFamily: "'Arial',san-serif",
                      fontSize: "0.55rem",
                      color: "text.disabled",
                    }}
                  >
                    {x}
                  </Typography>
                ))}
              </Box>
            </Box>

            {[
              {
                t: "14:32",
                e: "Harorat normal chegaraga qaytdi",
                c: "#00ff9d",
              },
              {
                t: "13:15",
                e: "Harorat ogohlantirish darajasiga yetdi",
                c: "#ffd60a",
              },
              { t: "10:00", e: "Smena almashinuvi", c: "#00d4ff" },
              { t: "08:00", e: "Uskuna profilaktik tekshiruvi", c: "#6b7280" },
            ].map((log, i) => (
              <Box
                key={i}
                sx={{
                  display: "flex",
                  gap: 1.5,
                  py: 0.8,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Box
                  sx={{
                    width: 3,
                    borderRadius: 1,
                    background: log.c,
                    flexShrink: 0,
                    alignSelf: "stretch",
                    minHeight: 20,
                  }}
                />
                <Box>
                  <Typography
                    sx={{
                      fontFamily: "'Arial',san-serif",
                      fontSize: "0.7rem",
                      color: "text.primary",
                    }}
                  >
                    {t(log.e)}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Arial',san-serif",
                      fontSize: "0.58rem",
                      color: "text.secondary",
                    }}
                  >
                    {t(log.t)}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ─── UCHASTKA KARTI ────────────────────────────────────────────────
function UchastkCard({ u, onClick }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const color = uchastkRang[u.holat] || "#6b7280";
  const { t } = useScriptText();

  return (
    <Box
      onClick={() => onClick(u)}
      sx={{
        background: isDark ? "#0d1220" : "#fff",
        border: "1px solid",
        borderColor: "divider",
        borderLeft: `3px solid ${color}`,
        borderRadius: "0 4px 4px 0",
        p: 1.5,
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: color,
          background: isDark ? `${color}08` : `${color}06`,
          transform: "translateX(2px)",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          mb: 1,
          gap: 1,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            sx={{ fontWeight: 700, fontSize: "1rem", color: "text.primary" }}
          >
            {t(u.nom)}
          </Typography>

          {u.extraLabel && (
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.7rem",
                color: "#ccc",
                mt: 0.2,
              }}
            >
              {t(u.extraLabel)}
            </Typography>
          )}
        </Box>

        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "flex-end",
            gap: 0.3,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.6 }}>
            <StatusChip holat={u.holat} />
          </Box>
          <MiniSparkline color={color} pct={u.samaradorlik} />
        </Box>
      </Box>

      <Grid container spacing={1}>
        {[
          {
            l: "HARORAT",
            v: `${u.harorat}°C`,
            c: getTempColor(u.harorat),
          },
          { l: "BOSIM", v: `${u.bosim}bar`, c: "#00d4ff" },
          { l: "USKUNA", v: u.uskunalar, c: "#a78bfa" },
          { l: "ISHCHI", v: u.ishchilar, c: isDark ? "#00ff9d" : "#00a85a" },
        ].map((s) => (
          <Grid item xs={3} key={s.l}>
            <Box
              sx={{
                textAlign: "center",
                background: isDark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.03)",
                borderRadius: 0.5,
                py: 0.4,
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.7rem",
                  fontWeight: 700,
                  color: s.c,
                }}
              >
                {t(s.v)}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.45rem",
                  color: isDark ? "#ccc" : "#000",
                  letterSpacing: "0.06em",
                }}
              >
                {t(s.l)}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 1 }}>
        <LinearProgress
          variant="determinate"
          value={u.samaradorlik}
          sx={{
            height: 3,
            "& .MuiLinearProgress-bar": {
              background:
                u.samaradorlik >= 90
                  ? "#00e676"
                  : u.samaradorlik >= 70
                    ? "#ffd60a"
                    : "#ff2d55",
            },
          }}
        />
        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            fontSize: "0.52rem",
            color: isDark ? "#ccc" : "#000",
            mt: 0.3,
          }}
        >
          {t("SAMARADORLIK:")} {u.samaradorlik}%
        </Typography>
      </Box>
    </Box>
  );
}

// ─── ASOSIY SAHIFA ─────────────────────────────────────────────────
export default function Uchastkalar() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [view, setView] = useState(0); // 0=cards, 1=grid
  const dispatch = useDispatch();
  const selectedSex = useSelector((state) => state.ui.selectedSex);
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const navigation = useNavigate();
  const { t } = useScriptText();

  const [sexFilter, setSexFilter] = useState(selectedSex?.id || "");

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { data: sexlarRes, isLoading: sexlarLoading } = useQuery({
    queryKey: ["sexlar", "hybrid", today],
    queryFn: () =>
      getSexlarHybrid({
        startDate: today,
        endDate: today,
      }),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const {
    data: uchRes,
    isLoading: uchLoading,
    isFetching: uchFetching,
  } = useQuery({
    queryKey: ["uchastkalar", "hybrid", sexFilter || "all", today],
    queryFn: async () => {
      if (sexFilter) {
        return getUchastkalarHybrid(sexFilter, {
          startDate: today,
          endDate: today,
        });
      }

      const sexlar = sexlarRes?.data || [];
      const results = await Promise.all(
        sexlar.map((s) =>
          getUchastkalarHybrid(s.id, {
            startDate: today,
            endDate: today,
          }),
        ),
      );

      return {
        data: results.flatMap((r) => r?.data || []),
      };
    },
    enabled: !!sexlarRes,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const sx = sexlarRes?.data || [];
  const uchastkalar = uchRes?.data || [];
  const isLoading = sexlarLoading || uchLoading;

  const isLiveMode =
    sexFilter === "SEX-07" ||
    (!sexFilter && sx.some((s) => s.id === "SEX-07" && s.live));

  const handleOpen = (u) => {
    setSelected(u);
    setDrawerOpen(false);
    dispatch(setSelectedUchastka(u));
    dispatch(setUskunaFilter({ uchastkId: u.id }));
    navigation("/uskunalar");
  };

  const groupedBySex = useMemo(() => {
    return sx.reduce((acc, s) => {
      const items = uchastkalar.filter((u) => u.sexId === s.id);
      if (items.length > 0) acc[s.id] = { sex: s, items };
      return acc;
    }, {});
  }, [sx, uchastkalar]);

  const columns = [
    {
      field: "nom",
      headerName: "BO'LINMA NOMI",
      flex: 1,
      headerAlign: "left",
      align: "left",
      renderCell: (p) => (
        <Box sx={{ pl: 2, display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
            {t(p.value)}
          </Typography>
          {/* {p.row.live && (
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.52rem",
                color: "#00e676",
              }}
            >
              LIVE
            </Typography>
          )} */}
        </Box>
      ),
    },
    {
      field: "holat",
      headerName: "HOLAT",
      width: 130,
      headerAlign: "center",
      align: "center",
      renderCell: (p) => <StatusChip holat={p.value} />,
    },
    {
      field: "uskunalar",
      headerName: "USKUNALAR",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            fontSize: "0.75rem",
          }}
        >
          {p.value} ta
        </Typography>
      ),
    },
    {
      field: "ishchilar",
      headerName: "ISHCHILAR",
      width: 100,
      headerAlign: "center",
      align: "center",
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            fontSize: "0.75rem",
            color: "success.main",
          }}
        >
          {p.value}
        </Typography>
      ),
    },
    {
      field: "harorat",
      headerName: "HARORAT",
      width: 110,
      headerAlign: "center",
      align: "center",
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: "'Arial',san-serif",
            fontSize: "0.75rem",
            color: getTempColor(p.value),
          }}
        >
          {p.value}°C
        </Typography>
      ),
    },
    {
      field: "samaradorlik",
      headerName: "SAMARADORLIK",
      width: 160,
      headerAlign: "center",
      align: "center",
      renderCell: (p) => (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: "100%",
            justifyContent: "center",
          }}
        >
          <LinearProgress
            variant="determinate"
            value={p.value}
            sx={{
              flex: 1,
              height: 6,
              borderRadius: 5,
              "& .MuiLinearProgress-bar": {
                backgroundColor:
                  p.value >= 90
                    ? "#00e676"
                    : p.value >= 70
                      ? "#ffd60a"
                      : "#ff2d55",
              },
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.65rem",
              minWidth: 34,
              textAlign: "right",
            }}
          >
            {p.value}%
          </Typography>
        </Box>
      ),
    },
  ];

  const stats = {
    jami: uchastkalar.length,
    faol: uchastkalar.filter((u) => u.holat === "faol").length,
    ogoh: uchastkalar.filter((u) => u.holat === "ogohlantirish").length,
    xato: uchastkalar.filter((u) => u.holat === "xato").length,
  };

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
              fontFamily: "'Arial',san-serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
              color: "text.primary",
            }}
          >
            {t("HUDUDLAR")}
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.65rem",
              color: "text.secondary",
            }}
          >
            {t("Barcha hududlar holati · Kartani bosib uskunalarga o'ting")}
          </Typography>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
          {isLiveMode && (
            <Typography
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.58rem",
                color: uchFetching ? "#00d4ff" : "#00e676",
              }}
            >
              {uchFetching ? t("LIVE yangilanmoqda...") : t("LIVE")}
            </Typography>
          )}

          <FormControl size="small" sx={{ minWidth: 180 }}>
            <InputLabel>{t("BO'LINMALAR BO'YICHA FILTR")}</InputLabel>
            <Select
              value={sexFilter}
              onChange={(e) => setSexFilter(e.target.value)}
              label={t("BO'LINMALAR BO'YICHA FILTR")}
            >
              <MenuItem value="">{t("Barchasi")}</MenuItem>
              {sx.map((s) => (
                <MenuItem key={s.id} value={s.id}>
                  {t(s.nom)}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* STATS */}
      <Grid container spacing={1.5}>
        {[
          { l: "JAMI", v: stats.jami, c: "primary.main" },
          { l: "FAOL", v: stats.faol, c: "success.main" },
          { l: "OGOHLANTIRISH", v: stats.ogoh, c: "warning.main" },
          { l: "XATO", v: stats.xato, c: "error.main" },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.l}>
            <Paper sx={{ p: 2, textAlign: "center" }}>
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: s.c,
                }}
              >
                {t(s.v)}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.58rem",
                  color: "text.secondary",
                  letterSpacing: "0.1em",
                }}
              >
                {t(s.l)}
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
              "& .MuiTabs-indicator": { background: "primary.main" },
            }}
          >
            <Tab
              label={t("Karta ko'rinish")}
              sx={{ fontSize: "0.65rem", minHeight: 42 }}
            />
            <Tab
              label={t("Jadval ko'rinish")}
              sx={{ fontSize: "0.65rem", minHeight: 42 }}
            />
          </Tabs>

          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.62rem",
              color: "text.secondary",
            }}
          >
            {uchastkalar.length} {t("ta hudud")}
          </Typography>
        </Box>

        {view === 0 && (
          <Box sx={{ p: 2 }}>
            {isLoading ? (
              <CardSkeleton rows={6} />
            ) : sexFilter ? (
              <Grid container spacing={1.5}>
                {uchastkalar.map((u) => (
                  <Grid item xs={12} sm={6} md={4} key={u.id}>
                    <UchastkCard u={u} onClick={handleOpen} />
                  </Grid>
                ))}
              </Grid>
            ) : (
              Object.entries(groupedBySex).map(([sexId, { sex, items }]) => (
                <Box key={sexId} sx={{ mb: 3 }}>
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      gap: 1.5,
                      mb: 1.5,
                    }}
                  >
                    {/* <Typography
                      sx={{
                        fontFamily: "'Arial',san-serif",
                        fontSize: "0.65rem",
                        color: "text.secondary",
                        letterSpacing: "0.12em",
                      }}
                    >
                      {sexId}
                    </Typography> */}

                    <Typography
                      sx={{
                        fontWeight: 700,
                        fontSize: "1rem",
                        color: "text.primary",
                      }}
                    >
                      {t(sex.nom)}
                    </Typography>

                    {/* {sex.live && (
                      <Typography
                        sx={{
                          fontFamily: "'Arial',san-serif",
                          fontSize: "0.55rem",
                          color: "#00e676",
                        }}
                      >
                        LIVE
                      </Typography>
                    )} */}

                    <Box
                      sx={{
                        flex: 1,
                        height: 1,
                        background: "divider",
                        bgcolor: "divider",
                      }}
                    />

                    <Typography
                      sx={{
                        fontFamily: "'Arial',san-serif",
                        fontSize: "0.6rem",
                        color: "text.secondary",
                      }}
                    >
                      {items.length} {t("ta")}
                    </Typography>
                  </Box>

                  <Grid container spacing={1.5}>
                    {items.map((u) => (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={u.id}>
                        <UchastkCard u={u} onClick={handleOpen} />
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              ))
            )}
          </Box>
        )}

        {view === 1 && (
          <Box sx={{ height: 520 }}>
            {isLoading ? (
              <CardSkeleton rows={10} />
            ) : (
              <DataGrid
                rows={uchastkalar}
                columns={columns}
                pageSize={12}
                rowsPerPageOptions={[12, 24]}
                disableSelectionOnClick
                onRowClick={(p) => handleOpen(p.row)}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: "#0b1220",
                    borderBottom: "1px solid rgba(255,255,255,0.1)",
                    color: isDark ? "#fff" : "#000",
                  },
                  "& .MuiDataGrid-columnHeader": {
                    fontSize: "0.7rem",
                    letterSpacing: "1px",
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: "1px solid rgba(255,255,255,0.05)",
                    display: "flex",
                    alignItems: "center",
                  },
                  "& .MuiDataGrid-row": {
                    "&:hover": {
                      backgroundColor: "rgba(0,255,200,0.04)",
                    },
                  },
                  "& .MuiDataGrid-cellContent": {
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  },
                }}
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
            background: isDark ? "#0a0e1a" : "#f8fafc",
            border: "none",
            borderLeft: "1px solid",
            borderColor: "divider",
          },
        }}
      >
        <UchastkadDetail u={selected} onClose={() => setDrawerOpen(false)} />
      </Drawer>
    </Box>
  );
}

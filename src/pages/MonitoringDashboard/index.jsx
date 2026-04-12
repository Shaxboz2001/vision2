import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
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
  IconButton,
  Chip,
  CircularProgress,
  Collapse,
  Avatar,
  Stack,
  alpha,
  useTheme,
} from "@mui/material";

import ExpandMoreRoundedIcon from "@mui/icons-material/ExpandMoreRounded";
import ExpandLessRoundedIcon from "@mui/icons-material/ExpandLessRounded";
import BuildRoundedIcon from "@mui/icons-material/BuildRounded";
import PrecisionManufacturingRoundedIcon from "@mui/icons-material/PrecisionManufacturingRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

import {
  getSexlarHybrid,
  getUchastkalarHybrid,
  getUskunalarHybrid,
} from "@/api/hybrid";

import { StatusChip, SectionHeader, CardSkeleton } from "@/components/common";
import {
  setSelectedUchastka,
  setUskunaFilter,
  setUskunaSelected,
} from "@/store";

/* =========================================================
   TOKENS
========================================================= */

const useTokens = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return {
    isDark,

    pageBg: isDark ? "#0a111d" : "#f4f7fb",

    paper: isDark ? "#111b2f" : "#ffffff",
    paperSoft: isDark ? "#162338" : "#f8fbff",
    paperSoft2: isDark ? "#1a2941" : "#eef4fb",
    paperHover: isDark ? "#1b2b45" : "#f6faff",

    border: isDark ? "rgba(148,163,184,0.16)" : "rgba(15,23,42,0.08)",
    borderStrong: isDark ? "rgba(148,163,184,0.26)" : "rgba(15,23,42,0.14)",

    text: isDark ? "#e8eef9" : "#162033",
    textSoft: isDark ? "#a7b4c8" : "#42526b",
    textMuted: isDark ? "#7d8aa0" : "#6b7a90",

    accent: isDark ? "#38bdf8" : "#155eef",
    accentSoft: isDark ? "rgba(56,189,248,0.12)" : "rgba(21,94,239,0.10)",

    green: isDark ? "#00ff9d" : "#0f9f6e",
    yellow: isDark ? "#f5b301" : "#d4a017",
    red: isDark ? "#ef4444" : "#dc2626",
    orange: isDark ? "#f97316" : "#ea580c",
    cyan: isDark ? "#06b6d4" : "#0891b2",
    purple: isDark ? "#8b5cf6" : "#7c3aed",

    mono: "'Arial', sans-serif",
    display: "'Arial', sans-serif",

    shadow: isDark
      ? "0 20px 50px rgba(0,0,0,0.34)"
      : "0 18px 42px rgba(15,23,42,0.10)",

    softShadow: isDark
      ? "0 12px 28px rgba(0,0,0,0.22)"
      : "0 10px 24px rgba(15,23,42,0.07)",
  };
};

/* =========================================================
   HELPERS
========================================================= */

const avg = (arr = []) => {
  const nums = arr.map(Number).filter((n) => Number.isFinite(n));
  return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
};

const sum = (arr = []) => arr.reduce((a, b) => a + Number(b || 0), 0);

const fmtN = (n, d = 0) =>
  Number(n || 0).toLocaleString("ru-RU", {
    minimumFractionDigits: d,
    maximumFractionDigits: d,
  });

const getStatusColor = (holat, t) => {
  if (holat === "faol") return t.green;
  if (holat === "ogohlantirish") return t.yellow;
  if (holat === "xato") return t.red;
  return t.textMuted;
};

const getEffColor = (v, t) => {
  if (Number(v) >= 90) return t.green;
  if (Number(v) >= 70) return t.yellow;
  return t.red;
};

const getUskunaType = (u) =>
  u?.tur || u?.type || u?.category || u?.modelType || "Uskuna";

const getStatusIcon = (holat) => {
  if (holat === "xato") return <InfoOutlinedIcon sx={{ fontSize: 24 }} />;
  if (holat === "ogohlantirish") {
    return <BuildRoundedIcon sx={{ fontSize: 24 }} />;
  }
  return <PrecisionManufacturingRoundedIcon sx={{ fontSize: 24 }} />;
};

/* =========================================================
   IMAGE MAP
========================================================= */

const ID_IMAGES = {
  "USK-001": "/images/uskunalar/klet.png",
  "USK-002": "/images/uskunalar/vakuum.png",
  "USK-003": "/images/uskunalar/rolikli pech.png",
  "USK-018": "/images/uskunalar/Vakuumator.png",
  "USK-053": "/images/uskunalar/klet vertikal.png",
  "USK-051": "/images/uskunalar/klet vertikal.png",
  "USK-049": "/images/uskunalar/klet vertikal.png",
  "USK-047": "/images/uskunalar/pech klet gorizontalniy.png",
  "USK-048": "/images/uskunalar/pech klet gorizontalniy.png",
  "USK-050": "/images/uskunalar/pech klet gorizontalniy.png",
  "USK-052": "/images/uskunalar/pech klet gorizontalniy.png",
  "USK-046": "/images/uskunalar/pech pshb.png",
  "USK-005": "/images/uskunalar/pech pshb.png",
  "USK-054": "/images/uskunalar/pech pshb.png",
  "USK-004": "/images/uskunalar/klet gorizontalniy.png",
  "USK-067": "/images/uskunalar/klet gorizontalniy.png",
  "USK-055": "/images/uskunalar/klet gorizontalniy.png",
  "USK-056": "/images/uskunalar/klet gorizontalniy.png",
  "USK-057": "/images/uskunalar/klet gorizontalniy.png",
  "USK-058": "/images/uskunalar/klet gorizontalniy.png",
  "USK-059": "/images/uskunalar/klet gorizontalniy.png",
  "USK-060": "/images/uskunalar/klet gorizontalniy.png",
  "USK-061": "/images/uskunalar/klet gorizontalniy.png",
  "USK-062": "/images/uskunalar/klet gorizontalniy.png",
  "USK-063": "/images/uskunalar/klet gorizontalniy.png",
  "USK-064": "/images/uskunalar/klet gorizontalniy.png",
  "USK-065": "/images/uskunalar/klet gorizontalniy.png",
  "USK-066": "/images/uskunalar/klet gorizontalniy.png",
  "USK-068": "/images/uskunalar/yakuni guruh klet.png",
  "USK-069": "/images/uskunalar/yakuni guruh klet.png",
  "USK-070": "/images/uskunalar/yakuni guruh klet.png",
  "USK-071": "/images/uskunalar/yakuni guruh klet.png",
  "USK-072": "/images/uskunalar/yakuni guruh klet.png",
  "USK-073": "/images/uskunalar/yakuni guruh klet.png",
  "USK-074": "/images/uskunalar/yakuni guruh klet.png",
  "USK-075": "/images/uskunalar/yakuni guruh klet.png",
  "USK-076": "/images/uskunalar/yakuni guruh klet.png",
  "USK-077": "/images/uskunalar/yakuni guruh klet.png",
  "USK-078": "/images/uskunalar/yakuni guruh klet.png",
  "USK-079": "/images/uskunalar/yakuni guruh klet.png",
  "USK-017": "/images/uskunalar/pech elpk.png",
  "USK-024": "/images/uskunalar/Gorizontal kovsh.png",
  "USK-025": "/images/uskunalar/Vertikal kovsh.png",
  "USK-020": "/images/uskunalar/Vertikal kovsh.png",
  "USK-021": "/images/uskunalar/Vakuumator.png",
  "USK-019": "/images/uskunalar/Gorizontal kovsh.png",
  "USK-022": "/images/uskunalar/Dozator.png",
  "USK-029": "/images/uskunalar/rolikli pech.png",
  "USK-028": "/images/uskunalar/matalka.png",
  "USK-023": "/images/uskunalar/Adyustaj.png",
};

const DEFAULT_USKUNA_IMAGE = "/images/uskunalar/lpk pech.png";

function getUskunaImage(u) {
  const id = u?.id?.trim();
  if (id && ID_IMAGES[id]) return ID_IMAGES[id];
  return DEFAULT_USKUNA_IMAGE;
}

const getImageBg = (u, t) => {
  const tur = getUskunaType(u);

  if (tur === "Pech") return alpha(t.orange, 0.12);
  if (tur === "Konverter") return alpha(t.cyan, 0.12);
  if (tur === "Elektr Pech") return alpha(t.purple, 0.12);
  if (tur === "Prokat") return alpha(t.green, 0.12);
  if (tur === "Nasos") return alpha(t.accent, 0.12);
  if (tur === "Kran") return alpha(t.yellow, 0.14);

  return alpha(t.accent, 0.08);
};

/* =========================================================
   SMALL COMPONENTS
========================================================= */

function SafeImage({ src, alt, sx }) {
  const [imgSrc, setImgSrc] = useState(src || DEFAULT_USKUNA_IMAGE);

  useEffect(() => {
    setImgSrc(src || DEFAULT_USKUNA_IMAGE);
  }, [src]);

  return (
    <Box
      component="img"
      src={imgSrc}
      alt={alt}
      onError={() => setImgSrc(DEFAULT_USKUNA_IMAGE)}
      sx={sx}
    />
  );
}

function StatusAvatar({ statusColor, tokens, icon }) {
  return (
    <Avatar
      sx={{
        width: 54,
        height: 54,
        flexShrink: 0,
        position: "relative",
        bgcolor: tokens.isDark
          ? alpha(statusColor, 0.16)
          : alpha(statusColor, 0.12),
        color: tokens.isDark ? statusColor : alpha(statusColor, 0.98),
        border: `1px solid ${alpha(statusColor, tokens.isDark ? 0.28 : 0.32)}`,
        boxShadow: tokens.isDark
          ? `0 8px 20px ${alpha(statusColor, 0.16)}`
          : `0 8px 18px ${alpha(statusColor, 0.12)}`,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 3,
          borderRadius: "50%",
          background: tokens.isDark
            ? "linear-gradient(180deg, rgba(255,255,255,0.05), rgba(255,255,255,0.00))"
            : "linear-gradient(180deg, rgba(255,255,255,0.95), rgba(255,255,255,0.28))",
          pointerEvents: "none",
        },
      }}
    >
      <Box
        sx={{
          position: "relative",
          zIndex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: tokens.isDark ? statusColor : alpha(statusColor, 0.98),
          "& svg": {
            fontSize: 24,
            filter: tokens.isDark
              ? "drop-shadow(0 1px 3px rgba(0,0,0,0.35))"
              : "drop-shadow(0 1px 1px rgba(255,255,255,0.55))",
          },
        }}
      >
        {icon}
      </Box>
    </Avatar>
  );
}

function StatCard({ label, value, color, tokens }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.65,
        borderRadius: 3,
        bgcolor: tokens.paperSoft2,
        border: `1px solid ${tokens.border}`,
        boxShadow: tokens.softShadow,
        height: "100%",
      }}
    >
      <Typography
        sx={{
          fontFamily: tokens.mono,
          fontSize: "0.64rem",
          color: tokens.textSoft,
          letterSpacing: "0.1em",
          mb: 0.65,
          fontWeight: 700,
        }}
      >
        {label}
      </Typography>

      <Typography
        sx={{
          fontFamily: tokens.display,
          fontSize: "1.12rem",
          fontWeight: 800,
          color: color || tokens.text,
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>
    </Paper>
  );
}

function UskunaCard({ u, tokens, onClick }) {
  const statusColor = getStatusColor(u.holat, tokens);
  const effColor = getEffColor(u.samaradorlik, tokens);

  return (
    <Paper
      elevation={0}
      onClick={() => onClick(u)}
      sx={{
        p: 1.65,
        borderRadius: 3.5,
        bgcolor: tokens.paper,
        border: `1px solid ${tokens.border}`,
        transition: "all .22s ease",
        cursor: "pointer",
        height: "100%",
        overflow: "hidden",
        position: "relative",
        boxShadow: tokens.softShadow,
        "&:hover": {
          transform: "translateY(-6px)",
          borderColor: alpha(statusColor, 0.32),
          boxShadow: tokens.shadow,
          bgcolor: tokens.isDark ? tokens.paper : "#fcfdff",
        },
      }}
    >
      <Box
        sx={{
          position: "absolute",
          top: 12,
          right: 12,
          width: 10,
          height: 10,
          borderRadius: "50%",
          bgcolor: statusColor,
          boxShadow: `0 0 14px ${alpha(statusColor, 0.55)}`,
        }}
      />

      <Box
        sx={{
          height: 150,
          mb: 1.35,
          borderRadius: 3,
          bgcolor: tokens.isDark ? getImageBg(u, tokens) : "#f8fbff",
          border: `1px solid ${
            tokens.isDark ? alpha(statusColor, 0.14) : alpha(tokens.accent, 0.1)
          }`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          overflow: "hidden",
          boxShadow: tokens.isDark
            ? "none"
            : "inset 0 1px 0 rgba(255,255,255,0.72)",
        }}
      >
        <SafeImage
          src={getUskunaImage(u)}
          alt={u.nom}
          sx={{
            width: "82%",
            height: "82%",
            objectFit: "contain",
            display: "block",
            filter: tokens.isDark
              ? "drop-shadow(0 10px 18px rgba(0,0,0,0.22))"
              : "drop-shadow(0 8px 14px rgba(15,23,42,0.08))",
          }}
        />
      </Box>

      <Typography
        sx={{
          fontSize: "0.97rem",
          fontWeight: 800,
          color: tokens.text,
          lineHeight: 1.24,
          mb: 0.38,
          pr: 2,
        }}
      >
        {u.nom}
      </Typography>

      <Stack spacing={0.9}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1 }}>
          <Typography
            sx={{
              fontSize: "0.75rem",
              color: tokens.textSoft,
              fontWeight: 500,
            }}
          >
            Samaradorlik
          </Typography>
          <Typography
            sx={{
              fontFamily: tokens.mono,
              fontSize: "0.79rem",
              fontWeight: 800,
              color: effColor,
            }}
          >
            {u.samaradorlik ? `${u.samaradorlik}%` : "—"}
          </Typography>
        </Box>

        <LinearProgress
          variant="determinate"
          value={Math.min(100, Number(u.samaradorlik || 0))}
          sx={{
            height: 7,
            borderRadius: 999,
            bgcolor: alpha(tokens.textMuted, 0.15),
            "& .MuiLinearProgress-bar": {
              borderRadius: 999,
              background: effColor,
            },
          }}
        />
      </Stack>

      <Box
        sx={{
          mt: 1.2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Typography
          sx={{
            color: tokens.accent,
            fontSize: "0.76rem",
            fontWeight: 700,
          }}
        >
          Batafsil
        </Typography>
        <ChevronRightRoundedIcon sx={{ fontSize: 18, color: tokens.accent }} />
      </Box>
    </Paper>
  );
}

function UchastkaCard({ u, tokens, open, onToggle, children }) {
  const statusColor = getStatusColor(u.holat, tokens);
  const effColor = getEffColor(u.samaradorlik, tokens);

  return (
    <Box>
      <Paper
        elevation={0}
        onClick={onToggle}
        sx={{
          p: 1.8,
          borderRadius: 3.2,
          bgcolor: tokens.paper,
          border: `1px solid ${open ? alpha(tokens.accent, 0.3) : tokens.border}`,
          transition: "all .2s ease",
          cursor: "pointer",
          boxShadow: tokens.softShadow,
          "&:hover": {
            borderColor: alpha(statusColor, 0.3),
            bgcolor: tokens.paperHover,
          },
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.35 }}>
          <StatusAvatar
            statusColor={statusColor}
            tokens={tokens}
            icon={getStatusIcon(u.holat)}
          />

          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                flexWrap: "wrap",
              }}
            >
              <Typography
                sx={{
                  fontSize: "1.04rem",
                  fontWeight: 800,
                  color: tokens.text,
                  lineHeight: 1.2,
                }}
              >
                {u.nom}
              </Typography>
              <StatusChip holat={u.holat} />
            </Box>
          </Box>

          <Stack
            direction="row"
            spacing={1}
            sx={{ display: { xs: "none", md: "flex" }, mr: 0.45 }}
          >
            <Chip
              size="small"
              icon={<SpeedRoundedIcon sx={{ fontSize: "15px !important" }} />}
              label={`${u.samaradorlik || 0}%`}
              sx={{
                color: effColor,
                bgcolor: alpha(effColor, 0.1),
                border: `1px solid ${alpha(effColor, 0.18)}`,
                fontWeight: 700,
              }}
            />
            <Chip
              size="small"
              icon={<BuildRoundedIcon sx={{ fontSize: "15px !important" }} />}
              label={`${u.uskunalar || 0} uskuna`}
              sx={{
                color: tokens.accent,
                bgcolor: alpha(tokens.accent, 0.08),
                border: `1px solid ${alpha(tokens.accent, 0.18)}`,
                fontWeight: 700,
              }}
            />
          </Stack>

          <IconButton
            size="small"
            sx={{
              color: open ? tokens.accent : tokens.textSoft,
              bgcolor: open ? alpha(tokens.accent, 0.08) : "transparent",
              border: `1px solid ${
                open ? alpha(tokens.accent, 0.18) : tokens.border
              }`,
            }}
          >
            {open ? <ExpandLessRoundedIcon /> : <ExpandMoreRoundedIcon />}
          </IconButton>
        </Box>
      </Paper>

      <Collapse in={open} timeout={280}>
        <Box sx={{ mt: 1.2 }}>{children}</Box>
      </Collapse>
    </Box>
  );
}

function UskunalarSection({ uchastka, tokens, onUskunaClick }) {
  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["monitoring-uskunalar", uchastka.sexId, uchastka.id, today],
    queryFn: () =>
      getUskunalarHybrid(
        { sexId: uchastka.sexId, uchastkId: uchastka.id },
        { startDate: today, endDate: today },
      ),
    refetchInterval: uchastka.sexId === "SEX-07" ? 60_000 : false,
    refetchOnWindowFocus: true,
  });

  const uskunalar = data?.data || [];
  const avgEff = avg(uskunalar.map((x) => Number(x.samaradorlik || 0)));
  const activeCount = uskunalar.filter((x) => x.holat === "faol").length;

  return (
    <Paper
      elevation={0}
      sx={{
        p: { xs: 1.3, md: 1.75 },
        borderRadius: 3.2,
        bgcolor: tokens.paperSoft,
        border: `1px solid ${tokens.border}`,
        boxShadow: tokens.softShadow,
      }}
    >
      <Grid container spacing={1.5} sx={{ mb: 1.7 }}>
        <Grid item xs={6} md={3}>
          <StatCard
            label="USKUNALAR"
            value={`${uskunalar.length} ta`}
            color={tokens.accent}
            tokens={tokens}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="FAOL"
            value={`${activeCount} ta`}
            color={tokens.green}
            tokens={tokens}
          />
        </Grid>
        <Grid item xs={6} md={3}>
          <StatCard
            label="O'RTA SAMARADORLIK"
            value={`${fmtN(avgEff, 0)}%`}
            color={getEffColor(avgEff, tokens)}
            tokens={tokens}
          />
        </Grid>
      </Grid>

      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          mb: 1.5,
        }}
      >
        <BuildRoundedIcon sx={{ fontSize: 17, color: tokens.accent }} />
        <Typography
          sx={{
            fontFamily: tokens.mono,
            fontSize: "0.69rem",
            color: tokens.textSoft,
            letterSpacing: "0.08em",
            fontWeight: 700,
          }}
        >
          USKUNALAR RO‘YXATI
        </Typography>
        <Box sx={{ flex: 1, height: 1, bgcolor: tokens.border }} />
        {(isLoading || isFetching) && <CircularProgress size={16} />}
      </Box>

      {isLoading ? (
        <Grid container spacing={1.5}>
          {Array.from({ length: 4 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <CardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : uskunalar.length === 0 ? (
        <Paper
          elevation={0}
          sx={{
            p: 3.2,
            textAlign: "center",
            borderRadius: 2.8,
            bgcolor: alpha(tokens.textMuted, 0.06),
            border: `1px dashed ${tokens.borderStrong}`,
          }}
        >
          <Typography
            sx={{
              color: tokens.textSoft,
              fontSize: "0.94rem",
              fontWeight: 600,
            }}
          >
            Bu uchastkada uskunalar topilmadi
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={1.5}>
          {uskunalar.map((u) => (
            <Grid item xs={12} sm={6} md={4} xl={3} key={u.id}>
              <UskunaCard u={u} tokens={tokens} onClick={onUskunaClick} />
            </Grid>
          ))}
        </Grid>
      )}
    </Paper>
  );
}

function FilterBar({ sexlar, sexFilter, setSexFilter, pageStats, tokens }) {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 1.7,
        borderRadius: 3.2,
        bgcolor: tokens.paper,
        border: `1px solid ${tokens.border}`,
        boxShadow: tokens.softShadow,
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          justifyContent: "space-between",
          flexWrap: "wrap",
        }}
      >
        <FormControl size="small" sx={{ minWidth: 250 }}>
          <InputLabel id="sex-filter-label">
            Bo'linma bo‘yicha filter
          </InputLabel>
          <Select
            labelId="sex-filter-label"
            value={sexFilter}
            label="Bo'linma bo‘yicha filter"
            onChange={(e) => setSexFilter(e.target.value)}
            sx={{
              borderRadius: 2.3,
              bgcolor: tokens.isDark ? tokens.paper : "#fcfdff",
            }}
          >
            <MenuItem value="">Barcha sexlar</MenuItem>
            {sexlar.map((s) => (
              <MenuItem key={s.id} value={s.id}>
                {s.nom}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          <Chip
            label={`Hududlar: ${pageStats.totalUch}`}
            sx={{
              fontWeight: 700,
              color: tokens.text,
              bgcolor: tokens.isDark ? alpha(tokens.textMuted, 0.1) : "#f3f7fd",
              border: `1px solid ${tokens.border}`,
            }}
          />
          <Chip
            label={`Faol: ${pageStats.activeUch}`}
            sx={{
              fontWeight: 700,
              color: tokens.green,
              bgcolor: alpha(tokens.green, 0.1),
              border: `1px solid ${alpha(tokens.green, 0.18)}`,
            }}
          />
          <Chip
            label={`Uskunalar: ${pageStats.totalEquip}`}
            sx={{
              fontWeight: 700,
              color: tokens.text,
              bgcolor: tokens.isDark ? alpha(tokens.textMuted, 0.1) : "#f3f7fd",
              border: `1px solid ${tokens.border}`,
            }}
          />
          <Chip
            label={`O'rtacha samaradorlik: ${fmtN(pageStats.avgEff, 0)}%`}
            sx={{
              fontWeight: 700,
              color: tokens.accent,
              bgcolor: alpha(tokens.accent, 0.08),
              border: `1px solid ${alpha(tokens.accent, 0.16)}`,
            }}
          />
        </Stack>
      </Box>
    </Paper>
  );
}

/* =========================================================
   MAIN PAGE
========================================================= */

export default function MonitoringPage() {
  const tokens = useTokens();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const selectedSex = useSelector((state) => state.ui.selectedSex);

  const [sexFilter, setSexFilter] = useState(selectedSex?.id || "");
  const [expandedUchastka, setExpandedUchastka] = useState(null);

  const today = useMemo(() => new Date().toISOString().split("T")[0], []);

  const { data: sexlarRes, isLoading: sexlarLoading } = useQuery({
    queryKey: ["monitoring-sexlar", today],
    queryFn: () => getSexlarHybrid({ startDate: today, endDate: today }),
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const { data: uchRes, isLoading: uchLoading } = useQuery({
    queryKey: ["monitoring-uchastkalar", sexFilter || "all", today],
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

      return { data: results.flatMap((r) => r?.data || []) };
    },
    enabled: !!sexlarRes,
    refetchInterval: 60_000,
    refetchOnWindowFocus: true,
  });

  const sexlar = sexlarRes?.data || [];
  const uchastkalar = uchRes?.data || [];
  const isLoading = sexlarLoading || uchLoading;

  const groupedBySex = useMemo(() => {
    const map = {};

    sexlar.forEach((s) => {
      map[s.id] = { sex: s, items: [] };
    });

    uchastkalar.forEach((u) => {
      if (!map[u.sexId]) {
        map[u.sexId] = {
          sex: { id: u.sexId, nom: u.sexId, holat: u.holat },
          items: [],
        };
      }
      map[u.sexId].items.push(u);
    });

    if (sexFilter) {
      return map[sexFilter] ? { [sexFilter]: map[sexFilter] } : {};
    }

    return map;
  }, [sexlar, uchastkalar, sexFilter]);

  const pageStats = useMemo(() => {
    const totalUch = uchastkalar.length;
    const activeUch = uchastkalar.filter((u) => u.holat === "faol").length;
    const avgEff = avg(uchastkalar.map((u) => Number(u.samaradorlik || 0)));
    const totalEquip = sum(uchastkalar.map((u) => Number(u.uskunalar || 0)));

    return {
      totalUch,
      activeUch,
      avgEff,
      totalEquip,
    };
  }, [uchastkalar]);

  useEffect(() => {
    if (uchastkalar.length > 0) {
      setExpandedUchastka((prev) => {
        if (prev === null) return uchastkalar[0].id;
        const exists = uchastkalar.some((u) => u.id === prev);
        return exists ? prev : uchastkalar[0].id;
      });
    } else {
      setExpandedUchastka(null);
    }
  }, [uchastkalar]);

  const handleUskunaClick = (u) => {
    dispatch(setUskunaSelected(u.id));
    dispatch(
      setUskunaFilter({
        sexId: u.sexId,
        uchastkId: u.uchastkId,
      }),
    );
    navigate(`/uskunalar/${u.id}`, { state: { uskuna: u } });
  };

  const handleToggleUchastka = (u) => {
    dispatch(setSelectedUchastka(u.id));
    setExpandedUchastka((prev) => (prev === u.id ? null : u.id));
  };

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2.5 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
        minHeight: "100vh",
        bgcolor: tokens.pageBg,
      }}
    >
      <FilterBar
        sexlar={sexlar}
        sexFilter={sexFilter}
        setSexFilter={(value) => {
          setSexFilter(value);
          setExpandedUchastka(null);
        }}
        pageStats={pageStats}
        tokens={tokens}
      />

      {isLoading ? (
        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_, i) => (
            <Grid item xs={12} key={i}>
              <CardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : (
        Object.entries(groupedBySex)
          .filter(([, value]) => value.items.length > 0)
          .map(([sexId, { sex, items }]) => (
            <Box key={sexId}>
              <SectionHeader
                title={sex?.nom || sexId}
                action={`${items.length} ta uchastka`}
              >
                <Chip
                  size="small"
                  label="Bo'lim"
                  sx={{
                    fontFamily: tokens.mono,
                    fontSize: "0.54rem",
                    height: 21,
                    color: tokens.accent,
                    bgcolor: alpha(tokens.accent, 0.08),
                    border: `1px solid ${alpha(tokens.accent, 0.18)}`,
                  }}
                />
              </SectionHeader>

              <Box sx={{ display: "flex", flexDirection: "column", gap: 1.3 }}>
                {items.map((u) => (
                  <UchastkaCard
                    key={u.id}
                    u={u}
                    tokens={tokens}
                    open={expandedUchastka === u.id}
                    onToggle={() => handleToggleUchastka(u)}
                  >
                    <UskunalarSection
                      uchastka={u}
                      tokens={tokens}
                      onUskunaClick={handleUskunaClick}
                    />
                  </UchastkaCard>
                ))}
              </Box>
            </Box>
          ))
      )}
    </Box>
  );
}

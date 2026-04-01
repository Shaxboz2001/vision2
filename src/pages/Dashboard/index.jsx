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
  if (v === "kritik") return "#ff2d55";
  if (v === "ogohlantirish") return "#ffd60a";
  return "#00d4ff";
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
    if ((heat?.powerOnTime || 0) > 80 || lastTemp > 1700)
      return "ogohlantirish";
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
   TOOLTIP
═══════════════════════════════════════════════════════════════ */

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;

  return (
    <Box
      sx={{
        background: "#0d1220",
        border: "1px solid #1e2a3d",
        p: 1.5,
        borderRadius: 1.5,
        minWidth: 140,
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: "0.65rem",
          color: "#6b7280",
          mb: 0.6,
        }}
      >
        {label}
      </Typography>

      {payload.map((p) => (
        <Typography
          key={`${p.name}-${p.dataKey}`}
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.72rem",
            color: p.color,
            lineHeight: 1.6,
          }}
        >
          {p.name}: {fmtN(p.value, 1)}
        </Typography>
      ))}
    </Box>
  );
};

/* ═══════════════════════════════════════════════════════════════
   SMALL INFO CARD
═══════════════════════════════════════════════════════════════ */

function MiniInfoCard({ title, rows = [] }) {
  return (
    <Paper sx={{ p: 2, height: "100%" }}>
      <Typography sx={{ fontSize: "0.9rem", fontWeight: 700, mb: 1.2 }}>
        {title}
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 0.9 }}>
        {rows.map((r) => (
          <Box
            key={r.label}
            sx={{ display: "flex", justifyContent: "space-between", gap: 2 }}
          >
            <Typography sx={{ fontSize: "0.78rem", color: "#6b7280" }}>
              {r.label}
            </Typography>
            <Typography
              sx={{
                fontSize: "0.78rem",
                fontWeight: 700,
                fontFamily: "'Share Tech Mono',monospace",
                color: r.color || "inherit",
              }}
            >
              {r.value}
            </Typography>
          </Box>
        ))}
      </Box>
    </Paper>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DASHBOARD
═══════════════════════════════════════════════════════════════ */

export default function Dashboard() {
  const {
    eaf,
    lrf,
    vod,
    tsc,
    period,
    setPeriod,
    periodLabel,
    isAnyLoading,
    isAnyError,
  } = useAllProductionStats("today");

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
        label: "ISHLAB CHIQARISH",
        value: fmtN(totalProductionTon, 1),
        unit: "t",
        trend: `${periodLabel} bo'yicha`,
        trendUp: true,
        color: "#ff6b1a",
      },
      {
        label: "FAOL USKUNALAR",
        value: `${activeUnits}/${totalUnits}`,
        unit: "",
        trend: "EAF / LRF / VOD / TSC",
        trendUp: true,
        color: "#00d4ff",
      },
      {
        label: "O'RTA HARORAT",
        value: fmtN(avgTemp, 0),
        unit: "°C",
        trend: "Barcha jarayonlar bo'yicha",
        trendUp: false,
        color: "#ff2d55",
      },
      {
        label: "FAOL DATCHIKLAR",
        value: fmtN(totalTempPoints, 0),
        unit: "",
        trend: "Temperatura nuqtalari",
        trendUp: true,
        color: "#00ff9d",
      },
      {
        label: "ENERGIYA SARFI",
        value: fmtN(totalEnergy, 0),
        unit: "kWh",
        trend: "EAF + LRF",
        trendUp: false,
        color: "#ffd60a",
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
        nom: "EAF",
        holat: getStatusByProcess(latestEAF, "EAF"),
        uchastkalar: 1,
        faolUskunalar: latestEAF ? 1 : 0,
        uskunalar: 1,
        yuk: Math.min(100, Math.round(eafKwhTon)),
        harorat: Math.round(getLastTemp(latestEAF)),
        count: eafList.length,
        meta: latestEAF
          ? `#${latestEAF.heatId} • ${latestEAF.steelGradeName || "—"}`
          : "Ma'lumot yo'q",
      },
      {
        id: "LRF",
        emoji: "⚡",
        nom: "LRF",
        holat: getStatusByProcess(latestLRF, "LRF"),
        uchastkalar: 1,
        faolUskunalar: latestLRF ? 1 : 0,
        uskunalar: 1,
        yuk: Math.min(100, Math.round(lrfKwhTon)),
        harorat: Math.round(getLastTemp(latestLRF)),
        count: lrfList.length,
        meta: latestLRF
          ? `#${latestLRF.heatId} • ${latestLRF.steelGradeName || "—"}`
          : "Ma'lumot yo'q",
      },
      {
        id: "VOD",
        emoji: "🫧",
        nom: "VOD",
        holat: getStatusByProcess(latestVOD, "VOD"),
        uchastkalar: 1,
        faolUskunalar: latestVOD ? 1 : 0,
        uskunalar: 1,
        yuk: Math.min(100, Math.round(vodDuration)),
        harorat: Math.round(getLastTemp(latestVOD)),
        count: vodList.length,
        meta: latestVOD
          ? `#${latestVOD.heatId} • ${latestVOD.steelGradeName || "—"}`
          : "Ma'lumot yo'q",
      },
      {
        id: "TSC",
        emoji: "🏭",
        nom: "TSC",
        holat: getStatusByProcess(latestTSC, "TSC"),
        uchastkalar: 1,
        faolUskunalar: latestTSC ? 1 : 0,
        uskunalar: 1,
        yuk: Math.min(100, Math.round(tscAvgSpeed * 100)),
        harorat: Math.round(getLastTemp(latestTSC)),
        count: tscList.length,
        meta: latestTSC
          ? `#${latestTSC.heatId} • ${latestTSC.steelGradeName || "—"}`
          : "Ma'lumot yo'q",
      },
    ];
  }, [
    latestEAF,
    latestLRF,
    latestVOD,
    latestTSC,
    eafList,
    lrfList,
    vodList,
    tscList,
  ]);

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
        color: "#ff6b1a",
      },
      {
        nom: "LRF Qayta Ishlov",
        plan: 900,
        haqiqiy: kgToTon(sum(lrfList.map((x) => x.finalSteelWeight))),
        color: "#ffd60a",
      },
      {
        nom: "VOD Vakuum",
        plan: 700,
        haqiqiy: kgToTon(sum(vodList.map((x) => x.finalSteelWeight))),
        color: "#00d4ff",
      },
      {
        nom: "TSC Quyish",
        plan: 850,
        haqiqiy: kgToTon(sum(tscList.map((x) => x.finalSteelWeight))),
        color: "#00ff9d",
      },
    ];
  }, [eafList, lrfList, vodList, tscList]);

  if (isAnyError) {
    return (
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3 }}>
          <Typography sx={{ fontWeight: 700, fontSize: "1rem", mb: 1 }}>
            Dashboard ma'lumotlarini yuklashda xatolik
          </Typography>
          <Typography sx={{ color: "#6b7280", fontSize: "0.9rem" }}>
            API response formatini va hooklarni tekshirib chiqing.
          </Typography>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* FILTERS */}
      <Paper sx={{ p: 1.5 }}>
        <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
          {PERIOD_OPTIONS.map((opt) => (
            <Chip
              key={opt.value}
              label={opt.label}
              clickable
              onClick={() => setPeriod(opt.value)}
              color={period === opt.value ? "primary" : "default"}
              sx={{ borderRadius: 2, fontWeight: 600 }}
            />
          ))}
          <Chip
            label={`Tanlangan davr: ${PERIOD_LABELS[period] || period}`}
            sx={{ ml: "auto", fontWeight: 700 }}
          />
        </Stack>
      </Paper>

      {/* KPI */}
      <Grid container spacing={1.5}>
        {kpiItems.map((item) => (
          <Grid item xs={12} sm={6} md={2.4} key={item.label}>
            <KpiCard {...item} loading={isAnyLoading} />
          </Grid>
        ))}
      </Grid>

      {/* BO'LINMALAR + OGOHLANTIRISHLAR */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Paper>
            <SectionHeader title="Bo'linmalar Holati" action="BARCHASI →">
              <LiveBadge />
            </SectionHeader>

            {isAnyLoading ? (
              <CardSkeleton />
            ) : (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>BO'LINMA NOMI</TableCell>
                    <TableCell>HOLAT</TableCell>
                    <TableCell>UCHASTKA</TableCell>
                    <TableCell>USKUNALAR</TableCell>
                    <TableCell>YUK</TableCell>
                    <TableCell>HARORAT</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {processRows.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <Box
                          sx={{ display: "flex", alignItems: "center", gap: 1 }}
                        >
                          <span style={{ fontSize: 16 }}>{s.emoji}</span>
                          <Box>
                            <Typography
                              sx={{ fontWeight: 600, fontSize: "0.85rem" }}
                            >
                              {s.nom}
                            </Typography>
                            <Typography
                              sx={{
                                fontFamily: "'Share Tech Mono',monospace",
                                fontSize: "0.62rem",
                                color: "#6b7280",
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
                            fontFamily: "'Share Tech Mono',monospace",
                            fontSize: "0.7rem",
                            color: "#6b7280",
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
                            minWidth: 120,
                          }}
                        >
                          <LinearProgress
                            variant="determinate"
                            value={s.yuk}
                            sx={{
                              flex: 1,
                              height: 6,
                              borderRadius: 999,
                              backgroundColor: "rgba(255,255,255,0.06)",
                              "& .MuiLinearProgress-bar": {
                                borderRadius: 999,
                                background:
                                  s.yuk > 90
                                    ? "#ffd60a"
                                    : s.yuk > 0
                                      ? "#00d4ff"
                                      : "#374151",
                              },
                            }}
                          />
                          <Typography
                            sx={{
                              fontFamily: "'Share Tech Mono',monospace",
                              fontSize: "0.65rem",
                              color: s.yuk > 90 ? "#ffd60a" : "#6b7280",
                              minWidth: 34,
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
                              s.harorat > 1650
                                ? "#ff2d55"
                                : s.harorat > 1450
                                  ? "#ff6b1a"
                                  : "#6b7280",
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
          </Paper>
        </Grid>

        <Grid item xs={12} lg={4}>
          <Paper sx={{ height: "100%" }}>
            <SectionHeader
              title="Ogohlantirishlar"
              dot="#ff2d55"
              action="HAMMASI →"
            />
            <Box sx={{ p: 1.5 }}>
              {alerts.slice(0, 6).map((o) => (
                <Box
                  key={o.id}
                  sx={{
                    display: "flex",
                    gap: 1.5,
                    py: 1,
                    borderBottom: "1px solid rgba(30,42,61,0.5)",
                    "&:last-child": { borderBottom: "none" },
                  }}
                >
                  <Box
                    sx={{
                      width: 3,
                      borderRadius: 1,
                      flexShrink: 0,
                      alignSelf: "stretch",
                      minHeight: 32,
                      background: getSeverityColor(o.daraja),
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: "0.75rem", mb: 0.4 }}>
                      {o.xabar}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <DarajaChip daraja={o.daraja} />
                    </Box>
                  </Box>
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.58rem",
                      color: "#6b7280",
                      whiteSpace: "nowrap",
                      pt: 0.3,
                    }}
                  >
                    {Math.round((Date.now() - new Date(o.vaqt)) / 60000)}m
                  </Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* GRAFIKLAR */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={7}>
          <Paper>
            <SectionHeader title="Harorat Grafigi" dot="#ff6b1a">
              <Box sx={{ display: "flex", gap: 2 }}>
                {[
                  ["EAF", "#ff2d55"],
                  ["LRF", "#ff6b1a"],
                  ["VOD", "#00d4ff"],
                  ["TSC", "#00ff9d"],
                ].map(([n, c]) => (
                  <Box
                    key={n}
                    sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                  >
                    <Box
                      sx={{
                        width: 8,
                        height: 2,
                        background: c,
                        borderRadius: 1,
                      }}
                    />
                    <Typography
                      sx={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: "0.6rem",
                        color: "#6b7280",
                      }}
                    >
                      {n}
                    </Typography>
                  </Box>
                ))}
              </Box>
            </SectionHeader>

            <Box sx={{ p: 2, height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={tempChartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(30,42,61,0.8)"
                  />
                  <XAxis
                    dataKey="time"
                    tick={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: 9,
                      fill: "#6b7280",
                    }}
                  />
                  <YAxis
                    tick={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: 9,
                      fill: "#6b7280",
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    dataKey="eaf"
                    name="EAF"
                    stroke="#ff2d55"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="lrf"
                    name="LRF"
                    stroke="#ff6b1a"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="vod"
                    name="VOD"
                    stroke="#00d4ff"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="tsc"
                    name="TSC"
                    stroke="#00ff9d"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={5}>
          <Paper>
            <SectionHeader title="Ishlab Chiqarish Dinamikasi" dot="#00ff9d" />
            <Box sx={{ p: 2, height: 250 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={productionChartData}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="rgba(30,42,61,0.8)"
                  />
                  <XAxis
                    dataKey="kun"
                    tick={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: 9,
                      fill: "#6b7280",
                    }}
                  />
                  <YAxis
                    tick={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: 9,
                      fill: "#6b7280",
                    }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar
                    dataKey="eaf"
                    name="EAF"
                    fill="#ff6b1a"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="lrf"
                    name="LRF"
                    fill="#ffd60a"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="vod"
                    name="VOD"
                    fill="#00d4ff"
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="tsc"
                    name="TSC"
                    fill="#00ff9d"
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* PLAN */}
      <Paper>
        <SectionHeader title="Ishlab Chiqarish Plani" dot="#00d4ff" />
        <Box sx={{ p: 2, display: "flex", gap: 3, flexWrap: "wrap" }}>
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
                    mb: 0.5,
                  }}
                >
                  <Typography sx={{ fontSize: "0.8rem", fontWeight: 600 }}>
                    {item.nom}
                  </Typography>
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.7rem",
                      color: item.color,
                    }}
                  >
                    {fmtN(item.haqiqiy, 1)} / {fmtN(item.plan, 0)} t
                  </Typography>
                </Box>

                <LinearProgress
                  variant="determinate"
                  value={percent}
                  sx={{
                    height: 6,
                    borderRadius: 999,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 999,
                      background: item.color,
                    },
                  }}
                />

                <Typography
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.6rem",
                    color: "#6b7280",
                    mt: 0.4,
                  }}
                >
                  {Math.round(percent)}% bajarildi
                </Typography>
              </Box>
            );
          })}
        </Box>
      </Paper>

      {/* DETAIL CARDS */}
      <Grid container spacing={2}>
        <Grid item xs={12} md={3}>
          <MiniInfoCard
            title="EAF"
            rows={[
              { label: "Heatlar", value: fmtN(eafList.length, 0) },
              {
                label: "Jami energiya",
                value: `${fmtN(sum(eafList.map((x) => x.electricalEnergy)), 0)} kWh`,
                color: "#ffd60a",
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
            title="LRF"
            rows={[
              { label: "Heatlar", value: fmtN(lrfList.length, 0) },
              {
                label: "Jami energiya",
                value: `${fmtN(sum(lrfList.map((x) => x.electricalEnergy)), 0)} kWh`,
                color: "#ffd60a",
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
            title="VOD"
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
            title="TSC"
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

      {/* LATEST HEATS */}
      <Paper>
        <SectionHeader title="Oxirgi Jarayonlar" dot="#00d4ff" />
        <Box sx={{ p: 2 }}>
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
                <Paper sx={{ p: 2, height: "100%" }}>
                  <Typography sx={{ fontWeight: 700, mb: 1 }}>
                    {card.title}
                  </Typography>

                  {!card.heat ? (
                    <Typography sx={{ fontSize: "0.8rem", color: "#6b7280" }}>
                      Ma'lumot yo'q
                    </Typography>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.8,
                      }}
                    >
                      {card.rows.map(([label, value], idx) => (
                        <Box key={label}>
                          <Box
                            sx={{
                              display: "flex",
                              justifyContent: "space-between",
                              gap: 1,
                            }}
                          >
                            <Typography
                              sx={{ fontSize: "0.74rem", color: "#6b7280" }}
                            >
                              {label}
                            </Typography>
                            <Typography
                              sx={{
                                fontSize: "0.74rem",
                                fontFamily: "'Share Tech Mono',monospace",
                                fontWeight: 700,
                                textAlign: "right",
                              }}
                            >
                              {value}
                            </Typography>
                          </Box>
                          {idx < card.rows.length - 1 && (
                            <Divider sx={{ mt: 0.7, opacity: 0.4 }} />
                          )}
                        </Box>
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>
    </Box>
  );
}

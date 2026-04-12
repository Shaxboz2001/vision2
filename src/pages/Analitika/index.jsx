import { memo, useMemo, useState, useCallback } from "react";
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
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import SearchRoundedIcon from "@mui/icons-material/SearchRounded";
import RestartAltRoundedIcon from "@mui/icons-material/RestartAltRounded";
import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";
import PrecisionManufacturingRoundedIcon from "@mui/icons-material/PrecisionManufacturingRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import WarningAmberRoundedIcon from "@mui/icons-material/WarningAmberRounded";
import WaterfallChartRoundedIcon from "@mui/icons-material/WaterfallChartRounded";
import TimelineRoundedIcon from "@mui/icons-material/TimelineRounded";
import BoltRoundedIcon from "@mui/icons-material/BoltRounded";
import SpeedRoundedIcon from "@mui/icons-material/SpeedRounded";
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
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart,
  ReferenceLine,
} from "recharts";
import {
  getEAFHeatReport,
  getLRFHeatReport,
  getTSCHeatReport,
  getVODHeatReport,
} from "@/api/production";

/* ═══ THRESHOLDS ═══ */
const T = Object.freeze({
  EAF: {
    kwhPerTon: { warn: 470, crit: 520 },
    delay: { warn: 8, crit: 15 },
    ratio: { min: 2, max: 4 },
    duration: { crit: 95 },
    sw: {
      energy: 18,
      energyMild: 8,
      delay: 15,
      delayMild: 7,
      ratio: 8,
      duration: 10,
    },
  },
  LRF: {
    kwhPerTon: { warn: 40, crit: 55 },
    delay: { crit: 12 },
    temp: { min: 1500, warnFrom: 1520 },
    sw: { energy: 15, energyMild: 7, delay: 10, temp: 8 },
  },
  TSC: {
    castSpeed: { crit: 0.75, warn: 1.0, anomaly: 0.8 },
    superheat: { crit: 15, warn: 20 },
    delay: { crit: 10 },
    sw: { speed: 18, speedMild: 8, superheat: 12, delay: 8 },
  },
  VOD: {
    yieldLoss: { warn: 1.5, crit: 2.5, anomaly: 2 },
    vacuum: { warn: 3, crit: 5 },
    delay: { crit: 10 },
    sw: { yld: 16, yldMild: 8, vacuum: 12, vacuumMild: 6, delay: 8 },
  },
});
const CC = Object.freeze({
  EAF: "#f97316",
  LRF: "#facc15",
  TSC: "#22c55e",
  VOD: "#38bdf8",
});
const CC_SOFT = Object.freeze({
  EAF: "#f9731633",
  LRF: "#facc1533",
  TSC: "#22c55e33",
  VOD: "#38bdf833",
});
const STALE_MS = 60_000;
const DAMP = 0.35;
const DELAY_COLORS = [
  "#f97316",
  "#38bdf8",
  "#22c55e",
  "#facc15",
  "#a78bfa",
  "#f472b6",
  "#34d399",
  "#fb923c",
  "#818cf8",
  "#fbbf24",
];
const FP = [
  { label: "7 kun", value: 7 },
  { label: "14 kun", value: 14 },
  { label: "30 kun", value: 30 },
  { label: "90 kun", value: 90 },
];

/* ═══ HELPERS ═══ */
const safeArr = (v) => (Array.isArray(v) ? v : []);
const safeText = (v, fb = "-") => {
  if (v == null) return fb;
  const s = String(v).trim();
  return s || fb;
};
const safeShift = (v) => safeText(v, "Noma'lum smena");
const safeTeam = (v) => safeText(v, "Noma'lum brigada");
const safePerson = (v) => safeText(v, "Kiritilmagan");
const clamp = (v, lo, hi) => Math.max(lo, Math.min(hi, v));
const _fc = new Map();
const fmtN = (n, d = 0) => {
  if (!_fc.has(d))
    _fc.set(
      d,
      new Intl.NumberFormat("ru-RU", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      }),
    );
  return _fc.get(d).format(Number(n || 0));
};
const sum = (a, g = (x) => x) =>
  safeArr(a).reduce((s, b) => s + Number(g(b) || 0), 0);
const avg = (a, g = (x) => x) => {
  const v = safeArr(a)
    .map((x) => Number(g(x)))
    .filter(Number.isFinite);
  return v.length ? v.reduce((s, b) => s + b, 0) / v.length : 0;
};
const stddev = (a, g = (x) => x) => {
  const v = safeArr(a)
    .map((x) => Number(g(x)))
    .filter(Number.isFinite);
  if (v.length < 2) return 0;
  const m = v.reduce((s, b) => s + b, 0) / v.length;
  return Math.sqrt(v.reduce((s, b) => s + (b - m) ** 2, 0) / v.length);
};
const kgToTon = (kg) => Number(kg || 0) / 1000;
const minBtw = (s, e) => {
  if (!s || !e) return 0;
  const ms = new Date(e) - new Date(s);
  return ms > 0 ? Math.round(ms / 60000) : 0;
};
const fmtDT = (v) => {
  if (!v) return "—";
  const d = dayjs(v);
  return d.isValid() ? d.format("DD.MM.YYYY HH:mm") : "—";
};
const toDTL = (d) => dayjs(d).format("YYYY-MM-DDTHH:mm");
const fmtApi = (v) => {
  if (!v) return "";
  const d = dayjs(v);
  return d.isValid() ? d.format("YYYY-MM-DDTHH:mm:ss") : "";
};
const getTemps = (h) =>
  safeArr(h?.temperatures)
    .map((t) => ({
      value: Number(t?.temperature || 0),
      o2: Number(t?.o2 || 0),
      carbon: Number(t?.carbon || 0),
      time: t?.dateTime || null,
    }))
    .filter((x) => Number.isFinite(x.value));
const getAvgTemp = (h) => avg(getTemps(h), (x) => x.value);
const getLastTemp = (h) => {
  const a = getTemps(h);
  return a.length ? a[a.length - 1].value : 0;
};
const getDelayMin = (h) =>
  sum(h?.delays, (d) => minBtw(d?.startTime, d?.stopTime));
const calcKwh = (e, w) => {
  const t = kgToTon(w);
  return t > 0 ? Number(e || 0) / t : 0;
};
const pickLatest = (arr, f = "startTime") => {
  const l = safeArr(arr);
  if (!l.length) return null;
  let b = l[0],
    bt = new Date(b?.[f] || 0).getTime();
  for (let i = 1; i < l.length; i++) {
    const t = new Date(l[i]?.[f] || 0).getTime();
    if (t > bt) {
      b = l[i];
      bt = t;
    }
  }
  return b;
};
const groupByDay = (items, df, fn) => {
  const m = new Map();
  for (const it of safeArr(items)) {
    const d = it?.[df];
    if (!d) continue;
    const k = dayjs(d).format("DD.MM");
    const e = m.get(k);
    e ? e.push(it) : m.set(k, [it]);
  }
  const r = [];
  for (const [k, a] of m)
    r.push({ kun: k, value: fn(a), count: a.length, items: a });
  return r;
};
const sortDK = (arr) =>
  [...arr].sort((a, b) => {
    const [ad, am] = a.kun.split(".").map(Number);
    const [bd, bm] = b.kun.split(".").map(Number);
    return am === bm ? ad - bd : am - bm;
  });
const mergeByDay = ({ eaf, lrf, tsc, vod }) => {
  const m = new Map();
  const fill = (a, k) => {
    for (const it of safeArr(a)) {
      const e = m.get(it.kun);
      if (e) e[k] = it.value;
      else
        m.set(it.kun, {
          kun: it.kun,
          eaf: 0,
          lrf: 0,
          tsc: 0,
          vod: 0,
          [k]: it.value,
        });
    }
  };
  fill(eaf, "eaf");
  fill(lrf, "lrf");
  fill(tsc, "tsc");
  fill(vod, "vod");
  return sortDK([...m.values()]);
};
const mergeTempS = (sm) => {
  const b = new Map();
  for (const [k, a] of Object.entries(sm))
    for (let i = 0; i < safeArr(a).length; i++) {
      const p = a[i];
      const lb = p.time ? dayjs(p.time).format("HH:mm") : `${i + 1}`;
      const o = b.get(lb) || { time: lb };
      o[k] = p.value;
      b.set(lb, o);
    }
  return [...b.values()].sort((a, c) => a.time.localeCompare(c.time));
};
const getLastChem = (an = [], code) => {
  const l = safeArr(an);
  if (!l.length) return 0;
  let lt = l[0],
    ltt = new Date(lt?.sampleTime || 0).getTime();
  for (let i = 1; i < l.length; i++) {
    const t = new Date(l[i]?.sampleTime || 0).getTime();
    if (t > ltt) {
      lt = l[i];
      ltt = t;
    }
  }
  const cl = String(code).toLowerCase();
  const f = safeArr(lt?.chemicalAnalysis).find(
    (x) => String(x?.code || "").toLowerCase() === cl,
  );
  return Number(f?.value || 0);
};
/**
 * REAL period-over-period comparison
 * Bugun vs Kecha, Bu hafta vs O'tgan hafta, Bu oy vs O'tgan oy, Bu yil vs O'tgan yil
 *
 * rows — enriched heat array
 * dateField — qaysi maydondan sana olish (productionDate, startTime...)
 * metrics — [{ key, label, unit, higherIsBad }] solishtiriladigan ko'rsatkichlar
 */
function buildComparisons(rows, dateField, metrics) {
  const now = dayjs();
  const list = safeArr(rows);
  if (!list.length) {
    const empty = {
      current: 0,
      previous: 0,
      delta: 0,
      trend: "stable",
      currentCount: 0,
      prevCount: 0,
    };
    const emptyPeriods = {
      day: { ...empty, label: "Bugun vs Kecha" },
      week: { ...empty, label: "Bu hafta vs O'tgan hafta" },
      month: { ...empty, label: "Bu oy vs O'tgan oy" },
      year: { ...empty, label: "Bu yil vs O'tgan yil (shu kunlarigacha)" },
    };
    return metrics.map((m) => ({
      ...m,
      periods: emptyPeriods,
      summary: "Ma'lumot yo'q",
    }));
  }

  // Davr chegaralari
  const periods = {
    day: {
      label: "Bugun vs Kecha",
      curStart: now.startOf("day"),
      curEnd: now,
      prevStart: now.subtract(1, "day").startOf("day"),
      prevEnd: now.subtract(1, "day").endOf("day"),
    },
    week: {
      label: "Bu hafta vs O'tgan hafta",
      curStart: now.startOf("week"),
      curEnd: now,
      prevStart: now.subtract(1, "week").startOf("week"),
      prevEnd: now.subtract(1, "week").endOf("week"),
    },
    month: {
      label: "Bu oy vs O'tgan oy",
      curStart: now.startOf("month"),
      curEnd: now,
      prevStart: now.subtract(1, "month").startOf("month"),
      prevEnd: now.subtract(1, "month").endOf("month"),
    },
    year: {
      label: "Bu yil vs O'tgan yil (shu kunlarigacha)",
      curStart: now.startOf("year"),
      curEnd: now,
      prevStart: now.subtract(1, "year").startOf("year"),
      prevEnd: now
        .subtract(1, "year")
        .startOf("year")
        .add(now.diff(now.startOf("year"), "day"), "day"),
    },
  };

  // Heatlarni bir marta filter qilish — O(n) per period
  const filterByRange = (start, end) =>
    list.filter((h) => {
      const d = dayjs(h?.[dateField]);
      return d.isValid() && !d.isBefore(start) && !d.isAfter(end);
    });

  const cached = {};
  for (const [pk, p] of Object.entries(periods)) {
    cached[pk] = {
      cur: filterByRange(p.curStart, p.curEnd),
      prev: filterByRange(p.prevStart, p.prevEnd),
    };
  }

  return metrics.map((m) => {
    const result = {
      key: m.key,
      label: m.label,
      unit: m.unit || "",
      higherIsBad: m.higherIsBad || false,
      periods: {},
    };

    for (const [pk, p] of Object.entries(periods)) {
      const { cur, prev } = cached[pk];

      // Metric hisoblash: agar "sum" bo'lsa — sum, aks holda avg
      const curVal =
        m.aggregate === "sum"
          ? sum(cur, (x) => Number(x?.[m.key]) || 0)
          : avg(cur, (x) => Number(x?.[m.key]) || 0);
      const prevVal =
        m.aggregate === "sum"
          ? sum(prev, (x) => Number(x?.[m.key]) || 0)
          : avg(prev, (x) => Number(x?.[m.key]) || 0);

      const delta = prevVal
        ? ((curVal - prevVal) / prevVal) * 100
        : curVal > 0
          ? 100
          : 0;

      let trend = "stable";
      if (Math.abs(delta) > 2) {
        if (m.higherIsBad) trend = delta > 0 ? "bad_up" : "good_down";
        else trend = delta > 0 ? "good_up" : "bad_down";
      }

      result.periods[pk] = {
        label: p.label,
        current: curVal,
        previous: prevVal,
        delta,
        trend,
        currentCount: cur.length,
        prevCount: prev.length,
      };
    }

    // Umumiy summary — eng muhim o'zgarish
    const monthP = result.periods.month;
    const dir = monthP.delta > 0 ? "+" : "";
    const desc = m.higherIsBad
      ? monthP.delta > 2
        ? "⚠ Oshmoqda"
        : monthP.delta < -2
          ? "✓ Kamaymoqda"
          : "— Barqaror"
      : monthP.delta > 2
        ? "✓ O'smoqda"
        : monthP.delta < -2
          ? "⚠ Kamaymoqda"
          : "— Barqaror";
    result.summary = `${desc} (oy: ${dir}${fmtN(monthP.delta, 1)}%)`;

    return result;
  });
}

/** Qisqa trend — USC va boshqa joy uchun backward-compatible wrapper */
const buildTrend = (rows, dateField, key, higherIsBad = false) => {
  const comps = buildComparisons(rows, dateField, [
    { key, label: key, higherIsBad },
  ]);
  const m = comps[0]?.periods?.month || {};
  const d = m.delta || 0;
  const trendDir = Math.abs(d) < 2 ? "stable" : d > 0 ? "up" : "down";
  let message = "Barqaror";
  if (Math.abs(d) >= 2) {
    const dir = d > 0 ? "+" : "";
    message = `${dir}${fmtN(d, 1)}% oylik (${fmtN(m.previous, 1)} → ${fmtN(m.current, 1)})`;
  }
  return { trend: trendDir, delta: d, message };
};
const statusMeta = (s) =>
  s >= 85
    ? { label: "Yaxshi", color: "#22c55e" }
    : s >= 65
      ? { label: "O'rtacha", color: "#f59e0b" }
      : { label: "Xavfli", color: "#ef4444" };
const riskLvl = (v, y, r, inv = false) =>
  inv
    ? v <= r
      ? { label: "Yuqori", color: "#ef4444" }
      : v <= y
        ? { label: "O'rta", color: "#f59e0b" }
        : { label: "Past", color: "#22c55e" }
    : v >= r
      ? { label: "Yuqori", color: "#ef4444" }
      : v >= y
        ? { label: "O'rta", color: "#f59e0b" }
        : { label: "Past", color: "#22c55e" };
const sevColor = (v) =>
  v === "kritik" ? "#ef4444" : v === "ogohlantirish" ? "#f59e0b" : "#0ea5e9";
const normHeat = (h) => ({
  ...h,
  shift: safeShift(h?.shift),
  team: safeTeam(h?.team),
  foreman: safePerson(h?.foreman),
  superintendent: safePerson(h?.superintendent),
});

/* ═══ FORECAST ═══ */
function buildForecast(rows, dateField, valueGetter, days = 30) {
  const daily = groupByDay(rows, dateField, (a) => sum(a, valueGetter));
  const vals = daily.map((x) => Number(x.value || 0)).filter((x) => x >= 0);
  const empty = {
    tomorrow: 0,
    periodEnd: 0,
    monthEnd: 0,
    yearEnd: 0,
    avgPerDay: 0,
    stdPerDay: 0,
    confidence: { upper: 0, lower: 0 },
    dailyChart: [],
    cumulativeChart: [],
    trendLine: [],
    insight: "Ma'lumot yetarli emas",
    forecastDays: days,
    trendPct: 0,
  };
  if (!vals.length) return empty;
  const l7 = vals.slice(-7),
    l14 = vals.slice(-14);
  const a7 = avg(l7),
    a14 = avg(l14.length ? l14 : vals),
    s7 = stddev(l7);
  const tp = a14 ? ((a7 - a14) / a14) * 100 : 0;
  const tom = Math.max(0, a7 + a7 * (tp / 100) * DAMP);
  const now = dayjs(),
    pm = Math.max(1, now.date());
  const mAct = sum(vals),
    mEnd = mAct + Math.max(0, now.daysInMonth() - pm) * tom;
  const yEnd = (mAct / pm) * 365,
    pEnd = tom * days;
  const uB = Math.max(0, tom + s7 * 1.5),
    lB = Math.max(0, tom - s7 * 1.5);
  const dc = daily.map((d) => ({
    kun: d.kun,
    actual: d.value,
    forecast: null,
    upper: null,
    lower: null,
  }));
  for (let i = 1; i <= Math.min(days, 60); i++) {
    const fd = now.add(i, "day"),
      decay = 1 + (tp / 100) * DAMP * (i / days);
    const df = Math.max(0, a7 * decay);
    dc.push({
      kun: fd.format("DD.MM"),
      actual: null,
      forecast: df,
      upper: df + s7 * 1.5,
      lower: Math.max(0, df - s7 * 1.5),
    });
  }
  let cA = 0,
    cF = 0;
  const cc = dc.map((d) => {
    if (d.actual != null) cA += d.actual;
    if (d.forecast != null) cF += d.forecast;
    return {
      kun: d.kun,
      actual: d.actual != null ? cA : null,
      forecast: d.forecast != null ? cA + cF : null,
    };
  });
  const tl = [];
  for (let i = 0; i < vals.length; i++) {
    const w = vals.slice(Math.max(0, i - 4), i + 1);
    tl.push({ kun: daily[i]?.kun || `${i}`, ma5: avg(w), value: vals[i] });
  }
  let insight = `Barqaror. Kunlik: ${fmtN(a7, 1)} t`;
  if (tp > 5)
    insight = `Ijobiy: +${fmtN(tp, 1)}%. ${days} kun: ${fmtN(pEnd, 1)} t`;
  else if (tp < -5) insight = `Pasayish: ${fmtN(tp, 1)}%`;
  return {
    tomorrow: tom,
    periodEnd: pEnd,
    monthEnd: mEnd,
    yearEnd: yEnd,
    avgPerDay: a7,
    stdPerDay: s7,
    confidence: { upper: uB, lower: lB },
    dailyChart: dc,
    cumulativeChart: cc,
    trendLine: tl,
    insight,
    forecastDays: days,
    trendPct: tp,
  };
}

/* ═══ EXTRA CHARTS ═══ */
function buildEnergyTrend(eR, lR) {
  const eD = groupByDay(eR, "productionDate", (a) =>
    avg(a, (x) => x.kwhPerTon),
  );
  const lD = groupByDay(lR, "productionDate", (a) =>
    avg(a, (x) => x.kwhPerTon),
  );
  const m = new Map();
  for (const d of eD) m.set(d.kun, { kun: d.kun, eafKwh: d.value, lrfKwh: 0 });
  for (const d of lD) {
    const e = m.get(d.kun);
    if (e) e.lrfKwh = d.value;
    else m.set(d.kun, { kun: d.kun, eafKwh: 0, lrfKwh: d.value });
  }
  return sortDK([...m.values()]);
}
function buildDelayAnalysis(all) {
  const m = new Map();
  for (const h of all)
    for (const d of safeArr(h?.delays)) {
      const r = safeText(d?.delayReason, safeText(d?.delayType, "Noma'lum"));
      const dur = minBtw(d?.startTime, d?.stopTime);
      if (dur <= 0) continue;
      const e = m.get(r);
      if (e) {
        e.totalMin += dur;
        e.count++;
      } else m.set(r, { reason: r, totalMin: dur, count: 1 });
    }
  return [...m.values()].sort((a, b) => b.totalMin - a.totalMin).slice(0, 10);
}
function buildShiftAnalysis(all) {
  const m = new Map();
  for (const h of all) {
    const s = h.shift || "Noma'lum";
    const e = m.get(s);
    if (e) {
      e.heats++;
      e.delaySum += h.delayMin || 0;
    } else m.set(s, { shift: s, heats: 1, delaySum: h.delayMin || 0 });
  }
  return [...m.values()].map((s) => ({
    shift: s.shift,
    heats: s.heats,
    avgDelay: s.heats ? s.delaySum / s.heats : 0,
  }));
}
function buildScatter(eR) {
  return eR
    .filter((h) => h.kwhPerTon > 0 && h.tappingWeight > 0)
    .map((h) => ({
      x: kgToTon(h.tappingWeight),
      y: h.kwhPerTon,
      heatId: h.heatId,
      bad: h.kwhPerTon > T.EAF.kwhPerTon.crit,
    }));
}
function buildHeatCount(all, df = "productionDate") {
  const m = new Map();
  for (const h of all) {
    const d = h?.[df];
    if (!d) continue;
    const k = dayjs(d).format("DD.MM");
    m.set(k, (m.get(k) || 0) + 1);
  }
  return sortDK([...m.entries()].map(([kun, count]) => ({ kun, count })));
}

/** Har bir jarayon uchun kunlik tonna, energiya, to'xtalish */
function buildProcessDaily(
  rows,
  dateField,
  tonGetter,
  energyGetter,
  delayKey = "delayMin",
) {
  const daily = new Map();
  for (const h of safeArr(rows)) {
    const d = h?.[dateField];
    if (!d) continue;
    const k = dayjs(d).format("DD.MM");
    const ex = daily.get(k);
    if (ex) {
      ex.items.push(h);
    } else daily.set(k, { items: [h] });
  }
  const result = [];
  for (const [kun, { items }] of daily) {
    result.push({
      kun,
      tonna: sum(items, tonGetter),
      energiya: avg(items, energyGetter),
      toxtalish: sum(items, (x) => Number(x?.[delayKey]) || 0),
      heatlar: items.length,
    });
  }
  return sortDK(result);
}

/* ═══ ANALYTICS BUILDERS ═══ */
function buildEAF(rows, fd = 30) {
  const en = safeArr(rows).map((h) => {
    const x = normHeat(h);
    const tw = Number(x?.tappingWeight) || 0;
    const e = Number(x?.electricalEnergy) || 0;
    const scrap = Number(x?.totalScrap) || 0;
    const hbi = Number(x?.totalHBI) || 0;
    return {
      ...x,
      tappingWeight: tw,
      energy: e,
      o2: Number(x?.injectedO2) || 0,
      scrap,
      hbi,
      ratio: hbi > 0 ? scrap / hbi : 0,
      latestTemp: getLastTemp(x),
      avgTemp: getAvgTemp(x),
      delayMin: getDelayMin(x),
      durationMin: minBtw(x?.startTime, x?.stopTime),
      carbon: getLastChem(x?.steelAnalysis, "C"),
      kwhPerTon: calcKwh(e, tw),
    };
  });
  const w = T.EAF.sw;
  const aK = avg(en, (x) => x.kwhPerTon);
  const aD = avg(en, (x) => x.delayMin);
  const aDu = avg(en, (x) => x.durationMin);
  const aR = avg(en, (x) => x.ratio);
  let s = 100;
  if (aK > T.EAF.kwhPerTon.crit) s -= w.energy;
  else if (aK > T.EAF.kwhPerTon.warn) s -= w.energyMild;
  if (aD > T.EAF.delay.crit) s -= w.delay;
  else if (aD > T.EAF.delay.warn) s -= w.delayMild;
  if (aR < T.EAF.ratio.min || aR > T.EAF.ratio.max) s -= w.ratio;
  if (aDu > T.EAF.duration.crit) s -= w.duration;
  return {
    name: "EAF",
    rows: en,
    totalHeats: en.length,
    totalTons: kgToTon(sum(en, (x) => x.tappingWeight)),
    totalEnergy: sum(en, (x) => x.energy),
    avgKwhPerTon: aK,
    avgDelay: aD,
    avgDuration: aDu,
    avgRatio: aR,
    avgTemp: avg(en, (x) => x.avgTemp),
    score: clamp(s, 30, 100),
    trend: buildTrend(en, "productionDate", "kwhPerTon", true),
    comparisons: buildComparisons(en, "productionDate", [
      {
        key: "tappingWeight",
        label: "Ishlab chiqarish",
        unit: "kg",
        aggregate: "sum",
      },
      {
        key: "kwhPerTon",
        label: "Energiya sarfi",
        unit: "kWh/t",
        higherIsBad: true,
      },
      { key: "delayMin", label: "To'xtalish", unit: "min", higherIsBad: true },
    ]),
    daily: buildProcessDaily(
      en,
      "productionDate",
      (x) => kgToTon(x.tappingWeight),
      (x) => x.kwhPerTon,
    ),
    forecast: buildForecast(
      en,
      "productionDate",
      (x) => kgToTon(x.tappingWeight),
      fd,
    ),
  };
}
function buildLRF(rows, fd = 30) {
  const en = safeArr(rows).map((h) => {
    const x = normHeat(h);
    const st = Number(x?.finalSteelWeight) || Number(x?.startSteelWeight) || 0;
    const e = Number(x?.electricalEnergy) || 0;
    return {
      ...x,
      steel: st,
      energy: e,
      avgTemp: getAvgTemp(x),
      latestTemp: getLastTemp(x),
      delayMin: getDelayMin(x),
      durationMin: minBtw(x?.startTime, x?.stopTime),
      kwhPerTon: calcKwh(e, st),
      arPerTon: st > 0 ? Number(x?.totalArConsumption || 0) / kgToTon(st) : 0,
      n2PerTon: st > 0 ? Number(x?.totalN2Consumption || 0) / kgToTon(st) : 0,
    };
  });
  const w = T.LRF.sw;
  const aK = avg(en, (x) => x.kwhPerTon);
  const aD = avg(en, (x) => x.delayMin);
  const aT = avg(en, (x) => x.avgTemp);
  let s = 100;
  if (aK > T.LRF.kwhPerTon.crit) s -= w.energy;
  else if (aK > T.LRF.kwhPerTon.warn) s -= w.energyMild;
  if (aD > T.LRF.delay.crit) s -= w.delay;
  if (aT < T.LRF.temp.min) s -= w.temp;
  return {
    name: "LRF",
    rows: en,
    totalHeats: en.length,
    totalTons: kgToTon(sum(en, (x) => x.steel)),
    avgKwhPerTon: aK,
    avgTemp: aT,
    avgDelay: aD,
    score: clamp(s, 30, 100),
    trend: buildTrend(en, "productionDate", "kwhPerTon", true),
    comparisons: buildComparisons(en, "productionDate", [
      { key: "steel", label: "Ishlab chiqarish", unit: "kg", aggregate: "sum" },
      {
        key: "kwhPerTon",
        label: "Energiya sarfi",
        unit: "kWh/t",
        higherIsBad: true,
      },
      { key: "avgTemp", label: "Harorat", unit: "°C" },
    ]),
    daily: buildProcessDaily(
      en,
      "productionDate",
      (x) => kgToTon(x.steel),
      (x) => x.kwhPerTon,
    ),
    forecast: buildForecast(en, "productionDate", (x) => kgToTon(x.steel), fd),
  };
}
function buildTSC(rows, fd = 30) {
  const en = safeArr(rows).map((h) => {
    const x = normHeat(h);
    const st = Number(x?.finalSteelWeight) || Number(x?.startSteelWeight) || 0;
    const str = safeArr(x?.tscStrands);
    const sl = safeArr(x?.tscProducts).filter(
      (p) => Number(p?.productType) === 1,
    );
    const at = getAvgTemp(x),
      liq = Number(x?.liquidusTemperature || 0);
    return {
      ...x,
      steel: st,
      avgTemp: at,
      liquidus: liq,
      delta: at && liq ? at - liq : 0,
      delayMin: getDelayMin(x),
      castLength: sum(str, (s) => s?.castLength),
      castSpeedAvg: avg(str, (s) => s?.castSpeedAvg),
      slabCount: sl.length,
      slabWeight: sum(sl, (s) => s?.productWeight),
    };
  });
  const w = T.TSC.sw;
  const aCS = avg(en, (x) => x.castSpeedAvg);
  const aDl = avg(en, (x) => x.delta);
  const aD = avg(en, (x) => x.delayMin);
  let s = 100;
  if (aCS < T.TSC.castSpeed.crit) s -= w.speed;
  else if (aCS < T.TSC.castSpeed.warn) s -= w.speedMild;
  if (aDl < T.TSC.superheat.crit) s -= w.superheat;
  if (aD > T.TSC.delay.crit) s -= w.delay;
  return {
    name: "TSC",
    rows: en,
    totalHeats: en.length,
    totalTons: kgToTon(sum(en, (x) => x.slabWeight || x.steel)),
    totalSlabs: sum(en, (x) => x.slabCount),
    avgCastSpeed: aCS,
    avgDelta: aDl,
    avgDelay: aD,
    score: clamp(s, 30, 100),
    trend: buildTrend(en, "productionDate", "castSpeedAvg"),
    comparisons: buildComparisons(en, "productionDate", [
      {
        key: "slabWeight",
        label: "Ishlab chiqarish",
        unit: "kg",
        aggregate: "sum",
      },
      { key: "castSpeedAvg", label: "Quyish tezligi", unit: "m/min" },
      { key: "delta", label: "Superheat", unit: "°C" },
    ]),
    daily: buildProcessDaily(
      en,
      "productionDate",
      (x) => kgToTon(x.slabWeight || x.steel),
      (x) => x.castSpeedAvg,
      "delayMin",
    ),
    forecast: buildForecast(
      en,
      "productionDate",
      (x) => kgToTon(x.slabWeight || x.steel),
      fd,
    ),
  };
}
function buildVOD(rows, fd = 30) {
  const en = safeArr(rows).map((h) => {
    const x = normHeat(h);
    const ss = Number(x?.startSteelWeight) || 0,
      fs = Number(x?.finalSteelWeight) || 0;
    return {
      ...x,
      startSteel: ss,
      finalSteel: fs,
      avgTemp: getAvgTemp(x),
      latestTemp: getLastTemp(x),
      delayMin: getDelayMin(x),
      oxygenPerTon:
        kgToTon(fs) > 0 ? Number(x?.totalOxygen || 0) / kgToTon(fs) : 0,
      yieldLossPct: ss > 0 ? ((ss - fs) / ss) * 100 : 0,
    };
  });
  const w = T.VOD.sw;
  const aY = avg(en, (x) => x.yieldLossPct);
  const aV = avg(en, (x) => x?.minVacuumPressure || 0);
  const aD = avg(en, (x) => x.delayMin);
  let s = 100;
  if (aY > T.VOD.yieldLoss.crit) s -= w.yld;
  else if (aY > T.VOD.yieldLoss.warn) s -= w.yldMild;
  if (aV > T.VOD.vacuum.crit) s -= w.vacuum;
  else if (aV > T.VOD.vacuum.warn) s -= w.vacuumMild;
  if (aD > T.VOD.delay.crit) s -= w.delay;
  return {
    name: "VOD",
    rows: en,
    totalHeats: en.length,
    totalTons: kgToTon(sum(en, (x) => x.finalSteel)),
    avgYieldLoss: aY,
    avgMinVac: aV,
    avgDelay: aD,
    score: clamp(s, 30, 100),
    trend: buildTrend(en, "productionDate", "yieldLossPct", true),
    comparisons: buildComparisons(en, "productionDate", [
      {
        key: "finalSteel",
        label: "Ishlab chiqarish",
        unit: "kg",
        aggregate: "sum",
      },
      {
        key: "yieldLossPct",
        label: "Yield loss",
        unit: "%",
        higherIsBad: true,
      },
      { key: "delayMin", label: "Kechikish", unit: "min", higherIsBad: true },
    ]),
    daily: buildProcessDaily(
      en,
      "productionDate",
      (x) => kgToTon(x.finalSteel),
      (x) => x.oxygenPerTon,
      "delayMin",
    ),
    forecast: buildForecast(
      en,
      "productionDate",
      (x) => kgToTon(x.finalSteel),
      fd,
    ),
  };
}
function buildExec(eaf, lrf, tsc, vod) {
  const u = [eaf, lrf, tsc, vod];
  const tH = sum(u, (x) => x.totalHeats);
  const tT = sum(u, (x) => x.totalTons);
  const aS = avg(u, (x) => x.score);
  const st = statusMeta(aS);
  let strong = u[0],
    weak = u[0];
  for (const x of u) {
    if (x.score > strong.score) strong = x;
    if (x.score < weak.score) weak = x;
  }
  const risks = [],
    rec = [];
  if (eaf.avgKwhPerTon > T.EAF.kwhPerTon.crit - 20) {
    risks.push("EAF energiya sarfi yuqori");
    rec.push("EAF charge mix va power-on optimallashtirish");
  }
  if (eaf.avgDelay > T.EAF.delay.warn + 2)
    risks.push("EAF kechikishlari yuqori");
  if (eaf.avgRatio < T.EAF.ratio.min || eaf.avgRatio > T.EAF.ratio.max)
    rec.push(
      "LOM/HBI nisbatini " +
        T.EAF.ratio.min +
        "–" +
        T.EAF.ratio.max +
        " da ushlash",
    );
  if (lrf.avgTemp < T.LRF.temp.min) risks.push("LRF harorat nazorati kerak");
  if (lrf.avgDelay > T.LRF.delay.crit - 2)
    rec.push("LRF material addition standartlashtirish");
  if (tsc.avgDelta < T.TSC.superheat.crit) {
    risks.push("TSC superheat past");
    rec.push("TSC superheat zaxirasini oshirish");
  }
  if (vod.totalHeats > 0 && vod.avgYieldLoss > T.VOD.yieldLoss.anomaly) {
    risks.push("VOD yield loss yuqori");
    rec.push("VOD vacuum parametrlarini sozlash");
  }
  if (!rec.length) rec.push("Barqaror, nuqtaviy optimizatsiya tavsiya etiladi");
  return {
    totalHeats: tH,
    totalTons: tT,
    avgScore: aS,
    status: st,
    strongest: strong,
    weakest: weak,
    risks,
    recommendations: rec,
  };
}
function buildAnoms(eaf, lrf, tsc, vod) {
  const L = [];
  for (const h of eaf.rows) {
    if (h.kwhPerTon > T.EAF.kwhPerTon.crit)
      L.push({
        process: "EAF",
        heatId: h.heatId,
        type: "Yuqori energiya",
        value: fmtN(h.kwhPerTon, 1) + " kWh/t",
        risk: riskLvl(h.kwhPerTon, T.EAF.kwhPerTon.warn, T.EAF.kwhPerTon.crit),
        reason: "Charge mix / power-on qayta ko'rish kerak.",
        raw: h,
      });
    if (h.delayMin > T.EAF.delay.crit)
      L.push({
        process: "EAF",
        heatId: h.heatId,
        type: "Katta kechikish",
        value: fmtN(h.delayMin, 0) + " min",
        risk: riskLvl(h.delayMin, T.EAF.delay.warn, T.EAF.delay.crit),
        reason: "Delay sabablarini ko'rish kerak.",
        raw: h,
      });
  }
  for (const h of lrf.rows) {
    if (h.latestTemp > 0 && h.latestTemp < T.LRF.temp.min)
      L.push({
        process: "LRF",
        heatId: h.heatId,
        type: "Past harorat",
        value: fmtN(h.latestTemp, 0) + " °C",
        risk: riskLvl(h.latestTemp, T.LRF.temp.warnFrom, T.LRF.temp.min, true),
        reason: "Termik rejim sifatga ta'sir qilishi mumkin.",
        raw: h,
      });
  }
  for (const h of tsc.rows) {
    if (h.delta < T.TSC.superheat.crit)
      L.push({
        process: "TSC",
        heatId: h.heatId,
        type: "Superheat past",
        value: fmtN(h.delta, 1) + " °C",
        risk: riskLvl(
          h.delta,
          T.TSC.superheat.warn,
          T.TSC.superheat.crit,
          true,
        ),
        reason: "Quyish barqarorligiga xavf.",
        raw: h,
      });
    if (h.castSpeedAvg > 0 && h.castSpeedAvg < T.TSC.castSpeed.anomaly)
      L.push({
        process: "TSC",
        heatId: h.heatId,
        type: "Tezlik past",
        value: fmtN(h.castSpeedAvg, 2) + " m/min",
        risk: riskLvl(
          h.castSpeedAvg,
          T.TSC.castSpeed.warn,
          T.TSC.castSpeed.anomaly,
          true,
        ),
        reason: "Unumdorlikka ta'sir.",
        raw: h,
      });
  }
  for (const h of vod.rows) {
    if (h.yieldLossPct > T.VOD.yieldLoss.anomaly)
      L.push({
        process: "VOD",
        heatId: h.heatId,
        type: "Yield loss",
        value: fmtN(h.yieldLossPct, 2) + " %",
        risk: riskLvl(
          h.yieldLossPct,
          T.VOD.yieldLoss.warn,
          T.VOD.yieldLoss.anomaly,
        ),
        reason: "Chiqish foizi pasaygan.",
        raw: h,
      });
  }
  const wt = { Yuqori: 3, "O'rta": 2, Past: 1 };
  L.sort((a, b) => (wt[b.risk.label] || 0) - (wt[a.risk.label] || 0));
  return L;
}
function dirMsg(ex, eaf, lrf, tsc, vod, w) {
  const p = [
    "Holat: " + ex.status.label.toLowerCase() + ".",
    "Kuchli: " + ex.strongest?.name + ", zaif: " + ex.weakest?.name + ".",
  ];
  // Real oylik solishtirish natijalaridan foydalanish
  const eafProd = eaf.comparisons?.find((c) => c.key === "tappingWeight")
    ?.periods?.month;
  const eafEnergy = eaf.comparisons?.find((c) => c.key === "kwhPerTon")?.periods
    ?.month;
  if (eafProd && Math.abs(eafProd.delta) > 2)
    p.push(
      "EAF ishlab chiqarish: " +
        (eafProd.delta > 0 ? "+" : "") +
        fmtN(eafProd.delta, 1) +
        "% oylik o'zgarish.",
    );
  if (eafEnergy && eafEnergy.delta > 3)
    p.push(
      "EAF energiya sarfi " + fmtN(eafEnergy.delta, 1) + "% oshgan — bu yomon.",
    );
  if (tsc.avgDelta < T.TSC.superheat.crit && tsc.totalHeats > 0)
    p.push("TSC superheat past.");
  if (vod.totalHeats > 0 && vod.avgYieldLoss > T.VOD.yieldLoss.anomaly)
    p.push("VOD yield loss oshgan.");
  if (w.length) p.push("API: " + w.join(", ") + ".");
  p.push("Tavsiya: " + ex.recommendations[0] + ".");
  return p.join(" ");
}

/* ═══ UI ═══ */
function useUi() {
  const t = useTheme();
  const dk = t.palette.mode === "dark";
  return useMemo(
    () => ({
      isDark: dk,
      paperSoft: dk
        ? "linear-gradient(180deg,rgba(15,23,42,.94),rgba(12,18,32,.98))"
        : "linear-gradient(180deg,#fff,#f8fbff)",
      border: dk ? "rgba(148,163,184,.16)" : "rgba(15,23,42,.08)",
      borderStrong: dk ? "rgba(148,163,184,.24)" : "rgba(15,23,42,.12)",
      textMain: dk ? "#e5eef9" : "#0f172a",
      textSoft: dk ? "#a8b3c7" : "#475569",
      textMuted: dk ? "#7c8aa5" : "#64748b",
      grid: dk ? "rgba(148,163,184,.18)" : "rgba(15,23,42,.10)",
      shadow: dk
        ? "0 10px 28px rgba(0,0,0,.24)"
        : "0 10px 24px rgba(15,23,42,.06)",
    }),
    [dk],
  );
}

const DP = memo(function DP({ children, sx = {} }) {
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
});

const CT = memo(function CT({ active, payload, label }) {
  const ui = useUi();
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        background: ui.isDark ? "#0f172a" : "#fff",
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
      {payload
        .filter((p) => p.value != null)
        .map((p) => (
          <Typography
            key={`${p.name}-${p.dataKey}`}
            sx={{
              fontSize: "0.82rem",
              color: p.color || p.stroke,
              lineHeight: 1.7,
              fontWeight: 700,
            }}
          >
            {p.name}: {fmtN(p.value, 1)}
          </Typography>
        ))}
    </Box>
  );
});

const KPI = memo(function KPI({ title, value, subtitle, color, icon }) {
  return (
    <DP sx={{ p: 2.1, height: "100%" }}>
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
    </DP>
  );
});

const USC = memo(function USC({ unit }) {
  const st = statusMeta(unit.score);
  return (
    <DP sx={{ p: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography sx={{ fontWeight: 800 }}>{unit.name}</Typography>
        <Chip
          size="small"
          label={st.label}
          sx={{
            background: `${st.color}22`,
            color: st.color,
            border: `1px solid ${st.color}55`,
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
            backgroundColor: st.color,
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
    </DP>
  );
});

const MIC = memo(function MIC({ title, rows = [] }) {
  return (
    <DP sx={{ p: 2.1, height: "100%" }}>
      <Typography sx={{ fontSize: "1rem", fontWeight: 800, mb: 1.4 }}>
        {title}
      </Typography>
      <Box sx={{ display: "flex", flexDirection: "column", gap: 1.05 }}>
        {rows.map((r, i) => (
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
            {i < rows.length - 1 && <Divider sx={{ mt: 0.95 }} />}
          </Box>
        ))}
      </Box>
    </DP>
  );
});

const FC = memo(function FC({ title, forecast, color = "#0ea5e9" }) {
  return (
    <DP sx={{ p: 2.1, height: "100%" }}>
      <Typography sx={{ fontSize: "1rem", fontWeight: 800, mb: 1.4 }}>
        {title}
      </Typography>
      <Stack spacing={0.8}>
        <Typography sx={{ fontSize: "0.84rem", color: "text.secondary" }}>
          Ertangi kun: <b style={{ color }}>{fmtN(forecast.tomorrow, 1)} t</b>
        </Typography>
        <Typography sx={{ fontSize: "0.84rem", color: "text.secondary" }}>
          {forecast.forecastDays} kunlik:{" "}
          <b style={{ color }}>{fmtN(forecast.periodEnd, 1)} t</b>
        </Typography>
        <Typography sx={{ fontSize: "0.84rem", color: "text.secondary" }}>
          Oy: <b style={{ color }}>{fmtN(forecast.monthEnd, 1)} t</b>
        </Typography>
        <Typography sx={{ fontSize: "0.84rem", color: "text.secondary" }}>
          Yil: <b style={{ color }}>{fmtN(forecast.yearEnd, 1)} t</b>
        </Typography>
        <Divider />
        <Typography sx={{ fontSize: "0.78rem", color: "text.secondary" }}>
          Kunlik:{" "}
          <b>
            {fmtN(forecast.avgPerDay, 1)} ± {fmtN(forecast.stdPerDay, 1)} t
          </b>
        </Typography>
        <Typography
          sx={{
            fontSize: "0.8rem",
            color: "text.secondary",
            fontStyle: "italic",
          }}
        >
          {forecast.insight}
        </Typography>
      </Stack>
    </DP>
  );
});

const HDD = memo(function HDD({ open, onClose, item }) {
  const raw = item?.raw;
  const temps = safeArr(raw?.temperatures);
  const delays = safeArr(raw?.delays);
  const latSteel = useMemo(() => {
    const l = safeArr(raw?.steelAnalysis);
    return l.length ? pickLatest(l, "sampleTime") : null;
  }, [raw?.steelAnalysis]);
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
        <DP sx={{ p: 2, mb: 2 }}>
          <Stack spacing={0.8}>
            {[
              ["Jarayon", item?.process],
              ["Heat ID", safeText(raw?.heatId)],
              ["Po'lat", safeText(raw?.steelGradeName)],
              ["Shift", safeShift(raw?.shift)],
              ["Team", safeTeam(raw?.team)],
              ["Foreman", safePerson(raw?.foreman)],
            ].map(([k, v]) => (
              <Typography key={k}>
                <b>{k}:</b> {v}
              </Typography>
            ))}
          </Stack>
        </DP>
        <DP sx={{ p: 2, mb: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>AI izoh</Typography>
          <Typography
            sx={{ fontSize: "0.84rem", color: "#94a3b8", lineHeight: 1.7 }}
          >
            {item?.reason}
          </Typography>
        </DP>
        <DP sx={{ p: 2, mb: 2 }}>
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
                  {fmtDT(t?.dateTime)} — {fmtN(t?.temperature, 1)} °C
                </Typography>
              ))
            ) : (
              <Typography sx={{ fontSize: "0.8rem", color: "#94a3b8" }}>
                Ma'lumot yo'q
              </Typography>
            )}
          </Stack>
        </DP>
        <DP sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 700, mb: 1 }}>
            Kimyoviy tahlil
          </Typography>
          {latSteel?.chemicalAnalysis?.length ? (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ color: "#94a3b8" }}>Kod</TableCell>
                    <TableCell sx={{ color: "#94a3b8" }}>Qiymat</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {latSteel.chemicalAnalysis.map((c, i) => (
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
              Mavjud emas
            </Typography>
          )}
        </DP>
      </Box>
    </Drawer>
  );
});

/* ═══ PERIOD COMPARISON UI ═══ */
const TREND_ICONS = {
  good_up: "▲",
  good_down: "▼",
  bad_up: "▲",
  bad_down: "▼",
  stable: "—",
};
const TREND_COLORS = {
  good_up: "#22c55e",
  good_down: "#22c55e",
  bad_up: "#ef4444",
  bad_down: "#ef4444",
  stable: "#64748b",
};

const ComparisonRow = memo(function ComparisonRow({ comp, periodKey }) {
  const p = comp.periods[periodKey];
  if (!p) return null;
  const tc = TREND_COLORS[p.trend] || "#64748b";
  const icon = TREND_ICONS[p.trend] || "—";
  const dir = p.delta > 0 ? "+" : "";
  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        py: 0.6,
      }}
    >
      <Typography sx={{ fontSize: "0.8rem", color: "text.secondary", flex: 1 }}>
        {comp.label}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.78rem",
          color: "text.secondary",
          flex: 1,
          textAlign: "center",
        }}
      >
        {fmtN(p.previous, 1)} → <b>{fmtN(p.current, 1)}</b> {comp.unit}
      </Typography>
      <Typography
        sx={{
          fontSize: "0.82rem",
          fontWeight: 800,
          color: tc,
          flex: 0,
          minWidth: 90,
          textAlign: "right",
        }}
      >
        {icon} {dir}
        {fmtN(p.delta, 1)}%
      </Typography>
    </Box>
  );
});

const ComparisonCard = memo(function ComparisonCard({
  unit,
  periodKey = "month",
}) {
  const ui = useUi();
  if (!unit.comparisons?.length) return null;

  const periodLabels = {
    day: "Kunlik",
    week: "Haftalik",
    month: "Oylik",
    year: "Yillik",
  };

  return (
    <DP sx={{ p: 2, height: "100%" }}>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1.5 }}
      >
        <Typography sx={{ fontWeight: 800 }}>
          {unit.name} — {periodLabels[periodKey]} solishtirish
        </Typography>
        <Chip
          size="small"
          label={unit.comparisons[0]?.periods?.[periodKey]?.label || ""}
          sx={{ fontSize: "0.7rem", fontWeight: 600 }}
        />
      </Stack>
      <Stack spacing={0.3} divider={<Divider />}>
        {unit.comparisons.map((c) => (
          <ComparisonRow key={c.key} comp={c} periodKey={periodKey} />
        ))}
      </Stack>
      <Typography
        sx={{
          mt: 1.5,
          fontSize: "0.76rem",
          color: ui.textMuted,
          fontStyle: "italic",
        }}
      >
        {unit.comparisons.map((c) => c.summary).join(" · ")}
      </Typography>
    </DP>
  );
});

/* ═══════════════════════════════════════════════════════════════
   MAIN — Boshliq sahifani ochganda darhol grafiklar ko'radi
═══════════════════════════════════════════════════════════════ */
export default function Analitika() {
  const ui = useUi();
  const [tab, setTab] = useState(0);
  const [selAnom, setSelAnom] = useState(null);
  const [fcDays, setFcDays] = useState(30);
  const [fcUnit, setFcUnit] = useState("ALL");
  const [showFilters, setShowFilters] = useState(false);
  const [compPeriod, setCompPeriod] = useState("month");

  const now = dayjs(),
    b30 = now.subtract(30, "day");
  const [filters, setFilters] = useState({
    heatId: "",
    startDate: toDTL(b30),
    endDate: toDTL(now),
    process: "ALL",
  });
  const [applied, setApplied] = useState({
    heatId: "",
    startDate: fmtApi(b30),
    endDate: fmtApi(now),
    process: "ALL",
  });

  const qp = useMemo(() => {
    const p = {};
    if (applied.heatId) p.heatId = applied.heatId;
    if (applied.startDate) p.startDate = applied.startDate;
    if (applied.endDate) p.endDate = applied.endDate;
    return p;
  }, [applied.heatId, applied.startDate, applied.endDate]);
  const shouldRun = useCallback(
    (n) => applied.process === "ALL" || applied.process === n,
    [applied.process],
  );
  const sq = useCallback(async (fn, name) => {
    try {
      const d = await fn();
      return { ok: true, data: safeArr(d), warning: null, name };
    } catch {
      return {
        ok: false,
        data: [],
        warning: `${name} vaqtincha olinmadi`,
        name,
      };
    }
  }, []);
  const apiFns = {
    EAF: getEAFHeatReport,
    LRF: getLRFHeatReport,
    TSC: getTSCHeatReport,
    VOD: getVODHeatReport,
  };
  const res = useQueries({
    queries: ["EAF", "LRF", "TSC", "VOD"].map((n) => ({
      queryKey: ["analytics", n, qp],
      enabled: shouldRun(n),
      queryFn: () => sq(() => apiFns[n](qp), n),
      staleTime: STALE_MS,
    })),
  });
  const loading = res.some((q) => q.isLoading);
  const eD = res[0]?.data?.data ?? [],
    lD = res[1]?.data?.data ?? [],
    tD = res[2]?.data?.data ?? [],
    vD = res[3]?.data?.data ?? [];
  const wKey = [
    res[0]?.data?.warning,
    res[1]?.data?.warning,
    res[2]?.data?.warning,
    res[3]?.data?.warning,
  ]
    .filter(Boolean)
    .join("|");

  const A = useMemo(() => {
    const w = wKey ? wKey.split("|") : [];
    const eaf = buildEAF(eD, fcDays),
      lrf = buildLRF(lD, fcDays),
      tsc = buildTSC(tD, fcDays),
      vod = buildVOD(vD, fcDays);
    const exec = buildExec(eaf, lrf, tsc, vod),
      anoms = buildAnoms(eaf, lrf, tsc, vod),
      dm = dirMsg(exec, eaf, lrf, tsc, vod, w);
    const lE = pickLatest(eaf.rows, "startTime"),
      lL = pickLatest(lrf.rows, "startTime"),
      lT = pickLatest(tsc.rows, "ladleOpeningDate"),
      lV = pickLatest(vod.rows, "startTime");
    const tempData = mergeTempS({
      eaf: getTemps(lE),
      lrf: getTemps(lL),
      tsc: getTemps(lT),
      vod: getTemps(lV),
    });
    const prodData = mergeByDay({
      eaf: groupByDay(eaf.rows, "productionDate", (a) =>
        kgToTon(sum(a, (x) => x.tappingWeight)),
      ),
      lrf: groupByDay(lrf.rows, "productionDate", (a) =>
        kgToTon(sum(a, (x) => x.steel)),
      ),
      tsc: groupByDay(tsc.rows, "productionDate", (a) =>
        kgToTon(sum(a, (x) => x.slabWeight || x.steel)),
      ),
      vod: groupByDay(vod.rows, "productionDate", (a) =>
        kgToTon(sum(a, (x) => x.finalSteel)),
      ),
    });
    const scoreC = [eaf, lrf, tsc, vod].map((u) => ({
      name: u.name,
      score: u.score,
    }));
    const all = [...eaf.rows, ...lrf.rows, ...tsc.rows, ...vod.rows];
    const unkShift = all.filter(
      (x) => safeShift(x.shift) === "Noma'lum smena",
    ).length;
    const eTrend = buildEnergyTrend(eaf.rows, lrf.rows),
      delayA = buildDelayAnalysis(all),
      shiftA = buildShiftAnalysis(all),
      scatter = buildScatter(eaf.rows),
      heatCnt = buildHeatCount(all);
    const alerts = [];
    if (eaf.totalHeats && eaf.avgKwhPerTon > T.EAF.kwhPerTon.crit - 20)
      alerts.push({
        id: "e",
        xabar: `EAF energiya: ${fmtN(eaf.avgKwhPerTon, 1)} kWh/t`,
        daraja: "kritik",
      });
    if (tsc.totalHeats && tsc.avgDelta < T.TSC.superheat.crit)
      alerts.push({
        id: "t",
        xabar: `TSC superheat: ${fmtN(tsc.avgDelta, 1)} °C`,
        daraja: "ogohlantirish",
      });
    if (vod.totalHeats && vod.avgYieldLoss > T.VOD.yieldLoss.anomaly)
      alerts.push({
        id: "v",
        xabar: `VOD yield loss: ${fmtN(vod.avgYieldLoss, 2)} %`,
        daraja: "kritik",
      });
    if (w.length)
      alerts.push({ id: "api", xabar: w.join(", "), daraja: "info" });
    if (unkShift > 0)
      alerts.push({
        id: "sh",
        xabar: `${unkShift} smena yo'q`,
        daraja: "info",
      });
    if (!alerts.length)
      alerts.push({ id: "ok", xabar: "Ogohlantirish yo'q", daraja: "info" });
    return {
      eaf,
      lrf,
      tsc,
      vod,
      exec,
      anoms,
      dm,
      tempData,
      prodData,
      scoreC,
      lE,
      lL,
      lT,
      lV,
      alerts,
      unkShift,
      w,
      eTrend,
      delayA,
      shiftA,
      scatter,
      heatCnt,
    };
  }, [eD, lD, tD, vD, wKey, fcDays]);

  const doApply = useCallback(
    () =>
      setApplied({
        heatId: filters.heatId.trim(),
        startDate: fmtApi(filters.startDate),
        endDate: fmtApi(filters.endDate),
        process: filters.process,
      }),
    [filters],
  );
  const doReset = useCallback(() => {
    const n = dayjs(),
      b = n.subtract(30, "day");
    setFilters({
      heatId: "",
      startDate: toDTL(b),
      endDate: toDTL(n),
      process: "ALL",
    });
    setApplied({
      heatId: "",
      startDate: fmtApi(b),
      endDate: fmtApi(n),
      process: "ALL",
    });
  }, []);
  const closeAnom = useCallback(() => setSelAnom(null), []);

  if (loading)
    return (
      <Box sx={{ p: 3, minHeight: 420, display: "grid", placeItems: "center" }}>
        <Stack spacing={2} alignItems="center">
          <CircularProgress size={48} />
          <Typography sx={{ color: "text.secondary", fontSize: "0.9rem" }}>
            AI Tahlil yuklanmoqda...
          </Typography>
        </Stack>
      </Box>
    );

  const {
    eaf,
    lrf,
    tsc,
    vod,
    exec,
    anoms,
    dm,
    tempData,
    prodData,
    scoreC,
    lE,
    lL,
    lT,
    lV,
    alerts,
    unkShift,
    w,
    eTrend,
    delayA,
    shiftA,
    scatter,
    heatCnt,
  } = A;
  const fcUnits =
    fcUnit === "ALL"
      ? [eaf, lrf, tsc, vod]
      : [{ EAF: eaf, LRF: lrf, TSC: tsc, VOD: vod }[fcUnit]];

  return (
    <Box
      sx={{
        p: { xs: 1.5, md: 2.5 },
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* ═══ HERO: Score + AI xulosa + KPIs — DOIM ko'rinadi ═══ */}
      <DP sx={{ p: 2.3 }}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          spacing={2}
        >
          <Box>
            <Stack direction="row" spacing={1.5} alignItems="center">
              <SpeedRoundedIcon
                sx={{ color: exec.status.color, fontSize: 28 }}
              />
              <Typography
                sx={{
                  fontSize: "1.25rem",
                  fontWeight: 900,
                  color: ui.textMain,
                }}
              >
                AI Tahlil
              </Typography>
            </Stack>
            <Typography
              sx={{ color: ui.textSoft, mt: 0.6, fontSize: "0.84rem" }}
            >
              Eritish • Qayta Ishlash • Vakuum • Quyish — tezkor xulosa
            </Typography>
          </Box>
          <Stack
            alignItems={{ xs: "flex-start", md: "flex-end" }}
            spacing={0.5}
          >
            <Chip
              label={`${exec.status.label}`}
              sx={{
                background: `${exec.status.color}22`,
                color: exec.status.color,
                border: `1px solid ${exec.status.color}55`,
                fontWeight: 800,
                fontSize: "0.85rem",
              }}
            />
            <Typography
              sx={{
                color: ui.textMain,
                fontWeight: 900,
                fontSize: "2.2rem",
                lineHeight: 1,
              }}
            >
              {fmtN(exec.avgScore, 0)}
            </Typography>
          </Stack>
        </Stack>
      </DP>

      {w.length > 0 && (
        <Alert severity="warning" sx={{ borderRadius: 3 }}>
          API: {w.join(", ")}
        </Alert>
      )}

      {/* ═══ DASHBOARD OVERVIEW — darhol ko'rinadi, tabsiz ═══ */}

      {/* 4 KPI cards */}
      <Grid container spacing={1.5}>
        <Grid item xs={6} sm={3}>
          <KPI
            title="Jami Eritishlar"
            value={fmtN(exec.totalHeats, 0)}
            subtitle="Filtr bo'yicha"
            color="#0ea5e9"
            icon={<PrecisionManufacturingRoundedIcon />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KPI
            title="Jami Suyuq Metall"
            value={`${fmtN(exec.totalTons, 1)} t`}
            subtitle="Barcha jarayonlar"
            color="#22c55e"
            icon={<WaterfallChartRoundedIcon />}
          />
        </Grid>
        {/* <Grid item xs={6} sm={3}>
          <KPI
            title="Eng kuchli"
            value={safeText(exec.strongest?.name)}
            subtitle={`Ball: ${fmtN(exec.strongest?.score, 0)}`}
            color="#f59e0b"
            icon={<TrendingUpRoundedIcon />}
          />
        </Grid>
        <Grid item xs={6} sm={3}>
          <KPI
            title="Noma'lum smena"
            value={fmtN(unkShift, 0)}
            subtitle="Kiritilmagan"
            color="#ef4444"
            icon={<WarningAmberRoundedIcon />}
          />
        </Grid> */}
      </Grid>

      {/* 4 Score cards */}
      <Grid container spacing={1.5}>
        {[eaf, lrf, tsc, vod].map((u) => (
          <Grid item xs={6} md={3} key={u.name}>
            <USC unit={u} />
          </Grid>
        ))}
      </Grid>

      {/* ═══ PERIOD COMPARISON — boshliq uchun asosiy tahlil ═══ */}
      <DP sx={{ p: 2 }}>
        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={2}
          alignItems={{ sm: "center" }}
          sx={{ mb: 2 }}
        >
          <Typography sx={{ fontWeight: 800, color: ui.textMain }}>
            Davriy solishtirish
          </Typography>
          <ToggleButtonGroup
            value={compPeriod}
            exclusive
            onChange={(_, v) => v && setCompPeriod(v)}
            size="small"
          >
            <ToggleButton
              value="day"
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              Kunlik
            </ToggleButton>
            <ToggleButton
              value="week"
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              Haftalik
            </ToggleButton>
            <ToggleButton
              value="month"
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              Oylik
            </ToggleButton>
            <ToggleButton
              value="year"
              sx={{ fontWeight: 700, textTransform: "none" }}
            >
              Yillik
            </ToggleButton>
          </ToggleButtonGroup>
        </Stack>
        <Grid container spacing={1.5}>
          {[eaf, lrf, tsc, vod].map((u) => (
            <Grid item xs={12} md={3} key={`comp-${u.name}`}>
              <ComparisonCard unit={u} periodKey={compPeriod} />
            </Grid>
          ))}
        </Grid>
      </DP>

      <Grid container spacing={1.5}>
        {/* Ishlab chiqarish trendi */}
        <Grid item xs={12} md={7}>
          <DP>
            <Box sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 800, mb: 1 }}>
                Ishlab chiqarish trendi (tonnada)
              </Typography>
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={prodData}>
                    <defs>
                      {Object.entries(CC).map(([k, c]) => (
                        <linearGradient
                          key={k}
                          id={`g_${k}`}
                          x1="0"
                          y1="0"
                          x2="0"
                          y2="1"
                        >
                          <stop offset="5%" stopColor={c} stopOpacity={0.3} />
                          <stop offset="95%" stopColor={c} stopOpacity={0.02} />
                        </linearGradient>
                      ))}
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                    <XAxis
                      dataKey="kun"
                      tick={{ fill: ui.textMuted, fontSize: 10 }}
                    />
                    <YAxis tick={{ fill: ui.textMuted, fontSize: 10 }} />
                    <Tooltip content={<CT />} />
                    <Legend />
                    {Object.entries(CC).map(([k, c]) => (
                      <Area
                        key={k}
                        type="monotone"
                        dataKey={k.toLowerCase()}
                        name={k}
                        stroke={c}
                        fill={`url(#g_${k})`}
                        strokeWidth={2}
                      />
                    ))}
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          </DP>
        </Grid>

        {/* Score bar + AI xulosa */}
        <Grid item xs={12} md={5}>
          <DP>
            <Box sx={{ p: 2 }}>
              <Typography sx={{ fontWeight: 800, mb: 1 }}>
                Blok baholari
              </Typography>
              <Box sx={{ height: 160 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={scoreC}>
                    <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                    <XAxis
                      dataKey="name"
                      tick={{ fill: ui.textMuted, fontSize: 11 }}
                    />
                    <YAxis
                      domain={[0, 100]}
                      tick={{ fill: ui.textMuted, fontSize: 10 }}
                    />
                    <Tooltip content={<CT />} />
                    <Bar dataKey="score" name="Ball" radius={[6, 6, 0, 0]}>
                      {scoreC.map((e) => (
                        <Cell key={e.name} fill={statusMeta(e.score).color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </Box>
              <Divider sx={{ my: 1.5 }} />
              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                sx={{ mb: 0.5 }}
              >
                <AutoAwesomeRoundedIcon
                  sx={{ color: "#0ea5e9", fontSize: 18 }}
                />
                <Typography
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.84rem",
                    color: ui.textMain,
                  }}
                >
                  AI xulosa
                </Typography>
              </Stack>
              <Typography
                sx={{ color: ui.textSoft, fontSize: "0.8rem", lineHeight: 1.6 }}
              >
                {dm}
              </Typography>
            </Box>
          </DP>
        </Grid>
      </Grid>

      {/* Filters (yashirin, toggle) */}
      <Box>
        <Button
          size="small"
          onClick={() => setShowFilters(!showFilters)}
          sx={{ textTransform: "none", color: ui.textMuted, fontWeight: 700 }}
        >
          {showFilters ? "Filterlarni yashirish ▲" : "Filterlar ▼"}
        </Button>
        {showFilters && (
          <DP sx={{ p: 2, mt: 1 }}>
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
                  label="Boshlanish"
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
                  label="Tugash"
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
                    size="small"
                    startIcon={<SearchRoundedIcon />}
                    onClick={doApply}
                  >
                    Tahlil
                  </Button>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<RestartAltRoundedIcon />}
                    onClick={doReset}
                  >
                    Tozalash
                  </Button>
                </Stack>
              </Grid>
            </Grid>
          </DP>
        )}
      </Box>

      {/* ═══ TABLAR ═══ */}
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
          "Jarayonlar tahlili",
          "Harorat va energiya",
          "To'xtalish va smena",
          "Prognoz",
          "Og'ishlar",
          "Oxirgi heatlar",
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

      {/* TAB 0: JARAYONLAR TAHLILI — har bir blok uchun tonna, energiya, to'xtalish */}
      {tab === 0 && (
        <Grid container spacing={2}>
          {[eaf, lrf, tsc, vod].map((u) => {
            const color = CC[u.name];
            const energyLabel =
              u.name === "TSC"
                ? "Quyish tezligi (m/min)"
                : u.name === "VOD"
                  ? "O₂ sarfi (m³/t)"
                  : "Energiya sarfi (kWh/t)";
            return [
              /* Tonna */
              <Grid item xs={12} md={6} key={`ton-${u.name}`}>
                <DP>
                  <Box sx={{ p: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Typography sx={{ fontWeight: 800 }}>
                        {u.name} — Kunlik ishlab chiqarish (tonna)
                      </Typography>
                      <Chip
                        size="small"
                        label={`Jami: ${fmtN(u.totalTons, 1)} t`}
                        sx={{
                          background: `${color}22`,
                          color,
                          fontWeight: 700,
                        }}
                      />
                    </Stack>
                    <Box sx={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={u.daily}>
                          <defs>
                            <linearGradient
                              id={`ton_${u.name}`}
                              x1="0"
                              y1="0"
                              x2="0"
                              y2="1"
                            >
                              <stop
                                offset="5%"
                                stopColor={color}
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor={color}
                                stopOpacity={0.02}
                              />
                            </linearGradient>
                          </defs>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={ui.grid}
                          />
                          <XAxis
                            dataKey="kun"
                            tick={{ fill: ui.textMuted, fontSize: 9 }}
                          />
                          <YAxis tick={{ fill: ui.textMuted, fontSize: 10 }} />
                          <Tooltip content={<CT />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="tonna"
                            name="Tonna"
                            stroke={color}
                            fill={`url(#ton_${u.name})`}
                            strokeWidth={2}
                          />
                          <Line
                            type="monotone"
                            dataKey="heatlar"
                            name="Heatlar soni"
                            stroke={ui.textMuted}
                            strokeWidth={1.5}
                            strokeDasharray="4 3"
                            dot={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </DP>
              </Grid>,
              /* Energiya */
              <Grid item xs={12} md={6} key={`nrg-${u.name}`}>
                <DP>
                  <Box sx={{ p: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Typography sx={{ fontWeight: 800 }}>
                        {u.name} — {energyLabel}
                      </Typography>
                      {u.name !== "TSC" && u.name !== "VOD" && (
                        <Chip
                          size="small"
                          label={`O'rt: ${fmtN(u.avgKwhPerTon, 1)} kWh/t`}
                          sx={{
                            background: "#f59e0b22",
                            color: "#f59e0b",
                            fontWeight: 700,
                          }}
                        />
                      )}
                    </Stack>
                    <Box sx={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={u.daily}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={ui.grid}
                          />
                          <XAxis
                            dataKey="kun"
                            tick={{ fill: ui.textMuted, fontSize: 9 }}
                          />
                          <YAxis tick={{ fill: ui.textMuted, fontSize: 10 }} />
                          <Tooltip content={<CT />} />
                          <Legend />
                          {(u.name === "EAF" || u.name === "LRF") && (
                            <ReferenceLine
                              y={T[u.name].kwhPerTon.crit}
                              stroke="#ef4444"
                              strokeDasharray="5 5"
                              label={{
                                value: "Kritik",
                                fill: "#ef4444",
                                fontSize: 9,
                              }}
                            />
                          )}
                          {(u.name === "EAF" || u.name === "LRF") && (
                            <ReferenceLine
                              y={T[u.name].kwhPerTon.warn}
                              stroke="#f59e0b"
                              strokeDasharray="5 5"
                            />
                          )}
                          <Bar
                            dataKey="energiya"
                            name={energyLabel}
                            fill={color}
                            opacity={0.8}
                            radius={[3, 3, 0, 0]}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </DP>
              </Grid>,
              /* To'xtalish */
              <Grid item xs={12} md={6} key={`del-${u.name}`}>
                <DP>
                  <Box sx={{ p: 2 }}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Typography sx={{ fontWeight: 800 }}>
                        {u.name} — Kunlik to'xtalishlar (daqiqa)
                      </Typography>
                      <Chip
                        size="small"
                        label={`O'rt: ${fmtN(u.avgDelay, 0)} min`}
                        sx={{
                          background:
                            u.avgDelay > 10 ? "#ef444422" : "#22c55e22",
                          color: u.avgDelay > 10 ? "#ef4444" : "#22c55e",
                          fontWeight: 700,
                        }}
                      />
                    </Stack>
                    <Box sx={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={u.daily}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={ui.grid}
                          />
                          <XAxis
                            dataKey="kun"
                            tick={{ fill: ui.textMuted, fontSize: 9 }}
                          />
                          <YAxis tick={{ fill: ui.textMuted, fontSize: 10 }} />
                          <Tooltip content={<CT />} />
                          <Bar
                            dataKey="toxtalish"
                            name="To'xtalish (min)"
                            fill="#ef4444"
                            opacity={0.75}
                            radius={[3, 3, 0, 0]}
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </DP>
              </Grid>,
              /* Prognoz mini */
              <Grid item xs={12} md={6} key={`fcp-${u.name}`}>
                <DP>
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontWeight: 800, mb: 1 }}>
                      {u.name} — Ishlab chiqarish prognozi ({fcDays} kun)
                    </Typography>
                    <Box sx={{ height: 220 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={u.forecast.dailyChart}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={ui.grid}
                          />
                          <XAxis
                            dataKey="kun"
                            tick={{ fill: ui.textMuted, fontSize: 9 }}
                            interval={Math.max(
                              0,
                              Math.floor(u.forecast.dailyChart.length / 12),
                            )}
                          />
                          <YAxis tick={{ fill: ui.textMuted, fontSize: 10 }} />
                          <Tooltip content={<CT />} />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="upper"
                            stroke="none"
                            fill={CC_SOFT[u.name]}
                            name="Yuqori chegara"
                          />
                          <Bar
                            dataKey="actual"
                            name="Haqiqiy (t)"
                            fill={color}
                            radius={[3, 3, 0, 0]}
                            opacity={0.85}
                          />
                          <Line
                            dataKey="forecast"
                            name="Prognoz (t)"
                            stroke={color}
                            strokeWidth={2}
                            strokeDasharray="6 3"
                            dot={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </DP>
              </Grid>,
            ];
          })}
        </Grid>
      )}

      {/* TAB 1: Harorat va energiya */}
      {tab === 1 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <DP>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                  Harorat dinamikasi
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={tempData}>
                      <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                      <XAxis
                        dataKey="time"
                        tick={{ fill: ui.textMuted, fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: ui.textMuted, fontSize: 11 }} />
                      <Tooltip content={<CT />} />
                      <Legend />
                      {Object.entries(CC).map(([k, c]) => (
                        <Line
                          key={k}
                          dataKey={k.toLowerCase()}
                          name={k}
                          stroke={c}
                          strokeWidth={2.4}
                          dot={false}
                        />
                      ))}
                    </LineChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DP>
          </Grid>
          <Grid item xs={12} md={5}>
            <DP>
              <Box sx={{ p: 2 }}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mb: 1.5 }}
                >
                  <BoltRoundedIcon sx={{ color: "#f59e0b" }} />
                  <Typography sx={{ fontWeight: 800 }}>
                    Energiya trendi (kWh/t)
                  </Typography>
                </Stack>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={eTrend}>
                      <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                      <XAxis
                        dataKey="kun"
                        tick={{ fill: ui.textMuted, fontSize: 10 }}
                      />
                      <YAxis tick={{ fill: ui.textMuted, fontSize: 10 }} />
                      <Tooltip content={<CT />} />
                      <Legend />
                      <ReferenceLine
                        y={T.EAF.kwhPerTon.crit}
                        stroke="#ef4444"
                        strokeDasharray="5 5"
                      />
                      <ReferenceLine
                        y={T.EAF.kwhPerTon.warn}
                        stroke="#f59e0b"
                        strokeDasharray="5 5"
                      />
                      <Bar
                        dataKey="eafKwh"
                        name="EAF"
                        fill={CC.EAF}
                        opacity={0.8}
                        radius={[3, 3, 0, 0]}
                      />
                      <Line
                        dataKey="lrfKwh"
                        name="LRF"
                        stroke={CC.LRF}
                        strokeWidth={2.4}
                        dot={false}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DP>
          </Grid>
          <Grid item xs={12} md={5}>
            <DP>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                  EAF: kWh/t vs Tonnaj
                </Typography>
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ScatterChart>
                      <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                      <XAxis
                        type="number"
                        dataKey="x"
                        name="Tonnaj"
                        tick={{ fill: ui.textMuted, fontSize: 10 }}
                      />
                      <YAxis
                        type="number"
                        dataKey="y"
                        name="kWh/t"
                        tick={{ fill: ui.textMuted, fontSize: 10 }}
                      />
                      <Tooltip
                        cursor={{ strokeDasharray: "3 3" }}
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0]?.payload;
                          return (
                            <Box
                              sx={{
                                background: ui.isDark ? "#0f172a" : "#fff",
                                border: `1px solid ${ui.borderStrong}`,
                                p: 1.5,
                                borderRadius: 2,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "0.78rem",
                                  fontWeight: 700,
                                  color: ui.textMain,
                                }}
                              >
                                Heat: {d?.heatId}
                              </Typography>
                              <Typography
                                sx={{ fontSize: "0.78rem", color: ui.textSoft }}
                              >
                                {fmtN(d?.x, 1)} t / {fmtN(d?.y, 1)} kWh/t
                              </Typography>
                            </Box>
                          );
                        }}
                      />
                      <ReferenceLine
                        y={T.EAF.kwhPerTon.crit}
                        stroke="#ef4444"
                        strokeDasharray="4 4"
                      />
                      <Scatter
                        name="Normal"
                        data={scatter.filter((d) => !d.bad)}
                        fill={CC.EAF}
                        fillOpacity={0.7}
                      />
                      <Scatter
                        name="Anomaliya"
                        data={scatter.filter((d) => d.bad)}
                        fill="#ef4444"
                        fillOpacity={0.9}
                      />
                    </ScatterChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DP>
          </Grid>
          <Grid item xs={12} md={3}>
            <MIC
              title="EAF"
              rows={[
                { label: "Heatlar", value: fmtN(eaf.totalHeats, 0) },
                {
                  label: "Energiya",
                  value: fmtN(eaf.totalEnergy, 0) + " kWh",
                  color: "#f59e0b",
                },
                { label: "kWh/t", value: fmtN(eaf.avgKwhPerTon, 1) },
                { label: "Delay", value: fmtN(eaf.avgDelay, 0) + " min" },
                { label: "LOM/HBI", value: fmtN(eaf.avgRatio, 2) },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <DP>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>Radar</Typography>
                <Box sx={{ height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart
                      data={[
                        {
                          s: "Hajm",
                          ...Object.fromEntries(
                            [eaf, lrf, tsc, vod].map((u) => [
                              u.name,
                              u.totalTons,
                            ]),
                          ),
                        },
                        {
                          s: "Ball",
                          ...Object.fromEntries(
                            [eaf, lrf, tsc, vod].map((u) => [u.name, u.score]),
                          ),
                        },
                        {
                          s: "Heat",
                          ...Object.fromEntries(
                            [eaf, lrf, tsc, vod].map((u) => [
                              u.name,
                              u.totalHeats,
                            ]),
                          ),
                        },
                      ]}
                    >
                      <PolarGrid stroke={ui.grid} />
                      <PolarAngleAxis
                        dataKey="s"
                        tick={{ fill: ui.textMuted, fontSize: 10 }}
                      />
                      {Object.entries(CC).map(([k, c]) => (
                        <Radar
                          key={k}
                          name={k}
                          dataKey={k}
                          stroke={c}
                          fill={c}
                          fillOpacity={0.12}
                        />
                      ))}
                      <Legend />
                    </RadarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DP>
          </Grid>
        </Grid>
      )}

      {/* TAB 2: To'xtalish va smena */}
      {tab === 2 && (
        <Grid container spacing={2}>
          <Grid item xs={12} md={7}>
            <DP>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                  To'xtalish sabablari (eng ko'p 10 tasi)
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={delayA} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                      <XAxis
                        type="number"
                        tick={{ fill: ui.textMuted, fontSize: 10 }}
                      />
                      <YAxis
                        dataKey="reason"
                        type="category"
                        width={140}
                        tick={{ fill: ui.textMuted, fontSize: 9 }}
                      />
                      <Tooltip content={<CT />} />
                      <Bar
                        dataKey="totalMin"
                        name="Jami (min)"
                        radius={[0, 4, 4, 0]}
                      >
                        {delayA.map((_, i) => (
                          <Cell
                            key={i}
                            fill={DELAY_COLORS[i % DELAY_COLORS.length]}
                            opacity={0.85}
                          />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DP>
          </Grid>
          <Grid item xs={12} md={5}>
            <DP>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                  Smena samaradorligi
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={shiftA}>
                      <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                      <XAxis
                        dataKey="shift"
                        tick={{ fill: ui.textMuted, fontSize: 10 }}
                      />
                      <YAxis
                        yAxisId="left"
                        tick={{ fill: ui.textMuted, fontSize: 10 }}
                      />
                      <YAxis
                        yAxisId="right"
                        orientation="right"
                        tick={{ fill: ui.textMuted, fontSize: 10 }}
                      />
                      <Tooltip content={<CT />} />
                      <Legend />
                      <Bar
                        yAxisId="left"
                        dataKey="heats"
                        name="Heatlar"
                        fill="#0ea5e9"
                        radius={[4, 4, 0, 0]}
                        opacity={0.8}
                      />
                      <Line
                        yAxisId="right"
                        dataKey="avgDelay"
                        name="Delay (min)"
                        stroke="#ef4444"
                        strokeWidth={2.5}
                        dot={{ r: 4 }}
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DP>
          </Grid>
          <Grid item xs={12} md={5}>
            <DP>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                  Kunlik heat soni
                </Typography>
                <Box sx={{ height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={heatCnt}>
                      <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                      <XAxis
                        dataKey="kun"
                        tick={{ fill: ui.textMuted, fontSize: 10 }}
                      />
                      <YAxis
                        tick={{ fill: ui.textMuted, fontSize: 10 }}
                        allowDecimals={false}
                      />
                      <Tooltip content={<CT />} />
                      <Bar
                        dataKey="count"
                        name="Heatlar"
                        fill="#0ea5e9"
                        radius={[4, 4, 0, 0]}
                        opacity={0.85}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DP>
          </Grid>
          <Grid item xs={12} md={3}>
            <MIC
              title="LRF"
              rows={[
                { label: "Heatlar", value: fmtN(lrf.totalHeats, 0) },
                {
                  label: "kWh/t",
                  value: fmtN(lrf.avgKwhPerTon, 1),
                  color: "#f59e0b",
                },
                { label: "Harorat", value: fmtN(lrf.avgTemp, 0) + " °C" },
                { label: "Delay", value: fmtN(lrf.avgDelay, 0) + " min" },
              ]}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <Stack spacing={1.5}>
              <MIC
                title="TSC"
                rows={[
                  { label: "Heatlar", value: fmtN(tsc.totalHeats, 0) },
                  {
                    label: "Cast speed",
                    value: fmtN(tsc.avgCastSpeed, 2) + " m/min",
                    color: "#22c55e",
                  },
                  { label: "Superheat", value: fmtN(tsc.avgDelta, 1) + " °C" },
                ]}
              />
              <MIC
                title="VOD"
                rows={[
                  { label: "Heatlar", value: fmtN(vod.totalHeats, 0) },
                  {
                    label: "Yield loss",
                    value: fmtN(vod.avgYieldLoss, 2) + " %",
                    color: "#ef4444",
                  },
                  { label: "Min vacuum", value: fmtN(vod.avgMinVac, 2) },
                ]}
              />
            </Stack>
          </Grid>
        </Grid>
      )}

      {/* TAB 3: Prognoz */}
      {tab === 3 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <DP sx={{ p: 2 }}>
              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={2}
                alignItems={{ sm: "center" }}
              >
                <Stack direction="row" spacing={1} alignItems="center">
                  <TimelineRoundedIcon sx={{ color: "#0ea5e9" }} />
                  <Typography sx={{ fontWeight: 800 }}>Davr:</Typography>
                </Stack>
                <ToggleButtonGroup
                  value={fcDays}
                  exclusive
                  onChange={(_, v) => v && setFcDays(v)}
                  size="small"
                >
                  {FP.map((p) => (
                    <ToggleButton
                      key={p.value}
                      value={p.value}
                      sx={{ fontWeight: 700, textTransform: "none" }}
                    >
                      {p.label}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
                <Divider orientation="vertical" flexItem />
                <ToggleButtonGroup
                  value={fcUnit}
                  exclusive
                  onChange={(_, v) => v && setFcUnit(v)}
                  size="small"
                >
                  <ToggleButton
                    value="ALL"
                    sx={{ fontWeight: 700, textTransform: "none" }}
                  >
                    Barchasi
                  </ToggleButton>
                  {Object.keys(CC).map((k) => (
                    <ToggleButton
                      key={k}
                      value={k}
                      sx={{
                        fontWeight: 700,
                        textTransform: "none",
                        color: CC[k],
                      }}
                    >
                      {k}
                    </ToggleButton>
                  ))}
                </ToggleButtonGroup>
              </Stack>
            </DP>
          </Grid>
          {fcUnits.map((u) => (
            <Grid item xs={12} md={fcUnits.length === 1 ? 4 : 3} key={u.name}>
              <FC
                title={`${u.name}`}
                forecast={u.forecast}
                color={CC[u.name]}
              />
            </Grid>
          ))}
          {fcUnits.map((u) => (
            <Grid
              item
              xs={12}
              md={fcUnits.length === 1 ? 8 : 6}
              key={`fc-${u.name}`}
            >
              <DP>
                <Box sx={{ p: 2 }}>
                  <Typography sx={{ fontWeight: 800, mb: 1 }}>
                    {u.name}: {fcDays} kun prognoz
                  </Typography>
                  <Box sx={{ height: 280 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <ComposedChart data={u.forecast.dailyChart}>
                        <defs>
                          <linearGradient
                            id={`fg_${u.name}`}
                            x1="0"
                            y1="0"
                            x2="0"
                            y2="1"
                          >
                            <stop
                              offset="5%"
                              stopColor={CC[u.name]}
                              stopOpacity={0.25}
                            />
                            <stop
                              offset="95%"
                              stopColor={CC[u.name]}
                              stopOpacity={0.02}
                            />
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                        <XAxis
                          dataKey="kun"
                          tick={{ fill: ui.textMuted, fontSize: 9 }}
                          interval={Math.max(
                            0,
                            Math.floor(u.forecast.dailyChart.length / 15),
                          )}
                        />
                        <YAxis tick={{ fill: ui.textMuted, fontSize: 10 }} />
                        <Tooltip content={<CT />} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="upper"
                          stroke="none"
                          fill={CC_SOFT[u.name]}
                          name="Yuqori chegara"
                        />
                        <Area
                          type="monotone"
                          dataKey="lower"
                          stroke="none"
                          fill="transparent"
                          name="Pastki"
                        />
                        <Bar
                          dataKey="actual"
                          name="Haqiqiy (t)"
                          fill={CC[u.name]}
                          radius={[3, 3, 0, 0]}
                          opacity={0.85}
                        />
                        <Line
                          dataKey="forecast"
                          name="Prognoz (t)"
                          stroke={CC[u.name]}
                          strokeWidth={2.5}
                          strokeDasharray="6 3"
                          dot={false}
                        />
                      </ComposedChart>
                    </ResponsiveContainer>
                  </Box>
                </Box>
              </DP>
            </Grid>
          ))}
          {fcUnits.length <= 2 &&
            fcUnits.map((u) => (
              <Grid item xs={12} md={6} key={`tr-${u.name}`}>
                <DP>
                  <Box sx={{ p: 2 }}>
                    <Typography sx={{ fontWeight: 800, mb: 1 }}>
                      {u.name}: MA-5
                    </Typography>
                    <Box sx={{ height: 240 }}>
                      <ResponsiveContainer width="100%" height="100%">
                        <ComposedChart data={u.forecast.trendLine}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke={ui.grid}
                          />
                          <XAxis
                            dataKey="kun"
                            tick={{ fill: ui.textMuted, fontSize: 9 }}
                          />
                          <YAxis tick={{ fill: ui.textMuted, fontSize: 10 }} />
                          <Tooltip content={<CT />} />
                          <Legend />
                          <Bar
                            dataKey="value"
                            name="Kunlik"
                            fill={CC_SOFT[u.name]}
                            radius={[3, 3, 0, 0]}
                          />
                          <Line
                            dataKey="ma5"
                            name="MA-5"
                            stroke={CC[u.name]}
                            strokeWidth={2.8}
                            dot={false}
                          />
                        </ComposedChart>
                      </ResponsiveContainer>
                    </Box>
                  </Box>
                </DP>
              </Grid>
            ))}
          <Grid item xs={12}>
            <DP>
              <Box sx={{ p: 2 }}>
                <Typography sx={{ fontWeight: 800, mb: 1.5 }}>
                  Prognoz taqqosi
                </Typography>
                <Box sx={{ height: 300 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        {
                          name: "Ertaga",
                          ...Object.fromEntries(
                            [eaf, lrf, tsc, vod].map((u) => [
                              u.name,
                              u.forecast.tomorrow,
                            ]),
                          ),
                        },
                        {
                          name: fcDays + " kun",
                          ...Object.fromEntries(
                            [eaf, lrf, tsc, vod].map((u) => [
                              u.name,
                              u.forecast.periodEnd,
                            ]),
                          ),
                        },
                        {
                          name: "Oy",
                          ...Object.fromEntries(
                            [eaf, lrf, tsc, vod].map((u) => [
                              u.name,
                              u.forecast.monthEnd,
                            ]),
                          ),
                        },
                        {
                          name: "Yil",
                          ...Object.fromEntries(
                            [eaf, lrf, tsc, vod].map((u) => [
                              u.name,
                              u.forecast.yearEnd,
                            ]),
                          ),
                        },
                      ]}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke={ui.grid} />
                      <XAxis
                        dataKey="name"
                        tick={{ fill: ui.textMuted, fontSize: 11 }}
                      />
                      <YAxis tick={{ fill: ui.textMuted, fontSize: 11 }} />
                      <Tooltip content={<CT />} />
                      <Legend />
                      {Object.entries(CC).map(([k, c]) => (
                        <Bar
                          key={k}
                          dataKey={k}
                          fill={c}
                          radius={[4, 4, 0, 0]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Box>
            </DP>
          </Grid>
        </Grid>
      )}

      {/* TAB 4: Og'ishlar */}
      {tab === 4 && (
        <DP sx={{ p: 2 }}>
          <Typography sx={{ fontWeight: 800, mb: 2 }}>
            AI aniqlagan og'ishlar
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Jarayon</TableCell>
                  <TableCell>Heat</TableCell>
                  <TableCell>Muammo</TableCell>
                  <TableCell>Qiymat</TableCell>
                  <TableCell>Risk</TableCell>
                  <TableCell>Amal</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {anoms.length ? (
                  anoms.slice(0, 20).map((a, i) => (
                    <TableRow key={`${a.process}-${a.heatId}-${i}`} hover>
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
                          onClick={() => setSelAnom(a)}
                        >
                          Ko'rish
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} align="center">
                      Muammo yo'q
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <HDD open={!!selAnom} onClose={closeAnom} item={selAnom} />
        </DP>
      )}

      {/* TAB 5: Oxirgi heatlar */}
      {tab === 5 && (
        <Grid container spacing={2}>
          {[
            {
              t: "Oxirgi EAF",
              d: lE,
              r: lE
                ? [
                    ["Heat", "#" + lE.heatId],
                    ["Steel", safeText(lE.steelGradeName)],
                    ["Boshlanish", fmtDT(lE.startTime)],
                    ["Shift", safeShift(lE.shift)],
                    ["kWh/t", fmtN(lE.kwhPerTon, 1)],
                  ]
                : null,
            },
            {
              t: "Oxirgi LRF",
              d: lL,
              r: lL
                ? [
                    ["Heat", "#" + lL.heatId],
                    ["Steel", safeText(lL.steelGradeName)],
                    ["Boshlanish", fmtDT(lL.startTime)],
                    ["Shift", safeShift(lL.shift)],
                    ["Harorat", fmtN(lL.latestTemp, 0) + " °C"],
                  ]
                : null,
            },
            {
              t: "Oxirgi TSC",
              d: lT,
              r: lT
                ? [
                    ["Heat", "#" + lT.heatId],
                    ["Steel", safeText(lT.steelGradeName)],
                    ["Opening", fmtDT(lT.ladleOpeningDate)],
                    ["Shift", safeShift(lT.shift)],
                    ["Speed", fmtN(lT.castSpeedAvg, 2) + " m/min"],
                  ]
                : null,
            },
            {
              t: "Oxirgi VOD",
              d: lV,
              r: lV
                ? [
                    ["Heat", "#" + lV.heatId],
                    ["Steel", safeText(lV.steelGradeName)],
                    ["Boshlanish", fmtDT(lV.startTime)],
                    ["Shift", safeShift(lV.shift)],
                    ["Yield", fmtN(lV.yieldLossPct, 2) + " %"],
                  ]
                : null,
            },
          ].map((c) => (
            <Grid item xs={12} md={3} key={c.t}>
              <MIC
                title={c.t}
                rows={
                  c.r
                    ? c.r.map(([l, v]) => ({ label: l, value: v }))
                    : [{ label: "Holat", value: "Yo'q" }]
                }
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════
//  List Prokatlash Kompleksi — React Query Hooks
//
//  Ishlatish:
//    import { useEAFReport, useDateRange, useAllProductionStats } from '@/hooks/useProduction'
//
//    // Bugun
//    const { data } = useEAFReport(useDateRange('today'))
//
//    // Oxirgi 7 kun
//    const { data } = useEAFReport(useDateRange('week'))
//
//    // Bu oy
//    const { data } = useEAFReport(useDateRange('month'))
//
//    // Bu yil
//    const { data } = useEAFReport(useDateRange('year'))
//
//    // Period tanlash bilan
//    const { eaf, period, setPeriod } = useAllProductionStats('today')
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { useQuery, useQueries } from "@tanstack/react-query";
import {
  getEAFHeatReport,
  getLRFHeatReport,
  getTSCHeatReport,
  getVODHeatReport,
  getMaterial,
  getMaterials,
} from "@/api/production";

// ════════════════════════════════════════════════════════════════
//  useDateRange — sana oraliqlarini hisoblash
//  period: 'today' | 'yesterday' | 'week' | 'month' | 'last_month'
//          'quarter' | 'year' | 'last_year' | 'custom'
// ════════════════════════════════════════════════════════════════
export function useDateRange(period = "today", customStart, customEnd) {
  return useMemo(() => {
    const fmt = (d) => d.toISOString().split("T")[0];
    const now = new Date();

    switch (period) {
      case "today":
        return { startDate: fmt(now), endDate: fmt(now) };

      case "yesterday": {
        const y = new Date(now);
        y.setDate(y.getDate() - 1);
        return { startDate: fmt(y), endDate: fmt(y) };
      }

      case "week": {
        const w = new Date(now);
        w.setDate(w.getDate() - 6);
        return { startDate: fmt(w), endDate: fmt(now) };
      }

      case "month": {
        const m = new Date(now.getFullYear(), now.getMonth(), 1);
        return { startDate: fmt(m), endDate: fmt(now) };
      }

      case "last_month": {
        const s = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const e = new Date(now.getFullYear(), now.getMonth(), 0);
        return { startDate: fmt(s), endDate: fmt(e) };
      }

      case "quarter": {
        const q = Math.floor(now.getMonth() / 3);
        const s = new Date(now.getFullYear(), q * 3, 1);
        return { startDate: fmt(s), endDate: fmt(now) };
      }

      case "year": {
        const y = new Date(now.getFullYear(), 0, 1);
        return { startDate: fmt(y), endDate: fmt(now) };
      }

      case "last_year": {
        const s = new Date(now.getFullYear() - 1, 0, 1);
        const e = new Date(now.getFullYear() - 1, 11, 31);
        return { startDate: fmt(s), endDate: fmt(e) };
      }

      case "custom":
        return { startDate: customStart, endDate: customEnd };

      default:
        return { startDate: fmt(now), endDate: fmt(now) };
    }
  }, [period, customStart, customEnd]);
}

// ─── Period nomlari (UI uchun) ───────────────────────────────────
export const PERIOD_LABELS = {
  today: "Bugun",
  yesterday: "Kecha",
  week: "Oxirgi 7 kun",
  month: "Bu oy",
  last_month: "O'tgan oy",
  quarter: "Bu chorak",
  year: "Bu yil",
  // last_year: "O'tgan yil",
  // custom: "Maxsus",
};

export const PERIOD_OPTIONS = [
  { value: "today", label: "Bugun", group: "kun" },
  { value: "yesterday", label: "Kecha", group: "kun" },
  { value: "week", label: "Oxirgi 7 kun", group: "hafta" },
  { value: "month", label: "Bu oy", group: "oy" },
  { value: "last_month", label: "O'tgan oy", group: "oy" },
  { value: "quarter", label: "Bu chorak", group: "chorak" },
  { value: "year", label: "Bu yil", group: "yil" },
  // { value: "last_year", label: "O'tgan yil", group: "yil" },
  // { value: "custom", label: "Maxsus...", group: "boshqa" },
];

// ─── Query key factory ───────────────────────────────────────────
export const PROD_QK = {
  eaf: (p) => ["production", "eaf", p ?? {}],
  lrf: (p) => ["production", "lrf", p ?? {}],
  tsc: (p) => ["production", "tsc", p ?? {}],
  vod: (p) => ["production", "vod", p ?? {}],
  material: (p) => ["production", "material", p ?? {}],
  materials: (p) => ["production", "materials", p ?? {}],
  all: () => ["production"],
};

// ─── Konfiguratsiya: period uzunligiga qarab cache ────────────────
const LONG_PERIODS = ["year", "last_year", "quarter", "month", "last_month"];

const BASE_OPTIONS = {
  staleTime: 2 * 60_000, // 2 daqiqa
  refetchInterval: 5 * 60_000, // har 5 daqiqa
  refetchOnWindowFocus: true,
  retry: 2,
};

const LONG_OPTIONS = {
  staleTime: 30 * 60_000, // 30 daqiqa (uzoq davr — kamroq yangilanadi)
  refetchInterval: false,
  refetchOnWindowFocus: false,
  retry: 2,
};

const getOpts = (period) =>
  LONG_PERIODS.includes(period) ? LONG_OPTIONS : BASE_OPTIONS;

// ─── Natijani standart formatga o'tkazish ────────────────────────
const toResult = (q) => ({
  data: Array.isArray(q.data) ? q.data : [],
  isLoading: q.isLoading,
  isFetching: q.isFetching,
  isError: q.isError,
  error: q.error,
  refetch: q.refetch,
  dataUpdatedAt: q.dataUpdatedAt,
  totalHeats: Array.isArray(q.data) ? q.data.length : 0,
});

// ─── Params tozalash (_period kabi ichki maydonlarni olib tashlash)
const cleanParams = ({ _period, ...rest }) => rest;

// ════════════════════════════════════════════════════════════════
//  EAF Heat Report
// ════════════════════════════════════════════════════════════════
export function useEAFReport(params, options = {}) {
  const q = useQuery({
    queryKey: PROD_QK.eaf(params),
    queryFn: () => getEAFHeatReport(cleanParams(params)),
    ...getOpts(params?._period),
    ...options,
  });
  return toResult(q);
}

// ════════════════════════════════════════════════════════════════
//  LRF Heat Report
// ════════════════════════════════════════════════════════════════
export function useLRFReport(params, options = {}) {
  const q = useQuery({
    queryKey: PROD_QK.lrf(params),
    queryFn: () => getLRFHeatReport(cleanParams(params)),
    ...getOpts(params?._period),
    ...options,
  });
  return toResult(q);
}

// ════════════════════════════════════════════════════════════════
//  TSC Heat Report
// ════════════════════════════════════════════════════════════════
export function useTSCReport(params, options = {}) {
  const q = useQuery({
    queryKey: PROD_QK.tsc(params),
    queryFn: () => getTSCHeatReport(cleanParams(params)),
    ...getOpts(params?._period),
    ...options,
  });
  return toResult(q);
}

// ════════════════════════════════════════════════════════════════
//  VOD Heat Report
// ════════════════════════════════════════════════════════════════
export function useVODReport(params, options = {}) {
  const q = useQuery({
    queryKey: PROD_QK.vod(params),
    queryFn: () => getVODHeatReport(cleanParams(params)),
    ...getOpts(params?._period),
    ...options,
  });
  return toResult(q);
}

// ════════════════════════════════════════════════════════════════
//  Material
// ════════════════════════════════════════════════════════════════
export function useMaterial(params, options = {}) {
  const q = useQuery({
    queryKey: PROD_QK.material(params),
    queryFn: () => getMaterial(params),
    staleTime: 5 * 60_000,
    ...options,
  });
  return { data: q.data ?? null, ...q };
}

export function useMaterials(params, options = {}) {
  const q = useQuery({
    queryKey: PROD_QK.materials(params),
    queryFn: () => getMaterials(params),
    staleTime: 5 * 60_000,
    ...options,
  });
  return { data: Array.isArray(q.data) ? q.data : [], ...q };
}

// ════════════════════════════════════════════════════════════════
//  useAllProductionReports — EAF+LRF+TSC+VOD parallel
// ════════════════════════════════════════════════════════════════
export function useAllProductionReports(params = {}) {
  const opts = getOpts(params?._period);
  const cp = cleanParams(params);

  const results = useQueries({
    queries: [
      {
        queryKey: PROD_QK.eaf(params),
        queryFn: () => getEAFHeatReport(cp),
        ...opts,
      },
      {
        queryKey: PROD_QK.lrf(params),
        queryFn: () => getLRFHeatReport(cp),
        ...opts,
      },
      {
        queryKey: PROD_QK.tsc(params),
        queryFn: () => getTSCHeatReport(cp),
        ...opts,
      },
      {
        queryKey: PROD_QK.vod(params),
        queryFn: () => getVODHeatReport(cp),
        ...opts,
      },
    ],
  });

  const [eafQ, lrfQ, tscQ, vodQ] = results;

  return {
    eaf: toResult(eafQ),
    lrf: toResult(lrfQ),
    tsc: toResult(tscQ),
    vod: toResult(vodQ),
    isAnyLoading: results.some((r) => r.isLoading),
    isAnyError: results.some((r) => r.isError),
    refetchAll: () => results.forEach((r) => r.refetch()),
  };
}

// ════════════════════════════════════════════════════════════════
//  useProductionStats — bitta API + period tanlash holati
//
//  const { data, totalHeats, period, setPeriod, dateRange, periodLabel }
//    = useProductionStats('eaf', 'today')
// ════════════════════════════════════════════════════════════════
export function useProductionStats(apiKey = "eaf", defaultPeriod = "today") {
  const [period, setPeriod] = useState(defaultPeriod);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const dateRange = useDateRange(period, customStart, customEnd);
  const params = { ...dateRange, _period: period };

  const hookMap = {
    eaf: useEAFReport,
    lrf: useLRFReport,
    tsc: useTSCReport,
    vod: useVODReport,
  };
  const result = (hookMap[apiKey] ?? useEAFReport)(params);

  return {
    ...result,
    period,
    setPeriod,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    dateRange,
    periodLabel: PERIOD_LABELS[period] || period,
  };
}

// ════════════════════════════════════════════════════════════════
//  useAllProductionStats — barcha API + period tanlash holati
//
//  const {
//    eaf, lrf, tsc, vod,
//    period, setPeriod,
//    dateRange, periodLabel,
//    customStart, setCustomStart,
//    customEnd, setCustomEnd,
//    isAnyLoading, refetchAll
//  } = useAllProductionStats('today')
// ════════════════════════════════════════════════════════════════
export function useAllProductionStats(defaultPeriod = "today") {
  const [period, setPeriod] = useState(defaultPeriod);
  const [customStart, setCustomStart] = useState("");
  const [customEnd, setCustomEnd] = useState("");

  const dateRange = useDateRange(period, customStart, customEnd);
  const params = { ...dateRange, _period: period };

  const { eaf, lrf, tsc, vod, isAnyLoading, isAnyError, refetchAll } =
    useAllProductionReports(params);

  return {
    eaf,
    lrf,
    tsc,
    vod,
    isAnyLoading,
    isAnyError,
    refetchAll,
    period,
    setPeriod,
    customStart,
    setCustomStart,
    customEnd,
    setCustomEnd,
    dateRange,
    periodLabel: PERIOD_LABELS[period] || period,
  };
}

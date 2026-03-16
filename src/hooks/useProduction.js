// ═══════════════════════════════════════════════════════════════
//  List Prokatlash Kompleksi — React Query Hooks
//
//  Ishlatish:
//    import { useEAFReport, useLRFReport, useTSCReport, useVODReport } from '@/hooks/useProduction'
//
//    const { data, isLoading, isError, refetch } = useEAFReport({ productionDate: '2026-03-16' })
// ═══════════════════════════════════════════════════════════════

import { useQuery, useQueries } from "@tanstack/react-query";
import {
  getEAFHeatReport,
  getLRFHeatReport,
  getTSCHeatReport,
  getVODHeatReport,
  getMaterial,
  getMaterials,
} from "@/api/production";

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

// ─── Sozlamalar ──────────────────────────────────────────────────
const BASE_OPTIONS = {
  staleTime: 2 * 60_000, // 2 daqiqa
  refetchInterval: 5 * 60_000, // har 5 daqiqa yangilanadi
  refetchOnWindowFocus: true, // oyna fokusga kelganda yangilanadi
  retry: 2,
};

// ════════════════════════════════════════════════════════════════
//  EAF Heat Report
// ════════════════════════════════════════════════════════════════

/**
 * @param {Object} [params] - filter parametrlari
 * @param {Object} [options] - useQuery qo'shimcha parametrlari
 *
 * @returns {Object}
 *   data        — EAFHeatReport[] massiv
 *   isLoading   — yuklanmoqda
 *   isError     — xato
 *   refetch     — qo'lda yangilash
 *   dataUpdatedAt — oxirgi yangilanish vaqti
 */
export function useEAFReport(params, options = {}) {
  const q = useQuery({
    queryKey: PROD_QK.eaf(params),
    queryFn: () => getEAFHeatReport(params),
    ...BASE_OPTIONS,
    ...options,
  });

  return {
    data: Array.isArray(q.data) ? q.data : [],
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    dataUpdatedAt: q.dataUpdatedAt,
    // Qulay hisob-kitoblar
    totalHeats: Array.isArray(q.data) ? q.data.length : 0,
  };
}

// ════════════════════════════════════════════════════════════════
//  LRF Heat Report
// ════════════════════════════════════════════════════════════════

export function useLRFReport(params, options = {}) {
  const q = useQuery({
    queryKey: PROD_QK.lrf(params),
    queryFn: () => getLRFHeatReport(params),
    ...BASE_OPTIONS,
    ...options,
  });

  return {
    data: Array.isArray(q.data) ? q.data : [],
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    dataUpdatedAt: q.dataUpdatedAt,
    totalHeats: Array.isArray(q.data) ? q.data.length : 0,
  };
}

// ════════════════════════════════════════════════════════════════
//  TSC Heat Report
// ════════════════════════════════════════════════════════════════

export function useTSCReport(params, options = {}) {
  const q = useQuery({
    queryKey: PROD_QK.tsc(params),
    queryFn: () => getTSCHeatReport(params),
    ...BASE_OPTIONS,
    ...options,
  });

  return {
    data: Array.isArray(q.data) ? q.data : [],
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    dataUpdatedAt: q.dataUpdatedAt,
    totalHeats: Array.isArray(q.data) ? q.data.length : 0,
  };
}

// ════════════════════════════════════════════════════════════════
//  VOD Heat Report
// ════════════════════════════════════════════════════════════════

export function useVODReport(params, options = {}) {
  const q = useQuery({
    queryKey: PROD_QK.vod(params),
    queryFn: () => getVODHeatReport(params),
    ...BASE_OPTIONS,
    ...options,
  });

  return {
    data: Array.isArray(q.data) ? q.data : [],
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    dataUpdatedAt: q.dataUpdatedAt,
    totalHeats: Array.isArray(q.data) ? q.data.length : 0,
  };
}

// ════════════════════════════════════════════════════════════════
//  Material
// ════════════════════════════════════════════════════════════════

export function useMaterial(params, options = {}) {
  const q = useQuery({
    queryKey: PROD_QK.material(params),
    queryFn: () => getMaterial(params),
    staleTime: 5 * 60_000, // 5 daqiqa — material kamdan kam o'zgaradi
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
//  useAllProductionReports — 4 ta hisobotni parallel yuklash
//  Sex-07 umumiy ko'rinishi uchun
// ════════════════════════════════════════════════════════════════

/**
 * EAF + LRF + TSC + VOD ni bir vaqtda yuklaydi.
 *
 * @param {Object} params - umumiy filter (productionDate, startDate, endDate)
 *
 * @returns {{
 *   eaf:    { data, isLoading, isError },
 *   lrf:    { data, isLoading, isError },
 *   tsc:    { data, isLoading, isError },
 *   vod:    { data, isLoading, isError },
 *   isAnyLoading: boolean,
 *   isAnyError:   boolean,
 *   refetchAll:   () => void,
 * }}
 */
export function useAllProductionReports(params = {}) {
  const results = useQueries({
    queries: [
      {
        queryKey: PROD_QK.eaf(params),
        queryFn: () => getEAFHeatReport(params),
        ...BASE_OPTIONS,
      },
      {
        queryKey: PROD_QK.lrf(params),
        queryFn: () => getLRFHeatReport(params),
        ...BASE_OPTIONS,
      },
      {
        queryKey: PROD_QK.tsc(params),
        queryFn: () => getTSCHeatReport(params),
        ...BASE_OPTIONS,
      },
      {
        queryKey: PROD_QK.vod(params),
        queryFn: () => getVODHeatReport(params),
        ...BASE_OPTIONS,
      },
    ],
  });

  const [eafQ, lrfQ, tscQ, vodQ] = results;

  const toResult = (q) => ({
    data: Array.isArray(q.data) ? q.data : [],
    isLoading: q.isLoading,
    isFetching: q.isFetching,
    isError: q.isError,
    error: q.error,
    refetch: q.refetch,
    totalHeats: Array.isArray(q.data) ? q.data.length : 0,
  });

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

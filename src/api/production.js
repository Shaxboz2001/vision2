import axios from "axios";

// Vite proxy orqali — CORS yo'q
// /prod-api/v1/... → http://172.16.1.106:5057/api/v1/...
const PRODUCTION_API_BASE = "/prod-api/v1";

const prodClient = axios.create({
  baseURL: PRODUCTION_API_BASE,
  timeout: 20000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

prodClient.interceptors.response.use(
  (res) => res,
  (err) => {
    console.warn(
      "[PROD-API]",
      err.config?.url,
      err.response?.status ?? err.message,
    );
    return Promise.reject(err);
  },
);

const clean = (params = {}) =>
  Object.fromEntries(
    Object.entries(params).filter(([, v]) => v != null && v !== ""),
  );

const get = (url, params) =>
  prodClient.get(url, { params: clean(params) }).then((r) => r.data);

export const getEAFHeatReport = (params) => get("/EAFHeatReport", params);
export const getLRFHeatReport = (params) => get("/LRFHeatReport", params);
export const getTSCHeatReport = (params) => get("/TSCHeatReport", params);
export const getVODHeatReport = (params) => get("/VODHeatReport", params);
export const getMaterial = (params) => get("/Material", params);
export const getMaterials = (params) => get("/Materials", params);

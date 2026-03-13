import axios from "axios";
import {
  sexlarData,
  uchastkalarData,
  uskunalarData,
  datchikData,
  ogohlantirishlarData,
  kameraData,
  kpiData,
  haroratGrafik,
  ishlab_chiqarish_grafik,
  apiDelay,
} from "@/utils/fakeData";

const api = axios.create({ baseURL: "/api", timeout: 5000 });

// Interceptor — fake backend
api.interceptors.request.use(async (config) => {
  await apiDelay(300 + Math.random() * 200);
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => Promise.reject(err),
);

// ---- Sexlar ----
export const getSexlar = async () => {
  await apiDelay(350);
  return { data: sexlarData };
};
export const getSexById = async (id) => {
  await apiDelay(200);
  return { data: sexlarData.find((s) => s.id === id) };
};

// ---- Uchastkalar ----
export const getUchastkalar = async (sexId) => {
  await apiDelay(300);
  const filtered = sexId
    ? uchastkalarData.filter((u) => u.sexId === sexId)
    : uchastkalarData;
  return { data: filtered };
};
export const getUchastkById = async (id) => {
  await apiDelay(200);
  return { data: uchastkalarData.find((u) => u.id === id) };
};

// ---- Uskunalar ----
export const getUskunalar = async ({ sexId, uchastkId } = {}) => {
  await apiDelay(300);
  let res = [...uskunalarData];
  if (sexId) res = res.filter((u) => u.sexId === sexId);
  if (uchastkId) res = res.filter((u) => u.uchastkId === uchastkId);
  return { data: res };
};
export const getUskuna = async (id) => {
  await apiDelay(200);
  return { data: uskunalarData.find((u) => u.id === id) };
};

// ---- Datchiklar ----
export const getDatchiklar = async ({ sexId, tur } = {}) => {
  await apiDelay(300);
  let res = [...datchikData];
  if (sexId) res = res.filter((d) => d.sexId === sexId);
  if (tur) res = res.filter((d) => d.tur === tur);
  return { data: res };
};

// ---- Ogohlantirishlar ----
export const getOgohlantirishlar = async ({ daraja, holat } = {}) => {
  await apiDelay(250);
  let res = [...ogohlantirishlarData];
  if (daraja) res = res.filter((o) => o.daraja === daraja);
  if (holat) res = res.filter((o) => o.holat === holat);
  return { data: res };
};

// ---- Kameralar ----
export const getKameralar = async () => {
  await apiDelay(200);
  return { data: kameraData };
};

// ---- KPI ----
export const getKpi = async () => {
  await apiDelay(200);
  // Add slight random variation to simulate live
  return {
    data: {
      ...kpiData,
      ishlab_chiqarish:
        kpiData.ishlab_chiqarish + Math.floor(Math.random() * 10 - 5),
      energiya: kpiData.energiya + Math.floor(Math.random() * 40 - 20),
    },
  };
};

// ---- Grafiklar ----
export const getHaroratGrafik = async () => {
  await apiDelay(400);
  return { data: haroratGrafik };
};
export const getIshlabGrafik = async () => {
  await apiDelay(400);
  return { data: ishlab_chiqarish_grafik };
};

export default api;

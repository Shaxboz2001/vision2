import { getSexlar, getUchastkalar, getUskunalar } from "@/api";
import {
  getEAFHeatReport,
  getLRFHeatReport,
  getTSCHeatReport,
  getVODHeatReport,
} from "@/api/production";

const toArray = (v) => (Array.isArray(v) ? v : []);

const avg = (arr) => {
  if (!arr?.length) return 0;
  return arr.reduce((s, x) => s + x, 0) / arr.length;
};

const getLastTempFromHeat = (heat) => {
  const temps = Array.isArray(heat?.temperatures) ? heat.temperatures : [];
  if (!temps.length) return null;
  return temps[temps.length - 1]?.temperature ?? null;
};

const getMinTempFromHeat = (heat) => {
  const temps = Array.isArray(heat?.temperatures) ? heat.temperatures : [];
  if (!temps.length) return null;
  return Math.min(...temps.map((t) => Number(t.temperature) || 0));
};

const countDelays = (heats = []) =>
  heats.reduce((sum, h) => sum + (h.delays?.length || 0), 0);

const getLatestShift = (...heats) => {
  for (const h of heats) {
    if (h?.shift) return h.shift;
  }
  return "—";
};

function getTotalProductWeight(tscHeats = []) {
  return tscHeats.reduce((heatSum, heat) => {
    const products = Array.isArray(heat.tscProducts) ? heat.tscProducts : [];
    const heatWeight = products.reduce(
      (productSum, product) =>
        productSum + (Number(product.productWeight) || 0),
      0,
    );
    return heatSum + heatWeight;
  }, 0);
}

function getSpeedScore(avgCastingSpeed, targetSpeed = 1.2) {
  if (!avgCastingSpeed || avgCastingSpeed <= 0) return 0;
  const percent = (avgCastingSpeed / targetSpeed) * 100;
  return Math.max(0, Math.min(100, Math.round(percent)));
}

function buildSex07FromReports(baseSex07, { eaf, lrf, tsc, vod }) {
  const eafHeats = toArray(eaf);
  const lrfHeats = toArray(lrf);
  const tscHeats = toArray(tsc);
  const vodHeats = toArray(vod);

  const latestEaf = eafHeats[eafHeats.length - 1];
  const latestLrf = lrfHeats[lrfHeats.length - 1];
  const latestTsc = tscHeats[tscHeats.length - 1];
  const latestVod = vodHeats[vodHeats.length - 1];

  const totalHeats =
    eafHeats.length + lrfHeats.length + tscHeats.length + vodHeats.length;

  const currentTemp =
    getLastTempFromHeat(latestTsc) ??
    getLastTempFromHeat(latestLrf) ??
    getLastTempFromHeat(latestVod) ??
    getLastTempFromHeat(latestEaf) ??
    baseSex07.harorat;

  const shift = getLatestShift(latestTsc, latestLrf, latestVod, latestEaf);

  const totalDelays =
    countDelays(eafHeats) +
    countDelays(lrfHeats) +
    countDelays(tscHeats) +
    countDelays(vodHeats);

  const totalSlabs = tscHeats.reduce(
    (sum, h) =>
      sum +
      ((h.tscProducts || []).filter((p) => p.productType === 1).length || 0),
    0,
  );

  const avgCastingSpeed = avg(
    tscHeats
      .flatMap((h) => h.tscStrands || [])
      .map((s) => Number(s.castSpeedAvg) || 0)
      .filter((x) => x > 0),
  );

  const activeWorkers = baseSex07.ishchilar;
  const loadPercent = Math.max(
    0,
    Math.min(
      100,
      Math.round(
        totalSlabs > 0
          ? (totalSlabs / 20) * 100
          : totalHeats > 0
            ? (totalHeats / 12) * 100
            : baseSex07.yuk,
      ),
    ),
  );

  const holat =
    totalHeats === 0 ? "toxtagan" : totalDelays > 8 ? "ogohlantirish" : "faol";

  const xavf =
    totalDelays > 10 || avgCastingSpeed < 0.8
      ? "yuqori"
      : totalDelays > 0 || (avgCastingSpeed > 0 && avgCastingSpeed < 1)
        ? "orta"
        : "past";

  return {
    ...baseSex07,
    holat,
    yuk: loadPercent,
    harorat: Math.round(Number(currentTemp) || 0),
    ishchilar: activeWorkers,
    smena: shift || "—",
    xavf,
    live: true,
    totalHeats,
    totalSlabs,
    avgCastingSpeed: Number(avgCastingSpeed.toFixed(2)),
    totalDelays,
  };
}

export async function getSexlarHybrid(params = {}) {
  const fakeRes = await getSexlar();
  const fakeSexlar = toArray(fakeRes?.data);

  try {
    const [eaf, lrf, tsc, vod] = await Promise.all([
      getEAFHeatReport(params),
      getLRFHeatReport(params),
      getTSCHeatReport(params),
      getVODHeatReport(params),
    ]);

    const merged = fakeSexlar.map((sex) => {
      if (sex.id !== "SEX-07") return sex;
      return buildSex07FromReports(sex, { eaf, lrf, tsc, vod });
    });

    return { data: merged };
  } catch (error) {
    console.warn("[HYBRID][SEX-07]", error?.message || error);
    return { data: fakeSexlar };
  }
}

/* =========================
   UCHASTKALAR HYBRID
========================= */

function getStatusByScore(score) {
  if (score >= 90) return "faol";
  if (score >= 70) return "ogohlantirish";
  return "xato";
}

function buildSex07Uchastkalar(fakeUch, { eaf, lrf, tsc, vod }) {
  const eafHeats = toArray(eaf);
  const lrfHeats = toArray(lrf);
  const tscHeats = toArray(tsc);
  const vodHeats = toArray(vod);

  const latestEaf = eafHeats[eafHeats.length - 1];
  const latestLrf = lrfHeats[lrfHeats.length - 1];
  const latestTsc = tscHeats[tscHeats.length - 1];
  const latestVod = vodHeats[vodHeats.length - 1];

  const latestTscTemp = getLastTempFromHeat(latestTsc);
  const latestLrfTemp = getLastTempFromHeat(latestLrf);
  const latestVodTemp = getLastTempFromHeat(latestVod);
  const latestEafTemp = getLastTempFromHeat(latestEaf);

  const totalSlabs = tscHeats.reduce(
    (sum, h) =>
      sum +
      ((h.tscProducts || []).filter((p) => p.productType === 1).length || 0),
    0,
  );

  const totalProductWeightKg = getTotalProductWeight(tscHeats);
  const totalProductWeightTon = totalProductWeightKg / 1000;

  const avgCastingSpeed = avg(
    tscHeats
      .flatMap((h) => h.tscStrands || [])
      .map((s) => Number(s.castSpeedAvg) || 0)
      .filter((x) => x > 0),
  );

  const totalDelays =
    countDelays(eafHeats) +
    countDelays(lrfHeats) +
    countDelays(tscHeats) +
    countDelays(vodHeats);

  return fakeUch
    .map((u) => {
      if (u.sexId !== "SEX-07") return u;

      switch (u.id) {
        case "UCH-07A": {
          const score = Math.max(
            0,
            Math.min(100, Math.round((totalSlabs / 20) * 100)),
          );
          return {
            ...u,
            live: true,
            holat: totalSlabs > 0 ? "faol" : "toxtagan",
            harorat: latestTscTemp ?? u.harorat,
            bosim: 0,
            samaradorlik: score,
            extraLabel: `${totalSlabs} slab`,
          };
        }

        case "UCH-07B": {
          const temp =
            latestLrfTemp ?? latestVodTemp ?? latestEafTemp ?? u.harorat;
          const score = temp >= 1100 ? 95 : temp >= 950 ? 80 : 60;
          return {
            ...u,
            live: true,
            holat: getStatusByScore(score),
            harorat: Math.round(temp || u.harorat),
            bosim: u.bosim,
            samaradorlik: score,
            extraLabel: "Qizdirish",
          };
        }

        case "UCH-07C": {
          const speedScore = getSpeedScore(avgCastingSpeed, 1.1);
          const score = Math.round(
            speedScore * 0.8 + (totalSlabs > 0 ? 20 : 0),
          );
          return {
            ...u,
            live: true,
            holat: getStatusByScore(score),
            harorat: latestTscTemp
              ? Math.round(latestTscTemp * 0.66)
              : u.harorat,
            bosim: u.bosim,
            samaradorlik: Math.max(0, Math.min(100, score)),
            extraLabel: `${avgCastingSpeed.toFixed(2)} m/min`,
          };
        }

        case "UCH-07D": {
          const speedScore = getSpeedScore(avgCastingSpeed, 1.2);
          const score = Math.round(
            speedScore * 0.85 + (totalSlabs > 0 ? 15 : 0),
          );
          return {
            ...u,
            live: true,
            holat: getStatusByScore(score),
            harorat: latestTscTemp
              ? Math.round(latestTscTemp * 0.58)
              : u.harorat,
            bosim: u.bosim,
            samaradorlik: Math.max(0, Math.min(100, score)),
            extraLabel: `${avgCastingSpeed.toFixed(2)} m/min`,
          };
        }

        case "UCH-07E": {
          const score = totalProductWeightTon > 0 ? 92 : 0;
          return {
            ...u,
            live: true,
            holat: totalProductWeightTon > 0 ? "faol" : "toxtagan",
            harorat: 120,
            bosim: u.bosim,
            samaradorlik: score,
            extraLabel: `${totalProductWeightTon.toFixed(1)} t`,
          };
        }

        case "UCH-07F": {
          const score =
            totalProductWeightTon > 0
              ? Math.max(
                  0,
                  Math.min(
                    100,
                    Math.round((totalProductWeightTon / 400) * 100),
                  ),
                )
              : 0;

          return {
            ...u,
            live: true,
            holat: totalProductWeightTon > 0 ? "faol" : "toxtagan",
            harorat: 35,
            bosim: u.bosim,
            samaradorlik: score,
            extraLabel: `${totalProductWeightTon.toFixed(1)} t`,
          };
        }

        default:
          return u;
      }
    })
    .map((u) => {
      if (u.sexId === "SEX-07" && totalDelays > 8 && u.holat === "faol") {
        return {
          ...u,
          holat: "ogohlantirish",
        };
      }
      return u;
    });
}

export async function getUchastkalarHybrid(sexId, params = {}) {
  const fakeRes = await getUchastkalar(sexId);
  const fakeUch = toArray(fakeRes?.data);

  if (sexId !== "SEX-07") {
    return { data: fakeUch };
  }

  try {
    const [eaf, lrf, tsc, vod] = await Promise.all([
      getEAFHeatReport(params),
      getLRFHeatReport(params),
      getTSCHeatReport(params),
      getVODHeatReport(params),
    ]);

    const merged = buildSex07Uchastkalar(fakeUch, { eaf, lrf, tsc, vod });
    return { data: merged };
  } catch (error) {
    console.warn("[HYBRID][UCHASTKA][SEX-07]", error?.message || error);
    return { data: fakeUch };
  }
}

export async function getUskunalarHybrid(
  { sexId, uchastkId } = {},
  params = {},
) {
  const fakeRes = await getUskunalar({ sexId, uchastkId });
  const fakeUsk = toArray(fakeRes?.data);

  if (sexId !== "SEX-07") {
    return { data: fakeUsk };
  }

  try {
    const [lrf, tsc, vod] = await Promise.all([
      getLRFHeatReport(params),
      getTSCHeatReport(params),
      getVODHeatReport(params),
    ]);

    const latestLrf = toArray(lrf).at(-1);
    const latestTsc = toArray(tsc).at(-1);
    const latestVod = toArray(vod).at(-1);

    const lrfTemp = getLastTempFromHeat(latestLrf);
    const tscTemp = getLastTempFromHeat(latestTsc);
    const vodTemp = getLastTempFromHeat(latestVod);

    const merged = fakeUsk.map((u) => {
      if (u.sexId !== "SEX-07") return u;

      let harorat = u.harorat;
      let samaradorlik = u.samaradorlik ?? 0;

      if (u.uchastkId === "UCH-07B") {
        harorat = lrfTemp ?? vodTemp ?? harorat;
        samaradorlik = 90;
      } else if (u.uchastkId === "UCH-07C") {
        harorat = tscTemp ? Math.round(tscTemp * 0.66) : harorat;
        samaradorlik = 88;
      } else if (u.uchastkId === "UCH-07D") {
        harorat = tscTemp ? Math.round(tscTemp * 0.58) : harorat;
        samaradorlik = 91;
      } else if (u.uchastkId === "UCH-07F") {
        harorat = 35;
        samaradorlik = 95;
      }

      return {
        ...u,
        live: true,
        harorat,
        samaradorlik,
      };
    });

    return { data: merged };
  } catch (error) {
    console.warn("[HYBRID][USKUNA][SEX-07]", error?.message || error);
    return { data: fakeUsk };
  }
}

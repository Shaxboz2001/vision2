import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Tabs,
  Tab,
  Divider,
} from "@mui/material";
import { useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { getHaroratGrafik, getIshlabGrafik } from "@/api";
import { SectionHeader } from "@/components/common";

const CT = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <Box
      sx={{
        background: "#0d1220",
        border: "1px solid #1e2a3d",
        p: 1.5,
        borderRadius: 1,
      }}
    >
      <Typography
        sx={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: "0.6rem",
          color: "#6b7280",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      {payload.map((p) => (
        <Typography
          key={p.dataKey}
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.68rem",
            color: p.color,
          }}
        >
          {p.name}: {p.value}
        </Typography>
      ))}
    </Box>
  );
};

const samaradorlikData = [
  { sex: "SEX-01", samaradorlik: 94, plan: 90 },
  { sex: "SEX-02", samaradorlik: 82, plan: 85 },
  { sex: "SEX-03", samaradorlik: 72, plan: 85 },
  { sex: "SEX-04", samaradorlik: 88, plan: 88 },
  { sex: "SEX-05", samaradorlik: 45, plan: 80 },
  { sex: "SEX-06", samaradorlik: 0, plan: 0 },
];

const energiyaData = Array.from({ length: 12 }, (_, i) => ({
  oy: [
    "Yan",
    "Fev",
    "Mar",
    "Apr",
    "May",
    "Iyn",
    "Iyl",
    "Avg",
    "Sen",
    "Okt",
    "Noy",
    "Dek",
  ][i],
  iste_mol: Math.round(2400 + Math.sin(i * 0.6) * 400 + Math.random() * 200),
  tejash: Math.round(200 + Math.random() * 150),
}));

const holatData = [
  { nom: "Faol", qiymat: 38, color: "#00ff9d" },
  { nom: "Ogohlantirish", qiymat: 2, color: "#ffd60a" },
  { nom: "Xato", qiymat: 1, color: "#ff2d55" },
  { nom: "To'xtatildi", qiymat: 1, color: "#374151" },
];

const radarData = [
  { subject: "Harorat", SEX01: 92, SEX02: 88, SEX04: 78 },
  { subject: "Bosim", SEX01: 85, SEX02: 90, SEX04: 75 },
  { subject: "Samaradorlik", SEX01: 94, SEX02: 82, SEX04: 88 },
  { subject: "Energiya", SEX01: 78, SEX02: 82, SEX04: 90 },
  { subject: "Xavfsizlik", SEX01: 95, SEX02: 88, SEX04: 96 },
  { subject: "Sifat", SEX01: 91, SEX02: 84, SEX04: 93 },
];

export default function Analitika() {
  const [tab, setTab] = useState(0);
  const { data: harorat } = useQuery({
    queryKey: ["harorat-grafik"],
    queryFn: getHaroratGrafik,
  });
  const { data: ishlab } = useQuery({
    queryKey: ["ishlab-grafik"],
    queryFn: getIshlabGrafik,
  });

  const hg = (harorat?.data || []).filter((_, i) => i % 3 === 0);
  const ig = ishlab?.data || [];

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography
          sx={{
            fontFamily: "'Orbitron',monospace",
            fontSize: "1.1rem",
            fontWeight: 700,
            letterSpacing: "0.15em",
          }}
        >
          ANALITIKA
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.65rem",
            color: "#6b7280",
          }}
        >
          Ko'rsatkichlar tahlili va grafiklar
        </Typography>
      </Box>

      {/* TABS */}
      <Paper sx={{ p: 0 }}>
        <Tabs
          value={tab}
          onChange={(_, v) => setTab(v)}
          sx={{
            borderBottom: "1px solid #1e2a3d",
            "& .MuiTabs-indicator": { background: "#00d4ff" },
          }}
        >
          {[
            "Ishlab Chiqarish",
            "Harorat",
            "Energiya",
            "Samaradorlik",
            "Bo'linmalarlar Taqqoslash",
          ].map((label, i) => (
            <Tab
              key={i}
              label={label}
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.65rem",
                letterSpacing: "0.1em",
                color: tab === i ? "#00d4ff" : "#6b7280",
                minHeight: 44,
              }}
            />
          ))}
        </Tabs>

        <Box sx={{ p: 2.5 }}>
          {/* ISHLAB CHIQARISH */}
          {tab === 0 && (
            <Grid container spacing={2}>
              <Grid item xs={12} md={8}>
                <Typography
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.65rem",
                    color: "#6b7280",
                    mb: 1.5,
                    letterSpacing: "0.1em",
                  }}
                >
                  HAFTALIK ISHLAB CHIQARISH (TONNADA)
                </Typography>
                <Box sx={{ height: 280 }}>
                  <ResponsiveContainer>
                    <BarChart data={ig}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        stroke="rgba(30,42,61,0.8)"
                      />
                      <XAxis
                        dataKey="kun"
                        tick={{
                          fontFamily: "'Share Tech Mono',monospace",
                          fontSize: 10,
                          fill: "#6b7280",
                        }}
                      />
                      <YAxis
                        tick={{
                          fontFamily: "'Share Tech Mono',monospace",
                          fontSize: 10,
                          fill: "#6b7280",
                        }}
                      />
                      <Tooltip content={<CT />} />
                      <Legend
                        wrapperStyle={{
                          fontFamily: "'Share Tech Mono',monospace",
                          fontSize: "0.65rem",
                        }}
                      />
                      <Bar
                        dataKey="choyan"
                        name="Cho'yan"
                        fill="#ff6b1a"
                        opacity={0.85}
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="polat"
                        name="Po'lat"
                        fill="#00d4ff"
                        opacity={0.85}
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        dataKey="prokat"
                        name="Prokat"
                        fill="#00ff9d"
                        opacity={0.85}
                        radius={[2, 2, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </Grid>
              <Grid item xs={12} md={4}>
                <Typography
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.65rem",
                    color: "#6b7280",
                    mb: 1.5,
                  }}
                >
                  USKUNALAR HOLATI
                </Typography>
                <Box
                  sx={{
                    height: 280,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie
                        data={holatData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="qiymat"
                        paddingAngle={2}
                      >
                        {holatData.map((entry, i) => (
                          <Cell key={i} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(v, n, p) => [v, p.payload.nom]}
                        contentStyle={{
                          background: "#0d1220",
                          border: "1px solid #1e2a3d",
                          fontFamily: "'Share Tech Mono',monospace",
                          fontSize: "0.7rem",
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </Box>
                <Box
                  sx={{
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 1,
                    justifyContent: "center",
                  }}
                >
                  {holatData.map((d) => (
                    <Box
                      key={d.nom}
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: "50%",
                          background: d.color,
                        }}
                      />
                      <Typography
                        sx={{
                          fontFamily: "'Share Tech Mono',monospace",
                          fontSize: "0.6rem",
                          color: "#6b7280",
                        }}
                      >
                        {d.nom} ({d.qiymat})
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Grid>
            </Grid>
          )}

          {/* HARORAT */}
          {tab === 1 && (
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.65rem",
                  color: "#6b7280",
                  mb: 1.5,
                  letterSpacing: "0.1em",
                }}
              >
                24-SOATLIK HARORAT DINAMIKASI
              </Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer>
                  <AreaChart data={hg}>
                    <defs>
                      {[
                        ["domna", "#ff2d55"],
                        ["konverter", "#ff6b1a"],
                        ["pech", "#00d4ff"],
                      ].map(([k, c]) => (
                        <linearGradient
                          key={k}
                          id={`grad_${k}`}
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
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(30,42,61,0.8)"
                    />
                    <XAxis
                      dataKey="soat"
                      tick={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: 9,
                        fill: "#6b7280",
                      }}
                    />
                    <YAxis
                      domain={[1200, 1700]}
                      tick={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: 9,
                        fill: "#6b7280",
                      }}
                    />
                    <Tooltip content={<CT />} />
                    <Legend
                      wrapperStyle={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: "0.65rem",
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="domna"
                      name="Domna"
                      stroke="#ff2d55"
                      fill="url(#grad_domna)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="konverter"
                      name="Konverter"
                      stroke="#ff6b1a"
                      fill="url(#grad_konverter)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="pech"
                      name="Elektr Pech"
                      stroke="#00d4ff"
                      fill="url(#grad_pech)"
                      strokeWidth={2}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}

          {/* ENERGIYA */}
          {tab === 2 && (
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.65rem",
                  color: "#6b7280",
                  mb: 1.5,
                }}
              >
                YILLIK ENERGIYA SARFI (kWh)
              </Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={energiyaData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(30,42,61,0.8)"
                    />
                    <XAxis
                      dataKey="oy"
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
                    <Tooltip content={<CT />} />
                    <Legend
                      wrapperStyle={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: "0.65rem",
                      }}
                    />
                    <Bar
                      dataKey="iste_mol"
                      name="Iste'mol (kWh)"
                      fill="#ff6b1a"
                      opacity={0.85}
                      radius={[2, 2, 0, 0]}
                    />
                    <Bar
                      dataKey="tejash"
                      name="Tejash (kWh)"
                      fill="#00ff9d"
                      opacity={0.85}
                      radius={[2, 2, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}

          {/* SAMARADORLIK */}
          {tab === 3 && (
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.65rem",
                  color: "#6b7280",
                  mb: 1.5,
                }}
              >
                BO'LINMALAR SAMARADORLIGI (HAQIQIY vs PLAN)
              </Typography>
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer>
                  <BarChart data={samaradorlikData} layout="vertical">
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="rgba(30,42,61,0.8)"
                    />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: 9,
                        fill: "#6b7280",
                      }}
                    />
                    <YAxis
                      dataKey="sex"
                      type="category"
                      tick={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: 9,
                        fill: "#6b7280",
                      }}
                      width={60}
                    />
                    <Tooltip content={<CT />} />
                    <Legend
                      wrapperStyle={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: "0.65rem",
                      }}
                    />
                    <Bar
                      dataKey="plan"
                      name="Plan %"
                      fill="rgba(0,212,255,0.2)"
                      radius={[0, 2, 2, 0]}
                    />
                    <Bar
                      dataKey="samaradorlik"
                      name="Haqiqiy %"
                      fill="#00d4ff"
                      opacity={0.85}
                      radius={[0, 2, 2, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}

          {/* RADAR */}
          {tab === 4 && (
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.65rem",
                  color: "#6b7280",
                  mb: 1.5,
                }}
              >
                BO'LINMALAR MULTIDIMENSIONAL TAQQOSLASH
              </Typography>
              <Box sx={{ height: 340 }}>
                <ResponsiveContainer>
                  <RadarChart data={radarData}>
                    <PolarGrid stroke="rgba(30,42,61,0.8)" />
                    <PolarAngleAxis
                      dataKey="subject"
                      tick={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: 10,
                        fill: "#6b7280",
                      }}
                    />
                    <Radar
                      name="SEX-01 Domna"
                      dataKey="SEX01"
                      stroke="#ff2d55"
                      fill="#ff2d55"
                      fillOpacity={0.15}
                    />
                    <Radar
                      name="SEX-02 Konverter"
                      dataKey="SEX02"
                      stroke="#00d4ff"
                      fill="#00d4ff"
                      fillOpacity={0.15}
                    />
                    <Radar
                      name="SEX-04 Prokat"
                      dataKey="SEX04"
                      stroke="#00ff9d"
                      fill="#00ff9d"
                      fillOpacity={0.15}
                    />
                    <Legend
                      wrapperStyle={{
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: "0.65rem",
                      }}
                    />
                    <Tooltip
                      contentStyle={{
                        background: "#0d1220",
                        border: "1px solid #1e2a3d",
                        fontFamily: "'Share Tech Mono',monospace",
                        fontSize: "0.7rem",
                      }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </Box>
            </Box>
          )}
        </Box>
      </Paper>
    </Box>
  );
}

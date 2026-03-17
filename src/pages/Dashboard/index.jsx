import { useQuery } from "@tanstack/react-query";
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
} from "recharts";
import {
  getKpi,
  getSexlar,
  getOgohlantirishlar,
  getHaroratGrafik,
  getIshlabGrafik,
} from "@/api";
import {
  KpiCard,
  StatusChip,
  DarajaChip,
  SectionHeader,
  LiveBadge,
  CardSkeleton,
} from "@/components/common";

const CustomTooltip = ({ active, payload, label }) => {
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
          fontSize: "0.65rem",
          color: "#6b7280",
          mb: 0.5,
        }}
      >
        {label}
      </Typography>
      {payload.map((p) => (
        <Typography
          key={p.name}
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.7rem",
            color: p.color,
          }}
        >
          {p.name}: {p.value}
          {p.name.includes("at") ? "°C" : " t"}
        </Typography>
      ))}
    </Box>
  );
};

export default function Dashboard() {
  const { data: kpi, isLoading: kpiLoad } = useQuery({
    queryKey: ["kpi"],
    queryFn: getKpi,
    refetchInterval: 5000,
  });
  const { data: sexlar, isLoading: sexLoad } = useQuery({
    queryKey: ["sexlar"],
    queryFn: getSexlar,
  });
  const { data: ogoh } = useQuery({
    queryKey: ["ogohlantirishlar"],
    queryFn: getOgohlantirishlar,
  });
  const { data: haroratG } = useQuery({
    queryKey: ["harorat-grafik"],
    queryFn: getHaroratGrafik,
  });
  const { data: ishlabG } = useQuery({
    queryKey: ["ishlab-grafik"],
    queryFn: getIshlabGrafik,
  });

  const k = kpi?.data || {};
  const sx = sexlar?.data || [];
  const og = ogoh?.data || [];
  const hg = haroratG?.data?.filter((_, i) => i % 2 === 0) || [];
  const ig = ishlabG?.data || [];

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* KPI */}
      <Grid container spacing={1.5}>
        {[
          {
            label: "ISHLAB CHIQARISH",
            value: k.ishlab_chiqarish,
            unit: "t",
            trend: "12.4% bugungi kun",
            trendUp: true,
            color: "#ff6b1a",
          },
          {
            label: "FAOL USKUNALAR",
            value: `${k.faol_uskunalar}/${k.jami_uskunalar}`,
            unit: "",
            trend: "90.5% samaradorlik",
            trendUp: true,
            color: "#00d4ff",
          },
          {
            label: "O'RTA HARORAT",
            value: k.orta_harorat,
            unit: "°C",
            trend: "Normal diapazon",
            trendUp: false,
            color: "#ff2d55",
          },
          {
            label: "FAOL DATCHIKLAR",
            value: `${k.faol_datchiklar}/${k.jami_datchiklar}`,
            unit: "",
            trend: "97.9% ishlayapti",
            trendUp: true,
            color: "#00ff9d",
          },
          {
            label: "ENERGIYA SARFI",
            value: k.energiya,
            unit: "kW",
            trend: "3.1% tejash",
            trendUp: false,
            color: "#ffd60a",
          },
        ].map((item) => (
          <Grid item xs={12} sm={6} md={2.4} key={item.label}>
            <KpiCard {...item} loading={kpiLoad} />
          </Grid>
        ))}
      </Grid>

      {/* SEXLAR + OGOHLANTIRISHLAR */}
      <Grid container spacing={2}>
        <Grid item xs={12} lg={8}>
          <Paper>
            <SectionHeader title="Bo'linmalar Holati" action="BARCHASI →">
              <LiveBadge />
            </SectionHeader>
            {sexLoad ? (
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
                  {sx.map((s) => (
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
                            {/* <Typography
                              sx={{
                                fontFamily: "'Share Tech Mono',monospace",
                                fontSize: "0.6rem",
                                color: "#6b7280",
                              }}
                            >
                              {s.id}
                            </Typography> */}
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
                              "& .MuiLinearProgress-bar": {
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
                              minWidth: 30,
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
                              s.harorat > 1400
                                ? "#ff2d55"
                                : s.harorat > 800
                                  ? "#ff6b1a"
                                  : "#6b7280",
                          }}
                        >
                          {s.harorat}°C
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </Paper>
        </Grid>

        {/* OGOHLANTIRISHLAR */}
        <Grid item xs={12} lg={4}>
          <Paper sx={{ height: "100%" }}>
            <SectionHeader
              title="Ogohlantirishlar"
              dot="#ff2d55"
              action="HAMMASI →"
            />
            <Box sx={{ p: 1.5 }}>
              {og.slice(0, 6).map((o) => (
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
                      background:
                        o.daraja === "kritik"
                          ? "#ff2d55"
                          : o.daraja === "ogohlantirish"
                            ? "#ffd60a"
                            : "#00d4ff",
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    <Typography sx={{ fontSize: "0.75rem", mb: 0.3 }}>
                      {o.xabar}
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <DarajaChip daraja={o.daraja} />
                      {/* <Typography
                        sx={{
                          fontFamily: "'Share Tech Mono',monospace",
                          fontSize: "0.58rem",
                          color: "#6b7280",
                        }}
                      >
                        {o.sex}
                      </Typography> */}
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
                    {Math.round((Date.now() - new Date(o.vaqt)) / 60000)}d oldin
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
            <SectionHeader title="24-Soatlik Harorat Grafigi" dot="#ff6b1a">
              <Box sx={{ display: "flex", gap: 2 }}>
                {[
                  ["Domna", "#ff2d55"],
                  ["Konverter", "#ff6b1a"],
                  ["Pech", "#00d4ff"],
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
            <Box sx={{ p: 2, height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={hg}
                  margin={{ top: 5, right: 10, left: -20, bottom: 5 }}
                >
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
                  <Tooltip content={<CustomTooltip />} />
                  <Line
                    dataKey="domna"
                    name="domna"
                    stroke="#ff2d55"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="konverter"
                    name="konverter"
                    stroke="#ff6b1a"
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    dataKey="pech"
                    name="pech"
                    stroke="#00d4ff"
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
            <SectionHeader title="Haftalik Ishlab Chiqarish" dot="#00ff9d" />
            <Box sx={{ p: 2, height: 220 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={ig}
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
                  <Bar
                    dataKey="choyan"
                    name="Armatra"
                    fill="#ff6b1a"
                    opacity={0.8}
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="polat"
                    name="List"
                    fill="#00d4ff"
                    opacity={0.8}
                    radius={[2, 2, 0, 0]}
                  />
                  <Bar
                    dataKey="prokat"
                    name="Zoldir shar"
                    fill="#00ff9d"
                    opacity={0.8}
                    radius={[2, 2, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      {/* ISHLAB CHIQARISH PLANI */}
      <Paper>
        <SectionHeader title="Ishlab Chiqarish Plani (Bugun)" dot="#00d4ff" />
        <Box sx={{ p: 2, display: "flex", gap: 3 }}>
          {[
            {
              nom: "Armatura",
              plan: 900,
              haqiqiy: 847,
              color: "#ff6b1a",
            },
            {
              nom: "List",
              plan: 750,
              haqiqiy: 612,
              color: "#00d4ff",
            },
            {
              nom: "Prokat (Rolled Steel)",
              plan: 600,
              haqiqiy: 420,
              color: "#00ff9d",
            },
            {
              nom: "Qotishma (Alloy)",
              plan: 120,
              haqiqiy: 98,
              color: "#ffd60a",
            },
          ].map((item) => (
            <Box key={item.nom} sx={{ flex: 1 }}>
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
                  {item.haqiqiy} / {item.plan} t
                </Typography>
              </Box>
              <LinearProgress
                variant="determinate"
                value={(item.haqiqiy / item.plan) * 100}
                sx={{
                  height: 6,
                  "& .MuiLinearProgress-bar": { background: item.color },
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
                {Math.round((item.haqiqiy / item.plan) * 100)}% bajarildi
              </Typography>
            </Box>
          ))}
        </Box>
      </Paper>
    </Box>
  );
}

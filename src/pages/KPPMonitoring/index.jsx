import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import DirectionsCarFilledRoundedIcon from "@mui/icons-material/DirectionsCarFilledRounded";
import LoginRoundedIcon from "@mui/icons-material/LoginRounded";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import BadgeRoundedIcon from "@mui/icons-material/BadgeRounded";
import CameraAltRoundedIcon from "@mui/icons-material/CameraAltRounded";
import RefreshRoundedIcon from "@mui/icons-material/RefreshRounded";
import ScaleRoundedIcon from "@mui/icons-material/ScaleRounded";
import PeopleAltRoundedIcon from "@mui/icons-material/PeopleAltRounded";
import DoorSlidingRoundedIcon from "@mui/icons-material/DoorSlidingRounded";
import TrendingUpRoundedIcon from "@mui/icons-material/TrendingUpRounded";
import AnalyticsRoundedIcon from "@mui/icons-material/AnalyticsRounded";

import {
  getEmployeeDetail,
  getEmployeeEvents,
  getEmployees,
  getKppAnalytics,
  getKppCars,
  syncEmployeeEvents,
  syncEmployees,
  syncKppCars,
} from "@/api/kpp";

const TEN_MINUTES = 10 * 60 * 1000;

const isEntry = (text = "") =>
  String(text).toLowerCase().includes("вход") ||
  String(text).toLowerCase().includes("kir");

const isExit = (text = "") =>
  String(text).toLowerCase().includes("выход") ||
  String(text).toLowerCase().includes("chiq");

const fmtTime = (v) =>
  v
    ? new Date(v).toLocaleString("uz-UZ", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const hourOf = (v) => {
  if (!v) return "—";
  return `${String(new Date(v).getHours()).padStart(2, "0")}:00`;
};

const getPhotoSrc = (base64) => {
  if (!base64) return undefined;
  if (base64.startsWith("data:image")) return base64;
  return `data:image/jpeg;base64,${base64}`;
};

const groupCount = (arr, keyFn) => {
  const map = {};
  arr.forEach((item) => {
    const key = keyFn(item) || "Noma’lum";
    map[key] = (map[key] || 0) + 1;
  });

  return Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
};

function StatCard({ title, value, subtitle, icon, color }) {
  const theme = useTheme();

  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        background:
          theme.palette.mode === "dark"
            ? "linear-gradient(135deg, rgba(255,255,255,.08), rgba(255,255,255,.025))"
            : "linear-gradient(135deg, #fff, #f6f8fb)",
      }}
    >
      <Stack direction="row" spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 3,
            display: "grid",
            placeItems: "center",
            color,
            bgcolor: `${color}18`,
          }}
        >
          {icon}
        </Box>

        <Box sx={{ minWidth: 0 }}>
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            {title}
          </Typography>
          <Typography sx={{ fontWeight: 950, fontSize: 25, lineHeight: 1.1 }}>
            {value}
          </Typography>
          <Typography sx={{ color: "text.secondary", fontSize: 12, mt: 0.3 }}>
            {subtitle}
          </Typography>
        </Box>
      </Stack>
    </Paper>
  );
}

function Panel({ title, icon, children, right }) {
  return (
    <Paper
      sx={{
        p: 2,
        height: "100%",
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ mb: 1.5 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          {icon}
          <Typography sx={{ fontWeight: 950, fontSize: 18 }}>
            {title}
          </Typography>
        </Stack>
        {right}
      </Stack>

      {children}
    </Paper>
  );
}

function EventChip({ value }) {
  const entry = isEntry(value);
  const exit = isExit(value);

  return (
    <Chip
      size="small"
      icon={entry ? <LoginRoundedIcon /> : exit ? <LogoutRoundedIcon /> : null}
      label={entry ? "Kirish" : exit ? "Chiqish" : value || "—"}
      color={entry ? "success" : exit ? "warning" : "default"}
      variant="outlined"
      sx={{ fontWeight: 800 }}
    />
  );
}

function CameraBox({ title, subtitle }) {
  return (
    <Paper
      sx={{
        p: 1.5,
        minHeight: 220,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
      }}
    >
      <Box
        sx={{
          height: 150,
          borderRadius: 3,
          bgcolor: "rgba(127,127,127,.12)",
          border: "1px dashed",
          borderColor: "divider",
          display: "grid",
          placeItems: "center",
          mb: 1.2,
          position: "relative",
        }}
      >
        <Chip
          size="small"
          label="ONLINE"
          color="success"
          sx={{ position: "absolute", top: 10, right: 10, fontWeight: 900 }}
        />

        <Stack alignItems="center" spacing={0.5}>
          <CameraAltRoundedIcon
            sx={{ fontSize: 42, color: "text.secondary" }}
          />
          <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
            Kamera stream joyi
          </Typography>
        </Stack>
      </Box>

      <Typography sx={{ fontWeight: 900 }}>{title}</Typography>
      <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
        {subtitle}
      </Typography>
    </Paper>
  );
}

export default function KppMonitoringPage() {
  const theme = useTheme();
  const today = new Date().toISOString().slice(0, 10);

  const [day, setDay] = useState(today);
  const [employeeId, setEmployeeId] = useState("100173");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [carSearch, setCarSearch] = useState("");
  const [selectedKpp, setSelectedKpp] = useState("ALL");
  const [viewMode, setViewMode] = useState("overview");

  const syncQuery = useQuery({
    queryKey: ["kpp-sync", day, employeeId],
    queryFn: async () => {
      return Promise.allSettled([
        syncKppCars(day),
        syncEmployees(),
        employeeId
          ? syncEmployeeEvents({ employee_id: employeeId, day })
          : Promise.resolve(null),
      ]);
    },
    refetchInterval: TEN_MINUTES,
    refetchOnWindowFocus: false,
  });

  const carsQuery = useQuery({
    queryKey: ["kpp-cars-db", day, syncQuery.dataUpdatedAt],
    queryFn: () => getKppCars(day),
    refetchInterval: TEN_MINUTES,
  });

  const analyticsQuery = useQuery({
    queryKey: ["kpp-analytics-db", day, syncQuery.dataUpdatedAt],
    queryFn: () => getKppAnalytics(day),
    refetchInterval: TEN_MINUTES,
  });

  const employeesQuery = useQuery({
    queryKey: ["kpp-employees-db", employeeSearch, syncQuery.dataUpdatedAt],
    queryFn: () => getEmployees({ search: employeeSearch, limit: 300 }),
    refetchInterval: TEN_MINUTES,
  });

  const employeeDetailQuery = useQuery({
    queryKey: ["kpp-employee-detail", employeeId, syncQuery.dataUpdatedAt],
    queryFn: () => getEmployeeDetail(employeeId),
    enabled: Boolean(employeeId),
    refetchInterval: TEN_MINUTES,
  });

  const employeeEventsQuery = useQuery({
    queryKey: [
      "kpp-employee-events-db",
      employeeId,
      day,
      syncQuery.dataUpdatedAt,
    ],
    queryFn: () => getEmployeeEvents({ employee_id: employeeId, day }),
    enabled: Boolean(employeeId),
    refetchInterval: TEN_MINUTES,
  });

  const cars = Array.isArray(carsQuery.data) ? carsQuery.data : [];
  const empEvents = Array.isArray(employeeEventsQuery.data)
    ? employeeEventsQuery.data
    : [];
  const employees = Array.isArray(employeesQuery.data)
    ? employeesQuery.data
    : [];
  const analytics = analyticsQuery.data || {};
  const selectedEmployee = employeeDetailQuery.data;

  const kppOptions = useMemo(() => {
    const names = [...new Set(cars.map((x) => x.kpp).filter(Boolean))];
    return ["ALL", ...names];
  }, [cars]);

  const filteredCars = useMemo(() => {
    return cars.filter((car) => {
      const byKpp = selectedKpp === "ALL" || car.kpp === selectedKpp;
      const bySearch =
        !carSearch ||
        String(car.car_number || "")
          .toLowerCase()
          .includes(carSearch.toLowerCase());

      return byKpp && bySearch;
    });
  }, [cars, selectedKpp, carSearch]);

  const computed = useMemo(() => {
    const carIn = filteredCars.filter((x) => isEntry(x.event));
    const carOut = filteredCars.filter((x) => isExit(x.event));
    const empIn = empEvents.filter((x) => isEntry(x.event));
    const empOut = empEvents.filter((x) => isExit(x.event));

    const uniqueCars = new Set(
      filteredCars.map((x) => x.car_number).filter(Boolean),
    ).size;

    const totalNetto = filteredCars.reduce(
      (acc, x) => acc + Number(x.netto || 0),
      0,
    );

    const hourlyMap = {};

    filteredCars.forEach((x) => {
      const h = hourOf(x.event_time);
      if (!hourlyMap[h]) {
        hourlyMap[h] = { hour: h, carsIn: 0, carsOut: 0, empIn: 0, empOut: 0 };
      }

      if (isEntry(x.event)) hourlyMap[h].carsIn += 1;
      if (isExit(x.event)) hourlyMap[h].carsOut += 1;
    });

    empEvents.forEach((x) => {
      const h = hourOf(x.log_time);
      if (!hourlyMap[h]) {
        hourlyMap[h] = { hour: h, carsIn: 0, carsOut: 0, empIn: 0, empOut: 0 };
      }

      if (isEntry(x.event)) hourlyMap[h].empIn += 1;
      if (isExit(x.event)) hourlyMap[h].empOut += 1;
    });

    return {
      carIn,
      carOut,
      empIn,
      empOut,
      uniqueCars,
      totalNetto,
      avgNetto: filteredCars.length
        ? Math.round(totalNetto / filteredCars.length)
        : 0,
      hourly: Object.values(hourlyMap).sort((a, b) =>
        a.hour.localeCompare(b.hour),
      ),
      topKpp: groupCount(filteredCars, (x) => x.kpp).slice(0, 6),
      topDoor: groupCount(empEvents, (x) => x.door_name).slice(0, 6),
      topCars: groupCount(filteredCars, (x) => x.car_number).slice(0, 8),
      lastCars: [...filteredCars]
        .sort((a, b) => new Date(b.event_time) - new Date(a.event_time))
        .slice(0, 15),
      lastEmployees: [...empEvents]
        .sort((a, b) => new Date(b.log_time) - new Date(a.log_time))
        .slice(0, 15),
    };
  }, [filteredCars, empEvents]);

  const pieData = [
    { name: "Mashina kirish", value: computed.carIn.length },
    { name: "Mashina chiqish", value: computed.carOut.length },
    { name: "Ishchi kirish", value: computed.empIn.length },
    { name: "Ishchi chiqish", value: computed.empOut.length },
  ];

  const pieColors = [
    theme.palette.success.main,
    theme.palette.warning.main,
    theme.palette.primary.main,
    theme.palette.error.main,
  ];

  const isLoading =
    syncQuery.isFetching ||
    carsQuery.isLoading ||
    analyticsQuery.isLoading ||
    employeeEventsQuery.isLoading;

  const manualRefresh = async () => {
    await syncQuery.refetch();
    await Promise.all([
      carsQuery.refetch(),
      analyticsQuery.refetch(),
      employeesQuery.refetch(),
      employeeDetailQuery.refetch(),
      employeeEventsQuery.refetch(),
    ]);
  };

  return (
    <Box sx={{ p: { xs: 1.5, md: 3 } }}>
      <Stack
        direction={{ xs: "column", xl: "row" }}
        alignItems={{ xs: "stretch", xl: "center" }}
        justifyContent="space-between"
        spacing={2}
        sx={{ mb: 2.5 }}
      >
        <Box>
          <Typography sx={{ fontSize: 30, fontWeight: 950, lineHeight: 1.1 }}>
            KPP Analytics Dashboard
          </Typography>
          <Typography sx={{ color: "text.secondary", mt: 0.5 }}>
            Mashinalar · Xodimlar · KPP postlar · Kamera nazorati · 10 minutda
            auto refresh
          </Typography>
        </Box>

        <Stack direction={{ xs: "column", md: "row" }} spacing={1}>
          <TextField
            size="small"
            type="date"
            label="Sana"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            size="small"
            select
            label="KPP"
            value={selectedKpp}
            onChange={(e) => setSelectedKpp(e.target.value)}
            sx={{ minWidth: 190 }}
          >
            {kppOptions.map((item) => (
              <MenuItem key={item} value={item}>
                {item === "ALL" ? "Barcha KPP" : item}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            size="small"
            label="Avto raqam"
            value={carSearch}
            onChange={(e) => setCarSearch(e.target.value)}
            placeholder="70C018GB"
          />

          <TextField
            size="small"
            label="Tabель / ID"
            value={employeeId}
            onChange={(e) => setEmployeeId(e.target.value)}
            placeholder="100173"
          />

          <Button
            variant="contained"
            startIcon={<RefreshRoundedIcon />}
            onClick={manualRefresh}
            disabled={isLoading}
          >
            Yangilash
          </Button>
        </Stack>
      </Stack>

      {isLoading && <LinearProgress sx={{ mb: 2, borderRadius: 2 }} />}

      <Paper
        sx={{
          p: 1,
          mb: 2,
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
        }}
      >
        <ToggleButtonGroup
          exclusive
          size="small"
          value={viewMode}
          onChange={(_, v) => v && setViewMode(v)}
          sx={{
            flexWrap: "wrap",
            "& .MuiToggleButton-root": {
              px: 2,
              fontWeight: 800,
              borderRadius: "12px !important",
              m: 0.3,
            },
          }}
        >
          <ToggleButton value="overview">Umumiy</ToggleButton>
          <ToggleButton value="cars">Mashinalar</ToggleButton>
          <ToggleButton value="employees">Xodimlar</ToggleButton>
          <ToggleButton value="cameras">Kameralar</ToggleButton>
        </ToggleButtonGroup>
      </Paper>

      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Mashina kirish"
            value={computed.carIn.length}
            subtitle={`Unikal mashina: ${computed.uniqueCars}`}
            color="#00a85a"
            icon={<DirectionsCarFilledRoundedIcon />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Mashina chiqish"
            value={computed.carOut.length}
            subtitle={`Balans: ${computed.carIn.length - computed.carOut.length}`}
            color="#f59e0b"
            icon={<LogoutRoundedIcon />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Umumiy netto"
            value={`${Math.round(computed.totalNetto / 1000).toLocaleString("uz-UZ")} t`}
            subtitle={`O‘rtacha: ${computed.avgNetto.toLocaleString("uz-UZ")} kg`}
            color="#2563eb"
            icon={<ScaleRoundedIcon />}
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Xodim harakati"
            value={computed.empIn.length + computed.empOut.length}
            subtitle={`Kirish: ${computed.empIn.length} · Chiqish: ${computed.empOut.length}`}
            color="#dc2626"
            icon={<PeopleAltRoundedIcon />}
          />
        </Grid>
      </Grid>

      {(viewMode === "overview" || viewMode === "cars") && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} lg={8}>
            <Panel
              title="Soatbay kirish/chiqish dinamikasi"
              icon={<TrendingUpRoundedIcon color="primary" />}
            >
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={computed.hourly}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis dataKey="hour" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="carsIn"
                      name="Mashina kirish"
                      stroke={theme.palette.success.main}
                      fill={theme.palette.success.main}
                      fillOpacity={0.14}
                    />
                    <Area
                      type="monotone"
                      dataKey="carsOut"
                      name="Mashina chiqish"
                      stroke={theme.palette.warning.main}
                      fill={theme.palette.warning.main}
                      fillOpacity={0.12}
                    />
                    <Area
                      type="monotone"
                      dataKey="empIn"
                      name="Xodim kirish"
                      stroke={theme.palette.primary.main}
                      fill={theme.palette.primary.main}
                      fillOpacity={0.1}
                    />
                    <Area
                      type="monotone"
                      dataKey="empOut"
                      name="Xodim chiqish"
                      stroke={theme.palette.error.main}
                      fill={theme.palette.error.main}
                      fillOpacity={0.08}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </Box>
            </Panel>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Panel
              title="Kirish/chiqish ulushi"
              icon={<DoorSlidingRoundedIcon color="primary" />}
            >
              <Box sx={{ height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={70}
                      outerRadius={110}
                      paddingAngle={3}
                    >
                      {pieData.map((_, index) => (
                        <Cell
                          key={index}
                          fill={pieColors[index % pieColors.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Panel>
          </Grid>
        </Grid>
      )}

      {viewMode === "overview" && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={4}>
            <Panel
              title="Top KPP postlar"
              icon={<AnalyticsRoundedIcon color="primary" />}
            >
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={computed.topKpp} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={140} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      name="Soni"
                      fill={theme.palette.primary.main}
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Panel>
          </Grid>

          <Grid item xs={12} md={4}>
            <Panel
              title="Top turniketlar"
              icon={<BadgeRoundedIcon color="primary" />}
            >
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={computed.topDoor} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={150} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      name="Soni"
                      fill={theme.palette.success.main}
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Panel>
          </Grid>

          <Grid item xs={12} md={4}>
            <Panel
              title="Top avtomobillar"
              icon={<DirectionsCarFilledRoundedIcon color="primary" />}
            >
              <Box sx={{ height: 260 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={computed.topCars} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" opacity={0.25} />
                    <XAxis type="number" allowDecimals={false} />
                    <YAxis type="category" dataKey="name" width={95} />
                    <Tooltip />
                    <Bar
                      dataKey="value"
                      name="Soni"
                      fill={theme.palette.warning.main}
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </Box>
            </Panel>
          </Grid>
        </Grid>
      )}

      {(viewMode === "overview" || viewMode === "cars") && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12}>
            <Panel
              title="Mashinalar kirish/chiqish jadvali"
              icon={<DirectionsCarFilledRoundedIcon color="primary" />}
              right={
                <Chip
                  label={`${filteredCars.length} ta yozuv`}
                  color="primary"
                  variant="outlined"
                  sx={{ fontWeight: 800 }}
                />
              }
            >
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Holat</TableCell>
                    <TableCell>Vaqt</TableCell>
                    <TableCell>Avto raqam</TableCell>
                    <TableCell>KPP</TableCell>
                    <TableCell align="right">Netto</TableCell>
                  </TableRow>
                </TableHead>

                <TableBody>
                  {computed.lastCars.map((row) => (
                    <TableRow key={row.id} hover>
                      <TableCell>
                        <EventChip value={row.event} />
                      </TableCell>
                      <TableCell>{fmtTime(row.event_time)}</TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={row.car_number || "—"}
                          sx={{ fontWeight: 900, letterSpacing: ".08em" }}
                        />
                      </TableCell>
                      <TableCell>{row.kpp || "—"}</TableCell>
                      <TableCell align="right">
                        {Number(row.netto || 0).toLocaleString("uz-UZ")} kg
                      </TableCell>
                    </TableRow>
                  ))}

                  {!computed.lastCars.length && (
                    <TableRow>
                      <TableCell colSpan={5} align="center">
                        Ma’lumot topilmadi
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </Panel>
          </Grid>
        </Grid>
      )}

      {(viewMode === "overview" || viewMode === "employees") && (
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} lg={4}>
            <Panel
              title="Tanlangan xodim"
              icon={<BadgeRoundedIcon color="primary" />}
            >
              <Stack direction="row" spacing={1.4} alignItems="center">
                <Avatar
                  src={getPhotoSrc(selectedEmployee?.photo_base64)}
                  sx={{ width: 72, height: 72 }}
                >
                  {selectedEmployee?.full_name?.[0] || "I"}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography sx={{ fontWeight: 950 }}>
                    {selectedEmployee?.full_name ||
                      computed.lastEmployees[0]?.employee_name ||
                      "Xodim tanlanmagan"}
                  </Typography>
                  <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                    ID: {employeeId}
                  </Typography>
                </Box>
              </Stack>

              <Divider sx={{ my: 2 }} />

              <Stack spacing={1}>
                {computed.lastEmployees.map((row) => (
                  <Paper
                    key={row.id}
                    variant="outlined"
                    sx={{ p: 1.3, borderRadius: 3 }}
                  >
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      spacing={1}
                    >
                      <EventChip value={row.event} />
                      <Typography
                        sx={{ fontSize: 12, color: "text.secondary" }}
                      >
                        № {row.number || "—"}
                      </Typography>
                    </Stack>

                    <Typography sx={{ fontWeight: 850, mt: 1 }}>
                      {fmtTime(row.log_time)}
                    </Typography>

                    <Typography sx={{ color: "text.secondary", fontSize: 13 }}>
                      {row.door_name || "—"}
                    </Typography>
                  </Paper>
                ))}

                {!computed.lastEmployees.length && (
                  <Typography
                    sx={{ color: "text.secondary", textAlign: "center", py: 2 }}
                  >
                    Bu xodim bo‘yicha ma’lumot yo‘q
                  </Typography>
                )}
              </Stack>
            </Panel>
          </Grid>

          <Grid item xs={12} lg={8}>
            <Panel
              title="Xodimlar bazasi"
              icon={<PeopleAltRoundedIcon color="primary" />}
              right={
                <Chip
                  label={`${employees.length} xodim`}
                  variant="outlined"
                  color="primary"
                  sx={{ fontWeight: 800 }}
                />
              }
            >
              <Stack
                direction={{ xs: "column", md: "row" }}
                spacing={1}
                sx={{ mb: 2 }}
              >
                <TextField
                  size="small"
                  label="Xodim qidirish"
                  placeholder="Familiya yoki tabel raqam"
                  value={employeeSearch}
                  onChange={(e) => setEmployeeSearch(e.target.value)}
                  sx={{ maxWidth: 420 }}
                />
              </Stack>

              <Grid container spacing={1.5}>
                {employees.slice(0, 16).map((emp) => (
                  <Grid item xs={12} sm={6} md={4} key={emp.id}>
                    <Paper
                      variant="outlined"
                      onClick={() => setEmployeeId(emp.tab_number)}
                      sx={{
                        p: 1.3,
                        borderRadius: 3,
                        cursor: "pointer",
                        transition: ".2s",
                        borderColor:
                          String(emp.tab_number) === String(employeeId)
                            ? "primary.main"
                            : "divider",
                        "&:hover": {
                          borderColor: "primary.main",
                          transform: "translateY(-2px)",
                        },
                      }}
                    >
                      <Stack direction="row" spacing={1.2} alignItems="center">
                        <Avatar src={getPhotoSrc(emp.photo_base64)}>
                          {emp.full_name?.[0] || "I"}
                        </Avatar>
                        <Box sx={{ minWidth: 0 }}>
                          <Typography noWrap sx={{ fontWeight: 850 }}>
                            {emp.full_name}
                          </Typography>
                          <Typography
                            sx={{ color: "text.secondary", fontSize: 12 }}
                          >
                            Tabel: {emp.tab_number}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}

                {!employees.length && (
                  <Grid item xs={12}>
                    <Typography
                      sx={{
                        textAlign: "center",
                        py: 4,
                        color: "text.secondary",
                      }}
                    >
                      Xodim topilmadi
                    </Typography>
                  </Grid>
                )}
              </Grid>
            </Panel>
          </Grid>
        </Grid>
      )}

      {(viewMode === "overview" || viewMode === "cameras") && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Panel
              title="KPP kameralar"
              icon={<CameraAltRoundedIcon color="primary" />}
            >
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <CameraBox
                    title="KPP-6 Avtoves"
                    subtitle="Mashina raqami, vazn va kirish/chiqish nazorati"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <CameraBox
                    title="Emal turniket"
                    subtitle="Xodimlar SKUD kirish/chiqish nazorati"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <CameraBox
                    title="Umumiy KPP hudud"
                    subtitle="Hududiy xavfsizlik va kamera monitoring"
                  />
                </Grid>
              </Grid>
            </Panel>
          </Grid>
        </Grid>
      )}
    </Box>
  );
}

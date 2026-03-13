import { useQuery } from "@tanstack/react-query";
import { useDispatch, useSelector } from "react-redux";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  LinearProgress,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import GridViewIcon from "@mui/icons-material/GridView";
import ListIcon from "@mui/icons-material/List";
import { getDatchiklar, getSexlar } from "@/api";
import { StatusChip, SectionHeader, CardSkeleton } from "@/components/common";
import { setDatchikFilter, setViewMode } from "@/store";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material";

const turIcons = {
  harorat: "🌡",
  bosim: "💨",
  gaz: "⛽",
  quvvat: "⚡",
  oqim: "🌊",
  tebranish: "📳",
};
const turColors = {
  harorat: "#ff2d55",
  bosim: "#ff6b1a",
  gaz: "#ffd60a",
  quvvat: "#00d4ff",
  oqim: "#00ff9d",
  tebranish: "#a78bfa",
};

function DatchikCard({ d, isDark }) {
  const color = turColors[d.tur] || "#00d4ff";
  const pct =
    d.qiymat !== null ? Math.min(100, (d.qiymat / d.chegara) * 100) : 0;
  const isAlert = d.holat === "xato" || d.holat === "ogohlantirish";

  return (
    <Box
      sx={{
        background: !isDark ? "#fff" : "#0a0e1a",
        border: `1px solid ${isAlert ? (d.holat === "xato" ? "rgba(255,45,85,0.4)" : "rgba(255,214,10,0.3)") : "#1e2a3d"}`,
        borderRadius: 1,
        p: 1.5,
        cursor: "pointer",
        transition: "all 0.2s",
        "&:hover": {
          borderColor: `rgba(${color === "#ff2d55" ? "255,45,85" : "0,212,255"},0.3)`,
          transform: "translateY(-1px)",
        },
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.55rem",
            color: "#6b7280",
            letterSpacing: "0.1em",
          }}
        >
          {turIcons[d.tur]} {d.id}
        </Typography>
        <StatusChip holat={d.holat} />
      </Box>
      <Typography sx={{ fontWeight: 600, fontSize: "0.8rem", mb: 0.8 }}>
        {d.nom}
      </Typography>
      <Box sx={{ display: "flex", alignItems: "baseline", gap: 0.5, mb: 0.8 }}>
        <Typography
          sx={{
            fontFamily: "'Orbitron',monospace",
            fontSize: "1.4rem",
            fontWeight: 700,
            color: d.holat === "xato" ? "#ff2d55" : color,
          }}
        >
          {d.qiymat !== null ? d.qiymat : "—"}
        </Typography>
        <Typography sx={{ color: "#6b7280", fontSize: "0.7rem" }}>
          {d.birlik}
        </Typography>
      </Box>
      <Box sx={{ mb: 0.8 }}>
        <LinearProgress
          variant="determinate"
          value={pct}
          sx={{
            "& .MuiLinearProgress-bar": {
              background: pct > 95 ? "#ff2d55" : pct > 80 ? "#ffd60a" : color,
            },
          }}
        />
      </Box>
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.55rem",
            color: "#6b7280",
          }}
        >
          {d.sexId}
        </Typography>
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.55rem",
            color: "#6b7280",
          }}
        >
          Chegara: {d.chegara} {d.birlik}
        </Typography>
      </Box>
    </Box>
  );
}

export default function Datchiklar() {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const dispatch = useDispatch();
  const filter = useSelector((s) => s.datchiklar.filter);
  const viewMode = useSelector((s) => s.datchiklar.viewMode);

  const { data: sexlar } = useQuery({
    queryKey: ["sexlar"],
    queryFn: getSexlar,
  });
  const { data, isLoading } = useQuery({
    queryKey: ["datchiklar", filter],
    queryFn: () =>
      getDatchiklar({
        sexId: filter.sexId || undefined,
        tur: filter.tur || undefined,
      }),
    refetchInterval: 3000,
  });

  const datchiklar = data?.data || [];
  const sx = sexlar?.data || [];

  const columns = [
    {
      field: "id",
      headerName: "ID",
      width: 110,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.7rem",
            color: "#ff6b1a",
          }}
        >
          {p.value}
        </Typography>
      ),
    },
    { field: "nom", headerName: "NOMI", width: 140 },
    {
      field: "tur",
      headerName: "TURI",
      width: 100,
      renderCell: (p) => (
        <Typography
          sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: "0.7rem" }}
        >
          {turIcons[p.value]} {p.value}
        </Typography>
      ),
    },
    { field: "sexId", headerName: "SEX", width: 80 },
    {
      field: "holat",
      headerName: "HOLAT",
      width: 130,
      renderCell: (p) => <StatusChip holat={p.value} />,
    },
    {
      field: "qiymat",
      headerName: "QIYMAT",
      width: 100,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.75rem",
            color:
              p.row.holat === "xato"
                ? "#ff2d55"
                : turColors[p.row.tur] || "#e8eaf0",
          }}
        >
          {p.value !== null ? `${p.value} ${p.row.birlik}` : "—"}
        </Typography>
      ),
    },
    {
      field: "chegara",
      headerName: "CHEGARA",
      width: 100,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.7rem",
            color: "#6b7280",
          }}
        >
          {p.value} {p.row.birlik}
        </Typography>
      ),
    },
    {
      field: "uchastkId",
      headerName: "UCHASTKA",
      width: 120,
      renderCell: (p) => (
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.65rem",
            color: "#6b7280",
          }}
        >
          {p.value}
        </Typography>
      ),
    },
  ];

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      <Box
        sx={{
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 1,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'Orbitron',monospace",
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
            }}
          >
            DATCHIKLAR
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.65rem",
              color: "#6b7280",
            }}
          >
            Jonli monitoring · {datchiklar.length} datchik · Har 3 soniyada
            yangilanadi
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.7rem",
              }}
            >
              SEX
            </InputLabel>
            <Select
              value={filter.sexId || ""}
              onChange={(e) =>
                dispatch(setDatchikFilter({ sexId: e.target.value }))
              }
              label="SEX"
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.75rem",
              }}
            >
              <MenuItem value="">
                <em>Barchasi</em>
              </MenuItem>
              {sx.map((s) => (
                <MenuItem
                  key={s.id}
                  value={s.id}
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  {s.id}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <InputLabel
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.7rem",
              }}
            >
              TURI
            </InputLabel>
            <Select
              value={filter.tur || ""}
              onChange={(e) =>
                dispatch(setDatchikFilter({ tur: e.target.value }))
              }
              label="TURI"
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.75rem",
              }}
            >
              <MenuItem value="">
                <em>Barchasi</em>
              </MenuItem>
              {Object.entries(turIcons).map(([k, v]) => (
                <MenuItem
                  key={k}
                  value={k}
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.75rem",
                  }}
                >
                  {v} {k}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={(_, v) => v && dispatch(setViewMode(v))}
            size="small"
          >
            <ToggleButton value="grid">
              <GridViewIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
            <ToggleButton value="list">
              <ListIcon sx={{ fontSize: 16 }} />
            </ToggleButton>
          </ToggleButtonGroup>
        </Box>
      </Box>

      {/* STATS */}
      <Grid container spacing={1.5}>
        {Object.entries(turIcons).map(([tur, icon]) => {
          const count = datchiklar.filter((d) => d.tur === tur).length;
          const alerts = datchiklar.filter(
            (d) =>
              d.tur === tur &&
              (d.holat === "xato" || d.holat === "ogohlantirish"),
          ).length;
          return (
            <Grid item xs={6} sm={4} md={2} key={tur}>
              <Paper
                sx={{
                  p: 1.5,
                  textAlign: "center",
                  cursor: "pointer",
                  borderColor:
                    filter.tur === tur ? "rgba(0,212,255,0.4)" : "#1e2a3d",
                  "&:hover": { borderColor: "rgba(0,212,255,0.25)" },
                }}
                onClick={() =>
                  dispatch(
                    setDatchikFilter({ tur: filter.tur === tur ? "" : tur }),
                  )
                }
              >
                <Typography sx={{ fontSize: 22, mb: 0.5 }}>{icon}</Typography>
                <Typography
                  sx={{
                    fontFamily: "'Orbitron',monospace",
                    fontSize: "1.2rem",
                    fontWeight: 700,
                    color: turColors[tur],
                  }}
                >
                  {count}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.55rem",
                    color: "#6b7280",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                  }}
                >
                  {tur}
                </Typography>
                {alerts > 0 && (
                  <Typography
                    sx={{
                      fontFamily: "'Share Tech Mono',monospace",
                      fontSize: "0.55rem",
                      color: "#ff2d55",
                      mt: 0.3,
                    }}
                  >
                    ⚠ {alerts} ogohlantirish
                  </Typography>
                )}
              </Paper>
            </Grid>
          );
        })}
      </Grid>

      {viewMode === "grid" ? (
        <Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              mb: 1.5,
            }}
          >
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.65rem",
                color: "#6b7280",
              }}
            >
              {datchiklar.length} ta datchik ko'rsatilmoqda
            </Typography>
          </Box>
          {isLoading ? (
            <CardSkeleton />
          ) : (
            <Grid container spacing={1.5}>
              {datchiklar.map((d) => (
                <Grid item xs={12} sm={6} md={4} lg={3} key={d.id}>
                  <DatchikCard d={d} isDark={isDark} />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      ) : (
        <Paper>
          <SectionHeader
            title="Datchiklar Ro'yxati"
            action={`${datchiklar.length} ta`}
          />
          <Box sx={{ height: 550 }}>
            {isLoading ? (
              <CardSkeleton rows={10} />
            ) : (
              <DataGrid
                rows={datchiklar}
                columns={columns}
                pageSize={15}
                rowsPerPageOptions={[15]}
                disableSelectionOnClick
                sx={{ border: "none" }}
              />
            )}
          </Box>
        </Paper>
      )}
    </Box>
  );
}

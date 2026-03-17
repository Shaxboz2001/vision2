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
  Chip,
  Divider,
  Button,
  Alert,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import { getOgohlantirishlar } from "@/api";
import {
  DarajaChip,
  StatusChip,
  SectionHeader,
  CardSkeleton,
} from "@/components/common";
import { setFilter, clearFilter } from "@/store";

const darajaBorder = {
  kritik: "#ff2d55",
  ogohlantirish: "#ffd60a",
  axborot: "#00d4ff",
};
const darajaBg = {
  kritik: "rgba(255,45,85,0.05)",
  ogohlantirish: "rgba(255,214,10,0.03)",
  axborot: "rgba(0,212,255,0.03)",
};

function OgohlanirishCard({ o }) {
  const ago = Math.round((Date.now() - new Date(o.vaqt)) / 60000);
  const agoText =
    ago < 60 ? `${ago} daqiqa oldin` : `${Math.round(ago / 60)} soat oldin`;

  return (
    <Box
      sx={{
        display: "flex",
        gap: 1.5,
        background: darajaBg[o.daraja] || "transparent",
        border: `1px solid ${darajaBorder[o.daraja] ? darajaBorder[o.daraja] + "33" : "#1e2a3d"}`,
        borderLeft: `3px solid ${darajaBorder[o.daraja] || "#374151"}`,
        borderRadius: 1,
        p: 1.5,
        mb: 1,
        animation:
          o.daraja === "kritik" ? "pulse 2s ease-in-out infinite" : "none",
        "@keyframes pulse": {
          "0%,100%": { boxShadow: "none" },
          "50%": { boxShadow: "0 0 12px rgba(255,45,85,0.15)" },
        },
      }}
    >
      <Box sx={{ flex: 1 }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 0.5,
            flexWrap: "wrap",
          }}
        >
          <DarajaChip daraja={o.daraja} />
          <StatusChip holat={o.holat} />
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.6rem",
              color: "#6b7280",
              ml: "auto",
            }}
          >
            {agoText}
          </Typography>
        </Box>
        <Typography sx={{ fontWeight: 600, fontSize: "0.88rem", mb: 0.5 }}>
          {o.xabar}
        </Typography>
        <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
          {/* <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.62rem",
              color: "#ff6b1a",
            }}
          >
            {o.sex}
          </Typography> */}
          {/* {o.uchastka && (
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.62rem",
                color: "#6b7280",
              }}
            >
              {o.uchastka}
            </Typography>
          )} */}
          {/* {o.uskuna && (
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.62rem",
                color: "#6b7280",
              }}
            >
              {o.uskuna}
            </Typography>
          )} */}
          {o.operator && (
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.62rem",
                color: "#00ff9d",
              }}
            >
              👤 {o.operator}
            </Typography>
          )}
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 0.5,
          flexShrink: 0,
        }}
      >
        <Button
          size="small"
          variant="outlined"
          sx={{
            fontSize: "0.6rem",
            fontFamily: "'Share Tech Mono',monospace",
            py: 0.3,
            px: 1,
            minWidth: "auto",
            borderRadius: 1,
            borderColor: "rgba(0,212,255,0.3)",
            color: "#00d4ff",
          }}
        >
          KO'RIB CHIQISH
        </Button>
        {o.holat === "ochiq" && (
          <Button
            size="small"
            variant="outlined"
            color="error"
            sx={{
              fontSize: "0.6rem",
              fontFamily: "'Share Tech Mono',monospace",
              py: 0.3,
              px: 1,
              minWidth: "auto",
              borderRadius: 1,
            }}
          >
            YOPISH
          </Button>
        )}
      </Box>
    </Box>
  );
}

export default function Ogohlantirishlar() {
  const dispatch = useDispatch();
  const filter = useSelector((s) => s.ogohlantirishlar.filter);

  const { data, isLoading } = useQuery({
    queryKey: ["ogohlantirishlar", filter],
    queryFn: () =>
      getOgohlantirishlar({
        daraja: filter.daraja || undefined,
        holat: filter.holat || undefined,
      }),
    refetchInterval: 5000,
  });

  const ogoh = data?.data || [];
  const kritik = ogoh.filter((o) => o.daraja === "kritik");
  const ogohlantirish = ogoh.filter((o) => o.daraja === "ogohlantirish");
  const axborot = ogoh.filter((o) => o.daraja === "axborot");

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
            OGOHLANTIRISHLAR
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.65rem",
              color: "#6b7280",
            }}
          >
            Barcha ogohlantirishlar · Har 5 soniyada yangilanadi
          </Typography>
        </Box>
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.7rem",
              }}
            >
              DARAJA
            </InputLabel>
            <Select
              value={filter.daraja || ""}
              onChange={(e) => dispatch(setFilter({ daraja: e.target.value }))}
              label="DARAJA"
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.75rem",
              }}
            >
              <MenuItem value="">Barchasi</MenuItem>
              <MenuItem value="kritik">Kritik</MenuItem>
              <MenuItem value="ogohlantirish">Ogohlantirish</MenuItem>
              <MenuItem value="axborot">Axborot</MenuItem>
            </Select>
          </FormControl>
          <FormControl size="small" sx={{ minWidth: 130 }}>
            <InputLabel
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.7rem",
              }}
            >
              HOLAT
            </InputLabel>
            <Select
              value={filter.holat || ""}
              onChange={(e) => dispatch(setFilter({ holat: e.target.value }))}
              label="HOLAT"
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.75rem",
              }}
            >
              <MenuItem value="">Barchasi</MenuItem>
              <MenuItem value="ochiq">Ochiq</MenuItem>
              <MenuItem value="ko'rib chiqilmoqda">Ko'rib chiqilmoqda</MenuItem>
              <MenuItem value="yopiq">Yopiq</MenuItem>
            </Select>
          </FormControl>
          {(filter.daraja || filter.holat) && (
            <Button
              size="small"
              onClick={() => dispatch(clearFilter())}
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.65rem",
                color: "#6b7280",
              }}
            >
              TOZALASH ✕
            </Button>
          )}
        </Box>
      </Box>

      {/* STATS */}
      <Grid container spacing={1.5}>
        {[
          { l: "KRITIK", v: kritik.length, c: "#ff2d55", icon: "🚨" },
          {
            l: "OGOHLANTIRISH",
            v: ogohlantirish.length,
            c: "#ffd60a",
            icon: "⚠️",
          },
          { l: "AXBOROT", v: axborot.length, c: "#00d4ff", icon: "ℹ️" },
          {
            l: "OCHIQ",
            v: ogoh.filter((o) => o.holat === "ochiq").length,
            c: "#ff6b1a",
            icon: "◉",
          },
          {
            l: "KO'RIB CHIQILMOQDA",
            v: ogoh.filter((o) => o.holat === "ko'rib chiqilmoqda").length,
            c: "#00ff9d",
            icon: "↻",
          },
          {
            l: "YOPILGAN",
            v: ogoh.filter((o) => o.holat === "yopiq").length,
            c: "#6b7280",
            icon: "✓",
          },
        ].map((s) => (
          <Grid item xs={6} sm={4} md={2} key={s.l}>
            <Paper sx={{ p: 1.5, textAlign: "center" }}>
              <Typography sx={{ fontSize: 18, mb: 0.3 }}>{s.icon}</Typography>
              <Typography
                sx={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: "1.5rem",
                  fontWeight: 700,
                  color: s.c,
                }}
              >
                {s.v}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.55rem",
                  color: "#6b7280",
                  letterSpacing: "0.08em",
                }}
              >
                {s.l}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* CRITICAL ALERTS BANNER */}
      {kritik.length > 0 && !filter.daraja && (
        <Box
          sx={{
            background: "rgba(255,45,85,0.08)",
            border: "1px solid rgba(255,45,85,0.3)",
            borderRadius: 1,
            p: 1.5,
            display: "flex",
            alignItems: "center",
            gap: 1.5,
          }}
        >
          <NotificationsActiveIcon
            sx={{
              color: "#ff2d55",
              animation: "shake 0.5s infinite",
              "@keyframes shake": {
                "0%,100%": { transform: "rotate(0deg)" },
                "25%": { transform: "rotate(-10deg)" },
                "75%": { transform: "rotate(10deg)" },
              },
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.72rem",
              color: "#ff2d55",
              letterSpacing: "0.1em",
            }}
          >
            ⚠ {kritik.length} TA KRITIK OGOHLANTIRISH DARHOL DIQQAT TALAB QILADI
          </Typography>
        </Box>
      )}

      {isLoading ? (
        <CardSkeleton />
      ) : (
        <Grid container spacing={2}>
          {/* KRITIK */}
          {(!filter.daraja || filter.daraja === "kritik") &&
            kritik.length > 0 && (
              <Grid item xs={12}>
                <Paper>
                  <SectionHeader
                    title={`Kritik (${kritik.length})`}
                    dot="#ff2d55"
                  />
                  <Box sx={{ p: 1.5 }}>
                    {kritik.map((o) => (
                      <OgohlanirishCard key={o.id} o={o} />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}

          {/* OGOHLANTIRISH */}
          {(!filter.daraja || filter.daraja === "ogohlantirish") &&
            ogohlantirish.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper>
                  <SectionHeader
                    title={`Ogohlantirishlar (${ogohlantirish.length})`}
                    dot="#ffd60a"
                  />
                  <Box sx={{ p: 1.5 }}>
                    {ogohlantirish.map((o) => (
                      <OgohlanirishCard key={o.id} o={o} />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}

          {/* AXBOROT */}
          {(!filter.daraja || filter.daraja === "axborot") &&
            axborot.length > 0 && (
              <Grid item xs={12} md={6}>
                <Paper>
                  <SectionHeader
                    title={`Axborot (${axborot.length})`}
                    dot="#00d4ff"
                  />
                  <Box sx={{ p: 1.5 }}>
                    {axborot.map((o) => (
                      <OgohlanirishCard key={o.id} o={o} />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            )}

          {ogoh.length === 0 && (
            <Grid item xs={12}>
              <Paper sx={{ p: 4, textAlign: "center" }}>
                <Typography
                  sx={{
                    fontFamily: "'Share Tech Mono',monospace",
                    fontSize: "0.75rem",
                    color: "#6b7280",
                  }}
                >
                  ✓ Hech qanday ogohlantirish yo'q
                </Typography>
              </Paper>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
}

// ═══════════════════════════════════════════════════════════════
//  USKUNA KARTA — PNG rasm bilan (SVG diagram o'rniga)
//  index__5_.jsx dagi UskunaCard ni shu bilan almashtiring
// ═══════════════════════════════════════════════════════════════
import {
  Box,
  Typography,
  Chip,
  Grid,
  LinearProgress,
  useTheme,
} from "@mui/material";
import { StatusChip } from "@/components/common";
import { getUskunaImage, getHolatColor } from "./UskunaImageMap";

const TUR_COLOR = {
  Pech: "#ff6b1a",
  Konverter: "#00d4ff",
  "Elektr Pech": "#a78bfa",
  Prokat: "#00e676",
  Nasos: "#29b6f6",
  Kran: "#ffd60a",
  Kesish: "#ff5252",
};

export default function UskunaCard({ u, onClick }) {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const c = TUR_COLOR[u.tur] || "#6b7280";
  const hc = getHolatColor(u.holat);
  const samColor =
    u.samaradorlik > 80
      ? "#00e676"
      : u.samaradorlik > 50
        ? "#ffd60a"
        : "#ff2d55";
  const borderC =
    u.holat === "xato"
      ? "#ff2d5555"
      : u.holat === "ogohlantirish"
        ? "#ffd60a44"
        : "divider";

  const imageSrc = getUskunaImage(u);

  return (
    <Box
      onClick={() => onClick(u)}
      sx={{
        background: isDark ? "#0d1220" : "#fff",
        border: "1px solid",
        borderColor: borderC,
        borderTop: `2px solid ${c}`,
        borderRadius: 1,
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.22s",
        "&:hover": {
          transform: "translateY(-3px)",
          boxShadow: `0 8px 28px ${c}22`,
          borderColor: `${c}55`,
        },
      }}
    >
      {/* IMAGE PREVIEW */}
      <Box
        sx={{
          height: 120,
          background: isDark
            ? `radial-gradient(ellipse at center, ${c}08 0%, ${c}02 100%)`
            : `radial-gradient(ellipse at center, ${c}06 0%, ${c}02 100%)`,
          borderBottom: "1px solid",
          borderColor: `${c}20`,
          position: "relative",
          overflow: "hidden",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Grid pattern */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            backgroundImage: isDark
              ? "linear-gradient(rgba(255,255,255,0.01) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.01) 1px, transparent 1px)"
              : "linear-gradient(rgba(0,0,0,0.015) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.015) 1px, transparent 1px)",
            backgroundSize: "20px 20px",
            zIndex: 0,
          }}
        />

        {/* Glow ring (mini) */}
        <Box
          sx={{
            position: "absolute",
            bottom: 4,
            width: "80%",
            zIndex: 1,
          }}
        >
          <svg viewBox="0 0 200 20" style={{ width: "100%", display: "block" }}>
            <ellipse
              cx="100"
              cy="10"
              rx="98"
              ry="8"
              fill="none"
              stroke={hc}
              strokeWidth="1.5"
              opacity="0.3"
            />
          </svg>
        </Box>

        {/* Equipment Image */}
        <Box
          sx={{
            position: "relative",
            height: "90%",
            zIndex: 2,
            filter: isDark
              ? "drop-shadow(0 4px 12px rgba(0,0,0,0.5))"
              : "drop-shadow(0 4px 8px rgba(0,0,0,0.1))",
          }}
        >
          <img
            src={imageSrc}
            alt={u.nom || ""}
            style={{
              height: "100%",
              width: "auto",
              maxWidth: "100%",
              objectFit: "contain",
              display: "block",
            }}
            onError={(e) => {
              e.target.style.display = "none";
            }}
          />
        </Box>

        {/* Overlay gradient (pastga) */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: isDark
              ? "linear-gradient(to bottom, transparent 50%, #0d1220 100%)"
              : "linear-gradient(to bottom, transparent 50%, #fff 100%)",
            zIndex: 3,
            pointerEvents: "none",
          }}
        />

        {/* ID badge */}
        <Box
          sx={{
            position: "absolute",
            top: 6,
            left: 6,
            bgcolor: isDark ? "rgba(0,0,0,0.55)" : "rgba(255,255,255,0.8)",
            border: `1px solid ${c}40`,
            borderRadius: 0.5,
            px: 0.7,
            py: 0.2,
            zIndex: 4,
          }}
        >
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.55rem",
              color: c,
            }}
          >
            {u.id}
          </Typography>
        </Box>

        {/* Status badge */}
        <Box sx={{ position: "absolute", top: 6, right: 6, zIndex: 4 }}>
          <StatusChip holat={u.holat} />
        </Box>
      </Box>

      {/* INFO */}
      <Box sx={{ p: 1.3 }}>
        <Typography
          sx={{
            fontWeight: 700,
            fontSize: "0.82rem",
            color: "text.primary",
            mb: 0.4,
          }}
        >
          {u.nom}
        </Typography>
        <Box sx={{ display: "flex", gap: 0.5, mb: 0.9 }}>
          <Chip
            label={u.tur}
            size="small"
            sx={{
              height: 18,
              fontSize: "0.55rem",
              fontFamily: "'Arial',san-serif",
              bgcolor: `${c}14`,
              color: c,
              border: `1px solid ${c}30`,
              borderRadius: "2px",
              "& .MuiChip-label": { px: 0.7 },
            }}
          />
        </Box>
        <Grid container spacing={0.5} sx={{ mb: 0.9 }}>
          {[
            {
              l: "°C",
              v: u.harorat,
              c2: u.harorat > 1000 ? "#ff2d55" : "#ff6b1a",
            },
            { l: "bar", v: u.bosim, c2: "#00d4ff" },
            { l: "kW", v: u.quvvat, c2: "#a78bfa" },
          ].map((s) => (
            <Grid item xs={4} key={s.l}>
              <Box
                sx={{
                  textAlign: "center",
                  background: isDark ? "rgba(0,0,0,0.15)" : "rgba(0,0,0,0.025)",
                  borderRadius: 0.5,
                  py: 0.4,
                  border: "1px solid",
                  borderColor: "divider",
                }}
              >
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.7rem",
                    fontWeight: 700,
                    color: s.c2,
                  }}
                >
                  {s.v}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.44rem",
                    color: "text.disabled",
                  }}
                >
                  {s.l}
                </Typography>
              </Box>
            </Grid>
          ))}
        </Grid>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <LinearProgress
            variant="determinate"
            value={u.samaradorlik}
            sx={{
              flex: 1,
              height: 4,
              "& .MuiLinearProgress-bar": { background: samColor },
            }}
          />
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.62rem",
              color: samColor,
              minWidth: 32,
            }}
          >
            {u.samaradorlik}%
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}

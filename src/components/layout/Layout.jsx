import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Box,
  Drawer,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Badge,
  Divider,
  Tooltip,
  Avatar,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import DashboardIcon from "@mui/icons-material/Dashboard";
import FactoryIcon from "@mui/icons-material/Factory";
import GrainIcon from "@mui/icons-material/Grain";
import BuildIcon from "@mui/icons-material/Build";
import SensorsIcon from "@mui/icons-material/Sensors";
import VideocamIcon from "@mui/icons-material/Videocam";
import NotificationsIcon from "@mui/icons-material/Notifications";
import BarChartIcon from "@mui/icons-material/BarChart";
import BoltIcon from "@mui/icons-material/Bolt";
import SettingsIcon from "@mui/icons-material/Settings";
import LightModeIcon from "@mui/icons-material/LightMode";
import DarkModeIcon from "@mui/icons-material/DarkMode";
import { toggleSidebar } from "@/store";
import { useThemeMode } from "@/theme";
import { LiveBadge } from "@/components/common";

const DRAWER_WIDTH = 225;

const navItems = [
  {
    path: "/",
    label: "Boshqaruv Paneli",
    icon: <DashboardIcon sx={{ fontSize: 18 }} />,
    badge: null,
  },
  {
    path: "/sexlar",
    label: "Bo'linmalar",
    icon: <FactoryIcon sx={{ fontSize: 18 }} />,
    badge: null,
  },
  {
    path: "/uchastkalar",
    label: "Uchastkalar",
    icon: <GrainIcon sx={{ fontSize: 18 }} />,
    badge: null,
  },
  {
    path: "/uskunalar",
    label: "Uskunalar",
    icon: <BuildIcon sx={{ fontSize: 18 }} />,
    badge: 1,
    badgeColor: "error",
  },
  {
    path: "/datchiklar",
    label: "Datchiklar",
    icon: <SensorsIcon sx={{ fontSize: 18 }} />,
    badge: 3,
    badgeColor: "error",
  },
  {
    path: "/kameralar",
    label: "Kameralar",
    icon: <VideocamIcon sx={{ fontSize: 18 }} />,
    badge: null,
  },
  {
    path: "/analitika",
    label: "Analitika",
    icon: <BarChartIcon sx={{ fontSize: 18 }} />,
    badge: null,
  },
  {
    path: "/ogohlantirishlar",
    label: "Ogohlantirishlar",
    icon: <NotificationsIcon sx={{ fontSize: 18 }} />,
    badge: 3,
    badgeColor: "error",
  },
];

function Clock() {
  const [t, setT] = useState(new Date());
  useState(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  });
  return (
    <Typography
      sx={{
        fontFamily: "'Share Tech Mono',monospace",
        fontSize: "0.75rem",
        color: "primary.main",
        letterSpacing: "0.1em",
      }}
    >
      {t.toLocaleTimeString("uz-UZ")}
    </Typography>
  );
}

export function Layout({ children }) {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.ui.sidebarOpen);
  const navigate = useNavigate();
  const location = useLocation();
  const { mode, toggleMode, isDark } = useThemeMode();

  const miniStats = [
    { l: "Temp Maks", v: "1480°C", c: "#ff2d55" },
    { l: "Orta Bosim", v: "4.8 bar", c: "#ff6b1a" },
    { l: "Hosildorlik", v: "94.2%", c: isDark ? "#00ff9d" : "#00a85a" },
    { l: "Smena", v: "II-SMENA", c: "primary.main" },
  ];

  return (
    <Box sx={{ display: "flex", height: "100vh", overflow: "hidden" }}>
      {/* ── APPBAR ── */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: 1300,
          width: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          ml: open ? `${DRAWER_WIDTH}px` : 0,
          transition: "all 0.25s",
        }}
      >
        <Toolbar sx={{ minHeight: "52px !important", px: 2, gap: 2 }}>
          <IconButton
            size="small"
            onClick={() => dispatch(toggleSidebar())}
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          {/* LOGO */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {/* <Box
              sx={{
                width: 28,
                height: 28,
                background: "linear-gradient(135deg,#ff6b1a,#ff3d00)",
                clipPath:
                  "polygon(50% 0%,100% 25%,100% 75%,50% 100%,0% 75%,0% 25%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 10,
                fontWeight: 900,
                color: "#fff",
                fontFamily: "'Orbitron',monospace",
              }}
            >
              ⬡
            </Box> */}
            <img src="/public/images/logo.svg" alt="" width={30} />
            <Box>
              <Typography
                sx={{
                  fontFamily: "'Orbitron',monospace",
                  fontSize: "0.85rem",
                  fontWeight: 900,
                  letterSpacing: "0.2em",
                  lineHeight: 1,
                  color: "text.primary",
                  textTransform: "uppercase",
                }}
              >
                Uzmetkombinat
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.5rem",
                  color: "text.secondary",
                  letterSpacing: "0.15em",
                }}
              ></Typography>
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 2 }}>
            <Box
              sx={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: isDark ? "#00ff9d" : "#00a85a",
                animation: "blink 1.2s step-end infinite",
                "@keyframes blink": { "50%": { opacity: 0.2 } },
              }}
            />
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.6rem",
                color: "text.secondary",
                letterSpacing: "0.1em",
              }}
            >
              TIZIM FAOL · 142 DATCHIK · 6 SEX
            </Typography>
          </Box>

          <Box sx={{ flex: 1 }} />

          <LiveBadge />
          <Clock />

          {/* THEME TOGGLE */}
          <Tooltip title={isDark ? "Kunduzgi rejim" : "Kechki rejim"}>
            <IconButton
              size="small"
              onClick={toggleMode}
              sx={{
                color: isDark ? "#ffd60a" : "#0064c8",
                background: isDark
                  ? "rgba(255,214,10,0.08)"
                  : "rgba(0,100,200,0.08)",
                border: `1px solid ${isDark ? "rgba(255,214,10,0.2)" : "rgba(0,100,200,0.2)"}`,
                borderRadius: 1,
                width: 32,
                height: 32,
                transition: "all 0.3s",
                "&:hover": {
                  background: isDark
                    ? "rgba(255,214,10,0.16)"
                    : "rgba(0,100,200,0.14)",
                  transform: "rotate(20deg)",
                },
              }}
            >
              {isDark ? (
                <LightModeIcon sx={{ fontSize: 16 }} />
              ) : (
                <DarkModeIcon sx={{ fontSize: 16 }} />
              )}
            </IconButton>
          </Tooltip>

          <Badge
            badgeContent={3}
            color="error"
            sx={{
              "& .MuiBadge-badge": {
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.55rem",
              },
            }}
          >
            <IconButton
              size="small"
              sx={{
                color: "text.secondary",
                "&:hover": { color: "error.main" },
              }}
            >
              <NotificationsIcon fontSize="small" />
            </IconButton>
          </Badge>

          <Tooltip title="Admin">
            <Avatar
              sx={{
                width: 28,
                height: 28,
                bgcolor: "divider",
                fontSize: "0.7rem",
                fontFamily: "'Orbitron',monospace",
                border: "1px solid",
                borderColor: "divider",
                cursor: "pointer",
                color: "text.primary",
                "&:hover": { borderColor: "primary.main" },
              }}
            >
              A
            </Avatar>
          </Tooltip>
        </Toolbar>
      </AppBar>

      {/* ── SIDEBAR ── */}
      <Drawer
        variant="persistent"
        open={open}
        sx={{
          width: DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            mt: "52px",
            height: "calc(100% - 52px)",
            overflowX: "hidden",
          },
        }}
      >
        {/* MINI STATS */}
        <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
          {miniStats.map((s) => (
            <Box
              key={s.l}
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                py: 0.6,
              }}
            >
              <Typography
                sx={{
                  fontSize: "0.65rem",
                  color: "text.secondary",
                  fontFamily: "'Share Tech Mono',monospace",
                }}
              >
                {s.l}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.72rem",
                  color: s.c,
                }}
              >
                {s.v}
              </Typography>
            </Box>
          ))}
        </Box>

        {/* NAV */}
        <List dense disablePadding sx={{ flex: 1 }}>
          <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                color: "text.disabled",
                textTransform: "uppercase",
              }}
            >
              Asosiy
            </Typography>
          </Box>
          {navItems.slice(0, 6).map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{ py: 0.8, px: 2, minHeight: 38 }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 32,
                  color:
                    location.pathname === item.path
                      ? "primary.main"
                      : "text.secondary",
                }}
              >
                {item.badge ? (
                  <Badge
                    badgeContent={item.badge}
                    color={item.badgeColor || "error"}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: "0.5rem",
                        minWidth: 14,
                        height: 14,
                      },
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.82rem",
                  fontWeight: location.pathname === item.path ? 600 : 400,
                  letterSpacing: "0.03em",
                }}
              />
            </ListItemButton>
          ))}

          <Divider sx={{ my: 1 }} />
          <Box sx={{ px: 2, pb: 0.5 }}>
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.55rem",
                letterSpacing: "0.2em",
                color: "text.disabled",
                textTransform: "uppercase",
              }}
            >
              Boshqaruv
            </Typography>
          </Box>
          {navItems.slice(6).map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => navigate(item.path)}
              sx={{ py: 0.8, px: 2, minHeight: 38 }}
            >
              <ListItemIcon
                sx={{
                  minWidth: 32,
                  color:
                    location.pathname === item.path
                      ? "primary.main"
                      : "text.secondary",
                }}
              >
                {item.badge ? (
                  <Badge
                    badgeContent={item.badge}
                    color={item.badgeColor || "error"}
                    sx={{
                      "& .MuiBadge-badge": {
                        fontSize: "0.5rem",
                        minWidth: 14,
                        height: 14,
                      },
                    }}
                  >
                    {item.icon}
                  </Badge>
                ) : (
                  item.icon
                )}
              </ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontSize: "0.82rem",
                  fontWeight: location.pathname === item.path ? 600 : 400,
                }}
              />
            </ListItemButton>
          ))}

          <Divider sx={{ my: 1 }} />
          <ListItemButton sx={{ py: 0.8, px: 2, minHeight: 38 }}>
            <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
              <SettingsIcon sx={{ fontSize: 18 }} />
            </ListItemIcon>
            <ListItemText
              primary="Sozlamalar"
              primaryTypographyProps={{ fontSize: "0.82rem" }}
            />
          </ListItemButton>
        </List>

        {/* BOTTOM */}
        <Box
          sx={{
            p: 1.5,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            alignItems: "center",
            gap: 1,
          }}
        >
          <BoltIcon
            sx={{ fontSize: 14, color: isDark ? "#00ff9d" : "#00a85a" }}
          />
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.6rem",
              color: "text.secondary",
            }}
          >
            v2.4.1 · FAOL
          </Typography>
          <Box sx={{ flex: 1 }} />
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.6rem",
              color: "text.secondary",
            }}
          >
            {isDark ? "🌙 KECHA" : "☀️ KUNDUZ"}
          </Typography>
        </Box>
      </Drawer>

      {/* ── MAIN ── */}
      <Box
        component="main"
        sx={{
          flex: 1,
          mt: "52px",
          overflow: "auto",
          width: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          transition: "all 0.25s",
          bgcolor: "background.default",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

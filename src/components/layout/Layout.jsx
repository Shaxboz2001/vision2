import { useEffect, useRef, useState } from "react";
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
  useMediaQuery,
  useTheme,
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
const APPBAR_HEIGHT = 52;

const navItems = [
  {
    path: "/",
    label: "Boshqaruv Paneli",
    icon: <DashboardIcon sx={{ fontSize: 18 }} />,
    badge: null,
  },
  {
    path: "/bo'linmalar",
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

  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <Typography
      sx={{
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "0.75rem",
        color: "primary.main",
        letterSpacing: "0.1em",
        whiteSpace: "nowrap",
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
  const { toggleMode, isDark } = useThemeMode();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const miniStats = [
    { l: "Temp Maks", v: "1480°C", c: "#ff2d55" },
    { l: "Orta Bosim", v: "4.8 bar", c: "#ff6b1a" },
    { l: "Hosildorlik", v: "94.2%", c: isDark ? "#00ff9d" : "#00a85a" },
    { l: "Smena", v: "II-SMENA", c: "primary.main" },
  ];

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && open) {
      dispatch(toggleSidebar());
    }
  };

  const drawerContent = (
    <>
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
                fontFamily: "'Share Tech Mono', monospace",
              }}
            >
              {s.l}
            </Typography>
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.72rem",
                color: s.c,
              }}
            >
              {s.v}
            </Typography>
          </Box>
        ))}
      </Box>

      <List dense disablePadding sx={{ flex: 1 }}>
        <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
          <Typography
            sx={{
              fontFamily: "'Share Tech Mono', monospace",
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
            onClick={() => handleNavigate(item.path)}
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
              fontFamily: "'Share Tech Mono', monospace",
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
            onClick={() => handleNavigate(item.path)}
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
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.6rem",
            color: "text.secondary",
          }}
        >
          v2.4.1 · FAOL
        </Typography>
        <Box sx={{ flex: 1 }} />
        <Typography
          sx={{
            fontFamily: "'Share Tech Mono', monospace",
            fontSize: "0.6rem",
            color: "text.secondary",
          }}
        >
          {isDark ? "🌙 KECHA" : "☀️ KUNDUZ"}
        </Typography>
      </Box>
    </>
  );

  const sloganWrapRef = useRef(null);
  const sloganTextRef = useRef(null);
  const [shouldAnimateSlogan, setShouldAnimateSlogan] = useState(false);

  useEffect(() => {
    const checkSloganOverflow = () => {
      if (!sloganWrapRef.current || !sloganTextRef.current) return;

      const wrapWidth = sloganWrapRef.current.offsetWidth;
      const textWidth = sloganTextRef.current.scrollWidth;

      setShouldAnimateSlogan(textWidth > wrapWidth);
    };

    checkSloganOverflow();

    const timeout = setTimeout(checkSloganOverflow, 100);

    window.addEventListener("resize", checkSloganOverflow);

    return () => {
      clearTimeout(timeout);
      window.removeEventListener("resize", checkSloganOverflow);
    };
  }, [open, isMobile, isSmall]);
  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: "background.default",
      }}
    >
      {/* <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          height: APPBAR_HEIGHT,
          justifyContent: "center",
          width: {
            xs: "100%",
            md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          },
          ml: {
            xs: 0,
            md: open ? `${DRAWER_WIDTH}px` : 0,
          },
          transition: theme.transitions.create(["width", "margin"], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Toolbar
          sx={{
            minHeight: `${APPBAR_HEIGHT}px !important`,
            px: { xs: 1, sm: 2 },
            gap: { xs: 1, sm: 2 },
          }}
        >
          <IconButton
            size="small"
            onClick={handleToggleSidebar}
            sx={{
              color: "text.secondary",
              "&:hover": { color: "primary.main" },
            }}
          >
            <MenuIcon fontSize="small" />
          </IconButton>

          <Box
            sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}
          >
            <img src="/images/logo.svg" alt="logo" width={isSmall ? 24 : 30} />
            <Box sx={{ minWidth: 0 }}>
              <Typography
                sx={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: { xs: "0.72rem", sm: "0.85rem" },
                  fontWeight: 900,
                  letterSpacing: { xs: "0.08em", sm: "0.2em" },
                  lineHeight: 1,
                  color: "text.primary",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Uzmetkombinat
              </Typography>
            </Box>
          </Box>

          {!isSmall && (
            <Box
              sx={{ display: "flex", alignItems: "center", gap: 0.5, ml: 1 }}
            >
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
            </Box>
          )}

          {!isMobile && (
            <Box
              sx={{
                position: "absolute",
                left: "50%",
                transform: "translateX(-50%)",
                pointerEvents: "none",
                maxWidth: "42%",
              }}
            >
              <Typography
                sx={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: "0.82rem",
                  fontWeight: 800,
                  letterSpacing: "0.22em",
                  textTransform: "uppercase",
                  color: "primary.main",
                  textAlign: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textShadow: `
                    0 0 5px rgba(0,255,157,0.6),
                    0 0 10px rgba(0,255,157,0.4),
                    0 0 20px rgba(0,255,157,0.2)
                  `,
                  animation: "glowPulse 3s ease-in-out infinite",
                  "@keyframes glowPulse": {
                    "0%": {
                      textShadow:
                        "0 0 5px rgba(0,255,157,0.6),0 0 10px rgba(0,255,157,0.4)",
                    },
                    "50%": {
                      textShadow:
                        "0 0 10px rgba(0,255,157,1),0 0 25px rgba(0,255,157,0.8)",
                    },
                    "100%": {
                      textShadow:
                        "0 0 5px rgba(0,255,157,0.6),0 0 10px rgba(0,255,157,0.4)",
                    },
                  },
                }}
              >
                RAQAMLI • INNOVATSION • XAVFSIZ KOMBINAT
              </Typography>
            </Box>
          )}

          <Box sx={{ flex: 1 }} />

          {!isSmall && <LiveBadge />}
          {!isSmall && <Clock />}

          <Tooltip title={isDark ? "Kunduzgi rejim" : "Kechki rejim"}>
            <IconButton
              size="small"
              onClick={toggleMode}
              sx={{
                color: isDark ? "#ffd60a" : "#0064c8",
                background: isDark
                  ? "rgba(255,214,10,0.08)"
                  : "rgba(0,100,200,0.08)",
                border: `1px solid ${
                  isDark ? "rgba(255,214,10,0.2)" : "rgba(0,100,200,0.2)"
                }`,
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
                fontFamily: "'Share Tech Mono', monospace",
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

          {!isSmall && (
            <Tooltip title="Admin">
              <Avatar
                sx={{
                  width: 28,
                  height: 28,
                  bgcolor: "divider",
                  fontSize: "0.7rem",
                  fontFamily: "'Orbitron', monospace",
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
          )}
        </Toolbar>
      </AppBar> */}
      <AppBar
        position="fixed"
        sx={{
          zIndex: theme.zIndex.drawer + 1,
          height: APPBAR_HEIGHT,
          justifyContent: "center",
          width: {
            xs: "100%",
            md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          },
          ml: {
            xs: 0,
            md: open ? `${DRAWER_WIDTH}px` : 0,
          },
          transition: theme.transitions.create(["width", "margin"], {
            duration: theme.transitions.duration.shorter,
          }),
        }}
      >
        <Toolbar
          sx={{
            minHeight: `${APPBAR_HEIGHT}px !important`,
            px: { xs: 1, sm: 1.5, md: 2 },
            gap: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* LEFT */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
              flexShrink: 0,
            }}
          >
            <IconButton
              size="small"
              onClick={handleToggleSidebar}
              sx={{
                color: "text.secondary",
                "&:hover": { color: "primary.main" },
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>

            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
              }}
            >
              <img
                src="/images/logo.svg"
                alt="logo"
                width={isSmall ? 24 : 30}
              />

              <Typography
                sx={{
                  fontFamily: "'Orbitron', monospace",
                  fontSize: { xs: "0.72rem", sm: "0.85rem" },
                  fontWeight: 900,
                  letterSpacing: { xs: "0.06em", sm: "0.14em" },
                  lineHeight: 1,
                  color: "text.primary",
                  textTransform: "uppercase",
                  whiteSpace: "nowrap",
                }}
              >
                Uzmetkombinat
              </Typography>
            </Box>

            {!isSmall && (
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <Box
                  sx={{
                    width: 5,
                    height: 5,
                    borderRadius: "50%",
                    background: isDark ? "#00ff9d" : "#00a85a",
                    animation: "blink 1.2s step-end infinite",
                    "@keyframes blink": {
                      "50%": { opacity: 0.2 },
                    },
                  }}
                />
              </Box>
            )}
          </Box>

          {/* CENTER */}
          {!isMobile && (
            <Box
              sx={{
                flex: 1,
                minWidth: 0,
                px: { md: 1, lg: 2 },
                display: "flex",
                alignItems: "center",
                overflow: "hidden",
              }}
            >
              <Box
                ref={sloganWrapRef}
                sx={{
                  width: "100%",
                  overflow: "hidden",
                  position: "relative",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: shouldAnimateSlogan ? "flex-start" : "center",
                }}
              >
                <Typography
                  ref={sloganTextRef}
                  sx={{
                    fontFamily: "'Orbitron', monospace",
                    fontSize: {
                      md: open ? "0.66rem" : "0.76rem",
                      lg: open ? "0.76rem" : "0.88rem",
                      xl: "0.92rem",
                    },
                    fontWeight: 800,
                    letterSpacing: {
                      md: open ? "0.06em" : "0.12em",
                      lg: open ? "0.12em" : "0.18em",
                      xl: "0.22em",
                    },
                    textTransform: "uppercase",
                    color: "primary.main",
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    width: "max-content",
                    maxWidth: shouldAnimateSlogan ? "none" : "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "inline-block",
                    textShadow: `
                0 0 5px rgba(0,255,157,0.6),
                0 0 10px rgba(0,255,157,0.4),
                0 0 20px rgba(0,255,157,0.2)
              `,
                    animation: shouldAnimateSlogan
                      ? "sloganLeftToRight 12s linear infinite"
                      : "none",
                    "@keyframes sloganLeftToRight": {
                      "0%": {
                        transform: "translateX(-100%)",
                      },
                      "100%": {
                        transform: "translateX(100%)",
                      },
                    },
                  }}
                >
                  RAQAMLI • INNOVATSION • XAVFSIZ KOMBINAT
                </Typography>
              </Box>
            </Box>
          )}

          {/* RIGHT */}
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: { xs: 0.5, sm: 1 },
              flexShrink: 0,
            }}
          >
            {!isSmall && <LiveBadge />}
            {!isSmall && <Clock />}

            <Tooltip title={isDark ? "Kunduzgi rejim" : "Kechki rejim"}>
              <IconButton
                size="small"
                onClick={toggleMode}
                sx={{
                  color: isDark ? "#ffd60a" : "#0064c8",
                  background: isDark
                    ? "rgba(255,214,10,0.08)"
                    : "rgba(0,100,200,0.08)",
                  border: `1px solid ${
                    isDark ? "rgba(255,214,10,0.2)" : "rgba(0,100,200,0.2)"
                  }`,
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
                  fontFamily: "'Share Tech Mono', monospace",
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

            {!isSmall && (
              <Tooltip title="Admin">
                <Avatar
                  sx={{
                    width: 28,
                    height: 28,
                    bgcolor: "divider",
                    fontSize: "0.7rem",
                    fontFamily: "'Orbitron', monospace",
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
            )}
          </Box>
        </Toolbar>
      </AppBar>

      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        open={open}
        onClose={handleToggleSidebar}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: !(open || isMobile) ? 0 : DRAWER_WIDTH,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
            mt: `${APPBAR_HEIGHT}px`,
            height: `calc(100% - ${APPBAR_HEIGHT}px)`,
            overflowX: "hidden",
            boxSizing: "border-box",
            transition: "width .32s ease",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: {
            xs: "100%",
            md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
          },
          mt: `${APPBAR_HEIGHT}px`,
          minHeight: `calc(100vh - ${APPBAR_HEIGHT}px)`,
          overflow: "auto",
          transition: theme.transitions.create(["width", "margin"], {
            duration: theme.transitions.duration.shorter,
          }),
          transition: "width .32s ease",
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

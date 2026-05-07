// // import { useEffect, useRef, useState } from "react";
// // import { useDispatch, useSelector } from "react-redux";
// // import { useNavigate, useLocation } from "react-router-dom";
// // import {
// //   Box,
// //   Drawer,
// //   List,
// //   ListItemButton,
// //   ListItemIcon,
// //   ListItemText,
// //   AppBar,
// //   Toolbar,
// //   Typography,
// //   IconButton,
// //   Badge,
// //   Divider,
// //   Tooltip,
// //   Avatar,
// //   useMediaQuery,
// //   useTheme,
// // } from "@mui/material";
// // import MenuIcon from "@mui/icons-material/Menu";
// // import DashboardIcon from "@mui/icons-material/Dashboard";
// // import FactoryIcon from "@mui/icons-material/Factory";
// // import GrainIcon from "@mui/icons-material/Grain";
// // import BuildIcon from "@mui/icons-material/Build";
// // import SensorsIcon from "@mui/icons-material/Sensors";
// // import VideocamIcon from "@mui/icons-material/Videocam";
// // import NotificationsIcon from "@mui/icons-material/Notifications";
// // import BarChartIcon from "@mui/icons-material/BarChart";
// // import BoltIcon from "@mui/icons-material/Bolt";
// // import SettingsIcon from "@mui/icons-material/Settings";
// // import LightModeIcon from "@mui/icons-material/LightMode";
// // import DarkModeIcon from "@mui/icons-material/DarkMode";
// // import { toggleSidebar } from "@/store";
// // import { useThemeMode } from "@/theme";
// // import { LiveBadge } from "@/components/common";
// // import ConstructionIcon from "@mui/icons-material/Construction";

// // const DRAWER_WIDTH = 225;
// // const APPBAR_HEIGHT = 52;

// // const navItems = [
// //   {
// //     path: "/",
// //     label: "Boshqaruv Paneli",
// //     icon: <DashboardIcon sx={{ fontSize: 18 }} />,
// //     badge: null,
// //   },
// //   {
// //     path: "/bo'linmalar",
// //     label: "Bo'linmalar",
// //     icon: <FactoryIcon sx={{ fontSize: 18 }} />,
// //     badge: null,
// //   },
// //   {
// //     path: "/uchastkalar",
// //     label: "Uchastkalar",
// //     icon: <GrainIcon sx={{ fontSize: 18 }} />,
// //     badge: null,
// //   },
// //   {
// //     path: "/uskunalar",
// //     label: "Uskunalar",
// //     icon: <BuildIcon sx={{ fontSize: 18 }} />,
// //     badge: 1,
// //     badgeColor: "error",
// //   },
// //   {
// //     path: "/datchiklar",
// //     label: "Datchiklar",
// //     icon: <SensorsIcon sx={{ fontSize: 18 }} />,
// //     badge: 3,
// //     badgeColor: "error",
// //   },
// //   {
// //     path: "/kameralar",
// //     label: "Kameralar",
// //     icon: <VideocamIcon sx={{ fontSize: 18 }} />,
// //     badge: null,
// //   },
// //   {
// //     path: "/analitika",
// //     label: "Analitika",
// //     icon: <BarChartIcon sx={{ fontSize: 18 }} />,
// //     badge: null,
// //   },
// //   {
// //     path: "/ogohlantirishlar",
// //     label: "Ogohlantirishlar",
// //     icon: <NotificationsIcon sx={{ fontSize: 18 }} />,
// //     badge: 3,
// //     badgeColor: "error",
// //   },
// //   {
// //     path: "/armatura",
// //     label: "Prokat LIVE",
// //     icon: <ConstructionIcon sx={{ fontSize: 18 }} />,
// //     // badge: 3,
// //   },
// // ];

// // function Clock() {
// //   const [t, setT] = useState(new Date());

// //   useEffect(() => {
// //     const id = setInterval(() => setT(new Date()), 1000);
// //     return () => clearInterval(id);
// //   }, []);

// //   return (
// //     <Typography
// //       sx={{
// //         fontFamily: "'Arial', san-serif",
// //         fontSize: "0.75rem",
// //         color: "primary.main",
// //         letterSpacing: "0.1em",
// //         whiteSpace: "nowrap",
// //       }}
// //     >
// //       {t.toLocaleTimeString("uz-UZ")}
// //     </Typography>
// //   );
// // }

// // export function Layout({ children }) {
// //   const dispatch = useDispatch();
// //   const open = useSelector((s) => s.ui.sidebarOpen);
// //   const navigate = useNavigate();
// //   const location = useLocation();
// //   const { toggleMode, isDark } = useThemeMode();

// //   const theme = useTheme();
// //   const isMobile = useMediaQuery(theme.breakpoints.down("md"));
// //   const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

// //   const miniStats = [
// //     { l: "Temp Maks", v: "1480°C", c: "#ff2d55" },
// //     { l: "Orta Bosim", v: "4.8 bar", c: "#ff6b1a" },
// //     { l: "Hosildorlik", v: "94.2%", c: isDark ? "#00ff9d" : "#00a85a" },
// //     { l: "Smena", v: "II-SMENA", c: "primary.main" },
// //   ];

// //   const handleToggleSidebar = () => {
// //     dispatch(toggleSidebar());
// //   };

// //   const handleNavigate = (path) => {
// //     navigate(path);
// //     if (isMobile && open) {
// //       dispatch(toggleSidebar());
// //     }
// //   };

// //   const drawerContent = (
// //     <>
// //       <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
// //         {miniStats.map((s) => (
// //           <Box
// //             key={s.l}
// //             sx={{
// //               display: "flex",
// //               justifyContent: "space-between",
// //               alignItems: "center",
// //               py: 0.6,
// //             }}
// //           >
// //             <Typography
// //               sx={{
// //                 fontSize: "0.65rem",
// //                 color: "text.secondary",
// //                 fontFamily: "'Arial', san-serif",
// //               }}
// //             >
// //               {s.l}
// //             </Typography>
// //             <Typography
// //               sx={{
// //                 fontFamily: "'Arial', san-serif",
// //                 fontSize: "0.72rem",
// //                 color: s.c,
// //               }}
// //             >
// //               {s.v}
// //             </Typography>
// //           </Box>
// //         ))}
// //       </Box>

// //       <List dense disablePadding sx={{ flex: 1 }}>
// //         <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
// //           <Typography
// //             sx={{
// //               fontFamily: "'Arial', san-serif",
// //               fontSize: "0.55rem",
// //               letterSpacing: "0.2em",
// //               color: "text.disabled",
// //               textTransform: "uppercase",
// //             }}
// //           >
// //             Asosiy
// //           </Typography>
// //         </Box>

// //         {navItems.slice(0, 6).map((item) => (
// //           <ListItemButton
// //             key={item.path}
// //             selected={location.pathname === item.path}
// //             onClick={() => handleNavigate(item.path)}
// //             sx={{ py: 0.8, px: 2, minHeight: 38 }}
// //           >
// //             <ListItemIcon
// //               sx={{
// //                 minWidth: 32,
// //                 color:
// //                   location.pathname === item.path
// //                     ? "primary.main"
// //                     : "text.secondary",
// //               }}
// //             >
// //               {item.badge ? (
// //                 <Badge
// //                   badgeContent={item.badge}
// //                   color={item.badgeColor || "error"}
// //                   sx={{
// //                     "& .MuiBadge-badge": {
// //                       fontSize: "0.5rem",
// //                       minWidth: 14,
// //                       height: 14,
// //                     },
// //                   }}
// //                 >
// //                   {item.icon}
// //                 </Badge>
// //               ) : (
// //                 item.icon
// //               )}
// //             </ListItemIcon>
// //             <ListItemText
// //               primary={item.label}
// //               primaryTypographyProps={{
// //                 fontSize: "0.82rem",
// //                 fontWeight: location.pathname === item.path ? 600 : 400,
// //                 letterSpacing: "0.03em",
// //               }}
// //             />
// //           </ListItemButton>
// //         ))}

// //         <Divider sx={{ my: 1 }} />

// //         <Box sx={{ px: 2, pb: 0.5 }}>
// //           <Typography
// //             sx={{
// //               fontFamily: "'Arial', san-serif",
// //               fontSize: "0.55rem",
// //               letterSpacing: "0.2em",
// //               color: "text.disabled",
// //               textTransform: "uppercase",
// //             }}
// //           >
// //             Boshqaruv
// //           </Typography>
// //         </Box>

// //         {navItems.slice(6).map((item) => (
// //           <ListItemButton
// //             key={item.path}
// //             selected={location.pathname === item.path}
// //             onClick={() => handleNavigate(item.path)}
// //             sx={{ py: 0.8, px: 2, minHeight: 38 }}
// //           >
// //             <ListItemIcon
// //               sx={{
// //                 minWidth: 32,
// //                 color:
// //                   location.pathname === item.path
// //                     ? "primary.main"
// //                     : "text.secondary",
// //               }}
// //             >
// //               {item.badge ? (
// //                 <Badge
// //                   badgeContent={item.badge}
// //                   color={item.badgeColor || "error"}
// //                   sx={{
// //                     "& .MuiBadge-badge": {
// //                       fontSize: "0.5rem",
// //                       minWidth: 14,
// //                       height: 14,
// //                     },
// //                   }}
// //                 >
// //                   {item.icon}
// //                 </Badge>
// //               ) : (
// //                 item.icon
// //               )}
// //             </ListItemIcon>
// //             <ListItemText
// //               primary={item.label}
// //               primaryTypographyProps={{
// //                 fontSize: "0.82rem",
// //                 fontWeight: location.pathname === item.path ? 600 : 400,
// //               }}
// //             />
// //           </ListItemButton>
// //         ))}

// //         <Divider sx={{ my: 1 }} />

// //         <ListItemButton sx={{ py: 0.8, px: 2, minHeight: 38 }}>
// //           <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
// //             <SettingsIcon sx={{ fontSize: 18 }} />
// //           </ListItemIcon>
// //           <ListItemText
// //             primary="Sozlamalar"
// //             primaryTypographyProps={{ fontSize: "0.82rem" }}
// //           />
// //         </ListItemButton>
// //       </List>

// //       <Box
// //         sx={{
// //           p: 1.5,
// //           borderTop: "1px solid",
// //           borderColor: "divider",
// //           display: "flex",
// //           alignItems: "center",
// //           gap: 1,
// //         }}
// //       >
// //         <BoltIcon
// //           sx={{ fontSize: 14, color: isDark ? "#00ff9d" : "#00a85a" }}
// //         />
// //         <Typography
// //           sx={{
// //             fontFamily: "'Arial', san-serif",
// //             fontSize: "0.6rem",
// //             color: "text.secondary",
// //           }}
// //         >
// //           v2.4.1 · FAOL
// //         </Typography>
// //         <Box sx={{ flex: 1 }} />
// //         <Typography
// //           sx={{
// //             fontFamily: "'Arial', san-serif",
// //             fontSize: "0.6rem",
// //             color: "text.secondary",
// //           }}
// //         >
// //           {isDark ? "🌙 KECHA" : "☀️ KUNDUZ"}
// //         </Typography>
// //       </Box>
// //     </>
// //   );

// //   const sloganWrapRef = useRef(null);
// //   const sloganTextRef = useRef(null);
// //   const [shouldAnimateSlogan, setShouldAnimateSlogan] = useState(false);

// //   useEffect(() => {
// //     const checkSloganOverflow = () => {
// //       if (!sloganWrapRef.current || !sloganTextRef.current) return;

// //       const wrapWidth = sloganWrapRef.current.offsetWidth;
// //       const textWidth = sloganTextRef.current.scrollWidth;

// //       setShouldAnimateSlogan(textWidth > wrapWidth);
// //     };

// //     checkSloganOverflow();

// //     const timeout = setTimeout(checkSloganOverflow, 100);

// //     window.addEventListener("resize", checkSloganOverflow);

// //     return () => {
// //       clearTimeout(timeout);
// //       window.removeEventListener("resize", checkSloganOverflow);
// //     };
// //   }, [open, isMobile, isSmall]);
// //   return (
// //     <Box
// //       sx={{
// //         display: "flex",
// //         minHeight: "100vh",
// //         bgcolor: "background.default",
// //       }}
// //     >
// //       <AppBar
// //         position="fixed"
// //         sx={{
// //           zIndex: theme.zIndex.drawer + 1,
// //           height: APPBAR_HEIGHT,
// //           justifyContent: "center",
// //           width: {
// //             xs: "100%",
// //             md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
// //           },
// //           ml: {
// //             xs: 0,
// //             md: open ? `${DRAWER_WIDTH}px` : 0,
// //           },
// //           transition: theme.transitions.create(["width", "margin"], {
// //             duration: theme.transitions.duration.shorter,
// //           }),
// //         }}
// //       >
// //         <Toolbar
// //           sx={{
// //             minHeight: `${APPBAR_HEIGHT}px !important`,
// //             px: { xs: 1, sm: 1.5, md: 2 },
// //             gap: 1,
// //             display: "flex",
// //             alignItems: "center",
// //           }}
// //         >
// //           {/* LEFT */}
// //           <Box
// //             sx={{
// //               display: "flex",
// //               alignItems: "center",
// //               gap: 1,
// //               minWidth: 0,
// //               flexShrink: 0,
// //             }}
// //           >
// //             <IconButton
// //               size="small"
// //               onClick={handleToggleSidebar}
// //               sx={{
// //                 color: "text.secondary",
// //                 "&:hover": { color: "primary.main" },
// //               }}
// //             >
// //               <MenuIcon fontSize="small" />
// //             </IconButton>

// //             <Box
// //               sx={{
// //                 display: "flex",
// //                 alignItems: "center",
// //                 gap: 1,
// //                 minWidth: 0,
// //               }}
// //             >
// //               <img
// //                 src="/images/logo.svg"
// //                 alt="logo"
// //                 width={isSmall ? 24 : 30}
// //               />

// //               <Typography
// //                 sx={{
// //                   fontFamily: "'Arial', san-serif",
// //                   fontSize: { xs: "0.72rem", sm: "0.85rem" },
// //                   fontWeight: 900,
// //                   letterSpacing: { xs: "0.06em", sm: "0.14em" },
// //                   lineHeight: 1,
// //                   color: "text.primary",
// //                   textTransform: "uppercase",
// //                   whiteSpace: "nowrap",
// //                 }}
// //               >
// //                 Uzmetkombinat
// //               </Typography>
// //             </Box>

// //             {!isSmall && (
// //               <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
// //                 <Box
// //                   sx={{
// //                     width: 5,
// //                     height: 5,
// //                     borderRadius: "50%",
// //                     background: isDark ? "#00ff9d" : "#00a85a",
// //                     animation: "blink 1.2s step-end infinite",
// //                     "@keyframes blink": {
// //                       "50%": { opacity: 0.2 },
// //                     },
// //                   }}
// //                 />
// //               </Box>
// //             )}
// //           </Box>

// //           {/* CENTER */}
// //           {!isMobile && (
// //             <Box
// //               sx={{
// //                 flex: 1,
// //                 minWidth: 0,
// //                 px: { md: 1, lg: 2 },
// //                 display: "flex",
// //                 alignItems: "center",
// //                 overflow: "hidden",
// //               }}
// //             >
// //               <Box
// //                 ref={sloganWrapRef}
// //                 sx={{
// //                   width: "100%",
// //                   overflow: "hidden",
// //                   position: "relative",
// //                   display: "flex",
// //                   alignItems: "center",
// //                   justifyContent: shouldAnimateSlogan ? "flex-start" : "center",
// //                 }}
// //               >
// //                 <Typography
// //                   ref={sloganTextRef}
// //                   sx={{
// //                     fontFamily: "'Arial', san-serif",
// //                     fontSize: {
// //                       md: open ? "0.66rem" : "0.76rem",
// //                       lg: open ? "0.76rem" : "0.88rem",
// //                       xl: "0.92rem",
// //                     },
// //                     fontWeight: 800,
// //                     letterSpacing: {
// //                       md: open ? "0.06em" : "0.12em",
// //                       lg: open ? "0.12em" : "0.18em",
// //                       xl: "0.22em",
// //                     },
// //                     textTransform: "uppercase",
// //                     color: "primary.main",
// //                     textAlign: "center",
// //                     whiteSpace: "nowrap",
// //                     width: "max-content",
// //                     maxWidth: shouldAnimateSlogan ? "none" : "100%",
// //                     overflow: "hidden",
// //                     textOverflow: "ellipsis",
// //                     display: "inline-block",
// //                     textShadow: `
// //                 0 0 5px rgba(0,255,157,0.6),
// //                 0 0 10px rgba(0,255,157,0.4),
// //                 0 0 20px rgba(0,255,157,0.2)
// //               `,
// //                     animation: shouldAnimateSlogan
// //                       ? "sloganLeftToRight 12s linear infinite"
// //                       : "none",
// //                     "@keyframes sloganLeftToRight": {
// //                       "0%": {
// //                         transform: "translateX(-100%)",
// //                       },
// //                       "100%": {
// //                         transform: "translateX(100%)",
// //                       },
// //                     },
// //                   }}
// //                 >
// //                   RAQAMLI • INNOVATSION • XAVFSIZ KOMBINAT
// //                 </Typography>
// //               </Box>
// //             </Box>
// //           )}

// //           {/* RIGHT */}
// //           <Box
// //             sx={{
// //               display: "flex",
// //               alignItems: "center",
// //               gap: { xs: 0.5, sm: 1 },
// //               flexShrink: 0,
// //             }}
// //           >
// //             {!isSmall && <LiveBadge />}
// //             {!isSmall && <Clock />}

// //             <Tooltip title={isDark ? "Kunduzgi rejim" : "Kechki rejim"}>
// //               <IconButton
// //                 size="small"
// //                 onClick={toggleMode}
// //                 sx={{
// //                   color: isDark ? "#ffd60a" : "#0064c8",
// //                   background: isDark
// //                     ? "rgba(255,214,10,0.08)"
// //                     : "rgba(0,100,200,0.08)",
// //                   border: `1px solid ${
// //                     isDark ? "rgba(255,214,10,0.2)" : "rgba(0,100,200,0.2)"
// //                   }`,
// //                   borderRadius: 1,
// //                   width: 32,
// //                   height: 32,
// //                   transition: "all 0.3s",
// //                   "&:hover": {
// //                     background: isDark
// //                       ? "rgba(255,214,10,0.16)"
// //                       : "rgba(0,100,200,0.14)",
// //                     transform: "rotate(20deg)",
// //                   },
// //                 }}
// //               >
// //                 {isDark ? (
// //                   <LightModeIcon sx={{ fontSize: 16 }} />
// //                 ) : (
// //                   <DarkModeIcon sx={{ fontSize: 16 }} />
// //                 )}
// //               </IconButton>
// //             </Tooltip>

// //             {/* <Badge
// //               badgeContent={3}
// //               color="error"
// //               sx={{
// //                 "& .MuiBadge-badge": {
// //                   fontFamily: "'Arial', san-serif",
// //                   fontSize: "0.55rem",
// //                 },
// //               }}
// //             >
// //               <IconButton
// //                 size="small"
// //                 sx={{
// //                   color: "text.secondary",
// //                   "&:hover": { color: "error.main" },
// //                 }}
// //               >
// //                 <NotificationsIcon fontSize="small" />
// //               </IconButton>
// //             </Badge> */}

// //             {/* {!isSmall && (
// //               <Tooltip title="Admin">
// //                 <Avatar
// //                   sx={{
// //                     width: 28,
// //                     height: 28,
// //                     bgcolor: "divider",
// //                     fontSize: "0.7rem",
// //                     fontFamily: "'Arial', san-serif",
// //                     border: "1px solid",
// //                     borderColor: "divider",
// //                     cursor: "pointer",
// //                     color: "text.primary",
// //                     "&:hover": { borderColor: "primary.main" },
// //                   }}
// //                 >
// //                   A
// //                 </Avatar>
// //               </Tooltip>
// //             )} */}
// //           </Box>
// //         </Toolbar>
// //       </AppBar>

// //       <Drawer
// //         variant={isMobile ? "temporary" : "persistent"}
// //         open={open}
// //         onClose={handleToggleSidebar}
// //         ModalProps={{ keepMounted: true }}
// //         sx={{
// //           width: !(open || isMobile) ? 0 : DRAWER_WIDTH,
// //           flexShrink: 0,
// //           "& .MuiDrawer-paper": {
// //             width: DRAWER_WIDTH,
// //             mt: `${APPBAR_HEIGHT}px`,
// //             height: `calc(100% - ${APPBAR_HEIGHT}px)`,
// //             overflowX: "hidden",
// //             boxSizing: "border-box",
// //             transition: "width .32s ease",
// //           },
// //         }}
// //       >
// //         {drawerContent}
// //       </Drawer>

// //       <Box
// //         component="main"
// //         sx={{
// //           flexGrow: 1,
// //           width: {
// //             xs: "100%",
// //             md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
// //           },
// //           mt: `${APPBAR_HEIGHT}px`,
// //           minHeight: `calc(100vh - ${APPBAR_HEIGHT}px)`,
// //           overflow: "auto",
// //           transition: theme.transitions.create(["width", "margin"], {
// //             duration: theme.transitions.duration.shorter,
// //           }),
// //           transition: "width .32s ease",
// //         }}
// //       >
// //         {children}
// //       </Box>
// //     </Box>
// //   );
// // }

// import { useEffect, useRef, useState } from "react";
// import { useDispatch, useSelector } from "react-redux";
// import { useNavigate, useLocation } from "react-router-dom";
// import {
//   Box,
//   Drawer,
//   List,
//   ListItemButton,
//   ListItemIcon,
//   ListItemText,
//   AppBar,
//   Toolbar,
//   Typography,
//   IconButton,
//   Badge,
//   Divider,
//   Tooltip,
//   Avatar,
//   useMediaQuery,
//   useTheme,
// } from "@mui/material";
// import MenuIcon from "@mui/icons-material/Menu";
// import DashboardIcon from "@mui/icons-material/Dashboard";
// import FactoryIcon from "@mui/icons-material/Factory";
// import GrainIcon from "@mui/icons-material/Grain";
// import BuildIcon from "@mui/icons-material/Build";
// import SensorsIcon from "@mui/icons-material/Sensors";
// import VideocamIcon from "@mui/icons-material/Videocam";
// import NotificationsIcon from "@mui/icons-material/Notifications";
// import BarChartIcon from "@mui/icons-material/BarChart";
// import BoltIcon from "@mui/icons-material/Bolt";
// import SettingsIcon from "@mui/icons-material/Settings";
// import LightModeIcon from "@mui/icons-material/LightMode";
// import DarkModeIcon from "@mui/icons-material/DarkMode";
// import ConstructionIcon from "@mui/icons-material/Construction";
// import { toggleSidebar } from "@/store";
// import { useThemeMode } from "@/theme";
// import { LiveBadge } from "@/components/common";
// import { useVoiceAssistant } from "@/hooks/useVoiceAssistant"; // ← YANGI
// import VoiceAssistantIndicator from "@/components/VoiceAssistantIndicator"; // ← YANGI
// import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
// import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
// import PsychologyAltRoundedIcon from "@mui/icons-material/PsychologyAltRounded";
// import AutoAwesomeRoundedIcon from "@mui/icons-material/AutoAwesomeRounded";

// const DRAWER_WIDTH = 225;
// const APPBAR_HEIGHT = 52;

// const navItems = [
//   {
//     title: "Asosiy",
//     items: [
//       {
//         path: "/",
//         label: "Boshqaruv Paneli",
//         icon: <DashboardIcon sx={{ fontSize: 18 }} />,
//       },
//       {
//         path: "/bo'linmalar",
//         label: "Bo'linmalar",
//         icon: <FactoryIcon sx={{ fontSize: 18 }} />,
//       },
//       {
//         path: "/uchastkalar",
//         label: "Uchastkalar",
//         icon: <GrainIcon sx={{ fontSize: 18 }} />,
//       },
//       {
//         path: "/uskunalar",
//         label: "Uskunalar",
//         icon: <BuildIcon sx={{ fontSize: 18 }} />,
//         badge: 1,
//         badgeColor: "error",
//       },
//       {
//         path: "/datchiklar",
//         label: "Datchiklar",
//         icon: <SensorsIcon sx={{ fontSize: 18 }} />,
//         badge: 3,
//         badgeColor: "error",
//       },
//       {
//         path: "/kameralar",
//         label: "Kameralar",
//         icon: <VideocamIcon sx={{ fontSize: 18 }} />,
//       },
//     ],
//   },
//   {
//     title: "Boshqaruv",
//     items: [
//       {
//         path: "/analitika",
//         label: "Analitika",
//         icon: <BarChartIcon sx={{ fontSize: 18 }} />,
//       },
//       {
//         path: "/ogohlantirishlar",
//         label: "Ogohlantirishlar",
//         icon: <NotificationsIcon sx={{ fontSize: 18 }} />,
//         badge: 3,
//         badgeColor: "error",
//       },
//     ],
//   },
//   {
//     title: "Sun'iy intellekt",
//     items: [
//       {
//         path: "/armatura",
//         label: "Prokat LIVE",
//         icon: <ConstructionIcon sx={{ fontSize: 18 }} />,
//         live: true,
//       },
//       {
//         path: "/ppe",
//         label: "PPE",
//         icon: <SecurityRoundedIcon sx={{ fontSize: 18 }} />,
//       },
//       {
//         path: "/metal-zasolyonnost",
//         label: "Metal Zasolyonnost",
//         icon: <ScienceRoundedIcon sx={{ fontSize: 18 }} />,
//       },
//     ],
//   },
// ];

// function Clock() {
//   const [t, setT] = useState(new Date());

//   useEffect(() => {
//     const id = setInterval(() => setT(new Date()), 1000);
//     return () => clearInterval(id);
//   }, []);

//   return (
//     <Typography
//       sx={{
//         fontFamily: "'Arial', san-serif",
//         fontSize: "0.75rem",
//         color: "primary.main",
//         letterSpacing: "0.1em",
//         whiteSpace: "nowrap",
//       }}
//     >
//       {t.toLocaleTimeString("uz-UZ")}
//     </Typography>
//   );
// }

// export function Layout({ children }) {
//   const dispatch = useDispatch();
//   const open = useSelector((s) => s.ui.sidebarOpen);
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { toggleMode, isDark } = useThemeMode();

//   const theme = useTheme();
//   const isMobile = useMediaQuery(theme.breakpoints.down("md"));
//   const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

//   // ═══ YANGI: Voice Assistant ═══
//   const voice = useVoiceAssistant();
//   // ══════════════════════════════

//   const miniStats = [
//     { l: "Temp Maks", v: "1480°C", c: "#ff2d55" },
//     { l: "Orta Bosim", v: "4.8 bar", c: "#ff6b1a" },
//     { l: "Hosildorlik", v: "94.2%", c: isDark ? "#00ff9d" : "#00a85a" },
//     { l: "Smena", v: "II-SMENA", c: "primary.main" },
//   ];

//   const handleToggleSidebar = () => {
//     dispatch(toggleSidebar());
//   };

//   const handleNavigate = (path) => {
//     navigate(path);
//     if (isMobile && open) {
//       dispatch(toggleSidebar());
//     }
//   };

//   const drawerContent = (
//     <>
//       {/* <Box sx={{ p: 1.5, borderBottom: "1px solid", borderColor: "divider" }}>
//         {miniStats.map((s) => (
//           <Box
//             key={s.l}
//             sx={{
//               display: "flex",
//               justifyContent: "space-between",
//               alignItems: "center",
//               py: 0.6,
//             }}
//           >
//             <Typography
//               sx={{
//                 fontSize: "0.65rem",
//                 color: "text.secondary",
//                 fontFamily: "'Arial', san-serif",
//               }}
//             >
//               {s.l}
//             </Typography>
//             <Typography
//               sx={{
//                 fontFamily: "'Arial', san-serif",
//                 fontSize: "0.72rem",
//                 color: s.c,
//               }}
//             >
//               {s.v}
//             </Typography>
//           </Box>
//         ))}
//       </Box> */}

//       <List dense disablePadding sx={{ flex: 1 }}>
//         <Box sx={{ px: 2, pt: 1.5, pb: 0.5 }}>
//           <Typography
//             sx={{
//               fontFamily: "'Arial', san-serif",
//               fontSize: "0.55rem",
//               letterSpacing: "0.2em",
//               color: "text.disabled",
//               textTransform: "uppercase",
//             }}
//           >
//             Asosiy
//           </Typography>
//         </Box>

//         {navItems.slice(0, 6).map((item) => (
//           <ListItemButton
//             key={item.path}
//             selected={location.pathname === item.path}
//             onClick={() => handleNavigate(item.path)}
//             sx={{ py: 0.8, px: 2, minHeight: 38 }}
//           >
//             <ListItemIcon
//               sx={{
//                 minWidth: 32,
//                 color:
//                   location.pathname === item.path
//                     ? "primary.main"
//                     : "text.secondary",
//               }}
//             >
//               {item.badge ? (
//                 <Badge
//                   badgeContent={item.badge}
//                   color={item.badgeColor || "error"}
//                   sx={{
//                     "& .MuiBadge-badge": {
//                       fontSize: "0.5rem",
//                       minWidth: 14,
//                       height: 14,
//                     },
//                   }}
//                 >
//                   {item.icon}
//                 </Badge>
//               ) : (
//                 item.icon
//               )}
//             </ListItemIcon>
//             <ListItemText
//               primary={item.label}
//               primaryTypographyProps={{
//                 fontSize: "0.82rem",
//                 fontWeight: location.pathname === item.path ? 600 : 400,
//                 letterSpacing: "0.03em",
//               }}
//             />
//           </ListItemButton>
//         ))}

//         <Divider sx={{ my: 1 }} />

//         <Box sx={{ px: 2, pb: 0.5 }}>
//           <Typography
//             sx={{
//               fontFamily: "'Arial', san-serif",
//               fontSize: "0.55rem",
//               letterSpacing: "0.2em",
//               color: "text.disabled",
//               textTransform: "uppercase",
//             }}
//           >
//             Boshqaruv
//           </Typography>
//         </Box>

//         {navItems.slice(6).map((item) => (
//           <ListItemButton
//             key={item.path}
//             selected={location.pathname === item.path}
//             onClick={() => handleNavigate(item.path)}
//             sx={{ py: 0.8, px: 2, minHeight: 38 }}
//           >
//             <ListItemIcon
//               sx={{
//                 minWidth: 32,
//                 color:
//                   location.pathname === item.path
//                     ? "primary.main"
//                     : "text.secondary",
//               }}
//             >
//               {item.badge ? (
//                 <Badge
//                   badgeContent={item.badge}
//                   color={item.badgeColor || "error"}
//                   sx={{
//                     "& .MuiBadge-badge": {
//                       fontSize: "0.5rem",
//                       minWidth: 14,
//                       height: 14,
//                     },
//                   }}
//                 >
//                   {item.icon}
//                 </Badge>
//               ) : (
//                 item.icon
//               )}
//             </ListItemIcon>
//             <ListItemText
//               primary={item.label}
//               primaryTypographyProps={{
//                 fontSize: "0.82rem",
//                 fontWeight: location.pathname === item.path ? 600 : 400,
//               }}
//             />
//           </ListItemButton>
//         ))}

//         <Divider sx={{ my: 1 }} />

//         <ListItemButton sx={{ py: 0.8, px: 2, minHeight: 38 }}>
//           <ListItemIcon sx={{ minWidth: 32, color: "text.secondary" }}>
//             <SettingsIcon sx={{ fontSize: 18 }} />
//           </ListItemIcon>
//           <ListItemText
//             primary="Sozlamalar"
//             primaryTypographyProps={{ fontSize: "0.82rem" }}
//           />
//         </ListItemButton>
//       </List>

//       <Box
//         sx={{
//           p: 1.5,
//           borderTop: "1px solid",
//           borderColor: "divider",
//           display: "flex",
//           alignItems: "center",
//           gap: 1,
//         }}
//       >
//         <BoltIcon
//           sx={{ fontSize: 14, color: isDark ? "#00ff9d" : "#00a85a" }}
//         />
//         <Typography
//           sx={{
//             fontFamily: "'Arial', san-serif",
//             fontSize: "0.6rem",
//             color: "text.secondary",
//           }}
//         >
//           v2.4.1 · FAOL
//         </Typography>
//         <Box sx={{ flex: 1 }} />
//         <Typography
//           sx={{
//             fontFamily: "'Arial', san-serif",
//             fontSize: "0.6rem",
//             color: "text.secondary",
//           }}
//         >
//           {isDark ? "🌙 KECHA" : "☀️ KUNDUZ"}
//         </Typography>
//       </Box>
//     </>
//   );

//   const sloganWrapRef = useRef(null);
//   const sloganTextRef = useRef(null);
//   const [shouldAnimateSlogan, setShouldAnimateSlogan] = useState(false);

//   useEffect(() => {
//     const checkSloganOverflow = () => {
//       if (!sloganWrapRef.current || !sloganTextRef.current) return;

//       const wrapWidth = sloganWrapRef.current.offsetWidth;
//       const textWidth = sloganTextRef.current.scrollWidth;

//       setShouldAnimateSlogan(textWidth > wrapWidth);
//     };

//     checkSloganOverflow();

//     const timeout = setTimeout(checkSloganOverflow, 100);

//     window.addEventListener("resize", checkSloganOverflow);

//     return () => {
//       clearTimeout(timeout);
//       window.removeEventListener("resize", checkSloganOverflow);
//     };
//   }, [open, isMobile, isSmall]);

//   return (
//     <Box
//       sx={{
//         display: "flex",
//         minHeight: "100vh",
//         bgcolor: "background.default",
//       }}
//     >
//       <AppBar
//         position="fixed"
//         sx={{
//           zIndex: theme.zIndex.drawer + 1,
//           height: APPBAR_HEIGHT,
//           justifyContent: "center",
//           width: {
//             xs: "100%",
//             md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
//           },
//           ml: {
//             xs: 0,
//             md: open ? `${DRAWER_WIDTH}px` : 0,
//           },
//           transition: theme.transitions.create(["width", "margin"], {
//             duration: theme.transitions.duration.shorter,
//           }),
//         }}
//       >
//         <Toolbar
//           sx={{
//             minHeight: `${APPBAR_HEIGHT}px !important`,
//             px: { xs: 1, sm: 1.5, md: 2 },
//             gap: 1,
//             display: "flex",
//             alignItems: "center",
//           }}
//         >
//           {/* LEFT */}
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: 1,
//               minWidth: 0,
//               flexShrink: 0,
//             }}
//           >
//             <IconButton
//               size="small"
//               onClick={handleToggleSidebar}
//               sx={{
//                 color: "text.secondary",
//                 "&:hover": { color: "primary.main" },
//               }}
//             >
//               <MenuIcon fontSize="small" />
//             </IconButton>

//             <Box
//               sx={{
//                 display: "flex",
//                 alignItems: "center",
//                 gap: 1,
//                 minWidth: 0,
//               }}
//             >
//               <img
//                 src="/images/logo.svg"
//                 alt="logo"
//                 width={isSmall ? 24 : 30}
//               />

//               <Typography
//                 sx={{
//                   fontFamily: "'Arial', san-serif",
//                   fontSize: { xs: "0.72rem", sm: "0.85rem" },
//                   fontWeight: 900,
//                   letterSpacing: { xs: "0.06em", sm: "0.14em" },
//                   lineHeight: 1,
//                   color: "text.primary",
//                   textTransform: "uppercase",
//                   whiteSpace: "nowrap",
//                 }}
//               >
//                 Uzmetkombinat
//               </Typography>
//             </Box>

//             {!isSmall && (
//               <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//                 <Box
//                   sx={{
//                     width: 5,
//                     height: 5,
//                     borderRadius: "50%",
//                     background: isDark ? "#00ff9d" : "#00a85a",
//                     animation: "blink 1.2s step-end infinite",
//                     "@keyframes blink": {
//                       "50%": { opacity: 0.2 },
//                     },
//                   }}
//                 />
//               </Box>
//             )}
//           </Box>

//           {/* CENTER */}
//           {!isMobile && (
//             <Box
//               sx={{
//                 flex: 1,
//                 minWidth: 0,
//                 px: { md: 1, lg: 2 },
//                 display: "flex",
//                 alignItems: "center",
//                 overflow: "hidden",
//               }}
//             >
//               <Box
//                 ref={sloganWrapRef}
//                 sx={{
//                   width: "100%",
//                   overflow: "hidden",
//                   position: "relative",
//                   display: "flex",
//                   alignItems: "center",
//                   justifyContent: shouldAnimateSlogan ? "flex-start" : "center",
//                 }}
//               >
//                 <Typography
//                   ref={sloganTextRef}
//                   sx={{
//                     fontFamily: "'Arial', san-serif",
//                     fontSize: {
//                       md: open ? "0.66rem" : "0.76rem",
//                       lg: open ? "0.76rem" : "0.88rem",
//                       xl: "0.92rem",
//                     },
//                     fontWeight: 800,
//                     letterSpacing: {
//                       md: open ? "0.06em" : "0.12em",
//                       lg: open ? "0.12em" : "0.18em",
//                       xl: "0.22em",
//                     },
//                     textTransform: "uppercase",
//                     color: "primary.main",
//                     textAlign: "center",
//                     whiteSpace: "nowrap",
//                     width: "max-content",
//                     maxWidth: shouldAnimateSlogan ? "none" : "100%",
//                     overflow: "hidden",
//                     textOverflow: "ellipsis",
//                     display: "inline-block",
//                     textShadow: `
//                 0 0 5px rgba(0,255,157,0.6),
//                 0 0 10px rgba(0,255,157,0.4),
//                 0 0 20px rgba(0,255,157,0.2)
//               `,
//                     animation: shouldAnimateSlogan
//                       ? "sloganLeftToRight 12s linear infinite"
//                       : "none",
//                     "@keyframes sloganLeftToRight": {
//                       "0%": {
//                         transform: "translateX(-100%)",
//                       },
//                       "100%": {
//                         transform: "translateX(100%)",
//                       },
//                     },
//                   }}
//                 >
//                   RAQAMLI • INNOVATSION • XAVFSIZ KOMBINAT
//                 </Typography>
//               </Box>
//             </Box>
//           )}

//           {/* RIGHT */}
//           <Box
//             sx={{
//               display: "flex",
//               alignItems: "center",
//               gap: { xs: 0.5, sm: 1 },
//               flexShrink: 0,
//             }}
//           >
//             {/* ═══ YANGI: Voice Assistant Indicator ═══ */}
//             <VoiceAssistantIndicator
//               isEnabled={voice.isEnabled}
//               isListening={voice.isListening}
//               lastCommand={voice.lastCommand}
//               error={voice.error}
//               onToggle={voice.toggleMic}
//             />
//             {/* ════════════════════════════════════════ */}

//             {!isSmall && <LiveBadge />}
//             {!isSmall && <Clock />}

//             <Tooltip title={isDark ? "Kunduzgi rejim" : "Kechki rejim"}>
//               <IconButton
//                 size="small"
//                 onClick={toggleMode}
//                 sx={{
//                   color: isDark ? "#ffd60a" : "#0064c8",
//                   background: isDark
//                     ? "rgba(255,214,10,0.08)"
//                     : "rgba(0,100,200,0.08)",
//                   border: `1px solid ${
//                     isDark ? "rgba(255,214,10,0.2)" : "rgba(0,100,200,0.2)"
//                   }`,
//                   borderRadius: 1,
//                   width: 32,
//                   height: 32,
//                   transition: "all 0.3s",
//                   "&:hover": {
//                     background: isDark
//                       ? "rgba(255,214,10,0.16)"
//                       : "rgba(0,100,200,0.14)",
//                     transform: "rotate(20deg)",
//                   },
//                 }}
//               >
//                 {isDark ? (
//                   <LightModeIcon sx={{ fontSize: 16 }} />
//                 ) : (
//                   <DarkModeIcon sx={{ fontSize: 16 }} />
//                 )}
//               </IconButton>
//             </Tooltip>
//           </Box>
//         </Toolbar>
//       </AppBar>

//       <Drawer
//         variant={isMobile ? "temporary" : "persistent"}
//         open={open}
//         onClose={handleToggleSidebar}
//         ModalProps={{ keepMounted: true }}
//         sx={{
//           width: !(open || isMobile) ? 0 : DRAWER_WIDTH,
//           flexShrink: 0,
//           "& .MuiDrawer-paper": {
//             width: DRAWER_WIDTH,
//             mt: `${APPBAR_HEIGHT}px`,
//             height: `calc(100% - ${APPBAR_HEIGHT}px)`,
//             overflowX: "hidden",
//             boxSizing: "border-box",
//             transition: "width .32s ease",
//           },
//         }}
//       >
//         {drawerContent}
//       </Drawer>

//       <Box
//         component="main"
//         sx={{
//           flexGrow: 1,
//           width: {
//             xs: "100%",
//             md: open ? `calc(100% - ${DRAWER_WIDTH}px)` : "100%",
//           },
//           mt: `${APPBAR_HEIGHT}px`,
//           minHeight: `calc(100vh - ${APPBAR_HEIGHT}px)`,
//           overflow: "auto",
//           transition: "width .32s ease",
//         }}
//       >
//         {children}
//       </Box>
//     </Box>
//   );
// }

import { useEffect, useMemo, useRef, useState } from "react";
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
  useMediaQuery,
  useTheme,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
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
import ConstructionIcon from "@mui/icons-material/Construction";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SecurityRoundedIcon from "@mui/icons-material/SecurityRounded";
import ScienceRoundedIcon from "@mui/icons-material/ScienceRounded";
import PsychologyAltRoundedIcon from "@mui/icons-material/PsychologyAltRounded";

import { toggleSidebar } from "@/store";
import { useThemeMode } from "@/theme";
import { LiveBadge } from "@/components/common";
import { useVoiceAssistant } from "@/hooks/useVoiceAssistant";
import VoiceAssistantIndicator from "@/components/VoiceAssistantIndicator";
import TranslateIcon from "@mui/icons-material/Translate";
import { toggleScript } from "@/store";
import { useScriptText } from "@/hooks/useScriptText";
import SensorOccupiedRoundedIcon from "@mui/icons-material/SensorOccupiedRounded";

const DRAWER_WIDTH = 250;
const APPBAR_HEIGHT = 56;

const mainNavItems = [
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
    path: "/uskunalar",
    label: "Uskunalar",
    icon: <BuildIcon sx={{ fontSize: 18 }} />,
    badge: 0,
    badgeColor: "error",
  },
  {
    path: "/datchiklar",
    label: "Datchiklar",
    icon: <SensorsIcon sx={{ fontSize: 18 }} />,
    badge: 0,
    badgeColor: "error",
  },
  {
    path: "/kameralar",
    label: "Kameralar",
    icon: <VideocamIcon sx={{ fontSize: 18 }} />,
    badge: null,
  },
  // {
  //   path: "/kpp-monitoring",
  //   label: "KPP Monitoring",
  //   icon: <SensorOccupiedRoundedIcon sx={{ fontSize: 18 }} />,
  // },
];

const manageNavItems = [
  {
    path: "/analitika",
    label: "AI Tahlil",
    icon: <BarChartIcon sx={{ fontSize: 18 }} />,
    badge: null,
  },
  {
    path: "/ogohlantirishlar",
    label: "Ogohlantirishlar",
    icon: <NotificationsIcon sx={{ fontSize: 18 }} />,
    badge: 0,
    badgeColor: "error",
  },
];

const aiNavItems = [
  {
    path: "/armatura",
    label: "AI Prokat",
    icon: <ConstructionIcon sx={{ fontSize: 18 }} />,
    // live: true,
  },
  {
    path: "/ppe",
    label: "AI TB",
    icon: <SecurityRoundedIcon sx={{ fontSize: 18 }} />,
  },
  {
    path: "/metal-zasolyonnost",
    label: "AI LOM",
    icon: <ScienceRoundedIcon sx={{ fontSize: 18 }} />,
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
        fontFamily: "'Arial', san-serif",
        fontSize: "0.76rem",
        color: "text.secondary",
        letterSpacing: "0.08em",
        whiteSpace: "nowrap",
        fontWeight: 700,
      }}
    >
      {t.toLocaleTimeString("uz-UZ")}
    </Typography>
  );
}

function SectionLabel({ children, px = 2, pt = 1.5, pb = 0.6 }) {
  return (
    <Box sx={{ px, pt, pb }}>
      <Typography
        sx={{
          fontFamily: "serif, 'Arial', san-serif",
          fontSize: "0.56rem",
          letterSpacing: "0.18em",
          color: "text.secondary",
          textTransform: "uppercase",
          opacity: 0.9,
          fontWeight: 700,
        }}
      >
        {children}
      </Typography>
    </Box>
  );
}

export function Layout({ children }) {
  const dispatch = useDispatch();
  const open = useSelector((s) => s.ui.sidebarOpen);
  const navigate = useNavigate();
  const location = useLocation();
  const { toggleMode, isDark } = useThemeMode();
  const { script, t } = useScriptText();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const isSmall = useMediaQuery(theme.breakpoints.down("sm"));

  const voice = useVoiceAssistant();

  const aiPaths = useMemo(
    () => ["/armatura", "/ppe", "/metal-zasolyonnost"],
    [],
  );

  const [aiOpen, setAiOpen] = useState(aiPaths.includes(location.pathname));
  const sloganWrapRef = useRef(null);
  const sloganTextRef = useRef(null);
  const [shouldAnimateSlogan, setShouldAnimateSlogan] = useState(false);

  useEffect(() => {
    if (aiPaths.includes(location.pathname)) {
      setAiOpen(true);
    }
  }, [location.pathname, aiPaths]);

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

  const ui = {
    appBg: isDark ? "#0b1220" : "#eef3f8",
    paper: isDark ? "#111827" : "#ffffff",
    paperSoft: isDark ? "#0f172a" : "#f8fbff",
    sidebarBg: isDark
      ? "linear-gradient(180deg, #0b1220 0%, #0f172a 100%)"
      : "linear-gradient(180deg, #f8fbff 0%, #eef4fa 100%)",
    topbarBg: isDark ? "rgba(11,18,32,0.82)" : "rgba(255,255,255,0.88)",
    border: isDark ? "rgba(148,163,184,0.16)" : "rgba(15,23,42,0.08)",
    borderStrong: isDark ? "rgba(148,163,184,0.24)" : "rgba(15,23,42,0.12)",
    hover: isDark ? "rgba(255,255,255,0.05)" : "rgba(15,23,42,0.04)",
    hoverSoft: isDark ? "rgba(255,255,255,0.03)" : "rgba(15,23,42,0.025)",
    selected: isDark
      ? "linear-gradient(90deg, rgba(22,163,74,0.22), rgba(22,163,74,0.05))"
      : "linear-gradient(90deg, rgba(14,165,233,0.12), rgba(16,185,129,0.06))",
    selectedHover: isDark
      ? "linear-gradient(90deg, rgba(22,163,74,0.28), rgba(22,163,74,0.08))"
      : "linear-gradient(90deg, rgba(14,165,233,0.16), rgba(16,185,129,0.08))",
    activeLine: isDark ? "#22c55e" : "#0ea5e9",
    sloganColor: isDark ? "#38bdf8" : "#0f5fcc",
    sloganShadow: isDark
      ? "0 0 8px rgba(56,189,248,0.32), 0 0 18px rgba(34,197,94,0.12)"
      : "0 1px 0 rgba(255,255,255,0.7), 0 0 8px rgba(14,165,233,0.08)",
    icon: isDark ? "#94a3b8" : "#64748b",
    iconActive: isDark ? "#22c55e" : "#0ea5e9",
    chipBg: isDark ? "rgba(34,197,94,0.12)" : "rgba(16,185,129,0.10)",
    chipColor: isDark ? "#86efac" : "#047857",
    chipBorder: isDark ? "rgba(134,239,172,0.24)" : "rgba(4,120,87,0.16)",
    shadow: isDark
      ? "0 10px 30px rgba(0,0,0,0.28)"
      : "0 10px 24px rgba(15,23,42,0.06)",
    softShadow: isDark
      ? "0 8px 22px rgba(0,0,0,0.24)"
      : "0 8px 18px rgba(15,23,42,0.05)",
  };

  const handleToggleSidebar = () => {
    dispatch(toggleSidebar());
  };

  const handleNavigate = (path) => {
    navigate(path);
    if (isMobile && open) {
      dispatch(toggleSidebar());
    }
  };

  const renderNavItem = (item) => {
    const selected = location.pathname === item.path;

    return (
      <ListItemButton
        key={item.path}
        selected={selected}
        onClick={() => handleNavigate(item.path)}
        sx={{
          py: 0.95,
          px: 1.8,
          minHeight: 41,
          borderRadius: 2,
          mx: 1,
          mb: 0.45,
          position: "relative",
          color: selected ? "text.primary" : "text.secondary",
          border: `1px solid ${selected ? "transparent" : "transparent"}`,
          background: selected ? ui.selected : "transparent",
          transition: "all .22s ease",
          "&.Mui-selected": {
            background: ui.selected,
            boxShadow: ui.softShadow,
            borderColor: ui.border,
          },
          "&.Mui-selected:hover": {
            background: ui.selectedHover,
          },
          "&:hover": {
            background: selected ? ui.selectedHover : ui.hover,
          },
          "&::before": selected
            ? {
                content: '""',
                position: "absolute",
                left: 0,
                top: 8,
                bottom: 8,
                width: 4,
                borderRadius: 999,
                background: ui.activeLine,
              }
            : undefined,
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 34,
            color: selected ? ui.iconActive : ui.icon,
            transition: "all .2s ease",
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
          primary={t(item.label)}
          primaryTypographyProps={{
            fontSize: "1rem",
            fontWeight: selected ? "bold" : 600,
            letterSpacing: "0.02em",
            color: selected ? "text.primary" : "text.secondary",
          }}
        />

        {item.live && (
          <Chip
            label="LIVE"
            size="small"
            sx={{
              height: 20,
              fontSize: "0.52rem",
              fontFamily: "'Arial', san-serif",
              color: ui.chipColor,
              border: `1px solid ${ui.chipBorder}`,
              background: ui.chipBg,
              ".MuiChip-label": { px: 0.85, fontWeight: 700 },
            }}
          />
        )}
      </ListItemButton>
    );
  };

  const drawerContent = (
    <>
      <List dense disablePadding sx={{ flex: 1, pt: 0.5 }}>
        <SectionLabel>Asosiy</SectionLabel>
        {mainNavItems.map(renderNavItem)}

        <Divider sx={{ my: 1.1, borderColor: ui.border }} />

        <SectionLabel px={2} pt={0.4} pb={0.55}>
          Boshqaruv
        </SectionLabel>
        {manageNavItems.map(renderNavItem)}

        <Divider sx={{ my: 1.1, borderColor: ui.border }} />

        <Box sx={{ px: 1 }}>
          <Accordion
            expanded={aiOpen}
            onChange={() => setAiOpen((v) => !v)}
            disableGutters
            elevation={0}
            sx={{
              background: ui.hoverSoft,
              color: "inherit",
              border: `1px solid ${ui.border}`,
              "&:before": { display: "none" },
              borderRadius: 2.5,
              overflow: "hidden",
              boxShadow: "none",
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon
                  sx={{
                    color: aiOpen ? ui.iconActive : "text.secondary",
                    fontSize: 20,
                  }}
                />
              }
              sx={{
                minHeight: 42,
                px: 1.2,
                "& .MuiAccordionSummary-content": {
                  my: 0.7,
                  alignItems: "center",
                  gap: 1,
                },
                "&:hover": {
                  background: ui.hover,
                },
              }}
            >
              <PsychologyAltRoundedIcon
                sx={{
                  fontSize: 18,
                  color: aiOpen ? ui.iconActive : ui.icon,
                }}
              />
              <Typography
                sx={{
                  fontFamily: "serif, 'Arial', san-serif",
                  fontSize: "0.72rem",
                  letterSpacing: "0.12em",
                  color: aiOpen ? "text.primary" : "text.secondary",
                  textTransform: "uppercase",
                  fontWeight: 700,
                }}
              >
                {t("Sun'iy intellekt")}
              </Typography>
            </AccordionSummary>

            <AccordionDetails sx={{ px: 0, pt: 0.15, pb: 0.45 }}>
              <List disablePadding dense>
                {aiNavItems.map(renderNavItem)}
              </List>
            </AccordionDetails>
          </Accordion>
        </Box>

        <Divider sx={{ my: 1.1, borderColor: ui.border }} />

        <ListItemButton
          sx={{
            py: 0.95,
            px: 1.8,
            minHeight: 41,
            borderRadius: 2,
            mx: 1,
            mb: 0.4,
            "&:hover": {
              background: ui.hover,
            },
          }}
        >
          <ListItemIcon sx={{ minWidth: 34, color: ui.icon }}>
            <SettingsIcon sx={{ fontSize: 18 }} />
          </ListItemIcon>
          <ListItemText
            primary={t("Sozlamalar")}
            primaryTypographyProps={{
              fontSize: "0.83rem",
              fontWeight: 500,
              color: "text.secondary",
            }}
          />
        </ListItemButton>
      </List>

      <Box
        sx={{
          p: 1.6,
          borderTop: `1px solid ${ui.border}`,
          display: "flex",
          alignItems: "center",
          gap: 1,
          background: isDark
            ? "rgba(255,255,255,0.02)"
            : "rgba(255,255,255,0.55)",
        }}
      >
        <BoltIcon
          sx={{
            fontSize: 14,
            color: isDark ? "#22c55e" : "#0ea5e9",
          }}
        />

        <Box sx={{ flex: 1 }} />
        <Typography
          sx={{
            fontFamily: "'Arial', san-serif",
            fontSize: "0.62rem",
            color: "text.secondary",
            fontWeight: 700,
          }}
        >
          {isDark ? "🌙 KECHA" : "☀️ KUNDUZ"}
        </Typography>
      </Box>
    </>
  );

  return (
    <Box
      sx={{
        display: "flex",
        minHeight: "100vh",
        bgcolor: ui.appBg,
      }}
    >
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
          background: ui.topbarBg,
          backdropFilter: "blur(14px)",
          borderBottom: `1px solid ${ui.border}`,
          boxShadow: ui.shadow,
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
                border: `1px solid ${ui.border}`,
                background: isDark
                  ? "rgba(255,255,255,0.03)"
                  : "rgba(255,255,255,0.7)",
                "&:hover": {
                  color: "primary.main",
                  background: ui.hover,
                },
              }}
            >
              <MenuIcon fontSize="small" />
            </IconButton>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: { xs: 0.5, sm: 1 },
                flexShrink: 0,
              }}
            >
              <VoiceAssistantIndicator
                isEnabled={voice.isEnabled}
                isListening={voice.isListening}
                lastCommand={voice.lastCommand}
                error={voice.error}
                onToggle={voice.toggleMic}
              />

              {/* {!isSmall && <LiveBadge />} */}
              {!isSmall && <Clock />}

              <Tooltip title={isDark ? "Kunduzgi rejim" : "Kechki rejim"}>
                <IconButton
                  size="small"
                  onClick={toggleMode}
                  sx={{
                    color: isDark ? "#facc15" : "#2563eb",
                    background: isDark
                      ? "rgba(250,204,21,0.10)"
                      : "rgba(37,99,235,0.08)",
                    border: `1px solid ${
                      isDark ? "rgba(250,204,21,0.22)" : "rgba(37,99,235,0.14)"
                    }`,
                    borderRadius: 1.5,
                    width: 34,
                    height: 34,
                    transition: "all 0.25s ease",
                    "&:hover": {
                      background: isDark
                        ? "rgba(250,204,21,0.16)"
                        : "rgba(37,99,235,0.12)",
                      transform: "translateY(-1px) rotate(10deg)",
                    },
                  }}
                >
                  {isDark ? (
                    <LightModeIcon sx={{ fontSize: 17 }} />
                  ) : (
                    <DarkModeIcon sx={{ fontSize: 17 }} />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title={script === "latin" ? "Кирилл" : "Lotin"}>
                <IconButton
                  size="small"
                  onClick={() => dispatch(toggleScript())}
                  sx={{
                    color: "text.secondary",
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 1,
                    width: 32,
                    height: 32,
                  }}
                >
                  <TranslateIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Tooltip>
            </Box>

            {!isSmall && (
              <Box
                sx={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: isDark ? "#22c55e" : "#16a34a",
                  boxShadow: isDark
                    ? "0 0 10px rgba(34,197,94,0.5)"
                    : "0 0 8px rgba(22,163,74,0.25)",
                }}
              />
            )}
          </Box>

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
                    fontFamily: "'Arial', san-serif",
                    fontSize: {
                      md: open ? "1rem" : "1.5rem",
                      lg: open ? "1rem" : "1.5rem",
                      xl: "1.2rem",
                    },
                    fontWeight: "bold",
                    letterSpacing: {
                      md: open ? "0.08em" : "0.12em",
                      lg: open ? "0.12em" : "0.18em",
                      xl: "0.22em",
                    },
                    textTransform: "uppercase",
                    color: ui.sloganColor,
                    textAlign: "center",
                    whiteSpace: "nowrap",
                    width: "max-content",
                    maxWidth: shouldAnimateSlogan ? "none" : "100%",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    display: "inline-block",
                    textShadow: ui.sloganShadow,
                    opacity: isDark ? 1 : 0.95,
                    animation: shouldAnimateSlogan
                      ? "sloganLeftToRight 14s linear infinite"
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
                  {t("RAQAMLI INNOVATSION XAVFSIZ KOMBINAT")}
                </Typography>
              </Box>
            </Box>
          )}

          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              minWidth: 0,
            }}
          >
            <img src="/images/logo.svg" alt="logo" width={isSmall ? 24 : 30} />

            <Typography
              sx={{
                fontFamily: "'Arial', san-serif",
                fontSize: { xs: "0.72rem", sm: "0.88rem" },
                fontWeight: 900,
                letterSpacing: { xs: "0.05em", sm: "0.12em" },
                lineHeight: 1,
                color: isDark ? "#f8fafc" : "#1e293b",
                textTransform: "uppercase",
                whiteSpace: "nowrap",
              }}
            >
              {t("UZMETKOMBINAT")}
            </Typography>
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
            background: ui.sidebarBg,
            color: "text.primary",
            borderRight: `1px solid ${ui.border}`,
            boxShadow: ui.shadow,
            backdropFilter: "blur(12px)",
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
          transition: "width .32s ease",
          background: ui.appBg,
        }}
      >
        {children}
      </Box>
    </Box>
  );
}

import { createContext, useContext, useState, useMemo } from "react";
import { createTheme, alpha } from "@mui/material/styles";

const ThemeContext = createContext();
export const useThemeMode = () => useContext(ThemeContext);

const getTokens = (mode) =>
  mode === "dark"
    ? {
        bg: "#060810",
        bgSecond: "#0a0e1a",
        bgCard: "#0d1220",
        border: "#1e2a3d",
        borderHov: "rgba(0,212,255,0.2)",
        textPri: "#e8eaf0",
        textSec: "#6b7280",
        textDis: "#374151",
        gridLine: "rgba(0,212,255,0.04)",
        appBar: "rgba(6,8,16,0.96)",
        sidebar: "#0a0e1a",
        tableHead: "rgba(255,255,255,0.02)",
        rowHover: "rgba(0,212,255,0.03)",
        accent: "#00d4ff",
        miniStatBg: "rgba(0,0,0,0.2)",
      }
    : {
        bg: "#f0f4f8",
        bgSecond: "#e8eef5",
        bgCard: "#ffffff",
        border: "#d1dce8",
        borderHov: "rgba(0,100,200,0.3)",
        textPri: "#0f1923",
        textSec: "#5a6a7e",
        textDis: "#9aaab8",
        gridLine: "rgba(0,100,200,0.05)",
        appBar: "rgba(240,244,248,0.96)",
        sidebar: "#e8eef5",
        tableHead: "rgba(0,0,0,0.03)",
        rowHover: "rgba(0,100,200,0.04)",
        accent: "#0064c8",
        miniStatBg: "rgba(0,0,0,0.03)",
      };

export const buildTheme = (mode) => {
  const t = getTokens(mode);
  const isDark = mode === "dark";
  const primary = isDark ? "#00d4ff" : "#0064c8";

  return createTheme({
    palette: {
      mode,
      primary: {
        main: primary,
        dark: isDark ? "#0099cc" : "#004fa0",
        light: isDark ? "#66e3ff" : "#4d9ee8",
      },
      secondary: { main: "#ff6b1a", dark: "#cc4400", light: "#ff9955" },
      error: { main: "#ff2d55" },
      warning: { main: isDark ? "#ffd60a" : "#d97700" },
      success: { main: isDark ? "#00ff9d" : "#00a85a" },
      info: { main: primary },
      background: { default: t.bg, paper: t.bgCard },
      text: { primary: t.textPri, secondary: t.textSec, disabled: t.textDis },
      divider: t.border,
    },
    typography: {
      fontFamily: "'Rajdhani', sans-serif",
      h1: { fontFamily: "'Orbitron', monospace", fontWeight: 900 },
      h2: { fontFamily: "'Orbitron', monospace", fontWeight: 700 },
      h3: { fontFamily: "'Orbitron', monospace", fontWeight: 700 },
      h4: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 700 },
      h5: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 },
      h6: { fontFamily: "'Rajdhani', sans-serif", fontWeight: 600 },
      subtitle1: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "0.75rem",
        letterSpacing: "0.1em",
      },
      subtitle2: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "0.7rem",
        letterSpacing: "0.15em",
      },
      caption: {
        fontFamily: "'Share Tech Mono', monospace",
        fontSize: "0.65rem",
        letterSpacing: "0.1em",
      },
      overline: {
        fontFamily: "'Share Tech Mono', monospace",
        letterSpacing: "0.2em",
      },
    },
    shape: { borderRadius: 3 },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            background: t.bg,
            backgroundImage: `linear-gradient(${t.gridLine} 1px,transparent 1px),linear-gradient(90deg,${t.gridLine} 1px,transparent 1px)`,
            backgroundSize: "40px 40px",
            transition: "background-color 0.35s ease",
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: "none",
            background: t.bgCard,
            border: `1px solid ${t.border}`,
            transition: "border-color 0.2s, background 0.35s",
            "&:hover": { borderColor: t.borderHov },
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            "& .MuiTableCell-head": {
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: t.textSec,
              borderBottom: `1px solid ${t.border}`,
              background: t.tableHead,
              padding: "8px 12px",
            },
          },
        },
      },
      MuiTableCell: {
        styleOverrides: {
          root: {
            borderBottom: `1px solid ${alpha(t.border, 0.7)}`,
            padding: "10px 12px",
            fontSize: "0.85rem",
            color: t.textPri,
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            "&:hover": { background: t.rowHover },
            "&:last-child td": { borderBottom: "none" },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.65rem",
            letterSpacing: "0.1em",
            borderRadius: 2,
            height: 22,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 600,
            letterSpacing: "0.1em",
            textTransform: "uppercase",
            borderRadius: 2,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            background: t.sidebar,
            border: "none",
            borderRight: `1px solid ${t.border}`,
            transition: "background 0.35s",
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            background: t.appBar,
            backdropFilter: "blur(12px)",
            borderBottom: `1px solid ${t.border}`,
            boxShadow: "none",
            transition: "background 0.35s",
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 0,
            borderLeft: "2px solid transparent",
            "&.Mui-selected": {
              background: alpha(primary, 0.08),
              borderLeftColor: primary,
              color: primary,
              "& .MuiListItemIcon-root": { color: primary },
              "&:hover": { background: alpha(primary, 0.12) },
            },
            "&:hover": {
              background: alpha(primary, 0.05),
              borderLeftColor: alpha(primary, 0.3),
            },
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 2,
            height: 4,
            background: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.09)",
          },
          bar: { borderRadius: 2 },
        },
      },
      MuiDataGrid: {
        styleOverrides: {
          root: {
            border: "none",
            color: t.textPri,
            "& .MuiDataGrid-columnHeaders": {
              background: t.tableHead,
              borderBottom: `1px solid ${t.border}`,
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.65rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              color: t.textSec,
            },
            "& .MuiDataGrid-row:hover": { background: t.rowHover },
            "& .MuiDataGrid-cell": {
              borderBottom: `1px solid ${alpha(t.border, 0.5)}`,
              color: t.textPri,
            },
            "& .MuiDataGrid-footerContainer": {
              borderTop: `1px solid ${t.border}`,
              background: t.tableHead,
            },
            "& .MuiTablePagination-root": { color: t.textSec },
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.7rem",
            letterSpacing: "0.15em",
            textTransform: "uppercase",
            minHeight: 44,
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: {
            "& fieldset": { borderColor: t.border },
            "&:hover fieldset": { borderColor: `${t.borderHov} !important` },
            "&.Mui-focused fieldset": { borderColor: `${primary} !important` },
          },
        },
      },
      MuiInputLabel: {
        styleOverrides: {
          root: {
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.7rem",
            color: t.textSec,
          },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: {
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.75rem",
          },
        },
      },
      MuiToggleButton: {
        styleOverrides: {
          root: {
            border: `1px solid ${t.border}`,
            color: t.textSec,
            "&.Mui-selected": {
              background: alpha(primary, 0.1),
              color: primary,
              borderColor: alpha(primary, 0.3),
            },
          },
        },
      },
      MuiDivider: { styleOverrides: { root: { borderColor: t.border } } },
      MuiMenuItem: {
        styleOverrides: {
          root: {
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.75rem",
          },
        },
      },
    },
  });
};

export function ThemeModeProvider({ children }) {
  const [mode, setMode] = useState(() => {
    try {
      return localStorage.getItem("pyv-theme") || "dark";
    } catch {
      return "dark";
    }
  });

  const toggleMode = () => {
    const next = mode === "dark" ? "light" : "dark";
    setMode(next);
    try {
      localStorage.setItem("pyv-theme", next);
    } catch {}
  };

  const theme = useMemo(() => buildTheme(mode), [mode]);

  return (
    <ThemeContext.Provider
      value={{ mode, toggleMode, isDark: mode === "dark" }}
    >
      {children(theme, mode)}
    </ThemeContext.Provider>
  );
}

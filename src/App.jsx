import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import {
  ThemeProvider as MuiThemeProvider,
  CssBaseline,
  Box,
} from "@mui/material";
import { ThemeModeProvider } from "@/theme";
import { store } from "@/store";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Sexlar from "./pages/Sexlar";
import Uchastkalar from "@/pages/Uchastkalar";
import Uskunalar from "@/pages/Uskunalar";
import Datchiklar from "@/pages/Datchiklar";
import Kameralar from "@/components/voices/Kameralar";
import Ogohlantirishlar from "@/pages/Ogohlantirishlar";
import Analitika from "@/pages/Analitika";
import UskunaDetail from "./pages/UskunlarDetail";
import ProkatLivePage from "./components/ProkatLivePage";
import VoiceCalibration from "./pages/voiceCalibration/VoiceCalibration";
import MonitoringDashboard from "./pages/MonitoringDashboard";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { staleTime: 30000, retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <Provider store={store}>
      <QueryClientProvider client={queryClient}>
        <ThemeModeProvider>
          {(muiTheme) => (
            <MuiThemeProvider theme={muiTheme}>
              <CssBaseline />
              <BrowserRouter>
                <Layout>
                  <Routes>
                    <Route path="/" element={<Dashboard />} />
                    <Route path="/bo'linmalar" element={<Sexlar />} />
                    {/* <Route
                      path="/monitoring"
                      element={<MonitoringDashboard />}
                    /> */}
                    <Route
                      path="/uchastkalar"
                      element={<MonitoringDashboard />}
                    />
                    <Route path="/uskunalar" element={<Uskunalar />} />
                    <Route path="/uskunalar/:id" element={<UskunaDetail />} />
                    <Route path="/datchiklar" element={<Datchiklar />} />
                    <Route path="/kameralar" element={<Kameralar />} />
                    <Route path="/analitika" element={<Analitika />} />
                    <Route
                      path="/ogohlantirishlar"
                      element={<Ogohlantirishlar />}
                    />
                    <Route path="/armatura" element={<ProkatLivePage />} />
                    <Route
                      path="/voice-calibration"
                      element={<VoiceCalibration />}
                    />
                    <Route path="/ppe" element={<PPEPage />} />
                    {/* <Route path="/metal-zasolyonnost" element={<MetalZasolyonnostPage />} /> */}
                  </Routes>
                </Layout>
              </BrowserRouter>
            </MuiThemeProvider>
          )}
        </ThemeModeProvider>
        {/* <ReactQueryDevtools initialIsOpen={false} /> */}
      </QueryClientProvider>
    </Provider>
  );
}

import { useState, useEffect } from "react";

function PPEPage() {
  const [streamKey, setStreamKey] = useState(Date.now());

  // Har safar sahifa mount bo'lganda yangi key = yangi connection
  useEffect(() => {
    setStreamKey(Date.now());
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        marginTop: "50px",
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        gap: "4px",
        background: "#070a12",
        border: "1px solid #1e2a3d",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {[1, 2, 3, 4].map((id) => (
        <Box
          key={`${id}-${streamKey}`}
          component="img"
          src={`http://172.16.55.12:8006/video/${id}?t=${streamKey}`}
          alt={`camera-${id}`}
          sx={{
            width: "100%",
            aspectRatio: "16/9",
            objectFit: "cover",
            display: "block",
          }}
        />
      ))}
    </Box>
  );
}

function MetalZasolyonnostPage() {
  return <div>Metal Zasolyonnost Page</div>;
}

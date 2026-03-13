import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Provider } from "react-redux";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { ThemeProvider as MuiThemeProvider, CssBaseline } from "@mui/material";
import { ThemeModeProvider } from "@/theme";
import { store } from "@/store";
import { Layout } from "@/components/layout/Layout";
import Dashboard from "@/pages/Dashboard";
import Sexlar from "./pages/Sexlar";
import Uchastkalar from "@/pages/Uchastkalar";
import Uskunalar from "@/pages/Uskunalar";
import Datchiklar from "@/pages/Datchiklar";
import Kameralar from "@/pages/Kameralar";
import Ogohlantirishlar from "@/pages/Ogohlantirishlar";
import Analitika from "@/pages/Analitika";

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
                    <Route path="/sexlar" element={<Sexlar />} />
                    <Route path="/uchastkalar" element={<Uchastkalar />} />
                    <Route path="/uskunalar" element={<Uskunalar />} />
                    <Route path="/datchiklar" element={<Datchiklar />} />
                    <Route path="/kameralar" element={<Kameralar />} />
                    <Route path="/analitika" element={<Analitika />} />
                    <Route
                      path="/ogohlantirishlar"
                      element={<Ogohlantirishlar />}
                    />
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

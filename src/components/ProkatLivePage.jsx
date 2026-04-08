import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Container,
  Stack,
  Typography,
} from "@mui/material";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import { useQuery } from "@tanstack/react-query";

// const API_BASE = "";
// Agar backend boshqa host/portda bo'lsa:
const API_BASE = "http://172.16.55.13:8000";

function StatusChip({ label, value }) {
  return (
    <Chip
      label={
        <Box sx={{ display: "flex", gap: 0.7, alignItems: "center" }}>
          <Typography
            component="span"
            sx={{
              fontWeight: 500,
              fontSize: 13,
              color: "rgba(255,255,255,0.8)",
            }}
          >
            {label}:
          </Typography>
          <Typography
            component="span"
            sx={{ fontWeight: 700, fontSize: 13, color: "#fff" }}
          >
            {value}
          </Typography>
        </Box>
      }
      sx={{
        height: 42,
        px: 1,
        borderRadius: "14px",
        background: "rgba(0,0,0,0.25)",
        color: "#fff",
        border: "1px solid rgba(255,255,255,0.12)",
        "& .MuiChip-label": {
          px: 1,
        },
      }}
    />
  );
}

export default function ProkatLivePage() {
  const [imageSrc, setImageSrc] = useState("");
  const [wsConnected, setWsConnected] = useState(false);
  const boxRef = useRef(null);
  const lastObjectUrlRef = useRef(null);

  const { data } = useQuery({
    queryKey: ["prokat-status"],
    queryFn: async () => {
      const res = await fetch(`${API_BASE}/api/status`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Status olinmadi");
      }
      return res.json();
    },
    refetchInterval: 2000,
    retry: true,
  });

  const statusData = useMemo(() => {
    return {
      status: data?.status || "",
      device: (data?.device || "").toUpperCase(),
      fps: Number(data?.fps || 0).toFixed(1),
      det: Number(data?.det_ms || 0).toFixed(1),
      gm: Number(data?.gpu_mem_gb || 0).toFixed(2),
      tl: Number(data?.last_total_length || 0).toFixed(2),
      db: data?.last_db_save || "-",
    };
  }, [data]);

  useEffect(() => {
    let ws;
    let reconnectTimer;

    const connectWS = () => {
      const isHttps = window.location.protocol === "https:";
      const wsProtocol = isHttps ? "wss" : "ws";

      let wsUrl = "";
      if (API_BASE) {
        const normalized = API_BASE.replace(/^http/, "ws");
        wsUrl = `${normalized}/ws`;
      } else {
        wsUrl = `${wsProtocol}://${window.location.host}/ws`;
      }

      ws = new WebSocket(wsUrl);
      ws.binaryType = "arraybuffer";

      ws.onopen = () => {
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        const blob = new Blob([event.data], { type: "image/jpeg" });
        const objectUrl = URL.createObjectURL(blob);

        if (lastObjectUrlRef.current) {
          URL.revokeObjectURL(lastObjectUrlRef.current);
        }

        lastObjectUrlRef.current = objectUrl;
        setImageSrc(objectUrl);
      };

      ws.onclose = () => {
        setWsConnected(false);
        reconnectTimer = setTimeout(connectWS, 1000);
      };

      ws.onerror = () => {
        setWsConnected(false);
        ws.close();
      };
    };

    connectWS();

    return () => {
      if (reconnectTimer) clearTimeout(reconnectTimer);
      if (ws) ws.close();
      if (lastObjectUrlRef.current) {
        URL.revokeObjectURL(lastObjectUrlRef.current);
      }
    };
  }, []);

  const handleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await boxRef.current?.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch (error) {
      console.error("Fullscreen error:", error);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "transparent",
        color: "#fff",
        py: 2,
      }}
    >
      <Container maxWidth="xl">
        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            mb: 2,
          }}
        >
          <Button
            onClick={handleFullscreen}
            startIcon={<FullscreenIcon />}
            variant="contained"
            sx={{
              borderRadius: "12px",
              px: 2,
              py: 1,
              fontWeight: 700,
              background: "linear-gradient(to right, #00ff88, #00ccff)",
              color: "#000",
              boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
              "&:hover": {
                background: "linear-gradient(to right, #00e67a, #00b8e6)",
              },
            }}
          >
            ⛶ To&apos;liq Ekran
          </Button>
        </Box>

        {/* <Typography
          variant="h4"
          sx={{
            textAlign: "center",
            fontWeight: 800,
            mb: 3,
            letterSpacing: 1,
          }}
        >
          🏭 PROKAT LIVE
        </Typography>

        <Stack
          direction="row"
          spacing={1.5}
          useFlexGap
          flexWrap="wrap"
          sx={{ mb: 2 }}
        >
          <StatusChip
            label="Status"
            value={wsConnected ? statusData.status || "online" : "offline"}
          />
          <StatusChip label="Device" value={statusData.device} />
          <StatusChip label="FPS" value={statusData.fps} />
          <StatusChip label="Det(ms)" value={statusData.det} />
          <StatusChip label="GPU Mem(GB)" value={statusData.gm} />
          <StatusChip label="Total(m)" value={statusData.tl} />
          <StatusChip label="DB Save" value={statusData.db} />
        </Stack> */}

        <Card
          ref={boxRef}
          sx={{
            borderRadius: "18px",
            background: "rgba(255,255,255,0.10)",
            border: "1px solid rgba(255,255,255,0.18)",
            boxShadow: "0 12px 30px rgba(0,0,0,0.25)",
            overflow: "hidden",
            backdropFilter: "blur(8px)",
            "&:fullscreen": {
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: "#000",
              p: 0,
            },
            "&:fullscreen img": {
              width: "100%",
              height: "100vh",
              objectFit: "contain",
            },
          }}
        >
          <CardContent sx={{ p: 1.5, "&:last-child": { pb: 1.5 } }}>
            <Box
              sx={{
                width: "100%",
                minHeight: { xs: 260, sm: 420, md: 600 },
                borderRadius: "14px",
                overflow: "hidden",
                background: "#000",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {imageSrc ? (
                <Box
                  component="img"
                  src={imageSrc}
                  alt="Prokat live stream"
                  sx={{
                    width: "100%",
                    display: "block",
                    borderRadius: "14px",
                    background: "#000",
                  }}
                />
              ) : (
                <Typography
                  sx={{
                    color: "rgba(255,255,255,0.7)",
                    fontSize: 18,
                    fontWeight: 600,
                  }}
                >
                  Stream yuklanmoqda...
                </Typography>
              )}
            </Box>
          </CardContent>
        </Card>
      </Container>
    </Box>
  );
}

import React, { useEffect, useRef, useState, useCallback } from "react";

const CAMERA_API = "https://172.16.55.13:8011";
const WS_BASE = "wss://172.16.55.13:8009/ws/ai";
const STREAM_BASE = "https://172.16.55.13:8889";

const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 15000;
const BOX_HOLD_MS = 900;
const BOX_MAX_AGE_MS = 1400;

function buildStreamUrl(cam, large = false) {
  if (!cam?.mediamtx_name) return "";
  const path = large ? `${cam.mediamtx_name}_main` : `${cam.mediamtx_name}_sub`;
  return `${STREAM_BASE}/${path}?controls=false&muted=true&autoplay=true&playsInline=true`;
}

function buildWsUrl(cam) {
  if (!cam?.mediamtx_name) return "";
  return `${WS_BASE}/${cam.mediamtx_name}`;
}

function makeDetectionKey(det, index) {
  if (det.id !== undefined && det.id !== null) return String(det.id);

  const [x1, y1] = det.bbox || [0, 0, 0, 0];
  const gx = Math.round(x1 / 40);
  const gy = Math.round(y1 / 40);

  return `${det.label}-${gx}-${gy}-${index}`;
}

function normalizeDetections(incoming, now) {
  return (incoming || [])
    .filter((det) => Array.isArray(det.bbox) && det.bbox.length === 4)
    .map((det, index) => ({
      ...det,
      id: makeDetectionKey(det, index),
      lastSeen: now,
      firstSeen: now,
      stale: false,
    }));
}

export default function AILom() {
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const mountedRef = useRef(false);
  const attemptRef = useRef(0);

  const [cameras, setCameras] = useState([]);
  const [fullscreenCam, setFullscreenCam] = useState(null);

  const [status, setStatus] = useState("connecting");
  const [danger, setDanger] = useState(false);
  const [detections, setDetections] = useState([]);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

  const loadCameras = useCallback(async () => {
    try {
      const res = await fetch(`${CAMERA_API}/api/cameras`);
      const data = await res.json();

      const list = (data.data || []).filter(
        (cam) => cam.purpose === "ai_lom" && cam.holat === "jonli",
      );

      setCameras(list);
    } catch (err) {
      console.error("Camera load error:", err);
    }
  }, []);

  useEffect(() => {
    loadCameras();
    const timer = setInterval(loadCameras, 10000);
    return () => clearInterval(timer);
  }, [loadCameras]);

  useEffect(() => {
    const onEsc = (e) => {
      if (e.key === "Escape") setFullscreenCam(null);
    };

    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, []);

  const clearReconnect = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
  }, []);

  const closeSocket = useCallback(() => {
    const ws = wsRef.current;
    if (!ws) return;

    ws.onopen = null;
    ws.onmessage = null;
    ws.onerror = null;
    ws.onclose = null;

    try {
      if (
        ws.readyState === WebSocket.OPEN ||
        ws.readyState === WebSocket.CONNECTING
      ) {
        ws.close();
      }
    } catch (_) {}

    wsRef.current = null;
  }, []);

  const scheduleReconnect = useCallback(() => {
    clearReconnect();

    const attempt = attemptRef.current++;
    const delay = Math.min(
      BASE_RECONNECT_DELAY * 2 ** attempt,
      MAX_RECONNECT_DELAY,
    );

    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current && !document.hidden) {
        connect();
      }
    }, delay);
  }, [clearReconnect]);

  const connect = useCallback(() => {
    clearReconnect();
    closeSocket();

    if (!mountedRef.current || document.hidden || !fullscreenCam) return;

    setStatus("connecting");

    let ws;

    try {
      ws = new WebSocket(buildWsUrl(fullscreenCam));
    } catch (err) {
      console.error("WebSocket create error:", err);
      setStatus("error");
      scheduleReconnect();
      return;
    }

    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      attemptRef.current = 0;
      setStatus("live");
    };

    ws.onmessage = (event) => {
      if (!mountedRef.current) return;

      try {
        const data = JSON.parse(event.data);
        const now = Date.now();

        setStatus(data.status || "live");
        setDanger(Boolean(data.danger));

        setFrameSize({
          width: data.frame_width || 0,
          height: data.frame_height || 0,
        });

        const incoming = normalizeDetections(data.detections || [], now);

        setDetections((prev) => {
          const prevMap = new Map(prev.map((item) => [item.id, item]));

          const merged = incoming.map((item) => {
            const old = prevMap.get(item.id);

            return {
              ...item,
              firstSeen: old?.firstSeen || now,
              lastSeen: now,
              stale: false,
            };
          });

          const incomingIds = new Set(incoming.map((item) => item.id));
          const heldOld = prev
            .filter((item) => !incomingIds.has(item.id))
            .filter((item) => now - item.lastSeen <= BOX_HOLD_MS)
            .map((item) => ({
              ...item,
              stale: true,
            }));

          return [...merged, ...heldOld].filter(
            (item) => now - item.lastSeen <= BOX_MAX_AGE_MS,
          );
        });
      } catch (err) {
        console.error("AI JSON parse error:", err);
      }
    };

    ws.onerror = (err) => {
      console.error("WebSocket error:", err);
      if (mountedRef.current) setStatus("error");
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      setStatus("connecting");
      scheduleReconnect();
    };
  }, [clearReconnect, closeSocket, fullscreenCam, scheduleReconnect]);

  useEffect(() => {
    mountedRef.current = true;

    const cleanupInterval = setInterval(() => {
      const now = Date.now();

      setDetections((prev) =>
        prev
          .filter((item) => now - item.lastSeen <= BOX_MAX_AGE_MS)
          .map((item) => ({
            ...item,
            stale: now - item.lastSeen > BOX_HOLD_MS * 0.55,
          })),
      );
    }, 120);

    const onVisibility = () => {
      if (document.hidden) {
        clearReconnect();
        closeSocket();
        setStatus("paused");
      } else {
        attemptRef.current = 0;
        connect();
      }
    };

    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      mountedRef.current = false;
      document.removeEventListener("visibilitychange", onVisibility);
      clearInterval(cleanupInterval);
      clearReconnect();
      closeSocket();
    };
  }, [connect, clearReconnect, closeSocket]);

  useEffect(() => {
    setDetections([]);
    setDanger(false);
    setFrameSize({ width: 0, height: 0 });
    attemptRef.current = 0;

    if (fullscreenCam) {
      connect();
    } else {
      closeSocket();
    }
  }, [fullscreenCam, connect, closeSocket]);

  const statusColor =
    {
      live: "rgba(22,163,74,0.92)",
      connecting: "rgba(245,158,11,0.92)",
      camera_error: "rgba(220,38,38,0.92)",
      error: "rgba(220,38,38,0.92)",
      paused: "rgba(100,116,139,0.92)",
    }[status] || "rgba(245,158,11,0.92)";

  const statusLabel =
    {
      live: "● LIVE",
      connecting: "● ULANMOQDA",
      camera_error: "● KAMERA XATO",
      error: "● XATO",
      paused: "● PAUSED",
    }[status] || "● ULANMOQDA";

  if (fullscreenCam) {
    return (
      <div style={styles.fullscreen}>
        <iframe
          src={buildStreamUrl(fullscreenCam, true)}
          title="AI LOM Fullscreen"
          allow="autoplay; fullscreen"
          style={styles.fullIframe}
        />

        <div style={styles.overlay}>
          {frameSize.width > 0 &&
            frameSize.height > 0 &&
            detections.map((det, index) => {
              const [x1, y1, x2, y2] = det.bbox;

              const left = (x1 / frameSize.width) * 100;
              const top = (y1 / frameSize.height) * 100;
              const width = ((x2 - x1) / frameSize.width) * 100;
              const height = ((y2 - y1) / frameSize.height) * 100;

              const isDanger = det.label === "musor";
              const color = isDanger ? "#ef4444" : "#22c55e";

              return (
                <div
                  key={det.id || `${det.label}-${index}`}
                  style={{
                    ...styles.box,
                    left: `${left}%`,
                    top: `${top}%`,
                    width: `${width}%`,
                    height: `${height}%`,
                    borderColor: color,
                    opacity: det.stale ? 0.45 : 1,
                    boxShadow: `0 0 18px ${color}99`,
                  }}
                >
                  <div style={{ ...styles.boxLabel, background: color }}>
                    {det.label} {Math.round((det.confidence || 0) * 100)}%
                  </div>
                </div>
              );
            })}
        </div>

        <div style={styles.fullTop}>
          <div>
            <b>{fullscreenCam.nom || fullscreenCam.mediamtx_name}</b>
            <span style={{ marginLeft: 12, color: "#94a3b8" }}>
              {fullscreenCam.location || fullscreenCam.ip || ""}
            </span>
          </div>

          <button
            onClick={() => setFullscreenCam(null)}
            style={styles.closeBtn}
          >
            ✕
          </button>
        </div>

        <div style={styles.fullBadges}>
          <div style={{ ...styles.badge, background: statusColor }}>
            {statusLabel}
          </div>

          <div
            style={{
              ...styles.badge,
              background: danger
                ? "rgba(220,38,38,0.95)"
                : "rgba(22,163,74,0.95)",
            }}
          >
            {danger ? "XAVF ANIQLANDI" : "NORMAL"}
          </div>

          <div style={styles.objectBadge}>Objects: {detections.length}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h2 style={styles.title}>AI LOM Monitoring</h2>
        <p style={styles.subtitle}>
          Grid: sub stream · Click: fullscreen main stream + AI overlay
        </p>
      </div>

      {cameras.length === 0 ? (
        <div style={styles.empty}>AI LOM kameralar topilmadi</div>
      ) : (
        <div style={styles.cameraGrid}>
          {cameras.map((cam) => (
            <div
              key={cam.mediamtx_name}
              style={styles.cameraCard}
              onClick={() => setFullscreenCam(cam)}
            >
              <iframe
                src={buildStreamUrl(cam, false)}
                title={cam.mediamtx_name}
                allow="autoplay; fullscreen"
                style={styles.gridIframe}
              />

              <div style={styles.cameraLabel}>
                <b>{cam.nom || cam.mediamtx_name}</b>
                <span>{cam.location || cam.ip || ""}</span>
              </div>

              {/* <div style={styles.clickHint}>Kattalashtirish</div> */}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    padding: 16,
    boxSizing: "border-box",
    background: "linear-gradient(135deg, #020617, #111827)",
    color: "#e5e7eb",
    fontFamily: "Segoe UI, system-ui, sans-serif",
  },
  header: {
    maxWidth: 1600,
    margin: "0 auto 14px",
  },
  title: {
    margin: 0,
    color: "#fff",
    fontSize: 24,
    fontWeight: 900,
  },
  subtitle: {
    margin: "4px 0 0",
    color: "rgba(255,255,255,0.65)",
    fontSize: 14,
  },
  cameraGrid: {
    maxWidth: 1600,
    margin: "0 auto",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)",
    gap: 12,
  },
  cameraCard: {
    position: "relative",
    aspectRatio: "16/10",
    borderRadius: 16,
    overflow: "hidden",
    background: "#000",
    cursor: "pointer",
    border: "1px solid rgba(255,255,255,0.10)",
    boxShadow: "0 14px 30px rgba(0,0,0,0.25)",
  },
  gridIframe: {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
    background: "#000",
    pointerEvents: "none",
  },
  cameraLabel: {
    position: "absolute",
    left: 10,
    bottom: 10,
    display: "flex",
    flexDirection: "column",
    gap: 2,
    background: "rgba(0,0,0,0.65)",
    color: "#fff",
    padding: "7px 10px",
    borderRadius: 10,
    fontSize: 12,
    backdropFilter: "blur(8px)",
  },
  clickHint: {
    position: "absolute",
    top: 10,
    right: 10,
    background: "rgba(37,99,235,0.86)",
    color: "#fff",
    padding: "6px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 800,
  },
  fullscreen: {
    position: "fixed",
    inset: 0,
    background: "#000",
    zIndex: 9999,
    fontFamily: "Segoe UI, system-ui, sans-serif",
  },
  fullIframe: {
    width: "100%",
    height: "100%",
    border: "none",
    display: "block",
    background: "#000",
  },
  overlay: {
    position: "absolute",
    inset: 0,
    pointerEvents: "none",
    zIndex: 3,
  },
  box: {
    position: "absolute",
    border: "3px solid",
    borderRadius: 8,
    transition: "opacity 120ms ease",
  },
  boxLabel: {
    position: "absolute",
    top: -32,
    left: 0,
    padding: "5px 9px",
    borderRadius: 8,
    color: "#fff",
    fontSize: 13,
    fontWeight: 900,
    whiteSpace: "nowrap",
    boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
  },
  fullTop: {
    position: "absolute",
    top: 14,
    left: 14,
    right: 14,
    zIndex: 5,
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    color: "#fff",
    // background: "rgba(15,23,42,0.78)",
    padding: "10px 14px",
    borderRadius: 14,
    // backdropFilter: "blur(8px)",
  },
  closeBtn: {
    background: "rgba(255,255,255,0.12)",
    border: "none",
    color: "#fff",
    width: 38,
    height: 38,
    borderRadius: "50%",
    fontSize: 18,
    cursor: "pointer",
  },
  fullBadges: {
    position: "absolute",
    left: 14,
    bottom: 14,
    zIndex: 5,
    display: "flex",
    alignItems: "center",
    gap: 10,
    flexWrap: "wrap",
  },
  badge: {
    padding: "8px 14px",
    borderRadius: 999,
    color: "#fff",
    fontSize: 13,
    fontWeight: 900,
    backdropFilter: "blur(8px)",
  },
  objectBadge: {
    padding: "8px 14px",
    borderRadius: 999,
    background: "rgba(15,23,42,0.78)",
    color: "#fff",
    fontSize: 13,
    fontWeight: 800,
    backdropFilter: "blur(8px)",
  },
  empty: {
    maxWidth: 1600,
    margin: "0 auto",
    height: 420,
    display: "grid",
    placeItems: "center",
    color: "#94a3b8",
    fontWeight: 900,
    background: "rgba(15,23,42,0.7)",
    borderRadius: 18,
  },
};

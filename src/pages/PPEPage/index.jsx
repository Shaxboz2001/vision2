import { useState, useEffect, useCallback, useRef } from "react";

const CAMERA_API = "https://172.16.55.13:8011";
const AI_API = "https://ai.uzbeksteel.uz:8008";
const WS_BASE = "wss://ai.uzbeksteel.uz:8008/ws/ai";
const STREAM_BASE = "https://ai.uzbeksteel.uz:8889";

const BOX_HOLD_MS = 900;
const BOX_MAX_AGE_MS = 1500;
const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 15000;

function makeKey(det, index) {
  if (det.id !== undefined && det.id !== null) return String(det.id);
  const [x1, y1] = det.bbox || [0, 0];
  return `${det.label}-${Math.round(x1 / 40)}-${Math.round(y1 / 40)}-${index}`;
}

function buildStreamUrl(cam, large = false) {
  if (!cam?.mediamtx_name) return "";
  const path = large ? `${cam.mediamtx_name}_main` : `${cam.mediamtx_name}_sub`;
  return `${STREAM_BASE}/${path}?controls=false&muted=true&autoplay=true&playsInline=true`;
}

function buildWsUrl(cam) {
  if (!cam?.mediamtx_name) return "";
  return `${WS_BASE}/${cam.mediamtx_name}`;
}

function getBoxStyle(det, frameSize, containerSize) {
  const [x1, y1, x2, y2] = det.bbox;

  const fw = frameSize.width || 1280;
  const fh = frameSize.height || 720;

  const cw = containerSize.width || window.innerWidth;
  const ch = containerSize.height || window.innerHeight;

  const videoRatio = fw / fh;
  const containerRatio = cw / ch;

  let scale;
  let offsetX = 0;
  let offsetY = 0;

  // object-fit: contain logikasi
  if (videoRatio > containerRatio) {
    scale = cw / fw;
    offsetY = (ch - fh * scale) / 2;
  } else {
    scale = ch / fh;
    offsetX = (cw - fw * scale) / 2;
  }

  return {
    left: x1 * scale + offsetX,
    top: y1 * scale + offsetY,
    width: (x2 - x1) * scale,
    height: (y2 - y1) * scale,
  };
}

export default function PPEPage() {
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const mountedRef = useRef(false);
  const attemptRef = useRef(0);
  const videoContainerRef = useRef(null);

  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [cameras, setCameras] = useState([]);
  const [fullscreenCam, setFullscreenCam] = useState(null);

  const [status, setStatus] = useState("connecting");
  const [detections, setDetections] = useState([]);
  const [frameSize, setFrameSize] = useState({ width: 1280, height: 720 });
  const [stats, setStats] = useState({
    persons: 0,
    with_uniform: 0,
    without_uniform: 0,
  });

  const [panel, setPanel] = useState(false);
  const [shots, setShots] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const now = new Date();
  const [date, setDate] = useState(now.toISOString().split("T")[0]);
  const [hStart, setHStart] = useState(Math.max(0, now.getHours() - 1));
  const [hEnd, setHEnd] = useState(now.getHours());

  const updateContainerSize = useCallback(() => {
    const el = videoContainerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    setContainerSize({
      width: rect.width,
      height: rect.height,
    });
  }, []);

  useEffect(() => {
    updateContainerSize();
    window.addEventListener("resize", updateContainerSize);
    return () => window.removeEventListener("resize", updateContainerSize);
  }, [updateContainerSize, fullscreenCam]);

  const loadCameras = useCallback(async () => {
    try {
      const res = await fetch(`${CAMERA_API}/api/cameras`);
      const data = await res.json();

      const list = (data.data || []).filter(
        (cam) => cam.purpose === "ai_tb" && cam.holat === "jonli",
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
    clearReconnect();

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
  }, [clearReconnect]);

  const scheduleReconnect = useCallback(() => {
    clearReconnect();

    const delay = Math.min(
      BASE_RECONNECT_DELAY * 2 ** attemptRef.current,
      MAX_RECONNECT_DELAY,
    );

    attemptRef.current += 1;

    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current && !document.hidden) {
        connect();
      }
    }, delay);
  }, [clearReconnect]);

  const connect = useCallback(() => {
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
        const timestamp = Date.now();

        setStatus(data.status || "live");

        setFrameSize({
          width: data.frame_width || 1280,
          height: data.frame_height || 720,
        });

        setStats({
          persons: data.persons || 0,
          with_uniform: data.with_uniform || 0,
          without_uniform: data.without_uniform || 0,
        });

        const incoming = (data.detections || [])
          .filter((det) => Array.isArray(det.bbox) && det.bbox.length === 4)
          .map((det, index) => ({
            ...det,
            key: makeKey(det, index),
            lastSeen: timestamp,
            stale: false,
          }));

        setDetections((prev) => {
          const incomingKeys = new Set(incoming.map((det) => det.key));

          const heldOld = prev
            .filter((det) => !incomingKeys.has(det.key))
            .filter((det) => timestamp - det.lastSeen <= BOX_HOLD_MS)
            .map((det) => ({ ...det, stale: true }));

          return [...incoming, ...heldOld].filter(
            (det) => timestamp - det.lastSeen <= BOX_MAX_AGE_MS,
          );
        });

        requestAnimationFrame(updateContainerSize);
      } catch (err) {
        console.error("PPE JSON parse error:", err);
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
  }, [closeSocket, fullscreenCam, scheduleReconnect, updateContainerSize]);

  useEffect(() => {
    mountedRef.current = true;

    const cleanupInterval = setInterval(() => {
      const timestamp = Date.now();

      setDetections((prev) =>
        prev
          .filter((det) => timestamp - det.lastSeen <= BOX_MAX_AGE_MS)
          .map((det) => ({
            ...det,
            stale: timestamp - det.lastSeen > BOX_HOLD_MS * 0.55,
          })),
      );
    }, 120);

    const onVisibility = () => {
      if (document.hidden) {
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
      closeSocket();
    };
  }, [connect, closeSocket]);

  useEffect(() => {
    setDetections([]);
    setStats({ persons: 0, with_uniform: 0, without_uniform: 0 });
    setFrameSize({ width: 1280, height: 720 });
    setContainerSize({ width: 0, height: 0 });
    attemptRef.current = 0;

    setTimeout(updateContainerSize, 100);

    if (fullscreenCam) {
      connect();
    } else {
      closeSocket();
    }
  }, [fullscreenCam, connect, closeSocket, updateContainerSize]);

  const loadScreenshots = useCallback(async () => {
    setLoading(true);

    try {
      const cameraId = fullscreenCam?.mediamtx_name || "";
      const response = await fetch(
        `${AI_API}/api/screenshots-image?date=${date}&hour_start=${hStart}&hour_end=${hEnd}&camera_id=${cameraId}`,
      );
      const data = await response.json();
      setShots(data.screenshots || []);
    } catch (err) {
      console.error("Screenshots load error:", err);
    } finally {
      setLoading(false);
    }
  }, [date, hStart, hEnd, fullscreenCam]);

  useEffect(() => {
    if (!panel) return;

    fetch(`${AI_API}/api/available-dates`)
      .then((res) => res.json())
      .then((data) => setDates(data.dates || []))
      .catch(() => {});

    loadScreenshots();
  }, [panel, loadScreenshots]);

  const statusColor =
    {
      live: "#22c55e",
      connecting: "#f59e0b",
      camera_error: "#ef4444",
      error: "#ef4444",
      paused: "#64748b",
    }[status] || "#f59e0b";

  const statusText =
    {
      live: "LIVE",
      connecting: "ULANMOQDA",
      camera_error: "KAMERA XATO",
      error: "XATO",
      paused: "PAUSED",
    }[status] || "ULANMOQDA";

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date().toISOString().split("T")[0];
  const allDates = [...new Set([today, ...dates])].sort().reverse();

  if (fullscreenCam) {
    return (
      <div style={styles.fullscreen}>
        <div ref={videoContainerRef} style={styles.videoLayer}>
          <iframe
            src={buildStreamUrl(fullscreenCam, true)}
            title="PPE Fullscreen"
            allow="autoplay; fullscreen"
            style={styles.fullIframe}
            onLoad={updateContainerSize}
          />

          <div style={styles.overlay}>
            {detections.map((det, index) => {
              const box = getBoxStyle(det, frameSize, containerSize);
              const isDanger = det.status === "danger";
              const color = isDanger ? "#ef4444" : "#22c55e";

              return (
                <div
                  key={det.key || index}
                  style={{
                    ...styles.box,
                    left: `${box.left}px`,
                    top: `${box.top}px`,
                    width: `${box.width}px`,
                    height: `${box.height}px`,
                    borderColor: "transparent",
                    // opacity: det.stale ? 0.45 : 1,
                    // boxShadow: `0 0 18px ${color}99`,
                  }}
                >
                  <div style={{ ...styles.boxLabel, background: color }}>
                    {det.label}
                    {det.confidence
                      ? ` ${Math.round(det.confidence * 100)}%`
                      : ""}
                  </div>
                </div>
              );
            })}
          </div>
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
          <Badge color={statusColor} label={statusText} />
          <Badge color="#38bdf8" label={`Odam: ${stats.persons}`} />
          <Badge color="#22c55e" label={`Forma bor: ${stats.with_uniform}`} />
          <Badge
            color="#ef4444"
            label={`Forma yo'q: ${stats.without_uniform}`}
          />

          <button
            onClick={() => setPanel((prev) => !prev)}
            style={{
              ...styles.btn,
              background: panel ? "#dc2626" : "#2563eb",
            }}
          >
            {panel ? "✕ Yopish" : "📷 Qoidabuzarlar"}
          </button>
        </div>

        {panel && (
          <div style={styles.panelFullscreen}>
            <div style={styles.filters}>
              <Field label="Sana">
                <select
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  style={styles.select}
                >
                  {allDates.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Dan">
                <select
                  value={hStart}
                  onChange={(e) => setHStart(Number(e.target.value))}
                  style={styles.select}
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {pad(h)}:00
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Gacha">
                <select
                  value={hEnd}
                  onChange={(e) => setHEnd(Number(e.target.value))}
                  style={styles.select}
                >
                  {hours.map((h) => (
                    <option key={h} value={h}>
                      {pad(h)}:59
                    </option>
                  ))}
                </select>
              </Field>

              <button onClick={loadScreenshots} style={styles.searchBtn}>
                Qidirish
              </button>
            </div>

            {loading ? (
              <p style={styles.muted}>Yuklanmoqda...</p>
            ) : shots.length === 0 ? (
              <p style={styles.muted}>Bu oraliqda rasm topilmadi.</p>
            ) : (
              <div style={styles.gridShots}>
                {shots.map((shot) => (
                  <div
                    key={shot.filename}
                    onClick={() => setLightbox(shot)}
                    style={styles.card}
                  >
                    <img
                      src={`${AI_API}${shot.url}`}
                      alt=""
                      style={styles.thumb}
                      loading="lazy"
                    />
                    <div style={styles.cardInfo}>
                      <span>{shot.time}</span>
                      <span style={styles.idBadge}>ID: {shot.track_id}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        {lightbox && (
          <div style={styles.lightbox}>
            <button
              onClick={() => setLightbox(null)}
              style={styles.closeBtnBig}
            >
              ✕
            </button>
            <img
              src={`${AI_API}${lightbox.url}`}
              alt=""
              style={styles.fullImg}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <div>
          <h2 style={styles.title}>PPE / AI TB Monitoring</h2>
          <p style={styles.subtitle}>
            Grid: sub stream · Click: fullscreen main stream + pixel-perfect AI
            overlay
          </p>
        </div>
      </div>

      {cameras.length === 0 ? (
        <div style={styles.empty}>AI TB kameralar topilmadi</div>
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

function Badge({ color, label }) {
  return (
    <div
      style={{
        ...styles.badge,
        borderColor: `${color}66`,
        background: `${color}22`,
        color,
      }}
    >
      {label}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div style={styles.fieldLabel}>{label}</div>
      {children}
    </div>
  );
}

function pad(n) {
  return String(n).padStart(2, "0");
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
    fontSize: 24,
    fontWeight: 900,
    color: "#fff",
  },
  subtitle: {
    margin: "4px 0 0",
    fontSize: 14,
    color: "rgba(255,255,255,0.6)",
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
  videoLayer: {
    position: "absolute",
    inset: 0,
    background: "#000",
    overflow: "hidden",
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
    zIndex: 3,
    pointerEvents: "none",
  },
  box: {
    position: "absolute",
    border: "3px solid",
    borderRadius: 8,
    transition: "opacity 80ms ease",
  },
  boxLabel: {
    position: "absolute",
    top: -32,
    left: 0,
    color: "#fff",
    padding: "5px 9px",
    borderRadius: 8,
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
    background: "transparent",
    padding: "10px 14px",
    borderRadius: 14,
    // backdropFilter: "blur(8px)",
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
    padding: "8px 12px",
    borderRadius: 999,
    border: "1px solid",
    fontSize: 13,
    fontWeight: 900,
    backdropFilter: "blur(8px)",
  },
  btn: {
    color: "#fff",
    border: "none",
    borderRadius: 999,
    padding: "9px 16px",
    cursor: "pointer",
    fontWeight: 800,
    fontSize: 13,
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
  panelFullscreen: {
    position: "absolute",
    right: 14,
    top: 78,
    bottom: 14,
    width: 420,
    zIndex: 6,
    background: "rgba(15,23,42,0.94)",
    borderRadius: 18,
    padding: 18,
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "auto",
  },
  filters: {
    display: "flex",
    gap: 10,
    flexWrap: "wrap",
    alignItems: "flex-end",
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 11,
    color: "#94a3b8",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 1,
    fontWeight: 800,
  },
  select: {
    background: "#020617",
    color: "#e2e8f0",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: 8,
    padding: "8px 12px",
    fontSize: 13,
    height: 38,
    minWidth: 100,
  },
  searchBtn: {
    background: "#2563eb",
    color: "#fff",
    border: "none",
    borderRadius: 8,
    padding: "9px 18px",
    cursor: "pointer",
    fontWeight: 800,
    height: 38,
  },
  muted: {
    color: "#94a3b8",
    fontSize: 13,
    margin: 0,
  },
  gridShots: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: 12,
  },
  card: {
    borderRadius: 12,
    overflow: "hidden",
    border: "1px solid rgba(255,255,255,0.08)",
    cursor: "pointer",
    background: "#020617",
  },
  thumb: {
    width: "100%",
    display: "block",
    aspectRatio: "16/9",
    objectFit: "cover",
  },
  cardInfo: {
    padding: "9px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 12,
    color: "#94a3b8",
  },
  idBadge: {
    background: "#dc2626",
    color: "#fff",
    padding: "3px 8px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 900,
  },
  lightbox: {
    position: "fixed",
    inset: 0,
    background: "rgba(0,0,0,0.96)",
    zIndex: 10000,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtnBig: {
    position: "absolute",
    top: 20,
    right: 24,
    background: "rgba(255,255,255,0.12)",
    border: "none",
    color: "#fff",
    width: 44,
    height: 44,
    borderRadius: "50%",
    fontSize: 20,
    cursor: "pointer",
    zIndex: 10,
  },
  fullImg: {
    maxWidth: "95vw",
    maxHeight: "90vh",
    objectFit: "contain",
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

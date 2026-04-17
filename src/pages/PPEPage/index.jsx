import { useState, useEffect, useCallback, useRef } from "react";

const API = "https://ai.uzbeksteel.uz:8008";
const WS_URL = "wss://ai.uzbeksteel.uz:8008/ws/video";

/**
 * ============================================================
 * VideoWebSocket — eng optimal camera streaming komponenti
 * ============================================================
 *
 * Arxitektura:
 *   WebSocket (binary JPEG) → createImageBitmap (off-thread decode)
 *                            → Canvas.drawImage → bitmap.close()
 *
 * Nima uchun bu optimal:
 *   1. WebSocket — bitta persistent connection, ping/pong keepalive
 *   2. createImageBitmap — JPEG decode main threadda emas (UI qotmaydi)
 *   3. Canvas — brauzer memory yig'maydi (MJPEG <img> dan farqi)
 *   4. bitmap.close() — har frame dan keyin memory bo'shatiladi
 *   5. Visibility API — tab yashirinsa WS yopiladi (traffic tejaydi)
 *   6. Auto-reconnect — exponential backoff (1s → 2s → 4s → max 10s)
 *   7. Frame dropping — rendering sekin bo'lsa, yangi frame skip qiladi
 *
 * Muammo bo'lmaydi:
 *   - "Rasm yo'qoladi" — reconnect avtomatik, oxirgi frame canvasda qoladi
 *   - "Memory leak" — bitmap.close() + canvas (yig'ilmaydigan)
 *   - "Qotish" — createImageBitmap off-thread, frame dropping bor
 *   - "Network timeout" — server har 15s ping beradi, WS keepalive
 */

// Reconnect settings
const RECONNECT_BASE_MS = 1000;
const RECONNECT_MAX_MS = 10000;
const RECONNECT_MULTIPLIER = 2;

function VideoWebSocket({ url, style }) {
  const canvasRef = useRef(null);
  const wsRef = useRef(null);
  const mountedRef = useRef(true);
  const processingRef = useRef(false);
  const reconnectDelayRef = useRef(RECONNECT_BASE_MS);
  const reconnectTimerRef = useRef(null);
  const [status, setStatus] = useState("connecting");

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (wsRef.current) {
      try {
        wsRef.current.onclose = null; // reconnect triggerlamaslik uchun
        wsRef.current.close();
      } catch (_) {}
      wsRef.current = null;
    }
  }, []);

  const connect = useCallback(() => {
    cleanup();
    if (!mountedRef.current) return;

    setStatus("connecting");

    const ws = new WebSocket(url);
    ws.binaryType = "blob";
    wsRef.current = ws;

    ws.onopen = () => {
      if (!mountedRef.current) return;
      setStatus("live");
      reconnectDelayRef.current = RECONNECT_BASE_MS;
    };

    ws.onmessage = async (event) => {
      // Server "ping" text yuboradi — skip
      if (typeof event.data === "string") return;

      // Frame dropping — oldingi hali render bo'lmagan bo'lsa, skip
      if (processingRef.current) return;
      processingRef.current = true;

      try {
        // Off-thread JPEG decode — main thread qotmaydi
        const bitmap = await createImageBitmap(event.data);

        if (!mountedRef.current || !canvasRef.current) {
          bitmap.close();
          return;
        }

        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");

        // Canvas o'lchamini frame ga moslashtirish (faqat o'zgarsa)
        if (canvas.width !== bitmap.width || canvas.height !== bitmap.height) {
          canvas.width = bitmap.width;
          canvas.height = bitmap.height;
        }

        ctx.drawImage(bitmap, 0, 0);
        bitmap.close();
      } catch (_) {
        // Corrupt frame — skip, keyingisi keladi
      } finally {
        processingRef.current = false;
      }
    };

    ws.onclose = () => {
      if (!mountedRef.current) return;
      scheduleReconnect();
    };

    ws.onerror = () => {
      if (!mountedRef.current) return;
      setStatus("error");
    };
  }, [url, cleanup]);

  const scheduleReconnect = useCallback(() => {
    if (!mountedRef.current) return;
    setStatus("connecting");

    const delay = reconnectDelayRef.current;
    reconnectDelayRef.current = Math.min(
      delay * RECONNECT_MULTIPLIER,
      RECONNECT_MAX_MS,
    );

    reconnectTimerRef.current = setTimeout(() => {
      if (mountedRef.current) connect();
    }, delay);
  }, [connect]);

  useEffect(() => {
    mountedRef.current = true;

    // Visibility API — tab yashirinsa WS yopish, ko'rinsa qayta ulash
    const handleVisibility = () => {
      if (document.hidden) {
        cleanup();
      } else {
        reconnectDelayRef.current = RECONNECT_BASE_MS;
        connect();
      }
    };

    document.addEventListener("visibilitychange", handleVisibility);
    connect();

    return () => {
      mountedRef.current = false;
      document.removeEventListener("visibilitychange", handleVisibility);
      cleanup();
    };
  }, [connect, cleanup]);

  return (
    <div style={{ position: "relative", background: "#0c0e14", ...style }}>
      <canvas
        ref={canvasRef}
        style={{
          width: "100%",
          height: "100%",
          display: "block",
        }}
      />
      {status !== "live" && (
        <div
          style={{
            position: "absolute",
            top: 12,
            left: 12,
            background:
              status === "error" ? "rgba(220,38,38,0.85)" : "rgba(0,0,0,0.7)",
            color: "#fff",
            padding: "6px 14px",
            borderRadius: 6,
            fontSize: 12,
            fontWeight: 600,
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: status === "error" ? "#fca5a5" : "#fbbf24",
              display: "inline-block",
              animation: "blink 1.5s infinite",
            }}
          />
          {status === "error" ? "Kamera ulanmadi" : "Ulanmoqda..."}
        </div>
      )}
      <style>{`
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
      `}</style>
    </div>
  );
}

// =============================================================
// PPE PAGE
// =============================================================
export default function PPEPage() {
  const [panel, setPanel] = useState(false);
  const [shots, setShots] = useState([]);
  const [dates, setDates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [lightbox, setLightbox] = useState(null);

  const now = new Date();
  const [date, setDate] = useState(now.toISOString().split("T")[0]);
  const [hStart, setHStart] = useState(Math.max(0, now.getHours() - 1));
  const [hEnd, setHEnd] = useState(now.getHours());

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch(
        `${API}/api/screenshots?date=${date}&hour_start=${hStart}&hour_end=${hEnd}`,
      );
      const d = await r.json();
      setShots(d.screenshots || []);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [date, hStart, hEnd]);

  useEffect(() => {
    if (!panel) return;
    fetch(`${API}/api/available-dates`)
      .then((r) => r.json())
      .then((d) => setDates(d.dates || []))
      .catch(() => {});
    load();
  }, [panel, load]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const today = new Date().toISOString().split("T")[0];
  const allDates = [...new Set([today, ...dates])].sort().reverse();

  return (
    <div style={styles.page}>
      {/* Header */}
      <div style={styles.header}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={styles.dot} />
        </div>
        <button
          onClick={() => setPanel((p) => !p)}
          style={{ ...styles.btn, background: panel ? "#dc2626" : "#2563eb" }}
        >
          {panel ? "✕ Yopish" : "📷 Qoidabuzarlar"}
        </button>
      </div>

      {/* Video — WebSocket + Canvas */}
      <div style={styles.videoWrap}>
        <VideoWebSocket
          url={WS_URL}
          style={{ width: "100%", aspectRatio: "16/9" }}
        />
      </div>

      {/* Panel */}
      {panel && (
        <div style={styles.panel}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>
            Qoidabuzarliklar
          </h3>

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
                onChange={(e) => setHStart(+e.target.value)}
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
                onChange={(e) => setHEnd(+e.target.value)}
                style={styles.select}
              >
                {hours.map((h) => (
                  <option key={h} value={h}>
                    {pad(h)}:59
                  </option>
                ))}
              </select>
            </Field>
            <button
              onClick={load}
              style={{
                ...styles.btn,
                background: "#2563eb",
                alignSelf: "flex-end",
              }}
            >
              Qidirish
            </button>
          </div>

          {loading ? (
            <p style={styles.muted}>Yuklanmoqda...</p>
          ) : shots.length === 0 ? (
            <p style={styles.muted}>Bu oraliqda rasm topilmadi.</p>
          ) : (
            <>
              <p style={{ ...styles.muted, marginBottom: 12 }}>
                {shots.length} ta rasm
              </p>
              <div style={styles.grid}>
                {shots.map((s) => (
                  <div
                    key={s.filename}
                    onClick={() => setLightbox(s)}
                    style={styles.card}
                  >
                    <img
                      src={`${API}${s.url}`}
                      alt=""
                      style={styles.thumb}
                      loading="lazy"
                    />
                    <div style={styles.cardInfo}>
                      <span>{s.time}</span>
                      <span style={styles.idBadge}>
                        {s.filename.split("_")[1]?.replace(".jpg", "")}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {lightbox && (
        <div style={styles.overlay}>
          <button onClick={() => setLightbox(null)} style={styles.closeBtn}>
            ✕
          </button>
          <img src={`${API}${lightbox.url}`} alt="" style={styles.fullImg} />
          <div style={styles.overlayInfo}>
            {lightbox.time} —{" "}
            {lightbox.filename.split("_")[1]?.replace(".jpg", "")}
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <div
        style={{
          fontSize: 11,
          color: "#64748b",
          marginBottom: 4,
          textTransform: "uppercase",
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
      {children}
    </div>
  );
}

function pad(n) {
  return String(n).padStart(2, "0");
}

const styles = {
  page: {
    fontFamily: "'Segoe UI', system-ui, sans-serif",
    background: "transparent",
    minHeight: "100vh",
    color: "#e2e8f0",
    padding: "0 0 40px",
  },
  header: {
    width: "82%",
    maxWidth: 1200,
    margin: "0 auto",
    padding: "20px 0",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: "50%",
    background: "#22c55e",
    boxShadow: "0 0 8px #22c55e",
  },
  btn: {
    color: "#fff",
    border: "none",
    borderRadius: 6,
    padding: "8px 18px",
    cursor: "pointer",
    fontWeight: 600,
    fontSize: 13,
    transition: "opacity .15s",
  },
  videoWrap: {
    width: "82%",
    maxWidth: 1200,
    margin: "0 auto",
    borderRadius: 10,
    overflow: "hidden",
    border: "1px solid #1e293b",
    boxShadow: "0 4px 24px rgba(0,0,0,.4)",
  },
  panel: {
    width: "82%",
    maxWidth: 1200,
    margin: "20px auto 0",
    background: "#111827",
    borderRadius: 10,
    padding: 24,
    border: "1px solid #1e293b",
  },
  filters: {
    display: "flex",
    gap: 14,
    flexWrap: "wrap",
    alignItems: "flex-end",
    marginBottom: 20,
    paddingBottom: 16,
    borderBottom: "1px solid #1e293b",
  },
  select: {
    background: "#0c0e14",
    color: "#e2e8f0",
    border: "1px solid #1e293b",
    borderRadius: 6,
    padding: "7px 12px",
    fontSize: 13,
    height: 34,
    minWidth: 110,
  },
  muted: { color: "#64748b", fontSize: 13, margin: 0 },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
    gap: 14,
  },
  card: {
    borderRadius: 8,
    overflow: "hidden",
    border: "1px solid #1e293b",
    cursor: "pointer",
    transition: "border-color .2s, transform .15s",
    background: "#0c0e14",
  },
  thumb: {
    width: "100%",
    display: "block",
    aspectRatio: "16/9",
    objectFit: "cover",
  },
  cardInfo: {
    padding: "8px 12px",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    fontSize: 12,
    color: "#94a3b8",
  },
  idBadge: {
    background: "#dc2626",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 4,
    fontSize: 11,
    fontWeight: 700,
  },
  overlay: {
    position: "fixed",
    inset: 0,
    background: "#000",
    zIndex: 9999,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  closeBtn: {
    position: "absolute",
    top: 20,
    right: 24,
    background: "rgba(255,255,255,.12)",
    border: "none",
    color: "#fff",
    width: 44,
    height: 44,
    borderRadius: "50%",
    fontSize: 20,
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
    transition: "background .15s",
  },
  fullImg: { maxWidth: "95vw", maxHeight: "90vh", objectFit: "contain" },
  overlayInfo: {
    position: "absolute",
    bottom: 24,
    left: "50%",
    transform: "translateX(-50%)",
    background: "rgba(0,0,0,.7)",
    color: "#e2e8f0",
    padding: "8px 20px",
    borderRadius: 8,
    fontSize: 14,
    backdropFilter: "blur(8px)",
  },
};

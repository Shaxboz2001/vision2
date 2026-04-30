// import React, { useEffect, useRef, useState, useCallback } from "react";

// const WS_URL = "wss://172.16.55.13:8009/ai_lom";
// const BASE_RECONNECT_DELAY = 1_000;
// const MAX_RECONNECT_DELAY = 30_000;

// export default function AILom() {
//   const wsRef = useRef(null);
//   const imgRef = useRef(null);
//   const reconnectTimerRef = useRef(null);
//   const prevUrlRef = useRef(null);
//   const mountedRef = useRef(true);
//   const attemptRef = useRef(0);

//   const [status, setStatus] = useState("connecting");

//   const clearReconnect = useCallback(() => {
//     if (reconnectTimerRef.current) {
//       clearTimeout(reconnectTimerRef.current);
//       reconnectTimerRef.current = null;
//     }
//   }, []);

//   const closeSocket = useCallback(() => {
//     const ws = wsRef.current;
//     if (!ws) return;
//     ws.onopen = ws.onmessage = ws.onerror = ws.onclose = null;
//     try {
//       if (
//         ws.readyState === WebSocket.OPEN ||
//         ws.readyState === WebSocket.CONNECTING
//       ) {
//         ws.close();
//       }
//     } catch (_) {}
//     wsRef.current = null;
//   }, []);

//   const scheduleReconnect = useCallback(() => {
//     clearReconnect();
//     const attempt = attemptRef.current++;
//     const delay = Math.min(
//       BASE_RECONNECT_DELAY * 2 ** attempt,
//       MAX_RECONNECT_DELAY,
//     );
//     reconnectTimerRef.current = setTimeout(() => {
//       if (mountedRef.current && !document.hidden) connect();
//     }, delay);
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const connect = useCallback(() => {
//     clearReconnect();
//     closeSocket();
//     if (!mountedRef.current || document.hidden) return;

//     setStatus("connecting");

//     let ws;
//     try {
//       ws = new WebSocket(WS_URL);
//     } catch (err) {
//       console.error("WS create error:", err);
//       setStatus("error");
//       scheduleReconnect();
//       return;
//     }
//     ws.binaryType = "blob";
//     wsRef.current = ws;

//     ws.onopen = () => {
//       if (!mountedRef.current) return;
//       attemptRef.current = 0;
//       setStatus("live");
//     };

//     ws.onmessage = (event) => {
//       if (!mountedRef.current || !imgRef.current) return;

//       // event.data ALLAQACHON Blob (binaryType="blob") — qayta o'ramaymiz
//       const blob =
//         event.data instanceof Blob
//           ? event.data
//           : new Blob([event.data], { type: "image/jpeg" });

//       const url = URL.createObjectURL(blob);
//       const img = imgRef.current;
//       const oldUrl = prevUrlRef.current;

//       // Eski URL'ni faqat yangi frame decode bo'lgandan keyin revoke qilamiz
//       // → flicker yo'q, memory leak yo'q
//       img.onload = () => {
//         if (oldUrl) URL.revokeObjectURL(oldUrl);
//       };
//       img.onerror = () => {
//         URL.revokeObjectURL(url);
//       };

//       prevUrlRef.current = url;
//       img.src = url;
//     };

//     ws.onerror = (err) => {
//       console.error("WS error:", err);
//       if (mountedRef.current) setStatus("error");
//     };

//     ws.onclose = () => {
//       if (!mountedRef.current) return;
//       setStatus("connecting");
//       scheduleReconnect();
//     };
//   }, [clearReconnect, closeSocket, scheduleReconnect]);

//   useEffect(() => {
//     mountedRef.current = true;
//     connect();

//     const onVisibility = () => {
//       if (document.hidden) {
//         clearReconnect();
//         closeSocket();
//         setStatus("connecting");
//       } else {
//         attemptRef.current = 0;
//         connect();
//       }
//     };
//     document.addEventListener("visibilitychange", onVisibility);

//     return () => {
//       mountedRef.current = false;
//       document.removeEventListener("visibilitychange", onVisibility);
//       clearReconnect();
//       closeSocket();
//       if (prevUrlRef.current) {
//         URL.revokeObjectURL(prevUrlRef.current);
//         prevUrlRef.current = null;
//       }
//     };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const bg = {
//     live: "rgba(22,163,74,0.9)",
//     error: "rgba(220,38,38,0.9)",
//     connecting: "rgba(245,158,11,0.9)",
//   }[status];

//   const label = {
//     live: "● LIVE",
//     error: "● XATO",
//     connecting: "● ULANMOQDA",
//   }[status];

//   return (
//     <div
//       style={{
//         width: "100%",
//         minHeight: "calc(100vh - 64px)",
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: 16,
//         boxSizing: "border-box",
//       }}
//     >
//       <div
//         style={{
//           width: "100%",
//           maxWidth: 1400,
//           borderRadius: 20,
//           overflow: "hidden",
//           position: "relative",
//           background: "#000",
//           boxShadow: "0 10px 30px rgba(0,0,0,0.25)",
//         }}
//       >
//         <img
//           ref={imgRef}
//           alt="camera"
//           style={{
//             width: "100%",
//             height: "calc(100vh - 110px)",
//             objectFit: "cover",
//             display: "block",
//             background: "#000",
//           }}
//         />
//         <div
//           style={{
//             position: "absolute",
//             top: 14,
//             left: 14,
//             padding: "8px 14px",
//             borderRadius: 999,
//             background: bg,
//             color: "#fff",
//             fontSize: 13,
//             fontWeight: 700,
//             backdropFilter: "blur(6px)",
//           }}
//         >
//           {label}
//         </div>
//       </div>
//     </div>
//   );
// }

import React, { useEffect, useRef, useState, useCallback } from "react";

const STREAM_URL =
  "https://172.16.55.13:8889/cam09_main?controls=false&muted=true&autoplay=true&playsInline=true";

const AI_WS_URL = "wss://172.16.55.13:8009/ws/ai_lom";

const BASE_RECONNECT_DELAY = 1000;
const MAX_RECONNECT_DELAY = 15000;

// Box yo‘qolib qolmasligi uchun ushlab turish vaqti
const BOX_HOLD_MS = 900;

// Juda eski boxlarni majburan tozalash
const BOX_MAX_AGE_MS = 1400;

function makeDetectionKey(det, index) {
  const [x1, y1, x2, y2] = det.bbox || [0, 0, 0, 0];

  // Koordinatani biroz yumaloqlaymiz, shunda bir xil obyekt key’i sakramaydi
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

  const [status, setStatus] = useState("connecting");
  const [danger, setDanger] = useState(false);
  const [detections, setDetections] = useState([]);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });

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

    if (!mountedRef.current || document.hidden) return;

    setStatus("connecting");

    let ws;

    try {
      ws = new WebSocket(AI_WS_URL);
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

          // Yangi topilgan boxlar
          const merged = incoming.map((item) => {
            const old = prevMap.get(item.id);

            return {
              ...item,
              firstSeen: old?.firstSeen || now,
              lastSeen: now,
              stale: false,
            };
          });

          // Backend shu frame’da topolmagan bo‘lsa ham eski boxni ozgina ushlab turamiz
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
  }, [clearReconnect, closeSocket, scheduleReconnect]);

  useEffect(() => {
    mountedRef.current = true;
    connect();

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

  return (
    <div
      style={{
        width: "100%",
        minHeight: "calc(100vh - 64px)",
        padding: 16,
        boxSizing: "border-box",
        background: "linear-gradient(135deg, #020617, #111827)",
      }}
    >
      <div style={{ maxWidth: 1440, margin: "0 auto" }}>
        <div
          style={{
            marginBottom: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 12,
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                color: "#fff",
                fontSize: 24,
                fontWeight: 800,
              }}
            >
              AI LOM Monitoring
            </h2>
            <p
              style={{
                margin: "4px 0 0",
                color: "rgba(255,255,255,0.65)",
                fontSize: 14,
              }}
            >
              Video: MediaMTX WebRTC · AI: FastAPI WebSocket JSON
            </p>
          </div>

          <div
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              background: danger
                ? "rgba(220,38,38,0.95)"
                : "rgba(22,163,74,0.95)",
              color: "#fff",
              fontSize: 14,
              fontWeight: 800,
            }}
          >
            {danger ? "XAVF ANIQLANDI" : "NORMAL"}
          </div>
        </div>

        <div
          style={{
            width: "100%",
            height: "calc(100vh - 150px)",
            minHeight: 520,
            borderRadius: 22,
            overflow: "hidden",
            position: "relative",
            background: "#000",
            boxShadow: "0 20px 60px rgba(0,0,0,0.45)",
            border: "1px solid rgba(255,255,255,0.08)",
          }}
        >
          <iframe
            src={STREAM_URL}
            title="AI LOM Camera"
            allow="autoplay; fullscreen"
            style={{
              width: "100%",
              height: "100%",
              border: "none",
              background: "#000",
              display: "block",
            }}
          />

          <div
            style={{
              position: "absolute",
              inset: 0,
              pointerEvents: "none",
              zIndex: 3,
            }}
          >
            {frameSize.width > 0 &&
              frameSize.height > 0 &&
              detections.map((det, index) => {
                const [x1, y1, x2, y2] = det.bbox;

                const left = (x1 / frameSize.width) * 100;
                const top = (y1 / frameSize.height) * 100;
                const width = ((x2 - x1) / frameSize.width) * 100;
                const height = ((y2 - y1) / frameSize.height) * 100;

                const isDanger = det.label === "musor";
                const opacity = det.stale ? 0.45 : 1;

                return (
                  <div
                    key={det.id || `${det.label}-${index}`}
                    style={{
                      position: "absolute",
                      left: `${left}%`,
                      top: `${top}%`,
                      width: `${width}%`,
                      height: `${height}%`,
                      border: `3px solid ${isDanger ? "#ef4444" : "#22c55e"}`,
                      borderRadius: 8,
                      opacity,
                      transition:
                        "left 120ms linear, top 120ms linear, width 120ms linear, height 120ms linear, opacity 180ms ease",
                      boxShadow: isDanger
                        ? "0 0 18px rgba(239,68,68,0.8)"
                        : "0 0 18px rgba(34,197,94,0.5)",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        top: -32,
                        left: 0,
                        padding: "5px 9px",
                        borderRadius: 8,
                        background: isDanger
                          ? "rgba(239,68,68,0.95)"
                          : "rgba(22,163,74,0.95)",
                        color: "#fff",
                        fontSize: 13,
                        fontWeight: 800,
                        whiteSpace: "nowrap",
                        boxShadow: "0 8px 20px rgba(0,0,0,0.25)",
                      }}
                    >
                      {det.label} {Math.round((det.confidence || 0) * 100)}%
                    </div>
                  </div>
                );
              })}
          </div>

          <div
            style={{
              position: "absolute",
              top: 14,
              left: 14,
              display: "flex",
              gap: 10,
              alignItems: "center",
              zIndex: 5,
            }}
          >
            <div
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: statusColor,
                color: "#fff",
                fontSize: 13,
                fontWeight: 800,
                backdropFilter: "blur(8px)",
              }}
            >
              {statusLabel}
            </div>

            <div
              style={{
                padding: "8px 14px",
                borderRadius: 999,
                background: "rgba(15,23,42,0.78)",
                color: "#fff",
                fontSize: 13,
                fontWeight: 700,
                backdropFilter: "blur(8px)",
              }}
            >
              Objects: {detections.length}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

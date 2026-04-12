import { useState, useEffect, useCallback } from "react";

const API = "https://ai.uzbeksteel.uz:8008";

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
          {/* <span style={{ fontWeight: 700, fontSize: 18 }}>PPE Monitoring</span> */}
        </div>
        <button
          onClick={() => setPanel((p) => !p)}
          style={{ ...styles.btn, background: panel ? "#dc2626" : "#2563eb" }}
        >
          {panel ? "✕ Yopish" : "📷 Qoidabuzarlar"}
        </button>
      </div>

      {/* Video */}
      <div style={styles.videoWrap}>
        <img src={`${API}/video`} alt="cam" style={styles.video} />
      </div>

      {/* Panel */}
      {panel && (
        <div style={styles.panel}>
          <h3 style={{ margin: "0 0 16px", fontSize: 16, fontWeight: 600 }}>
            Qoidabuzarliklar
          </h3>

          {/* Filters */}
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

          {/* Grid */}
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

      {/* Fullscreen Lightbox */}
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
  video: { width: "100%", display: "block" },
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
  // Fullscreen overlay
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

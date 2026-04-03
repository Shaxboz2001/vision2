import { useState, useEffect, useMemo } from "react";

const EQUIPMENT_IMAGE = "/images/uskunalar/klet.png";

// Gauge SVG component
function Gauge({ value, size = 150, color = "#ff6b1a", label }) {
  const r = (size - 24) / 2;
  const cx = size / 2;
  const cy = size / 2 + 8;
  const startA = 225,
    endA = -45;
  const totalA = startA - endA;
  const progress = Math.min(value / 100, 1);
  const curA = startA - totalA * progress;

  const p2c = (a) => ({
    x: cx + r * Math.cos((a * Math.PI) / 180),
    y: cy - r * Math.sin((a * Math.PI) / 180),
  });

  const arc = (s, e) => {
    const sp = p2c(s),
      ep = p2c(e);
    return `M ${sp.x} ${sp.y} A ${r} ${r} 0 ${s - e > 180 ? 1 : 0} 1 ${ep.x} ${ep.y}`;
  };

  return (
    <div
      style={{
        position: "relative",
        width: size,
        height: size,
        margin: "0 auto",
      }}
    >
      <svg width={size} height={size}>
        <defs>
          <linearGradient id={`gg-${label}`} x1="0%" y1="0%" x2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.25" />
            <stop offset="100%" stopColor={color} stopOpacity="1" />
          </linearGradient>
          <filter id={`gl-${label}`}>
            <feGaussianBlur stdDeviation="3" result="b" />
            <feMerge>
              <feMergeNode in="b" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <path
          d={arc(startA, endA)}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth="10"
          strokeLinecap="round"
        />
        <path
          d={arc(startA, curA)}
          fill="none"
          stroke={`url(#gg-${label})`}
          strokeWidth="10"
          strokeLinecap="round"
          filter={`url(#gl-${label})`}
        />
        {[0, 25, 50, 75, 100].map((t) => {
          const a = startA - totalA * (t / 100);
          const o = p2c(a);
          const ir = r - 14;
          const i = {
            x: cx + ir * Math.cos((a * Math.PI) / 180),
            y: cy - ir * Math.sin((a * Math.PI) / 180),
          };
          return (
            <line
              key={t}
              x1={i.x}
              y1={i.y}
              x2={o.x}
              y2={o.y}
              stroke="rgba(255,255,255,0.12)"
              strokeWidth="1.5"
            />
          );
        })}
        <text
          x={cx}
          y={cy - 2}
          textAnchor="middle"
          fill={color}
          fontSize={size * 0.22}
          fontFamily="'Orbitron',monospace"
          fontWeight="700"
        >
          {value.toFixed(1)}
        </text>
        <text
          x={cx}
          y={cy + size * 0.12}
          textAnchor="middle"
          fill="rgba(255,255,255,0.4)"
          fontSize={size * 0.09}
          fontFamily="'Share Tech Mono',monospace"
        >
          %
        </text>
      </svg>
      {label && (
        <div
          style={{
            textAlign: "center",
            fontFamily: "'Rajdhani',sans-serif",
            fontWeight: 700,
            fontSize: "0.7rem",
            color: "#6b7280",
            letterSpacing: "0.12em",
            marginTop: -4,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
}

// Temperature badge
function TempBadge({ temp, x, y, side = "right", color = "#00e676", pulse }) {
  const isL = side === "left";
  return (
    <div
      style={{
        position: "absolute",
        left: `${x}%`,
        top: `${y}%`,
        transform: "translate(-50%,-50%)",
        zIndex: 5,
        display: "flex",
        alignItems: "center",
        gap: 4,
        flexDirection: isL ? "row-reverse" : "row",
      }}
    >
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          background: color,
          boxShadow: `0 0 10px ${color}, 0 0 20px ${color}40`,
          animation: pulse ? "tpulse 2s ease-in-out infinite" : "none",
        }}
      />
      <div
        style={{
          width: 28,
          height: 1,
          background: `linear-gradient(${isL ? "to left" : "to right"}, ${color}, transparent)`,
        }}
      />
      <div
        style={{
          background: "rgba(0,0,0,0.88)",
          border: `1px solid ${color}35`,
          borderRadius: 4,
          padding: "2px 8px",
          backdropFilter: "blur(8px)",
          whiteSpace: "nowrap",
        }}
      >
        <span
          style={{
            fontFamily: "'Orbitron',monospace",
            fontSize: "0.72rem",
            fontWeight: 700,
            color,
            lineHeight: 1.2,
          }}
        >
          {temp}°C
        </span>
      </div>
    </div>
  );
}

// Stat row
function StatRow({ label, value, unit, vColor }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "8px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
        transition: "background 0.2s",
      }}
      onMouseEnter={(e) =>
        (e.currentTarget.style.background = "rgba(255,255,255,0.02)")
      }
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      <span
        style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: "0.72rem",
          color: "#9ca3af",
        }}
      >
        {label}
      </span>
      <span style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
        <span
          style={{
            fontFamily: "'Orbitron',monospace",
            fontSize: "0.95rem",
            fontWeight: 700,
            color: vColor || "#e5e7eb",
          }}
        >
          {value}
        </span>
        {unit && (
          <span
            style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.58rem",
              color: "#4b5563",
            }}
          >
            {unit}
          </span>
        )}
      </span>
    </div>
  );
}

// Mini sparkline chart
function Sparkline({ data, color, h = 80 }) {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 260;
  const pts = data
    .map(
      (v, i) =>
        `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * (h - 10) - 5}`,
    )
    .join(" ");
  const areaPath = `M0,${h} L${pts
    .split(" ")
    .map((p, i) => (i === 0 ? p.replace(/^/, "L") : `L${p}`))
    .join(" ")} L${w},${h}Z`.replace("LL", "L");

  return (
    <svg
      width="100%"
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      style={{ display: "block" }}
    >
      <defs>
        <linearGradient
          id={`sg-${color.replace("#", "")}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0%" stopColor={color} stopOpacity="0.25" />
          <stop offset="100%" stopColor={color} stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <polygon
        points={`0,${h} ${pts} ${w},${h}`}
        fill={`url(#sg-${color.replace("#", "")})`}
      />
      <polyline
        points={pts}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function EquipmentDashboard() {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  const u = {
    id: "EAF-01",
    nom: "Elektr Yoy Pechi №1",
    model: "Danieli EAF 120t",
    tur: "Elektr Pech",
    holat: "faol",
    samaradorlik: 70.1,
    kio: 100,
    ishVaqti: 13.3,
    prostoy: 0.0,
    prostoyOldingi: 0.0,
    energiya: 485,
    rasxodVoda: 3934.8,
    harorat: 1650,
    bosim: 2.4,
    quvvat: 120,
  };

  const vodaData = useMemo(
    () => Array.from({ length: 30 }, () => 3900 + Math.random() * 100),
    [],
  );
  const enData = useMemo(
    () => Array.from({ length: 30 }, () => 455 + Math.random() * 60),
    [],
  );

  const tempPoints = [
    { temp: 41.5, x: 68, y: 10, color: "#ffd60a", side: "right" },
    { temp: 35.3, x: 18, y: 28, color: "#00e676", side: "left" },
    { temp: 38.7, x: 20, y: 38, color: "#ffd60a", side: "left" },
    { temp: 31.5, x: 52, y: 18, color: "#00e676", side: "right" },
    { temp: 37.4, x: 55, y: 32, color: "#ffd60a", side: "right" },
    { temp: 35.2, x: 58, y: 44, color: "#00e676", side: "right" },
    { temp: 41.9, x: 88, y: 30, color: "#ff6b1a", side: "right", pulse: true },
    { temp: 35.1, x: 15, y: 50, color: "#00e676", side: "left" },
    { temp: 36.1, x: 12, y: 60, color: "#00e676", side: "left" },
    { temp: 30.9, x: 25, y: 80, color: "#00d4ff", side: "left" },
  ];

  const c = "#00e676";
  const fmt = (d) =>
    `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()} ${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}:${String(d.getSeconds()).padStart(2, "0")}`;

  const panelStyle = {
    background: "rgba(8,12,24,0.85)",
    border: "1px solid rgba(255,255,255,0.06)",
    borderRadius: 8,
    backdropFilter: "blur(12px)",
    overflow: "hidden",
  };

  const sectionLabel = (text) => (
    <div
      style={{
        padding: "10px 14px",
        borderBottom: "1px solid rgba(255,255,255,0.04)",
      }}
    >
      <span
        style={{
          fontFamily: "'Share Tech Mono',monospace",
          fontSize: "0.6rem",
          color: "#6b7280",
          letterSpacing: "0.12em",
        }}
      >
        {text}
      </span>
    </div>
  );

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "linear-gradient(180deg, #060a14 0%, #0a0e1a 100%)",
        padding: 16,
        fontFamily: "'Rajdhani',sans-serif",
        color: "#e5e7eb",
      }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;500;600;700&family=Rajdhani:wght@400;500;600;700&family=Share+Tech+Mono&display=swap');
        @keyframes tpulse { 0%,100%{transform:scale(1);opacity:1} 50%{transform:scale(1.4);opacity:.6} }
        @keyframes statusPulse { 0%,100%{box-shadow:0 0 12px #00e67680} 50%{box-shadow:0 0 24px #00e676} }
        @keyframes ringRotate { from{stroke-dashoffset:0} to{stroke-dashoffset:-40} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>

      {/* HEADER */}
      <div
        style={{
          ...panelStyle,
          marginBottom: 12,
          padding: "12px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background:
            "linear-gradient(135deg, rgba(0,212,255,0.05) 0%, rgba(8,12,24,0.9) 100%)",
          borderColor: `${c}18`,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div
            style={{
              width: 12,
              height: 12,
              borderRadius: "50%",
              background: c,
              boxShadow: `0 0 12px ${c}80`,
              animation: "statusPulse 2s ease-in-out infinite",
            }}
          />
          <div>
            <div
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: "1.05rem",
                fontWeight: 700,
                letterSpacing: "0.1em",
              }}
            >
              Xarakteristika {u.nom}
            </div>
            <div
              style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.58rem",
                color: "#6b7280",
              }}
            >
              {u.model} · {u.tur} · ID: {u.id}
            </div>
          </div>
        </div>
        <div
          style={{
            fontFamily: "'Share Tech Mono',monospace",
            fontSize: "0.6rem",
            fontWeight: 700,
            background: `${c}15`,
            color: c,
            padding: "4px 12px",
            borderRadius: 4,
            border: `1px solid ${c}28`,
            letterSpacing: "0.08em",
          }}
        >
          FAOL
        </div>
      </div>

      {/* MAIN GRID */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "260px 1fr 280px",
          gap: 12,
        }}
      >
        {/* LEFT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* Quvvat Gauge */}
          <div
            style={{
              ...panelStyle,
              padding: 16,
              textAlign: "center",
              borderColor: "rgba(255,107,26,0.12)",
              background:
                "linear-gradient(180deg, rgba(255,107,26,0.03) 0%, rgba(8,12,24,0.85) 100%)",
            }}
          >
            <div
              style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.58rem",
                color: "#6b7280",
                letterSpacing: "0.12em",
                marginBottom: 8,
              }}
            >
              QUVVAT MShTs-1
            </div>
            <Gauge
              value={u.samaradorlik}
              color="#ff6b1a"
              label="Samaradorlik"
            />
          </div>

          {/* Suv grafigi */}
          <div
            style={{
              ...panelStyle,
              padding: 14,
              borderColor: "rgba(0,212,255,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.58rem",
                  color: "#6b7280",
                  letterSpacing: "0.1em",
                }}
              >
                HISOBLANGAN SUV (m³/s)
              </span>
            </div>
            <div
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: "1.3rem",
                fontWeight: 700,
                color: "#00e676",
                marginBottom: 8,
              }}
            >
              3 934,8
            </div>
            <Sparkline data={vodaData} color="#00d4ff" />
          </div>

          {/* Energiya grafigi */}
          <div
            style={{
              ...panelStyle,
              padding: 14,
              borderColor: "rgba(167,139,250,0.1)",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 8,
              }}
            >
              <span
                style={{
                  fontFamily: "'Share Tech Mono',monospace",
                  fontSize: "0.58rem",
                  color: "#6b7280",
                  letterSpacing: "0.1em",
                }}
              >
                ENERGIYA SARFI (kVt)
              </span>
            </div>
            <div
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: "1.1rem",
                fontWeight: 700,
                color: "#a78bfa",
                marginBottom: 8,
              }}
            >
              {u.energiya} kVt
            </div>
            <Sparkline data={enData} color="#a78bfa" />
          </div>
        </div>

        {/* CENTER — Image */}
        <div
          style={{
            ...panelStyle,
            position: "relative",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 560,
            background:
              "radial-gradient(ellipse at center, rgba(0,230,118,0.025) 0%, rgba(8,12,24,0.85) 70%)",
          }}
        >
          {/* Grid overlay */}
          <div
            style={{
              position: "absolute",
              inset: 0,
              backgroundImage:
                "linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)",
              backgroundSize: "40px 40px",
              zIndex: 1,
            }}
          />

          {/* Glow ring */}
          <div
            style={{
              position: "absolute",
              bottom: "6%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "75%",
              zIndex: 2,
            }}
          >
            <svg
              viewBox="0 0 400 60"
              style={{ width: "100%", display: "block" }}
            >
              <ellipse
                cx="200"
                cy="30"
                rx="195"
                ry="25"
                fill="none"
                stroke={c}
                strokeWidth="2.5"
                opacity="0.45"
              />
              <ellipse
                cx="200"
                cy="30"
                rx="195"
                ry="25"
                fill="none"
                stroke={c}
                strokeWidth="1"
                opacity="0.12"
                strokeDasharray="8 6"
                style={{ animation: "ringRotate 20s linear infinite" }}
              />
            </svg>
          </div>

          {/* Bottom glow */}
          <div
            style={{
              position: "absolute",
              bottom: "8%",
              left: "50%",
              transform: "translateX(-50%)",
              width: "65%",
              height: 0,
              boxShadow: `0 0 80px 40px ${c}12, 0 0 120px 60px ${c}06`,
              zIndex: 1,
            }}
          />

          {/* Equipment image */}
          <div
            style={{
              position: "relative",
              width: "78%",
              maxWidth: 460,
              zIndex: 3,
              filter: "drop-shadow(0 20px 60px rgba(0,0,0,0.6))",
            }}
          >
            <img
              src={EQUIPMENT_IMAGE}
              alt="Equipment"
              style={{ width: "100%", height: "auto", display: "block" }}
            />
            {tempPoints.map((tp, i) => (
              <TempBadge key={i} {...tp} />
            ))}
          </div>

          {/* Top labels */}
          <div
            style={{
              position: "absolute",
              top: 14,
              left: 18,
              fontFamily: "'Orbitron',monospace",
              fontSize: "0.72rem",
              fontWeight: 600,
              color: "#6b7280",
              letterSpacing: "0.15em",
              zIndex: 5,
            }}
          >
            KO'RSATKICHLAR
          </div>
          <div
            style={{
              position: "absolute",
              top: 14,
              right: 18,
              textAlign: "right",
              zIndex: 5,
            }}
          >
            <div
              style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.52rem",
                color: "#6b7280",
                letterSpacing: "0.1em",
              }}
            >
              HISOBLANGAN SUV (m³/s)
            </div>
            <div
              style={{
                fontFamily: "'Orbitron',monospace",
                fontSize: "1.4rem",
                fontWeight: 700,
                color: "#00e676",
              }}
            >
              3 934,8
            </div>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {/* KIO */}
          <div
            style={{
              ...panelStyle,
              padding: 16,
              textAlign: "center",
              borderColor: `${c}12`,
              background: `linear-gradient(180deg, ${c}04 0%, rgba(8,12,24,0.85) 100%)`,
            }}
          >
            <div
              style={{
                fontFamily: "'Share Tech Mono',monospace",
                fontSize: "0.58rem",
                color: "#6b7280",
                letterSpacing: "0.12em",
                marginBottom: 8,
              }}
            >
              KIO
            </div>
            <Gauge value={u.kio} color={c} label="" />
          </div>

          {/* Ish vaqti */}
          <div style={panelStyle}>
            {sectionLabel("ISH VAQTI")}
            <StatRow
              label="Ish vaqti"
              value={u.ishVaqti}
              unit="soat"
              vColor="#00e676"
            />
            <StatRow label="Prostoy (bugun)" value={u.prostoy} unit="soat" />
            <StatRow
              label="Prostoy (kecha)"
              value={u.prostoyOldingi}
              unit="soat"
            />
          </div>

          {/* Energiya */}
          <div style={panelStyle}>
            {sectionLabel("ENERGOSARFIYOT")}
            <StatRow
              label="Joriy quvvat"
              value={u.energiya}
              unit="kVt"
              vColor="#a78bfa"
            />
            <StatRow
              label="Kunlik sarfiyot"
              value={Math.round(u.energiya * u.ishVaqti)}
              unit="kVt·s"
              vColor="#a78bfa"
            />
          </div>

          {/* Asosiy parametrlar */}
          <div style={panelStyle}>
            {sectionLabel("ASOSIY PARAMETRLAR")}
            <StatRow
              label="Harorat"
              value={u.harorat}
              unit="°C"
              vColor="#ff6b1a"
            />
            <StatRow
              label="Bosim"
              value={u.bosim}
              unit="bar"
              vColor="#00d4ff"
            />
            <StatRow
              label="Quvvat"
              value={u.quvvat}
              unit="MVt"
              vColor="#00e676"
            />
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div
        style={{
          ...panelStyle,
          marginTop: 12,
          padding: "10px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#00e676",
              boxShadow: "0 0 8px #00e67660",
            }}
          />
          <span
            style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.65rem",
              color: "#6b7280",
            }}
          >
            {fmt(now)}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <span
            style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.58rem",
              color: "#4b5563",
            }}
          >
            INTERVAL: 1s
          </span>
          <span
            style={{
              fontFamily: "'Share Tech Mono',monospace",
              fontSize: "0.52rem",
              background: "#00e67612",
              color: "#00e676",
              padding: "3px 10px",
              borderRadius: 3,
              border: "1px solid #00e67620",
            }}
          >
            REALTIME
          </span>
        </div>
      </div>
    </div>
  );
}

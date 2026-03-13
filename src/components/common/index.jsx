import { Chip, Box, Typography, LinearProgress, Skeleton, useTheme } from '@mui/material'
import { alpha } from '@mui/material/styles'

export const StatusChip = ({ holat, size = 'small' }) => {
  const map = {
    faol:           { label: '● FAOL',         color: '#00ff9d', bg: 'rgba(0,255,157,0.1)',   border: 'rgba(0,255,157,0.25)' },
    ogohlantirish:  { label: '⚠ OGOHLANT.',    color: '#ffd60a', bg: 'rgba(255,214,10,0.1)',  border: 'rgba(255,214,10,0.25)' },
    xato:           { label: '✕ XATO',          color: '#ff2d55', bg: 'rgba(255,45,85,0.1)',   border: 'rgba(255,45,85,0.25)' },
    toxtagan:       { label: '— TO\'XTATILDI', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' },
    "ko'rib chiqilmoqda": { label: '↻ KO\'RIB', color: '#00d4ff', bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.25)' },
    ochiq:          { label: '◉ OCHIQ',         color: '#ff2d55', bg: 'rgba(255,45,85,0.1)',   border: 'rgba(255,45,85,0.2)' },
    yopiq:          { label: '✓ YOPIQ',         color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' },
    jonli:          { label: '● JONLI',         color: '#ff2d55', bg: 'rgba(255,45,85,0.1)',   border: 'rgba(255,45,85,0.2)' },
    signal_yoq:     { label: '⊘ SIGNAL YO\'Q', color: '#6b7280', bg: 'rgba(107,114,128,0.1)', border: 'rgba(107,114,128,0.2)' },
  }
  const s = map[holat] || map.toxtagan
  return (
    <Chip label={s.label} size={size} sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.62rem', letterSpacing: '0.08em', height: 22, color: s.color, background: s.bg, border: `1px solid ${s.border}`, borderRadius: '2px', '& .MuiChip-label': { px: 1 } }} />
  )
}

export const DarajaChip = ({ daraja }) => {
  const map = {
    kritik:        { label: '▲ KRITIK',    color: '#ff2d55', bg: 'rgba(255,45,85,0.12)' },
    ogohlantirish: { label: '⚠ OGOHLANT.', color: '#ffd60a', bg: 'rgba(255,214,10,0.1)' },
    axborot:       { label: '● AXBOROT',  color: '#00d4ff', bg: 'rgba(0,212,255,0.1)'  },
  }
  const s = map[daraja] || map.axborot
  return (
    <Chip label={s.label} size="small" sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.08em', height: 20, color: s.color, background: s.bg, border: `1px solid ${alpha(s.color, 0.25)}`, borderRadius: '2px', '& .MuiChip-label': { px: 1 } }} />
  )
}

export const KpiCard = ({ label, value, unit, trend, trendUp, color = '#00d4ff', loading }) => {
  const theme = useTheme()
  return (
    <Box sx={{ background: theme.palette.background.paper, border: `1px solid ${theme.palette.divider}`, borderTop: `2px solid ${color}`, borderRadius: '3px', p: '14px 16px', position: 'relative', overflow: 'hidden', cursor: 'pointer', transition: 'all 0.25s', '&:hover': { borderColor: alpha(color, 0.4), transform: 'translateY(-2px)', boxShadow: `0 8px 30px ${alpha(color, 0.12)}` } }}>
      <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.62rem', color: 'text.secondary', mb: 1, letterSpacing: '0.1em' }}>{label}</Typography>
      {loading ? (
        <Skeleton variant="text" width={100} height={40} sx={{ bgcolor: theme.palette.divider }} />
      ) : (
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.5, mb: 0.5 }}>
          <Typography sx={{ fontFamily: "'Orbitron',monospace", fontSize: '1.6rem', fontWeight: 700, lineHeight: 1, color: 'text.primary' }}>{value}</Typography>
          {unit && <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem' }}>{unit}</Typography>}
        </Box>
      )}
      {trend && (
        <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.62rem', color: trendUp ? 'success.main' : 'error.main' }}>
          {trendUp ? '↑' : '↓'} {trend}
        </Typography>
      )}
      <Box sx={{ position: 'absolute', right: 0, bottom: 0, width: 80, height: 40, opacity: 0.18 }}>
        <svg viewBox="0 0 80 40" style={{ width: '100%', height: '100%' }}>
          <polyline points="0,30 15,22 30,26 45,15 60,18 75,10 80,12" fill="none" stroke={color} strokeWidth="2" />
        </svg>
      </Box>
    </Box>
  )
}

export const SectionHeader = ({ title, dot = '#00d4ff', action, children }) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', p: '10px 16px', borderBottom: '1px solid', borderColor: 'divider', background: 'rgba(128,128,128,0.02)' }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: dot, boxShadow: `0 0 8px ${dot}` }} />
      <Typography sx={{ fontFamily: "'Rajdhani',sans-serif", fontWeight: 600, fontSize: '0.8rem', letterSpacing: '0.15em', textTransform: 'uppercase', color: 'text.primary' }}>{title}</Typography>
    </Box>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      {children}
      {action && (
        typeof action === 'string'
          ? <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.65rem', color: 'primary.main', cursor: 'pointer', '&:hover': { opacity: 0.7 } }}>{action}</Typography>
          : action
      )}
    </Box>
  </Box>
)

export const LiveBadge = () => (
  <Box sx={{ display: 'inline-flex', alignItems: 'center', gap: 0.5, background: 'rgba(255,45,85,0.12)', border: '1px solid rgba(255,45,85,0.3)', color: 'error.main', px: 1, py: 0.25, borderRadius: '2px' }}>
    <Box sx={{ width: 5, height: 5, borderRadius: '50%', background: '#ff2d55', animation: 'blink 0.8s step-end infinite', '@keyframes blink': { '0%,100%': { opacity: 1 }, '50%': { opacity: 0.2 } } }} />
    <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.6rem', letterSpacing: '0.15em' }}>JONLI</Typography>
  </Box>
)

export const StatBox = ({ label, value, color = 'primary.main' }) => (
  <Box>
    <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.9rem', color }}>{value}</Typography>
    <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.5rem', color: 'text.secondary', letterSpacing: '0.1em' }}>{label}</Typography>
  </Box>
)

export const CardSkeleton = ({ rows = 5 }) => {
  const theme = useTheme()
  return (
    <Box sx={{ p: 2 }}>
      {Array.from({ length: rows }).map((_, i) => (
        <Skeleton key={i} variant="rectangular" height={42} sx={{ mb: 1, bgcolor: theme.palette.divider, borderRadius: 1 }} />
      ))}
    </Box>
  )
}

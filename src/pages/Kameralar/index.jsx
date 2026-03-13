import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Box, Grid, Paper, Typography, Select, MenuItem, FormControl, InputLabel, Dialog, DialogContent, IconButton } from '@mui/material'
import FullscreenIcon from '@mui/icons-material/Fullscreen'
import CloseIcon from '@mui/icons-material/Close'
import { getKameralar } from '@/api'
import { StatusChip, SectionHeader, LiveBadge } from '@/components/common'

const camColors = {
  jonli: '#00d4ff', xato: '#ff2d55', signal_yoq: '#374151'
}

function CameraFeed({ cam, onClick, large = false }) {
  const isLive = cam.holat === 'jonli'

  return (
    <Box
      onClick={() => isLive && onClick && onClick(cam)}
      sx={{
        aspectRatio: large ? '16/9' : '16/10',
        background: '#070a12',
        border: `1px solid ${cam.holat === 'xato' ? 'rgba(255,45,85,0.3)' : '#1e2a3d'}`,
        borderRadius: 1,
        position: 'relative',
        overflow: 'hidden',
        cursor: isLive ? 'pointer' : 'default',
        '&:hover .cam-overlay': { opacity: isLive ? 1 : 0 },
        backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, rgba(0,212,255,0.015) 2px, rgba(0,212,255,0.015) 4px)',
      }}
    >
      {/* SCENE */}
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 1, opacity: cam.holat === 'signal_yoq' ? 0.3 : 0.7 }}>
        <Typography sx={{ fontSize: large ? 52 : 28, lineHeight: 1 }}>{cam.emoji}</Typography>
        {!isLive && <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.6rem', color: '#6b7280', letterSpacing: '0.1em' }}>
          {cam.holat === 'signal_yoq' ? 'SIGNAL YO\'Q' : 'NOSOZ'}
        </Typography>}
      </Box>

      {/* SCANLINES */}
      {isLive && (
        <Box sx={{ position: 'absolute', inset: 0, background: 'repeating-linear-gradient(0deg, transparent, transparent 3px, rgba(0,0,0,0.08) 3px, rgba(0,0,0,0.08) 4px)', pointerEvents: 'none' }} />
      )}

      {/* CORNER DECORATIONS */}
      {isLive && ['tl','tr','bl','br'].map(c => (
        <Box key={c} sx={{
          position: 'absolute',
          width: 12, height: 12,
          top: c.includes('t') ? 6 : 'auto',
          bottom: c.includes('b') ? 6 : 'auto',
          left: c.includes('l') ? 6 : 'auto',
          right: c.includes('r') ? 6 : 'auto',
          borderTop: c.includes('t') ? '1px solid rgba(0,212,255,0.4)' : 'none',
          borderBottom: c.includes('b') ? '1px solid rgba(0,212,255,0.4)' : 'none',
          borderLeft: c.includes('l') ? '1px solid rgba(0,212,255,0.4)' : 'none',
          borderRight: c.includes('r') ? '1px solid rgba(0,212,255,0.4)' : 'none',
        }} />
      ))}

      {/* ID */}
      <Box sx={{ position: 'absolute', top: 8, left: 8 }}>
        <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.6rem', color: 'rgba(255,255,255,0.25)' }}>{cam.id}</Typography>
      </Box>

      {/* STATUS DOT */}
      <Box sx={{ position: 'absolute', top: 8, right: 8, display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box sx={{ width: 6, height: 6, borderRadius: '50%', background: camColors[cam.holat] || '#374151', animation: isLive ? 'blink 0.8s step-end infinite' : 'none', '@keyframes blink': { '50%': { opacity: 0.2 } } }} />
        {isLive && <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: '#ff2d55' }}>REC</Typography>}
      </Box>

      {/* LABEL */}
      <Box sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'linear-gradient(transparent, rgba(6,8,16,0.85))', p: '16px 10px 8px' }}>
        <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.6rem', color: 'rgba(0,212,255,0.7)', letterSpacing: '0.08em' }}>{cam.nom}</Typography>
        <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: '#6b7280' }}>{cam.sex}</Typography>
      </Box>

      {/* HOVER OVERLAY */}
      <Box className="cam-overlay" sx={{ position: 'absolute', inset: 0, background: 'rgba(0,212,255,0.06)', border: '1px solid rgba(0,212,255,0.3)', opacity: 0, transition: 'opacity 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <FullscreenIcon sx={{ color: '#00d4ff', fontSize: 28 }} />
      </Box>

      {/* FPS */}
      {isLive && (
        <Box sx={{ position: 'absolute', bottom: 30, right: 8 }}>
          <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.55rem', color: 'rgba(0,212,255,0.4)' }}>{cam.fps}fps</Typography>
        </Box>
      )}
    </Box>
  )
}

export default function Kameralar() {
  const [filter, setFilter] = useState('barchasi')
  const [fullscreen, setFullscreen] = useState(null)

  const { data } = useQuery({ queryKey: ['kameralar'], queryFn: getKameralar, refetchInterval: 10000 })
  const kameralar = data?.data || []

  const filtered = filter === 'barchasi' ? kameralar : filter === 'jonli' ? kameralar.filter(c => c.holat === 'jonli') : kameralar.filter(c => c.holat !== 'jonli')

  const stats = {
    jami: kameralar.length,
    jonli: kameralar.filter(c => c.holat === 'jonli').length,
    xato: kameralar.filter(c => c.holat === 'xato').length,
    signal_yoq: kameralar.filter(c => c.holat === 'signal_yoq').length,
  }

  return (
    <Box sx={{ p: 2.5, display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography sx={{ fontFamily: "'Orbitron',monospace", fontSize: '1.1rem', fontWeight: 700, letterSpacing: '0.15em' }}>KAMERA NAZORATI</Typography>
          <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.65rem', color: '#6b7280' }}>{stats.jonli}/{stats.jami} kamera jonli · PyVision Video Analitika</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          <LiveBadge />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select value={filter} onChange={e => setFilter(e.target.value)} sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.75rem' }}>
              <MenuItem value="barchasi">Barchasi ({stats.jami})</MenuItem>
              <MenuItem value="jonli">Jonli ({stats.jonli})</MenuItem>
              <MenuItem value="nosoz">Nosoz ({stats.xato + stats.signal_yoq})</MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* STATS */}
      <Grid container spacing={1.5}>
        {[
          { l: 'JAMI KAMERA', v: stats.jami, c: '#00d4ff' },
          { l: 'JONLI', v: stats.jonli, c: '#00ff9d' },
          { l: 'NOSOZ', v: stats.xato, c: '#ff2d55' },
          { l: "SIGNAL YO'Q", v: stats.signal_yoq, c: '#6b7280' },
        ].map(s => (
          <Grid item xs={6} sm={3} key={s.l}>
            <Paper sx={{ p: 1.5, textAlign: 'center' }}>
              <Typography sx={{ fontFamily: "'Orbitron',monospace", fontSize: '1.8rem', fontWeight: 700, color: s.c }}>{s.v}</Typography>
              <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.58rem', color: '#6b7280', letterSpacing: '0.1em' }}>{s.l}</Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* CAMERA GRID */}
      <Paper>
        <SectionHeader title="Kamera Eko'nlari" dot="#ff2d55"><LiveBadge /></SectionHeader>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={1.5}>
            {filtered.map(cam => (
              <Grid item xs={12} sm={6} md={4} key={cam.id}>
                <CameraFeed cam={cam} onClick={setFullscreen} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      {/* FULLSCREEN DIALOG */}
      <Dialog open={!!fullscreen} onClose={() => setFullscreen(null)} maxWidth="md" fullWidth
        PaperProps={{ sx: { background: '#060810', border: '1px solid rgba(0,212,255,0.2)' } }}>
        {fullscreen && (
          <DialogContent sx={{ p: 0, position: 'relative' }}>
            <Box sx={{ p: 1.5, borderBottom: '1px solid #1e2a3d', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.75rem', color: '#00d4ff' }}>{fullscreen.id} — {fullscreen.nom}</Typography>
                <Typography sx={{ fontFamily: "'Share Tech Mono',monospace", fontSize: '0.6rem', color: '#6b7280' }}>{fullscreen.sex} · {fullscreen.uchastka} · {fullscreen.fps}fps</Typography>
              </Box>
              <IconButton size="small" onClick={() => setFullscreen(null)} sx={{ color: '#6b7280' }}><CloseIcon /></IconButton>
            </Box>
            <CameraFeed cam={fullscreen} large />
          </DialogContent>
        )}
      </Dialog>
    </Box>
  )
}

// // pages/Kameralar.jsx
// import { useEffect, useState, useCallback, useMemo } from "react";
// import { useQuery } from "@tanstack/react-query";
// import {
//   Box,
//   Grid,
//   Paper,
//   Typography,
//   Select,
//   MenuItem,
//   FormControl,
//   Dialog,
//   DialogContent,
//   IconButton,
// } from "@mui/material";
// import CloseIcon from "@mui/icons-material/Close";
// import { getKameralar } from "@/api";
// import { StatusChip, SectionHeader, LiveBadge } from "@/components/common";
// import { useVoiceCommand } from "./useVoiceCommand";
// import VoiceMicButton from "./VoiceMicButton";

// export function CameraFeed({
//   cam,
//   onClick,
//   large = false,
//   highlighted = false,
// }) {
//   const [streamUrl, setStreamUrl] = useState(null);

//   useEffect(() => {
//     fetch(`http://172.16.55.12:8000/camera/${cam.channel}`)
//       .then((res) => res.json())
//       .then((data) => setStreamUrl(data.stream));
//   }, [cam.channel]);

//   return (
//     <Box
//       sx={{
//         aspectRatio: large ? "16/9" : "16/10",
//         background: "#070a12",
//         border: highlighted ? "2px solid #00ff9d" : "1px solid #1e2a3d",
//         borderRadius: 1,
//         overflow: "hidden",
//         transition: "border-color 0.3s, box-shadow 0.3s",
//         boxShadow: highlighted ? "0 0 20px rgba(0, 255, 157, 0.15)" : "none",
//         cursor: cam.holat === "jonli" ? "pointer" : "default",
//       }}
//       onClick={() => cam.holat === "jonli" && onClick?.(cam)}
//     >
//       {streamUrl && (
//         <iframe
//           src={streamUrl}
//           style={{ width: "100%", height: "100%", border: "none" }}
//           allowFullScreen
//         />
//       )}
//     </Box>
//   );
// }

// export default function Kameralar() {
//   const [filter, setFilter] = useState("barchasi");
//   const [fullscreen, setFullscreen] = useState(null);
//   const [highlightedCamId, setHighlightedCamId] = useState(null);

//   const { data } = useQuery({
//     queryKey: ["kameralar"],
//     queryFn: getKameralar,
//     refetchInterval: 10000,
//   });
//   const kameralar = data?.data || [];

//   // ─── Voice command handler ─────────────────────────
//   const handleVoiceCommand = useCallback(
//     ({ camera_name, camera_id, action }) => {
//       console.log("Voice command:", { camera_name, camera_id, action });
//       console.log(
//         "Mavjud kameralar:",
//         kameralar.map((c) => ({ id: c.id, nom: c.nom })),
//       );

//       let cam = null;

//       // 1: camera_id bo'yicha qidirish (channel yoki id)
//       if (camera_id) {
//         cam =
//           kameralar.find((c) => c.id === camera_id) ||
//           kameralar.find((c) => c.channel === camera_id) ||
//           kameralar.find((c) => c.id === String(camera_id)) ||
//           kameralar.find((c) => String(c.id) === String(camera_id));
//       }

//       // 2: camera_name bo'yicha qidirish (nom ichida)
//       if (!cam && camera_name) {
//         const nameLower = camera_name.toLowerCase();
//         cam =
//           kameralar.find((c) => c.nom === camera_name) ||
//           kameralar.find((c) => c.nom?.toLowerCase() === nameLower) ||
//           kameralar.find((c) => c.nom?.toLowerCase().includes(nameLower)) ||
//           kameralar.find((c) => nameLower.includes(c.nom?.toLowerCase()));
//       }

//       // 3: index bo'yicha (1-based)
//       if (!cam && camera_id && camera_id <= kameralar.length) {
//         cam = kameralar[camera_id - 1];
//       }

//       console.log("Topilgan kamera:", cam);

//       if (!cam) {
//         console.warn("Kamera topilmadi!", { camera_name, camera_id });
//         return;
//       }

//       // Highlight → fullscreen
//       setHighlightedCamId(cam.id);
//       setTimeout(() => {
//         setFullscreen(cam);
//         setHighlightedCamId(null);
//       }, 600);
//     },
//     [kameralar],
//   );

//   // ─── Voice hook ────────────────────────────────────
//   const voice = useVoiceCommand({
//     onCommand: handleVoiceCommand,
//   });

//   // ─── Filtering ─────────────────────────────────────
//   const filtered =
//     filter === "barchasi"
//       ? kameralar
//       : filter === "jonli"
//         ? kameralar.filter((c) => c.holat === "jonli")
//         : kameralar.filter((c) => c.holat !== "jonli");

//   const stats = {
//     jami: kameralar.length,
//     jonli: kameralar.filter((c) => c.holat === "jonli").length,
//     xato: kameralar.filter((c) => c.holat === "xato").length,
//     signal_yoq: kameralar.filter((c) => c.holat === "signal_yoq").length,
//   };

//   return (
//     <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
//       {/* HEADER */}
//       <Box
//         sx={{
//           display: "flex",
//           alignItems: "center",
//           justifyContent: "space-between",
//         }}
//       >
//         <Box>
//           <Typography
//             sx={{
//               fontFamily: "'Arial',san-serif",
//               fontSize: "1.1rem",
//               fontWeight: 700,
//               letterSpacing: "0.15em",
//             }}
//           >
//             KAMERA NAZORATI
//           </Typography>
//           <Typography
//             sx={{
//               fontFamily: "'Arial',san-serif",
//               fontSize: "0.65rem",
//               color: "#6b7280",
//             }}
//           >
//             {stats.jonli}/{stats.jami} kamera jonli · PyVision Video Analitika
//           </Typography>
//         </Box>

//         <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
//           <VoiceMicButton
//             isListening={voice.isListening}
//             isProcessing={voice.isProcessing}
//             transcript={voice.transcript}
//             error={voice.error}
//             onClick={voice.startListening}
//           />
//           <LiveBadge />
//           <FormControl size="small" sx={{ minWidth: 140 }}>
//             <Select
//               value={filter}
//               onChange={(e) => setFilter(e.target.value)}
//               sx={{
//                 fontFamily: "'Arial',san-serif",
//                 fontSize: "0.75rem",
//               }}
//             >
//               <MenuItem value="barchasi">Barchasi ({stats.jami})</MenuItem>
//               <MenuItem value="jonli">Jonli ({stats.jonli})</MenuItem>
//               <MenuItem value="nosoz">
//                 Nosoz ({stats.xato + stats.signal_yoq})
//               </MenuItem>
//             </Select>
//           </FormControl>
//         </Box>
//       </Box>

//       {/* STATS */}
//       <Grid container spacing={1.5}>
//         {[
//           { l: "JAMI KAMERA", v: stats.jami, c: "#00d4ff" },
//           { l: "JONLI", v: stats.jonli, c: "#00ff9d" },
//           { l: "NOSOZ", v: stats.xato, c: "#ff2d55" },
//           { l: "SIGNAL YO'Q", v: stats.signal_yoq, c: "#6b7280" },
//         ].map((s) => (
//           <Grid item xs={6} sm={3} key={s.l}>
//             <Paper sx={{ p: 1.5, textAlign: "center" }}>
//               <Typography
//                 sx={{
//                   fontFamily: "'Arial',san-serif",
//                   fontSize: "1.8rem",
//                   fontWeight: 700,
//                   color: s.c,
//                 }}
//               >
//                 {s.v}
//               </Typography>
//               <Typography
//                 sx={{
//                   fontFamily: "'Arial',san-serif",
//                   fontSize: "0.58rem",
//                   color: "#6b7280",
//                   letterSpacing: "0.1em",
//                 }}
//               >
//                 {s.l}
//               </Typography>
//             </Paper>
//           </Grid>
//         ))}
//       </Grid>

//       {/* CAMERA GRID */}
//       <Paper>
//         <SectionHeader title="Kameralar" dot="#ff2d55">
//           <LiveBadge />
//         </SectionHeader>
//         <Box sx={{ p: 2 }}>
//           <Grid container spacing={3} justifyContent="center">
//             <Grid item xs={12}>
//               <Box
//                 sx={{
//                   width: "100%",
//                   maxWidth: "1200px",
//                   margin: "0 auto",
//                   background: "#070a12",
//                   border: "1px solid #1e2a3d",
//                   borderRadius: 2,
//                   overflow: "hidden",
//                   aspectRatio: "16/9",
//                 }}
//               >
//                 <Box
//                   component="img"
//                   src="http://172.16.55.12:8005/video"
//                   alt="stream"
//                   sx={{ width: "100%", objectFit: "cover" }}
//                 />
//               </Box>
//             </Grid>

//             {filtered.map((cam) => (
//               <Grid item xs={12} sm={6} md={3} key={cam.id}>
//                 <CameraFeed
//                   cam={cam}
//                   onClick={setFullscreen}
//                   highlighted={highlightedCamId === cam.id}
//                 />
//               </Grid>
//             ))}
//           </Grid>
//         </Box>
//       </Paper>

//       {/* FULLSCREEN DIALOG */}
//       <Dialog
//         open={!!fullscreen}
//         onClose={() => setFullscreen(null)}
//         maxWidth="md"
//         fullWidth
//         PaperProps={{
//           sx: {
//             background: "#060810",
//             border: "1px solid rgba(0,212,255,0.2)",
//           },
//         }}
//       >
//         {fullscreen && (
//           <DialogContent sx={{ p: 0, position: "relative" }}>
//             <Box
//               sx={{
//                 p: 1.5,
//                 borderBottom: "1px solid #1e2a3d",
//                 display: "flex",
//                 justifyContent: "space-between",
//                 alignItems: "center",
//               }}
//             >
//               <Box>
//                 <Typography
//                   sx={{
//                     fontFamily: "'Arial',san-serif",
//                     fontSize: "0.75rem",
//                     color: "#00d4ff",
//                   }}
//                 >
//                   {fullscreen.id} — {fullscreen.nom}
//                 </Typography>
//                 <Typography
//                   sx={{
//                     fontFamily: "'Arial',san-serif",
//                     fontSize: "0.6rem",
//                     color: "#6b7280",
//                   }}
//                 >
//                   {fullscreen.sex} · {fullscreen.uchastka} · {fullscreen.fps}fps
//                 </Typography>
//               </Box>
//               <IconButton
//                 size="small"
//                 onClick={() => setFullscreen(null)}
//                 sx={{ color: "#6b7280" }}
//               >
//                 <CloseIcon />
//               </IconButton>
//             </Box>
//             <CameraFeed cam={fullscreen} large />
//           </DialogContent>
//         )}
//       </Dialog>
//     </Box>
//   );
// }

// pages/Kameralar.jsx
import { useEffect, useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Box,
  Grid,
  Paper,
  Typography,
  Select,
  MenuItem,
  FormControl,
  Dialog,
  DialogContent,
  IconButton,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import { getKameralar } from "@/api";
import { StatusChip, SectionHeader, LiveBadge } from "@/components/common";
import { useVoiceCommand } from "./useVoiceCommand";
import { useWakeWord } from "./useWakeWord";
import VoiceMicButton from "./VoiceMicButton";

// export function CameraFeed({
//   cam,
//   onClick,
//   large = false,
//   highlighted = false,
// }) {
//   const [streamUrl, setStreamUrl] = useState(null);

//   // useEffect(() => {
//   //   fetch(`http://172.16.55.12:8000/camera/${cam.channel}`)
//   //     .then((res) => res.json())
//   //     .then((data) => setStreamUrl(data.stream));
//   // }, [cam.channel]);
//   useEffect(() => {
//     setStreamUrl(`/cam-player/stream.html?src=${cam.channel}`);
//   }, [cam.channel]);

//   return (
//     <Box
//       sx={{
//         aspectRatio: large ? "16/9" : "16/10",
//         background: "#070a12",
//         border: highlighted ? "2px solid #00ff9d" : "1px solid #1e2a3d",
//         borderRadius: 1,
//         overflow: "hidden",
//         transition: "border-color 0.3s, box-shadow 0.3s",
//         boxShadow: highlighted ? "0 0 20px rgba(0, 255, 157, 0.15)" : "none",
//         cursor: cam.holat === "jonli" ? "pointer" : "default",
//       }}
//       onClick={() => cam.holat === "jonli" && onClick?.(cam)}
//     >
//       {streamUrl && (
//         <iframe
//           // src={streamUrl}
//           src={`/cam-player/stream.html?src=${cam.channel}`}
//           style={{ width: "100%", height: "100%", border: "none" }}
//           allowFullScreen
//         />
//       )}
//     </Box>
//   );
// }

export function CameraFeed({
  cam,
  onClick,
  large = false,
  highlighted = false,
}) {
  const streamUrl = `/cam-player/stream.html?src=${cam.channel}`;

  return (
    <Box
      sx={{
        aspectRatio: large ? "16/9" : "16/10",
        background: "#070a12",
        border: highlighted ? "2px solid #00ff9d" : "1px solid #1e2a3d",
        borderRadius: 1,
        overflow: "hidden",
        transition: "border-color 0.3s, box-shadow 0.3s",
        boxShadow: highlighted ? "0 0 20px rgba(0, 255, 157, 0.15)" : "none",
        cursor: cam.holat === "jonli" ? "pointer" : "default",
      }}
      onClick={() => cam.holat === "jonli" && onClick?.(cam)}
    >
      <iframe
        src={streamUrl}
        style={{ width: "100%", height: "100%", border: "none" }}
        allowFullScreen
        title={`camera-${cam.id}`}
      />
    </Box>
  );
}

export default function Kameralar() {
  const [filter, setFilter] = useState("barchasi");
  const [fullscreen, setFullscreen] = useState(null);
  const [highlightedCamId, setHighlightedCamId] = useState(null);

  const { data } = useQuery({
    queryKey: ["kameralar"],
    queryFn: getKameralar,
    refetchInterval: 10000,
  });
  const kameralar = data?.data || [];

  // ─── Voice command handler ─────────────────────────
  const handleVoiceCommand = useCallback(
    ({ camera_name, camera_id, action }) => {
      let cam = null;

      if (camera_id) {
        cam =
          kameralar.find((c) => c.id === camera_id) ||
          kameralar.find((c) => c.channel === camera_id) ||
          kameralar.find((c) => String(c.id) === String(camera_id));
      }

      if (!cam && camera_name) {
        const nameLower = camera_name.toLowerCase();
        cam =
          kameralar.find((c) => c.nom === camera_name) ||
          kameralar.find((c) => c.nom?.toLowerCase() === nameLower) ||
          kameralar.find((c) => c.nom?.toLowerCase().includes(nameLower)) ||
          kameralar.find((c) => nameLower.includes(c.nom?.toLowerCase()));
      }

      if (!cam && camera_id && camera_id <= kameralar.length) {
        cam = kameralar[camera_id - 1];
      }

      console.log("Topilgan kamera:", cam);
      if (!cam) return;

      setHighlightedCamId(cam.id);
      setTimeout(() => {
        setFullscreen(cam);
        setHighlightedCamId(null);
      }, 600);
    },
    [kameralar],
  );

  // ─── Voice command hook ────────────────────────────
  const voice = useVoiceCommand({
    onCommand: handleVoiceCommand,
  });

  // ─── Wake word hook — "Durdona" deyilsa avtomatik recording ──
  const wakeWord = useWakeWord({
    wakeWord: "дурдона",
    onWakeWord: voice.triggerListening,
    enabled: true,
  });

  // ─── Filtering ─────────────────────────────────────
  const filtered =
    filter === "barchasi"
      ? kameralar
      : filter === "jonli"
        ? kameralar.filter((c) => c.holat === "jonli")
        : kameralar.filter((c) => c.holat !== "jonli");

  const stats = {
    jami: kameralar.length,
    jonli: kameralar.filter((c) => c.holat === "jonli").length,
    xato: kameralar.filter((c) => c.holat === "xato").length,
    signal_yoq: kameralar.filter((c) => c.holat === "signal_yoq").length,
  };

  return (
    <Box sx={{ p: 2.5, display: "flex", flexDirection: "column", gap: 2 }}>
      {/* HEADER */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Box>
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "1.1rem",
              fontWeight: 700,
              letterSpacing: "0.15em",
            }}
          >
            KAMERA NAZORATI
          </Typography>
          <Typography
            sx={{
              fontFamily: "'Arial',san-serif",
              fontSize: "0.65rem",
              color: "#6b7280",
            }}
          >
            {stats.jonli}/{stats.jami} kamera jonli · PyVision Video Analitika
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, alignItems: "center" }}>
          <VoiceMicButton
            isListening={voice.isListening}
            isProcessing={voice.isProcessing}
            transcript={voice.transcript}
            error={voice.error}
            onClick={voice.startListening}
            wakeWordActive={wakeWord.isActive}
          />
          <LiveBadge />
          <FormControl size="small" sx={{ minWidth: 140 }}>
            <Select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              sx={{
                fontFamily: "'Arial',san-serif",
                fontSize: "0.75rem",
              }}
            >
              <MenuItem value="barchasi">Barchasi ({stats.jami})</MenuItem>
              <MenuItem value="jonli">Jonli ({stats.jonli})</MenuItem>
              <MenuItem value="nosoz">
                Nosoz ({stats.xato + stats.signal_yoq})
              </MenuItem>
            </Select>
          </FormControl>
        </Box>
      </Box>

      {/* STATS */}
      <Grid container spacing={1.5}>
        {[
          { l: "JAMI KAMERA", v: stats.jami, c: "#00d4ff" },
          { l: "JONLI", v: stats.jonli, c: "#00ff9d" },
          { l: "NOSOZ", v: stats.xato, c: "#ff2d55" },
          { l: "SIGNAL YO'Q", v: stats.signal_yoq, c: "#6b7280" },
        ].map((s) => (
          <Grid item xs={6} sm={3} key={s.l}>
            <Paper sx={{ p: 1.5, textAlign: "center" }}>
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "1.8rem",
                  fontWeight: 700,
                  color: s.c,
                }}
              >
                {s.v}
              </Typography>
              <Typography
                sx={{
                  fontFamily: "'Arial',san-serif",
                  fontSize: "0.58rem",
                  color: "#6b7280",
                  letterSpacing: "0.1em",
                }}
              >
                {s.l}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>

      {/* CAMERA GRID */}
      <Paper>
        <SectionHeader title="Kameralar" dot="#ff2d55">
          <LiveBadge />
        </SectionHeader>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={3} justifyContent="center">
            {/* <Grid item xs={12}>
              <Box
                sx={{
                  width: "100%",
                  maxWidth: "1200px",
                  margin: "0 auto",
                  background: "#070a12",
                  border: "1px solid #1e2a3d",
                  borderRadius: 2,
                  overflow: "hidden",
                  aspectRatio: "16/9",
                }}
              >
                <Box
                  component="img"
                  src="http://172.16.55.12:8005/video"
                  alt="stream"
                  sx={{ width: "100%", objectFit: "cover" }}
                />
              </Box>
            </Grid> */}

            {filtered.map((cam) => (
              <Grid item xs={12} sm={6} md={3} key={cam.id}>
                <CameraFeed
                  cam={cam}
                  onClick={setFullscreen}
                  highlighted={highlightedCamId === cam.id}
                />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Paper>

      {/* FULLSCREEN DIALOG */}
      <Dialog
        open={!!fullscreen}
        onClose={() => setFullscreen(null)}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            background: "#060810",
            border: "1px solid rgba(0,212,255,0.2)",
          },
        }}
      >
        {fullscreen && (
          <DialogContent sx={{ p: 0, position: "relative" }}>
            <Box
              sx={{
                p: 1.5,
                borderBottom: "1px solid #1e2a3d",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.75rem",
                    color: "#00d4ff",
                  }}
                >
                  {fullscreen.id} — {fullscreen.nom}
                </Typography>
                <Typography
                  sx={{
                    fontFamily: "'Arial',san-serif",
                    fontSize: "0.6rem",
                    color: "#6b7280",
                  }}
                >
                  {fullscreen.sex} · {fullscreen.uchastka} · {fullscreen.fps}fps
                </Typography>
              </Box>
              <IconButton
                size="small"
                onClick={() => setFullscreen(null)}
                sx={{ color: "#6b7280" }}
              >
                <CloseIcon />
              </IconButton>
            </Box>
            <CameraFeed cam={fullscreen} large />
          </DialogContent>
        )}
      </Dialog>
    </Box>
  );
}

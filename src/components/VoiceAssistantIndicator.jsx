// components/VoiceAssistantIndicator.jsx
// import {
//   Box,
//   IconButton,
//   Typography,
//   Tooltip,
//   Fade,
//   CircularProgress,
// } from "@mui/material";
// import MicIcon from "@mui/icons-material/Mic";
// import MicOffIcon from "@mui/icons-material/MicOff";
// import HearingIcon from "@mui/icons-material/Hearing";
// import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";

// export default function VoiceAssistantIndicator({
//   isEnabled,
//   isListening,
//   isRecording,
//   isProcessing,
//   lastCommand,
//   error,
//   onToggle,
// }) {
//   const status = isRecording
//     ? "rec"
//     : isProcessing
//       ? "proc"
//       : lastCommand
//         ? "cmd"
//         : error
//           ? "err"
//           : isListening
//             ? "idle"
//             : null;

//   return (
//     <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
//       {isEnabled && status && (
//         <Fade in timeout={200}>
//           <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
//             {status === "rec" && (
//               <>
//                 <FiberManualRecordIcon
//                   sx={{
//                     fontSize: 12,
//                     color: "#ff2d55",
//                     animation: "rb .8s infinite",
//                     "@keyframes rb": {
//                       "0%,100%": { opacity: 1 },
//                       "50%": { opacity: 0.2 },
//                     },
//                   }}
//                 />
//                 <StatusText color="#ff2d55">Gapiring...</StatusText>
//               </>
//             )}
//             {status === "proc" && (
//               <>
//                 <CircularProgress size={12} sx={{ color: "#00d4ff" }} />
//                 <StatusText color="#00d4ff">Aniqlanmoqda...</StatusText>
//               </>
//             )}
//             {status === "cmd" && (
//               <StatusText color="#00ff9d">→ {lastCommand.label}</StatusText>
//             )}
//             {status === "err" && (
//               <StatusText color="#ff2d55">{error}</StatusText>
//             )}
//             {status === "idle" && (
//               <>
//                 <HearingIcon
//                   sx={{
//                     fontSize: 13,
//                     color: "#00ff9d",
//                     animation: "hp 2s infinite",
//                     "@keyframes hp": {
//                       "0%,100%": { opacity: 1 },
//                       "50%": { opacity: 0.3 },
//                     },
//                   }}
//                 />
//                 <StatusText color="#00ff9d">UMK AI</StatusText>
//               </>
//             )}
//           </Box>
//         </Fade>
//       )}

//       <Tooltip title={isEnabled ? "UMK AI o'chirish" : "UMK AI yoqish"}>
//         <IconButton
//           size="small"
//           onClick={onToggle}
//           disabled={isProcessing}
//           sx={{
//             width: 32,
//             height: 32,
//             borderRadius: 1,
//             transition: "all .3s",
//             backgroundColor: isRecording
//               ? "rgba(255,45,85,.15)"
//               : isEnabled
//                 ? "rgba(0,255,157,.08)"
//                 : "rgba(107,114,128,.08)",
//             border: `1px solid ${
//               isRecording
//                 ? "rgba(255,45,85,.4)"
//                 : isEnabled
//                   ? "rgba(0,255,157,.25)"
//                   : "rgba(107,114,128,.2)"
//             }`,
//             color: isRecording ? "#ff2d55" : isEnabled ? "#00ff9d" : "#6b7280",
//             animation: isRecording
//               ? "mp 1s infinite"
//               : isEnabled
//                 ? "mg 2s infinite"
//                 : "none",
//             "@keyframes mg": {
//               "0%,100%": { boxShadow: "0 0 0 0 rgba(0,255,157,.2)" },
//               "50%": { boxShadow: "0 0 0 6px rgba(0,255,157,0)" },
//             },
//             "@keyframes mp": {
//               "0%,100%": { boxShadow: "0 0 0 0 rgba(255,45,85,.3)" },
//               "50%": { boxShadow: "0 0 0 8px rgba(255,45,85,0)" },
//             },
//             "&:hover": {
//               backgroundColor: isEnabled
//                 ? "rgba(0,255,157,.16)"
//                 : "rgba(107,114,128,.16)",
//             },
//           }}
//         >
//           {isEnabled ? (
//             <MicIcon sx={{ fontSize: 16 }} />
//           ) : (
//             <MicOffIcon sx={{ fontSize: 16 }} />
//           )}
//         </IconButton>
//       </Tooltip>
//     </Box>
//   );
// }

// function StatusText({ color, children }) {
//   return (
//     <Typography
//       sx={{
//         fontFamily: "'Arial', san-serif",
//         fontSize: "0.58rem",
//         color,
//         whiteSpace: "nowrap",
//         maxWidth: 140,
//         overflow: "hidden",
//         textOverflow: "ellipsis",
//       }}
//     >
//       {children}
//     </Typography>
//   );
// }
// components/VoiceAssistantIndicator.jsx

// components/VoiceAssistantIndicator.jsx
import {
  Box,
  IconButton,
  Typography,
  Tooltip,
  Fade,
  CircularProgress,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import HearingIcon from "@mui/icons-material/Hearing";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import RecordVoiceOverIcon from "@mui/icons-material/RecordVoiceOver";

export default function VoiceAssistantIndicator({
  isEnabled,
  isListening,
  isRecording,
  isProcessing,
  isSpeaking,
  lastCommand,
  error,
  onToggle,
}) {
  const status = isSpeaking
    ? "speak"
    : isRecording
      ? "rec"
      : isProcessing
        ? "proc"
        : lastCommand
          ? "cmd"
          : error
            ? "err"
            : isListening
              ? "idle"
              : null;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
      {isEnabled && status && (
        <Fade in timeout={200}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            {status === "speak" && (
              <>
                <RecordVoiceOverIcon
                  sx={{
                    fontSize: 14,
                    color: "#a78bfa",
                    animation: "spk .6s alternate infinite",
                    "@keyframes spk": {
                      "0%": { opacity: 0.5 },
                      "100%": { opacity: 1 },
                    },
                  }}
                />
                <Txt color="#a78bfa">Javob bermoqda</Txt>
              </>
            )}
            {status === "rec" && (
              <>
                <FiberManualRecordIcon
                  sx={{
                    fontSize: 12,
                    color: "#ff2d55",
                    animation: "rb .8s infinite",
                    "@keyframes rb": {
                      "0%,100%": { opacity: 1 },
                      "50%": { opacity: 0.2 },
                    },
                  }}
                />
                <Txt color="#ff2d55">Gapiring...</Txt>
              </>
            )}
            {status === "proc" && (
              <>
                <CircularProgress size={12} sx={{ color: "#00d4ff" }} />
                <Txt color="#00d4ff">Tekshirilmoqda</Txt>
              </>
            )}
            {status === "cmd" && (
              <Txt color="#00ff9d">→ {lastCommand.label}</Txt>
            )}
            {status === "err" && <Txt color="#ff2d55">{error}</Txt>}
            {status === "idle" && (
              <>
                <HearingIcon
                  sx={{
                    fontSize: 13,
                    color: "#00ff9d",
                    animation: "hp 2s infinite",
                    "@keyframes hp": {
                      "0%,100%": { opacity: 1 },
                      "50%": { opacity: 0.3 },
                    },
                  }}
                />
                <Txt color="#00ff9d">Металлург</Txt>
              </>
            )}
          </Box>
        </Fade>
      )}

      <Tooltip title={isEnabled ? "Металлург o'chirish" : "Металлург yoqish"}>
        <IconButton
          size="small"
          onClick={onToggle}
          disabled={isProcessing || isSpeaking}
          sx={{
            width: 32,
            height: 32,
            borderRadius: 1,
            transition: "all .3s",
            backgroundColor: isSpeaking
              ? "rgba(167,139,250,.15)"
              : isRecording
                ? "rgba(255,45,85,.15)"
                : isEnabled
                  ? "rgba(0,255,157,.08)"
                  : "rgba(107,114,128,.08)",
            border: `1px solid ${
              isSpeaking
                ? "rgba(167,139,250,.4)"
                : isRecording
                  ? "rgba(255,45,85,.4)"
                  : isEnabled
                    ? "rgba(0,255,157,.25)"
                    : "rgba(107,114,128,.2)"
            }`,
            color: isSpeaking
              ? "#a78bfa"
              : isRecording
                ? "#ff2d55"
                : isEnabled
                  ? "#00ff9d"
                  : "#6b7280",
            animation: isRecording
              ? "mp 1s infinite"
              : isEnabled
                ? "mg 2s infinite"
                : "none",
            "@keyframes mg": {
              "0%,100%": { boxShadow: "0 0 0 0 rgba(0,255,157,.2)" },
              "50%": { boxShadow: "0 0 0 6px rgba(0,255,157,0)" },
            },
            "@keyframes mp": {
              "0%,100%": { boxShadow: "0 0 0 0 rgba(255,45,85,.3)" },
              "50%": { boxShadow: "0 0 0 8px rgba(255,45,85,0)" },
            },
            "&:hover": {
              backgroundColor: isEnabled
                ? "rgba(0,255,157,.16)"
                : "rgba(107,114,128,.16)",
            },
          }}
        >
          {isEnabled ? (
            <MicIcon sx={{ fontSize: 16 }} />
          ) : (
            <MicOffIcon sx={{ fontSize: 16 }} />
          )}
        </IconButton>
      </Tooltip>
    </Box>
  );
}

function Txt({ color, children }) {
  return (
    <Typography
      sx={{
        fontFamily: "'Arial', san-serif",
        fontSize: "0.58rem",
        color,
        whiteSpace: "nowrap",
        maxWidth: 150,
        overflow: "hidden",
        textOverflow: "ellipsis",
      }}
    >
      {children}
    </Typography>
  );
}

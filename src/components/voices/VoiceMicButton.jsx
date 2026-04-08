// components/VoiceMicButton.jsx
import {
  Box,
  IconButton,
  Typography,
  Fade,
  CircularProgress,
} from "@mui/material";
import MicIcon from "@mui/icons-material/Mic";
import MicOffIcon from "@mui/icons-material/MicOff";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import HearingIcon from "@mui/icons-material/Hearing";

/**
 * Ovozli buyruq tugmasi + wake word indikatori.
 */
export default function VoiceMicButton({
  isListening,
  isProcessing,
  transcript,
  error,
  onClick,
  wakeWordActive = false,
}) {
  const showStatus = isListening || isProcessing || transcript || error;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      {/* Wake word indicator */}
      {wakeWordActive && !isListening && !isProcessing && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
          }}
        >
          <HearingIcon
            sx={{
              fontSize: 14,
              color: "#00ff9d",
              animation: "pulse 2s infinite",
              "@keyframes pulse": {
                "0%, 100%": { opacity: 1 },
                "50%": { opacity: 0.3 },
              },
            }}
          />
          {/* <Typography
            sx={{
              fontFamily: "'Share Tech Mono', monospace",
              fontSize: "0.58rem",
              color: "#00ff9d",
            }}
          >
            "Durdona"
          </Typography> */}
        </Box>
      )}

      {/* Status text */}
      <Fade in={!!showStatus} timeout={200}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.8,
            maxWidth: 280,
          }}
        >
          {error ? (
            <>
              <ErrorOutlineIcon sx={{ fontSize: 14, color: "#ff2d55" }} />
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.65rem",
                  color: "#ff2d55",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {error}
              </Typography>
            </>
          ) : isListening ? (
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.65rem",
                color: "#00ff9d",
                animation: "blink 1s infinite",
                "@keyframes blink": {
                  "0%, 100%": { opacity: 1 },
                  "50%": { opacity: 0.4 },
                },
              }}
            >
              Gapiring...
            </Typography>
          ) : isProcessing ? (
            <>
              <CircularProgress size={12} sx={{ color: "#00d4ff" }} />
              <Typography
                sx={{
                  fontFamily: "'Share Tech Mono', monospace",
                  fontSize: "0.65rem",
                  color: "#00d4ff",
                }}
              >
                Aniqlanmoqda...
              </Typography>
            </>
          ) : transcript ? (
            <Typography
              sx={{
                fontFamily: "'Share Tech Mono', monospace",
                fontSize: "0.65rem",
                color: "#6b7280",
              }}
            >
              «{transcript}»
            </Typography>
          ) : null}
        </Box>
      </Fade>

      {/* Mic button */}
      <IconButton
        onClick={onClick}
        disabled={isProcessing}
        sx={{
          width: 40,
          height: 40,
          backgroundColor: isListening
            ? "rgba(255, 45, 85, 0.15)"
            : "rgba(0, 212, 255, 0.08)",
          border: isListening
            ? "1px solid rgba(255, 45, 85, 0.4)"
            : "1px solid rgba(0, 212, 255, 0.2)",
          color: isListening ? "#ff2d55" : "#00d4ff",
          transition: "all 0.2s ease",
          animation: isListening ? "micPulse 1.5s infinite" : "none",
          "@keyframes micPulse": {
            "0%, 100%": { boxShadow: "0 0 0 0 rgba(255, 45, 85, 0.3)" },
            "50%": { boxShadow: "0 0 0 8px rgba(255, 45, 85, 0)" },
          },
          "&:hover": {
            backgroundColor: isListening
              ? "rgba(255, 45, 85, 0.25)"
              : "rgba(0, 212, 255, 0.15)",
          },
          "&:disabled": {
            color: "#374151",
            borderColor: "#1e2a3d",
          },
        }}
      >
        {isListening ? (
          <MicOffIcon sx={{ fontSize: 20 }} />
        ) : (
          <MicIcon sx={{ fontSize: 20 }} />
        )}
      </IconButton>
    </Box>
  );
}

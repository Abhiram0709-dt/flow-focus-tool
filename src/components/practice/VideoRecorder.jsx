import { useEffect, useRef } from "react";
import { RecordingControls } from "./RecordingControls.jsx";
import { cn } from "@/lib/utils.js";
import { VideoOff } from "lucide-react";

export function VideoRecorder({
  isRecording,
  duration,
  mediaUrl,
  stream,
  error,
  onStart,
  onStop,
  onReset,
}) {
  const previewRef = useRef(null);
  const playbackRef = useRef(null);

  useEffect(() => {
    if (stream && previewRef.current) {
      previewRef.current.srcObject = stream;
    }
  }, [stream]);

  useEffect(() => {
    if (mediaUrl && playbackRef.current) {
      playbackRef.current.src = mediaUrl;
    }
  }, [mediaUrl]);

  return (
    <div className="space-y-6">
      {/* Video Area */}
      <div
        className={cn(
          "relative aspect-video rounded-2xl border-2 overflow-hidden bg-foreground/5",
          isRecording ? "border-destructive" : "border-border"
        )}
      >
        {isRecording && stream ? (
          <>
            <video
              ref={previewRef}
              autoPlay
              muted
              playsInline
              className="w-full h-full object-cover transform scale-x-[-1]"
            />
            <div className="absolute top-4 left-4 flex items-center gap-2 bg-destructive text-destructive-foreground px-3 py-1.5 rounded-full text-sm font-medium">
              <span className="w-2 h-2 rounded-full bg-destructive-foreground animate-pulse" />
              REC
            </div>
          </>
        ) : mediaUrl ? (
          <video
            ref={playbackRef}
            controls
            playsInline
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-muted-foreground">
            <VideoOff className="w-12 h-12 mb-2 opacity-50" />
            <p className="text-sm">Camera preview will appear here</p>
          </div>
        )}
      </div>

      {error && (
        <p className="text-destructive text-sm text-center">{error}</p>
      )}

      <RecordingControls
        isRecording={isRecording}
        hasRecording={!!mediaUrl}
        duration={duration}
        onStart={onStart}
        onStop={onStop}
        onReset={onReset}
      />
    </div>
  );
}


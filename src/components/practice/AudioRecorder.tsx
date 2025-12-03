import { useEffect, useRef } from "react";
import { RecordingControls } from "./RecordingControls";
import { cn } from "@/lib/utils";

interface AudioRecorderProps {
  isRecording: boolean;
  duration: number;
  mediaUrl: string | null;
  error: string | null;
  onStart: () => void;
  onStop: () => void;
  onReset: () => void;
}

export function AudioRecorder({
  isRecording,
  duration,
  mediaUrl,
  error,
  onStart,
  onStop,
  onReset,
}: AudioRecorderProps) {
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (mediaUrl && audioRef.current) {
      audioRef.current.src = mediaUrl;
    }
  }, [mediaUrl]);

  return (
    <div className="space-y-6">
      {/* Visualizer Area */}
      <div
        className={cn(
          "relative h-40 rounded-2xl border-2 border-dashed flex items-center justify-center overflow-hidden transition-colors",
          isRecording
            ? "border-destructive bg-destructive/5"
            : "border-border bg-muted/30"
        )}
      >
        {isRecording ? (
          <div className="flex items-center gap-1">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-primary rounded-full animate-pulse"
                style={{
                  height: `${20 + Math.random() * 40}px`,
                  animationDelay: `${i * 0.1}s`,
                }}
              />
            ))}
          </div>
        ) : mediaUrl ? (
          <audio
            ref={audioRef}
            controls
            className="w-full max-w-md px-4"
          />
        ) : (
          <p className="text-muted-foreground text-sm">
            Press the button below to start recording
          </p>
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

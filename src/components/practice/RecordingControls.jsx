import { Button } from "@/components/ui/button";
import { Mic, Square, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils.js";

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

export function RecordingControls({
  isRecording,
  hasRecording,
  duration,
  onStart,
  onStop,
  onReset,
}) {
  return (
    <div className="flex flex-col items-center gap-6">
      {/* Timer Display */}
      <div className="text-center">
        <div
          className={cn(
            "text-5xl font-bold tabular-nums transition-colors",
            isRecording ? "text-destructive" : "text-foreground"
          )}
        >
          {formatDuration(duration)}
        </div>
        {isRecording && (
          <p className="text-destructive text-sm mt-2 flex items-center justify-center gap-2">
            <span className="w-2 h-2 rounded-full bg-destructive animate-pulse" />
            Recording...
          </p>
        )}
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-4">
        {!isRecording && !hasRecording && (
          <Button
            onClick={onStart}
            size="xl"
            variant="accent"
            className="rounded-full w-20 h-20"
          >
            <Mic className="w-8 h-8" />
          </Button>
        )}

        {isRecording && (
          <Button
            onClick={onStop}
            size="xl"
            variant="recording"
            className="rounded-full w-20 h-20"
          >
            <Square className="w-6 h-6 fill-current" />
          </Button>
        )}

        {hasRecording && !isRecording && (
          <>
            <Button
              onClick={onReset}
              size="lg"
              variant="outline"
              className="rounded-full"
            >
              <RotateCcw className="w-5 h-5 mr-2" />
              Reset
            </Button>
          </>
        )}
      </div>
    </div>
  );
}


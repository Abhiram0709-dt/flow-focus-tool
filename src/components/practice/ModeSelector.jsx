import { cn } from "@/lib/utils.js";
import { Mic, Video } from "lucide-react";

export function ModeSelector({ selectedMode, onSelectMode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-foreground">Recording Mode</h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onSelectMode("audio")}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
            selectedMode === "audio"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <Mic className="w-5 h-5" />
          <span className="font-medium text-sm">Audio</span>
        </button>
        <button
          onClick={() => onSelectMode("video")}
          className={cn(
            "flex flex-col items-center justify-center gap-2 p-4 rounded-xl border-2 transition-all duration-200",
            selectedMode === "video"
              ? "border-primary bg-primary/5 text-primary"
              : "border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground"
          )}
        >
          <Video className="w-5 h-5" />
          <span className="font-medium text-sm">Video</span>
        </button>
      </div>
    </div>
  );
}


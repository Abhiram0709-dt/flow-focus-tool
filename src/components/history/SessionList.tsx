import { Session, RecordingMode } from "@/types/session";
import { SessionListItem } from "./SessionListItem";
import { FileX } from "lucide-react";

interface SessionListProps {
  sessions: Session[];
  filterMode?: RecordingMode | "all";
}

export function SessionList({ sessions, filterMode = "all" }: SessionListProps) {
  const filteredSessions =
    filterMode === "all"
      ? sessions
      : sessions.filter((s) => s.mode === filterMode);

  if (filteredSessions.length === 0) {
    return (
      <div className="text-center py-12">
        <FileX className="w-12 h-12 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground">No sessions yet</h3>
        <p className="text-muted-foreground mt-1">
          Start practicing to see your sessions here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {filteredSessions.map((session) => (
        <SessionListItem key={session.id} session={session} />
      ))}
    </div>
  );
}

import { Session } from "@/types/session";
import { Link } from "react-router-dom";
import { Badge } from "@/components/common/Badge";
import { Mic, Video, ChevronRight, Clock } from "lucide-react";
import { format } from "date-fns";

interface SessionListItemProps {
  session: Session;
}

function getScoreBadge(score: number) {
  if (score >= 7) return { label: "Great", variant: "success" as const };
  if (score >= 5) return { label: "Good", variant: "warning" as const };
  return { label: "Needs work", variant: "destructive" as const };
}

function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function SessionListItem({ session }: SessionListItemProps) {
  const scoreBadge = getScoreBadge(session.feedback.fluencyScore);

  return (
    <Link
      to={`/session/${session.id}`}
      className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group"
    >
      {/* Mode Icon */}
      <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
        {session.mode === "audio" ? (
          <Mic className="w-5 h-5 text-primary" />
        ) : (
          <Video className="w-5 h-5 text-primary" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-foreground truncate">{session.topic}</h3>
        <div className="flex items-center gap-3 mt-1 text-sm text-muted-foreground">
          <span>{format(new Date(session.createdAt), "MMM d, yyyy")}</span>
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDuration(session.durationSeconds)}
          </span>
        </div>
      </div>

      {/* Score Badge */}
      <div className="flex items-center gap-3 flex-shrink-0">
        <div className="text-right hidden sm:block">
          <div className="text-lg font-bold text-foreground">
            {session.feedback.fluencyScore}/10
          </div>
          <Badge variant={scoreBadge.variant}>{scoreBadge.label}</Badge>
        </div>
        <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
      </div>
    </Link>
  );
}

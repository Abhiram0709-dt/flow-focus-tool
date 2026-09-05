import { Link } from "react-router-dom";
import { Badge } from "@/components/common/Badge.jsx";
import { Mic, Video, ChevronRight, Clock, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

function getScoreBadge(score) {
  if (score >= 7) return { label: "Great", variant: "success" };
  if (score >= 5) return { label: "Good", variant: "warning" };
  return { label: "Needs work", variant: "destructive" };
}

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  return `${mins}m ${secs}s`;
}

export function SessionListItem({ session, onDelete }) {
  const scoreBadge = getScoreBadge(session.feedback.fluencyScore);

  const handleDelete = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (onDelete) {
      onDelete(session._id);
    }
  };

  return (
    <div className="flex items-center gap-4 p-4 bg-card rounded-xl border border-border hover:border-primary/30 hover:shadow-md transition-all duration-200 group">
      <Link
        to={`/session/${session._id}`}
        className="flex items-center gap-4 flex-1 min-w-0"
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

      {/* Delete Button */}
      {onDelete && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Session?</AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete this practice session? This action cannot be undone and will also delete the media file from storage.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
}


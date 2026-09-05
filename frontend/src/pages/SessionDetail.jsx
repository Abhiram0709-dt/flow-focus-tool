import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer } from "@/components/layout/PageContainer";
import { ScoreCircle } from "@/components/common/ScoreCircle";
import { Badge } from "@/components/common/Badge";
import { Button } from "@/components/ui/button";
import { useSessions } from "@/hooks/useSessions.js";
import { format } from "date-fns";
import {
  ArrowLeft,
  Calendar,
  Clock,
  Mic,
  Video,
  AlertTriangle,
  Lightbulb,
  CheckCircle,
} from "lucide-react";

function formatDuration(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}

export default function SessionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { findSession } = useSessions();
  const [session, setSession] = useState(null);

  useEffect(() => {
    const load = async () => {
      if (!id || id === "undefined") {
        navigate("/history");
        return;
      }

      try {
        const found = await findSession(id);
        if (found) {
          setSession(found);
        } else {
          navigate("/history");
        }
      } catch {
        try {
          navigate("/history");
        } catch {
          // ignore navigation errors
        }
      }
    };

    load();
  }, [id, findSession, navigate]);

  if (!session) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageContainer>
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading session...</p>
          </div>
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageContainer>
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/history")}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to History
        </Button>

        <div className="max-w-3xl mx-auto space-y-6">
          {/* Header */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h1 className="text-2xl font-bold text-foreground mb-4">
              {session.topic}
            </h1>
            <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
              <span className="flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                {format(new Date(session.createdAt), "MMMM d, yyyy 'at' h:mm a")}
              </span>
              <span className="flex items-center gap-2">
                <Clock className="w-4 h-4" />
                {formatDuration(session.durationSeconds)}
              </span>
              <span className="flex items-center gap-2">
                {session.mode === "audio" ? (
                  <Mic className="w-4 h-4" />
                ) : (
                  <Video className="w-4 h-4" />
                )}
                {session.mode === "audio" ? "Audio" : "Video"}
              </span>
            </div>
          </div>

          {/* Media Player */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-4">
              Recording
            </h2>
            {session.mode === "audio" ? (
              <audio
                src={session.mediaUrl}
                controls
                className="w-full"
              />
            ) : (
              <video
                src={session.mediaUrl}
                controls
                className="w-full rounded-lg aspect-video bg-foreground/5"
              />
            )}
          </div>

          {/* Scores */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h2 className="text-lg font-semibold text-foreground mb-6">
              Performance Scores
            </h2>
            <div className="grid grid-cols-3 gap-6">
              <ScoreCircle
                score={session.feedback.fluencyScore}
                label="Fluency"
                size="lg"
              />
              <ScoreCircle
                score={session.feedback.clarityScore}
                label="Clarity"
                size="lg"
              />
              <ScoreCircle
                score={session.feedback.confidenceScore}
                label="Confidence"
                size="lg"
              />
            </div>
          </div>

          {/* Transcript */}
          {session.transcript && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h2 className="text-lg font-semibold text-foreground mb-4">
                Transcript
              </h2>
              <div className="prose prose-sm max-w-none">
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {session.transcript}
                </p>
              </div>
            </div>
          )}

          {/* Detailed Feedback */}
          <div className="space-y-4">
            {/* Filler Words */}
            {session.feedback.fillerWords.length > 0 && (
              <div className="bg-warning/10 rounded-2xl p-6 border border-warning/20">
                <div className="flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-warning mt-0.5" />
                  <div>
                    <h3 className="font-semibold text-foreground">
                      Filler Words Detected
                    </h3>
                    <p className="text-muted-foreground text-sm mt-1 mb-3">
                      Try to reduce the use of these words in your next session.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {session.feedback.fillerWords.map((word) => (
                        <Badge key={word} variant="warning">
                          "{word}"
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Suggestions */}
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10">
              <div className="flex items-start gap-4">
                <Lightbulb className="w-6 h-6 text-primary mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">
                    Suggestions for Improvement
                  </h3>
                  <p className="text-muted-foreground mt-2">
                    {session.feedback.suggestions}
                  </p>
                </div>
              </div>
            </div>

            {/* Encouragement */}
            <div className="bg-success/10 rounded-2xl p-6 border border-success/20">
              <div className="flex items-start gap-4">
                <CheckCircle className="w-6 h-6 text-success mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">Keep Going!</h3>
                  <p className="text-muted-foreground mt-2">
                    {session.feedback.encouragement}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Link to="/practice" className="flex-1">
              <Button className="w-full">Start New Practice</Button>
            </Link>
            <Link to="/history" className="flex-1">
              <Button variant="outline" className="w-full">
                View All Sessions
              </Button>
            </Link>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}


import { Feedback } from "@/types/session";
import { ScoreCircle } from "@/components/common/ScoreCircle";
import { Badge } from "@/components/common/Badge";
import { CheckCircle, Lightbulb, AlertTriangle } from "lucide-react";

interface FeedbackSummaryProps {
  feedback: Feedback;
}

export function FeedbackSummary({ feedback }: FeedbackSummaryProps) {
  const averageScore =
    (feedback.fluencyScore + feedback.clarityScore + feedback.confidenceScore) / 3;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Scores */}
      <div className="grid grid-cols-3 gap-4">
        <ScoreCircle score={feedback.fluencyScore} label="Fluency" size="md" />
        <ScoreCircle score={feedback.clarityScore} label="Clarity" size="md" />
        <ScoreCircle score={feedback.confidenceScore} label="Confidence" size="md" />
      </div>

      {/* Filler Words */}
      {feedback.fillerWords.length > 0 && (
        <div className="bg-warning/10 rounded-xl p-4 border border-warning/20">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-warning mt-0.5" />
            <div>
              <h4 className="font-semibold text-foreground text-sm">
                Filler Words Detected
              </h4>
              <div className="flex flex-wrap gap-2 mt-2">
                {feedback.fillerWords.map((word) => (
                  <Badge key={word} variant="warning">
                    {word}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Suggestions */}
      <div className="bg-primary/5 rounded-xl p-4 border border-primary/10">
        <div className="flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-primary mt-0.5" />
          <div>
            <h4 className="font-semibold text-foreground text-sm">Suggestions</h4>
            <p className="text-muted-foreground text-sm mt-1">
              {feedback.suggestions}
            </p>
          </div>
        </div>
      </div>

      {/* Encouragement */}
      <div className="bg-success/10 rounded-xl p-4 border border-success/20">
        <div className="flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-success mt-0.5" />
          <div>
            <p className="text-foreground text-sm font-medium">
              {feedback.encouragement}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

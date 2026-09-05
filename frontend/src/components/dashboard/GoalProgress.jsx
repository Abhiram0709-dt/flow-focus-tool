import { ProgressBar } from "@/components/common/ProgressBar.jsx";
import { Target } from "lucide-react";

export function GoalProgress({ currentSessions, goalSessions, currentMinutes, goalMinutes, goalType = "sessions" }) {
  const isSessionType = goalType === "sessions";
  const currentValue = isSessionType ? currentSessions : currentMinutes;
  const goalValue = isSessionType ? goalSessions : goalMinutes;
  const isGoalMet = currentValue >= goalValue;
  const unit = isSessionType ? "sessions" : "minutes";

  return (
    <div className="stat-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Today's Goal</h3>
          <p className="text-sm text-muted-foreground">
            {currentValue} / {goalValue} {unit}
          </p>
        </div>
      </div>
      <ProgressBar
        value={currentValue}
        max={goalValue}
        variant={isGoalMet ? "success" : "accent"}
      />
      {isGoalMet && (
        <p className="text-success text-sm mt-3 font-medium">
          🎉 You've reached your daily goal!
        </p>
      )}
    </div>
  );
}


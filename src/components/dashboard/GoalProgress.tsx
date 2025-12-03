import { ProgressBar } from "@/components/common/ProgressBar";
import { Target } from "lucide-react";

interface GoalProgressProps {
  currentMinutes: number;
  goalMinutes: number;
}

export function GoalProgress({ currentMinutes, goalMinutes }: GoalProgressProps) {
  const isGoalMet = currentMinutes >= goalMinutes;

  return (
    <div className="stat-card">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
          <Target className="w-5 h-5 text-accent" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Today's Goal</h3>
          <p className="text-sm text-muted-foreground">
            {currentMinutes} / {goalMinutes} minutes
          </p>
        </div>
      </div>
      <ProgressBar
        value={currentMinutes}
        max={goalMinutes}
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

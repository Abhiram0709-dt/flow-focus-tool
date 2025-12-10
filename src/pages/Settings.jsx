import { Navbar } from "@/components/layout/Navbar";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { useSettings } from "@/hooks/useSettings.js";
import { toast } from "sonner";

export default function Settings() {
  const { settings, updateSetting, loading } = useSettings();

  const focusAreaOptions = [
    { value: "overall", label: "Overall" },
    { value: "fluency", label: "Fluency" },
    { value: "clarity", label: "Clarity" },
    { value: "confidence", label: "Confidence" },
  ];

  const handleGoalChange = (value) => {
    const goalType = settings.goalType || "sessions";
    if (goalType === "sessions") {
      updateSetting("dailyGoalSessions", value);
    } else {
      updateSetting("dailyGoalMinutes", value);
    }
    toast.success("Daily goal updated");
  };

  const handleGoalTypeChange = (type) => {
    updateSetting("goalType", type);
    toast.success(`Goal type changed to ${type}`);
  };

  const handleFocusChange = (value) => {
    updateSetting("focusArea", value);
    toast.success("Focus area updated");
  };

  const handleMotivationToggle = (value) => {
    updateSetting("showMotivation", value);
    toast.success("Preference saved");
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageContainer>
          <PageHeader
            title="Settings"
            description="Loading your preferences..."
          />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageContainer>
        <PageHeader
          title="Settings"
          description="Customize your practice experience"
        />

        <div className="max-w-xl mx-auto space-y-6">
          {/* Daily Goal */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="font-semibold text-foreground mb-2">
              Daily Practice Goal
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Set your daily practice target
            </p>
            
            {/* Goal Type Selector */}
            <div className="flex gap-2 mb-4">
              <button
                onClick={() => handleGoalTypeChange("sessions")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  (settings.goalType || "sessions") === "sessions"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Sessions
              </button>
              <button
                onClick={() => handleGoalTypeChange("minutes")}
                className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-colors ${
                  settings.goalType === "minutes"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                Minutes
              </button>
            </div>

            {/* Goal Slider */}
            <div className="flex items-center gap-4">
              <input
                type="range"
                min={(settings.goalType || "sessions") === "sessions" ? 1 : 5}
                max={(settings.goalType || "sessions") === "sessions" ? 30 : 60}
                step={(settings.goalType || "sessions") === "sessions" ? 1 : 5}
                value={
                  (settings.goalType || "sessions") === "sessions"
                    ? settings.dailyGoalSessions || 15
                    : settings.dailyGoalMinutes || 15
                }
                onChange={(e) => handleGoalChange(Number(e.target.value))}
                className="flex-1 h-2 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
              />
              <div className="w-28 text-center">
                <span className="text-2xl font-bold text-foreground">
                  {(settings.goalType || "sessions") === "sessions"
                    ? settings.dailyGoalSessions || 15
                    : settings.dailyGoalMinutes || 15}
                </span>
                <span className="text-muted-foreground text-sm ml-1">
                  {(settings.goalType || "sessions") === "sessions" ? "sessions" : "min"}
                </span>
              </div>
            </div>
          </div>

          {/* Focus Area */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <h3 className="font-semibold text-foreground mb-2">
              Preferred Focus Area
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Choose what aspect of communication you want to improve
            </p>
            <div className="grid grid-cols-2 gap-3">
              {focusAreaOptions.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => handleFocusChange(value)}
                  className={`p-4 rounded-xl border-2 text-sm font-medium transition-all ${
                    settings.focusArea === value
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card hover:border-primary/50 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Motivational Messages */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="font-semibold text-foreground">
                  Show Motivational Messages
                </h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Display encouraging messages on the dashboard
                </p>
              </div>
              <button
                onClick={() => handleMotivationToggle(!settings.showMotivation)}
                className={`relative w-12 h-7 rounded-full transition-colors ${
                  settings.showMotivation ? "bg-primary" : "bg-muted"
                }`}
              >
                <span
                  className={`absolute top-1 w-5 h-5 rounded-full bg-card shadow transition-transform ${
                    settings.showMotivation ? "left-6" : "left-1"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Info */}
          <div className="bg-muted/50 rounded-2xl p-6">
            <h3 className="font-semibold text-foreground mb-2">
              About SpeakUp Coach
            </h3>
            <p className="text-sm text-muted-foreground">
              SpeakUp is your personal communication skills coach. Practice
              speaking, receive feedback, and track your progress over time. This
              is a demo version with mock AI analysis - real AI integration
              coming soon!
            </p>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}


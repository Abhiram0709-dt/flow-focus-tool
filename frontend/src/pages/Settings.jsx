import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { useSettings } from "@/hooks/useSettings.js";
import {
  getYoutubeAuthUrl,
  getYoutubeStatus,
  disconnectYoutube,
} from "@/api/serverApi.js";
import { toast } from "sonner";
import { Loader2, Youtube } from "lucide-react";

export default function Settings() {
  const { settings, updateSetting, loading } = useSettings();
  const [searchParams, setSearchParams] = useSearchParams();
  const [youtubeStatus, setYoutubeStatus] = useState(null);
  const [youtubeActionLoading, setYoutubeActionLoading] = useState(false);

  const loadYoutubeStatus = async () => {
    try {
      const data = await getYoutubeStatus();
      setYoutubeStatus(data);
    } catch (error) {
      console.error("Failed to load YouTube status", error);
    }
  };

  useEffect(() => {
    loadYoutubeStatus();
  }, []);

  useEffect(() => {
    const youtubeResult = searchParams.get("youtube");
    if (!youtubeResult) return;

    if (youtubeResult === "connected") {
      toast.success("YouTube account connected!");
      loadYoutubeStatus();
    } else if (youtubeResult === "error") {
      toast.error("Failed to connect YouTube account. Please try again.");
    }

    searchParams.delete("youtube");
    setSearchParams(searchParams, { replace: true });
  }, [searchParams]);

  const handleConnectYoutube = async () => {
    setYoutubeActionLoading(true);
    try {
      const { url } = await getYoutubeAuthUrl();
      window.location.href = url;
    } catch (error) {
      toast.error("Failed to start YouTube connection");
      console.error(error);
      setYoutubeActionLoading(false);
    }
  };

  const handleDisconnectYoutube = async () => {
    setYoutubeActionLoading(true);
    try {
      await disconnectYoutube();
      setYoutubeStatus({ connected: false });
      toast.success("YouTube account disconnected");
    } catch (error) {
      toast.error("Failed to disconnect YouTube");
      console.error(error);
    } finally {
      setYoutubeActionLoading(false);
    }
  };

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

          {/* YouTube Connection */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <Youtube className="w-6 h-6 text-destructive mt-0.5" />
                <div>
                  <h3 className="font-semibold text-foreground">YouTube</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {youtubeStatus?.connected
                      ? `Connected${youtubeStatus.channelTitle ? ` as ${youtubeStatus.channelTitle}` : ""}. Video sessions can be uploaded as unlisted videos.`
                      : "Connect your YouTube account to upload your recorded video sessions as unlisted videos."}
                  </p>
                </div>
              </div>
              <button
                onClick={
                  youtubeStatus?.connected
                    ? handleDisconnectYoutube
                    : handleConnectYoutube
                }
                disabled={youtubeActionLoading || youtubeStatus === null}
                className={`shrink-0 py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-60 ${
                  youtubeStatus?.connected
                    ? "bg-muted text-muted-foreground hover:bg-muted/80"
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                {youtubeActionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : youtubeStatus?.connected ? (
                  "Disconnect"
                ) : (
                  "Connect"
                )}
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


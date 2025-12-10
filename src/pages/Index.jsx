import { Link } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { StatCard } from "@/components/dashboard/StatCard";
import { GoalProgress } from "@/components/dashboard/GoalProgress";
import { Button } from "@/components/ui/button";
import { useSessions, useSessionStats } from "@/hooks/useSessions.js";
import { useSettings } from "@/hooks/useSettings.js";
import { Mic, Clock, TrendingUp, Flame, Sparkles } from "lucide-react";

const MOTIVATIONAL_MESSAGES = [
  "Every practice session brings you closer to mastering communication!",
  "Great speakers are made, not born. Keep practicing!",
  "Your dedication to improvement is inspiring!",
  "Small progress is still progress. Keep going!",
];

export default function Index() {
  const { sessions } = useSessions();
  const { settings, loading } = useSettings();
  const { totalSessions, totalMinutes, averageFluency, streak, todayMinutes, todaySessions } =
    useSessionStats(sessions);

  const motivationalMessage =
    MOTIVATIONAL_MESSAGES[Math.floor(Math.random() * MOTIVATIONAL_MESSAGES.length)];

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <PageContainer>
          <PageHeader
            title="Loading your dashboard"
            description="Please wait while we load your settings and progress"
          />
        </PageContainer>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageContainer>
        {/* Hero Section */}
        <div className="gradient-hero rounded-2xl p-6 md:p-8 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-foreground">
                Hi, let's improve your communication skills!
              </h1>
              {settings.showMotivation && (
                <p className="text-muted-foreground mt-2 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-accent" />
                  {motivationalMessage}
                </p>
              )}
            </div>
            <Link to="/practice">
              <Button size="lg" variant="accent">
                <Mic className="w-5 h-5" />
                Start Practice
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Sessions"
            value={totalSessions}
            subtitle="Total practice sessions"
            icon={Mic}
          />
          <StatCard
            title="Time Practiced"
            value={`${totalMinutes}m`}
            subtitle="Total minutes"
            icon={Clock}
          />
          <StatCard
            title="Avg. Fluency"
            value={averageFluency}
            subtitle="Out of 10"
            icon={TrendingUp}
          />
          <StatCard
            title="Streak"
            value={streak}
            subtitle={streak === 1 ? "Day" : "Days"}
            icon={Flame}
          />
        </div>

        {/* Goal Progress */}
        <div className="grid md:grid-cols-2 gap-6">
          <GoalProgress
            currentSessions={todaySessions}
            goalSessions={settings.dailyGoalSessions || 15}
            currentMinutes={todayMinutes}
            goalMinutes={settings.dailyGoalMinutes || 15}
            goalType={settings.goalType || "sessions"}
          />

          {/* Quick Actions */}
          <div className="stat-card">
            <h3 className="font-semibold text-foreground mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <Link to="/practice" className="block">
                <div className="p-4 rounded-xl bg-primary/5 border border-primary/10 hover:bg-primary/10 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Mic className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">New Practice Session</p>
                      <p className="text-sm text-muted-foreground">
                        Choose a topic and start recording
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
              <Link to="/history" className="block">
                <div className="p-4 rounded-xl bg-secondary hover:bg-secondary/80 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Clock className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">View History</p>
                      <p className="text-sm text-muted-foreground">
                        Review your past sessions
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </PageContainer>
    </div>
  );
}


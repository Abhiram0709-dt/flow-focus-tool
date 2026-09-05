import { useState } from "react";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { SessionList } from "@/components/history/SessionList";
import { Button } from "@/components/ui/button";
import { useSessions } from "@/hooks/useSessions.js";
import { Link } from "react-router-dom";
import { Mic, Video, List, Plus } from "lucide-react";
import { cn } from "@/lib/utils.js";

const filterOptions = [
  { value: "all", label: "All", icon: List },
  { value: "audio", label: "Audio", icon: Mic },
  { value: "video", label: "Video", icon: Video },
];

export default function History() {
  const { sessions, loading, removeSession } = useSessions();
  const [filterMode, setFilterMode] = useState("all");

  const handleDelete = async (id) => {
    try {
      await removeSession(id);
    } catch (error) {
      console.error("Failed to delete session", error);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageContainer>
        <PageHeader
          title="Practice History"
          description="Review your past practice sessions and track your progress"
          action={
            <Link to="/practice">
              <Button>
                <Plus className="w-4 h-4" />
                New Session
              </Button>
            </Link>
          }
        />

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {filterOptions.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => setFilterMode(value)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
                filterMode === value
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              )}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>

        {/* Sessions List */}
        {loading ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading sessions...</p>
          </div>
        ) : (
          <SessionList sessions={sessions} filterMode={filterMode} onDelete={handleDelete} />
        )}
      </PageContainer>
    </div>
  );
}


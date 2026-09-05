import { useState, useEffect } from "react";
import { useSessions } from "@/hooks/useSessions.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils.js";
import { Plus, Clock } from "lucide-react";

export function TopicSelector({ selectedTopic, onSelectTopic }) {
  const [customTopic, setCustomTopic] = useState("");
  const [showInput, setShowInput] = useState(false);
  const { sessions } = useSessions();
  
  // Get unique previous topics
  const previousTopics = [...new Set(sessions.map(s => s.topic))].slice(0, 10);

  const handleAddCustomTopic = () => {
    if (customTopic.trim()) {
      onSelectTopic(customTopic.trim());
      setCustomTopic("");
      setShowInput(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleAddCustomTopic();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Choose or Create a Topic</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowInput(!showInput)}
          className="text-primary"
        >
          <Plus className="w-4 h-4 mr-1" />
          Custom Topic
        </Button>
      </div>

      {/* Custom Topic Input */}
      {showInput && (
        <div className="flex gap-2">
          <Input
            placeholder="Enter your topic..."
            value={customTopic}
            onChange={(e) => setCustomTopic(e.target.value)}
            onKeyPress={handleKeyPress}
            className="flex-1"
            autoFocus
          />
          <Button onClick={handleAddCustomTopic} disabled={!customTopic.trim()}>
            Add
          </Button>
        </div>
      )}

      {/* Previous Topics */}
      {previousTopics.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span>Recently Used</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {previousTopics.map((topic) => (
              <button
                key={topic}
                onClick={() => onSelectTopic(topic)}
                className={cn(
                  "px-4 py-2 rounded-full text-sm font-medium transition-all duration-200",
                  selectedTopic === topic
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                )}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Show message if no previous topics */}
      {previousTopics.length === 0 && !showInput && (
        <div className="text-center py-8 text-sm text-muted-foreground">
          <p>No previous topics yet.</p>
          <p className="mt-1">Click "Custom Topic" to create your first one!</p>
        </div>
      )}
    </div>
  );
}


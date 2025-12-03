import { TOPICS, Topic } from "@/types/session";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Shuffle } from "lucide-react";

interface TopicSelectorProps {
  selectedTopic: Topic | null;
  onSelectTopic: (topic: Topic) => void;
}

export function TopicSelector({ selectedTopic, onSelectTopic }: TopicSelectorProps) {
  const handleRandomTopic = () => {
    const availableTopics = TOPICS.filter((t) => t !== selectedTopic);
    const randomIndex = Math.floor(Math.random() * availableTopics.length);
    onSelectTopic(availableTopics[randomIndex]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">Choose a Topic</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRandomTopic}
          className="text-primary"
        >
          <Shuffle className="w-4 h-4 mr-1" />
          Random
        </Button>
      </div>
      <div className="flex flex-wrap gap-2">
        {TOPICS.map((topic) => (
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
  );
}

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Navbar } from "@/components/layout/Navbar";
import { PageContainer, PageHeader } from "@/components/layout/PageContainer";
import { TopicSelector } from "@/components/practice/TopicSelector";
import { ModeSelector } from "@/components/practice/ModeSelector";
import { AudioRecorder } from "@/components/practice/AudioRecorder";
import { VideoRecorder } from "@/components/practice/VideoRecorder";
import { FeedbackSummary } from "@/components/practice/FeedbackSummary";
import { Button } from "@/components/ui/button";
import { useRecorder } from "@/hooks/useRecorder";
import { useSessions } from "@/hooks/useSessions";
import { analyzeSessionMock } from "@/api/mockAnalysis";
import { Topic, RecordingMode, Session, Feedback } from "@/types/session";
import { Save, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function Practice() {
  const navigate = useNavigate();
  const { saveSession } = useSessions();
  const [selectedTopic, setSelectedTopic] = useState<Topic | null>(null);
  const [selectedMode, setSelectedMode] = useState<RecordingMode>("audio");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [savedSessionId, setSavedSessionId] = useState<string | null>(null);

  const recorder = useRecorder({ mode: selectedMode });

  const handleSaveAndAnalyze = async () => {
    if (!selectedTopic || !recorder.mediaUrl) return;

    setIsAnalyzing(true);
    try {
      const analysisResult = await analyzeSessionMock({
        durationSeconds: recorder.duration,
        topic: selectedTopic,
      });

      const session: Session = {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
        topic: selectedTopic,
        mode: selectedMode,
        durationSeconds: recorder.duration,
        mediaUrl: recorder.mediaUrl,
        feedback: analysisResult,
      };

      saveSession(session);
      setFeedback(analysisResult);
      setSavedSessionId(session.id);
      toast.success("Session saved successfully!");
    } catch (error) {
      toast.error("Failed to analyze session");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewSession = () => {
    recorder.resetRecording();
    setFeedback(null);
    setSavedSessionId(null);
    setSelectedTopic(null);
  };

  const canRecord = selectedTopic !== null;
  const canSave = recorder.mediaUrl && !recorder.isRecording && selectedTopic;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <PageContainer>
        <PageHeader
          title="Practice Session"
          description="Choose a topic and start recording to improve your communication skills"
        />

        <div className="max-w-2xl mx-auto space-y-8">
          {/* Topic Selection */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <TopicSelector
              selectedTopic={selectedTopic}
              onSelectTopic={setSelectedTopic}
            />
          </div>

          {/* Mode Selection */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            <ModeSelector
              selectedMode={selectedMode}
              onSelectMode={(mode) => {
                if (!recorder.isRecording && !recorder.mediaUrl) {
                  setSelectedMode(mode);
                }
              }}
            />
          </div>

          {/* Recording Area */}
          <div className="bg-card rounded-2xl p-6 border border-border">
            {!canRecord ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  Please select a topic above to start recording
                </p>
              </div>
            ) : selectedMode === "audio" ? (
              <AudioRecorder
                isRecording={recorder.isRecording}
                duration={recorder.duration}
                mediaUrl={recorder.mediaUrl}
                error={recorder.error}
                onStart={recorder.startRecording}
                onStop={recorder.stopRecording}
                onReset={recorder.resetRecording}
              />
            ) : (
              <VideoRecorder
                isRecording={recorder.isRecording}
                duration={recorder.duration}
                mediaUrl={recorder.mediaUrl}
                stream={recorder.stream}
                error={recorder.error}
                onStart={recorder.startRecording}
                onStop={recorder.stopRecording}
                onReset={recorder.resetRecording}
              />
            )}
          </div>

          {/* Save Button */}
          {canSave && !feedback && (
            <Button
              onClick={handleSaveAndAnalyze}
              disabled={isAnalyzing}
              size="lg"
              className="w-full"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save & Analyze
                </>
              )}
            </Button>
          )}

          {/* Feedback Results */}
          {feedback && (
            <div className="bg-card rounded-2xl p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4">
                Your Feedback
              </h3>
              <FeedbackSummary feedback={feedback} />

              <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-border">
                <Button onClick={handleNewSession} variant="outline" className="flex-1">
                  New Session
                </Button>
                {savedSessionId && (
                  <Button
                    onClick={() => navigate(`/session/${savedSessionId}`)}
                    className="flex-1"
                  >
                    View Details
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </PageContainer>
    </div>
  );
}

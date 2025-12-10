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
import { useRecorder } from "@/hooks/useRecorder.js";
import { useWebSpeechRecognition } from "@/hooks/useWebSpeechRecognition.js";
import { useSessions } from "@/hooks/useSessions.js";
import { Save, Loader2, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { uploadMedia, getFeedback } from "@/api/serverApi.js";

export default function Practice() {
  const navigate = useNavigate();
  const { saveSession } = useSessions();
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [selectedMode, setSelectedMode] = useState("audio");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [savedSessionId, setSavedSessionId] = useState(null);

  const recorder = useRecorder({ mode: selectedMode });
  const speech = useWebSpeechRecognition();

  // Wrapper to start both recording and speech recognition
  const handleStartRecording = async () => {
    await recorder.startRecording();
    if (speech.isSupported) {
      speech.startListening();
    } else {
      toast.error("Speech recognition not supported in this browser. Transcript may not be available.");
    }
  };

  // Wrapper to stop both recording and speech recognition
  const handleStopRecording = () => {
    recorder.stopRecording();
    speech.stopListening();
  };

  // Wrapper to reset both
  const handleResetRecording = () => {
    recorder.resetRecording();
    speech.resetTranscript();
  };

  const handleSaveAndAnalyze = async () => {
    if (!selectedTopic || !recorder.mediaUrl || !recorder.blob) return;

    setIsAnalyzing(true);
    setAnalysisProgress("Uploading to Cloudinary...");
    try {
      // Prepare file for upload
      const file = new File(
        [recorder.blob],
        selectedMode === "video" ? "recording.webm" : "audio.webm",
        { type: recorder.blob.type || (selectedMode === "video" ? "video/webm" : "audio/webm") }
      );

      // 1) Upload to Cloudinary (for storage/playback)
      setAnalysisProgress("Uploading...");
      const uploadResult = await uploadMedia(file);

      // 2) Use Web Speech API transcript (FREE!)
      const transcript = speech.transcript.trim();
      
      if (!transcript) {
        toast.error("No transcript available. Please speak during recording.");
        setIsAnalyzing(false);
        setAnalysisProgress("");
        return;
      }

      setAnalysisProgress("Generating feedback...");
      // 3) Generate feedback using transcript
      const analysisResult = await getFeedback({
        transcript: transcript,
        durationSeconds: recorder.duration,
        topic: selectedTopic,
      });

      setAnalysisProgress("Saving session...");
      // 4) Persist session in backend
      const created = await saveSession({
        topic: selectedTopic,
        mode: selectedMode,
        durationSeconds: recorder.duration,
        mediaUrl: uploadResult.mediaUrl,
        transcript: transcript,
        feedback: analysisResult,
      });

      setFeedback(analysisResult);
      setSavedSessionId(created._id);
      setAnalysisProgress("");
      toast.success("Session analyzed and saved!");
    } catch (error) {
      setAnalysisProgress("");
      toast.error("Failed to analyze session");
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleNewSession = () => {
    recorder.resetRecording();
    speech.resetTranscript();
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
                onStart={handleStartRecording}
                onStop={handleStopRecording}
                onReset={handleResetRecording}
              />
            ) : (
              <VideoRecorder
                isRecording={recorder.isRecording}
                duration={recorder.duration}
                mediaUrl={recorder.mediaUrl}
                stream={recorder.stream}
                error={recorder.error}
                onStart={handleStartRecording}
                onStop={handleStopRecording}
                onReset={handleResetRecording}
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
                  {analysisProgress || "Analyzing..."}
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


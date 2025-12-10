import { useState, useEffect, useRef } from "react";
import { GoogleGenAI, Modality } from '@google/genai';
import { Button } from "@/components/ui/button";
import { Phone, PhoneOff, Loader2, Volume2, Mic, MicOff } from "lucide-react";
import { toast } from "sonner";

const GEMINI_LIVE_API_KEY = import.meta.env.VITE_GEMINI_LIVE_API_KEY;

export function LivePractice({ topic, onEnd }) {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [duration, setDuration] = useState(0);
  const [transcript, setTranscript] = useState("");
  
  const sessionRef = useRef(null);
  const streamRef = useRef(null);
  const timerRef = useRef(null);
  const audioChunksRef = useRef([]);
  const mediaRecorderRef = useRef(null);

  // Initialize live session with Gemini
  const connectToLive = async () => {
    setIsConnecting(true);
    
    try {
      if (!GEMINI_LIVE_API_KEY) {
        toast.error("Gemini Live API key not configured");
        setIsConnecting(false);
        return;
      }

      console.log("🎙️ Requesting microphone access...");
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      console.log("✅ Microphone access granted");

      // Initialize Gemini AI
      const ai = new GoogleGenAI({ apiKey: GEMINI_LIVE_API_KEY });
      const model = 'gemini-2.5-flash-native-audio-preview-09-2025';
      const config = { 
        responseModalities: [Modality.TEXT],
        systemInstruction: {
          parts: [{
            text: `You are a friendly communication coach helping with: ${topic}. Provide brief, encouraging responses.`
          }]
        }
      };

      console.log("🔌 Connecting to Gemini Live...");
      
      const session = await ai.live.connect({
        model: model,
        callbacks: {
          onopen: function () {
            console.log('✅ Connected!');
          },
          onmessage: function (message) {
            console.log('📨 Message:', message);
          },
          onerror: function (e) {
            console.error('❌ Error:', e.message);
          },
          onclose: function (e) {
            console.log('❌ Closed:', e.reason);
          },
        },
        config: config,
      });

      sessionRef.current = session;

      setIsConnected(true);
      setIsConnecting(false);
      toast.success("Connected! Click 'Start Recording' to speak");

      // Start timer
      timerRef.current = setInterval(() => {
        setDuration(prev => prev + 1);
      }, 1000);

      // Setup media recorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

    } catch (error) {
      console.error("Failed to connect:", error);
      toast.error("Failed to connect: " + error.message);
      setIsConnecting(false);
      disconnect();
    }
  };

  // Start recording
  const startRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'inactive') {
      audioChunksRef.current = [];
      mediaRecorderRef.current.start();
      setIsRecording(true);
      toast.success("Recording... Speak now!");
    }
  };

  // Stop recording and send to AI
  const stopRecording = async () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      
      // Wait for data to be available
      await new Promise(resolve => setTimeout(resolve, 100));
      
      console.log("🎤 Processing your speech...");
      toast("Processing your speech...");
      
      try {
        // Create audio blob
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        
        // Convert to base64
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        
        reader.onloadend = async () => {
          const base64Audio = reader.result.split(',')[1];
          
          // Send audio to Gemini Live
          console.log("🎤 Sending audio to Gemini...");
          
          const prompt = `Listen to this audio about ${topic}. Transcribe what was said and provide brief encouragement.`;
          
          sessionRef.current.sendClientContent({ 
            turns: [
              { role: "user", parts: [{ text: prompt }] },
              { role: "user", parts: [{ 
                inlineData: {
                  mimeType: 'audio/webm',
                  data: base64Audio
                }
              }] }
            ],
            turnComplete: true 
          });
          
          toast("Waiting for AI response...");
        };
      } catch (error) {
        console.error("Error processing audio:", error);
        toast.error("Error: " + error.message);
      }
    }
  };

  // Listen for AI responses
  useEffect(() => {
    if (!sessionRef.current) return;
    
    const handleMessage = (message) => {
      console.log('Got message:', message);
      
      // Extract text from response
      if (message.serverContent?.modelTurn?.parts) {
        const textParts = message.serverContent.modelTurn.parts
          .filter(p => p.text)
          .map(p => p.text)
          .join(' ');
        
        if (textParts) {
          console.log("🤖 AI Response:", textParts);
          setTranscript(prev => prev + "\n\nAI: " + textParts);
          toast.success("AI responded!");
          
          // Speak response using text-to-speech
          if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(textParts);
            utterance.onstart = () => setIsSpeaking(true);
            utterance.onend = () => setIsSpeaking(false);
            window.speechSynthesis.speak(utterance);
          }
        }
      }
    };
  }, []);

  // Disconnect and cleanup
  const disconnect = () => {
    setIsConnected(false);
    
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    
    setIsConnecting(false);
    setIsRecording(false);
  };

  // Handle end session
  const handleEndSession = () => {
    disconnect();
    if (onEnd) {
      const finalTranscript = transcript.trim() || "Live conversation completed";
      onEnd({ transcript: finalTranscript, duration });
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disconnect();
    };
  }, []);

  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-6">
      {/* Status Display */}
      <div className="text-center space-y-4">
        <div className="w-32 h-32 mx-auto rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center relative">
          {isSpeaking && (
            <div className="absolute inset-0 rounded-full bg-success/30 animate-pulse" />
          )}
          {isConnected && !isSpeaking && (
            <div className="absolute inset-0 rounded-full bg-accent/20 animate-ping" />
          )}
          {isSpeaking ? (
            <Volume2 className="w-16 h-16 text-success" />
          ) : (
            <Phone className={`w-16 h-16 ${isConnected ? 'text-accent' : 'text-muted-foreground'}`} />
          )}
        </div>
        
        <div>
          <h3 className="text-xl font-semibold text-foreground">
            {!isConnected && !isConnecting && "Ready to Start"}
            {isConnecting && "Connecting..."}
            {isConnected && isSpeaking && "AI is speaking..."}
            {isConnected && !isSpeaking && "Your turn to speak"}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            Topic: {topic}
          </p>
          {isConnected && (
            <p className="text-lg font-mono text-foreground mt-2">
              {formatDuration(duration)}
            </p>
          )}
        </div>
      </div>

      {/* Info Note */}
      {isConnected && (
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm text-blue-600 dark:text-blue-400">
          <p className="font-medium mb-1">🎙️ Live Conversation Active</p>
          <p>Speak naturally! The AI will listen and respond with voice.</p>
        </div>
      )}

      {/* Transcript Preview */}
      {transcript && (
        <div className="bg-card rounded-lg p-4 border border-border max-h-32 overflow-y-auto">
          <h4 className="text-sm font-semibold text-foreground mb-2">Your Speech:</h4>
          <p className="text-sm text-muted-foreground">{transcript}</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex gap-3 justify-center">
        {!isConnected ? (
          <Button
            size="lg"
            onClick={connectToLive}
            disabled={isConnecting}
            className="min-w-[200px]"
          >
            {isConnecting ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Phone className="w-5 h-5 mr-2" />
                Start Session
              </>
            )}
          </Button>
        ) : (
          <>
            {!isRecording ? (
              <Button
                size="lg"
                onClick={startRecording}
                className="min-w-[200px]"
              >
                <Mic className="w-5 h-5 mr-2" />
                Start Recording
              </Button>
            ) : (
              <Button
                size="lg"
                variant="secondary"
                onClick={stopRecording}
                className="min-w-[200px]"
              >
                <MicOff className="w-5 h-5 mr-2" />
                Stop & Send
              </Button>
            )}
            <Button
              size="lg"
              variant="destructive"
              onClick={handleEndSession}
            >
              <PhoneOff className="w-5 h-5 mr-2" />
              End Session
            </Button>
          </>
        )}
      </div>

      {/* Info */}
      <div className="text-center text-sm text-muted-foreground">
        <p>💡 Simple mode: Click "Start Recording", speak, then click "Stop & Send"</p>
        <p className="mt-1">AI will transcribe and respond with voice</p>
      </div>
    </div>
  );
}

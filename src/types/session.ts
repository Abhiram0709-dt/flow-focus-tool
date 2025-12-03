export interface Feedback {
  fluencyScore: number;
  clarityScore: number;
  confidenceScore: number;
  fillerWords: string[];
  suggestions: string;
  encouragement: string;
}

export interface Session {
  id: string;
  createdAt: string;
  topic: string;
  mode: "audio" | "video";
  durationSeconds: number;
  mediaUrl: string;
  transcript?: string;
  feedback: Feedback;
}

export interface Settings {
  dailyGoalMinutes: number;
  focusArea: "fluency" | "clarity" | "confidence" | "overall";
  showMotivation: boolean;
}

export type RecordingMode = "audio" | "video";

export const TOPICS = [
  "Introduce yourself",
  "Describe your day",
  "Talk about your favorite movie",
  "Explain a concept you know well",
  "Share a recent achievement",
  "Discuss your career goals",
] as const;

export type Topic = (typeof TOPICS)[number];

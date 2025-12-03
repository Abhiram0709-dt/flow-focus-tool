import { Feedback } from "@/types/session";

interface AnalyzeArgs {
  transcript?: string;
  durationSeconds: number;
  topic: string;
}

const FILLER_WORDS_POOL = [
  ["um", "uh", "like"],
  ["you know", "basically", "actually"],
  ["so", "well", "right"],
  ["I mean", "kind of", "sort of"],
];

const SUGGESTIONS_MAP: Record<string, string> = {
  short:
    "Try speaking for at least 1 minute to develop your thoughts more fully. Longer practice sessions help build confidence and allow you to explore topics in depth.",
  medium:
    "Great effort! To improve further, try organizing your thoughts into a clear beginning, middle, and end. This structure will make your communication more impactful.",
  long: "Excellent practice duration! Focus on maintaining consistent energy throughout your speech. Consider varying your pace to emphasize key points.",
};

const ENCOURAGEMENTS = [
  "You're making great progress! Every practice session brings you closer to your goals.",
  "Keep up the amazing work! Consistent practice is the key to mastering communication.",
  "Fantastic effort today! Remember, every speaker was once a beginner.",
  "You should be proud of yourself for showing up and practicing!",
  "Great job! The more you practice, the more natural it will feel.",
];

function randomInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getScoresBasedOnDuration(durationSeconds: number): {
  fluency: number;
  clarity: number;
  confidence: number;
} {
  if (durationSeconds < 30) {
    return {
      fluency: randomInRange(4, 6),
      clarity: randomInRange(4, 6),
      confidence: randomInRange(3, 5),
    };
  } else if (durationSeconds < 60) {
    return {
      fluency: randomInRange(5, 7),
      clarity: randomInRange(5, 7),
      confidence: randomInRange(5, 7),
    };
  } else if (durationSeconds < 120) {
    return {
      fluency: randomInRange(6, 8),
      clarity: randomInRange(6, 8),
      confidence: randomInRange(6, 8),
    };
  } else {
    return {
      fluency: randomInRange(7, 9),
      clarity: randomInRange(7, 9),
      confidence: randomInRange(7, 9),
    };
  }
}

export async function analyzeSessionMock(args: AnalyzeArgs): Promise<Feedback> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const { durationSeconds } = args;
  const scores = getScoresBasedOnDuration(durationSeconds);

  // Pick random filler words
  const fillerWordsSet =
    FILLER_WORDS_POOL[randomInRange(0, FILLER_WORDS_POOL.length - 1)];
  const numFillers = durationSeconds < 30 ? 3 : durationSeconds < 60 ? 2 : 1;
  const fillerWords = fillerWordsSet.slice(0, numFillers);

  // Get appropriate suggestion
  let suggestions: string;
  if (durationSeconds < 30) {
    suggestions = SUGGESTIONS_MAP.short;
  } else if (durationSeconds < 90) {
    suggestions = SUGGESTIONS_MAP.medium;
  } else {
    suggestions = SUGGESTIONS_MAP.long;
  }

  // Random encouragement
  const encouragement =
    ENCOURAGEMENTS[randomInRange(0, ENCOURAGEMENTS.length - 1)];

  return {
    fluencyScore: scores.fluency,
    clarityScore: scores.clarity,
    confidenceScore: scores.confidence,
    fillerWords,
    suggestions,
    encouragement,
  };
}

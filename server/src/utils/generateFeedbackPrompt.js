export const generateFeedbackPrompt = (
  transcript,
  durationSeconds,
  topic
) => {
  return `
You are an expert communication coach. Analyze the following practice session and return STRICT JSON only.

Requirements:
- Rate the speaker on a 0-10 scale for fluency, clarity, and confidence.
- Identify common filler words actually used in the transcript (e.g. "um", "uh", "like", "you know").
- Provide concise, practical suggestions for improvement.
- Provide a short, encouraging message tailored to the speaker.

Return a JSON object with exactly this shape:
{
  "fluencyScore": number (0-10),
  "clarityScore": number (0-10),
  "confidenceScore": number (0-10),
  "fillerWords": string[],
  "suggestions": string,
  "encouragement": string
}

Context:
- Topic: ${topic}
- Duration (seconds): ${durationSeconds}

Transcript:
${transcript}
`;
};


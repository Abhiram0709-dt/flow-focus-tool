import axios from "axios";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateFeedbackPrompt } from "../utils/generateFeedbackPrompt.js";

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error("GEMINI_API_KEY is not set in environment variables");
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

export const transcribeMedia = async (req, res) => {
  try {
    const { mediaUrl, audioData } = req.body;

    let audioBuffer;
    let mimeType = "audio/webm";

    // If audioData is provided directly (from frontend blob), use it (faster)
    if (audioData) {
      audioBuffer = Buffer.from(audioData, "base64");
    } else if (mediaUrl) {
      // Fallback: download from Cloudinary URL
      const response = await axios.get(mediaUrl, {
        responseType: "arraybuffer",
      });
      audioBuffer = Buffer.from(response.data);
      // Detect mime type from URL
      if (mediaUrl.includes(".mp4") || mediaUrl.includes("video")) {
        mimeType = "video/webm";
      }
    } else {
      return res.status(400).json({ message: "mediaUrl or audioData is required" });
    }

    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash-lite",
    });

    // Optimized prompt for faster response
    const result = await model.generateContent([
      {
        text: "Transcribe this audio. Return only the transcript text, nothing else.",
      },
      {
        inlineData: {
          mimeType,
          data: audioBuffer.toString("base64"),
        },
      },
    ]);

    const transcript = result.response.text();

    return res.status(200).json({ transcript });
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Transcription error", error);
    
    // Check for rate limit errors
    if (error.status === 429) {
      return res.status(429).json({ 
        message: "Rate limit exceeded. Please wait and try again.", 
        error: String(error) 
      });
    }
    
    return res
      .status(500)
      .json({ 
        message: "Failed to transcribe media", 
        error: String(error),
        details: error.message 
      });
  }
};

export const generateFeedback = async (req, res) => {
  try {
    const {
      transcript,
      durationSeconds,
      topic,
    } = req.body;

    if (transcript === undefined || durationSeconds === undefined || !topic) {
      return res.status(400).json({
        message: "transcript, durationSeconds, and topic are required",
      });
    }

    const prompt = generateFeedbackPrompt(transcript, durationSeconds, topic);

    // Retry logic for API overload
    let result;
    let attempts = 0;
    const maxAttempts = 3;
    
    while (attempts < maxAttempts) {
      try {
        const model = genAI.getGenerativeModel({
          model: "gemini-2.5-flash-lite",
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 500,
          },
        });

        result = await model.generateContent(prompt);
        break; // Success, exit loop
      } catch (error) {
        attempts++;
        if (error.status === 503 && attempts < maxAttempts) {
          console.log(`API overloaded, retrying... (${attempts}/${maxAttempts})`);
          await new Promise(resolve => setTimeout(resolve, 1000 * attempts)); // Exponential backoff
        } else {
          throw error; // Re-throw if not 503 or max attempts reached
        }
      }
    }

    let raw = result.response.text() ?? "{}";

    // Some models may wrap JSON in markdown fences like ```json ... ```
    raw = raw.trim();

    // Prefer regex to strip fenced blocks if present
    const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
    if (fenceMatch && fenceMatch[1]) {
      raw = fenceMatch[1].trim();
    } else if (raw.startsWith("```")) {
      // Fallback: slice from first { to last }
      const firstBrace = raw.indexOf("{");
      const lastBrace = raw.lastIndexOf("}");
      if (firstBrace !== -1 && lastBrace !== -1) {
        raw = raw.slice(firstBrace, lastBrace + 1);
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (parseError) {
      // eslint-disable-next-line no-console
      console.error("Failed to parse feedback JSON", parseError, raw);
      return res.status(500).json({
        message: "Failed to parse feedback JSON",
      });
    }

    return res.status(200).json(parsed);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Feedback generation error", error);
    return res.status(500).json({
      message: "Failed to generate feedback",
      error: String(error),
    });
  }
};


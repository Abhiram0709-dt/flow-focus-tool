import mongoose, { Schema } from "mongoose";

const FeedbackSchema = new Schema(
  {
    fluencyScore: { type: Number, required: true },
    clarityScore: { type: Number, required: true },
    confidenceScore: { type: Number, required: true },
    fillerWords: { type: [String], required: true, default: [] },
    suggestions: { type: String, required: true },
    encouragement: { type: String, required: true },
  },
  { _id: false }
);

const SessionSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true },
  topic: { type: String, required: true },
  mode: { type: String, enum: ["audio", "video", "live"], required: true },
  durationSeconds: { type: Number, required: true },
  mediaUrl: { type: String, required: false },
  transcript: { type: String, required: true },
  feedback: { type: FeedbackSchema, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Session =
  mongoose.models.Session ||
  mongoose.model("Session", SessionSchema);


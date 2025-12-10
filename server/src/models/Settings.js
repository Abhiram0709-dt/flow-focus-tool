import mongoose, { Schema } from "mongoose";

const SettingsSchema = new Schema({
  user: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  dailyGoalMinutes: { type: Number, required: true, default: 15 },
  dailyGoalSessions: { type: Number, required: true, default: 15 },
  goalType: { type: String, enum: ["sessions", "minutes"], required: true, default: "sessions" },
  focusArea: {
    type: String,
    enum: ["fluency", "clarity", "confidence", "overall"],
    required: true,
    default: "overall",
  },
  showMotivation: { type: Boolean, required: true, default: true },
});

export const Settings =
  mongoose.models.Settings ||
  mongoose.model("Settings", SettingsSchema);


import { Settings } from "../models/Settings.js";

export const getSettings = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    let settings = await Settings.findOne({ user: userId }).lean();

    if (!settings) {
      const created = await Settings.create({ user: userId });
      settings = created.toObject();
    }

    return res.status(200).json(settings);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Get settings error", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch settings", error: String(error) });
  }
};

export const updateSettings = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { dailyGoalMinutes, dailyGoalSessions, goalType, focusArea, showMotivation } = req.body;

    // Build update object with only provided fields
    const updateData = {};
    if (typeof dailyGoalMinutes === "number") updateData.dailyGoalMinutes = dailyGoalMinutes;
    if (typeof dailyGoalSessions === "number") updateData.dailyGoalSessions = dailyGoalSessions;
    if (goalType && (goalType === "sessions" || goalType === "minutes")) updateData.goalType = goalType;
    if (focusArea) updateData.focusArea = focusArea;
    if (typeof showMotivation === "boolean") updateData.showMotivation = showMotivation;

    const updated = await Settings.findOneAndUpdate(
      { user: userId },
      updateData,
      { new: true, upsert: true }
    ).lean();

    return res.status(200).json(updated);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Update settings error", error);
    return res
      .status(500)
      .json({ message: "Failed to update settings", error: String(error) });
  }
};


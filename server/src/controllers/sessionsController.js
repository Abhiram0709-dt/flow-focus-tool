import mongoose from "mongoose";
import { Session } from "../models/Session.js";
import cloudinary from "../config/cloudinary.js";

export const createSession = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const {
      topic,
      mode,
      durationSeconds,
      mediaUrl,
      transcript,
      feedback,
    } = req.body;

    if (
      !topic ||
      !mode ||
      typeof durationSeconds !== "number" ||
      !mediaUrl ||
      !transcript ||
      !feedback
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const session = await Session.create({
      user: userId,
      topic,
      mode,
      durationSeconds,
      mediaUrl,
      transcript,
      feedback,
    });

    return res.status(201).json(session);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Create session error", error);
    return res
      .status(500)
      .json({ message: "Failed to create session", error: String(error) });
  }
};

export const getSessions = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const sessions = await Session.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();
    return res.status(200).json(sessions);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Get sessions error", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch sessions", error: String(error) });
  }
};

export const getSessionById = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid session id" });
    }
    const session = await Session.findOne({ _id: id, user: userId }).lean();

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    return res.status(200).json(session);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Get session error", error);
    return res
      .status(500)
      .json({ message: "Failed to fetch session", error: String(error) });
  }
};

export const deleteSession = async (req, res) => {
  try {
    const userId = req.userId;
    if (!userId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = req.params;
    const session = await Session.findOne({ _id: id, user: userId });

    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Extract public_id from Cloudinary URL and delete from Cloudinary
    try {
      const mediaUrl = session.mediaUrl;
      if (mediaUrl && mediaUrl.includes("cloudinary.com")) {
        // Extract public_id from Cloudinary URL
        // URL format: https://res.cloudinary.com/{cloud_name}/video/upload/{version}/{public_id}.{format}
        // or: https://res.cloudinary.com/{cloud_name}/video/upload/{public_id}.{format}
        const urlParts = mediaUrl.split("/upload/");
        if (urlParts.length > 1) {
          const afterUpload = urlParts[1];
          // Remove version if present (v1234567890/)
          const withoutVersion = afterUpload.replace(/^v\d+\//, "");
          // Extract public_id (remove file extension)
          const publicId = withoutVersion.replace(/\.[^.]*$/, "");
          
          // Delete from Cloudinary
          await cloudinary.uploader.destroy(publicId, {
            resource_type: "video",
          });
        }
      }
    } catch (cloudinaryError) {
      // eslint-disable-next-line no-console
      console.error("Cloudinary delete error", cloudinaryError);
      // Continue with database deletion even if Cloudinary deletion fails
    }

    // Delete from database
    await Session.findByIdAndDelete(id);

    return res.status(204).send();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Delete session error", error);
    return res
      .status(500)
      .json({ message: "Failed to delete session", error: String(error) });
  }
};


import jwt from "jsonwebtoken";
import axios from "axios";
import { google } from "googleapis";
import mongoose from "mongoose";
import { createYoutubeOAuthClient, YOUTUBE_UPLOAD_SCOPES } from "../config/youtube.js";
import { User } from "../models/User.js";
import { Session } from "../models/Session.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Step 1: authenticated user requests the Google consent URL for YouTube upload access.
export const getYoutubeAuthUrl = async (req, res) => {
  try {
    const state = jwt.sign({ userId: req.userId, purpose: "youtube-connect" }, JWT_SECRET, {
      expiresIn: "10m",
    });

    const oauth2Client = createYoutubeOAuthClient();
    const url = oauth2Client.generateAuthUrl({
      access_type: "offline",
      prompt: "consent",
      scope: YOUTUBE_UPLOAD_SCOPES,
      state,
    });

    return res.status(200).json({ url });
  } catch (error) {
    console.error("[YOUTUBE_AUTH_URL ERROR]", error);
    return res.status(500).json({ message: "Failed to start YouTube connection" });
  }
};

// Step 2: Google redirects here with a code + our signed state (no Authorization header available).
export const youtubeCallback = async (req, res) => {
  const { code, state, error: oauthError } = req.query;

  if (oauthError || !code || !state) {
    return res.redirect(`${CLIENT_ORIGIN}/settings?youtube=error`);
  }

  try {
    const decoded = jwt.verify(String(state), JWT_SECRET);
    if (decoded.purpose !== "youtube-connect" || !decoded.userId) {
      throw new Error("Invalid state payload");
    }

    const oauth2Client = createYoutubeOAuthClient();
    const { tokens } = await oauth2Client.getToken(String(code));
    oauth2Client.setCredentials(tokens);

    let channelTitle;
    try {
      const youtube = google.youtube({ version: "v3", auth: oauth2Client });
      const { data } = await youtube.channels.list({ part: ["snippet"], mine: true });
      channelTitle = data.items?.[0]?.snippet?.title;
    } catch (channelError) {
      console.error("[YOUTUBE_CALLBACK] Failed to fetch channel info", channelError);
    }

    const update = {
      "youtube.accessToken": tokens.access_token,
      "youtube.accessTokenExpiresAt": tokens.expiry_date ? new Date(tokens.expiry_date) : undefined,
      "youtube.connectedAt": new Date(),
    };
    if (tokens.refresh_token) {
      update["youtube.refreshToken"] = tokens.refresh_token;
    }
    if (channelTitle) {
      update["youtube.channelTitle"] = channelTitle;
    }

    await User.findByIdAndUpdate(decoded.userId, { $set: update });

    return res.redirect(`${CLIENT_ORIGIN}/settings?youtube=connected`);
  } catch (error) {
    console.error("[YOUTUBE_CALLBACK ERROR]", error);
    return res.redirect(`${CLIENT_ORIGIN}/settings?youtube=error`);
  }
};

export const getYoutubeStatus = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("youtube");
    const connected = Boolean(user?.youtube?.refreshToken);
    return res.status(200).json({
      connected,
      channelTitle: connected ? user.youtube.channelTitle : undefined,
    });
  } catch (error) {
    console.error("[YOUTUBE_STATUS ERROR]", error);
    return res.status(500).json({ message: "Failed to load YouTube status" });
  }
};

export const disconnectYoutube = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.userId, { $unset: { youtube: "" } });
    return res.status(200).json({ connected: false });
  } catch (error) {
    console.error("[YOUTUBE_DISCONNECT ERROR]", error);
    return res.status(500).json({ message: "Failed to disconnect YouTube" });
  }
};

export const uploadSessionToYoutube = async (req, res) => {
  try {
    const { sessionId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(sessionId)) {
      return res.status(400).json({ message: "Invalid session id" });
    }

    const session = await Session.findOne({ _id: sessionId, user: req.userId });
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    if (session.mode !== "video" || !session.mediaUrl) {
      return res.status(400).json({ message: "Only recorded video sessions can be uploaded to YouTube" });
    }

    if (session.youtube?.videoId) {
      return res.status(200).json(session.youtube);
    }

    const user = await User.findById(req.userId).select("youtube");
    if (!user?.youtube?.refreshToken) {
      return res.status(400).json({ message: "Connect your YouTube account first", code: "YOUTUBE_NOT_CONNECTED" });
    }

    const oauth2Client = createYoutubeOAuthClient();
    oauth2Client.setCredentials({ refresh_token: user.youtube.refreshToken });
    oauth2Client.on("tokens", async (tokens) => {
      const update = {};
      if (tokens.access_token) update["youtube.accessToken"] = tokens.access_token;
      if (tokens.expiry_date) update["youtube.accessTokenExpiresAt"] = new Date(tokens.expiry_date);
      if (tokens.refresh_token) update["youtube.refreshToken"] = tokens.refresh_token;
      if (Object.keys(update).length > 0) {
        await User.findByIdAndUpdate(req.userId, { $set: update }).catch(() => {});
      }
    });

    const videoStream = await axios.get(session.mediaUrl, { responseType: "stream" });

    const youtube = google.youtube({ version: "v3", auth: oauth2Client });
    const { data } = await youtube.videos.insert({
      part: ["snippet", "status"],
      requestBody: {
        snippet: {
          title: (session.topic || "Practice session").slice(0, 100),
          description: `Recorded with Flow Focus Tool.\n\nTopic: ${session.topic || "N/A"}`,
        },
        status: {
          privacyStatus: "unlisted",
        },
      },
      media: {
        body: videoStream.data,
      },
    });

    const youtubeInfo = {
      videoId: data.id,
      url: `https://www.youtube.com/watch?v=${data.id}`,
      uploadedAt: new Date(),
    };

    session.youtube = youtubeInfo;
    await session.save();

    return res.status(201).json(youtubeInfo);
  } catch (error) {
    console.error("[YOUTUBE_UPLOAD ERROR]", error?.response?.data || error);
    return res.status(500).json({ message: "Failed to upload video to YouTube", error: String(error) });
  }
};

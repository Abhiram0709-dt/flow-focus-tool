import { google } from "googleapis";

const SERVER_URL = process.env.SERVER_URL || "http://localhost:5000";

export const YOUTUBE_UPLOAD_SCOPES = [
  "https://www.googleapis.com/auth/youtube.upload",
  "https://www.googleapis.com/auth/youtube.readonly",
];

export function createYoutubeOAuthClient() {
  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    `${SERVER_URL}/api/youtube/callback`
  );
}

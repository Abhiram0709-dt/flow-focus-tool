import { Router } from "express";
import { authenticate } from "../middleware/auth.js";
import {
  getYoutubeAuthUrl,
  youtubeCallback,
  getYoutubeStatus,
  disconnectYoutube,
  uploadSessionToYoutube,
} from "../controllers/youtubeController.js";

const router = Router();

// Google redirects here directly, so it cannot carry our normal Bearer auth header.
router.get("/callback", youtubeCallback);

router.use(authenticate);

router.get("/auth-url", getYoutubeAuthUrl);
router.get("/status", getYoutubeStatus);
router.delete("/disconnect", disconnectYoutube);
router.post("/upload/:sessionId", uploadSessionToYoutube);

export default router;

import { Router } from "express";
import { signup, login, getCurrentUser } from "../controllers/authController.js";
import { authenticate } from "../middleware/auth.js";
import { verifyTurnstile } from "../middleware/turnstile.js";
import {
  googleAuth,
  githubAuth,
  facebookAuth,
  linkedinAuth,
  googleCallback,
  githubCallback,
  facebookCallback,
  linkedinCallback,
  oauthCallback,
} from "../controllers/oauthController.js";

const router = Router();

// OAuth routes
router.get("/google", googleAuth);
router.get("/google/callback", googleCallback, oauthCallback);

router.get("/github", githubAuth);
router.get("/github/callback", githubCallback, oauthCallback);

router.get("/facebook", facebookAuth);
router.get("/facebook/callback", facebookCallback, oauthCallback);

router.get("/linkedin", linkedinAuth);
router.get("/linkedin/callback", linkedinCallback, oauthCallback);

// Regular auth routes - Turnstile verification is handled in the controller via middleware
// But we'll verify it in the middleware before processing
router.post("/signup", verifyTurnstile, signup);
router.post("/login", verifyTurnstile, login);
router.get("/me", authenticate, getCurrentUser);

export default router;


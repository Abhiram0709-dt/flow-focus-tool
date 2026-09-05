import passport from "passport";
import { generateToken } from "../config/passport.js";

const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// OAuth callback handler
export const oauthCallback = async (req, res) => {
  try {
    console.log(`[OAUTH_CALLBACK] Processing OAuth callback`);
    const user = req.user;
    if (!user) {
      console.log(`[OAUTH_CALLBACK] No user found in request`);
      return res.redirect(`${CLIENT_ORIGIN}/login?error=oauth_failed`);
    }

    console.log(`[OAUTH_CALLBACK] User authenticated: ${user.email}`);
    const token = generateToken(user);
    console.log(`[OAUTH_CALLBACK] Token generated, redirecting to: ${CLIENT_ORIGIN}/auth/callback`);
    return res.redirect(`${CLIENT_ORIGIN}/auth/callback?token=${token}`);
  } catch (error) {
    console.error("[OAUTH_CALLBACK ERROR]", error);
    return res.redirect(`${CLIENT_ORIGIN}/login?error=oauth_failed`);
  }
};

// OAuth initiation handlers
export const googleAuth = passport.authenticate("google", {
  scope: ["profile", "email"],
});

export const githubAuth = passport.authenticate("github", {
  scope: ["user:email"],
});

export const facebookAuth = passport.authenticate("facebook", {
  scope: ["email"],
});

export const linkedinAuth = passport.authenticate("linkedin", {
  scope: ["r_liteprofile", "r_emailaddress"],
});

// OAuth callback handlers
export const googleCallback = passport.authenticate("google", {
  failureRedirect: `${CLIENT_ORIGIN}/login?error=oauth_failed`,
  session: false,
});

export const githubCallback = passport.authenticate("github", {
  failureRedirect: `${CLIENT_ORIGIN}/login?error=oauth_failed`,
  session: false,
});

export const facebookCallback = passport.authenticate("facebook", {
  failureRedirect: `${CLIENT_ORIGIN}/login?error=oauth_failed`,
  session: false,
});

export const linkedinCallback = passport.authenticate("linkedin", {
  failureRedirect: `${CLIENT_ORIGIN}/login?error=oauth_failed`,
  session: false,
});


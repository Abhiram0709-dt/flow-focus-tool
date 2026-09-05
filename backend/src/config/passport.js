import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { Strategy as FacebookStrategy } from "passport-facebook";
import { Strategy as LinkedInStrategy } from "passport-linkedin-oauth2";
import { User } from "../models/User.js";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Serialize user for session
passport.serializeUser((user, done) => {
  done(null, user._id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (error) {
    done(error, null);
  }
});

// Google Strategy
if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(
    new GoogleStrategy(
      {
        clientID: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/google/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            $or: [
              { email: profile.emails?.[0]?.value?.toLowerCase() },
              { providerId: profile.id, provider: "google" },
            ],
          });

          if (user) {
            // Update provider info if needed
            if (!user.providerId) {
              user.providerId = profile.id;
              user.provider = "google";
              await user.save();
            }
          } else {
            user = await User.create({
              email: profile.emails?.[0]?.value?.toLowerCase() || "",
              name: profile.displayName || profile.name?.givenName || "User",
              provider: "google",
              providerId: profile.id,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// GitHub Strategy
if (process.env.GITHUB_CLIENT_ID && process.env.GITHUB_CLIENT_SECRET) {
  passport.use(
    new GitHubStrategy(
      {
        clientID: process.env.GITHUB_CLIENT_ID,
        clientSecret: process.env.GITHUB_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/github/callback`,
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            $or: [
              { email: profile.emails?.[0]?.value?.toLowerCase() },
              { providerId: profile.id, provider: "github" },
            ],
          });

          if (user) {
            if (!user.providerId) {
              user.providerId = profile.id;
              user.provider = "github";
              await user.save();
            }
          } else {
            user = await User.create({
              email: profile.emails?.[0]?.value?.toLowerCase() || `${profile.username}@github.local`,
              name: profile.displayName || profile.username || "User",
              provider: "github",
              providerId: profile.id,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Facebook Strategy
if (process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET) {
  passport.use(
    new FacebookStrategy(
      {
        clientID: process.env.FACEBOOK_APP_ID,
        clientSecret: process.env.FACEBOOK_APP_SECRET,
        callbackURL: `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/facebook/callback`,
        profileFields: ["id", "displayName", "emails"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            $or: [
              { email: profile.emails?.[0]?.value?.toLowerCase() },
              { providerId: profile.id, provider: "facebook" },
            ],
          });

          if (user) {
            if (!user.providerId) {
              user.providerId = profile.id;
              user.provider = "facebook";
              await user.save();
            }
          } else {
            user = await User.create({
              email: profile.emails?.[0]?.value?.toLowerCase() || `${profile.id}@facebook.local`,
              name: profile.displayName || "User",
              provider: "facebook",
              providerId: profile.id,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// LinkedIn Strategy
if (process.env.LINKEDIN_CLIENT_ID && process.env.LINKEDIN_CLIENT_SECRET) {
  passport.use(
    new LinkedInStrategy(
      {
        clientID: process.env.LINKEDIN_CLIENT_ID,
        clientSecret: process.env.LINKEDIN_CLIENT_SECRET,
        callbackURL: `${process.env.SERVER_URL || "http://localhost:5000"}/api/auth/linkedin/callback`,
        scope: ["r_liteprofile", "r_emailaddress"],
      },
      async (accessToken, refreshToken, profile, done) => {
        try {
          let user = await User.findOne({
            $or: [
              { email: profile.emails?.[0]?.value?.toLowerCase() },
              { providerId: profile.id, provider: "linkedin" },
            ],
          });

          if (user) {
            if (!user.providerId) {
              user.providerId = profile.id;
              user.provider = "linkedin";
              await user.save();
            }
          } else {
            user = await User.create({
              email: profile.emails?.[0]?.value?.toLowerCase() || `${profile.id}@linkedin.local`,
              name: profile.displayName || `${profile.name?.givenName} ${profile.name?.familyName}` || "User",
              provider: "linkedin",
              providerId: profile.id,
            });
          }

          return done(null, user);
        } catch (error) {
          return done(error, null);
        }
      }
    )
  );
}

// Helper function to generate JWT token
export const generateToken = (user) => {
  return jwt.sign(
    { userId: user._id, email: user.email },
    JWT_SECRET,
    { expiresIn: JWT_EXPIRES_IN }
  );
};

// Helper function to redirect with token
export const redirectWithToken = (res, token) => {
  const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  res.redirect(`${CLIENT_ORIGIN}/auth/callback?token=${token}`);
};


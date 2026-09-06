import "dotenv/config";
import dns from "node:dns";

// Some container platforms (Hugging Face Spaces included) assign an IPv6
// address with no working outbound IPv6 route. Without this, every outbound
// HTTPS call (Turnstile, Cloudinary, Gemini, Google OAuth, Mongo) hangs
// trying the IPv6 address until it times out before ever falling back to IPv4.
dns.setDefaultResultOrder("ipv4first");

import express from "express";
import cors from "cors";
import session from "express-session";
import passport from "passport";
import { connectDB } from "./config/db.js";
import "./config/passport.js";
import uploadRoutes from "./routes/upload.js";
import analysisRoutes from "./routes/analysis.js";
import sessionsRoutes from "./routes/sessions.js";
import settingsRoutes from "./routes/settings.js";
import authRoutes from "./routes/auth.js";
import youtubeRoutes from "./routes/youtube.js";

const app = express();

const PORT = process.env.PORT || 5000;
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || "http://localhost:5173";

// Logging middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
  next();
});

// CORS configuration - allow multiple origins in development
const allowedOrigins = [
  CLIENT_ORIGIN,
  "http://localhost:5173",
  "http://localhost:8080",
  "http://localhost:3000",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps or curl)
      if (!origin) return callback(null, true);
      
      if (allowedOrigins.includes(origin) || process.env.NODE_ENV !== "production") {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// Session configuration for OAuth
app.use(
  session({
    secret: process.env.SESSION_SECRET || "your-session-secret-change-in-production",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  })
);

// Initialize Passport
app.use(passport.initialize());
app.use(passport.session());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok" });
});

// TEMPORARY diagnostic route to pin down the Turnstile connectivity issue.
// Safe to leave briefly: no secrets exposed, just DNS/connect timing.
app.get("/api/debug/network-check", async (_req, res) => {
  const net = await import("node:net");
  const dnsPromises = await import("node:dns/promises");
  const axiosMod = (await import("axios")).default;

  const results = {};

  const tcpCheck = (host, port, timeoutMs) =>
    new Promise((resolve) => {
      const start = Date.now();
      const socket = net.connect({ host, port, timeout: timeoutMs });
      socket.once("connect", () => {
        resolve({ ok: true, ms: Date.now() - start });
        socket.destroy();
      });
      socket.once("timeout", () => {
        resolve({ ok: false, reason: "timeout", ms: Date.now() - start });
        socket.destroy();
      });
      socket.once("error", (err) => {
        resolve({ ok: false, reason: err.code || err.message, ms: Date.now() - start });
      });
    });

  try {
    results.dns_cloudflare = await dnsPromises.lookup("challenges.cloudflare.com", { all: true });
  } catch (e) {
    results.dns_cloudflare_error = e.message;
  }

  try {
    results.dns_huggingface = await dnsPromises.lookup("huggingface.co", { all: true });
  } catch (e) {
    results.dns_huggingface_error = e.message;
  }

  results.tcp_cloudflare_443 = await tcpCheck("challenges.cloudflare.com", 443, 15000);
  results.tcp_huggingface_443 = await tcpCheck("huggingface.co", 443, 15000);
  results.tcp_mongodb_443 = await tcpCheck("google.com", 443, 15000);

  const axiosStart = Date.now();
  try {
    const r = await axiosMod.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      { secret: "1x0000000000000000000000000000000AA", response: "test" },
      { headers: { "Content-Type": "application/json" }, timeout: 20000 }
    );
    results.axios_cloudflare = { ok: true, ms: Date.now() - axiosStart, status: r.status, data: r.data };
  } catch (e) {
    results.axios_cloudflare = {
      ok: false,
      ms: Date.now() - axiosStart,
      code: e.code,
      message: e.message,
    };
  }

  res.json(results);
});

app.use("/api/auth", authRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analysis", analysisRoutes);
app.use("/api/sessions", sessionsRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/youtube", youtubeRoutes);

const start = async () => {
  await connectDB();

  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${PORT}`);
  });
};

start().catch((error) => {
  // eslint-disable-next-line no-console
  console.error("Failed to start server", error);
  process.exit(1);
});


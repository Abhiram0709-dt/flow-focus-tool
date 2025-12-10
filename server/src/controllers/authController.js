import jwt from "jsonwebtoken";
import { User } from "../models/User.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export const signup = async (req, res) => {
  try {
    const { email, password, name, turnstileToken } = req.body;
    console.log(`[SIGNUP] Attempt for email: ${email}`);

    if (!email || !password || !name) {
      console.log(`[SIGNUP] Missing required fields`);
      return res.status(400).json({ message: "Email, password, and name are required" });
    }

    if (password.length < 6) {
      console.log(`[SIGNUP] Password too short`);
      return res.status(400).json({ message: "Password must be at least 6 characters" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      console.log(`[SIGNUP] User already exists: ${email}`);
      return res.status(400).json({ message: "User with this email already exists" });
    }

    // Create new user
    const user = await User.create({
      email: email.toLowerCase(),
      password,
      name,
    });
    console.log(`[SIGNUP] User created successfully: ${email}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(201).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("[SIGNUP ERROR]", error);
    return res
      .status(500)
      .json({ message: "Failed to create user", error: String(error) });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password, turnstileToken } = req.body;
    console.log(`[LOGIN] Attempt for email: ${email}`);

    if (!email || !password) {
      console.log(`[LOGIN] Missing email or password`);
      return res.status(400).json({ message: "Email and password are required" });
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log(`[LOGIN] User not found: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`[LOGIN] User found, checking password for: ${email}`);
    
    // Check password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      console.log(`[LOGIN] Invalid password for: ${email}`);
      return res.status(401).json({ message: "Invalid email or password" });
    }

    console.log(`[LOGIN] Login successful for: ${email}`);

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRES_IN }
    );

    return res.status(200).json({
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("[LOGIN ERROR]", error);
    return res
      .status(500)
      .json({ message: "Failed to login", error: String(error) });
  }
};

export const getCurrentUser = async (req, res) => {
  try {
    console.log(`[GET_USER] Request for userId: ${req.userId}`);
    const userId = req.userId;
    if (!userId) {
      console.log(`[GET_USER] No userId found in request`);
      return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findById(userId).select("-password");
    if (!user) {
      console.log(`[GET_USER] User not found: ${userId}`);
      return res.status(404).json({ message: "User not found" });
    }

    console.log(`[GET_USER] User found: ${user.email}`);
    return res.status(200).json({
      id: user._id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("[GET_USER ERROR]", error);
    return res
      .status(500)
      .json({ message: "Failed to get user", error: String(error) });
  }
};


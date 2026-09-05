import { verifyTurnstileToken } from "../utils/turnstile.js";

export const verifyTurnstile = async (
  req,
  res,
  next
) => {
  try {
    const { turnstileToken } = req.body;

    if (!turnstileToken) {
      return res.status(400).json({ message: "Turnstile token is required" });
    }

    const result = await verifyTurnstileToken(
      turnstileToken,
      req.ip || req.socket.remoteAddress
    );

    if (!result.success) {
      return res.status(400).json({
        message: "Turnstile verification failed",
        errors: result["error-codes"],
      });
    }

    next();
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Turnstile middleware error", error);
    return res.status(500).json({ message: "Turnstile verification error" });
  }
};


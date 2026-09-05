import axios from "axios";

const TURNSTILE_SECRET_KEY = process.env.TURNSTILE_SECRET_KEY;
const TURNSTILE_VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

export const verifyTurnstileToken = async (
  token,
  remoteip
) => {
  if (!TURNSTILE_SECRET_KEY) {
    throw new Error("TURNSTILE_SECRET_KEY is not set in environment variables");
  }

  try {
    const response = await axios.post(
      TURNSTILE_VERIFY_URL,
      {
        secret: TURNSTILE_SECRET_KEY,
        response: token,
        remoteip,
      },
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error("Turnstile verification error", error);
    return {
      success: false,
      "error-codes": ["internal_error"],
    };
  }
};


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

  const payload = {
    secret: TURNSTILE_SECRET_KEY,
    response: token,
    remoteip,
  };

  // Some hosting environments cannot reach Cloudflare's network at all
  // (confirmed: TLS handshakes to any *.cloudflare.com host get reset,
  // while other hosts work fine — a platform-level restriction, not
  // something a retry or timeout tweak can fix). Distinguish that from an
  // actual "invalid token" response so an infra outage doesn't block real
  // logins, while a real rejection from Cloudflare still does.
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await axios.post(TURNSTILE_VERIFY_URL, payload, {
        headers: { "Content-Type": "application/json" },
        timeout: 10000,
        family: 4,
      });
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Turnstile verification error (attempt ${attempt})`, error.message);
      if (attempt === 2) {
        return {
          success: false,
          networkError: true,
          "error-codes": ["internal_error"],
        };
      }
    }
  }
};


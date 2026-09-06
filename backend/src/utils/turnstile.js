import axios from "axios";

// Hugging Face Spaces resets TLS connections to any *.cloudflare.com host
// (confirmed via direct diagnostics), so this backend cannot call
// Cloudflare's siteverify API directly. Instead it calls a small proxy
// endpoint (a Vercel serverless function) that makes the real Cloudflare
// call on its behalf, from a network Cloudflare can actually be reached from.
const TURNSTILE_PROXY_URL = process.env.TURNSTILE_PROXY_URL;
const TURNSTILE_PROXY_SECRET = process.env.TURNSTILE_PROXY_SECRET;

export const verifyTurnstileToken = async (
  token,
  remoteip
) => {
  if (!TURNSTILE_PROXY_URL || !TURNSTILE_PROXY_SECRET) {
    // eslint-disable-next-line no-console
    console.warn("TURNSTILE_PROXY_URL/TURNSTILE_PROXY_SECRET not set, allowing request through");
    return {
      success: false,
      networkError: true,
      "error-codes": ["not_configured"],
    };
  }

  const payload = { token, remoteip };

  // The proxy itself can occasionally be slow/unreachable; distinguish that
  // from an actual "invalid token" response so an infra hiccup doesn't block
  // real logins, while a real rejection from Cloudflare still does.
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const response = await axios.post(TURNSTILE_PROXY_URL, payload, {
        headers: {
          "Content-Type": "application/json",
          "x-proxy-secret": TURNSTILE_PROXY_SECRET,
        },
        timeout: 10000,
      });
      return response.data;
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error(`Turnstile proxy verification error (attempt ${attempt})`, error.message);
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

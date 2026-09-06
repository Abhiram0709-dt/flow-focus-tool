// Vercel serverless function. Hugging Face Spaces (where the backend lives)
// resets TLS connections to any *.cloudflare.com host, so the backend can't
// call Cloudflare's Turnstile siteverify API directly. Vercel's network can,
// so the backend calls this endpoint instead, and this does the real
// Cloudflare call on its behalf.
export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ message: "Method not allowed" });
  }

  const proxySecret = req.headers["x-proxy-secret"];
  if (!process.env.TURNSTILE_PROXY_SECRET || proxySecret !== process.env.TURNSTILE_PROXY_SECRET) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const { token, remoteip } = req.body || {};
  if (!token) {
    return res.status(400).json({ message: "token is required" });
  }

  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) {
    return res.status(500).json({ message: "TURNSTILE_SECRET_KEY not configured" });
  }

  try {
    const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: secretKey, response: token, remoteip }),
    });
    const data = await cfRes.json();
    return res.status(200).json(data);
  } catch (error) {
    return res.status(502).json({
      success: false,
      "error-codes": ["proxy_error"],
      message: error.message,
    });
  }
}

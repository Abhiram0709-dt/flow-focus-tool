import os

import httpx

# Hugging Face Spaces resets TLS connections to any *.cloudflare.com host
# (confirmed via direct diagnostics), so this backend cannot call
# Cloudflare's siteverify API directly. Instead it calls a small proxy
# endpoint (a Vercel serverless function) that makes the real Cloudflare
# call on its behalf, from a network Cloudflare can actually be reached from.
TURNSTILE_PROXY_URL = os.getenv("TURNSTILE_PROXY_URL")
TURNSTILE_PROXY_SECRET = os.getenv("TURNSTILE_PROXY_SECRET")


async def verify_turnstile_token(token: str, remoteip: str | None) -> dict:
    if not TURNSTILE_PROXY_URL or not TURNSTILE_PROXY_SECRET:
        print("TURNSTILE_PROXY_URL/TURNSTILE_PROXY_SECRET not set, allowing request through")
        return {"success": False, "networkError": True, "error-codes": ["not_configured"]}

    payload = {"token": token, "remoteip": remoteip}
    headers = {
        "Content-Type": "application/json",
        "x-proxy-secret": TURNSTILE_PROXY_SECRET,
    }

    # The proxy itself can occasionally be slow/unreachable; distinguish that
    # from an actual "invalid token" response so an infra hiccup doesn't block
    # real logins, while a real rejection from Cloudflare still does.
    for attempt in (1, 2):
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.post(TURNSTILE_PROXY_URL, json=payload, headers=headers)
                # httpx doesn't raise on non-2xx by default (axios does) -
                # raise explicitly so a misconfigured/erroring proxy is
                # treated the same as an unreachable one (fail open) rather
                # than surfacing its error body as a "verification failed".
                response.raise_for_status()
                return response.json()
        except Exception as error:
            print(f"Turnstile proxy verification error (attempt {attempt})", str(error))
            if attempt == 2:
                return {"success": False, "networkError": True, "error-codes": ["internal_error"]}

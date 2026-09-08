import os
import uuid

import jwt as pyjwt
from fastapi import HTTPException
from fastapi.responses import RedirectResponse

from ..config import oauth_providers
from ..models import user as user_model
from ..utils.jwt_utils import create_jwt, decode_jwt

CLIENT_ORIGIN = os.getenv("CLIENT_ORIGIN", "http://localhost:5173")


def start_oauth(provider: str) -> RedirectResponse:
    if not oauth_providers.is_provider_configured(provider):
        raise HTTPException(
            status_code=500, detail={"message": f"{provider} OAuth is not configured"}
        )
    state = create_jwt({"purpose": "oauth-login", "nonce": uuid.uuid4().hex}, expires_in="10m")
    url = oauth_providers.get_authorize_url(provider, state)
    return RedirectResponse(url)


async def handle_oauth_callback(provider: str, code: str | None, state: str | None, error: str | None) -> RedirectResponse:
    failure = RedirectResponse(f"{CLIENT_ORIGIN}/login?error=oauth_failed")

    if error or not code or not state:
        return failure

    try:
        decoded = decode_jwt(state)
        if decoded.get("purpose") != "oauth-login":
            return failure
    except pyjwt.PyJWTError:
        return failure

    try:
        profile = await oauth_providers.exchange_code_for_profile(provider, code)
    except Exception as exc:
        print(f"[OAUTH_CALLBACK] {provider} profile fetch failed", exc)
        return failure

    if not profile.get("provider_id"):
        return failure

    doc = await user_model.find_by_email_or_provider(profile["email"], profile["provider_id"], provider)

    if doc:
        if not doc.get("providerId"):
            await user_model.backfill_provider_id(doc["_id"], provider, profile["provider_id"])
    else:
        doc = await user_model.create_oauth_user(
            profile["email"], profile["name"], provider, profile["provider_id"]
        )

    print(f"[OAUTH_CALLBACK] User authenticated: {doc['email']}")
    token = create_jwt({"userId": str(doc["_id"]), "email": doc["email"]})
    return RedirectResponse(f"{CLIENT_ORIGIN}/auth/callback?token={token}")

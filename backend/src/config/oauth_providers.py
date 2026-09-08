import os

import httpx

SERVER_URL = os.getenv("SERVER_URL", "http://localhost:5000")

PROVIDERS = {
    "google": {
        "client_id_env": "GOOGLE_CLIENT_ID",
        "client_secret_env": "GOOGLE_CLIENT_SECRET",
        "authorize_url": "https://accounts.google.com/o/oauth2/v2/auth",
        "token_url": "https://oauth2.googleapis.com/token",
        "scope": "profile email",
    },
    "github": {
        "client_id_env": "GITHUB_CLIENT_ID",
        "client_secret_env": "GITHUB_CLIENT_SECRET",
        "authorize_url": "https://github.com/login/oauth/authorize",
        "token_url": "https://github.com/login/oauth/access_token",
        "scope": "user:email",
    },
    "facebook": {
        "client_id_env": "FACEBOOK_APP_ID",
        "client_secret_env": "FACEBOOK_APP_SECRET",
        "authorize_url": "https://www.facebook.com/v18.0/dialog/oauth",
        "token_url": "https://graph.facebook.com/v18.0/oauth/access_token",
        "scope": "email",
    },
    "linkedin": {
        "client_id_env": "LINKEDIN_CLIENT_ID",
        "client_secret_env": "LINKEDIN_CLIENT_SECRET",
        "authorize_url": "https://www.linkedin.com/oauth/v2/authorization",
        "token_url": "https://www.linkedin.com/oauth/v2/accessToken",
        "scope": "r_liteprofile r_emailaddress",
    },
}


def is_provider_configured(provider: str) -> bool:
    cfg = PROVIDERS[provider]
    return bool(os.getenv(cfg["client_id_env"]) and os.getenv(cfg["client_secret_env"]))


def get_redirect_uri(provider: str) -> str:
    return f"{SERVER_URL}/api/auth/{provider}/callback"


def get_authorize_url(provider: str, state: str) -> str:
    cfg = PROVIDERS[provider]
    client_id = os.getenv(cfg["client_id_env"])
    params = {
        "client_id": client_id,
        "redirect_uri": get_redirect_uri(provider),
        "response_type": "code",
        "scope": cfg["scope"],
        "state": state,
    }
    return str(httpx.URL(cfg["authorize_url"], params=params))


async def _exchange_code(provider: str, code: str) -> str:
    cfg = PROVIDERS[provider]
    client_id = os.getenv(cfg["client_id_env"])
    client_secret = os.getenv(cfg["client_secret_env"])
    data = {
        "client_id": client_id,
        "client_secret": client_secret,
        "code": code,
        "redirect_uri": get_redirect_uri(provider),
        "grant_type": "authorization_code",
    }
    headers = {"Accept": "application/json"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.post(cfg["token_url"], data=data, headers=headers)
        resp.raise_for_status()
        body = resp.json()
    access_token = body.get("access_token")
    if not access_token:
        raise RuntimeError(f"No access_token in {provider} token response: {body}")
    return access_token


async def _fetch_google_profile(access_token: str) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {access_token}"},
        )
        resp.raise_for_status()
        data = resp.json()
    return {
        "provider_id": data.get("id"),
        "email": (data.get("email") or "").lower(),
        "name": data.get("name") or "User",
    }


async def _fetch_github_profile(access_token: str) -> dict:
    headers = {
        "Authorization": f"Bearer {access_token}",
        "Accept": "application/vnd.github+json",
    }
    async with httpx.AsyncClient(timeout=15.0) as client:
        user_resp = await client.get("https://api.github.com/user", headers=headers)
        user_resp.raise_for_status()
        user = user_resp.json()

        email = user.get("email")
        if not email:
            emails_resp = await client.get("https://api.github.com/user/emails", headers=headers)
            if emails_resp.status_code == 200:
                emails = emails_resp.json()
                primary = next((e for e in emails if e.get("primary")), None)
                email = (primary or (emails[0] if emails else {})).get("email")

    username = user.get("login") or str(user.get("id"))
    return {
        "provider_id": str(user.get("id")),
        "email": (email or f"{username}@github.local").lower(),
        "name": user.get("name") or username or "User",
    }


async def _fetch_facebook_profile(access_token: str) -> dict:
    async with httpx.AsyncClient(timeout=15.0) as client:
        resp = await client.get(
            "https://graph.facebook.com/me",
            params={"fields": "id,name,email", "access_token": access_token},
        )
        resp.raise_for_status()
        data = resp.json()
    provider_id = data.get("id")
    return {
        "provider_id": provider_id,
        "email": (data.get("email") or f"{provider_id}@facebook.local").lower(),
        "name": data.get("name") or "User",
    }


async def _fetch_linkedin_profile(access_token: str) -> dict:
    headers = {"Authorization": f"Bearer {access_token}"}
    async with httpx.AsyncClient(timeout=15.0) as client:
        profile_resp = await client.get("https://api.linkedin.com/v2/me", headers=headers)
        profile_resp.raise_for_status()
        profile = profile_resp.json()

        email = None
        try:
            email_resp = await client.get(
                "https://api.linkedin.com/v2/emailAddress",
                params={"q": "members", "projection": "(elements*(handle~))"},
                headers=headers,
            )
            email_resp.raise_for_status()
            elements = email_resp.json().get("elements", [])
            if elements:
                email = elements[0].get("handle~", {}).get("emailAddress")
        except Exception:
            pass

    provider_id = profile.get("id")
    first_name = (
        profile.get("localizedFirstName")
        or profile.get("firstName", {}).get("localized", {}).get("en_US", "")
    )
    last_name = (
        profile.get("localizedLastName")
        or profile.get("lastName", {}).get("localized", {}).get("en_US", "")
    )
    name = f"{first_name} {last_name}".strip() or "User"

    return {
        "provider_id": provider_id,
        "email": (email or f"{provider_id}@linkedin.local").lower(),
        "name": name,
    }


_PROFILE_FETCHERS = {
    "google": _fetch_google_profile,
    "github": _fetch_github_profile,
    "facebook": _fetch_facebook_profile,
    "linkedin": _fetch_linkedin_profile,
}


async def exchange_code_for_profile(provider: str, code: str) -> dict:
    """Returns {"provider_id", "email", "name"} for the authenticated user."""
    access_token = await _exchange_code(provider, code)
    return await _PROFILE_FETCHERS[provider](access_token)

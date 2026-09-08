import asyncio
import os
import tempfile
from datetime import datetime, timezone

import httpx
import jwt as pyjwt
from fastapi import HTTPException
from fastapi.responses import RedirectResponse
from google.auth.transport.requests import Request as GoogleAuthRequest
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload

from ..config.youtube import YOUTUBE_UPLOAD_SCOPES, create_youtube_flow
from ..models import session as session_model
from ..models import user as user_model
from ..utils.jwt_utils import create_jwt, decode_jwt

CLIENT_ORIGIN = os.getenv("CLIENT_ORIGIN", "http://localhost:5173")
TOKEN_URI = "https://oauth2.googleapis.com/token"


async def get_youtube_auth_url(user_id: str) -> dict:
    try:
        state = create_jwt({"userId": user_id, "purpose": "youtube-connect"}, expires_in="10m")
        flow = create_youtube_flow()
        url, _ = flow.authorization_url(
            access_type="offline",
            prompt="consent",
            include_granted_scopes="true",
            state=state,
        )
        return {"url": url}
    except Exception as error:
        print("[YOUTUBE_AUTH_URL ERROR]", error)
        raise HTTPException(status_code=500, detail={"message": "Failed to start YouTube connection"})


async def youtube_callback(code: str | None, state: str | None, error: str | None) -> RedirectResponse:
    failure = RedirectResponse(f"{CLIENT_ORIGIN}/settings?youtube=error")

    if error or not code or not state:
        return failure

    try:
        decoded = decode_jwt(state)
        if decoded.get("purpose") != "youtube-connect" or not decoded.get("userId"):
            raise ValueError("Invalid state payload")
        user_id = decoded["userId"]
    except (pyjwt.PyJWTError, ValueError) as exc:
        print("[YOUTUBE_CALLBACK ERROR]", exc)
        return failure

    try:
        flow = create_youtube_flow()
        await asyncio.to_thread(flow.fetch_token, code=code)
        creds = flow.credentials

        channel_title = None
        try:
            youtube = build("youtube", "v3", credentials=creds)
            data = await asyncio.to_thread(
                lambda: youtube.channels().list(part="snippet", mine=True).execute()
            )
            items = data.get("items") or []
            if items:
                channel_title = items[0].get("snippet", {}).get("title")
        except Exception as channel_error:
            print("[YOUTUBE_CALLBACK] Failed to fetch channel info", channel_error)

        update = {
            "accessToken": creds.token,
            "accessTokenExpiresAt": creds.expiry,
            "connectedAt": datetime.now(timezone.utc),
        }
        if creds.refresh_token:
            update["refreshToken"] = creds.refresh_token
        if channel_title:
            update["channelTitle"] = channel_title

        await user_model.set_youtube_tokens(user_id, update)
        return RedirectResponse(f"{CLIENT_ORIGIN}/settings?youtube=connected")
    except Exception as error:
        print("[YOUTUBE_CALLBACK ERROR]", error)
        return failure


async def get_youtube_status(user_id: str) -> dict:
    try:
        doc = await user_model.find_by_id(user_id)
        return user_model.to_youtube_status(doc or {})
    except Exception as error:
        print("[YOUTUBE_STATUS ERROR]", error)
        raise HTTPException(status_code=500, detail={"message": "Failed to load YouTube status"})


async def disconnect_youtube(user_id: str) -> dict:
    try:
        await user_model.clear_youtube(user_id)
        return {"connected": False}
    except Exception as error:
        print("[YOUTUBE_DISCONNECT ERROR]", error)
        raise HTTPException(status_code=500, detail={"message": "Failed to disconnect YouTube"})


def _download_and_upload(media_url: str, title: str, description: str, creds: Credentials) -> dict:
    """Blocking: downloads the video and uploads it to YouTube. Run via asyncio.to_thread."""
    suffix = os.path.splitext(media_url.split("?")[0])[1] or ".mp4"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp_path = tmp.name
        with httpx.stream("GET", media_url, timeout=120.0) as resp:
            resp.raise_for_status()
            for chunk in resp.iter_bytes(1024 * 1024):
                tmp.write(chunk)

    try:
        if creds.expired and creds.refresh_token:
            creds.refresh(GoogleAuthRequest())

        youtube = build("youtube", "v3", credentials=creds)
        media = MediaFileUpload(tmp_path, chunksize=-1, resumable=True)
        request = youtube.videos().insert(
            part="snippet,status",
            body={
                "snippet": {"title": title[:100], "description": description},
                "status": {"privacyStatus": "unlisted"},
            },
            media_body=media,
        )
        response = None
        while response is None:
            _, response = request.next_chunk()
        return response
    finally:
        os.remove(tmp_path)


async def upload_session_to_youtube(session_id: str, user_id: str) -> dict:
    try:
        session_doc = await session_model.find_by_id_and_user(session_id, user_id)
        if not session_doc:
            raise HTTPException(status_code=404, detail={"message": "Session not found"})

        if session_doc.get("mode") != "video" or not session_doc.get("mediaUrl"):
            raise HTTPException(
                status_code=400,
                detail={"message": "Only recorded video sessions can be uploaded to YouTube"},
            )

        existing_youtube = session_doc.get("youtube")
        if existing_youtube and existing_youtube.get("videoId"):
            return existing_youtube

        user_doc = await user_model.find_by_id(user_id)
        youtube_info = (user_doc or {}).get("youtube") or {}
        refresh_token = youtube_info.get("refreshToken")
        if not refresh_token:
            raise HTTPException(
                status_code=400,
                detail={"message": "Connect your YouTube account first", "code": "YOUTUBE_NOT_CONNECTED"},
            )

        creds = Credentials(
            token=youtube_info.get("accessToken"),
            refresh_token=refresh_token,
            token_uri=TOKEN_URI,
            client_id=os.getenv("GOOGLE_YOUTUBE_CLIENT_ID"),
            client_secret=os.getenv("GOOGLE_YOUTUBE_CLIENT_SECRET"),
            scopes=YOUTUBE_UPLOAD_SCOPES,
        )

        topic = session_doc.get("topic") or "Practice session"
        title = topic or "Practice session"
        description = f"Recorded with Flow Focus Tool.\n\nTopic: {topic or 'N/A'}"

        data = await asyncio.to_thread(
            _download_and_upload, session_doc["mediaUrl"], title, description, creds
        )

        # Credentials.refresh() updates the object in place if the access
        # token was renewed during upload - persist that back, mirroring the
        # Node client's "tokens" event listener.
        await user_model.set_youtube_tokens(
            user_id,
            {
                "accessToken": creds.token,
                "accessTokenExpiresAt": creds.expiry,
                "refreshToken": creds.refresh_token,
            },
        )

        video_id = data["id"]
        youtube_result = {
            "videoId": video_id,
            "url": f"https://www.youtube.com/watch?v={video_id}",
            "uploadedAt": datetime.now(timezone.utc),
        }

        await session_model.set_youtube_info(session_id, youtube_result)
        return youtube_result
    except HTTPException:
        raise
    except Exception as error:
        print("[YOUTUBE_UPLOAD ERROR]", error)
        raise HTTPException(
            status_code=500, detail={"message": "Failed to upload video to YouTube", "error": str(error)}
        )

import re
from typing import Optional

import cloudinary.uploader
from fastapi import HTTPException
from pydantic import BaseModel

from ..models import session as session_model


class FeedbackBody(BaseModel):
    fluencyScore: float
    clarityScore: float
    confidenceScore: float
    fillerWords: list[str] = []
    suggestions: str
    encouragement: str


class CreateSessionBody(BaseModel):
    topic: str
    mode: str
    durationSeconds: float
    mediaUrl: str
    transcript: str
    feedback: FeedbackBody


async def create_session(user_id: str, body: CreateSessionBody) -> dict:
    doc = await session_model.create_session(
        user_id,
        {
            "topic": body.topic,
            "mode": body.mode,
            "durationSeconds": body.durationSeconds,
            "mediaUrl": body.mediaUrl,
            "transcript": body.transcript,
            "feedback": body.feedback.model_dump(),
        },
    )
    return session_model.serialize(doc)


async def get_sessions(user_id: str) -> list[dict]:
    docs = await session_model.find_by_user(user_id)
    return [session_model.serialize(d) for d in docs]


async def get_session_by_id(session_id: str, user_id: str) -> dict:
    doc = await session_model.find_by_id_and_user(session_id, user_id)
    if not doc:
        raise HTTPException(status_code=404, detail={"message": "Session not found"})
    return session_model.serialize(doc)


def _extract_public_id(media_url: str) -> Optional[str]:
    if "cloudinary.com" not in media_url or "/upload/" not in media_url:
        return None
    after_upload = media_url.split("/upload/", 1)[1]
    without_version = re.sub(r"^v\d+/", "", after_upload)
    return re.sub(r"\.[^.]*$", "", without_version)


async def delete_session(session_id: str, user_id: str) -> None:
    doc = await session_model.find_by_id_and_user(session_id, user_id)
    if not doc:
        raise HTTPException(status_code=404, detail={"message": "Session not found"})

    try:
        media_url = doc.get("mediaUrl")
        if media_url:
            public_id = _extract_public_id(media_url)
            if public_id:
                cloudinary.uploader.destroy(public_id, resource_type="video")
    except Exception as error:
        print("Cloudinary delete error", error)
        # Continue with database deletion even if Cloudinary deletion fails

    await session_model.delete_by_id(session_id)

from datetime import datetime, timezone
from typing import Optional

from bson import ObjectId

from ..config.db import get_db

COLLECTION = "sessions"


def serialize(doc: dict) -> dict:
    out = dict(doc)
    out["_id"] = str(out["_id"])
    out["user"] = str(out["user"])
    return out


async def create_session(user_id: str, data: dict) -> dict:
    doc = {
        "user": ObjectId(user_id),
        "topic": data["topic"],
        "mode": data["mode"],
        "durationSeconds": data["durationSeconds"],
        "mediaUrl": data["mediaUrl"],
        "transcript": data["transcript"],
        "feedback": data["feedback"],
        "createdAt": datetime.now(timezone.utc),
        "youtube": None,
    }
    result = await get_db()[COLLECTION].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def find_by_user(user_id: str) -> list[dict]:
    cursor = get_db()[COLLECTION].find({"user": ObjectId(user_id)}).sort("createdAt", -1)
    return [doc async for doc in cursor]


async def find_by_id_and_user(session_id: str, user_id: str) -> Optional[dict]:
    if not ObjectId.is_valid(session_id):
        return None
    return await get_db()[COLLECTION].find_one(
        {"_id": ObjectId(session_id), "user": ObjectId(user_id)}
    )


async def delete_by_id(session_id: str) -> None:
    await get_db()[COLLECTION].delete_one({"_id": ObjectId(session_id)})


async def set_youtube_info(session_id: str, youtube_info: dict) -> None:
    await get_db()[COLLECTION].update_one(
        {"_id": ObjectId(session_id)}, {"$set": {"youtube": youtube_info}}
    )

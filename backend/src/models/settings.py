from typing import Optional

from bson import ObjectId

from ..config.db import get_db

COLLECTION = "settings"

DEFAULTS = {
    "dailyGoalMinutes": 15,
    "dailyGoalSessions": 15,
    "goalType": "sessions",
    "focusArea": "overall",
    "showMotivation": True,
}


def serialize(doc: dict) -> dict:
    out = dict(doc)
    out["_id"] = str(out["_id"])
    out["user"] = str(out["user"])
    return out


async def find_by_user(user_id: str) -> Optional[dict]:
    return await get_db()[COLLECTION].find_one({"user": ObjectId(user_id)})


async def create_default(user_id: str) -> dict:
    doc = {"user": ObjectId(user_id), **DEFAULTS}
    result = await get_db()[COLLECTION].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def upsert(user_id: str, update: dict) -> dict:
    await get_db()[COLLECTION].update_one(
        {"user": ObjectId(user_id)},
        {"$set": update, "$setOnInsert": {k: v for k, v in DEFAULTS.items() if k not in update}},
        upsert=True,
    )
    return await get_db()[COLLECTION].find_one({"user": ObjectId(user_id)})

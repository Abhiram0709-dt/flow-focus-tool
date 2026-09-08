from datetime import datetime, timezone
from typing import Any, Optional

from bson import ObjectId
from passlib.context import CryptContext

from ..config.db import get_db

COLLECTION = "users"

_pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return _pwd_context.hash(password)


def verify_password(password: str, hashed: Optional[str]) -> bool:
    if not hashed:
        return False
    return _pwd_context.verify(password, hashed)


def to_public(doc: dict) -> dict:
    return {
        "id": str(doc["_id"]),
        "email": doc["email"],
        "name": doc["name"],
    }


def to_youtube_status(doc: dict) -> dict:
    youtube = doc.get("youtube") or {}
    connected = bool(youtube.get("refreshToken"))
    return {
        "connected": connected,
        "channelTitle": youtube.get("channelTitle") if connected else None,
    }


async def find_by_email(email: str) -> Optional[dict]:
    return await get_db()[COLLECTION].find_one({"email": email.lower()})


async def find_by_id(user_id: str) -> Optional[dict]:
    if not ObjectId.is_valid(user_id):
        return None
    return await get_db()[COLLECTION].find_one({"_id": ObjectId(user_id)})


async def find_by_email_or_provider(email: str, provider_id: str, provider: str) -> Optional[dict]:
    return await get_db()[COLLECTION].find_one(
        {"$or": [{"email": email.lower()}, {"providerId": provider_id, "provider": provider}]}
    )


async def create_local_user(email: str, password: str, name: str) -> dict:
    doc = {
        "email": email.lower(),
        "password": hash_password(password),
        "name": name,
        "provider": "local",
        "providerId": None,
        "createdAt": datetime.now(timezone.utc),
        "youtube": None,
    }
    result = await get_db()[COLLECTION].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def create_oauth_user(email: str, name: str, provider: str, provider_id: str) -> dict:
    doc = {
        "email": email.lower(),
        "password": None,
        "name": name,
        "provider": provider,
        "providerId": provider_id,
        "createdAt": datetime.now(timezone.utc),
        "youtube": None,
    }
    result = await get_db()[COLLECTION].insert_one(doc)
    doc["_id"] = result.inserted_id
    return doc


async def backfill_provider_id(user_id: Any, provider: str, provider_id: str) -> None:
    await get_db()[COLLECTION].update_one(
        {"_id": user_id},
        {"$set": {"providerId": provider_id, "provider": provider}},
    )


async def set_youtube_tokens(user_id: str, update: dict) -> None:
    await get_db()[COLLECTION].update_one(
        {"_id": ObjectId(user_id)},
        {"$set": {f"youtube.{k}": v for k, v in update.items() if v is not None}},
    )


async def clear_youtube(user_id: str) -> None:
    await get_db()[COLLECTION].update_one(
        {"_id": ObjectId(user_id)}, {"$unset": {"youtube": ""}}
    )

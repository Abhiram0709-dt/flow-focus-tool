import os

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise RuntimeError("MONGODB_URI is not set in environment variables")

_client: AsyncIOMotorClient | None = None
_db: AsyncIOMotorDatabase | None = None


async def connect_db() -> None:
    global _client, _db
    _client = AsyncIOMotorClient(MONGODB_URI)
    try:
        _db = _client.get_default_database()
    except Exception:
        _db = None
    if _db is None:
        # Mongoose defaults to a database named "test" when the connection
        # string has no database segment in its path - match that here so
        # this reads/writes the same database the Node backend used.
        _db = _client["test"]

    await _db.command("ping")
    print("MongoDB connected")


async def close_db() -> None:
    if _client is not None:
        _client.close()


def get_db() -> AsyncIOMotorDatabase:
    if _db is None:
        raise RuntimeError("Database not connected yet")
    return _db

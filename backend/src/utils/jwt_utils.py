import os
import re
from datetime import datetime, timedelta, timezone

import jwt

JWT_SECRET = os.getenv("JWT_SECRET", "your-secret-key-change-in-production")
JWT_EXPIRES_IN = os.getenv("JWT_EXPIRES_IN", "7d")

_UNIT_SECONDS = {"s": 1, "m": 60, "h": 3600, "d": 86400}


def parse_expires_in(value: str) -> timedelta:
    """Parses strings like '7d', '10m', '30s', '1h', or a plain number of seconds."""
    match = re.fullmatch(r"(\d+)([smhd])?", value.strip())
    if not match:
        raise ValueError(f"Invalid expiresIn value: {value}")
    amount = int(match.group(1))
    unit = match.group(2) or "s"
    return timedelta(seconds=amount * _UNIT_SECONDS[unit])


def create_jwt(payload: dict, expires_in: str = JWT_EXPIRES_IN) -> str:
    to_encode = dict(payload)
    to_encode["exp"] = datetime.now(timezone.utc) + parse_expires_in(expires_in)
    return jwt.encode(to_encode, JWT_SECRET, algorithm="HS256")


def decode_jwt(token: str) -> dict:
    return jwt.decode(token, JWT_SECRET, algorithms=["HS256"])

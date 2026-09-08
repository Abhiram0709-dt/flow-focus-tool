import jwt
from fastapi import Header, HTTPException

from ..utils.jwt_utils import decode_jwt


async def authenticate(authorization: str | None = Header(default=None)) -> str:
    """FastAPI dependency mirroring middleware/auth.js: returns the userId
    encoded in the Bearer token, or raises 401 like the Express version."""
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail={"message": "No token provided"})

    token = authorization[len("Bearer "):]

    try:
        decoded = decode_jwt(token)
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail={"message": "Invalid or expired token"})

    user_id = decoded.get("userId")
    if not user_id:
        raise HTTPException(status_code=401, detail={"message": "Invalid or expired token"})

    return user_id

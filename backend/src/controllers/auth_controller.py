from typing import Optional

from fastapi import HTTPException, Request
from pydantic import BaseModel

from ..models import user as user_model
from ..utils.jwt_utils import create_jwt
from ..utils.turnstile import verify_turnstile_token


class SignupBody(BaseModel):
    email: str
    password: str
    name: str
    turnstileToken: Optional[str] = None


class LoginBody(BaseModel):
    email: str
    password: str
    turnstileToken: Optional[str] = None


async def check_turnstile(token: Optional[str], request: Request) -> None:
    if not token:
        raise HTTPException(status_code=400, detail={"message": "Turnstile token is required"})

    remoteip = request.client.host if request.client else None
    result = await verify_turnstile_token(token, remoteip)

    if result.get("networkError"):
        print("Turnstile verifier unreachable, allowing request through")
        return

    if not result.get("success"):
        raise HTTPException(
            status_code=400,
            detail={
                "message": "Turnstile verification failed",
                "errors": result.get("error-codes"),
            },
        )


def _issue_token_response(doc: dict) -> dict:
    token = create_jwt({"userId": str(doc["_id"]), "email": doc["email"]})
    return {"token": token, "user": user_model.to_public(doc)}


async def signup(body: SignupBody, request: Request) -> dict:
    print(f"[SIGNUP] Attempt for email: {body.email}")
    await check_turnstile(body.turnstileToken, request)

    if not body.email or not body.password or not body.name:
        raise HTTPException(
            status_code=400, detail={"message": "Email, password, and name are required"}
        )

    if len(body.password) < 6:
        raise HTTPException(
            status_code=400, detail={"message": "Password must be at least 6 characters"}
        )

    existing = await user_model.find_by_email(body.email)
    if existing:
        raise HTTPException(
            status_code=400, detail={"message": "User with this email already exists"}
        )

    doc = await user_model.create_local_user(body.email, body.password, body.name)
    print(f"[SIGNUP] User created successfully: {body.email}")
    return _issue_token_response(doc)


async def login(body: LoginBody, request: Request) -> dict:
    print(f"[LOGIN] Attempt for email: {body.email}")
    await check_turnstile(body.turnstileToken, request)

    if not body.email or not body.password:
        raise HTTPException(
            status_code=400, detail={"message": "Email and password are required"}
        )

    doc = await user_model.find_by_email(body.email)
    if not doc:
        raise HTTPException(status_code=401, detail={"message": "Invalid email or password"})

    if not user_model.verify_password(body.password, doc.get("password")):
        raise HTTPException(status_code=401, detail={"message": "Invalid email or password"})

    print(f"[LOGIN] Login successful for: {body.email}")
    return _issue_token_response(doc)


async def get_current_user(user_id: str) -> dict:
    doc = await user_model.find_by_id(user_id)
    if not doc:
        raise HTTPException(status_code=404, detail={"message": "User not found"})
    return user_model.to_public(doc)

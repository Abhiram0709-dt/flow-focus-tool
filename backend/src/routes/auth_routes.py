from typing import Optional

from fastapi import APIRouter, Depends, Request

from ..controllers import auth_controller, oauth_controller
from ..middleware.auth import authenticate

router = APIRouter(prefix="/api/auth", tags=["auth"])


def _oauth_routes_for(provider: str) -> None:
    @router.get(f"/{provider}", name=f"{provider}_auth")
    async def start(_provider=provider):
        return oauth_controller.start_oauth(_provider)

    @router.get(f"/{provider}/callback", name=f"{provider}_callback")
    async def callback(
        code: Optional[str] = None,
        state: Optional[str] = None,
        error: Optional[str] = None,
        _provider=provider,
    ):
        return await oauth_controller.handle_oauth_callback(_provider, code, state, error)


for _provider in ("google", "github", "facebook", "linkedin"):
    _oauth_routes_for(_provider)


@router.post("/signup", status_code=201)
async def signup(body: auth_controller.SignupBody, request: Request):
    return await auth_controller.signup(body, request)


@router.post("/login")
async def login(body: auth_controller.LoginBody, request: Request):
    return await auth_controller.login(body, request)


@router.get("/me")
async def me(user_id: str = Depends(authenticate)):
    return await auth_controller.get_current_user(user_id)

from typing import Optional

from fastapi import APIRouter, Depends

from ..controllers import youtube_controller
from ..middleware.auth import authenticate

router = APIRouter(prefix="/api/youtube", tags=["youtube"])


# Google redirects here directly, so it cannot carry our normal Bearer auth header.
@router.get("/callback")
async def callback(
    code: Optional[str] = None, state: Optional[str] = None, error: Optional[str] = None
):
    return await youtube_controller.youtube_callback(code, state, error)


@router.get("/auth-url")
async def auth_url(user_id: str = Depends(authenticate)):
    return await youtube_controller.get_youtube_auth_url(user_id)


@router.get("/status")
async def status(user_id: str = Depends(authenticate)):
    return await youtube_controller.get_youtube_status(user_id)


@router.delete("/disconnect")
async def disconnect(user_id: str = Depends(authenticate)):
    return await youtube_controller.disconnect_youtube(user_id)


@router.post("/upload/{session_id}", status_code=201)
async def upload(session_id: str, user_id: str = Depends(authenticate)):
    return await youtube_controller.upload_session_to_youtube(session_id, user_id)

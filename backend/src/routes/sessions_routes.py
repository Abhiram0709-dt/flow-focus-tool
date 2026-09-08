from fastapi import APIRouter, Depends, Response

from ..controllers import sessions_controller
from ..middleware.auth import authenticate

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


@router.post("/", status_code=201)
async def create_session(
    body: sessions_controller.CreateSessionBody, user_id: str = Depends(authenticate)
):
    return await sessions_controller.create_session(user_id, body)


@router.get("/")
async def get_sessions(user_id: str = Depends(authenticate)):
    return await sessions_controller.get_sessions(user_id)


@router.get("/{session_id}")
async def get_session_by_id(session_id: str, user_id: str = Depends(authenticate)):
    return await sessions_controller.get_session_by_id(session_id, user_id)


@router.delete("/{session_id}", status_code=204)
async def delete_session(session_id: str, user_id: str = Depends(authenticate)):
    await sessions_controller.delete_session(session_id, user_id)
    return Response(status_code=204)

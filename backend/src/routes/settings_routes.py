from fastapi import APIRouter, Depends

from ..controllers import settings_controller
from ..middleware.auth import authenticate

router = APIRouter(prefix="/api/settings", tags=["settings"])


@router.get("/")
async def get_settings(user_id: str = Depends(authenticate)):
    return await settings_controller.get_settings(user_id)


@router.put("/")
async def update_settings(
    body: settings_controller.UpdateSettingsBody, user_id: str = Depends(authenticate)
):
    return await settings_controller.update_settings(user_id, body)

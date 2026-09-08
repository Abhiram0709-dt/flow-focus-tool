from fastapi import APIRouter, File, UploadFile

from ..controllers import upload_controller

router = APIRouter(prefix="/api/upload", tags=["upload"])


@router.post("/", status_code=201)
async def upload_media(file: UploadFile = File(default=None)):
    return await upload_controller.upload_media(file)

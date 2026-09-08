from fastapi import APIRouter

from ..controllers import analysis_controller

router = APIRouter(prefix="/api/analysis", tags=["analysis"])


@router.post("/transcribe")
async def transcribe(body: analysis_controller.TranscribeBody):
    return await analysis_controller.transcribe_media(body)


@router.post("/feedback")
async def feedback(body: analysis_controller.FeedbackBody):
    return await analysis_controller.generate_feedback(body)

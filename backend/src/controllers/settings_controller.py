from typing import Optional

from pydantic import BaseModel

from ..models import settings as settings_model


class UpdateSettingsBody(BaseModel):
    dailyGoalMinutes: Optional[float] = None
    dailyGoalSessions: Optional[float] = None
    goalType: Optional[str] = None
    focusArea: Optional[str] = None
    showMotivation: Optional[bool] = None


async def get_settings(user_id: str) -> dict:
    doc = await settings_model.find_by_user(user_id)
    if not doc:
        doc = await settings_model.create_default(user_id)
    return settings_model.serialize(doc)


async def update_settings(user_id: str, body: UpdateSettingsBody) -> dict:
    update: dict = {}
    if isinstance(body.dailyGoalMinutes, (int, float)):
        update["dailyGoalMinutes"] = body.dailyGoalMinutes
    if isinstance(body.dailyGoalSessions, (int, float)):
        update["dailyGoalSessions"] = body.dailyGoalSessions
    if body.goalType in ("sessions", "minutes"):
        update["goalType"] = body.goalType
    if body.focusArea:
        update["focusArea"] = body.focusArea
    if isinstance(body.showMotivation, bool):
        update["showMotivation"] = body.showMotivation

    doc = await settings_model.upsert(user_id, update)
    return settings_model.serialize(doc)

import asyncio
import base64
import json
import os
import re
from typing import Optional

import google.generativeai as genai
import httpx
from fastapi import HTTPException
from google.api_core.exceptions import ResourceExhausted, ServiceUnavailable
from pydantic import BaseModel

from ..utils.generate_feedback_prompt import generate_feedback_prompt

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
if not GEMINI_API_KEY:
    raise RuntimeError("GEMINI_API_KEY is not set in environment variables")

genai.configure(api_key=GEMINI_API_KEY)

MODEL_NAME = "gemini-2.5-flash-lite"


class TranscribeBody(BaseModel):
    mediaUrl: Optional[str] = None
    audioData: Optional[str] = None


class FeedbackBody(BaseModel):
    transcript: Optional[str] = None
    durationSeconds: Optional[float] = None
    topic: Optional[str] = None


async def transcribe_media(body: TranscribeBody) -> dict:
    try:
        mime_type = "audio/webm"

        if body.audioData:
            audio_bytes = base64.b64decode(body.audioData)
        elif body.mediaUrl:
            async with httpx.AsyncClient(timeout=60.0) as client:
                resp = await client.get(body.mediaUrl)
                resp.raise_for_status()
                audio_bytes = resp.content
            if ".mp4" in body.mediaUrl or "video" in body.mediaUrl:
                mime_type = "video/webm"
        else:
            raise HTTPException(
                status_code=400, detail={"message": "mediaUrl or audioData is required"}
            )

        model = genai.GenerativeModel(MODEL_NAME)
        result = await model.generate_content_async(
            [
                "Transcribe this audio. Return only the transcript text, nothing else.",
                {"mime_type": mime_type, "data": audio_bytes},
            ]
        )

        return {"transcript": result.text}
    except HTTPException:
        raise
    except ResourceExhausted as error:
        raise HTTPException(
            status_code=429,
            detail={"message": "Rate limit exceeded. Please wait and try again.", "error": str(error)},
        )
    except Exception as error:
        print("Transcription error", error)
        raise HTTPException(
            status_code=500,
            detail={
                "message": "Failed to transcribe media",
                "error": str(error),
                "details": str(error),
            },
        )


def _strip_json_fences(raw: str) -> str:
    raw = raw.strip()
    fence_match = re.search(r"```(?:json)?\s*([\s\S]*?)```", raw, re.IGNORECASE)
    if fence_match:
        return fence_match.group(1).strip()
    if raw.startswith("```"):
        first_brace = raw.find("{")
        last_brace = raw.rfind("}")
        if first_brace != -1 and last_brace != -1:
            return raw[first_brace : last_brace + 1]
    return raw


async def generate_feedback(body: FeedbackBody) -> dict:
    if body.transcript is None or body.durationSeconds is None or not body.topic:
        raise HTTPException(
            status_code=400,
            detail={"message": "transcript, durationSeconds, and topic are required"},
        )

    prompt = generate_feedback_prompt(body.transcript, body.durationSeconds, body.topic)

    try:
        result = None
        max_attempts = 3
        for attempt in range(1, max_attempts + 1):
            try:
                model = genai.GenerativeModel(
                    MODEL_NAME,
                    generation_config=genai.types.GenerationConfig(
                        temperature=0.3, max_output_tokens=500
                    ),
                )
                result = await model.generate_content_async(prompt)
                break
            except ServiceUnavailable:
                if attempt < max_attempts:
                    print(f"API overloaded, retrying... ({attempt}/{max_attempts})")
                    await asyncio.sleep(1 * attempt)
                else:
                    raise

        raw = _strip_json_fences(result.text or "{}")

        try:
            parsed = json.loads(raw)
        except json.JSONDecodeError as parse_error:
            print("Failed to parse feedback JSON", parse_error, raw)
            raise HTTPException(status_code=500, detail={"message": "Failed to parse feedback JSON"})

        return parsed
    except HTTPException:
        raise
    except Exception as error:
        print("Feedback generation error", error)
        raise HTTPException(
            status_code=500, detail={"message": "Failed to generate feedback", "error": str(error)}
        )

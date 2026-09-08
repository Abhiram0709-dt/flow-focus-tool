import os
import tempfile

import cloudinary.uploader
from fastapi import HTTPException, UploadFile

MAX_UPLOAD_BYTES = 200 * 1024 * 1024  # 200MB, matches the old multer limit


async def upload_media(file: UploadFile | None) -> dict:
    if not file:
        raise HTTPException(status_code=400, detail={"message": "No file uploaded"})

    suffix = os.path.splitext(file.filename or "")[1]
    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
            tmp_path = tmp.name
            total = 0
            while chunk := await file.read(1024 * 1024):
                total += len(chunk)
                if total > MAX_UPLOAD_BYTES:
                    raise HTTPException(
                        status_code=413, detail={"message": "File too large"}
                    )
                tmp.write(chunk)

        upload_result = cloudinary.uploader.upload(
            tmp_path, resource_type="video", folder="communication-coach"
        )
        return {"mediaUrl": upload_result["secure_url"]}
    except HTTPException:
        raise
    except Exception as error:
        print("Upload error", error)
        raise HTTPException(
            status_code=500, detail={"message": "Failed to upload media", "error": str(error)}
        )
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

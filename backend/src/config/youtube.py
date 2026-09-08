import os

from google_auth_oauthlib.flow import Flow

SERVER_URL = os.getenv("SERVER_URL", "http://localhost:5000")

YOUTUBE_UPLOAD_SCOPES = [
    "https://www.googleapis.com/auth/youtube.upload",
    "https://www.googleapis.com/auth/youtube.readonly",
]


def create_youtube_flow() -> Flow:
    client_config = {
        "web": {
            "client_id": os.getenv("GOOGLE_YOUTUBE_CLIENT_ID"),
            "client_secret": os.getenv("GOOGLE_YOUTUBE_CLIENT_SECRET"),
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
        }
    }
    flow = Flow.from_client_config(
        client_config,
        scopes=YOUTUBE_UPLOAD_SCOPES,
        redirect_uri=f"{SERVER_URL}/api/youtube/callback",
    )
    return flow

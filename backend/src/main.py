import os
import socket
from contextlib import asynccontextmanager
from datetime import datetime, timezone

from dotenv import load_dotenv

load_dotenv()

# Some container platforms (Hugging Face Spaces included) assign an IPv6
# address with no working outbound IPv6 route. Without this, every outbound
# HTTPS call (Turnstile, Cloudinary, Gemini, Google OAuth, Mongo) can hang
# trying the IPv6 address until it times out before ever falling back to IPv4.
_orig_getaddrinfo = socket.getaddrinfo


def _ipv4_first_getaddrinfo(host, port, family=0, type=0, proto=0, flags=0):
    if family == socket.AF_UNSPEC:
        family = socket.AF_INET
    return _orig_getaddrinfo(host, port, family, type, proto, flags)


socket.getaddrinfo = _ipv4_first_getaddrinfo

from fastapi import FastAPI, HTTPException, Request  # noqa: E402
from fastapi.middleware.cors import CORSMiddleware  # noqa: E402
from fastapi.responses import JSONResponse  # noqa: E402

from .config.db import close_db, connect_db  # noqa: E402
from .routes import (  # noqa: E402
    analysis_routes,
    auth_routes,
    sessions_routes,
    settings_routes,
    upload_routes,
    youtube_routes,
)

CLIENT_ORIGIN = os.getenv("CLIENT_ORIGIN", "http://localhost:5173")
NODE_ENV = os.getenv("NODE_ENV", "development")

ALLOWED_ORIGINS = [
    CLIENT_ORIGIN,
    "http://localhost:5173",
    "http://localhost:8080",
    "http://localhost:3000",
]


@asynccontextmanager
async def lifespan(_app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(lifespan=lifespan)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    print(f"[{datetime.now(timezone.utc).isoformat()}] {request.method} {request.url.path}")
    return await call_next(request)


if NODE_ENV == "production":
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
else:
    # Mirrors the Node CORS config: any origin is allowed outside production.
    app.add_middleware(
        CORSMiddleware,
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )


@app.exception_handler(HTTPException)
async def http_exception_handler(_request: Request, exc: HTTPException):
    body = exc.detail if isinstance(exc.detail, dict) else {"message": exc.detail}
    return JSONResponse(status_code=exc.status_code, content=body)


@app.get("/api/health")
async def health():
    return {"status": "ok"}


app.include_router(auth_routes.router)
app.include_router(upload_routes.router)
app.include_router(analysis_routes.router)
app.include_router(sessions_routes.router)
app.include_router(settings_routes.router)
app.include_router(youtube_routes.router)

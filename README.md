# Flow Focus Tool - Communication Skills Coach

A modern web application for improving spoken communication skills through AI-powered practice, feedback, and progress tracking.

## ✨ Features

- **🎙️ Practice Sessions**: Record audio or video of yourself speaking on various topics
- **📚 Topic Selection**: Choose from predefined topics or practice with custom topics
- **🤖 AI-Powered Feedback**: Get instant feedback on fluency, clarity, and confidence using Google Gemini AI
- **📊 Session History**: Review all past practice sessions with detailed analytics
- **📈 Progress Tracking**: View comprehensive stats including total sessions, practice time, and average scores
- **🎯 Daily Goals**: Set and track daily practice minutes
- **⚙️ Customizable Settings**: Adjust focus areas and preferences
- **🔐 Secure Authentication**: Login with Google or GitHub OAuth
- **☁️ Cloud Storage**: Media files stored securely on Cloudinary
- **▶️ YouTube Upload**: Upload a recorded video session to YouTube as private, straight from its detail page

## 🛠️ Tech Stack

### Frontend
- React 18 + JavaScript
- Vite for bundling
- TailwindCSS + shadcn/ui for styling
- React Router for navigation
- Axios for API calls

### Backend
- Python + FastAPI
- MongoDB (via Motor, the async driver)
- OAuth (Google, GitHub, Facebook, LinkedIn)
- JWT for authentication
- Cloudinary for media storage
- Google Gemini AI for feedback generation
- YouTube Data API v3 for the YouTube-upload feature

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed (frontend)
- Python 3.11+ installed (backend)
- MongoDB instance (local or Atlas)
- Cloudinary account
- Google Gemini API key
- OAuth credentials (Google & GitHub)

### Installation

```bash
# Clone the repository
git clone https://github.com/Abhiram0709-dt/flow-focus-tool.git
cd flow-focus-tool

# Install frontend dependencies
cd frontend
npm install
cd ..

# Set up the backend's virtual environment
cd backend
python -m venv .venv
./.venv/Scripts/pip install -r requirements.txt   # Windows
# source .venv/bin/activate && pip install -r requirements.txt   # macOS/Linux
cd ..
```

### Environment Setup

Copy each app's `.env.example` to `.env` and fill in real values:

```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

`backend/generate_secrets.py` can generate a random `JWT_SECRET`:
```bash
python backend/generate_secrets.py
```

### Running the Application

Two terminals, run in this order (the frontend's `VITE_API_URL` in `frontend/.env` points at `http://localhost:5000/api`, so the backend must be running on port 5000 for login/API calls to work):

**Terminal 1 — backend**
```powershell
cd backend
.venv\Scripts\activate
uvicorn src.main:app --reload --port 5000
```
Or without activating the venv first:
```powershell
cd backend
.venv\Scripts\python.exe -m uvicorn src.main:app --reload --port 5000
```
macOS/Linux:
```bash
cd backend
source .venv/bin/activate
uvicorn src.main:app --reload --port 5000
```

**Terminal 2 — frontend**
```bash
cd frontend
npm run dev
```

Then open `http://localhost:8080` (the port `vite.config.js` is set to) in your browser.

## 📦 Deployment

This project deploys via each platform's CLI, not GitHub push-to-deploy integrations.

**Frontend (Vercel)** — project `flow-focus-tool`, live at `https://flow-focus-tool.vercel.app`:
```bash
cd frontend
vercel --prod
```
Also hosts `frontend/api/turnstile-verify.js`, a serverless function used to proxy Turnstile verification for the backend (see below).

**Backend (Hugging Face Space, Docker)** — space `MAbhiram/flow-focus-app`, live at `https://mabhiram-flow-focus-app.hf.space`. The Space is its own separate git repository (not this GitHub repo); its `Dockerfile` expects the backend source under a `server/` folder at the Space repo's root. To deploy:
```bash
git clone https://huggingface.co/spaces/MAbhiram/flow-focus-app hf-space
rm -rf hf-space/server && mkdir -p hf-space/server
cp -r backend/requirements.txt backend/generate_secrets.py backend/src hf-space/server/
cd hf-space && git add -A && git commit -m "Sync backend" && git push origin main
```
Environment variables/secrets are configured separately in each platform's dashboard (Vercel → Project Settings → Environment Variables; Hugging Face → Space Settings → Variables and secrets) — see `backend/.env.example` and `frontend/.env.example` for what's needed.

### Known platform quirk: Hugging Face Spaces blocks Cloudflare

Hugging Face Spaces resets outbound TLS connections to any `*.cloudflare.com` host (confirmed via direct diagnostics — other hosts like `google.com` and `huggingface.co` connect instantly). Since Cloudflare Turnstile verification requires calling `challenges.cloudflare.com`, the backend can't verify tokens directly. Instead it calls `frontend/api/turnstile-verify.js` on Vercel (whose network isn't blocked), authenticated via a shared `TURNSTILE_PROXY_SECRET`. If the proxy is ever unreachable, verification fails open (login is allowed through with a warning logged) rather than blocking every login.

### Required OAuth Setup for Production

This app uses **two separate** Google OAuth clients — one for login, one for the YouTube-upload feature — since the latter requests a sensitive scope best kept isolated.

#### Google OAuth (login)
1. Go to Google Cloud Console → Credentials
2. Create an OAuth 2.0 Client ID (Web application)
3. Add Authorized redirect URI: `https://mabhiram-flow-focus-app.hf.space/api/auth/google/callback`
4. Set `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` on the backend

#### Google OAuth (YouTube upload)
1. Create a **second** OAuth 2.0 Client ID in the same or a different Google Cloud project
2. Enable the "YouTube Data API v3" for that project
3. Add Authorized redirect URI: `https://mabhiram-flow-focus-app.hf.space/api/youtube/callback`
4. Set `GOOGLE_YOUTUBE_CLIENT_ID` / `GOOGLE_YOUTUBE_CLIENT_SECRET` on the backend

#### GitHub OAuth
1. Go to GitHub Developer Settings → OAuth Apps
2. Create an OAuth App
3. Add Authorization callback URL: `https://mabhiram-flow-focus-app.hf.space/api/auth/github/callback`
4. Set `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET` on the backend

## Project Structure

```
frontend/
├── src/
│   ├── api/                 # Axios client + API calls to the backend
│   ├── components/          # common/, dashboard/, history/, layout/, practice/, ui/
│   ├── contexts/            # AuthContext
│   ├── data/                # localStorageClient (legacy, mostly superseded by the backend)
│   ├── hooks/                # useRecorder, useSessions, useSettings, ...
│   ├── pages/                # Index, Practice, History, SessionDetail, Settings, Login, ...
│   └── types/
├── api/
│   └── turnstile-verify.js  # Vercel serverless function, proxies Turnstile verification for the backend
├── public/
├── index.html
├── vite.config.js
├── package.json
└── .env.example

backend/
├── src/
│   ├── config/               # db, oauth_providers, youtube, cloudinary_config
│   ├── controllers/
│   ├── middleware/            # auth.py (JWT dependency)
│   ├── models/                # user, session, settings (Motor collections)
│   ├── routes/
│   └── main.py
├── requirements.txt
├── generate_secrets.py
└── .env.example
```

## License

MIT

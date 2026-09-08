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

```bash
# Terminal 1: backend
cd backend
./.venv/Scripts/python -m uvicorn src.main:app --reload --port 5000   # Windows
# source .venv/bin/activate && uvicorn src.main:app --reload --port 5000   # macOS/Linux

# Terminal 2: frontend
cd frontend
npm run dev
```

Visit `http://localhost:8080` (or `http://localhost:5173`, depending on your Vite config) in your browser.

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
1. Connect your GitHub repository to Vercel
2. Set the project's Root Directory to `frontend`
3. Set environment variables
4. Deploy automatically on push to main

**Backend (Render/Railway):**
1. Connect your GitHub repository
2. Set root directory to `backend`
3. Configure environment variables
4. Deploy

### Required OAuth Setup for Production

#### Google OAuth
1. Go to Google Cloud Console
2. Create OAuth credentials
3. Add production callback URL: `https://your-backend.onrender.com/api/auth/google/callback`

#### GitHub OAuth  
1. Go to GitHub Developer Settings
2. Create OAuth App
3. Add production callback URL: `https://your-backend.onrender.com/api/auth/github/callback`

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

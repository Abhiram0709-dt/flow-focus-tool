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
- Node.js + Express
- MongoDB + Mongoose
- Passport.js for OAuth
- JWT for authentication
- Cloudinary for media storage
- Google Gemini AI for feedback generation

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed
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
npm install

# Install backend dependencies
cd server
npm install
cd ..
```

### Environment Setup

#### Frontend (.env in root)
```env
VITE_API_URL=http://localhost:5000/api
VITE_GEMINI_API_KEY=your-gemini-api-key
VITE_TURNSTILE_SITE_KEY=your-turnstile-site-key
```

#### Backend (server/.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/flow-focus-tool
JWT_SECRET=your-jwt-secret
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
GEMINI_API_KEY=your-gemini-api-key
SERVER_URL=http://localhost:5000
CLIENT_ORIGIN=http://localhost:5173
```

### Running the Application

```bash
# Start backend server (from root directory)
npm run server

# In another terminal, start frontend
npm run dev
```

Visit `http://localhost:5173` in your browser.

## 📦 Deployment

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for comprehensive deployment instructions.

### Quick Deploy

**Frontend (Vercel):**
1. Connect your GitHub repository to Vercel
2. Set environment variables
3. Deploy automatically on push to main

**Backend (Render/Railway):**
1. Connect your GitHub repository
2. Set root directory to `server`
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
src/
├── api/
│   └── mockAnalysis.ts      # Mock AI analysis functions (replace with real AI later)
├── components/
│   ├── common/              # Reusable UI components
│   ├── dashboard/           # Dashboard-specific components
│   ├── history/             # History page components
│   ├── layout/              # Layout components (Navbar, PageContainer)
│   ├── practice/            # Practice page components (recorders, selectors)
│   └── ui/                  # Shadcn UI components
├── data/
│   └── localStorageClient.ts # Data access layer (replace with MongoDB later)
├── hooks/
│   ├── useRecorder.ts       # Audio/video recording hook
│   ├── useSessions.ts       # Session management hook
│   └── useSettings.ts       # Settings management hook
├── pages/
│   ├── Index.tsx            # Dashboard
│   ├── Practice.tsx         # Practice recording page
│   ├── History.tsx          # Session history
│   ├── SessionDetail.tsx    # Individual session view
│   └── Settings.tsx         # User preferences
└── types/
    └── session.ts           # TypeScript interfaces
```

## Future Integration Points

### Replace localStorage with MongoDB
Edit `src/data/localStorageClient.ts` to connect to your backend:
- `getSettings()` / `saveSettings()`
- `getSessions()` / `addSession()` / `getSessionById()`

### Add Real AI Analysis
Edit `src/api/mockAnalysis.ts`:
- Integrate Whisper for speech-to-text
- Use GPT for feedback generation
- Replace `analyzeSessionMock()` with real API calls

## License

MIT

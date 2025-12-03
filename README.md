# SpeakUp - Communication Skills Coach

A modern web application for improving spoken communication skills through practice, feedback, and progress tracking.

## Features

- **Practice Sessions**: Record audio or video of yourself speaking on various topics
- **Topic Selection**: Choose from predefined topics or get a random topic
- **Mock AI Feedback**: Receive instant feedback on fluency, clarity, and confidence (mock data for demo)
- **Session History**: Review all past practice sessions with filtering options
- **Progress Tracking**: View stats including total sessions, practice time, average scores, and streaks
- **Daily Goals**: Set and track daily practice minutes
- **Customizable Settings**: Adjust focus areas and preferences

## Tech Stack

- React 18 + TypeScript
- Vite for bundling
- TailwindCSS for styling
- React Router for navigation
- LocalStorage for data persistence

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

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

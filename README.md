# InterviewAI — AI Voice Interview Platform

A B2B SaaS platform that lets companies conduct personalized AI voice interviews at scale.

## Screenshots

### Landing Page
![Landing Page](screenshot/LandingPageAbove.png)

### Company Dashboard
![Dashboard](screenshot/CompanyDashbordPage.png)

### Live Interview
![Interview](screenshot/VoiceInterview.png)

### Report Card
![Report](screenshot/InterviewReport.png)

## Tech Stack

**Backend**
- Bun + TypeScript
- SQLite (bun:sqlite)
- Groq API (LLaMA 3.3 70b)
- WebSockets (native Bun)
- JWT authentication
- bcryptjs password hashing

**Frontend**
- React + Vite + TypeScript
- Tailwind CSS
- Web Speech API (STT + TTS)
- MediaRecorder API (video recording)
- Axios + React Router v6
- Zustand

## Features

- AI conducts personalized voice interviews based on candidate's real GitHub profile
- Companies create roles with custom tech stack, difficulty, and questions
- Real-time voice conversation via WebSockets
- Video recording of candidate interviews
- Structured report cards — overall score, communication, technical depth, problem solving
- Per-question feedback and full transcript
- Candidate dashboard with full interview history
- Prevents duplicate interviews on same invite link
- JWT authentication for both companies and candidates

## Local Setup

**Backend**
```bash
cd Backend
bun install
cp .env.example .env
# Add GROQ_API_KEY and JWT_SECRET to .env
bun run dev
```

**Frontend**
```bash
cd Frontend
bun install
# Create .env.local with VITE_API_URL=http://localhost:3000
bun run dev
```

## Architecture
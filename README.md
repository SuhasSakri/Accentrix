# 🎙️ Accentrix - AI Pronunciation Coach

A full-stack web application that leverages AI to help language learners improve their pronunciation through real-time feedback and analysis.

[![Live Demo](https://img.shields.io/badge/demo-live-success)](https://accentrix.vercel.app)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**🌐 Live Demo**: [https://accentrix.vercel.app](https://accentrix.vercel.app)

---

## ⚠️ Important Notice - Read Before Using

### Local vs Deployed Version

**🏠 Running Locally (Recommended for Full Experience)**
- ✅ **Real AI Pronunciation Analysis** using OpenAI Whisper
- ✅ Accurate scoring based on speech recognition
- ✅ Educational feedback on mispronounced words
- ✅ Requires: 1GB+ RAM, Python, Node.js
- 📖 Setup Guide: See [Getting Started](#getting-started)

**🌐 Live Demo (Portfolio Showcase)**
- ⚠️ **Mock Pronunciation Scores** (randomized for demo purposes)
- ⚠️ Limited by free hosting RAM (512MB vs required 1GB+)
- ✅ **All other features work perfectly**: Native TTS voices, Recording, UI, Authentication, Progress tracking
- ✅ Perfect for viewing the UI/UX and app functionality
- 💡 To experience real AI analysis, please run locally

**Why Mock Mode in Demo?**
OpenAI Whisper model requires 1GB+ RAM. Free hosting tiers (Render Free: 512MB) cannot support it. Upgrading to paid hosting ($7/month) enables real AI analysis.

---

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Deployment](#deployment)
- [API Documentation](#api-documentation)
- [Contributing](#contributing)
- [License](#license)

---

## 🎯 Overview

Accentrix is an AI-powered pronunciation coaching platform that provides:
- Real-time speech recognition and analysis
- Multi-language support (9+ languages)
- Word-level pronunciation scoring
- Native text-to-speech synthesis
- Progress tracking and session history
- Progressive Web App (PWA) capabilities

**Target Users**: Language learners, educators, non-native speakers
**Use Cases**: Pronunciation practice, accent reduction, language learning

---

## ✨ Features

### Core Functionality
- 🎤 **Real-time Speech Analysis**: OpenAI Whisper-powered transcription with custom scoring algorithms
- 🔊 **Native TTS**: Microsoft Edge Neural voices for 9+ languages
- 📊 **Detailed Metrics**: Pronunciation, fluency, and completeness scores with word-level breakdown
- 🌍 **Multi-Language**: Support for English, Spanish, French, German, Italian, Portuguese, Hindi, Japanese, Chinese
- ✍️ **Custom Practice**: Practice any text, not just predefined phrases
- 📈 **Progress Tracking**: Session history, daily streaks, lifetime statistics

### Technical Features
- 🔐 **Secure Authentication**: JWT-based auth with bcrypt password hashing
- 💾 **Persistent Storage**: MongoDB Atlas integration with in-memory fallback
- 🎧 **Native Audio Processing**: Browser-based WAV encoding (no FFmpeg required)
- 📱 **PWA Support**: Installable on mobile and desktop
- 🚀 **Microservices Architecture**: Separated concerns for scalability

---

## 🛠️ Tech Stack

### Frontend
```
React 18          - UI framework
Vite              - Build tool & dev server
React Router DOM  - Client-side routing
Lucide React      - Icon library
Custom Hooks      - Audio recording, voice synthesis
Vanilla CSS       - Styling with glassmorphism effects
```

### Backend (API Gateway)
```
Node.js           - Runtime environment
Express.js        - Web framework
MongoDB/Mongoose  - Database & ODM
JWT               - Authentication
Multer            - File upload handling
Axios             - HTTP client
```

### AI Service
```
Python 3.10+      - Runtime
FastAPI           - Web framework
OpenAI Whisper    - Speech recognition (base model)
Edge TTS          - Text-to-speech synthesis
Levenshtein       - Edit distance calculations
SciPy/NumPy       - Audio processing
Uvicorn           - ASGI server
```

---

## 🏗️ Architecture

### System Design

```
┌─────────────┐      ┌──────────────┐      ┌─────────────┐
│   React     │─────▶│   Node.js    │─────▶│   Python    │
│  Frontend   │◀─────│   Backend    │◀─────│ AI Service  │
│ (Port 5173) │      │  (Port 3001) │      │ (Port 8000) │
└─────────────┘      └──────────────┘      └─────────────┘
       │                     │                      │
       │                     │                      │
       ▼                     ▼                      ▼
   Browser              MongoDB              Whisper Model
   Storage               Atlas               Edge TTS API
```

### Data Flow

1. **User Records Audio** → Frontend captures WAV audio via Web Audio API
2. **Upload to Backend** → Backend validates and forwards to AI service
3. **AI Analysis** → Whisper transcribes, algorithm calculates scores
4. **Store Results** → Backend saves to MongoDB
5. **Display Feedback** → Frontend shows scores, suggestions, playback

### Scoring Algorithm

```python
Word Error Rate (WER) = (Substitutions + Deletions + Insertions) / Total Words
Pronunciation Score   = 60% WER accuracy + 40% word-level accuracy
Fluency Score         = Pronunciation - |1 - (spoken/expected)| × 20
Completeness Score    = (words_spoken / total_words) × 100
Overall Score         = 40% Pronunciation + 30% Fluency + 30% Completeness
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm
- Python 3.10+ and pip
- MongoDB Atlas account (or use in-memory storage)
- 2GB RAM minimum for local development

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/SuhasSakri/accentrix.git
   cd accentrix
   ```

2. **Install AI Service dependencies**
   ```bash
   cd ai-service
   pip install -r requirements.txt
   ```

3. **Install Backend dependencies**
   ```bash
   cd ../backend
   npm install
   ```

4. **Install Frontend dependencies**
   ```bash
   cd ..
   npm install
   ```

### Configuration

Create `.env` files in respective directories:

**`ai-service/.env`**
```env
HOST=0.0.0.0
PORT=8000
ANALYSIS_MODE=whisper  # or "mock" for demo mode
DEBUG=true
```

**`backend/.env`**
```env
PORT=3001
NODE_ENV=development
AI_SERVICE_URL=http://127.0.0.1:8000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_secret_key_here
```

### Running Locally

**Windows**: Double-click `start-all.bat`

**Manual start**:

```bash
# Terminal 1 - AI Service
cd ai-service
python main.py

# Terminal 2 - Backend
cd backend
npm run dev

# Terminal 3 - Frontend
npm run dev
```

Access the app at `http://localhost:5173`

### Verification

```bash
# Check AI service
curl http://localhost:8000/health

# Check backend
curl http://localhost:3001/api/health

# Check dependencies
cd ai-service
python check_deps.py
```

---

## 🌐 Deployment

**Note**: See [Important Notice](#⚠️-important-notice---read-before-using) at the top for deployment mode differences.

### Quick Deploy (Free Tier)

**Frontend** → Vercel
```bash
npm install -g vercel
vercel --prod
```

**Backend & AI Service** → Render
- Connect GitHub repository
- Configure as per `render.yaml`
- Set environment variables in dashboard

### Deployment Modes

| Mode | Cost | AI Analysis | TTS Voices | Best For |
|------|------|-------------|------------|----------|
| Local | Free | ✅ Real (Whisper) | ✅ Native | Development & Testing |
| Demo | Free | ⚠️ Mock (Random) | ✅ Native | Portfolio & UI Demo |
| Production | $7/mo | ✅ Real (Whisper) | ✅ Native | Real Users |

**Detailed Instructions**: See [DEPLOYMENT_GUIDE.md](DEPLOYMENT_GUIDE.md)

**Quick Start**: See [FREE_DEMO_DEPLOYMENT.md](FREE_DEMO_DEPLOYMENT.md)

---

## 📡 API Documentation

### Backend Endpoints

#### Authentication
```
POST   /api/auth/register    - Register new user
POST   /api/auth/login       - Login user
GET    /api/auth/me          - Get current user
```

#### Pronunciation Analysis
```
POST   /api/pronunciation/analyze     - Analyze audio recording
POST   /api/pronunciation/tts         - Generate TTS audio
GET    /api/pronunciation/sessions    - Get practice history
GET    /api/pronunciation/sessions/:id - Get session details
```

#### Progress Tracking
```
GET    /api/progress         - Get user progress stats
POST   /api/progress/record  - Record practice session
```

### AI Service Endpoints

```
POST   /api/analyze          - Transcribe & score pronunciation
POST   /api/tts              - Generate speech audio
GET    /api/languages        - Get supported languages
GET    /health               - Service health check
```

---

## 🧪 Testing

### Unit Tests
```bash
# Backend tests
cd backend
npm test

# Frontend tests
npm test
```

### Manual Testing

1. **TTS Test**
   ```bash
   cd ai-service
   python test_tts.py
   ```

2. **Dependencies Check**
   ```bash
   cd ai-service
   python check_deps.py
   ```

3. **End-to-End**
   - Register account
   - Select language
   - Click "Listen" (TTS should play)
   - Record speech
   - Verify analysis results

---

## 📊 Performance

- **Frontend Bundle**: ~200KB gzipped
- **Audio Processing**: <100ms encoding time
- **Whisper Transcription**: 2-5 seconds (base model)
- **TTS Generation**: <1 second streaming
- **Database Queries**: <50ms average

---

## 🔒 Security

- JWT token authentication with HTTP-only cookies
- bcrypt password hashing (10 rounds)
- CORS configured for specific origins
- Input validation on all endpoints
- File upload size limits (10MB)
- MongoDB connection string encryption
- No credentials in source code

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow existing code style
- Add tests for new features
- Update documentation
- Use meaningful commit messages

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- [OpenAI Whisper](https://github.com/openai/whisper) - Speech recognition model
- [Edge TTS](https://github.com/rany2/edge-tts) - Text-to-speech synthesis
- [FastAPI](https://fastapi.tiangolo.com/) - Modern Python web framework
- [React](https://react.dev/) - UI library

---

## 📞 Contact

**Project Link**: [https://github.com/SuhasSakri/accentrix](https://github.com/SuhasSakri/accentrix)

**Live Demo**: [https://accentrix.vercel.app](https://accentrix.vercel.app)

---

## 🗺️ Roadmap

- [ ] Add phoneme-level analysis
- [ ] Support for additional languages
- [ ] Mobile native apps (React Native)
- [ ] Offline mode support
- [ ] Voice speed control
- [ ] Speech therapy exercises
- [ ] Gamification features
- [ ] Social sharing

---

Made with ❤️ by [Suhas Sakri](https://github.com/SuhasSakri)

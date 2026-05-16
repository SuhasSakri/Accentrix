# 🎙️ Accentrix - AI Pronunciation Coach

![Accentrix Cover](https://via.placeholder.com/1200x400/1E1E2E/6366F1?text=Accentrix+-+Master+Your+Pronunciation)

**Accentrix** is an advanced, full-stack AI-powered pronunciation coach designed to help language learners perfect their speaking skills. It provides real-time, highly accurate feedback on pronunciation, fluency, and completeness, breaking down spoken sentences word-by-word without relying on expensive cloud AI subscriptions.

---

## ✨ Key Features

*   **🤖 Local AI Speech Recognition:** Powered by a customized implementation of **OpenAI Whisper** running locally. It guarantees high accuracy, complete privacy, and zero recurring cloud API costs.
*   **🎯 Granular Scoring System:** Utilizes advanced algorithms (like Levenshtein Distance) to generate precise metrics:
    *   **Pronunciation Score:** Word Error Rate (WER) and phonemic accuracy.
    *   **Fluency Score:** Analysis of speech pace and hesitations.
    *   **Completeness Score:** Measures how much of the target sentence was spoken.
*   **📱 Progressive Web App (PWA):** Fully installable on iOS, Android, and Desktop. Includes a Service Worker for offline caching and a native app-like experience.
*   **🌍 Multi-Language Support:** Practice pronunciation across 9 different languages: English, Spanish, French, German, Italian, Portuguese, Hindi, Japanese, and Chinese.
*   **✍️ Custom Practice Mode:** Go beyond suggested phrases! Type any sentence, speech, or tricky word into the app, and the AI will dynamically evaluate your pronunciation against your custom text.
*   **🗣️ Native Text-to-Speech (TTS):** Integrated browser SpeechSynthesis API allows users to listen to the perfect native pronunciation of any phrase before attempting it themselves.
*   **🎧 Instant Audio Playback:** Listen to your own recorded audio immediately alongside your scores to hear exactly where you can improve.
*   **📊 Persistent Progress Tracking:** Tracks daily practice streaks, lifetime scores, and historical sessions, saved securely to a cloud database.
*   **🔒 Secure Authentication:** Full user registration and login system protected by `bcryptjs` password hashing and `JWT` (JSON Web Tokens).
*   **🎙️ Native Audio Engineering:** Features a custom React hook that records microphone input and uses the Web Audio API to decode and encode raw PCM audio into standard `16kHz WAV` files entirely in the browser, completely eliminating the need for bulky server-side dependencies like `FFmpeg`.

---

## 🏗️ Technology Stack

Accentrix is built using a modern microservice architecture to separate the user interface, business logic, and heavy AI processing.

### 🌐 Frontend (React)
*   **Framework:** React 18 powered by Vite
*   **Routing:** React Router DOM
*   **Styling:** Modern Vanilla CSS with CSS Variables & Glassmorphism
*   **Icons:** Lucide React
*   **Audio:** Custom `useAudioRecorder` hook with native browser WAV encoding

### ⚙️ API Gateway (Node.js)
*   **Runtime:** Node.js & Express.js
*   **Database:** MongoDB Atlas (Cloud) via Mongoose
*   **Security:** JWT Authentication, CORS, bcryptjs
*   **Architecture:** Acts as the primary router, handling user accounts, session storage, and proxying audio to the AI engine.

### 🧠 AI Service (Python)
*   **Framework:** FastAPI & Uvicorn
*   **AI Model:** OpenAI Whisper (`base` model)
*   **Analysis Logic:** `scipy` for raw audio manipulation, `Levenshtein` for text-distance algorithms.
*   **No FFmpeg Required:** Reads raw `float32` arrays directly from memory for lightning-fast transcription.

---

## 🚀 Getting Started

### Prerequisites
*   Node.js (v18+)
*   Python (3.10+)
*   A MongoDB Atlas connection string.

### 1. Start the API Gateway (Node.js Backend)
```bash
cd backend
npm install
# Create a .env file with MONGODB_URI=your_atlas_url and JWT_SECRET=your_secret
npm run dev
```

### 2. Start the AI Service (Python Backend)
```bash
cd ai-service
pip install -r requirements.txt
# First run will download the Whisper AI model (~140MB)
python main.py
```

### 3. Start the Frontend (React App)
```bash
# In the root project directory
npm install
npm run dev
```

The application will be available at `http://localhost:5173`.

---

## 📂 Project Structure

```text
Accentrix/
├── src/                # React Frontend code
│   ├── components/     # UI Components (Navbar, Microphones, etc.)
│   ├── context/        # Global State (AuthContext)
│   ├── pages/          # App Views (Practice, Progress, Login)
│   └── hooks/          # Custom Hooks (useAudioRecorder)
├── backend/            # Node.js API Gateway
│   ├── src/models/     # MongoDB Schemas (User, Session, Progress)
│   ├── src/routes/     # Express Routers
│   └── src/server.js   # Main Express Application
└── ai-service/         # Python FastAPI Engine
    ├── main.py         # AI Routing and Whisper Engine
    └── requirements.txt
```

---

## 🤝 Contributing
Contributions are welcome! Please feel free to submit a Pull Request if you'd like to improve the UI or optimize the Whisper scoring algorithms.

## 📝 License
This project is open-source and available under the [MIT License](LICENSE).

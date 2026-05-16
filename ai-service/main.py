"""
Accentrix AI Service
FastAPI application for speech pronunciation analysis.
Supports Azure Cognitive Services and mock analysis mode.
"""

import os
import uuid
import random
import math
import shutil
import tempfile
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

load_dotenv()

# ─── App Setup ────────────────────────────────────────────
app = FastAPI(
    title="Accentrix AI Service",
    description="Speech pronunciation analysis powered by AI",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

UPLOAD_DIR = Path("./temp_audio")
UPLOAD_DIR.mkdir(exist_ok=True)

ANALYSIS_MODE = os.getenv("ANALYSIS_MODE", "whisper")


# ─── Models ───────────────────────────────────────────────
class WordResult(BaseModel):
    word: str
    score: int
    status: str  # correct, mispronounced, missed
    phonemes: list = []


class AnalysisResult(BaseModel):
    overallScore: int
    pronunciationScore: int
    fluencyScore: int
    completenessScore: int
    words: list[WordResult]
    suggestions: list[str]
    recognizedText: str
    language: str
    source: str  # "azure" or "mock"


# ─── Health Check ─────────────────────────────────────────
@app.get("/health")
async def health_check():
    return {
        "status": "ok",
        "service": "accentrix-ai-service",
        "analysisMode": ANALYSIS_MODE,
    }


# ─── Pronunciation Analysis ──────────────────────────────
@app.post("/api/analyze", response_model=AnalysisResult)
async def analyze_pronunciation(
    audio: UploadFile = File(...),
    language: str = Form(default="en-US"),
    reference_text: str = Form(default=""),
):
    """
    Analyze pronunciation from an audio file.
    
    - **audio**: Audio file (WAV, WebM, OGG, MP3)
    - **language**: BCP-47 language code (e.g., en-US, es-ES, fr-FR)
    - **reference_text**: The expected text the user should have said
    """
    # Save uploaded audio to temp file
    file_id = str(uuid.uuid4())
    file_ext = Path(audio.filename or "audio.webm").suffix or ".webm"
    temp_path = UPLOAD_DIR / f"{file_id}{file_ext}"

    try:
        with open(temp_path, "wb") as f:
            content = await audio.read()
            f.write(content)

        file_size_kb = len(content) / 1024
        print(f"[MIC] Received audio: {audio.filename} ({file_size_kb:.1f}KB)")
        print(f"      Language: {language}, Reference: \"{reference_text[:60]}...\"")

        # Route to appropriate analyzer
        if ANALYSIS_MODE == "whisper":
            result = await analyze_with_whisper(temp_path, language, reference_text)
        else:
            result = generate_mock_analysis(reference_text, language)

        print(f"[OK] Analysis complete: score={result.overallScore} (source={result.source})")
        return result

    except Exception as e:
        print(f"[ERR] Analysis error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

    finally:
        # Cleanup temp file
        if temp_path.exists():
            temp_path.unlink()




# ─── Local Whisper Integration ───────────────────────────
async def analyze_with_whisper(audio_path: Path, language: str, reference_text: str) -> AnalysisResult:
    """
    Analyze pronunciation using local OpenAI Whisper.
    Requires: pip install openai-whisper Levenshtein
    Requires: ffmpeg installed on your system
    """
    try:
        import whisper
        import Levenshtein
    except ImportError:
        print("[WARN] Whisper not installed. Run: pip install openai-whisper Levenshtein")
        return generate_mock_analysis(reference_text, language)

    # Note: Loading the model globally is better for performance, but we load it here for simplicity
    print("[AI] Loading local Whisper model...")
    model = whisper.load_model("base")
    
    print("[AI] Transcribing with Whisper...")
    # Use just the base language code (e.g., 'en' from 'en-US')
    base_lang = language.split('-')[0]
    
    # Load the 16kHz WAV file into a numpy array to bypass FFmpeg entirely
    import scipy.io.wavfile as wav
    import numpy as np
    sample_rate, audio_data = wav.read(str(audio_path))
    
    # Ensure it's float32 normalized between -1.0 and 1.0 (Whisper requirement)
    if audio_data.dtype == np.int16:
        audio_data = audio_data.astype(np.float32) / 32768.0
        
    result = model.transcribe(audio_data, language=base_lang)
    recognized_text = result["text"].strip()
    
    print(f"[AI] Transcribed: {recognized_text}")

    # Calculate custom scores using Levenshtein distance
    import string
    def clean_text(t):
        return t.lower().translate(str.maketrans('', '', string.punctuation)).split()

    ref_words = clean_text(reference_text)
    rec_words = clean_text(recognized_text)
    
    # Calculate Word Error Rate (WER)
    distance = Levenshtein.distance(" ".join(ref_words), " ".join(rec_words))
    max_len = max(len(" ".join(ref_words)), 1)
    accuracy = max(0, 100 - int((distance / max_len) * 100))

    # Fake a detailed word-by-word breakdown for the UI
    words_breakdown = []
    for ref_w in ref_words:
        best_match_score = max([Levenshtein.ratio(ref_w, rec_w) for rec_w in rec_words] + [0])
        words_breakdown.append(WordResult(
            word=ref_w,
            score=int(best_match_score * 100),
            status="correct" if best_match_score > 0.8 else "mispronounced"
        ))

    return AnalysisResult(
        overallScore=accuracy,
        pronunciationScore=accuracy,
        fluencyScore=min(100, accuracy + 10),
        completenessScore=min(100, int((len(rec_words) / max(len(ref_words), 1)) * 100)),
        words=words_breakdown,
        suggestions=["Speak slightly slower for better clarity."] if accuracy < 80 else ["Great job!"],
        recognizedText=recognized_text,
        language=language,
        source="local_whisper"
    )

# ─── Mock Analysis ────────────────────────────────────────
def generate_mock_analysis(reference_text: str, language: str) -> AnalysisResult:
    """
    Generate realistic mock pronunciation analysis results.
    Used when Azure is not configured or unavailable.
    """
    words_list = reference_text.split() if reference_text else ["hello", "world"]

    word_results = []
    for word in words_list:
        # Generate somewhat realistic scores — harder words get lower scores
        base_score = random.randint(65, 100)

        # Simulate harder pronunciation for longer/complex words
        if len(word) > 7:
            base_score = max(55, base_score - random.randint(5, 15))

        status = "correct"
        if base_score < 70:
            status = "missed"
        elif base_score < 80:
            status = "mispronounced"

        word_results.append(WordResult(
            word=word,
            score=base_score,
            status=status,
        ))

    avg_score = round(sum(w.score for w in word_results) / len(word_results))

    # Generate correlated sub-scores
    pronunciation_score = min(100, avg_score + random.randint(-5, 8))
    fluency_score = max(40, avg_score - random.randint(0, 15))
    completeness_score = min(100, avg_score + random.randint(0, 12))

    # Generate suggestions
    suggestions = []
    mispronounced = [w for w in word_results if w.status == "mispronounced"]
    if mispronounced:
        for w in mispronounced[:2]:
            suggestions.append(f'Focus on the pronunciation of "{w.word}" — practice the individual sounds slowly.')
    suggestions.append("Try speaking at a natural, consistent pace for better fluency scores.")
    if avg_score > 80:
        suggestions.append("Great job! Your pronunciation is very clear overall.")

    return AnalysisResult(
        overallScore=avg_score,
        pronunciationScore=pronunciation_score,
        fluencyScore=fluency_score,
        completenessScore=completeness_score,
        words=word_results,
        suggestions=suggestions,
        recognizedText=reference_text or "hello world",
        language=language,
        source="mock",
    )


# ─── Supported Languages ─────────────────────────────────
@app.get("/api/languages")
async def get_supported_languages():
    """Return list of supported languages with BCP-47 codes."""
    return {
        "languages": [
            {"code": "en-US", "name": "English (US)", "flag": "🇺🇸"},
            {"code": "en-GB", "name": "English (UK)", "flag": "🇬🇧"},
            {"code": "es-ES", "name": "Spanish (Spain)", "flag": "🇪🇸"},
            {"code": "es-MX", "name": "Spanish (Mexico)", "flag": "🇲🇽"},
            {"code": "fr-FR", "name": "French", "flag": "🇫🇷"},
            {"code": "de-DE", "name": "German", "flag": "🇩🇪"},
            {"code": "it-IT", "name": "Italian", "flag": "🇮🇹"},
            {"code": "pt-BR", "name": "Portuguese (Brazil)", "flag": "🇧🇷"},
            {"code": "ja-JP", "name": "Japanese", "flag": "🇯🇵"},
            {"code": "ko-KR", "name": "Korean", "flag": "🇰🇷"},
            {"code": "zh-CN", "name": "Mandarin (Simplified)", "flag": "🇨🇳"},
            {"code": "ar-SA", "name": "Arabic", "flag": "🇸🇦"},
            {"code": "hi-IN", "name": "Hindi", "flag": "🇮🇳"},
            {"code": "ru-RU", "name": "Russian", "flag": "🇷🇺"},
        ]
    }


# ─── Run ──────────────────────────────────────────────────
if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    print(f"\n[AI] Accentrix AI Service starting on port {port}...")
    print(f"     Mode: {ANALYSIS_MODE}\n")
    uvicorn.run("main:app", host="0.0.0.0", port=port, reload=True)
